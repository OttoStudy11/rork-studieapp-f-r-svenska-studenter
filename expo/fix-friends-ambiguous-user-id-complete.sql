-- ============================================
-- FIX AMBIGUOUS user_id IN FRIENDS RLS POLICIES
-- ============================================
-- This fixes "column reference 'user_id' is ambiguous" error
-- Run this in your Supabase SQL Editor

-- ========== USER PROGRESS POLICIES ==========

-- Drop old policy
DROP POLICY IF EXISTS "Users can view friends progress" ON public.user_progress;

-- Recreate with fully qualified column names
CREATE POLICY "Users can view friends progress"
ON public.user_progress FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.friends
        WHERE friends.status = 'accepted'
        AND (
            (friends.user_id = auth.uid() AND friends.friend_id = user_progress.user_id)
            OR
            (friends.friend_id = auth.uid() AND friends.user_id = user_progress.user_id)
        )
    )
);

-- ========== STUDY SESSIONS POLICIES ==========

-- Drop old policy
DROP POLICY IF EXISTS "Users can view friends study sessions" ON public.study_sessions;

-- Recreate with fully qualified column names
CREATE POLICY "Users can view friends study sessions"
ON public.study_sessions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.friends
        WHERE friends.status = 'accepted'
        AND (
            (friends.user_id = auth.uid() AND friends.friend_id = study_sessions.user_id)
            OR
            (friends.friend_id = auth.uid() AND friends.user_id = study_sessions.user_id)
        )
    )
);

-- ========== ACHIEVEMENTS TRIGGERS (if they exist) ==========

-- Fix the trigger function for checking achievements after friend accepted
CREATE OR REPLACE FUNCTION trigger_check_achievements_after_friend()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check achievements for both users
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    PERFORM check_user_achievements(NEW.user_id);
    PERFORM check_user_achievements(NEW.friend_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS auto_check_achievements_after_friend ON friends;
CREATE TRIGGER auto_check_achievements_after_friend
  AFTER INSERT OR UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements_after_friend();

-- ============================================
-- FIX COMPLETE! ✅
-- ============================================

-- Test the fix by running:
-- SELECT * FROM user_progress WHERE user_id IN (
--   SELECT friend_id FROM friends WHERE user_id = auth.uid() AND status = 'accepted'
-- );
