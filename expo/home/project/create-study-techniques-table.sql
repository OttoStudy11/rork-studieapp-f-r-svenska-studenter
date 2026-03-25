-- Create study_techniques table
CREATE TABLE IF NOT EXISTS public.study_techniques (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    difficulty_level TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.study_techniques ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read study techniques
CREATE POLICY "Allow public read access to study_techniques" ON public.study_techniques
    FOR SELECT USING (true);

-- Insert some sample study techniques
INSERT INTO public.study_techniques (title, description, instructions, difficulty_level, duration_minutes) VALUES
('Pomodoro Technique', 'A time management method using focused work intervals', '1. Set timer for 25 minutes\n2. Work on single task\n3. Take 5-minute break\n4. Repeat 4 times\n5. Take longer break', 'Beginner', 25),
('Active Recall', 'Testing yourself to strengthen memory retention', '1. Read material once\n2. Close book/notes\n3. Write down everything you remember\n4. Check accuracy\n5. Focus on gaps', 'Intermediate', 30),
('Spaced Repetition', 'Reviewing information at increasing intervals', '1. Learn new material\n2. Review after 1 day\n3. Review after 3 days\n4. Review after 1 week\n5. Continue increasing intervals', 'Intermediate', 15),
('Feynman Technique', 'Learning by teaching concepts in simple terms', '1. Choose a concept\n2. Explain it simply\n3. Identify knowledge gaps\n4. Go back to source material\n5. Simplify and use analogies', 'Advanced', 45),
('Mind Mapping', 'Visual representation of information and connections', '1. Write main topic in center\n2. Add main branches\n3. Add sub-branches\n4. Use colors and images\n5. Review connections', 'Beginner', 20),
('Cornell Note-Taking', 'Systematic format for organizing notes', '1. Divide page into 3 sections\n2. Take notes in main area\n3. Add cues in left margin\n4. Summarize at bottom\n5. Review regularly', 'Beginner', 60),
('SQ3R Method', 'Survey, Question, Read, Recite, Review', '1. Survey the material\n2. Generate questions\n3. Read actively\n4. Recite key points\n5. Review everything', 'Intermediate', 90),
('Elaborative Interrogation', 'Asking "why" questions to deepen understanding', '1. Read a fact or concept\n2. Ask "Why is this true?"\n3. Generate explanations\n4. Verify with sources\n5. Connect to prior knowledge', 'Advanced', 40);