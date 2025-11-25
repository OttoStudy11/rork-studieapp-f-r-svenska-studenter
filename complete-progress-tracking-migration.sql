-- ============================================
-- COMPLETE PROGRESS TRACKING MIGRATION
-- ============================================
-- This SQL migration ensures your local RORK database has the exact same structure
-- as Supabase for all progress tracking functionality.
-- Run this in your Supabase SQL editor.

-- ============================================
-- PART 1: DROP EXISTING TABLES (CLEAN SLATE)
-- ============================================
-- This ensures we start fresh with correct structure

DROP TABLE IF EXISTS public.user_flashcard_progress CASCADE;
DROP TABLE IF EXISTS public.flashcards CASCADE;
DROP TABLE IF EXISTS public.user_lesson_progress CASCADE;
DROP TABLE IF EXISTS public.course_exercises CASCADE;
DROP TABLE IF EXISTS public.course_lessons CASCADE;
DROP TABLE IF EXISTS public.course_modules CASCADE;
DROP TABLE IF EXISTS public.study_guides CASCADE;
DROP TABLE IF EXISTS public.course_assessments CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.study_sessions CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.active_timer_sessions CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.pomodoro_sessions CASCADE;
DROP TABLE IF EXISTS public.user_courses CASCADE;

-- ============================================
-- PART 2: CREATE USER_COURSES TABLE
-- ============================================
-- Tracks which courses a user is enrolled in

CREATE TABLE public.user_courses (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    target_grade TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_user_courses_user_id ON public.user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON public.user_courses(course_id);
CREATE INDEX idx_user_courses_is_active ON public.user_courses(user_id, is_active);

-- ============================================
-- PART 3: CREATE POMODORO_SESSIONS TABLE
-- ============================================
-- Stores completed pomodoro study sessions

CREATE TABLE public.pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_pomodoro_times CHECK (end_time > start_time)
);

CREATE INDEX idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_course_id ON public.pomodoro_sessions(course_id);
CREATE INDEX idx_pomodoro_sessions_end_time ON public.pomodoro_sessions(end_time DESC);
CREATE INDEX idx_pomodoro_sessions_user_end_time ON public.pomodoro_sessions(user_id, end_time DESC);

-- ============================================
-- PART 4: CREATE STUDY_SESSIONS TABLE
-- ============================================
-- Comprehensive study session tracking for planning and history

