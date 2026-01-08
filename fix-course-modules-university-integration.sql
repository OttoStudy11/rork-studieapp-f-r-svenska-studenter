-- =====================================================
-- FIX: INTEGRERA UNIVERSITETSKURSER MED COURSE_MODULES
-- =====================================================
-- Detta script säkerställer att alla universitetsklurser
-- finns i courses-tabellen så att course_modules kan
-- referera till dem korrekt
-- =====================================================

BEGIN;

-- =====================================================
-- STEG 1: SÄKERSTÄLL ATT COURSES HAR ALLA NÖDVÄNDIGA KOLUMNER
-- =====================================================

DO $$
BEGIN
  -- education_level
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'education_level') THEN
    ALTER TABLE courses ADD COLUMN education_level TEXT DEFAULT 'gymnasium';
    RAISE NOTICE 'Added education_level column';
  END IF;

  -- credits (högskolepoäng)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'credits') THEN
    ALTER TABLE courses ADD COLUMN credits INTEGER;
    RAISE NOTICE 'Added credits column';
  END IF;

  -- field (ämnesområde)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'field') THEN
    ALTER TABLE courses ADD COLUMN field TEXT;
    RAISE NOTICE 'Added field column';
  END IF;

  -- is_mandatory
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'is_mandatory') THEN
    ALTER TABLE courses ADD COLUMN is_mandatory BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_mandatory column';
  END IF;

  -- program_id (UUID för högskoleprogram)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'program_id') THEN
    ALTER TABLE courses ADD COLUMN program_id UUID;
    RAISE NOTICE 'Added program_id column';
  END IF;

  -- education_year
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'education_year') THEN
    ALTER TABLE courses ADD COLUMN education_year INTEGER;
    RAISE NOTICE 'Added education_year column';
  END IF;

  -- semester
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'courses' AND column_name = 'semester') THEN
    ALTER TABLE courses ADD COLUMN semester INTEGER;
    RAISE NOTICE 'Added semester column';
  END IF;
END $$;

-- =====================================================
-- STEG 2: KONTROLLERA COURSES.ID DATATYP
-- =====================================================

DO $$
DECLARE
  id_data_type TEXT;
BEGIN
  SELECT data_type INTO id_data_type
  FROM information_schema.columns
  WHERE table_name = 'courses' AND column_name = 'id';
  
  RAISE NOTICE 'courses.id datatype: %', id_data_type;
  
  -- Om id är TEXT men vi behöver UUID, behöver vi konvertera
  IF id_data_type = 'text' THEN
    RAISE NOTICE 'WARNING: courses.id är TEXT, inte UUID. Detta kan orsaka problem.';
  END IF;
END $$;

-- =====================================================
-- STEG 3: MIGRERA UNIVERSITETSKLURSER TILL COURSES
-- =====================================================

DO $$
DECLARE
  migrated_count INTEGER := 0;
  univ_courses_exists BOOLEAN;
BEGIN
  -- Kolla om university_courses tabellen finns
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'university_courses'
  ) INTO univ_courses_exists;

  IF univ_courses_exists THEN
    RAISE NOTICE 'university_courses table exists, migrating...';
    
    -- Migrera alla kurser från university_courses till courses
    INSERT INTO courses (
      id,
      course_code,
      title,
      description,
      subject,
      level,
      education_level,
      credits,
      field,
      resources,
      tips,
      progress,
      related_courses
    )
    SELECT 
      uc.id::TEXT,  -- Konvertera UUID till TEXT om nödvändigt
      uc.course_code,
      uc.title,
      COALESCE(uc.description, 'Kursbeskrivning saknas'),
      COALESCE(uc.subject_area, 'Allmänt'),
      uc.level,
      'högskola',
      uc.credits,
      COALESCE(uc.subject_area, 'Allmänt'),
      COALESCE(
        CASE 
          WHEN uc.learning_outcomes IS NOT NULL 
          THEN jsonb_build_array(uc.learning_outcomes)
          ELSE '[]'::jsonb
        END,
        '[]'::jsonb
      ),
      COALESCE(
        CASE 
          WHEN uc.prerequisites IS NOT NULL 
          THEN jsonb_build_array(uc.prerequisites)
          ELSE '[]'::jsonb
        END,
        '[]'::jsonb
      ),
      0,
      '[]'::jsonb
    FROM university_courses uc
    ON CONFLICT (id) DO UPDATE SET
      education_level = 'högskola',
      credits = EXCLUDED.credits,
      field = EXCLUDED.field,
      course_code = EXCLUDED.course_code,
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      subject = EXCLUDED.subject,
      level = EXCLUDED.level;
    
    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE 'Migrated/updated % university courses to courses table', migrated_count;
  ELSE
    RAISE NOTICE 'university_courses table does not exist, skipping migration';
  END IF;
