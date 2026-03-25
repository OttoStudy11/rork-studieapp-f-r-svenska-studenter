-- ============================================================================
-- STEP 2: COURSE SYSTEM TABLES
-- ============================================================================
-- This step creates all course-related tables including modules, lessons,
-- exercises, assessments, and their relationships
-- ============================================================================

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS lesson_tags CASCADE;
DROP TABLE IF EXISTS lesson_materials CASCADE;
DROP TABLE IF EXISTS course_content_tags CASCADE;
DROP TABLE IF EXISTS course_exercises CASCADE;
DROP TABLE IF EXISTS course_assessments CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS study_guides CASCADE;
DROP TABLE IF EXISTS program_courses CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS programs CASCADE;

-- ============================================================================
-- PROGRAMS TABLE
-- ============================================================================
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('gymnasium', 'university')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COURSES TABLE
-- ============================================================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    course_code TEXT UNIQUE,
    subject TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('gymnasium', 'university')),
    points INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    tips JSONB DEFAULT '[]'::jsonb,
    resources JSONB DEFAULT '[]'::jsonb,
    related_courses JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROGRAM_COURSES (Junction Table)
-- ============================================================================
CREATE TABLE program_courses (
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (program_id, course_id)
);

-- ============================================================================
-- COURSE_MODULES TABLE
-- ============================================================================
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    estimated_hours INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

-- ============================================================================
-- COURSE_LESSONS TABLE
-- ============================================================================
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES course_modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    lesson_type TEXT DEFAULT 'theory' CHECK (lesson_type IN ('theory', 'practice', 'video', 'reading', 'interactive')),
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    order_index INTEGER NOT NULL DEFAULT 0,
    estimated_minutes INTEGER DEFAULT 30,
    prerequisites TEXT[] DEFAULT ARRAY[]::TEXT[],
    learning_objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

-- ============================================================================
-- COURSE_CONTENT_TAGS TABLE
-- ============================================================================
CREATE TABLE course_content_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LESSON_TAGS (Junction Table)
-- ============================================================================
CREATE TABLE lesson_tags (
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES course_content_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (lesson_id, tag_id)
);

-- ============================================================================
-- LESSON_MATERIALS TABLE
-- ============================================================================
CREATE TABLE lesson_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    material_type TEXT NOT NULL CHECK (material_type IN ('pdf', 'video', 'audio', 'link', 'document', 'image')),
    url TEXT,
    content TEXT,
    file_size INTEGER,
    duration_minutes INTEGER,
    order_index INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COURSE_EXERCISES TABLE
-- ============================================================================
CREATE TABLE course_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'coding', 'matching')),
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    questions JSONB DEFAULT '[]'::jsonb,
    correct_answers JSONB DEFAULT '{}'::jsonb,
    hints TEXT[] DEFAULT ARRAY[]::TEXT[],
    points INTEGER DEFAULT 10,
    time_limit_minutes INTEGER,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COURSE_ASSESSMENTS TABLE
-- ============================================================================
CREATE TABLE course_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assessment_type TEXT NOT NULL CHECK (assessment_type IN ('quiz', 'exam', 'project', 'assignment')),
    total_points INTEGER DEFAULT 100,
    passing_score INTEGER DEFAULT 60,
    time_limit_minutes INTEGER,
    attempts_allowed INTEGER DEFAULT 3,
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDY_GUIDES TABLE
-- ============================================================================
CREATE TABLE study_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    guide_type TEXT DEFAULT 'summary' CHECK (guide_type IN ('summary', 'cheatsheet', 'mindmap', 'flashcards', 'practice')),
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_read_time INTEGER DEFAULT 15,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Programs indexes
CREATE INDEX idx_programs_level ON programs(level);

-- Courses indexes
CREATE INDEX idx_courses_subject ON courses(subject);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_course_code ON courses(course_code);
CREATE INDEX idx_courses_is_published ON courses(is_published);

-- Program courses indexes
CREATE INDEX idx_program_courses_program_id ON program_courses(program_id);
CREATE INDEX idx_program_courses_course_id ON program_courses(course_id);

-- Course modules indexes
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_modules_order ON course_modules(course_id, order_index);

