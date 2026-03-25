-- =====================================================
-- FIX: KONVERTERA ALLA UNIVERSITY TABELLER TILL TEXT IDs
-- =====================================================
-- Säkerställer att alla university tabeller använder TEXT
-- för IDs istället för UUID, precis som gymnasium-systemet
-- =====================================================

BEGIN;

-- =====================================================
-- STEG 1: DROPPA ALLA UNIVERSITY CONTENT TABELLER
-- =====================================================

DROP TABLE IF EXISTS user_university_exercise_attempts CASCADE;
DROP TABLE IF EXISTS user_university_lesson_progress CASCADE;
DROP TABLE IF EXISTS user_university_module_progress CASCADE;
DROP TABLE IF EXISTS university_course_exercises CASCADE;
DROP TABLE IF EXISTS university_course_lessons CASCADE;
DROP TABLE IF EXISTS university_course_modules CASCADE;

-- =====================================================
-- STEG 2: DROPPA OCH ÅTERSKAPA USER_UNIVERSITY_COURSES
-- =====================================================

DROP TABLE IF EXISTS user_university_courses CASCADE;

-- =====================================================
-- STEG 3: DROPPA OCH ÅTERSKAPA UNIVERSITY_COURSES MED TEXT ID
-- =====================================================

DROP TABLE IF EXISTS university_courses CASCADE;

CREATE TABLE university_courses (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  credits NUMERIC NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('grundnivå', 'avancerad nivå', 'forskarnivå')),
  description TEXT,
  prerequisites TEXT,
  learning_outcomes TEXT[],
  examination_forms TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_university_courses_code ON university_courses(code);
CREATE INDEX idx_university_courses_level ON university_courses(level);
CREATE INDEX idx_university_courses_is_active ON university_courses(is_active);

-- =====================================================
-- STEG 4: ÅTERSKAPA USER_UNIVERSITY_COURSES MED TEXT COURSE_ID
-- =====================================================

CREATE TABLE user_university_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  target_grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_user_university_courses_user_id ON user_university_courses(user_id);
CREATE INDEX idx_user_university_courses_course_id ON user_university_courses(course_id);
CREATE INDEX idx_user_university_courses_is_active ON user_university_courses(is_active);

-- =====================================================
-- STEG 5: SKAPA UNIVERSITY_COURSE_MODULES (TEXT IDS)
-- =====================================================

CREATE TABLE university_course_modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

CREATE INDEX idx_university_course_modules_course_id ON university_course_modules(course_id);
CREATE INDEX idx_university_course_modules_order ON university_course_modules(course_id, order_index);

-- =====================================================
-- STEG 6: SKAPA UNIVERSITY_COURSE_LESSONS (TEXT IDS)
-- =====================================================

CREATE TABLE university_course_lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES university_course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  lesson_type TEXT DEFAULT 'theory' CHECK (lesson_type IN ('theory', 'exercise', 'video', 'reading', 'quiz')),
  resources JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

CREATE INDEX idx_university_course_lessons_module_id ON university_course_lessons(module_id);
CREATE INDEX idx_university_course_lessons_order ON university_course_lessons(module_id, order_index);
CREATE INDEX idx_university_course_lessons_type ON university_course_lessons(lesson_type);

-- =====================================================
-- STEG 7: SKAPA UNIVERSITY_COURSE_EXERCISES (TEXT IDS)
-- =====================================================

CREATE TABLE university_course_exercises (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES university_course_lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'calculation')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  order_index INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, order_index)
);

CREATE INDEX idx_university_course_exercises_lesson_id ON university_course_exercises(lesson_id);
CREATE INDEX idx_university_course_exercises_order ON university_course_exercises(lesson_id, order_index);
CREATE INDEX idx_university_course_exercises_difficulty ON university_course_exercises(difficulty);

-- =====================================================
-- STEG 8: SKAPA USER PROGRESS TABELLER (TEXT IDS)
-- =====================================================

