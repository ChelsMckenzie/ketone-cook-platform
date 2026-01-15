# Email Confirmation Flow Guide

## How It Works

With email confirmation enabled in Supabase, here's the complete flow:

### 1. User Signs Up

**Steps:**
1. User fills out signup form at `/signup`
2. Submits email and password
3. Supabase creates the user account
4. Profile entry is created in database (with user ID)
5. Supabase sends confirmation email

**What Happens:**
- User is **NOT** authenticated yet (no session)
- User is redirected to `/auth/confirm-email` page
- Confirmation email is sent to their inbox

### 2. User Confirms Email

**Steps:**
1. User checks their email inbox
2. Clicks the confirmation link in the email
3. Link redirects to: `http://localhost:3000/auth/callback?code=xxx&type=signup`
4. Callback route exchanges the code for a session
5. User is now authenticated

**What Happens:**
- Session is created
- Profile is verified/created if needed
- User is redirected based on profile completion:
  - If profile incomplete → `/onboarding`
  - If profile complete → `/dashboard`

### 3. User Signs In

**Steps:**
1. User goes to `/login`
2. Enters email and password
3. If email is confirmed → Signs in successfully
4. If email is NOT confirmed → Error: "Email not confirmed"

**What Happens:**
- If confirmed: Redirected to `/onboarding` or `/dashboard`
- If not confirmed: Error message displayed

## Testing the Flow

### Test Scenario 1: Complete Signup Flow

1. **Sign Up:**
   - Go to `http://localhost:3000/signup`
   - Enter email: `test@example.com`
   - Enter password: `Test1234`
   - Click "Create Account"
   - **Expected:** Redirected to `/auth/confirm-email`

2. **Check Email:**
   - Open your email inbox (or Supabase Dashboard → Authentication → Users → View email)
   - Find the confirmation email
   - Click the confirmation link
   - **Expected:** Redirected to `/onboarding`

3. **Complete Onboarding:**
   - Fill out the wizard
   - Submit
   - **Expected:** Redirected to `/dashboard`

### Test Scenario 2: Sign In After Confirmation

1. **Sign Out** (if signed in)
2. **Sign In:**
   - Go to `/login`
   - Enter confirmed email and password
   - **Expected:** Redirected to `/dashboard` (or `/onboarding` if incomplete)

### Test Scenario 3: Sign In Before Confirmation

1. **Sign Up** but don't confirm email
2. **Try to Sign In:**
   - Go to `/login`
   - Enter email and password
   - **Expected:** Error message: "Email not confirmed"

## Supabase Email Settings

### View Confirmation Emails

In Supabase Dashboard:
1. Go to **Authentication → Users**
2. Find your test user
3. Click on the user
4. You can see the confirmation email or resend it

### Email Templates

Supabase uses default email templates. You can customize them:
1. Go to **Authentication → Email Templates**
2. Customize the confirmation email template

### Resend Confirmation Email

If user didn't receive email:
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user
3. Click "Resend confirmation email"

Or add a "Resend confirmation" feature to your app (future enhancement).

## Troubleshooting

### Issue: User redirected to login after signup
- **Cause:** Email confirmation is required but user hasn't confirmed
- **Solution:** Check email inbox and click confirmation link

### Issue: Confirmation link doesn't work
- **Cause:** Link expired or invalid
- **Solution:** Request new confirmation email from Supabase Dashboard

### Issue: "Email not confirmed" error on sign in
- **Cause:** User hasn't clicked confirmation link
- **Solution:** Check email and click confirmation link

### Issue: User can sign in without confirming
- **Cause:** Email confirmation might be disabled in Supabase
- **Solution:** Check Supabase Dashboard → Authentication → Settings → Email Auth → "Enable email confirmations"

## Code Flow Summary

```
Sign Up
  ↓
Create User (no session)
  ↓
Create Profile Entry
  ↓
Redirect to /auth/confirm-email
  ↓
[User clicks email link]
  ↓
/auth/callback?code=xxx&type=signup
  ↓
Exchange Code for Session
  ↓
User Authenticated
  ↓
Check Profile Completion
  ↓
Redirect to /onboarding or /dashboard
```

## Files Involved

- `lib/actions/auth.ts` - Signup action checks for session
- `app/auth/confirm-email/page.tsx` - Confirmation instructions page
- `app/auth/callback/route.ts` - Handles email confirmation callback
- `app/login/page.tsx` - Shows error if confirmation failed
