-- =====================================================
-- COMPLETE COURSE CONTENT SYSTEM IMPLEMENTATION
-- =====================================================
-- This SQL creates a comprehensive content system for all courses in the app
-- Including lessons, materials, exercises, and progress tracking

-- Enable RLS on all tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. COURSE MODULES TABLE
-- =====================================================
-- Organize course content into modules/chapters
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    estimated_hours INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. COURSE LESSONS TABLE
-- =====================================================
-- Individual lessons within modules
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT, -- Main lesson content (markdown/html)
    lesson_type TEXT DEFAULT 'theory' CHECK (lesson_type IN ('theory', 'practical', 'exercise', 'quiz', 'video', 'reading')),
    order_index INTEGER NOT NULL DEFAULT 0,
    estimated_minutes INTEGER DEFAULT 30,
    difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    prerequisites TEXT[], -- Array of prerequisite lesson IDs
    learning_objectives TEXT[], -- Array of learning objectives
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. LESSON MATERIALS TABLE
-- =====================================================
-- Materials and resources for lessons
CREATE TABLE IF NOT EXISTS lesson_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    material_type TEXT NOT NULL CHECK (material_type IN ('pdf', 'video', 'audio', 'link', 'image', 'document', 'interactive')),
    url TEXT, -- External URL or file path
    content TEXT, -- Embedded content
    file_size INTEGER, -- File size in bytes
    duration_minutes INTEGER, -- For video/audio materials
    is_required BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. COURSE EXERCISES TABLE
