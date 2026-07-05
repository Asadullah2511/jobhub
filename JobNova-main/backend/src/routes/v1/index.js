const express = require('express');
const router = express.Router();

// Re-export all existing routes under /api/v1/
router.use('/auth', require('../auth'));
router.use('/jobs', require('../jobRoutes'));
router.use('/profile', require('../profileRoutes'));
router.use('/reviews', require('../reviewRoutes'));
router.use('/notifications', require('../notificationRoutes'));
router.use('/admin', require('../adminRoutes'));
router.use('/scholarships', require('../scholarshipRoutes'));
router.use('/complaints', require('../complaintRoutes'));
router.use('/chat', require('../chatRoutes'));
router.use('/contact', require('../contactRoutes'));
router.use('/international-jobs', require('../internationalJobRoutes'));
router.use('/time-exchange', require('../timeExchangeRoutes'));
router.use('/bookings', require('../bookingRoutes'));

module.exports = router;