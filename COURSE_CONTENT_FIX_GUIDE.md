# Course Content Display Fix Guide

## Problem
The course detail page is not showing:
- Hero card
- course_modules
- course_lessons

## Root Causes

### 1. Missing or Unpublished Content
- Modules exist but `is_published = false`
- Lessons exist but `is_published = false`
- No content exists for the course at all

### 2. ID Mismatches
- Course IDs in `user_courses` don't match IDs in `courses` table
- Course codes vs course IDs confusion
- Lessons have wrong `course_id` that doesn't match their module's `course_id`

### 3. Data Structure Issues
- Orphaned modules (no parent course)
- Orphaned lessons (no parent module)
- Incorrect relationships

## Solution Steps

### Step 1: Diagnose the Issue
Run the diagnostic SQL to understand what's in your database:

```bash
# In Supabase SQL Editor, run:
diagnose-course-content.sql
```

This will show you:
- All courses
- Which courses have modules
- Which courses have lessons
- Orphaned data
- Test queries for your specific courses

### Step 2: Fix Existing Content
Run the fix SQL to:
- Ensure all content is published
- Fix ID mismatches
- Create sample content for Naturkunskap 1a2

```bash
# In Supabase SQL Editor, run:
fix-course-content-display.sql
```

### Step 3: Verify in the App
1. Open the app
2. Navigate to a course (e.g., Naturkunskap 1a2)
3. Check that you see:
   - ✅ Hero card with course info
   - ✅ Modules section
   - ✅ Lessons within each module
   - ✅ Study guides (if available)

### Step 4: Populate More Courses
If you need content for other courses, use the template in `fix-course-content-display.sql` and adapt it for:
- Matematik 1a, 1b, 1c
- Svenska 1, 2, 3
- Engelska 5, 6, 7
- etc.

## How the App Works

### Course Loading Flow
1. **Get Course**: `SELECT * FROM courses WHERE id = ?`
2. **Get Modules**: `SELECT * FROM course_modules WHERE course_id = ? AND is_published = true`
3. **Get Lessons**: `SELECT * FROM course_lessons WHERE module_id IN (...) AND is_published = true`
4. **Get Progress**: `SELECT * FROM user_lesson_progress WHERE user_id = ? AND lesson_id IN (...)`

### Requirements for Display
- Course must exist in `courses` table
- At least one module with `is_published = true`
- At least one lesson per module with `is_published = true`
- Correct foreign key relationships

## Quick Fixes

### Fix 1: Publish All Content
```sql
UPDATE course_modules SET is_published = true;
UPDATE course_lessons SET is_published = true;
UPDATE study_guides SET is_published = true;
```

### Fix 2: Check Course ID
```sql
-- Find your course
SELECT id, title FROM courses WHERE title LIKE '%Your Course Name%';

-- Check if it has modules
SELECT COUNT(*) FROM course_modules WHERE course_id = 'your-course-id';

-- Check if modules have lessons
SELECT cm.title, COUNT(cl.id) as lesson_count
FROM course_modules cm
LEFT JOIN course_lessons cl ON cl.module_id = cm.id
WHERE cm.course_id = 'your-course-id'
GROUP BY cm.id, cm.title;
```

### Fix 3: Create Minimal Test Content
```sql
-- Insert a test course
INSERT INTO courses (id, title, description, subject, level, points)
VALUES ('test-course', 'Test Course', 'A test course', 'Test', 'gymnasie', 100)
ON CONFLICT (id) DO NOTHING;

-- Insert a test module
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES ('test-module-1', 'test-course', 'Test Module', 'A test module', 0, 10, true)
ON CONFLICT (id) DO NOTHING;

-- Insert a test lesson
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, is_published)
VALUES ('test-lesson-1', 'test-module-1', 'test-course', 'Test Lesson', 'A test lesson', 'This is test content', 'theory', 0, 30, 'easy', true)
ON CONFLICT (id) DO NOTHING;
```

## Common Issues

### Issue: "No modules found"
**Cause**: No modules exist or all modules have `is_published = false`
**Fix**: Run diagnostic SQL to check, then either create modules or set `is_published = true`

### Issue: Hero shows but no modules
**Cause**: Course exists but no modules created yet
**Fix**: Create modules using the SQL template

### Issue: Modules show but no lessons
**Cause**: Lessons don't exist or `is_published = false`
**Fix**: Create lessons for each module

### Issue: Wrong course ID
**Cause**: Using course code instead of course ID
**Fix**: Check the exact ID in the courses table and use that

## Testing Checklist

After running the fixes:

- [ ] Run `diagnose-course-content.sql` and check output
- [ ] Verify courses table has entries
- [ ] Verify course_modules table has entries with `is_published = true`
- [ ] Verify course_lessons table has entries with `is_published = true`
- [ ] Check that lesson `course_id` matches module's `course_id`
- [ ] Open app and navigate to a course
- [ ] Verify hero card displays
- [ ] Verify modules are listed
- [ ] Verify lessons are listed under modules
- [ ] Try clicking on a lesson

## Next Steps

1. Run the diagnostic SQL
2. Review the output
3. Run the fix SQL
4. Test in the app
5. If still not working, check the console logs in the app for specific errors
6. Create content for additional courses using the template
