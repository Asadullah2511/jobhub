const express = require('express');
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware
router.use(authenticateUser);

/**
 * @route   POST /api/reviews
 * @desc    Submit rating after job completion (IMMUTABLE)
 * @access  Private
 */
router.post('/',
  [
    body('job_id').isInt().withMessage('Valid job_id is required'),
    body('reviewee_id').isInt().withMessage('Valid reviewee_id is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment too long (max 1000 chars)')
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

      const { job_id, reviewee_id, rating, comment } = req.body;
      const reviewer_id = req.user.id;

      // Cannot review yourself
      if (reviewer_id === reviewee_id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot review yourself'
        });
      }

      // Check if application exists and is Completed
      const appResult = await query(
        `SELECT a.*, j.employer_id
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE a.job_id = $1
         AND (a.applicant_id = $2 OR j.employer_id = $2)
         AND a.status = $3`,
        [job_id, reviewer_id, 'Completed']
      );

      if (appResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Can only review after job is Completed and you are part of the application'
        });
      }

      const application = appResult.rows[0];

      // Verify reviewee is the other party
      const isEmployerReviewing = application.employer_id === reviewer_id;
      const expectedReviewee = isEmployerReviewing ? application.applicant_id : application.employer_id;

      if (reviewee_id !== expectedReviewee) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reviewee for this job'
        });
      }

      // Check if already reviewed (immutability enforcement)
      const existingReview = await query(
        'SELECT id FROM reviews WHERE job_id = $1 AND reviewer_id = $2',
        [job_id, reviewer_id]
      );

      if (existingReview.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this job. Reviews are immutable.'
        });
      }

      // Create review
      const result = await query(
        `INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [job_id, reviewer_id, reviewee_id, rating, comment || null]
      );

      const review = result.rows[0];

      // Recalculate avg_rating for reviewee
      const ratingStats = await query(
        `SELECT
          COUNT(*) as total_reviews,
          AVG(rating) as avg_rating
         FROM reviews
         WHERE reviewee_id = $1`,
        [reviewee_id]
      );

      const stats = ratingStats.rows[0];

      // Update user's profile
      await query(
        `UPDATE profiles
         SET avg_rating = $1, total_reviews = $2, updated_at = NOW()
         WHERE user_id = $3`,
        [parseFloat(stats.avg_rating).toFixed(1), parseInt(stats.total_reviews), reviewee_id]
      );

      // If profile doesn't exist, create it
      const profileCheck = await query(
        'SELECT id FROM profiles WHERE user_id = $1',
        [reviewee_id]
      );

      if (profileCheck.rows.length === 0) {
        await query(
          `INSERT INTO profiles (user_id, avg_rating, total_reviews)
           VALUES ($1, $2, $3)`,
          [reviewee_id, parseFloat(stats.avg_rating).toFixed(1), parseInt(stats.total_reviews)]
        );
      }

      console.log(`✅ Review created: ${review.id} (${rating}/5 for user ${reviewee_id})`);

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: {
          review: {
            id: review.id,
            job_id: review.job_id,
            reviewer_id: review.reviewer_id,
            reviewee_id: review.reviewee_id,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at
          },
          reviewee_stats: {
            avg_rating: parseFloat(stats.avg_rating).toFixed(1),
            total_reviews: parseInt(stats.total_reviews)
          }
        }
      });

    } catch (error) {
      console.error('❌ Create review error:', error);

      // Check for duplicate key violation
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this job. Reviews are immutable.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to submit review'
      });
    }
  }
);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get reviews for a user
 * @access  Public
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT
        r.*,
        u.user_id as reviewer_user_id,
        u.first_name as reviewer_first_name,
        u.last_name as reviewer_last_name,
        j.title as job_title
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       LEFT JOIN jobs j ON r.job_id = j.id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    // Get avg rating
    const stats = await query(
      `SELECT
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating
       FROM reviews
       WHERE reviewee_id = $1`,
      [userId]
    );

    const reviewStats = stats.rows[0];

    res.json({
      success: true,
      data: {
        reviews: result.rows,
        stats: {
          avg_rating: reviewStats.avg_rating ? parseFloat(reviewStats.avg_rating).toFixed(1) : '0.0',
          total_reviews: parseInt(reviewStats.total_reviews) || 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

/**
 * @route   PUT /api/reviews/:id
 * @desc    Attempt to update review (BLOCKED - immutable)
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  // Log attempt
  await query(
    `INSERT INTO review_audit (review_id, action, prevented)
     VALUES ($1, $2, true)`,
    [req.params.id, 'UPDATE_ATTEMPT']
  ).catch(() => {
    /* Ignore if review doesn't exist */
  });

  res.status(403).json({
    success: false,
    message: 'Reviews are immutable and cannot be updated'
  });
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Attempt to delete review (BLOCKED - immutable)
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  // Log attempt
  await query(
    `INSERT INTO review_audit (review_id, action, prevented)
     VALUES ($1, $2, true)`,
    [req.params.id, 'DELETE_ATTEMPT']
  ).catch(() => {
    /* Ignore if review doesn't exist */
  });

  res.status(403).json({
    success: false,
    message: 'Reviews are immutable and cannot be deleted'
  });
});

module.exports = router;
