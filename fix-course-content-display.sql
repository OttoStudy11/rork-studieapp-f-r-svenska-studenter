-- ============================================
-- FIX COURSE CONTENT DISPLAY
-- This SQL fixes course_modules and course_lessons display issues
-- ============================================

-- ===========================================
-- 1. VERIFY EXISTING COURSES
-- ===========================================
DO $$
BEGIN
    RAISE NOTICE '=== CHECKING EXISTING COURSES ===';
    RAISE NOTICE 'Total courses: %', (SELECT COUNT(*) FROM courses);
    RAISE NOTICE 'Courses with modules: %', (SELECT COUNT(DISTINCT course_id) FROM course_modules);
    RAISE NOTICE 'Total modules: %', (SELECT COUNT(*) FROM course_modules);
    RAISE NOTICE 'Total lessons: %', (SELECT COUNT(*) FROM course_lessons);
END $$;

-- ===========================================
-- 2. ENSURE ALL CONTENT IS PUBLISHED
-- ===========================================
UPDATE course_modules SET is_published = true WHERE is_published = false;
UPDATE course_lessons SET is_published = true WHERE is_published = false;
UPDATE study_guides SET is_published = true WHERE is_published = false;

-- ===========================================
-- 3. FIX COURSE IDs IF NEEDED
-- ===========================================
-- Sometimes course IDs might not match between courses and course_modules
-- This checks and reports any mismatches

DO $$
DECLARE
    orphaned_modules INT;
    orphaned_lessons INT;
BEGIN
    -- Check for orphaned modules
    SELECT COUNT(*) INTO orphaned_modules
    FROM course_modules cm
    WHERE NOT EXISTS (
        SELECT 1 FROM courses c WHERE c.id = cm.course_id
    );
    
    IF orphaned_modules > 0 THEN
        RAISE WARNING 'Found % orphaned modules (modules without a parent course)', orphaned_modules;
    END IF;
    
    -- Check for orphaned lessons
    SELECT COUNT(*) INTO orphaned_lessons
    FROM course_lessons cl
    WHERE NOT EXISTS (
        SELECT 1 FROM course_modules cm WHERE cm.id = cl.module_id
    );
    
    IF orphaned_lessons > 0 THEN
        RAISE WARNING 'Found % orphaned lessons (lessons without a parent module)', orphaned_lessons;
    END IF;
END $$;

