# Course Content System Guide

## Overview

This guide explains how to properly set up course content in the StudieStugan app. The system uses Supabase to store courses, modules, lessons, and study guides.

## Database Schema

### Tables Structure

```
courses
├── id (PRIMARY KEY - use course_code like 'MATMAT01a')
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
├── id (PRIMARY KEY - use format 'COURSEID-M01')
├── course_id (FK → courses.id)
├── title
├── description
├── order_index
├── estimated_hours
└── is_published

course_lessons
├── id (PRIMARY KEY - use format 'COURSEID-M01-L01')
├── module_id (FK → course_modules.id)
├── course_id (FK → courses.id)
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
├── id (PRIMARY KEY - use format 'COURSEID-SG01')
├── course_id (FK → courses.id)
├── title
├── description
├── content (TEXT - markdown)
├── guide_type ('summary'|'cheat_sheet'|'formula_sheet'|'vocabulary'|'timeline')
├── difficulty_level
├── estimated_read_time
└── is_published
```

## ID Naming Convention

Use consistent IDs for easy reference:

| Entity | Format | Example |
|--------|--------|---------|
| Course | `{COURSE_CODE}` | `MATMAT01a` |
| Module | `{COURSE_ID}-M{##}` | `MATMAT01a-M01` |
| Lesson | `{MODULE_ID}-L{##}` | `MATMAT01a-M01-L01` |
| Exercise | `{LESSON_ID}-E{##}` | `MATMAT01a-M01-L01-E01` |
| Study Guide | `{COURSE_ID}-SG{##}` | `MATMAT01a-SG01` |

## How to Add Course Content

### Step 1: Run the SQL Template

Copy the template from `sql-templates/course-content-template.sql` and modify it for your course.

### Step 2: Modify Course Details

```sql
INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'YOUR_COURSE_CODE',    -- e.g., 'ENGENG05'
  'YOUR_COURSE_CODE',
  'Course Title',        -- e.g., 'Engelska 5'
  'Course description...',
  'Subject',             -- e.g., 'Engelska'
  'gymnasie',
  100,                   -- points
  '["Resource 1", "Resource 2"]'::jsonb,
  '["Tip 1", "Tip 2"]'::jsonb,
  '["RELATED1", "RELATED2"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;
```

### Step 3: Add Modules

```sql
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES (
  'ENGENG05-M01',        -- Module ID
  'ENGENG05',            -- Course ID
  'Module Title',
  'Module description...',
  1,                     -- Order (1, 2, 3...)
  8,                     -- Estimated hours
  true                   -- Published
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  is_published = EXCLUDED.is_published;
```

### Step 4: Add Lessons

```sql
INSERT INTO course_lessons (
  id, module_id, course_id, title, description, content,
  lesson_type, order_index, estimated_minutes, difficulty_level,
  learning_objectives, is_published
)
VALUES (
  'ENGENG05-M01-L01',
  'ENGENG05-M01',
  'ENGENG05',
  'Lesson Title',
  'Short description',
  '## Lesson Content
  
  Your markdown content here...',
  'theory',              -- theory, practical, exercise, quiz, video, reading
  1,
  30,
  'easy',                -- easy, medium, hard
  ARRAY['Objective 1', 'Objective 2'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;
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

## Tips

1. **Always use `is_published = true`** for content to appear in the app
2. **Use `ON CONFLICT` clauses** to make scripts idempotent (runnable multiple times)
3. **Order matters** - set `order_index` correctly for proper sequencing
4. **Test incrementally** - add one module, verify, then add more
5. **Use markdown** in `content` field for rich formatting
