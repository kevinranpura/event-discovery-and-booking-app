const express = require('express');
const pool = require('../database/db');
const { authenticate, requireOrganizer } = require('../middleware/auth');

const router = express.Router();

// Apply auth + organizer middleware to all routes
router.use(authenticate, requireOrganizer);

// GET /api/organizer/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const organizerId = req.user.id;

    const [totalEvents, upcomingEvents, totalBookings, totalRevenue, totalAttendees] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM events WHERE organizer_id = $1', [organizerId]),
      pool.query(`SELECT COUNT(*) FROM events WHERE organizer_id = $1 AND date >= CURRENT_DATE`, [organizerId]),
      pool.query(`SELECT COUNT(*) FROM bookings b JOIN events e ON b.event_id = e.id WHERE e.organizer_id = $1 AND b.status != 'cancelled'`, [organizerId]),
      pool.query(`SELECT COALESCE(SUM(b.total_amount), 0) as revenue FROM bookings b JOIN events e ON b.event_id = e.id WHERE e.organizer_id = $1 AND b.status != 'cancelled'`, [organizerId]),
      pool.query(`SELECT COALESCE(SUM(b.quantity), 0) as attendees FROM bookings b JOIN events e ON b.event_id = e.id WHERE e.organizer_id = $1 AND b.status != 'cancelled'`, [organizerId]),
    ]);

    // Recent events with booking stats
    const recentEvents = await pool.query(
      `SELECT e.*,
        COUNT(b.id) FILTER (WHERE b.status != 'cancelled') as booking_count,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status != 'cancelled'), 0) as revenue
       FROM events e
       LEFT JOIN bookings b ON e.id = b.event_id
       WHERE e.organizer_id = $1
       GROUP BY e.id
       ORDER BY e.date DESC
       LIMIT 5`,
      [organizerId]
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalEvents: parseInt(totalEvents.rows[0].count),
          total_events: parseInt(totalEvents.rows[0].count),
          upcomingEvents: parseInt(upcomingEvents.rows[0].count),
          upcoming_events: parseInt(upcomingEvents.rows[0].count),
          totalBookings: parseInt(totalBookings.rows[0].count),
          total_bookings: parseInt(totalBookings.rows[0].count),
          totalRevenue: parseFloat(totalRevenue.rows[0].revenue),
          total_revenue: parseFloat(totalRevenue.rows[0].revenue),
          totalAttendees: parseInt(totalAttendees.rows[0].attendees),
          total_attendees: parseInt(totalAttendees.rows[0].attendees),
        },
        recentEvents: recentEvents.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/organizer/events
router.get('/events', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*,
        COUNT(b.id) FILTER (WHERE b.status != 'cancelled') as booking_count,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status != 'cancelled'), 0) as revenue
       FROM events e
       LEFT JOIN bookings b ON e.id = b.event_id
       WHERE e.organizer_id = $1
       GROUP BY e.id
       ORDER BY e.date DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: { events: result.rows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/organizer/events/:id/attendees
router.get('/events/:id/attendees', async (req, res) => {
  try {
    const { search } = req.query;

    // Verify ownership
    const eventCheck = await pool.query(
      'SELECT * FROM events WHERE id = $1 AND organizer_id = $2',
      [req.params.id, req.user.id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
    }

    let query = `
      SELECT b.id as booking_id, b.ticket_type, b.quantity, b.total_amount, b.status, b.created_at as booked_at,
             u.id as user_id, u.name, u.email, u.mobile
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.event_id = $1
    `;
    const params = [req.params.id];

    if (search) {
      query += ` AND (u.name ILIKE $2 OR u.email ILIKE $2)`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY b.created_at DESC';

    const result = await pool.query(query, params);

    res.json({ success: true, data: { attendees: result.rows, event: eventCheck.rows[0] } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
