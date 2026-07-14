const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser: authMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
    validateRegistration,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
} = require('../validators/authValidators');

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, password, role, first_name, last_name]
 *             properties:
 *               user_id:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [blue_collar, white_collar, employer, admin]
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 */
// Public Routes
router.post('/register', validate(validateRegistration), authController.register);
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with user_id or phone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(validateLogin), authController.login);
/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset link sent (if account exists)
 */
router.post('/forgot-password', validate(validateForgotPassword), authController.forgotPassword);
/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, new_password]
 *             properties:
 *               token:
 *                 type: string
 *               new_password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', validate(validateResetPassword), authController.resetPassword);

// Protected Routes
router.get('/profile', authMiddleware, authController.getProfile); // Kept for AuthContext compatibility

// ========================================
// PHASE 1: Mobile App OTP & Role Selection
// ========================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { sendOTP, verifyOTP } = require('../services/otpService');
const { body, validationResult } = require('express-validator');

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
      const result = await sendOTP(phone);

      const response = {
        success: true,
        message: 'OTP sent successfully',
        expiresIn: '10 minutes'
      };

      if (result.otp) {
        response.otp = result.otp; // Only in dev mode
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
           VALUES ($1, $2, $3, false, true)
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
        process.env.JWT_SECRET,
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
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      if (user.is_suspended) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended'
        });
      }

      const token = jwt.sign(
        {
          userId: user.user_id,
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET,
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

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      const result = await query(
        `INSERT INTO users (user_id, email, password_hash, first_name, last_name, role, is_profile_completed, role_selected)
         VALUES ($1, $2, $3, $4, $5, $6, false, true)
         RETURNING *`,
        [userId, email.toLowerCase(), passwordHash, first_name, last_name, role]
      );

      const user = result.rows[0];

      const token = jwt.sign(
        {
          userId: user.user_id,
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET,
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
  authMiddleware, // This is already imported as { authenticateUser: authMiddleware }
  [
    body('role').isIn(['blue_collar', 'white_collar', 'employer']).withMessage('Invalid role')
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

      const { role } = req.body;
      const userId = req.user.id;

      const result = await query(
        `UPDATE users
         SET role = $1, role_selected = true
         WHERE id = $2
         RETURNING *`,
        [role, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result.rows[0];

      const newToken = jwt.sign(
        {
          userId: user.user_id,
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET,
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
      console.error('❌ Select role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role'
      });
    }
  }
);

module.exports = router;
