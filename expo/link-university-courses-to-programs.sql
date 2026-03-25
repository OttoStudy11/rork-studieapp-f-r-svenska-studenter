-- =====================================================
-- KOPPLA KURSER TILL UNIVERSITETSPROGRAM
-- =====================================================
-- Denna fil kopplar kurser till specifika program och terminer
-- Motsvarar gymnasium_courses kopplingen
-- =====================================================

BEGIN;

-- =====================================================
-- CIVILINGENJÖR DATATEKNIK (KTH)
-- =====================================================

-- Hämta program-ID för Civilingenjör Datateknik på KTH
WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'KTH')
  AND name = 'Civilingenjörsutbildning i datateknik'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  -- Termin 1
  ('SF1624', 1, true),  -- Algebra och geometri
  ('SF1625', 1, true),  -- Envariabelanalys
  ('DD1331', 1, true),  -- Grundläggande programmering
  
  -- Termin 2
  ('SF1626', 2, true),  -- Flervariabelanalys
  ('DD1337', 2, true),  -- Programmering
  ('SK1118', 2, true),  -- Ellära
  
  -- Termin 3
  ('DD1338', 3, true),  -- Algoritmer och datastrukturer
  ('SF1901', 3, true),  -- Sannolikhetsteori
  ('SF1627', 3, true),  -- Transformer
  
  -- Termin 4
  ('DD2372', 4, true),  -- Databaser
  ('DD1396', 4, true),  -- Parallellprogrammering
  
  -- Termin 5-10: Avancerade kurser
  ('DD2350', 5, true),  -- Algoritmer, datastrukturer och komplexitet
  ('DD2380', 6, false), -- AI
  ('DD2458', 7, false)  -- Problemlösning under press
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- CIVILINGENJÖR ELEKTROTEKNIK
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'KTH')
  AND name = 'Civilingenjörsutbildning i elektroteknik'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  -- Termin 1-2
  ('SF1624', 1, true),
  ('SF1625', 1, true),
  ('SK1118', 1, true),
  ('SF1626', 2, true),
  ('IE1204', 2, true),
  
  -- Termin 3-4
  ('IE1206', 3, true),
  ('SF1901', 3, true),
  ('IE1332', 4, true),
  
  -- Avancerade kurser
  ('IE2450', 5, false),
  ('IE1304', 6, false)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- CIVILINGENJÖR MASKINTEKNIK
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'KTH')
  AND name = 'Civilingenjörsutbildning i maskinteknik'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  -- Termin 1-2
  ('SF1624', 1, true),
  ('SF1625', 1, true),
  ('SI1142', 1, true),
  ('SF1626', 2, true),
  ('MF1016', 2, true),
  
  -- Termin 3-4
  ('MF1017', 3, true),
  ('SF1901', 3, true),
  ('MF1083', 4, true),
  
  -- Avancerade kurser
  ('ME2063', 5, false),
  ('MG1033', 5, false)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- LÄKARPROGRAMMET (Flera universitet)
-- =====================================================

-- KI
WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'KI')
  AND name = 'Läkarprogrammet'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  -- Termin 1-2
  ('MED101', 1, true),
  ('MED102', 1, true),
  ('MED103', 2, true),
  
  -- Termin 3-4
  ('MED201', 3, true),
  ('MED202', 3, true),
  
  -- Kliniska terminer 5-11
  ('MED301', 5, true),
  ('MED302', 6, true),
  ('MED303', 7, true),
  ('MED304', 8, true),
  ('MED305', 9, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- Uppsala
WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'UU')
  AND name = 'Läkarprogrammet'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('MED101', 1, true),
  ('MED102', 1, true),
  ('MED103', 2, true),
  ('MED201', 3, true),
  ('MED202', 3, true),
  ('MED301', 5, true),
  ('MED302', 6, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- SJUKSKÖTERSKEPROGRAMMET
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'KI')
  AND name = 'Sjuksköterskeprogrammet'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('OMV101', 1, true),
  ('OMV102', 1, true),
  ('OMV201', 2, true),
  ('OMV202', 3, true),
  ('OMV301', 4, false)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- KANDIDATPROGRAM I BIOLOGI
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'UU')
  AND name = 'Kandidatprogram i biologi'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('BIO101', 1, true),
  ('BIO102', 2, true),
  ('BIO201', 3, true),
  ('BIO202', 4, true),
  ('BIO301', 5, false)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- KANDIDATPROGRAM I KEMI
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'UU')
  AND name = 'Kandidatprogram i kemi'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('KEM101', 1, true),
  ('KEM201', 2, true),
  ('KEM202', 3, true),
  ('KEM301', 4, false)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- KANDIDATPROGRAM I FYSIK
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'UU')
  AND name = 'Kandidatprogram i fysik'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('FYS101', 1, true),
  ('FYS102', 2, true),
  ('FYS201', 3, true),
  ('FYS202', 4, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- JURISTPROGRAMMET
-- =====================================================

-- Uppsala
WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'UU')
  AND name = 'Juristprogrammet'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('JUR101', 1, true),
  ('JUR201', 2, true),
  ('JUR202', 3, true),
  ('JUR301', 4, true),
  ('JUR302', 5, false)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- Stockholms universitet
WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'SU')
  AND name = 'Juristprogrammet'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('JUR101', 1, true),
  ('JUR201', 2, true),
  ('JUR202', 3, true),
  ('JUR301', 4, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- EKONOMPROGRAM
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'SU')
  AND name = 'Ekonomprogrammet'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('EKO101', 1, true),
  ('EKO102', 1, true),
  ('EKO201', 2, true),
  ('EKO202', 3, true),
  ('EKO301', 4, false)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- PSYKOLOGPROGRAMMET
-- =====================================================

-- KI
WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'KI')
  AND name = 'Psykologprogrammet'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('PSY101', 1, true),
  ('PSY201', 2, true),
  ('PSY202', 3, true),
  ('PSY301', 4, true),
  ('PSY302', 5, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- Uppsala
WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'UU')
  AND name = 'Psykologprogrammet'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('PSY101', 1, true),
  ('PSY201', 2, true),
  ('PSY202', 3, true),
  ('PSY301', 4, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- LÄRARUTBILDNINGAR
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'GU')
  AND name = 'Förskollärarprogrammet'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('PED101', 1, true),
  ('PED102', 1, true),
  ('PED201', 2, true),
  ('PED301', 3, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- YRKESHÖGSKOLA - WEBBUTVECKLARE
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE name = 'Nackademin')
  AND name = 'Webbutvecklare'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('WEB101', 1, true),
  ('WEB201', 1, true),
  ('WEB301', 2, true),
  ('SYS101', 2, false),
  ('SYS201', 2, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- STATSVETARPROGRAMMET
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'SU')
  AND name = 'Statsvetarprogrammet'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('STV101', 1, true),
  ('STV201', 2, true),
  ('STV202', 3, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- HISTORIA
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'UU')
  AND name = 'Kandidatprogram i historia'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('HIS101', 1, true),
  ('HIS201', 2, true),
  ('HIS202', 3, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- FILOSOFI
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE short_name = 'UU')
  AND name = 'Kandidatprogram i filosofi'
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('FIL101', 1, true),
  ('FIL201', 2, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

-- =====================================================
-- KONSTNÄRLIGA PROGRAM
-- =====================================================

WITH program AS (
  SELECT id FROM university_programs 
  WHERE university_id = (SELECT id FROM universities WHERE name = 'Konstfack')
  LIMIT 1  -- Ta första programmet på Konstfack
)
INSERT INTO university_program_courses (program_id, course_id, semester, is_mandatory)
SELECT 
  program.id,
  c.id,
  courses.semester,
  courses.is_mandatory
FROM program
CROSS JOIN (VALUES
  ('KON101', 1, true),
  ('KON102', 1, true),
  ('KON201', 2, true)
) AS courses(course_code, semester, is_mandatory)
JOIN university_courses c ON c.course_code = courses.course_code
WHERE EXISTS (SELECT 1 FROM program)
ON CONFLICT (program_id, course_id, semester) DO NOTHING;

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'Antal program-kurskopplingar:' as status, COUNT(*) as antal 
FROM university_program_courses;

SELECT 'Kopplingar per program (top 20):' as info;
SELECT 
  up.name as program,
  u.short_name as universitet,
  COUNT(upc.id) as antal_kurser
FROM university_programs up
JOIN universities u ON up.university_id = u.id
LEFT JOIN university_program_courses upc ON upc.program_id = up.id
GROUP BY up.name, u.short_name
ORDER BY antal_kurser DESC
LIMIT 20;
