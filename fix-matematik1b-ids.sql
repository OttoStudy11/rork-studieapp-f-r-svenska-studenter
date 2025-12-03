-- ============================================
-- FIX MATEMATIK 1B ID MISMATCHES
-- This script fixes the ID mismatches for Matematik 1b
-- ============================================

-- ===========================================
-- STEP 1: IDENTIFY THE ACTUAL COURSE ID
-- ===========================================
DO $$
DECLARE
    actual_course_id TEXT;
    mat_course RECORD;
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'STEP 1: Finding Matematik 1b course ID';
    RAISE NOTICE '===========================================';
    
    -- Find Matematik 1b
    SELECT id, title, course_code INTO mat_course
    FROM courses
    WHERE LOWER(title) LIKE '%matematik%1%b%' OR course_code = 'MATMAT01b'
    LIMIT 1;
    
    IF mat_course.id IS NOT NULL THEN
        RAISE NOTICE '✅ Found Matematik 1b:';
        RAISE NOTICE '   ID: %', mat_course.id;
        RAISE NOTICE '   Title: %', mat_course.title;
        RAISE NOTICE '   Course Code: %', mat_course.course_code;
    ELSE
        RAISE WARNING '⚠️  Matematik 1b not found! Check course table.';
    END IF;
END $$;

-- ===========================================
-- STEP 2: CHECK CURRENT MODULE/LESSON STATE
-- ===========================================
DO $$
DECLARE
    mat_course_id TEXT;
    module_count INT;
    lesson_count INT;
BEGIN
    -- Get Matematik 1b ID
    SELECT id INTO mat_course_id
    FROM courses
    WHERE LOWER(title) LIKE '%matematik%1%b%' OR course_code = 'MATMAT01b'
    LIMIT 1;
    
    IF mat_course_id IS NULL THEN
        RAISE WARNING 'Cannot continue - Matematik 1b not found';
        RETURN;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'STEP 2: Current state for course ID: %', mat_course_id;
    RAISE NOTICE '===========================================';
    
    -- Count modules
    SELECT COUNT(*) INTO module_count
    FROM course_modules
    WHERE course_id = mat_course_id;
    
    RAISE NOTICE 'Modules with correct course_id: %', module_count;
    
    -- Count lessons through modules
    SELECT COUNT(*) INTO lesson_count
    FROM course_lessons cl
    JOIN course_modules cm ON cl.module_id = cm.id
    WHERE cm.course_id = mat_course_id;
    
    RAISE NOTICE 'Lessons linked through modules: %', lesson_count;
    
    -- Check for mismatched lesson course_ids
    SELECT COUNT(*) INTO lesson_count
    FROM course_lessons cl
    JOIN course_modules cm ON cl.module_id = cm.id
    WHERE cm.course_id = mat_course_id AND cl.course_id != mat_course_id;
    
    IF lesson_count > 0 THEN
        RAISE WARNING 'Found % lessons with mismatched course_id!', lesson_count;
    END IF;
END $$;

-- ===========================================
-- STEP 3: FIX LESSON COURSE_ID MISMATCHES
-- ===========================================
-- Update lessons to have correct course_id matching their module's course
DO $$
DECLARE
    mat_course_id TEXT;
    updated_count INT;
BEGIN
    -- Get Matematik 1b ID
    SELECT id INTO mat_course_id
    FROM courses
    WHERE LOWER(title) LIKE '%matematik%1%b%' OR course_code = 'MATMAT01b'
    LIMIT 1;
    
    IF mat_course_id IS NULL THEN
        RETURN;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'STEP 3: Fixing lesson course_id mismatches';
    RAISE NOTICE '===========================================';
    
    -- Update lessons to match their module's course_id
    UPDATE course_lessons cl
    SET course_id = cm.course_id
    FROM course_modules cm
    WHERE cl.module_id = cm.id
    AND cm.course_id = mat_course_id
    AND cl.course_id != cm.course_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    IF updated_count > 0 THEN
        RAISE NOTICE '✅ Fixed % lesson(s) course_id', updated_count;
    ELSE
        RAISE NOTICE '✅ All lessons already have correct course_id';
    END IF;
END $$;

-- ===========================================
-- STEP 4: ENSURE ALL CONTENT IS PUBLISHED
-- ===========================================
DO $$
DECLARE
    mat_course_id TEXT;
    updated_modules INT;
    updated_lessons INT;
