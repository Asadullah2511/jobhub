-- ========================================
-- PHASE 1: FOUNDATIONAL LAYER SCHEMA
-- JobHub Mobile App - React Native + Expo
-- ========================================

-- OTP Verifications Table (for phone-based auth)
CREATE TABLE IF NOT EXISTS otp_verifications (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(50) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- Add language preference to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'en' CHECK (language_preference IN ('en', 'ur'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_selected BOOLEAN DEFAULT false;

-- Update applications table status enum to match state machine
-- Status flow: Pending → Shortlisted → Offered → In Progress → Completed
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('Pending', 'Shortlisted', 'Offered', 'In Progress', 'Completed', 'Rejected', 'Cancelled'));

-- Add worker acceptance tracking
ALTER TABLE applications ADD COLUMN IF NOT EXISTS worker_accepted BOOLEAN DEFAULT NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS offered_at TIMESTAMP DEFAULT NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP DEFAULT NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP DEFAULT NULL;

-- Chat Threads Table (one thread per application)
CREATE TABLE IF NOT EXISTS chat_threads (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  employer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  worker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_threads_application ON chat_threads(application_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_employer ON chat_threads(employer_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_worker ON chat_threads(worker_id);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);

-- Make reviews immutable (add constraint to prevent updates)
CREATE TABLE IF NOT EXISTS review_audit (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  prevented BOOLEAN DEFAULT true
);

-- Add constraint to ensure one review per job per reviewer
ALTER TABLE reviews ADD CONSTRAINT IF NOT EXISTS reviews_unique_per_job
  UNIQUE(job_id, reviewer_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_applicant ON applications(job_id, applicant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Seed some test jobs for testing the pipeline
INSERT INTO jobs (employer_id, title, description, type, status, location, skills, experience_level, salary, created_at)
SELECT
  (SELECT id FROM users WHERE role = 'employer' LIMIT 1),
  'Test Job - ' || generate_series,
  'This is a test job for Phase 1 pipeline testing',
  CASE WHEN generate_series % 2 = 0 THEN 'blue' ELSE 'white' END,
  'Active',
  'Test City',
  'Testing, Development',
  'Entry',
  '$50-70/hour',
  CURRENT_TIMESTAMP
FROM generate_series(1, 3)
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title LIKE 'Test Job -%')
LIMIT 3;

COMMENT ON TABLE otp_verifications IS 'Stores OTP codes for phone-based authentication (Blue Collar workers)';
COMMENT ON TABLE chat_threads IS 'One chat thread per job application for employer-worker communication';
COMMENT ON TABLE chat_messages IS 'Messages within chat threads, polled via HTTP (no WebSocket)';
COMMENT ON COLUMN applications.worker_accepted IS 'TRUE when worker accepts Offered status, NULL otherwise';
