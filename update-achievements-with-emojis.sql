-- ============================================
-- UPDATE ACHIEVEMENTS WITH PROPER EMOJIS
-- ============================================
-- This migration updates all achievements to use proper emojis instead of icon names

-- Update existing achievements with proper emojis
UPDATE public.achievements 
SET icon = '▶️'
WHERE achievement_key = 'first_session';

UPDATE public.achievements 
SET icon = '🌅'
WHERE achievement_key = 'early_bird';

UPDATE public.achievements 
SET icon = '🌙'
WHERE achievement_key = 'night_owl';

UPDATE public.achievements 
SET icon = '⏱️'
WHERE achievement_key = 'pomodoro_master';

UPDATE public.achievements 
SET icon = '⚡'
WHERE achievement_key = 'marathon_runner';

UPDATE public.achievements 
SET icon = '📅'
WHERE achievement_key = 'week_warrior';

UPDATE public.achievements 
SET icon = '🏅'
WHERE achievement_key = 'dedication';

UPDATE public.achievements 
SET icon = '📖'
WHERE achievement_key = 'course_master';

UPDATE public.achievements 
SET icon = '🎓'
WHERE achievement_key = 'scholar';

UPDATE public.achievements 
SET icon = '⭐'
WHERE achievement_key = 'perfectionist';

UPDATE public.achievements 
SET icon = '👥'
WHERE achievement_key = 'social_butterfly';

UPDATE public.achievements 
SET icon = '👋'
WHERE achievement_key = 'study_buddy';

UPDATE public.achievements 
SET icon = '🚀'
WHERE achievement_key = 'speed_learner';

UPDATE public.achievements 
SET icon = '🎯'
WHERE achievement_key = 'consistent_student';

-- Verify the update
SELECT achievement_key, title, icon, category 
FROM public.achievements 
ORDER BY category, achievement_key;
