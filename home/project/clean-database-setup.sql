-- Clean database setup that matches the actual database structure
-- This script ensures all tables have proper RLS policies without referencing auth.users

-- Enable RLS on all existing tables
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

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users can view courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;

DROP POLICY IF EXISTS "Users can view their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can insert their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can update their own user_courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can delete their own user_courses" ON public.user_courses;

DROP POLICY IF EXISTS "Authenticated users can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Everyone can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;

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

DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can delete their own study sessions" ON public.study_sessions;

DROP POLICY IF EXISTS "Everyone can view study tips" ON public.study_tips;
DROP POLICY IF EXISTS "Everyone can view study techniques" ON public.study_techniques;

-- Create comprehensive RLS policies that work with the actual database structure

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

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

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Could not create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_course_id_idx ON public.study_sessions(course_id);
CREATE INDEX IF NOT EXISTS study_sessions_created_at_idx ON public.study_sessions(created_at);

CREATE INDEX IF NOT EXISTS user_courses_user_id_idx ON public.user_courses(user_id);
CREATE INDEX IF NOT EXISTS user_courses_course_id_idx ON public.user_courses(course_id);

CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS user_achievements_achievement_id_idx ON public.user_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS friendships_user1_id_idx ON public.friendships(user1_id);
CREATE INDEX IF NOT EXISTS friendships_user2_id_idx ON public.friendships(user2_id);

CREATE INDEX IF NOT EXISTS remember_me_sessions_user_id_idx ON public.remember_me_sessions(user_id);
CREATE INDEX IF NOT EXISTS remember_me_sessions_token_hash_idx ON public.remember_me_sessions(token_hash);

-- Insert sample data if tables are empty
INSERT INTO public.study_tips (title, content, category)
SELECT * FROM (VALUES
    ('Pomodoro-tekniken', 'Studera i 25-minuters intervaller med 5 minuters pauser. Efter 4 intervaller, ta en längre paus på 15-30 minuter.', 'Tidshantering'),
    ('Aktiv repetition', 'Testa dig själv regelbundet istället för att bara läsa om materialet. Använd flashcards eller förklara koncepten för någon annan.', 'Minnestekniker'),
    ('Spaced repetition', 'Repetera material med ökande intervaller. Granska nytt material efter 1 dag, sedan 3 dagar, sedan 1 vecka, osv.', 'Minnestekniker'),
    ('Feynman-tekniken', 'Förklara ett koncept i enkla termer som om du undervisar en 12-åring. Detta hjälper dig identifiera kunskapsluckor.', 'Förståelse'),
    ('Mind maps', 'Skapa visuella kartor över information för att se samband mellan olika koncept och förbättra minnet.', 'Visualisering')
) AS t(title, content, category)
WHERE NOT EXISTS (SELECT 1 FROM public.study_tips LIMIT 1);

INSERT INTO public.study_techniques (title, description, instructions, duration_minutes, difficulty_level)
SELECT * FROM (VALUES
    ('Pomodoro-teknik', 'En tidshanteringsteknik som delar upp arbete i fokuserade intervaller', 'Sätt en timer på 25 minuter och fokusera helt på en uppgift. Ta sedan 5 minuters paus. Upprepa 4 gånger, ta sedan en längre paus på 15-30 minuter.', 25, 'Lätt'),
    ('Cornell-anteckningar', 'Ett strukturerat system för att ta anteckningar som förbättrar förståelse och repetition', 'Dela upp ditt papper i tre sektioner: anteckningar (höger), ledtrådar (vänster), och sammanfattning (botten). Skriv anteckningar under föreläsningen, lägg till ledtrådar efteråt, och sammanfatta i slutet.', 60, 'Medel'),
    ('SQ3R-metoden', 'Survey, Question, Read, Recite, Review - en systematisk läsmetod', 'Survey: Skanna texten snabbt. Question: Ställ frågor om innehållet. Read: Läs aktivt. Recite: Sammanfatta vad du lärt dig. Review: Granska och repetera materialet.', 90, 'Medel'),
    ('Aktiv repetition', 'Testa dig själv istället för att bara läsa om materialet', 'Skapa frågor om materialet och testa dig själv. Använd flashcards, förklara koncepten högt, eller undervisa någon annan. Fokusera på det du inte kan.', 30, 'Lätt')
) AS t(title, description, instructions, duration_minutes, difficulty_level)
WHERE NOT EXISTS (SELECT 1 FROM public.study_techniques LIMIT 1);