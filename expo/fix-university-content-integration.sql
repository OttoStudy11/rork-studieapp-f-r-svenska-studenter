-- =====================================================
-- KOMPLETT INTEGRATION AV UNIVERSITETS-INNEHÅLL
-- =====================================================
-- Skapar parallell innehållsstruktur för högskola/universitet
-- med modules, lessons, exercises precis som gymnasium
-- =====================================================

BEGIN;

-- =====================================================
-- STEG 1: SÄKERSTÄLL RÄTT ID-TYP FÖR UNIVERSITY_COURSES
-- =====================================================

-- Kontrollera om tabellerna redan finns och deras struktur
DO $$ 
BEGIN
    -- Drop gamla tabeller om de finns med fel struktur
    DROP TABLE IF EXISTS user_university_exercise_attempts CASCADE;
    DROP TABLE IF EXISTS user_university_lesson_progress CASCADE;
    DROP TABLE IF EXISTS user_university_module_progress CASCADE;
    DROP TABLE IF EXISTS university_course_exercises CASCADE;
    DROP TABLE IF EXISTS university_course_lessons CASCADE;
    DROP TABLE IF EXISTS university_course_modules CASCADE;
END $$;

-- =====================================================
-- STEG 2: SKAPA UNIVERSITY_COURSE_MODULES
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
-- STEG 3: SKAPA UNIVERSITY_COURSE_LESSONS
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
-- STEG 4: SKAPA UNIVERSITY_COURSE_EXERCISES
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
-- STEG 5: SKAPA USER PROGRESS TABELLER
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
-- STEG 6: AKTIVERA RLS
-- =====================================================

ALTER TABLE university_course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_course_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_exercise_attempts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEG 7: RLS POLICIES - INNEHÅLL (PUBLIKT)
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
-- STEG 8: RLS POLICIES - USER PROGRESS
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
-- STEG 9: TRIGGERS FÖR UPDATED_AT
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
-- STEG 10: TRIGGER FÖR ATT UPPDATERA MODULE PROGRESS
-- =====================================================

CREATE OR REPLACE FUNCTION update_university_module_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_module_id TEXT;
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
-- STEG 11: LÄGG IN EXEMPEL-INNEHÅLL FÖR EN KURS
-- =====================================================

-- Exempel: Linjär Algebra (FMAB20)
INSERT INTO university_course_modules (id, course_id, title, description, order_index, duration_minutes, is_published) VALUES
('FMAB20-M1', 'FMAB20', 'Vektorer och Vektorrum', 'Grundläggande begrepp inom vektorer och vektorrum', 1, 180, true),
('FMAB20-M2', 'FMAB20', 'Matriser och Linjära Ekvationssystem', 'Matrisalgebra och lösning av linjära ekvationssystem', 2, 200, true),
('FMAB20-M3', 'FMAB20', 'Determinanter', 'Beräkning och tillämpning av determinanter', 3, 120, true)
ON CONFLICT (id) DO NOTHING;

-- Lektioner för Modul 1
INSERT INTO university_course_lessons (id, module_id, title, content, order_index, duration_minutes, lesson_type) VALUES
('FMAB20-M1-L1', 'FMAB20-M1', 'Introduktion till Vektorer', 
'# Introduktion till Vektorer

En vektor är ett matematiskt objekt som har både storlek och riktning. Vektorer används för att beskriva fysikaliska storheter som kraft, hastighet och acceleration.

## Definition
En vektor i R^n representeras som en ordnad n-tupel av reella tal:
v = (v₁, v₂, ..., vₙ)

## Geometrisk Tolkning
I två dimensioner kan en vektor visualiseras som en pil från origo till punkten (v₁, v₂).

## Exempel
Vektorn v = (3, 4) representerar en punkt 3 enheter åt höger och 4 enheter uppåt från origo.

## Övning
Rita vektorn (2, 3) i ett koordinatsystem och beräkna dess längd.', 
1, 20, 'theory'),

('FMAB20-M1-L2', 'FMAB20-M1', 'Vektoraddition och Skalärmultiplikation',
'# Vektoraddition och Skalärmultiplikation

## Vektoraddition
För att addera två vektorer, adderar vi motsvarande komponenter:
(a₁, a₂) + (b₁, b₂) = (a₁ + b₁, a₂ + b₂)

## Skalärmultiplikation
För att multiplicera en vektor med en skalär k, multiplicerar vi varje komponent:
k · (v₁, v₂) = (k·v₁, k·v₂)

## Exempel
(2, 3) + (1, 4) = (3, 7)
3 · (2, 1) = (6, 3)

## Egenskaper
- Kommutativitet: v + w = w + v
- Associativitet: (v + w) + u = v + (w + u)
- Distributivitet: k(v + w) = kv + kw',
2, 25, 'theory'),

