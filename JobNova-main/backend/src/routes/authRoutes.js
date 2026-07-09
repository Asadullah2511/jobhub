const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { sendOTP, verifyOTP } = require('../services/otpService');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to phone (Blue Collar workers)
 * @access  Public
 */
router.post('/send-otp',
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required')
      .matches(/^(\+92|92|0)?3[0-9]{9}$/).withMessage('Invalid Pakistani phone number format')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { phone } = req.body;

      // Send OTP
      const result = await sendOTP(phone);

      // In dev mode, include OTP in response for testing
      const response = {
        success: true,
        message: 'OTP sent successfully',
        expiresIn: '10 minutes'
      };

      if (result.otp) {
        response.otp = result.otp; // Only in dev mode when Twilio not configured
      }

      res.json(response);

    } catch (error) {
      console.error('❌ Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }
  }
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and login/register Blue Collar worker
 * @access  Public
 */
router.post('/verify-otp',
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { phone, otp } = req.body;

      // Verify OTP
      const otpResult = await verifyOTP(phone, otp);

      if (!otpResult.success) {
        return res.status(400).json({
          success: false,
          message: otpResult.message
        });
      }

      // Clean phone number
      let cleanPhone = phone.trim().replace(/\s+/g, '');
      if (!cleanPhone.startsWith('+')) {
        if (cleanPhone.startsWith('92')) {
          cleanPhone = '+' + cleanPhone;
        } else if (cleanPhone.startsWith('0')) {
          cleanPhone = '+92' + cleanPhone.substring(1);
        } else {
          cleanPhone = '+92' + cleanPhone;
        }
      }

      // Check if user exists
      let userResult = await query(
        'SELECT * FROM users WHERE phone = $1',
        [cleanPhone]
      );

      let user;
      let isNewUser = false;

      if (userResult.rows.length === 0) {
        // Create new Blue Collar user
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        userResult = await query(
          `INSERT INTO users (user_id, phone, role, is_profile_completed, role_selected)
           VALUES ($1, $2, $3, false, false)
           RETURNING *`,
          [userId, cleanPhone, 'blue_collar']
        );

        user = userResult.rows[0];
        isNewUser = true;

        console.log(`✅ New blue collar user registered: ${userId}`);
      } else {
        user = userResult.rows[0];
      }

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user.user_id,
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET || 'jobnova_jwt_secret_key_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: isNewUser ? 'Account created successfully' : 'Login successful',
        data: {
          token,
          user: {
            user_id: user.user_id,
            id: user.id,
            phone: user.phone,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            is_profile_completed: user.is_profile_completed,
            role_selected: user.role_selected
          },
          isNewUser
        }
      });

    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP'
      });
    }
  }
);

/**
 * @route   POST /api/auth/login-email
 * @desc    Email/password login for White Collar and Employers
 * @access  Public
 */
router.post('/login-email',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const userResult = await query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const user = userResult.rows[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is suspended
      if (user.is_suspended) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended'
        });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user.user_id,
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET || 'jobnova_jwt_secret_key_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            user_id: user.user_id,
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            is_profile_completed: user.is_profile_completed,
            role_selected: user.role_selected
          }
        }
      });

    } catch (error) {
      console.error('❌ Email login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }
);

/**
 * @route   POST /api/auth/register-email
 * @desc    Register White Collar or Employer with email
 * @access  Public
 */
router.post('/register-email',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('role').isIn(['white_collar', 'employer']).withMessage('Role must be white_collar or employer')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password, first_name, last_name, role } = req.body;

      // Check if email already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Generate user_id
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // Create user
      const result = await query(
        `INSERT INTO users (user_id, email, password_hash, first_name, last_name, role, is_profile_completed, role_selected)
         VALUES ($1, $2, $3, $4, $5, $6, false, false)
         RETURNING *`,
        [userId, email.toLowerCase(), passwordHash, first_name, last_name, role]
      );

      const user = result.rows[0];

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user.user_id,
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET || 'jobnova_jwt_secret_key_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      console.log(`✅ New ${role} user registered: ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          token,
          user: {
            user_id: user.user_id,
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            is_profile_completed: user.is_profile_completed,
            role_selected: user.role_selected
          }
        }
      });

    } catch (error) {
      console.error('❌ Email registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }
);

/**
 * @route   PUT /api/auth/select-role
 * @desc    Set role after first login (for role selection screen)
 * @access  Private
 */
router.put('/select-role',
  [
    body('role').isIn(['blue_collar', 'white_collar', 'employer']).withMessage('Invalid role')
  ],
  async (req, res) => {
    try {
      // Get user from JWT (assuming auth middleware is applied)
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jobnova_jwt_secret_key_change_in_production');

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { role } = req.body;

      // Update user role
      const result = await query(
        `UPDATE users
         SET role = $1, role_selected = true
         WHERE id = $2
         RETURNING *`,
        [role, decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result.rows[0];

      // Generate new token with updated role
      const newToken = jwt.sign(
        {
          userId: user.user_id,
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET || 'jobnova_jwt_secret_key_change_in_production',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: {
          token: newToken,
          user: {
            user_id: user.user_id,
            id: user.id,
            role: user.role,
            role_selected: user.role_selected
          }
        }
      });

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      console.error('❌ Select role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role'
      });
    }
  }
);

module.exports = router;
