# Onboarding Screen with Google OAuth

## ✅ Complete! Google Sign-In Added to Onboarding

The onboarding screen now shows Google Sign-In options on the last slide instead of just a "Continue" button.

---

## What Changed

### 1. Updated Last Onboarding Slide

**Before:**
```
[Continue Button]
[Import from wallet Button]
```

**After:**
```
[Sign up with Google Button]
     --- or ---
[Import existing wallet Button]
[Skip for now Button]
```

### 2. New User Flow

```
Onboarding Slides 1-4
    ↓ (Next, Next, Next, Next)
Last Slide (Slide 5)
    ├─ "Sign up with Google" → Google OAuth → Home Screen
    ├─ "Import existing wallet" → Import Sheet → Home Screen
    └─ "Skip for now" → Home Screen (without account)
```

---

## File Changes

### [app/onboarding/index.tsx](d:\Office work - Altiora In fotech\wallet-ui\app\onboarding\index.tsx)

**Imports Added:**
```typescript
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { googleSignIn } from '@/lib/api';
import { Alert } from 'react-native';
```

**New Handler:**
```typescript
const handleGoogleSignIn = async (idToken: string) => {
  try {
    setLoading(true);
    await googleSignIn(idToken);
    await setItem('hasOnboarded', 'true');
    Alert.alert('Success', 'Signed in with Google');
    router.replace('/(tabs)');
  } catch (e: any) {
    Alert.alert('Google Sign-In failed', e?.message || 'Please try again');
  } finally {
    setLoading(false);
  }
};
```

**Updated Slide Rendering:**
- First 4 slides: Show "Next" button
- Last slide: Show Google Sign-In, Import, and Skip options

**New Styles Added:**
- `tertiaryButton` - For "Skip for now" button
- `tertiaryButtonText` - Button text style
- `divider` - "or" divider container
- `dividerLine` - Horizontal lines
- `dividerText` - "or" text

---

## Last Slide Layout

```
┌─────────────────────────────────┐
│                                 │
│      [Wallet Image]             │
│                                 │
│   "Get Started with Ease"       │
│   Secure your financial future  │
│                                 │
│   ● ● ● ● ●  (pagination)       │
│                                 │
│  ┌──────────────────────────┐  │
│  │  🔵 Sign up with Google  │  │  ← Google OAuth
│  └──────────────────────────┘  │
│                                 │
│           ─── or ───            │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Import existing wallet  │  │  ← Opens import sheet
│  └──────────────────────────┘  │
│                                 │
│       Skip for now              │  ← Goes to home without account
│                                 │
└─────────────────────────────────┘
```

---

## User Flows

### Flow 1: Sign up with Google
1. User reaches last onboarding slide
2. Clicks "Sign up with Google"
3. Google OAuth browser opens
4. User signs in with Google
5. Returns to app
6. Creates account with Google
7. Redirects to Home Screen
8. `hasOnboarded` set to `true`

### Flow 2: Import Existing Wallet
1. User reaches last onboarding slide
2. Clicks "Import existing wallet"
3. Import sheet opens with options:
   - Secret Recovery Phrase
   - Private Key
   - Hardware wallet
4. User imports wallet
5. Redirects to Home Screen
6. `hasOnboarded` set to `true`

### Flow 3: Skip for Now
1. User reaches last onboarding slide
2. Clicks "Skip for now"
3. Goes directly to Home Screen
4. `hasOnboarded` set to `true`
5. User can create/import wallet later from settings

---

## Benefits

✅ **Better UX** - Clear options on last slide
✅ **Social Login** - Easy sign-up with Google
✅ **Flexibility** - Users can skip if they want
✅ **Clear CTAs** - Three distinct options
✅ **Professional** - Modern onboarding flow

---

## Google OAuth Redirect URI Issue

### The Error:
```
Access blocked: Authorization Error
Error 400: invalid_request
redirect_uri=exp://192.168.1.5:8081/--/auth/google
```

### The Fix:

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and add these redirect URIs to your OAuth client:

**For Local Development (Expo Go):**
```
exp://192.168.1.5:8081/--/auth/google
exp://localhost:8081/--/auth/google
```

