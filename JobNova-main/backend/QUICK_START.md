# 🚀 Quick Start Guide - Refactored Backend

## What Changed?

Your JobHub backend has been professionally refactored with enterprise-grade patterns. Here's what's new:

### ✅ **Phase 1 Complete** (Critical Foundation)
1. ✅ Standardized API responses (consistent JSON structure)
2. ✅ Centralized error handling (custom error classes)
3. ✅ Input validation (all endpoints protected)
4. ✅ Pagination support (page & limit)
5. ✅ Security headers (Helmet)
6. ✅ Request logging (Morgan)
7. ✅ CORS improvements (mobile-ready)
8. ✅ Configuration management (centralized config)

---

## 🔧 Setup Instructions

### 1. Install New Dependencies
```bash
cd JobNova-main/backend
npm install
```

**New packages installed:**
- `helmet` - Security headers
- `morgan` - HTTP logging
- `compression` - Response compression

### 2. Update Environment Variables

Copy the new `.env.example` to verify your `.env` has all required variables:

```bash
cp .env.example .env.sample
```

**Critical env vars:**
- `JWT_SECRET` (required - server won't start without it)
- `NODE_ENV` (set to 'production' for production)
- `CORS_ORIGINS` (comma-separated list of allowed origins)

### 3. Restart Your Server

**Stop existing server** (if running):
- Close the "JobNova Backend" command window
- Or press `Ctrl+C` in the terminal

**Start fresh:**
```bash
npm run dev
```

**Or use the batch file:**
```bash
start_project.bat
```

### 4. Verify It's Working

Open your browser or Postman:

**Health Check:**
```
GET http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "JobNova API is running",
  "timestamp": "2026-07-06T10:30:00.000Z"
}
```

---

## 📱 For React Native Mobile App Developers

### API Response Format (Changed!)

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-07-06T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "VALIDATION_ERROR",
  "details": { ... },
  "timestamp": "2026-07-06T10:30:00.000Z"
}
```

**Pagination Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2026-07-06T10:30:00.000Z"
}
```

### Error Codes You'll Encounter:

| Code | Status | Meaning |
|------|--------|---------|
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `UNAUTHORIZED` | 401 | Not logged in / Invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate resource (e.g., email exists) |
| `BAD_REQUEST` | 400 | Malformed request |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### Example: Login Request

```javascript
// React Native fetch example
const login = async (identifier, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password })
    });

    const result = await response.json();

    if (result.success) {
      // Success!
      const { user, token } = result.data;
      // Store token
      await AsyncStorage.setItem('token', token);
      return { success: true, user, token };
    } else {
      // Error occurred
      return {
        success: false,
        message: result.message,
        errorCode: result.errorCode
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Network error',
      errorCode: 'NETWORK_ERROR'
    };
  }
};
```

### Example: Get Jobs with Pagination

```javascript
const getJobs = async (page = 1, limit = 20, type = 'white') => {
  try {
    const token = await AsyncStorage.getItem('token');
    const url = `http://localhost:5000/api/jobs?page=${page}&limit=${limit}&type=${type}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.success) {
      return {
        jobs: result.data,
        pagination: result.pagination,
        hasMore: result.pagination.hasNext
      };
    }

    return { jobs: [], hasMore: false };
  } catch (error) {
    console.error('Get jobs error:', error);
    return { jobs: [], hasMore: false };
  }
};
```

### Example: Error Handling

```javascript
const handleError = (result) => {
  switch (result.errorCode) {
    case 'VALIDATION_ERROR':
      // Show field-level errors
      if (result.details) {
        result.details.forEach(err => {
          console.log(`${err.field}: ${err.message}`);
        });
      }
      break;

    case 'UNAUTHORIZED':
      // Token expired or invalid - logout user
      navigation.navigate('Login');
      break;

    case 'FORBIDDEN':
      // User doesn't have permission
      Alert.alert('Access Denied', result.message);
      break;

    case 'NOT_FOUND':
      Alert.alert('Not Found', result.message);
      break;

    case 'CONFLICT':
      // Duplicate resource (e.g., user already exists)
      Alert.alert('Conflict', result.message);
      break;

    default:
      Alert.alert('Error', result.message || 'Something went wrong');
  }
};
```

---

## 🌐 For Frontend (React) Developers

### Update Your API Utility

**Old format (won't work anymore):**
```javascript
const response = await axios.post('/api/auth/login', data);
const { user, token } = response.data;
```

**New format:**
```javascript
const response = await axios.post('/api/auth/login', data);
if (response.data.success) {
  const { user, token } = response.data.data;
} else {
  // Handle error
  console.error(response.data.message);
}
```

### Create a Response Handler

```javascript
// utils/api.js
export const handleApiResponse = (response) => {
  if (response.data.success) {
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } else {
    return {
      success: false,
      message: response.data.message,
      errorCode: response.data.errorCode,
      details: response.data.details
    };
  }
};

// Usage:
const result = handleApiResponse(await axios.post('/api/auth/login', data));
if (result.success) {
  // Success
} else {
  // Error
  showError(result.message);
}
```

---

## 🧪 Testing with Postman/Insomnia

### Test 1: Registration with Validation

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "user_id": "john_employer",
  "phone": "03001234567",
  "password": "SecurePass123",
  "role": "employer",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Expected:** 201 Created with user data and token

### Test 2: Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "identifier": "john_employer",
  "password": "SecurePass123"
}
```

### Test 3: Get Jobs (with pagination)

```
GET http://localhost:5000/api/jobs?page=1&limit=10&type=white
Authorization: Bearer YOUR_JWT_TOKEN
```

### Test 4: Validation Error

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "user_id": "ab",
  "password": "123"
}
```

**Expected:** 422 with validation errors

---

## 🔒 Security Improvements

1. **Helmet Headers**
   - X-Frame-Options
   - X-Content-Type-Options
   - X-DNS-Prefetch-Control
   - Strict-Transport-Security (HSTS)

2. **Input Validation**
   - SQL injection protection
   - XSS prevention
   - Length validation
   - Type checking

3. **Enhanced Auth**
   - Token expiry detection
   - Better error messages
   - Role-based access control

4. **CORS**
   - Origin validation
   - Credentials support
   - Method whitelisting

---

## 📋 Common Issues & Solutions

### Issue 1: "Token is not valid"
**Solution:** Token expired. Login again to get new token.

### Issue 2: "EADDRINUSE: address already in use"
**Solution:** Port 5000 is busy. Stop existing server or change PORT in .env

### Issue 3: Validation errors on existing endpoints
**Solution:** Check required fields. All fields now have validation rules.

### Issue 4: CORS errors from mobile app
**Solution:** Add your mobile app's origin to CORS_ORIGINS in .env

---

## 📖 Additional Resources

- **Full Refactoring Details:** See `REFACTORING_SUMMARY.md`
- **Environment Variables:** See `.env.example`
- **API Documentation:** Coming soon (Task #14)

---

## 🆘 Need Help?

Check logs for detailed error messages:
```bash
# Terminal will show colored logs in development mode
npm run dev
```

---

**Last Updated:** July 6, 2026  
**Backend Version:** 2.0.0  
**Node.js:** v16+ required
