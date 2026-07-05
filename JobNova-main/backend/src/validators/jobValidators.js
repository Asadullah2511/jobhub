const { body, query, param } = require('express-validator');

const validateCreateJob = [
    body('title')
        .trim()
        .notEmpty().withMessage('Job title is required')
        .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),

    body('description')
        .trim()
        .notEmpty().withMessage('Job description is required')
        .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),

    body('type')
        .isIn(['blue', 'white']).withMessage('Type must be either "blue" or "white"'),

    body('location')
        .trim()
        .notEmpty().withMessage('Location is required'),

    body('salary_range')
        .optional()
        .trim(),

    body('hourly_rate')
        .optional()
        .trim(),

    body('duration')
        .optional()
        .trim(),

    body('skills')
        .optional()
        .trim(),

    body('experience_level')
        .optional()
        .isIn(['Entry', 'Mid', 'Senior', 'Expert', '']).withMessage('Invalid experience level'),

    body('availability')
        .optional()
        .trim(),

    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),

    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
];

const validateGetJobs = [
    query('type')
        .optional()
        .isIn(['blue', 'white']).withMessage('Type must be either "blue" or "white"'),

    query('search')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Search query too long'),

    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validateNearbyJobs = [
    query('lat')
        .notEmpty().withMessage('Latitude is required')
        .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),

    query('lng')
        .notEmpty().withMessage('Longitude is required')
        .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),

    query('radius')
        .optional()
        .isInt({ min: 1, max: 500 }).withMessage('Radius must be between 1 and 500 km'),

    query('search')
        .optional()
        .trim()
];

const validateApplyJob = [
    param('id')
        .isUUID().withMessage('Invalid job ID'),

    body('resume_url')
        .optional()
        .isURL().withMessage('Invalid resume URL'),

    body('cover_letter')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Cover letter too long (max 2000 characters)')
];

const validateUpdateApplicationStatus = [
    param('id')
        .isUUID().withMessage('Invalid application ID'),

    body('status')
        .isIn(['Pending', 'Shortlisted', 'Rejected', 'In Progress', 'Completed'])
        .withMessage('Invalid status')
];

const validateJobId = [
    param('id')
        .isUUID().withMessage('Invalid job ID')
];

module.exports = {
    validateCreateJob,
    validateGetJobs,
    validateNearbyJobs,
    validateApplyJob,
    validateUpdateApplicationStatus,
    validateJobId
};
