const { query } = require('../config/database');
const path = require('path');
const fs = require('fs');

const profileRepository = {
  findByUserId: async (userId) => {
    const result = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  },

  update: async (userId, updates) => {
    const keys = Object.keys(updates);
    if (keys.length === 0) return null;
    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = keys.map(k => updates[k]);
    const result = await query(
      `UPDATE profiles SET ${setClauses.join(', ')}, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
      [userId, ...values]
    );
    return result.rows[0] || null;
  },

  create: async (userId, profileData) => {
    const keys = Object.keys(profileData);
    const cols = ['user_id', ...keys];
    const vals = [userId, ...keys.map(k => profileData[k])];
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const result = await query(
      `INSERT INTO profiles (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      vals
    );
    return result.rows[0] || null;
  },

  markUserCompletedProfile: async (userId) => {
    await query('UPDATE users SET is_profile_completed = true WHERE id = $1', [userId]);
  },

  getHiringHistoryApps: async () => {
    const result = await query(
      `SELECT a.id, a.status, a.created_at, a.job_id, a.applicant_id,
              j.title, j.type, j.employer_id
       FROM applications a
       LEFT JOIN jobs j ON j.id = a.job_id
       WHERE a.status = 'Completed'`
    );
    return result.rows;
  },

  uploadFileToStorage: async (bucket, filePath, buffer, mimetype) => {
    const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', bucket);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fullPath = path.join(uploadDir, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, buffer);
    return { path: filePath };
  },

  getPublicUrl: (bucket, filePath) => {
    return `/uploads/${bucket}/${filePath}`;
  },

  getPublicProfile: async (userId) => {
    let profile = null;
    try {
      const result = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
      profile = result.rows[0] || null;
    } catch (e) {
      console.error('Profile fetch error:', e);
    }

    let reviews = [];
    try {
      const result = await query(
        'SELECT * FROM reviews WHERE reviewee_id = $1 ORDER BY created_at DESC LIMIT 10',
        [userId]
      );
      reviews = result.rows || [];
      for (let review of reviews) {
        try {
          const r = await query('SELECT full_name FROM profiles WHERE user_id = $1', [review.reviewer_id]);
          review.reviewer_name = r.rows[0]?.full_name || 'Anonymous';
          if (review.job_id) {
            const j = await query('SELECT title FROM jobs WHERE id = $1', [review.job_id]);
            review.job_title = j.rows[0]?.title;
          }
        } catch (e) {
          review.reviewer_name = 'Anonymous';
        }
      }
    } catch (e) {
      console.error('[profileRepository] Reviews fetch exception:', e);
      reviews = [];
    }

    let jobsPosted = [];
    try {
      const result = await query(
        `SELECT id, title, type, status, created_at FROM jobs
         WHERE employer_id = $1 AND status != 'Deleted'
         ORDER BY created_at DESC LIMIT 5`,
        [userId]
      );
      jobsPosted = result.rows || [];
    } catch (e) {
      console.error('Jobs posted fetch error:', e);
    }

    let userData = {};
    try {
      const result = await query(
        'SELECT role, phone, first_name, last_name FROM users WHERE id = $1',
        [userId]
      );
      if (result.rows[0]) userData = result.rows[0];
    } catch (e) {
      console.error('User data fetch error:', e);
    }

    let completedJobsCount = 0;
    try {
      if (userData.role === 'employer') {
        const result = await query(
          `SELECT COUNT(*) as count FROM applications a
           INNER JOIN jobs j ON j.id = a.job_id
           WHERE j.employer_id = $1 AND a.status = 'Completed'`,
          [userId]
        );
        completedJobsCount = parseInt(result.rows[0]?.count || '0');
      } else {
        const result = await query(
          "SELECT COUNT(*) as count FROM applications WHERE applicant_id = $1 AND status = 'Completed'",
          [userId]
        );
        completedJobsCount = parseInt(result.rows[0]?.count || '0');
      }
    } catch (e) {
      console.error('Completed jobs count error:', e);
    }

    return {
      profile: profile || {},
      reviews: reviews,
      jobs_posted: jobsPosted,
      completed_jobs_count: completedJobsCount,
      user_info: userData
    };
  },

  getProfileNameRole: async (userId) => {
    const result = await query('SELECT full_name, role FROM profiles WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  }
};

module.exports = profileRepository;
