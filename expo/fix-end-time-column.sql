-- Fix end_time column issue in pomodoro_sessions table

-- First, check if the column exists and add it if it doesn't
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
        
        -- If there's data without end_time, calculate it from start_time and duration
        UPDATE public.pomodoro_sessions
        SET end_time = start_time + (duration || ' minutes')::INTERVAL
        WHERE end_time IS NULL;
        
        -- Make it NOT NULL after filling in data
        ALTER TABLE public.pomodoro_sessions 
        ALTER COLUMN end_time SET NOT NULL;
        
        RAISE NOTICE 'Added end_time column to pomodoro_sessions table';
    END IF;
    
    -- Also check if study_sessions table exists and has end_time
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'study_sessions'
    ) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'study_sessions'
            AND column_name = 'end_time'
        ) THEN
            -- Add end_time to study_sessions if it exists but doesn't have the column
            ALTER TABLE public.study_sessions 
            ADD COLUMN end_time TIMESTAMPTZ;
            
            -- Calculate from created_at and duration_minutes
            UPDATE public.study_sessions
            SET end_time = created_at + (duration_minutes || ' minutes')::INTERVAL
            WHERE end_time IS NULL;
            
            RAISE NOTICE 'Added end_time column to study_sessions table';
        END IF;
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_end_time 
ON public.pomodoro_sessions(end_time DESC);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_end_time 
ON public.pomodoro_sessions(user_id, end_time DESC);

-- If study_sessions table exists, create its indexes too
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'study_sessions'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_study_sessions_end_time 
        ON public.study_sessions(end_time DESC);
        
        CREATE INDEX IF NOT EXISTS idx_study_sessions_user_end_time 
        ON public.study_sessions(user_id, end_time DESC);
    END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.pomodoro_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.pomodoro_sessions TO anon;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database fixed: end_time column issue resolved';
END $$;
