# 📡 API Response Format Guide

## Overview
This document defines the standardized response format for all JobHub API endpoints. Use this as a reference when integrating with web or mobile applications.

---

## Base Response Structure

### Success Response
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string; // ISO 8601 format
  meta?: object; // Optional metadata
}
```

### Error Response
```typescript
interface ErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  timestamp: string;
  details?: any; // Field-level errors for validation
  stack?: string; // Only in development mode
}
```

---

## HTTP Status Codes

| Status | Code | When Used |
|--------|------|-----------|
| OK | 200 | Successful GET, PUT, PATCH |
| Created | 201 | Successful POST (resource created) |
| No Content | 204 | Successful DELETE |
| Bad Request | 400 | Malformed request |
| Unauthorized | 401 | Not authenticated |
| Forbidden | 403 | Not authorized |
| Not Found | 404 | Resource doesn't exist |
| Conflict | 409 | Duplicate resource |
| Validation Error | 422 | Input validation failed |
| Internal Server Error | 500 | Server error |
| Service Unavailable | 503 | External service error |

---

## Error Codes

### Authentication Errors (401)
```
UNAUTHORIZED
```

### Authorization Errors (403)
```
FORBIDDEN
```

### Validation Errors (422)
```
VALIDATION_ERROR
```

### Resource Errors (404)
```
NOT_FOUND
ROUTE_NOT_FOUND
```

### Conflict Errors (409)
```
CONFLICT
```

### Server Errors (500)
```
INTERNAL_SERVER_ERROR
DATABASE_ERROR
```

### External Service Errors (503)
```
SERVICE_UNAVAILABLE
```

---

## Response Examples

### 1. Successful Registration
```http
POST /api/auth/register
Status: 201 Created
```

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "john_employer",
      "phone": "03001234567",
      "role": "employer",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2026-07-06T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful",
  "timestamp": "2026-07-06T10:30:00.123Z"
}
```

