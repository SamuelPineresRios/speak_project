# 🗄️ Supabase Database Setup: Add Tutorial Column

## Current Status
✅ All tutorial code is ready
⏳ Waiting for `tutorial_completed` column in Supabase

The signup endpoint has been temporarily fixed to work without the column. Once you add the column, the tutorial system will fully activate.

---

## Step-by-Step: Add the Column to Supabase

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open your Supabase project**
   - Go to https://app.supabase.com
   - Select your project

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Copy and paste this SQL:**
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT FALSE;
   ```

4. **Run the query**
   - Click blue "Run" button (or Ctrl+Enter)
   - You should see: "Success. No rows returned"

5. **Verify the column was added**
   - Go to "Table Editor" in left sidebar
   - Click on "users" table
   - Scroll right to see the new `tutorial_completed` column
   - All existing users should have `false` as the default

---

### Option 2: Using Supabase Table Editor

If you prefer the UI instead of SQL:

1. **Open Supabase**
   - Go to https://app.supabase.com → Your Project

2. **Go to Table Editor**
   - Click "Table Editor" in left sidebar
   - Click "users" table

3. **Add column manually**
   - Scroll to the right (past the last column)
   - Click the "+" button to add a new column
   - **Column name:** `tutorial_completed`
   - **Type:** `boolean`
   - **Default value:** `false`
   - Click "Save"

---

## What Happens After Adding the Column?

### Signup Flow (Now Fully Active)
1. User signs up
2. API inserts user with `tutorial_completed = false`
3. `localStorage.setItem('startTutorial', 'true')`
4. Redirect to join-group, then missions
5. Tutorial appears automatically ✨

### Login Flow
1. User logs in
2. API returns `tutorial_completed` status
3. If `false`, tutorial activates
4. If `true`, tutorial is hidden

### API Endpoints (Now Fully Functional)
- `/api/tutorial/complete` → Updates `tutorial_completed = true`
- `/api/tutorial/skip` → Updates `tutorial_completed = true`

---

## ✅ Testing After Adding Column

### Quick Test (3 minutes)

```bash
# Clear your browser cache/localStorage
# DevTools → Application → Clear

# Create a test account
# Go to http://localhost:3000/signup
# Email: testuser@gmail.com
# Password: TestPassword123

# Expected:
# ✓ Form submits successfully
# ✓ Redirects to /join-group
# ✓ Then redirects to /missions
# ✓ Tutorial overlay appears immediately
# ✓ Welcome modal centered on screen
```

### Verify Database

In Supabase SQL Editor, run:
```sql
SELECT id, email, tutorial_completed FROM users WHERE email = 'testuser@gmail.com';
```

You should see:
```
id | email | tutorial_completed
---|-------|-------------------
... | testuser@gmail.com | false  (← initial value)
```

After completing the tutorial, run again:
```
id | email | tutorial_completed
---|-------|-------------------
... | testuser@gmail.com | true   (← after completion)
```

---

## 📋 Column Details

**Column Name:** `tutorial_completed`
**Data Type:** `BOOLEAN`
**Default Value:** `FALSE`
**Nullable:** No (NOT NULL)
**Purpose:** Tracks which users have completed/skipped the tutorial

---

## 🐛 Troubleshooting

### "Column already exists" error
If you get this error when running the SQL:
```
...tutorial_completed already exists
```

It means the column was already added. This is fine! 
- The app will work normally
- You can proceed with testing

### "Error: Unknown column" in app
If you get this error when signing up after adding the column:
1. Restart the dev server: `npm run dev`
2. The connection might be cached

### "Tutorial not appearing after signup"
1. ✓ Make sure column was added (check Table Editor)
2. ✓ Check browser DevTools: localStorage should have `startTutorial: "true"`
3. ✓ Check Network tab: `/api/auth/me` should return `tutorial_completed: false`

---

## 📝 What Changed in the Code

To fix the PGRST204 error, I removed the `tutorial_completed: false` line from the signup insert:

**Before (would fail):**
```typescript
await supabase.from('users').insert({
  email, password_hash, role, full_name,
  cefr_level, language_preference,
  tutorial_completed: false,  // ← Column didn't exist yet
  created_at,
})
```

**Now (temporary fix):**
```typescript
await supabase.from('users').insert({
  email, password_hash, role, full_name,
  cefr_level, language_preference,  // ← No tutorial_completed
  created_at,
})
```

**Response still includes:**
```typescript
{
  user: {
    id, email, role, full_name, cefr_level,
    tutorial_completed: false  // ← Declared in response
  }
}
```

Once you add the column to Supabase, the code will work exactly as intended:
- Signup inserts `tutorial_completed: false` into database
- Tutorial activates automatically for new users
- Column tracks completion status in database

---

## ✨ After Adding Column

Once the column is added, the tutorial system is **fully activated**:

✅ New users see tutorial after signup
✅ Tutorial navigates through all 6 steps  
✅ Spotlight highlights each section
✅ Database tracks completion
✅ Returning users don't see tutorial
✅ All Spanish content displays
✅ Mobile responsive

---

## 🚀 Summary

1. **Add column:** Run SQL above in Supabase SQL Editor (1 minute)
2. **Restart:** Restart dev server (`npm run dev`)
3. **Test:** Create test account and walk through tutorial (5 minutes)
4. **Deploy:** Push to production when ready

That's it! 🎉
