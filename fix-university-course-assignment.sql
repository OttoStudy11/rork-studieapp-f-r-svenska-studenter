-- ============================================================
-- FIX UNIVERSITY COURSE ASSIGNMENT
-- ============================================================
-- This script ensures the university course system works correctly
-- Run this in your Supabase SQL Editor
-- ============================================================

-- STEP 1: Create universities table if not exists
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'university',
  category TEXT NOT NULL DEFAULT 'Universitet',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Create university_programs table if not exists
CREATE TABLE IF NOT EXISTS university_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  abbreviation TEXT,
  degree_type TEXT NOT NULL DEFAULT 'kandidat',
  field TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 180,
  duration_years NUMERIC(3,1) NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create university_courses table if not exists
CREATE TABLE IF NOT EXISTS university_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  credits NUMERIC(4,1) DEFAULT 7.5,
  level TEXT DEFAULT 'grundnivå',
  subject_area TEXT NOT NULL,
  prerequisites TEXT,
  learning_outcomes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Create university_program_courses junction table
CREATE TABLE IF NOT EXISTS university_program_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES university_programs(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
  semester INTEGER DEFAULT 1,
  is_mandatory BOOLEAN DEFAULT true,
  UNIQUE(program_id, course_id)
);

-- STEP 5: Create user_university_courses table
CREATE TABLE IF NOT EXISTS user_university_courses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES university_programs(id) ON DELETE SET NULL,
  course_id UUID NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_university_programs_name ON university_programs(name);
CREATE INDEX IF NOT EXISTS idx_university_programs_field ON university_programs(field);
CREATE INDEX IF NOT EXISTS idx_university_courses_subject ON university_courses(subject_area);
CREATE INDEX IF NOT EXISTS idx_university_program_courses_program ON university_program_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_university_program_courses_semester ON university_program_courses(semester);
CREATE INDEX IF NOT EXISTS idx_user_university_courses_user ON user_university_courses(user_id);

-- STEP 7: Enable RLS on all tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_program_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_courses ENABLE ROW LEVEL SECURITY;

-- STEP 8: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read universities" ON universities;
DROP POLICY IF EXISTS "Anyone can read university_programs" ON university_programs;
DROP POLICY IF EXISTS "Anyone can read university_courses" ON university_courses;
DROP POLICY IF EXISTS "Anyone can read university_program_courses" ON university_program_courses;
DROP POLICY IF EXISTS "Users can read own university courses" ON user_university_courses;
DROP POLICY IF EXISTS "Users can insert own university courses" ON user_university_courses;
DROP POLICY IF EXISTS "Users can update own university courses" ON user_university_courses;
DROP POLICY IF EXISTS "Users can delete own university courses" ON user_university_courses;

-- STEP 9: Create RLS policies
CREATE POLICY "Anyone can read universities" ON universities FOR SELECT USING (true);
CREATE POLICY "Anyone can read university_programs" ON university_programs FOR SELECT USING (true);
CREATE POLICY "Anyone can read university_courses" ON university_courses FOR SELECT USING (true);
CREATE POLICY "Anyone can read university_program_courses" ON university_program_courses FOR SELECT USING (true);

