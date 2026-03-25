-- Fix Friend Stats System
-- This script sets up proper RLS policies and creates helper functions
-- to allow users to view their friends' statistics

-- 1. First, ensure user_levels table exists
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100,
  level_progress_percent NUMERIC(5,2) DEFAULT 0,
  last_level_up TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_total_xp ON user_levels(total_xp DESC);

-- 3. Enable RLS on user_levels
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own level" ON user_levels;
DROP POLICY IF EXISTS "Users can view friend levels" ON user_levels;
DROP POLICY IF EXISTS "Users can update own level" ON user_levels;
DROP POLICY IF EXISTS "Users can insert own level" ON user_levels;

-- 5. Create RLS policies for user_levels
-- Users can view their own level
CREATE POLICY "Users can view own level" ON user_levels
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their friends' levels
CREATE POLICY "Users can view friend levels" ON user_levels
  FOR SELECT USING (
    user_id IN (
      SELECT friend_id FROM friends WHERE user_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT user_id FROM friends WHERE friend_id = auth.uid() AND status = 'accepted'
    )
  );

-- Users can update their own level
CREATE POLICY "Users can update own level" ON user_levels
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own level
CREATE POLICY "Users can insert own level" ON user_levels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Ensure user_progress has proper RLS policies for friend viewing
DROP POLICY IF EXISTS "Users can view friend progress" ON user_progress;

CREATE POLICY "Users can view friend progress" ON user_progress
  FOR SELECT USING (
    auth.uid() = user_id OR
    user_id IN (
      SELECT friend_id FROM friends WHERE user_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT user_id FROM friends WHERE friend_id = auth.uid() AND status = 'accepted'
    )
  );

-- 7. Ensure profiles has proper RLS policies for friend viewing
DROP POLICY IF EXISTS "Users can view friend profiles" ON profiles;

CREATE POLICY "Users can view friend profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR
    id IN (
      SELECT friend_id FROM friends WHERE user_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT user_id FROM friends WHERE friend_id = auth.uid() AND status = 'accepted'
    )
  );

-- 8. Ensure user_courses has proper RLS policies for friend viewing
DROP POLICY IF EXISTS "Users can view friend courses" ON user_courses;

CREATE POLICY "Users can view friend courses" ON user_courses
  FOR SELECT USING (
    auth.uid() = user_id OR
    user_id IN (
      SELECT friend_id FROM friends WHERE user_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT user_id FROM friends WHERE friend_id = auth.uid() AND status = 'accepted'
    )
  );

-- 9. Ensure pomodoro_sessions has proper RLS policies for friend viewing
DROP POLICY IF EXISTS "Users can view friend sessions" ON pomodoro_sessions;

CREATE POLICY "Users can view friend sessions" ON pomodoro_sessions
  FOR SELECT USING (
    auth.uid() = user_id OR
    user_id IN (
      SELECT friend_id FROM friends WHERE user_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT user_id FROM friends WHERE friend_id = auth.uid() AND status = 'accepted'
    )
  );

-- 10. Ensure user_achievements has proper RLS policies for friend viewing
DROP POLICY IF EXISTS "Users can view friend achievements" ON user_achievements;

CREATE POLICY "Users can view friend achievements" ON user_achievements
  FOR SELECT USING (
    auth.uid() = user_id OR
    user_id IN (
      SELECT friend_id FROM friends WHERE user_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT user_id FROM friends WHERE friend_id = auth.uid() AND status = 'accepted'
    )
  );

-- 11. Create function to get comprehensive friend stats
CREATE OR REPLACE FUNCTION get_friend_stats(p_friend_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_is_friend BOOLEAN;
BEGIN
  -- Check if the friend relationship exists
  SELECT EXISTS (
    SELECT 1 FROM friends 
    WHERE (user_id = auth.uid() AND friend_id = p_friend_id AND status = 'accepted')
    OR (friend_id = auth.uid() AND user_id = p_friend_id AND status = 'accepted')
  ) INTO v_is_friend;

  -- If not a friend, return null
  IF NOT v_is_friend THEN
    RETURN NULL;
  END IF;

  -- Get comprehensive stats
  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'id', p.id,
        'username', p.username,
        'display_name', p.display_name,
        'program', p.program,
        'level', p.level,
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
        'total_points', COALESCE(up.total_points, 0)
      )
      FROM user_progress up
      WHERE up.user_id = p_friend_id
    ),
    'courses', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', c.id,
          'name', c.name,
          'course_code', c.course_code,
          'subject', c.subject
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