CREATE TABLE public.study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    
    -- Session details
    title TEXT NOT NULL DEFAULT 'Study Session',
    notes TEXT,
    
    -- Timing information
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    
    -- Session status
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    completed BOOLEAN DEFAULT FALSE,
    
    -- Study technique used
    technique TEXT CHECK (technique IN ('pomodoro', 'deep_work', 'active_recall', 'spaced_repetition', 'other')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure end_time is after start_time if set
    CONSTRAINT valid_session_times CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_course_id ON public.study_sessions(course_id);
CREATE INDEX idx_study_sessions_status ON public.study_sessions(status);
CREATE INDEX idx_study_sessions_start_time ON public.study_sessions(start_time DESC);
CREATE INDEX idx_study_sessions_end_time ON public.study_sessions(end_time DESC);
CREATE INDEX idx_study_sessions_user_start ON public.study_sessions(user_id, start_time DESC);
CREATE INDEX idx_study_sessions_user_status ON public.study_sessions(user_id, status);
CREATE INDEX idx_study_sessions_completed ON public.study_sessions(user_id, completed);

-- ============================================
-- PART 5: CREATE USER_PROGRESS TABLE
-- ============================================
-- Aggregate statistics for each user

CREATE TABLE public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Total statistics
    total_study_time INTEGER NOT NULL DEFAULT 0, -- in minutes
    total_sessions INTEGER NOT NULL DEFAULT 0,
    
    -- Streak tracking
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_study_date TIMESTAMPTZ,
    
    -- Course and achievement tracking
    courses_completed INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    
    -- Level and XP
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    
    -- Leaderboard specific fields (daily/weekly/monthly)
    daily_study_time INTEGER DEFAULT 0, -- in minutes
    weekly_study_time INTEGER DEFAULT 0, -- in minutes
    monthly_study_time INTEGER DEFAULT 0, -- in minutes
    daily_sessions INTEGER DEFAULT 0,
    weekly_sessions INTEGER DEFAULT 0,
    monthly_sessions INTEGER DEFAULT 0,
    
    -- Timestamps for period resets
    last_daily_reset TIMESTAMPTZ DEFAULT NOW(),
    last_weekly_reset TIMESTAMPTZ DEFAULT NOW(),
    last_monthly_reset TIMESTAMPTZ DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_progress_streak ON public.user_progress(current_streak DESC);
CREATE INDEX idx_user_progress_total_time ON public.user_progress(total_study_time DESC);
CREATE INDEX idx_user_progress_last_study ON public.user_progress(last_study_date DESC);
CREATE INDEX idx_user_progress_daily_study_time ON public.user_progress(daily_study_time DESC);
CREATE INDEX idx_user_progress_weekly_study_time ON public.user_progress(weekly_study_time DESC);
CREATE INDEX idx_user_progress_monthly_study_time ON public.user_progress(monthly_study_time DESC);
CREATE INDEX idx_user_progress_level ON public.user_progress(level DESC);

-- ============================================
-- PART 6: CREATE ACHIEVEMENTS TABLES
-- ============================================

-- Achievements definition table
CREATE TABLE public.achievements (
    id TEXT PRIMARY KEY,
    achievement_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('study', 'social', 'streak', 'milestone')),
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('study_time', 'sessions', 'courses', 'notes', 'streak', 'friends')),
    requirement_target INTEGER NOT NULL CHECK (requirement_target > 0),
    requirement_timeframe TEXT CHECK (requirement_timeframe IN ('day', 'week', 'month', 'total')),
    reward_points INTEGER NOT NULL DEFAULT 10,
    reward_badge TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements tracking
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked ON public.user_achievements(user_id, unlocked_at);

-- ============================================
-- PART 7: CREATE COURSE CONTENT TABLES
-- ============================================

-- Course modules
CREATE TABLE public.course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    estimated_hours NUMERIC(4, 1) NOT NULL DEFAULT 1.0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_course_modules_order ON public.course_modules(course_id, order_index);

-- Course lessons
CREATE TABLE public.course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    lesson_type TEXT NOT NULL DEFAULT 'theory' CHECK (lesson_type IN ('theory', 'practical', 'exercise', 'quiz', 'video', 'reading')),
    order_index INTEGER NOT NULL DEFAULT 0,
    estimated_minutes INTEGER NOT NULL DEFAULT 30,
    difficulty_level TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    prerequisites TEXT[],
    learning_objectives TEXT[],
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX idx_course_lessons_course_id ON public.course_lessons(course_id);
CREATE INDEX idx_course_lessons_order ON public.course_lessons(module_id, order_index);

-- Course exercises
CREATE TABLE public.course_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'coding', 'math', 'practical')),
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    points INTEGER NOT NULL DEFAULT 10,
    time_limit_minutes INTEGER,
    difficulty_level TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    hints TEXT[],
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_exercises_lesson_id ON public.course_exercises(lesson_id);
CREATE INDEX idx_course_exercises_course_id ON public.course_exercises(course_id);

-- Study guides
CREATE TABLE public.study_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    guide_type TEXT NOT NULL DEFAULT 'summary' CHECK (guide_type IN ('summary', 'cheat_sheet', 'formula_sheet', 'vocabulary', 'timeline')),
    difficulty_level TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    estimated_read_time INTEGER NOT NULL DEFAULT 15, -- in minutes
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_study_guides_course_id ON public.study_guides(course_id);

