-- ============================================
-- GLOBAL LEADERBOARD FUNCTIONS
-- ============================================
-- Functions to get global leaderboards (all users, not just friends)

-- Function to get global daily leaderboard
CREATE OR REPLACE FUNCTION get_global_daily_leaderboard(p_user_id UUID, p_limit INTEGER DEFAULT 50)
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
    ORDER BY up.daily_study_time DESC, up.daily_sessions DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get global weekly leaderboard
CREATE OR REPLACE FUNCTION get_global_weekly_leaderboard(p_user_id UUID, p_limit INTEGER DEFAULT 50)
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
    ORDER BY up.weekly_study_time DESC, up.weekly_sessions DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get global monthly leaderboard
CREATE OR REPLACE FUNCTION get_global_monthly_leaderboard(p_user_id UUID, p_limit INTEGER DEFAULT 50)
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
    ORDER BY up.monthly_study_time DESC, up.monthly_sessions DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get global all-time leaderboard
CREATE OR REPLACE FUNCTION get_global_alltime_leaderboard(p_user_id UUID, p_limit INTEGER DEFAULT 50)
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
    ORDER BY up.total_study_time DESC, up.total_sessions DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get global streak leaderboard
CREATE OR REPLACE FUNCTION get_global_streak_leaderboard(p_user_id UUID, p_limit INTEGER DEFAULT 50)
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
    ORDER BY up.current_streak DESC, up.longest_streak DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION get_global_daily_leaderboard(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_global_weekly_leaderboard(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_global_monthly_leaderboard(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_global_alltime_leaderboard(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_global_streak_leaderboard(UUID, INTEGER) TO authenticated;
