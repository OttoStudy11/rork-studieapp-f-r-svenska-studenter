# Course Content System Guide

## Overview

This guide explains how to properly set up course content in the StudieStugan app. The system uses Supabase to store courses, modules, lessons, and study guides.

## IMPORTANT: UUID Requirements

**The database uses UUID format for module, lesson, exercise, and study guide IDs!**

- `courses.id` can be a string (course_code like 'MATMAT01a')
- `course_modules.id` **MUST be a valid UUID**
- `course_lessons.id` **MUST be a valid UUID**
- `course_lessons.module_id` **MUST be a valid UUID**
- `course_exercises.id` **MUST be a valid UUID**
- `study_guides.id` **MUST be a valid UUID**

Example valid UUID: `'a1b2c3d4-1111-4000-8000-000000000001'::uuid`

**WRONG (will cause error):** `'MATMAT01a-M01'` (invalid UUID syntax)
**CORRECT:** `'a1b2c3d4-1111-4000-8000-000000000001'::uuid`

## Database Schema

### Tables Structure

```
courses
├── id (PRIMARY KEY - STRING, use course_code like 'MATMAT01a')
├── course_code
├── title
├── description
├── subject
├── level
├── points
├── resources (JSONB array)
├── tips (JSONB array)
└── related_courses (JSONB array)

course_modules
├── id (PRIMARY KEY - UUID!)
├── course_id (FK → courses.id - string)
├── title
├── description
├── order_index
├── estimated_hours
└── is_published

course_lessons
├── id (PRIMARY KEY - UUID!)
├── module_id (FK → course_modules.id - UUID!)
├── course_id (FK → courses.id - string)
├── title
├── description
├── content (TEXT - markdown supported)
├── lesson_type ('theory'|'practical'|'exercise'|'quiz'|'video'|'reading')
├── order_index
├── estimated_minutes
├── difficulty_level ('easy'|'medium'|'hard')
├── learning_objectives (TEXT[] array)
└── is_published

study_guides
├── id (PRIMARY KEY - UUID!)
├── course_id (FK → courses.id - string)
├── title
├── description
├── content (TEXT - markdown)
├── guide_type ('summary'|'cheat_sheet'|'formula_sheet'|'vocabulary'|'timeline')
├── difficulty_level
├── estimated_read_time
└── is_published
```

## ID Format Requirements

| Entity | ID Format | Example |
|--------|-----------|---------|
| Course | String (course_code) | `'MATMAT01a'` |
| Module | **UUID** | `'a1b2c3d4-1111-4000-8000-000000000001'::uuid` |
| Lesson | **UUID** | `'b1b2c3d4-1111-4000-8000-000000000101'::uuid` |
| Exercise | **UUID** | `'c1b2c3d4-1111-4000-8000-000000000001'::uuid` |
| Study Guide | **UUID** | `'d1b2c3d4-1111-4000-8000-000000000001'::uuid` |

## How to Add Course Content

### Step 1: Run the SQL Template

Copy the template from `sql-templates/course-content-template.sql` and modify it for your course.

### Step 2: Modify Course Details

```sql
-- Courses can use string IDs (course_code format)
INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'ENGENG05',            -- id (string, course_code format)
  'ENGENG05',            -- course_code
  'Engelska 5',
  'Course description...',
  'Engelska',
  'gymnasie',
  100,
  '["Resource 1", "Resource 2"]'::jsonb,
  '["Tip 1", "Tip 2"]'::jsonb,
  '["ENGENG06"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;
```

### Step 3: Add Modules (MUST USE UUIDs!)

```sql
-- IMPORTANT: Module ID MUST be a valid UUID!
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES (
  'e1234567-0001-4000-8000-000000000001'::uuid,  -- UUID format required!
  'ENGENG05',                                     -- Course ID (string)
  'Module Title',
  'Module description...',
  1,
  8,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  is_published = EXCLUDED.is_published;
```

### Step 4: Add Lessons (MUST USE UUIDs!)

```sql
-- IMPORTANT: Lesson ID and module_id MUST be valid UUIDs!
INSERT INTO course_lessons (
  id, module_id, course_id, title, description, content,
  lesson_type, order_index, estimated_minutes, difficulty_level,
  learning_objectives, is_published
)
VALUES (
  'f1234567-0001-4000-8000-000000000101'::uuid,  -- UUID format required!
  'e1234567-0001-4000-8000-000000000001'::uuid,  -- Must match module UUID!
  'ENGENG05',
  'Lesson Title',
  'Short description',
  '## Lesson Content
  
  Your markdown content here...',
  'theory',
  1,
  30,
  'easy',
  ARRAY['Objective 1', 'Objective 2'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;
```

### UUID Generation Tips

