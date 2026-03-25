-- Complete RLS setup with proper policies for all tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_techniques ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all courses" ON courses;
DROP POLICY IF EXISTS "Users can create courses" ON courses;
DROP POLICY IF EXISTS "Users can view own study sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can create own study sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can update own study sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can view all achievements" ON achievements;
DROP POLICY IF EXISTS "Users can view own user achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can create own user achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view friendships" ON friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON friendships;
DROP POLICY IF EXISTS "Users can delete friendships" ON friendships;
DROP POLICY IF EXISTS "Users can view all study tips" ON study_tips;
DROP POLICY IF EXISTS "Users can view all study techniques" ON study_techniques;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses policies (all users can view and create courses)
CREATE POLICY "Users can view all courses" ON courses
    FOR SELECT USING (true);

CREATE POLICY "Users can create courses" ON courses
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Study sessions policies
CREATE POLICY "Users can view own study sessions" ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions" ON study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies (all users can view achievements)
CREATE POLICY "Users can view all achievements" ON achievements
    FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view own user achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own user achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view friendships" ON friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" ON friendships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete friendships" ON friendships
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Study tips policies (all users can view)
CREATE POLICY "Users can view all study tips" ON study_tips
    FOR SELECT USING (true);

-- Study techniques policies (all users can view)
CREATE POLICY "Users can view all study techniques" ON study_techniques
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;