# JobNova Codebase Audit

## Repository Structure
```
JobNova-main/
+-- backend/                  # Node.js/Express API
¦   +-- api/index.js          # Vercel serverless entry
¦   +-- src/
¦   ¦   +-- server.js         # Express app setup (JWT_SECRET startup guard)
¦   ¦   +-- config/
¦   ¦   ¦   +-- supabase.js   # Supabase client (anon + service role)
¦   ¦   +-- middleware/
¦   ¦   ¦   +-- authMiddleware.js  # JWT verification (no fallback secret)
¦   ¦   ¦   +-- rateLimiter.js     # Rate limiting (express-rate-limit)
¦   ¦   +-- routes/           # 13 route files + v1/ versioned routes
¦   ¦   +-- controllers/      # 7 controllers + auth forgot/reset
¦   ¦   +-- services/         # 10 services (mailService.js added)
¦   ¦   +-- repositories/     # 6 repositories (findByEmail added)
¦   ¦   +-- utils/
¦   ¦   ¦   +-- aiSearchMapper.js  # Gemini 1.5 Flash (free tier) + offline Urdu dictionary
¦   ¦   ¦   +-- responseHelper.js  # Consistent res.success / res.fail helpers
¦   ¦   +-- socket/
¦   ¦   ¦   +-- index.js      # Socket.IO real-time chat (NEW)
¦   ¦   +-- docs/
¦   ¦   ¦   +-- swagger.js    # OpenAPI/Swagger spec
¦   ¦   +-- db/               # SQL migration scripts
¦   +-- schema.sql            # Main schema (users, profiles, jobs, applications, reviews)
¦   +-- time_exchanges_schema.sql
¦   +-- package.json
+-- frontend/                 # React.js web app
¦   +-- src/
¦   ¦   +-- App.js            # Router with role-based dashboards
¦   ¦   +-- context/          # AuthContext, LanguageContext
¦   ¦   +-- components/       # ChatWidget, ChatBox, VoiceSearchOverlay, VoiceProfileAssistant, etc.
¦   ¦   +-- pages/            # Login, Register, BlueCollarDashboard, WhiteCollarDashboard, EmployerDashboard, AdminDashboard, Profile, etc.
¦   ¦   +-- utils/            # api.js, voiceCommandParser.js
¦   +-- package.json
+-- README.md
+-- start_project.bat
+-- vercel.json
```

## Database Schema (Supabase PostgreSQL)

### Tables
| Table | Key Columns | Notes |
|-------|------------|-------|
| `users` | id (uuid PK), user_id (text UNIQUE), phone (UNIQUE), email (UNIQUE), password_hash, role (blue_collar/white_collar/employer/admin), first_name, last_name, is_profile_completed, is_suspended | Custom auth (not Supabase Auth); email added for forgot-password |
| `profiles` | id (uuid PK), user_id (FK), full_name, bio, location, avatar_url, trade, hourly_rate, availability, radius, skills, experience, education, resume_url, company_name, industry, website, avg_rating, total_reviews, verification_document_url, verification_status | One per user, role-specific fields |
| `jobs` | id (uuid PK), employer_id (FK), title, description, type (blue/white), location, salary_range, hourly_rate, duration, skills, experience_level, availability, status (Active/Closed/Draft), latitude, longitude | Geolocation for blue-collar |
| `applications` | id (uuid PK), job_id (FK), applicant_id (FK), status (Pending/Shortlisted/Rejected/In Progress/Completed), resume_url, cover_letter | UNIQUE(job_id, applicant_id) |
| `reviews` | id (uuid PK), job_id, reviewer_id, reviewee_id, rating (1-5), comment | UNIQUE(job_id, reviewer_id, reviewee_id) |
| `chat_sessions` | id, job_id, employer_id, candidate_id, updated_at | References profiles table |
| `chat_messages` | id, session_id, sender_id, content, is_read, created_at | |
| `notifications` | id, user_id, type, message, related_id, is_read, created_at | |
| `complaints` | id, reporter_id, reported_user_id, reported_job_id, reason, description, status, admin_notes | |
| `system_logs` | id, action, performed_by, target_type, target_id, details | Admin audit trail |
| `bookings` | id, employer_id, worker_id, title, description, location, booking_date, start_time, end_time, offered_rate, status | Blue-collar scheduling |
| `time_exchanges` | id, user_id, from_city, to_city, travel_date_start, travel_date_end, available_for_work, skills | Travel + work announcements |
| `time_exchange_requests` | id, employer_id, worker_id, time_exchange_id, status, message | Hiring via time exchange |
| `international_jobs` | id, employer_id, title, description, country, city, salary, currency, visa_sponsored, type, requirements, benefits, status | |
| `international_job_applications` | id, job_id, applicant_id, status, created_at | |
| `scholarships` | id, title, provider, description, deadline, application_link, is_active | |
| `scholarship_applications` | id, scholarship_id, applicant_id, status, applied_at | |
| `contact_messages` | id, name, email, phone, message, status (unread/read/resolved) | |
| `password_resets` | id, user_id (FK), token (UNIQUE), expires_at, used, created_at | Forgot-password flow |