('FMAB20-M1-L3', 'FMAB20-M1', 'Övningar: Vektoroperationer',
'# Övningar: Vektoroperationer

Lös följande övningar för att befästa dina kunskaper.

## Uppgift 1
Givet v = (2, 3) och w = (4, -1), beräkna:
a) v + w
b) 2v - 3w
c) |v|

## Uppgift 2
Finn vektorn u sådan att v + u = w, där v = (1, 2) och w = (5, 7).

## Uppgift 3
Visa att vektorn (3, 4) och (6, 8) är parallella.

## Lösningsförslag finns i övningsmaterialet.',
3, 30, 'exercise')
ON CONFLICT (id) DO NOTHING;

-- Lektioner för Modul 2
INSERT INTO university_course_lessons (id, module_id, title, content, order_index, duration_minutes, lesson_type) VALUES
('FMAB20-M2-L1', 'FMAB20-M2', 'Introduktion till Matriser',
'# Introduktion till Matriser

En matris är en rektangulär array av tal ordnade i rader och kolumner.

## Definition
En m×n matris har m rader och n kolumner:
A = [a₁₁ a₁₂ ... a₁ₙ]
    [a₂₁ a₂₂ ... a₂ₙ]
    [... ... ... ...]
    [aₘ₁ aₘ₂ ... aₘₙ]

## Specialfall
- Kvadratisk matris: m = n
- Enhetsmatris I: Diagonalelement = 1, övriga = 0
- Nollmatris: Alla element = 0

## Matrisoperationer
Matriser kan adderas och multipliceras enligt specifika regler.',
1, 20, 'theory'),

('FMAB20-M2-L2', 'FMAB20-M2', 'Matrisaddition och Matrismultiplikation',
'# Matrisaddition och Matrismultiplikation

## Matrisaddition
Två matriser av samma dimension kan adderas elementvis.

## Matrismultiplikation
För att multiplicera A (m×n) med B (n×p), beräknar vi:
(AB)ᵢⱼ = Σₖ aᵢₖ · bₖⱼ

## Exempel
[1 2] · [5 6] = [1·5+2·7  1·6+2·8] = [19 22]
[3 4]   [7 8]   [3·5+4·7  3·6+4·8]   [43 50]

## Egenskaper
- Ej kommutativ: AB ≠ BA (i allmänhet)
- Associativ: (AB)C = A(BC)
- Distributiv: A(B+C) = AB + AC',
2, 30, 'theory')
ON CONFLICT (id) DO NOTHING;

-- Övningar för lektionerna
INSERT INTO university_course_exercises (id, lesson_id, question, question_type, options, correct_answer, explanation, difficulty, order_index) VALUES
('FMAB20-M1-L1-E1', 'FMAB20-M1-L1', 
'Vad är längden av vektorn v = (3, 4)?',
'multiple_choice',
'["3", "4", "5", "7"]'::jsonb,
'5',
'Längden beräknas som √(3² + 4²) = √(9 + 16) = √25 = 5',
'easy', 1),

('FMAB20-M1-L1-E2', 'FMAB20-M1-L1',
'En vektor kan ha både storlek och riktning.',
'true_false',
NULL,
'true',
'Detta är definitionen av en vektor - den har både storlek (magnitud) och riktning.',
'easy', 2),

('FMAB20-M1-L2-E1', 'FMAB20-M1-L2',
'Beräkna (2, 3) + (1, 4).',
'multiple_choice',
'["(3, 7)", "(2, 12)", "(1, 1)", "(3, 1)"]'::jsonb,
'(3, 7)',
'Addition komponentvis: (2+1, 3+4) = (3, 7)',
'easy', 1),

('FMAB20-M2-L1-E1', 'FMAB20-M2-L1',
'Hur många element har en 3×4 matris?',
'multiple_choice',
'["7", "12", "3", "4"]'::jsonb,
'12',
'En 3×4 matris har 3 rader och 4 kolumner, totalt 3 × 4 = 12 element.',
'easy', 1)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'Universitets innehållsstruktur komplett!' as status;
SELECT COUNT(*) as university_modules FROM university_course_modules;
SELECT COUNT(*) as university_lessons FROM university_course_lessons;
SELECT COUNT(*) as university_exercises FROM university_course_exercises;
