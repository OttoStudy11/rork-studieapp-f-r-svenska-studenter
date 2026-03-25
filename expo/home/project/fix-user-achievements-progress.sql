-- Add missing columns to user_achievements table
ALTER TABLE public.user_achievements 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

ALTER TABLE public.user_achievements 
ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.user_achievements 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have progress = 0
UPDATE public.user_achievements 
SET progress = 0 
WHERE progress IS NULL;

-- Add constraint to ensure progress is not negative
ALTER TABLE public.user_achievements 
ADD CONSTRAINT check_progress_non_negative 
CHECK (progress >= 0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_progress 
ON public.user_achievements(progress);

CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at 
ON public.user_achievements(unlocked_at);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_user_achievements_updated_at()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_achievements_updated_at ON public.user_achievements;
CREATE TRIGGER trigger_update_user_achievements_updated_at
    BEFORE UPDATE ON public.user_achievements
    FOR EACH ROW EXECUTE FUNCTION update_user_achievements_updated_at();

-- Update achievements table to match expected schema
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS achievement_key TEXT;

ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS requirement_type TEXT;

ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS requirement_target INTEGER;

ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS requirement_timeframe TEXT;

ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;

ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS reward_badge TEXT;

-- Update existing achievements to have the new columns populated
UPDATE public.achievements 
SET 
    achievement_key = id,
    title = name,
    category = 'study',
    requirement_type = type,
    requirement_target = requirement,
    reward_points = 10
WHERE achievement_key IS NULL;

-- Create indexes for better performance on achievements
CREATE INDEX IF NOT EXISTS idx_achievements_category 
ON public.achievements(category);

CREATE INDEX IF NOT EXISTS idx_achievements_requirement_type 
ON public.achievements(requirement_type);