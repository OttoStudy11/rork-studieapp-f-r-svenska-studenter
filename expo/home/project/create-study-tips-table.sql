-- Create study_tips table
CREATE TABLE IF NOT EXISTS public.study_tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.study_tips ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read study tips
CREATE POLICY "Allow public read access to study_tips" ON public.study_tips
    FOR SELECT USING (true);

-- Insert some sample study tips
INSERT INTO public.study_tips (title, content, category) VALUES
('Pomodoro Technique', 'Study for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.', 'Time Management'),
('Active Recall', 'Instead of just re-reading notes, actively test yourself by trying to recall information without looking.', 'Memory'),
('Spaced Repetition', 'Review material at increasing intervals: 1 day, 3 days, 1 week, 2 weeks, 1 month.', 'Memory'),
('Feynman Technique', 'Explain concepts in simple terms as if teaching someone else. This reveals gaps in understanding.', 'Understanding'),
('Mind Mapping', 'Create visual diagrams connecting related concepts to see the big picture and relationships.', 'Organization'),
('Environment Setup', 'Find a quiet, well-lit space dedicated to studying. Remove distractions like phones and social media.', 'Environment'),
('Sleep and Study', 'Get 7-9 hours of sleep. Your brain consolidates memories during sleep, making it crucial for learning.', 'Health'),
('Exercise Breaks', 'Take short exercise breaks during study sessions. Physical activity improves focus and memory.', 'Health'),
('Note-Taking Methods', 'Try the Cornell Note-Taking System: divide pages into notes, cues, and summary sections.', 'Organization'),
('Goal Setting', 'Set specific, measurable study goals for each session. "Study math" vs "Complete 10 algebra problems".', 'Planning');