CREATE POLICY "Users can read own university courses" ON user_university_courses 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own university courses" ON user_university_courses 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own university courses" ON user_university_courses 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own university courses" ON user_university_courses 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- STEP 10: Insert sample university programs if empty
-- ============================================================
INSERT INTO university_programs (name, abbreviation, degree_type, field, credits, duration_years)
SELECT * FROM (VALUES
  ('Civilingenjör - Datateknik', 'CI-DT', 'civilingenjör', 'Teknik', 300, 5),
  ('Civilingenjör - Elektroteknik', 'CI-EL', 'civilingenjör', 'Teknik', 300, 5),
  ('Civilingenjör - Maskinteknik', 'CI-MA', 'civilingenjör', 'Teknik', 300, 5),
  ('Civilingenjör - Industriell ekonomi', 'CI-IE', 'civilingenjör', 'Teknik/Ekonomi', 300, 5),
  ('Högskoleingenjör - Datateknik', 'HI-DT', 'högskoleingenjör', 'Teknik', 180, 3),
  ('Högskoleingenjör - Elektroteknik', 'HI-EL', 'högskoleingenjör', 'Teknik', 180, 3),
  ('Läkarprogrammet', 'LÄK', 'professionsprogram', 'Medicin', 330, 5.5),
  ('Sjuksköterskeprogrammet', 'SSK', 'professionsprogram', 'Vårdvetenskap', 180, 3),
  ('Psykologprogrammet', 'PSY', 'professionsprogram', 'Psykologi', 300, 5),
  ('Juristprogrammet', 'JUR', 'professionsprogram', 'Juridik', 270, 4.5),
  ('Ekonomprogrammet', 'EKON', 'kandidat', 'Ekonomi', 180, 3),
  ('Kandidatprogram i datavetenskap', 'K-DV', 'kandidat', 'Naturvetenskap', 180, 3),
  ('Kandidatprogram i biologi', 'K-BIO', 'kandidat', 'Naturvetenskap', 180, 3),
  ('Kandidatprogram i fysik', 'K-FYS', 'kandidat', 'Naturvetenskap', 180, 3),
  ('Systemvetenskap', 'SYS', 'kandidat', 'IT', 180, 3)
) AS v(name, abbreviation, degree_type, field, credits, duration_years)
WHERE NOT EXISTS (SELECT 1 FROM university_programs LIMIT 1);

-- ============================================================
-- STEP 11: Insert sample courses for programs
-- ============================================================
DO $$
DECLARE
  prog_civ_dt UUID;
  prog_civ_ie UUID;
  prog_ekon UUID;
  prog_sys UUID;
  course_linalg UUID;
  course_prog1 UUID;
  course_analys1 UUID;
  course_diskmat UUID;
  course_prog2 UUID;
  course_analys2 UUID;
  course_algo UUID;
  course_datorsys UUID;
  course_foretag UUID;
  course_mktg UUID;
  course_stat UUID;
  course_org UUID;
