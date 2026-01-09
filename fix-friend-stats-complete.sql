-- Fix Friend Stats to show complete data in battle function
-- This ensures all friend stats are properly calculated and returned

-- 1. Update get_friend_stats function to return complete and accurate data
CREATE OR REPLACE FUNCTION get_friend_stats(p_friend_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_is_friend BOOLEAN;
  v_requester_id UUID;
BEGIN
  v_requester_id := auth.uid();
  
  -- Check if the friend relationship exists (bidirectional check)
  SELECT EXISTS (
    SELECT 1 FROM friends 
    WHERE (user_id = v_requester_id AND friend_id = p_friend_id AND status = 'accepted')
    OR (friend_id = v_requester_id AND user_id = p_friend_id AND status = 'accepted')
  ) INTO v_is_friend;

  -- If not a friend, return null
  IF NOT v_is_friend THEN
    RAISE NOTICE 'User % is not friends with %', v_requester_id, p_friend_id;
    RETURN NULL;
  END IF;

  -- Get comprehensive stats with proper null handling
  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'id', p.id,
        'username', p.username,
        'display_name', p.display_name,
        'program', COALESCE(p.program, ''),
        'level', COALESCE(p.level, 'gymnasie'),
        'gymnasium_grade', p.gymnasium_grade,
        'avatar_url', p.avatar_url,
        'created_at', p.created_at
      )
      FROM profiles p
      WHERE p.id = p_friend_id
    ),
    'level_data', (
      SELECT json_build_object(
        'current_level', COALESCE(ul.current_level, 1),
        'total_xp', COALESCE(ul.total_xp, 0),
        'xp_to_next_level', COALESCE(ul.xp_to_next_level, 100),
        'level_progress_percent', COALESCE(ul.level_progress_percent, 0)
      )
      FROM user_levels ul
      WHERE ul.user_id = p_friend_id
    ),
    'progress', (
      SELECT json_build_object(
        'total_study_time', COALESCE(up.total_study_time, 0),
        'current_streak', COALESCE(up.current_streak, 0),
        'longest_streak', COALESCE(up.longest_streak, up.current_streak, 0),
        'total_sessions', COALESCE(up.total_sessions, 0),
        'total_points', COALESCE(up.total_points, 0),
        'last_study_date', up.last_study_date
      )
      FROM user_progress up
      WHERE up.user_id = p_friend_id
    ),
    'courses', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', c.id,
          'name', COALESCE(c.name, c.title),
          'course_code', c.course_code,
          'subject', COALESCE(c.subject, 'Allmän')
        )
      ), '[]'::json)
      FROM user_courses uc
      JOIN courses c ON c.id = uc.course_id
      WHERE uc.user_id = p_friend_id AND uc.is_active = true
    ),
    'achievement_count', (
      SELECT COUNT(*)::integer
      FROM user_achievements ua
      WHERE ua.user_id = p_friend_id AND ua.unlocked_at IS NOT NULL
    ),
    'session_count', (
      SELECT COUNT(*)::integer
      FROM pomodoro_sessions ps
      WHERE ps.user_id = p_friend_id
    ),
    'recent_activity', (
      SELECT json_build_object(
        'last_session', (
          SELECT ps.end_time
          FROM pomodoro_sessions ps
          WHERE ps.user_id = p_friend_id
          ORDER BY ps.end_time DESC
          LIMIT 1
        ),
        'sessions_this_week', (
          SELECT COUNT(*)::integer
          FROM pomodoro_sessions ps
          WHERE ps.user_id = p_friend_id
          AND ps.start_time >= (CURRENT_DATE - INTERVAL '7 days')
        ),
        'study_time_this_week', (
          SELECT COALESCE(SUM(ps.duration), 0)::integer
          FROM pomodoro_sessions ps
          WHERE ps.user_id = p_friend_id
          AND ps.start_time >= (CURRENT_DATE - INTERVAL '7 days')
        )
      )
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- 2. Ensure all users have entries in user_levels and user_progress
-- This prevents null data issues

-- Create user_levels entries for users without one
INSERT INTO user_levels (user_id, current_level, total_xp, xp_to_next_level)
SELECT 
  p.id,
  1,
  COALESCE(up.total_xp, 0),
  100
FROM profiles p
LEFT JOIN user_levels ul ON ul.user_id = p.id
LEFT JOIN user_progress up ON up.user_id = p.id
WHERE ul.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Create user_progress entries for users without one
INSERT INTO user_progress (
  user_id,
  total_study_time,
  total_sessions,
  current_streak,
  longest_streak,
  total_points
)
SELECT 
  p.id,
  0,
  0,
  0,
  0,
  0
FROM profiles p
LEFT JOIN user_progress up ON up.user_id = p.id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3. Sync total_xp from user_progress to user_levels for consistency
UPDATE user_levels ul
SET 
  total_xp = COALESCE(up.total_xp, ul.total_xp, 0),
  updated_at = NOW()
FROM user_progress up
WHERE ul.user_id = up.user_id
AND up.total_xp IS NOT NULL
AND up.total_xp != ul.total_xp;

-- 4. Recalculate total_study_time and total_sessions from pomodoro_sessions
-- to ensure accuracy
UPDATE user_progress up
SET 
  total_study_time = (
    SELECT COALESCE(SUM(ps.duration), 0)
    FROM pomodoro_sessions ps
    WHERE ps.user_id = up.user_id
  ),
  total_sessions = (
    SELECT COUNT(*)
    FROM pomodoro_sessions ps
    WHERE ps.user_id = up.user_id
  ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM pomodoro_sessions ps WHERE ps.user_id = up.user_id
);

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_friend_stats(UUID) TO authenticated;

-- 6. Output summary
DO $$
DECLARE
  v_users_with_levels INTEGER;
  v_users_with_progress INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_users_with_levels FROM user_levels;
  SELECT COUNT(*) INTO v_users_with_progress FROM user_progress;
  
  RAISE NOTICE '✅ Friend stats function updated successfully!';
  RAISE NOTICE '👥 % users have level data', v_users_with_levels;
  RAISE NOTICE '📊 % users have progress data', v_users_with_progress;
  RAISE NOTICE '🔍 All friend stats should now display correctly in battle function';
END $$;
