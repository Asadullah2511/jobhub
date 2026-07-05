const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM scholarships WHERE is_active = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/admin', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const result = await query('SELECT * FROM scholarships ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin scholarships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { title, provider, description, deadline, application_link } = req.body;

    if (!title || !provider) {
      return res.status(400).json({ error: 'Title and provider are required' });
    }

    const processedDeadline = (deadline && deadline.trim() !== '') ? deadline : null;
    const processedLink = (application_link && application_link.trim() !== '') ? application_link : null;

    const result = await query(
      `INSERT INTO scholarships (title, provider, description, deadline, application_link)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, provider, description, processedDeadline, processedLink]
    );

    res.status(201).json({ message: 'Scholarship created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM scholarships WHERE id = $1', [id]);
    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/apply', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const schResult = await query('SELECT * FROM scholarships WHERE id = $1', [id]);
    const scholarship = schResult.rows[0];

    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    if (!scholarship.is_active) {
      return res.status(400).json({ error: 'This scholarship is no longer active' });
    }

    try {
      const result = await query(
        'INSERT INTO scholarship_applications (scholarship_id, applicant_id) VALUES ($1, $2) RETURNING *',
        [id, userId]
      );
      res.status(201).json({ message: 'Applied successfully', data: result.rows[0] });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'You have already applied for this scholarship' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error applying for scholarship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/my-applications', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT sa.*, row_to_json(s.*) AS scholarships
       FROM scholarship_applications sa
       LEFT JOIN scholarships s ON s.id = sa.scholarship_id
       WHERE sa.applicant_id = $1
       ORDER BY sa.applied_at DESC`,
      [userId]
    );
    const data = result.rows.map(row => {
      if (row.scholarships && typeof row.scholarships === 'string') {
        try { row.scholarships = JSON.parse(row.scholarships); } catch (e) { }
      }
      return row;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/applicants', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT sa.*, row_to_json(p.*) AS profiles
       FROM scholarship_applications sa
       LEFT JOIN profiles p ON p.user_id = sa.applicant_id
       WHERE sa.scholarship_id = $1
       ORDER BY sa.applied_at DESC`,
      [id]
    );
    const data = result.rows.map(row => {
      if (row.profiles && typeof row.profiles === 'string') {
        try { row.profiles = JSON.parse(row.profiles); } catch (e) { }
      }
      return row;
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
