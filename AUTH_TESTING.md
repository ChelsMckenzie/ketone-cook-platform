# Authentication Flow Testing Guide

## Prerequisites
- ✅ Dev server running on `http://localhost:3000`
- ✅ Supabase project configured with `.env.local`
- ✅ Google OAuth enabled in Supabase

## Test Scenarios

### 1. Email/Password Sign Up

**Steps:**
1. Navigate to `http://localhost:3000/signup`
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `Test1234` (must have uppercase, lowercase, and number)
   - Confirm Password: `Test1234`
3. Click "Create Account"
4. **Expected Result:**
   - Profile created in Supabase
   - Redirected to `/onboarding`
   - Header shows user menu (not login/signup buttons)

**Check:**
- [ ] Form validation works (try invalid email, weak password)
- [ ] Error messages display correctly
- [ ] Redirect to onboarding works
- [ ] Profile created in Supabase dashboard

---

### 2. Email/Password Sign In

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials from Test 1
3. Click "Sign In"
4. **Expected Result:**
   - If profile incomplete → Redirected to `/onboarding`
   - If profile complete → Redirected to `/dashboard`
   - Header shows user menu

**Check:**
- [ ] Invalid credentials show error
- [ ] Valid credentials redirect correctly
- [ ] User menu appears in header

---

### 3. Google OAuth Sign In

**Steps:**
1. Navigate to `http://localhost:3000/login` or `/signup`
2. Click "Sign in with Google" button
3. Complete Google authentication
4. **Expected Result:**
   - Redirected to Google OAuth consent screen
   - After consent, redirected to `/auth/callback`
   - Then redirected to `/onboarding` or `/dashboard`
   - Profile created automatically

**Check:**
- [ ] Google OAuth popup/redirect works
- [ ] Callback route processes correctly
- [ ] Profile created with Google account info
- [ ] Redirect to onboarding/dashboard works

---

### 4. Onboarding Flow

**Steps:**
1. Sign in (if not already)
2. You should be on `/onboarding` page
3. Complete the wizard:
   - Step 1: Name and DOB
   - Step 2: Gender
   - Step 3: Last period end (if Female)
   - Step 4: Location, Activity, Fasting Goal
4. Click "Complete Setup"
5. **Expected Result:**
   - Profile updated in Supabase
   - Redirected to `/dashboard`
   - Dashboard shows welcome message

**Check:**
- [ ] All steps validate correctly
- [ ] Conditional step 3 shows only for Female
- [ ] Form submission works
- [ ] Profile saved to database
- [ ] Redirect to dashboard works

---

### 5. Protected Routes

**Steps:**
1. Sign out (if signed in)
2. Try to access `http://localhost:3000/dashboard`
3. **Expected Result:**
   - Redirected to `/login`

**Check:**
- [ ] Dashboard redirects to login when not authenticated
- [ ] Onboarding redirects to login when not authenticated

---

### 6. Sign Out

**Steps:**
1. Sign in (if not already)
2. Click "Sign Out" in header
3. **Expected Result:**
   - Redirected to home page (`/`)
   - Header shows Login/Sign Up buttons
   - Cannot access protected routes

**Check:**
- [ ] Sign out works
- [ ] Redirect to home page
- [ ] Header updates correctly
- [ ] Protected routes are inaccessible

---

### 7. Profile Completion Check

**Steps:**
1. Sign in with incomplete profile
2. Try to access `/dashboard` directly
3. **Expected Result:**
   - Redirected to `/onboarding`

**Check:**
- [ ] Dashboard checks profile completion
- [ ] Redirects to onboarding if incomplete

---

## Common Issues & Solutions

### Issue: "Failed to create Supabase client"
- **Solution:** Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue: Google OAuth redirect error
- **Solution:** Verify redirect URI in Google Cloud Console matches `http://localhost:3000/auth/callback`

### Issue: Profile not created on signup
- **Solution:** Check Supabase RLS policies allow insert for authenticated users

### Issue: Redirect loop
- **Solution:** Check profile completion logic in dashboard/onboarding pages

---

## Database Checks

After testing, verify in Supabase Dashboard:

1. **Authentication → Users:**
   - [ ] User accounts created
   - [ ] Email confirmed (if email signup)

2. **Table Editor → profile:**
   - [ ] Profile rows created with correct `id` matching `auth.users.id`
   - [ ] Profile data saved correctly after onboarding

3. **Table Editor → recipes:**
   - [ ] Can query recipes (if any created)

---

## Test Accounts

Create test accounts for different scenarios:

1. **Complete Profile:**
   - Email: `complete@test.com`
   - Complete onboarding

2. **Incomplete Profile:**
   - Email: `incomplete@test.com`
   - Sign up but don't complete onboarding

3. **Google OAuth:**
   - Use your Google account
   - Test OAuth flow

---

## Next Steps After Testing

Once authentication is verified:
- ✅ Build dashboard features
- ✅ Implement cycle-aware fasting logic
- ✅ Create recipe generator
- ✅ Build meal logger
