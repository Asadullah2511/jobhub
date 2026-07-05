const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');
const notificationService = require('../services/notificationService');

router.get('/', async (req, res) => {
  try {
    const { country, type } = req.query;

    let sql = `SELECT ij.*, row_to_json(u.*) AS employer
               FROM international_jobs ij
               LEFT JOIN users u ON u.id = ij.employer_id
               WHERE ij.status = 'Active'`;
    const params = [];
    let paramIndex = 1;

    if (country) {
      sql += ` AND ij.country ILIKE $${paramIndex}`;
      params.push(`%${country}%`);
      paramIndex++;
    }
    if (type) {
      sql += ` AND ij.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    sql += ' ORDER BY ij.created_at DESC';

    const result = await query(sql, params);
    const data = result.rows.map(row => {
      if (row.employer && typeof row.employer === 'string') {
        try { row.employer = JSON.parse(row.employer); } catch (e) { }
      }
      return row;
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching international jobs:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/', authenticateUser, async (req, res) => {
  try {
    const { title, description, country, city, salary, currency, visa_sponsored, type, requirements, benefits } = req.body;
    const employer_id = req.user.id;

    if (!title || !country || !type) {
      return res.status(400).json({ success: false, error: 'Title, country, and type are required' });
    }

    const result = await query(
      `INSERT INTO international_jobs (employer_id, title, description, country, city, salary, currency, visa_sponsored, type, requirements, benefits)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [employer_id, title, description, country, city, salary, currency || 'USD', visa_sponsored || false, type, requirements, benefits]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating international job:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const jobResult = await query('SELECT employer_id FROM international_jobs WHERE id = $1', [id]);
    const job = jobResult.rows[0];

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (job.employer_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await query('DELETE FROM international_jobs WHERE id = $1', [id]);

    res.json({ success: true, message: 'International job deleted' });
  } catch (error) {
    console.error('Error deleting international job:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/:id/apply', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const applicant_id = req.user.id;

    try {
      const result = await query(
        'INSERT INTO international_job_applications (job_id, applicant_id) VALUES ($1, $2) RETURNING *',
        [id, applicant_id]
      );

      try {
        const jobResult = await query('SELECT employer_id, title FROM international_jobs WHERE id = $1', [id]);
        const job = jobResult.rows[0];
        if (job) {
          await notificationService.createNotification(
            job.employer_id, 'NEW_INTL_APPLICANT',
            `New applicant for international job: ${job.title}`, id
          );
        }
      } catch (notifyErr) { console.error('Notification failed:', notifyErr); }

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, error: 'You have already applied for this job' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error applying for international job:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

router.get('/employer/:employer_id', authenticateUser, async (req, res) => {
  try {
    const { employer_id } = req.params;
    const result = await query(
      'SELECT * FROM international_jobs WHERE employer_id = $1 ORDER BY created_at DESC',
      [employer_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching employer international jobs:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/:id/applications', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const jobResult = await query('SELECT employer_id FROM international_jobs WHERE id = $1', [id]);
    const job = jobResult.rows[0];

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (job.employer_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const appsResult = await query(
      'SELECT * FROM international_job_applications WHERE job_id = $1 ORDER BY created_at DESC',
      [id]
    );

    const mappedData = await Promise.all(appsResult.rows.map(async (app) => {
      const userResult = await query(
        'SELECT id, first_name, last_name, phone FROM users WHERE id = $1',
        [app.applicant_id]
      );
      const user = userResult.rows[0];

      const profileResult = await query(
        'SELECT user_id, full_name, experience, avg_rating, total_reviews FROM profiles WHERE user_id = $1',
        [app.applicant_id]
      );
      const profile = profileResult.rows[0];

      const fallbackName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Candidate';

      return {
        id: app.id,
        status: app.status,
        applied_at: app.created_at,
        applicant_id: app.applicant_id,
        applicant_name: profile?.full_name || fallbackName,
        applicant_profile: profile || {},
        applicant_user: user || {}
      };
    }));

    res.json({ success: true, data: mappedData });
  } catch (error) {
    console.error('Error fetching international job applications:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/applications/:appId/status', authenticateUser, async (req, res) => {
  try {
    const { appId } = req.params;
    const { status } = req.body;

    const result = await query(
      'UPDATE international_job_applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, appId]
    );

    try {
      const appData = result.rows[0];
      if (appData) {
        const jobResult = await query('SELECT title FROM international_jobs WHERE id = $1', [appData.job_id]);
        const job = jobResult.rows[0];
        await notificationService.createNotification(
          appData.applicant_id, 'INTL_STATUS_UPDATE',
          `Your application status for "${job?.title || 'International Job'}" has been updated to ${status}`,
          appData.job_id
        );
      }
    } catch (notifyErr) { console.error('Notification failed:', notifyErr); }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
