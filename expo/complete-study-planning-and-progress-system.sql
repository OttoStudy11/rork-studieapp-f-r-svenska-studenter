-- Complete Study Planning and Progress System
-- This SQL creates a comprehensive system for study planning, session tracking, and progress statistics

-- ===========================================
-- 1. CREATE STUDY SESSIONS TABLE (if not exists)
-- ===========================================
-- This table stores both planned and completed study sessions

CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    
    -- Session details
    title TEXT NOT NULL DEFAULT 'Study Session',
    notes TEXT,
    
    -- Timing information
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    
    -- Session status
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    completed BOOLEAN DEFAULT FALSE,
    
    -- Study technique used
    technique TEXT CHECK (technique IN ('pomodoro', 'deep_work', 'active_recall', 'spaced_repetition', 'other')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure end_time is after start_time if set
    CONSTRAINT valid_session_times CHECK (end_time IS NULL OR end_time > start_time)
);

-- ===========================================
-- 2. CREATE USER PROGRESS TABLE (if not exists)
-- ===========================================
-- This table stores aggregate statistics for each user

CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Total statistics
    total_study_time INTEGER NOT NULL DEFAULT 0, -- in minutes
    total_sessions INTEGER NOT NULL DEFAULT 0,
    
    -- Streak tracking
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_study_date TIMESTAMPTZ,
    
    -- Course-specific stats are aggregated from study_sessions
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 3. FIX POMODORO_SESSIONS TABLE
-- ===========================================
-- Ensure pomodoro_sessions has end_time column

DO $$
BEGIN
    -- Check if end_time column exists in pomodoro_sessions
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'pomodoro_sessions'
        AND column_name = 'end_time'
    ) THEN
        -- Add end_time column if it doesn't exist
        ALTER TABLE public.pomodoro_sessions 
        ADD COLUMN end_time TIMESTAMPTZ;
        
        -- Calculate end_time from start_time and duration for existing records
        UPDATE public.pomodoro_sessions
        SET end_time = start_time + (duration || ' minutes')::INTERVAL
        WHERE end_time IS NULL;
        
        -- Make it NOT NULL after filling in data
        ALTER TABLE public.pomodoro_sessions 
        ALTER COLUMN end_time SET NOT NULL;
        
        RAISE NOTICE 'Added end_time column to pomodoro_sessions table';
    END IF;
END $$;

-- ===========================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ===========================================

