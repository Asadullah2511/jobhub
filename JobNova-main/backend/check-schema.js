const { query } = require('./src/config/database');
require('dotenv').config();

async function checkSchema() {
  try {
    // Check chat_messages table structure
    const result = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'chat_messages'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 chat_messages table structure:');
    result.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    // Check all tables
    const tables = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('otp_verifications', 'chat_threads', 'chat_messages', 'review_audit')
      ORDER BY table_name
    `);

    console.log('\n📊 Phase 1 tables:');
    tables.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
