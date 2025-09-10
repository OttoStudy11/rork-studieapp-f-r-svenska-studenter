-- Fix the updated_at trigger function to only work on tables that have the updated_at column
-- This prevents the "record has no field updated_at" error

-- Drop existing trigger from profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Create a safer function that checks if updated_at column exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the table has an updated_at column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = TG_TABLE_SCHEMA 
        AND table_name = TG_TABLE_NAME 
        AND column_name = 'updated_at'
    ) THEN
        -- Use dynamic SQL to safely set the updated_at field
        EXECUTE format('UPDATE %I.%I SET updated_at = NOW() WHERE id = $1', TG_TABLE_SCHEMA, TG_TABLE_NAME) USING NEW.id;
        RETURN NEW;
    ELSE
        -- If no updated_at column, just return NEW without modification
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Alternative simpler approach: Create specific triggers for each table that needs them
-- Drop the generic function and create table-specific ones

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Create specific function for profiles table
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create specific function for courses table
CREATE OR REPLACE FUNCTION public.update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create specific function for user_courses table
CREATE OR REPLACE FUNCTION public.update_user_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables that have updated_at column
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_profiles_updated_at();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_courses_updated_at();

CREATE TRIGGER update_user_courses_updated_at
    BEFORE UPDATE ON public.user_courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_courses_updated_at();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_profiles_updated_at() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_courses_updated_at() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_courses_updated_at() TO anon, authenticated;