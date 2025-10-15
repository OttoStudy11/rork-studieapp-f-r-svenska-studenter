-- ============================================
-- COMPLETE FRIENDS & LEADERBOARD SYSTEM
-- ============================================
-- This SQL file creates all necessary tables, functions, triggers, and policies
-- for a fully functional friends and leaderboard system.

-- ============================================
-- 1. FRIENDSHIPS TABLE
-- ============================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.friendships CASCADE;

-- Create friendships table
CREATE TABLE public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure users can't friend themselves
    CONSTRAINT no_self_friendship CHECK (user1_id != user2_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Create unique index to prevent duplicate friendships
-- This ensures that (A,B) and (B,A) are treated as the same friendship
CREATE UNIQUE INDEX friendships_unique_pair_idx ON public.friendships (
    LEAST(user1_id, user2_id), 
    GREATEST(user1_id, user2_id)
);

-- Create indexes for better performance
CREATE INDEX friendships_user1_id_idx ON public.friendships(user1_id);
CREATE INDEX friendships_user2_id_idx ON public.friendships(user2_id);
CREATE INDEX friendships_status_idx ON public.friendships(status);
CREATE INDEX friendships_created_at_idx ON public.friendships(created_at);

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can insert friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can update their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON public.friendships;

-- Users can view friendships where they are either user1 or user2
CREATE POLICY "Users can view their friendships" ON public.friendships
    FOR SELECT USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Users can create friendships where they are user1
CREATE POLICY "Users can insert friendships" ON public.friendships
    FOR INSERT WITH CHECK (
        auth.uid() = user1_id
    );

-- Users can update friendships where they are either user1 or user2
CREATE POLICY "Users can update their friendships" ON public.friendships
    FOR UPDATE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    ) WITH CHECK (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Users can delete friendships where they are either user1 or user2
CREATE POLICY "Users can delete their friendships" ON public.friendships
    FOR DELETE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- ============================================
-- 2. USER PROGRESS TABLE (Enhanced for Leaderboards)
-- ============================================

-- Create or update user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_study_time INTEGER DEFAULT 0, -- in minutes
    total_sessions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    last_study_date TIMESTAMP WITH TIME ZONE,
    
    -- Leaderboard specific fields
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
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_progress_total_study_time ON public.user_progress(total_study_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_current_streak ON public.user_progress(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_daily_study_time ON public.user_progress(daily_study_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_weekly_study_time ON public.user_progress(weekly_study_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_monthly_study_time ON public.user_progress(monthly_study_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_level ON public.user_progress(level DESC);

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
-- 3. STUDY SESSIONS TABLE (Enhanced)
-- ============================================

-- Ensure study_sessions table exists with all necessary fields
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    technique TEXT DEFAULT 'pomodoro',
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_course_id_idx ON public.study_sessions(course_id);
CREATE INDEX IF NOT EXISTS study_sessions_created_at_idx ON public.study_sessions(created_at DESC);

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can delete their own study sessions" ON public.study_sessions;

CREATE POLICY "Users can view their own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON public.study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions" ON public.study_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. FUNCTIONS FOR PROGRESS TRACKING
-- ============================================

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_streak INTEGER := 0;
    v_current_date DATE;
    v_check_date DATE;
BEGIN
    -- Get the most recent study date
    SELECT DATE(created_at) INTO v_current_date
    FROM public.study_sessions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no sessions, return 0
    IF v_current_date IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Check if the streak is still active (studied today or yesterday)
    IF v_current_date < CURRENT_DATE - INTERVAL '1 day' THEN
        RETURN 0;
    END IF;
    
    -- Count consecutive days
    v_check_date := v_current_date;
    LOOP
        -- Check if there's a session on v_check_date
        IF EXISTS (
            SELECT 1 FROM public.study_sessions
            WHERE user_id = p_user_id
            AND DATE(created_at) = v_check_date
        ) THEN
            v_streak := v_streak + 1;
            v_check_date := v_check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;
    
    RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to update user progress after study session
CREATE OR REPLACE FUNCTION update_user_progress_after_session()
RETURNS TRIGGER AS $$
DECLARE
    v_total_time INTEGER;
    v_total_sessions INTEGER;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_last_study_date TIMESTAMP WITH TIME ZONE;
    v_daily_time INTEGER;
    v_weekly_time INTEGER;
    v_monthly_time INTEGER;
    v_daily_sessions INTEGER;
    v_weekly_sessions INTEGER;
    v_monthly_sessions INTEGER;
BEGIN
    -- Calculate total study time
    SELECT COALESCE(SUM(duration_minutes), 0) INTO v_total_time
    FROM public.study_sessions
    WHERE user_id = NEW.user_id;
    
    -- Calculate total sessions
    SELECT COUNT(*) INTO v_total_sessions
    FROM public.study_sessions
    WHERE user_id = NEW.user_id;
    
    -- Calculate current streak
    v_current_streak := calculate_user_streak(NEW.user_id);
    
    -- Get last study date
    SELECT MAX(created_at) INTO v_last_study_date
    FROM public.study_sessions
    WHERE user_id = NEW.user_id;
    
    -- Calculate daily study time (today)
    SELECT COALESCE(SUM(duration_minutes), 0) INTO v_daily_time
    FROM public.study_sessions
    WHERE user_id = NEW.user_id
    AND DATE(created_at) = CURRENT_DATE;
    
    -- Calculate weekly study time (last 7 days)
    SELECT COALESCE(SUM(duration_minutes), 0) INTO v_weekly_time
    FROM public.study_sessions
    WHERE user_id = NEW.user_id
    AND created_at >= CURRENT_DATE - INTERVAL '7 days';
    
    -- Calculate monthly study time (last 30 days)
    SELECT COALESCE(SUM(duration_minutes), 0) INTO v_monthly_time
    FROM public.study_sessions
    WHERE user_id = NEW.user_id
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Calculate daily sessions
    SELECT COUNT(*) INTO v_daily_sessions
    FROM public.study_sessions
    WHERE user_id = NEW.user_id
    AND DATE(created_at) = CURRENT_DATE;
    
    -- Calculate weekly sessions
    SELECT COUNT(*) INTO v_weekly_sessions
    FROM public.study_sessions
    WHERE user_id = NEW.user_id
    AND created_at >= CURRENT_DATE - INTERVAL '7 days';
    
    -- Calculate monthly sessions
    SELECT COUNT(*) INTO v_monthly_sessions
    FROM public.study_sessions
    WHERE user_id = NEW.user_id
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Insert or update user progress
    INSERT INTO public.user_progress (
        user_id,
        total_study_time,
        total_sessions,
        current_streak,
        longest_streak,
        last_study_date,
        daily_study_time,
        weekly_study_time,
        monthly_study_time,
        daily_sessions,
        weekly_sessions,
        monthly_sessions,
        updated_at
    ) VALUES (
        NEW.user_id,
        v_total_time,
        v_total_sessions,
        v_current_streak,
        GREATEST(v_current_streak, 0),
        v_last_study_date,
        v_daily_time,
        v_weekly_time,
        v_monthly_time,
        v_daily_sessions,
        v_weekly_sessions,
        v_monthly_sessions,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_study_time = v_total_time,
        total_sessions = v_total_sessions,
        current_streak = v_current_streak,
        longest_streak = GREATEST(user_progress.longest_streak, v_current_streak),
        last_study_date = v_last_study_date,
        daily_study_time = v_daily_time,
        weekly_study_time = v_weekly_time,
        monthly_study_time = v_monthly_time,
        daily_sessions = v_daily_sessions,
        weekly_sessions = v_weekly_sessions,
        monthly_sessions = v_monthly_sessions,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic progress updates
DROP TRIGGER IF EXISTS trigger_update_user_progress ON public.study_sessions;
CREATE TRIGGER trigger_update_user_progress
    AFTER INSERT OR UPDATE ON public.study_sessions
    FOR EACH ROW EXECUTE FUNCTION update_user_progress_after_session();

-- ============================================
-- 5. LEADERBOARD FUNCTIONS
-- ============================================

-- Function to get daily leaderboard
CREATE OR REPLACE FUNCTION get_daily_leaderboard(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    study_time INTEGER,
    sessions INTEGER,
    rank BIGINT,
    is_friend BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.username,
        p.display_name,
        p.avatar_url,
        up.daily_study_time AS study_time,
        up.daily_sessions AS sessions,
        ROW_NUMBER() OVER (ORDER BY up.daily_study_time DESC, up.daily_sessions DESC) AS rank,
        EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
            AND (
                (f.user1_id = p_user_id AND f.user2_id = p.id)
                OR
                (f.user2_id = p_user_id AND f.user1_id = p.id)
            )
        ) AS is_friend
    FROM public.profiles p
    INNER JOIN public.user_progress up ON p.id = up.user_id
    WHERE up.daily_study_time > 0
    AND (
        p.id = p_user_id
        OR EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
            AND (
                (f.user1_id = p_user_id AND f.user2_id = p.id)
                OR
                (f.user2_id = p_user_id AND f.user1_id = p.id)
            )
        )
    )
    ORDER BY up.daily_study_time DESC, up.daily_sessions DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get weekly leaderboard
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    study_time INTEGER,
    sessions INTEGER,
    rank BIGINT,
    is_friend BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.username,
        p.display_name,
        p.avatar_url,
        up.weekly_study_time AS study_time,
        up.weekly_sessions AS sessions,
        ROW_NUMBER() OVER (ORDER BY up.weekly_study_time DESC, up.weekly_sessions DESC) AS rank,
        EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
            AND (
                (f.user1_id = p_user_id AND f.user2_id = p.id)
                OR
                (f.user2_id = p_user_id AND f.user1_id = p.id)
            )
        ) AS is_friend
    FROM public.profiles p
    INNER JOIN public.user_progress up ON p.id = up.user_id
    WHERE up.weekly_study_time > 0
    AND (
        p.id = p_user_id
        OR EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
            AND (
                (f.user1_id = p_user_id AND f.user2_id = p.id)
                OR
                (f.user2_id = p_user_id AND f.user1_id = p.id)
            )
        )
    )
    ORDER BY up.weekly_study_time DESC, up.weekly_sessions DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly leaderboard
CREATE OR REPLACE FUNCTION get_monthly_leaderboard(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    study_time INTEGER,
    sessions INTEGER,
    rank BIGINT,
    is_friend BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.username,
        p.display_name,
        p.avatar_url,
        up.monthly_study_time AS study_time,
        up.monthly_sessions AS sessions,
        ROW_NUMBER() OVER (ORDER BY up.monthly_study_time DESC, up.monthly_sessions DESC) AS rank,
        EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
            AND (
                (f.user1_id = p_user_id AND f.user2_id = p.id)
                OR
                (f.user2_id = p_user_id AND f.user1_id = p.id)
            )
        ) AS is_friend
    FROM public.profiles p
    INNER JOIN public.user_progress up ON p.id = up.user_id
    WHERE up.monthly_study_time > 0
    AND (
        p.id = p_user_id
        OR EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
            AND (
                (f.user1_id = p_user_id AND f.user2_id = p.id)
                OR
                (f.user2_id = p_user_id AND f.user1_id = p.id)
            )
        )
    )
    ORDER BY up.monthly_study_time DESC, up.monthly_sessions DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all-time leaderboard
CREATE OR REPLACE FUNCTION get_alltime_leaderboard(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    study_time INTEGER,
    sessions INTEGER,
    streak INTEGER,
    rank BIGINT,
    is_friend BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.username,
        p.display_name,
        p.avatar_url,
        up.total_study_time AS study_time,
        up.total_sessions AS sessions,
        up.current_streak AS streak,
        ROW_NUMBER() OVER (ORDER BY up.total_study_time DESC, up.total_sessions DESC) AS rank,
        EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
            AND (
                (f.user1_id = p_user_id AND f.user2_id = p.id)
                OR
                (f.user2_id = p_user_id AND f.user1_id = p.id)
            )
        ) AS is_friend
    FROM public.profiles p
    INNER JOIN public.user_progress up ON p.id = up.user_id
    WHERE up.total_study_time > 0
    AND (
        p.id = p_user_id
        OR EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
            AND (
                (f.user1_id = p_user_id AND f.user2_id = p.id)
                OR
                (f.user2_id = p_user_id AND f.user1_id = p.id)
            )
        )
    )
    ORDER BY up.total_study_time DESC, up.total_sessions DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get streak leaderboard
CREATE OR REPLACE FUNCTION get_streak_leaderboard(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
    user_id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    current_streak INTEGER,
    longest_streak INTEGER,
    rank BIGINT,
    is_friend BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.username,
        p.display_name,
        p.avatar_url,
        up.current_streak,
        up.longest_streak,
        ROW_NUMBER() OVER (ORDER BY up.current_streak DESC, up.longest_streak DESC) AS rank,
        EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
            AND (
                (f.user1_id = p_user_id AND f.user2_id = p.id)
                OR
                (f.user2_id = p_user_id AND f.user1_id = p.id)
            )
        ) AS is_friend
    FROM public.profiles p
    INNER JOIN public.user_progress up ON p.id = up.user_id
    WHERE up.current_streak > 0
    AND (
        p.id = p_user_id
        OR EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
            AND (
                (f.user1_id = p_user_id AND f.user2_id = p.id)
                OR
                (f.user2_id = p_user_id AND f.user1_id = p.id)
            )
        )
    )
    ORDER BY up.current_streak DESC, up.longest_streak DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. USER SEARCH FUNCTION
-- ============================================

-- Function to search users by username (for adding friends)
CREATE OR REPLACE FUNCTION search_users_by_username(search_term TEXT)
RETURNS TABLE(
    id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.display_name,
        p.avatar_url
    FROM public.profiles p
    WHERE 
        (p.username ILIKE '%' || search_term || '%' OR
        p.display_name ILIKE '%' || search_term || '%')
        AND p.id != auth.uid() -- Exclude current user
    ORDER BY 
        CASE WHEN p.username = search_term THEN 1 ELSE 2 END,
        p.username
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION calculate_user_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_progress_after_session() TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_leaderboard(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_leaderboard(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_leaderboard(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_alltime_leaderboard(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_streak_leaderboard(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION search_users_by_username(TEXT) TO authenticated;

-- ============================================
-- 8. ENABLE REALTIME
-- ============================================

-- Enable realtime for friendships table
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_sessions;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- The friends and leaderboard system is now fully configured!
-- 
-- Features included:
-- 1. Friendships with pending/accepted/blocked status
-- 2. User progress tracking with daily/weekly/monthly/all-time stats
-- 3. Automatic progress updates via triggers
-- 4. Streak calculation
-- 5. Multiple leaderboard functions (daily, weekly, monthly, all-time, streak)
-- 6. User search functionality
-- 7. Row Level Security (RLS) policies
-- 8. Real-time subscriptions
-- 9. Proper indexes for performance
-- 10. Friend-only leaderboards (users only see themselves and their friends)
