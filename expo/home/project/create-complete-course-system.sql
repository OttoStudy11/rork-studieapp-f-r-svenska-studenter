-- =====================================================
-- COMPLETE COURSE CONTENT SYSTEM - CORRECTED VERSION
-- =====================================================
BEGIN;

-- Ensure extension for gen_random_uuid exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. course_modules
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    order_index integer NOT NULL DEFAULT 0,
    estimated_hours integer DEFAULT 0,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. course_lessons
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    content text,
    lesson_type text DEFAULT 'theory' CHECK (lesson_type IN ('theory','practical','exercise','quiz','video','reading')),
    order_index integer NOT NULL DEFAULT 0,
    estimated_minutes integer DEFAULT 30,
    difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy','medium','hard')),
    prerequisites text[],
    learning_objectives text[],
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. lesson_materials
CREATE TABLE IF NOT EXISTS lesson_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    material_type text NOT NULL CHECK (material_type IN ('pdf','video','audio','link','image','document','interactive','article')),
    url text,
    content text,
    file_size integer,
    duration_minutes integer,
    is_required boolean DEFAULT false,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. course_exercises
CREATE TABLE IF NOT EXISTS course_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    instructions text NOT NULL,
    exercise_type text NOT NULL CHECK (exercise_type IN ('multiple_choice','true_false','short_answer','essay','coding','math','practical')),
    questions jsonb,
    correct_answers jsonb,
    points integer DEFAULT 10,
    time_limit_minutes integer,
    difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy','medium','hard')),
    hints text[],
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. user_lesson_progress
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status text DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','skipped')),
    progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_minutes integer DEFAULT 0,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    last_accessed_at timestamp with time zone DEFAULT now(),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

-- 6. user_exercise_attempts
CREATE TABLE IF NOT EXISTS user_exercise_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES course_exercises(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    answers jsonb NOT NULL,
    score integer DEFAULT 0,
    max_score integer NOT NULL,
    percentage numeric(5,2) DEFAULT 0,
    time_taken_minutes integer,
    is_completed boolean DEFAULT false,
    feedback text,
    attempt_number integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);

-- 7. course_content_tags
CREATE TABLE IF NOT EXISTS course_content_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    description text,
    color text DEFAULT '#3B82F6',
    created_at timestamp with time zone DEFAULT now()
);

-- 8. lesson_tags junction
CREATE TABLE IF NOT EXISTS lesson_tags (
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES course_content_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (lesson_id, tag_id)
);

-- 9. study_guides
CREATE TABLE IF NOT EXISTS study_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    content text NOT NULL,
    guide_type text DEFAULT 'summary' CHECK (guide_type IN ('summary','cheat_sheet','formula_sheet','vocabulary','timeline')),
    difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy','medium','hard')),
    estimated_read_time integer DEFAULT 15,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 10. course_assessments
CREATE TABLE IF NOT EXISTS course_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    assessment_type text NOT NULL CHECK (assessment_type IN ('quiz','test','exam','project','assignment')),
    total_points integer NOT NULL DEFAULT 100,
    passing_score integer DEFAULT 60,
    time_limit_minutes integer,
    attempts_allowed integer DEFAULT 1,
    is_published boolean DEFAULT true,
    available_from timestamp with time zone,
    available_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 11. user_assessment_results
CREATE TABLE IF NOT EXISTS user_assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES course_assessments(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    score integer NOT NULL DEFAULT 0,
    max_score integer NOT NULL,
    percentage numeric(5,2) NOT NULL DEFAULT 0,
    passed boolean DEFAULT false,
    time_taken_minutes integer,
    attempt_number integer DEFAULT 1,
    feedback text,
    completed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Indexes
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

-- Enable RLS on new tables
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

-- Policies: create only if missing (non-destructive)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'course_modules_select_published' AND tablename = 'course_modules') THEN
        CREATE POLICY "course_modules_select_published" ON course_modules FOR SELECT TO public USING (is_published = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'course_lessons_select_published' AND tablename = 'course_lessons') THEN
        CREATE POLICY "course_lessons_select_published" ON course_lessons FOR SELECT TO public USING (is_published = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lesson_materials_select' AND tablename = 'lesson_materials') THEN
        CREATE POLICY "lesson_materials_select" ON lesson_materials FOR SELECT TO public USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'course_exercises_select_published' AND tablename = 'course_exercises') THEN
        CREATE POLICY "course_exercises_select_published" ON course_exercises FOR SELECT TO public USING (is_published = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_lesson_progress_owner' AND tablename = 'user_lesson_progress') THEN
        CREATE POLICY "user_lesson_progress_owner" ON user_lesson_progress FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
        CREATE POLICY "user_lesson_progress_owner_insert" ON user_lesson_progress FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
        CREATE POLICY "user_lesson_progress_owner_update" ON user_lesson_progress FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
        CREATE POLICY "user_lesson_progress_owner_delete" ON user_lesson_progress FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_exercise_attempts_owner' AND tablename = 'user_exercise_attempts') THEN
        CREATE POLICY "user_exercise_attempts_owner" ON user_exercise_attempts FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
        CREATE POLICY "user_exercise_attempts_owner_insert" ON user_exercise_attempts FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
        CREATE POLICY "user_exercise_attempts_owner_update" ON user_exercise_attempts FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
        CREATE POLICY "user_exercise_attempts_owner_delete" ON user_exercise_attempts FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'course_content_tags_select' AND tablename = 'course_content_tags') THEN
        CREATE POLICY "course_content_tags_select" ON course_content_tags FOR SELECT TO public USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'lesson_tags_select' AND tablename = 'lesson_tags') THEN
        CREATE POLICY "lesson_tags_select" ON lesson_tags FOR SELECT TO public USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'study_guides_select_published' AND tablename = 'study_guides') THEN
        CREATE POLICY "study_guides_select_published" ON study_guides FOR SELECT TO public USING (is_published = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'course_assessments_select_published' AND tablename = 'course_assessments') THEN
        CREATE POLICY "course_assessments_select_published" ON course_assessments FOR SELECT TO public USING (is_published = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_assessment_results_owner' AND tablename = 'user_assessment_results') THEN
        CREATE POLICY "user_assessment_results_owner" ON user_assessment_results FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
        CREATE POLICY "user_assessment_results_owner_insert" ON user_assessment_results FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
        CREATE POLICY "user_assessment_results_owner_update" ON user_assessment_results FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
        CREATE POLICY "user_assessment_results_owner_delete" ON user_assessment_results FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
    END IF;
END$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers where updated_at exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='course_modules' AND column_name='updated_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_course_modules_updated_at') THEN
            CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='course_lessons' AND column_name='updated_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_course_lessons_updated_at') THEN
            CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='course_exercises' AND column_name='updated_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_course_exercises_updated_at') THEN
            CREATE TRIGGER update_course_exercises_updated_at BEFORE UPDATE ON course_exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_lesson_progress' AND column_name='updated_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_user_lesson_progress_updated_at') THEN
            CREATE TRIGGER update_user_lesson_progress_updated_at BEFORE UPDATE ON user_lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_guides' AND column_name='updated_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_study_guides_updated_at') THEN
            CREATE TRIGGER update_study_guides_updated_at BEFORE UPDATE ON study_guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='course_assessments' AND column_name='updated_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='update_course_assessments_updated_at') THEN
            CREATE TRIGGER update_course_assessments_updated_at BEFORE UPDATE ON course_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
END$$;

COMMIT;