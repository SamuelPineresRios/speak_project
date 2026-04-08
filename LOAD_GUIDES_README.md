# 📚 Loading Guide Data to Supabase

This script loads all learning guide data from `seed_guides.json` into your Supabase database.

## Prerequisites

1. **Supabase Account & Project** - Must be set up
2. **Environment Variables** - Create `.env.local` file in the project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role secret key** → `SUPABASE_SERVICE_ROLE_KEY`

## Creating .env.local

Copy the `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
# Then edit .env.local with your actual Supabase credentials
```

## Running the Script

Once `.env.local` is set up with Supabase credentials:

```bash
# Load guides to Supabase
node load_guides_to_supabase.js
```

You should see output like:
```
📄 Found .env.local
📚 Loading 8 guides to Supabase...
🔗 URL: https://your-project.supabase.co
✅ Guide "Conditional Sentences" (guide-004) loaded
✅ Guide "Passive Voice" (guide-005) loaded
...
✨ Complete! Loaded: 8, Errors: 0
```

## Verifying in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this query to verify guides were loaded:

```sql
SELECT id, title, cefr_level, content IS NOT NULL as has_content
FROM guides
ORDER BY id;
```

You should see 8 rows with all guides.

## Troubleshooting

**❌ "Missing Supabase credentials"**
- Verify `.env.local` exists in the project root
- Check that credentials are correct from Supabase dashboard
- Make sure variable names match exactly: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

**❌ "Unauthorized" or "401 Unauthenticated"**
- Verify the `SUPABASE_SERVICE_ROLE_KEY` is correct (not the anon key)
- Check that your Supabase table `guides` exists

**❌ "table "guides" does not exist"**
- Ensure you've run the Supabase migrations to create the tables
- Check the Supabase SQL Editor for table existence

## What Gets Loaded

The script loads 8 learning guides with:
- ✅ Full content (introduction, key_structures, common_expressions, exercises)
- ✅ Metadata (title, description, CEFR level, tags)
- ✅ Connections (mission_connection, story_connection)
- ✅ Publication status

---

**Note:** This script will delete any existing guides with matching IDs before inserting new ones.
