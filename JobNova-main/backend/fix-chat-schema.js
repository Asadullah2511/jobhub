const { query } = require('./src/config/database');
require('dotenv').config();

async function fixSchema() {
  try {
    console.log('🔧 Fixing chat schema...\n');

    // Drop existing chat tables (they're empty and have wrong structure)
    await query(`DROP TABLE IF EXISTS chat_messages CASCADE`);
    console.log('✅ Dropped old chat_messages');

    await query(`DROP TABLE IF EXISTS chat_threads CASCADE`);
    console.log('✅ Dropped old chat_threads');

    // Recreate with correct structure
    await query(`
      CREATE TABLE chat_threads (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
        employer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        worker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created chat_threads');

    await query(`
      CREATE TABLE chat_messages (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created chat_messages');

    // Create indexes
    await query(`CREATE INDEX idx_chat_threads_application ON chat_threads(application_id)`);
    await query(`CREATE INDEX idx_chat_threads_employer ON chat_threads(employer_id)`);
    await query(`CREATE INDEX idx_chat_threads_worker ON chat_threads(worker_id)`);
    await query(`CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_id, created_at)`);
    await query(`CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id)`);
    console.log('✅ Created indexes');

    console.log('\n✅ Chat schema fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixSchema();