BEGIN
  -- Get program IDs
  SELECT id INTO prog_civ_dt FROM university_programs WHERE name ILIKE '%Civilingenjör - Datateknik%' LIMIT 1;
  SELECT id INTO prog_civ_ie FROM university_programs WHERE name ILIKE '%Industriell ekonomi%' LIMIT 1;
  SELECT id INTO prog_ekon FROM university_programs WHERE name ILIKE '%Ekonomprogrammet%' LIMIT 1;
  SELECT id INTO prog_sys FROM university_programs WHERE name ILIKE '%Systemvetenskap%' LIMIT 1;

  -- Only insert if we don't have courses yet
  IF NOT EXISTS (SELECT 1 FROM university_courses LIMIT 1) THEN
    -- Insert courses
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('LINALG-1', 'Linjär Algebra', 'Grundläggande linjär algebra med vektorer, matriser och linjära avbildningar', 7.5, 'grundnivå', 'Matematik')
    RETURNING id INTO course_linalg;
    
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('PROG-1', 'Programmering I', 'Introduktion till programmering med Python', 7.5, 'grundnivå', 'Datavetenskap')
    RETURNING id INTO course_prog1;
    
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('ANALYS-1', 'Analys I', 'Envariabelanalys: derivata, integraler och differentialekvationer', 7.5, 'grundnivå', 'Matematik')
    RETURNING id INTO course_analys1;
    
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('DISKMAT-1', 'Diskret Matematik', 'Logik, mängdlära, kombinatorik och grafteori', 7.5, 'grundnivå', 'Matematik')
    RETURNING id INTO course_diskmat;
    
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('PROG-2', 'Programmering II', 'Objektorienterad programmering och datastrukturer', 7.5, 'grundnivå', 'Datavetenskap')
    RETURNING id INTO course_prog2;
    
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('ANALYS-2', 'Analys II', 'Flervariabelanalys: partiella derivator och multipla integraler', 7.5, 'grundnivå', 'Matematik')
    RETURNING id INTO course_analys2;
    
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('ALGO-1', 'Algoritmer och datastrukturer', 'Algoritmer och komplexitetsanalys', 7.5, 'grundnivå', 'Datavetenskap')
    RETURNING id INTO course_algo;
    
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('DATORSYS-1', 'Datorsystem', 'Datorarkitektur, operativsystem och nätverk', 7.5, 'grundnivå', 'Datavetenskap')
    RETURNING id INTO course_datorsys;
    
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('FORETAG-1', 'Företagsekonomi', 'Grundläggande företagsekonomi och redovisning', 7.5, 'grundnivå', 'Ekonomi')
    RETURNING id INTO course_foretag;
    
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('MKTG-1', 'Marknadsföring', 'Grundläggande marknadsföring', 7.5, 'grundnivå', 'Ekonomi')
    RETURNING id INTO course_mktg;
    
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('STAT-1', 'Statistik', 'Statistik och sannolikhetslära', 7.5, 'grundnivå', 'Matematik')
    RETURNING id INTO course_stat;
    
    INSERT INTO university_courses (course_code, title, description, credits, level, subject_area)
    VALUES 
      ('ORG-1', 'Organisation och ledarskap', 'Organisationsteori och ledarskap', 7.5, 'grundnivå', 'Ekonomi')
    RETURNING id INTO course_org;

    -- Link courses to Civilingenjör Datateknik
    IF prog_civ_dt IS NOT NULL THEN
      INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory) VALUES
        (prog_civ_dt, course_linalg, 1, true),
        (prog_civ_dt, course_prog1, 1, true),
        (prog_civ_dt, course_analys1, 1, true),
        (prog_civ_dt, course_diskmat, 1, true),
        (prog_civ_dt, course_prog2, 2, true),
        (prog_civ_dt, course_analys2, 2, true),
        (prog_civ_dt, course_algo, 2, true),
        (prog_civ_dt, course_datorsys, 2, true);
    END IF;

    -- Link courses to Civilingenjör Industriell ekonomi
    IF prog_civ_ie IS NOT NULL THEN
      INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory) VALUES
        (prog_civ_ie, course_linalg, 1, true),
        (prog_civ_ie, course_analys1, 1, true),
        (prog_civ_ie, course_foretag, 1, true),
        (prog_civ_ie, course_prog1, 1, true),
        (prog_civ_ie, course_stat, 2, true),
        (prog_civ_ie, course_mktg, 2, true),
        (prog_civ_ie, course_org, 2, true),
        (prog_civ_ie, course_analys2, 2, true);
    END IF;

    -- Link courses to Ekonomprogrammet
    IF prog_ekon IS NOT NULL THEN
      INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory) VALUES
        (prog_ekon, course_foretag, 1, true),
        (prog_ekon, course_stat, 1, true),
        (prog_ekon, course_mktg, 2, true),
        (prog_ekon, course_org, 2, true);
    END IF;

    -- Link courses to Systemvetenskap
    IF prog_sys IS NOT NULL THEN
      INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory) VALUES
        (prog_sys, course_prog1, 1, true),
        (prog_sys, course_diskmat, 1, true),
        (prog_sys, course_prog2, 2, true),
        (prog_sys, course_datorsys, 2, true);
    END IF;
  END IF;
END $$;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'University programs:' as info, COUNT(*) as count FROM university_programs;
SELECT 'University courses:' as info, COUNT(*) as count FROM university_courses;
SELECT 'Program-course links:' as info, COUNT(*) as count FROM university_program_courses;

-- Show programs with their course counts
SELECT 
  up.name as program_name,
  up.field,
  COUNT(upc.course_id) as course_count
FROM university_programs up
LEFT JOIN university_program_courses upc ON up.id = upc.program_id
GROUP BY up.id, up.name, up.field
ORDER BY up.name;
