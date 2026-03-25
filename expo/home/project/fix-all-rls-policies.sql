-- Ensure all tables have RLS enabled and proper policies

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remember_me_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can view courses" ON public.courses;

DROP POLICY IF EXISTS "Users can view their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can insert their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can update their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can delete their own user_courses" ON public.user_courses;

DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Authenticated users can view achievements" ON public.achievements;

DROP POLICY IF EXISTS "Users can view their own user_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert their own user_achievements" ON public.user_achievements;

DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can insert friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can update their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON public.friendships;

DROP POLICY IF EXISTS "Users can view their own remember_me_sessions" ON public.remember_me_sessions;
DROP POLICY IF EXISTS "Users can insert their own remember_me_sessions" ON public.remember_me_sessions;
DROP POLICY IF EXISTS "Users can update their own remember_me_sessions" ON public.remember_me_sessions;
DROP POLICY IF EXISTS "Users can delete their own remember_me_sessions" ON public.remember_me_sessions;

-- Create comprehensive RLS policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses policies (public read access)
CREATE POLICY "Authenticated users can view courses" ON public.courses
    FOR SELECT USING (auth.role() = 'authenticated');

-- User courses policies
CREATE POLICY "Users can view their own user_courses" ON public.user_courses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_courses" ON public.user_courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_courses" ON public.user_courses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user_courses" ON public.user_courses
    FOR DELETE USING (auth.uid() = user_id);

-- Achievements policies (public read access)
CREATE POLICY "Authenticated users can view achievements" ON public.achievements
    FOR SELECT USING (auth.role() = 'authenticated');

-- User achievements policies
CREATE POLICY "Users can view their own user_achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view their friendships" ON public.friendships
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert friendships" ON public.friendships
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their friendships" ON public.friendships
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their friendships" ON public.friendships
    FOR DELETE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Remember me sessions policies
CREATE POLICY "Users can view their own remember_me_sessions" ON public.remember_me_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own remember_me_sessions" ON public.remember_me_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own remember_me_sessions" ON public.remember_me_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own remember_me_sessions" ON public.remember_me_sessions
    FOR DELETE USING (auth.uid() = user_id);