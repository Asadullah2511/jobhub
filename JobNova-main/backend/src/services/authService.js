const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const { query } = require('../config/database');
const {
    ValidationError,
    AuthenticationError,
    ConflictError,
    NotFoundError
} = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET;

const authService = {
  registerUser: async ({ user_id, phone, password, role, first_name, last_name }) => {
    if (!user_id || !password || !role || !first_name || !last_name) {
      throw new ValidationError('User ID, password, role, first name, and last name are required');
    }

    const VALID_ROLES = ['blue_collar', 'white_collar', 'employer', 'admin'];
    if (!VALID_ROLES.includes(role)) {
      throw new ValidationError('Invalid role');
    }

    const existingUserId = await userRepository.findByUserId(user_id);
    if (existingUserId) {
      throw new ConflictError('User ID already taken');
    }

    if (phone) {
      const existingPhone = await userRepository.findByPhone(phone);
      if (existingPhone) {
        throw new ConflictError('Phone number already registered');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await userRepository.createUser({
      user_id, phone, password_hash: passwordHash, role, first_name, last_name
    });

    try {
      const profileRepository = require('../repositories/profileRepository');
      await profileRepository.create(newUser.id, {
        full_name: `${first_name} ${last_name}`.trim()
      });
    } catch (profileErr) {
      console.error('Auto-create profile failed (non-fatal):', profileErr.message);
    }

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, user_id: newUser.user_id, phone: newUser.phone, first_name: newUser.first_name, last_name: newUser.last_name },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return { user: newUser, token };
  },

  loginUser: async ({ identifier, password }) => {
    if (!identifier || !password) {
      throw new ValidationError('User ID / Phone and password required');
    }

    let user = await userRepository.findByPhone(identifier);
    if (!user) {
      user = await userRepository.findByUserId(identifier);
    }

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (!user.password_hash) {
      throw new AuthenticationError('Invalid credentials - Please register a password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (user.is_suspended) {
      throw new AuthenticationError('Your account has been suspended. Please contact the administrator.');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, user_id: user.user_id, phone: user.phone, first_name: user.first_name, last_name: user.last_name },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  getProfile: async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  forgotPassword: async (email) => {
    if (!email) {
      throw new ValidationError('Email is required');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    await query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    try {
      const { sendPasswordResetEmail } = require('./mailService');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      await sendPasswordResetEmail(email, token, frontendUrl);
    } catch (emailErr) {
      console.error('Failed to send password reset email:', emailErr);
    }
  },

  resetPassword: async (token, newPassword) => {
    if (!token || !newPassword) {
      throw new ValidationError('Token and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const resetResult = await query(
      'SELECT * FROM password_resets WHERE token = $1 AND used = false',
      [token]
    );
    const resetRecord = resetResult.rows[0];

    if (!resetRecord) {
      throw new ValidationError('Invalid or expired reset token');
    }

    if (new Date() > new Date(resetRecord.expires_at)) {
      throw new ValidationError('Reset token has expired');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, resetRecord.user_id]);
    await query('UPDATE password_resets SET used = true WHERE id = $1', [resetRecord.id]);
  }
};

module.exports = authService;
