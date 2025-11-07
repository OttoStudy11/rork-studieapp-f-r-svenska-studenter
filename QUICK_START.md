# Quick Start - Remove Mock Data

## 🎯 What This Does

Removes ALL mock data from your app and stores everything (timer sessions, statistics, user data) in Supabase database.

## ⚡ Quick Setup (3 Steps)

### Step 1: Run SQL File
Copy and run this in your Supabase SQL Editor:

**File:** `fix-pomodoro-and-statistics.sql`

This creates/fixes the `pomodoro_sessions` table with:
- Correct column structure
- RLS security policies  
- Performance indexes
- Statistics functions

### Step 2: Verify Setup
Run this in Supabase SQL Editor to confirm:

```sql
-- Check table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pomodoro_sessions';

-- You should see:
-- id, user_id, course_id, duration, start_time, end_time, created_at, updated_at
```

### Step 3: Test It
1. Open your app
2. Complete a timer session (any duration)
3. Check Supabase dashboard → Table Editor → `pomodoro_sessions`
4. You should see your session saved!

## ✅ What Changed

### Before (Mock Data)
```typescript
// Fake data that disappears
const mockSessions = [
  { id: 'fake-1', duration: 25, ... },
  { id: 'fake-2', duration: 25, ... }
];
```

### After (Real Database)
```typescript
// Real data from Supabase
await supabase
  .from('pomodoro_sessions')
  .insert({ user_id, duration: 25, ... });
// ✅ Saved to database
// ✅ Has real UUID
// ✅ Persists forever
// ✅ Used for statistics
```

## 🔍 How to Verify It Works

### Check Database
```sql
-- Your sessions
SELECT * FROM pomodoro_sessions 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;

-- Your statistics
SELECT 
  COUNT(*) as sessions,
  SUM(duration) as total_minutes
FROM pomodoro_sessions
WHERE user_id = 'your-user-id';
```

### Check App
1. **Home Screen:**
   - Should show real session count
   - Should show real study time
   - Should show real streaks

2. **Timer Screen:**
   - Complete a session
   - Should save to database
   - Statistics should update immediately

3. **App Restart:**
   - Close and reopen app
   - Data should still be there
   - All statistics should persist

## 🐛 Troubleshooting

### "Database not available"
→ Check your `.env` file has correct Supabase credentials

### Sessions not saving
→ Run the SQL setup file again
→ Check RLS policies are enabled

### Wrong statistics
→ Verify `duration` is in minutes (not seconds)
→ Check `end_time` is later than `start_time`

### Can't see data
→ Make sure you're logged in
→ RLS ensures you only see YOUR data

## 📊 What Gets Stored

### Pomodoro Sessions
```typescript
{
  id: "uuid-from-database",
  user_id: "your-user-id", 
  course_id: "MATMAT01a", // or null
  duration: 25, // minutes
  start_time: "2025-01-07T10:00:00Z",
  end_time: "2025-01-07T10:25:00Z",
  created_at: "2025-01-07T10:25:00Z"
}
```

### Statistics (Calculated)
- Total sessions: `COUNT(*)`
- Total time: `SUM(duration)`
- Today's sessions: `WHERE DATE(end_time) = CURRENT_DATE`
- Streaks: Consecutive days with sessions

## 🎉 Benefits

✅ **No mock data** - Everything is real
✅ **Persistent** - Data survives app restarts
✅ **Secure** - RLS protects your data
✅ **Fast** - Indexed queries
✅ **Accurate** - Statistics from real data
✅ **Scalable** - Ready for thousands of sessions

## 📁 Files Included

1. `fix-pomodoro-and-statistics.sql` - Database setup
2. `contexts/StudyContext.tsx` - Updated to save to DB
3. `DATABASE_SETUP_GUIDE.md` - Detailed documentation
4. `MOCK_DATA_REMOVAL_SUMMARY.md` - Complete change log
5. `QUICK_START.md` - This file

## 🚀 You're Done!

After running the SQL file:
- ✅ Timer sessions save to database
- ✅ Statistics are calculated from real data
- ✅ No more mock/fake data
- ✅ Everything persists properly

Just use your app normally - it will work! 🎊
