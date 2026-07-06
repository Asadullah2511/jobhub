# 📱 JobHub - Expo Migration Steps (Manual)

## 🎯 Goal
Migrate from bare React Native CLI to Expo for easier development and testing.

---

## ✅ Step-by-Step Instructions

### **Step 1: Backup Current Work**
```bash
cd C:\Projects\jobhub
rename JobHubMobile JobHubMobile-backup
```

### **Step 2: Create Fresh Expo Project**
```bash
npx create-expo-app@latest JobHubMobile --template blank
cd JobHubMobile
```

You should see:
```
✅ Your project is ready!
```

### **Step 3: Install All Dependencies**
```bash
# Core Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
expo install react-native-screens react-native-safe-area-context react-native-gesture-handler

# UI Components
npm install react-native-paper

# State & API
npm install zustand axios
expo install @react-native-async-storage/async-storage
expo install @react-native-community/netinfo
npm install socket.io-client

# Forms
npm install react-hook-form yup

# Expo Features
expo install expo-location
expo install expo-image-picker
expo install expo-document-picker
expo install expo-secure-store
expo install react-native-maps

# Utilities
npm install date-fns lodash jwt-decode
```

### **Step 4: Copy Our Code**
```bash
# Copy the src folder we created
xcopy /E /I ..\JobHubMobile-backup\src src
```

This copies:
- ✅ `src/api/` - API client and endpoints
- ✅ `src/store/` - Auth store
- ✅ `src/screens/auth/` - Login screen
- ✅ All folder structure

### **Step 5: Update API Client**

Edit `src/api/client.js`:

**Find your computer's IP address:**
```bash
# Windows
ipconfig
# Look for "IPv4 Address" - example: 192.168.1.100

# Mac/Linux  
ifconfig
# Look for "inet" - example: 192.168.1.100
```

**Update the API URL:**
```javascript
// Change this line:
const API_URL = Platform.select({
  android: __DEV__ ? 'http://10.0.2.2:5000/api' : ...
  
// To this:
const API_URL = __DEV__
  ? 'http://192.168.1.100:5000/api'  // ← YOUR IP HERE
  : 'https://your-production-url.com/api';
```

### **Step 6: Update Icon Imports**

