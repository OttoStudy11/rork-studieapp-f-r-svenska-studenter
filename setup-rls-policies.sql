-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Secure access to all tables with per-user policies
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_timer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Enable RLS on flashcard tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flashcards') THEN
        ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_flashcard_progress') THEN
        ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =====================================================
-- DROP EXISTING POLICIES (for clean setup)
-- =====================================================

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- User Settings
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;

-- Active Timer Sessions
DROP POLICY IF EXISTS "Users can view their own timer sessions" ON public.active_timer_sessions;
DROP POLICY IF EXISTS "Users can manage their own timer sessions" ON public.active_timer_sessions;
DROP POLICY IF EXISTS "Users can delete their own timer sessions" ON public.active_timer_sessions;

-- User Onboarding
DROP POLICY IF EXISTS "Users can view their own onboarding" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can manage their own onboarding" ON public.user_onboarding;

-- User Courses
DROP POLICY IF EXISTS "Users can view their own courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can manage their own courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can delete their own courses" ON public.user_courses;

-- User Progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;

-- Study Sessions
DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can manage their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can delete their own study sessions" ON public.study_sessions;

-- Pomodoro Sessions
DROP POLICY IF EXISTS "Users can view their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can insert their own pomodoro sessions" ON public.pomodoro_sessions;

-- Notes
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

-- Achievements
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can update their own achievements" ON public.user_achievements;

-- =====================================================
-- CREATE NEW RLS POLICIES
-- =====================================================

-- ============= PROFILES =============

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============= USER SETTINGS =============

CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============= ACTIVE TIMER SESSIONS =============

CREATE POLICY "Users can view their own timer sessions"
ON public.active_timer_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own timer sessions"
ON public.active_timer_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============= USER ONBOARDING =============

CREATE POLICY "Users can view their own onboarding"
ON public.user_onboarding FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own onboarding"
ON public.user_onboarding FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============= USER COURSES =============

CREATE POLICY "Users can view their own courses"
ON public.user_courses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own courses"
ON public.user_courses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
ON public.user_courses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses"
ON public.user_courses FOR DELETE
USING (auth.uid() = user_id);

-- ============= USER PROGRESS =============

CREATE POLICY "Users can view their own progress"
ON public.user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_progress FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============= STUDY SESSIONS =============

CREATE POLICY "Users can view their own study sessions"
ON public.study_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own study sessions"
ON public.study_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
ON public.study_sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions"
ON public.study_sessions FOR DELETE
USING (auth.uid() = user_id);

-- ============= POMODORO SESSIONS =============

CREATE POLICY "Users can view their own pomodoro sessions"
ON public.pomodoro_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro sessions"
ON public.pomodoro_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own pomodoro sessions (for corrections)
CREATE POLICY "Users can update their own pomodoro sessions"
ON public.pomodoro_sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============= NOTES =============

CREATE POLICY "Users can view their own notes"
ON public.notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notes"
ON public.notes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============= ACHIEVEMENTS =============

CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
ON public.user_achievements FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============= FLASHCARDS (if exists) =============

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flashcards') THEN
        -- Flashcards are viewable by all users
        EXECUTE 'CREATE POLICY "All users can view flashcards" ON public.flashcards FOR SELECT USING (true)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_flashcard_progress') THEN
        -- Users can only access their own flashcard progress
        EXECUTE 'CREATE POLICY "Users can view their own flashcard progress" ON public.user_flashcard_progress FOR SELECT USING (auth.uid() = user_id)';
        EXECUTE 'CREATE POLICY "Users can manage their own flashcard progress" ON public.user_flashcard_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Some flashcard policies already exist, skipping';
END $$;

-- ============= COURSES (Public Read) =============

-- Courses should be readable by all authenticated users
DROP POLICY IF EXISTS "All users can view courses" ON public.courses;
CREATE POLICY "All users can view courses"
ON public.courses FOR SELECT
USING (auth.role() = 'authenticated');

-- Only service role can create/update courses
-- This is handled by Supabase dashboard or service_role key

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify RLS is enabled
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
        'profiles', 'user_settings', 'active_timer_sessions',
        'user_onboarding', 'user_courses', 'user_progress',
        'study_sessions', 'pomodoro_sessions', 'notes', 'user_achievements'
    )
    AND rowsecurity = true;
    
    RAISE NOTICE '✅ RLS enabled on % critical tables', table_count;
END $$;

-- Verify policies exist
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN (
        'profiles', 'user_settings', 'active_timer_sessions',
        'user_onboarding', 'user_courses', 'user_progress',
        'study_sessions', 'pomodoro_sessions', 'notes', 'user_achievements'
    );
    
    RAISE NOTICE '✅ Created % RLS policies', policy_count;
END $$;

-- =====================================================
-- SECURITY BEST PRACTICES APPLIED
-- =====================================================
-- 1. ✅ All user data tables have RLS enabled
-- 2. ✅ Users can only access their own data (auth.uid() = user_id)
-- 3. ✅ Courses are read-only for all authenticated users
-- 4. ✅ No data leakage between users possible
-- 5. ✅ INSERT, UPDATE, DELETE all check user_id
-- 6. ✅ Service role can bypass RLS for admin operations

RAISE NOTICE '🔒 RLS setup complete - All user data is now secure!';
