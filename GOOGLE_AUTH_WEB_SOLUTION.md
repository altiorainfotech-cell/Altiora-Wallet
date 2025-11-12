# Google OAuth Solution - Test on Web First

## The Problem

Google Cloud Console **only accepts** HTTP and HTTPS redirect URIs. It **rejects** `exp://` scheme URIs.

Your app is generating: `exp://192.168.1.5:8081`
Google Console accepts: `http://localhost:8081`, `http://localhost:19006`, etc.

## The Solution: Test on Web First

Since you've already added the HTTP URIs to Google Console, let's test Google Sign-In on **web** first, then handle mobile later.

---

## Step 1: Save What You Already Added

In your Google Console screenshot, I see you've added:
- ✅ `http://localhost:8081/auth/register`
- ✅ `http://localhost:8081`
- ✅ `http://localhost:19006`

**Click "Save"** at the bottom of the page. These URIs are perfect for web testing!

---

## Step 2: Test on Web Browser

### Start the app in web mode:

```bash
npm start
```

Then press **`w`** to open in web browser.

This will open `http://localhost:19006` which matches one of your authorized URIs!

### Test the flow:
1. App opens in browser at `http://localhost:19006`
2. Navigate through onboarding slides
3. On last slide, click "Sign up with Google"
4. Google authentication should work because `http://localhost:19006` is authorized
5. After signing in, you'll be redirected back to the app

---

## Step 3: For Mobile Testing Later

For mobile devices (Expo Go), we have two options:

### Option A: Build Standalone App (Production)
This uses the custom scheme `walletui://auth/google` which you can add to Google Console.

```bash
# Build for iOS
npx expo run:ios

# Build for Android
npx expo run:android
```

Then add to Google Console:
```
walletui://auth/google
```

### Option B: Use Web for Development
Keep using web browser (`http://localhost:19006`) for development and testing.

---

## Updated Testing Instructions

### For Immediate Testing (Web):

1. **Make sure these URIs are saved in Google Console:**
   ```
   http://localhost:19006
   http://localhost:8081
   ```

2. **Start the app:**
   ```bash
   npm start
   ```

3. **Press `w` to open in web browser**

4. **Navigate through onboarding:**
   - Swipe through slides 1-4
   - On last slide, see "Sign up with Google"

5. **Click "Sign up with Google"**
   - Google authentication opens
   - Sign in with your account
   - Redirects back to app at `http://localhost:19006`
   - Should show home screen

---

## Why This Works

| Environment | Redirect URI | Google Console |
|-------------|-------------|----------------|
| Web Browser | `http://localhost:19006` | ✅ Accepted (already added) |
| Expo Go | `exp://192.168.1.5:8081` | ❌ Rejected (not HTTP/HTTPS) |
| Standalone App | `walletui://auth/google` | ✅ Can be added (but needs build) |

**For development:** Use web browser
**For production:** Build standalone app with custom scheme

---

## Quick Start Now

1. Click **"Save"** in Google Console (with the URIs you already added)
2. Wait 1-2 minutes for changes to propagate
3. In terminal, make sure the app is running (`npm start`)
4. Press **`w`** to open web browser
5. Navigate to last onboarding slide
6. Test Google Sign-In

---

## Expected Console Output

When you open in web, you should see:
```
Google OAuth Redirect URI: http://localhost:19006
```

This matches your authorized URI in Google Console, so it will work!

---

## Troubleshooting

### If you see `exp://` in console:
- You're running in Expo Go (mobile), not web
- Press `w` to open web browser instead

### If button says "Not Configured":
- Check `.env` file has `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- Restart dev server: `npm start -- --clear`

### If Google shows "redirect_uri_mismatch":
- Make sure you clicked "Save" in Google Console
- Wait 2 minutes for changes to propagate
- Check the console log matches your authorized URI

---

## Summary

✅ **You've already added the correct URIs to Google Console**
✅ **Click "Save" in Google Console**
✅ **Test on web browser first** (press `w`)
✅ **Mobile testing requires standalone build** (later)

**Next step:** Click "Save" in Google Console, then test on web!

---

**Last Updated:** 2025-11-11
**Status:** Ready to test on web browser
