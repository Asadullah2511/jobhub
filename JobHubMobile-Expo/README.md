# 📱 JobHub Mobile App (Expo)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo Go app on your phone (Play Store / App Store)
- Backend running on port 5000

### Setup Steps

#### 1. Install Dependencies
```bash
cd JobHubMobile-Expo
npm install
```

#### 2. Update API URL
Edit `src/api/client.js`:
```javascript
const API_URL = 'http://YOUR_IP_HERE:5000/api';
```

**Find your IP:**
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` (look for inet)

Example: `192.168.1.100`

#### 3. Update Backend CORS
Edit `JobNova-main/backend/.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://192.168.1.100:5000
```

Restart backend:
```bash
cd JobNova-main/backend
npm run dev
```

#### 4. Start Expo
```bash
npx expo start
```

#### 5. Test on Phone
1. Install Expo Go on your phone
2. Scan QR code from terminal
3. App loads instantly!

---

## ✅ What's Included

### API Integration
- ✅ Axios client with interceptors
- ✅ Auto token injection
- ✅ Error handling
- ✅ Network detection

### Authentication
- ✅ Login API
- ✅ Register API
- ✅ Token storage (AsyncStorage)
- ✅ Auto-load session

### Jobs API
- ✅ Get jobs (with pagination)
- ✅ Get job by ID
- ✅ Nearby jobs
- ✅ Matched jobs
- ✅ Create/delete jobs
- ✅ Apply for job
- ✅ My applications

### State Management
- ✅ Zustand store
- ✅ Auth store with login/register/logout
- ✅ Loading states
- ✅ Error handling

### UI
- ✅ Login screen (Material Design)
- ✅ Form validation
- ✅ Error messages
- ✅ Loading indicators

---

## 📁 Project Structure

```
JobHubMobile-Expo/
├── App.js                  # Root component
├── app.json               # Expo config
├── package.json           # Dependencies
├── src/
│   ├── api/
│   │   ├── client.js     # Axios config
│   │   ├── auth.js       # Auth endpoints
│   │   └── jobs.js       # Job endpoints
│   ├── store/
│   │   └── authStore.js  # Auth state
│   ├── screens/
│   │   └── auth/
│   │       └── LoginScreen.js
│   └── [other folders]
```

---

## 🧪 Testing

### Create Test User
```bash
POST http://localhost:5000/api/auth/register
{
  "user_id": "testuser",
  "password": "password123",
  "role": "employer",
  "first_name": "Test",
  "last_name": "User"
}
```

### Login in App
- Username: `testuser`
- Password: `password123`

---

## 🐛 Troubleshooting

### Network Error
- Check backend is running
- Verify your IP in `client.js`
- Ensure phone & computer on same WiFi
- Check backend CORS includes your IP

### Module Not Found
```bash
npx expo start -c
```

### App Won't Load
```bash
rm -rf node_modules
npm install
npx expo start
```

---

## 📦 Dependencies

- Expo 51
- React Native Paper (UI)
- React Navigation
- Zustand (State)
- Axios (API)
- AsyncStorage
- And more...

---

## 🎯 Next Steps

After confirming app works:
1. Build Register screen
2. Add Navigation
3. Build Job screens
4. Add Maps
5. Add Chat
6. Polish & deploy

---

**Estimated Setup Time:** 10-15 minutes
**Ready to test on phone!** 📱
