# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the Altiora Wallet app.

## Overview

The app now supports Google OAuth sign-in, allowing users to authenticate using their Google accounts. This works across iOS, Android, and Web platforms.

## Prerequisites

1. A Google Cloud Platform account
2. Node.js and npm installed
3. Expo CLI installed

## 1. Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Create Project** or select an existing project
3. Give your project a name (e.g., "Altiora Wallet")
4. Click **Create**

### Step 2: Enable Google Sign-In API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google Sign-In API" or "Google+ API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (or Internal if using Google Workspace)
3. Fill in the required information:
   - **App name**: Altiora Wallet
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Add scopes (optional for basic sign-in):
   - `email`
   - `profile`
   - `openid`
5. Click **Save and Continue**
6. Add test users if in testing mode
7. Click **Save and Continue**

### Step 4: Create OAuth 2.0 Credentials

You need to create separate credentials for each platform:

#### **Web Application**

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Name: "Altiora Wallet Web"
5. Add authorized JavaScript origins:
   - `http://localhost:8081` (for Expo development)
   - `http://localhost:19006` (for Expo web)
   - Your production web URL
6. Add authorized redirect URIs:
   - `http://localhost:8081`
   - `http://localhost:19006`
   - Your production redirect URI
7. Click **Create**
8. **Save the Client ID** - you'll need this as `GOOGLE_WEB_CLIENT_ID`

#### **iOS Application**

1. Click **Create Credentials** > **OAuth client ID**
2. Select **iOS**
3. Name: "Altiora Wallet iOS"
4. Bundle ID: `com.altiora.wallet` (must match your app.json)
5. Click **Create**
6. **Save the Client ID** - you'll need this as `GOOGLE_IOS_CLIENT_ID`
7. Also note the **Reversed client ID** (e.g., `com.googleusercontent.apps.123456-abc`)

#### **Android Application**

1. Click **Create Credentials** > **OAuth client ID**
2. Select **Android**
3. Name: "Altiora Wallet Android"
4. Package name: `com.altiora.wallet` (must match your app.json)
5. Get your **SHA-1 certificate fingerprint**:

   For development:
   ```bash
   # On macOS/Linux
   keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android

   # On Windows
   keytool -keystore %USERPROFILE%\.android\debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
   ```

   For production, use your release keystore.

6. Enter the SHA-1 fingerprint
7. Click **Create**
8. **Save the Client ID** - you'll need this as `GOOGLE_ANDROID_CLIENT_ID`

---

## 2. Frontend Configuration

### Update `.env` file

Create or update the `.env` file in the project root:

```env
# Backend API URL
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api

# Alchemy API Key for Ethereum RPC
EXPO_PUBLIC_ALCHEMY_API_KEY=your-alchemy-api-key

# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

### Update `app.json`

The `app.json` has been pre-configured, but you need to update these values:

1. Replace `YOUR_REVERSED_CLIENT_ID` with your actual iOS reversed client ID
2. Ensure bundle IDs match:
   - iOS: `com.altiora.wallet`
   - Android: `com.altiora.wallet`

### Download Google Service Files (Optional for native features)

#### For iOS:
1. In Google Cloud Console, go to your iOS client
2. Download `GoogleService-Info.plist`
3. Place it in the project root: `wallet-ui/GoogleService-Info.plist`

#### For Android:
1. In Google Cloud Console, go to your Android client
2. Download `google-services.json`
3. Place it in the project root: `wallet-ui/google-services.json`

---

## 3. Backend Configuration

### Update `server/.env`

Create or update the `server/.env` file:

```env
NODE_ENV=development
PORT=4000
API_PREFIX=/api
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wallet
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

**Note:** You can get the `GOOGLE_CLIENT_SECRET` from the Google Cloud Console:
1. Go to **APIs & Services** > **Credentials**
2. Click on your Web application OAuth 2.0 Client
3. Copy the **Client secret**

### Run Database Migration

After updating the Prisma schema, run the migration:

```bash
cd server
npx prisma migrate dev --name add_google_oauth
npx prisma generate
```

---

## 4. Testing

### Start the Backend

```bash
cd server
npm run dev
```

The server should start on `http://localhost:4000`

### Start the Frontend

```bash
# In the project root
npm start

# Or use specific platforms
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For Web
```

### Test Google Sign-In

1. Navigate to the Login or Register screen
2. Click "Continue with Google" button
3. Select a Google account
4. Grant permissions
5. You should be signed in and redirected to the main app

---

## 5. Common Issues & Troubleshooting

### Issue: "Google Sign-In is not configured"

**Solution:** Make sure all environment variables are set correctly and restart the development server with cache cleared:

```bash
npm start -- --clear
```

### Issue: "Sign in with Google temporarily disabled for this app"

**Solution:**
1. Make sure your OAuth consent screen is published (not in testing mode) OR
2. Add your test email to the test users list in OAuth consent screen

### Issue: "Invalid client" or "Unauthorized client"

**Solution:**
1. Double-check that your Client IDs match exactly
2. Verify bundle IDs/package names match between app.json and Google Cloud Console
3. For Android, verify SHA-1 fingerprint is correct

### Issue: "DEVELOPER_ERROR" on Android

**Solution:**
1. Check that `google-services.json` is in the correct location
2. Verify the package name matches exactly
3. Ensure SHA-1 certificate fingerprint is correct
4. Try rebuilding the app: `npx expo run:android`

### Issue: Backend returns "Invalid Google token"

**Solution:**
1. Check that backend environment variables are set
2. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_WEB_CLIENT_ID` are correct
3. Check server logs for detailed error messages

---

## 6. Production Deployment

### Frontend

1. Update `.env` with production values
2. Update authorized origins and redirect URIs in Google Cloud Console
3. Build production app:
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

### Backend

1. Set production environment variables
2. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` with production credentials
3. Ensure database is migrated:
   ```bash
   npx prisma migrate deploy
   ```

---

## 7. Security Best Practices

1. **Never commit** `.env` files to version control
2. Use **different credentials** for development and production
3. Regularly **rotate secrets** (JWT secrets, Google client secrets)
4. Enable **2FA** on your Google Cloud account
5. Monitor **API usage** in Google Cloud Console
6. Set up **rate limiting** on authentication endpoints
7. Use **HTTPS** in production

---

## 8. Additional Resources

- [Google Sign-In for iOS](https://developers.google.com/identity/sign-in/ios)
- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [Expo Authentication](https://docs.expo.dev/guides/authentication/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Support

If you encounter issues not covered in this guide, please:
1. Check the server logs for detailed error messages
2. Review the Google Cloud Console audit logs
3. Consult the official documentation links above
4. Contact the development team

---

**Last Updated:** 2025-01-11
