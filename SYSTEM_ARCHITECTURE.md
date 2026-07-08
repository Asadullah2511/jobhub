# 🏗️ JOBHUB SYSTEM ARCHITECTURE

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐         ┌──────────────────────┐       │
│  │   Web Frontend      │         │   Mobile App         │       │
│  │   (React 18)        │         │   (React Native)     │       │
│  │                     │         │   (Expo SDK 54)      │       │
│  │  localhost:3000     │         │   Expo Go            │       │
│  └──────────┬──────────┘         └──────────┬───────────┘       │
│             │                               │                    │
│             │  Axios HTTP + JWT             │  Axios + Secure    │
│             │                               │  Store             │
└─────────────┼───────────────────────────────┼────────────────────┘
              │                               │
              ▼                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                    Express.js Backend                             │
│                    localhost:5000/api                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Middleware Stack:                                      │     │
│  │  • Helmet (Security Headers)                            │     │
│  │  • CORS (Cross-Origin)                                  │     │
│  │  • Morgan (Logging)                                     │     │
│  │  • Rate Limiter (100 req/15min)                         │     │
│  │  • JWT Verification                                     │     │
│  │  • Error Handler                                        │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Routes:                                                │     │
│  │  /api/auth       - Login, Register, Profile            │     │
│  │  /api/jobs       - CRUD jobs, Apply                     │     │
│  │  /api/profile    - User profiles, CV upload            │     │
│  │  /api/applications - Track applications               │     │
│  │  /api/reviews    - Ratings & reviews                    │     │
│  │  /api/chat       - Real-time messaging                  │     │
│  │  /api/notifications - Push notifications               │     │
│  │  /api/admin      - Admin dashboard                      │     │
│  │  /api/bookings   - Task bookings                        │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└─────────────┬─────────────────────────────────────────────────────┘
              │
              │ pg (node-postgres)
              │ Connection Pool (2-10)
              ▼
┌──────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                    PostgreSQL 16                                  │
│                    localhost:5432/jobhubdb                        │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Core Tables:                                           │     │
│  │  • users           (auth, roles)                        │     │
│  │  • profiles        (user info by role)                  │     │
│  │  • jobs            (job postings)                       │     │
│  │  • applications    (job applications)                   │     │
│  │  • reviews         (ratings 1-5)                        │     │
│  │  • notifications   (in-app alerts)                      │     │
│  │  • chat_sessions   (1-to-1 messaging)                   │     │
│  │  • chat_messages   (message history)                    │     │
│  │  • bookings        (blue-collar tasks)                  │     │
│  │  • time_exchanges  (skill trading)                      │     │
│  │  • complaints      (dispute resolution)                 │     │
│  │  • scholarships    (education funding)                  │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Login Example

```
┌──────────────┐
│   Browser    │
│              │
│  Username:   │
│  white_demo  │
│  Password:   │
│  White123!   │
└──────┬───────┘
       │
       │ POST /api/auth/login
       │ { identifier, password }
       ▼
┌──────────────────────────────────────┐
│  Express Backend                      │
│                                       │
│  1. authController.login()            │
│     ├─ Validate input                 │
│     └─ Call authService.loginUser()   │
│                                       │
│  2. authService.loginUser()           │
│     ├─ Query users table              │
│     ├─ Find by phone OR user_id       │
│     ├─ bcrypt.compare(password)       │
│     ├─ Check suspended status         │
│     └─ jwt.sign({ id, role, ... })    │
│                                       │
└──────┬───────────────────────────────┘
       │
       │ SQL: SELECT * FROM users
       │      WHERE user_id = $1 OR phone = $1
       ▼
┌──────────────────────┐
│  PostgreSQL          │
│                      │
│  Returns user row:   │
│  {                   │
│    id: 10,           │
│    user_id: "white_demo",
│    role: "white_collar",
│    password_hash: "$2a$10...",
│    ...              │
│  }                   │
└──────┬───────────────┘
       │
       │ Password matches!
       ▼
┌──────────────────────────────────────┐
│  Generate JWT Token:                 │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.│
│  eyJpZCI6MTAsInJvbGUiOiJ3aGl0ZV9jb2x...│
│                                       │
│  Expires in: 7 days                   │
└──────┬───────────────────────────────┘
       │
       │ Response:
       │ {
       │   "success": true,
       │   "data": {
       │     "user": { ... },
       │     "token": "eyJhbG..."
       │   }
       │ }
       ▼
┌──────────────────────┐
│  Browser             │
│                      │
│  1. Save to sessionStorage
│     token = "eyJhbG..."
│                      │
│  2. Set axios default:
│     Authorization: Bearer <token>
│                      │
│  3. Redirect to /dashboard
└──────────────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                        │
└─────────────────────────────────────────────────────────┘

Registration:
┌─────────┐  POST /api/auth/register            ┌──────────┐
│  User   │  { user_id, phone, password,        │  Backend │
│         │    role, first_name, last_name }    │          │
└────┬────┘                                      └────┬─────┘
     │                                                │
     │──────────────────────────────────────────────>│
     │                                                │ 1. Validate input
     │                                                │ 2. Check duplicates
     │                                                │ 3. Hash password
     │                                                │ 4. Insert user
     │                                                │ 5. Create profile
     │                                                │ 6. Generate JWT
     │                                                │
     │<──────────────────────────────────────────────│
     │  { success: true, token, user }                │
     │                                                │

Login:
┌─────────┐  POST /api/auth/login               ┌──────────┐
│  User   │  { identifier, password }            │  Backend │
└────┬────┘                                      └────┬─────┘
     │                                                │
     │──────────────────────────────────────────────>│
     │                                                │ 1. Find user
     │                                                │ 2. Verify password
     │                                                │ 3. Check suspended
     │                                                │ 4. Generate JWT
     │                                                │
     │<──────────────────────────────────────────────│
     │  { success: true, token, user }                │
     │                                                │

Protected Request:
┌─────────┐  GET /api/profile                   ┌──────────┐
│  User   │  Header: Authorization: Bearer <JWT>│  Backend │
└────┬────┘                                      └────┬─────┘
     │                                                │
     │──────────────────────────────────────────────>│
     │                                                │ 1. Verify JWT
     │                                                │ 2. Extract user ID
     │                                                │ 3. Query profile
     │                                                │
     │<──────────────────────────────────────────────│
     │  { id, full_name, bio, skills, ... }           │
     │                                                │
```

