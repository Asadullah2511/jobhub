const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateUser, requireRoles } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
    validateCreateJob,
    validateGetJobs,
    validateNearbyJobs,
    validateApplyJob,
    validateUpdateApplicationStatus,
    validateJobId
} = require('../validators/jobValidators');

// Public routes
router.get('/public', validate(validateGetJobs), jobController.getJobs);

// Protected routes
router.get('/', authenticateUser, validate(validateGetJobs), jobController.getJobs);
router.get('/match', authenticateUser, validate(validateGetJobs), jobController.getMatchedJobs);
router.get('/nearby', authenticateUser, validate(validateNearbyJobs), jobController.getNearbyJobs);

// Employer routes
router.post(
    '/',
    authenticateUser,
    requireRoles('employer', 'admin'),
    validate(validateCreateJob),
    jobController.createJob
);
router.delete('/:id', authenticateUser, validate(validateJobId), jobController.deleteJob);
router.get('/my-jobs', authenticateUser, requireRoles('employer', 'admin'), jobController.getMyJobs);
router.get('/:id/applications', authenticateUser, validate(validateJobId), jobController.getJobApplications);

// Job seeker routes
router.post('/:id/apply', authenticateUser, validate(validateApplyJob), jobController.applyForJob);
router.get('/applications/my-applications', authenticateUser, jobController.getWorkerApplications);

// Application management
router.put(
    '/applications/:id/status',
    authenticateUser,
    validate(validateUpdateApplicationStatus),
    jobController.updateApplicationStatus
);

module.exports = router;