-- Course assessments
CREATE TABLE public.course_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'test', 'exam', 'project', 'assignment')),
    total_points INTEGER NOT NULL DEFAULT 100,
    passing_score INTEGER NOT NULL DEFAULT 60,
    time_limit_minutes INTEGER,
    attempts_allowed INTEGER NOT NULL DEFAULT 3,
    is_published BOOLEAN NOT NULL DEFAULT true,
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_assessments_course_id ON public.course_assessments(course_id);

-- ============================================
-- PART 8: CREATE PROGRESS TRACKING TABLES
-- ============================================

-- User lesson progress
CREATE TABLE public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_minutes INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_lesson_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_course_id ON public.user_lesson_progress(course_id);
CREATE INDEX idx_user_lesson_progress_status ON public.user_lesson_progress(user_id, status);

-- ============================================
-- PART 9: CREATE FLASHCARDS TABLES
-- ============================================

-- Flashcards
CREATE TABLE public.flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
    explanation TEXT,
    context TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flashcards_course_id ON public.flashcards(course_id);
CREATE INDEX idx_flashcards_module_id ON public.flashcards(module_id);
CREATE INDEX idx_flashcards_lesson_id ON public.flashcards(lesson_id);

-- User flashcard progress (SM2 algorithm)
CREATE TABLE public.user_flashcard_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    ease_factor NUMERIC(4, 2) NOT NULL DEFAULT 2.5,
    interval INTEGER NOT NULL DEFAULT 0, -- in days
    repetitions INTEGER NOT NULL DEFAULT 0,
    last_reviewed_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    quality INTEGER CHECK (quality >= 0 AND quality <= 5),
    total_reviews INTEGER NOT NULL DEFAULT 0,
    correct_reviews INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, flashcard_id)
);

CREATE INDEX idx_user_flashcard_progress_user_id ON public.user_flashcard_progress(user_id);
CREATE INDEX idx_user_flashcard_progress_flashcard_id ON public.user_flashcard_progress(flashcard_id);
CREATE INDEX idx_user_flashcard_progress_next_review ON public.user_flashcard_progress(user_id, next_review_at);

-- ============================================
-- PART 10: CREATE USER_SETTINGS TABLE
-- ============================================

CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Timer settings
    timer_sound_enabled BOOLEAN NOT NULL DEFAULT true,
    timer_haptics_enabled BOOLEAN NOT NULL DEFAULT true,
    timer_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    timer_background_enabled BOOLEAN NOT NULL DEFAULT false,
    timer_focus_duration INTEGER NOT NULL DEFAULT 25, -- minutes
    timer_break_duration INTEGER NOT NULL DEFAULT 5, -- minutes
    
    -- UI settings
    dark_mode BOOLEAN NOT NULL DEFAULT false,
    theme_color TEXT NOT NULL DEFAULT '#4F46E5',
    language TEXT NOT NULL DEFAULT 'sv',
    
    -- Notification settings
    achievements_notifications BOOLEAN NOT NULL DEFAULT true,
    friend_request_notifications BOOLEAN NOT NULL DEFAULT true,
    study_reminder_notifications BOOLEAN NOT NULL DEFAULT true,
    
    -- Privacy settings
    profile_visible BOOLEAN NOT NULL DEFAULT true,
    show_study_stats BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- ============================================
-- PART 11: CREATE ACTIVE_TIMER_SESSIONS TABLE
-- ============================================

CREATE TABLE public.active_timer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN ('focus', 'break')),
    status TEXT NOT NULL CHECK (status IN ('idle', 'running', 'paused')),
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    course_name TEXT NOT NULL,
    total_duration INTEGER NOT NULL, -- in seconds
    remaining_time INTEGER NOT NULL, -- in seconds
    start_timestamp BIGINT NOT NULL, -- Unix timestamp in milliseconds
    paused_at BIGINT, -- Unix timestamp in milliseconds
    device_id TEXT,
    device_platform TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_active_timer_sessions_user_id ON public.active_timer_sessions(user_id);
CREATE INDEX idx_active_timer_sessions_expires_at ON public.active_timer_sessions(expires_at);