## Authentication Mechanism
- **Type:** Custom JWT (not Supabase Auth)
- **Library:** jsonwebtoken + bcryptjs
- **Token payload:** `{ id, role, user_id, phone, first_name, last_name }`
- **Expiry:** 7 days (configurable via `JWT_EXPIRES_IN`)
- **Storage:** `sessionStorage` in frontend
- **Header:** `Authorization: Bearer <token>`
- **JWT_SECRET startup guard:** Server exits with FATAL if JWT_SECRET missing from env — no fallback default
- **Refresh tokens:** Not implemented
- **Forgot password:** Implemented (email-based via Brevo SMTP + nodemailer)

## Complete API Endpoint Inventory

### Auth (`/api/auth`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /register | No | Register user |
| POST | /login | No | Login |
| POST | /forgot-password | No | Request password reset (body: email) |
| POST | /reset-password | No | Reset password with token (body: token, new_password) |
| GET | /profile | Yes | Get token profile |

### Jobs (`/api/jobs`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /public | No | Public job listing |
| GET | / | Yes | Protected job listing |
| GET | /match | Yes | AI-matched jobs |
| GET | /nearby | Yes | Geolocation-based nearby jobs |
| POST | / | Yes | Create job |
| DELETE | /:id | Yes | Delete job (own) |
| POST | /:id/apply | Yes | Apply for job |
| PUT | /applications/:id/status | Yes | Update application status |
| GET | /applications/my-applications | Yes | Get worker's applications |
| GET | /:id/applications | Yes | Get job applications (employer) |
| GET | /my-jobs | Yes | Get employer's jobs |

### Profile (`/api/profile`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /public/:userId | Yes | View any user's public profile |
| GET | / | Yes | Get own profile |
| PUT | / | Yes | Update profile |
| POST | /upload-cv | Yes | Upload CV |
| POST | /upload-avatar | Yes | Upload avatar |
| POST | /upload-verification | Yes | Upload ID document |
| GET | /hiring-history | Yes | Employer hiring history |

### Reviews (`/api/reviews`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | / | Yes | Submit review |
| GET | /me | Yes | My received ratings |
| GET | /user/:userId | Yes | User's reviews |

### Notifications (`/api/notifications`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | / | Yes | Get notifications |
| PUT | /:id/read | Yes | Mark one read |
| PUT | /read-all | Yes | Mark all read |

### Chat (`/api/chat`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /sessions | Yes | Get conversations |
| GET | /:sessionId/messages | Yes | Get messages |
| POST | /start | Yes | Start/find session |
| POST | /:sessionId/message | Yes | Send message |
| PATCH | /:sessionId/read | Yes | Mark messages as read |

### Admin (`/api/admin`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /stats | Admin | Platform analytics |
| GET | /users | Admin | List users |
| PUT | /users/:id/suspend | Admin | Toggle suspension |
| GET | /jobs | Admin | All jobs |
| DELETE | /jobs/:id | Admin | Delete any job |
| GET | /logs | Admin | System logs |
| GET | /complaints | Admin | All complaints |
| PUT | /complaints/:id/status | Admin | Resolve/dismiss complaint |
| GET | /verifications/pending | Admin | Pending verifications |
| PUT | /verifications/:userId/status | Admin | Verify/reject user |

### Complaints (`/api/complaints`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | / | Yes | Submit complaint |

### Contact (`/api/contact`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | / | No | Submit contact message |
| GET | / | Admin | Get all messages |
| PUT | /:id/status | Admin | Update status |

### Scholarships (`/api/scholarships`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | / | No | Active scholarships |
| GET | /admin | Admin | ALL scholarships |
| POST | / | Admin | Create |
| DELETE | /:id | Admin | Delete |
| POST | /:id/apply | Yes | Apply |
| GET | /my-applications | Yes | My applications |
| GET | /:id/applicants | Admin | List applicants |

### International Jobs (`/api/international-jobs`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | / | No | Public listing (active jobs) |
| POST | / | Yes | Create (employer) |
| DELETE | /:id | Yes | Delete (own listing) |
| POST | /:id/apply | Yes | Apply (worker) |
| GET | /employer/:employer_id | Yes | Employer's jobs |
| GET | /:id/applications | Yes | Job applicants (owner only) |
| PUT | /applications/:appId/status | Yes | Update app status (owner only) |

### Time Exchange (`/api/time-exchange`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | / | Yes | Create announcement |
| GET | / | No | List (with filters) |
| GET | /user/:userId | No | User's announcements |
| DELETE | /:id | Yes | Delete announcement (own) |
| POST | /hire | Yes | Send hire request |
| GET | /requests/:worker_id | Yes | Worker's requests |
| PATCH | /requests/:id/status | Yes | Accept/reject request |

### Bookings (`/api/bookings`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /workers | Yes | Browse blue-collar workers |
| POST | / | Yes | Create booking |
| GET | /employer | Yes | Employer's bookings |
| GET | /worker | Yes | Worker's bookings |
| PATCH | /:id/status | Yes | Update booking status |

