-- Fix user_achievements table to ensure unlocked_at column exists
-- This script will add the unlocked_at column if it doesn't exist and fix any schema mismatches

-- First, ensure the user_achievements table has all required columns
DO $$
BEGIN
    -- Check if unlocked_at column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_achievements' 
                   AND column_name = 'unlocked_at') THEN
        -- Add the unlocked_at column
        ALTER TABLE public.user_achievements 
        ADD COLUMN unlocked_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added unlocked_at column to user_achievements table';
    ELSE
        RAISE NOTICE 'unlocked_at column already exists in user_achievements table';
    END IF;
    
    -- Check if progress column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_achievements' 
                   AND column_name = 'progress') THEN
        -- Add the progress column
        ALTER TABLE public.user_achievements 
        ADD COLUMN progress INTEGER DEFAULT 0;
        RAISE NOTICE 'Added progress column to user_achievements table';
    ELSE
        RAISE NOTICE 'progress column already exists in user_achievements table';
    END IF;
    
    -- Check if updated_at column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'user_achievements' 
                   AND column_name = 'updated_at') THEN
        -- Add the updated_at column
        ALTER TABLE public.user_achievements 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to user_achievements table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in user_achievements table';
    END IF;
END
$$;

-- Ensure achievement_id is TEXT type to match the schema
DO $$
BEGIN
    -- Check current data type of achievement_id
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'user_achievements' 
               AND column_name = 'achievement_id'
               AND data_type = 'uuid') THEN
        -- Change achievement_id from UUID to TEXT
        ALTER TABLE public.user_achievements 
        ALTER COLUMN achievement_id TYPE TEXT;
        RAISE NOTICE 'Changed achievement_id column type from UUID to TEXT';
    END IF;
END
$$;

-- Update any existing records that have NULL progress to 0
UPDATE public.user_achievements 
SET progress = 0 
WHERE progress IS NULL;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id 
ON public.user_achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id 
ON public.user_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at 
ON public.user_achievements(unlocked_at);

CREATE INDEX IF NOT EXISTS idx_user_achievements_progress 
ON public.user_achievements(progress);

-- Create or replace the trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_user_achievements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to ensure it works
DROP TRIGGER IF EXISTS trigger_update_user_achievements_updated_at ON public.user_achievements;
CREATE TRIGGER trigger_update_user_achievements_updated_at
    BEFORE UPDATE ON public.user_achievements
    FOR EACH ROW EXECUTE FUNCTION update_user_achievements_updated_at();

-- Ensure RLS policies exist
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
    
    -- Create policies if they don't exist
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can view their own achievements') THEN
        CREATE POLICY "Users can view their own achievements" ON public.user_achievements
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can insert their own achievements') THEN
        CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can update their own achievements') THEN
        CREATE POLICY "Users can update their own achievements" ON public.user_achievements
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END
$$;

RAISE NOTICE 'user_achievements table schema fix complete';