const { query } = require('../config/database');

const adminRepository = {
  getAllUsers: async () => {
    const result = await query(
      'SELECT id, user_id, phone, role, first_name, last_name, is_profile_completed, is_suspended, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows || [];
  },

  suspendUser: async (userId) => {
    const result = await query(
      'UPDATE users SET is_suspended = true WHERE id = $1 RETURNING *',
      [userId]
    );
    return result.rows[0];
  },

  unsuspendUser: async (userId) => {
    const result = await query(
      'UPDATE users SET is_suspended = false WHERE id = $1 RETURNING *',
      [userId]
    );
    return result.rows[0];
  },

  getAllJobs: async () => {
    const result = await query(
      `SELECT j.*,
              (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count
       FROM jobs j ORDER BY j.created_at DESC`
    );
    return result.rows || [];
  },

  deleteJob: async (jobId) => {
    await query(
      `UPDATE applications SET status = 'Rejected'
       WHERE job_id = $1 AND status NOT IN ('Completed', 'In Progress')`,
      [jobId]
    );
    await query('DELETE FROM jobs WHERE id = $1', [jobId]);
    return true;
  },

  getPlatformStats: async () => {
    const usersRes = await query('SELECT id, role FROM users');
    const jobsRes = await query('SELECT id, status FROM jobs');
    const appsRes = await query('SELECT id, status FROM applications');
    const reviewsCount = await query('SELECT COUNT(*) as count FROM reviews');
    const bookingsRes = await query('SELECT id, status FROM bookings');
    const intlJobsCount = await query('SELECT COUNT(*) as count FROM international_jobs');

    const users = usersRes.rows || [];
    const roleCounts = { blue_collar: 0, white_collar: 0, employer: 0, admin: 0 };
    users.forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });

    const jobs = jobsRes.rows || [];
    const activeJobs = jobs.filter(j => j.status === 'Active').length;
    const closedJobs = jobs.filter(j => j.status === 'Closed').length;

    const apps = appsRes.rows || [];
    const appStatusCounts = {};
    apps.forEach(a => { appStatusCounts[a.status] = (appStatusCounts[a.status] || 0) + 1; });

    const bookings = bookingsRes.rows || [];
    const bookingStatusCounts = {};
    bookings.forEach(b => { bookingStatusCounts[b.status] = (bookingStatusCounts[b.status] || 0) + 1; });

    return {
      totalUsers: users.length,
      totalJobs: jobs.length,
      totalApplications: apps.length,
      totalReviews: parseInt(reviewsCount.rows[0]?.count || '0'),
      totalBookings: bookings.length,
      totalIntlJobs: parseInt(intlJobsCount.rows[0]?.count || '0'),
      roleCounts,
      activeJobs,
      closedJobs,
      appStatusCounts,
      bookingStatusCounts
    };
  },

  getSystemLogs: async (limit = 50) => {
    const result = await query(
      'SELECT * FROM system_logs ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows || [];
  },

  getPendingVerifications: async () => {
    const result = await query(
      `SELECT p.user_id, p.full_name, p.verification_document_url, p.verification_status, p.updated_at
       FROM profiles p
       WHERE p.verification_status = 'pending'
       ORDER BY p.updated_at DESC`
    );
    const data = result.rows || [];
    const enriched = await Promise.all(data.map(async (profile) => {
      try {
        const userResult = await query(
          'SELECT phone, first_name, last_name, role FROM users WHERE id = $1',
          [profile.user_id]
        );
        const userData = userResult.rows[0] || {};
        return { ...profile, role: userData.role || 'unknown', users: userData };
      } catch (e) {
        return { ...profile, role: 'unknown', users: {} };
      }
    }));
    return enriched;
  },

  updateVerificationStatus: async (userId, status) => {
    const result = await query(
      'UPDATE profiles SET verification_status = $1 WHERE user_id = $2 RETURNING *',
      [status, userId]
    );
    return result.rows[0];
  },

  createSystemLog: async (action, performedBy, targetType, targetId, details) => {
    try {
      const result = await query(
        `INSERT INTO system_logs (action, performed_by, target_type, target_id, details)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [action, performedBy, targetType, targetId, details]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating system log:', error);
      return null;
    }
  }
};

module.exports = adminRepository;
