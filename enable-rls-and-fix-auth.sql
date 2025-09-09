-- Enable RLS and Fix Authentication for StudyFlow App
-- This script will properly configure RLS and connect to Supabase Auth

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all existing tables to start fresh with proper auth integration
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS remember_me_sessions CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS pomodoro_sessions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS user_courses CASCADE;
DROP TABLE IF EXISTS program_courses CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_remember_me_sessions() CASCADE;
DROP FUNCTION IF EXISTS check_rls_status() CASCADE;

-- Create programs table first (referenced by profiles)
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('gymnasie','högskola')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table (PROPERLY CONNECTED TO AUTH.USERS)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    level TEXT NOT NULL CHECK (level IN ('gymnasie', 'högskola')),
    program TEXT NOT NULL,
    program_id UUID REFERENCES programs(id),
    purpose TEXT NOT NULL,
    subscription_type TEXT NOT NULL DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('gymnasie', 'högskola')),
    resources JSONB DEFAULT '[]'::jsonb,
    tips JSONB DEFAULT '[]'::jsonb,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    related_courses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create program_courses junction table
CREATE TABLE program_courses (
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id  UUID NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
    PRIMARY KEY (program_id, course_id)
);

-- Create user_courses table
CREATE TABLE user_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_active BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, course_id)
);

-- Create notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pomodoro_sessions table
CREATE TABLE pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0)
);

-- Create friends table
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Create settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    dark_mode BOOLEAN DEFAULT FALSE,
    timer_focus INTEGER DEFAULT 25 CHECK (timer_focus > 0),
    timer_break INTEGER DEFAULT 5 CHECK (timer_break > 0),
    notifications BOOLEAN DEFAULT TRUE,
    language TEXT DEFAULT 'sv' CHECK (language IN ('sv', 'en'))
);

-- Create achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    achievement_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('study', 'social', 'streak', 'milestone')),
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('study_time', 'sessions', 'courses', 'notes', 'streak', 'friends')),
    requirement_target INTEGER NOT NULL CHECK (requirement_target > 0),
    requirement_timeframe TEXT CHECK (requirement_timeframe IN ('day', 'week', 'month', 'total')),
    reward_points INTEGER NOT NULL DEFAULT 0,
    reward_badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Create remember_me_sessions table
