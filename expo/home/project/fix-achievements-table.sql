-- Fix achievements table structure

-- First, check if achievements table exists and drop it if it has wrong structure
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;

-- Create achievements table with correct structure
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    type TEXT NOT NULL,
    requirement INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (id, name, description, icon, type, requirement) VALUES
    ('first_session', 'Första steget', 'Genomför din första studiesession', 'Play', 'sessions', 1),
    ('early_bird', 'Morgonpiggen', 'Studera före 09:00', 'Sunrise', 'special', 1),
    ('night_owl', 'Nattuggle', 'Studera efter 22:00', 'Moon', 'special', 1),
    ('pomodoro_master', 'Pomodoro-mästare', 'Genomför 25 pomodoro-sessioner', 'Timer', 'sessions', 25),
    ('marathon_runner', 'Maratonlöpare', 'Studera i 3 timmar på en dag', 'Zap', 'study_time', 180),
    ('week_warrior', 'Veckokrigare', 'Studera 7 dagar i rad', 'Calendar', 'streak', 7),
    ('dedication', 'Hängivenhet', 'Studera 30 dagar i rad', 'Award', 'streak', 30),
    ('course_master', 'Kursmästare', 'Slutför din första kurs', 'BookOpen', 'course_completion', 1),
    ('scholar', 'Lärd', 'Ackumulera 100 timmars studietid', 'GraduationCap', 'study_time', 6000),
    ('perfectionist', 'Perfektionist', 'Slutför 5 kurser', 'Star', 'course_completion', 5)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON public.achievements(type);