-- ===========================================
-- 4. CREATE SAMPLE CONTENT FOR NATURKUNSKAP 1A2
-- (if it doesn't exist)
-- ===========================================
-- First, ensure Naturkunskap 1a2 course exists
INSERT INTO courses (id, title, description, subject, level, points, resources, tips, related_courses, progress, course_code)
VALUES (
    'naturkunskap1a2',
    'Naturkunskap 1a2',
    'Naturkunskap 1a2 ger grundläggande kunskaper om naturvetenskap och dess betydelse för individ och samhälle.',
    'Naturkunskap',
    'gymnasie',
    50,
    '["Lärobok", "Laborationsmaterial", "Digitala resurser"]'::jsonb,
    '["Läs regelbundet", "Gör laborationer noggrant", "Koppla till vardagen"]'::jsonb,
    '[]'::jsonb,
    0,
    'NATNKN1a2'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    subject = EXCLUDED.subject,
    level = EXCLUDED.level,
    points = EXCLUDED.points;

-- Create modules for Naturkunskap 1a2
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES
    ('naturkunskap1a2-module-1', 'naturkunskap1a2', 'Naturvetenskapens värld', 'Introduktion till naturvetenskap och dess metoder', 0, 15, true),
    ('naturkunskap1a2-module-2', 'naturkunskap1a2', 'Livets kemi', 'Grundläggande kemi och biokemi', 1, 20, true),
    ('naturkunskap1a2-module-3', 'naturkunskap1a2', 'Kropp och hälsa', 'Människokroppen och hälsa', 2, 15, true)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_published = true;

-- Create lessons for Module 1: Naturvetenskapens värld
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
    ('nat1a2-m1-l1', 'naturkunskap1a2-module-1', 'naturkunskap1a2', 'Vad är naturvetenskap?', 'En introduktion till naturvetenskapens grunder', 
     'Naturvetenskap är studiet av naturen och naturliga fenomen. Det omfattar fysik, kemi, biologi och geovetenskap. Naturvetenskapen bygger på systematiska observationer och experiment.

## Naturvetenskapens metod
1. **Observation** - Notera vad som händer
2. **Hypotes** - Föreslå en förklaring
3. **Experiment** - Testa hypotesen
4. **Analys** - Utvärdera resultaten
5. **Slutsats** - Dra lärdomar

## Varför är naturvetenskap viktigt?
Naturvetenskap hjälper oss att:
- Förstå världen omkring oss
- Lösa globala problem
- Utveckla ny teknologi
- Fatta informerade beslut',
     'theory', 0, 30, 'easy', '["Förstå vad naturvetenskap är", "Känna till naturvetenskaplig metod", "Värdera naturvetenskapens betydelse"]', true),
    
    ('nat1a2-m1-l2', 'naturkunskap1a2-module-1', 'naturkunskap1a2', 'Naturvetenskaplig metod', 'Lär dig hur forskare arbetar', 
     'Naturvetenskaplig metod är ett systematiskt sätt att undersöka fenomen och bygga kunskap.

## Stegen i naturvetenskaplig metod

### 1. Observation
Börja med att notera något intressant i naturen. Till exempel: "Varför faller äpplen ner från träd?"

### 2. Formulera en hypotes
En hypotes är en förklaring som kan testas. Exempel: "Äpplen faller på grund av tyngdkraften."

### 3. Planera och genomföra experiment
Designa ett experiment för att testa hypotesen. Använd:
- **Kontrollgrupp** - referensgrupp utan påverkan
- **Experimentgrupp** - grupp som påverkas
- **Variabler** - faktorer som mäts eller ändras

### 4. Samla data
Notera alla observationer noggrant. Använd mätinstrument för exakta resultat.

### 5. Analysera resultaten
Titta på datan och se om den stödjer hypotesen.

### 6. Dra slutsatser
Bestäm om hypotesen var korrekt eller behöver revideras.',
     'theory', 1, 45, 'medium', '["Tillämpa naturvetenskaplig metod", "Planera experiment", "Analysera data"]', true),
    
    ('nat1a2-m1-l3', 'naturkunskap1a2-module-1', 'naturkunskap1a2', 'Övning: Design ett experiment', 'Praktisk tillämpning av vetenskaplig metod', 
     'Nu ska du själv prova att designa ett experiment!

## Uppgift
Välj ett av följande fenomen att undersöka:
1. Påverkar temperatur hur snabbt is smälter?
2. Växer växter snabbare med mer ljus?
3. Påverkar salt vattnets frysningspunkt?

## Instruktioner

### 1. Formulera din forskningsfråga
Skriv ner exakt vad du vill ta reda på.

### 2. Skapa en hypotes
Vad tror du kommer att hända? Varför?

### 3. Planera experimentet
- Vad behöver du för material?
- Hur ska du sätta upp experimentet?
- Vilken är din kontrollgrupp?
- Vilka variabler ska du mäta?

### 4. Förutsäg resultatet
Vad förväntar du dig att se?

### 5. Tänk på säkerhet
Finns det några risker? Hur minimerar du dem?

Skriv ner ditt experimentupplägg i dina anteckningar!',
     'exercise', 2, 40, 'medium', '["Designa ett vetenskapligt experiment", "Identifiera variabler", "Förutsäga resultat"]', true)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    is_published = true;

-- Create lessons for Module 2: Livets kemi
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
    ('nat1a2-m2-l1', 'naturkunskap1a2-module-2', 'naturkunskap1a2', 'Atomer och molekyler', 'Materiens byggstenar', 
     'Allt omkring oss är uppbyggt av atomer - de minsta beståndsdelarna i materia.

## Atomen
En atom består av:
- **Proton** (+) i kärnan
- **Neutron** (neutral) i kärnan
- **Elektron** (-) i skal runt kärnan

## Grundämnen
Grundämnen är ämnen som bara innehåller en sorts atomer. Exempel:
- Väte (H)
- Syre (O)
- Kol (C)
- Kväve (N)

## Molekyler
När atomer binder till varandra bildas molekyler. Exempel:
- Vatten: H₂O (2 väte + 1 syre)
- Koldioxid: CO₂ (1 kol + 2 syre)
- Socker: C₆H₁₂O₆

## Kemiska bindningar
Atomer hålls ihop av:
1. **Kovalenta bindningar** - atomer delar elektroner
2. **Jonbindningar** - atomer ger/tar emot elektroner',
     'theory', 0, 45, 'medium', '["Förstå atomens uppbyggnad", "Känna till grundämnen", "Förklara molekyler"]', true),
    
    ('nat1a2-m2-l2', 'naturkunskap1a2-module-2', 'naturkunskap1a2', 'Organiska molekyler', 'Livets kemiska grunder', 
     'Organisk kemi handlar om kolföreningar - molekyler som innehåller kol.

## Varför kol?
Kol kan bilda 4 bindningar, vilket gör det perfekt för att bygga komplexa molekyler.

## De fyra stora biomolekylerna

### 1. Kolhydrater
- **Funktion:** Energi och struktur
- **Exempel:** Socker, stärkelse, cellulosa
- **Byggstenar:** Enkla sockerarter (monosackarider)

### 2. Lipider (Fetter)
- **Funktion:** Långtidsenergi, cellmembran
- **Exempel:** Oljor, fetter, vax
- **Egenskaper:** Löses inte i vatten

### 3. Proteiner
- **Funktion:** Struktur, katalys (enzymer), transport
- **Exempel:** Muskelprotein, hemoglobin, enzymer
- **Byggstenar:** Aminosyror (20 olika)

### 4. Nukleinsyror
- **Funktion:** Genetisk information
- **Exempel:** DNA, RNA
- **Byggstenar:** Nukleotider

## Betydelse för livet
Alla levande organismer är uppbyggda av dessa molekyler!',
     'theory', 1, 50, 'hard', '["Identifiera biomolekyler", "Förstå deras funktioner", "Koppla till levande organismer"]', true)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    is_published = true;

-- ===========================================
-- 5. CREATE STUDY GUIDES
-- ===========================================
INSERT INTO study_guides (id, course_id, title, description, content, guide_type, difficulty_level, estimated_read_time, is_published)
VALUES
    ('nat1a2-guide-1', 'naturkunskap1a2', 'Snabbguide: Naturvetenskaplig metod', 'En sammanfattning av viktiga steg', 
     '# Naturvetenskaplig metod - Snabbguide

## 5 enkla steg

1. **Observera** - Vad ser du?
2. **Hypotes** - Vad tror du?
3. **Experimentera** - Testa!
4. **Analysera** - Vad betyder resultaten?
5. **Slutsats** - Hade du rätt?

## Tips för framgång
✓ Var noggrann med mätningar
✓ Dokumentera allt
✓ Upprepa experiment
✓ Var objektiv',
     'cheat_sheet', 'easy', 5, true),
    
    ('nat1a2-guide-2', 'naturkunskap1a2', 'Formelblad: Atomer och molekyler', 'Viktiga kemiska formler', 
     '# Kemiska formler

## Grundämnen
- H = Väte
- O = Syre
- C = Kol
- N = Kväve

## Vanliga molekyler
- H₂O = Vatten
- CO₂ = Koldioxid
- O₂ = Syre (gas)
- C₆H₁₂O₆ = Glukos

## Biomolekyler
- Kolhydrater: Cx(H₂O)y
- Proteiner: aminosyror
- Lipider: fetter och oljor
- DNA/RNA: nukleotider',
     'formula_sheet', 'medium', 3, true)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    is_published = true;

-- ===========================================
-- 6. VERIFY THE FIX
-- ===========================================
DO $$
DECLARE
    course_count INT;
    module_count INT;
    lesson_count INT;
    guide_count INT;
BEGIN
    RAISE NOTICE '=== VERIFICATION ===';
    
    SELECT COUNT(*) INTO course_count FROM courses WHERE id = 'naturkunskap1a2';
    SELECT COUNT(*) INTO module_count FROM course_modules WHERE course_id = 'naturkunskap1a2' AND is_published = true;
    SELECT COUNT(*) INTO lesson_count FROM course_lessons WHERE course_id = 'naturkunskap1a2' AND is_published = true;
    SELECT COUNT(*) INTO guide_count FROM study_guides WHERE course_id = 'naturkunskap1a2' AND is_published = true;
    
    RAISE NOTICE 'Naturkunskap 1a2 course: % (should be 1)', course_count;
    RAISE NOTICE 'Published modules: % (should be 3)', module_count;
    RAISE NOTICE 'Published lessons: % (should be 5)', lesson_count;
    RAISE NOTICE 'Published guides: % (should be 2)', guide_count;
    
    IF module_count = 3 AND lesson_count = 5 THEN
        RAISE NOTICE '✅ Course content created successfully!';
    ELSE
        RAISE WARNING '⚠️  Some content might be missing. Check manually.';
    END IF;
END $$;

-- ===========================================
-- 7. SAMPLE QUERY TO TEST IN APP
-- ===========================================
-- This query mimics what the app does
SELECT 
    c.id as course_id,
    c.title as course_title,
    json_agg(
        json_build_object(
            'id', cm.id,
            'title', cm.title,
            'description', cm.description,
            'order_index', cm.order_index,
            'estimated_hours', cm.estimated_hours,
            'lesson_count', (
                SELECT COUNT(*) 
                FROM course_lessons cl 
                WHERE cl.module_id = cm.id AND cl.is_published = true
            )
        ) ORDER BY cm.order_index
    ) as modules
FROM courses c
JOIN course_modules cm ON cm.course_id = c.id
WHERE c.id = 'naturkunskap1a2' 
AND cm.is_published = true
GROUP BY c.id, c.title;
