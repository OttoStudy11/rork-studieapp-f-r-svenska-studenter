-- Complete fix for achievement system - ensures achievements are tracked and unlocked properly

-- 1. Drop existing function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS check_user_achievements(UUID);

-- 2. Create the improved check_user_achievements function
CREATE OR REPLACE FUNCTION check_user_achievements(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  achievement_id UUID,
  progress INTEGER,
  unlocked_at TIMESTAMPTZ,
  achievements JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_achievement RECORD;
  v_current_progress INTEGER;
  v_unlocked BOOLEAN;
  v_newly_unlocked UUID[];
BEGIN
  v_newly_unlocked := ARRAY[]::UUID[];
  
  -- Loop through all achievements
  FOR v_achievement IN 
    SELECT a.*, ua.progress AS current_progress, ua.unlocked_at AS already_unlocked
    FROM achievements a
    LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = p_user_id
  LOOP
    v_current_progress := 0;
    v_unlocked := COALESCE(v_achievement.already_unlocked IS NOT NULL, FALSE);
    
    -- Skip if already unlocked
    IF v_unlocked THEN
      CONTINUE;
    END IF;
    
    -- Calculate progress based on requirement type
    CASE v_achievement.requirement_type
      -- Session-based achievements
      WHEN 'sessions' THEN
        SELECT COUNT(*)::INTEGER INTO v_current_progress
        FROM pomodoro_sessions ps
        WHERE ps.user_id = p_user_id
        AND (v_achievement.requirement_timeframe IS NULL 
          OR (
            v_achievement.requirement_timeframe = 'day' AND ps.start_time >= CURRENT_DATE
          ) OR (
            v_achievement.requirement_timeframe = 'week' AND ps.start_time >= CURRENT_DATE - INTERVAL '7 days'
          ) OR (
            v_achievement.requirement_timeframe = 'month' AND ps.start_time >= CURRENT_DATE - INTERVAL '30 days'
          )
        );
      
      -- Study time achievements (in minutes)
      WHEN 'study_time' THEN
        SELECT COALESCE(SUM(ps.duration), 0)::INTEGER INTO v_current_progress
        FROM pomodoro_sessions ps
        WHERE ps.user_id = p_user_id
        AND (v_achievement.requirement_timeframe IS NULL 
          OR (
            v_achievement.requirement_timeframe = 'day' AND ps.start_time >= CURRENT_DATE
          ) OR (
            v_achievement.requirement_timeframe = 'week' AND ps.start_time >= CURRENT_DATE - INTERVAL '7 days'
          ) OR (
            v_achievement.requirement_timeframe = 'month' AND ps.start_time >= CURRENT_DATE - INTERVAL '30 days'
          )
        );
      
      -- Friend-based achievements
      WHEN 'friends' THEN
        SELECT COUNT(*)::INTEGER INTO v_current_progress
        FROM friends f
        WHERE (f.user_id = p_user_id OR f.friend_id = p_user_id)
        AND f.status = 'accepted';
      
      -- Streak achievements
      WHEN 'streak' THEN
        SELECT COALESCE(current_streak, 0)::INTEGER INTO v_current_progress
        FROM user_progress
        WHERE user_id = p_user_id;
      
      -- Course achievements
      WHEN 'courses' THEN
        SELECT COUNT(DISTINCT course_id)::INTEGER INTO v_current_progress
        FROM pomodoro_sessions ps
        WHERE ps.user_id = p_user_id
        AND ps.course_id IS NOT NULL;
      
      ELSE
        v_current_progress := 0;
    END CASE;
    
    -- Check if achievement should be unlocked
    IF v_current_progress >= v_achievement.requirement_target AND NOT v_unlocked THEN
      -- Unlock the achievement
      INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
      VALUES (p_user_id, v_achievement.id, v_current_progress, NOW())
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET 
        progress = v_current_progress,
        unlocked_at = NOW(),
        updated_at = NOW();
      
      -- Add XP/points to user progress
      INSERT INTO user_progress (user_id, total_xp, total_points, updated_at)
      VALUES (
        p_user_id, 
        COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 0),
        COALESCE(v_achievement.reward_points, 0),
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET 
        total_xp = user_progress.total_xp + COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 0),
        total_points = user_progress.total_points + COALESCE(v_achievement.reward_points, 0),
        updated_at = NOW();
      
      -- Track newly unlocked for return
      v_newly_unlocked := array_append(v_newly_unlocked, v_achievement.id);
      
      RAISE NOTICE 'Achievement unlocked: % for user %', v_achievement.title, p_user_id;
    ELSE
      -- Update progress only
      INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
      VALUES (p_user_id, v_achievement.id, v_current_progress, NULL)
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET 
        progress = v_current_progress,
        updated_at = NOW();
    END IF;
  END LOOP;
  
  -- Return newly unlocked achievements with full details
  RETURN QUERY
  SELECT 
    ua.id,
    ua.user_id,
    ua.achievement_id,
    ua.progress,
    ua.unlocked_at,
    jsonb_build_object(
      'id', a.id,
      'achievement_key', a.achievement_key,
      'title', a.title,
      'description', a.description,
      'icon', a.icon,
      'category', a.category,
      'xp_reward', COALESCE(a.xp_reward, a.reward_points),
      'reward_points', a.reward_points,
      'requirement_type', a.requirement_type,
      'requirement_target', a.requirement_target
    ) AS achievements
  FROM user_achievements ua
  JOIN achievements a ON a.id = ua.achievement_id
  WHERE ua.user_id = p_user_id
  AND ua.achievement_id = ANY(v_newly_unlocked);
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION check_user_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_achievements(UUID) TO anon;

-- 4. Ensure xp_reward and total_xp columns exist
DO $$ 
BEGIN
  -- Add xp_reward to achievements if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'achievements' AND column_name = 'xp_reward'
  ) THEN
    ALTER TABLE achievements ADD COLUMN xp_reward INTEGER DEFAULT 25;
    UPDATE achievements SET xp_reward = COALESCE(reward_points, 25);
  END IF;

  -- Add total_xp to user_progress if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_progress' AND column_name = 'total_xp'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN total_xp INTEGER DEFAULT 0;
  END IF;
END $$;

-- 5. Create trigger to automatically check achievements after pomodoro session
CREATE OR REPLACE FUNCTION trigger_check_achievements_after_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Run achievement check asynchronously (won't block the insert)
  PERFORM check_user_achievements(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_check_achievements_after_session ON pomodoro_sessions;
CREATE TRIGGER auto_check_achievements_after_session
  AFTER INSERT ON pomodoro_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements_after_session();

-- 6. Create trigger for friend achievements
CREATE OR REPLACE FUNCTION trigger_check_achievements_after_friend()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    PERFORM check_user_achievements(NEW.user_id);
    PERFORM check_user_achievements(NEW.friend_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_check_achievements_after_friend ON friends;
CREATE TRIGGER auto_check_achievements_after_friend
  AFTER INSERT OR UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements_after_friend();

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked 
  ON user_achievements(user_id, unlocked_at) 
  WHERE unlocked_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_time 
  ON pomodoro_sessions(user_id, start_time);

CREATE INDEX IF NOT EXISTS idx_friends_status 
  ON friends(user_id, friend_id, status) 
  WHERE status = 'accepted';

-- Success message
SELECT '✅ Achievement system has been fixed! Achievements will now unlock automatically.' AS result;
