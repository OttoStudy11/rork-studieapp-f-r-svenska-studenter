-- ============================================================
-- COURSE CONTENT POPULATION TEMPLATE
-- ============================================================
-- This template shows how to properly populate course content
-- including modules and lessons for any course in the system.
-- ============================================================

-- ============================================================
-- STEP 1: Ensure the course exists in the courses table
-- ============================================================
-- Course IDs should use the course_code format (e.g., 'MATMAT01a')
-- This ensures consistency across the system

INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'MATMAT01a',                    -- id (use course_code as id for consistency)
  'MATMAT01a',                    -- course_code
  'Matematik 1a',                 -- title
  'Grundläggande kurs i matematik för gymnasiet. Kursen behandlar aritmetik, algebra, geometri, sannolikhet och statistik samt funktioner.',
  'Matematik',                    -- subject
  'gymnasie',                     -- level
  100,                            -- points
  '["Kursmaterial", "Övningsuppgifter", "Formelsamling", "Grafräknare"]'::jsonb,
  '["Öva på problemlösning dagligen", "Förstå koncepten innan du memorerar formler", "Arbeta med studiegrupper"]'::jsonb,
  '["MATMAT01b", "MATMAT02a"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  points = EXCLUDED.points;

-- ============================================================
-- STEP 2: Create course modules
-- ============================================================
-- Modules are the main sections of a course
-- Each module should have a clear order_index starting from 1