**In any file that uses icons** (we'll do this as we create screens):

**Before:**
```javascript
import Icon from 'react-native-vector-icons/MaterialIcons';
```

**After:**
```javascript
import { MaterialIcons } from '@expo/vector-icons';

// Usage
<MaterialIcons name="check" size={24} color="black" />
```

### **Step 7: Create App.js**

Replace the default `App.js` with:

```javascript
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import LoginScreen from './src/screens/auth/LoginScreen';
import useAuthStore from './src/store/authStore';

export default function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    // Load saved session on app start
    loadUser();
  }, []);

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <LoginScreen />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
```

### **Step 8: Update Backend CORS**

Edit `JobNova-main/backend/.env`:

```env
# Add your computer's IP
CORS_ORIGINS=http://localhost:3000,http://localhost:5000,http://192.168.1.100:5000
```

**Restart backend:**
```bash
cd JobNova-main/backend
npm run dev
```

### **Step 9: Start Expo Development Server**

```bash
cd JobHubMobile
npx expo start
```

You'll see:
```
Metro waiting on exp://192.168.1.100:8081

› Press s │ switch to development build
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands

Logs for your project will appear below. Press Ctrl+C to exit.
```

### **Step 10: Test on Your Phone**

1. **Install Expo Go:**
   - Android: Play Store → "Expo Go"
   - iOS: App Store → "Expo Go"

2. **Connect to Same WiFi:**
   - Your phone and computer must be on the same WiFi network

3. **Scan QR Code:**
   - Android: Open Expo Go → Scan QR code
   - iOS: Open Camera → Scan QR code

4. **App loads on your phone!** 🎉

---

## 🧪 Testing the App

### **Test 1: App Loads**
- ✅ You should see the JobHub login screen
- ✅ Blue "JobHub" title
- ✅ Username and Password inputs

### **Test 2: Backend Connection**

First, create a test user in backend:

```bash
# Use Postman or curl
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "user_id": "testuser",
  "password": "password123",
  "role": "employer",
  "first_name": "Test",
  "last_name": "User"
}
```

Then test login in mobile app:
- Username: `testuser`
- Password: `password123`
- Click "Login"

**Expected:** 
- Loading spinner appears
- If successful: App saves token (we'll add navigation next)
- If error: Shows error message

### **Test 3: Check Logs**

In the terminal where `expo start` is running, you'll see:
```
📤 POST /auth/login
📥 POST /auth/login - 200
```

---

## 📊 Verification Checklist

- [ ] Expo project created successfully
- [ ] All dependencies installed
- [ ] `src` folder copied
- [ ] API URL updated with your IP
- [ ] App.js created
- [ ] Backend CORS updated
- [ ] Backend running
- [ ] Expo server started (`npx expo start`)
- [ ] QR code visible
- [ ] Expo Go installed on phone
- [ ] App loads on phone
- [ ] Login screen visible
- [ ] Can type in inputs
- [ ] Login button works
- [ ] API request logs visible

---

## 🐛 Troubleshooting

### Issue: "Unable to resolve module"
```bash
# Clear cache and restart
npx expo start -c
```

### Issue: "Network request failed"
```bash
# Check:
1. Backend is running (localhost:5000)
2. Your IP is correct in src/api/client.js
3. Phone and computer on same WiFi
4. Backend CORS includes your IP
```

### Issue: "Connection refused"
```bash
# Backend may not be accepting external connections
# Check backend .env has your IP in CORS_ORIGINS
```

### Issue: "QR code not working"
```bash
# Try tunnel mode
npx expo start --tunnel

# Or use LAN mode explicitly
npx expo start --lan
```

### Issue: "Metro bundler crashed"
```bash
# Reset everything
rm -rf node_modules
npm install
npx expo start -c
```

---

## 📁 Final Project Structure

```
JobHubMobile/
├── App.js                          ✅ Root component
├── app.json                        ✅ Expo config
├── package.json                    ✅ Dependencies
├── babel.config.js                 ✅ Auto-created
├── metro.config.js                 ✅ Auto-created
├── src/
│   ├── api/
│   │   ├── client.js              ✅ Updated with IP
│   │   ├── auth.js                ✅ Copied
│   │   └── jobs.js                ✅ Copied
│   ├── store/
│   │   └── authStore.js           ✅ Copied
│   ├── screens/
│   │   └── auth/
│   │       └── LoginScreen.js     ✅ Copied
│   ├── components/                ✅ Empty (will fill)
│   ├── navigation/                ✅ Empty (will fill)
│   ├── hooks/                     ✅ Empty (will fill)
│   ├── utils/                     ✅ Empty (will fill)
│   ├── services/                  ✅ Empty (will fill)
│   ├── theme/                     ✅ Empty (will fill)
│   └── assets/                    ✅ Empty (will fill)
└── node_modules/                  ✅ Installed
```

---

## 🎯 Success Criteria

### ✅ Setup Complete When:
1. Expo server starts without errors
2. QR code appears in terminal
3. App loads on phone via Expo Go
4. Login screen is visible and functional
5. API calls reach backend (check logs)
6. Can type in inputs smoothly
7. Login button responds

### Next Steps After Success:
1. Build Register screen
2. Add Navigation (Stack + Tabs)
3. Build Job List screen
4. Add Maps
5. Add Chat
6. Polish & deploy

---

## 💡 Key Differences from Bare RN

| Aspect | Bare RN CLI | Expo |
|--------|-------------|------|
| **Start Command** | `npm run android` | `npx expo start` |
| **Testing** | Emulator/USB debug | Expo Go app |
| **Icons** | react-native-vector-icons | @expo/vector-icons |
| **Location** | react-native-geolocation | expo-location |
| **Camera** | react-native-image-picker | expo-image-picker |
| **Secure Storage** | react-native-keychain | expo-secure-store |
| **API URL** | 10.0.2.2 (emulator) | Your local IP |
| **Build** | `./gradlew assembleRelease` | `eas build` |
| **Updates** | Rebuild app | OTA updates |

---

## 🚀 Quick Commands Reference

```bash
# Start development server
npx expo start

# Start with clear cache
npx expo start -c

# Start in tunnel mode (if LAN doesn't work)
npx expo start --tunnel

# Run on Android emulator (if you have one)
npx expo start --android

# Run on iOS simulator (Mac only)
npx expo start --ios

# Open in web browser
npx expo start --web

# Check for issues
npx expo-doctor

# Install Expo package
expo install package-name

# Update Expo SDK
npx expo upgrade
```

---

## 📱 Expo Go App

### Download:
- **Android:** https://play.google.com/store/apps/details?id=host.exp.exponent
- **iOS:** https://apps.apple.com/app/expo-go/id982107779

### Features:
- ✅ Instant app loading
- ✅ Hot reload (changes appear instantly)
- ✅ Shake to open developer menu
- ✅ Remote debugging
- ✅ Performance monitor
- ✅ Element inspector

---

## 🎉 What You Get with Expo

### ✅ Built-in Features:
- Camera
- Location
- Image Picker
- Document Picker
- Secure Storage
- Notifications (push)
- File System
- Sensors
- Maps
- 10+ icon sets
- Fonts
- Splash screen
- App icon
- And 50+ more!

### ✅ Developer Experience:
- Test on real device in seconds
- Hot reload
- Remote debugging
- Error overlay
- Performance monitor
- Network inspector
- No Android Studio needed (initially)
- No Xcode needed (initially)

### ✅ Deployment:
- Build APK with one command
- Over-the-air updates
- Automatic code signing
- App Store submission helper
- Beta testing (TestFlight/Internal testing)

---

## 📞 Summary

### What We're Doing:
1. ✅ Create Expo project
2. ✅ Copy our code (`src` folder)
3. ✅ Install dependencies
4. ✅ Update API URL
5. ✅ Test on phone

### What's Already Working:
- ✅ API client (axios with interceptors)
- ✅ Auth API endpoints
- ✅ Jobs API endpoints
- ✅ Auth store (Zustand)
- ✅ Login screen

### What's Different:
- ✅ Using Expo (not bare RN CLI)
- ✅ Testing on real phone (not emulator)
- ✅ Faster setup (5 min vs 2 hours)
- ✅ Same code works!

### Time Estimate:
- **Manual Setup:** 15-20 minutes
- **First App Load:** Instant
- **Backend Integration:** 5 minutes
- **Total:** ~30 minutes to working app on phone!

---

**Follow these steps carefully, and you'll have the app running on your phone in 30 minutes!** 🚀

**Once you confirm it's working, we'll continue building all the screens!** 📱
