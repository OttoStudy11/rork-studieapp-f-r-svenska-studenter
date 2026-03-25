# Fix Course Assignment During Account Creation

## Problem
When creating a new account and completing onboarding, courses are not being assigned to users for both gymnasium and university students.

## Root Causes

1. **Missing database schema columns** - The courses table might be missing required columns
2. **Foreign key type mismatches** - user_id or course_id types don't match
3. **RLS policies blocking inserts** - Row Level Security preventing course creation
4. **Missing courses in database** - No courses exist to be assigned

## Solution

### Step 1: Run the SQL Fix Script

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `fix-course-assignment-complete.sql`
5. Click **Run**

This script will:
- ✅ Ensure courses table has correct schema
- ✅ Ensure user_courses table has correct structure
- ✅ Create necessary indexes
- ✅ Setup permissive RLS policies
- ✅ Insert sample gymnasium courses
- ✅ Verify the setup

### Step 2: Test Account Creation

1. **Log out** of your current account
2. **Sign up** with a new email
3. **Complete onboarding** by selecting:
   - Study level (gymnasium or university)
   - School and program
   - Courses (for gymnasium)
   - Goals and preferences
4. **Check browser console** for logs:
   ```
   Creating course in database: MATMAT01a
   Successfully synced X courses to Supabase
   ```

### Step 3: Verify in Supabase

After completing onboarding, check in Supabase:

1. Go to **Table Editor**
2. Check `user_courses` table
3. You should see rows with your user_id and course assignments

## What the Fix Does

### 1. Schema Updates
```sql
-- Ensures courses table has all required columns
- course_status (active/inactive)
- education_level (gymnasie/högskola)
- education_year (1, 2, 3, etc.)
- program_id
- school_id
```

### 2. RLS Policies
```sql
-- Makes course creation permissive
- Anyone can view courses
- Authenticated users can insert courses
- Users can manage their own course assignments
```

### 3. Sample Data
Inserts basic gymnasium courses so there's something to assign:
- Matematik 1a, 1b, 1c
- Svenska 1
- Engelska 5

## Debugging

If courses still aren't assigned, check browser console for errors:

### Error: "Error inserting course"
**Solution**: Course ID might already exist or have invalid data
- Check if course already exists in database
- Verify all required fields are present

### Error: "Error syncing user course"
**Solution**: Foreign key constraint violation
- Verify user_id exists in profiles table
- Verify course_id exists in courses table
- Check RLS policies allow insertion

### Error: "No courses found in database"
**Solution**: No courses exist for the selected program
- Run the SQL script to insert sample courses
- Or add courses manually in Supabase Table Editor

## Manual Course Assignment (Temporary Workaround)

If automatic assignment fails, you can manually assign courses:

1. Go to Supabase **Table Editor**
2. Open `user_courses` table
3. Click **Insert row**
4. Fill in:
   - `id`: `<user_id>-<course_id>` (e.g., "abc123-MATMAT01a")
   - `user_id`: Your user UUID from profiles table
   - `course_id`: Course ID (e.g., "MATMAT01a")
   - `progress`: 0
   - `is_active`: true
5. Click **Save**

## Expected Behavior After Fix

### Gymnasium Students
- ✅ Courses are assigned based on program and year
- ✅ Mandatory courses are pre-selected
- ✅ User can select additional elective courses
- ✅ Courses appear immediately in home screen

### University Students
- ✅ Courses are fetched from database based on program
- ✅ First 4 courses are marked as active
- ✅ Fallback to hardcoded courses if database is empty
- ✅ Courses synced to Supabase

## Verification Queries

Run these in SQL Editor to verify:

```sql
-- Check if courses exist
SELECT COUNT(*), level FROM public.courses 
GROUP BY level;

-- Check user course assignments for a specific user
SELECT 
  uc.id,
  uc.user_id,
  c.title as course_title,
  c.level,
  uc.is_active,
  uc.progress
FROM public.user_courses uc
JOIN public.courses c ON uc.course_id = c.id
WHERE uc.user_id = '<your-user-id>';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE tablename IN ('courses', 'user_courses');
```

## Still Having Issues?

If courses are still not being assigned:

1. Check browser console for error messages
2. Check Supabase logs (Dashboard → Logs)
3. Verify auth.uid() matches your user_id in profiles
4. Try with a fresh account
5. Check if the error messages mention specific column names or foreign keys

The most common issue is RLS policies being too restrictive or foreign key constraints failing due to type mismatches.
