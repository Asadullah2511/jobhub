const { query } = require('../config/database');

const complaintRepository = {
  createComplaint: async ({ reporterId, reportedUserId, reportedJobId, reason, description }) => {
    const result = await query(
      `INSERT INTO complaints (reporter_id, reported_user_id, reported_job_id, reason, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [reporterId, reportedUserId || null, reportedJobId || null, reason, description]
    );
    return result.rows[0];
  },

  getAllComplaints: async () => {
    const result = await query(
      `SELECT c.*,
              row_to_json(r.*) AS reporter,
              row_to_json(ru.*) AS reported_user,
              row_to_json(rj.*) AS reported_job
       FROM complaints c
       LEFT JOIN users r ON r.id = c.reporter_id
       LEFT JOIN users ru ON ru.id = c.reported_user_id
       LEFT JOIN jobs rj ON rj.id = c.reported_job_id
       ORDER BY c.created_at DESC`
    );
    const data = result.rows.map(row => {
      const parse = (val) => {
        if (!val) return null;
        if (typeof val === 'string') try { return JSON.parse(val); } catch (e) { return val; }
        return val;
      };
      row.reporter = parse(row.reporter);
      row.reported_user = parse(row.reported_user);
      row.reported_job = parse(row.reported_job);
      return row;
    });
    return data || [];
  },

  updateComplaintStatus: async (complaintId, status, adminNotes) => {
    const result = await query(
      'UPDATE complaints SET status = $1, admin_notes = $2 WHERE id = $3 RETURNING *',
      [status, adminNotes, complaintId]
    );
    return result.rows[0];
  }
};

module.exports = complaintRepository;
