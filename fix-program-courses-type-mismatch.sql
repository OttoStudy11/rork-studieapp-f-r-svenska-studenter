-- =====================================================
-- FIX: TYPE MISMATCH MELLAN TEXT OCH UUID
-- =====================================================

BEGIN;

-- =====================================================
-- STEG 1: KONTROLLERA KOLUMNTYPER
-- =====================================================

DO $$
DECLARE
  upc_program_id_type TEXT;
  upc_course_id_type TEXT;
  pc_program_id_type TEXT;
  pc_course_id_type TEXT;
BEGIN
  -- Hämta typer från university_program_courses
  SELECT data_type INTO upc_program_id_type
  FROM information_schema.columns 
  WHERE table_name = 'university_program_courses' AND column_name = 'program_id';
  
  SELECT data_type INTO upc_course_id_type
  FROM information_schema.columns 
  WHERE table_name = 'university_program_courses' AND column_name = 'course_id';
  
  -- Hämta typer från program_courses
  SELECT data_type INTO pc_program_id_type
  FROM information_schema.columns 
  WHERE table_name = 'program_courses' AND column_name = 'program_id';
  
  SELECT data_type INTO pc_course_id_type
  FROM information_schema.columns 
  WHERE table_name = 'program_courses' AND column_name = 'course_id';
  
  RAISE NOTICE 'university_program_courses.program_id: %', upc_program_id_type;
  RAISE NOTICE 'university_program_courses.course_id: %', upc_course_id_type;
  RAISE NOTICE 'program_courses.program_id: %', pc_program_id_type;
  RAISE NOTICE 'program_courses.course_id: %', pc_course_id_type;
END $$;

-- =====================================================
-- STEG 2: LÄGG TILL SAKNADE KOLUMNER I PROGRAM_COURSES
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'program_courses' AND column_name = 'semester'
  ) THEN
    ALTER TABLE program_courses ADD COLUMN semester INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'program_courses' AND column_name = 'is_mandatory'
  ) THEN
    ALTER TABLE program_courses ADD COLUMN is_mandatory BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'program_courses' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE program_courses ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- =====================================================
-- STEG 3: LÄNKA KURSER MED EXPLICIT TYPE CASTING
-- =====================================================

DO $$
DECLARE
  linked_count INTEGER := 0;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'university_program_courses') THEN
    
    -- Infoga med explicit UUID casting
    INSERT INTO program_courses (program_id, course_id, semester, is_mandatory)
    SELECT 
      upc.program_id::UUID,
      upc.course_id::UUID,
      COALESCE(upc.semester, 1),
      COALESCE(upc.is_mandatory, true)
    FROM university_program_courses upc
    WHERE EXISTS (SELECT 1 FROM courses c WHERE c.id = upc.course_id::UUID)
      AND EXISTS (SELECT 1 FROM programs p WHERE p.id = upc.program_id::UUID)
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
-- STEG 4: VERIFIERA RESULTAT
-- =====================================================

SELECT 
  'Antal program_courses kopplingar' as info,
  COUNT(*) as antal
FROM program_courses;

SELECT 
  p.name as program_name,
  COUNT(pc.course_id) as antal_kurser
FROM programs p
LEFT JOIN program_courses pc ON pc.program_id = p.id
GROUP BY p.id, p.name
ORDER BY antal_kurser DESC
LIMIT 20;

COMMIT;