-- 12. Create function to compare stats with a friend
CREATE OR REPLACE FUNCTION compare_with_friend(p_friend_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  v_user_id UUID;
  v_is_friend BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  -- Check if the friend relationship exists
  SELECT EXISTS (
    SELECT 1 FROM friends 
    WHERE (user_id = v_user_id AND friend_id = p_friend_id AND status = 'accepted')
    OR (friend_id = v_user_id AND user_id = p_friend_id AND status = 'accepted')
  ) INTO v_is_friend;

  IF NOT v_is_friend THEN
    RETURN NULL;
  END IF;

  SELECT json_build_object(
    'your_stats', json_build_object(
      'total_study_time', COALESCE((SELECT total_study_time FROM user_progress WHERE user_id = v_user_id), 0),
      'current_streak', COALESCE((SELECT current_streak FROM user_progress WHERE user_id = v_user_id), 0),
      'total_xp', COALESCE((SELECT total_xp FROM user_levels WHERE user_id = v_user_id), 0),
      'current_level', COALESCE((SELECT current_level FROM user_levels WHERE user_id = v_user_id), 1),
      'session_count', (SELECT COUNT(*) FROM pomodoro_sessions WHERE user_id = v_user_id),
      'course_count', (SELECT COUNT(*) FROM user_courses WHERE user_id = v_user_id AND is_active = true),
      'achievement_count', (SELECT COUNT(*) FROM user_achievements WHERE user_id = v_user_id AND unlocked_at IS NOT NULL)
    ),
    'friend_stats', json_build_object(
      'total_study_time', COALESCE((SELECT total_study_time FROM user_progress WHERE user_id = p_friend_id), 0),
      'current_streak', COALESCE((SELECT current_streak FROM user_progress WHERE user_id = p_friend_id), 0),
      'total_xp', COALESCE((SELECT total_xp FROM user_levels WHERE user_id = p_friend_id), 0),
      'current_level', COALESCE((SELECT current_level FROM user_levels WHERE user_id = p_friend_id), 1),
      'session_count', (SELECT COUNT(*) FROM pomodoro_sessions WHERE user_id = p_friend_id),
      'course_count', (SELECT COUNT(*) FROM user_courses WHERE user_id = p_friend_id AND is_active = true),
      'achievement_count', (SELECT COUNT(*) FROM user_achievements WHERE user_id = p_friend_id AND unlocked_at IS NOT NULL)
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- 13. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_friend_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION compare_with_friend(UUID) TO authenticated;

-- 14. Create trigger to auto-create user_levels entry when profile is created
CREATE OR REPLACE FUNCTION create_user_level_on_profile_create()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_levels (user_id, current_level, total_xp)
  VALUES (NEW.id, 1, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_user_level_trigger ON profiles;
CREATE TRIGGER create_user_level_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_level_on_profile_create();

-- 15. Backfill user_levels for existing profiles
INSERT INTO user_levels (user_id, current_level, total_xp)
SELECT id, 1, COALESCE((SELECT total_xp FROM user_progress WHERE user_id = profiles.id), 0)
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_levels)
ON CONFLICT (user_id) DO NOTHING;

-- 16. Update user_levels from user_progress where total_xp exists
UPDATE user_levels ul
SET total_xp = COALESCE(up.total_xp, ul.total_xp)
FROM user_progress up
WHERE ul.user_id = up.user_id
AND up.total_xp IS NOT NULL
AND up.total_xp > ul.total_xp;

COMMENT ON FUNCTION get_friend_stats IS 'Get comprehensive statistics for a friend including profile, level, progress, courses, and achievements';
COMMENT ON FUNCTION compare_with_friend IS 'Compare your statistics with a friend for the battle/comparison feature';
