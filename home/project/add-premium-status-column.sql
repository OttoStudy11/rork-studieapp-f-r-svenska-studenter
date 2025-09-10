-- Add premium_status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS premium_status BOOLEAN DEFAULT FALSE;

-- Update the column to be NOT NULL with default FALSE
UPDATE public.profiles SET premium_status = FALSE WHERE premium_status IS NULL;
ALTER TABLE public.profiles ALTER COLUMN premium_status SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN premium_status SET DEFAULT FALSE;

-- Add comment to the column
COMMENT ON COLUMN public.profiles.premium_status IS 'Whether the user has an active premium subscription';