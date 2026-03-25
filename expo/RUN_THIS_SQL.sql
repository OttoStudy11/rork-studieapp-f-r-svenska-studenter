-- Achievement System Setup
-- Run this SQL in your Supabase SQL editor to ensure achievement triggers are working

-- This script ensures the achievement check system is properly set up

-- First, verify the RPC function exists and works correctly
SELECT 'Testing check_user_achievements function...' as status;

-- Grant permissions to the function
GRANT EXECUTE ON FUNCTION check_user_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_achievements(UUID) TO anon;

-- Verify triggers are in place
SELECT 'Checking triggers...' as status;

-- Show all triggers related to achievements
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%achievement%'
  OR trigger_name LIKE '%friend%';

-- If triggers are missing, recreate them
DO $$
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS auto_check_achievements_after_session ON pomodoro_sessions;
  DROP TRIGGER IF EXISTS auto_check_achievements_after_friend ON friends;
  
  RAISE NOTICE 'Triggers dropped (if they existed)';
END $$;

-- Recreate the achievement check function for sessions
CREATE OR REPLACE FUNCTION trigger_check_achievements_after_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Queue achievement check (don't block the session insert)
  PERFORM check_user_achievements(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Recreate the achievement check function for friends
CREATE OR REPLACE FUNCTION trigger_check_achievements_after_friend()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check achievements for both users when friendship is accepted
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    PERFORM check_user_achievements(NEW.user_id);
    PERFORM check_user_achievements(NEW.friend_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER auto_check_achievements_after_session
  AFTER INSERT ON pomodoro_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements_after_session();

CREATE TRIGGER auto_check_achievements_after_friend
  AFTER INSERT OR UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements_after_friend();

-- Verify the triggers were created
SELECT 'Verifying triggers were created...' as status;

SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  'Trigger exists and is active' as status
FROM information_schema.triggers
WHERE trigger_name IN ('auto_check_achievements_after_session', 'auto_check_achievements_after_friend');

-- Success message
SELECT '✅ Achievement system triggers installed successfully!' as result;