-- Module 1: Taluppfattning och aritmetik
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES (
  'MATMAT01a-M01',
  'MATMAT01a',
  'Taluppfattning och aritmetik',
  'Grundläggande begrepp om tal, räknesätt och talens egenskaper.',
  1,
  8,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_published = EXCLUDED.is_published;

-- Module 2: Algebra
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES (
  'MATMAT01a-M02',
  'MATMAT01a',
  'Algebra',
  'Algebraiska uttryck, ekvationer och olikheter.',
  2,
  12,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_published = EXCLUDED.is_published;

-- Module 3: Geometri
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES (
  'MATMAT01a-M03',
  'MATMAT01a',
  'Geometri',
  'Geometriska begrepp, area, volym och trigonometri.',
  3,
  10,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_published = EXCLUDED.is_published;

-- Module 4: Funktioner
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES (
  'MATMAT01a-M04',
  'MATMAT01a',
  'Funktioner',
  'Linjära funktioner, andragradsfunktioner och exponentialfunktioner.',
  4,
  14,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_published = EXCLUDED.is_published;

-- Module 5: Sannolikhet och statistik
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES (
  'MATMAT01a-M05',
  'MATMAT01a',
  'Sannolikhet och statistik',
  'Grundläggande sannolikhetslära och beskrivande statistik.',
  5,
  8,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_published = EXCLUDED.is_published;

-- ============================================================
-- STEP 3: Create lessons for each module
-- ============================================================
-- Lessons are the individual learning units within a module
-- lesson_type can be: 'theory', 'practical', 'exercise', 'quiz', 'video', 'reading'
-- difficulty_level can be: 'easy', 'medium', 'hard'

-- =====================
-- MODULE 1 LESSONS
-- =====================

-- Lesson 1.1: Introduktion till tal
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES (
  'MATMAT01a-M01-L01',
  'MATMAT01a-M01',
  'MATMAT01a',
  'Introduktion till tal',
  'En översikt över talsystemet och dess historia.',
  '## Talsystemet

Tal är grundläggande för all matematik. Vi använder det decimala talsystemet med basen 10.

### Naturliga tal
Naturliga tal är de positiva heltalen: 1, 2, 3, 4, ...

### Hela tal
Hela tal inkluderar även noll och negativa tal: ..., -2, -1, 0, 1, 2, ...

### Rationella tal
Rationella tal kan skrivas som bråk p/q där p och q är heltal och q ≠ 0.

### Reella tal
Reella tal inkluderar alla rationella och irrationella tal, som √2 och π.

### Övningsexempel
1. Klassificera talet 7 (naturligt, helt, rationellt, reellt)
2. Klassificera talet -3 
3. Klassificera talet 0.5
4. Klassificera talet √2',
  'theory',
  1,
  30,
  'easy',
  ARRAY['Förstå skillnaden mellan olika taltyper', 'Kunna klassificera tal', 'Känna till talsystemets historia'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;

-- Lesson 1.2: Räknesätt
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES (
  'MATMAT01a-M01-L02',
  'MATMAT01a-M01',
  'MATMAT01a',
  'Räknesätt och prioriteringsregler',
  'Addition, subtraktion, multiplikation och division med prioriteringsregler.',
  '## Räknesätt

### De fyra räknesätten
- **Addition (+)**: Lägga ihop tal
- **Subtraktion (-)**: Ta bort tal
- **Multiplikation (×)**: Upprepad addition
- **Division (÷)**: Dela upp i lika delar

### Prioriteringsregler (PEMDAS)
1. **P**arenteser först
2. **E**xponenter (potenser)
3. **M**ultiplikation och **D**ivision (från vänster till höger)
4. **A**ddition och **S**ubtraktion (från vänster till höger)

### Exempel
Beräkna: 2 + 3 × 4

Fel sätt: (2 + 3) × 4 = 20
Rätt sätt: 2 + (3 × 4) = 2 + 12 = 14

### Övningar
1. 5 + 2 × 3 = ?
2. (5 + 2) × 3 = ?
3. 20 ÷ 4 + 2 × 3 = ?
4. 20 ÷ (4 + 2) × 3 = ?',
  'theory',
  2,
  45,
  'easy',
  ARRAY['Behärska de fyra räknesätten', 'Tillämpa prioriteringsregler korrekt', 'Lösa uttryck med flera operationer'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;

-- Lesson 1.3: Bråkräkning
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES (
  'MATMAT01a-M01-L03',
  'MATMAT01a-M01',
  'MATMAT01a',
  'Bråkräkning',
  'Räkning med bråktal: addition, subtraktion, multiplikation och division.',
  '## Bråkräkning

### Bråkets delar
Ett bråk består av:
- **Täljare** (ovanför strecket)
- **Nämnare** (under strecket)

### Addition och subtraktion av bråk
Man måste ha samma nämnare:
1/4 + 2/4 = 3/4
1/2 + 1/3 = 3/6 + 2/6 = 5/6

### Multiplikation av bråk
Multiplicera täljare med täljare och nämnare med nämnare:
2/3 × 4/5 = 8/15

### Division av bråk
Multiplicera med det omvända bråket:
2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6

### Förkortning
Förkorta bråk genom att dela täljare och nämnare med samma tal:
8/12 = 2/3 (delat med 4)',
  'theory',
  3,
  60,
  'medium',
  ARRAY['Utföra addition och subtraktion med bråk', 'Utföra multiplikation och division med bråk', 'Förkorta och förlänga bråk'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;

-- Lesson 1.4: Övningar taluppfattning
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES (
  'MATMAT01a-M01-L04',
  'MATMAT01a-M01',
  'MATMAT01a',
  'Övningar: Taluppfattning',
  'Praktiska övningar på taluppfattning och aritmetik.',
  '## Övningsuppgifter

### Del A: Taltyper
Klassificera följande tal som naturliga, hela, rationella eller irrationella:
1. -5
2. 3/4
3. √16
4. π
5. 0

### Del B: Prioriteringsregler
Beräkna:
1. 15 - 3 × 4
2. (15 - 3) × 4
3. 24 ÷ 6 - 2
4. 24 ÷ (6 - 2)
5. 2 + 3² × 4

### Del C: Bråkräkning
Beräkna och förkorta om möjligt:
1. 3/4 + 1/4
2. 5/6 - 1/3
3. 2/5 × 3/4
4. 3/4 ÷ 1/2
5. 7/8 + 3/4 - 1/2

### Facit
A: 1. Heltal 2. Rationellt 3. Naturligt (=4) 4. Irrationellt 5. Heltal
B: 1. 3 2. 48 3. 2 4. 6 5. 38
C: 1. 1 2. 1/2 3. 3/10 4. 3/2 5. 9/8',
  'exercise',
  4,
  45,
  'medium',
  ARRAY['Tillämpa kunskaper om taltyper', 'Lösa uttryck med prioriteringsregler', 'Räkna med bråk'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;

-- =====================
-- MODULE 2 LESSONS
-- =====================

-- Lesson 2.1: Algebraiska uttryck
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES (
  'MATMAT01a-M02-L01',
  'MATMAT01a-M02',
  'MATMAT01a',
  'Algebraiska uttryck',
  'Introduktion till variabler och algebraiska uttryck.',
  '## Algebraiska uttryck

### Vad är en variabel?
En variabel är en symbol (oftast en bokstav) som representerar ett okänt tal.

Exempel: x, y, a, b

### Algebraiska uttryck
Ett algebraiskt uttryck innehåller variabler och operationer.

Exempel: 
- 3x + 5
- 2a - b
- x² + 2x + 1

### Termer och koefficienter
I uttrycket 3x + 5:
- 3x och 5 är **termer**
- 3 är **koefficienten** för x
- 5 är en **konstant**

### Förenkla uttryck
Man kan bara addera/subtrahera termer med samma variabel:
- 3x + 2x = 5x ✓
- 3x + 2y kan inte förenklas ✗
- 2x² + 3x kan inte förenklas ✗

### Exempel
Förenkla: 4x + 3y - 2x + 5y
= (4x - 2x) + (3y + 5y)
= 2x + 8y',
  'theory',
  1,
  45,
  'easy',
  ARRAY['Förstå begreppet variabel', 'Identifiera termer och koefficienter', 'Förenkla algebraiska uttryck'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;

-- Lesson 2.2: Ekvationer
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES (
  'MATMAT01a-M02-L02',
  'MATMAT01a-M02',
  'MATMAT01a',
  'Linjära ekvationer',
  'Lösning av linjära ekvationer av första graden.',
  '## Linjära ekvationer

### Vad är en ekvation?
En ekvation är ett påstående att två uttryck är lika.
Exempel: 2x + 3 = 11

### Lösning av ekvationer
Målet är att isolera variabeln (få x ensamt på ena sidan).

**Principer:**
1. Man får göra samma operation på båda sidor
2. Utför operationer i omvänd ordning mot prioriteringsreglerna

### Exempel 1
Lös: 2x + 3 = 11

2x + 3 = 11
2x = 11 - 3    (subtrahera 3 på båda sidor)
2x = 8
x = 8/2        (dividera med 2 på båda sidor)
x = 4

**Kontroll:** 2(4) + 3 = 8 + 3 = 11 ✓

### Exempel 2
Lös: 3(x - 2) = 12

3(x - 2) = 12
3x - 6 = 12    (utveckla parentesen)
3x = 12 + 6
3x = 18
x = 6

**Kontroll:** 3(6 - 2) = 3(4) = 12 ✓',
  'theory',
  2,
  60,
  'medium',
  ARRAY['Förstå begreppet ekvation', 'Lösa linjära ekvationer', 'Kontrollera lösningar'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;

-- Continue with more lessons...

-- =====================
-- MODULE 3 LESSONS
-- =====================

-- Lesson 3.1: Geometriska begrepp
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES (
  'MATMAT01a-M03-L01',
  'MATMAT01a-M03',
  'MATMAT01a',
  'Geometriska begrepp',
  'Grundläggande geometriska begrepp och figurer.',
  '## Geometriska begrepp

### Punkt, linje och plan
- **Punkt**: En position utan dimension
- **Linje**: En oändlig rak sträcka
- **Plan**: En platt yta som sträcker sig oändligt

### Vinklar
En vinkel bildas när två linjer möts.
- **Spetsig vinkel**: 0° < v < 90°
- **Rät vinkel**: v = 90°
- **Trubbig vinkel**: 90° < v < 180°
- **Rak vinkel**: v = 180°

### Trianglar
Klassificering efter sidor:
- **Liksidig**: Alla sidor lika långa
- **Likbent**: Två sidor lika långa
- **Oliksidig**: Alla sidor olika långa

Klassificering efter vinklar:
- **Spetsvinklig**: Alla vinklar < 90°
- **Rätvinklig**: En vinkel = 90°
- **Trubbvinklig**: En vinkel > 90°

### Fyrhörningar
- **Kvadrat**: Alla sidor lika, alla vinklar räta
- **Rektangel**: Motstående sidor lika, alla vinklar räta
- **Parallellogram**: Motstående sidor parallella och lika
- **Romb**: Alla sidor lika
- **Trapets**: Ett par motstående sidor parallella',
  'theory',
  1,
  45,
  'easy',
  ARRAY['Känna igen grundläggande geometriska begrepp', 'Klassificera trianglar', 'Klassificera fyrhörningar'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;

-- =====================
-- MODULE 4 LESSONS
-- =====================

-- Lesson 4.1: Funktioner introduktion
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES (
  'MATMAT01a-M04-L01',
  'MATMAT01a-M04',
  'MATMAT01a',
  'Introduktion till funktioner',
  'Begreppet funktion och funktionssamband.',
  '## Funktioner

### Vad är en funktion?
En funktion är en regel som tilldelar varje värde i en mängd exakt ett värde i en annan mängd.

Notation: f(x) = uttryck
Exempel: f(x) = 2x + 1

### Definitions- och värdemängd
- **Definitionsmängd (D)**: Alla tillåtna x-värden
- **Värdemängd (V)**: Alla möjliga y-värden

### Räkna med funktioner
Om f(x) = 2x + 1, vad är f(3)?

f(3) = 2(3) + 1 = 6 + 1 = 7

### Funktionens graf
Grafen visar alla punkter (x, f(x)).

För f(x) = 2x + 1:
- f(0) = 1 → punkt (0, 1)
- f(1) = 3 → punkt (1, 3)
- f(2) = 5 → punkt (2, 5)

### Linjära funktioner
f(x) = kx + m

- k = **riktningskoefficient** (lutning)
- m = **y-skärning** (där grafen korsar y-axeln)',
  'theory',
  1,
  60,
  'medium',
  ARRAY['Förstå funktionsbegreppet', 'Beräkna funktionsvärden', 'Rita grafer för linjära funktioner'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;

-- =====================
-- MODULE 5 LESSONS
-- =====================

-- Lesson 5.1: Sannolikhet
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES (
  'MATMAT01a-M05-L01',
  'MATMAT01a-M05',
  'MATMAT01a',
  'Grundläggande sannolikhet',
  'Introduktion till sannolikhetslära.',
  '## Sannolikhet

### Vad är sannolikhet?
Sannolikhet mäter hur troligt det är att en händelse inträffar.

P(A) = sannolikheten för händelse A

### Sannolikhetens värden
- 0 ≤ P(A) ≤ 1
- P(A) = 0: Omöjlig händelse
- P(A) = 1: Säker händelse

### Klassisk sannolikhet
Om alla utfall är lika troliga:

P(A) = antal gynnsamma utfall / totalt antal utfall

### Exempel: Tärningskast
Vad är sannolikheten att få en sexa?

- Gynnsamma utfall: 1 (sexan)
- Totalt antal utfall: 6

P(sexa) = 1/6 ≈ 0.167 ≈ 17%

### Exempel: Kortlek
Vad är sannolikheten att dra ett hjärter ur en kortlek?

- Gynnsamma utfall: 13 (alla hjärter)
- Totalt antal utfall: 52

P(hjärter) = 13/52 = 1/4 = 25%',
  'theory',
  1,
  45,
  'easy',
  ARRAY['Förstå sannolikhetsbegreppet', 'Beräkna klassisk sannolikhet', 'Tolka sannolikhetsvärden'],
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;

-- ============================================================
-- STEP 4: Create exercises (optional but recommended)
-- ============================================================

INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points, difficulty_level, is_published)
VALUES (
  'MATMAT01a-M01-L01-E01',
  'MATMAT01a-M01-L01',
  'MATMAT01a',
  'Quiz: Taltyper',
  'Testa dina kunskaper om olika taltyper.',
  'Välj rätt svar för varje fråga.',
  'multiple_choice',
  '[
    {"question": "Vilket av följande tal är irrationellt?", "options": ["1/2", "√2", "0.5", "-3"]},
    {"question": "Vilket tal är både naturligt och rationellt?", "options": ["0", "-1", "5", "π"]},
    {"question": "Vilken mängd innehåller alla de andra?", "options": ["Naturliga tal", "Hela tal", "Rationella tal", "Reella tal"]}
  ]'::jsonb,
  '["√2", "5", "Reella tal"]'::jsonb,
  30,
  'easy',
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  questions = EXCLUDED.questions,
  is_published = EXCLUDED.is_published;

-- ============================================================
-- STEP 5: Create study guides (optional)
-- ============================================================

INSERT INTO study_guides (id, course_id, title, description, content, guide_type, difficulty_level, estimated_read_time, is_published)
VALUES (
  'MATMAT01a-SG01',
  'MATMAT01a',
  'Formelsamling Matematik 1a',
  'Komplett formelsamling för Matematik 1a',
  '# Formelsamling Matematik 1a

## Aritmetik
- Prioriteringsregler: Parenteser → Exponenter → Multiplikation/Division → Addition/Subtraktion

## Algebra
- Första kvadreringsregeln: (a + b)² = a² + 2ab + b²
- Andra kvadreringsregeln: (a - b)² = a² - 2ab + b²
- Konjugatregeln: (a + b)(a - b) = a² - b²

## Geometri
- Triangelns area: A = (b × h) / 2
- Rektangelns area: A = b × h
- Cirkelns area: A = πr²
- Cirkelns omkrets: O = 2πr

## Funktioner
- Linjär funktion: f(x) = kx + m
- Andragradsfunktion: f(x) = ax² + bx + c
- pq-formeln: x = -p/2 ± √((p/2)² - q)

## Sannolikhet
- P(A) = gynnsamma utfall / totala utfall
- P(inte A) = 1 - P(A)',
  'formula_sheet',
  'medium',
  15,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify the data was inserted correctly

-- Check course exists
SELECT id, title, subject, points FROM courses WHERE id = 'MATMAT01a';

-- Check modules
SELECT id, title, order_index, is_published 
FROM course_modules 
WHERE course_id = 'MATMAT01a' 
ORDER BY order_index;

-- Check lessons
SELECT m.title as module, l.title as lesson, l.order_index, l.estimated_minutes
FROM course_lessons l
JOIN course_modules m ON l.module_id = m.id
WHERE l.course_id = 'MATMAT01a'
ORDER BY m.order_index, l.order_index;

-- Count content
SELECT 
  (SELECT COUNT(*) FROM course_modules WHERE course_id = 'MATMAT01a') as modules,
  (SELECT COUNT(*) FROM course_lessons WHERE course_id = 'MATMAT01a') as lessons,
  (SELECT COUNT(*) FROM course_exercises WHERE course_id = 'MATMAT01a') as exercises,
  (SELECT COUNT(*) FROM study_guides WHERE course_id = 'MATMAT01a') as guides;
