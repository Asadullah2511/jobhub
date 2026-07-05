require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { pool, testConnection } = require('../config/database');
const fs = require('fs');
const path = require('path');

const runSchema = async () => {
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot initialize database - connection failed');
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, '..', 'config', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(schema);
    console.log('✅ Database schema created successfully!');
  } catch (error) {
    console.error('❌ Schema creation failed:', error.message);
    process.exit(1);
  }

  await pool.end();
};

runSchema();