## Voice Assistant Analysis
- **100% browser-based** Web Speech API (window.SpeechRecognition)
- **No backend endpoint** for speech-to-text
- `VoiceSearchOverlay.js` uses `webkitSpeechRecognition` with Urdu (`ur-PK`) support
- `VoiceProfileAssistant.js` uses speech recognition + speech synthesis for profile setup
- `voiceCommandParser.js` does client-side keyword extraction (Urdu -> English skill mapping) — reusable in React Native
- `aiSearchMapper.js` (backend) accepts text search, not audio — uses Gemini 1.5 Flash (free tier) for NLP, with offline fallback
- **React Native limitation:** Web Speech API does NOT work in React Native

## Chat System
- **REST-based polling** (NOT WebSocket/Socket.io) — frontend polls every 1-5 seconds
- **Socket.IO implementation added:** `backend/src/socket/index.js` for real-time messaging
- REST polling retained as fallback for web frontend until migrated off
- Messages stored in `chat_messages` table
- Sessions in `chat_sessions` table (links employer + candidate profiles)

## File Uploads
- **Library:** multer (memoryStorage)
- **Storage:** Supabase Storage (buckets: 'resumes', 'avatars', 'verifications')
- **CV Upload:** 5MB limit, `multipart/form-data`, field name: `cv`
- **CV Parsing:** pdf-parse with regex-based heuristic extraction
- **Avatar:** image files only, 5MB limit, field name: `avatar`

## Geolocation
- Implemented in `jobRepository.getNearbyJobs()` using Haversine formula
- Only applies to 'blue' type jobs
- Query params: `lat`, `lng`, `radius` (km), `search`

## Environment Variables
### Backend
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin service role key
- `JWT_SECRET` - JWT signing secret (required — no default fallback)
- `JWT_EXPIRES_IN` - Token expiry (default '7d')
- `GEMINI_API_KEY` - Google Gemini AI key (optional, free tier available)
- `PORT` - Server port (default 5000)
- `VERCEL` - Set to '1' on Vercel
- `BREVO_SMTP_HOST` - Brevo SMTP server (default smtp-relay.brevo.com)
- `BREVO_SMTP_PORT` - Brevo SMTP port (default 587)
- `BREVO_SMTP_USER` - Brevo SMTP login email
- `BREVO_SMTP_PASS` - Brevo SMTP API key
- `FRONTEND_URL` - Frontend base URL for password reset links

### Frontend
- `REACT_APP_API_URL` - Backend base URL
- `REACT_APP_GOOGLE_MAPS_API_KEY` - Referenced but NOT actually used in code

## Security Gaps Found
1. **No rate limiting** on any endpoint (express-rate-limit installed but not wired)
2. **No input validation** used (express-validator installed but not wired)
3. **No refresh token mechanism**
4. **CORS set to `*`** (permissive — configurable via CORS_ORIGINS)
5. **No HTTPS enforcement**
6. **Token in sessionStorage** (vulnerable to XSS)

### Fixed Items (from original audit)
- Hardcoded JWT secret fallback removed — startup guard added
- Missing auth middleware on international jobs, time exchange, contact, scholarships — all now protected
- Forgot-password flow added (email-based via Brevo + nodemailer)
- is_suspended column drift documented and migration SQL created

## Frontend Screens/Routes
| Route | Component | Role(s) | Purpose |
|-------|-----------|---------|---------|
| /login | Login | All | Login form |
| /register | Register | All | Registration form |
| /dashboard | Dashboard (dispatches to role dashboards) | All | Main app |
| /profile | Profile | All | Edit profile, upload CV/avatar |
| /profile/:userId | PublicProfile | All | View others' profiles |
| / | Home | Public | Landing page |
| /about | About | Public | About page |
| /contact | Contact | Public | Contact form |
| /privacy | Privacy | Public | Privacy policy |
| /terms | Terms | Public | Terms of service |

### Role-based Dashboard Features
- **BlueCollarDashboard:** Welcome view, find jobs (with map/list toggle, voice search), my jobs, my ratings, schedule management, bookings, time exchange, international jobs
- **WhiteCollarDashboard:** Find jobs (with voice search), my applications, international jobs, scholarships, time exchange
- **EmployerDashboard:** Post jobs (white/blue), manage applications, bookings, time exchange explorer, international jobs (post/manage)
- **AdminDashboard:** Stats, user management, job moderation, complaints, verifications, system logs

## Gaps & TODOs for Mobile Readiness
1. **Voice assistant** must be replaced — Web Speech API wont work in React Native
2. **API versioning** not implemented (`/api/v1/` mount layer pending)
3. **No pagination** on list endpoints
4. **Profile endpoint returns data directly** (not wrapped in `{ success: true, data }` pattern consistently)
5. **No dark mode** support in web app
6. **No push notification infrastructure** exists
7. **Socket.IO chat added** — REST polling retained as web fallback
8. **Auth middleware added** on all endpoints — international jobs, time exchange, contact, scholarships
9. **Forgot password flow added** — email-based via Brevo (nodemailer)
10. **JWT_SECRET startup guard added** — no fallback defaults
11. **Rate limiting + input validation libs installed** — not yet wired