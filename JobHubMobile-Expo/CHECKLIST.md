# ✅ JobHub Expo App - Setup Checklist

## 📋 Pre-Setup

- [ ] Node.js installed (`node -v` shows v18+)
- [ ] npm installed (`npm -v`)
- [ ] Backend folder exists (`JobNova-main/backend`)
- [ ] Phone has Expo Go app installed

---

## 🔧 Setup Steps

### 1. Find Your IP
- [ ] Run `ipconfig` (Windows) or `ifconfig getifaddr en0` (Mac)
- [ ] Write down your IPv4 address: `_____._____._____.____`
- [ ] Verify it starts with `192.168` or `10.0`

### 2. Update Mobile App
- [ ] Open `src/api/client.js`
- [ ] Find `const API_URL = 'http://...'`
- [ ] Replace with: `http://YOUR_IP:5000/api`
- [ ] Save file

### 3. Update Backend
- [ ] Open `../JobNova-main/backend/.env`
- [ ] Find `CORS_ORIGINS=...`
- [ ] Add: `,http://YOUR_IP:8081,http://YOUR_IP:19000,http://YOUR_IP:5000`
- [ ] Save file

### 4. Install Dependencies
```bash
cd JobHubMobile-Expo
npm install
```
- [ ] Installation completed without errors
- [ ] All packages installed successfully

### 5. Start Backend
```bash
cd ../JobNova-main/backend
npm run dev
```
- [ ] Backend starts without errors
- [ ] See: `✅ PostgreSQL connection successful!`
- [ ] See: `JobNova Server running on port 5000`
- [ ] Keep this terminal open

### 6. Start Expo
```bash
cd ../../JobHubMobile-Expo
npx expo start
```
- [ ] Expo starts without errors
- [ ] See QR code in terminal
- [ ] See: `Metro waiting on exp://...`
- [ ] Keep this terminal open

### 7. Connect Phone
- [ ] Phone on same WiFi as computer
- [ ] Open Expo Go app
- [ ] Scan QR code
- [ ] Wait for app to load

---

## 🧪 Testing

### App Loading
- [ ] App loads without red error screen
- [ ] No "Network request failed" message
- [ ] Login screen visible
- [ ] "JobHub" blue title shows
- [ ] Username input visible
- [ ] Password input visible
- [ ] "Login" button visible

### Input Testing
- [ ] Can tap username field
- [ ] Keyboard appears
- [ ] Can type in username
- [ ] Can tap password field
- [ ] Can type in password
- [ ] Eye icon toggles password visibility
- [ ] Can tap "Login" button

### Backend Connection
- [ ] Create test user via Postman/API tool
- [ ] Try logging in with test credentials
- [ ] Check backend terminal for logs
- [ ] See: `📤 POST /auth/login`
- [ ] See: `📥 POST /auth/login - 200` (or error status)

### Success Criteria
- [ ] Login attempt reaches backend
- [ ] Either: Token saved and login succeeds
- [ ] Or: Proper error message shows (not network error)

---

## 🐛 Troubleshooting Checks

If something doesn't work, check these:

### Network Issues
- [ ] Computer and phone on exact same WiFi?
- [ ] IP address correct in `client.js`?
- [ ] IP address correct in `backend/.env`?
- [ ] Both servers restarted after changes?
- [ ] Firewall not blocking Node.js?

### Backend Issues
- [ ] Backend terminal shows no errors?
- [ ] Database connection successful?
- [ ] Port 5000 not already in use?
- [ ] CORS_ORIGINS has your IP?

### Mobile App Issues
- [ ] `npm install` completed successfully?
- [ ] No red error screen?
- [ ] Expo Go app is latest version?
- [ ] Cleared cache: `npx expo start -c`?

### Test Backend Connectivity
- [ ] Open phone browser
- [ ] Go to: `http://YOUR_IP:5000/api/health`
- [ ] Should see JSON response
- [ ] If this fails, mobile won't work

---

## ✅ Final Verification

### Before Reporting Success:

1. **App Loads**
   - [ ] Opens without errors
   - [ ] Login screen fully visible
   - [ ] All UI elements present

2. **Inputs Work**
   - [ ] Can type in both fields
   - [ ] Password toggle works
   - [ ] No keyboard issues

3. **Backend Connected**
   - [ ] API call reaches backend
   - [ ] Backend logs show request
   - [ ] Response received (success or error)

4. **Login Function**
   - [ ] Test user created
   - [ ] Login attempted
   - [ ] Either succeeds or shows proper error
   - [ ] No network errors

---

## 📝 Report Format

### ✅ If Everything Works:
```
✅ Setup complete!
✅ App loaded successfully
✅ Login screen looks perfect
✅ API calls reaching backend
✅ Login function tested - works!
✅ Ready for next screens!

My IP: 192.168.x.x
```

### ❌ If There's an Issue:
```
❌ Issue at step: [step number/name]
Error message: [exact error text]
What I see: [describe what's on screen]
What I checked:
- [ ] IP is correct
- [ ] Backend is running
- [ ] Same WiFi
- [ ] etc.

Screenshot/photo: [if helpful]
```

---

## 🎯 Next Steps

### After Confirmation ✅:

I'll build these in order:

**Week 1-2:**
1. Register screen
2. Navigation (Stack + Tabs)
3. Splash screen
4. Role selection
5. Forgot password

**Week 3-4:**
6. Job list (with pagination)
7. Job detail
8. Job filters & search
9. Create job (employers)
10. Apply for job

**Week 5:**
11. Maps integration
12. Location services  
13. Nearby jobs
14. Job markers on map

**Week 6:**
15. Profile screens
16. Edit profile
17. Upload CV/images
18. Settings

**Week 7:**
19. Real-time chat
20. Chat list
21. Message screen
22. Typing indicators

**Week 8:**
23. Push notifications
24. Notification list
25. Badges

**Week 9-10:**
26. Applications management
27. Reviews/ratings
28. Polish & testing
29. Build APK
30. Deploy

---

## 💾 Important Files

```
Files You Edited:
1. JobHubMobile-Expo/src/api/client.js
2. JobNova-main/backend/.env

Files Created for You:
1. JobHubMobile-Expo/package.json
2. JobHubMobile-Expo/app.json
3. JobHubMobile-Expo/App.js
4. JobHubMobile-Expo/src/ [complete structure]

Documentation:
1. NETWORK_SETUP_GUIDE.md
2. SETUP_EXPO_APP.md
3. QUICK_START_EXPO.md
4. This CHECKLIST.md
```

---

## ⏱️ Time Estimate

- Find IP: 1 min
- Update files: 2 min
- Install dependencies: 3-5 min
- Start servers: 1 min
- Test on phone: 2 min
- **Total: 10-15 minutes**

---

## 🆘 Quick Help

### Get Help:
- Read: NETWORK_SETUP_GUIDE.md (detailed)
- Read: Troubleshooting section above
- Check: Backend logs for errors
- Check: Expo terminal for errors

### Common Fixes:
```bash
# Clear Expo cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install

# Check backend
curl http://localhost:5000/api/health
```

---

## 🎉 Success Indicators

You're ready when you see:

1. ✅ App on your phone
2. ✅ Login screen beautiful
3. ✅ Inputs responsive
4. ✅ Backend logs API calls
5. ✅ Login tested (success or proper error)

Then we build the rest of the app! 🚀

---

**Good luck!** 📱

Check off each item as you complete it. Report back when done!
