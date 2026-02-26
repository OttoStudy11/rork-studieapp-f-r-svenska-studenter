-- ============================================================
-- COMPLETE FIX: Timer Stats Database
-- Run this in Supabase SQL Editor to fix all timer stat issues
-- ============================================================

-- ============================================================
-- STEP 1: Fix pomodoro_sessions table structure
-- The app sends 'duration' but the table may have 'duration_minutes'
-- ============================================================

-- Add 'duration' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pomodoro_sessions'
          AND column_name = 'duration'
    ) THEN
        ALTER TABLE public.pomodoro_sessions ADD COLUMN duration INTEGER;
        RAISE NOTICE '✅ Added duration column to pomodoro_sessions';
    ELSE
        RAISE NOTICE '✓ duration column already exists';
    END IF;
END $$;

-- If duration_minutes exists, copy its values into duration and keep both
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pomodoro_sessions'
          AND column_name = 'duration_minutes'
    ) THEN
        UPDATE public.pomodoro_sessions
        SET duration = duration_minutes
        WHERE duration IS NULL AND duration_minutes IS NOT NULL;
        RAISE NOTICE '✅ Copied duration_minutes -> duration';
    END IF;
END $$;

-- Set NOT NULL on duration with a default fallback
ALTER TABLE public.pomodoro_sessions
    ALTER COLUMN duration SET DEFAULT 25;

UPDATE public.pomodoro_sessions
SET duration = 25
WHERE duration IS NULL;

-- Make duration NOT NULL
ALTER TABLE public.pomodoro_sessions
    ALTER COLUMN duration SET NOT NULL;

-- Ensure course_id is TEXT (not UUID) since courses use text IDs
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pomodoro_sessions'
          AND column_name = 'course_id'
          AND data_type = 'uuid'
    ) THEN
        -- Drop FK constraint if exists
        ALTER TABLE public.pomodoro_sessions DROP CONSTRAINT IF EXISTS pomodoro_sessions_course_id_fkey;
        -- Change type
        ALTER TABLE public.pomodoro_sessions ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
        RAISE NOTICE '✅ Changed course_id from UUID to TEXT';
    END IF;
END $$;

-- Ensure start_time and end_time allow null (app sometimes inserts without end_time)
ALTER TABLE public.pomodoro_sessions
    ALTER COLUMN start_time SET DEFAULT NOW();

ALTER TABLE public.pomodoro_sessions
    ALTER COLUMN end_time DROP NOT NULL;

RAISE NOTICE '✅ pomodoro_sessions structure fixed';

-- ============================================================
-- STEP 2: Ensure user_progress has all required columns
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_study_time INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    last_study_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing user_progress
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_progress' AND column_name='total_points') THEN
        ALTER TABLE public.user_progress ADD COLUMN total_points INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added total_points column';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_progress' AND column_name='created_at') THEN
        ALTER TABLE public.user_progress ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_progress' AND column_name='level') THEN
        ALTER TABLE public.user_progress ADD COLUMN level INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_progress' AND column_name='xp') THEN
        ALTER TABLE public.user_progress ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================================
-- STEP 3: Disable RLS temporarily, then set correct policies
-- ============================================================

-- Disable RLS first to clear any blocking policies
ALTER TABLE public.pomodoro_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on these tables
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'pomodoro_sessions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.pomodoro_sessions', pol.policyname);
    END LOOP;
    FOR pol IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'user_progress'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_progress', pol.policyname);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- pomodoro_sessions policies
CREATE POLICY "pomodoro_select_own"
    ON public.pomodoro_sessions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "pomodoro_insert_own"
    ON public.pomodoro_sessions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "pomodoro_update_own"
    ON public.pomodoro_sessions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "pomodoro_delete_own"
    ON public.pomodoro_sessions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- user_progress policies
CREATE POLICY "progress_select_own"
    ON public.user_progress FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "progress_select_friends"
    ON public.user_progress FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.friends f
            WHERE f.status = 'accepted'
              AND (
                (f.user_id = auth.uid() AND f.friend_id = user_progress.user_id)
                OR (f.friend_id = auth.uid() AND f.user_id = user_progress.user_id)
              )
        )
    );

CREATE POLICY "progress_insert_own"
    ON public.user_progress FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "progress_update_own"
    ON public.user_progress FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

RAISE NOTICE '✅ RLS policies set correctly';

-- ============================================================
-- STEP 4: Grant permissions
-- ============================================================

GRANT ALL ON public.pomodoro_sessions TO authenticated;
GRANT ALL ON public.user_progress TO authenticated;
GRANT SELECT ON public.pomodoro_sessions TO anon;
GRANT SELECT ON public.user_progress TO anon;

-- ============================================================
-- STEP 5: Drop broken triggers and recreate clean ones
-- ============================================================

DROP TRIGGER IF EXISTS sync_points_on_session_insert ON public.pomodoro_sessions;
DROP TRIGGER IF EXISTS auto_check_achievements_after_session ON public.pomodoro_sessions;
DROP TRIGGER IF EXISTS trigger_sync_pomodoro ON public.pomodoro_sessions;
DROP TRIGGER IF EXISTS trigger_update_user_progress_pomodoro ON public.pomodoro_sessions;
DROP TRIGGER IF EXISTS update_user_progress_on_session ON public.pomodoro_sessions;

