-- ============================================
-- FIX USER_PROGRESS TABLE
-- ============================================
-- This SQL ensures the user_progress table exists with all necessary columns

-- Drop and recreate user_progress table with all required columns
DROP TABLE IF EXISTS public.user_progress CASCADE;

CREATE TABLE public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Total stats
    total_study_time INTEGER DEFAULT 0, -- in minutes
    total_sessions INTEGER DEFAULT 0,
    
    -- Streak tracking
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date TIMESTAMP WITH TIME ZONE,
    
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
    last_daily_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_weekly_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_monthly_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- Metadata
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create indexes for leaderboard queries
CREATE INDEX idx_user_progress_total_study_time ON public.user_progress(total_study_time DESC);
CREATE INDEX idx_user_progress_current_streak ON public.user_progress(current_streak DESC);
CREATE INDEX idx_user_progress_daily_study_time ON public.user_progress(daily_study_time DESC);
CREATE INDEX idx_user_progress_weekly_study_time ON public.user_progress(weekly_study_time DESC);
CREATE INDEX idx_user_progress_monthly_study_time ON public.user_progress(monthly_study_time DESC);
CREATE INDEX idx_user_progress_level ON public.user_progress(level DESC);

-- RLS Policies for user_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view friends progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;

-- Users can view their own progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view progress of their friends (for leaderboards)
CREATE POLICY "Users can view friends progress" ON public.user_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.friendships
            WHERE status = 'accepted'
            AND (
                (user1_id = auth.uid() AND user2_id = user_progress.user_id)
                OR
                (user2_id = auth.uid() AND user1_id = user_progress.user_id)
            )
        )
    );

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER TO AUTO-CREATE USER_PROGRESS
-- ============================================

-- Function to create user_progress entry when a profile is created
CREATE OR REPLACE FUNCTION create_user_progress_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_progress (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_create_user_progress ON public.profiles;

-- Create trigger
CREATE TRIGGER trigger_create_user_progress
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_user_progress_on_signup();

-- ============================================
-- CREATE USER_PROGRESS FOR EXISTING USERS
-- ============================================

-- Create user_progress entries for all existing users who don't have one
INSERT INTO public.user_progress (user_id)
SELECT id FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.user_progress)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- ENABLE REALTIME
-- ============================================

-- Enable realtime for user_progress table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;

-- ============================================
-- SETUP COMPLETE
-- ============================================