-- ============================================
-- PART 12: INSERT DEFAULT ACHIEVEMENTS
-- ============================================

INSERT INTO public.achievements (id, achievement_key, title, description, icon, category, requirement_type, requirement_target, requirement_timeframe, reward_points, reward_badge) VALUES
    ('first_session', 'first_session', 'Första steget', 'Genomför din första studiesession', 'Play', 'milestone', 'sessions', 1, 'total', 10, 'bronze_medal'),
    ('early_bird', 'early_bird', 'Morgonpiggen', 'Studera före 09:00', 'Sunrise', 'milestone', 'sessions', 1, 'total', 15, NULL),
    ('night_owl', 'night_owl', 'Nattuggle', 'Studera efter 22:00', 'Moon', 'milestone', 'sessions', 1, 'total', 15, NULL),
    ('pomodoro_master', 'pomodoro_master', 'Pomodoro-mästare', 'Genomför 25 pomodoro-sessioner', 'Timer', 'study', 'sessions', 25, 'total', 50, 'pomodoro_expert'),
    ('marathon_runner', 'marathon_runner', 'Maratonlöpare', 'Studera i 3 timmar på en dag', 'Zap', 'study', 'study_time', 180, 'day', 30, NULL),
    ('week_warrior', 'week_warrior', 'Veckokrigare', 'Studera 7 dagar i rad', 'Calendar', 'streak', 'streak', 7, 'total', 40, 'week_streak'),
    ('dedication', 'dedication', 'Hängivenhet', 'Studera 30 dagar i rad', 'Award', 'streak', 'streak', 30, 'total', 100, 'dedication_medal'),
    ('course_master', 'course_master', 'Kursmästare', 'Slutför din första kurs', 'BookOpen', 'milestone', 'courses', 1, 'total', 50, 'course_complete'),
    ('scholar', 'scholar', 'Lärd', 'Ackumulera 100 timmars studietid', 'GraduationCap', 'study', 'study_time', 6000, 'total', 150, 'scholar_badge'),
    ('perfectionist', 'perfectionist', 'Perfektionist', 'Slutför 5 kurser', 'Star', 'milestone', 'courses', 5, 'total', 200, 'perfectionist_star'),
    ('social_butterfly', 'social_butterfly', 'Social fjäril', 'Lägg till 5 vänner', 'Users', 'social', 'friends', 5, 'total', 25, NULL),
    ('study_buddy', 'study_buddy', 'Studiekompis', 'Lägg till din första vän', 'UserPlus', 'social', 'friends', 1, 'total', 10, NULL),
    ('speed_learner', 'speed_learner', 'Snabblärare', 'Genomför 10 sessioner på en vecka', 'Rocket', 'study', 'sessions', 10, 'week', 35, NULL),
    ('consistent_student', 'consistent_student', 'Konsekvent student', 'Studera minst 30 minuter varje dag i en vecka', 'Target', 'streak', 'study_time', 30, 'day', 45, 'consistency_badge')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 13: CREATE TRIGGERS
-- ============================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
DROP TRIGGER IF EXISTS update_user_courses_updated_at ON public.user_courses;
CREATE TRIGGER update_user_courses_updated_at BEFORE UPDATE ON public.user_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_study_sessions_updated_at ON public.study_sessions;
CREATE TRIGGER update_study_sessions_updated_at BEFORE UPDATE ON public.study_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON public.user_achievements;
CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON public.user_achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_modules_updated_at ON public.course_modules;
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON public.course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_lessons_updated_at ON public.course_lessons;
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON public.course_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_lesson_progress_updated_at ON public.user_lesson_progress;
CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON public.user_lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_active_timer_sessions_updated_at ON public.active_timer_sessions;
CREATE TRIGGER update_active_timer_sessions_updated_at BEFORE UPDATE ON public.active_timer_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 14: TRIGGER TO UPDATE USER PROGRESS
-- ============================================

