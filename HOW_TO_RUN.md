# 🚀 HOW TO RUN JOBHUB

## Quick Start (2 Steps)

### Step 1: Start Backend

Open terminal and run:

```bash
cd JobNova-main/backend
npm start
```

**You should see:**
```
✅ PostgreSQL connection successful!
🚀 Server running on port 5000
```

---

### Step 2: Start Mobile App

Open **another terminal** and run:

```bash
cd JobHubMobile-Expo
npx expo start
```

**You should see:**
```
› Metro waiting on exp://...
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

## 📱 Test on Your Phone

### Android:
1. Install **Expo Go** from Play Store
2. Open Expo Go app
3. Tap "Scan QR Code"
4. Scan the QR code from terminal

### iOS:
1. Install **Expo Go** from App Store
2. Open Camera app
3. Point at QR code from terminal
4. Tap notification to open in Expo Go

---

## 🧪 Test Login

Once app loads, login with:

**Username:** `white_demo`  
**Password:** `White123!`

Or try other accounts:
- `employer_demo` / `Employer123!`
- `blue_demo` / `Blue123!`
- `admin` / `Admin123!`

---

## 🔧 If Backend Won't Start

### Check PostgreSQL is running:

**Windows:**
- Press `Win + R`
- Type `services.msc`
- Find "postgresql-x64-16"
- Make sure it's "Running"

**If stopped:** Right-click → Start

---

## 📱 If Mobile App Can't Connect

The mobile app needs your computer's IP address (not localhost).

### Find Your IP:

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
```

### Update Mobile App:

Edit file: `JobHubMobile-Expo/src/utils/api.js`

Change:
```javascript
const API_URL = 'http://localhost:5000/api'
```

To:
```javascript
const API_URL = 'http://192.168.1.100:5000/api'  // Use YOUR IP
```

Then restart Expo:
```bash
npx expo start -c
```

---

## ⚙️ If Port Already in Use

### Backend (port 5000):
```bash
netstat -ano | findstr :5000
taskkill /F /PID <PID_NUMBER>
```

### Expo (port 8081):
```bash
netstat -ano | findstr :8081
taskkill /F /PID <PID_NUMBER>
```

---

## 🛑 How to Stop

### Stop Backend:
Press `Ctrl + C` in backend terminal

### Stop Mobile App:
Press `Ctrl + C` in Expo terminal

---

## 📊 Check if Running

### Backend:
Open browser: http://localhost:5000/api/health

Should show:
```json
{"status":"ok","message":"JobHub API is running"}
```

### Mobile App:
Check terminal shows:
```
› Metro waiting on exp://...
```

---

## 🎯 Full Startup Order

1. **Start PostgreSQL** (Windows Services or `sudo service postgresql start`)
2. **Start Backend** (`cd JobNova-main/backend && npm start`)
3. **Wait for "Server running on port 5000"**
4. **Start Mobile App** (`cd JobHubMobile-Expo && npx expo start`)
5. **Scan QR code** with Expo Go app
6. **Login** with test credentials

---

## 📝 First Time Setup

If you haven't installed dependencies:

### Backend:
```bash
cd JobNova-main/backend
npm install
```

### Mobile App:
```bash
cd JobHubMobile-Expo
npm install
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check PostgreSQL is running |
| "Port 5000 in use" | Kill existing process (see above) |
| Mobile can't connect | Use your computer's IP (see above) |
| "Expo port 8081 in use" | Kill process or use different port |
| Login fails | Check backend is running at port 5000 |
| Blank screen on mobile | Check terminal for errors |

---

## ✅ Current Status

Based on recent tests:

✅ **Backend:** Should start immediately  
✅ **Mobile:** Should start immediately  
✅ **Database:** Already configured  
✅ **Test Users:** Already created  

**You're ready to run!** Just follow Steps 1 & 2 above.

---

## 🎓 Development Mode

### Backend Auto-Restart (optional):
```bash
cd JobNova-main/backend
npm install -g nodemon
npm run dev  # Uses nodemon for auto-restart
```

### Mobile Hot Reload:
Already enabled! Just save files and they reload automatically.

---

**Need more help?** Check `QUICK_START.md` or `README.md`
