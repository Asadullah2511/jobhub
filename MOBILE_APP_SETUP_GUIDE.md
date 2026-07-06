# 📱 JobHub Mobile App - Setup Guide

## 🎯 Tech Stack Overview

### **Framework: React Native (100% Free)**
- Write once, run on Android + iOS
- JavaScript/TypeScript
- Native performance
- Large ecosystem

---

## 🛠️ **Recommended Tech Stack**

### **Core Technologies**
```
Framework:       React Native 0.74+
Language:        JavaScript (or TypeScript)
Navigation:      React Navigation 6
UI Library:      React Native Paper (Material Design)
State:           Zustand (Simple) or Context API
API Client:      Axios
Storage:         AsyncStorage + React Native Keychain
Maps:            React Native Maps (Google Maps FREE)
Notifications:   Firebase Cloud Messaging (FREE)
Real-time:       Socket.io Client
```

### **Why This Stack?**
✅ **100% Free** - All libraries are open source  
✅ **Production-Ready** - Used by Facebook, Instagram, Discord  
✅ **Great Performance** - Native components  
✅ **Large Community** - Easy to find help  
✅ **Your Backend** - Already compatible (Node.js)  

---

## 💰 **Cost Breakdown: $0**

| Service | Free Tier | Paid After |
|---------|-----------|------------|
| React Native | ✅ Forever Free | N/A |
| Firebase (FCM) | ✅ Free for push notifications | N/A |
| Google Maps | ✅ 28,000 requests/month | $7/1000 requests |
| Expo (Optional) | ✅ Free tier available | $29/month (Pro) |
| App Store | ❌ $99/year | Required for iOS |
| Play Store | ❌ $25 one-time | Required for Android |

**Total for Development: $0**  
**Total for Publishing:**
- Android only: $25 one-time
- iOS only: $99/year
- Both: $124 first year, $99/year after

---

## 🚀 **Setup Instructions**

### **Step 1: Install Prerequisites**

#### Windows (Your OS)
```bash
# 1. Install Node.js 18+ (already have ✅)
node --version  # Should be v18+

# 2. Install Java Development Kit (JDK 17)
# Download from: https://adoptium.net/
# Or use chocolatey:
choco install temurin17

# 3. Install Android Studio
# Download from: https://developer.android.com/studio
# - Install Android SDK
# - Install Android SDK Platform 33
# - Install Android SDK Build-Tools 33.0.0
# - Create Android Virtual Device (AVD)

# 4. Set Environment Variables
# Add to System Environment Variables:
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\platform-tools
PATH=%PATH%;%ANDROID_HOME%\tools
PATH=%PATH%;%ANDROID_HOME%\tools\bin

# 5. Install React Native CLI
npm install -g react-native-cli
```

---

### **Step 2: Create New React Native Project**

```bash
cd C:\Projects\jobhub

# Create new React Native app
npx react-native@latest init JobHubMobile

# Navigate to project
cd JobHubMobile

# Test Android app
npx react-native run-android

# Test iOS app (Mac only)
npx react-native run-ios
```

---

### **Step 3: Install Required Dependencies**

```bash
# Core Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler

# UI Components
npm install react-native-paper react-native-vector-icons

# API & Networking
npm install axios @react-native-async-storage/async-storage @react-native-community/netinfo socket.io-client

# Forms & Validation
npm install react-hook-form yup

# State Management
npm install zustand

# Maps & Location
npm install react-native-maps react-native-geolocation-service

# Media & Files
npm install react-native-image-picker react-native-document-picker

# Security
npm install react-native-keychain jwt-decode

# Utilities
npm install date-fns moment lodash
```

---

### **Step 4: Configure Android**

#### Update `android/app/build.gradle`:
```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        applicationId "com.jobhub"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
    }
}

dependencies {
    implementation project(':react-native-maps')
    implementation 'com.google.android.gms:play-services-maps:18.1.0'
}
```

#### Update `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest>
    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application>
        <!-- Google Maps API Key -->
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
    </application>
