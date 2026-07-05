const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/sessions', authenticateUser, async (req, res) => {
  try {
    const authUserId = req.user.id;

    const profileResult = await query('SELECT id FROM profiles WHERE user_id = $1', [authUserId]);
    const userProfile = profileResult.rows[0];
    if (!userProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const profileId = userProfile.id;

    const sessionsResult = await query(
      `SELECT cs.id, cs.job_id, cs.employer_id, cs.candidate_id, cs.updated_at,
              row_to_json(j.*) AS jobs,
              row_to_json(ep.*) AS employer,
              row_to_json(cp.*) AS candidate
       FROM chat_sessions cs
       LEFT JOIN jobs j ON j.id = cs.job_id
       LEFT JOIN profiles ep ON ep.id = cs.employer_id
       LEFT JOIN profiles cp ON cp.id = cs.candidate_id
       WHERE cs.employer_id = $1 OR cs.candidate_id = $1
       ORDER BY cs.updated_at DESC NULLS LAST`,
      [profileId]
    );

    const parse = (val) => {
      if (!val) return null;
      if (typeof val === 'string') try { return JSON.parse(val); } catch (e) { return val; }
      return val;
    };

    let sessions = sessionsResult.rows.map(s => ({
      ...s,
      jobs: parse(s.jobs),
      employer: parse(s.employer),
      candidate: parse(s.candidate)
    }));

    const unreadResult = await query(
      `SELECT session_id, COUNT(*) as count FROM chat_messages
       WHERE is_read = false AND sender_id != $1
       GROUP BY session_id`,
      [profileId]
    );

    const unreadCounts = {};
    unreadResult.rows.forEach(msg => {
      unreadCounts[msg.session_id] = parseInt(msg.count);
    });

    const enrichedSessions = sessions.map(session => ({
      ...session,
      unreadCount: unreadCounts[session.id] || 0
    }));

    res.json(enrichedSessions);
  } catch (err) {
    console.error('Server error in /sessions:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:sessionId/messages', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const authUserId = req.user.id;

    const profileResult = await query('SELECT id FROM profiles WHERE user_id = $1', [authUserId]);
    const userProfile = profileResult.rows[0];
    if (!userProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const profileId = userProfile.id;

    const sessionResult = await query(
      `SELECT id FROM chat_sessions
       WHERE id = $1 AND (employer_id = $2 OR candidate_id = $2)`,
      [sessionId, profileId]
    );

    if (!sessionResult.rows[0]) {
      return res.status(403).json({ success: false, message: 'Session not found or access denied' });
    }

    const messagesResult = await query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    res.json(messagesResult.rows);
  } catch (err) {
    console.error('Server error in /messages:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/start', authenticateUser, async (req, res) => {
  try {
    const { job_id, candidate_id } = req.body;
    const userId = req.user.id;

    const empProfileResult = await query('SELECT id FROM profiles WHERE user_id = $1', [userId]);
    const employerProfile = empProfileResult.rows[0];
    if (!employerProfile) {
      return res.status(404).json({ success: false, message: 'Employer profile not found' });
    }

    const employer_id = employerProfile.id;

    if (!candidate_id) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required' });
    }

    const candProfileResult = await query('SELECT id FROM profiles WHERE user_id = $1', [candidate_id]);
    const candidateProfile = candProfileResult.rows[0];
    if (!candidateProfile) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found' });
    }

    const candidate_profile_id = candidateProfile.id;

    let existingSql = `SELECT cs.id, cs.job_id, cs.employer_id, cs.candidate_id, cs.updated_at,
                              row_to_json(j.*) AS jobs,
                              row_to_json(ep.*) AS employer,
                              row_to_json(cp.*) AS candidate
                       FROM chat_sessions cs
                       LEFT JOIN jobs j ON j.id = cs.job_id
                       LEFT JOIN profiles ep ON ep.id = cs.employer_id
                       LEFT JOIN profiles cp ON cp.id = cs.candidate_id
                       WHERE cs.employer_id = $1 AND cs.candidate_id = $2`;
    const existingParams = [employer_id, candidate_profile_id];

    if (job_id) {
      existingSql += ' AND cs.job_id = $3';
      existingParams.push(job_id);
    } else {
      existingSql += ' AND cs.job_id IS NULL';
    }

    const existingResult = await query(existingSql + ' LIMIT 1', existingParams);

    if (existingResult.rows[0]) {
      const parse = (val) => {
        if (!val) return null;
        if (typeof val === 'string') try { return JSON.parse(val); } catch (e) { return val; }
        return val;
      };
      return res.json({ session: { ...existingResult.rows[0], jobs: parse(existingResult.rows[0].jobs), employer: parse(existingResult.rows[0].employer), candidate: parse(existingResult.rows[0].candidate) } });
    }

    const newResult = await query(
      `INSERT INTO chat_sessions (job_id, employer_id, candidate_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [job_id || null, employer_id, candidate_profile_id]
    );

    const session = newResult.rows[0];
    session.jobs = null;
    session.employer = { full_name: employerProfile.full_name, company_name: employerProfile.company_name };
    session.candidate = { full_name: candidateProfile.full_name };

    res.json({ session });
  } catch (err) {
    console.error('Server error in /start:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/:sessionId/message', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;
    const authUserId = req.user.id;

    const profileResult = await query('SELECT id FROM profiles WHERE user_id = $1', [authUserId]);
    const userProfile = profileResult.rows[0];
    if (!userProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const senderProfileId = userProfile.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const sessionResult = await query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND (employer_id = $2 OR candidate_id = $2)',
      [sessionId, senderProfileId]
    );

    if (!sessionResult.rows[0]) {
      return res.status(403).json({ success: false, message: 'Session not found or access denied' });
    }

    const msgResult = await query(
      'INSERT INTO chat_messages (session_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [sessionId, senderProfileId, content.trim()]
    );

    await query(
      'UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1',
      [sessionId]
    );

    res.json({ message: msgResult.rows[0] });
  } catch (err) {
    console.error('Server error in /message:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/:sessionId/read', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const authUserId = req.user.id;

    const profileResult = await query('SELECT id FROM profiles WHERE user_id = $1', [authUserId]);
    const userProfile = profileResult.rows[0];
    if (!userProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const profileId = userProfile.id;

    await query(
      `UPDATE chat_messages SET is_read = true
       WHERE session_id = $1 AND sender_id != $2 AND is_read = false`,
      [sessionId, profileId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Server error in /read:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
