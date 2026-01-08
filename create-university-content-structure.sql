-- =====================================================
-- SKAPA PARALLELL INNEHÅLLSSTRUKTUR FÖR HÖGSKOLA
-- =====================================================
-- Skapar university_course_modules, university_course_lessons, 
-- university_course_exercises som är parallella till 
-- gymnasiets course_modules, course_lessons, course_exercises
-- =====================================================

BEGIN;

-- =====================================================
-- RADERA BEFINTLIGA TABELLER (om de finns)
-- =====================================================

DROP TABLE IF EXISTS university_course_exercises CASCADE;
DROP TABLE IF EXISTS university_course_lessons CASCADE;
DROP TABLE IF EXISTS university_course_modules CASCADE;

-- =====================================================
-- SKAPA UNIVERSITY_COURSE_MODULES TABELL
-- =====================================================
-- Motsvarar course_modules men för universitets-kurser

CREATE TABLE university_course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

CREATE INDEX idx_university_course_modules_course_id ON university_course_modules(course_id);
CREATE INDEX idx_university_course_modules_order ON university_course_modules(course_id, order_index);

-- =====================================================
-- SKAPA UNIVERSITY_COURSE_LESSONS TABELL
-- =====================================================
-- Motsvarar course_lessons men för universitets-kurser

CREATE TABLE university_course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES university_course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  lesson_type TEXT DEFAULT 'theory' CHECK (lesson_type IN ('theory', 'exercise', 'video', 'reading', 'quiz')),
  resources JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

CREATE INDEX idx_university_course_lessons_module_id ON university_course_lessons(module_id);
CREATE INDEX idx_university_course_lessons_order ON university_course_lessons(module_id, order_index);
CREATE INDEX idx_university_course_lessons_type ON university_course_lessons(lesson_type);

-- =====================================================
-- SKAPA UNIVERSITY_COURSE_EXERCISES TABELL
-- =====================================================
-- Motsvarar course_exercises men för universitets-kurser

CREATE TABLE university_course_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES university_course_lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'calculation')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  order_index INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lesson_id, order_index)
);

CREATE INDEX idx_university_course_exercises_lesson_id ON university_course_exercises(lesson_id);
CREATE INDEX idx_university_course_exercises_order ON university_course_exercises(lesson_id, order_index);
CREATE INDEX idx_university_course_exercises_difficulty ON university_course_exercises(difficulty);

-- =====================================================
-- SKAPA USER_UNIVERSITY_MODULE_PROGRESS TABELL
-- =====================================================
-- För att följa användarens framsteg i universitets-moduler