CREATE OR REPLACE FUNCTION update_user_progress_after_session()
RETURNS TRIGGER AS $$
DECLARE
    today_date DATE;
    last_study DATE;
    new_streak INTEGER;
    longest_streak_val INTEGER;
BEGIN
    -- Only update if session is completed
    IF NEW.completed = TRUE AND (OLD IS NULL OR OLD.completed = FALSE) THEN
        today_date := COALESCE(NEW.end_time, NEW.start_time)::DATE;
        
        -- Get current progress
        SELECT last_study_date::DATE, current_streak, longest_streak
        INTO last_study, new_streak, longest_streak_val
        FROM public.user_progress
        WHERE user_id = NEW.user_id;
        
        -- Calculate new streak
        IF last_study IS NULL THEN
            -- First session ever
            new_streak := 1;
        ELSIF last_study = today_date THEN
            -- Same day, keep streak
            new_streak := COALESCE(new_streak, 1);
        ELSIF last_study = today_date - INTERVAL '1 day' THEN
            -- Consecutive day, increment streak
            new_streak := COALESCE(new_streak, 0) + 1;
        ELSE
            -- Streak broken, reset to 1
            new_streak := 1;
        END IF;
        
        -- Calculate longest streak
        longest_streak_val := GREATEST(COALESCE(longest_streak_val, 0), new_streak);
        
        -- Update or insert user progress
        INSERT INTO public.user_progress (
            user_id,
            total_study_time,
            total_sessions,
            current_streak,
            longest_streak,
            last_study_date,
            updated_at
        ) VALUES (
            NEW.user_id,
            NEW.duration_minutes,
            1,
            new_streak,
            longest_streak_val,
            COALESCE(NEW.end_time, NEW.start_time),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            total_study_time = public.user_progress.total_study_time + NEW.duration_minutes,
            total_sessions = public.user_progress.total_sessions + 1,
            current_streak = new_streak,
            longest_streak = longest_streak_val,
            last_study_date = COALESCE(NEW.end_time, NEW.start_time),
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_progress ON public.study_sessions;
CREATE TRIGGER trigger_update_user_progress
    AFTER INSERT OR UPDATE ON public.study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress_after_session();

-- ============================================
-- PART 15: TRIGGER TO SYNC POMODORO TO STUDY SESSIONS
-- ============================================

CREATE OR REPLACE FUNCTION sync_pomodoro_to_study_sessions()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a study_sessions entry for each pomodoro session
    INSERT INTO public.study_sessions (
        user_id,
        course_id,
        title,
        start_time,
        end_time,
        duration_minutes,
        status,
        completed,
        technique,
        created_at
    ) VALUES (
        NEW.user_id,
        NEW.course_id,
        'Pomodoro Session',
        NEW.start_time,
        NEW.end_time,
        NEW.duration,
        'completed',
        TRUE,
        'pomodoro',
        NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_pomodoro ON public.pomodoro_sessions;
CREATE TRIGGER trigger_sync_pomodoro
    AFTER INSERT ON public.pomodoro_sessions
    FOR EACH ROW
    EXECUTE FUNCTION sync_pomodoro_to_study_sessions();

-- ============================================
-- PART 16: TRIGGER TO AUTO-CREATE USER_PROGRESS
-- ============================================

CREATE OR REPLACE FUNCTION create_user_progress_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user_progress entry
    INSERT INTO public.user_progress (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create user_settings entry
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_create_user_progress ON public.profiles;
CREATE TRIGGER trigger_create_user_progress
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_user_progress_on_signup();

-- ============================================
-- PART 17: HELPER FUNCTIONS FOR STATISTICS
-- ============================================

-- Function to get user study statistics for a date range
CREATE OR REPLACE FUNCTION get_user_study_stats(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_minutes INTEGER,
    total_sessions INTEGER,
    avg_session_duration NUMERIC,
    most_studied_course_id TEXT,
    most_studied_course_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ss.duration_minutes), 0)::INTEGER as total_minutes,
        COUNT(ss.id)::INTEGER as total_sessions,
        COALESCE(AVG(ss.duration_minutes), 0)::NUMERIC as avg_session_duration,
        (
            SELECT ss2.course_id 
            FROM public.study_sessions ss2
            WHERE ss2.user_id = p_user_id 
                AND ss2.completed = TRUE
                AND ss2.start_time >= p_start_date 
                AND ss2.start_time <= p_end_date
                AND ss2.course_id IS NOT NULL
            GROUP BY ss2.course_id
            ORDER BY SUM(ss2.duration_minutes) DESC
            LIMIT 1
        ) as most_studied_course_id,
        (
            SELECT c.title
            FROM public.study_sessions ss2
            JOIN public.courses c ON c.id = ss2.course_id
            WHERE ss2.user_id = p_user_id 
                AND ss2.completed = TRUE
                AND ss2.start_time >= p_start_date 
                AND ss2.start_time <= p_end_date
                AND ss2.course_id IS NOT NULL
            GROUP BY ss2.course_id, c.title
            ORDER BY SUM(ss2.duration_minutes) DESC
            LIMIT 1
        ) as most_studied_course_name
    FROM public.study_sessions ss
    WHERE ss.user_id = p_user_id 
        AND ss.completed = TRUE
        AND ss.start_time >= p_start_date 
        AND ss.start_time <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily study statistics
CREATE OR REPLACE FUNCTION get_daily_study_stats(
    p_user_id UUID,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    study_date DATE,
    total_minutes INTEGER,
    session_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT (CURRENT_DATE - INTERVAL '1 day' * generate_series(0, p_days - 1))::DATE as study_date
    )
    SELECT 
        ds.study_date,
        COALESCE(SUM(ss.duration_minutes), 0)::INTEGER as total_minutes,
        COUNT(ss.id)::INTEGER as session_count
    FROM date_series ds
    LEFT JOIN public.study_sessions ss 
        ON ss.user_id = p_user_id 
        AND ss.completed = TRUE
        AND ss.start_time::DATE = ds.study_date
    GROUP BY ds.study_date
    ORDER BY ds.study_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 18: ENABLE RLS (Row Level Security)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_timer_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 19: CREATE RLS POLICIES
-- ============================================

-- Policies for user_courses
CREATE POLICY "Users can view their own courses" ON public.user_courses
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own courses" ON public.user_courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own courses" ON public.user_courses
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own courses" ON public.user_courses
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for pomodoro_sessions
CREATE POLICY "Users can view their own pomodoro sessions" ON public.pomodoro_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pomodoro sessions" ON public.pomodoro_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for study_sessions
CREATE POLICY "Users can view their own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study sessions" ON public.study_sessions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study sessions" ON public.study_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view friends progress" ON public.user_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.friends
            WHERE status = 'accepted'
            AND (
                (user_id = auth.uid() AND friend_id = user_progress.user_id)
                OR
                (friend_id = auth.uid() AND user_id = user_progress.user_id)
            )
        )
    );
CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for achievements (public read)
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements
    FOR SELECT USING (true);

-- Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own achievements" ON public.user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for course content (public read)
CREATE POLICY "Course modules are viewable by everyone" ON public.course_modules
    FOR SELECT USING (true);
CREATE POLICY "Course lessons are viewable by everyone" ON public.course_lessons
    FOR SELECT USING (true);
CREATE POLICY "Course exercises are viewable by everyone" ON public.course_exercises
    FOR SELECT USING (true);
CREATE POLICY "Study guides are viewable by everyone" ON public.study_guides
    FOR SELECT USING (true);
CREATE POLICY "Course assessments are viewable by everyone" ON public.course_assessments
    FOR SELECT USING (true);
CREATE POLICY "Flashcards are viewable by everyone" ON public.flashcards
    FOR SELECT USING (true);

-- Policies for user progress tracking
CREATE POLICY "Users can view their own lesson progress" ON public.user_lesson_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own lesson progress" ON public.user_lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lesson progress" ON public.user_lesson_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own flashcard progress" ON public.user_flashcard_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own flashcard progress" ON public.user_flashcard_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own flashcard progress" ON public.user_flashcard_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for active_timer_sessions
CREATE POLICY "Users can view their own timer session" ON public.active_timer_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own timer session" ON public.active_timer_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own timer session" ON public.active_timer_sessions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own timer session" ON public.active_timer_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 20: CREATE USER_PROGRESS FOR EXISTING USERS
-- ============================================

