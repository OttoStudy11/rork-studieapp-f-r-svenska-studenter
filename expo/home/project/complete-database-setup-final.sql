-- COMPLETE DATABASE SETUP FOR STUDY APP
-- This script combines all SQL files from the home directory into one comprehensive setup
-- Run this script to set up the entire database structure with all tables, functions, triggers, and policies

-- ============================================================================
-- 1. DROP EXISTING OBJECTS TO ENSURE CLEAN SETUP
-- ============================================================================

-- Drop all existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS update_user_courses_updated_at ON public.user_courses;
DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON public.user_achievements;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS sync_profile_on_auth_update ON auth.users;
DROP TRIGGER IF EXISTS ensure_username_trigger ON public.profiles;
DROP TRIGGER IF EXISTS trigger_update_user_progress ON public.study_sessions;

-- Drop all existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.update_profiles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_courses_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_courses_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_achievements_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.ensure_username() CASCADE;
DROP FUNCTION IF EXISTS public.sync_profile_with_auth() CASCADE;
DROP FUNCTION IF EXISTS update_user_progress() CASCADE;
DROP FUNCTION IF EXISTS search_users_by_username(TEXT) CASCADE;
DROP FUNCTION IF EXISTS check_username_available(TEXT) CASCADE;

-- ============================================================================
-- 2. CREATE CORE TABLES
-- ============================================================================

-- Create profiles table with all necessary columns
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
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create courses table
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

-- Create user_courses table
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

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    type TEXT NOT NULL,
    requirement INTEGER NOT NULL DEFAULT 1,
    achievement_key TEXT,
    title TEXT,
    category TEXT,
    requirement_type TEXT,
    requirement_target INTEGER,
    requirement_timeframe TEXT,
    reward_points INTEGER DEFAULT 0,
    reward_badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    technique TEXT DEFAULT 'pomodoro',
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_progress table for caching computed values
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_study_time INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    last_study_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT no_self_friendship CHECK (user1_id != user2_id)
);

