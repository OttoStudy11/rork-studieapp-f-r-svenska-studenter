-- Fix pomodoro_sessions table structure to match app expectations
-- This ensures proper data storage and statistics tracking

-- Drop existing table if needed and recreate with correct structure
DROP TABLE IF EXISTS public.pomodoro_sessions CASCADE;

CREATE TABLE public.pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    duration INTEGER NOT NULL, -- Duration in minutes
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pomodoro_sessions
DROP POLICY IF EXISTS "Users can view own pomodoro sessions" ON public.pomodoro_sessions;
CREATE POLICY "Users can view own pomodoro sessions"
    ON public.pomodoro_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own pomodoro sessions" ON public.pomodoro_sessions;
CREATE POLICY "Users can create own pomodoro sessions"
    ON public.pomodoro_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pomodoro sessions" ON public.pomodoro_sessions;
CREATE POLICY "Users can update own pomodoro sessions"
    ON public.pomodoro_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own pomodoro sessions" ON public.pomodoro_sessions;
CREATE POLICY "Users can delete own pomodoro sessions"
    ON public.pomodoro_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_course_id ON public.pomodoro_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_end_time ON public.pomodoro_sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_end_time ON public.pomodoro_sessions(user_id, end_time DESC);

-- Create a function to calculate user statistics
CREATE OR REPLACE FUNCTION calculate_user_statistics(p_user_id UUID)
RETURNS TABLE (
    total_sessions BIGINT,
    total_minutes BIGINT,
    today_sessions BIGINT,
    today_minutes BIGINT,
    week_sessions BIGINT,
    week_minutes BIGINT,
    current_streak INTEGER,
    longest_streak INTEGER
) AS $$
DECLARE
    v_current_streak INTEGER := 0;
    v_longest_streak INTEGER := 0;
    v_temp_streak INTEGER := 0;
    v_last_date DATE;
    v_current_date DATE;
BEGIN
    -- Get total statistics
    SELECT 
        COUNT(*),
        COALESCE(SUM(duration), 0)
    INTO 
        total_sessions,
        total_minutes
    FROM public.pomodoro_sessions
    WHERE user_id = p_user_id;

    -- Get today's statistics
    SELECT 
        COUNT(*),
        COALESCE(SUM(duration), 0)
    INTO 
        today_sessions,
        today_minutes
    FROM public.pomodoro_sessions
    WHERE user_id = p_user_id
    AND DATE(end_time AT TIME ZONE 'UTC') = CURRENT_DATE;

    -- Get week statistics (last 7 days)
    SELECT 
        COUNT(*),
        COALESCE(SUM(duration), 0)
    INTO 
        week_sessions,
        week_minutes
    FROM public.pomodoro_sessions
    WHERE user_id = p_user_id
    AND end_time >= NOW() - INTERVAL '7 days';

    -- Calculate streaks
    v_last_date := NULL;
    v_current_streak := 0;
    v_longest_streak := 0;
    v_temp_streak := 0;

    FOR v_current_date IN (
        SELECT DISTINCT DATE(end_time AT TIME ZONE 'UTC') as session_date
        FROM public.pomodoro_sessions
        WHERE user_id = p_user_id
        ORDER BY session_date DESC
    ) LOOP
        IF v_last_date IS NULL THEN
            -- First date
            IF v_current_date = CURRENT_DATE THEN
                v_current_streak := 1;
                v_temp_streak := 1;
            END IF;
        ELSIF v_last_date - v_current_date = 1 THEN
            -- Consecutive day
            v_temp_streak := v_temp_streak + 1;
            IF v_last_date >= CURRENT_DATE - 1 THEN
                v_current_streak := v_temp_streak;
            END IF;
        ELSE
            -- Break in streak
            IF v_temp_streak > v_longest_streak THEN
                v_longest_streak := v_temp_streak;
            END IF;
            v_temp_streak := 1;
        END IF;
        
        v_last_date := v_current_date;
    END LOOP;

    -- Final check for longest streak
    IF v_temp_streak > v_longest_streak THEN
        v_longest_streak := v_temp_streak;
    END IF;

    current_streak := v_current_streak;
    longest_streak := v_longest_streak;

    RETURN QUERY SELECT 
        total_sessions,
        total_minutes,
        today_sessions,
        today_minutes,
        week_sessions,
        week_minutes,
        current_streak,
        longest_streak;
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy statistics access
CREATE OR REPLACE VIEW user_study_statistics AS
SELECT 
    p.id as user_id,
    COUNT(ps.id) as total_sessions,
    COALESCE(SUM(ps.duration), 0) as total_minutes,
    COUNT(ps.id) FILTER (WHERE DATE(ps.end_time AT TIME ZONE 'UTC') = CURRENT_DATE) as today_sessions,
    COALESCE(SUM(ps.duration) FILTER (WHERE DATE(ps.end_time AT TIME ZONE 'UTC') = CURRENT_DATE), 0) as today_minutes,
    COUNT(ps.id) FILTER (WHERE ps.end_time >= NOW() - INTERVAL '7 days') as week_sessions,
    COALESCE(SUM(ps.duration) FILTER (WHERE ps.end_time >= NOW() - INTERVAL '7 days'), 0) as week_minutes
FROM public.profiles p
LEFT JOIN public.pomodoro_sessions ps ON p.id = ps.user_id
GROUP BY p.id;

-- Grant permissions
GRANT SELECT ON user_study_statistics TO authenticated;

COMMENT ON TABLE public.pomodoro_sessions IS 'Stores completed pomodoro study sessions with duration in minutes';
COMMENT ON FUNCTION calculate_user_statistics IS 'Calculates comprehensive study statistics including streaks for a user';
COMMENT ON VIEW user_study_statistics IS 'Provides aggregated study statistics per user';