-- =====================================================
-- Practice exercises and assignments
CREATE TABLE IF NOT EXISTS course_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'coding', 'math', 'practical')),
    questions JSONB, -- Exercise questions and options
    correct_answers JSONB, -- Correct answers
    points INTEGER DEFAULT 10,
    time_limit_minutes INTEGER,
    difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    hints TEXT[],
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. USER LESSON PROGRESS TABLE
-- =====================================================
-- Track user progress through lessons
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- =====================================================
-- 6. USER EXERCISE ATTEMPTS TABLE
-- =====================================================
-- Track user attempts at exercises
CREATE TABLE IF NOT EXISTS user_exercise_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES course_exercises(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    answers JSONB NOT NULL, -- User's answers
    score INTEGER DEFAULT 0,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0,
    time_taken_minutes INTEGER,
    is_completed BOOLEAN DEFAULT false,
    feedback TEXT,
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. COURSE CONTENT TAGS TABLE
-- =====================================================
-- Tags for organizing and searching content
CREATE TABLE IF NOT EXISTS course_content_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. LESSON TAGS JUNCTION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS lesson_tags (
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES course_content_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (lesson_id, tag_id)
);

-- =====================================================
-- 9. STUDY GUIDES TABLE
-- =====================================================
-- Study guides and summaries for courses
CREATE TABLE IF NOT EXISTS study_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL, -- Markdown/HTML content
    guide_type TEXT DEFAULT 'summary' CHECK (guide_type IN ('summary', 'cheat_sheet', 'formula_sheet', 'vocabulary', 'timeline')),
    difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    estimated_read_time INTEGER DEFAULT 15, -- minutes
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. COURSE ASSESSMENTS TABLE
-- =====================================================
-- Major assessments and exams
CREATE TABLE IF NOT EXISTS course_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'test', 'exam', 'project', 'assignment')),
    total_points INTEGER NOT NULL DEFAULT 100,
    passing_score INTEGER DEFAULT 60,
    time_limit_minutes INTEGER,
    attempts_allowed INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT true,
    available_from TIMESTAMP WITH TIME ZONE,
    available_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. USER ASSESSMENT RESULTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES course_assessments(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    time_taken_minutes INTEGER,
    attempt_number INTEGER DEFAULT 1,
    feedback TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON course_modules(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON course_lessons(module_id, order_index);

CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson_id ON lesson_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_type ON lesson_materials(material_type);

CREATE INDEX IF NOT EXISTS idx_course_exercises_lesson_id ON course_exercises(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_exercises_course_id ON course_exercises(course_id);
CREATE INDEX IF NOT EXISTS idx_course_exercises_type ON course_exercises(exercise_type);

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_course_id ON user_lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_status ON user_lesson_progress(status);

CREATE INDEX IF NOT EXISTS idx_user_exercise_attempts_user_id ON user_exercise_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_attempts_exercise_id ON user_exercise_attempts(exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_attempts_course_id ON user_exercise_attempts(course_id);

CREATE INDEX IF NOT EXISTS idx_study_guides_course_id ON study_guides(course_id);
CREATE INDEX IF NOT EXISTS idx_course_assessments_course_id ON course_assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_user_assessment_results_user_id ON user_assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessment_results_assessment_id ON user_assessment_results(assessment_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Course Modules
CREATE POLICY "Users can view published course modules" ON course_modules
    FOR SELECT USING (is_published = true);

-- Course Lessons
CREATE POLICY "Users can view published course lessons" ON course_lessons
    FOR SELECT USING (is_published = true);

-- Lesson Materials
CREATE POLICY "Users can view lesson materials" ON lesson_materials
    FOR SELECT USING (true);

-- Course Exercises
CREATE POLICY "Users can view published course exercises" ON course_exercises
    FOR SELECT USING (is_published = true);

-- User Lesson Progress
CREATE POLICY "Users can manage their own lesson progress" ON user_lesson_progress
    FOR ALL USING (auth.uid() = user_id);

-- User Exercise Attempts
CREATE POLICY "Users can manage their own exercise attempts" ON user_exercise_attempts
    FOR ALL USING (auth.uid() = user_id);

-- Course Content Tags
CREATE POLICY "Users can view course content tags" ON course_content_tags
    FOR SELECT USING (true);

-- Lesson Tags
CREATE POLICY "Users can view lesson tags" ON lesson_tags
    FOR SELECT USING (true);

-- Study Guides
CREATE POLICY "Users can view published study guides" ON study_guides
    FOR SELECT USING (is_published = true);

-- Course Assessments
CREATE POLICY "Users can view published course assessments" ON course_assessments
    FOR SELECT USING (is_published = true);

-- User Assessment Results
CREATE POLICY "Users can manage their own assessment results" ON user_assessment_results
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- ENABLE RLS ON ALL NEW TABLES
-- =====================================================
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessment_results ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_exercises_updated_at BEFORE UPDATE ON course_exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON user_lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_guides_updated_at BEFORE UPDATE ON study_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_assessments_updated_at BEFORE UPDATE ON course_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE CONTENT FOR SVENSKA 1 COURSE
-- =====================================================
-- Insert sample content to demonstrate the system

-- First, let's make sure we have the Svenska 1 course
INSERT INTO courses (id, title, subject, level, description) 
VALUES (
    'svenska-1-course-id',
    'Svenska 1',
    'Svenska',
    '1',
    'Grundläggande kurs i svenska språket för gymnasiet'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subject = EXCLUDED.subject,
    level = EXCLUDED.level,
    description = EXCLUDED.description;

-- Module 1: Språkhistoria och språkutveckling
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
('mod-svenska1-1', 'svenska-1-course-id', 'Språkhistoria och språkutveckling', 'Lär dig om svenska språkets historia och utveckling', 1, 20);

-- Module 2: Textanalys och läsförståelse
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
('mod-svenska1-2', 'svenska-1-course-id', 'Textanalys och läsförståelse', 'Utveckla färdigheter i att analysera och förstå texter', 2, 25);

-- Module 3: Skriftlig kommunikation
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
('mod-svenska1-3', 'svenska-1-course-id', 'Skriftlig kommunikation', 'Lär dig att skriva olika typer av texter', 3, 30);

-- Module 4: Muntlig kommunikation
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
('mod-svenska1-4', 'svenska-1-course-id', 'Muntlig kommunikation', 'Utveckla dina färdigheter i muntlig framställning', 4, 15);

-- Sample lessons for Module 1
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
('lesson-svenska1-1-1', 'mod-svenska1-1', 'svenska-1-course-id', 'Fornnordiska och runor', 'Introduktion till svenska språkets äldsta former', 
'# Fornnordiska och runor

## Inledning
Svenska språket har en lång och fascinerande historia som sträcker sig tillbaka över tusen år. I denna lektion kommer vi att utforska språkets äldsta former.

## Fornnordiska
Fornnordiska var det gemensamma språket för alla nordiska folk under vikingatiden (ca 800-1100 e.Kr.). Detta språk är förfadern till alla moderna nordiska språk.

### Viktiga kännetecken:
- Komplicerat kasussystem
- Rik verbböjning  
- Många sammansatta ord

## Runor
Runorna var det äldsta skriftsystemet i Norden. De användes från ca 200 e.Kr. till medeltiden.

### Runrader:
1. **Äldre futharken** (24 runor)
2. **Yngre futharken** (16 runor)

## Övningar
Försök att tyda denna runinskrift: ᚦᚢᚱ ᚢᛁᚴᛁ', 
'theory', 1, 45, ARRAY['Förstå fornnordiskans betydelse', 'Känna till runornas historia', 'Kunna läsa enkla runinskrifter']);

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
('lesson-svenska1-1-2', 'mod-svenska1-1', 'svenska-1-course-id', 'Fornsvenska perioden', 'Svenska språket under medeltiden', 
'# Fornsvenska perioden (1225-1526)

## Översikt
Fornsvenska är den period då svenska började utvecklas som ett eget språk, skilt från de andra nordiska språken.

## Viktiga förändringar:
- Kasussystemet förenklas
- Latinska lånord kommer in
- Första svenska texterna skrivs

## Viktiga texter:
- **Västgötalagen** (1220-talet) - första svenska lagtexten
- **Erikskrönikan** (1320-talet) - första svenska krönika
- **Heliga Birgittas uppenbarelser** - religiös litteratur

## Språkliga drag:
- Många tyska lånord
- Förenklad grammatik
- Regional variation', 
'theory', 2, 40, ARRAY['Förstå fornsvenskans kännetecken', 'Känna till viktiga fornsvenska texter', 'Se språkutvecklingens kontinuitet']);

-- Sample exercises
INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points) VALUES
('ex-svenska1-1-1', 'lesson-svenska1-1-1', 'svenska-1-course-id', 'Runkunskap', 'Testa dina kunskaper om runor', 'Svara på frågorna om runor och fornnordiska', 'multiple_choice',
'[
  {
    "question": "Hur många runor fanns i den äldre futharken?",
    "options": ["16", "20", "24", "28"],
    "id": 1
  },
  {
    "question": "Vilken tidsperiod användes runor huvudsakligen?",
    "options": ["100-500 e.Kr.", "200-1100 e.Kr.", "500-1000 e.Kr.", "800-1200 e.Kr."],
    "id": 2
  }
]',
'[
  {"id": 1, "correct": "24"},
  {"id": 2, "correct": "200-1100 e.Kr."}
]', 10);

-- Sample materials
INSERT INTO lesson_materials (id, lesson_id, title, description, material_type, url, is_required, order_index) VALUES
('mat-svenska1-1-1', 'lesson-svenska1-1-1', 'Runstenar i Sverige', 'Interaktiv karta över svenska runstenar', 'interactive', 'https://www.raa.se/kulturarv/arkeologi-fornlamningar-och-fynd/runstenar/', true, 1);

INSERT INTO lesson_materials (id, lesson_id, title, description, material_type, content, is_required, order_index) VALUES
('mat-svenska1-1-2', 'lesson-svenska1-1-1', 'Runornas betydelse', 'Tabell över runornas namn och betydelser', 'document', 
'| Runa | Namn | Betydelse |
|-------|------|-----------|
| ᚠ | Fe | Boskap, rikedom |
| ᚢ | Ur | Urnoxe, styrka |
| ᚦ | Thurs | Jätte, hot |
| ᚨ | As | Gud, visdom |', false, 2);

-- Study guide
INSERT INTO study_guides (id, course_id, title, description, content, guide_type) VALUES
('guide-svenska1-1', 'svenska-1-course-id', 'Språkhistorisk översikt', 'Sammanfattning av svenska språkets utveckling', 
'# Svenska språkets utveckling - Översikt

## Tidsperioder:

### Fornnordiska (före 1100)
- Gemensamt nordiskt språk
- Runor som skriftsystem
- Komplicerad grammatik

### Fornsvenska (1225-1526)
- Svenska blir eget språk
- Första svenska texter
- Tyska lånord

### Nysvenska (1526-)
- Gustav Vasas bibel 1541
- Standardisering
- Modern svenska utvecklas

## Viktiga milstolpar:
- 200 e.Kr: Första runor
- 1225: Västgötalagen
- 1541: Gustav Vasas bibel
- 1906: Rättstavningsreformen', 'summary');

-- Sample tags
INSERT INTO course_content_tags (id, name, description, color) VALUES
('tag-historia', 'Språkhistoria', 'Innehåll om svenska språkets historia', '#8B5CF6'),
('tag-runor', 'Runor', 'Innehåll om runor och runskrift', '#F59E0B'),
('tag-grammatik', 'Grammatik', 'Grammatiska ämnen', '#10B981');

-- Link lessons to tags
INSERT INTO lesson_tags (lesson_id, tag_id) VALUES
('lesson-svenska1-1-1', 'tag-historia'),
('lesson-svenska1-1-1', 'tag-runor'),
('lesson-svenska1-1-2', 'tag-historia'),
('lesson-svenska1-1-2', 'tag-grammatik');

-- Sample assessment
INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
('assess-svenska1-1', 'svenska-1-course-id', 'Språkhistoria - Deltest 1', 'Test över fornnordiska och fornsvenska', 'test', 50, 35, 60);

-- =====================================================
-- FUNCTIONS FOR COURSE CONTENT MANAGEMENT
-- =====================================================

-- Function to get course progress for a user
CREATE OR REPLACE FUNCTION get_user_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS TABLE (
    total_lessons INTEGER,
    completed_lessons INTEGER,
    progress_percentage DECIMAL(5,2),
    total_time_spent INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(cl.id)::INTEGER as total_lessons,
        COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END)::INTEGER as completed_lessons,
        CASE 
            WHEN COUNT(cl.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END)::DECIMAL / COUNT(cl.id)::DECIMAL) * 100, 2)
            ELSE 0
        END as progress_percentage,
        COALESCE(SUM(ulp.time_spent_minutes), 0)::INTEGER as total_time_spent
    FROM course_lessons cl
    LEFT JOIN user_lesson_progress ulp ON cl.id = ulp.lesson_id AND ulp.user_id = p_user_id
    WHERE cl.course_id = p_course_id AND cl.is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next lesson for a user
CREATE OR REPLACE FUNCTION get_next_lesson(p_user_id UUID, p_course_id UUID)
RETURNS TABLE (
    lesson_id UUID,
    lesson_title TEXT,
    module_title TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.id as lesson_id,
        cl.title as lesson_title,
        cm.title as module_title
    FROM course_lessons cl
    JOIN course_modules cm ON cl.module_id = cm.id
    LEFT JOIN user_lesson_progress ulp ON cl.id = ulp.lesson_id AND ulp.user_id = p_user_id
    WHERE cl.course_id = p_course_id 
        AND cl.is_published = true
        AND (ulp.status IS NULL OR ulp.status IN ('not_started', 'in_progress'))
    ORDER BY cm.order_index, cl.order_index
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENABLE REALTIME FOR CONTENT TABLES
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE course_modules;
ALTER PUBLICATION supabase_realtime ADD TABLE course_lessons;
ALTER PUBLICATION supabase_realtime ADD TABLE lesson_materials;
ALTER PUBLICATION supabase_realtime ADD TABLE course_exercises;
ALTER PUBLICATION supabase_realtime ADD TABLE user_lesson_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE user_exercise_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE study_guides;
ALTER PUBLICATION supabase_realtime ADD TABLE course_assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE user_assessment_results;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- This completes the course content system implementation
-- The system now supports:
-- 1. Structured course content with modules and lessons
-- 2. Rich materials and resources
-- 3. Interactive exercises and assessments
-- 4. Progress tracking for individual users
-- 5. Study guides and supplementary materials
-- 6. Comprehensive search and filtering capabilities
-- 7. Real-time updates for collaborative learning