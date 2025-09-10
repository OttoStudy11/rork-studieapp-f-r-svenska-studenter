-- Complete database fix for all reported errors
-- This script fixes all the database issues and ensures proper profile tracking

-- First, ensure the profiles table has all required columns
DO $$ 
BEGIN
    -- Add username column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add display_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
        ALTER TABLE public.profiles ADD COLUMN display_name TEXT;
    END IF;
END $$;

-- Add unique constraint for username (using DO block to avoid errors if it exists)
DO $$ 
BEGIN
    -- Add unique constraint for username
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_username_unique') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN
        -- Constraint already exists, ignore
        NULL;
END $$;

-- Drop existing triggers and functions to avoid conflicts
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_profiles_updated_at();

-- Create a proper updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Only create courses trigger if courses table has updated_at column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'updated_at') THEN
        EXECUTE 'CREATE TRIGGER update_courses_updated_at
            BEFORE UPDATE ON public.courses
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()';
    END IF;
END $$;

-- Create or replace the profile creation function with proper UUID handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_base TEXT;
    final_username TEXT;
    counter INTEGER := 1;
BEGIN
    -- Generate a base username from email or use a default
    IF NEW.email IS NOT NULL THEN
        username_base := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '_'));
    ELSE
        username_base := 'user';
    END IF;
    
    -- Add a short UUID suffix to make it unique (convert UUID to text first)
    final_username := username_base || '_' || SUBSTRING(NEW.id::TEXT, 1, 6);
    
    -- Ensure username is unique by adding counter if needed
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
        final_username := username_base || '_' || SUBSTRING(NEW.id::TEXT, 1, 6) || '_' || counter;
        counter := counter + 1;
    END LOOP;
    
    -- Insert the new profile
    INSERT INTO public.profiles (
        id, 
        email, 
        username,
        display_name,
        created_at, 
        updated_at
    ) VALUES (
        NEW.id, 
        NEW.email, 
        final_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(COALESCE(NEW.email, 'User'), '@', 1)),
        NOW(), 
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Create function to automatically generate username when profile is updated
CREATE OR REPLACE FUNCTION public.ensure_username()
RETURNS TRIGGER AS $$
DECLARE
    username_base TEXT;
    final_username TEXT;
    counter INTEGER := 1;
BEGIN
    -- Only generate username if it's null or empty
    IF NEW.username IS NULL OR NEW.username = '' THEN
        -- Generate base from display_name or name or email
        IF NEW.display_name IS NOT NULL AND NEW.display_name != '' THEN
            username_base := LOWER(REPLACE(REPLACE(NEW.display_name, ' ', '_'), 'å', 'a'));
        ELSIF NEW.name IS NOT NULL AND NEW.name != '' THEN
            username_base := LOWER(REPLACE(REPLACE(NEW.name, ' ', '_'), 'å', 'a'));
        ELSIF NEW.email IS NOT NULL THEN
            username_base := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '_'));
        ELSE
            username_base := 'user';
        END IF;
        
        -- Add UUID suffix
        final_username := username_base || '_' || SUBSTRING(NEW.id::TEXT, 1, 6);
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id != NEW.id) LOOP
            final_username := username_base || '_' || SUBSTRING(NEW.id::TEXT, 1, 6) || '_' || counter;
            counter := counter + 1;
        END LOOP;
        
        NEW.username := final_username;
    END IF;
    
    -- Always update the updated_at timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure username is generated
DROP TRIGGER IF EXISTS ensure_username_trigger ON public.profiles;
CREATE TRIGGER ensure_username_trigger
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_username();

-- Update existing profiles that don't have usernames
UPDATE public.profiles 
SET username = LOWER(REPLACE(COALESCE(name, email, 'user'), ' ', '_')) || '_' || SUBSTRING(id::TEXT, 1, 6),
    updated_at = NOW()
WHERE username IS NULL OR username = '';

-- Create function to update profile when user data changes
CREATE OR REPLACE FUNCTION public.sync_profile_with_auth()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile when auth user data changes
    UPDATE public.profiles 
    SET 
        email = NEW.email,
        display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', display_name),
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync profile with auth changes
DROP TRIGGER IF EXISTS sync_profile_on_auth_update ON auth.users;
CREATE TRIGGER sync_profile_on_auth_update
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_profile_with_auth();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_username() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_profile_with_auth() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO anon, authenticated;

-- Ensure RLS is properly configured
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles for friend search" ON public.profiles;

-- Create comprehensive profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to search for other users by username for friend functionality
CREATE POLICY "Users can view profiles for friend search" ON public.profiles
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        (username IS NOT NULL OR display_name IS NOT NULL)
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_display_name_idx ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON public.profiles(updated_at);

-- Ensure all existing profiles have updated_at set
UPDATE public.profiles 
SET updated_at = COALESCE(updated_at, created_at, NOW())
WHERE updated_at IS NULL;

-- Make updated_at NOT NULL after ensuring all records have values
ALTER TABLE public.profiles ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN updated_at SET DEFAULT NOW();

COMMIT;