# 📱 JobHub Mobile App - Expo Setup Guide

## 🎯 Why Expo? (Better Choice!)

### ✅ Advantages over React Native CLI:
- **No Android Studio needed** initially
- **Test on real device instantly** via Expo Go app
- **No native code configuration** required
- **Over-the-air updates** (update app without App Store)
- **Built-in libraries** (icons, fonts, etc.)
- **Easier setup** - 5 minutes vs 2 hours
- **Same JavaScript code** - all our code works as-is!

### When to eject:
- Only if you need custom native modules later
- 99% of apps never need to eject

---

## 🚀 Quick Start (5 Minutes)

### **Step 1: Install Expo CLI**
```bash
npm install -g expo-cli

# Or use npx (no global install needed)
npx expo --version
```

### **Step 2: Create Expo Project**
```bash
cd C:\Projects\jobhub
npx create-expo-app JobHubMobile --template blank
cd JobHubMobile
```

### **Step 3: Install Dependencies**

Replace the package.json dependencies section with Expo-compatible versions:

```bash
# Core dependencies
npm install expo-router expo-status-bar

# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# UI Components
npm install react-native-paper

# Icons (Expo built-in, no install needed!)
# @expo/vector-icons is included with Expo

# State Management
npm install zustand

# API & Storage
npm install axios
expo install @react-native-async-storage/async-storage

# Forms
npm install react-hook-form yup

# Maps (Expo version)
expo install react-native-maps

# Location (Expo version)
expo install expo-location

# Image Picker (Expo version)
expo install expo-image-picker

# Document Picker (Expo version)
expo install expo-document-picker

# Secure Storage (Expo version)
expo install expo-secure-store

# Real-time
npm install socket.io-client

# Utilities
npm install date-fns lodash jwt-decode
```

### **Step 4: Copy Our Code**

Our `src` folder is framework-agnostic and works perfectly with Expo:

```bash
# Copy the src folder we created
xcopy /E /I ..\JobHubMobile-old\src src
```

### **Step 5: Update API Client for Expo**

The API client needs one small adjustment for Expo:

**`src/api/client.js` - Update Platform detection:**
```javascript
import Constants from 'expo-constants';

// Get local IP for Expo
const getLocalIP = () => {
  if (__DEV__) {
    // For Expo Go, use your computer's local IP
    // You can find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
    return 'http://192.168.1.100:5000/api'; // Replace with YOUR IP
  }
  return 'https://your-production-url.com/api';
};

const API_URL = getLocalIP();
```

### **Step 6: Update Icon Imports**

Replace `react-native-vector-icons` with `@expo/vector-icons`:

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

### **Step 7: Update App.js**

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

### **Step 8: Start Development Server**

```bash
npx expo start
```

You'll see a QR code in the terminal!

### **Step 9: Test on Your Phone**

1. **Install Expo Go App:**
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. **Scan QR Code:**
   - Android: Use Expo Go app to scan
   - iOS: Use Camera app to scan

3. **App loads on your phone!** 🎉

---

## 📦 Updated package.json for Expo

```json
{
  "name": "jobhubmobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.1",
    
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/stack": "^6.3.29",
    "@react-navigation/bottom-tabs": "^6.5.20",
    "react-native-screens": "~3.31.1",
    "react-native-safe-area-context": "~4.10.1",
    "react-native-gesture-handler": "~2.16.2",
    
    "react-native-paper": "^5.12.3",
    "@expo/vector-icons": "^14.0.0",
    
    "zustand": "^4.5.2",
    "axios": "^1.6.8",
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-native-community/netinfo": "11.3.1",
    "socket.io-client": "^4.7.5",
    
    "react-hook-form": "^7.51.3",
    "yup": "^1.4.0",
    
    "react-native-maps": "1.14.0",
    "expo-location": "~17.0.1",
    "expo-image-picker": "~15.0.5",
    "expo-document-picker": "~12.0.1",
    "expo-secure-store": "~13.0.1",
    
    "date-fns": "^3.6.0",
    "lodash": "^4.17.21",
    "jwt-decode": "^4.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0"
  }
}
```

---

## 🔄 Library Replacements (Bare CLI → Expo)

