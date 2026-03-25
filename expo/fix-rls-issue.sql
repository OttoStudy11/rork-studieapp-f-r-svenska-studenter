-- Fix Row Level Security (RLS) issue for profiles table
-- This script ensures RLS is properly disabled for all tables

-- Disable RLS for all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE friends DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE remember_me_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE program_courses DISABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies that might be interfering
DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- Grant permissions to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure the service role has full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create a function to verify RLS is disabled
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE(table_name text, rls_enabled boolean) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::text,
        t.rowsecurity
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename IN (
        'profiles', 'courses', 'user_courses', 'notes', 'quizzes', 
        'pomodoro_sessions', 'friends', 'settings', 'achievements', 
        'user_achievements', 'remember_me_sessions', 'programs', 'program_courses'
    );
END;
$$ LANGUAGE plpgsql;

-- Test the function (uncomment to run)
-- SELECT * FROM check_rls_status();