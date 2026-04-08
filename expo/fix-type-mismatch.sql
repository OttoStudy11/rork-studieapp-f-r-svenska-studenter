-- Fix 1: Ensure achievements.id is UUID type (cast if it's text)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'achievements' AND column_name = 'id' 
    AND data_type = 'text'
  ) THEN
    -- Add a temp UUID column, populate, swap, drop
    ALTER TABLE achievements ADD COLUMN IF NOT EXISTS id_uuid UUID;
    UPDATE achievements SET id_uuid = gen_random_uuid() WHERE id_uuid IS NULL;
    ALTER TABLE achievements ALTER COLUMN id_uuid SET NOT NULL;
    ALTER TABLE achievements DROP COLUMN IF EXISTS id;
    ALTER TABLE achievements RENAME COLUMN id_uuid TO id;
    ALTER TABLE achievements ADD PRIMARY KEY (id);
    RAISE NOTICE 'achievements.id converted from text to uuid';
  ELSE
    RAISE NOTICE 'achievements.id is already uuid, no change needed';
  END IF;
END $$;

-- Fix 2: Fix point_transactions CHECK constraint to include 'study_session'
ALTER TABLE point_transactions DROP CONSTRAINT IF EXISTS point_transactions_source_type_check;
ALTER TABLE point_transactions ADD CONSTRAINT point_transactions_source_type_check 
  CHECK (source_type IN (
    'lesson_complete', 'quiz_complete', 'daily_streak', 'challenge_complete',
    'achievement_unlock', 'level_up_bonus', 'course_complete', 'off_peak_bonus',
    'first_achievement', 'manual', 'penalty', 'study_session'
  ));

-- Fix 3: Drop and recreate check_user_achievements with explicit casts
DROP FUNCTION IF EXISTS public.check_user_achievements(UUID);

CREATE OR REPLACE FUNCTION public.check_user_achievements(p_user_id UUID)
RETURNS TABLE(
  achievement_id UUID,
  achievement_key TEXT,
  title TEXT,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER,
  achievements JSONB
) AS $$
DECLARE
  v_total_study_time INTEGER;
  v_total_sessions INTEGER;
  v_current_streak INTEGER;
  v_friend_count INTEGER;
  v_course_count INTEGER;
  v_achievement RECORD;
  v_current_progress INTEGER;
BEGIN
  SELECT 
    COALESCE(up.total_study_time, 0),
    COALESCE(up.total_sessions, 0),
    COALESCE(up.current_streak, 0)
  INTO v_total_study_time, v_total_sessions, v_current_streak
  FROM user_progress up
  WHERE up.user_id = p_user_id;

  IF v_total_study_time IS NULL OR v_total_study_time = 0 THEN
    SELECT 
      COALESCE(SUM(ps.duration), 0),
      COUNT(ps.id)
    INTO v_total_study_time, v_total_sessions
    FROM pomodoro_sessions ps
    WHERE ps.user_id = p_user_id;
  END IF;

  SELECT COUNT(*) INTO v_friend_count
  FROM friends f
  WHERE (f.user_id = p_user_id OR f.friend_id = p_user_id)
    AND f.status = 'accepted';

  SELECT COUNT(*) INTO v_course_count
  FROM user_courses uc
  WHERE uc.user_id = p_user_id;

  INSERT INTO user_achievements (user_id, achievement_id, progress)
  SELECT p_user_id, a.id, 0
  FROM achievements a
  WHERE NOT EXISTS (
    SELECT 1 FROM user_achievements ua
    WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
  );

  FOR v_achievement IN 
    SELECT a.* FROM achievements a
    JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = p_user_id
    WHERE ua.unlocked_at IS NULL
  LOOP
    CASE v_achievement.requirement_type
      WHEN 'study_time' THEN v_current_progress := v_total_study_time;
      WHEN 'sessions' THEN v_current_progress := v_total_sessions;
      WHEN 'streak' THEN v_current_progress := v_current_streak;
      WHEN 'friends' THEN v_current_progress := v_friend_count;
      WHEN 'courses' THEN v_current_progress := v_course_count;
      ELSE v_current_progress := 0;
    END CASE;

    UPDATE user_achievements ua
    SET progress = v_current_progress, updated_at = NOW()
    WHERE ua.user_id = p_user_id AND ua.achievement_id = v_achievement.id;

    IF v_current_progress >= v_achievement.requirement_target THEN
      UPDATE user_achievements ua
      SET unlocked_at = NOW(), progress = v_current_progress, updated_at = NOW()
      WHERE ua.user_id = p_user_id AND ua.achievement_id = v_achievement.id;

      UPDATE user_progress
      SET total_points = total_points + COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25),
          total_xp = total_xp + COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25),
          updated_at = NOW()
      WHERE user_progress.user_id = p_user_id;

      UPDATE user_levels
      SET total_xp = total_xp + COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25),
          updated_at = NOW()
      WHERE user_levels.user_id = p_user_id;

      -- Explicit cast v_achievement.id to UUID
      RETURN QUERY SELECT 
        v_achievement.id::UUID,
        v_achievement.achievement_key::TEXT,
        v_achievement.title::TEXT,
        v_achievement.description::TEXT,
        v_achievement.icon::TEXT,
        COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25)::INTEGER,
        jsonb_build_object(
          'id', v_achievement.id::TEXT,
          'title', v_achievement.title::TEXT,
          'description', v_achievement.description::TEXT,
          'icon', v_achievement.icon::TEXT,
          'xp_reward', COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25)::INTEGER,
          'category', v_achievement.category::TEXT,
          'rarity', v_achievement.rarity::TEXT
        );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_user_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_achievements(UUID) TO anon;
