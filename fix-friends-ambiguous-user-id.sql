-- Fix ambiguous user_id errors in friends system RLS policies
-- This resolves the error when accepting friend requests

-- ============================================
-- FIX RLS POLICIES WITH PROPER TABLE QUALIFIERS
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view friends progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view friends study sessions" ON public.study_sessions;

-- ========== USER PROGRESS POLICIES (FIXED) ==========

-- Users can view progress of their accepted friends
-- FIX: Properly qualify user_id columns to avoid ambiguity
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

-- ========== STUDY SESSIONS POLICIES (FIXED) ==========

-- Users can view study sessions of their accepted friends (for leaderboards)
-- FIX: Properly qualify user_id columns to avoid ambiguity
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
-- FIX USER LEVELS POLICIES (if table exists)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_levels') THEN
        -- Drop old policy
        DROP POLICY IF EXISTS "Users can view friend levels" ON public.user_levels;
        
        -- Create fixed policy
        CREATE POLICY "Users can view friend levels"
        ON public.user_levels FOR SELECT
        USING (
            user_levels.user_id IN (
                SELECT f.friend_id FROM public.friends f WHERE f.user_id = auth.uid() AND f.status = 'accepted'
                UNION
                SELECT f.user_id FROM public.friends f WHERE f.friend_id = auth.uid() AND f.status = 'accepted'
            )
        );
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT '✅ Fixed ambiguous user_id errors in friends RLS policies!' AS result;

-- Test: Try accepting a friend request
-- UPDATE friends SET status = 'accepted' WHERE id = 'some-request-id';
