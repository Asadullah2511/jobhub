const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateUser } = require('../middleware/authMiddleware');
const notificationService = require('../services/notificationService');

router.get('/workers', authenticateUser, async (req, res) => {
  const { search } = req.query;
  try {
    const usersResult = await query(
      "SELECT id, first_name, last_name, phone FROM users WHERE role = 'blue_collar'"
    );
    const users = usersResult.rows || [];
    if (users.length === 0) return res.json({ success: true, data: [] });

    const userIds = users.map(u => u.id);
    const placeholders = userIds.map((_, i) => `$${i + 1}`);
    const profResult = await query(
      `SELECT user_id, full_name, trade, skills, location, hourly_rate, availability, avatar_url, avg_rating, total_reviews
       FROM profiles WHERE user_id IN (${placeholders.join(',')})`,
      userIds
    );

    const profileMap = {};
    if (profResult.rows) profResult.rows.forEach(p => profileMap[p.user_id] = p);

    let results = users.map(u => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      phone: u.phone,
      ...profileMap[u.id]
    }));

    if (search && search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(w =>
        (w.full_name && w.full_name.toLowerCase().includes(q)) ||
        (w.trade && w.trade.toLowerCase().includes(q)) ||
        (w.skills && w.skills.toLowerCase().includes(q)) ||
        (w.location && w.location.toLowerCase().includes(q)) ||
        (w.first_name && w.first_name.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', authenticateUser, async (req, res) => {
  const employer_id = req.user.id;
  const { worker_id, title, description, location, booking_date, start_time, end_time, offered_rate } = req.body;

  if (!worker_id || !title || !booking_date || !start_time || !end_time) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const activeResult = await query(
      `SELECT start_time, end_time FROM bookings
       WHERE worker_id = $1 AND booking_date = $2 AND status IN ('Pending', 'Accepted')`,
      [worker_id, booking_date]
    );

    const overlapping = activeResult.rows?.filter(b => {
      return start_time < b.end_time && end_time > b.start_time;
    });

    if (overlapping && overlapping.length > 0) {
      const slots = overlapping.map(b => `${b.start_time.slice(0, 5)} to ${b.end_time.slice(0, 5)}`).join(', ');
      return res.status(400).json({ success: false, error: `Worker is already booked during overlapping hours: ${slots}` });
    }

    const result = await query(
      `INSERT INTO bookings (employer_id, worker_id, title, description, location, booking_date, start_time, end_time, offered_rate, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending') RETURNING *`,
      [employer_id, worker_id, title, description || '', location || '', booking_date, start_time, end_time, offered_rate || '']
    );

    try {
      const empResult = await query('SELECT first_name, last_name FROM users WHERE id = $1', [employer_id]);
      const employer = empResult.rows[0];
      await notificationService.createNotification(
        worker_id, 'BOOKING_REQUEST',
        `${employer?.first_name || 'An employer'} wants to book you for "${title}" on ${booking_date}.`,
        result.rows[0].id
      );
    } catch (notifyErr) {
      console.error('Booking notification failed:', notifyErr);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/employer', authenticateUser, async (req, res) => {
  const employer_id = req.user.id;
  try {
    const result = await query(
      'SELECT * FROM bookings WHERE employer_id = $1 ORDER BY booking_date ASC',
      [employer_id]
    );
    const data = result.rows || [];

    if (data.length > 0) {
      const workerIds = [...new Set(data.map(b => b.worker_id))];
      const placeholders = workerIds.map((_, i) => `$${i + 1}`);
      const profResult = await query(
        `SELECT user_id, full_name, trade, avatar_url, location FROM profiles WHERE user_id IN (${placeholders.join(',')})`,
        workerIds
      );
      const profMap = {};
      if (profResult.rows) profResult.rows.forEach(p => profMap[p.user_id] = p);
      data.forEach(b => { b.worker = profMap[b.worker_id] || {}; });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching employer bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/worker', authenticateUser, async (req, res) => {
  const worker_id = req.user.id;
  try {
    const result = await query(
      'SELECT * FROM bookings WHERE worker_id = $1 ORDER BY booking_date ASC',
      [worker_id]
    );
    const data = result.rows || [];

    if (data.length > 0) {
      const empIds = [...new Set(data.map(b => b.employer_id))];
      const profPlaceholders = empIds.map((_, i) => `$${i + 1}`);
      const [profResult, userResult] = await Promise.all([
        query(
          `SELECT user_id, full_name, company_name, avatar_url FROM profiles WHERE user_id IN (${profPlaceholders.join(',')})`,
          empIds
        ),
        query(
          `SELECT id, first_name, last_name FROM users WHERE id IN (${profPlaceholders.join(',')})`,
          empIds
        )
      ]);

      const profMap = {};
      if (profResult.rows) profResult.rows.forEach(p => profMap[p.user_id] = p);
      const userMap = {};
      if (userResult.rows) userResult.rows.forEach(u => userMap[u.id] = u);

      data.forEach(b => {
        b.employer = {
          ...(profMap[b.employer_id] || {}),
          ...(userMap[b.employer_id] || {})
        };
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching worker bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/:id/status', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!['Accepted', 'Rejected', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  try {
    const result = await query(
      "UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, id]
    );
    const booking = result.rows[0];

    try {
      const actorResult = await query('SELECT first_name FROM users WHERE id = $1', [userId]);
      const actorName = actorResult.rows[0]?.first_name || 'Someone';
      const targetId = userId === booking.employer_id ? booking.worker_id : booking.employer_id;

      let message = '';
      if (status === 'Accepted') message = `${actorName} accepted your booking for "${booking.title}"!`;
      else if (status === 'Rejected') message = `${actorName} declined your booking for "${booking.title}".`;
      else if (status === 'Completed') message = `Booking "${booking.title}" has been marked as completed.`;
      else if (status === 'Cancelled') message = `${actorName} cancelled the booking for "${booking.title}".`;

      await notificationService.createNotification(targetId, 'BOOKING_UPDATE', message, id);
    } catch (notifyErr) {
      console.error('Booking status notification failed:', notifyErr);
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