-- Course lessons indexes
CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX idx_course_lessons_order ON course_lessons(course_id, order_index);
CREATE INDEX idx_course_lessons_type ON course_lessons(lesson_type);

-- Lesson materials indexes
CREATE INDEX idx_lesson_materials_lesson_id ON lesson_materials(lesson_id);
CREATE INDEX idx_lesson_materials_type ON lesson_materials(material_type);

-- Course exercises indexes
CREATE INDEX idx_course_exercises_course_id ON course_exercises(course_id);
CREATE INDEX idx_course_exercises_lesson_id ON course_exercises(lesson_id);
CREATE INDEX idx_course_exercises_type ON course_exercises(exercise_type);

-- Course assessments indexes
CREATE INDEX idx_course_assessments_course_id ON course_assessments(course_id);
CREATE INDEX idx_course_assessments_type ON course_assessments(assessment_type);

-- Study guides indexes
CREATE INDEX idx_study_guides_course_id ON study_guides(course_id);
CREATE INDEX idx_study_guides_type ON study_guides(guide_type);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_materials_updated_at BEFORE UPDATE ON lesson_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_exercises_updated_at BEFORE UPDATE ON course_exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_assessments_updated_at BEFORE UPDATE ON course_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_guides_updated_at BEFORE UPDATE ON study_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;

-- Programs policies (public read)
CREATE POLICY "Programs are viewable by everyone"
    ON programs FOR SELECT
    USING (true);

CREATE POLICY "Programs are insertable by authenticated users"
    ON programs FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Courses policies (public read for published)
CREATE POLICY "Published courses are viewable by everyone"
    ON courses FOR SELECT
    USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Courses are insertable by authenticated users"
    ON courses FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Courses are updatable by authenticated users"
    ON courses FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Program courses policies
CREATE POLICY "Program courses are viewable by everyone"
    ON program_courses FOR SELECT
    USING (true);

CREATE POLICY "Program courses are insertable by authenticated users"
    ON program_courses FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Course modules policies
CREATE POLICY "Published course modules are viewable by everyone"
    ON course_modules FOR SELECT
    USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Course modules are insertable by authenticated users"
    ON course_modules FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Course modules are updatable by authenticated users"
    ON course_modules FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Course lessons policies
CREATE POLICY "Published course lessons are viewable by everyone"
    ON course_lessons FOR SELECT
    USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Course lessons are insertable by authenticated users"
    ON course_lessons FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Course lessons are updatable by authenticated users"
    ON course_lessons FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Content tags policies
CREATE POLICY "Content tags are viewable by everyone"
    ON course_content_tags FOR SELECT
    USING (true);

CREATE POLICY "Content tags are insertable by authenticated users"
    ON course_content_tags FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Lesson tags policies
CREATE POLICY "Lesson tags are viewable by everyone"
    ON lesson_tags FOR SELECT
    USING (true);

CREATE POLICY "Lesson tags are insertable by authenticated users"
    ON lesson_tags FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Lesson materials policies
CREATE POLICY "Lesson materials are viewable by everyone"
    ON lesson_materials FOR SELECT
    USING (true);

CREATE POLICY "Lesson materials are insertable by authenticated users"
    ON lesson_materials FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Lesson materials are updatable by authenticated users"
    ON lesson_materials FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Course exercises policies
CREATE POLICY "Published exercises are viewable by everyone"
    ON course_exercises FOR SELECT
    USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Exercises are insertable by authenticated users"
    ON course_exercises FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Exercises are updatable by authenticated users"
    ON course_exercises FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Course assessments policies
CREATE POLICY "Published assessments are viewable by everyone"
    ON course_assessments FOR SELECT
    USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Assessments are insertable by authenticated users"
    ON course_assessments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Assessments are updatable by authenticated users"
    ON course_assessments FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Study guides policies
CREATE POLICY "Published study guides are viewable by everyone"
    ON study_guides FOR SELECT
    USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "Study guides are insertable by authenticated users"
    ON study_guides FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Study guides are updatable by authenticated users"
    ON study_guides FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- STEP 2 COMPLETE
-- ============================================================================
-- Next step: Run complete-database-schema-step3.sql for user progress tracking
-- ============================================================================
