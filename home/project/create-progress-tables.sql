-- Create progress tracking tables

-- Create achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    type TEXT NOT NULL,
    requirement INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Create study_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    technique TEXT DEFAULT 'pomodoro',
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table for caching computed values
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    total_study_time INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    last_study_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own study sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON public.study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions" ON public.study_sessions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON public.study_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_study_sessions_course_id ON public.study_sessions(course_id);

-- Create function to update user progress automatically
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_progress (user_id, total_study_time, total_sessions, updated_at)
    VALUES (
        NEW.user_id,
        (SELECT COALESCE(SUM(duration_minutes), 0) FROM public.study_sessions WHERE user_id = NEW.user_id),
        (SELECT COUNT(*) FROM public.study_sessions WHERE user_id = NEW.user_id),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_study_time = (SELECT COALESCE(SUM(duration_minutes), 0) FROM public.study_sessions WHERE user_id = NEW.user_id),
        total_sessions = (SELECT COUNT(*) FROM public.study_sessions WHERE user_id = NEW.user_id),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update user progress
DROP TRIGGER IF EXISTS trigger_update_user_progress ON public.study_sessions;
CREATE TRIGGER trigger_update_user_progress
    AFTER INSERT OR UPDATE OR DELETE ON public.study_sessions
    FOR EACH ROW EXECUTE FUNCTION update_user_progress();