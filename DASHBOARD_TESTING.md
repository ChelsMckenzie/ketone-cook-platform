# Dashboard Testing Guide

## Prerequisites
- ✅ Dev server running on `http://localhost:3000`
- ✅ User account created and signed in
- ✅ Onboarding completed

## Test Scenarios

### 1. View Profile Overview

**Steps:**
1. Navigate to `http://localhost:3000/dashboard`
2. Look for the "Profile Overview" section at the top

**Expected Result:**
- Profile Overview card displays all your information:
  - Full Name
  - Date of Birth (formatted nicely)
  - Gender
  - Last Period End (if Female)
  - Location Type
  - Activity Level
  - Fasting Goal
- "Edit" button visible in top-right corner

**Check:**
- [ ] All profile fields are displayed correctly
- [ ] Dates are formatted properly
- [ ] Activity level and location are capitalized nicely
- [ ] Fasting goal shows as "X hours (X:Y)" format

---

### 2. Edit Profile

**Steps:**
1. Click the "Edit" button in Profile Overview
2. Form should appear with all fields editable
3. Make a change (e.g., update your name or activity level)
4. Click "Save Changes"

**Expected Result:**
- Form appears with all current values pre-filled
- You can edit any field
- "Last Period End" field only shows if Gender is "Female"
- After saving, success message appears
- Page refreshes and shows updated information

**Check:**
- [ ] Edit button switches to edit mode
- [ ] All fields are pre-filled with current values
- [ ] Form validation works (try invalid inputs)
- [ ] Save button works
- [ ] Success message appears
- [ ] Page refreshes with updated data
- [ ] Changes are saved to database

---

### 3. Cancel Edit

**Steps:**
1. Click "Edit" button
2. Make some changes to the form
3. Click "Cancel" button

**Expected Result:**
- Form closes
- Returns to view mode
- Changes are discarded (not saved)

**Check:**
- [ ] Cancel button works
- [ ] Changes are not saved
- [ ] Returns to view mode

---

### 4. Cycle-Aware Information (Female Users)

**Steps:**
1. If you're a Female user with `last_period_end` set:
   - Check if cycle information appears
   - If in Luteal Phase (days 21-28), you should see a warning
   - If in other phases, you should see informational message

**Expected Result:**
- Cycle day is calculated correctly
- Phase is determined correctly
- Warning appears during Luteal Phase
- Info message appears for other phases

**Check:**
- [ ] Cycle day calculation is correct
- [ ] Luteal phase warning appears (if applicable)
- [ ] Other phase info appears (if applicable)

---

### 5. Fasting Timer

**Steps:**
1. Check if Fasting Timer appears (if fasting_goal is set)
2. Timer should show:
   - Time Fasted
   - Time Until Eating Window
   - Fasting Goal

**Expected Result:**
- Timer displays current fasting progress
- Updates every minute
- Shows goal in "X:Y" format

**Check:**
- [ ] Timer displays correctly
- [ ] Time updates (wait a minute to verify)
- [ ] Goal is displayed correctly

---

### 6. Quick Stats

**Steps:**
1. Check the Quick Stats section
2. Should show Activity Level and Location

**Expected Result:**
- Two cards displaying Activity Level and Location
- Information matches your profile

**Check:**
- [ ] Stats are displayed correctly
- [ ] Information matches profile

---

### 7. Profile Update Validation

**Steps:**
1. Click "Edit" in Profile Overview
2. Try to submit with invalid data:
   - Empty name
   - Invalid date
   - Missing required fields

**Expected Result:**
- Form validation prevents submission
- Error messages appear for invalid fields
- Save button is disabled or shows errors

**Check:**
- [ ] Validation works for all fields
- [ ] Error messages are clear
- [ ] Cannot save invalid data

---

### 8. Conditional Fields

**Steps:**
1. If you're Female:
   - Edit profile
   - "Last Period End" field should appear
2. If you're Male/Other:
   - Edit profile
   - "Last Period End" field should NOT appear

**Expected Result:**
- Field visibility matches gender
- Form adapts correctly

**Check:**
- [ ] Conditional field logic works
- [ ] Field appears/disappears based on gender

---

## Common Issues & Solutions

### Issue: Profile Overview not showing
- **Solution:** Make sure you've completed onboarding and have a complete profile

### Issue: Edit form not saving
- **Solution:** Check browser console for errors, verify Supabase connection

### Issue: Changes not reflecting after save
- **Solution:** Page should auto-refresh. If not, manually refresh the page

### Issue: Cycle information not showing
- **Solution:** Make sure you're Female and have `last_period_end` set in your profile

### Issue: Fasting timer not working
- **Solution:** Make sure `fasting_goal` is set in your profile

---

## Database Verification

After testing, verify in Supabase Dashboard:

1. **Table Editor → profile:**
   - [ ] Profile data is updated correctly
   - [ ] `updated_at` timestamp changes when you save

2. **Check specific fields:**
   - [ ] Full name updates
   - [ ] Date of birth updates
   - [ ] Activity level updates
   - [ ] Fasting goal updates

---

## Test Checklist

- [ ] Profile Overview displays correctly
- [ ] Edit mode works
- [ ] Form validation works
- [ ] Save functionality works
- [ ] Cancel functionality works
- [ ] Success/error messages appear
- [ ] Page refreshes after save
- [ ] Changes persist in database
- [ ] Cycle information displays (if applicable)
- [ ] Fasting timer displays (if applicable)
- [ ] Conditional fields work correctly
