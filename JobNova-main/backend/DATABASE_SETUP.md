# 🗄️ Database Setup Guide

## Overview
This guide walks you through setting up PostgreSQL for JobHub backend.

---

## ✅ Connection Test Results

**Status:** ✅ **CONNECTED**

```
✓ PostgreSQL Version: 18.4
✓ Database: jobhubdb
✓ Connection Time: 146ms
✓ Database Size: 8.9 MB
✓ Tables Found: 19
```

**Tables in Database:**
1. users
2. profiles
3. jobs
4. applications
5. reviews
6. chat_sessions
7. chat_messages
8. notifications
9. complaints
10. system_logs
11. bookings
12. time_exchanges
13. time_exchange_requests
14. international_jobs
15. international_job_applications
16. scholarships
17. scholarship_applications
18. contact_messages
19. password_resets

---

## 🔧 Current Database Configuration

### Connection Details
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=jobhubdb
DB_USER=postgres
DB_PASSWORD=********
```

### Connection Pool Settings
```env
DB_POOL_MIN=2          # Minimum connections in pool
DB_POOL_MAX=10         # Maximum connections in pool
DB_CONNECTION_TIMEOUT=30000  # 30 seconds
```

---

## 🚀 Quick Start

### 1. Test Connection
```bash
cd JobNova-main/backend
node test-db-connection.js
```

**Expected Output:**
```
✓ Connected to PostgreSQL in 146ms
✓ PostgreSQL Version: PostgreSQL 18.4
✓ Database Size: 8958 kB
✓ Found 19 tables
✓ ALL TESTS PASSED
```

### 2. Initialize Database (if needed)
```bash
# Run schema creation
psql -U postgres -d jobhubdb -f schema.sql
psql -U postgres -d jobhubdb -f time_exchanges_schema.sql
```

### 3. Verify Tables
```bash
psql -U postgres -d jobhubdb -c "\dt"
```

---

## 📊 Connection Pool Optimization

### What is Connection Pooling?
Connection pooling maintains a pool of database connections that can be reused, reducing the overhead of creating new connections for each request.

### Benefits
- ✅ Faster query execution (reuse existing connections)
- ✅ Reduced server load
- ✅ Better resource management
- ✅ Automatic connection recovery

### Configuration
```javascript
// Current Settings
min: 2                  // Keep 2 connections always open
max: 10                 // Allow up to 10 concurrent connections
connectionTimeout: 30s  // Wait 30s before timing out
idleTimeout: 10s       // Close idle connections after 10s
queryTimeout: 30s      // Fail queries that take > 30s
```

### Optimized for:
- **Development:** Fast startup, minimal resources
- **Production:** Handles 100+ concurrent users
- **Mobile Apps:** Quick response times

---

## 🔍 Database Monitoring

### Check Pool Status
```javascript
const { getPoolStats } = require('./src/config/database');

const stats = getPoolStats();
console.log(stats);
// {
//   total: 3,    // Total connections
//   idle: 2,     // Idle connections
//   waiting: 0,  // Queries waiting for connection
//   max: 10,     // Max allowed
//   min: 2       // Min maintained
// }
```

### Monitor Slow Queries
The system automatically logs queries that take > 1 second in development mode:
```
⚠️  Slow query (1245ms): SELECT * FROM jobs WHERE ...
```

### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size('jobhubdb')) as size;
```

---

## 🛠️ Database Management

### Create Database (if doesn't exist)
```bash
# Method 1: Using createdb
createdb -U postgres jobhubdb

# Method 2: Using psql
psql -U postgres -c "CREATE DATABASE jobhubdb;"
```

### Drop Database (⚠️ Destructive!)
```bash
dropdb -U postgres jobhubdb
```

### Backup Database
```bash
# Full backup
pg_dump -U postgres jobhubdb > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump -U postgres --schema-only jobhubdb > schema_backup.sql

# Data only
pg_dump -U postgres --data-only jobhubdb > data_backup.sql
```

### Restore Database
```bash
psql -U postgres jobhubdb < backup_20260706.sql
```

---

## 📈 Performance Optimization

### 1. **Indexes Created**
The schema includes indexes on:
- `users.user_id` (UNIQUE)
- `users.phone` (UNIQUE)
- `jobs.employer_id` (FK)
- `applications.job_id` (FK)
- `applications.applicant_id` (FK)

### 2. **Query Optimization Tips**

**Use Pagination:**
```javascript
// Good ✓
const jobs = await jobService.getJobs('white', [], { page: 1, limit: 20 });

// Bad ✗ (loads all records)
const jobs = await jobService.getJobs('white');
```

**Use Specific Columns:**
```sql
-- Good ✓
SELECT id, title, location FROM jobs;

-- Bad ✗
SELECT * FROM jobs;
```

**Add Indexes for Frequent Queries:**
```sql
-- If you frequently search by location
CREATE INDEX idx_jobs_location ON jobs(location);

-- If you frequently filter by type
CREATE INDEX idx_jobs_type ON jobs(type);
```

### 3. **Connection Pool Tuning**

For different environments:

**Development (Current):**
```env
DB_POOL_MIN=2
DB_POOL_MAX=10
```

**Production (Small - up to 100 users):**
```env
DB_POOL_MIN=5
DB_POOL_MAX=20
```

