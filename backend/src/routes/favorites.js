const express = require('express');
const pool = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/favorites
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id as favorite_id, f.event_id, f.created_at as favorited_at, e.*
       FROM favorites f
       JOIN events e ON f.event_id = e.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: { favorites: result.rows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/favorites
router.post('/', authenticate, async (req, res) => {
  const { event_id } = req.body;

  if (!event_id) {
    return res.status(400).json({ success: false, message: 'event_id is required' });
  }

  try {
    // Check event exists
    const eventExists = await pool.query('SELECT id FROM events WHERE id = $1', [event_id]);
    if (eventExists.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const result = await pool.query(
      'INSERT INTO favorites (user_id, event_id) VALUES ($1, $2) ON CONFLICT (user_id, event_id) DO NOTHING RETURNING *',
      [req.user.id, event_id]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ success: false, message: 'Event already in favorites' });
    }

    res.status(201).json({ success: true, message: 'Added to favorites', data: { favorite: result.rows[0] } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/favorites/:eventId
router.delete('/:eventId', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND event_id = $2 RETURNING id',
      [req.user.id, req.params.eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