-- Create study_tips table
CREATE TABLE IF NOT EXISTS public.study_tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create study_techniques table
CREATE TABLE IF NOT EXISTS public.study_techniques (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    difficulty_level TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create remember_me_sessions table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.remember_me_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_display_name_idx ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS profiles_updated_at_idx ON public.profiles(updated_at);

-- User courses indexes
CREATE INDEX IF NOT EXISTS user_courses_user_id_idx ON public.user_courses(user_id);
CREATE INDEX IF NOT EXISTS user_courses_course_id_idx ON public.user_courses(course_id);

-- User achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_progress ON public.user_achievements(progress);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON public.user_achievements(unlocked_at);

-- Study sessions indexes
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_course_id_idx ON public.study_sessions(course_id);
CREATE INDEX IF NOT EXISTS study_sessions_created_at_idx ON public.study_sessions(created_at);

-- Friendships indexes
CREATE INDEX IF NOT EXISTS friendships_user1_id_idx ON public.friendships(user1_id);
CREATE INDEX IF NOT EXISTS friendships_user2_id_idx ON public.friendships(user2_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON public.friendships(status);

-- Remember me sessions indexes
CREATE INDEX IF NOT EXISTS remember_me_sessions_user_id_idx ON public.remember_me_sessions(user_id);
CREATE INDEX IF NOT EXISTS remember_me_sessions_token_hash_idx ON public.remember_me_sessions(token_hash);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_type ON public.achievements(type);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_requirement_type ON public.achievements(requirement_type);

-- Create unique index to prevent duplicate friendships
CREATE UNIQUE INDEX IF NOT EXISTS friendships_unique_pair_idx ON public.friendships (
    LEAST(user1_id, user2_id), 
    GREATEST(user1_id, user2_id)
);

-- ============================================================================
-- 4. CREATE FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user profile creation
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
    
    -- Remove special characters and ensure it starts with a letter
    username_base := REGEXP_REPLACE(username_base, '[^a-z0-9]', '_', 'g');
    IF username_base !~ '^[a-z]' THEN
        username_base := 'user_' || username_base;
    END IF;
    
    -- Add a short UUID suffix to make it unique
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
        premium_status,
        achievements,
        friends,
        selected_courses,
        created_at, 
        updated_at
    ) VALUES (
        NEW.id, 
        NEW.email, 
        final_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(COALESCE(NEW.email, 'User'), '@', 1)),
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

-- Function to ensure username is generated
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
        
        -- Clean up username
        username_base := REGEXP_REPLACE(username_base, '[^a-z0-9_]', '_', 'g');
        IF username_base !~ '^[a-z]' THEN
            username_base := 'user_' || username_base;
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

-- Function to update user progress automatically
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_progress (user_id, total_study_time, total_sessions, updated_at)
    VALUES (
        NEW.user_id,
        (SELECT COALESCE(SUM(duration_minutes), 0) FROM public.study_sessions WHERE user_id = NEW.user_id),
        (SELECT COUNT(*) FROM public.study_sessions WHERE user_id = NEW.user_id),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_study_time = (SELECT COALESCE(SUM(duration_minutes), 0) FROM public.study_sessions WHERE user_id = NEW.user_id),
        total_sessions = (SELECT COUNT(*) FROM public.study_sessions WHERE user_id = NEW.user_id),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user_achievements updated_at
CREATE OR REPLACE FUNCTION update_user_achievements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to search users by username
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

-- Function to check username availability
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

-- ============================================================================
-- 5. CREATE TRIGGERS
-- ============================================================================

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_courses_updated_at
    BEFORE UPDATE ON public.user_courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at
    BEFORE UPDATE ON public.user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_user_achievements_updated_at();

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger to ensure username is generated
CREATE TRIGGER ensure_username_trigger
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_username();

-- Trigger to automatically update user progress
CREATE TRIGGER trigger_update_user_progress
    AFTER INSERT OR UPDATE OR DELETE ON public.study_sessions
    FOR EACH ROW EXECUTE FUNCTION update_user_progress();

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remember_me_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. DROP EXISTING POLICIES TO AVOID CONFLICTS
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles for friend search" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users can view courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can view courses" ON public.courses;

DROP POLICY IF EXISTS "Users can view their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can insert their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can update their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can delete their own user_courses" ON public.user_courses;

DROP POLICY IF EXISTS "Authenticated users can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Everyone can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;

DROP POLICY IF EXISTS "Users can view their own user_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert their own user_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can update their own achievements" ON public.user_achievements;

DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can insert friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can update their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON public.friendships;

DROP POLICY IF EXISTS "Users can view their own remember_me_sessions" ON public.remember_me_sessions;
DROP POLICY IF EXISTS "Users can insert their own remember_me_sessions" ON public.remember_me_sessions;
DROP POLICY IF EXISTS "Users can update their own remember_me_sessions" ON public.remember_me_sessions;
DROP POLICY IF EXISTS "Users can delete their own remember_me_sessions" ON public.remember_me_sessions;

DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can delete their own study sessions" ON public.study_sessions;

DROP POLICY IF EXISTS "Everyone can view study tips" ON public.study_tips;
DROP POLICY IF EXISTS "Allow public read access to study_tips" ON public.study_tips;

DROP POLICY IF EXISTS "Everyone can view study techniques" ON public.study_techniques;
DROP POLICY IF EXISTS "Allow public read access to study_techniques" ON public.study_techniques;

DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;

-- ============================================================================
-- 8. CREATE RLS POLICIES
-- ============================================================================

-- Profiles policies
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

-- Courses policies (public read access for authenticated users)
CREATE POLICY "Authenticated users can view courses" ON public.courses
    FOR SELECT USING (auth.role() = 'authenticated');

-- User courses policies
CREATE POLICY "Users can view their own user_courses" ON public.user_courses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_courses" ON public.user_courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_courses" ON public.user_courses
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user_courses" ON public.user_courses
    FOR DELETE USING (auth.uid() = user_id);

-- Achievements policies (public read access for authenticated users)
CREATE POLICY "Authenticated users can view achievements" ON public.achievements
    FOR SELECT USING (auth.role() = 'authenticated');

-- User achievements policies
CREATE POLICY "Users can view their own user_achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_achievements" ON public.user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view their friendships" ON public.friendships
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert friendships" ON public.friendships
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their friendships" ON public.friendships
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id)
    WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their friendships" ON public.friendships
    FOR DELETE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Remember me sessions policies
CREATE POLICY "Users can view their own remember_me_sessions" ON public.remember_me_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own remember_me_sessions" ON public.remember_me_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own remember_me_sessions" ON public.remember_me_sessions
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own remember_me_sessions" ON public.remember_me_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view their own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON public.study_sessions
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions" ON public.study_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Study tips and techniques policies (public read access)
CREATE POLICY "Everyone can view study tips" ON public.study_tips
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view study techniques" ON public.study_techniques
    FOR SELECT USING (true);

-- User progress policies
CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 9. INSERT SAMPLE DATA
-- ============================================================================

-- Insert default achievements
INSERT INTO public.achievements (id, name, description, icon, type, requirement, achievement_key, title, category, requirement_type, requirement_target, reward_points) VALUES
    ('first_session', 'Första steget', 'Genomför din första studiesession', 'Play', 'sessions', 1, 'first_session', 'Första steget', 'study', 'sessions', 1, 10),
    ('early_bird', 'Morgonpiggen', 'Studera före 09:00', 'Sunrise', 'special', 1, 'early_bird', 'Morgonpiggen', 'study', 'special', 1, 10),
    ('night_owl', 'Nattuggle', 'Studera efter 22:00', 'Moon', 'special', 1, 'night_owl', 'Nattuggle', 'study', 'special', 1, 10),
    ('pomodoro_master', 'Pomodoro-mästare', 'Genomför 25 pomodoro-sessioner', 'Timer', 'sessions', 25, 'pomodoro_master', 'Pomodoro-mästare', 'study', 'sessions', 25, 50),
    ('marathon_runner', 'Maratonlöpare', 'Studera i 3 timmar på en dag', 'Zap', 'study_time', 180, 'marathon_runner', 'Maratonlöpare', 'study', 'study_time', 180, 30),
    ('week_warrior', 'Veckokrigare', 'Studera 7 dagar i rad', 'Calendar', 'streak', 7, 'week_warrior', 'Veckokrigare', 'study', 'streak', 7, 40),
    ('dedication', 'Hängivenhet', 'Studera 30 dagar i rad', 'Award', 'streak', 30, 'dedication', 'Hängivenhet', 'study', 'streak', 30, 100),
    ('course_master', 'Kursmästare', 'Slutför din första kurs', 'BookOpen', 'course_completion', 1, 'course_master', 'Kursmästare', 'study', 'course_completion', 1, 25),
    ('scholar', 'Lärd', 'Ackumulera 100 timmars studietid', 'GraduationCap', 'study_time', 6000, 'scholar', 'Lärd', 'study', 'study_time', 6000, 200),
    ('perfectionist', 'Perfektionist', 'Slutför 5 kurser', 'Star', 'course_completion', 5, 'perfectionist', 'Perfektionist', 'study', 'course_completion', 5, 100)
ON CONFLICT (id) DO NOTHING;

-- Insert sample study tips if table is empty
INSERT INTO public.study_tips (title, content, category)
SELECT * FROM (VALUES
    ('Pomodoro-tekniken', 'Studera i 25-minuters intervaller med 5 minuters pauser. Efter 4 intervaller, ta en längre paus på 15-30 minuter.', 'Tidshantering'),
    ('Aktiv repetition', 'Testa dig själv regelbundet istället för att bara läsa om materialet. Använd flashcards eller förklara koncepten för någon annan.', 'Minnestekniker'),
    ('Spaced repetition', 'Repetera material med ökande intervaller. Granska nytt material efter 1 dag, sedan 3 dagar, sedan 1 vecka, osv.', 'Minnestekniker'),
    ('Feynman-tekniken', 'Förklara ett koncept i enkla termer som om du undervisar en 12-åring. Detta hjälper dig identifiera kunskapsluckor.', 'Förståelse'),
    ('Mind maps', 'Skapa visuella kartor över information för att se samband mellan olika koncept och förbättra minnet.', 'Visualisering'),
    ('Miljöinställning', 'Hitta en tyst, välbelyst plats dedikerad för studier. Ta bort distraktioner som telefoner och sociala medier.', 'Miljö'),
    ('Sömn och studier', 'Få 7-9 timmars sömn. Din hjärna konsoliderar minnen under sömnen, vilket gör det avgörande för lärande.', 'Hälsa'),
    ('Träningspauser', 'Ta korta träningspauser under studiesessionerna. Fysisk aktivitet förbättrar fokus och minne.', 'Hälsa'),
    ('Målsättning', 'Sätt specifika, mätbara studiemål för varje session. "Studera matte" vs "Slutför 10 algebraproblem".', 'Planering')
) AS t(title, content, category)
WHERE NOT EXISTS (SELECT 1 FROM public.study_tips LIMIT 1);

-- Insert sample study techniques if table is empty
INSERT INTO public.study_techniques (title, description, instructions, difficulty_level, duration_minutes)
SELECT * FROM (VALUES
    ('Pomodoro-teknik', 'En tidshanteringsteknik som delar upp arbete i fokuserade intervaller', 'Sätt en timer på 25 minuter och fokusera helt på en uppgift. Ta sedan 5 minuters paus. Upprepa 4 gånger, ta sedan en längre paus på 15-30 minuter.', 'Lätt', 25),
    ('Cornell-anteckningar', 'Ett strukturerat system för att ta anteckningar som förbättrar förståelse och repetition', 'Dela upp ditt papper i tre sektioner: anteckningar (höger), ledtrådar (vänster), och sammanfattning (botten). Skriv anteckningar under föreläsningen, lägg till ledtrådar efteråt, och sammanfatta i slutet.', 'Medel', 60),
    ('SQ3R-metoden', 'Survey, Question, Read, Recite, Review - en systematisk läsmetod', 'Survey: Skanna texten snabbt. Question: Ställ frågor om innehållet. Read: Läs aktivt. Recite: Sammanfatta vad du lärt dig. Review: Granska och repetera materialet.', 'Medel', 90),
    ('Aktiv repetition', 'Testa dig själv istället för att bara läsa om materialet', 'Skapa frågor om materialet och testa dig själv. Använd flashcards, förklara koncepten högt, eller undervisa någon annan. Fokusera på det du inte kan.', 'Lätt', 30),
    ('Feynman-tekniken', 'Lärande genom att undervisa koncept i enkla termer', '1. Välj ett koncept\\n2. Förklara det enkelt\\n3. Identifiera kunskapsluckor\\n4. Gå tillbaka till källmaterialet\\n5. Förenkla och använd analogier', 'Avancerad', 45),
    ('Mind Mapping', 'Visuell representation av information och kopplingar', '1. Skriv huvudämnet i mitten\\n2. Lägg till huvudgrenar\\n3. Lägg till undergrenar\\n4. Använd färger och bilder\\n5. Granska kopplingar', 'Lätt', 20),
    ('Elaborativ förhör', 'Att ställa "varför"-frågor för att fördjupa förståelsen', '1. Läs ett faktum eller koncept\\n2. Fråga "Varför är detta sant?"\\n3. Generera förklaringar\\n4. Verifiera med källor\\n5. Koppla till tidigare kunskap', 'Avancerad', 40)
) AS t(title, description, instructions, difficulty_level, duration_minutes)
WHERE NOT EXISTS (SELECT 1 FROM public.study_techniques LIMIT 1);

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_username() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_user_progress() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_user_achievements_updated_at() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_users_by_username(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_username_available(TEXT) TO authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- 11. FINAL DATA CLEANUP
-- ============================================================================

-- Update existing profiles that don't have usernames
UPDATE public.profiles 
SET username = LOWER(REPLACE(COALESCE(name, email, 'user'), ' ', '_')) || '_' || SUBSTRING(id::TEXT, 1, 6),
    updated_at = NOW()
WHERE username IS NULL OR username = '';

-- Ensure all existing profiles have updated_at set
UPDATE public.profiles 
SET updated_at = COALESCE(updated_at, created_at, NOW())
WHERE updated_at IS NULL;

-- Update any existing user_achievements records that have NULL progress to 0
UPDATE public.user_achievements SET progress = 0 WHERE progress IS NULL;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- This completes the database setup with:
-- - All necessary tables with proper structure
-- - All indexes for performance
-- - All functions for automation
-- - All triggers for data consistency
-- - All RLS policies for security
-- - Sample data for immediate use
-- - Proper permissions for all roles