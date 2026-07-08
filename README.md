# 🚀 JobHub - Job Platform

**Full-stack job platform connecting Blue-Collar and White-Collar workers with employers.**

---

## 📦 Project Structure

```
jobhub/
├── JobNova-main/              # Main application (to be renamed to JobHub-main)
│   ├── backend/               # Node.js + Express API
│   └── frontend/              # React web application
├── JobHubMobile-Expo/         # React Native mobile app
├── archive/                   # Archived old code
└── design-tokens.json         # Shared design system
```

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd JobNova-main/backend
npm start
```
**Expected:** `✅ PostgreSQL connection successful! 🚀 Server running on port 5000`

### 2. Start Mobile App
```bash
cd JobHubMobile-Expo
npx expo start
```
**Scan QR code** with Expo Go app on your phone.

---

## 🧪 Test Credentials

| Role | Username | Password |
|------|----------|----------|
| White Collar | `white_demo` | `White123!` |
| Employer | `employer_demo` | `Employer123!` |
| Blue Collar | `blue_demo` | `Blue123!` |
| Admin | `admin` | `Admin123!` |

---

## 🌐 URLs

- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health
- **Mobile:** Expo Go app (scan QR code)

---

## 🏗️ Tech Stack

### Backend
- **Framework:** Node.js + Express.js
- **Database:** PostgreSQL
- **Auth:** JWT tokens + bcrypt
- **API:** RESTful with versioning

### Frontend (Web)
- **Framework:** React 18
- **Routing:** React Router DOM
- **State:** Context API
- **HTTP:** Axios
- **UI:** Custom CSS (glassmorphism)

### Mobile
- **Framework:** React Native
- **Platform:** Expo SDK 54
- **Navigation:** React Navigation
- **Storage:** SecureStore
- **HTTP:** Axios

---

## 📚 Features

### For Job Seekers
- **White Collar:**
  - Upload CV with parsing
  - Skill-based job matching
  - Track applications
  
- **Blue Collar:**
  - View nearby jobs on map
  - Quick gig acceptance
  - Availability management

### For Employers
- Post jobs (permanent/short-term)
- View applicants (Kanban board)
- Assign tasks with maps
- Rate workers

### For Admins
- User management
- Job moderation
- Complaint handling
- Analytics dashboard

---

## 🔧 Configuration

### Backend (.env)
```bash
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=jobhubdb
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_secret_key
```

### Mobile (src/utils/api.js)
```javascript
const API_URL = 'http://localhost:5000/api'
// Change to your computer's IP for physical device testing
```

---

## 📖 Documentation

- **`INTEGRATION_COMPLETE.md`** - Full API documentation
- **`MOBILE_APP_READY.md`** - Mobile setup guide
- **`QUICK_START.md`** - Quick reference
- **`SYSTEM_ARCHITECTURE.md`** - System design diagrams

---

## 🔐 Database Schema

**Main Tables:**
- `users` - Authentication & roles
- `profiles` - User details by role
- `jobs` - Job postings
- `applications` - Job applications
- `reviews` - Ratings & feedback
- `chat_sessions` - Messaging
- `notifications` - In-app alerts

**Seed Test Data:**
```bash
cd JobNova-main/backend
node seed-test-users.js
```

---

## 🚨 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
# Windows: Services → postgresql-x64-16
```

### Mobile app can't connect
```bash
# Use your computer's IP instead of localhost
ipconfig # Windows
ifconfig # Mac/Linux

# Update mobile API URL to: http://192.168.x.x:5000/api
```

### Port already in use
```bash
# Backend (5000)
netstat -ano | findstr :5000
taskkill /F /PID <PID>

# Expo (8081)
netstat -ano | findstr :8081
taskkill /F /PID <PID>
```

---

## 📝 Development

### Add New Feature
1. Create backend endpoint in `backend/src/routes/`
2. Add controller in `backend/src/controllers/`
3. Update mobile screen in `mobile/src/screens/`
4. Test with test accounts

### Database Changes
```bash
# Connect to database
psql -U postgres -d jobhubdb

# Run SQL migrations
\i backend/migrations/xxx.sql
```

---

## 🎯 Roadmap

- [ ] Rename `JobNova-main` to `JobHub-main`
- [ ] Add push notifications
- [ ] Implement real-time chat
- [ ] Add payment integration
- [ ] Deploy to production

---

## 📄 License

Private project

---

**For detailed documentation, see the individual .md files in this directory.**
