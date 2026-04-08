-- =============================================================
-- COMPLETE FIX: Achievement ID type mismatches
-- Handles ALL possible states of achievements.id and 
-- user_achievements.achievement_id (TEXT or UUID)
-- =============================================================

DO $$
DECLARE
  v_achievements_id_type TEXT;
  v_ua_achievement_id_type TEXT;
BEGIN
  -- =========================================================
  -- STEP 1: Detect current column types
  -- =========================================================
  SELECT data_type INTO v_achievements_id_type
  FROM information_schema.columns
  WHERE table_name = 'achievements' AND column_name = 'id';

  SELECT data_type INTO v_ua_achievement_id_type
  FROM information_schema.columns
  WHERE table_name = 'user_achievements' AND column_name = 'achievement_id';

  RAISE NOTICE 'achievements.id type: %', v_achievements_id_type;
  RAISE NOTICE 'user_achievements.achievement_id type: %', v_ua_achievement_id_type;

  -- =========================================================
  -- STEP 2: Drop ALL constraints that reference achievements
  -- =========================================================
  ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_achievement_id_fkey;
  ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_achievement_id_key;
  
  -- Drop primary key on achievements if it exists (we'll recreate it)
  -- Can't drop PK directly if it's the default name, so use DO block
  BEGIN
    ALTER TABLE achievements DROP CONSTRAINT IF EXISTS achievements_pkey;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not drop achievements_pkey: %', SQLERRM;
  END;

  -- =========================================================
  -- STEP 3: Fix achievements.id if it's TEXT
  -- =========================================================
  IF v_achievements_id_type = 'text' OR v_achievements_id_type = 'character varying' THEN
    RAISE NOTICE 'Converting achievements.id from TEXT to UUID...';

    -- Drop temp column if it exists from a previous failed attempt
    ALTER TABLE achievements DROP COLUMN IF EXISTS id_new;

    -- Add new UUID column
    ALTER TABLE achievements ADD COLUMN id_new UUID DEFAULT gen_random_uuid();
    
    -- Try to cast existing text IDs that are already valid UUIDs
    UPDATE achievements 
    SET id_new = id::UUID 
    WHERE id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
    
    -- For non-UUID text IDs, generate new UUIDs (they already have defaults)
    UPDATE achievements SET id_new = gen_random_uuid() WHERE id_new IS NULL;
    
    -- Make NOT NULL
    ALTER TABLE achievements ALTER COLUMN id_new SET NOT NULL;

    -- Now fix user_achievements to point to the new UUIDs
    -- Drop temp column if exists from previous attempt
    ALTER TABLE user_achievements DROP COLUMN IF EXISTS achievement_id_new;
    ALTER TABLE user_achievements ADD COLUMN achievement_id_new UUID;

    -- If user_achievements.achievement_id is UUID type, cast directly
    IF v_ua_achievement_id_type = 'uuid' THEN
      -- Try to match by the old UUID values
      UPDATE user_achievements ua
      SET achievement_id_new = a.id_new
      FROM achievements a
      WHERE ua.achievement_id = a.id::UUID;
    ELSE
      -- achievement_id is TEXT
      -- First try: direct UUID cast for text values that look like UUIDs
      UPDATE user_achievements ua
      SET achievement_id_new = ua.achievement_id::UUID
      FROM achievements a
      WHERE ua.achievement_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      AND ua.achievement_id = a.id
      AND a.id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

      -- Second try: match by achievement_key for text IDs that are keys
      UPDATE user_achievements ua
      SET achievement_id_new = a.id_new
      FROM achievements a
      WHERE ua.achievement_id_new IS NULL
      AND ua.achievement_id IS NOT NULL
      AND ua.achievement_id = a.achievement_key;

      -- Third try: match old text id to achievements.id (text) then get id_new
      UPDATE user_achievements ua
      SET achievement_id_new = a.id_new
      FROM achievements a
      WHERE ua.achievement_id_new IS NULL
      AND ua.achievement_id IS NOT NULL
      AND ua.achievement_id = a.id;
    END IF;

    -- Delete orphaned user_achievements that couldn't be mapped
    DELETE FROM user_achievements WHERE achievement_id_new IS NULL;

    -- Now swap columns on achievements
    ALTER TABLE achievements DROP COLUMN id;
    ALTER TABLE achievements RENAME COLUMN id_new TO id;
    ALTER TABLE achievements ADD PRIMARY KEY (id);
    ALTER TABLE achievements ALTER COLUMN id SET DEFAULT gen_random_uuid();

    -- Swap columns on user_achievements
    ALTER TABLE user_achievements DROP COLUMN achievement_id;
    ALTER TABLE user_achievements RENAME COLUMN achievement_id_new TO achievement_id;
    ALTER TABLE user_achievements ALTER COLUMN achievement_id SET NOT NULL;

    RAISE NOTICE 'achievements.id converted to UUID';
    RAISE NOTICE 'user_achievements.achievement_id converted to UUID';

  ELSE
    RAISE NOTICE 'achievements.id is already UUID';
    
    -- Still need to ensure achievements has a PK
    BEGIN
      ALTER TABLE achievements ADD PRIMARY KEY (id);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'PK already exists on achievements: %', SQLERRM;
    END;

    -- Fix user_achievements.achievement_id if it's TEXT but achievements.id is UUID
    IF v_ua_achievement_id_type = 'text' OR v_ua_achievement_id_type = 'character varying' THEN
      RAISE NOTICE 'Converting user_achievements.achievement_id from TEXT to UUID...';

      ALTER TABLE user_achievements DROP COLUMN IF EXISTS achievement_id_new;
      ALTER TABLE user_achievements ADD COLUMN achievement_id_new UUID;

      -- Try direct UUID cast
      UPDATE user_achievements 
      SET achievement_id_new = achievement_id::UUID
      WHERE achievement_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

      -- Try matching by achievement_key
      UPDATE user_achievements ua
      SET achievement_id_new = a.id
      FROM achievements a
      WHERE ua.achievement_id_new IS NULL
      AND ua.achievement_id IS NOT NULL
      AND ua.achievement_id = a.achievement_key;

      -- Delete orphans
      DELETE FROM user_achievements WHERE achievement_id_new IS NULL;

      -- Swap
      ALTER TABLE user_achievements DROP COLUMN achievement_id;
      ALTER TABLE user_achievements RENAME COLUMN achievement_id_new TO achievement_id;
      ALTER TABLE user_achievements ALTER COLUMN achievement_id SET NOT NULL;

      RAISE NOTICE 'user_achievements.achievement_id converted to UUID';
    ELSE
      RAISE NOTICE 'user_achievements.achievement_id is already UUID';
    END IF;
  END IF;

  -- =========================================================
  -- STEP 4: Recreate unique constraint and FK
  -- =========================================================
  BEGIN
    ALTER TABLE user_achievements 
      ADD CONSTRAINT user_achievements_user_id_achievement_id_key 
      UNIQUE (user_id, achievement_id);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Unique constraint already exists: %', SQLERRM;
  END;

  BEGIN
    ALTER TABLE user_achievements
      ADD CONSTRAINT user_achievements_achievement_id_fkey
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FK constraint already exists: %', SQLERRM;
  END;

  RAISE NOTICE 'All achievement type fixes applied successfully!';
END $$;

-- =========================================================
-- STEP 5: Ensure achievements.id default is gen_random_uuid()
-- =========================================================
ALTER TABLE achievements ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- =========================================================
-- STEP 6: Re-insert achievement data (safe upsert)
-- =========================================================
INSERT INTO achievements (achievement_key, title, description, icon, category, requirement_type, requirement_target, requirement_timeframe, reward_points, reward_badge, rarity, xp_reward, is_hidden, sort_order) VALUES
  ('first_lesson', 'Första Lektionen', 'Slutför din första studiesession', '📚', 'study', 'sessions', 1, 'total', 25, '📚', 'common', 25, false, 1),
  ('five_lessons', 'Fem Sessioner', 'Slutför 5 studiesessioner', '📖', 'study', 'sessions', 5, 'total', 50, '📖', 'common', 50, false, 2),
  ('ten_lessons', 'Tio Sessioner', 'Slutför 10 studiesessioner', '🎯', 'study', 'sessions', 10, 'total', 75, '🎯', 'uncommon', 75, false, 3),
  ('twenty_five_lessons', 'Tjugofem Sessioner', 'Slutför 25 studiesessioner', '🌟', 'study', 'sessions', 25, 'total', 150, '🌟', 'uncommon', 150, false, 4),
  ('fifty_lessons', 'Femtio Sessioner', 'Slutför 50 studiesessioner', '💎', 'study', 'sessions', 50, 'total', 250, '💎', 'rare', 250, false, 5),
  ('hundred_lessons', 'Hundra Sessioner', 'Slutför 100 studiesessioner', '👑', 'study', 'sessions', 100, 'total', 500, '👑', 'epic', 500, false, 6),
  ('first_hour', 'Första Timmen', 'Studera i totalt 60 minuter', '⏱️', 'study', 'study_time', 60, 'total', 50, '⏱️', 'common', 50, false, 10),
  ('five_hours', 'Fem Timmar', 'Studera i totalt 5 timmar', '⏰', 'study', 'study_time', 300, 'total', 100, '⏰', 'uncommon', 100, false, 11),
  ('ten_hours', 'Tio Timmar', 'Studera i totalt 10 timmar', '🕐', 'study', 'study_time', 600, 'total', 200, '🕐', 'rare', 200, false, 12),
  ('twenty_five_hours', 'Tjugofem Timmar', 'Studera i totalt 25 timmar', '🔥', 'study', 'study_time', 1500, 'total', 400, '🔥', 'epic', 400, false, 13),
  ('fifty_hours', 'Femtio Timmar', 'Studera i totalt 50 timmar', '🏆', 'study', 'study_time', 3000, 'total', 750, '🏆', 'legendary', 750, false, 14),
  ('streak_3', 'Tre Dagars Streak', 'Håll en 3 dagars studiestreak', '🔥', 'streak', 'streak', 3, 'total', 50, '🔥', 'common', 50, false, 20),
  ('streak_7', 'Veckostreak', 'Håll en 7 dagars studiestreak', '📅', 'streak', 'streak', 7, 'total', 100, '📅', 'uncommon', 100, false, 21),
  ('streak_14', 'Två Veckor', 'Håll en 14 dagars studiestreak', '🗓️', 'streak', 'streak', 14, 'total', 200, '🗓️', 'rare', 200, false, 22),
  ('streak_30', 'Månadsstreak', 'Håll en 30 dagars studiestreak', '📆', 'streak', 'streak', 30, 'total', 400, '📆', 'epic', 400, false, 23),
  ('streak_100', 'Legendstreak', 'Håll en 100 dagars studiestreak', '👑', 'streak', 'streak', 100, 'total', 1000, '👑', 'legendary', 1000, false, 24),
  ('first_friend', 'Första Vännen', 'Lägg till din första vän', '👋', 'social', 'friends', 1, 'total', 50, '👋', 'common', 50, false, 40),
  ('five_friends', 'Fem Vänner', 'Lägg till 5 vänner', '👥', 'social', 'friends', 5, 'total', 100, '👥', 'uncommon', 100, false, 41),
  ('ten_friends', 'Tio Vänner', 'Lägg till 10 vänner', '🤝', 'social', 'friends', 10, 'total', 200, '🤝', 'rare', 200, false, 42),
  ('first_course', 'Första Kursen', 'Lägg till din första kurs', '📕', 'study', 'courses', 1, 'total', 25, '📕', 'common', 25, false, 50),
  ('three_courses', 'Tre Kurser', 'Lägg till 3 kurser', '📗', 'study', 'courses', 3, 'total', 75, '📗', 'uncommon', 75, false, 51),
  ('five_courses', 'Fem Kurser', 'Lägg till 5 kurser', '📘', 'study', 'courses', 5, 'total', 150, '📘', 'rare', 150, false, 52)
ON CONFLICT (achievement_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  requirement_type = EXCLUDED.requirement_type,
  requirement_target = EXCLUDED.requirement_target,
  requirement_timeframe = EXCLUDED.requirement_timeframe,
  reward_points = EXCLUDED.reward_points,
  reward_badge = EXCLUDED.reward_badge,
  rarity = EXCLUDED.rarity,
  xp_reward = EXCLUDED.xp_reward,
  is_hidden = EXCLUDED.is_hidden,
  sort_order = EXCLUDED.sort_order;

-- =========================================================
-- STEP 7: Recreate check_user_achievements function
-- =========================================================
DROP FUNCTION IF EXISTS check_user_achievements(UUID);

CREATE OR REPLACE FUNCTION check_user_achievements(p_user_id UUID)
RETURNS TABLE(
  achievement_id UUID,
  achievement_key TEXT,
  title TEXT,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER,
  achievements JSONB
) AS $fn$
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

      RETURN QUERY SELECT 
        v_achievement.id,
        v_achievement.achievement_key,
        v_achievement.title,
        v_achievement.description,
        v_achievement.icon,
        COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25)::INTEGER,
        jsonb_build_object(
          'id', v_achievement.id,
          'title', v_achievement.title,
          'description', v_achievement.description,
          'icon', v_achievement.icon,
          'xp_reward', COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25),
          'category', v_achievement.category,
          'rarity', v_achievement.rarity
        );
    END IF;
  END LOOP;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER;
