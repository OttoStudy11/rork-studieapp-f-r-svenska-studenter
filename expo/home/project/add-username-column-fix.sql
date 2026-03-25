-- Add username and display_name columns to profiles table
DO $$ 
BEGIN
    -- Add username column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT;
    END IF;
    
    -- Add display_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
        ALTER TABLE public.profiles ADD COLUMN display_name TEXT;
    END IF;
END $$;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Update existing profiles with default values (fix the UUID substring issue)
UPDATE public.profiles 
SET 
  username = CASE 
    WHEN username IS NULL THEN 
      LOWER(REPLACE(REPLACE(COALESCE(name, 'user'), ' ', ''), 'å', 'a')) || '_' || LEFT(id::text, 6)
    ELSE username 
  END,
  display_name = CASE 
    WHEN display_name IS NULL THEN COALESCE(name, 'User')
    ELSE display_name 
  END
WHERE username IS NULL OR display_name IS NULL;

-- Add unique constraint to username
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'profiles_username_unique' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_username_unique UNIQUE (username);
    END IF;
END $$;

-- Add constraint to ensure username format is valid
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'username_format' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT username_format CHECK (
          username ~ '^[a-z0-9_]{3,20}$' AND
          LENGTH(username) >= 3 AND
          LENGTH(username) <= 20
        );
    END IF;
END $$;

-- Add constraint for display_name length
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'display_name_length' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT display_name_length CHECK (
          LENGTH(display_name) >= 1 AND
          LENGTH(display_name) <= 50
        );
    END IF;
END $$;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to check username availability
CREATE OR REPLACE FUNCTION check_username_available(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if username matches format
  IF NOT (username_to_check ~ '^[a-z0-9_]{3,20}$') THEN
    RETURN FALSE;
  END IF;
  
  -- Check if username is available
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = username_to_check
  );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION check_username_available(TEXT) TO authenticated;

-- Create function to search users by username
CREATE OR REPLACE FUNCTION search_users_by_username(search_term TEXT)
RETURNS TABLE(
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.avatar_url
  FROM public.profiles p
  WHERE 
    p.username ILIKE '%' || search_term || '%' OR
    p.display_name ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE WHEN p.username = search_term THEN 1 ELSE 2 END,
    p.username
  LIMIT 20;
END;
$$;

-- Grant execute permission on the search function
GRANT EXECUTE ON FUNCTION search_users_by_username(TEXT) TO authenticated;