CREATE TABLE user_university_module_progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES university_course_modules(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE INDEX idx_user_university_module_progress_user_id ON user_university_module_progress(user_id);
CREATE INDEX idx_user_university_module_progress_module_id ON user_university_module_progress(module_id);

CREATE TABLE user_university_lesson_progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES university_course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_university_lesson_progress_user_id ON user_university_lesson_progress(user_id);
CREATE INDEX idx_user_university_lesson_progress_lesson_id ON user_university_lesson_progress(lesson_id);

CREATE TABLE user_university_exercise_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES university_course_exercises(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  time_spent_seconds INTEGER,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_university_exercise_attempts_user_id ON user_university_exercise_attempts(user_id);
CREATE INDEX idx_user_university_exercise_attempts_exercise_id ON user_university_exercise_attempts(exercise_id);
CREATE INDEX idx_user_university_exercise_attempts_attempted_at ON user_university_exercise_attempts(attempted_at DESC);

-- =====================================================
-- STEG 9: AKTIVERA RLS PÅ ALLA TABELLER
-- =====================================================

ALTER TABLE university_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_course_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_exercise_attempts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEG 10: RLS POLICIES - COURSES
-- =====================================================

CREATE POLICY "Anyone can view active university courses"
  ON university_courses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view own university course enrollments"
  ON user_university_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own university course enrollments"
  ON user_university_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own university course enrollments"
  ON user_university_courses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own university course enrollments"
  ON user_university_courses FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- STEG 11: RLS POLICIES - CONTENT
-- =====================================================

CREATE POLICY "Anyone can view published university modules"
  ON university_course_modules FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can view published university lessons"
  ON university_course_lessons FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can view university exercises"
  ON university_course_exercises FOR SELECT
  USING (true);

-- =====================================================
-- STEG 12: RLS POLICIES - USER PROGRESS
-- =====================================================

CREATE POLICY "Users can view own university module progress"
  ON user_university_module_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own university module progress"
  ON user_university_module_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own university module progress"
  ON user_university_module_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own university lesson progress"
  ON user_university_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own university lesson progress"
  ON user_university_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own university lesson progress"
  ON user_university_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own university exercise attempts"
  ON user_university_exercise_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own university exercise attempts"
  ON user_university_exercise_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEG 13: TRIGGERS FÖR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_university_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_university_courses_updated_at
  BEFORE UPDATE ON university_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_university_updated_at();

CREATE TRIGGER update_user_university_courses_updated_at
  BEFORE UPDATE ON user_university_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_university_updated_at();

CREATE TRIGGER update_university_course_modules_updated_at
  BEFORE UPDATE ON university_course_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_university_updated_at();

CREATE TRIGGER update_university_course_lessons_updated_at
  BEFORE UPDATE ON university_course_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_university_updated_at();

CREATE TRIGGER update_university_course_exercises_updated_at
  BEFORE UPDATE ON university_course_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_university_updated_at();

CREATE TRIGGER update_user_university_module_progress_updated_at
  BEFORE UPDATE ON user_university_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_university_updated_at();

CREATE TRIGGER update_user_university_lesson_progress_updated_at
  BEFORE UPDATE ON user_university_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_university_updated_at();

-- =====================================================
-- STEG 14: TRIGGER FÖR MODULE PROGRESS
-- =====================================================

CREATE OR REPLACE FUNCTION update_university_module_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_module_id TEXT;
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_progress INTEGER;
BEGIN
  SELECT module_id INTO v_module_id
  FROM university_course_lessons
  WHERE id = NEW.lesson_id;

  SELECT COUNT(*) INTO v_total_lessons
  FROM university_course_lessons
  WHERE module_id = v_module_id;

  SELECT COUNT(*) INTO v_completed_lessons
  FROM user_university_lesson_progress ulp
  JOIN university_course_lessons ucl ON ulp.lesson_id = ucl.id
  WHERE ulp.user_id = NEW.user_id
    AND ucl.module_id = v_module_id
    AND ulp.completed = true;

  IF v_total_lessons > 0 THEN
    v_progress := ROUND((v_completed_lessons::NUMERIC / v_total_lessons::NUMERIC) * 100);
  ELSE
    v_progress := 0;
  END IF;

  INSERT INTO user_university_module_progress (
    id,
    user_id,
    module_id,
    progress,
    completed_lessons,
    total_lessons,
    completed_at
  ) VALUES (
    NEW.user_id || '-' || v_module_id,
    NEW.user_id,
    v_module_id,
    v_progress,
    v_completed_lessons,
    v_total_lessons,
    CASE WHEN v_progress = 100 THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, module_id)
  DO UPDATE SET
    progress = v_progress,
    completed_lessons = v_completed_lessons,
    total_lessons = v_total_lessons,
    completed_at = CASE WHEN v_progress = 100 THEN NOW() ELSE user_university_module_progress.completed_at END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_university_module_progress
  AFTER INSERT OR UPDATE ON user_university_lesson_progress
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION update_university_module_progress();

-- =====================================================
-- STEG 15: POPULERA MED BEFINTLIGA KURSER
-- =====================================================

-- Lägg in alla universitets kurser från tidigare data
INSERT INTO university_courses (id, code, name, credits, level, description, is_active) VALUES
('FMAB20', 'FMAB20', 'Linjär algebra', 6, 'grundnivå', 'Grundläggande kurs i linjär algebra med vektorer, matriser och linjära avbildningar', true),
('FMAA50', 'FMAA50', 'Analys i en variabel', 9, 'grundnivå', 'Grundläggande kurs i envariabelanalys', true),
('FMAB30', 'FMAB30', 'Flerdimensionell analys', 6, 'grundnivå', 'Analys i flera variabler', true)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'University tables fixed with consistent TEXT IDs!' as status;
SELECT 'Courses:', COUNT(*) FROM university_courses;
SELECT 'Modules:', COUNT(*) FROM university_course_modules;
SELECT 'Lessons:', COUNT(*) FROM university_course_lessons;
SELECT 'Exercises:', COUNT(*) FROM university_course_exercises;
