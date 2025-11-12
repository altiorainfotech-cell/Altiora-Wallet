# Google OAuth Integration - Quick Summary

## What Was Added

Google OAuth authentication has been fully integrated into the Altiora Wallet app. Users can now sign in using their Google accounts in addition to email/password authentication.

---

## Files Created

### Frontend
- **`components/GoogleSignInButton.tsx`** - Reusable Google Sign-In button component
- **`.env`** - Environment variables for Google OAuth client IDs
- **`GOOGLE_OAUTH_SETUP.md`** - Complete setup guide

### Backend
- **`server/src/lib/googleAuth.ts`** - Google token verification logic
- **`server/.env.example`** - Updated with Google OAuth variables

---

## Files Modified

### Frontend
- **`app.json`** - Added Google Sign-In configuration for iOS/Android
- **`app/auth/login.tsx`** - Added Google Sign-In button
- **`app/auth/register.tsx`** - Added Google Sign-In button
- **`lib/api.ts`** - Added `googleSignIn()` function

### Backend
- **`server/prisma/schema.prisma`** - Added Google OAuth fields to User model
  - `provider` (email/google)
  - `googleId`
  - `profilePicture`
  - `passwordHash` is now optional
- **`server/src/config/env.ts`** - Added Google OAuth environment variables
- **`server/src/routes/auth.ts`** - Added `POST /auth/google` endpoint

---

## How It Works

### Authentication Flow

```
User clicks "Continue with Google"
    ↓
Google Sign-In opens
    ↓
User authenticates with Google
    ↓
App receives ID token
    ↓
Frontend sends ID token to backend: POST /api/auth/google
    ↓
Backend verifies token with Google
    ↓
Backend finds or creates user in database
    ↓
Backend returns JWT access + refresh tokens
    ↓
User is logged in
```

### Database Changes

The User model now supports both email/password and Google OAuth:

```prisma
model User {
  // Existing fields
  id            String
  email         String       @unique
  displayName   String?

  // OAuth fields (NEW)
  provider      AuthProvider @default(email)  // 'email' or 'google'
  googleId      String?      @unique
  profilePicture String?
  passwordHash  String?      // Now optional (null for Google users)

  // ... other fields
}
```

---

## API Endpoints

### New Endpoint

**`POST /api/auth/google`**

Request body:
```json
{
  "idToken": "google-id-token-here"
}
```

Response:
```json
{
  "user": {
    "id": "user-id",
    "email": "user@gmail.com",
    "displayName": "John Doe",
    "profilePicture": "https://...",
    "provider": "google"
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

### Existing Endpoints (Unchanged)
- `POST /api/auth/register` - Email/password registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Logout

---

## Required Setup Steps

### 1. Google Cloud Console
- Create OAuth 2.0 credentials (Web, iOS, Android)
- Configure OAuth consent screen
- Get Client IDs and Client Secret

### 2. Environment Variables

**Frontend (`.env`):**
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
```

**Backend (`server/.env`):**
```env
GOOGLE_CLIENT_ID=your-web-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_WEB_CLIENT_ID=your-web-client-id
```

### 3. Database Migration

```bash
cd server
npx prisma migrate dev --name add_google_oauth
npx prisma generate
```

### 4. Update app.json
Replace `YOUR_REVERSED_CLIENT_ID` with your actual iOS reversed client ID from Google Cloud Console.

---

## Testing Checklist

- [ ] Set up Google Cloud project and credentials
- [ ] Add environment variables to both frontend and backend
- [ ] Run database migration
- [ ] Start backend server
- [ ] Start frontend app
- [ ] Test Google Sign-In on login screen
- [ ] Test Google Sign-In on register screen
- [ ] Verify user is created in database with `provider: 'google'`
- [ ] Test that tokens are stored securely
- [ ] Test logout and re-login with Google

---

## Dependencies Installed

### Frontend
- `@react-native-google-signin/google-signin` - Google Sign-In SDK for React Native

### Backend
- `google-auth-library` - Google token verification

---

## Security Features

1. **Token Verification** - All Google ID tokens are verified with Google's servers
2. **Email Verification** - Only verified Google emails are accepted
3. **Secure Storage** - Tokens stored in Expo SecureStore
4. **JWT Authentication** - Same JWT system used for both auth methods
5. **Provider Tracking** - System tracks which auth method user signed up with

---

## User Experience

### Login/Register Screens
- "Continue with Google" button at the top
- "or" divider
- Traditional email/password form below

### Account Linking
- If a user signs up with email/password, then later signs in with Google using the same email, the accounts are automatically linked
- User profile is updated with Google information (profile picture, name)
- Provider is changed from 'email' to 'google'

---

## Next Steps (Optional Enhancements)

1. Add Apple Sign-In for iOS
2. Add Facebook Login
3. Add profile picture display in app
4. Add "Sign in with" badge on user profile
5. Allow unlinking Google account
6. Add email change functionality
7. Add password reset for email users

---

## Complete Documentation

For detailed setup instructions, see **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)**

---

**Integration completed:** January 11, 2025