-- Create clean trigger function to update user_progress after pomodoro insert
CREATE OR REPLACE FUNCTION public.update_progress_on_pomodoro_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_duration INTEGER;
    v_today DATE;
    v_last_date DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
BEGIN
    v_user_id := NEW.user_id;
    v_duration := COALESCE(NEW.duration, 25);
    v_today := CURRENT_DATE;

    -- Get existing progress
    SELECT
        current_streak,
        longest_streak,
        last_study_date::DATE
    INTO
        v_current_streak,
        v_longest_streak,
        v_last_date
    FROM public.user_progress
    WHERE user_id = v_user_id;

    -- Calculate streak
    IF v_last_date IS NULL THEN
        v_current_streak := 1;
    ELSIF v_last_date = v_today THEN
        -- Already studied today, keep streak as is
        v_current_streak := COALESCE(v_current_streak, 1);
    ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
        -- Studied yesterday, extend streak
        v_current_streak := COALESCE(v_current_streak, 0) + 1;
    ELSE
        -- Missed days, reset streak
        v_current_streak := 1;
    END IF;

    v_longest_streak := GREATEST(COALESCE(v_longest_streak, 0), v_current_streak);

    -- Upsert user_progress
    INSERT INTO public.user_progress (
        user_id,
        total_study_time,
        total_sessions,
        current_streak,
        longest_streak,
        total_points,
        last_study_date,
        created_at,
        updated_at
    )
    VALUES (
        v_user_id,
        v_duration,
        1,
        v_current_streak,
        v_longest_streak,
        v_duration,
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_study_time = user_progress.total_study_time + v_duration,
        total_sessions   = user_progress.total_sessions + 1,
        current_streak   = v_current_streak,
        longest_streak   = v_longest_streak,
        total_points     = COALESCE(user_progress.total_points, 0) + v_duration,
        last_study_date  = NOW(),
        updated_at       = NOW();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'update_progress_on_pomodoro_insert failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_progress_on_pomodoro_insert
    AFTER INSERT ON public.pomodoro_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_progress_on_pomodoro_insert();

RAISE NOTICE '✅ Trigger recreated';

-- ============================================================
-- STEP 6: Backfill user_progress from existing pomodoro_sessions
-- ============================================================

INSERT INTO public.user_progress (
    user_id,
    total_study_time,
    total_sessions,
    total_points,
    current_streak,
    longest_streak,
    last_study_date,
    created_at,
    updated_at
)
SELECT
    ps.user_id,
    COALESCE(SUM(ps.duration), 0)::INTEGER AS total_study_time,
    COUNT(ps.id)::INTEGER AS total_sessions,
    COALESCE(SUM(ps.duration), 0)::INTEGER AS total_points,
    0 AS current_streak,
    0 AS longest_streak,
    MAX(COALESCE(ps.end_time, ps.start_time)) AS last_study_date,
    NOW(),
    NOW()
FROM public.pomodoro_sessions ps
WHERE ps.duration IS NOT NULL
GROUP BY ps.user_id
ON CONFLICT (user_id) DO UPDATE SET
    total_study_time = EXCLUDED.total_study_time,
    total_sessions   = EXCLUDED.total_sessions,
    total_points     = EXCLUDED.total_points,
    last_study_date  = EXCLUDED.last_study_date,
    updated_at       = NOW();

RAISE NOTICE '✅ user_progress backfilled from existing sessions';

-- ============================================================
-- STEP 7: Create indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id
    ON public.pomodoro_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_start
    ON public.pomodoro_sessions(user_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_end_time
    ON public.pomodoro_sessions(end_time DESC);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id
    ON public.user_progress(user_id);

RAISE NOTICE '✅ Indexes created';

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
DECLARE
    v_session_count INTEGER;
    v_progress_count INTEGER;
    v_duration_col TEXT;
BEGIN
    SELECT COUNT(*) INTO v_session_count FROM public.pomodoro_sessions;
    SELECT COUNT(*) INTO v_progress_count FROM public.user_progress;

    SELECT data_type INTO v_duration_col
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pomodoro_sessions'
      AND column_name = 'duration';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ TIMER STATS DATABASE FIX COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'pomodoro_sessions rows: %', v_session_count;
    RAISE NOTICE 'user_progress rows: %', v_progress_count;
    RAISE NOTICE 'duration column type: %', v_duration_col;
    RAISE NOTICE '';
    RAISE NOTICE 'What was fixed:';
    RAISE NOTICE '  • duration column added/verified on pomodoro_sessions';
    RAISE NOTICE '  • course_id set to TEXT type';
    RAISE NOTICE '  • RLS policies recreated for authenticated users';
    RAISE NOTICE '  • Trigger recreated to auto-update user_progress';
    RAISE NOTICE '  • user_progress backfilled from existing sessions';
    RAISE NOTICE '  • Permissions granted to authenticated role';
    RAISE NOTICE '========================================';
END $$;