-- Study sessions indexes
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_course_id ON public.study_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_status ON public.study_sessions(status);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time ON public.study_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_end_time ON public.study_sessions(end_time DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_start ON public.study_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_status ON public.study_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_study_sessions_completed ON public.study_sessions(user_id, completed);

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_streak ON public.user_progress(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_total_time ON public.user_progress(total_study_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_study ON public.user_progress(last_study_date DESC);

-- Pomodoro sessions indexes
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_end_time ON public.pomodoro_sessions(end_time DESC);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_end_time ON public.pomodoro_sessions(user_id, end_time DESC);

-- ===========================================
-- 5. CREATE/UPDATE TRIGGERS
-- ===========================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to study_sessions
DROP TRIGGER IF EXISTS update_study_sessions_updated_at ON public.study_sessions;
CREATE TRIGGER update_study_sessions_updated_at
    BEFORE UPDATE ON public.study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to user_progress
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 6. FUNCTION TO UPDATE USER PROGRESS
-- ===========================================

CREATE OR REPLACE FUNCTION update_user_progress_after_session()
RETURNS TRIGGER AS $$
DECLARE
    today_date DATE;
    last_study DATE;
    new_streak INTEGER;
BEGIN
    -- Only update if session is completed
    IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
        today_date := NEW.end_time::DATE;
        
        -- Get current progress
        SELECT last_study_date::DATE, current_streak, longest_streak
        INTO last_study, new_streak
        FROM public.user_progress
        WHERE user_id = NEW.user_id;
        
        -- Calculate new streak
        IF last_study IS NULL THEN
            -- First session ever
            new_streak := 1;
        ELSIF last_study = today_date THEN
            -- Same day, keep streak
            new_streak := COALESCE(new_streak, 1);
        ELSIF last_study = today_date - INTERVAL '1 day' THEN
            -- Consecutive day, increment streak
            new_streak := COALESCE(new_streak, 0) + 1;
        ELSE
            -- Streak broken, reset to 1
            new_streak := 1;
        END IF;
        
        -- Update or insert user progress
        INSERT INTO public.user_progress (
            user_id,
            total_study_time,
            total_sessions,
            current_streak,
            longest_streak,
            last_study_date,
            updated_at
        ) VALUES (
            NEW.user_id,
            NEW.duration_minutes,
            1,
            new_streak,
            new_streak,
            NEW.end_time,
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            total_study_time = public.user_progress.total_study_time + NEW.duration_minutes,
            total_sessions = public.user_progress.total_sessions + 1,
            current_streak = new_streak,
            longest_streak = GREATEST(public.user_progress.longest_streak, new_streak),
            last_study_date = NEW.end_time,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to study_sessions
DROP TRIGGER IF EXISTS trigger_update_user_progress ON public.study_sessions;
CREATE TRIGGER trigger_update_user_progress
    AFTER INSERT OR UPDATE ON public.study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress_after_session();

-- ===========================================
-- 7. FUNCTION TO SYNC POMODORO TO STUDY SESSIONS
-- ===========================================

CREATE OR REPLACE FUNCTION sync_pomodoro_to_study_sessions()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a study_sessions entry for each pomodoro session
    INSERT INTO public.study_sessions (
        user_id,
        course_id,
        title,
        start_time,
        end_time,
        duration_minutes,
        status,
        completed,
        technique,
        created_at
    ) VALUES (
        NEW.user_id,
        NEW.course_id,
        'Pomodoro Session',
        NEW.start_time,
        NEW.end_time,
        NEW.duration,
        'completed',
        TRUE,
        'pomodoro',
        NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to pomodoro_sessions
DROP TRIGGER IF EXISTS trigger_sync_pomodoro ON public.pomodoro_sessions;
CREATE TRIGGER trigger_sync_pomodoro
    AFTER INSERT ON public.pomodoro_sessions
    FOR EACH ROW
    EXECUTE FUNCTION sync_pomodoro_to_study_sessions();

-- ===========================================
-- 8. HELPER FUNCTIONS FOR STATISTICS
-- ===========================================

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_user_study_stats(UUID, TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS get_daily_study_stats(UUID, INTEGER);

-- Function to get user study statistics for a date range
CREATE OR REPLACE FUNCTION get_user_study_stats(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    total_minutes INTEGER,
    total_sessions INTEGER,
    avg_session_duration NUMERIC,
    most_studied_course_id UUID,
    most_studied_course_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ss.duration_minutes), 0)::INTEGER as total_minutes,
        COUNT(ss.id)::INTEGER as total_sessions,
        COALESCE(AVG(ss.duration_minutes), 0)::NUMERIC as avg_session_duration,
        (
            SELECT ss2.course_id 
            FROM public.study_sessions ss2
            WHERE ss2.user_id = p_user_id 
                AND ss2.completed = TRUE
                AND ss2.start_time >= p_start_date 
                AND ss2.start_time <= p_end_date
                AND ss2.course_id IS NOT NULL
            GROUP BY ss2.course_id
            ORDER BY SUM(ss2.duration_minutes) DESC
            LIMIT 1
        ) as most_studied_course_id,
        (
            SELECT c.title
            FROM public.study_sessions ss2
            JOIN public.courses c ON c.id = ss2.course_id
            WHERE ss2.user_id = p_user_id 
                AND ss2.completed = TRUE
                AND ss2.start_time >= p_start_date 
                AND ss2.start_time <= p_end_date
                AND ss2.course_id IS NOT NULL
            GROUP BY ss2.course_id, c.title
            ORDER BY SUM(ss2.duration_minutes) DESC
            LIMIT 1
        ) as most_studied_course_name
    FROM public.study_sessions ss
    WHERE ss.user_id = p_user_id 
        AND ss.completed = TRUE
        AND ss.start_time >= p_start_date 
        AND ss.start_time <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily study statistics
CREATE OR REPLACE FUNCTION get_daily_study_stats(
    p_user_id UUID,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    study_date DATE,
    total_minutes INTEGER,
    session_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT (CURRENT_DATE - INTERVAL '1 day' * generate_series(0, p_days - 1))::DATE as study_date
    )
    SELECT 
        ds.study_date,
        COALESCE(SUM(ss.duration_minutes), 0)::INTEGER as total_minutes,
        COUNT(ss.id)::INTEGER as session_count
    FROM date_series ds
    LEFT JOIN public.study_sessions ss 
        ON ss.user_id = p_user_id 
        AND ss.completed = TRUE
        AND ss.start_time::DATE = ds.study_date
    GROUP BY ds.study_date
    ORDER BY ds.study_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 9. DISABLE RLS FOR DEMO (Enable in production!)
-- ===========================================

ALTER TABLE public.study_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.study_sessions TO anon;
GRANT ALL ON public.study_sessions TO authenticated;
GRANT ALL ON public.user_progress TO anon;
GRANT ALL ON public.user_progress TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ===========================================
-- 10. BACKFILL EXISTING DATA
-- ===========================================

-- Sync existing pomodoro_sessions to study_sessions
INSERT INTO public.study_sessions (
    user_id,
    course_id,
    title,
    start_time,
    end_time,
    duration_minutes,
    status,
    completed,
    technique,
    created_at
)
SELECT 
    ps.user_id,
    ps.course_id,
    'Pomodoro Session',
    ps.start_time,
    ps.end_time,
    ps.duration,
    'completed',
    TRUE,
    'pomodoro',
    ps.start_time
FROM public.pomodoro_sessions ps
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.study_sessions ss 
    WHERE ss.user_id = ps.user_id 
        AND ss.start_time = ps.start_time 
        AND ss.duration_minutes = ps.duration
)
ON CONFLICT DO NOTHING;

-- Calculate user_progress from existing study_sessions
INSERT INTO public.user_progress (
    user_id,
    total_study_time,
    total_sessions,
    current_streak,
    longest_streak,
    last_study_date,
    created_at,
    updated_at
)
SELECT 
    ss.user_id,
    SUM(ss.duration_minutes)::INTEGER as total_study_time,
    COUNT(ss.id)::INTEGER as total_sessions,
    0 as current_streak, -- Will be recalculated
    0 as longest_streak, -- Will be recalculated
    MAX(ss.end_time) as last_study_date,
    NOW(),
    NOW()
FROM public.study_sessions ss
WHERE ss.completed = TRUE
GROUP BY ss.user_id
ON CONFLICT (user_id) DO UPDATE SET
    total_study_time = EXCLUDED.total_study_time,
    total_sessions = EXCLUDED.total_sessions,
    last_study_date = EXCLUDED.last_study_date,
    updated_at = NOW();

-- Recalculate streaks for all users
DO $$
DECLARE
    user_record RECORD;
    session_record RECORD;
    current_streak_val INTEGER;
    longest_streak_val INTEGER;
    last_date DATE;
    session_date DATE;
    prev_date DATE;
BEGIN
    FOR user_record IN SELECT DISTINCT user_id FROM public.study_sessions WHERE completed = TRUE LOOP
        current_streak_val := 0;
        longest_streak_val := 0;
        prev_date := NULL;
        
        FOR session_record IN 
            SELECT DISTINCT end_time::DATE as session_date
            FROM public.study_sessions
            WHERE user_id = user_record.user_id AND completed = TRUE
            ORDER BY end_time::DATE DESC
        LOOP
            session_date := session_record.session_date;
            
            IF prev_date IS NULL THEN
                -- First session (most recent)
                current_streak_val := 1;
                longest_streak_val := 1;
            ELSIF prev_date - session_date = 1 THEN
                -- Consecutive day
                current_streak_val := current_streak_val + 1;
                longest_streak_val := GREATEST(longest_streak_val, current_streak_val);
            ELSE
                -- Break in streak
                EXIT;
            END IF;
            
            prev_date := session_date;
        END LOOP;
        
        -- Count longest streak in history
        prev_date := NULL;
        longest_streak_val := 0;
        current_streak_val := 0;
        
        FOR session_record IN 
            SELECT DISTINCT end_time::DATE as session_date
            FROM public.study_sessions
            WHERE user_id = user_record.user_id AND completed = TRUE
            ORDER BY end_time::DATE ASC
        LOOP
            session_date := session_record.session_date;
            
            IF prev_date IS NULL THEN
                current_streak_val := 1;
            ELSIF session_date - prev_date = 1 THEN
                current_streak_val := current_streak_val + 1;
            ELSE
                current_streak_val := 1;
            END IF;
            
            longest_streak_val := GREATEST(longest_streak_val, current_streak_val);
            prev_date := session_date;
        END LOOP;
        
        -- Get current streak (from most recent session)
        SELECT COUNT(DISTINCT ss.end_time::DATE)
        INTO current_streak_val
        FROM (
            SELECT end_time, 
                   end_time::DATE - ROW_NUMBER() OVER (ORDER BY end_time::DATE)::INTEGER as grp
            FROM (
                SELECT DISTINCT end_time::DATE as end_time
                FROM public.study_sessions
                WHERE user_id = user_record.user_id AND completed = TRUE
                ORDER BY end_time::DATE DESC
            ) dates
        ) ss
        WHERE ss.grp = (
            SELECT end_time::DATE - ROW_NUMBER() OVER (ORDER BY end_time::DATE)::INTEGER as grp
            FROM (
                SELECT DISTINCT end_time::DATE as end_time
                FROM public.study_sessions
                WHERE user_id = user_record.user_id AND completed = TRUE
                ORDER BY end_time::DATE DESC
                LIMIT 1
            ) latest
        )
        GROUP BY ss.grp;
        
        -- Update user progress
        UPDATE public.user_progress
        SET 
            current_streak = COALESCE(current_streak_val, 0),
            longest_streak = longest_streak_val,
            updated_at = NOW()
        WHERE user_id = user_record.user_id;
        
    END LOOP;
END $$;

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE '✅ Study Planning & Progress System Setup Complete!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - study_sessions (planned & completed sessions)';
    RAISE NOTICE '  - user_progress (aggregate statistics)';
    RAISE NOTICE '';
    RAISE NOTICE 'Features enabled:';
    RAISE NOTICE '  ✓ Session planning with date/time';
    RAISE NOTICE '  ✓ Session history tracking';
    RAISE NOTICE '  ✓ Total study time & session counts';
    RAISE NOTICE '  ✓ Streak calculation (current & longest)';
    RAISE NOTICE '  ✓ Automatic progress updates';
    RAISE NOTICE '  ✓ Pomodoro session sync';
    RAISE NOTICE '  ✓ Daily & weekly statistics';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions available:';
    RAISE NOTICE '  - get_user_study_stats(user_id, start_date, end_date)';
    RAISE NOTICE '  - get_daily_study_stats(user_id, days)';
    RAISE NOTICE '==================================================';
END $$;
