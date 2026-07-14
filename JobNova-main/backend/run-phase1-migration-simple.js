const { query } = require('./src/config/database');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('📊 Running Phase 1 schema migration...\n');

    // Create OTP table
    await query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(50) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT false,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ otp_verifications table created');

    await query(`CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at)`);

    // Add columns to users
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'en'`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role_selected BOOLEAN DEFAULT false`);
    console.log('✅ Users table updated');

    // Update applications table
    await query(`ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check`);
    await query(`
      ALTER TABLE applications ADD CONSTRAINT applications_status_check
      CHECK (status IN ('Pending', 'Shortlisted', 'Offered', 'In Progress', 'Completed', 'Rejected', 'Cancelled'))
    `);

    await query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS worker_accepted BOOLEAN DEFAULT NULL`);
    await query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS offered_at TIMESTAMP DEFAULT NULL`);
    await query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP DEFAULT NULL`);
    await query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP DEFAULT NULL`);
    console.log('✅ Applications table updated');

    // Create chat_threads table
    await query(`
      CREATE TABLE IF NOT EXISTS chat_threads (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
        employer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        worker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ chat_threads table created');

    await query(`CREATE INDEX IF NOT EXISTS idx_chat_threads_application ON chat_threads(application_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_threads_employer ON chat_threads(employer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_threads_worker ON chat_threads(worker_id)`);

    // Create chat_messages table
    await query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ chat_messages table created');

    await query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id, created_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id)`);

    // Create review_audit table
    await query(`
      CREATE TABLE IF NOT EXISTS review_audit (
        id SERIAL PRIMARY KEY,
        review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        prevented BOOLEAN DEFAULT true
      )
    `);
    console.log('✅ review_audit table created');

    // Add indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_applications_job_applicant ON applications(job_id, applicant_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    console.log('✅ Indexes created');

    console.log('\n✅ Phase 1 migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