END $$;

-- =====================================================
-- STEG 4: UPPDATERA PROGRAM_COURSES KOPPLINGAR
-- =====================================================

DO $$
DECLARE
  linked_count INTEGER := 0;
BEGIN
  -- Kolla om university_program_courses finns
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'university_program_courses') THEN
    
    -- Skapa program_courses om den inte finns
    CREATE TABLE IF NOT EXISTS program_courses (
      program_id UUID NOT NULL,
      course_id UUID NOT NULL,
      semester INTEGER DEFAULT 1,
      is_mandatory BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (program_id, course_id)
    );
    
    -- Migrera kopplingar
    INSERT INTO program_courses (program_id, course_id, semester, is_mandatory)
    SELECT 
      upc.program_id,
      upc.course_id,
      upc.semester,
      COALESCE(upc.is_mandatory, true)
    FROM university_program_courses upc
    ON CONFLICT (program_id, course_id) DO UPDATE SET
      semester = EXCLUDED.semester,
      is_mandatory = EXCLUDED.is_mandatory;
    
    GET DIAGNOSTICS linked_count = ROW_COUNT;
    RAISE NOTICE 'Linked % university courses to programs', linked_count;
  END IF;
END $$;

-- =====================================================
-- STEG 5: FIX COURSE_MODULES FOREIGN KEY OM NÖDVÄNDIGT
-- =====================================================

DO $$
DECLARE
  course_id_type TEXT;
  course_modules_course_id_type TEXT;
BEGIN
  -- Hämta datatyper
  SELECT data_type INTO course_id_type
  FROM information_schema.columns
  WHERE table_name = 'courses' AND column_name = 'id';
  
  SELECT data_type INTO course_modules_course_id_type
  FROM information_schema.columns
  WHERE table_name = 'course_modules' AND column_name = 'course_id';
  
  RAISE NOTICE 'courses.id type: %, course_modules.course_id type: %', 
    course_id_type, course_modules_course_id_type;
  
  -- Om typerna inte matchar, fixa det
  IF course_id_type != course_modules_course_id_type THEN
    RAISE NOTICE 'Type mismatch detected! Fixing...';
    
    -- Drop foreign key constraint
    ALTER TABLE course_modules 
      DROP CONSTRAINT IF EXISTS course_modules_course_id_fkey;
    
    -- Om courses.id är UUID och course_modules.course_id är TEXT
    IF course_id_type = 'uuid' AND course_modules_course_id_type = 'text' THEN
      -- Konvertera course_modules.course_id till UUID
      ALTER TABLE course_modules 
        ALTER COLUMN course_id TYPE UUID USING course_id::UUID;
      
      RAISE NOTICE 'Converted course_modules.course_id to UUID';
    END IF;
    
    -- Om courses.id är TEXT och course_modules.course_id är UUID
    IF course_id_type = 'text' AND course_modules_course_id_type = 'uuid' THEN
      -- Konvertera course_modules.course_id till TEXT
      ALTER TABLE course_modules 
        ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
      
      RAISE NOTICE 'Converted course_modules.course_id to TEXT';
    END IF;
    
    -- Återskapa foreign key constraint
    ALTER TABLE course_modules
      ADD CONSTRAINT course_modules_course_id_fkey
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Recreated foreign key constraint';
  ELSE
    RAISE NOTICE 'Types match, no conversion needed';
  END IF;
