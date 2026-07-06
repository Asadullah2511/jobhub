# 🌐 Network Setup Guide - Expo App

## 📡 Why This is Needed

Your phone can't access `localhost` or `127.0.0.1` because that refers to the phone itself, not your computer. Both devices need to be on the **same WiFi network** and use your computer's **local network IP address**.

---

## Step 1: Find Your Computer's Local IP

### Windows:
```bash
ipconfig
```

**Look for:** `IPv4 Address` under your active adapter (Wi-Fi or Ethernet)

**Example output:**
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.5
```

**Your IP:** `192.168.1.5` (yours will be different)

---

### Mac:
```bash
ipconfig getifaddr en0
```

**Output:** `192.168.1.5` (if on WiFi)

If you get nothing, try:
```bash
ipconfig getifaddr en1
```

---

### Linux:
```bash
hostname -I
```

**Output:** `192.168.1.5 ...` (first IP is usually the one)

---

### ⚠️ Important:
- IP usually starts with `192.168.x.x` or `10.0.x.x`
- Your phone and computer **MUST** be on the same WiFi
- Won't work over mobile data or different networks
- Write down your IP - you'll need it in the next steps!

---

## Step 2: Update Mobile App API URL

### File: `JobHubMobile-Expo/src/api/client.js`

**Find this line (around line 6-9):**
```javascript
const API_URL = 'http://localhost:5000/api';
```
or
```javascript
const API_URL = 'http://192.168.1.100:5000/api';  // Old IP
```

**Change to YOUR IP from Step 1:**
```javascript
const API_URL = 'http://192.168.1.5:5000/api';  // ← YOUR IP HERE
```

**Keep:**
- The `http://` prefix
- The `:5000` port
- The `/api` path

**Only change:** The IP address (`192.168.1.5` → yours)

**Save the file.**

---

## Step 3: Update Backend CORS Settings

### File: `JobNova-main/backend/.env`

**Find the CORS line** (look for one of these):
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```
or
```env
ALLOWED_ORIGINS=http://localhost:3000
```

**Add your IP addresses:**
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5000,http://192.168.1.5:8081,http://192.168.1.5:19000,http://192.168.1.5:5000
```

**Why three ports?**
- `:8081` - Expo Metro bundler port
- `:19000` - Expo dev tools port  
- `:5000` - Your API port (just in case)

**Replace `192.168.1.5` with YOUR IP from Step 1.**

**Save the file.**

---

## Step 4: Restart Both Servers

### Stop Both Servers:
- Press `Ctrl + C` in both terminals (backend and Expo)

### Restart Backend:
```bash
cd C:\Projects\jobhub\JobNova-main\backend
npm run dev
```

**Wait for:**
```
✅ PostgreSQL connection successful!
JobNova Server running on port 5000
```

### Restart Expo:
```bash
cd C:\Projects\jobhub\JobHubMobile-Expo
npx expo start
```

**Wait for:**
```
Metro waiting on exp://192.168.1.5:8081
› Press a │ open Android
QR code appears
```

---

## Step 5: Test on Your Phone

1. **Open Expo Go** on your phone
2. **Verify WiFi**: Make sure phone is on the **same WiFi** as your computer
3. **Scan QR code** from the terminal
4. **App should load** on your phone

---

## Step 6: Test Login

