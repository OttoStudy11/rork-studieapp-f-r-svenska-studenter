-- Proper RLS Setup for StudyFlow App
-- This script enables RLS with correct policies that actually work

-- First, ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE remember_me_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_courses ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- PROFILES TABLE POLICIES
-- Users can only see and modify their own profile
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- PROGRAMS TABLE POLICIES
-- Programs are public data - everyone can read them
CREATE POLICY "programs_select_all" ON programs
    FOR SELECT USING (true);

-- Only service role can modify programs (for admin operations)
CREATE POLICY "programs_insert_service" ON programs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "programs_update_service" ON programs
    FOR UPDATE USING (auth.role() = 'service_role');

-- COURSES TABLE POLICIES
-- Courses are public data - everyone can read them
CREATE POLICY "courses_select_all" ON courses
    FOR SELECT USING (true);

-- Only service role can modify courses (for admin operations)
CREATE POLICY "courses_insert_service" ON courses
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "courses_update_service" ON courses
    FOR UPDATE USING (auth.role() = 'service_role');

-- PROGRAM_COURSES TABLE POLICIES
-- Program-course relationships are public
CREATE POLICY "program_courses_select_all" ON program_courses
    FOR SELECT USING (true);

CREATE POLICY "program_courses_insert_service" ON program_courses
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- USER_COURSES TABLE POLICIES
-- Users can only access their own course enrollments
CREATE POLICY "user_courses_select_own" ON user_courses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_courses_insert_own" ON user_courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_courses_update_own" ON user_courses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_courses_delete_own" ON user_courses
    FOR DELETE USING (auth.uid() = user_id);

-- NOTES TABLE POLICIES
-- Users can only access their own notes
CREATE POLICY "notes_select_own" ON notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notes_insert_own" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notes_update_own" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notes_delete_own" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- QUIZZES TABLE POLICIES
-- Quizzes are public (read-only for users)
CREATE POLICY "quizzes_select_all" ON quizzes
    FOR SELECT USING (true);

CREATE POLICY "quizzes_insert_service" ON quizzes
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- POMODORO_SESSIONS TABLE POLICIES
-- Users can only access their own sessions
CREATE POLICY "pomodoro_sessions_select_own" ON pomodoro_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "pomodoro_sessions_insert_own" ON pomodoro_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pomodoro_sessions_update_own" ON pomodoro_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "pomodoro_sessions_delete_own" ON pomodoro_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- FRIENDS TABLE POLICIES
-- Users can see friend relationships they're part of
CREATE POLICY "friends_select_involved" ON friends
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "friends_insert_own" ON friends
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "friends_update_involved" ON friends
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "friends_delete_involved" ON friends
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- SETTINGS TABLE POLICIES
-- Users can only access their own settings
CREATE POLICY "settings_select_own" ON settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "settings_insert_own" ON settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_update_own" ON settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "settings_delete_own" ON settings
    FOR DELETE USING (auth.uid() = user_id);

-- ACHIEVEMENTS TABLE POLICIES
-- Achievements are public data
CREATE POLICY "achievements_select_all" ON achievements
    FOR SELECT USING (true);

CREATE POLICY "achievements_insert_service" ON achievements
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- USER_ACHIEVEMENTS TABLE POLICIES
-- Users can only access their own achievements
CREATE POLICY "user_achievements_select_own" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_achievements_insert_own" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_achievements_update_own" ON user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- REMEMBER_ME_SESSIONS TABLE POLICIES
-- Users can only access their own sessions
CREATE POLICY "remember_me_sessions_select_own" ON remember_me_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "remember_me_sessions_insert_own" ON remember_me_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "remember_me_sessions_update_own" ON remember_me_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "remember_me_sessions_delete_own" ON remember_me_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
GRANT SELECT ON programs TO authenticated;
GRANT SELECT ON courses TO authenticated;
GRANT SELECT ON program_courses TO authenticated;
GRANT SELECT ON quizzes TO authenticated;
GRANT SELECT ON achievements TO authenticated;

GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_courses TO authenticated;
GRANT ALL ON notes TO authenticated;
GRANT ALL ON pomodoro_sessions TO authenticated;
GRANT ALL ON friends TO authenticated;
GRANT ALL ON settings TO authenticated;
GRANT ALL ON user_achievements TO authenticated;
GRANT ALL ON remember_me_sessions TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create or update the handle_new_user function to work with RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, level, program, purpose)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'gymnasie',
    'Ej valt',
    'Förbättra mina studieresultat'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test RLS by checking if policies are active
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED ✓'
        ELSE 'RLS DISABLED ✗'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 'courses', 'user_courses', 'notes', 'quizzes', 
    'pomodoro_sessions', 'friends', 'settings', 'achievements', 
    'user_achievements', 'remember_me_sessions', 'programs', 'program_courses'
)
ORDER BY tablename;

SELECT 'RLS setup completed with proper security policies!' as result;