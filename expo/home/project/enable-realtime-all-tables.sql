-- ============================================================================
-- ENABLE REALTIME ON ALL TABLES FOR STUDY APP
-- ============================================================================
-- This script enables Supabase Realtime on all tables in your study app
-- Run this script after your complete database setup is finished

-- ============================================================================
-- 1. ENABLE REALTIME ON CORE USER TABLES
-- ============================================================================

-- Enable realtime for profiles table
-- This allows real-time updates when users change their profile info, status, etc.
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for user_courses table  
-- This allows real-time updates when users enroll/unenroll from courses or update progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_courses;

-- Enable realtime for user_achievements table
-- This allows real-time achievement notifications and progress updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;

-- Enable realtime for user_progress table
-- This allows real-time updates of study statistics and progress tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;

-- ============================================================================
-- 2. ENABLE REALTIME ON STUDY SESSION TABLES
-- ============================================================================

-- Enable realtime for study_sessions table
-- This allows real-time tracking of active study sessions and completion
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_sessions;

-- ============================================================================
-- 3. ENABLE REALTIME ON SOCIAL FEATURES TABLES
-- ============================================================================

-- Enable realtime for friendships table
-- This allows real-time friend requests, acceptances, and status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;

-- ============================================================================
-- 4. ENABLE REALTIME ON CONTENT TABLES (OPTIONAL)
-- ============================================================================

-- Enable realtime for courses table
-- This allows real-time updates when new courses are added or modified
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;

-- Enable realtime for achievements table
-- This allows real-time updates when new achievements are added
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievements;

-- Enable realtime for study_tips table
-- This allows real-time updates when new study tips are added
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_tips;

-- Enable realtime for study_techniques table
-- This allows real-time updates when new study techniques are added
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_techniques;

-- ============================================================================
-- 5. ENABLE REALTIME ON SECURITY TABLES (OPTIONAL)
-- ============================================================================

-- Enable realtime for remember_me_sessions table (optional)
-- This allows real-time session management across devices
ALTER PUBLICATION supabase_realtime ADD TABLE public.remember_me_sessions;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this query to verify which tables have realtime enabled:
-- SELECT schemaname, tablename 
-- FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime' 
-- AND schemaname = 'public'
-- ORDER BY tablename;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================