### Create Test User (if not already):
Use Postman, curl, or browser:
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "user_id": "testuser",
  "phone": "03001234567",
  "password": "password123",
  "role": "employer",
  "first_name": "Test",
  "last_name": "User"
}
```

### Login in Mobile App:
- Username: `testuser`
- Password: `password123`
- Tap **Login**

### Check Backend Terminal:
You should see:
```
📤 POST /auth/login
📥 POST /auth/login - 200
```

---

## ✅ Success Checklist

- [ ] Found your IP address (192.168.x.x)
- [ ] Updated `client.js` with your IP
- [ ] Updated `backend/.env` CORS with your IP
- [ ] Restarted backend server
- [ ] Restarted Expo server
- [ ] Phone and computer on same WiFi
- [ ] Scanned QR code
- [ ] App loaded on phone
- [ ] Login screen visible
- [ ] Tried logging in
- [ ] Backend received API call
- [ ] Login works or shows proper error

---

## 🐛 Troubleshooting

### Issue: "Network request failed"

**Cause:** Phone can't reach your computer

**Check:**
1. Both devices on same WiFi?
2. IP correct in `client.js`?
3. Backend running?
4. CORS includes your IP?

**Test Connection:**
Open your phone's browser and go to:
```
http://YOUR_IP:5000/api/health
```

**Expected:** Should show JSON response  
**If fails:** Network issue - check firewall, WiFi, IP

---

### Issue: "CORS error" or "Preflight failed"

**Cause:** Backend not accepting requests from your IP

**Fix:**
1. Check `.env` has all three ports (8081, 19000, 5000)
2. No spaces in CORS_ORIGINS list
3. Restart backend after changing .env
4. Clear Expo cache: `npx expo start -c`

---

### Issue: "Timeout" or "Could not connect"

**Cause:** Backend not reachable or firewall blocking

**Fix:**
1. Check backend is running (should see port 5000 message)
2. Check Windows Firewall isn't blocking Node.js
3. Try accessing `http://YOUR_IP:5000/api/health` from phone browser
4. If firewall issue, allow Node.js through firewall:
   - Windows: Settings → Firewall → Allow an app

---

### Issue: Wrong IP after WiFi change

**Cause:** Your IP changed (reconnected to WiFi, different network)

**Fix:**
1. Run `ipconfig` again to get new IP
2. Update `client.js` with new IP
3. Update `backend/.env` with new IP
4. Restart both servers

---

### Issue: "Unable to resolve hostname"

**Cause:** Invalid IP format

**Fix:**
Check format is exactly:
```javascript
const API_URL = 'http://192.168.1.5:5000/api';
```

- Has `http://` (not `https://`)
- Has port `:5000`
- Has path `/api`
- No trailing slash
- No spaces

---

## 📋 Quick Reference

### Files to Edit:
```
1. JobHubMobile-Expo/src/api/client.js
   Line ~6-9: API_URL = 'http://YOUR_IP:5000/api'

2. JobNova-main/backend/.env
   CORS_ORIGINS line: Add YOUR_IP with ports 8081, 19000, 5000
```

### Commands:
```bash
# Find IP
ipconfig                          # Windows
ipconfig getifaddr en0            # Mac
hostname -I                       # Linux

# Restart Backend
cd JobNova-main/backend
npm run dev

# Restart Expo
cd JobHubMobile-Expo
npx expo start

# Test API from phone browser
http://YOUR_IP:5000/api/health
```

---

## 🎯 What Should Happen

### When Everything Works:

1. **Expo starts:**
   ```
   Metro waiting on exp://192.168.1.5:8081
   ```

2. **Phone scans QR:** App loads

3. **Login screen appears:** Can type in inputs

4. **Login button tapped:** 
   - Loading spinner shows
   - Backend logs show API call
   - Either success or proper error message

5. **Backend terminal:**
   ```
   📤 POST /auth/login
   📥 POST /auth/login - 200
   ```

---

## 💡 Pro Tips

### Tip 1: Static IP (Optional)
If your IP keeps changing, set a static IP in your router settings for your computer. This way you won't need to update files every time.

### Tip 2: Check Firewall
If you keep getting timeouts, temporarily disable Windows Firewall to test. If it works, then allow Node.js through the firewall.

### Tip 3: Test Backend First
Before testing mobile, verify backend is accessible:
1. Open browser on your phone
2. Go to: `http://YOUR_IP:5000/api/health`
3. Should see: `{"status":"ok","message":"JobNova API is running"}`
4. If this fails, mobile app won't work either

### Tip 4: WiFi Must Be Same
- Computer WiFi: "Home-WiFi"
- Phone WiFi: Must also be "Home-WiFi"
- Not: Mobile data, different WiFi, guest network

---

## 🎉 Success!

When you see:
- ✅ App loads on phone
- ✅ Login screen renders
- ✅ Can type in fields
- ✅ Backend logs show API call
- ✅ Login works or shows error

**You're ready for the next phase!**

Report back:
```
✅ Network setup complete!
✅ App connecting to backend!
✅ Login tested successfully!
```

Then I'll build all the remaining screens! 🚀

---

**Time Estimate:** 5-10 minutes  
**Difficulty:** Easy (just updating two files)
