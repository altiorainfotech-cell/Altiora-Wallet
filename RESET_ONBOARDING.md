# Reset Onboarding & Sign In with Google

## The Issue

You're seeing "Error: Failed to fetch profile" because you're not authenticated. The `/api/me` endpoint is returning 401 (Unauthorized), which means no JWT token is being sent with the request.

## Solution: Sign In with Google Again

Since we just fixed the Google OAuth flow, you need to complete the sign-in process to get a valid JWT token.

### Option 1: Reset Onboarding (Quick)

Open browser console (F12) and run:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

This will:
- Clear all stored data
- Reset the onboarding flag
- Force you back to onboarding

Then:
1. Navigate through the onboarding slides
2. On the last slide, click "Sign up with Google"
3. Complete the Google authentication
4. You'll be redirected to the home screen
5. The welcome message should now appear!

### Option 2: Sign In from Auth Screen

If you don't want to reset onboarding, go to the login screen and sign in with Google there.

---

## What Should Happen

After successful Google Sign-In:

1. **Google returns ID token**
2. **Frontend sends it to backend** (`POST /api/auth/google`)
3. **Backend verifies and creates/finds user**
4. **Backend returns JWT tokens** (accessToken + refreshToken)
5. **Frontend stores tokens** in SecureStore
6. **Future requests include token** in Authorization header
7. **`GET /api/me`** now works with valid token
8. **User data fetched successfully**
9. **Welcome message displays** with your name!

---

## Current Status

Looking at the backend logs, all `/api/me` requests are returning **401 Unauthorized** because no Authorization header is present. This means the Google Sign-In flow completed, but the tokens weren't stored or aren't being loaded.

---

## After You Sign In

You should see in the browser console:

```
useUser: Fetching user data...
useUser: User data received: {
  "user": {
    "id": "...",
    "email": "hrithikpvkr@gmail.com",
    "displayName": "Hrithik",
    "profilePicture": "https://...",
    "provider": "google"
  }
}
Home: User state: { user: {...}, loading: false, error: null }
```

And on the home screen:

```
Welcome, Hrithik!
Total Balance
$12,345.67
```

---

## Quick Reset Script

Run this in browser console (F12):

```javascript
// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Also clear IndexedDB if using it
indexedDB.databases().then(dbs => {
  dbs.forEach(db => indexedDB.deleteDatabase(db.name));
});

// Reload page
location.reload();
```

Then sign in with Google again!

---

**Status:** You need to complete Google Sign-In to get a valid JWT token.
**Action:** Reset onboarding and sign in with Google, or go to login screen.