---

## Role-Based Access

```
┌────────────────────────────────────────────────────┐
│                    USER ROLES                       │
└────────────────────────────────────────────────────┘

┌─────────────────┐
│  BLUE COLLAR    │  Manual labor, on-demand services
├─────────────────┤
│ Permissions:    │
│ • View jobs     │
│ • Apply to gigs │
│ • Update availability
│ • View earnings │
│ • Receive ratings
└─────────────────┘

┌─────────────────┐
│ WHITE COLLAR    │  Office workers, professionals
├─────────────────┤
│ Permissions:    │
│ • Upload CV     │
│ • View matched jobs
│ • Apply with cover letter
│ • Track applications
│ • Manage profile
└─────────────────┘

┌─────────────────┐
│   EMPLOYER      │  Job posters, task creators
├─────────────────┤
│ Permissions:    │
│ • Post jobs     │
│ • View applicants
│ • Shortlist/Reject
│ • Assign tasks  │
│ • Rate workers  │
│ • Manage bookings
└─────────────────┘

┌─────────────────┐
│     ADMIN       │  Platform moderators
├─────────────────┤
│ Permissions:    │
│ • View all users│
│ • Suspend accounts
│ • Moderate jobs │
│ • Handle complaints
│ • View analytics│
│ • System settings
└─────────────────┘
```

---

## Tech Stack Details

### Frontend (Web)
```
Framework:     React 18.2.0
Routing:       React Router DOM 6.21.0
HTTP Client:   Axios 1.6.2
State:         Context API (AuthContext, LanguageContext)
Maps:          React Leaflet 4.2.1 + Leaflet 1.9.4
UI:            Custom CSS (glassmorphism design)
Notifications: react-hot-toast 2.6.0
Build:         react-scripts 5.0.1 (Create React App)
```

### Frontend (Mobile)
```
Framework:     React Native 0.81.5
Navigation:    React Navigation 6.x
                - Stack Navigator (auth flow)
                - Bottom Tabs (main app)
State:         Context API (AuthContext)
HTTP Client:   Axios
Storage:       expo-secure-store
Platform:      Expo SDK 54
Gestures:      react-native-gesture-handler
```

### Backend
```
Runtime:       Node.js 18+
Framework:     Express.js 4.18+
Database:      PostgreSQL 16
DB Driver:     pg (node-postgres) 8.11+
Auth:          JWT (jsonwebtoken 9.0+)
Password:      bcryptjs 2.4+
Security:      helmet, cors
Validation:    express-validator
Logging:       morgan
File Upload:   multer
Compression:   compression
Rate Limit:    express-rate-limit
```

### Database
```
Engine:        PostgreSQL 16
Connection:    Pool (2-10 connections)
Timeout:       30 seconds
Features:      UUID, Row Level Security (RLS)
Indexes:       user_id, phone, email (unique)
Constraints:   Foreign keys, CHECK constraints
```

---

## Security Measures

### Backend Security
```
✅ Helmet - Security headers (XSS, clickjacking, etc.)
✅ CORS - Whitelist allowed origins
✅ Rate Limiting - 100 requests per 15 minutes
✅ JWT - 7-day expiration, secure secret
✅ bcrypt - Password hashing (10 rounds)
✅ Parameterized Queries - SQL injection prevention
✅ Input Validation - express-validator
✅ Error Handling - No stack traces in production
```

### Frontend Security
```
✅ Token Storage - sessionStorage (cleared on logout)
✅ Auto-logout - On 401 response
✅ Protected Routes - Redirect to login if no token
✅ HTTPS Ready - For production deployment
✅ No sensitive data in localStorage
```

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-07-08T22:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2026-07-08T22:00:00.000Z",
  "stack": "..." // Only in development
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Deployment Architecture (Production)

```
┌──────────────────────────────────────────────────┐
│               CLOUD INFRASTRUCTURE                │
└──────────────────────────────────────────────────┘

Frontend (Vercel / Netlify):
  • Static build deployment
  • CDN distribution
  • Automatic HTTPS
  • Environment variables

Backend (Railway / Render / DigitalOcean):
  • Docker container
  • Auto-scaling
  • Health checks
  • Rolling deploys
  • Environment variables

Database (Railway / Supabase / Neon):
  • Managed PostgreSQL
  • Automatic backups
  • Connection pooling
  • SSL required

File Storage (AWS S3 / Cloudinary):
  • CV uploads
  • Profile images
  • Job documents

Monitoring (Sentry / LogRocket):
  • Error tracking
  • Performance monitoring
  • User session replay
```

---

**See `INTEGRATION_COMPLETE.md` for API documentation and test procedures.**
