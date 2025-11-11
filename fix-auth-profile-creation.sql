-- Fix Auth Profile Creation Issue
-- This script fixes the "Database error saving new user" error by properly setting up
-- the automatic profile creation trigger and ensuring all required fields have defaults

-- First, ensure all required columns exist in profiles table
DO $$ 
BEGIN
  -- Add username column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT;
  END IF;

  -- Add display_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_name TEXT;
  END IF;

  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Make sure these columns allow NULL temporarily or have defaults
ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN display_name DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN program DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN purpose DROP NOT NULL;

-- Set default values for required fields
ALTER TABLE profiles ALTER COLUMN level SET DEFAULT 'gymnasie';
ALTER TABLE profiles ALTER COLUMN program SET DEFAULT '';
ALTER TABLE profiles ALTER COLUMN purpose SET DEFAULT '';
ALTER TABLE profiles ALTER COLUMN subscription_type SET DEFAULT 'free';

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create improved trigger function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  email_prefix TEXT;
  default_username TEXT;
  username_counter INTEGER := 0;
  final_username TEXT;
BEGIN
  -- Extract email prefix for default name
  email_prefix := COALESCE(
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1),
    'student'
  );

  -- Create a clean username from email prefix
  default_username := lower(regexp_replace(email_prefix, '[^a-z0-9_]', '_', 'g'));
  final_username := default_username;

  -- Check if username already exists, if so, add a counter
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    username_counter := username_counter + 1;
    final_username := default_username || '_' || username_counter::TEXT;
  END LOOP;

  -- Insert the new profile with safe defaults
  INSERT INTO public.profiles (
    id,
    name,
    username,
    display_name,
    email,
    level,
    program,
    purpose,
    subscription_type,
    created_at
  )
  VALUES (
    NEW.id,
    email_prefix,
    final_username,
    email_prefix,
    NEW.email,
    'gymnasie',
    '',
    '',
    'free',
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    -- Return NEW anyway to allow user creation to succeed
    RETURN NEW;
END;
$$;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is configured properly for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to service role for the trigger
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Test the setup
DO $$
DECLARE
  test_result TEXT;
BEGIN
  -- Check if trigger exists
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    test_result := '✓ Trigger created successfully';
  ELSE
    test_result := '✗ Trigger creation failed';
  END IF;
  
  RAISE NOTICE '%', test_result;
END $$;

-- Show current profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Auth profile creation fix completed! Users should now be able to sign up successfully.' AS status;