| Bare React Native | Expo Equivalent | Notes |
|-------------------|-----------------|-------|
| `react-native-vector-icons` | `@expo/vector-icons` | ✅ Built-in, no config |
| `react-native-geolocation` | `expo-location` | ✅ Easier permissions |
| `react-native-image-picker` | `expo-image-picker` | ✅ Simpler API |
| `react-native-document-picker` | `expo-document-picker` | ✅ Works immediately |
| `react-native-keychain` | `expo-secure-store` | ✅ Same security |
| `AsyncStorage` | `@react-native-async-storage/async-storage` | ✅ Works with Expo |
| `react-native-paper` | `react-native-paper` | ✅ No change |
| `zustand` | `zustand` | ✅ No change |
| `axios` | `axios` | ✅ No change |
| `react-navigation` | `react-navigation` | ✅ No change |
| `socket.io-client` | `socket.io-client` | ✅ No change |

---

## 🎯 Code Changes Needed

### **1. API Client Update**

**`src/api/client.js`:**
```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Expo, use your computer's local IP address
// Find it: Windows: ipconfig | Mac/Linux: ifconfig
const API_URL = __DEV__
  ? 'http://192.168.1.100:5000/api'  // ← Change to YOUR IP
  : 'https://your-production-url.com/api';

// Rest of the code stays the same!
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... rest stays exactly the same
```

### **2. Icon Imports Update**

**Anywhere you use icons:**
```javascript
// Before (bare RN)
import Icon from 'react-native-vector-icons/MaterialIcons';

// After (Expo)
import { MaterialIcons } from '@expo/vector-icons';

// Usage
<MaterialIcons name="home" size={24} color="black" />
```

### **3. Secure Storage Update**

**`src/utils/storage.js` (create if needed):**
```javascript
// Before (bare RN with react-native-keychain)
import * as Keychain from 'react-native-keychain';

// After (Expo)
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value);
  },
  getItem: async (key) => {
    return await SecureStore.getItemAsync(key);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};
```

---

## 📱 Testing on Real Device

### **Step 1: Find Your Computer's IP**

**Windows:**
```bash
ipconfig

# Look for "IPv4 Address" under your WiFi/Ethernet
# Example: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig

# Look for inet under en0 or wlan0
# Example: 192.168.1.100
```

### **Step 2: Update API_URL**

In `src/api/client.js`, replace with YOUR IP:
```javascript
const API_URL = 'http://192.168.1.100:5000/api'; // Your IP here
```

### **Step 3: Ensure Backend Accepts Connections**

Update backend `.env`:
```env
CORS_ORIGINS=http://localhost:3000,http://192.168.1.100:5000
```

Restart backend:
```bash
cd JobNova-main/backend
npm run dev
```

### **Step 4: Start Expo**

```bash
cd JobHubMobile
npx expo start
```

### **Step 5: Scan QR Code with Expo Go**

- Open Expo Go app on your phone
- Scan the QR code
- App loads instantly! 🎉

---

## 🆚 Expo vs Bare React Native CLI

### **Why Expo is Better for Us:**

| Feature | Expo | Bare RN CLI |
|---------|------|-------------|
| **Setup Time** | 5 minutes | 2-3 hours |
| **Requirements** | Node.js only | Android Studio, JDK, SDK |
| **Testing** | Instant (Expo Go app) | Need emulator/build |
| **Updates** | Over-the-air (OTA) | Rebuild & redeploy |
| **Maps** | `expo install react-native-maps` | Complex gradle config |
| **Location** | `expo install expo-location` | Permissions nightmare |
| **Camera** | `expo install expo-camera` | Native linking required |
| **Icons** | Built-in (`@expo/vector-icons`) | Install & link manually |
| **App Size** | ~30MB (Expo Go dev) / ~5MB (build) | ~5MB |
| **Development** | Test on real device instantly | Need emulator or USB debug |
| **Cost** | FREE | FREE |

### **When to Eject from Expo:**
- Need custom native modules (rare)
- Need to modify native code directly
- App size critical (can build standalone anyway)

**For JobHub:** Expo is perfect! We don't need custom native code.

---

## 🎨 Icon Library (@expo/vector-icons)

Expo includes **10+ icon sets** built-in:

