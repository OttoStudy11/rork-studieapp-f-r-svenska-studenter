-- Complete fix for friend stats system - ensures friend data is visible in battle/comparison screens

-- 1. Create or replace the get_friend_stats RPC function
CREATE OR REPLACE FUNCTION get_friend_stats(p_friend_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_profile RECORD;
  v_progress RECORD;
  v_level_data RECORD;
  v_session_count INT;
  v_achievement_count INT;
  v_courses JSON;
  v_recent_activity JSON;
BEGIN
  -- Get friend profile
  SELECT * INTO v_profile
  FROM profiles
  WHERE id = p_friend_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend profile not found';
  END IF;

  -- Get friend progress
  SELECT * INTO v_progress
  FROM user_progress
  WHERE user_id = p_friend_id;

  -- Get level data
  SELECT * INTO v_level_data
  FROM user_levels
  WHERE user_id = p_friend_id;

  -- Get session count
  SELECT COUNT(*) INTO v_session_count
  FROM pomodoro_sessions
  WHERE user_id = p_friend_id;

  -- Get achievement count
  SELECT COUNT(*) INTO v_achievement_count
  FROM user_achievements
  WHERE user_id = p_friend_id
  AND unlocked_at IS NOT NULL;

  -- Get active courses
  SELECT json_agg(
    json_build_object(
      'id', c.id,
      'name', c.name,
      'course_code', c.course_code
    )
  ) INTO v_courses
  FROM user_courses uc
  JOIN courses c ON c.id = uc.course_id
  WHERE uc.user_id = p_friend_id
  AND uc.is_active = true;

  -- Get recent activity (last 7 days)
  WITH recent_sessions AS (
    SELECT 
      COUNT(*) as sessions_this_week,
      COALESCE(SUM(duration), 0) as study_time_this_week,
      MAX(end_time) as last_session
    FROM pomodoro_sessions
    WHERE user_id = p_friend_id
    AND start_time >= CURRENT_DATE - INTERVAL '7 days'
  )
  SELECT json_build_object(
    'sessions_this_week', sessions_this_week,
    'study_time_this_week', study_time_this_week,
    'last_session', last_session
  ) INTO v_recent_activity
  FROM recent_sessions;

  -- Build complete result
  v_result := json_build_object(
    'profile', row_to_json(v_profile),
    'progress', row_to_json(v_progress),
    'level_data', row_to_json(v_level_data),
    'session_count', v_session_count,
    'achievement_count', v_achievement_count,
    'courses', COALESCE(v_courses, '[]'::json),
    'recent_activity', v_recent_activity
  );

  RETURN v_result;
END;
$$;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION get_friend_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_friend_stats(UUID) TO anon;

-- 3. Ensure user_levels table exists with proper columns
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  current_level INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);

-- 4. Create trigger to auto-create user_levels entry for new users
CREATE OR REPLACE FUNCTION create_user_level_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_levels (user_id, total_xp, current_level)
  VALUES (NEW.id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_create_user_level ON profiles;
CREATE TRIGGER auto_create_user_level
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_level_entry();

-- 5. Ensure all existing users have level entries
INSERT INTO user_levels (user_id, total_xp, current_level)
SELECT id, 0, 1
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_levels)
ON CONFLICT (user_id) DO NOTHING;

-- 6. Create function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  level INTEGER := 1;
  xp_threshold INTEGER;
BEGIN
  -- Level thresholds: 1->100, 2->250, 3->500, etc.
  -- Formula: level N requires 50 * N * (N + 1) XP
  LOOP
    xp_threshold := 50 * level * (level + 1);
    IF xp < xp_threshold THEN
      RETURN level;
    END IF;
    level := level + 1;
    IF level > 100 THEN -- Max level cap
      RETURN 100;
    END IF;
  END LOOP;
END;
$$;

-- 7. Update user_levels when XP changes in user_progress
CREATE OR REPLACE FUNCTION sync_user_level_from_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_level INTEGER;
BEGIN
  -- Calculate new level
  new_level := calculate_level_from_xp(NEW.total_xp);
  
  -- Update user_levels
  INSERT INTO user_levels (user_id, total_xp, current_level, updated_at)
  VALUES (NEW.user_id, NEW.total_xp, new_level, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_xp = NEW.total_xp,
    current_level = new_level,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_level_after_xp_update ON user_progress;
CREATE TRIGGER sync_level_after_xp_update
  AFTER INSERT OR UPDATE OF total_xp ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_level_from_progress();

-- 8. Sync existing XP to levels
INSERT INTO user_levels (user_id, total_xp, current_level)
SELECT 
  user_id, 
  COALESCE(total_xp, 0),
  calculate_level_from_xp(COALESCE(total_xp, 0))
FROM user_progress
ON CONFLICT (user_id)
DO UPDATE SET
  total_xp = EXCLUDED.total_xp,
  current_level = EXCLUDED.current_level,
  updated_at = NOW();

-- 9. Enable RLS on user_levels (but allow reads for friends)
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own level" ON user_levels;
CREATE POLICY "Users can view their own level"
  ON user_levels FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view friend levels" ON user_levels;
CREATE POLICY "Users can view friend levels"
  ON user_levels FOR SELECT
  USING (
    user_id IN (
      SELECT friend_id FROM friends WHERE user_id = auth.uid() AND status = 'accepted'
      UNION
      SELECT user_id FROM friends WHERE friend_id = auth.uid() AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Users can update their own level" ON user_levels;
CREATE POLICY "Users can update their own level"
  ON user_levels FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own level" ON user_levels;
CREATE POLICY "Users can insert their own level"
  ON user_levels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Success message
SELECT '✅ Friend stats system has been fixed! Friend data will now be visible in battle screens.' AS result;
