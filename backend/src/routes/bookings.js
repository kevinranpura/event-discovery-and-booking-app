const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings
router.post('/', authenticate, [
  body('event_id').isInt().withMessage('Valid event ID is required'),
  body('ticket_type').notEmpty().withMessage('Ticket type is required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { event_id, ticket_type, quantity } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock event row to prevent race conditions
    const eventResult = await client.query(
      'SELECT * FROM events WHERE id = $1 FOR UPDATE',
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const event = eventResult.rows[0];

    if (event.available_seats < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: event.available_seats === 0 ? 'Event is sold out' : `Only ${event.available_seats} seats available`
      });
    }

    // Check if event is in the past
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cannot book tickets for past events' });
    }

    const total_amount = parseFloat(event.ticket_price) * parseInt(quantity);

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, event_id, ticket_type, quantity, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, 'confirmed')
       RETURNING *`,
      [req.user.id, event_id, ticket_type, quantity, total_amount]
    );

    // Decrement available seats
    await client.query(
      'UPDATE events SET available_seats = available_seats - $1 WHERE id = $2',
      [quantity, event_id]
    );

    // Create confirmation notification
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'booking')`,
      [
        req.user.id,
        '✅ Booking Confirmed!',
        `Your booking for "${event.name}" has been confirmed. ${quantity} ticket(s) for ${new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}.`
      ]
    );

    await client.query('COMMIT');

    // Fetch full booking with event details
    const fullBooking = await pool.query(
      `SELECT b.*, e.name as event_name, e.date as event_date, e.start_time,
              e.venue, e.address, e.image as event_image, e.category as event_category
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.id = $1`,
      [bookingResult.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: { booking: fullBooking.rows[0] }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

// GET /api/bookings
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    let whereClause = 'WHERE b.user_id = $1';
    const params = [req.user.id];

    if (status) {
      whereClause += ` AND b.status = $2`;
      params.push(status);
    }

    const result = await pool.query(
      `SELECT b.*, e.name as event_name, e.date as event_date, e.start_time,
              e.end_time, e.venue, e.address, e.image as event_image, e.category as event_category,
              e.ticket_price
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       ${whereClause}
       ORDER BY b.created_at DESC`,
      params
    );

    res.json({ success: true, data: { bookings: result.rows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/bookings/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, e.name as event_name, e.date as event_date, e.start_time,
              e.end_time, e.venue, e.address, e.image as event_image, e.category as event_category,
              e.ticket_price, u.name as user_name, u.email as user_email
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1 AND b.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: { booking: result.rows[0] } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', authenticate, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [req.params.id, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Update booking status
    await client.query(
      'UPDATE bookings SET status = $1 WHERE id = $2',
      ['cancelled', booking.id]
    );

    // Restore available seats
    await client.query(
      'UPDATE events SET available_seats = available_seats + $1 WHERE id = $2',
      [booking.quantity, booking.event_id]
    );

    // Get event name for notification
    const eventResult = await client.query('SELECT name FROM events WHERE id = $1', [booking.event_id]);
    const eventName = eventResult.rows[0]?.name || 'the event';

    // Create cancellation notification
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'booking')`,
      [req.user.id, '❌ Booking Cancelled', `Your booking for "${eventName}" has been cancelled. Refund will be processed within 3-5 business days.`]
    );

    await client.query('COMMIT');

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
