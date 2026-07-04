# JobNova Codebase Audit

## Repository Structure
```
JobNova-main/
├── backend/                  # Node.js/Express API
│   ├── api/index.js          # Vercel serverless entry
│   ├── src/
│   │   ├── server.js         # Express app setup
│   │   ├── config/
│   │   │   └── supabase.js   # Supabase client (anon + service role)
│   │   ├── middleware/
│   │   │   └── authMiddleware.js  # JWT verification
│   │   ├── routes/           # 13 route files
│   │   ├── controllers/      # 7 controllers
│   │   ├── services/         # 9 services
│   │   ├── repositories/     # 6 repositories
│   │   ├── utils/
│   │   │   └── aiSearchMapper.js  # Gemini AI + offline Urdu dictionary
│   │   └── db/               # SQL migration scripts
│   ├── schema.sql            # Main schema (users, profiles, jobs, applications, reviews)
│   ├── time_exchanges_schema.sql
│   └── package.json
├── frontend/                 # React.js web app
│   ├── src/
│   │   ├── App.js            # Router with role-based dashboards
│   │   ├── context/          # AuthContext, LanguageContext
│   │   ├── components/       # ChatWidget, ChatBox, VoiceSearchOverlay, VoiceProfileAssistant, etc.
│   │   ├── pages/            # Login, Register, BlueCollarDashboard, WhiteCollarDashboard, EmployerDashboard, AdminDashboard, Profile, etc.
│   │   └── utils/            # api.js, voiceCommandParser.js
│   └── package.json
├── README.md
├── start_project.bat
└── vercel.json
```

## Database Schema (Supabase PostgreSQL)

### Tables
| Table | Key Columns | Notes |
|-------|------------|-------|
| `users` | id (uuid PK), user_id (text UNIQUE), phone (UNIQUE), password_hash, role (blue_collar/white_collar/employer/admin), first_name, last_name, is_profile_completed, is_suspended | Custom auth (not Supabase Auth) |
| `profiles` | id (uuid PK), user_id (FK→users), full_name, bio, location, avatar_url, trade, hourly_rate, availability (JSON string), radius, skills, experience, education, resume_url, company_name, industry, website, avg_rating, total_reviews, verification_document_url, verification_status | One per user, role-specific fields |
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

## Authentication Mechanism
- **Type:** Custom JWT (not Supabase Auth)
- **Library:** jsonwebtoken + bcryptjs
- **Token payload:** `{ id, role, user_id, phone, first_name, last_name }`
- **Expiry:** 7 days (configurable via `JWT_EXPIRES_IN`)
- **Storage:** `sessionStorage` in frontend
- **Header:** `Authorization: Bearer <token>`
- **Refresh tokens:** ❌ Not implemented
- **Forgot password:** ❌ Not implemented
- **Hardcoded fallback secret:** `'your_secret_key_123'` (⚠️ security risk)

## Complete API Endpoint Inventory

### Auth (`/api/auth`)
| Method | Path | Auth | Purpose | Request Body | Response |
|--------|------|------|---------|-------------|----------|
| POST | /register | No | Register user | `{ user_id, phone, password, role, first_name, last_name }` | `{ success, data: { user, token } }` |
| POST | /login | No | Login | `{ identifier (user_id or phone), password }` | `{ success, data: { user, token } }` |
| GET | /profile | Yes | Get token profile | - | `{ success, data: user }` |

### Jobs (`/api/jobs`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /public | No | Public job listing |
| GET | / | Yes | Protected job listing (with type/search query params) |
| GET | /match | Yes | AI-matched jobs (type, search query params) |
| GET | /nearby | Yes | Geolocation-based nearby jobs (lat, lng, radius params) |
| POST | / | Yes | Create job |
| DELETE | /:id | Yes | Delete job (own) |
| POST | /:id/apply | Yes | Apply for job (body: resume_url, cover_letter) |
| PUT | /applications/:id/status | Yes | Update application status (body: status) |
| GET | /applications/my-applications | Yes | Get worker's applications |
| GET | /:id/applications | Yes | Get job applications (employer) |
| GET | /my-jobs | Yes | Get employer's jobs |