**For Other Scenarios:**
```
http://localhost:8081
http://localhost:19006
exp://127.0.0.1:8081/--/auth/google
```

**Note:** Replace `192.168.1.5` with your actual local IP address if different.

### Steps:
1. Go to https://console.cloud.google.com/apis/credentials
2. Click on: `681485058576-is556qm2mo41mb717ckr4i2bsg5tphot`
3. Scroll to **Authorized redirect URIs**
4. Click **+ ADD URI**
5. Add: `exp://192.168.1.5:8081/--/auth/google`
6. Click **SAVE**
7. Wait 1-2 minutes for changes to propagate
8. Try again!

---

## Testing Checklist

- [ ] Navigate through all 5 onboarding slides
- [ ] On last slide, see Google Sign-In button
- [ ] Click "Sign up with Google"
- [ ] Google OAuth browser opens
- [ ] After adding redirect URI, authentication works
- [ ] Returns to app after signing in
- [ ] Shows success message
- [ ] Redirects to Home Screen
- [ ] User is logged in
- [ ] Test "Import existing wallet" option
- [ ] Test "Skip for now" option
- [ ] Verify onboarding doesn't show again after completing

---

## Screenshots

### Before (Old Design):
```
Last Slide:
┌──────────────────────────┐
│    [Continue Button]     │  ← Generic button
│ [Import from wallet]     │
└──────────────────────────┘
```

### After (New Design):
```
Last Slide:
┌──────────────────────────┐
│ [Sign up with Google]    │  ← Social login
│      ─── or ───          │
│ [Import existing wallet] │  ← Clearer label
│    Skip for now          │  ← Optional skip
└──────────────────────────┘
```

---

## Code Highlights

### Conditional Rendering in Slide:
```typescript
{currentIndex === slides.length - 1 ? (
  /* Last Slide - Show Google Sign-In Buttons */
  <>
    <GoogleSignInButton onSuccess={handleGoogleSignIn} mode="signup" />
    <View style={styles.divider}>
      <Text>or</Text>
    </View>
    <TouchableOpacity>Import existing wallet</TouchableOpacity>
    <TouchableOpacity>Skip for now</TouchableOpacity>
  </>
) : (
  /* Other Slides - Show Next Button */
  <TouchableOpacity>Next</TouchableOpacity>
)}
```

### Google Sign-In Handler:
```typescript
const handleGoogleSignIn = async (idToken: string) => {
  await googleSignIn(idToken);          // Send to backend
  await setItem('hasOnboarded', 'true'); // Mark onboarding complete
  router.replace('/(tabs)');             // Go to home
};
```

---

## Next Steps

### 1. Add Redirect URI (Required)
Follow the instructions above to add the redirect URI to Google Cloud Console.

### 2. Test the Flow
```bash
npm start
```
Then:
- Navigate to last onboarding slide
- Click "Sign up with Google"
- Complete OAuth flow
- Verify you land on Home Screen

### 3. Optional: Add Email Sign-Up
If you want to add traditional email/password sign-up to the onboarding:
1. Add another button: "Sign up with Email"
2. Navigate to register screen
3. After registration, set `hasOnboarded` to `true`

---

## Troubleshooting

### Issue: "invalid_request" error
**Solution:** Add the redirect URI to Google Cloud Console (see above)

### Issue: Button doesn't show on last slide
**Solution:** Check that `currentIndex === slides.length - 1` condition is working

### Issue: After Google sign-in, still on onboarding
**Solution:** Verify `hasOnboarded` is being set to `'true'` (string, not boolean)

### Issue: "Sign-In is initializing" message
**Solution:** Wait a moment for expo-auth-session to prepare the OAuth request

---

## Summary

✅ Google Sign-In added to last onboarding slide
✅ Three clear options: Google, Import, or Skip
✅ Professional UI with divider
✅ Handles Google OAuth flow
✅ Sets onboarding completion flag
✅ Redirects to Home Screen

**Just add the redirect URI to Google Console and you're ready to go!**

---

**Last Updated:** 2025-11-11
**Status:** Complete - Waiting for redirect URI configuration
