# ⚡ Quick Start - JobHub Expo App

## 📋 Checklist

```
□ Node.js installed (node -v)
□ Find your IP (ipconfig or ifconfig)
□ Update src/api/client.js with your IP
□ Update backend/.env CORS with your IP
□ npm install (in JobHubMobile-Expo)
□ Start backend (npm run dev)
□ Start Expo (npx expo start)
□ Install Expo Go on phone
□ Scan QR code
□ App loads! ✅
```

---

## 🚀 Commands

```bash
# 1. Install dependencies
cd JobHubMobile-Expo
npm install

# 2. Start backend (separate terminal)
cd JobNova-main/backend
npm run dev

# 3. Start Expo
cd JobHubMobile-Expo
npx expo start
```

---

## 📝 Files to Edit

### 1. `JobHubMobile-Expo/src/api/client.js`
```javascript
// Line 9 - Change this IP:
const API_URL = __DEV__
  ? 'http://YOUR_IP_HERE:5000/api'  // ← YOUR IP
```

### 2. `JobNova-main/backend/.env`
```env
# Add your IP to this line:
CORS_ORIGINS=http://localhost:3000,http://localhost:5000,http://YOUR_IP:5000
```

---

## 🧪 Test Login

### Create user:
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

### Login in app:
```
Username: testuser
Password: password123
```

---

## ✅ Success Criteria

- [x] App loads without errors
- [x] Login screen visible
- [x] Can type in inputs
- [x] Login button works
- [x] Backend logs show API call
- [x] Ready for next phase!

---

## 🆘 Quick Fixes

**Network error?**
```
1. Check IP in client.js
2. Check backend running
3. Check same WiFi
```

**Module error?**
```bash
npx expo start -c
```

**CORS error?**
```
1. Check IP in backend/.env
2. Restart backend
```

---

## 📞 Report Back

**Working:**
```
✅ App running on phone!
✅ Login screen looks good!
✅ Ready for next screens!
```

**Issue:**
```
❌ Issue: [describe]
Error: [if any]
What I checked: [list]
```

---

**Time: 10-15 minutes**  
**See SETUP_EXPO_APP.md for detailed guide**
