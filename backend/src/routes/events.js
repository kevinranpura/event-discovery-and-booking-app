const express = require('express');
const { body, query, validationResult } = require('express-validator');
const pool = require('../database/db');
const { authenticate, requireOrganizer } = require('../middleware/auth');

const router = express.Router();

// GET /api/events - List events with search/filter
router.get('/', async (req, res) => {
  try {
    const { search, category, date, minPrice, maxPrice, location, page = 1, limit = 20, featured } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(e.name ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex} OR e.venue ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category && category !== 'All') {
      whereConditions.push(`e.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (date) {
      whereConditions.push(`e.date = $${paramIndex}`);
      params.push(date);
      paramIndex++;
    }

    if (minPrice !== undefined) {
      whereConditions.push(`e.ticket_price >= $${paramIndex}`);
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice !== undefined) {
      whereConditions.push(`e.ticket_price <= $${paramIndex}`);
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (location) {
      whereConditions.push(`(e.venue ILIKE $${paramIndex} OR e.address ILIKE $${paramIndex})`);
      params.push(`%${location}%`);
      paramIndex++;
    }

    // Only show future/today events
    whereConditions.push(`e.date >= CURRENT_DATE`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const eventsQuery = `
      SELECT e.*, u.name as organizer_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      ${whereClause}
      ORDER BY e.date ASC, e.start_time ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit), offset);

    const countQuery = `SELECT COUNT(*) FROM events e ${whereClause}`;
    const [eventsResult, countResult] = await Promise.all([
      pool.query(eventsQuery, params),
      pool.query(countQuery, params.slice(0, -2)),
    ]);

    res.json({
      success: true,
      data: {
        events: eventsResult.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.name as organizer_name, u.email as organizer_email
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, data: { event: result.rows[0] } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/events (Organizer only)
router.post('/', authenticate, requireOrganizer, [
  body('name').trim().notEmpty().withMessage('Event name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('start_time').notEmpty().withMessage('Start time is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('ticket_price').isFloat({ min: 0 }).withMessage('Valid ticket price is required'),
  body('total_seats').isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, description, category, image, date, start_time, end_time, venue, address, ticket_price, total_seats } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO events (organizer_id, name, description, category, image, date, start_time, end_time, venue, address, ticket_price, total_seats, available_seats)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
       RETURNING *`,
      [req.user.id, name, description, category, image || null, date, start_time, end_time || null, venue, address, ticket_price, total_seats]
    );

    res.status(201).json({ success: true, message: 'Event created successfully', data: { event: result.rows[0] } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/events/:id (Organizer only)
router.put('/:id', authenticate, requireOrganizer, async (req, res) => {
  const { name, description, category, image, date, start_time, end_time, venue, address, ticket_price, total_seats } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM events WHERE id = $1 AND organizer_id = $2', [req.params.id, req.user.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
    }

    const event = existing.rows[0];
    const seatsDiff = total_seats !== undefined ? parseInt(total_seats) - event.total_seats : 0;
    const newAvailableSeats = Math.max(0, event.available_seats + seatsDiff);

    const result = await pool.query(
      `UPDATE events SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        image = COALESCE($4, image),
        date = COALESCE($5, date),
        start_time = COALESCE($6, start_time),
        end_time = COALESCE($7, end_time),
        venue = COALESCE($8, venue),
        address = COALESCE($9, address),
        ticket_price = COALESCE($10, ticket_price),
        total_seats = COALESCE($11, total_seats),
        available_seats = $12
       WHERE id = $13 AND organizer_id = $14
       RETURNING *`,
      [name, description, category, image, date, start_time, end_time, venue, address, ticket_price, total_seats, newAvailableSeats, req.params.id, req.user.id]
    );

    res.json({ success: true, message: 'Event updated successfully', data: { event: result.rows[0] } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/events/:id (Organizer only)
router.delete('/:id', authenticate, requireOrganizer, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND organizer_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
    }

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
