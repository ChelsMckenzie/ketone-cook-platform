# How to Get Email Confirmation Link

## Option 1: View in Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard:**
   - Navigate to **Authentication → Users**
   - Find the user you just created (by email)

2. **View User Details:**
   - Click on the user's email/row
   - You'll see user details including:
     - User ID
     - Email
     - Email confirmed status
     - Created at timestamp

3. **Get Confirmation Link:**
   - Look for a section showing the confirmation token/link
   - Or check the "Email" tab if available
   - Some Supabase versions show the confirmation link directly

## Option 2: Use Supabase SQL Editor

1. **Go to SQL Editor in Supabase Dashboard**

2. **Run this query to get confirmation token:**
   ```sql
   SELECT 
     id,
     email,
     email_confirmed_at,
     confirmation_token,
     confirmation_sent_at
   FROM auth.users
   WHERE email = 'your-email@example.com';
   ```

3. **Construct the confirmation URL:**
   ```
   http://localhost:3000/auth/callback?code=CONFIRMATION_TOKEN&type=signup
   ```
   Replace `CONFIRMATION_TOKEN` with the token from the query result.

## Option 3: Check Email Settings

### If emails aren't being sent:

1. **Check Supabase Email Settings:**
   - Go to **Project Settings → Auth**
   - Check "Enable email confirmations" is ON
   - Check "SMTP Settings" if using custom SMTP

2. **For Development:**
   - Supabase might not send emails in local development
   - Use the dashboard method above instead
   - Or configure a test email service

## Option 4: Resend Confirmation Email

1. **In Supabase Dashboard:**
   - Go to **Authentication → Users**
   - Click on the user
   - Look for "Resend confirmation email" button
   - Click it to send a new email

## Option 5: Manual Confirmation (For Testing)

If you just need to test the flow, you can manually confirm the email in Supabase:

1. **Go to SQL Editor**
2. **Run this query:**
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = NOW()
   WHERE email = 'your-email@example.com';
   ```

   **⚠️ Warning:** This bypasses email confirmation. Only use for testing!

3. **Then sign in normally** - the user will be treated as confirmed

## Quick Test Flow

For fastest testing:

1. **Sign up** with your email
2. **Manually confirm** using SQL query above
3. **Sign in** - should work immediately
4. **Complete onboarding**

This lets you test the full flow without waiting for emails.