</manifest>
```

---

### **Step 5: Project Structure**

```
JobHubMobile/
├── src/
│   ├── api/
│   │   ├── axios.js              # API client configuration
│   │   ├── auth.js               # Auth endpoints
│   │   ├── jobs.js               # Job endpoints
│   │   └── profile.js            # Profile endpoints
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Card.js
│   │   │   └── Loading.js
│   │   ├── jobs/
│   │   │   ├── JobCard.js
│   │   │   ├── JobList.js
│   │   │   └── JobMap.js
│   │   └── chat/
│   │       ├── ChatList.js
│   │       └── ChatMessage.js
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── jobs/
│   │   │   ├── JobListScreen.js
│   │   │   ├── JobDetailScreen.js
│   │   │   ├── JobMapScreen.js
│   │   │   └── CreateJobScreen.js
│   │   ├── profile/
│   │   │   ├── ProfileScreen.js
│   │   │   └── EditProfileScreen.js
│   │   └── chat/
│   │       └── ChatScreen.js
│   ├── navigation/
│   │   ├── AppNavigator.js       # Main navigator
│   │   ├── AuthNavigator.js      # Auth screens
│   │   └── MainNavigator.js      # App screens
│   ├── store/
│   │   ├── authStore.js          # Auth state (Zustand)
│   │   ├── jobStore.js           # Jobs state
│   │   └── userStore.js          # User state
│   ├── utils/
│   │   ├── storage.js            # AsyncStorage helper
│   │   ├── validation.js         # Form validation
│   │   └── constants.js          # App constants
│   ├── hooks/
│   │   ├── useAuth.js            # Auth hook
│   │   ├── useJobs.js            # Jobs hook
│   │   └── useLocation.js        # Location hook
│   ├── theme/
│   │   ├── colors.js             # Color palette
│   │   ├── fonts.js              # Typography
│   │   └── theme.js              # Main theme
│   └── App.js                    # Root component
├── android/                      # Android native code
├── ios/                          # iOS native code (Mac only)
├── package.json
└── README.md
```

---

## 📝 **Code Examples**

### **1. API Configuration (`src/api/axios.js`)**

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Base URL
const API_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',  // Android emulator
  ios: 'http://localhost:5000/api',      // iOS simulator
  default: 'http://localhost:5000/api'
});

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add token)
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('token');
        // Navigate to login
      }
      
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

### **2. Auth Store (`src/store/authStore.js`)**

```javascript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  // Login
  login: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', {
        identifier,
        password,
      });

      if (response.success) {
        const { user, token } = response.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        set({ user, token, loading: false });
        return { success: true };
      }
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Register
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.success) {
        const { user, token } = response.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        set({ user, token, loading: false });
        return { success: true };
      }
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null });
  },

  // Load user from storage
  loadUser: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token });
      }
    } catch (error) {
      console.error('Load user error:', error);
    }
  },
}));

