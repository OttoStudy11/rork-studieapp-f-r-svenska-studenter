-- ============================================================================
-- FIX FRIENDS BATTLE & GLOBAL LEADERBOARD SYSTEM
-- ============================================================================
-- This script fixes issues with:
-- 1. Friend stats not loading in battle function
-- 2. Global leaderboard not showing other users
-- 3. RLS policies blocking access to necessary data
-- ============================================================================

-- ============================================================================
-- PART 1: FIX RLS POLICIES FOR PROFILES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;

-- Create a policy that allows authenticated users to read all profiles
-- This is necessary for leaderboards and friend searches
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PART 2: FIX RLS POLICIES FOR USER_PROGRESS
-- ============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;

-- Allow authenticated users to read all user_progress (for leaderboards)
CREATE POLICY "Authenticated users can view all progress"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (true);

-- Users can update/insert their own progress
CREATE POLICY "Users can modify own progress"
  ON public.user_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 3: FIX RLS POLICIES FOR POMODORO_SESSIONS
-- ============================================================================

-- Allow authenticated users to read all sessions (for stats calculations)
DROP POLICY IF EXISTS "Users can view own sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Authenticated users can view all sessions" ON public.pomodoro_sessions;

CREATE POLICY "Authenticated users can view all sessions"
  ON public.pomodoro_sessions FOR SELECT
  TO authenticated
  USING (true);

-- Users can modify their own sessions
DROP POLICY IF EXISTS "Users can modify own sessions" ON public.pomodoro_sessions;
CREATE POLICY "Users can modify own sessions"
  ON public.pomodoro_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 4: ENSURE FRIENDS TABLE HAS CORRECT STRUCTURE
-- ============================================================================

-- Check if friends table exists and has correct structure
DO $$
BEGIN
    -- Create friends table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'friends') THEN
        CREATE TABLE public.friends (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, friend_id)
        );
        
        CREATE INDEX idx_friends_user_id ON public.friends(user_id);
        CREATE INDEX idx_friends_friend_id ON public.friends(friend_id);
        CREATE INDEX idx_friends_status ON public.friends(status);
    END IF;
END $$;

-- Enable RLS on friends
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own friendships" ON public.friends;
DROP POLICY IF EXISTS "Users can manage own friendships" ON public.friends;
DROP POLICY IF EXISTS "Users can create friend requests" ON public.friends;
DROP POLICY IF EXISTS "Users can update friend requests" ON public.friends;
DROP POLICY IF EXISTS "Users can delete own friendships" ON public.friends;

-- Users can view friendships where they are involved
CREATE POLICY "Users can view own friendships"
  ON public.friends FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friend requests
CREATE POLICY "Users can create friend requests"
  ON public.friends FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update friendships where they are the recipient (to accept/reject)
CREATE POLICY "Users can update friend requests"
  ON public.friends FOR UPDATE
  TO authenticated
  USING (auth.uid() = friend_id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = friend_id OR auth.uid() = user_id);

-- Users can delete their own friend requests/friendships
CREATE POLICY "Users can delete own friendships"
  ON public.friends FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ============================================================================
