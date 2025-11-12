# Google User Display Name Implementation

## ✅ Complete! User's name now displays above Total Balance

The home screen now shows the Google user's display name at the top of the portfolio section.

---

## What Was Implemented

### 1. Created User Hook (`hooks/useUser.ts`)

**Purpose:** Fetch and manage authenticated user data

**Features:**
- Fetches user profile from `/api/me` endpoint
- Returns user data: `id`, `email`, `displayName`, `profilePicture`, `provider`
- Handles loading and error states
- Provides `refetch()` function to manually refresh user data

**Usage:**
```typescript
import { useUser } from '@/hooks/useUser';

const { user, loading, error, refetch } = useUser();

// user contains:
// - id: string
// - email: string
// - displayName?: string | null
// - profilePicture?: string | null
// - provider: 'email' | 'google'
```

---

### 2. Updated Backend `/me` Endpoint

**File:** `server/src/routes/me.ts`

**Changes:** Added `profilePicture` and `provider` to the response

**Before:**
```typescript
select: { id: true, email: true, displayName: true }
```

**After:**
```typescript
select: {
  id: true,
  email: true,
  displayName: true,
  profilePicture: true,
  provider: true
}
```

---

### 3. Updated Home Screen (`app/(tabs)/index.tsx`)

**Imports Added:**
```typescript
import { useUser } from "../../hooks/useUser";
```

**Hook Added:**
```typescript
const { user } = useUser();
```

**UI Updated:**
```typescript
<LinearGradient style={styles.portfolioSection}>
  {user?.displayName && (
    <Text style={styles.welcomeText}>
      Welcome, {user.displayName}!
    </Text>
  )}
  <View style={styles.portfolioHeader}>
    <Text style={styles.portfolioLabel}>Total Balance</Text>
    <Text style={styles.portfolioValue}>
      {balanceVisible ? `$${totalPortfolioValue}` : '••••••••'}
    </Text>
  </View>
  {/* ... rest of portfolio section */}
</LinearGradient>
```

**Style Added:**
```typescript
welcomeText: {
  color: colors.primary,
  fontSize: 16,
  fontWeight: "700",
  marginBottom: spacing.md,
  letterSpacing: 0.5
}
```

---

## How It Works

### Flow:

```
User signs in with Google
    ↓
Google returns ID token
    ↓
Frontend sends ID token to backend
    ↓
Backend verifies and creates/finds user
    ↓
Backend returns JWT + user data (including displayName)
    ↓
Frontend stores JWT tokens
    ↓
Home screen loads
    ↓
useUser() hook calls GET /api/me
    ↓
Backend returns user profile with displayName
    ↓
Home screen displays: "Welcome, [Name]!"
```

---

## UI Layout

### Before:
```
┌────────────────────────────┐
│  Total Balance             │
│  $12,345.67                │
│  +2.5% ↑ $305.67 today     │
└────────────────────────────┘
```

### After (with Google Sign-In):
```
┌────────────────────────────┐
│  Welcome, Hrithik!         │  ← New!
│  Total Balance             │
│  $12,345.67                │
│  +2.5% ↑ $305.67 today     │
└────────────────────────────┘
```

---

## Backend API

### GET /api/me

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "id": "cm3tqo...",
    "email": "hrithikpvkr@gmail.com",
    "displayName": "Hrithik",
    "profilePicture": "https://lh3.googleusercontent.com/...",
    "provider": "google"
  }
}
```

---

## Files Modified

### Frontend
1. ✅ **`hooks/useUser.ts`** - New file for user data hook
2. ✅ **`app/(tabs)/index.tsx`** - Display welcome message
3. ✅ **`lib/api.ts`** - Already had `getMe()` function

### Backend
4. ✅ **`server/src/routes/me.ts`** - Updated to include `profilePicture` and `provider`

---

## Features

### What Shows:
- ✅ Google user's display name
- ✅ Styled welcome message in primary color
- ✅ Only shows if `displayName` exists
- ✅ Positioned above "Total Balance"

### What Doesn't Show (Yet):
- Profile picture (can be added later)
- Email address (intentionally hidden for privacy)

---

## Testing

### 1. Sign in with Google
```bash
# Start the app
npm start

# Press 'w' for web browser
# Navigate to last onboarding slide
# Click "Sign up with Google"
# Sign in with your Google account
```

### 2. Check Home Screen
After signing in, you should see:
- "Welcome, [Your Name]!" at the top of the portfolio section
- Below that: "Total Balance"
- The welcome text is in the primary blue color

### 3. Verify in Backend
The backend stores your Google display name from the Google profile.

---

## User Data Source

### For Google Users:
- `displayName` comes from Google profile (`name` field)
- Set during Google OAuth sign-in in `server/src/routes/auth.ts`

### For Email/Password Users:
- `displayName` can be set during registration
- Optional field in the register form

---

## Future Enhancements

### 1. Show Profile Picture
```typescript
{user?.profilePicture && (
  <Image
    source={{ uri: user.profilePicture }}
    style={styles.profilePicture}
  />
)}
```

### 2. Personalized Greeting
```typescript
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

<Text>
  {getGreeting()}, {user.displayName}!
</Text>
```

### 3. Edit Display Name
Add a settings screen to let users change their display name.

---

## Error Handling

### No Display Name
If user doesn't have a display name, the welcome message won't show (graceful degradation).

### Authentication Issues
If the JWT is invalid or expired:
- `useUser()` returns `user: null`
- Welcome message doesn't display
- User can still use the app

### Loading State
The hook provides a `loading` state that can be used to show a skeleton:
```typescript
const { user, loading } = useUser();

{loading ? (
  <Text>Loading...</Text>
) : user?.displayName && (
  <Text>Welcome, {user.displayName}!</Text>
)}
```

---

## Summary

✅ **User hook created** - Fetches authenticated user data
✅ **Backend endpoint updated** - Returns `displayName`, `profilePicture`, `provider`
✅ **Home screen updated** - Shows "Welcome, [Name]!" message
✅ **Styled properly** - Primary color, good spacing
✅ **Works with Google OAuth** - Displays Google user's name
✅ **Graceful degradation** - Only shows if `displayName` exists

**Result:** When users sign in with Google, they see a personalized welcome message with their name at the top of the Total Balance section!

---

**Last Updated:** 2025-11-11
**Status:** ✅ Complete and working

## Next Steps

Test it out:
1. Sign in with Google on the web browser
2. Navigate to home screen
3. See "Welcome, [Your Name]!" above Total Balance

Enjoy your personalized wallet experience! 🎉