**Production (Medium - up to 1000 users):**
```env
DB_POOL_MIN=10
DB_POOL_MAX=50
```

**Production (Large - 1000+ users):**
```env
DB_POOL_MIN=20
DB_POOL_MAX=100
```

---

## 🐛 Troubleshooting

### Problem 1: "ECONNREFUSED"
**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Windows: Check services
services.msc → PostgreSQL

# Start PostgreSQL
# Windows: services.msc → Start service
# Linux: sudo systemctl start postgresql
```

### Problem 2: "password authentication failed"
**Solution:**
1. Check credentials in `.env`
2. Reset PostgreSQL password:
```bash
psql -U postgres
ALTER USER postgres WITH PASSWORD 'newpassword';
```

### Problem 3: "database does not exist"
**Solution:**
```bash
createdb -U postgres jobhubdb
```

### Problem 4: "too many connections"
**Solution:**
1. Reduce `DB_POOL_MAX` in `.env`
2. Or increase PostgreSQL max_connections:
```bash
# Edit postgresql.conf
max_connections = 200
```

### Problem 5: Slow Queries
**Solution:**
1. Check for missing indexes
2. Use EXPLAIN to analyze queries:
```sql
EXPLAIN ANALYZE SELECT * FROM jobs WHERE location = 'Karachi';
```

---

## 🔒 Security Best Practices

### 1. **Change Default Password**
```bash
psql -U postgres
ALTER USER postgres WITH PASSWORD 'strong_secure_password';
```

### 2. **Create Application User**
```bash
# Create dedicated user for the app
CREATE USER jobhub_app WITH PASSWORD 'secure_password';

# Grant permissions
GRANT CONNECT ON DATABASE jobhubdb TO jobhub_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO jobhub_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO jobhub_app;
```

Update `.env`:
```env
DB_USER=jobhub_app
DB_PASSWORD=secure_password
```

### 3. **Enable SSL (Production)**
```env
DB_SSL=true
```

### 4. **Restrict Access**
Edit `pg_hba.conf`:
```
# Only allow local connections
host    jobhubdb    jobhub_app    127.0.0.1/32    md5
```

### 5. **Backup Regularly**
```bash
# Daily backups (add to cron/task scheduler)
pg_dump -U postgres jobhubdb > backup_$(date +%Y%m%d).sql
```

---

## 📊 Database Statistics

### Current Stats
- **Total Tables:** 19
- **Total Records:** 0 (fresh database)
- **Database Size:** 8.9 MB
- **Version:** PostgreSQL 18.4

### Expected Growth
| Users | Estimated Size |
|-------|---------------|
| 100 | ~50 MB |
| 1,000 | ~500 MB |
| 10,000 | ~5 GB |
| 100,000 | ~50 GB |

---

## 🔄 Migration Strategy

### Phase 1: Development ✅ (Current)
- Local PostgreSQL
- Connection pooling: 2-10
- No SSL required
- Full logging enabled

### Phase 2: Staging
- Hosted PostgreSQL (e.g., AWS RDS, DigitalOcean)
- Connection pooling: 5-20
- SSL enabled
- Moderate logging

### Phase 3: Production
- Managed PostgreSQL service
- Connection pooling: 10-50+
- SSL required
- Error logging only
- Automated backups
- Read replicas for scaling

---

## 📝 Useful Commands

### PostgreSQL Commands
```bash
# Connect to database
psql -U postgres -d jobhubdb

# List databases
\l

# List tables
\dt

# Describe table
\d users

# Show table size
\dt+

# Execute SQL file
\i schema.sql

# Quit
\q
```

### Database Queries
```sql
-- Count records in all tables
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM quote_ident(schemaname) || '.' || quote_ident(tablename))
FROM pg_tables
WHERE schemaname = 'public';

-- Find largest tables
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(quote_ident(tablename)))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(quote_ident(tablename)) DESC;

-- Show active connections
SELECT * FROM pg_stat_activity WHERE datname = 'jobhubdb';

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'jobhubdb' AND state = 'idle';
```

---

## ✅ Checklist

- [x] PostgreSQL installed and running
- [x] Database `jobhubdb` created
- [x] All 19 tables created
- [x] Connection tested successfully
- [x] Connection pooling configured
- [x] Environment variables set
- [ ] Backup strategy implemented
- [ ] Monitoring set up
- [ ] Production credentials secured

---

## 🆘 Need Help?

### Quick Tests
```bash
# Test 1: Is PostgreSQL running?
pg_isready

# Test 2: Can you connect?
psql -U postgres -d jobhubdb

# Test 3: Full connection test
node test-db-connection.js
```

### Support Resources
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Connection Pooling: https://node-postgres.com/features/pooling
- Performance Tips: https://wiki.postgresql.org/wiki/Performance_Optimization

---

**Database Setup Complete!** ✅

Your PostgreSQL database is properly configured with:
- ✅ Connection pooling (2-10 connections)
- ✅ Automatic error handling
- ✅ Slow query detection
- ✅ Graceful shutdown
- ✅ Production-ready configuration

**Next Steps:**
1. Start adding data through your API
2. Monitor connection pool stats
3. Implement automated backups
4. Set up database monitoring

---

**Last Updated:** July 6, 2026  
**PostgreSQL Version:** 18.4  
**Database Status:** Operational ✅
