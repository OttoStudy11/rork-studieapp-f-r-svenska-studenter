-- Complete Högskoleprovet (Swedish University Entrance Exam) System
-- This system allows students to practice all sections of the högskoleprovet

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_hp_test_attempts CASCADE;
DROP TABLE IF EXISTS user_hp_question_answers CASCADE;
DROP TABLE IF EXISTS hp_questions CASCADE;
DROP TABLE IF EXISTS hp_sections CASCADE;
DROP TABLE IF EXISTS hp_tests CASCADE;

-- Table for högskoleprovet tests (entire test instances from specific dates)
CREATE TABLE hp_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_date DATE NOT NULL,
  test_season TEXT NOT NULL CHECK (test_season IN ('spring', 'fall')),
  test_year INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for test sections (ORD, LÄS, MEK, NOG, ELF, KVA, XYZ, DTK)
CREATE TABLE hp_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_code TEXT NOT NULL UNIQUE,
  section_name TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  section_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for individual questions
CREATE TABLE hp_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES hp_tests(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES hp_sections(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'diagram', 'reading_comprehension')),
  options JSONB NOT NULL, -- Array of answer options
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  points INTEGER DEFAULT 1,
  time_estimate_seconds INTEGER DEFAULT 90,
  reading_passage TEXT, -- For reading comprehension questions
  diagram_url TEXT, -- For questions with diagrams
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for user answers to individual questions
CREATE TABLE user_hp_question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES hp_questions(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id, answered_at)
);

-- Table for complete test attempts
CREATE TABLE user_hp_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES hp_tests(id) ON DELETE CASCADE,
  section_id UUID REFERENCES hp_sections(id) ON DELETE CASCADE,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('full_test', 'section_practice', 'question_practice')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  score_percentage NUMERIC(5,2),
  time_spent_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_hp_questions_test_id ON hp_questions(test_id);
CREATE INDEX idx_hp_questions_section_id ON hp_questions(section_id);
CREATE INDEX idx_user_hp_answers_user_id ON user_hp_question_answers(user_id);
CREATE INDEX idx_user_hp_answers_question_id ON user_hp_question_answers(question_id);
CREATE INDEX idx_user_hp_attempts_user_id ON user_hp_test_attempts(user_id);
CREATE INDEX idx_user_hp_attempts_status ON user_hp_test_attempts(status);

-- Enable Row Level Security
ALTER TABLE hp_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hp_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE hp_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hp_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hp_test_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reading (anyone authenticated can read)
CREATE POLICY "Anyone can view published tests" ON hp_tests FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view sections" ON hp_sections FOR SELECT USING (true);
CREATE POLICY "Anyone can view questions" ON hp_questions FOR SELECT USING (true);

-- RLS Policies for user answers (users can only see their own)
CREATE POLICY "Users can view own answers" ON user_hp_question_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own answers" ON user_hp_question_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON user_hp_question_answers FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for test attempts (users can only see their own)
CREATE POLICY "Users can view own attempts" ON user_hp_test_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON user_hp_test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON user_hp_test_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Insert sections (8 sections of högskoleprovet)
INSERT INTO hp_sections (section_code, section_name, description, time_limit_minutes, max_score, section_order) VALUES
('ORD', 'Ordförståelse', 'Ordförståelse - Testa din ordförråd och förmåga att förstå ordets betydelse', 20, 20, 1),
('LÄS', 'Läsförståelse', 'Läsförståelse - Förstå och analysera texter', 55, 20, 2),
('MEK', 'Meningskomplettering', 'Meningskomplettering - Komplettera meningar logiskt', 25, 20, 3),
('NOG', 'Kvantitativ jämförelse', 'NOG (Kvantitativ jämförelse) - Jämför kvantiteter och storlekar', 20, 20, 4),
('ELF', 'Ekvationer', 'ELF (Ekvationer och funktioner) - Lösa ekvationer och funktioner', 25, 20, 5),
('KVA', 'Kvantitativ analys', 'KVA (Kvantitativ analys) - Analysera och tolka kvantitativ information', 25, 20, 6),
('XYZ', 'Diagram, tabeller och kartor', 'XYZ - Tolka diagram, tabeller och kartor', 55, 20, 7),
('DTK', 'Data och teknisk förståelse', 'DTK - Teknisk läsförståelse och dataanalys', 55, 20, 8);

COMMENT ON TABLE hp_tests IS 'Stores complete högskoleprovet test instances from specific dates';
COMMENT ON TABLE hp_sections IS 'The 8 sections of högskoleprovet';
COMMENT ON TABLE hp_questions IS 'Individual questions from each test and section';
COMMENT ON TABLE user_hp_question_answers IS 'User answers to individual questions';
COMMENT ON TABLE user_hp_test_attempts IS 'Complete test or section attempts by users';
