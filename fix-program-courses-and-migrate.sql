-- =====================================================
-- FIX: LÄGG TILL SAKNADE KOLUMNER I PROGRAM_COURSES
-- OCH MIGRERA HÖGSKOLEKURSER
-- =====================================================

BEGIN;

-- =====================================================
-- STEG 1: LÄGG TILL SAKNADE KOLUMNER I PROGRAM_COURSES
-- =====================================================

DO $$
BEGIN
  -- Lägg till semester om den inte finns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'program_courses' AND column_name = 'semester'
  ) THEN
    ALTER TABLE program_courses ADD COLUMN semester INTEGER DEFAULT 1;
    RAISE NOTICE 'Lade till kolumn semester i program_courses';
  END IF;

  -- Lägg till is_mandatory om den inte finns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'program_courses' AND column_name = 'is_mandatory'
  ) THEN
    ALTER TABLE program_courses ADD COLUMN is_mandatory BOOLEAN DEFAULT true;
    RAISE NOTICE 'Lade till kolumn is_mandatory i program_courses';
  END IF;

  -- Lägg till created_at om den inte finns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'program_courses' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE program_courses ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Lade till kolumn created_at i program_courses';
  END IF;
END $$;

-- =====================================================
-- STEG 2: LÄGG TILL KOLUMNER SOM SAKNAS I COURSES
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'education_level') THEN
    ALTER TABLE courses ADD COLUMN education_level TEXT DEFAULT 'gymnasium';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'credits') THEN
    ALTER TABLE courses ADD COLUMN credits INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'field') THEN
    ALTER TABLE courses ADD COLUMN field TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_mandatory') THEN
    ALTER TABLE courses ADD COLUMN is_mandatory BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'program_id') THEN
    ALTER TABLE courses ADD COLUMN program_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'education_year') THEN
    ALTER TABLE courses ADD COLUMN education_year INTEGER;
  END IF;

  RAISE NOTICE 'Kolumner tillagda/verifierade i courses-tabellen';
END $$;

-- =====================================================
-- STEG 3: MIGRERA UNIVERSITY_COURSES TILL COURSES
-- =====================================================

DO $$
DECLARE
  migrated_count INTEGER := 0;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'university_courses') THEN
    
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
      field
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
      COALESCE(to_jsonb(uc.learning_outcomes), '[]'::jsonb),
      COALESCE(to_jsonb(uc.prerequisites), '[]'::jsonb),
      0,
      '[]'::jsonb,
      COALESCE(uc.subject_area, 'Allmänt')
    FROM university_courses uc
    ON CONFLICT (id) DO UPDATE SET
      education_level = 'högskola',
      credits = EXCLUDED.credits,
      field = EXCLUDED.field,
      resources = EXCLUDED.resources,
      tips = EXCLUDED.tips;
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE 'Migrerade % högskolekurser till courses-tabellen', migrated_count;
    
  ELSE
    RAISE NOTICE 'Tabellen university_courses finns inte, hoppar över migrering';
  END IF;
END $$;

-- =====================================================
-- STEG 4: LÄNKA HÖGSKOLEKURSER TILL PROGRAM
-- =====================================================

DO $$
DECLARE
  linked_count INTEGER := 0;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'university_program_courses') THEN
    
    -- Infoga kopplingar från university_program_courses
    INSERT INTO program_courses (program_id, course_id, semester, is_mandatory)
    SELECT 
      upc.program_id,
      upc.course_id,
      COALESCE(upc.semester, 1),
      COALESCE(upc.is_mandatory, true)
    FROM university_program_courses upc
    WHERE EXISTS (SELECT 1 FROM courses c WHERE c.id = upc.course_id)
      AND EXISTS (SELECT 1 FROM programs p WHERE p.id = upc.program_id)
    ON CONFLICT (program_id, course_id) DO UPDATE SET
      semester = EXCLUDED.semester,
      is_mandatory = EXCLUDED.is_mandatory;
    
    GET DIAGNOSTICS linked_count = ROW_COUNT;
    RAISE NOTICE 'Länkade % högskolekurser till program', linked_count;
    
  ELSE
    RAISE NOTICE 'Tabellen university_program_courses finns inte';
  END IF;
END $$;

-- =====================================================
-- STEG 5: SKAPA/UPPDATERA FUNKTION FÖR KURSTILLDELNING
-- =====================================================

CREATE OR REPLACE FUNCTION assign_courses_to_user(
  p_user_id UUID,
  p_program_id UUID,
  p_education_level TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  assigned_count INTEGER := 0;
  course_record RECORD;
BEGIN
  IF p_education_level IN ('högskola', 'universitet', 'bachelor', 'master') THEN
    -- Hämta kurser från program_courses för högskola
    FOR course_record IN 
      SELECT pc.course_id
      FROM program_courses pc
      WHERE pc.program_id = p_program_id
    LOOP
      INSERT INTO user_courses (user_id, course_id, progress, is_active)
      VALUES (p_user_id, course_record.course_id, 0, true)
      ON CONFLICT (user_id, course_id) DO NOTHING;
      
      assigned_count := assigned_count + 1;
    END LOOP;
    
    -- Om inga kurser hittades, tilldela baserat på education_level
    IF assigned_count = 0 THEN
      FOR course_record IN 
        SELECT c.id
        FROM courses c
        WHERE c.education_level = 'högskola'
        LIMIT 10
      LOOP
        INSERT INTO user_courses (user_id, course_id, progress, is_active)
        VALUES (p_user_id, course_record.id, 0, true)
        ON CONFLICT (user_id, course_id) DO NOTHING;
        
        assigned_count := assigned_count + 1;
      END LOOP;
    END IF;
    
  ELSE
    -- Gymnasium: använd befintlig logik
    FOR course_record IN 
      SELECT pc.course_id
      FROM program_courses pc
      WHERE pc.program_id = p_program_id
    LOOP
      INSERT INTO user_courses (user_id, course_id, progress, is_active)
      VALUES (p_user_id, course_record.course_id, 0, true)
      ON CONFLICT (user_id, course_id) DO NOTHING;
      
      assigned_count := assigned_count + 1;
    END LOOP;
  END IF;
  
  RETURN assigned_count;
END;
$$;

-- =====================================================
-- STEG 6: VERIFIERA
-- =====================================================

SELECT 'Migrering slutförd!' as status;

SELECT 
  education_level,
  COUNT(*) as antal_kurser
FROM courses
GROUP BY education_level
ORDER BY education_level;

SELECT 
  'Totalt antal kurser' as info,
  COUNT(*) as antal
FROM courses;

SELECT 
  'Antal program_courses kopplingar' as info,
  COUNT(*) as antal
FROM program_courses;

COMMIT;
