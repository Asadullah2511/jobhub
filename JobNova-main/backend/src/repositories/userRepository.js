const { query } = require('../config/database');

const userRepository = {
  findByUserId: async (user_id) => {
    const result = await query('SELECT * FROM users WHERE user_id = $1', [user_id]);
    return result.rows[0] || null;
  },

  findByPhone: async (phone) => {
    const result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    return result.rows[0] || null;
  },

  findByEmail: async (email) => {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  createUser: async ({ user_id, phone, password_hash, role, first_name, last_name }) => {
    const result = await query(
      `INSERT INTO users (user_id, phone, password_hash, role, first_name, last_name, is_profile_completed)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING id, user_id, phone, role, first_name, last_name, created_at`,
      [user_id, phone, password_hash, role, first_name, last_name]
    );
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await query(
      'SELECT id, user_id, phone, role, first_name, last_name, created_at, is_profile_completed, is_suspended, password_hash FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
};

module.exports = userRepository;
