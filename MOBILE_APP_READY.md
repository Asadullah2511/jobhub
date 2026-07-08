# 📱 JOBHUB MOBILE APP - READY TO TEST

## 🚀 STATUS: EXPO SERVER STARTING

**App Name:** JobHub Mobile  
**Directory:** `JobHubMobile-Expo`  
**Framework:** React Native + Expo SDK 54  
**Backend:** Connected to http://localhost:5000/api  

---

## ✅ CONFIGURATION UPDATED

### API Connection
- **File:** `src/utils/api.js`
- **Backend URL:** `http://localhost:5000/api`
- **Auth:** JWT tokens stored in SecureStore
- **Timeout:** 10 seconds

### Authentication Service
- **File:** `src/services/authService.js`
- **Methods:** login(), register(), logout(), getStoredAuth()
- **Storage:** expo-secure-store (encrypted)
- **Token:** Auto-added to all API requests

---

## 🎯 HOW TO TEST

### Step 1: Open Expo Go App
The Expo dev server is starting. You'll see a QR code in the terminal.

### Step 2: Scan QR Code
- **Android:** Open Expo Go app → Scan QR code
- **iOS:** Open Camera app → Scan QR code → Open in Expo Go

### Step 3: Test Login
Use the same test accounts as the web app:

| Role | Username | Password |
|------|----------|----------|
| White Collar | `white_demo` | `White123!` |
| Employer | `employer_demo` | `Employer123!` |
| Blue Collar | `blue_demo` | `Blue123!` |
| Admin | `admin` | `Admin123!` |

---

## 📱 APP STRUCTURE

### Screens Available:
- **LoginScreen** - Login with username/phone + password
- **RegisterScreen** - Create new account
- **HomeScreen** - Landing page (logged in)
- **DashboardScreen** - Role-based dashboard
- **ProfileScreen** - User profile

### Navigation:
- **Stack Navigator:** Login → Register → Main App
- **Tab Navigator:** Home | Dashboard | Profile

---

## 🔧 FEATURES INTEGRATED

### ✅ Authentication
- Login with username or phone
- JWT token management
- Secure token storage (SecureStore)
- Auto-login on app restart
- Logout functionality

### ✅ API Integration
- Axios HTTP client configured
- Base URL: http://localhost:5000/api
- Auto-retry on network errors
- Bearer token authentication

### ✅ Navigation
- React Navigation v7
- Stack + Tabs pattern
- Protected routes (require login)

---

## 🌐 BACKEND CONNECTION

### Backend Status:
✅ **Running:** http://localhost:5000/api  
✅ **Database:** PostgreSQL connected  
✅ **Test Users:** 4 accounts seeded  

### Available Endpoints:
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `GET /auth/profile` - Get profile
- `GET /jobs/public` - List jobs
- `GET /profile` - User profile
- `POST /jobs/:id/apply` - Apply to job

---

## 📊 EXPECTED FLOW

### First Launch:
1. App loads
2. Checks for stored token
3. No token found → Shows LoginScreen

### After Login:
1. User enters credentials
2. API call to `/auth/login`
3. Token received and stored
4. Navigate to TabNavigator
5. Shows Home, Dashboard, Profile tabs

### Logout:
1. User taps Logout
2. Token deleted from SecureStore
3. Navigate back to LoginScreen

---

## 🐛 TROUBLESHOOTING

### If app won't connect to backend:

**Problem:** Network error / timeout

**Solution 1 - Use your computer's IP:**
```javascript
// Edit: src/utils/api.js
const API_URL = 'http://192.168.x.x:5000/api'
// Replace 192.168.x.x with your computer's IP
```

**Solution 2 - Find your IP:**
```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux
ifconfig | grep inet
```

**Solution 3 - Use ngrok (tunnel):**
```bash
# Install ngrok
npm install -g ngrok

# Tunnel backend
ngrok http 5000

# Use ngrok URL in app
const API_URL = 'https://xxxx.ngrok.io/api'
```

---

## 🔄 DEVELOPMENT WORKFLOW

### Make Changes:
```bash
cd JobHubMobile-Expo

# Edit files in src/
# Changes auto-reload in Expo Go
```

### Restart Server:
```bash
# Press 'r' in Expo terminal to reload
# Or shake device → Reload
```

### View Logs:
```bash
# Expo terminal shows console.log()
# Or shake device → Debug Remote JS
```

---

## 📦 DEPENDENCIES INSTALLED

```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "@react-navigation/native": "^7.0.15",
  "@react-navigation/stack": "^7.2.0",
  "@react-navigation/bottom-tabs": "^7.2.0",
  "axios": "^1.6.2",
  "expo-secure-store": "~15.0.8"
}
```

---

## 🎨 NEXT: UI DESIGN

To match the web frontend's glassmorphism design:

1. **Create design system** in mobile
2. **Add styled components** with blur effects
3. **Implement role dashboards:**
   - Blue Collar: Map view, nearby jobs
   - White Collar: CV upload, job matching
   - Employer: Post jobs, applicant kanban
4. **Add features:**
   - Job search with filters
   - Application tracking
   - Chat messaging
   - Notifications

---

## 🚀 CURRENT STATUS

```
┌─────────────────────────────────────┐
│      JOBHUB MOBILE APP              │
├─────────────────────────────────────┤
│                                     │
│  Platform:   📱 React Native        │
│  Expo SDK:   54.0.0                 │
│  Backend:    ✅ localhost:5000      │
│  Status:     🟢 Starting...         │
│                                     │
└─────────────────────────────────────┘
```

---

**📱 Scan the QR code in your terminal to open the app!**

**Login with:** `white_demo` / `White123!`
