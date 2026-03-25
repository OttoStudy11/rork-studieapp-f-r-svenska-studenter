-- ============================================================================
-- STEP 4: USER PROGRESS, SOCIAL FEATURES, AND ACHIEVEMENTS
-- ============================================================================
-- This step creates tables for tracking user progress, social interactions,
-- study sessions, achievements, and gamification features
-- ============================================================================

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS pomodoro_sessions CASCADE;
DROP TABLE IF EXISTS study_sessions CASCADE;
DROP TABLE IF EXISTS user_assessment_results CASCADE;
DROP TABLE IF EXISTS user_exercise_attempts CASCADE;
DROP TABLE IF EXISTS user_lesson_progress CASCADE;
DROP TABLE IF EXISTS user_courses CASCADE;

-- ============================================================================
-- USER_COURSES TABLE - Tracks which courses users are enrolled in
-- ============================================================================
CREATE TABLE user_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_active BOOLEAN DEFAULT true,
    is_favorite BOOLEAN DEFAULT false,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- ============================================================================
-- USER_LESSON_PROGRESS TABLE - Tracks progress on individual lessons
-- ============================================================================
CREATE TABLE user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    time_spent_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- ============================================================================
-- USER_EXERCISE_ATTEMPTS TABLE - Tracks exercise attempts and scores
-- ============================================================================
CREATE TABLE user_exercise_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES course_exercises(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1,
    answers JSONB DEFAULT '{}'::jsonb,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 100,
    passed BOOLEAN DEFAULT false,
    time_spent_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER_ASSESSMENT_RESULTS TABLE - Tracks assessment results
-- ============================================================================
CREATE TABLE user_assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES course_assessments(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 100,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    passed BOOLEAN DEFAULT false,
    time_spent_minutes INTEGER DEFAULT 0,
    answers JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDY_SESSIONS TABLE - Tracks study sessions
-- ============================================================================
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE SET NULL,
    session_type TEXT DEFAULT 'study' CHECK (session_type IN ('study', 'review', 'practice', 'exam')),
    duration_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    notes TEXT,
    mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible') OR mood IS NULL),
    productivity_rating INTEGER CHECK (productivity_rating >= 1 AND productivity_rating <= 5 OR productivity_rating IS NULL),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- POMODORO_SESSIONS TABLE - Tracks pomodoro timer sessions
-- ============================================================================
CREATE TABLE pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    duration_minutes INTEGER DEFAULT 25,
    completed BOOLEAN DEFAULT false,
    interrupted BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FRIENDSHIPS TABLE - Manages friend relationships
-- ============================================================================
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

-- ============================================================================
-- USER_PROGRESS TABLE - Overall user progress and statistics
-- ============================================================================
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    total_study_time_minutes INTEGER DEFAULT 0,
    total_courses_enrolled INTEGER DEFAULT 0,
    total_courses_completed INTEGER DEFAULT 0,
    total_lessons_completed INTEGER DEFAULT 0,
    total_exercises_completed INTEGER DEFAULT 0,
    total_assessments_passed INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_study_date DATE,
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACHIEVEMENTS TABLE - Defines available achievements
-- ============================================================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    category TEXT NOT NULL CHECK (category IN ('study_time', 'courses', 'lessons', 'exercises', 'assessments', 'streak', 'social', 'special')),
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('count', 'streak', 'percentage', 'special')),
    requirement_value INTEGER DEFAULT 0,
    points INTEGER DEFAULT 10,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER_ACHIEVEMENTS TABLE - Tracks unlocked achievements
-- ============================================================================
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User courses indexes
CREATE INDEX idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX idx_user_courses_active ON user_courses(user_id, is_active);
CREATE INDEX idx_user_courses_progress ON user_courses(user_id, progress);

-- User lesson progress indexes
CREATE INDEX idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_course_id ON user_lesson_progress(course_id);
CREATE INDEX idx_user_lesson_progress_status ON user_lesson_progress(user_id, status);
CREATE INDEX idx_user_lesson_progress_composite ON user_lesson_progress(user_id, course_id, status);

-- User exercise attempts indexes
CREATE INDEX idx_user_exercise_attempts_user_id ON user_exercise_attempts(user_id);
CREATE INDEX idx_user_exercise_attempts_exercise_id ON user_exercise_attempts(exercise_id);
CREATE INDEX idx_user_exercise_attempts_score ON user_exercise_attempts(user_id, score);

-- User assessment results indexes
CREATE INDEX idx_user_assessment_results_user_id ON user_assessment_results(user_id);
CREATE INDEX idx_user_assessment_results_assessment_id ON user_assessment_results(assessment_id);
CREATE INDEX idx_user_assessment_results_passed ON user_assessment_results(user_id, passed);

-- Study sessions indexes
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_course_id ON study_sessions(course_id);
CREATE INDEX idx_study_sessions_started_at ON study_sessions(user_id, started_at);

-- Pomodoro sessions indexes
CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_course_id ON pomodoro_sessions(course_id);
CREATE INDEX idx_pomodoro_sessions_completed ON pomodoro_sessions(user_id, completed);

-- Friendships indexes
CREATE INDEX idx_friendships_user1_id ON friendships(user1_id);
CREATE INDEX idx_friendships_user2_id ON friendships(user2_id);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_friendships_composite ON friendships(user1_id, user2_id, status);

-- User progress indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_level ON user_progress(level);
CREATE INDEX idx_user_progress_points ON user_progress(total_points);

-- Achievements indexes
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

-- User achievements indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_user_courses_updated_at BEFORE UPDATE ON user_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON user_lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- User courses policies
CREATE POLICY "Users can view their own courses"
    ON user_courses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses"
    ON user_courses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
    ON user_courses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses"
    ON user_courses FOR DELETE
    USING (auth.uid() = user_id);

-- User lesson progress policies
CREATE POLICY "Users can view their own lesson progress"
    ON user_lesson_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress"
    ON user_lesson_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress"
    ON user_lesson_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lesson progress"
    ON user_lesson_progress FOR DELETE
    USING (auth.uid() = user_id);

-- User exercise attempts policies
CREATE POLICY "Users can view their own exercise attempts"
    ON user_exercise_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise attempts"
    ON user_exercise_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User assessment results policies
CREATE POLICY "Users can view their own assessment results"
    ON user_assessment_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment results"
    ON user_assessment_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view their own study sessions"
    ON study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
    ON study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
    ON study_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions"
    ON study_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Pomodoro sessions policies
CREATE POLICY "Users can view their own pomodoro sessions"
    ON pomodoro_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro sessions"
    ON pomodoro_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro sessions"
    ON pomodoro_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pomodoro sessions"
    ON pomodoro_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view their own friendships"
    ON friendships FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert friendships"
    ON friendships FOR INSERT
    WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Users can update their friendships"
    ON friendships FOR UPDATE
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their friendships"
    ON friendships FOR DELETE
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- User progress policies
CREATE POLICY "Users can view their own progress"
    ON user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view other users' progress"
    ON user_progress FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own progress"
    ON user_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON user_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Achievements policies (public read)
CREATE POLICY "Achievements are viewable by everyone"
    ON achievements FOR SELECT
    USING (true);

CREATE POLICY "Achievements are insertable by authenticated users"
    ON achievements FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view other users' achievements"
    ON user_achievements FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update user progress when a lesson is completed
CREATE OR REPLACE FUNCTION update_user_progress_on_lesson_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        INSERT INTO user_progress (user_id, total_lessons_completed, updated_at)
        VALUES (NEW.user_id, 1, NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET total_lessons_completed = user_progress.total_lessons_completed + 1,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progress_on_lesson_complete
    AFTER INSERT OR UPDATE ON user_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress_on_lesson_complete();

-- Function to update user progress when an exercise is completed
CREATE OR REPLACE FUNCTION update_user_progress_on_exercise_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL THEN
        INSERT INTO user_progress (user_id, total_exercises_completed, updated_at)
        VALUES (NEW.user_id, 1, NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET total_exercises_completed = user_progress.total_exercises_completed + 1,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progress_on_exercise_complete
    AFTER INSERT OR UPDATE ON user_exercise_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress_on_exercise_complete();

-- Function to update user progress when an assessment is passed
CREATE OR REPLACE FUNCTION update_user_progress_on_assessment_pass()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.passed = true THEN
        INSERT INTO user_progress (user_id, total_assessments_passed, updated_at)
        VALUES (NEW.user_id, 1, NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET total_assessments_passed = user_progress.total_assessments_passed + 1,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progress_on_assessment_pass
    AFTER INSERT OR UPDATE ON user_assessment_results
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress_on_assessment_pass();

-- Function to update study time
CREATE OR REPLACE FUNCTION update_study_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ended_at IS NOT NULL THEN
        INSERT INTO user_progress (user_id, total_study_time_minutes, last_study_date, updated_at)
        VALUES (NEW.user_id, NEW.duration_minutes, CURRENT_DATE, NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET total_study_time_minutes = user_progress.total_study_time_minutes + NEW.duration_minutes,
            last_study_date = CURRENT_DATE,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_study_time
    AFTER INSERT OR UPDATE ON study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_study_time();

-- Function to search for users by username or display name
CREATE OR REPLACE FUNCTION search_users(search_query TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    gymnasium TEXT,
    program TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.display_name,
        p.avatar_url,
        p.gymnasium,
        p.program
    FROM profiles p
    WHERE 
        p.username ILIKE '%' || search_query || '%' OR
        p.display_name ILIKE '%' || search_query || '%'
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENABLE REALTIME FOR ALL TABLES
-- ============================================================================

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_courses;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_lesson_progress;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_exercise_attempts;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_assessment_results;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE study_sessions;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE pomodoro_sessions;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE friendships;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_progress;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE achievements;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_achievements;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ============================================================================
-- STEP 4 COMPLETE
-- ============================================================================
-- This completes the database schema setup!
-- All tables, indexes, RLS policies, and triggers are now in place.
-- ============================================================================
