-- ============================================
-- FIX AMBIGUOUS user_id ERROR IN FRIENDS SYSTEM
-- ============================================
-- This SQL fixes the "column reference 'user_id' is ambiguous" error
-- when accepting friend requests
-- Run this ONCE in your Supabase SQL Editor

-- ============================================
-- 1. DROP ALL EXISTING POLICIES WITH AMBIGUOUS REFERENCES
-- ============================================

DROP POLICY IF EXISTS "Users can view friends progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view friends study sessions" ON public.study_sessions;

-- ============================================
-- 2. RECREATE POLICIES WITH FULLY QUALIFIED COLUMN NAMES
-- ============================================

-- Fix user_progress policy - use table alias 'f' for friends table
CREATE POLICY "Users can view friends progress"
ON public.user_progress FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.friends f
        WHERE f.status = 'accepted'
        AND (
            (f.user_id = auth.uid() AND f.friend_id = user_progress.user_id)
            OR
            (f.friend_id = auth.uid() AND f.user_id = user_progress.user_id)
        )
    )
);

-- Fix study_sessions policy - use table alias 'f' for friends table
CREATE POLICY "Users can view friends study sessions"
ON public.study_sessions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.friends f
        WHERE f.status = 'accepted'
        AND (
            (f.user_id = auth.uid() AND f.friend_id = study_sessions.user_id)
            OR
            (f.friend_id = auth.uid() AND f.user_id = study_sessions.user_id)
        )
    )
);

-- ============================================
-- 3. FIX POMODORO_SESSIONS POLICY (if it exists and has the same issue)
-- ============================================

-- Drop if exists
DROP POLICY IF EXISTS "Users can view friends pomodoro sessions" ON public.pomodoro_sessions;

-- Only create if pomodoro_sessions table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pomodoro_sessions') THEN
        EXECUTE 'CREATE POLICY "Users can view friends pomodoro sessions"
        ON public.pomodoro_sessions FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.friends f
                WHERE f.status = ''accepted''
                AND (
                    (f.user_id = auth.uid() AND f.friend_id = pomodoro_sessions.user_id)
                    OR
                    (f.friend_id = auth.uid() AND f.user_id = pomodoro_sessions.user_id)
                )
            )
        )';
    END IF;
END $$;

-- ============================================
-- 4. FIX ACHIEVEMENT TRIGGER (if it exists)
-- ============================================

-- Recreate the achievement trigger function with proper qualification
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

-- Recreate trigger
DROP TRIGGER IF EXISTS auto_check_achievements_after_friend ON public.friends;
CREATE TRIGGER auto_check_achievements_after_friend
  AFTER INSERT OR UPDATE ON public.friends
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements_after_friend();

-- ============================================
-- COMPLETE! ✅
-- ============================================

-- What this fixes:
-- ✅ "column reference 'user_id' is ambiguous" error when accepting friend requests
-- ✅ All RLS policies now use proper table aliases
-- ✅ Friend requests can now be accepted without errors
-- ✅ Friend progress and study sessions are properly visible

-- Test the fix:
-- 1. Go to your app
-- 2. Try accepting a friend request
-- 3. It should work without any ambiguous column errors
