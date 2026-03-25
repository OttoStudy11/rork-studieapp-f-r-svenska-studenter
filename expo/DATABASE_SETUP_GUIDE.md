# Database Setup Guide for Study App

This guide will help you set up the complete database structure for the study app, ensuring proper timer data storage and statistics tracking.

## Overview

The app now properly stores all timer sessions and user data to Supabase. No mock data is used - everything is persisted to the database.

## Database Tables

### Core Tables
- **profiles** - User profiles with onboarding data
- **courses** - Available courses  
- **user_courses** - User-specific course enrollments with progress
- **pomodoro_sessions** - Timer/study sessions with duration tracking
- **notes** - User notes linked to courses
- **user_progress** - Cached statistics for performance
- **achievements** - Available achievements
- **user_achievements** - User progress on achievements

## Setup Instructions

### Step 1: Run the Main Database Setup

Run this SQL file in your Supabase SQL Editor:

```sql
-- File: fix-pomodoro-and-statistics.sql
```

This will:
- ✅ Create/update the `pomodoro_sessions` table with correct structure
- ✅ Set up RLS policies for secure data access
- ✅ Create indexes for better query performance
- ✅ Add a statistics calculation function
- ✅ Create a view for easy statistics access

### Step 2: Verify the Setup

After running the SQL, verify the structure:

```sql
-- Check pomodoro_sessions table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pomodoro_sessions';

-- Expected columns:
-- id (uuid)
-- user_id (uuid)  
-- course_id (text, nullable)
-- duration (integer) - in minutes
-- start_time (timestamptz)
-- end_time (timestamptz)
-- created_at (timestamptz)
-- updated_at (timestamptz)
```

### Step 3: Test Data Flow

The app now handles data in this flow:

1. **Timer Session Complete** → `addPomodoroSession()` called
2. **Database Insert** → Session saved to `pomodoro_sessions` table
3. **State Update** → Local state updated with database record
4. **Statistics Calculated** → Stats calculated from database sessions
5. **UI Updates** → Home screen and timer show real data

## How It Works

### Timer Data Storage

When a focus session completes:

```typescript
// Timer calls this:
await addPomodoroSession({
  courseId: selectedCourse || undefined,
  duration: focusTime, // in minutes
  startTime: sessionStartTime.toISOString(),
  endTime: new Date().toISOString()
});
```

The context then:
1. Saves to Supabase `pomodoro_sessions` table
2. Updates local state with the saved session
3. Returns the session with database-generated ID

### Statistics Calculation

Statistics are calculated from real database data:

```typescript
// Today's sessions
const todaySessions = pomodoroSessions.filter(session => {
  const today = new Date().toDateString();
  const sessionDate = new Date(session.endTime).toDateString();
  return today === sessionDate;
});

// Total study time
const totalStudyTime = pomodoroSessions.reduce(
  (sum, session) => sum + session.duration, 
  0
);
```

### Streak Calculation

Streaks are calculated from consecutive days with study sessions:

```sql
-- Use the provided calculate_user_statistics function
SELECT * FROM calculate_user_statistics('user-id-here');

-- Returns:
-- - current_streak: Days studying consecutively including today
-- - longest_streak: Best streak ever achieved
-- - total_sessions: All time session count
-- - total_minutes: All time study minutes
```

## Data Flow Diagram

```
User completes timer
    ↓
addPomodoroSession() called
    ↓
Check database connection
    ↓
    ├─ Connected? → Save to Supabase
    │                 ↓
    │              Get ID from database
    │                 ↓
    │              Update local state
    │                 ↓
    │              UI shows real data ✅
    │
    └─ Not connected? → Save locally
                         ↓
                      Local ID generated
                         ↓
                      Will sync later
```

## Troubleshooting

### Issue: Sessions not saving

**Check:**
1. Database connection: Check console for "Database not available" messages
2. RLS policies: Ensure user is authenticated
3. Table structure: Verify columns match expected schema

**Fix:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'pomodoro_sessions';

-- Should show rowsecurity = true

-- Check policies exist
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'pomodoro_sessions';

-- Should show INSERT, SELECT, UPDATE, DELETE policies
```

### Issue: Statistics not showing

**Check:**
1. Sessions exist in database
2. Sessions have valid end_time
3. Duration is stored in minutes (not seconds)

**Fix:**
```sql
-- Check your sessions
SELECT 
    id,
    duration,
    start_time,
    end_time,
    DATE(end_time) as session_date
FROM pomodoro_sessions
WHERE user_id = 'your-user-id'
ORDER BY end_time DESC
LIMIT 10;

-- Calculate stats manually
SELECT 
    COUNT(*) as total_sessions,
    SUM(duration) as total_minutes,
    COUNT(*) FILTER (WHERE DATE(end_time) = CURRENT_DATE) as today_sessions
FROM pomodoro_sessions
WHERE user_id = 'your-user-id';
```

### Issue: Duplicate sessions or wrong IDs

**Check:**
1. Are sessions being created twice?
2. Check for race conditions in timer completion

**Fix:**
- The app now uses database-generated IDs
- Each session is inserted once with `.single()`
- Local fallback only used if database unavailable

## Performance Considerations

### Indexes

The setup creates these indexes for fast queries:

```sql
-- User's sessions (most common query)
idx_pomodoro_sessions_user_id

-- Sessions by course
idx_pomodoro_sessions_course_id

-- Sessions by date
idx_pomodoro_sessions_end_time

-- Combined user + date (for statistics)
idx_pomodoro_sessions_user_end_time
```

### Caching

For better performance, consider:

1. **Limit loaded sessions**: App loads last 50 sessions
2. **Use the statistics view**: Pre-calculated aggregations
3. **Client-side caching**: Sessions stored in React state

## Data Validation

The app validates data at multiple levels:

### TypeScript Types
```typescript
interface PomodoroSession {
  id: string;
  courseId?: string;
  duration: number;      // Must be > 0
  startTime: string;     // ISO 8601 format
  endTime: string;       // ISO 8601 format
}
```

### Database Constraints
```sql
-- duration must be positive
duration INTEGER NOT NULL CHECK (duration > 0)

-- end_time must be after start_time  
CHECK (end_time > start_time)

-- Foreign key to user
user_id REFERENCES profiles(id)
```

## Migration from Mock Data

If you had mock data before, it's now replaced with real data:

1. ✅ Timer sessions → Saved to `pomodoro_sessions`
2. ✅ User courses → Saved to `user_courses`
3. ✅ User profile → Saved to `profiles`
4. ✅ Study progress → Calculated from real sessions
5. ✅ Statistics → Derived from database queries

## Next Steps

After setup:

1. ✅ Test timer functionality
2. ✅ Complete a study session
3. ✅ Verify data appears in database
4. ✅ Check statistics update correctly
5. ✅ Test across multiple days for streaks

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify database connection in Supabase dashboard
3. Ensure RLS policies are correctly configured
4. Check that user is properly authenticated

## Summary

✅ **No more mock data** - Everything is stored in the database
✅ **Real statistics** - Calculated from actual study sessions  
✅ **Persistent data** - Sessions survive app restarts
✅ **Secure access** - RLS ensures users only see their own data
✅ **Fast queries** - Indexes optimize common operations
✅ **Type safety** - TypeScript ensures data integrity