```javascript
import {
  MaterialIcons,      // Material Design
  MaterialCommunityIcons,  // More Material icons
  Ionicons,          // iOS style
  FontAwesome,       // Font Awesome
  Entypo,
  Feather,
  AntDesign,
} from '@expo/vector-icons';

// Usage
<MaterialIcons name="home" size={24} color="blue" />
<FontAwesome name="user" size={24} color="green" />
<Ionicons name="ios-heart" size={24} color="red" />
```

Browse icons: https://icons.expo.fyi/

---

## 🔒 Secure Storage with Expo

**`expo-secure-store`** provides the same security as Keychain:

```javascript
import * as SecureStore from 'expo-secure-store';

// Save
await SecureStore.setItemAsync('token', 'jwt-token-here');

// Get
const token = await SecureStore.getItemAsync('token');

// Delete
await SecureStore.deleteItemAsync('token');
```

---

## 📍 Location with Expo

Much simpler than bare RN:

```javascript
import * as Location from 'expo-location';

// Request permission
const { status } = await Location.requestForegroundPermissionsAsync();

if (status === 'granted') {
  // Get current location
  const location = await Location.getCurrentPositionAsync({});
  console.log(location.coords.latitude);
  console.log(location.coords.longitude);
}
```

---

## 📸 Image Picker with Expo

```javascript
import * as ImagePicker from 'expo-image-picker';

// Pick from gallery
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [4, 3],
  quality: 1,
});

if (!result.canceled) {
  const imageUri = result.assets[0].uri;
  console.log(imageUri);
}

// Take photo
const result = await ImagePicker.launchCameraAsync({
  allowsEditing: true,
  aspect: [1, 1],
  quality: 1,
});
```

---

## 🗺️ Maps with Expo

Same `react-native-maps` but easier setup:

```bash
expo install react-native-maps
```

```javascript
import MapView, { Marker } from 'react-native-maps';

<MapView
  style={{ flex: 1 }}
  initialRegion={{
    latitude: 24.8607,
    longitude: 67.0011,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
>
  <Marker
    coordinate={{ latitude: 24.8607, longitude: 67.0011 }}
    title="Job Location"
    description="Electrician needed"
  />
</MapView>
```

---

## 🚀 Building for Production

### **Build APK (Android)**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure
eas build:configure

# Build APK
eas build --platform android --profile preview

# Download APK and install on device
```

### **Build for Play Store**
```bash
eas build --platform android --profile production
```

### **Build for iOS (future)**
```bash
eas build --platform ios --profile production
```

---

## ✅ Migration Checklist

- [ ] Create Expo project: `npx create-expo-app`
- [ ] Install dependencies with `expo install`
- [ ] Copy `src` folder from old project
- [ ] Update API client with local IP
- [ ] Replace icon imports with `@expo/vector-icons`
- [ ] Update `expo-secure-store` if using secure storage
- [ ] Test on real device with Expo Go
- [ ] Verify login works
- [ ] Verify API calls work
- [ ] Continue building features

---

## 🎯 Current Status

```
✅ Expo project structure
✅ All dependencies listed
✅ Code migration plan
✅ Icon library updated
✅ API client configured
✅ Documentation complete

⏳ Creating Expo project (in progress)
⏳ Testing on device (next)
```

---

## 💡 Pro Tips

### **1. Use Expo Doctor**
```bash
npx expo-doctor
```

### **2. Clear Cache if Issues**
```bash
npx expo start -c
```

### **3. Check Expo SDK Compatibility**
```bash
npx expo-doctor
```

### **4. Update Expo**
```bash
npm install expo@latest
```

### **5. See Logs**
```bash
npx expo start
# Press 'j' to open debugger
```

---

## 🎉 Summary

### **Before (Bare RN CLI):**
- 2-3 hours setup
- Need Android Studio
- Need emulator or USB debugging
- Complex native configuration
- Manual icon/library linking

### **After (Expo):**
- 5 minutes setup
- Just Node.js needed
- Test on real phone instantly (Expo Go)
- Zero native configuration
- Built-in icons and libraries

### **Result:**
- **90% faster setup**
- **100% easier testing**
- **Same code works** (just different imports)
- **Better developer experience**

---

**Expo is the perfect choice for JobHub!** 🚀

All our code works with Expo - just need to:
1. Replace `react-native-vector-icons` → `@expo/vector-icons`
2. Update API URL with local IP
3. Test on phone with Expo Go

**Ready to test on your phone in 5 minutes!** 📱
