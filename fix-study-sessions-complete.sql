-- Complete fix for study_sessions table
-- This ensures all required columns exist and data is properly structured

-- Step 1: Drop and recreate the study_sessions table with proper structure
DROP TABLE IF EXISTS public.study_sessions CASCADE;

CREATE TABLE public.study_sessions (
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

-- Step 2: Create indexes for performance
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_course_id ON public.study_sessions(course_id);
CREATE INDEX idx_study_sessions_status ON public.study_sessions(status);
CREATE INDEX idx_study_sessions_start_time ON public.study_sessions(start_time DESC);
CREATE INDEX idx_study_sessions_end_time ON public.study_sessions(end_time DESC);
CREATE INDEX idx_study_sessions_user_start ON public.study_sessions(user_id, start_time DESC);
CREATE INDEX idx_study_sessions_user_status ON public.study_sessions(user_id, status);
CREATE INDEX idx_study_sessions_completed ON public.study_sessions(user_id, completed);

-- Step 3: Ensure user_progress table exists
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Total statistics
    total_study_time INTEGER NOT NULL DEFAULT 0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    
    -- Streak tracking
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_study_date TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes for user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_streak ON public.user_progress(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_total_time ON public.user_progress(total_study_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_study ON public.user_progress(last_study_date DESC);

-- Step 5: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_study_sessions_updated_at ON public.study_sessions;
CREATE TRIGGER update_study_sessions_updated_at
    BEFORE UPDATE ON public.study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Create trigger to update user_progress after session completion
CREATE OR REPLACE FUNCTION update_user_progress_after_session()
RETURNS TRIGGER AS $$
DECLARE
    today_date DATE;
    last_study DATE;
    new_streak INTEGER;
BEGIN
    IF NEW.completed = TRUE AND (OLD.completed IS NULL OR OLD.completed = FALSE) THEN
        today_date := NEW.end_time::DATE;
        
        SELECT last_study_date::DATE, current_streak
        INTO last_study, new_streak
        FROM public.user_progress
        WHERE user_id = NEW.user_id;
        
        IF last_study IS NULL THEN
            new_streak := 1;
        ELSIF last_study = today_date THEN
            new_streak := COALESCE(new_streak, 1);
        ELSIF last_study = today_date - INTERVAL '1 day' THEN
            new_streak := COALESCE(new_streak, 0) + 1;
        ELSE
            new_streak := 1;
        END IF;
        
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

DROP TRIGGER IF EXISTS trigger_update_user_progress ON public.study_sessions;
CREATE TRIGGER trigger_update_user_progress
    AFTER INSERT OR UPDATE ON public.study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress_after_session();

-- Step 7: Sync existing pomodoro_sessions to study_sessions
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
    'Pomodoro Session' as title,
    ps.start_time,
    COALESCE(ps.end_time, ps.start_time + (ps.duration || ' minutes')::INTERVAL) as end_time,
    ps.duration,
    'completed' as status,
    TRUE as completed,
    'pomodoro' as technique,
    ps.start_time as created_at
FROM public.pomodoro_sessions ps
ON CONFLICT DO NOTHING;

-- Step 8: Calculate and populate user_progress from study_sessions
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
    0 as current_streak,
    0 as longest_streak,
    MAX(COALESCE(ss.end_time, ss.start_time)) as last_study_date,
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

-- Step 9: Disable RLS for testing (enable in production)
ALTER TABLE public.study_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.study_sessions TO anon;
GRANT ALL ON public.study_sessions TO authenticated;
GRANT ALL ON public.user_progress TO anon;
GRANT ALL ON public.user_progress TO authenticated;
