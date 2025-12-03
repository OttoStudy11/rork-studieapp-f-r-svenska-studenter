-- ============================================
-- DIAGNOSE COURSE CONTENT ISSUES
-- Run this to understand what's in the database
-- ============================================

-- ===========================================
-- 1. LIST ALL COURSES
-- ===========================================
SELECT 
    '📚 ALL COURSES' as info,
    id,
    course_code,
    title,
    subject,
    level,
    points
FROM courses
ORDER BY title
LIMIT 20;

-- ===========================================
-- 2. FIND COURSES WITH MODULES
-- ===========================================
SELECT 
    '📖 COURSES WITH MODULES' as info,
    c.id,
    c.title,
    COUNT(cm.id) as module_count,
    COUNT(CASE WHEN cm.is_published = true THEN 1 END) as published_modules
FROM courses c
LEFT JOIN course_modules cm ON cm.course_id = c.id
GROUP BY c.id, c.title
HAVING COUNT(cm.id) > 0
ORDER BY c.title;

-- ===========================================
-- 3. FIND COURSES WITH LESSONS
-- ===========================================
SELECT 
    '📝 COURSES WITH LESSONS' as info,
    c.id,
    c.title,
    COUNT(DISTINCT cm.id) as module_count,
    COUNT(cl.id) as lesson_count,
    COUNT(CASE WHEN cl.is_published = true THEN 1 END) as published_lessons
FROM courses c
LEFT JOIN course_modules cm ON cm.course_id = c.id
LEFT JOIN course_lessons cl ON cl.module_id = cm.id
GROUP BY c.id, c.title
HAVING COUNT(cl.id) > 0
ORDER BY c.title;

-- ===========================================
-- 4. CHECK SPECIFIC COURSE (Example: matematik1b)
-- ===========================================
-- First, find the course ID
DO $$
DECLARE
    course_record RECORD;
    module_record RECORD;
    lesson_count INT;
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'CHECKING MATEMATIK 1B (or similar)';
    RAISE NOTICE '===========================================';
    
    -- Try different variations
    FOR course_record IN 
        SELECT id, title FROM courses 
        WHERE LOWER(title) LIKE '%matematik%1%' 
        LIMIT 5
    LOOP
        RAISE NOTICE '';
        RAISE NOTICE 'Course: % (ID: %)', course_record.title, course_record.id;
        
        -- Count modules
        SELECT COUNT(*) INTO lesson_count
        FROM course_modules
        WHERE course_id = course_record.id;
        
        RAISE NOTICE '  Modules: %', lesson_count;
        
        -- List modules
        FOR module_record IN
            SELECT id, title, is_published, order_index
            FROM course_modules
            WHERE course_id = course_record.id
            ORDER BY order_index
        LOOP
            SELECT COUNT(*) INTO lesson_count
            FROM course_lessons
            WHERE module_id = module_record.id;
            
            RAISE NOTICE '    - % (published: %, lessons: %)', 
                module_record.title, 
                module_record.is_published,
                lesson_count;
        END LOOP;
    END LOOP;
END $$;

-- ===========================================
-- 5. CHECK FOR ORPHANED DATA
-- ===========================================
-- Modules without courses
SELECT 
    '⚠️  ORPHANED MODULES (no parent course)' as warning,
    cm.id,
    cm.title,
    cm.course_id as broken_course_id
FROM course_modules cm
LEFT JOIN courses c ON c.id = cm.course_id
WHERE c.id IS NULL;

-- Lessons without modules
SELECT 
    '⚠️  ORPHANED LESSONS (no parent module)' as warning,
    cl.id,
    cl.title,
    cl.module_id as broken_module_id
FROM course_lessons cl
LEFT JOIN course_modules cm ON cm.id = cl.module_id
WHERE cm.id IS NULL;

-- Lessons with wrong course_id
SELECT 
    '⚠️  LESSONS WITH MISMATCHED COURSE ID' as warning,
    cl.id as lesson_id,
    cl.title as lesson_title,
    cl.course_id as lesson_course_id,
    cm.course_id as module_course_id,
    'Should match!' as note
FROM course_lessons cl
JOIN course_modules cm ON cm.id = cl.module_id
WHERE cl.course_id != cm.course_id;

-- ===========================================
-- 6. TEST THE APP'S QUERY EXACTLY
-- ===========================================
-- This is what the app tries to fetch
-- Replace 'COURSE_ID_HERE' with an actual course ID

-- First, let's get a course ID that should have content
DO $$
DECLARE
    test_course_id TEXT;
BEGIN
    -- Get first course with modules
    SELECT c.id INTO test_course_id
    FROM courses c
    JOIN course_modules cm ON cm.course_id = c.id
    WHERE cm.is_published = true
    LIMIT 1;
    
    IF test_course_id IS NOT NULL THEN
        RAISE NOTICE '';
        RAISE NOTICE '===========================================';
        RAISE NOTICE 'TESTING APP QUERY WITH COURSE: %', test_course_id;
        RAISE NOTICE '===========================================';
        RAISE NOTICE 'Run this query to test:';
        RAISE NOTICE '';
        RAISE NOTICE 'SELECT * FROM courses WHERE id = ''%'';', test_course_id;
        RAISE NOTICE '';
        RAISE NOTICE 'SELECT * FROM course_modules WHERE course_id = ''%'' AND is_published = true ORDER BY order_index;', test_course_id;
        RAISE NOTICE '';
        RAISE NOTICE 'SELECT cl.* FROM course_lessons cl JOIN course_modules cm ON cl.module_id = cm.id WHERE cm.course_id = ''%'' AND cl.is_published = true ORDER BY cl.order_index;', test_course_id;
    ELSE
        RAISE WARNING 'No courses with modules found!';
    END IF;
END $$;

-- ===========================================
-- 7. SUMMARY STATS
-- ===========================================
SELECT 
    '📊 DATABASE SUMMARY' as report,
    (SELECT COUNT(*) FROM courses) as total_courses,
    (SELECT COUNT(*) FROM course_modules) as total_modules,
    (SELECT COUNT(*) FROM course_modules WHERE is_published = true) as published_modules,
    (SELECT COUNT(*) FROM course_lessons) as total_lessons,
    (SELECT COUNT(*) FROM course_lessons WHERE is_published = true) as published_lessons,
    (SELECT COUNT(*) FROM study_guides) as total_guides,
    (SELECT COUNT(*) FROM study_guides WHERE is_published = true) as published_guides;