For creating consistent UUIDs, use this pattern:
- Base: `'{prefix}-{course}-4000-8000-{suffix}'`
- Example for ENGENG05 Module 1: `'e1234567-e505-4000-8000-000000000001'`
- Example for ENGENG05 Lesson 1.1: `'f1234567-e505-4000-8000-000000000101'`

Or use `gen_random_uuid()` in PostgreSQL to auto-generate UUIDs:
```sql
INSERT INTO course_modules (id, course_id, title, ...)
VALUES (gen_random_uuid(), 'ENGENG05', 'Module Title', ...);
```

## Available Courses (Ready for Content)

These courses exist in the database and are ready for content:

### Mathematics
- `MATMAT01a` - Matematik 1a (100p)
- `MATMAT01b` - Matematik 1b (100p)
- `MATMAT02b` - Matematik 2b (100p)
- `MATMAT03b` - Matematik 3b (100p)
- `MATMAT03c` - Matematik 3c (100p)
- `MATMAT04` - Matematik 4 (100p)
- `MATMAT05` - Matematik 5 (100p)

### Swedish
- `SVESVE01` - Svenska 1 (100p)
- `SVESVE02` - Svenska 2 (100p)
- `SVESVE03` - Svenska 3 (100p)

### English
- `ENGENG05` - Engelska 5 (100p)
- `ENGENG06` - Engelska 6 (100p)

### Sciences
- `BIOBIO01` - Biologi 1 (100p)
- `BIOBIO02` - Biologi 2 (100p)
- `FYSFYS01a` - Fysik 1a (150p)
- `FYSFYS02` - Fysik 2 (100p)
- `KEMKEM01` - Kemi 1 (100p)
- `KEMKEM02` - Kemi 2 (100p)
- `NAKNAK01a1` - Naturkunskap 1a1 (50p)

### Social Sciences
- `HISHIS01b` - Historia 1b (100p)
- `HISHIS02a` - Historia 2a (100p)
- `SAMSAM01b` - Samhällskunskap 1b (100p)
- `SAMSAM02` - Samhällskunskap 2 (100p)
- `RELREL01` - Religionskunskap 1 (50p)

### Other Subjects
- `FILFIL01` - Filosofi 1 (50p)
- `PSKPSY01` - Psykologi 1 (50p)
- `FÖRFÖR01` - Företagsekonomi 1 (100p)
- `JURJUR01` - Juridik 1 (100p)

## Verification

After inserting content, verify with:

```sql
-- Check course
SELECT id, title, subject, points FROM courses WHERE id = 'YOUR_COURSE_ID';

-- Check modules
SELECT id, title, order_index, is_published 
FROM course_modules 
WHERE course_id = 'YOUR_COURSE_ID' 
ORDER BY order_index;

-- Check lessons with module info
SELECT m.title as module, l.title as lesson, l.order_index, l.estimated_minutes
FROM course_lessons l
JOIN course_modules m ON l.module_id = m.id
WHERE l.course_id = 'YOUR_COURSE_ID'
ORDER BY m.order_index, l.order_index;

-- Count all content
SELECT 
  (SELECT COUNT(*) FROM course_modules WHERE course_id = 'YOUR_COURSE_ID') as modules,
  (SELECT COUNT(*) FROM course_lessons WHERE course_id = 'YOUR_COURSE_ID') as lessons,
  (SELECT COUNT(*) FROM study_guides WHERE course_id = 'YOUR_COURSE_ID') as guides;
```

## App Behavior

### With Content
When a course has modules and lessons:
- Hero section shows module/lesson counts
- "Kursinnehåll" section displays modules with expandable lessons
- Progress tracking works for lesson completion
- Users can navigate to individual lessons

### Without Content
When a course has no modules/lessons:
- Hero section shows 0 modules, 0h time
- Info card explains content is coming
- Flashcards and study planning still work
- Refresh button allows checking for new content

## Common Errors

### "invalid input syntax for type uuid"
**Cause:** You used a string like `'MATMAT01a-M01'` instead of a UUID.
**Solution:** Use proper UUID format: `'a1b2c3d4-1111-4000-8000-000000000001'::uuid`

### Foreign key constraint violation
**Cause:** The `module_id` in lessons doesn't match any existing module UUID.
**Solution:** Make sure the module exists first and use the exact same UUID.

## Tips

1. **Always use valid UUIDs** for modules, lessons, exercises, and study guides
2. **Always use `is_published = true`** for content to appear in the app
3. **Use `ON CONFLICT` clauses** to make scripts idempotent (runnable multiple times)
4. **Order matters** - set `order_index` correctly for proper sequencing
5. **Test incrementally** - add one module, verify, then add more
6. **Use markdown** in `content` field for rich formatting
