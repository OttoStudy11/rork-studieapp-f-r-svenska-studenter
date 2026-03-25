-- Add missing columns to profiles table for proper course selection storage

-- First, check if columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add gymnasium column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'gymnasium') THEN
        ALTER TABLE profiles ADD COLUMN gymnasium TEXT;
    END IF;
    
    -- Add program column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'program') THEN
        ALTER TABLE profiles ADD COLUMN program TEXT;
    END IF;
    
    -- Add year column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'year') THEN
        ALTER TABLE profiles ADD COLUMN year INTEGER CHECK (year IN (1, 2, 3));
    END IF;
    
    -- Add onboarding_completed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update RLS policies to allow users to update their own profile data
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

-- Ensure users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Ensure users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING ((select auth.uid()) = id);