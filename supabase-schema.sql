-- Drop all tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS pomodoro_sessions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS user_courses CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
-- Drop the function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (links to Supabase Auth users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    level TEXT NOT NULL CHECK (level IN ('gymnasie', 'högskola')),
    program TEXT NOT NULL,
    purpose TEXT NOT NULL,
    subscription_type TEXT NOT NULL DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
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

-- User-Course relationship table
CREATE TABLE user_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_active BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, course_id)
);

-- Notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pomodoro sessions table
CREATE TABLE pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0)
);

-- Friends table
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    dark_mode BOOLEAN DEFAULT FALSE,
    timer_focus INTEGER DEFAULT 25 CHECK (timer_focus > 0),
    timer_break INTEGER DEFAULT 5 CHECK (timer_break > 0),
    notifications BOOLEAN DEFAULT TRUE,
    language TEXT DEFAULT 'sv' CHECK (language IN ('sv', 'en'))
);

-- Create indexes for better performance
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for notes table
CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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

-- Disable Row Level Security (RLS) för demo
-- (I produktion: ENABLE RLS + policies)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;