# Google OAuth Redirect URI Fix for Expo

## Problem

Google Cloud Console doesn't accept `exp://` scheme URIs in the "Authorized redirect URIs" field because it's not a standard web protocol.

---

## Solution Options

### **Option 1: Add Standard Web URIs (Best for Expo Go)**

Google accepts standard HTTP/HTTPS URLs. For Expo Go, add these URIs:

#### **For Local Development:**
```
http://localhost:8081
http://127.0.0.1:8081
http://192.168.1.5:8081
```

#### **For Expo Web:**
```
http://localhost:19006
```

#### **For Production (after building):**
```
https://yourdomain.com/auth/google
walletui://auth/google
```

---

## Steps to Add Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

2. Click on your OAuth 2.0 Client ID:
   ```
   681485058576-is556qm2mo41mb717ckr4i2bsg5tphot
   ```

3. Under **Authorized redirect URIs**, click **+ ADD URI**

4. Add these URIs one by one:
   ```
   http://localhost:8081
   http://localhost:19006
   http://192.168.1.5:8081
   ```

5. Click **SAVE**

6. Wait 1-2 minutes for changes to propagate

---

## Updated Code

I've updated `components/GoogleSignInButton.tsx` to use a compatible redirect URI format:

```typescript
const redirectUri = AuthSession.makeRedirectUri({
  native: 'walletui://auth/google',
  scheme: 'walletui',
});
```

This will generate the correct URI format that works with both Expo Go and standalone apps.

---

## How to Test

### 1. Check the Redirect URI

When you run the app, check the console logs to see what redirect URI is being used:

```bash
npm start
```

Look for the console log:
```
Google OAuth Redirect URI: [THE URI THAT WILL BE USED]
```

### 2. Add That URI to Google Console

Whatever URI is logged, add that exact URI to your Google Cloud Console.

### 3. Test Google Sign-In

1. Navigate to the onboarding screen (last slide)
2. Click "Sign up with Google"
3. Complete the Google authentication
4. Should redirect back successfully

---

## Alternative: Use Expo Auth Session Proxy

If you're still having issues, you can use Expo's built-in auth proxy:

### Update `.env`:
```env
# Add this line
EXPO_PUBLIC_USE_AUTH_PROXY=true
```

### Update `GoogleSignInButton.tsx`:
```typescript
const useProxy = process.env.EXPO_PUBLIC_USE_AUTH_PROXY === 'true';

const redirectUri = useProxy
  ? 'https://auth.expo.io/@your-username/your-project-slug'
  : AuthSession.makeRedirectUri({
      native: 'walletui://auth/google',
      scheme: 'walletui',
    });
```

Then add to Google Console:
```
https://auth.expo.io/@your-username/your-project-slug
```

---

## Debugging

### Check Your Current Redirect URI

Run this in your app to see what URI is being used:

```typescript
import * as AuthSession from 'expo-auth-session';

const redirectUri = AuthSession.makeRedirectUri({
  native: 'walletui://auth/google',
  scheme: 'walletui',
});

console.log('Redirect URI:', redirectUri);
```

### Common Redirect URIs by Platform

| Platform | Redirect URI |
|----------|-------------|
| Expo Go (iOS) | `exp://192.168.1.5:8081/--/auth/google` |
| Expo Go (Android) | `exp://192.168.1.5:8081/--/auth/google` |
| Web (localhost) | `http://localhost:19006` |
| Standalone App | `walletui://auth/google` |
| Expo Proxy | `https://auth.expo.io/@username/project` |

---

## Recommended URIs to Add

For comprehensive coverage, add all of these to Google Cloud Console:

```
http://localhost:8081
http://localhost:19006
http://127.0.0.1:8081
http://192.168.1.5:8081
walletui://auth/google
```

**Note:** Replace `192.168.1.5` with your actual local IP address if different.

---

## Testing Checklist

- [ ] Added redirect URIs to Google Cloud Console
- [ ] Waited 2 minutes for changes to propagate
- [ ] Checked console log for actual redirect URI
- [ ] Started app with `npm start`
- [ ] Navigated to onboarding last slide
- [ ] Clicked "Sign up with Google"
- [ ] Google OAuth opened successfully
- [ ] Completed authentication
- [ ] Redirected back to app
- [ ] Received ID token
- [ ] Logged in successfully

---

## Current Configuration

### Frontend (`.env`):
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=681485058576-is556qm2mo41mb717ckr4i2bsg5tphot.apps.googleusercontent.com
```

### Backend (`server/.env`):
```env
GOOGLE_CLIENT_ID=681485058576-is556qm2mo41mb717ckr4i2bsg5tphot.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

### Updated Code:
- ✅ `components/GoogleSignInButton.tsx` - Uses compatible redirect URI format
- ✅ `app/onboarding/index.tsx` - Has Google Sign-In on last slide
- ✅ Backend API ready at `POST /api/auth/google`

---

## If Still Having Issues

### Option A: Use Web-Only Flow

Update `GoogleSignInButton.tsx` to only work on web:

```typescript
if (Platform.OS !== 'web') {
  return (
    <TouchableOpacity disabled>
      <Text>Google Sign-In only available on web</Text>
    </TouchableOpacity>
  );
}
```

### Option B: Build Standalone App

For production, build a standalone app:

```bash
eas build --platform ios
eas build --platform android
```

Then use custom URI scheme:
```
walletui://auth/google
```

---

## Summary

1. **Add these URIs to Google Console:**
   - `http://localhost:8081`
   - `http://localhost:19006`
   - `http://192.168.1.5:8081`

2. **Check console log** for the actual redirect URI being used

3. **Wait 2 minutes** after saving changes

4. **Test** the Google Sign-In flow

The code has been updated to use a compatible format. Just add the HTTP URLs to Google Console and it should work!

---

**Last Updated:** 2025-11-11
**Status:** Code updated - Add HTTP URIs to Google Console
