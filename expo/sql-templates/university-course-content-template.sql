-- ============================================================
-- UNIVERSITY COURSE CONTENT TEMPLATE
-- ============================================================
-- Använd denna mall för att skapa innehåll för universitetskurser
-- Ersätt PLACEHOLDER-värden med faktiskt innehåll
-- ============================================================

-- ============================================================
-- STEG 1: Säkerställ att kursen finns i university_courses
-- ============================================================

INSERT INTO university_courses (
  id, 
  course_code, 
  title, 
  description, 
  credits, 
  level, 
  subject_area, 
  prerequisites, 
  learning_outcomes
)
VALUES (
  gen_random_uuid(),                    -- Låt databasen generera UUID
  'COURSE_CODE',                        -- T.ex. 'SF1624'
  'KURSENS TITEL',                      -- T.ex. 'Algebra och geometri'
  'KURSBESKRIVNING',                    -- Detaljerad beskrivning
  7.5,                                  -- Högskolepoäng (vanligt: 7.5, 15, 30)
  'grundnivå',                          -- 'grundnivå' eller 'avancerad nivå'
  'ÄMNESOMRÅDE',                        -- T.ex. 'Matematik', 'Datavetenskap'
  ARRAY[]::TEXT[],                      -- Förkunskapskrav (tomma eller ['KURS1', 'KURS2'])
  ARRAY[
    'LÄRANDEMÅL 1',
    'LÄRANDEMÅL 2',
    'LÄRANDEMÅL 3'
  ]
)
ON CONFLICT (course_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- ============================================================
-- STEG 2: Skapa kursmoduler (3-6 moduler per kurs)
-- ============================================================

-- Modul 1
INSERT INTO course_modules (
  id, 
  course_id, 
  title, 
  description, 
  order_index, 
  estimated_hours, 
  is_published
)
SELECT
  gen_random_uuid(),
  id,
  'MODUL 1 TITEL',
  'MODUL 1 BESKRIVNING',
  1,
  10,                                   -- Beräknad studietid i timmar
  true
FROM university_courses
WHERE course_code = 'COURSE_CODE'
ON CONFLICT (id) DO NOTHING;

-- Modul 2
INSERT INTO course_modules (
  id, 
  course_id, 
  title, 
  description, 
  order_index, 
  estimated_hours, 
  is_published
)
SELECT
  gen_random_uuid(),
  id,
  'MODUL 2 TITEL',
  'MODUL 2 BESKRIVNING',
  2,
  12,
  true
FROM university_courses
WHERE course_code = 'COURSE_CODE'
ON CONFLICT (id) DO NOTHING;

-- Modul 3
INSERT INTO course_modules (
  id, 
  course_id, 
  title, 
  description, 
  order_index, 
  estimated_hours, 
  is_published
)
SELECT
  gen_random_uuid(),
  id,
  'MODUL 3 TITEL',
  'MODUL 3 BESKRIVNING',
  3,
  10,
  true
FROM university_courses
WHERE course_code = 'COURSE_CODE'
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEG 3: Skapa lektioner för varje modul (3-5 lektioner per modul)
-- ============================================================

-- MODUL 1 - LEKTION 1
INSERT INTO course_lessons (
  id,
  module_id,
  course_id,
  title,
  description,
  content,
  lesson_type,
  order_index,
  estimated_minutes,
  difficulty_level,
  learning_objectives,
  is_published
)
SELECT
  gen_random_uuid(),
  cm.id,
  uc.id,
  'LEKTION 1 TITEL',
  'LEKTION 1 BESKRIVNING',
  '## Huvudrubrik

### Underrubrik

Skriv lektionsinnehåll här i Markdown-format.

**Viktiga begrepp:**
- Begrepp 1
- Begrepp 2
- Begrepp 3

### Exempel
Visa praktiska exempel här.

### Övningar
1. Övning 1
2. Övning 2
3. Övning 3

### Sammanfattning
Sammanfatta nyckelpunkterna.',
  'theory',                             -- 'theory', 'exercise', 'video', 'quiz'
  1,
  45,                                   -- Beräknad tid i minuter
  'easy',                               -- 'easy', 'medium', 'hard'
  ARRAY[
    'Lärandemål för denna lektion',
    'Ännu ett lärandemål',
    'Ett tredje lärandemål'
  ],
  true
FROM university_courses uc
JOIN course_modules cm ON cm.course_id = uc.id
WHERE uc.course_code = 'COURSE_CODE' AND cm.order_index = 1
ON CONFLICT (id) DO NOTHING;

-- MODUL 1 - LEKTION 2
INSERT INTO course_lessons (
  id,
  module_id,
  course_id,
  title,
  description,
  content,
  lesson_type,
  order_index,
  estimated_minutes,
  difficulty_level,
  learning_objectives,
  is_published
)
SELECT
  gen_random_uuid(),
  cm.id,
  uc.id,
  'LEKTION 2 TITEL',
  'LEKTION 2 BESKRIVNING',
  '## Huvudrubrik för lektion 2

Innehåll här...',
  'theory',
  2,
  60,
  'medium',
  ARRAY['Lärandemål 1', 'Lärandemål 2'],
  true
FROM university_courses uc
JOIN course_modules cm ON cm.course_id = uc.id
WHERE uc.course_code = 'COURSE_CODE' AND cm.order_index = 1
ON CONFLICT (id) DO NOTHING;

-- MODUL 1 - LEKTION 3 (Övningslektion)
INSERT INTO course_lessons (
  id,
  module_id,
  course_id,
  title,
  description,
  content,
  lesson_type,
  order_index,
  estimated_minutes,
  difficulty_level,
  learning_objectives,
  is_published
)
SELECT
  gen_random_uuid(),
  cm.id,
  uc.id,
  'Övningar: MODUL 1',
  'Praktiska övningar för att befästa kunskaperna',
  '## Övningsuppgifter

### Del A: Grundläggande övningar
1. Övning 1
2. Övning 2
3. Övning 3

### Del B: Fördjupningsövningar
1. Svårare övning 1
2. Svårare övning 2

### Del C: Tillämpning
1. Praktisk tillämpning 1
2. Praktisk tillämpning 2

### Facit
**Del A:**
1. Svar 1
2. Svar 2
3. Svar 3

**Del B:**
1. Svar 1 med förklaring
2. Svar 2 med förklaring',
  'exercise',
  3,
  60,
  'medium',
  ARRAY['Tillämpa teori i praktiken', 'Lösa problem självständigt'],
  true
FROM university_courses uc
JOIN course_modules cm ON cm.course_id = uc.id
WHERE uc.course_code = 'COURSE_CODE' AND cm.order_index = 1
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEG 4: Upprepa för övriga moduler
-- ============================================================
-- Kopiera lektionsmallen ovan för modul 2 och 3
-- Ändra cm.order_index till 2 respektive 3

-- ============================================================
-- STEG 5: Skapa quiz (valfritt)
-- ============================================================

INSERT INTO course_exercises (
  id,
  lesson_id,
  course_id,
  title,
  description,
  instructions,
  exercise_type,
  questions,
  correct_answers,
  points,
  difficulty_level,
  is_published
)
SELECT
  gen_random_uuid(),
  cl.id,
  uc.id,
  'Quiz: ÄMNESOMRÅDE',
  'Testa dina kunskaper',
  'Välj rätt svar för varje fråga',
  'multiple_choice',
  '[
    {
      "question": "FRÅGA 1?",
      "options": ["Alternativ A", "Alternativ B", "Alternativ C", "Alternativ D"]
    },
    {
      "question": "FRÅGA 2?",
      "options": ["Alternativ A", "Alternativ B", "Alternativ C", "Alternativ D"]
    },
    {
      "question": "FRÅGA 3?",
      "options": ["Alternativ A", "Alternativ B", "Alternativ C", "Alternativ D"]
    }
  ]'::jsonb,
  '["RÄTT SVAR 1", "RÄTT SVAR 2", "RÄTT SVAR 3"]'::jsonb,
  30,
  'easy',
  true
