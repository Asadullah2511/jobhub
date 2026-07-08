# 🚀 QUICK START GUIDE

## Start Everything in 3 Steps

### Step 1: Start Backend
```bash
cd JobHub-main/backend
npm start
```
**Expected output:** `✅ PostgreSQL connection successful!` + `🚀 Server running on port 5000`

### Step 2: Start Frontend
```bash
cd JobHub-main/frontend
npm start
```
**Expected output:** Compiled successfully! Opens http://localhost:3000

### Step 3: Login
**URL:** http://localhost:3000/login

**Test Accounts:**
| Role | Login | Password |
|------|-------|----------|
| White Collar | `white_demo` | `White123!` |
| Employer | `employer_demo` | `Employer123!` |
| Blue Collar | `blue_demo` | `Blue123!` |
| Admin | `admin` | `Admin123!` |

---

## 🧪 Quick Test

After login, you'll see the role-specific dashboard:

### As White Collar (`white_demo`)
- Browse jobs with skill matching
- Upload CV for profile
- Track applications
- View saved jobs

### As Employer (`employer_demo`)
- Post new jobs (permanent or short-term)
- View applicants in Kanban board
- Assign tasks on map
- Review hiring history

### As Blue Collar (`blue_demo`)
- View nearby jobs on map
- Toggle availability
- Accept quick gigs
- Track earnings

### As Admin (`admin`)
- Manage all users
- Moderate jobs
- Handle complaints
- View analytics

---

## 🔧 Re-seed Test Users (if needed)

```bash
cd JobHub-main/backend
node seed-test-users.js
```

This creates fresh test accounts with profiles.

---

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health
- **Public Jobs:** http://localhost:5000/api/jobs/public

---

## ⚡ Mobile App (Next)

The mobile app (JobHubMobile-Expo) will sync with the same backend:

```bash
cd JobHubMobile-Expo
npm install
npx expo start
```

Same test credentials work in mobile app!

---

**See `INTEGRATION_COMPLETE.md` for full technical documentation.**
