-- Fix study_sessions table to ensure status column exists
-- This SQL adds the missing status column if it doesn't exist

-- First, check if study_sessions table exists and add missing columns
DO $$
BEGIN
    -- Check if status column exists, add if missing
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'study_sessions'
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.study_sessions 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'planned' 
        CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled'));
        
        RAISE NOTICE 'Added status column to study_sessions table';
    ELSE
        RAISE NOTICE 'Status column already exists in study_sessions table';
    END IF;

    -- Check if completed column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'study_sessions'
        AND column_name = 'completed'
    ) THEN
        ALTER TABLE public.study_sessions 
        ADD COLUMN completed BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Added completed column to study_sessions table';
    ELSE
        RAISE NOTICE 'Completed column already exists in study_sessions table';
    END IF;

    -- Check if technique column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'study_sessions'
        AND column_name = 'technique'
    ) THEN
        ALTER TABLE public.study_sessions 
        ADD COLUMN technique TEXT 
        CHECK (technique IN ('pomodoro', 'deep_work', 'active_recall', 'spaced_repetition', 'other'));
        
        RAISE NOTICE 'Added technique column to study_sessions table';
    ELSE
        RAISE NOTICE 'Technique column already exists in study_sessions table';
    END IF;

    -- Check if title column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'study_sessions'
        AND column_name = 'title'
    ) THEN
        ALTER TABLE public.study_sessions 
        ADD COLUMN title TEXT NOT NULL DEFAULT 'Study Session';
        
        RAISE NOTICE 'Added title column to study_sessions table';
    ELSE
        RAISE NOTICE 'Title column already exists in study_sessions table';
    END IF;

    -- Check if notes column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'study_sessions'
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.study_sessions 
        ADD COLUMN notes TEXT;
        
        RAISE NOTICE 'Added notes column to study_sessions table';
    ELSE
        RAISE NOTICE 'Notes column already exists in study_sessions table';
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_study_sessions_status ON public.study_sessions(status);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_status ON public.study_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_study_sessions_completed ON public.study_sessions(user_id, completed);

-- Update existing rows to have proper status based on completed flag
UPDATE public.study_sessions
SET status = CASE 
    WHEN completed = TRUE THEN 'completed'
    WHEN end_time IS NOT NULL AND end_time < NOW() THEN 'completed'
    WHEN start_time < NOW() AND end_time IS NULL THEN 'in_progress'
    WHEN start_time > NOW() THEN 'planned'
    ELSE 'completed'
END
WHERE status IS NULL OR status = '';

-- Sync completed flag with status
UPDATE public.study_sessions
SET completed = (status = 'completed')
WHERE completed IS NULL;

RAISE NOTICE '✅ Study sessions table fixed! Status column is now available.';