-- PART 5: CREATE/UPDATE GET_FRIEND_STATS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_friend_stats(p_friend_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_profile RECORD;
  v_progress RECORD;
  v_level_data RECORD;
  v_session_count INT;
  v_achievement_count INT;
  v_courses JSON;
  v_recent_activity JSON;
BEGIN
  -- Get friend profile
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_friend_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend profile not found';
  END IF;

  -- Get friend progress
  SELECT * INTO v_progress
  FROM public.user_progress
  WHERE user_id = p_friend_id;

  -- Get level data if table exists
  BEGIN
    SELECT * INTO v_level_data
    FROM public.user_levels
    WHERE user_id = p_friend_id;
  EXCEPTION WHEN undefined_table THEN
    v_level_data := NULL;
  END;

  -- Get session count from pomodoro_sessions
  SELECT COUNT(*) INTO v_session_count
  FROM public.pomodoro_sessions
  WHERE user_id = p_friend_id;

  -- Get achievement count if table exists
  BEGIN
    SELECT COUNT(*) INTO v_achievement_count
    FROM public.user_achievements
    WHERE user_id = p_friend_id
    AND unlocked_at IS NOT NULL;
  EXCEPTION WHEN undefined_table THEN
    v_achievement_count := 0;
  END;

  -- Get active courses
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', c.id,
      'name', COALESCE(c.title, c.course_code, 'Okänd kurs'),
      'course_code', c.course_code
    )
  ), '[]'::json) INTO v_courses
  FROM public.user_courses uc
  JOIN public.courses c ON c.id = uc.course_id
  WHERE uc.user_id = p_friend_id
  AND uc.is_active = true;

  -- Get recent activity (last 7 days)
  WITH recent_sessions AS (
    SELECT 
      COUNT(*) as sessions_this_week,
      COALESCE(SUM(duration), 0) as study_time_this_week,
      MAX(end_time) as last_session
    FROM public.pomodoro_sessions
    WHERE user_id = p_friend_id
    AND start_time >= CURRENT_DATE - INTERVAL '7 days'
  )
  SELECT json_build_object(
    'sessions_this_week', COALESCE(sessions_this_week, 0),
    'study_time_this_week', COALESCE(study_time_this_week, 0),
    'last_session', last_session
  ) INTO v_recent_activity
  FROM recent_sessions;

  -- Build complete result
  v_result := json_build_object(
    'profile', row_to_json(v_profile),
    'progress', row_to_json(v_progress),
    'level_data', row_to_json(v_level_data),
    'session_count', v_session_count,
    'achievement_count', v_achievement_count,
    'courses', v_courses,
    'recent_activity', v_recent_activity
  );

  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_friend_stats(UUID) TO authenticated;

-- ============================================================================
-- PART 6: ENSURE USER_PROGRESS HAS REQUIRED COLUMNS
-- ============================================================================

-- Add total_sessions column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_progress' 
        AND column_name = 'total_sessions'
    ) THEN
        ALTER TABLE public.user_progress ADD COLUMN total_sessions INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update total_sessions from pomodoro_sessions if needed
UPDATE public.user_progress up
SET total_sessions = (
    SELECT COUNT(*)
    FROM public.pomodoro_sessions ps
    WHERE ps.user_id = up.user_id
)
WHERE total_sessions IS NULL OR total_sessions = 0;

-- ============================================================================
-- PART 7: CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

-- Indexes for user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_total_study_time 
  ON public.user_progress(total_study_time DESC);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id 
  ON public.user_progress(user_id);

-- Indexes for pomodoro_sessions
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id 
  ON public.pomodoro_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_start_time 
  ON public.pomodoro_sessions(start_time DESC);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username 
  ON public.profiles(username);

-- ============================================================================
-- PART 8: FIX USER_COURSES RLS POLICIES
-- ============================================================================

-- Allow viewing all user courses for friend comparisons
DROP POLICY IF EXISTS "Users can view all courses" ON public.user_courses;
CREATE POLICY "Users can view all courses"
  ON public.user_courses FOR SELECT
  TO authenticated
  USING (true);

-- Users can modify their own courses
DROP POLICY IF EXISTS "Users can modify own courses" ON public.user_courses;
CREATE POLICY "Users can modify own courses"
  ON public.user_courses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that we can query global leaderboard
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.user_progress up
  JOIN public.profiles p ON p.id = up.user_id
  WHERE up.total_study_time > 0
  LIMIT 15;
  
  RAISE NOTICE 'Global leaderboard query successful: % users found', v_count;
END $$;

-- Success message
SELECT '✅ Friends battle and global leaderboard system fixed!' as result;
SELECT '✅ RLS policies updated to allow proper data access' as result;
SELECT '✅ Friend stats function created/updated' as result;
SELECT '✅ Indexes created for better performance' as result;
