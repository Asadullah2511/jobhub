#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests PostgreSQL connection with current .env configuration
 */

require('dotenv').config();
const { Pool } = require('pg');

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

async function testDatabaseConnection() {
    log.header('='.repeat(60));
    log.header('DATABASE CONNECTION TEST');
    log.header('='.repeat(60));

    // Display configuration
    log.header('\n📋 Configuration:');
    log.info(`Host: ${process.env.DB_HOST || 'localhost'}`);
    log.info(`Port: ${process.env.DB_PORT || '5432'}`);
    log.info(`Database: ${process.env.DB_NAME || 'jobhubdb'}`);
    log.info(`User: ${process.env.DB_USER || 'postgres'}`);
    log.info(`Password: ${'*'.repeat((process.env.DB_PASSWORD || '').length)}`);

    // Create connection pool
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'jobhubdb',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 1,
        connectionTimeoutMillis: 5000,
    });

    try {
        log.header('\n🔌 Testing Connection...');

        // Test 1: Basic Connection
        const startTime = Date.now();
        const client = await pool.connect();
        const connectionTime = Date.now() - startTime;
        log.success(`Connected to PostgreSQL in ${connectionTime}ms`);

        // Test 2: Query Execution
        log.header('\n📊 Running Test Queries...');

        // Get PostgreSQL version
        const versionResult = await client.query('SELECT version()');
        const version = versionResult.rows[0].version;
        log.success(`PostgreSQL Version: ${version.split(',')[0]}`);

        // Get current timestamp
        const timeResult = await client.query('SELECT NOW() as current_time');
        log.success(`Server Time: ${timeResult.rows[0].current_time}`);

        // Check database size
        const sizeResult = await client.query(`
            SELECT pg_size_pretty(pg_database_size($1)) as size
        `, [process.env.DB_NAME || 'jobhubdb']);
        log.success(`Database Size: ${sizeResult.rows[0].size}`);

        // Test 3: Check Tables
        log.header('\n📑 Checking Tables...');
        const tablesResult = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        if (tablesResult.rows.length === 0) {
            log.warn('No tables found in database');
            log.info('Run schema.sql to create tables');
        } else {
            log.success(`Found ${tablesResult.rows.length} tables:`);
            tablesResult.rows.forEach((row, index) => {
                console.log(`   ${index + 1}. ${row.table_name}`);
            });
        }

        // Test 4: Check Users Table
        log.header('\n👥 Checking Users Table...');
        try {
            const userCountResult = await client.query('SELECT COUNT(*) FROM users');
            const userCount = userCountResult.rows[0].count;
            log.success(`Users table exists with ${userCount} records`);
        } catch (err) {
            log.warn('Users table does not exist or is not accessible');
        }

        // Test 5: Check Jobs Table
        log.header('\n💼 Checking Jobs Table...');
        try {
            const jobCountResult = await client.query('SELECT COUNT(*) FROM jobs');
            const jobCount = jobCountResult.rows[0].count;
            log.success(`Jobs table exists with ${jobCount} records`);
        } catch (err) {
            log.warn('Jobs table does not exist or is not accessible');
        }

        // Test 6: Connection Pool Info
        log.header('\n🏊 Connection Pool Status:');
        log.info(`Total Connections: ${pool.totalCount}`);
        log.info(`Idle Connections: ${pool.idleCount}`);
        log.info(`Waiting Requests: ${pool.waitingCount}`);

        // Release client
        client.release();

        // Success summary
        log.header('\n' + '='.repeat(60));
        log.success('✓ ALL TESTS PASSED');
        log.success('Database connection is working correctly!');
        log.header('='.repeat(60) + '\n');

        await pool.end();
        process.exit(0);

    } catch (error) {
        log.header('\n' + '='.repeat(60));
        log.error('✗ CONNECTION FAILED');
        log.header('='.repeat(60));

        console.error('\n❌ Error Details:');
        console.error(`   Message: ${error.message}`);

        if (error.code) {
            console.error(`   Code: ${error.code}`);
        }

        // Provide helpful suggestions
        log.header('\n💡 Troubleshooting Tips:');

        if (error.code === 'ECONNREFUSED') {
            log.warn('1. Check if PostgreSQL is running');
            log.info('   Windows: services.msc → PostgreSQL service');
            log.info('   Or run: pg_isready');
            log.warn('2. Verify the port (default: 5432)');
            log.warn('3. Check firewall settings');
        } else if (error.code === '28P01') {
            log.warn('1. Check DB_USER and DB_PASSWORD in .env');
            log.warn('2. Verify PostgreSQL user credentials');
            log.info('   Try: psql -U postgres -d jobhubdb');
        } else if (error.code === '3D000') {
            log.warn('1. Database does not exist');
            log.info('   Create it: createdb jobhubdb');
            log.info('   Or: psql -U postgres -c "CREATE DATABASE jobhubdb;"');
        } else if (error.code === 'ETIMEDOUT') {
            log.warn('1. Check network connection');
            log.warn('2. Verify DB_HOST and DB_PORT in .env');
            log.warn('3. Check if PostgreSQL allows remote connections');
        } else {
            log.warn('1. Verify all database credentials in .env');
            log.warn('2. Check PostgreSQL logs for more details');
            log.warn('3. Ensure PostgreSQL is accepting connections');
        }

        log.header('\n📝 Current .env Configuration:');
        log.info(`DB_HOST=${process.env.DB_HOST || 'localhost'}`);
        log.info(`DB_PORT=${process.env.DB_PORT || '5432'}`);
        log.info(`DB_NAME=${process.env.DB_NAME || 'jobhubdb'}`);
        log.info(`DB_USER=${process.env.DB_USER || 'postgres'}`);

        console.log('');
        await pool.end();
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
    log.error('Unhandled error:');
    console.error(error);
    process.exit(1);
});

// Run the test
testDatabaseConnection();
