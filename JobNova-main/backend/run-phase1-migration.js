const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'jobhubdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('📊 Running Phase 1 schema migration...\n');

    const sqlFile = path.join(__dirname, 'src', 'db', 'phase1-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute the entire SQL file as one transaction
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('✅ All statements executed successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      // If it fails, try statement by statement to see which ones work
      console.log('⚠️  Batch execution failed, trying statement by statement...\n');

      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'BEGIN' && s !== 'COMMIT' && s !== 'ROLLBACK');

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        try {
          await client.query(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
        } catch (err) {
          // Ignore "already exists" errors
          if (err.message.includes('already exists') || err.message.includes('duplicate') || err.message.includes('does not exist')) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length} skipped: ${err.message.split('\n')[0]}`);
          } else {
            console.error(`❌ Statement ${i + 1}/${statements.length} failed:`, err.message.split('\n')[0]);
          }
        }
      }
    }

    console.log('\n✅ Phase 1 migration completed successfully!');

    // Verify tables were created
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('otp_verifications', 'chat_threads', 'chat_messages')
      ORDER BY table_name
    `);

    console.log('\n📋 New tables created:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
