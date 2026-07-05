const { query } = require('../config/database');

const reviewRepository = {
  verifyApplicationExists: async (job_id, reviewer_id, reviewee_id) => {
    const result = await query(
      'SELECT status, id, applicant_id FROM applications WHERE job_id = $1',
      [job_id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  },

  createReview: async (reviewData) => {
    const keys = Object.keys(reviewData);
    const cols = keys;
    const vals = keys.map(k => reviewData[k]);
    const placeholders = vals.map((_, i) => `$${i + 1}`);
    const result = await query(
      `INSERT INTO reviews (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      vals
    );
    return result.rows[0];
  },

  getReviewsByReviewee: async (revieweeId) => {
    const result = await query('SELECT rating FROM reviews WHERE reviewee_id = $1', [revieweeId]);
    return result.rows;
  },

  updateProfileRating: async (userId, avgRating, totalReviews) => {
    const result = await query(
      'UPDATE profiles SET avg_rating = $1, total_reviews = $2 WHERE user_id = $3 RETURNING *',
      [avgRating, totalReviews, userId]
    );
    return result.rows[0];
  },

  getFullReviewsByReviewee: async (revieweeId) => {
    const result = await query(
      'SELECT * FROM reviews WHERE reviewee_id = $1 ORDER BY created_at DESC',
      [revieweeId]
    );
    return result.rows;
  },

  getProfileMinimalInfo: async (userId) => {
    const result = await query('SELECT role FROM profiles WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  }
};

module.exports = reviewRepository;
