require('dotenv').config();

const { Pool } = require('pg');

// Database configuration with connection pooling
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'jobhubdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',

  // Connection Pool Settings
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  max: parseInt(process.env.DB_POOL_MAX || '10'),

  // Connection timeout (30 seconds)
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),

  // Idle timeout (10 seconds)
  idleTimeoutMillis: 10000,

  // Query timeout (30 seconds)
  query_timeout: 30000,

  // Statement timeout
  statement_timeout: 30000,

  // Enable keepalive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  console.error('Client:', client ? 'Active' : 'Unknown');
});

// Handle client connection
pool.on('connect', (client) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  if (isDevelopment) {
    console.log('🔌 New PostgreSQL client connected');
  }
});

// Handle client removal
pool.on('remove', (client) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  if (isDevelopment) {
    console.log('🔌 PostgreSQL client removed from pool');
  }
});

// Query wrapper with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries in development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment && duration > 1000) {
      console.warn(`⚠️  Slow query (${duration}ms):`, text.substring(0, 100));
    }

    return result;
  } catch (error) {
    console.error('❌ Database query error:', {
      error: error.message,
      query: text.substring(0, 100),
      params
    });
    throw error;
  }
};

// Get a client from the pool
const getClient = async () => {
  try {
    const client = await pool.connect();

    // Wrap the release method to add logging
    const originalRelease = client.release.bind(client);
    client.release = () => {
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment) {
        console.log('🔓 PostgreSQL client released');
      }
      originalRelease();
    };

    return client;
  } catch (error) {
    console.error('❌ Error getting database client:', error.message);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const startTime = Date.now();
    const result = await query('SELECT NOW() as current_time, version() as version');
    const duration = Date.now() - startTime;

    console.log('✅ PostgreSQL connection successful!');
    console.log(`   Connected in ${duration}ms`);
    console.log(`   Server time: ${result.rows[0].current_time}`);
    console.log(`   Version: ${result.rows[0].version.split(',')[0]}`);

    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    console.error('   Host:', process.env.DB_HOST || 'localhost');
    console.error('   Port:', process.env.DB_PORT || '5432');
    console.error('   Database:', process.env.DB_NAME || 'jobhubdb');
    console.error('   User:', process.env.DB_USER || 'postgres');
    return false;
  }
};

// Get pool statistics
const getPoolStats = () => {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    max: poolConfig.max,
    min: poolConfig.min
  };
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ PostgreSQL connection pool closed');
  } catch (error) {
    console.error('❌ Error closing PostgreSQL pool:', error.message);
    throw error;
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Received SIGINT, closing database connections...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Received SIGTERM, closing database connections...');
  await closePool();
  process.exit(0);
});

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  getPoolStats,
  closePool
};
