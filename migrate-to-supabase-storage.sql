-- =====================================================
-- COMPLETE MIGRATION TO SUPABASE STORAGE
-- Migrates all local AsyncStorage data to Supabase
-- =====================================================

-- =====================================================
-- 1. USER SETTINGS TABLE
-- =====================================================
-- Store all user-specific settings (timer, theme, notifications)

CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Timer settings
    timer_sound_enabled BOOLEAN DEFAULT TRUE,
    timer_haptics_enabled BOOLEAN DEFAULT TRUE,
    timer_notifications_enabled BOOLEAN DEFAULT TRUE,
    timer_background_enabled BOOLEAN DEFAULT TRUE,
    timer_focus_duration INTEGER DEFAULT 25 CHECK (timer_focus_duration > 0),
    timer_break_duration INTEGER DEFAULT 5 CHECK (timer_break_duration > 0),
    
    -- Display settings
    dark_mode BOOLEAN DEFAULT FALSE,
    theme_color TEXT DEFAULT 'blue',
    language TEXT DEFAULT 'sv',
    
    -- Notification settings
    achievements_notifications BOOLEAN DEFAULT TRUE,
    friend_request_notifications BOOLEAN DEFAULT TRUE,
    study_reminder_notifications BOOLEAN DEFAULT TRUE,
    
    -- Privacy settings
    profile_visible BOOLEAN DEFAULT TRUE,
    show_study_stats BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. STUDY SESSION STATES TABLE
-- =====================================================
-- Store active/paused timer sessions for cross-device sync

CREATE TABLE IF NOT EXISTS public.active_timer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Session details
    session_type TEXT NOT NULL CHECK (session_type IN ('focus', 'break')),
    status TEXT NOT NULL CHECK (status IN ('idle', 'running', 'paused')),
    
    -- Course info
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    course_name TEXT NOT NULL,
    
    -- Timing
    total_duration INTEGER NOT NULL, -- seconds
    remaining_time INTEGER NOT NULL, -- seconds
    start_timestamp BIGINT NOT NULL,
    paused_at BIGINT,
    
    -- Metadata
    device_id TEXT,
    device_platform TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
    
    -- Only one active session per user
    UNIQUE(user_id)
);

-- =====================================================
-- 3. USER ONBOARDING STATUS
-- =====================================================
-- Track onboarding completion and flow progress

CREATE TABLE IF NOT EXISTS public.user_onboarding (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Onboarding status
    completed BOOLEAN DEFAULT FALSE,
    current_step TEXT,
    steps_completed JSONB DEFAULT '[]'::JSONB,
    
    -- Selections during onboarding
    selected_courses TEXT[] DEFAULT ARRAY[]::TEXT[],
    selected_gymnasium_id TEXT,
    selected_gymnasium_grade TEXT,
    selected_program TEXT,
    selected_purpose TEXT,
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. COURSE PROGRESS TRACKING
-- =====================================================
-- Enhance existing user_courses with detailed progress

-- Add columns to existing user_courses table if they don't exist
DO $$
BEGIN
    -- Add last_studied column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_courses' AND column_name = 'last_studied'
    ) THEN
        ALTER TABLE public.user_courses ADD COLUMN last_studied TIMESTAMPTZ;
    END IF;
    
    -- Add studied_hours column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_courses' AND column_name = 'studied_hours'
    ) THEN
        ALTER TABLE public.user_courses ADD COLUMN studied_hours NUMERIC DEFAULT 0;
    END IF;
    
    -- Add total_hours column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_courses' AND column_name = 'total_hours'
    ) THEN
        ALTER TABLE public.user_courses ADD COLUMN total_hours NUMERIC DEFAULT 0;
    END IF;
    
    -- Add created_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_courses' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.user_courses ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_courses' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.user_courses ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 5. AVATAR CONFIGURATIONS
-- =====================================================
-- Store user avatar customizations

-- Add avatar_config column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_config'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_config JSONB;
        RAISE NOTICE 'Added avatar_config column to profiles';
    END IF;
END $$;

-- =====================================================
-- 6. FLASHCARD PROGRESS
-- =====================================================
-- Already exists in FlashcardContext, ensure columns are correct

-- Ensure user_flashcard_progress has all necessary columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_flashcard_progress') THEN
        -- Add any missing columns
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_flashcard_progress' AND column_name = 'total_reviews'
        ) THEN
            ALTER TABLE public.user_flashcard_progress ADD COLUMN total_reviews INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_flashcard_progress' AND column_name = 'correct_reviews'
        ) THEN
            ALTER TABLE public.user_flashcard_progress ADD COLUMN correct_reviews INTEGER DEFAULT 0;
        END IF;
    END IF;
END $$;

-- =====================================================
-- 7. ACHIEVEMENT PROGRESS
-- =====================================================
-- Already exists, ensure it has progress tracking

-- Verify user_achievements has progress column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_achievements' AND column_name = 'progress'
        ) THEN
            ALTER TABLE public.user_achievements ADD COLUMN progress INTEGER DEFAULT 0;
        END IF;
    END IF;
END $$;

-- =====================================================
-- 8. PREMIUM SUBSCRIPTION TRACKING
-- =====================================================
-- Add detailed subscription tracking columns

DO $$
BEGIN
    -- Add coins/points column for gamification
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'coins_balance'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN coins_balance INTEGER DEFAULT 0;
    END IF;
    
    -- Add subscription metadata
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'subscription_started_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_started_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'subscription_provider'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN subscription_provider TEXT;
    END IF;
END $$;

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- User settings indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Active timer sessions indexes
CREATE INDEX IF NOT EXISTS idx_active_timer_user_id ON public.active_timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_timer_expires ON public.active_timer_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_active_timer_status ON public.active_timer_sessions(user_id, status);

-- Onboarding indexes
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON public.user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed ON public.user_onboarding(completed);

-- Course progress indexes
CREATE INDEX IF NOT EXISTS idx_user_courses_last_studied ON public.user_courses(user_id, last_studied DESC);
CREATE INDEX IF NOT EXISTS idx_user_courses_progress ON public.user_courses(user_id, progress DESC);

-- =====================================================
-- 10. UPDATE TRIGGERS
-- =====================================================

-- Trigger for user_settings
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for active_timer_sessions
DROP TRIGGER IF EXISTS update_active_timer_sessions_updated_at ON public.active_timer_sessions;
CREATE TRIGGER update_active_timer_sessions_updated_at
    BEFORE UPDATE ON public.active_timer_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_onboarding
DROP TRIGGER IF EXISTS update_user_onboarding_updated_at ON public.user_onboarding;
CREATE TRIGGER update_user_onboarding_updated_at
    BEFORE UPDATE ON public.user_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_courses
DROP TRIGGER IF EXISTS update_user_courses_updated_at ON public.user_courses;
CREATE TRIGGER update_user_courses_updated_at
    BEFORE UPDATE ON public.user_courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. CLEANUP FUNCTION FOR EXPIRED TIMER SESSIONS
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_timer_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.active_timer_sessions
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. INITIALIZE DEFAULT SETTINGS FOR EXISTING USERS
-- =====================================================

-- Create default settings for users who don't have them
INSERT INTO public.user_settings (user_id)
SELECT id FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- Create default onboarding records for existing users
INSERT INTO public.user_onboarding (user_id, completed)
SELECT id, TRUE FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_onboarding)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '✅ Migration to Supabase storage completed successfully!';
    RAISE NOTICE 'Created tables: user_settings, active_timer_sessions, user_onboarding';
    RAISE NOTICE 'Enhanced tables: profiles, user_courses';
    RAISE NOTICE 'All indexes and triggers created';
END $$;
