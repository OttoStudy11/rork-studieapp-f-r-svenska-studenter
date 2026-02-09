-- Fix study time tracking: Ensure user_progress is automatically updated when pomodoro_sessions are created
-- This will make sure leaderboards and stats show correct data

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_progress_on_session ON pomodoro_sessions;
DROP FUNCTION IF EXISTS update_user_progress_from_session();

-- Create function to update user_progress when a pomodoro session is added
CREATE OR REPLACE FUNCTION update_user_progress_from_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user_progress with the new session data
  INSERT INTO user_progress (
    user_id,
    total_study_time,
    total_sessions,
    last_study_date,
    updated_at
  )
  VALUES (
    NEW.user_id,
    NEW.duration_minutes,
    1,
    CURRENT_DATE,
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_study_time = user_progress.total_study_time + NEW.duration_minutes,
    total_sessions = user_progress.total_sessions + 1,
    last_study_date = CURRENT_DATE,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after insert on pomodoro_sessions
CREATE TRIGGER update_user_progress_on_session
  AFTER INSERT ON pomodoro_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress_from_session();

-- Verify the trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'update_user_progress_on_session';

-- Backfill existing data (recalculate totals for all users)
INSERT INTO user_progress (
  user_id,
  total_study_time,
  total_sessions,
  last_study_date,
  updated_at
)
SELECT 
  user_id,
  COALESCE(SUM(duration_minutes), 0) as total_study_time,
  COUNT(*) as total_sessions,
  MAX(DATE(end_time)) as last_study_date,
  NOW() as updated_at
FROM pomodoro_sessions
GROUP BY user_id
ON CONFLICT (user_id) 
DO UPDATE SET
  total_study_time = EXCLUDED.total_study_time,
  total_sessions = EXCLUDED.total_sessions,
  last_study_date = EXCLUDED.last_study_date,
  updated_at = NOW();

-- Show results
SELECT 
  p.username,
  p.display_name,
  up.total_study_time,
  up.total_sessions,
  up.last_study_date
FROM user_progress up
JOIN profiles p ON p.id = up.user_id
ORDER BY up.total_study_time DESC
LIMIT 10;

COMMENT ON FUNCTION update_user_progress_from_session() IS 
  'Automatically updates user_progress table when a new pomodoro session is created';
COMMENT ON TRIGGER update_user_progress_on_session ON pomodoro_sessions IS 
  'Trigger that keeps user_progress in sync with pomodoro_sessions';
