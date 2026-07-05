const { body } = require('express-validator');

const validateRegistration = [
    body('user_id').trim().notEmpty().withMessage('User ID is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['blue_collar', 'white_collar', 'employer', 'admin']).withMessage('Invalid role'),
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required')
];

const validateLogin = [
    body('identifier').trim().notEmpty().withMessage('User ID or phone is required'),
    body('password').notEmpty().withMessage('Password is required')
];

const validateForgotPassword = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
];

const validateResetPassword = [
    body('token').trim().notEmpty().withMessage('Reset token is required'),
    body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

module.exports = { validateRegistration, validateLogin, validateForgotPassword, validateResetPassword };