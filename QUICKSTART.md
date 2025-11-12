# Google OAuth - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly set up and test Google OAuth in your development environment.

---

## Step 1: Google Cloud Console (5 minutes)

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure OAuth consent screen if prompted (just fill in app name and email)
6. Create **Web Application** credentials:
   - Add authorized origin: `http://localhost:8081`
   - Add redirect URI: `http://localhost:8081`
7. **Copy the Client ID** (looks like `123456-abc.apps.googleusercontent.com`)
8. **Copy the Client Secret**

---

## Step 2: Update Environment Files (2 minutes)

### Frontend - Create `.env` in project root:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com
```

Replace `YOUR_WEB_CLIENT_ID_HERE` with the Client ID you just copied.

### Backend - Create `server/.env`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wallet
JWT_ACCESS_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-key-change-in-production
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com
```

Replace with your actual Client ID and Client Secret.

---

## Step 3: Database Migration (1 minute)

```bash
cd server
npx prisma migrate dev --name add_google_oauth
npx prisma generate
```

---

## Step 4: Start the App (1 minute)

### Terminal 1 - Start Backend:
```bash
cd server
npm run dev
```

### Terminal 2 - Start Frontend:
```bash
npm start
```

Press `w` to open in web browser (easiest for testing).

---

## Step 5: Test It! (1 minute)

1. In the app, go to Login or Register screen
2. Click the **"Continue with Google"** button
3. Sign in with your Google account
4. You should be logged in!

---

## ✅ Success Checklist

If everything worked, you should see:
- [x] Google Sign-In button appears on login/register screens
- [x] Clicking button opens Google authentication
- [x] After signing in, you're redirected back to the app
- [x] An alert shows "Logged in with Google"
- [x] You're taken to the main app

---

## ❌ Troubleshooting

### "Google Sign-In is not configured"
- Check that `.env` file exists and has `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- Restart the dev server with: `npm start -- --clear`

### "Invalid client"
- Double-check Client ID is correct in both `.env` files
- Make sure you're using the **Web** Client ID (not iOS or Android)

### Backend errors
- Check server logs in the terminal
- Verify `server/.env` has all required variables
- Make sure PostgreSQL is running

### "Email not verified"
- Your Google account email must be verified
- Try with a different Google account

---

## 📱 Testing on Mobile (iOS/Android)

For mobile testing, you need additional OAuth credentials:

### iOS:
1. Create **iOS** OAuth client in Google Console
2. Bundle ID: `com.altiora.wallet`
3. Copy iOS Client ID to `.env`:
   ```env
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
   ```
4. Update `app.json` with reversed client ID
5. Rebuild: `npx expo run:ios`

### Android:
1. Get SHA-1 fingerprint:
   ```bash
   keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
   ```
2. Create **Android** OAuth client in Google Console
3. Package name: `com.altiora.wallet`
4. Add SHA-1 fingerprint
5. Copy Android Client ID to `.env`:
   ```env
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
   ```
6. Rebuild: `npx expo run:android`

---

## 🎯 Next Steps

Once basic Google Auth is working:

1. **Remove the onboarding reset** (if you added it earlier):
   - Open `app/index.tsx`
   - Remove the line: `await setItem('hasOnboarded', 'false');`

2. **Add iOS/Android support** (see above)

3. **Customize the UI**:
   - Edit `components/GoogleSignInButton.tsx`
   - Modify button styles, text, icons

4. **Add profile picture display**:
   - User profile picture is stored in `user.profilePicture`
   - Display it in settings or profile screen

5. **Test edge cases**:
   - Sign up with email, then sign in with Google (same email)
   - Sign up with Google, then try email login
   - Multiple Google accounts

---

## 📚 Full Documentation

- **Detailed setup**: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
- **Technical overview**: [GOOGLE_AUTH_SUMMARY.md](./GOOGLE_AUTH_SUMMARY.md)

---

## 🆘 Need Help?

1. Check the console logs (both frontend and backend)
2. Review the troubleshooting section above
3. Read the full setup guide: `GOOGLE_OAUTH_SETUP.md`
4. Check Google Cloud Console audit logs
5. Verify all environment variables are set correctly

---

**Happy coding! 🎉**
