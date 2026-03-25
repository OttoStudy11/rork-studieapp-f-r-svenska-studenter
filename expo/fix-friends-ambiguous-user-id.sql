-- ============================================
-- FIX AMBIGUOUS user_id IN FRIENDS RLS POLICIES
-- ============================================
-- This fixes "column reference 'user_id' is ambiguous" error

-- Drop and recreate the problematic policies with fully qualified column names

-- ========== USER PROGRESS POLICIES ==========

-- Drop old policy
DROP POLICY IF EXISTS "Users can view friends progress" ON public.user_progress;

-- Recreate with qualified column names
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

-- Recreate with qualified column names
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

-- ============================================
-- FIX COMPLETE! ✅
-- ============================================
