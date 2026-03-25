-- Fix points and leaderboard system to work correctly with achievements and levels
-- This ensures proper synchronization between timer points, achievements, and leaderboard

-- Ensure user_progress table has total_points column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_progress' 
        AND column_name = 'total_points'
    ) THEN
        ALTER TABLE public.user_progress ADD COLUMN total_points INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Create or replace function to calculate and update points based on study time
CREATE OR REPLACE FUNCTION calculate_user_points(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total_minutes INTEGER;
    v_calculated_points INTEGER;
BEGIN
    -- Get total study time from pomodoro_sessions
    SELECT COALESCE(SUM(duration), 0)
    INTO v_total_minutes
    FROM public.pomodoro_sessions
    WHERE user_id = p_user_id;
    
    -- Calculate points: 1 point per 5 minutes
    v_calculated_points := FLOOR(v_total_minutes / 5);
    
    RETURN v_calculated_points;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to sync points across the system
CREATE OR REPLACE FUNCTION sync_user_points()
RETURNS TRIGGER AS $$
DECLARE
    v_new_points INTEGER;
BEGIN
    -- Calculate new points based on study time
    v_new_points := calculate_user_points(NEW.user_id);
    
    -- Update user_progress with new points
    UPDATE public.user_progress
    SET total_points = v_new_points,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update points when pomodoro_sessions are added
DROP TRIGGER IF EXISTS sync_points_on_session_insert ON public.pomodoro_sessions;
CREATE TRIGGER sync_points_on_session_insert
    AFTER INSERT ON public.pomodoro_sessions
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_points();

-- Recalculate all user points based on their actual study time
UPDATE public.user_progress up
SET total_points = (
    SELECT FLOOR(COALESCE(SUM(ps.duration), 0) / 5)
    FROM public.pomodoro_sessions ps
    WHERE ps.user_id = up.user_id
),
updated_at = NOW();

-- Create a view for easy leaderboard queries
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    p.id as user_id,
    p.username,
    p.display_name,
    p.program,
    p.level,
    p.avatar_url,
    up.total_study_time,
    up.total_points,
    up.current_streak,
    up.longest_streak,
    up.total_sessions,
    COUNT(DISTINCT ps.id) as session_count,
    RANK() OVER (ORDER BY up.total_points DESC, up.total_study_time DESC) as global_rank
FROM public.profiles p
LEFT JOIN public.user_progress up ON p.id = up.user_id
LEFT JOIN public.pomodoro_sessions ps ON p.id = ps.user_id
GROUP BY 
    p.id, 
    p.username, 
    p.display_name, 
    p.program, 
    p.level, 
    p.avatar_url,
    up.total_study_time,
    up.total_points,
    up.current_streak,
    up.longest_streak,
    up.total_sessions
ORDER BY up.total_points DESC, up.total_study_time DESC;

-- Grant access to the view
GRANT SELECT ON leaderboard_view TO authenticated;

-- Create function to get friends leaderboard
CREATE OR REPLACE FUNCTION get_friends_leaderboard(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    display_name TEXT,
    program TEXT,
    level TEXT,
    avatar_url TEXT,
    total_study_time_hours INTEGER,
    total_points INTEGER,
    session_count BIGINT,
    position INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH friend_ids AS (
        -- Get all friends for the user (both directions)
        SELECT friend_id as id FROM public.friends WHERE user_id = p_user_id AND status = 'accepted'
        UNION
        SELECT user_id as id FROM public.friends WHERE friend_id = p_user_id AND status = 'accepted'
        UNION
        SELECT p_user_id -- Include the user themselves
    ),
    friend_stats AS (
        SELECT 
            p.id,
            p.username,
            p.display_name,
            p.program,
            p.level,
            p.avatar_url,
            FLOOR(COALESCE(up.total_study_time, 0) / 60) as study_hours,
            COALESCE(up.total_points, 0) as points,
            COUNT(DISTINCT ps.id) as sessions
        FROM public.profiles p
        INNER JOIN friend_ids fi ON p.id = fi.id
        LEFT JOIN public.user_progress up ON p.id = up.user_id
        LEFT JOIN public.pomodoro_sessions ps ON p.id = ps.user_id
        GROUP BY p.id, p.username, p.display_name, p.program, p.level, p.avatar_url, up.total_study_time, up.total_points
    )
    SELECT 
        fs.id as user_id,
        fs.username,
        fs.display_name,
        fs.program,
        fs.level,
        fs.avatar_url,
        fs.study_hours as total_study_time_hours,
        fs.points as total_points,
        fs.sessions as session_count,
        ROW_NUMBER() OVER (ORDER BY fs.study_hours DESC, fs.points DESC)::INTEGER as position
    FROM friend_stats fs
    ORDER BY fs.study_hours DESC, fs.points DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get global leaderboard (top N users)
CREATE OR REPLACE FUNCTION get_global_leaderboard(p_limit INTEGER DEFAULT 15)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    display_name TEXT,
    program TEXT,
    level TEXT,
    avatar_url TEXT,
    total_study_time_hours INTEGER,
    total_points INTEGER,
    session_count BIGINT,
    position INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT 
            p.id,
            p.username,
            p.display_name,
            p.program,
            p.level,
            p.avatar_url,
            FLOOR(COALESCE(up.total_study_time, 0) / 60) as study_hours,
            COALESCE(up.total_points, 0) as points,
            COUNT(DISTINCT ps.id) as sessions
        FROM public.profiles p
        LEFT JOIN public.user_progress up ON p.id = up.user_id
        LEFT JOIN public.pomodoro_sessions ps ON p.id = ps.user_id
        GROUP BY p.id, p.username, p.display_name, p.program, p.level, p.avatar_url, up.total_study_time, up.total_points
        ORDER BY study_hours DESC, points DESC
        LIMIT p_limit
    )
    SELECT 
        us.id as user_id,
        us.username,
        us.display_name,
        us.program,
        us.level,
        us.avatar_url,
        us.study_hours as total_study_time_hours,
        us.points as total_points,
        us.sessions as session_count,
        ROW_NUMBER() OVER (ORDER BY us.study_hours DESC, us.points DESC)::INTEGER as position
    FROM user_stats us;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_user_points TO authenticated;
GRANT EXECUTE ON FUNCTION get_friends_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_global_leaderboard TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION calculate_user_points IS 'Calculates total points for a user based on their study time (1 point per 5 minutes)';
COMMENT ON FUNCTION sync_user_points IS 'Automatically syncs user points when new study sessions are added';
COMMENT ON FUNCTION get_friends_leaderboard IS 'Returns leaderboard of friends for a given user, sorted by study time';
COMMENT ON FUNCTION get_global_leaderboard IS 'Returns global leaderboard (top N users), sorted by study time';
COMMENT ON VIEW leaderboard_view IS 'Unified view of all users with their stats for leaderboard queries';

-- Output summary
DO $$
BEGIN
    RAISE NOTICE '✅ Points and leaderboard system updated successfully!';
    RAISE NOTICE '📊 Points are now automatically calculated: 1 point per 5 minutes of study';
    RAISE NOTICE '🏆 Leaderboard functions are ready to use';
    RAISE NOTICE '💡 Run: SELECT * FROM leaderboard_view; to see all user rankings';
    RAISE NOTICE '👥 Run: SELECT * FROM get_friends_leaderboard(''your-user-id''); to see friends leaderboard';
    RAISE NOTICE '🌍 Run: SELECT * FROM get_global_leaderboard(15); to see top 15 global users';
END $$;
