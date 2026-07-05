const { body, param } = require('express-validator');

const validateUpdateProfile = [
    body('full_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),

    body('bio')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),

    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Location too long'),

    body('trade')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Trade name too long'),

    body('hourly_rate')
        .optional()
        .trim(),

    body('availability')
        .optional()
        .trim(),

    body('radius')
        .optional()
        .isInt({ min: 1, max: 500 }).withMessage('Radius must be between 1 and 500 km'),

    body('skills')
        .optional()
        .trim(),

    body('experience')
        .optional()
        .trim(),

    body('education')
        .optional()
        .trim(),

    body('company_name')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Company name too long'),

    body('industry')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Industry name too long'),

    body('website')
        .optional()
        .trim()
        .isURL().withMessage('Invalid website URL')
];

const validateUserId = [
    param('userId')
        .isUUID().withMessage('Invalid user ID')
];

module.exports = {
    validateUpdateProfile,
    validateUserId
};