END $$;

-- =====================================================
-- STEG 6: FIX ANDRA TABELLER SOM REFERERAR COURSES
-- =====================================================

DO $$
BEGIN
  -- Fix course_lessons
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_lessons') THEN
    DECLARE
      course_id_type TEXT;
      lesson_course_id_type TEXT;
    BEGIN
      SELECT data_type INTO course_id_type
      FROM information_schema.columns
      WHERE table_name = 'courses' AND column_name = 'id';
      
      SELECT data_type INTO lesson_course_id_type
      FROM information_schema.columns
      WHERE table_name = 'course_lessons' AND column_name = 'course_id';
      
      IF course_id_type != lesson_course_id_type THEN
        ALTER TABLE course_lessons DROP CONSTRAINT IF EXISTS course_lessons_course_id_fkey;
        
        IF course_id_type = 'uuid' AND lesson_course_id_type = 'text' THEN
          ALTER TABLE course_lessons ALTER COLUMN course_id TYPE UUID USING course_id::UUID;
        ELSIF course_id_type = 'text' AND lesson_course_id_type = 'uuid' THEN
          ALTER TABLE course_lessons ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
        END IF;
        
        ALTER TABLE course_lessons
          ADD CONSTRAINT course_lessons_course_id_fkey
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Fixed course_lessons.course_id type';
      END IF;
    END;
  END IF;

  -- Fix course_exercises
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_exercises') THEN
    DECLARE
      course_id_type TEXT;
      exercise_course_id_type TEXT;
    BEGIN
      SELECT data_type INTO course_id_type
      FROM information_schema.columns
      WHERE table_name = 'courses' AND column_name = 'id';
      
      SELECT data_type INTO exercise_course_id_type
      FROM information_schema.columns
      WHERE table_name = 'course_exercises' AND column_name = 'course_id';
      
      IF course_id_type != exercise_course_id_type THEN
        ALTER TABLE course_exercises DROP CONSTRAINT IF EXISTS course_exercises_course_id_fkey;
        
        IF course_id_type = 'uuid' AND exercise_course_id_type = 'text' THEN
          ALTER TABLE course_exercises ALTER COLUMN course_id TYPE UUID USING course_id::UUID;
        ELSIF course_id_type = 'text' AND exercise_course_id_type = 'uuid' THEN
          ALTER TABLE course_exercises ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
        END IF;
        
        ALTER TABLE course_exercises
          ADD CONSTRAINT course_exercises_course_id_fkey
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Fixed course_exercises.course_id type';
      END IF;
    END;
  END IF;
END $$;

-- =====================================================
-- STEG 7: SKAPA INDEX FÖR PRESTANDA
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_courses_education_level ON courses(education_level);
CREATE INDEX IF NOT EXISTS idx_courses_program_id ON courses(program_id);
CREATE INDEX IF NOT EXISTS idx_courses_field ON courses(field);
CREATE INDEX IF NOT EXISTS idx_courses_course_code ON courses(course_code);

-- =====================================================
-- STEG 8: VERIFIERING
-- =====================================================

-- Visa antal kurser per utbildningsnivå
SELECT 
  'Courses by education level' as info,
  education_level,
  COUNT(*) as count
FROM courses
GROUP BY education_level;

-- Visa totalt
SELECT 
  'Total courses' as info,
  COUNT(*) as count
FROM courses;

-- Kolla om den specifika kursen finns
SELECT 
  'Checking for specific course (ca8201d5-1397-419a-b3c6-75764e60be7a)' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM courses WHERE id::TEXT = 'ca8201d5-1397-419a-b3c6-75764e60be7a') 
    THEN 'EXISTS' 
    ELSE 'NOT FOUND' 
  END as status;

-- Visa alla universitetsklurser
SELECT 
  'University courses in courses table' as info,
  id,
  course_code,
  title,
  education_level
FROM courses
WHERE education_level = 'högskola'
LIMIT 10;

COMMIT;

SELECT '✓ Migration complete! All university courses should now be in the courses table.' as result;
