-- ============================================================
-- FIX LEADERBOARD: Sync user_progress from pomodoro_sessions
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: One-time sync - populate total_study_time from pomodoro_sessions
INSERT INTO user_progress (user_id, total_study_time, total_sessions, updated_at)
SELECT 
  user_id,
  COALESCE(SUM(duration), 0)::integer AS total_study_time,
  COUNT(*)::integer AS total_sessions,
  NOW() AS updated_at
FROM pomodoro_sessions
WHERE user_id IS NOT NULL
GROUP BY user_id
ON CONFLICT (user_id) DO UPDATE
SET 
  total_study_time = GREATEST(
    COALESCE(user_progress.total_study_time, 0),
    COALESCE(EXCLUDED.total_study_time, 0)
  ),
  total_sessions = GREATEST(
    COALESCE(user_progress.total_sessions, 0),
    COALESCE(EXCLUDED.total_sessions, 0)
  ),
  updated_at = NOW();

-- Step 2: Create a function to sync a single user's study time
CREATE OR REPLACE FUNCTION sync_user_study_time(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_total_minutes INTEGER;
  v_total_sessions INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(duration), 0)::integer,
    COUNT(*)::integer
  INTO v_total_minutes, v_total_sessions
  FROM pomodoro_sessions
  WHERE user_id = p_user_id;

  INSERT INTO user_progress (user_id, total_study_time, total_sessions, updated_at)
  VALUES (p_user_id, v_total_minutes, v_total_sessions, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_study_time = GREATEST(
      COALESCE(user_progress.total_study_time, 0),
      EXCLUDED.total_study_time
    ),
    total_sessions = EXCLUDED.total_sessions,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger function to auto-sync on session changes
CREATE OR REPLACE FUNCTION trigger_sync_user_study_time()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM sync_user_study_time(OLD.user_id);
    RETURN OLD;
  ELSE
    PERFORM sync_user_study_time(NEW.user_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Attach trigger to pomodoro_sessions (drop first if exists)
DROP TRIGGER IF EXISTS trg_sync_study_time ON pomodoro_sessions;
CREATE TRIGGER trg_sync_study_time
  AFTER INSERT OR UPDATE OR DELETE ON pomodoro_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_user_study_time();

-- Step 5: Ensure user_progress has a foreign key to profiles for the join query
-- (Skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_progress_user_id_fkey'
    AND table_name = 'user_progress'
  ) THEN
    ALTER TABLE user_progress 
    ADD CONSTRAINT user_progress_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION sync_user_study_time(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_user_study_time(UUID) TO service_role;

-- Verify: Check how many users have study time
SELECT 
  COUNT(*) AS users_with_study_time,
  SUM(total_study_time) AS total_minutes_across_all_users,
  MAX(total_study_time) AS max_single_user_minutes
FROM user_progress
WHERE total_study_time > 0;
