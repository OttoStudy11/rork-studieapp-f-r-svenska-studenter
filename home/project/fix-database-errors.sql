-- Fix all database errors and create a clean setup
-- This script addresses the trigger syntax errors and duplicate trigger issues

-- First, drop all existing triggers and functions to avoid conflicts
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS update_user_courses_updated_at ON public.user_courses;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.update_profiles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_courses_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_courses_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the profiles table with all necessary columns
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT,
    username TEXT UNIQUE,
    display_name TEXT,
    gymnasium TEXT,
    program TEXT,
    year INTEGER CHECK (year IN (1, 2, 3)),
    level TEXT,
    avatar_url TEXT,
    premium_status BOOLEAN DEFAULT false,
    achievements JSON DEFAULT '[]'::json,
    friends JSON DEFAULT '[]'::json,
    selected_courses JSON DEFAULT '[]'::json,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the courses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    program TEXT NOT NULL,
    year INTEGER NOT NULL,
    level TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the user_courses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    progress DECIMAL(5,2) DEFAULT 0.00,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- Create updated_at trigger functions with correct syntax
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_user_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user profile creation with username generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INTEGER := 1;
BEGIN
    -- Generate base username from email (part before @)
    base_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
    
    -- Remove special characters and replace with underscore
    base_username := REGEXP_REPLACE(base_username, '[^a-z0-9]', '_', 'g');
    
    -- Ensure username starts with a letter
    IF base_username !~ '^[a-z]' THEN
        base_username := 'user_' || base_username;
    END IF;
    
    -- Find unique username
    final_username := base_username;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
        final_username := base_username || '_' || counter;
        counter := counter + 1;
    END LOOP;
    
    -- Insert new profile
    INSERT INTO public.profiles (
        id, 
        email, 
        username,
        display_name,
        premium_status,
        achievements,
        friends,
        selected_courses,
        created_at, 
        updated_at
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        final_username,
        NULL,
        false,
        '[]'::json,
        '[]'::json,
        '[]'::json,
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

-- Create triggers
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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view courses" ON public.courses;
DROP POLICY IF EXISTS "Users can view their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can insert their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can update their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can delete their own user_courses" ON public.user_courses;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can view courses" ON public.courses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own user_courses" ON public.user_courses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_courses" ON public.user_courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_courses" ON public.user_courses
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user_courses" ON public.user_courses
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_profiles_updated_at() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_courses_updated_at() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_courses_updated_at() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS user_courses_user_id_idx ON public.user_courses(user_id);
CREATE INDEX IF NOT EXISTS user_courses_course_id_idx ON public.user_courses(course_id);