CREATE TABLE remember_me_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    device_info JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create all indexes for better performance
CREATE INDEX idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX idx_user_courses_active ON user_courses(user_id, is_active);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_course_id ON notes(course_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_start_time ON pomodoro_sessions(start_time DESC);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_id ON friends(friend_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_subject ON courses(subject);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_key ON achievements(achievement_key);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(user_id, unlocked_at);
CREATE INDEX idx_user_achievements_progress ON user_achievements(user_id, progress);
CREATE INDEX idx_remember_me_sessions_user_id ON remember_me_sessions(user_id);
CREATE INDEX idx_remember_me_sessions_token ON remember_me_sessions(token_hash);
CREATE INDEX idx_remember_me_sessions_expires ON remember_me_sessions(expires_at);
CREATE INDEX idx_remember_me_sessions_active ON remember_me_sessions(is_active, expires_at);
CREATE INDEX idx_programs_name ON programs (name);
CREATE INDEX idx_profiles_program_id ON profiles (program_id);
CREATE INDEX idx_profiles_email ON profiles (email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at 
    BEFORE UPDATE ON user_achievements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired remember me sessions
CREATE OR REPLACE FUNCTION cleanup_expired_remember_me_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM remember_me_sessions 
    WHERE expires_at < NOW() OR is_active = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ENABLE ROW LEVEL SECURITY FOR ALL TABLES
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

-- CREATE RLS POLICIES

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Programs and courses are public (read-only for users)
CREATE POLICY "Programs are viewable by everyone" ON programs
    FOR SELECT USING (true);

CREATE POLICY "Courses are viewable by everyone" ON courses
    FOR SELECT USING (true);

CREATE POLICY "Program courses are viewable by everyone" ON program_courses
    FOR SELECT USING (true);

-- User courses policies
CREATE POLICY "Users can view their own courses" ON user_courses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses" ON user_courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses" ON user_courses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses" ON user_courses
    FOR DELETE USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- Quizzes are public (read-only)
CREATE POLICY "Quizzes are viewable by everyone" ON quizzes
    FOR SELECT USING (true);

-- Pomodoro sessions policies
CREATE POLICY "Users can view their own sessions" ON pomodoro_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON pomodoro_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON pomodoro_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON pomodoro_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Friends policies
CREATE POLICY "Users can view their own friends" ON friends
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert their own friend requests" ON friends
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friend requests involving them" ON friends
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friend relationships" ON friends
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Settings policies
CREATE POLICY "Users can view their own settings" ON settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON settings
    FOR DELETE USING (auth.uid() = user_id);

-- Achievements are public (read-only)
CREATE POLICY "Achievements are viewable by everyone" ON achievements
    FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Remember me sessions policies
CREATE POLICY "Users can view their own remember me sessions" ON remember_me_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own remember me sessions" ON remember_me_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own remember me sessions" ON remember_me_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own remember me sessions" ON remember_me_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, level, program, purpose)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'gymnasie',
    'Ej valt',
    'Förbättra mina studieresultat'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample programs
INSERT INTO programs (name, level) VALUES
  ('Teknikprogrammet', 'gymnasie'),
  ('Industritekniska programmet', 'gymnasie'),
  ('Ekonomiprogrammet', 'gymnasie'),
  ('Naturvetenskapsprogrammet', 'gymnasie'),
  ('Vård- och omsorgsprogrammet', 'gymnasie'),
  ('Civilingenjör Datateknik', 'högskola'),
  ('Ekonomi', 'högskola'),
  ('Psykologi', 'högskola'),
  ('Medicin', 'högskola'),
  ('Juridik', 'högskola')
ON CONFLICT (name) DO NOTHING;

-- Insert sample courses for gymnasie
INSERT INTO courses (title, description, subject, level, resources, tips, progress, related_courses) VALUES
('Matematik 3c', 'Avancerad matematik för naturvetenskapsprogrammet med fokus på funktioner, derivata och integraler', 'Matematik', 'gymnasie', 
 '["Kursbok kapitel 1-5", "Övningsuppgifter online", "Grafräknare TI-84", "Formelsamling"]'::jsonb,
 '["Öva på gamla prov regelbundet", "Använd grafräknare effektivt", "Rita grafer för att förstå funktioner", "Gör många övningsuppgifter"]'::jsonb,
 0, '[]'::jsonb),

('Fysik 2', 'Mekanik, termodynamik, vågor och optik för naturvetenskapsprogrammet', 'Fysik', 'gymnasie',
 '["Lärobok Fysik 2", "Laborationsrapporter", "Formelsamling", "Simuleringar online"]'::jsonb,
 '["Förstå grundläggande formler", "Rita diagram för problemlösning", "Koppla teori till verklighet", "Gör laborationer noggrant"]'::jsonb,
 0, '[]'::jsonb),

('Svenska 3', 'Litteraturanalys, språkutveckling och kommunikation', 'Svenska', 'gymnasie',
 '["Kurslitteratur", "Språkbok", "Ordbok", "Litteraturhistoria"]'::jsonb,
 '["Läs mycket för att utveckla språkkänsla", "Öva på textanalys", "Skriv regelbundet", "Diskutera texter med andra"]'::jsonb,
 0, '[]'::jsonb),

('Engelska 7', 'Avancerad engelska med fokus på akademisk kommunikation', 'Engelska', 'gymnasie',
 '["Course book", "Grammar reference", "Dictionary", "Online resources"]'::jsonb,
 '["Practice speaking daily", "Read English literature", "Watch English media", "Write essays regularly"]'::jsonb,
 0, '[]'::jsonb),

('Kemi 2', 'Organisk kemi, biokemi och kemisk bindning', 'Kemi', 'gymnasie',
 '["Kemibok", "Periodiska systemet", "Laborationsutrustning", "Molekylmodeller"]'::jsonb,
 '["Lär dig periodiska systemet", "Förstå kemiska reaktioner", "Öva på formler", "Gör laborationer säkert"]'::jsonb,
 0, '[]'::jsonb);

-- Insert sample courses for högskola
INSERT INTO courses (title, description, subject, level, resources, tips, progress, related_courses) VALUES
('Linjär Algebra', 'Grundläggande linjär algebra för ingenjörer och matematiker', 'Matematik', 'högskola',
 '["Kurslitteratur: Linear Algebra", "Föreläsningsanteckningar", "MATLAB/Python", "Övningsuppgifter"]'::jsonb,
 '["Öva på matrisoperationer dagligen", "Förstå geometrisk tolkning", "Använd datorverktyg", "Jobba i studiegrupper"]'::jsonb,
 0, '[]'::jsonb),

('Programmering Grundkurs', 'Introduktion till programmering med Python', 'Datavetenskap', 'högskola',
 '["Python dokumentation", "Kodexempel", "IDE (PyCharm/VSCode)", "Online tutorials"]'::jsonb,
 '["Öva dagligen - kod varje dag", "Bygg egna projekt", "Läs andras kod", "Använd version control (Git)"]'::jsonb,
 0, '[]'::jsonb),

('Mikroekonomi', 'Grundläggande mikroekonomisk teori och tillämpningar', 'Ekonomi', 'högskola',
 '["Kurslitteratur", "Ekonomiska modeller", "Statistikprogram", "Case studies"]'::jsonb,
 '["Förstå grundläggande begrepp", "Öva på grafer och modeller", "Koppla teori till verklighet", "Diskutera i grupper"]'::jsonb,
 0, '[]'::jsonb),

('Organisk Kemi', 'Avancerad organisk kemi för kemister och kemingenjörer', 'Kemi', 'högskola',
 '["Organic Chemistry textbook", "Molekylmodeller", "Spektroskopi data", "Laborationsmanual"]'::jsonb,
 '["Lär dig reaktionsmekanismer", "Öva på strukturformler", "Förstå stereokemi", "Koppla struktur till funktion"]'::jsonb,
 0, '[]'::jsonb),

('Psykologi Grundkurs', 'Introduktion till psykologins olika områden', 'Psykologi', 'högskola',
 '["Psykologibok", "Forskningsartiklar", "Statistikprogram", "Fallstudier"]'::jsonb,
 '["Läs forskningsartiklar kritiskt", "Förstå statistiska metoder", "Koppla teori till praktik", "Reflektera över egna erfarenheter"]'::jsonb,
 0, '[]'::jsonb);

-- Link courses to programs
WITH p AS (SELECT id, name FROM programs),
c AS (SELECT id, title FROM courses)
INSERT INTO program_courses (program_id, course_id)
SELECT p.id, c.id FROM p
JOIN c ON (
  (p.name IN ('Teknikprogrammet','Naturvetenskapsprogrammet') AND c.title IN ('Matematik 3c','Fysik 2','Kemi 2','Engelska 7','Svenska 3'))
  OR
  (p.name = 'Industritekniska programmet' AND c.title IN ('Matematik 3c','Fysik 2','Svenska 3'))
  OR
  (p.name = 'Ekonomiprogrammet' AND c.title IN ('Svenska 3','Engelska 7'))
  OR
  (p.name = 'Vård- och omsorgsprogrammet' AND c.title IN ('Svenska 3'))
  OR
  (p.name = 'Civilingenjör Datateknik' AND c.title IN ('Linjär Algebra','Programmering Grundkurs'))
  OR
  (p.name = 'Ekonomi' AND c.title IN ('Mikroekonomi'))
  OR
  (p.name = 'Psykologi' AND c.title IN ('Psykologi Grundkurs'))
)
ON CONFLICT DO NOTHING;

-- Insert predefined achievements
INSERT INTO achievements (achievement_key, title, description, icon, category, requirement_type, requirement_target, requirement_timeframe, reward_points, reward_badge) VALUES
-- Study Time Achievements
('first_session', 'Första steget', 'Genomför din första studiesession', '🎯', 'study', 'sessions', 1, 'total', 10, NULL),
('study_warrior', 'Studiekriger', 'Plugga 60 minuter på en dag', '⚔️', 'study', 'study_time', 60, 'day', 25, NULL),
('marathon_student', 'Maratonstudent', 'Plugga 300 minuter på en vecka', '🏃‍♂️', 'study', 'study_time', 300, 'week', 50, NULL),
('dedication_master', 'Hängivenhetsmästare', 'Plugga 1000 minuter totalt', '👑', 'milestone', 'study_time', 1000, 'total', 100, 'dedication'),

-- Streak Achievements
('consistency_starter', 'Konsekvensstartare', 'Plugga 3 dagar i rad', '🔥', 'streak', 'streak', 3, NULL, 30, NULL),
('week_warrior', 'Veckokriger', 'Plugga 7 dagar i rad', '🔥🔥', 'streak', 'streak', 7, NULL, 75, NULL),
('unstoppable', 'Ostoppbar', 'Plugga 30 dagar i rad', '🔥🔥🔥', 'streak', 'streak', 30, NULL, 200, 'unstoppable'),

-- Course Achievements
('course_collector', 'Kurssamlare', 'Lägg till 5 kurser', '📚', 'milestone', 'courses', 5, 'total', 20, NULL),
('note_taker', 'Anteckningstagare', 'Skriv 10 anteckningar', '📝', 'milestone', 'notes', 10, 'total', 15, NULL),
('prolific_writer', 'Produktiv skribent', 'Skriv 50 anteckningar', '✍️', 'milestone', 'notes', 50, 'total', 60, NULL),

-- Session Achievements
('session_master', 'Sessionsmästare', 'Genomför 25 studiesessioner', '🎖️', 'milestone', 'sessions', 25, 'total', 40, NULL),
('century_club', 'Hundraklubben', 'Genomför 100 studiesessioner', '💯', 'milestone', 'sessions', 100, 'total', 150, 'century'),

-- Daily Achievements
('early_bird', 'Morgonpigg', 'Starta en session före 08:00', '🌅', 'study', 'sessions', 1, 'day', 15, NULL),
('night_owl', 'Nattuggla', 'Starta en session efter 22:00', '🦉', 'study', 'sessions', 1, 'day', 15, NULL);

-- Verify the setup by selecting from key tables
SELECT 'Programs created:' as info, count(*) as count FROM programs
UNION ALL
SELECT 'Courses created:', count(*) FROM courses
UNION ALL
SELECT 'Achievements created:', count(*) FROM achievements;

-- Final message
SELECT 'Database setup complete! RLS enabled with proper auth integration.' as status;