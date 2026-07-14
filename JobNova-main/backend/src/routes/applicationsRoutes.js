const express = require('express');
const { query } = require('../config/database');
const { body, param, validationResult } = require('express-validator');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateUser);

/**
 * @route   POST /api/applications
 * @desc    One-click apply to a job
 * @access  Private (Workers only)
 */
router.post('/',
  [
    body('job_id').isInt().withMessage('Valid job_id is required')
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

      const { job_id } = req.body;
      const applicant_id = req.user.id;

      // Check if user is a worker
      if (!['blue_collar', 'white_collar'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only workers can apply to jobs'
        });
      }

      // Check if job exists and is active
      const jobResult = await query(
        'SELECT * FROM jobs WHERE id = $1 AND status = $2',
        [job_id, 'Active']
      );

      if (jobResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or no longer active'
        });
      }

      const job = jobResult.rows[0];

      // Prevent applying to own job (if employer accidentally uses worker account)
      if (job.employer_id === applicant_id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot apply to your own job'
        });
      }

      // Check if already applied
      const existingApp = await query(
        'SELECT id FROM applications WHERE job_id = $1 AND applicant_id = $2',
        [job_id, applicant_id]
      );

      if (existingApp.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this job'
        });
      }

      // Create application
      const result = await query(
        `INSERT INTO applications (job_id, applicant_id, status)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [job_id, applicant_id, 'Pending']
      );

      const application = result.rows[0];

      // Create chat thread for this application
      await query(
        `INSERT INTO chat_threads (application_id, employer_id, worker_id)
         VALUES ($1, $2, $3)`,
        [application.id, job.employer_id, applicant_id]
      );

      console.log(`✅ Application created: ${application.id} (Job: ${job_id}, Worker: ${applicant_id})`);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          application: {
            id: application.id,
            job_id: application.job_id,
            applicant_id: application.applicant_id,
            status: application.status,
            created_at: application.created_at
          }
        }
      });

    } catch (error) {
      console.error('❌ Create application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application'
      });
    }
  }
);

/**
 * @route   GET /api/applications
 * @desc    Get applications (filtered by role)
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let queryText;
    let queryParams;

    if (userRole === 'employer') {
      // Get applications for employer's jobs
      queryText = `
        SELECT
          a.*,
          u.user_id as applicant_user_id,
          u.first_name,
          u.last_name,
          u.phone,
          u.email,
          j.title as job_title,
          j.type as job_type
        FROM applications a
        JOIN users u ON a.applicant_id = u.id
        JOIN jobs j ON a.job_id = j.id
        WHERE j.employer_id = $1
        ${status ? 'AND a.status = $2' : ''}
        ORDER BY a.created_at DESC
      `;
      queryParams = status ? [userId, status] : [userId];

    } else if (['blue_collar', 'white_collar'].includes(userRole)) {
      // Get worker's applications
      queryText = `
        SELECT
          a.*,
          j.title as job_title,
          j.type as job_type,
          j.location,
          j.salary,
          e.user_id as employer_user_id,
          e.first_name as employer_first_name,
          e.last_name as employer_last_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users e ON j.employer_id = e.id
        WHERE a.applicant_id = $1
        ${status ? 'AND a.status = $2' : ''}
        ORDER BY a.created_at DESC
      `;
      queryParams = status ? [userId, status] : [userId];

    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const result = await query(queryText, queryParams);

    res.json({
      success: true,
      data: {
        applications: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('❌ Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

/**
 * @route   GET /api/applications/:id
 * @desc    Get single application details
 * @access  Private
 */
router.get('/:id',
  [
    param('id').isInt().withMessage('Valid application ID is required')
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

      const { id } = req.params;
      const userId = req.user.id;

      const result = await query(
        `SELECT
          a.*,
          j.title as job_title,
          j.description as job_description,
          j.type as job_type,
          j.location,
          j.salary,
          j.skills,
          w.user_id as worker_user_id,
          w.first_name as worker_first_name,
          w.last_name as worker_last_name,
          w.phone as worker_phone,
          w.email as worker_email,
          e.user_id as employer_user_id,
          e.first_name as employer_first_name,
          e.last_name as employer_last_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN users w ON a.applicant_id = w.id
        JOIN users e ON j.employer_id = e.id
        WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      const application = result.rows[0];

      // Authorization check
      if (application.applicant_id !== userId && application.employer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: { application }
      });

    } catch (error) {
      console.error('❌ Get application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch application'
      });
    }
  }
);

