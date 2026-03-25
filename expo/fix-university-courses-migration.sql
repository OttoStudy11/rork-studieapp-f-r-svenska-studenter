-- =====================================================
-- FIX: MIGRERA HÖGSKOLEKURSER TILL HUVUDTABELLEN
-- =====================================================
-- Detta script fixar type mismatch problemet och 
-- migrerar university_courses korrekt till courses
-- =====================================================

BEGIN;

-- =====================================================
-- STEG 1: LÄGG TILL KOLUMNER I COURSES (om de saknas)
-- =====================================================

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT 'gymnasie' 
CHECK (education_level IN ('gymnasie', 'högskola', 'yrkeshögskola'));

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS credits INTEGER;

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS program_id TEXT;

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS education_year INTEGER;

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS semester INTEGER;

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT true;

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS field TEXT;

-- =====================================================
-- STEG 2: MIGRERA UNIVERSITY_COURSES TILL COURSES
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'university_courses') THEN
    
    -- Migrera med korrekt typ-konvertering
    INSERT INTO courses (
      id, 
      course_code, 
      title, 
      description, 
      subject, 
      level, 
      education_level, 
      credits, 
      resources, 
      tips, 
      progress, 
      related_courses,
      program_id,
      education_year,
      field,
      is_mandatory
    )
    SELECT 
      uc.id,
      uc.course_code,
      uc.title,
      COALESCE(uc.description, 'Kursbeskrivning kommer snart.'),
      COALESCE(uc.subject_area, 'Allmänt'),
      'högskola',
      'högskola',
      uc.credits,
      -- Konvertera TEXT[] till JSONB
      COALESCE(to_jsonb(uc.learning_outcomes), '[]'::jsonb),
      COALESCE(to_jsonb(uc.prerequisites), '[]'::jsonb),
      0,
      '[]'::jsonb,
      uc.program_id,
      uc.year,
      COALESCE(uc.subject_area, 'Allmänt'),
      COALESCE(uc.is_required, true)
    FROM university_courses uc
    ON CONFLICT (id) DO UPDATE SET
      education_level = 'högskola',
      credits = EXCLUDED.credits,
      program_id = EXCLUDED.program_id,
      education_year = EXCLUDED.education_year,
      field = EXCLUDED.field,
      is_mandatory = EXCLUDED.is_mandatory,
      resources = EXCLUDED.resources,
      tips = EXCLUDED.tips;
      
    RAISE NOTICE 'Migrerade % högskolekurser', (SELECT COUNT(*) FROM university_courses);
  ELSE
    RAISE NOTICE 'Tabellen university_courses finns inte, hoppar över migrering';
  END IF;
END $$;

-- =====================================================
-- STEG 3: SKAPA INDEX FÖR SNABBARE QUERIES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_courses_education_level ON courses(education_level);
CREATE INDEX IF NOT EXISTS idx_courses_program_id ON courses(program_id);
CREATE INDEX IF NOT EXISTS idx_courses_education_year ON courses(education_year);
CREATE INDEX IF NOT EXISTS idx_courses_field ON courses(field);
CREATE INDEX IF NOT EXISTS idx_courses_program_year ON courses(program_id, education_year);

-- =====================================================
-- STEG 4: FUNKTION FÖR ATT TILLDELA KURSER VID ONBOARDING
-- =====================================================

CREATE OR REPLACE FUNCTION assign_courses_after_onboarding(
  p_user_id UUID,
  p_program_id TEXT,
  p_education_year INTEGER,
  p_education_level TEXT DEFAULT 'gymnasie'
)
RETURNS TABLE(
  assigned_count INTEGER,
  course_ids UUID[]
) AS $$
DECLARE
  v_assigned_count INTEGER := 0;
  v_course_ids UUID[] := ARRAY[]::UUID[];
  v_course RECORD;
BEGIN
  -- Hämta alla kurser för programmet och årskursen
  FOR v_course IN
    SELECT c.id, c.title
    FROM courses c
    WHERE c.program_id = p_program_id
      AND c.education_level = p_education_level
      AND (c.education_year = p_education_year OR c.education_year IS NULL)
      AND c.is_mandatory = true
  LOOP
    -- Kolla om kursen redan är tilldelad
    IF NOT EXISTS (
      SELECT 1 FROM user_courses 
      WHERE user_id = p_user_id AND course_id = v_course.id
    ) THEN
      -- Tilldela kursen
      INSERT INTO user_courses (user_id, course_id, progress, is_active)
      VALUES (p_user_id, v_course.id, 0, true);
      
      v_assigned_count := v_assigned_count + 1;
      v_course_ids := array_append(v_course_ids, v_course.id);
      
      RAISE NOTICE 'Tilldelade kurs: %', v_course.title;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT v_assigned_count, v_course_ids;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEG 5: FUNKTION FÖR ATT HÄMTA KURSER PER PROGRAM
-- =====================================================

CREATE OR REPLACE FUNCTION get_courses_for_program(
  p_program_id TEXT,
  p_year INTEGER DEFAULT NULL,
  p_education_level TEXT DEFAULT 'gymnasie'
)
RETURNS TABLE(
  id UUID,
  course_code TEXT,
  title TEXT,
  description TEXT,
  subject TEXT,
  credits INTEGER,
  is_mandatory BOOLEAN,
  semester INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.course_code,
    c.title,
    c.description,
    c.subject,
    c.credits,
    c.is_mandatory,
    c.semester
  FROM courses c
  WHERE c.program_id = p_program_id
    AND c.education_level = p_education_level
    AND (p_year IS NULL OR c.education_year = p_year)
  ORDER BY c.semester NULLS LAST, c.title;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEG 6: UPPDATERA BEFINTLIGA USER_COURSES
-- =====================================================

ALTER TABLE user_courses
ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT 'gymnasie';

-- Uppdatera education_level baserat på kursens nivå
UPDATE user_courses uc
SET education_level = c.education_level
FROM courses c
WHERE uc.course_id = c.id;

-- =====================================================
-- STEG 7: RLS POLICIES FÖR HÖGSKOLEKURSER
-- =====================================================

-- Säkerställ att RLS är aktiverat
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

-- Drop gamla policies om de finns
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;
DROP POLICY IF EXISTS "Users can view their own courses" ON user_courses;
DROP POLICY IF EXISTS "Users can insert their own courses" ON user_courses;
DROP POLICY IF EXISTS "Users can update their own courses" ON user_courses;

-- Skapa nya policies
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own courses"
  ON user_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses"
  ON user_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
  ON user_courses FOR UPDATE
  USING (auth.uid() = user_id);

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'Högskolekurser migrerade!' as status;

-- Visa antal kurser per utbildningsnivå
SELECT education_level, COUNT(*) as antal_kurser 
FROM courses 
GROUP BY education_level;

-- Visa antal kurser per program (top 10)
SELECT 
  program_id, 
  education_level,
  COUNT(*) as antal_kurser 
FROM courses 
WHERE program_id IS NOT NULL 
GROUP BY program_id, education_level
ORDER BY antal_kurser DESC
LIMIT 10;
