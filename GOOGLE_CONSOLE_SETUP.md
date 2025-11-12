# Google Cloud Console Setup for OAuth

## Quick Start - Add These URIs NOW

Go to your [Google Cloud Console OAuth Client](https://console.cloud.google.com/apis/credentials/oauthclient/681485058576-is556qm2mo41mb717ckr4i2bsg5tphot) and add these **Authorized redirect URIs**:

```
http://localhost:8081
http://localhost:19006
http://127.0.0.1:8081
http://192.168.1.5:8081
walletui://auth/google
```

### Why These URIs?

| URI | Purpose |
|-----|---------|
| `http://localhost:8081` | Expo Dev Server (default port) |
| `http://localhost:19006` | Expo Web (browser testing) |
| `http://127.0.0.1:8081` | Alternative localhost IP |
| `http://192.168.1.5:8081` | Your local network IP (for mobile devices) |
| `walletui://auth/google` | Custom scheme for standalone apps |

---

## Step-by-Step Instructions

### 1. Open Google Cloud Console

Click this direct link to your OAuth client:
https://console.cloud.google.com/apis/credentials/oauthclient/681485058576-is556qm2mo41mb717ckr4i2bsg5tphot

Or manually navigate:
1. Go to https://console.cloud.google.com/
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on OAuth 2.0 Client ID: `681485058576-is556qm2mo41mb717ckr4i2bsg5tphot`

### 2. Add Redirect URIs

Scroll down to **Authorized redirect URIs** section

Click **+ ADD URI** button

Add each URI one by one:

**First URI:**
```
http://localhost:8081
```
Click **+ ADD URI** again

**Second URI:**
```
http://localhost:19006
```
Click **+ ADD URI** again

**Third URI:**
```
http://127.0.0.1:8081
```
Click **+ ADD URI** again

**Fourth URI:**
```
http://192.168.1.5:8081
```
Click **+ ADD URI** again

**Fifth URI:**
```
walletui://auth/google
```

### 3. Save Changes

Click **SAVE** button at the bottom

### 4. Wait for Propagation

Wait **1-2 minutes** for changes to take effect globally

---

## Verify Your Setup

### Check Current Configuration

Your OAuth client should now have:

**Client ID:**
```
681485058576-is556qm2mo41mb717ckr4i2bsg5tphot.apps.googleusercontent.com
```

**Authorized redirect URIs:**
```
✓ http://localhost:8081
✓ http://localhost:19006
✓ http://127.0.0.1:8081
✓ http://192.168.1.5:8081
✓ walletui://auth/google
```

---

## Test Google Sign-In

### 1. Start the Frontend

```bash
cd "d:\Office work - Altiora In fotech\wallet-ui"
npm start
```

### 2. Check Console Output

When you start the app, look for this line in the console:
```
Google OAuth Redirect URI: [actual URI being used]
```

### 3. Verify URI is Added

Make sure the logged URI is one of the URIs you added to Google Console

### 4. Test Sign-In Flow

1. Open the app in Expo Go or web browser
2. Navigate through onboarding slides (swipe to last slide)
3. On the last slide, click **"Sign up with Google"**
4. Google sign-in page should open
5. Sign in with your Google account
6. Should redirect back to app successfully
7. You should be logged in and see the home screen

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** The redirect URI in your app doesn't match any URI in Google Console

**Solution:**
1. Check the console log for actual redirect URI being used
2. Add that exact URI to Google Console
3. Wait 1-2 minutes for changes to propagate
4. Try again

### Error: "invalid_request"

**Cause:** Malformed redirect URI or missing parameter

**Solution:**
1. Make sure all environment variables are set correctly
2. Restart the dev server: `npm start -- --clear`
3. Check that `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` matches your Client ID

### Error: "Access blocked: Authorization Error"

**Cause:** OAuth consent screen not configured or test users not added

**Solution:**
1. Go to **OAuth consent screen** in Google Cloud Console
2. Add your Google account email to **Test users**
3. Make sure app is in "Testing" mode (not "Production")

### Google Sign-In Opens but Doesn't Return to App

**Cause:** Redirect URI not properly configured in app

**Solution:**
1. Make sure `app.json` has `"scheme": "walletui"`
2. Restart dev server completely
3. Clear app cache and reload

---

## Different Local IP Address?

If your local IP is different from `192.168.1.5`, find it:

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

Then add your actual IP to Google Console:
```
http://YOUR.LOCAL.IP:8081
```

---

## Current Configuration Summary

### Frontend (`.env`)
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=681485058576-is556qm2mo41mb717ckr4i2bsg5tphot.apps.googleusercontent.com
```

### Backend (`server/.env`)
```env
GOOGLE_CLIENT_ID=681485058576-is556qm2mo41mb717ckr4i2bsg5tphot.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

### Google Cloud Console
- **Project:** Your wallet-ui project
- **OAuth Client ID:** 681485058576-is556qm2mo41mb717ckr4i2bsg5tphot
- **Redirect URIs:** 5 URIs added (see above)

---

## Next Steps After Setup

Once you've added the URIs to Google Console:

1. ✅ Wait 2 minutes for changes to propagate
2. ✅ Start the app: `npm start`
3. ✅ Navigate to last onboarding slide
4. ✅ Click "Sign up with Google"
5. ✅ Complete sign-in flow
6. ✅ Verify you land on home screen
7. ✅ Check that user is created in database

---

**Ready?** Click the link below to start:

👉 [Add Redirect URIs to Google Console](https://console.cloud.google.com/apis/credentials/oauthclient/681485058576-is556qm2mo41mb717ckr4i2bsg5tphot)

---

**Last Updated:** 2025-11-11
**Status:** Ready to configure
