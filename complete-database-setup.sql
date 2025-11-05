-- ============================================================================
-- COMPLETE DATABASE SETUP FOR STUDY APP
-- ============================================================================
-- This script creates all tables, indexes, functions, triggers, RLS policies
-- and sample data needed for the study app to work properly.
--
-- Run this script in your Supabase SQL editor to set up everything at once.
-- ============================================================================

-- ============================================================================
-- 1. CLEAN UP - Drop existing objects in reverse dependency order
-- ============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses CASCADE;
DROP TRIGGER IF EXISTS update_user_courses_updated_at ON public.user_courses CASCADE;
DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON public.user_achievements CASCADE;
DROP TRIGGER IF EXISTS update_user_lesson_progress_updated_at ON public.user_lesson_progress CASCADE;
DROP TRIGGER IF EXISTS update_course_lessons_updated_at ON public.course_lessons CASCADE;
DROP TRIGGER IF EXISTS update_course_modules_updated_at ON public.course_modules CASCADE;
DROP TRIGGER IF EXISTS update_course_exercises_updated_at ON public.course_exercises CASCADE;
DROP TRIGGER IF EXISTS update_study_guides_updated_at ON public.study_guides CASCADE;
DROP TRIGGER IF EXISTS update_course_assessments_updated_at ON public.course_assessments CASCADE;
DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes CASCADE;
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.search_users_by_username(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.check_username_available(TEXT) CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.user_assessment_results CASCADE;
DROP TABLE IF EXISTS public.course_assessments CASCADE;
DROP TABLE IF EXISTS public.user_exercise_attempts CASCADE;
DROP TABLE IF EXISTS public.course_exercises CASCADE;
DROP TABLE IF EXISTS public.lesson_tags CASCADE;
DROP TABLE IF EXISTS public.course_content_tags CASCADE;
DROP TABLE IF EXISTS public.lesson_materials CASCADE;
DROP TABLE IF EXISTS public.user_lesson_progress CASCADE;
DROP TABLE IF EXISTS public.course_lessons CASCADE;
DROP TABLE IF EXISTS public.course_modules CASCADE;
DROP TABLE IF EXISTS public.study_guides CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.friendships CASCADE;
DROP TABLE IF EXISTS public.friends CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.study_sessions CASCADE;
DROP TABLE IF EXISTS public.pomodoro_sessions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.study_techniques CASCADE;
DROP TABLE IF EXISTS public.study_tips CASCADE;
DROP TABLE IF EXISTS public.program_courses CASCADE;
DROP TABLE IF EXISTS public.user_courses CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.remember_me_sessions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- 2. CREATE CORE TABLES
-- ============================================================================

-- Profiles table (users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    level TEXT NOT NULL DEFAULT 'gymnasie',
    program TEXT NOT NULL DEFAULT '',
    purpose TEXT NOT NULL DEFAULT '',
    subscription_type TEXT NOT NULL DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium')),
    subscription_expires_at TIMESTAMPTZ,
    program_id UUID,
    gymnasium_id TEXT,
    gymnasium_name TEXT,
    gymnasium_grade TEXT CHECK (gymnasium_grade IN ('1', '2', '3')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Programs table
CREATE TABLE public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    description TEXT,
    gymnasium TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses table
CREATE TABLE public.courses (
    id TEXT PRIMARY KEY,
    course_code TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject TEXT NOT NULL,
    level TEXT NOT NULL,
    points INTEGER,
    resources JSONB DEFAULT '[]'::jsonb,
    tips JSONB DEFAULT '[]'::jsonb,
    progress INTEGER DEFAULT 0,
    related_courses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Program courses mapping
CREATE TABLE public.program_courses (
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (program_id, course_id)
);

-- User courses
CREATE TABLE public.user_courses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    progress INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Course modules
CREATE TABLE public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    estimated_hours INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course lessons
CREATE TABLE public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    lesson_type TEXT DEFAULT 'theory' CHECK (lesson_type IN ('theory', 'practical', 'exercise', 'quiz', 'video', 'reading')),
    order_index INTEGER DEFAULT 0,
    estimated_minutes INTEGER DEFAULT 0,
    difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    prerequisites TEXT[],
    learning_objectives TEXT[],
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lesson materials
CREATE TABLE public.lesson_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    material_type TEXT NOT NULL CHECK (material_type IN ('document', 'video', 'audio', 'link', 'image', 'pdf')),
    url TEXT,
    content TEXT,
    file_size INTEGER,
    duration_minutes INTEGER,
    is_required BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course exercises
CREATE TABLE public.course_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE SET NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'coding', 'math', 'practical')),
    questions JSONB DEFAULT '[]'::jsonb,
    correct_answers JSONB DEFAULT '[]'::jsonb,
    points INTEGER DEFAULT 0,
    time_limit_minutes INTEGER,
    difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    hints TEXT[],
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User lesson progress
CREATE TABLE public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    progress_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- User exercise attempts
CREATE TABLE public.user_exercise_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.course_exercises(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    score INTEGER,
    max_score INTEGER NOT NULL,
    percentage INTEGER,
    time_taken_minutes INTEGER,
    is_completed BOOLEAN DEFAULT false,
    feedback TEXT,
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Study guides
CREATE TABLE public.study_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    guide_type TEXT DEFAULT 'summary' CHECK (guide_type IN ('summary', 'cheat_sheet', 'formula_sheet', 'vocabulary', 'timeline')),
    difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    estimated_read_time INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course assessments
CREATE TABLE public.course_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'test', 'exam', 'project', 'assignment')),
    total_points INTEGER DEFAULT 100,
    passing_score INTEGER DEFAULT 60,
    time_limit_minutes INTEGER,
    attempts_allowed INTEGER DEFAULT 3,
    is_published BOOLEAN DEFAULT true,
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User assessment results
CREATE TABLE public.user_assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    assessment_id UUID REFERENCES public.course_assessments(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage INTEGER NOT NULL,
    passed BOOLEAN,
    time_taken_minutes INTEGER,
    attempt_number INTEGER DEFAULT 1,
    feedback TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course content tags
CREATE TABLE public.course_content_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lesson tags mapping
CREATE TABLE public.lesson_tags (
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.course_content_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (lesson_id, tag_id)
);

-- Notes
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quizzes
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    score INTEGER,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pomodoro sessions
CREATE TABLE public.pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Study sessions
CREATE TABLE public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    technique TEXT DEFAULT 'pomodoro',
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User progress (cached computed values)
CREATE TABLE public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_study_time INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    last_study_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE public.achievements (
    id TEXT PRIMARY KEY,
    achievement_key TEXT,
    title TEXT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    type TEXT NOT NULL,
    requirement INTEGER DEFAULT 1,
    requirement_type TEXT,
    requirement_target INTEGER,
    requirement_timeframe TEXT,
    reward_points INTEGER DEFAULT 0,
    reward_badge TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User achievements
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    progress INTEGER DEFAULT 0,
    unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Friendships
CREATE TABLE public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT no_self_friendship CHECK (user1_id != user2_id)
);

-- Friends (legacy compatibility)
CREATE TABLE public.friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Study tips
CREATE TABLE public.study_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Study techniques
CREATE TABLE public.study_techniques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    difficulty_level TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    notifications_enabled BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'sv',
    timer_focus INTEGER DEFAULT 25,
    timer_break INTEGER DEFAULT 5,
    dark_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Remember me sessions
CREATE TABLE public.remember_me_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    token_hash TEXT NOT NULL,
    device_info JSONB,
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_program_id ON public.profiles(program_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gymnasium_id ON public.profiles(gymnasium_id);

CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON public.courses(subject);

CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON public.user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course_id ON public.user_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_active ON public.user_courses(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_exercises_course_id ON public.course_exercises(course_id);
CREATE INDEX IF NOT EXISTS idx_course_exercises_lesson_id ON public.course_exercises(lesson_id);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_course_id ON public.user_lesson_progress(course_id);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON public.study_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS idx_friendships_user1_id ON public.friendships(user1_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user2_id ON public.friendships(user2_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_course_id ON public.notes(course_id);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);

-- ============================================================================
-- 4. CREATE FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, username, display_name, level, program, purpose)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6)
        ),
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'level', 'gymnasie'),
        COALESCE(NEW.raw_user_meta_data->>'program', ''),
        COALESCE(NEW.raw_user_meta_data->>'purpose', '')
    );
    
    -- Create initial user progress record
    INSERT INTO public.user_progress (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create initial settings
    INSERT INTO public.settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search users by username
CREATE OR REPLACE FUNCTION public.search_users_by_username(search_term TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.username, p.display_name, p.avatar_url
    FROM public.profiles p
    WHERE p.username ILIKE '%' || search_term || '%'
    ORDER BY p.username
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check username availability
CREATE OR REPLACE FUNCTION public.check_username_available(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE username = username_to_check
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. CREATE TRIGGERS
-- ============================================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_courses_updated_at
    BEFORE UPDATE ON public.user_courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at
    BEFORE UPDATE ON public.user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at
    BEFORE UPDATE ON public.user_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
    BEFORE UPDATE ON public.course_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
    BEFORE UPDATE ON public.course_lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_exercises_updated_at
    BEFORE UPDATE ON public.course_exercises
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_guides_updated_at
    BEFORE UPDATE ON public.study_guides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_assessments_updated_at
    BEFORE UPDATE ON public.course_assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remember_me_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. CREATE RLS POLICIES
-- ============================================================================

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Programs policies (read-only for all users)
CREATE POLICY "Anyone can view programs" ON public.programs
    FOR SELECT USING (true);

-- Courses policies (read-only for all users)
CREATE POLICY "Anyone can view courses" ON public.courses
    FOR SELECT USING (true);

-- Program courses policies (read-only for all users)
CREATE POLICY "Anyone can view program courses" ON public.program_courses
    FOR SELECT USING (true);

-- User courses policies
CREATE POLICY "Users can view their own courses" ON public.user_courses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses" ON public.user_courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses" ON public.user_courses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses" ON public.user_courses
    FOR DELETE USING (auth.uid() = user_id);

-- Course content policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view course modules" ON public.course_modules
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view course lessons" ON public.course_lessons
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view lesson materials" ON public.lesson_materials
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view course exercises" ON public.course_exercises
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view study guides" ON public.study_guides
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view course assessments" ON public.course_assessments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view course tags" ON public.course_content_tags
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view lesson tags" ON public.lesson_tags
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- User lesson progress policies
CREATE POLICY "Users can view their own lesson progress" ON public.user_lesson_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress" ON public.user_lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" ON public.user_lesson_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- User exercise attempts policies
CREATE POLICY "Users can view their own exercise attempts" ON public.user_exercise_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise attempts" ON public.user_exercise_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User assessment results policies
CREATE POLICY "Users can view their own assessment results" ON public.user_assessment_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment results" ON public.user_assessment_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view their own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Quizzes policies
CREATE POLICY "Users can view their own quizzes" ON public.quizzes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quizzes" ON public.quizzes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quizzes" ON public.quizzes
    FOR UPDATE USING (auth.uid() = user_id);

-- Pomodoro sessions policies
CREATE POLICY "Users can view their own pomodoro sessions" ON public.pomodoro_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro sessions" ON public.pomodoro_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view their own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view friends' progress" ON public.user_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.friendships
            WHERE status = 'accepted'
            AND ((user1_id = auth.uid() AND user2_id = user_progress.user_id)
                OR (user2_id = auth.uid() AND user1_id = user_progress.user_id))
        )
    );

CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies (read-only for all users)
CREATE POLICY "Anyone can view achievements" ON public.achievements
    FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON public.user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view their own friendships" ON public.friendships
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create friendships" ON public.friendships
    FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their friendships" ON public.friendships
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their friendships" ON public.friendships
    FOR DELETE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Friends policies (legacy)
CREATE POLICY "Users can view their own friends" ON public.friends
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend relationships" ON public.friends
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friend relationships" ON public.friends
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete friend relationships" ON public.friends
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Study tips and techniques policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view study tips" ON public.study_tips
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view study techniques" ON public.study_techniques
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Settings policies
CREATE POLICY "Users can view their own settings" ON public.settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Remember me sessions policies
CREATE POLICY "Users can view their own sessions" ON public.remember_me_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.remember_me_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.remember_me_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.remember_me_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 8. INSERT SAMPLE DATA
-- ============================================================================

-- Add foreign key constraint for profiles after programs table is created
ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_program_id_fkey 
    FOREIGN KEY (program_id) REFERENCES public.programs(id);

-- Insert sample programs
INSERT INTO public.programs (id, name, level, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Naturvetenskapsprogrammet', 'gymnasie', 'Högskoleförberedande program med fokus på naturvetenskap'),
    ('22222222-2222-2222-2222-222222222222', 'Teknikprogrammet', 'gymnasie', 'Högskoleförberedande program med fokus på teknik'),
    ('33333333-3333-3333-3333-333333333333', 'Samhällsvetenskapsprogrammet', 'gymnasie', 'Högskoleförberedande program med fokus på samhällsvetenskap'),
    ('44444444-4444-4444-4444-444444444444', 'Ekonomiprogrammet', 'gymnasie', 'Högskoleförberedande program med fokus på ekonomi'),
    ('55555555-5555-5555-5555-555555555555', 'Estetiska programmet', 'gymnasie', 'Högskoleförberedande program med fokus på estetik')
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO public.courses (id, course_code, title, description, subject, level, points, resources, tips) VALUES
    ('MATMAT01b', 'MATMAT01b', 'Matematik 1b', 'Grundläggande matematikkurs för högskoleförberedande program', 'Matematik', 'gymnasie', 100, 
     '["Kursboken Matematik 1b", "Övningsuppgifter online", "Lärarvägledning"]'::jsonb,
     '["Öva regelbundet", "Gör många exempel", "Fråga när du inte förstår"]'::jsonb),
    ('MATMAT02b', 'MATMAT02b', 'Matematik 2b', 'Fortsättningskurs i matematik', 'Matematik', 'gymnasie', 100,
     '["Kursboken Matematik 2b", "Grafräknare", "Online-resurser"]'::jsonb,
     '["Repetera Matematik 1", "Använd grafräknare effektivt"]'::jsonb),
    ('MATMAT03c', 'MATMAT03c', 'Matematik 3c', 'Avancerad matematik för naturvetenskap och teknik', 'Matematik', 'gymnasie', 100,
     '["Kursboken Matematik 3c", "Formelsamling", "Gamla nationella prov"]'::jsonb,
     '["Fokusera på problemlösning", "Öva på gamla prov"]'::jsonb),
    ('FYSFYS01a', 'FYSFYS01a', 'Fysik 1a', 'Grundläggande fysik', 'Fysik', 'gymnasie', 150,
     '["Lärobok Fysik 1a", "Laborationsmaterial", "Formelblad"]'::jsonb,
     '["Förstå koncepten", "Gör laborationer noggrant"]'::jsonb),
    ('FYSFYS02', 'FYSFYS02', 'Fysik 2', 'Fortsättningskurs i fysik', 'Fysik', 'gymnasie', 100,
     '["Lärobok Fysik 2", "Räkneövningar"]'::jsonb,
     '["Rita diagram", "Förstå samband"]'::jsonb),
    ('KEMKEM01', 'KEMKEM01', 'Kemi 1', 'Grundläggande kemi', 'Kemi', 'gymnasie', 100,
     '["Lärobok Kemi 1", "Periodiska systemet", "Labbutrustning"]'::jsonb,
     '["Lär periodiska systemet", "Säkra laborationer"]'::jsonb),
    ('BIOBIO01', 'BIOBIO01', 'Biologi 1', 'Grundläggande biologi', 'Biologi', 'gymnasie', 100,
     '["Lärobok Biologi 1", "Mikroskop", "Biologiska modeller"]'::jsonb,
     '["Studera evolutionen", "Förstå cellbiologi"]'::jsonb),
    ('ENGENG05', 'ENGENG05', 'Engelska 5', 'Grundläggande engelska', 'Engelska', 'gymnasie', 100,
     '["Lärobok Engelska 5", "Ordlista", "Ljudböcker"]'::jsonb,
     '["Läs engelska böcker", "Titta på engelska filmer"]'::jsonb),
    ('ENGENG06', 'ENGENG06', 'Engelska 6', 'Fortsättning engelska', 'Engelska', 'gymnasie', 100,
     '["Lärobok Engelska 6", "Litteratur", "Grammatikbok"]'::jsonb,
     '["Skriv uppsatser", "Öva muntligt"]'::jsonb),
    ('SVESVE01', 'SVESVE01', 'Svenska 1', 'Grundläggande svenska', 'Svenska', 'gymnasie', 100,
     '["Lärobok Svenska 1", "Grammatikbok", "Skönlitteratur"]'::jsonb,
     '["Läs mycket", "Skriv regelbundet"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Map courses to programs
INSERT INTO public.program_courses (program_id, course_id) VALUES
    -- Naturvetenskapsprogrammet
    ('11111111-1111-1111-1111-111111111111', 'MATMAT01b'),
    ('11111111-1111-1111-1111-111111111111', 'MATMAT02b'),
    ('11111111-1111-1111-1111-111111111111', 'MATMAT03c'),
    ('11111111-1111-1111-1111-111111111111', 'FYSFYS01a'),
    ('11111111-1111-1111-1111-111111111111', 'FYSFYS02'),
    ('11111111-1111-1111-1111-111111111111', 'KEMKEM01'),
    ('11111111-1111-1111-1111-111111111111', 'BIOBIO01'),
    ('11111111-1111-1111-1111-111111111111', 'ENGENG05'),
    ('11111111-1111-1111-1111-111111111111', 'ENGENG06'),
    ('11111111-1111-1111-1111-111111111111', 'SVESVE01'),
    -- Teknikprogrammet
    ('22222222-2222-2222-2222-222222222222', 'MATMAT01b'),
    ('22222222-2222-2222-2222-222222222222', 'MATMAT02b'),
    ('22222222-2222-2222-2222-222222222222', 'MATMAT03c'),
    ('22222222-2222-2222-2222-222222222222', 'FYSFYS01a'),
    ('22222222-2222-2222-2222-222222222222', 'KEMKEM01'),
    ('22222222-2222-2222-2222-222222222222', 'ENGENG05'),
    ('22222222-2222-2222-2222-222222222222', 'SVESVE01'),
    -- Samhällsvetenskapsprogrammet
    ('33333333-3333-3333-3333-333333333333', 'MATMAT01b'),
    ('33333333-3333-3333-3333-333333333333', 'MATMAT02b'),
    ('33333333-3333-3333-3333-333333333333', 'ENGENG05'),
    ('33333333-3333-3333-3333-333333333333', 'ENGENG06'),
    ('33333333-3333-3333-3333-333333333333', 'SVESVE01'),
    -- Ekonomiprogrammet
    ('44444444-4444-4444-4444-444444444444', 'MATMAT01b'),
    ('44444444-4444-4444-4444-444444444444', 'ENGENG05'),
    ('44444444-4444-4444-4444-444444444444', 'ENGENG06'),
    ('44444444-4444-4444-4444-444444444444', 'SVESVE01')
ON CONFLICT DO NOTHING;

-- Insert sample achievements
INSERT INTO public.achievements (id, name, description, icon, type, requirement, category, achievement_key) VALUES
    ('first_session', 'Första steget', 'Genomför din första studiesession', 'Play', 'sessions', 1, 'study', 'first_session'),
    ('early_bird', 'Morgonpiggen', 'Studera före 09:00', 'Sunrise', 'special', 1, 'study', 'early_bird'),
    ('night_owl', 'Nattuggle', 'Studera efter 22:00', 'Moon', 'special', 1, 'study', 'night_owl'),
    ('pomodoro_master', 'Pomodoro-mästare', 'Genomför 25 pomodoro-sessioner', 'Timer', 'sessions', 25, 'study', 'pomodoro_master'),
    ('marathon_runner', 'Maratonlöpare', 'Studera i 3 timmar på en dag', 'Zap', 'study_time', 180, 'study', 'marathon_runner'),
    ('week_warrior', 'Veckokrigare', 'Studera 7 dagar i rad', 'Calendar', 'streak', 7, 'streak', 'week_warrior'),
    ('dedication', 'Hängivenhet', 'Studera 30 dagar i rad', 'Award', 'streak', 30, 'streak', 'dedication'),
    ('course_master', 'Kursmästare', 'Slutför din första kurs', 'BookOpen', 'course_completion', 1, 'milestone', 'course_master'),
    ('scholar', 'Lärd', 'Ackumulera 100 timmars studietid', 'GraduationCap', 'study_time', 6000, 'milestone', 'scholar'),
    ('perfectionist', 'Perfektionist', 'Slutför 5 kurser', 'Star', 'course_completion', 5, 'milestone', 'perfectionist')
ON CONFLICT (id) DO NOTHING;

-- Insert sample study tips
INSERT INTO public.study_tips (title, content, category) VALUES
    ('Pomodoro-tekniken', 'Studera i 25-minuters intervaller med 5 minuters paus mellan. Detta hjälper dig att hålla fokus och undvika utbrändhet.', 'techniques'),
    ('Aktiv repetition', 'Testa dig själv regelbundet istället för att bara läsa om materialet. Detta stärker minnesprocessen och hjälper dig att identifiera kunskapsluckor.', 'memory'),
    ('Intervallrepetition', 'Repetera information med ökande intervaller över tid. Detta utnyttjar "spacing effect" för att förbättra långtidsminnet.', 'memory'),
    ('Feynman-tekniken', 'Förklara konceptet för någon annan som om de vore en nybörjare. Om du inte kan förklara det enkelt har du inte förstått det tillräckligt bra.', 'understanding'),
    ('Mind maps', 'Skapa visuella diagram som kopplar samman relaterade idéer. Detta hjälper dig att se helheten och förstå sambanden mellan olika koncept.', 'organization'),
    ('Sovens betydelse', 'Sov minst 7-8 timmar per natt, särskilt innan prov. Sömn är avgörande för minneskonsolidering och problemlösningsförmåga.', 'health'),
    ('Regelbundna pauser', 'Ta kortare pauser var 50-90 minuter. Gå en promenad eller stretcha för att återställa fokus och undvika mental trötthet.', 'productivity'),
    ('Eliminera distraktioner', 'Stäng av mobilen och blockera distraktioner under studietid. Det tar i genomsnitt 23 minuter att återfå fokus efter en avbrott.', 'focus'),
    ('Varierad studiemiljö', 'Studera på olika platser ibland. Forskning visar att detta kan förbättra inlärning genom att skapa fler mentala associationer.', 'environment'),
    ('Läs innan föreläsningar', 'Förbered dig genom att läsa materialet innan lektioner. Detta gör att du kan fokusera på att förstå svåra koncept istället för grundläggande information.', 'preparation')
ON CONFLICT DO NOTHING;

-- Insert sample study techniques
INSERT INTO public.study_techniques (title, description, instructions, difficulty_level, duration_minutes) VALUES
    ('Pomodoro-tekniken', 'En tidshanteringsteknik som delar upp arbetet i fokuserade 25-minuters intervaller', 
     '1. Välj en uppgift att arbeta med\n2. Ställ en timer på 25 minuter\n3. Arbeta fokuserat tills timern ringer\n4. Ta en 5-minuters paus\n5. Efter 4 pomodoros, ta en längre paus (15-30 min)', 
     'easy', 25),
    ('Aktiv repetition', 'Testa dig själv aktivt istället för att passivt läsa om materialet',
     '1. Läs genom materialet en gång\n2. Stäng boken och försök återkalla informationen\n3. Skriv ner vad du kommer ihåg\n4. Kontrollera och fyll i luckor\n5. Upprepa processen efter några dagar',
     'medium', 30),
    ('Mind mapping', 'Skapa visuella diagram för att organisera och koppla samman information',
     '1. Skriv huvudämnet i mitten av papperet\n2. Lägg till huvudgrenar för viktiga underkategorier\n3. Lägg till mindre grenar för detaljer\n4. Använd färger och bilder för bättre minnesförmåga\n5. Granska och uppdatera din mind map regelbundet',
     'easy', 20),
    ('Feynman-tekniken', 'Lär dig genom att förklara koncept i enkla termer',
     '1. Välj ett koncept att lära dig\n2. Förklara det som om du undervisar en 12-åring\n3. Identifiera luckor i din förklaring\n4. Gå tillbaka till källmaterialet för att fylla luckorna\n5. Förenkla ditt språk och använd analogier',
     'hard', 40),
    ('SQ3R-metoden', 'En strukturerad läsmetod för effektivare inlärning',
     '1. Survey (Överblick): Skanna genom texten\n2. Question (Fråga): Formulera frågor baserat på rubriker\n3. Read (Läs): Läs texten noggrant\n4. Recite (Återge): Sammanfatta med egna ord\n5. Review (Granska): Gå igenom dina anteckningar',
     'medium', 45)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. ENABLE REALTIME FOR KEY TABLES
-- ============================================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_sessions;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Verify setup with a simple query
SELECT 
    'Database setup complete!' as status,
    (SELECT COUNT(*) FROM public.programs) as programs_count,
    (SELECT COUNT(*) FROM public.courses) as courses_count,
    (SELECT COUNT(*) FROM public.achievements) as achievements_count,
    (SELECT COUNT(*) FROM public.study_tips) as study_tips_count,
    (SELECT COUNT(*) FROM public.study_techniques) as study_techniques_count;
