-- ============================================
-- FIX AMBIGUOUS COLUMN REFERENCE IN FRIENDS POLICIES
-- ============================================
-- This fixes the "column reference user_id is ambiguous" error

-- Drop existing policies that have ambiguous references
DROP POLICY IF EXISTS "Users can view friends progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view friends study sessions" ON public.study_sessions;

-- ============================================
-- RECREATE POLICIES WITH QUALIFIED COLUMN NAMES
-- ============================================

-- Fix user_progress policy - explicitly qualify column names with table alias
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

-- Fix study_sessions policy - explicitly qualify column names with table alias
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
-- VERIFICATION
-- ============================================
-- You can now accept friend requests without errors
-- Test by accepting a friend request in the app