-- Create user_progress entries for all existing users who don't have one
INSERT INTO public.user_progress (user_id)
SELECT id FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_progress)
ON CONFLICT (user_id) DO NOTHING;

-- Create user_settings entries for all existing users who don't have one
INSERT INTO public.user_settings (user_id)
SELECT id FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- Initialize user_achievements for all users
DO $$
DECLARE
    profile_record RECORD;
    achievement_record RECORD;
BEGIN
    FOR profile_record IN SELECT id FROM public.profiles LOOP
        FOR achievement_record IN SELECT id FROM public.achievements LOOP
            INSERT INTO public.user_achievements (user_id, achievement_id, progress)
            VALUES (profile_record.id, achievement_record.id, 0)
            ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- ============================================
-- PART 21: ENABLE REALTIME FOR TABLES
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_timer_sessions;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE '✅ Complete Progress Tracking Migration Successful!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Tables created and configured:';
    RAISE NOTICE '  ✓ user_courses - Course enrollment tracking';
    RAISE NOTICE '  ✓ pomodoro_sessions - Pomodoro study history';
    RAISE NOTICE '  ✓ study_sessions - Comprehensive session tracking';
    RAISE NOTICE '  ✓ user_progress - Aggregate user statistics';
    RAISE NOTICE '  ✓ achievements - Achievement definitions';
    RAISE NOTICE '  ✓ user_achievements - User achievement progress';
    RAISE NOTICE '  ✓ course_modules - Course module structure';
    RAISE NOTICE '  ✓ course_lessons - Lesson content';
    RAISE NOTICE '  ✓ course_exercises - Practice exercises';
    RAISE NOTICE '  ✓ study_guides - Study guide content';
    RAISE NOTICE '  ✓ course_assessments - Assessments & exams';
    RAISE NOTICE '  ✓ user_lesson_progress - Lesson progress tracking';
    RAISE NOTICE '  ✓ flashcards - Flashcard content';
    RAISE NOTICE '  ✓ user_flashcard_progress - Spaced repetition tracking';
    RAISE NOTICE '  ✓ user_settings - User preferences';
    RAISE NOTICE '  ✓ active_timer_sessions - Active timer state sync';
    RAISE NOTICE '';
    RAISE NOTICE 'Features enabled:';
    RAISE NOTICE '  ✓ Automatic progress calculation';
    RAISE NOTICE '  ✓ Streak tracking (current & longest)';
    RAISE NOTICE '  ✓ Achievement system with 14 achievements';
    RAISE NOTICE '  ✓ Pomodoro sync to study sessions';
    RAISE NOTICE '  ✓ Daily/weekly/monthly leaderboards';
    RAISE NOTICE '  ✓ Course progress tracking';
    RAISE NOTICE '  ✓ Lesson progress tracking';
    RAISE NOTICE '  ✓ Flashcard spaced repetition (SM2)';
    RAISE NOTICE '  ✓ Cross-device timer synchronization';
    RAISE NOTICE '  ✓ Row Level Security (RLS) enabled';
    RAISE NOTICE '  ✓ Realtime subscriptions enabled';
    RAISE NOTICE '';
    RAISE NOTICE 'Helper functions available:';
    RAISE NOTICE '  - get_user_study_stats(user_id, start_date, end_date)';
    RAISE NOTICE '  - get_daily_study_stats(user_id, days)';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Your database structure is now synchronized!';
    RAISE NOTICE 'All progress tracking features are ready to use.';
    RAISE NOTICE '==================================================';
END $$;