export default useAuthStore;
```

---

### **3. Login Screen (`src/screens/auth/LoginScreen.js`)**

```javascript
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import useAuthStore from '../../store/authStore';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const result = await login(identifier, password);
    
    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        JobHub
      </Text>
      
      <TextInput
        label="Username or Phone"
        value={identifier}
        onChangeText={setIdentifier}
        style={styles.input}
        mode="outlined"
        autoCapitalize="none"
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />
      
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : 'Login'}
      </Button>
      
      <Button
        mode="text"
        onPress={() => navigation.navigate('Register')}
      >
        Don't have an account? Register
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default LoginScreen;
```

---

## 🎨 **UI Library Comparison**

### **Option 1: React Native Paper (Recommended)**
```
Pros:
✅ Material Design (Google's design system)
✅ Well documented
✅ Many components
✅ Theme support
✅ Accessibility built-in

Cons:
❌ Opinionated (Material Design only)
```

### **Option 2: React Native Elements**
```
Pros:
✅ Flexible styling
✅ Cross-platform consistency
✅ Easy to customize

Cons:
❌ Fewer components than Paper
```

### **Option 3: NativeBase**
```
Pros:
✅ Many components
✅ Theme support
✅ Responsive

Cons:
❌ Larger bundle size
```

**Recommendation: React Native Paper** for Material Design consistency

---

## 🗺️ **Maps Setup (Free)**

### **Google Maps Platform (FREE)**

1. **Get API Key:**
   - Go to: https://console.cloud.google.com/
   - Create project
   - Enable Maps SDK for Android
   - Enable Maps SDK for iOS
   - Create API key

2. **Free Tier:**
   - 28,000 map loads/month FREE
   - Good for ~900 users/day
   - No credit card required for free tier

3. **Configure:**
   ```javascript
   // android/app/src/main/AndroidManifest.xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_API_KEY"/>
   ```

---

## 🔔 **Push Notifications Setup (FREE)**

### **Firebase Cloud Messaging**

1. **Create Firebase Project:**
   - Go to: https://console.firebase.google.com/
   - Create new project (FREE)
   - Add Android app
   - Download `google-services.json`

2. **Install:**
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/messaging
   ```

3. **Configure Android:**
   ```gradle
   // android/build.gradle
   buildscript {
       dependencies {
           classpath 'com.google.gms:google-services:4.3.15'
       }
   }

   // android/app/build.gradle
   apply plugin: 'com.google.gms.google-services'
   ```

4. **Usage:**
   ```javascript
   import messaging from '@react-native-firebase/messaging';

   // Request permission
   async function requestUserPermission() {
     const authStatus = await messaging().requestPermission();
     const enabled =
       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

     if (enabled) {
       console.log('Authorization status:', authStatus);
     }
   }

   // Get token
   const token = await messaging().getToken();
   console.log('FCM Token:', token);

   // Listen for messages
   messaging().onMessage(async remoteMessage => {
     console.log('FCM Message:', remoteMessage);
   });
   ```

---

## 🚀 **Development Workflow**

### **Daily Development**
```bash
# 1. Start Metro bundler
npm start

# 2. Run Android (in new terminal)
npm run android

# 3. Enable hot reload
# Press 'r' in Metro terminal to reload
# Press 'd' for developer menu
```

### **Testing on Real Device**

**Android:**
1. Enable Developer Options on phone
2. Enable USB Debugging
3. Connect phone via USB
4. Run: `npm run android`

**Tips:**
- Use `adb devices` to list connected devices
- Use `adb reverse tcp:5000 tcp:5000` to access local backend

---

## 📦 **Building APK (Android)**

### **Debug APK** (for testing)
```bash
cd android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### **Release APK** (for Play Store)
```bash
# Generate signing key
keytool -genkeypair -v -storetype PKCS12 -keystore jobhub.keystore -alias jobhub -keyalg RSA -keysize 2048 -validity 10000

# Build release
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 🎯 **Performance Optimization**

### **Best Practices**
```javascript
// 1. Use FlatList for long lists (not ScrollView)
<FlatList
  data={jobs}
  renderItem={({ item }) => <JobCard job={item} />}
  keyExtractor={(item) => item.id}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>

// 2. Memoize components
const JobCard = React.memo(({ job }) => {
  return <Card>{job.title}</Card>;
});

// 3. Use useCallback for functions
const handlePress = useCallback(() => {
  navigation.navigate('JobDetail', { id: job.id });
}, [job.id]);

// 4. Image optimization
<Image
  source={{ uri: job.image }}
  style={styles.image}
  resizeMode="cover"
/>
```

---

## 📱 **Expo vs React Native CLI**

### **React Native CLI (Recommended for You)**
```
Pros:
✅ Full control over native code
✅ Better for custom features (maps, voice, etc.)
✅ Smaller app size
✅ No Expo limitations

Cons:
❌ More complex setup
❌ Need Android Studio / Xcode
```

### **Expo (Alternative)**
```
Pros:
✅ Easier setup
✅ No native configuration needed
✅ Web preview available

Cons:
❌ Larger app size
❌ Limited native modules
❌ Can't use all libraries
```

**Your Project: Use React Native CLI** (you need full maps & voice features)

---

## 💡 **Next Steps**

### **Week 1: Setup**
1. [ ] Install prerequisites
2. [ ] Create React Native project
3. [ ] Install dependencies
4. [ ] Configure Android
5. [ ] Test on emulator

### **Week 2-3: Core Features**
1. [ ] Authentication screens
2. [ ] Job listing (with pagination)
3. [ ] Job details
4. [ ] Profile screen
5. [ ] API integration

### **Week 4-5: Advanced Features**
1. [ ] Map view for jobs
2. [ ] Real-time chat
3. [ ] Push notifications
4. [ ] File uploads (CV, images)
5. [ ] Geolocation

### **Week 6: Polish**
1. [ ] UI improvements
2. [ ] Error handling
3. [ ] Loading states
4. [ ] Testing
5. [ ] Build APK

---

## 📚 **Learning Resources (FREE)**

- **Official Docs:** https://reactnative.dev/
- **React Navigation:** https://reactnavigation.org/
- **React Native Paper:** https://callstack.github.io/react-native-paper/
- **YouTube:** William Candillon, Catalin Miron
- **Practice:** Build your JobHub app!

---

## 🆘 **Common Issues**

### Issue: "SDK location not found"
```bash
# Create local.properties in android folder
sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

### Issue: "Unable to load script"
```bash
# Clear cache
npm start -- --reset-cache
```

### Issue: "Command failed: gradlew"
```bash
# Clean gradle
cd android
./gradlew clean
```

---

## 💰 **Total Cost Summary**

### **Development Phase: $0**
- React Native: FREE
- All libraries: FREE
- Firebase: FREE (up to 10GB/month)
- Google Maps: FREE (28k requests/month)
- Development tools: FREE

### **Publishing:**
- Android Play Store: $25 (one-time)
- iOS App Store: $99/year

### **Running Costs:**
- Backend: Your existing server (free on local/VPS)
- Push notifications: FREE
- Maps: FREE (unless you exceed 28k/month)

**Estimated Total Year 1: $25-124** (depending on platform)

---

## ✅ **Recommendation**

**Start with React Native CLI + Android Only:**
1. Faster to test (no iOS requirements)
2. Lower cost ($25 vs $99)
3. 70% of market in developing countries
4. Add iOS later when ready

**Your Perfect Stack:**
```
✅ React Native CLI
✅ React Navigation
✅ React Native Paper
✅ Zustand (state)
✅ Axios (API)
✅ React Native Maps
✅ Firebase (push notifications)
✅ Socket.io (real-time chat)
```

**Total Setup Time: 2-3 days**  
**Total Development Time: 6-8 weeks**  
**Total Cost: $0 (development) + $25 (publishing)**

---

Ready to start? I can help you:
1. Create the React Native project structure
2. Set up API integration
3. Build authentication screens
4. Implement job listing with pagination
5. Add maps & location features

**Let me know when you're ready to begin!** 🚀
