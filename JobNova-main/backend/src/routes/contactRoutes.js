const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const result = await query(
      'INSERT INTO contact_messages (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, message]
    );

    res.status(201).json({ message: 'Message sent successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Contact API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch Contacts Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/status', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Unread', 'Read', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const result = await query(
      'UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Status updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update Contact Status Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