/**
 * @route   PUT /api/applications/:id/status
 * @desc    Update application status (state machine)
 * @access  Private
 */
router.put('/:id/status',
  [
    param('id').isInt().withMessage('Valid application ID is required'),
    body('status').isIn(['Pending', 'Shortlisted', 'Offered', 'In Progress', 'Completed', 'Rejected', 'Cancelled'])
      .withMessage('Invalid status'),
    body('action').optional().isIn(['accept', 'reject']).withMessage('Invalid action')
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

      const { id } = req.params;
      const { status, action } = req.body;
      const userId = req.user.id;

      // Get current application state
      const appResult = await query(
        `SELECT a.*, j.employer_id
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE a.id = $1`,
        [id]
      );

      if (appResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      const application = appResult.rows[0];
      const currentStatus = application.status;

      // Authorization and state transition logic
      const isEmployer = application.employer_id === userId;
      const isWorker = application.applicant_id === userId;

      if (!isEmployer && !isWorker) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // State machine transitions
      // Employer can: Pending → Shortlisted, Shortlisted → Offered, Shortlisted → Rejected
      // Worker can: Offered → In Progress (accept), Offered → Cancelled (reject)
      // System/Employer can: In Progress → Completed

      if (status === 'Shortlisted') {
        if (!isEmployer || currentStatus !== 'Pending') {
          return res.status(400).json({
            success: false,
            message: 'Can only shortlist Pending applications (Employer only)'
          });
        }
      }

      else if (status === 'Offered') {
        if (!isEmployer || currentStatus !== 'Shortlisted') {
          return res.status(400).json({
            success: false,
            message: 'Can only offer to Shortlisted applications (Employer only)'
          });
        }

        // Mark offered_at timestamp
        await query(
          'UPDATE applications SET offered_at = NOW() WHERE id = $1',
          [id]
        );
      }

      else if (status === 'In Progress') {
        // Worker must explicitly accept the offer
        if (!isWorker || currentStatus !== 'Offered') {
          return res.status(400).json({
            success: false,
            message: 'Can only accept Offered applications (Worker only)'
          });
        }

        if (action !== 'accept') {
          return res.status(400).json({
            success: false,
            message: 'Must explicitly accept offer (action=accept required)'
          });
        }

        // Mark worker_accepted and accepted_at
        await query(
          `UPDATE applications
           SET worker_accepted = true, accepted_at = NOW()
           WHERE id = $1`,
          [id]
        );
      }

      else if (status === 'Completed') {
        if (!isEmployer || currentStatus !== 'In Progress') {
          return res.status(400).json({
            success: false,
            message: 'Can only complete In Progress applications (Employer only)'
          });
        }

        // Mark completed_at
        await query(
          'UPDATE applications SET completed_at = NOW() WHERE id = $1',
          [id]
        );
      }

      else if (status === 'Rejected') {
        if (!isEmployer) {
          return res.status(403).json({
            success: false,
            message: 'Only employers can reject applications'
          });
        }
      }

      else if (status === 'Cancelled') {
        // Worker can cancel Offered applications
        if (!isWorker || currentStatus !== 'Offered') {
          return res.status(400).json({
            success: false,
            message: 'Can only cancel Offered applications (Worker only)'
          });
        }
      }

      // Update status
      const result = await query(
        'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );

      const updatedApp = result.rows[0];

      console.log(`✅ Application ${id} status updated: ${currentStatus} → ${status}`);

      res.json({
        success: true,
        message: 'Application status updated successfully',
        data: {
          application: updatedApp,
          previousStatus: currentStatus,
          newStatus: status
        }
      });

    } catch (error) {
      console.error('❌ Update application status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application status'
      });
    }
  }
);

module.exports = router;