CREATE TABLE user_university_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES university_course_modules(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE INDEX idx_user_university_module_progress_user_id ON user_university_module_progress(user_id);
CREATE INDEX idx_user_university_module_progress_module_id ON user_university_module_progress(module_id);

-- =====================================================
-- SKAPA USER_UNIVERSITY_LESSON_PROGRESS TABELL
-- =====================================================
-- För att följa användarens framsteg i universitets-lektioner

CREATE TABLE user_university_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES university_course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_university_lesson_progress_user_id ON user_university_lesson_progress(user_id);
CREATE INDEX idx_user_university_lesson_progress_lesson_id ON user_university_lesson_progress(lesson_id);

-- =====================================================
-- SKAPA USER_UNIVERSITY_EXERCISE_ATTEMPTS TABELL
-- =====================================================
-- För att spåra användarens försök på universitets-övningar

CREATE TABLE user_university_exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES university_course_exercises(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  time_spent_seconds INTEGER,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_university_exercise_attempts_user_id ON user_university_exercise_attempts(user_id);
CREATE INDEX idx_user_university_exercise_attempts_exercise_id ON user_university_exercise_attempts(exercise_id);
CREATE INDEX idx_user_university_exercise_attempts_attempted_at ON user_university_exercise_attempts(attempted_at DESC);

-- =====================================================
-- AKTIVERA RLS PÅ ALLA TABELLER
-- =====================================================

ALTER TABLE university_course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_course_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_exercise_attempts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SKAPA RLS POLICIES - PUBLIKT INNEHÅLL
-- =====================================================

-- Alla kan läsa publicerade modules
CREATE POLICY "Anyone can view published university modules"
  ON university_course_modules FOR SELECT
  USING (is_published = true);

-- Alla kan läsa publicerade lessons
CREATE POLICY "Anyone can view published university lessons"
  ON university_course_lessons FOR SELECT
  USING (is_published = true);

-- Alla kan läsa exercises
CREATE POLICY "Anyone can view university exercises"
  ON university_course_exercises FOR SELECT
  USING (true);

-- =====================================================
-- SKAPA RLS POLICIES - USER PROGRESS
-- =====================================================

-- Users kan läsa sin egen modul-progress
CREATE POLICY "Users can view own university module progress"
  ON user_university_module_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users kan uppdatera sin egen modul-progress
CREATE POLICY "Users can update own university module progress"
  ON user_university_module_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Users kan skapa sin egen modul-progress
CREATE POLICY "Users can insert own university module progress"
  ON user_university_module_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users kan läsa sin egen lektion-progress
CREATE POLICY "Users can view own university lesson progress"
  ON user_university_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users kan uppdatera sin egen lektion-progress
CREATE POLICY "Users can update own university lesson progress"
  ON user_university_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Users kan skapa sin egen lektion-progress
CREATE POLICY "Users can insert own university lesson progress"
  ON user_university_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users kan läsa sina egna övnings-försök
CREATE POLICY "Users can view own university exercise attempts"
  ON user_university_exercise_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Users kan skapa sina egna övnings-försök
CREATE POLICY "Users can insert own university exercise attempts"
  ON user_university_exercise_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SKAPA TRIGGERS FÖR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_university_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_university_course_modules_updated_at
  BEFORE UPDATE ON university_course_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_university_content_updated_at();

CREATE TRIGGER update_university_course_lessons_updated_at
  BEFORE UPDATE ON university_course_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_university_content_updated_at();

CREATE TRIGGER update_university_course_exercises_updated_at
  BEFORE UPDATE ON university_course_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_university_content_updated_at();

CREATE TRIGGER update_user_university_module_progress_updated_at
  BEFORE UPDATE ON user_university_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_university_content_updated_at();

CREATE TRIGGER update_user_university_lesson_progress_updated_at
  BEFORE UPDATE ON user_university_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_university_content_updated_at();

-- =====================================================
-- SKAPA FUNKTION FÖR ATT RÄKNA TOTALT ANTAL LESSONS
-- =====================================================

CREATE OR REPLACE FUNCTION count_university_module_lessons(p_module_id UUID)
RETURNS INTEGER AS $$
DECLARE
  lesson_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO lesson_count
  FROM university_course_lessons
  WHERE module_id = p_module_id;
  
  RETURN lesson_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SKAPA FUNKTION FÖR ATT UPPDATERA MODULE PROGRESS
-- =====================================================

CREATE OR REPLACE FUNCTION update_university_module_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_module_id UUID;
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_progress INTEGER;
BEGIN
  -- Hämta module_id från lesson
  SELECT module_id INTO v_module_id
  FROM university_course_lessons
  WHERE id = NEW.lesson_id;

  -- Räkna totalt antal lektioner i modulen
  SELECT COUNT(*) INTO v_total_lessons
  FROM university_course_lessons
  WHERE module_id = v_module_id;

  -- Räkna antal slutförda lektioner
  SELECT COUNT(*) INTO v_completed_lessons
  FROM user_university_lesson_progress ulp
  JOIN university_course_lessons ucl ON ulp.lesson_id = ucl.id
  WHERE ulp.user_id = NEW.user_id
    AND ucl.module_id = v_module_id
    AND ulp.completed = true;

  -- Beräkna progress
  IF v_total_lessons > 0 THEN
    v_progress := ROUND((v_completed_lessons::NUMERIC / v_total_lessons::NUMERIC) * 100);
  ELSE
    v_progress := 0;
  END IF;

  -- Uppdatera eller skapa module progress
  INSERT INTO user_university_module_progress (
    user_id,
    module_id,
    progress,
    completed_lessons,
    total_lessons,
    completed_at
  ) VALUES (
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

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'Universitets innehållsstruktur skapad!' as status;
SELECT 'Tabeller: university_course_modules, university_course_lessons, university_course_exercises' as created_tables;
SELECT 'Progress-tabeller: user_university_module_progress, user_university_lesson_progress, user_university_exercise_attempts' as progress_tables;
