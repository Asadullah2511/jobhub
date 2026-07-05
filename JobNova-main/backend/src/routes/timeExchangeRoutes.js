const notificationService = require('../services/notificationService');
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/', authenticateUser, async (req, res) => {
  const { from_city, to_city, travel_date_start, travel_date_end, available_for_work, skills } = req.body;
  const user_id = req.user.id;

  if (!from_city || !to_city || !travel_date_start || !travel_date_end) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const result = await query(
      `INSERT INTO time_exchanges (user_id, from_city, to_city, travel_date_start, travel_date_end, available_for_work, skills)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, from_city, to_city, travel_date_start, travel_date_end, available_for_work, skills]
    );

    await notificationService.createNotification(
      user_id, 'TE_ANNOUNCEMENT_CREATED',
      `Your travel announcement from ${from_city} to ${to_city} has been posted successfully!`,
      result.rows[0].id
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating time exchange:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', async (req, res) => {
  const { to_city, date } = req.query;

  try {
    let sql = 'SELECT * FROM time_exchanges';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (to_city) {
      conditions.push(`to_city ILIKE $${paramIndex}`);
      params.push(`%${to_city}%`);
      paramIndex++;
    }

    if (date) {
      conditions.push(`$${paramIndex} BETWEEN travel_date_start AND travel_date_end`);
      params.push(date);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    const data = result.rows || [];

    if (data.length > 0) {
      const userIds = [...new Set(data.map(t => t.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const placeholders = userIds.map((_, i) => `$${i + 1}`);
        const [profResult, usersResult] = await Promise.all([
          query(
            `SELECT user_id, full_name, avatar_url, skills FROM profiles WHERE user_id IN (${placeholders.join(',')})`,
            userIds
          ),
          query(
            `SELECT id, role, first_name, last_name FROM users WHERE id IN (${placeholders.join(',')})`,
            userIds
          )
        ]);

        const profileMap = {};
        if (profResult.rows) profResult.rows.forEach(p => profileMap[p.user_id] = p);

        const userMap = {};
        if (usersResult.rows) usersResult.rows.forEach(u => userMap[u.id] = u);

        data.forEach(item => {
          const prof = profileMap[item.user_id] || {};
          const usr = userMap[item.user_id] || {};
          item.user = {
            user_id: item.user_id,
            full_name: prof.full_name || (usr.first_name ? `${usr.first_name} ${usr.last_name}` : 'Unknown'),
            profile_picture: prof.avatar_url,
            role: usr.role,
            skills: prof.skills
          };
          if (!item.skills && prof.skills) {
            item.skills = prof.skills;
          }
        });
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching time exchanges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await query(
      'SELECT * FROM time_exchanges WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching user time exchanges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const exchangeResult = await query('SELECT user_id FROM time_exchanges WHERE id = $1', [id]);
    const exchange = exchangeResult.rows[0];

    if (!exchange) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }

    if (exchange.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await query('DELETE FROM time_exchanges WHERE id = $1', [id]);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error deleting time exchange:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/hire', authenticateUser, async (req, res) => {
  const { worker_id, time_exchange_id, message } = req.body;
  const employer_id = req.user.id;

  if (!employer_id || !worker_id || !time_exchange_id) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const existingResult = await query(
      `SELECT * FROM time_exchange_requests
       WHERE employer_id = $1 AND worker_id = $2 AND time_exchange_id = $3`,
      [employer_id, worker_id, time_exchange_id]
    );

    if (existingResult.rows[0]) {
      return res.status(400).json({ success: false, error: 'You have already sent a request to this traveler' });
    }

    const result = await query(
      `INSERT INTO time_exchange_requests (employer_id, worker_id, time_exchange_id, message, status)
       VALUES ($1, $2, $3, $4, 'Pending') RETURNING *`,
      [employer_id, worker_id, time_exchange_id, message]
    );

    try {
      const empResult = await query('SELECT first_name, last_name FROM users WHERE id = $1', [employer_id]);
      const employer = empResult.rows[0];
      await notificationService.createNotification(
        worker_id, 'TE_HIRE_REQUEST',
        `${employer?.first_name || 'An employer'} sent you a hire request for your travel announcement!`,
        result.rows[0].id
      );
    } catch (notifyErr) { console.error('Notification failed:', notifyErr); }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error sending TE hire request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/requests/:worker_id', authenticateUser, async (req, res) => {
  const { worker_id } = req.params;
  try {
    const result = await query(
      `SELECT ter.*,
              row_to_json(e.*) AS employer,
              row_to_json(te.*) AS travel
       FROM time_exchange_requests ter
       LEFT JOIN users e ON e.id = ter.employer_id
       LEFT JOIN time_exchanges te ON te.id = ter.time_exchange_id
       WHERE ter.worker_id = $1
       ORDER BY ter.created_at DESC`,
      [worker_id]
    );

    const data = result.rows.map(row => {
      const parse = (val) => {
        if (!val) return null;
        if (typeof val === 'string') try { return JSON.parse(val); } catch (e) { return val; }
        return val;
      };
      row.employer = parse(row.employer);
      row.travel = parse(row.travel);
      return row;
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching TE requests:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/requests/:id/status', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  try {
    const result = await query(
      'UPDATE time_exchange_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    try {
      const reqData = result.rows[0];
      const workerResult = await query('SELECT first_name, last_name FROM users WHERE id = $1', [reqData.worker_id]);
      const worker = workerResult.rows[0];

      await notificationService.createNotification(
        reqData.employer_id, 'TE_REQUEST_RESPONSE',
        `${worker?.first_name || 'A worker'} has ${status.toLowerCase()} your Time Exchange hire request.`,
        id
      );
    } catch (notifyErr) { console.error('Notification failed:', notifyErr); }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating TE request status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
