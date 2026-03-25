-- Verify Course Data Structure
-- This SQL verifies that course content is properly structured and published

-- ===========================================
-- 1. CHECK COURSES
-- ===========================================
SELECT 
    '📚 COURSES' as section,
    COUNT(*) as count,
    json_agg(json_build_object(
        'id', id,
        'title', title,
        'subject', subject
    )) as data
FROM public.courses
WHERE title LIKE '%Matematik 1%';

-- ===========================================
-- 2. CHECK MODULES FOR MATEMATIK 1B
-- ===========================================
SELECT 
    '📖 MODULES' as section,
    COUNT(*) as count,
    json_agg(json_build_object(
        'id', id,
        'title', title,
        'is_published', is_published,
        'order_index', order_index
    ) ORDER BY order_index) as data
FROM public.course_modules
WHERE course_id = (
    SELECT id FROM public.courses WHERE title = 'Matematik 1b' LIMIT 1
);

-- ===========================================
-- 3. CHECK LESSONS FOR EACH MODULE
-- ===========================================
SELECT 
    cm.title as module_title,
    '📝 LESSONS' as section,
    COUNT(cl.id) as lesson_count,
    json_agg(json_build_object(
        'id', cl.id,
        'title', cl.title,
        'is_published', cl.is_published,
        'order_index', cl.order_index
    ) ORDER BY cl.order_index) as lessons
FROM public.course_modules cm
LEFT JOIN public.course_lessons cl ON cl.module_id = cm.id
WHERE cm.course_id = (
    SELECT id FROM public.courses WHERE title = 'Matematik 1b' LIMIT 1
)
GROUP BY cm.id, cm.title, cm.order_index
ORDER BY cm.order_index;

-- ===========================================
-- 4. CHECK STUDY GUIDES
-- ===========================================
SELECT 
    '📋 STUDY GUIDES' as section,
    COUNT(*) as count,
    json_agg(json_build_object(
        'id', id,
        'title', title,
        'is_published', is_published
    )) as data
FROM public.study_guides
WHERE course_id = (
    SELECT id FROM public.courses WHERE title = 'Matematik 1b' LIMIT 1
);

-- ===========================================
-- 5. ENSURE EVERYTHING IS PUBLISHED
-- ===========================================
UPDATE public.course_modules 
SET is_published = true 
WHERE course_id = (
    SELECT id FROM public.courses WHERE title = 'Matematik 1b' LIMIT 1
)
AND is_published = false;

UPDATE public.course_lessons 
SET is_published = true 
WHERE course_id = (
    SELECT id FROM public.courses WHERE title = 'Matematik 1b' LIMIT 1
)
AND is_published = false;

UPDATE public.study_guides 
SET is_published = true 
WHERE course_id = (
    SELECT id FROM public.courses WHERE title = 'Matematik 1b' LIMIT 1
)
AND is_published = false;

-- ===========================================
-- 6. FINAL VERIFICATION QUERY
-- ===========================================
SELECT 
    'FINAL CHECK' as section,
    json_build_object(
        'course', (
            SELECT json_build_object(
                'id', id,
                'title', title
            )
            FROM public.courses 
            WHERE title = 'Matematik 1b' 
            LIMIT 1
        ),
        'modules_count', (
            SELECT COUNT(*) 
            FROM public.course_modules 
            WHERE course_id = (SELECT id FROM public.courses WHERE title = 'Matematik 1b' LIMIT 1)
            AND is_published = true
        ),
        'lessons_count', (
            SELECT COUNT(*) 
            FROM public.course_lessons 
            WHERE course_id = (SELECT id FROM public.courses WHERE title = 'Matematik 1b' LIMIT 1)
            AND is_published = true
        ),
        'study_guides_count', (
            SELECT COUNT(*) 
            FROM public.study_guides 
            WHERE course_id = (SELECT id FROM public.courses WHERE title = 'Matematik 1b' LIMIT 1)
            AND is_published = true
        )
    ) as summary;

-- ===========================================
-- 7. TEST QUERY (SAME AS IN APP)
-- ===========================================
-- This is the exact query the app uses
SELECT 
    cm.id,
    cm.course_id,
    cm.title,
    cm.description,
    cm.order_index,
    cm.estimated_hours,
    cm.is_published,
    json_agg(
        json_build_object(
            'id', cl.id,
            'title', cl.title,
            'description', cl.description,
            'lesson_type', cl.lesson_type,
            'order_index', cl.order_index,
            'estimated_minutes', cl.estimated_minutes,
            'difficulty_level', cl.difficulty_level,
            'is_published', cl.is_published
        ) ORDER BY cl.order_index
    ) as course_lessons
FROM public.course_modules cm
LEFT JOIN public.course_lessons cl ON cl.module_id = cm.id AND cl.is_published = true
WHERE cm.course_id = (SELECT id FROM public.courses WHERE title = 'Matematik 1b' LIMIT 1)
AND cm.is_published = true
GROUP BY cm.id
ORDER BY cm.order_index;
