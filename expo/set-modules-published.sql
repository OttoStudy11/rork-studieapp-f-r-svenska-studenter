-- Set all modules and lessons to published
-- This makes them visible in the app

UPDATE public.course_modules 
SET is_published = true 
WHERE is_published = false;

UPDATE public.course_lessons 
SET is_published = true 
WHERE is_published = false;

UPDATE public.study_guides 
SET is_published = true 
WHERE is_published = false;

-- Verify the changes
SELECT 
    'course_modules' as table_name,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_published THEN 1 ELSE 0 END) as published_count
FROM public.course_modules
UNION ALL
SELECT 
    'course_lessons' as table_name,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_published THEN 1 ELSE 0 END) as published_count
FROM public.course_lessons
UNION ALL
SELECT 
    'study_guides' as table_name,
    COUNT(*) as total_count,
    SUM(CASE WHEN is_published THEN 1 ELSE 0 END) as published_count
FROM public.study_guides;
