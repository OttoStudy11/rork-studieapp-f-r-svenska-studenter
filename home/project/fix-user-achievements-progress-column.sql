-- Fix user_achievements table to ensure progress column exists
-- This script will add the progress column if it doesn't exist

-- First, check if the user_achievements table exists
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_achievements') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.user_achievements (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
            progress numeric DEFAULT 0,
            unlocked_at timestamp with time zone,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now(),
            UNIQUE(user_id, achievement_id)
        );
        
        -- Enable RLS
        ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Users can view their own achievements" ON public.user_achievements
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own achievements" ON public.user_achievements
            FOR UPDATE USING (auth.uid() = user_id);
        
        -- Create indexes
        CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
        CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
        CREATE INDEX idx_user_achievements_unlocked_at ON public.user_achievements(unlocked_at);
        
        RAISE NOTICE 'Created user_achievements table with progress column';
    ELSE
        -- Table exists, check if progress column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_achievements' AND column_name = 'progress') THEN
            -- Add the progress column
            ALTER TABLE public.user_achievements ADD COLUMN progress numeric DEFAULT 0;
            RAISE NOTICE 'Added progress column to user_achievements table';
        ELSE
            RAISE NOTICE 'Progress column already exists in user_achievements table';
        END IF;
        
        -- Ensure updated_at column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_achievements' AND column_name = 'updated_at') THEN
            ALTER TABLE public.user_achievements ADD COLUMN updated_at timestamp with time zone DEFAULT now();
            RAISE NOTICE 'Added updated_at column to user_achievements table';
        END IF;
    END IF;
END
$$;

-- Create or replace the trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_achievements_updated_at') THEN
        CREATE TRIGGER update_user_achievements_updated_at
            BEFORE UPDATE ON public.user_achievements
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created updated_at trigger for user_achievements table';
    END IF;
END
$$;

-- Update any existing records that have NULL progress to 0
UPDATE public.user_achievements SET progress = 0 WHERE progress IS NULL;

RAISE NOTICE 'user_achievements table setup complete';