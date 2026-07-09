# PHASE 1: FOUNDATIONAL LAYER - PROGRESS REPORT

**Date:** July 9, 2026  
**Status:** 🟡 IN PROGRESS (Backend 60% Complete, Mobile App 0%)

---

## ✅ COMPLETED

### Database Schema
- ✅ `otp_verifications` table (phone-based OTP for Blue Collar)
- ✅ `chat_threads` table (one thread per application)
- ✅ `chat_messages` table (HTTP polling, no WebSockets)
- ✅ `review_audit` table (immutability enforcement)
- ✅ Updated `users` table (language_preference, role_selected columns)
- ✅ Updated `applications` table (worker_accepted, offered_at, accepted_at, completed_at columns)
- ✅ Status enum: Pending → Shortlisted → Offered → In Progress → Completed

### Backend APIs - Authentication
- ✅ POST `/api/auth/send-otp` - Send OTP to phone (Blue Collar)
- ✅ POST `/api/auth/verify-otp` - Verify OTP and login/register
- ✅ POST `/api/auth/login-email` - Email/password login (White Collar + Employer)
- ✅ POST `/api/auth/register-email` - Register with email
- ✅ PUT `/api/auth/select-role` - Role selection after first login

### Backend APIs - Applications (Hiring Pipeline)
- ✅ POST `/api/applications` - One-click apply
- ✅ GET `/api/applications` - List applications (filtered by role + status)
- ✅ GET `/api/applications/:id` - Get single application
- ✅ PUT `/api/applications/:id/status` - Update status with state machine

### Backend Services
- ✅ `otpService.js` - Twilio integration (dev mode fallback)
  - Generates 6-digit OTP
  - 10-minute expiry
  - Max 5 attempts
  - SMS via Twilio (dev: logs to console)

### Dependencies Installed
- ✅ `twilio` - OTP verification

---

## 🚧 IN PROGRESS

### Backend APIs - Remaining
- ⏳ Rating system (`POST /api/reviews`, immutable, post-completion only)
- ⏳ Chat system (`POST /chat/threads/:threadId/messages`, `GET` for polling)

---

## 📋 TODO - Backend

### Rating System APIs
- [ ] POST `/api/reviews` - Submit rating (only when status=Completed)
- [ ] Prevent updates/deletes (immutable reviews)
- [ ] Auto-calculate avg_rating on user profiles
- [ ] Validate: one review per job per reviewer

### Chat APIs (HTTP Polling)
- [ ] POST `/api/chat/threads/:threadId/messages` - Send message
- [ ] GET `/api/chat/threads/:threadId/messages` - Poll messages (1s interval)
- [ ] GET `/api/chat/threads` - List threads (5s polling)
- [ ] Optimistic UI support (client-side instant render)

### Integration
- [ ] Wire up new routes in `server.js`
- [ ] Add Twilio credentials to `.env`
- [ ] Test complete hiring pipeline flow

---

## 📋 TODO - Mobile App (React Native + Expo)

### Dependencies to Install
- [ ] `expo-secure-store` - Encrypted JWT storage
- [ ] `react-i18next` + `i18next` - Bilingual support
- [ ] `@react-navigation/native` - Navigation
- [ ] `@react-navigation/stack` - Stack navigator
- [ ] `@react-navigation/bottom-tabs` - Tab navigator

### i18n System
- [ ] Create `translations.json` (English/Urdu, 150-290 key-value pairs)
- [ ] Implement language toggle button (visible on all screens)
- [ ] RTL layout switching with `I18nManager`
- [ ] Persist language choice in SecureStore

### Auth Screens
- [ ] Phone OTP flow (Blue Collar):
  - `PhoneInputScreen` - Enter phone number
  - `OTPVerifyScreen` - Enter 6-digit code
- [ ] Email login flow (White Collar + Employer):
  - `EmailLoginScreen` - Email/password
  - `RegisterScreen` - Email registration
- [ ] `RoleSelectionScreen` - 3 large tappable cards (show after first login)

### Auth Context
- [ ] JWT storage in `expo-secure-store` (NOT AsyncStorage)
- [ ] Auth context/provider
- [ ] Auto-login if valid token exists
- [ ] Clear token on logout
- [ ] JWT validation on API requests