### 2. Successful Login
```http
POST /api/auth/login
Status: 200 OK
```

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "john_employer",
      "role": "employer",
      "first_name": "John",
      "last_name": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful",
  "timestamp": "2026-07-06T10:30:00.123Z"
}
```

### 3. Get Jobs with Pagination
```http
GET /api/jobs?page=1&limit=20&type=white
Status: 200 OK
```

```json
{
  "success": true,
  "data": [
    {
      "id": "job-uuid-1",
      "title": "Senior React Developer",
      "description": "Looking for experienced React developer...",
      "type": "white",
      "location": "Karachi, Pakistan",
      "salary_range": "150,000 - 250,000 PKR",
      "skills": "React, TypeScript, Node.js",
      "created_at": "2026-07-05T10:00:00.000Z",
      "profiles": {
        "full_name": "ABC Company",
        "company_name": "ABC Tech Solutions",
        "location": "Karachi"
      }
    },
    // ... more jobs
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2026-07-06T10:30:00.123Z"
}
```

### 4. Create Job
```http
POST /api/jobs
Status: 201 Created
```

```json
{
  "success": true,
  "data": {
    "id": "job-uuid-123",
    "employer_id": "user-uuid-456",
    "title": "Electrician Needed",
    "description": "Need electrician for home wiring...",
    "type": "blue",
    "location": "Lahore",
    "hourly_rate": "500 PKR",
    "duration": "2 hours",
    "status": "Active",
    "latitude": 31.5204,
    "longitude": 74.3587,
    "created_at": "2026-07-06T10:30:00.000Z"
  },
  "message": "Job posted successfully",
  "timestamp": "2026-07-06T10:30:00.123Z"
}
```

### 5. Validation Error
```http
POST /api/auth/register
Status: 422 Unprocessable Entity
```

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 6 characters",
      "value": "123"
    },
    {
      "field": "user_id",
      "message": "User ID is required",
      "value": ""
    }
  ],
  "timestamp": "2026-07-06T10:30:00.123Z"
}
```

### 6. Authentication Error
```http
POST /api/auth/login
Status: 401 Unauthorized
```

```json
{
  "success": false,
  "message": "Invalid credentials",
  "errorCode": "UNAUTHORIZED",
  "timestamp": "2026-07-06T10:30:00.123Z"
}
```

### 7. Authorization Error
```http
POST /api/jobs
Status: 403 Forbidden
```

```json
{
  "success": false,
  "message": "Access denied. Required roles: employer, admin",
  "errorCode": "FORBIDDEN",
  "timestamp": "2026-07-06T10:30:00.123Z"
}
```

### 8. Resource Not Found
```http
GET /api/jobs/invalid-uuid
Status: 404 Not Found
```

```json
{
  "success": false,
  "message": "Job not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2026-07-06T10:30:00.123Z"
}
```

### 9. Conflict Error
```http
POST /api/auth/register
Status: 409 Conflict
```

```json
{
  "success": false,
  "message": "User ID already taken",
  "errorCode": "CONFLICT",
  "timestamp": "2026-07-06T10:30:00.123Z"
}
```

### 10. Server Error
```http
GET /api/jobs
Status: 500 Internal Server Error
```

```json
{
  "success": false,
  "message": "Database connection failed",
  "errorCode": "DATABASE_ERROR",
  "timestamp": "2026-07-06T10:30:00.123Z"
}
```

---

## Pagination

All list endpoints support pagination via query parameters:

### Query Parameters
```
?page=1          // Page number (default: 1)
&limit=20        // Items per page (default: 20, max: 100)
```

### Pagination Metadata
```json
{
  "pagination": {
    "page": 1,           // Current page
    "limit": 20,         // Items per page
    "total": 150,        // Total items
    "totalPages": 8,     // Total pages
    "hasNext": true,     // Has next page
    "hasPrev": false     // Has previous page
  }
}
```

### Mobile Implementation Example (React Native)
```javascript
const [data, setData] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

const loadMore = async () => {
  if (loading || !hasMore) return;

  setLoading(true);
  const response = await fetch(`/api/jobs?page=${page}&limit=20`);
  const result = await response.json();

  if (result.success) {
    setData([...data, ...result.data]);
    setPage(page + 1);
    setHasMore(result.pagination.hasNext);
  }
  setLoading(false);
};

// In FlatList
<FlatList
  data={data}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

---

## Authentication

All protected endpoints require JWT token in Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload
```json
{
  "id": "user-uuid",
  "role": "employer",
  "user_id": "john_employer",
  "phone": "03001234567",
  "first_name": "John",
  "last_name": "Doe",
  "iat": 1720257000,
  "exp": 1720861800
}
```

### Token Expiry
- **Default:** 7 days
- **Configurable:** Via `JWT_EXPIRES_IN` env variable

### Handling Expired Tokens
```javascript
if (response.status === 401 && result.errorCode === 'UNAUTHORIZED') {
  if (result.message.includes('expired')) {
    // Token expired - logout and redirect to login
    await AsyncStorage.removeItem('token');
    navigation.navigate('Login');
  }
}
```

---

## Timestamps

All timestamps are in **ISO 8601 format** (UTC):

```
2026-07-06T10:30:00.123Z
```

### Parsing in JavaScript
```javascript
const date = new Date(timestamp);
console.log(date.toLocaleDateString()); // "7/6/2026"
console.log(date.toLocaleTimeString()); // "10:30:00 AM"
```

### Parsing in React Native
```javascript
import moment from 'moment';

const formatted = moment(timestamp).format('MMM DD, YYYY');
// "Jul 06, 2026"

const relative = moment(timestamp).fromNow();
// "2 hours ago"
```

---

## Best Practices

### 1. Always Check `success` Field
```javascript
if (result.success) {
  // Handle success
  const data = result.data;
} else {
  // Handle error
  const error = result.message;
}
```

### 2. Handle Error Codes
```javascript
switch (result.errorCode) {
  case 'VALIDATION_ERROR':
    // Show field errors
    break;
  case 'UNAUTHORIZED':
    // Redirect to login
    break;
  case 'FORBIDDEN':
    // Show permission denied
    break;
  default:
    // Show generic error
}
```

### 3. Use Pagination Metadata
```javascript
const { hasNext, hasPrev, page, totalPages } = result.pagination;

// Enable/disable next button
<Button disabled={!hasNext} onPress={loadNext} />

// Show page indicator
<Text>{page} / {totalPages}</Text>
```

### 4. Store Tokens Securely
```javascript
// React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store token
await AsyncStorage.setItem('token', result.data.token);

// Retrieve token
const token = await AsyncStorage.getItem('token');

// Remove token
await AsyncStorage.removeItem('token');
```

### 5. Handle Network Errors
```javascript
try {
  const response = await fetch(url);
  const result = await response.json();
  
  if (!response.ok) {
    // Handle HTTP errors
    throw new Error(result.message);
  }
  
  return result;
} catch (error) {
  if (error.message === 'Network request failed') {
    // Handle offline scenario
    Alert.alert('No Internet', 'Please check your connection');
  } else {
    // Handle other errors
    Alert.alert('Error', error.message);
  }
}
```

---

## TypeScript Definitions

```typescript
// Base types
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  timestamp: string;
  details?: any;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Pagination types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T = any> extends SuccessResponse<T[]> {
  pagination: PaginationMeta;
}

// Auth types
export interface User {
  id: string;
  user_id: string;
  phone?: string;
  role: 'blue_collar' | 'white_collar' | 'employer' | 'admin';
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Job types
export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  type: 'blue' | 'white';
  location: string;
  salary_range?: string;
  hourly_rate?: string;
  duration?: string;
  skills?: string;
  experience_level?: string;
  availability?: string;
  status: 'Active' | 'Closed' | 'Draft';
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  profiles?: EmployerProfile;
}

export interface EmployerProfile {
  full_name: string;
  company_name?: string;
  location?: string;
  bio?: string;
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "testuser",
    "password": "password123",
    "role": "employer",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "password123"
  }'
```

### Get Jobs (with token)
```bash
curl -X GET "http://localhost:5000/api/jobs?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Job",
    "description": "This is a test job description that is at least 20 characters long",
    "type": "white",
    "location": "Karachi"
  }'
```

---

## Support

For questions or issues:
1. Check server logs for detailed errors
2. Verify request format matches examples
3. Test with Postman/Insomnia first
4. Review validator files for field requirements

---

**Document Version:** 1.0.0  
**Last Updated:** July 6, 2026  
**API Version:** 2.0.0
