const { query } = require('../config/database');

const jobRepository = {
  createJob: async (jobData) => {
    const keys = Object.keys(jobData);
    const cols = keys;
    const vals = keys.map(k => jobData[k]);
    const placeholders = vals.map((_, i) => `$${i + 1}`);
    const result = await query(
      `INSERT INTO jobs (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      vals
    );
    return result.rows[0];
  },

  deleteJob: async (jobId) => {
    await query("UPDATE jobs SET status = 'Deleted' WHERE id = $1", [jobId]);
    await query(
      `UPDATE applications SET status = 'Rejected'
       WHERE job_id = $1 AND status NOT IN ('Completed', 'In Progress')`,
      [jobId]
    );
    return true;
  },

  getJobs: async (type, searchWords = [], pagination = null) => {
    let sql = "SELECT * FROM jobs WHERE status = 'Active'";
    const params = [];
    let paramIndex = 1;

    if (type) {
      sql += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (searchWords && searchWords.length > 0) {
      const conditions = searchWords.map(word => {
        const likeClauses = ['title', 'location', 'description', 'skills']
          .map(col => `${col} ILIKE $${paramIndex}`);
        paramIndex++;
        params.push(`%${word}%`);
        return `(${likeClauses.join(' OR ')})`;
      });
      sql += ` AND (${conditions.join(' OR ')})`;
    }

    sql += ' ORDER BY created_at DESC';

    // Count total for pagination
    let total = 0;
    if (pagination) {
      // Remove ORDER BY from count query
      const countSql = sql.replace('SELECT *', 'SELECT COUNT(*)').replace(/ORDER BY.*$/, '');
      const countResult = await query(countSql, params);
      total = parseInt(countResult.rows[0].count);

      // Add pagination
      const limit = Math.min(pagination.limit, 100);
      const offset = (pagination.page - 1) * limit;
      sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
    }

    const result = await query(sql, params);
    const data = result.rows;

    if (data && data.length > 0) {
      const employerIds = [...new Set(data.map(job => job.employer_id).filter(Boolean))];
      if (employerIds.length > 0) {
        const placeholders = employerIds.map((_, i) => `$${i + 1}`);
        const profResult = await query(
          `SELECT user_id, full_name, phone, company_name, bio, location, experience_years, skills
           FROM profiles WHERE user_id IN (${placeholders.join(',')})`,
          employerIds
        );
        const profileMap = {};
        profResult.rows.forEach(p => profileMap[p.user_id] = p);
        data.forEach(job => {
          job.profiles = profileMap[job.employer_id] || null;
        });
      }
    }

    if (pagination) {
      return {
        jobs: data,
        pagination: {
          page: pagination.page,
          limit: Math.min(pagination.limit, 100),
          total
        }
      };
    }

    return data;
  },

  findApplication: async (jobId, applicantId) => {
    const result = await query(
      'SELECT * FROM applications WHERE job_id = $1 AND applicant_id = $2',
      [jobId, applicantId]
    );
    return result.rows[0] || null;
  },

  createApplication: async (applicationData) => {
    const keys = Object.keys(applicationData);
    const cols = keys;
    const vals = keys.map(k => applicationData[k]);
    const placeholders = vals.map((_, i) => `$${i + 1}`);
    const result = await query(
      `INSERT INTO applications (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      vals
    );
    return result.rows[0];
  },

  getMyJobs: async (employerId) => {
    const result = await query(
      `SELECT j.*,
              (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applications_count
       FROM jobs j
       WHERE j.employer_id = $1 AND j.status != 'Deleted'
       ORDER BY j.created_at DESC`,
      [employerId]
    );
    return result.rows;
  },

  getNearbyJobs: async (lat, lng, radius, searchWords = []) => {
    let sql = `SELECT * FROM jobs WHERE status = 'Active' AND type = 'blue'
               AND latitude IS NOT NULL AND longitude IS NOT NULL`;
    const params = [];
    let paramIndex = 1;

    if (searchWords && searchWords.length > 0) {
      const conditions = searchWords.map(word => {
        const likeClauses = ['title', 'location', 'description', 'skills']
          .map(col => `${col} ILIKE $${paramIndex}`);
        paramIndex++;
        params.push(`%${word}%`);
        return `(${likeClauses.join(' OR ')})`;
      });
      sql += ` AND (${conditions.join(' OR ')})`;
    }

    const result = await query(sql, params);
    const data = result.rows;

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const nearbyJobs = data.filter(job => {
      const distance = calculateDistance(lat, lng, job.latitude, job.longitude);
      if (distance <= radius) {
        job.distance = distance.toFixed(1);
        return true;
      }
      return false;
    }).sort((a, b) => a.distance - b.distance);

    if (nearbyJobs.length > 0) {
      const employerIds = [...new Set(nearbyJobs.map(job => job.employer_id).filter(Boolean))];
      if (employerIds.length > 0) {
        const placeholders = employerIds.map((_, i) => `$${i + 1}`);
        const profResult = await query(
          `SELECT user_id, full_name, phone, company_name, bio, location, experience_years, skills
           FROM profiles WHERE user_id IN (${placeholders.join(',')})`,
          employerIds
        );
        const profileMap = {};
        profResult.rows.forEach(p => profileMap[p.user_id] = p);
        nearbyJobs.forEach(job => {
          job.profiles = profileMap[job.employer_id] || null;
        });
      }
    }

    return nearbyJobs;
  },

  getJobById: async (jobId) => {
    const result = await query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    return result.rows[0] || null;
  },

  getJobApplications: async (jobId) => {
    const result = await query('SELECT * FROM applications WHERE job_id = $1', [jobId]);
    return result.rows;
  },

  getApplicationById: async (applicationId) => {
    const result = await query(
      `SELECT a.*, row_to_json(j.*) AS jobs
       FROM applications a
       LEFT JOIN jobs j ON j.id = a.job_id
       WHERE a.id = $1`,
      [applicationId]
    );
    if (!result.rows[0]) return null;
    const app = result.rows[0];
    app.jobs = app.jobs || {};
    return app;
  },

  updateApplicationStatus: async (applicationId, status) => {
    const result = await query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, applicationId]
    );
    return result.rows[0];
  },

  getWorkerApplications: async (userId) => {
    const result = await query(
      `SELECT a.*, row_to_json(j.*) AS jobs
       FROM applications a
       LEFT JOIN jobs j ON j.id = a.job_id
       WHERE a.applicant_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );

    const data = result.rows.map(app => {
      if (typeof app.jobs === 'string') {
        try { app.jobs = JSON.parse(app.jobs); } catch (e) { app.jobs = {}; }
      }
      return app;
    });

    const filteredData = data.filter(app => {
      if (app.status === 'Rejected') return false;
      const jobStatus = app.jobs?.status;
      if ((!app.jobs || jobStatus === 'Deleted') && app.status !== 'Completed') {
        return false;
      }
      return true;
    });

    return filteredData;
  }
};

module.exports = jobRepository;