### Application Flow
- [ ] Job listings screen
- [ ] One-click apply button
- [ ] Application status screen (Pending/Shortlisted/Offered/In Progress/Completed)
- [ ] Worker accept/reject UI (when status=Offered)

### Rating UI
- [ ] Rating modal/screen (unlocks only when status=Completed)
- [ ] 1-5 star selector
- [ ] Optional comment field
- [ ] Submit once (no edits after)

### Chat UI
- [ ] Chat screen with message list
- [ ] Poll threads list every 5s
- [ ] Poll active thread messages every 1s
- [ ] Optimistic UI (render sent message immediately)
- [ ] Reconcile on server response

---

## 🎯 ACCEPTANCE CRITERIA

### Authentication
- [x] Phone OTP for Blue Collar (Twilio + dev fallback)
- [x] Email login for White Collar + Employer
- [x] Role selection after first login
- [ ] JWT stored in SecureStore
- [ ] Language toggle persists across restart

### Hiring Pipeline
- [x] One-click apply creates application
- [x] Status transitions: Pending → Shortlisted → Offered → In Progress → Completed
- [x] Worker must accept Offered status before In Progress
- [ ] Rating only unlocks after Completed
- [ ] Second rating submit is rejected

### Chat
- [ ] One chat thread per job application
- [ ] Poll threads every 5s, messages every 1s
- [ ] Optimistic UI for sent messages
- [ ] No WebSockets (HTTP only)

### Bilingual
- [ ] Floating toggle button on all screens
- [ ] All UI strings swap instantly
- [ ] RTL layout for Urdu
- [ ] Choice persists across app restart

---

## 📊 STATE MACHINE (Applications)

```
Pending → Shortlisted → Offered → In Progress → Completed
           ↓              ↓           ↓
        Rejected      Cancelled   (end state)
```

### Transitions
- **Employer**:
  - Pending → Shortlisted
  - Shortlisted → Offered or Rejected
  - In Progress → Completed
- **Worker**:
  - Offered → In Progress (must `action=accept`)
  - Offered → Cancelled (reject)
- **System**: Auto-transitions (none in Phase 1)

---

## 🔧 ENVIRONMENT SETUP

### Backend `.env` Additions Needed
```env
# Twilio OTP (optional - dev mode works without)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 📝 NOTES

### Design Decisions
1. **Phone OTP for Blue Collar Only**: White Collar and Employers use email/password
2. **Dev Mode OTP**: When Twilio not configured, OTP is logged to console for testing
3. **No WebSockets**: Chat uses HTTP polling (5s for threads, 1s for messages) to reduce server memory
4. **Immutable Reviews**: Once submitted, reviews cannot be edited or deleted
5. **One Thread Per Application**: Chat thread created automatically on application submission
6. **SecureStore vs AsyncStorage**: Using expo-secure-store (encrypted) instead of AsyncStorage

### Tech Stack
- **Backend**: Node.js + Express + PostgreSQL
- **Mobile**: React Native + Expo SDK 54
- **Auth**: JWT (7-day expiry) + bcrypt + Twilio Verify
- **i18n**: react-i18next + I18nManager (RTL)
- **Storage**: expo-secure-store (encrypted)
- **Navigation**: React Navigation (Stack + Bottom Tabs)

---

## 🚀 NEXT STEPS

1. **Complete Backend** (1-2 hours):
   - Rating APIs
   - Chat APIs
   - Integration testing

2. **Mobile App Setup** (2-3 hours):
   - Install dependencies
   - Set up i18n system
   - Create auth screens

3. **Mobile App Features** (3-4 hours):
   - Application flow
   - Rating UI
   - Chat UI with polling

4. **Testing** (1-2 hours):
   - End-to-end flow
   - Language toggle
   - State machine transitions

**Total Estimated Time Remaining:** 7-11 hours

---

## 📞 TESTING ACCOUNTS

### Blue Collar (OTP)
- Phone: `+923001234567`
- OTP: (check console in dev mode)

### White Collar (Email)
- Email: `white_demo@test.com`
- Password: `White123!`

### Employer (Email)
- Email: `employer_demo@test.com`
- Password: `Employer123!`

---

**Last Updated:** July 9, 2026  
**Next Update:** After completing rating + chat APIs