BEGIN
    SELECT id INTO mat_course_id
    FROM courses
    WHERE LOWER(title) LIKE '%matematik%1%b%' OR course_code = 'MATMAT01b'
    LIMIT 1;
    
    IF mat_course_id IS NULL THEN
        RETURN;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'STEP 4: Publishing all content';
    RAISE NOTICE '===========================================';
    
    -- Publish all modules
    UPDATE course_modules
    SET is_published = true
    WHERE course_id = mat_course_id AND is_published = false;
    
    GET DIAGNOSTICS updated_modules = ROW_COUNT;
    
    -- Publish all lessons
    UPDATE course_lessons cl
    SET is_published = true
    FROM course_modules cm
    WHERE cl.module_id = cm.id
    AND cm.course_id = mat_course_id
    AND cl.is_published = false;
    
    GET DIAGNOSTICS updated_lessons = ROW_COUNT;
    
    RAISE NOTICE '✅ Published % module(s)', updated_modules;
    RAISE NOTICE '✅ Published % lesson(s)', updated_lessons;
END $$;

-- ===========================================
-- STEP 5: VERIFY THE FIX
-- ===========================================
DO $$
DECLARE
    mat_course_id TEXT;
    mat_title TEXT;
    module_count INT;
    published_module_count INT;
    lesson_count INT;
    published_lesson_count INT;
    mismatch_count INT;
BEGIN
    SELECT id, title INTO mat_course_id, mat_title
    FROM courses
    WHERE LOWER(title) LIKE '%matematik%1%b%' OR course_code = 'MATMAT01b'
    LIMIT 1;
    
    IF mat_course_id IS NULL THEN
        RETURN;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'STEP 5: VERIFICATION FOR %', mat_title;
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Course ID: %', mat_course_id;
    RAISE NOTICE '';
    
    -- Count modules
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN is_published THEN 1 END)
    INTO module_count, published_module_count
    FROM course_modules
    WHERE course_id = mat_course_id;
    
    RAISE NOTICE '📦 Modules: % total, % published', module_count, published_module_count;
    
    -- Count lessons
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN cl.is_published THEN 1 END)
    INTO lesson_count, published_lesson_count
    FROM course_lessons cl
    JOIN course_modules cm ON cl.module_id = cm.id
    WHERE cm.course_id = mat_course_id;
    
    RAISE NOTICE '📝 Lessons: % total, % published', lesson_count, published_lesson_count;
    
    -- Check for any remaining mismatches
    SELECT COUNT(*) INTO mismatch_count
    FROM course_lessons cl
    JOIN course_modules cm ON cl.module_id = cm.id
    WHERE cm.course_id = mat_course_id AND cl.course_id != cm.course_id;
    
    IF mismatch_count > 0 THEN
        RAISE WARNING '⚠️  Still have % lesson(s) with wrong course_id!', mismatch_count;
    ELSE
        RAISE NOTICE '✅ All lessons have correct course_id';
    END IF;
    
    RAISE NOTICE '';
    IF module_count > 0 AND lesson_count > 0 AND published_module_count = module_count AND published_lesson_count = lesson_count AND mismatch_count = 0 THEN
        RAISE NOTICE '🎉 SUCCESS! Matematik 1b is fully fixed and ready!';
    ELSE
        RAISE WARNING '⚠️  Some issues remain. Please check the output above.';
    END IF;
END $$;

-- ===========================================
-- STEP 6: DISPLAY MODULE & LESSON STRUCTURE
-- ===========================================
DO $$
DECLARE
    mat_course_id TEXT;
    module_rec RECORD;
    lesson_count INT;
BEGIN
    SELECT id INTO mat_course_id
    FROM courses
    WHERE LOWER(title) LIKE '%matematik%1%b%' OR course_code = 'MATMAT01b'
    LIMIT 1;
    
    IF mat_course_id IS NULL THEN
        RETURN;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'COMPLETE STRUCTURE';
    RAISE NOTICE '===========================================';
    
    FOR module_rec IN
        SELECT id, title, order_index, is_published
        FROM course_modules
        WHERE course_id = mat_course_id
        ORDER BY order_index
    LOOP
        SELECT COUNT(*) INTO lesson_count
        FROM course_lessons
        WHERE module_id = module_rec.id AND is_published = true;
        
        RAISE NOTICE 'Module %: % (% lessons)', 
            module_rec.order_index + 1,
            module_rec.title,
            lesson_count;
    END LOOP;
END $$;

-- ===========================================
-- STEP 7: TEST QUERY (like the app does)
-- ===========================================
-- This query should return data if everything works
SELECT 
    'TEST QUERY RESULT' as test,
    c.id as course_id,
    c.title as course_title,
    json_agg(
        json_build_object(
            'id', cm.id,
            'title', cm.title,
            'order_index', cm.order_index,
            'lesson_count', (
                SELECT COUNT(*) 
                FROM course_lessons cl 
                WHERE cl.module_id = cm.id AND cl.is_published = true
            )
        ) ORDER BY cm.order_index
    ) as modules
FROM courses c
JOIN course_modules cm ON cm.course_id = c.id
WHERE (LOWER(c.title) LIKE '%matematik%1%b%' OR c.course_code = 'MATMAT01b')
AND cm.is_published = true
GROUP BY c.id, c.title;