FROM university_courses uc
JOIN course_modules cm ON cm.course_id = uc.id
JOIN course_lessons cl ON cl.module_id = cm.id
WHERE uc.course_code = 'COURSE_CODE' 
  AND cm.order_index = 1 
  AND cl.order_index = 1
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEG 6: Skapa studiehandledning (valfritt)
-- ============================================================

INSERT INTO study_guides (
  id,
  course_id,
  title,
  description,
  content,
  guide_type,
  difficulty_level,
  estimated_read_time,
  is_published
)
SELECT
  gen_random_uuid(),
  id,
  'Formelsamling KURSNAMN',
  'Komplett formelsamling för kursen',
  '# Formelsamling

## Kapitel 1
- Formel 1: `x = y + z`
- Formel 2: `a² + b² = c²`

## Kapitel 2
- Formel 3: ...

## Viktiga begrepp
- **Begrepp 1:** Definition
- **Begrepp 2:** Definition',
  'formula_sheet',                      -- 'formula_sheet', 'summary', 'exam_prep'
  'medium',
  20,                                   -- Beräknad lästid i minuter
  true
FROM university_courses
WHERE course_code = 'COURSE_CODE'
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VERIFIERING
-- ============================================================

-- Kolla att kursen finns
SELECT course_code, title, credits, subject_area 
FROM university_courses 
WHERE course_code = 'COURSE_CODE';

-- Kolla moduler
SELECT 
  title, 
  order_index, 
  estimated_hours,
  is_published
FROM course_modules 
WHERE course_id = (SELECT id FROM university_courses WHERE course_code = 'COURSE_CODE')
ORDER BY order_index;

-- Kolla lektioner
SELECT 
  cm.title as modul,
  cl.title as lektion,
  cl.lesson_type,
  cl.estimated_minutes,
  cl.difficulty_level
FROM course_lessons cl
JOIN course_modules cm ON cl.module_id = cm.id
JOIN university_courses uc ON cl.course_id = uc.id
WHERE uc.course_code = 'COURSE_CODE'
ORDER BY cm.order_index, cl.order_index;

-- Räkna innehåll
SELECT 
  (SELECT COUNT(*) FROM course_modules WHERE course_id = (SELECT id FROM university_courses WHERE course_code = 'COURSE_CODE')) as antal_moduler,
  (SELECT COUNT(*) FROM course_lessons WHERE course_id = (SELECT id FROM university_courses WHERE course_code = 'COURSE_CODE')) as antal_lektioner,
  (SELECT SUM(estimated_minutes) FROM course_lessons WHERE course_id = (SELECT id FROM university_courses WHERE course_code = 'COURSE_CODE')) as total_minuter,
  (SELECT COUNT(*) FROM course_exercises WHERE course_id = (SELECT id FROM university_courses WHERE course_code = 'COURSE_CODE')) as antal_quiz;