### Profile (`/api/profile`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /public/:userId | Yes | View any user's public profile |
| GET | / | Yes | Get own profile |
| PUT | / | Yes | Update profile |
| POST | /upload-cv | Yes | Upload CV (multipart, 5MB, Supabase Storage) |
| POST | /upload-avatar | Yes | Upload avatar (image only) |
| POST | /upload-verification | Yes | Upload ID document |
| GET | /hiring-history | Yes | Employer hiring history |

### Reviews (`/api/reviews`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | / | Yes | Submit review for completed job |
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
| POST | /start | Yes | Start/find session (body: job_id, candidate_id) |
| POST | /:sessionId/message | Yes | Send message (body: content) |
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

### Contact (`/api/contact`) ⚠️
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | / | No | Submit contact message |
| GET | / | ❌ No auth | Get all messages (should be admin!) |
| PUT | /:id/status | ❌ No auth | Update status (should be admin!) |

### Scholarships (`/api/scholarships`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | / | No | Active scholarships |
| GET | /admin | ❌ No auth | ALL scholarships (should be admin!) |
| POST | / | Admin | Create |
| DELETE | /:id | ❌ No auth | Delete (should be admin!) |
| POST | /:id/apply | Yes | Apply |
| GET | /my-applications | Yes | My applications |
| GET | /:id/applicants | ❌ No auth | List applicants |

### International Jobs (`/api/international-jobs`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | / | ❌ No auth | List (should be auth at minimum) |
| POST | / | ❌ No auth | Create |
| DELETE | /:id | ❌ No auth | Delete |
| POST | /:id/apply | ❌ No auth | Apply |
| GET | /employer/:employer_id | ❌ No auth | Employer's jobs |
| GET | /:id/applications | ❌ No auth | Job applicants |
| PUT | /applications/:appId/status | ❌ No auth | Update app status |

### Time Exchange (`/api/time-exchange`)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | / | ❌ No auth | Create announcement |
| GET | / | No | List (with filters) |
| GET | /user/:userId | No | User's announcements |
| DELETE | /:id | ❌ No auth | Delete announcement |
| POST | /hire | Yes | Send hire request |
| GET | /requests/:worker_id | No | Worker's requests |
| PATCH | /requests/:id/status | No | Accept/reject request |

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
- `voiceCommandParser.js` does client-side keyword extraction (Urdu→English skill mapping)
- `aiSearchMapper.js` (backend) accepts text search, not audio - uses Gemini API for NLP
- **React Native limitation:** Web Speech API does NOT work in React Native

## Chat System
- **REST-based polling** (NOT WebSocket/Socket.io)
- Frontend polls every 1-5 seconds
- No Socket.io in backend `package.json`
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
- `SUPABASE_SERVICE_ROLE_KEY` - Admin service role key (bypasses RLS)
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiry (default '7d')
- `GEMINI_API_KEY` - Google Gemini AI key (optional)
- `PORT` - Server port (default 5000)
- `VERCEL` - Set to '1' on Vercel

### Frontend
- `REACT_APP_API_URL` - Backend base URL
- `REACT_APP_GOOGLE_MAPS_API_KEY` - Referenced but NOT actually used in code

## Security Gaps Found
1. **Hardcoded JWT secret** fallback in both authService.js and authMiddleware.js
2. **Missing auth on international jobs** - 6 endpoints unprotected
3. **Missing auth on time exchange** - 3 endpoints unprotected
4. **Missing auth on contact admin** - GET/PUT contact messages unprotected
5. **Missing auth on scholarship admin** - GET /admin, DELETE unprotected
6. **No rate limiting** on any endpoint
7. **No input validation library** (just manual checks)
8. **No refresh token mechanism**
9. **CORS set to `*`** (permissive)
10. **No HTTPS enforcement**
11. **Token in sessionStorage** (vulnerable to XSS)
12. **No forgot password flow**

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
1. **Voice assistant** must be replaced - Web Speech API won't work in React Native
2. **Chat is polling-based** - no WebSocket server exists yet
3. **No forgot password** endpoint exists
4. **API versioning** not implemented
5. **Several endpoints lack auth** - needs cleanup
6. **No pagination** on list endpoints
7. **Profile endpoint returns data directly** (not wrapped in `{ success: true, data }` pattern consistently)
8. **No dark mode** support in web app
9. **No push notification infrastructure** exists
10. **`internationalJobRoutes.js`** and **`timeExchangeRoutes.js`** need auth middleware added
