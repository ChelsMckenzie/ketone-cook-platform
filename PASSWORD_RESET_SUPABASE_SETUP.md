# Password Reset - Supabase Configuration Guide

## ⚠️ IMPORTANT: Complete these Supabase settings before testing password reset

The password reset flow requires specific Supabase configuration. Follow these steps in order:

---

## Step 1: Configure Site URL

1. **Go to Supabase Dashboard:**
   - Navigate to: https://app.supabase.com
   - Select your KetoMate project

2. **Open Authentication Settings:**
   - Click **Project Settings** (gear icon in left sidebar)
   - Click **Authentication** in the settings menu
   - Scroll down to **URL Configuration**

3. **Set Site URL:**
   - In the **Site URL** field, enter: `https://ketomate.co.za`
   - Click **Save**

---

## Step 2: Whitelist Redirect URLs

**This is critical!** Supabase will reject redirects to URLs that aren't whitelisted.

1. **In the same URL Configuration section:**
   - Find the **Redirect URLs** field (below Site URL)
   - Click **Add URL** or edit the existing list

2. **Add the following URLs (one per line):**

   ```
   https://ketomate.co.za/auth/callback
   https://ketomate.co.za/auth/reset-password
   https://www.ketomate.co.za/auth/callback
   https://www.ketomate.co.za/auth/reset-password
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/reset-password
   ```

3. **Click Save**

   **Note:** If you're using a different domain or subdomain, add those URLs as well.

---

## Step 3: Verify Email Settings

1. **Go to Authentication → Email Templates:**
   - In the left sidebar, click **Authentication**
   - Click **Email Templates**

2. **Check Password Reset Template:**
   - Find the **Reset Password** template
   - Ensure it's enabled (should be by default)
   - Optionally customize the email content to match your branding

3. **Verify Email Provider:**
   - Go to **Project Settings → Auth → Email Auth**
   - Ensure email sending is enabled
   - If using custom SMTP, verify those settings

---

## Step 4: Verify Password Settings

1. **Go to Authentication → Settings:**
   - Click **Authentication** in left sidebar
   - Click **Settings** (or **Password** tab)

2. **Check Password Requirements:**
   - Verify password requirements match your app (minimum length, complexity, etc.)
   - Password reset should be enabled by default

---

## Verification Checklist

After completing the above steps, verify:

- [ ] Site URL is set to `https://ketomate.co.za`
- [ ] All redirect URLs are added to the whitelist
- [ ] Email templates are enabled
- [ ] Password reset is enabled in settings

---

## Testing the Flow

Once Supabase is configured:

1. **Test Password Reset:**
   - Go to `/login`
   - Click "Forgot Password?"
   - Enter your email
   - Check your email inbox
   - Click the reset link in the email

2. **Expected Flow:**
   - Email link should go to: `https://ketomate.co.za/auth/callback?code=xxx&type=recovery`
   - You should be redirected to `/auth/reset-password`
   - You should be able to set a new password
   - After setting password, you should be redirected to `/dashboard`

---

## Troubleshooting

### Issue: Redirect URL not whitelisted
**Error:** "Invalid redirect URL" or redirects to login page

**Solution:** 
- Double-check all redirect URLs are added in Supabase Dashboard
- Ensure URLs match exactly (including http/https, www/non-www)
- Wait a few minutes after saving for changes to propagate

### Issue: Email not received
**Solution:**
- Check spam/junk folder
- Verify email address is correct
- Check Supabase Dashboard → Authentication → Users → View user → Check email logs
- Verify email provider settings in Supabase

### Issue: Session expires immediately
**Solution:**
- Ensure Site URL is correctly set
- Verify redirect URLs include both callback and reset-password URLs
- Check that cookies are being set properly (check browser dev tools)

### Issue: "Session expired" error
**Solution:**
- The reset link may have expired (links typically expire after 1 hour)
- Request a new password reset
- Ensure you're clicking the link within the expiration window

---

## Additional Notes

- **Local Development:** Make sure to add `http://localhost:3000` URLs for local testing
- **Multiple Domains:** If you have multiple domains (e.g., www and non-www), add both
- **HTTPS Required:** Production URLs must use HTTPS
- **URL Matching:** Supabase requires exact URL matches - check for trailing slashes, query parameters, etc.

---

## Need Help?

If password reset still doesn't work after completing these steps:
1. Check browser console for errors
2. Check Supabase Dashboard → Logs for authentication errors
3. Verify environment variables are set correctly (`NEXT_PUBLIC_SITE_URL`)
4. Ensure code changes have been deployed to production
