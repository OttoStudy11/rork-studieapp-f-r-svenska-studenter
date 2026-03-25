-- ============================================
-- FINAL FIX: AMBIGUOUS user_id ERROR
-- ============================================
-- Run this ONCE in Supabase SQL Editor
-- This fixes: "column reference 'user_id' is ambiguous"

-- ============================================
-- STEP 1: DROP ALL PROBLEMATIC RLS POLICIES
-- ============================================

-- Drop user_progress policies
DROP POLICY IF EXISTS "Users can view friends progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;

-- Drop study_sessions policies
DROP POLICY IF EXISTS "Users can view friends study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can delete their own study sessions" ON public.study_sessions;

-- Drop pomodoro_sessions policies
DROP POLICY IF EXISTS "Users can view friends pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can view their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can insert their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can update their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can delete their own pomodoro sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.pomodoro_sessions;

-- Drop friends policies
DROP POLICY IF EXISTS "Users can view their friends" ON public.friends;
DROP POLICY IF EXISTS "Users can insert friends" ON public.friends;
DROP POLICY IF EXISTS "Users can update their friends" ON public.friends;
DROP POLICY IF EXISTS "Users can delete their friends" ON public.friends;

-- ============================================
-- STEP 2: RECREATE FRIENDS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view their friends"
ON public.friends FOR SELECT
USING (
    auth.uid() = friends.user_id OR auth.uid() = friends.friend_id
);

CREATE POLICY "Users can insert friends"
ON public.friends FOR INSERT
WITH CHECK (
    auth.uid() = friends.user_id
);

CREATE POLICY "Users can update their friends"
ON public.friends FOR UPDATE
USING (
    auth.uid() = friends.user_id OR auth.uid() = friends.friend_id
)
WITH CHECK (
    auth.uid() = friends.user_id OR auth.uid() = friends.friend_id
);

CREATE POLICY "Users can delete their friends"
ON public.friends FOR DELETE
USING (
    auth.uid() = friends.user_id OR auth.uid() = friends.friend_id
);

-- ============================================
-- STEP 3: RECREATE USER_PROGRESS POLICIES
-- ============================================

CREATE POLICY "Users can view their own progress"
ON public.user_progress FOR SELECT
USING (
    auth.uid() = user_progress.user_id
);

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

CREATE POLICY "Users can insert their own progress"
ON public.user_progress FOR INSERT
WITH CHECK (
    auth.uid() = user_progress.user_id
);

CREATE POLICY "Users can update their own progress"
ON public.user_progress FOR UPDATE
USING (auth.uid() = user_progress.user_id)
WITH CHECK (auth.uid() = user_progress.user_id);

-- ============================================
-- STEP 4: RECREATE STUDY_SESSIONS POLICIES
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'study_sessions') THEN
        EXECUTE 'CREATE POLICY "Users can view their own study sessions"
        ON public.study_sessions FOR SELECT
        USING (auth.uid() = study_sessions.user_id)';
        
        EXECUTE 'CREATE POLICY "Users can view friends study sessions"
        ON public.study_sessions FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.friends f
                WHERE f.status = ''accepted''
                AND (
                    (f.user_id = auth.uid() AND f.friend_id = study_sessions.user_id)
                    OR
                    (f.friend_id = auth.uid() AND f.user_id = study_sessions.user_id)
                )
            )
        )';
        
        EXECUTE 'CREATE POLICY "Users can insert their own study sessions"
        ON public.study_sessions FOR INSERT
        WITH CHECK (auth.uid() = study_sessions.user_id)';
        
        EXECUTE 'CREATE POLICY "Users can update their own study sessions"
        ON public.study_sessions FOR UPDATE
        USING (auth.uid() = study_sessions.user_id)
        WITH CHECK (auth.uid() = study_sessions.user_id)';
        
        EXECUTE 'CREATE POLICY "Users can delete their own study sessions"
        ON public.study_sessions FOR DELETE
        USING (auth.uid() = study_sessions.user_id)';
    END IF;
END $$;

-- ============================================
-- STEP 5: RECREATE POMODORO_SESSIONS POLICIES
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pomodoro_sessions') THEN
        EXECUTE 'CREATE POLICY "Users can view their own pomodoro sessions"
        ON public.pomodoro_sessions FOR SELECT
        USING (auth.uid() = pomodoro_sessions.user_id)';
        
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
        
        EXECUTE 'CREATE POLICY "Users can insert their own pomodoro sessions"
        ON public.pomodoro_sessions FOR INSERT
        WITH CHECK (auth.uid() = pomodoro_sessions.user_id)';
        
        EXECUTE 'CREATE POLICY "Users can update their own pomodoro sessions"
        ON public.pomodoro_sessions FOR UPDATE
        USING (auth.uid() = pomodoro_sessions.user_id)
        WITH CHECK (auth.uid() = pomodoro_sessions.user_id)';
        
        EXECUTE 'CREATE POLICY "Users can delete their own pomodoro sessions"
        ON public.pomodoro_sessions FOR DELETE
        USING (auth.uid() = pomodoro_sessions.user_id)';
    END IF;
END $$;

-- ============================================
-- STEP 6: FIX ACHIEVEMENT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION trigger_check_achievements_after_friend()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_friend_id UUID;
BEGIN
    v_user_id := NEW.user_id;
    v_friend_id := NEW.friend_id;
    
    IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'accepted') THEN
        BEGIN
            PERFORM check_user_achievements(v_user_id);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not check achievements for user %: %', v_user_id, SQLERRM;
        END;
        
        BEGIN
            PERFORM check_user_achievements(v_friend_id);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not check achievements for friend %: %', v_friend_id, SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_check_achievements_after_friend ON public.friends;
CREATE TRIGGER auto_check_achievements_after_friend
    AFTER INSERT OR UPDATE ON public.friends
    FOR EACH ROW
    EXECUTE FUNCTION trigger_check_achievements_after_friend();

-- ============================================
-- DONE! ✅
-- ============================================
-- The "user_id is ambiguous" error should now be fixed.
-- Test by accepting a friend request in your app.
