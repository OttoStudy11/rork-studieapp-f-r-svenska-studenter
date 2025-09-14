-- =====================================================
-- POPULATE ALL COURSES WITH CONTENT
-- =====================================================
BEGIN;

-- =====================================================
-- SVENSKA 1
-- =====================================================
DO $$
DECLARE
    svenska1_course_id UUID;
    mod1_id UUID := gen_random_uuid();
    mod2_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    lesson2_id UUID := gen_random_uuid();
    exercise1_id UUID := gen_random_uuid();
    material1_id UUID := gen_random_uuid();
    guide1_id UUID := gen_random_uuid();
    tag_historia_id UUID := gen_random_uuid();
    tag_grammatik_id UUID := gen_random_uuid();
    assessment1_id UUID := gen_random_uuid();
BEGIN
    -- Get existing Svenska 1 course ID
    SELECT id INTO svenska1_course_id FROM courses WHERE title = 'Svenska 1' LIMIT 1;
    
    IF svenska1_course_id IS NULL THEN
        svenska1_course_id := gen_random_uuid();
        INSERT INTO courses (id, title, subject, level, description) VALUES
        (svenska1_course_id, 'Svenska 1', 'Svenska', 'gymnasie', 'Grundläggande kurs i svenska språket');
    END IF;

    INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
    (mod1_id, svenska1_course_id, 'Språkhistoria', 'Svenska språkets utveckling', 1, 20),
    (mod2_id, svenska1_course_id, 'Textanalys', 'Analysera och förstå texter', 2, 25)
    ON CONFLICT DO NOTHING;

    INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
    (lesson1_id, mod1_id, svenska1_course_id, 'Fornnordiska och runor', 'Språkets äldsta former', 
     '# Fornnordiska och runor\n\n## Fornnordiska\nGemensamt språk för nordiska folk under vikingatiden.\n\n## Runor\nÄldsta skriftsystemet i Norden.', 
     'theory', 1, 45, ARRAY['Förstå fornnordiska', 'Känna till runor']),
    (lesson2_id, mod2_id, svenska1_course_id, 'Texttyper', 'Olika typer av texter', 
     '# Texttyper\n\n- Berättande texter\n- Beskrivande texter\n- Argumenterande texter', 
     'theory', 1, 40, ARRAY['Känna igen texttyper', 'Analysera texter'])
    ON CONFLICT DO NOTHING;

    INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points) VALUES
    (exercise1_id, lesson1_id, svenska1_course_id, 'Runkunskap', 'Test om runor', 'Svara på frågorna', 'multiple_choice',
     '[{"id":1,"question":"Hur många runor i äldre futharken?","options":["16","20","24","28"]}]',
     '[{"id":1,"correct":"24"}]', 10)
    ON CONFLICT DO NOTHING;

    INSERT INTO lesson_materials (id, lesson_id, title, description, material_type, url, is_required, order_index) VALUES
    (material1_id, lesson1_id, 'Runstenar', 'Karta över runstenar', 'interactive', 'https://www.raa.se/runstenar', true, 1)
    ON CONFLICT DO NOTHING;

    INSERT INTO study_guides (id, course_id, title, description, content, guide_type) VALUES
    (guide1_id, svenska1_course_id, 'Svenska 1 översikt', 'Sammanfattning av kursen', 
     '# Svenska 1\n\n- Språkhistoria\n- Textanalys\n- Grundläggande grammatik', 'summary')
    ON CONFLICT DO NOTHING;

    INSERT INTO course_content_tags (id, name, description, color) VALUES
    (tag_historia_id, 'Språkhistoria', 'Språkets utveckling', '#8B5CF6'),
    (tag_grammatik_id, 'Grammatik', 'Språkliga strukturer', '#10B981')
    ON CONFLICT (name) DO UPDATE SET description=EXCLUDED.description, color=EXCLUDED.color;

    INSERT INTO lesson_tags (lesson_id, tag_id) VALUES 
    (lesson1_id, tag_historia_id),
    (lesson2_id, tag_grammatik_id)
    ON CONFLICT DO NOTHING;

    INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
    (assessment1_id, svenska1_course_id, 'Svenska 1 prov', 'Test över språkhistoria och textanalys', 'test', 50, 30, 60)
    ON CONFLICT DO NOTHING;
END$$;

-- =====================================================
-- SVENSKA 2
-- =====================================================
DO $$
DECLARE
    svenska2_course_id UUID;
    mod1_id UUID := gen_random_uuid();
    mod2_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    lesson2_id UUID := gen_random_uuid();
    exercise1_id UUID := gen_random_uuid();
    material1_id UUID := gen_random_uuid();
    guide1_id UUID := gen_random_uuid();
    tag_retorik_id UUID := gen_random_uuid();
    tag_litteratur_id UUID := gen_random_uuid();
    assessment1_id UUID := gen_random_uuid();
BEGIN
    SELECT id INTO svenska2_course_id FROM courses WHERE title = 'Svenska 2' LIMIT 1;
    
    IF svenska2_course_id IS NULL THEN
        svenska2_course_id := gen_random_uuid();
        INSERT INTO courses (id, title, subject, level, description) VALUES
        (svenska2_course_id, 'Svenska 2', 'Svenska', 'gymnasie', 'Fördjupad kurs i svenska med litteratur och retorik');
    END IF;

    INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
    (mod1_id, svenska2_course_id, 'Retorik', 'Konsten att övertyga', 1, 20),
    (mod2_id, svenska2_course_id, 'Litteratur', 'Svenska litterära verk', 2, 25)
    ON CONFLICT DO NOTHING;

    INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
    (lesson1_id, mod1_id, svenska2_course_id, 'Retorikens grunder', 'Ethos, Logos, Pathos', 
     '# Retorik\n\n## De tre bevisen\n- **Ethos**: Trovärdighet\n- **Logos**: Logik\n- **Pathos**: Känslor', 
     'theory', 1, 45, ARRAY['Förstå retoriska bevis', 'Analysera tal']),
    (lesson2_id, mod2_id, svenska2_course_id, 'Romantiken', 'Litterär epok 1800-tal', 
     '# Romantiken\n\n- Känsla och natur\n- Individualism\n- Svenska författare: Tegnér, Almqvist', 
     'theory', 1, 40, ARRAY['Känna till romantiken', 'Analysera romantisk litteratur'])
    ON CONFLICT DO NOTHING;

    INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points) VALUES
    (exercise1_id, lesson1_id, svenska2_course_id, 'Retoriktest', 'Test om retorik', 'Svara på frågorna', 'multiple_choice',
     '[{"id":1,"question":"Vad är ethos?","options":["Känslor","Logik","Trovärdighet","Struktur"]}]',
     '[{"id":1,"correct":"Trovärdighet"}]', 10)
    ON CONFLICT DO NOTHING;

    INSERT INTO lesson_materials (id, lesson_id, title, description, material_type, url, is_required, order_index) VALUES
    (material1_id, lesson1_id, 'Retorik video', 'Introduktion till retorik', 'video', 'https://urplay.se/retorik', true, 1)
    ON CONFLICT DO NOTHING;

    INSERT INTO study_guides (id, course_id, title, description, content, guide_type) VALUES
    (guide1_id, svenska2_course_id, 'Svenska 2 guide', 'Retorik och litteratur', 
     '# Svenska 2\n\n- Retorik: Ethos, Logos, Pathos\n- Romantiken: Känsla och natur', 'summary')
    ON CONFLICT DO NOTHING;

    INSERT INTO course_content_tags (id, name, description, color) VALUES
    (tag_retorik_id, 'Retorik', 'Övertalningskonst', '#EF4444'),
    (tag_litteratur_id, 'Litteratur', 'Litterära verk och analys', '#3B82F6')
    ON CONFLICT (name) DO UPDATE SET description=EXCLUDED.description, color=EXCLUDED.color;

    INSERT INTO lesson_tags (lesson_id, tag_id) VALUES 
    (lesson1_id, tag_retorik_id),
    (lesson2_id, tag_litteratur_id)
    ON CONFLICT DO NOTHING;

    INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
    (assessment1_id, svenska2_course_id, 'Svenska 2 prov', 'Test över retorik och romantiken', 'test', 50, 30, 60)
    ON CONFLICT DO NOTHING;
END$$;

-- =====================================================
-- ENGELSKA 5
-- =====================================================
DO $$
DECLARE
    engelska5_course_id UUID;
    mod1_id UUID := gen_random_uuid();
    mod2_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    lesson2_id UUID := gen_random_uuid();
    exercise1_id UUID := gen_random_uuid();
    material1_id UUID := gen_random_uuid();
    guide1_id UUID := gen_random_uuid();
    tag_reading_id UUID := gen_random_uuid();
    tag_speaking_id UUID := gen_random_uuid();
    assessment1_id UUID := gen_random_uuid();
BEGIN
    SELECT id INTO engelska5_course_id FROM courses WHERE title = 'Engelska 5' LIMIT 1;
    
    IF engelska5_course_id IS NULL THEN
        engelska5_course_id := gen_random_uuid();
        INSERT INTO courses (id, title, subject, level, description) VALUES
        (engelska5_course_id, 'Engelska 5', 'Engelska', 'gymnasie', 'Grundläggande engelska för gymnasiet');
    END IF;

    INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
    (mod1_id, engelska5_course_id, 'Reading Comprehension', 'Läsförståelse', 1, 20),
    (mod2_id, engelska5_course_id, 'Speaking Skills', 'Muntlig kommunikation', 2, 20)
    ON CONFLICT DO NOTHING;

    INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
    (lesson1_id, mod1_id, engelska5_course_id, 'Short Stories', 'Analyzing short stories', 
     '# Short Stories\n\n## Elements\n- Plot\n- Characters\n- Setting\n- Theme', 
     'theory', 1, 45, ARRAY['Analyze short stories', 'Understand literary elements']),
    (lesson2_id, mod2_id, engelska5_course_id, 'Presentations', 'Giving presentations', 
     '# Presentations\n\n- Structure\n- Body language\n- Voice\n- Visual aids', 
     'practical', 1, 40, ARRAY['Give presentations', 'Use body language effectively'])
    ON CONFLICT DO NOTHING;

    INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points) VALUES
    (exercise1_id, lesson1_id, engelska5_course_id, 'Story Elements', 'Test on story elements', 'Answer the questions', 'multiple_choice',
     '[{"id":1,"question":"What is the main conflict in a story called?","options":["Theme","Plot","Setting","Character"]}]',
     '[{"id":1,"correct":"Plot"}]', 10)
    ON CONFLICT DO NOTHING;

    INSERT INTO lesson_materials (id, lesson_id, title, description, material_type, url, is_required, order_index) VALUES
    (material1_id, lesson1_id, 'Short Story Collection', 'Online short stories', 'link', 'https://www.shortstoryguide.com', false, 1)
    ON CONFLICT DO NOTHING;

    INSERT INTO study_guides (id, course_id, title, description, content, guide_type) VALUES
    (guide1_id, engelska5_course_id, 'English 5 Guide', 'Course overview', 
     '# English 5\n\n- Reading: Short stories\n- Speaking: Presentations', 'summary')
    ON CONFLICT DO NOTHING;

    INSERT INTO course_content_tags (id, name, description, color) VALUES
    (tag_reading_id, 'Reading', 'Reading comprehension', '#8B5CF6'),
    (tag_speaking_id, 'Speaking', 'Oral communication', '#F59E0B')
    ON CONFLICT (name) DO UPDATE SET description=EXCLUDED.description, color=EXCLUDED.color;

    INSERT INTO lesson_tags (lesson_id, tag_id) VALUES 
    (lesson1_id, tag_reading_id),
    (lesson2_id, tag_speaking_id)
    ON CONFLICT DO NOTHING;

    INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
    (assessment1_id, engelska5_course_id, 'English 5 Test', 'Reading and speaking assessment', 'test', 50, 30, 60)
    ON CONFLICT DO NOTHING;
END$$;

-- =====================================================
-- MATEMATIK 1A
-- =====================================================
DO $$
DECLARE
    matematik1_course_id UUID;
    mod1_id UUID := gen_random_uuid();
    mod2_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    lesson2_id UUID := gen_random_uuid();
    exercise1_id UUID := gen_random_uuid();
    material1_id UUID := gen_random_uuid();
    guide1_id UUID := gen_random_uuid();
    tag_algebra_id UUID := gen_random_uuid();
    tag_funktioner_id UUID := gen_random_uuid();
    assessment1_id UUID := gen_random_uuid();
BEGIN
    SELECT id INTO matematik1_course_id FROM courses WHERE title = 'Matematik 1a' LIMIT 1;
    
    IF matematik1_course_id IS NULL THEN
        matematik1_course_id := gen_random_uuid();
        INSERT INTO courses (id, title, subject, level, description) VALUES
        (matematik1_course_id, 'Matematik 1a', 'Matematik', 'gymnasie', 'Grundläggande matematik för gymnasiet');
    END IF;

    INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
    (mod1_id, matematik1_course_id, 'Algebra', 'Grundläggande algebra', 1, 25),
    (mod2_id, matematik1_course_id, 'Funktioner', 'Linjära funktioner', 2, 30)
    ON CONFLICT DO NOTHING;

    INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
    (lesson1_id, mod1_id, matematik1_course_id, 'Ekvationer', 'Lösa enkla ekvationer', 
     '# Ekvationer\n\n## Grundprinciper\n- Balansera båda sidor\n- Isolera variabeln\n- Kontrollera svaret', 
     'theory', 1, 45, ARRAY['Lösa enkla ekvationer', 'Förstå algebraiska principer']),
    (lesson2_id, mod2_id, matematik1_course_id, 'Linjära funktioner', 'y = kx + m', 
     '# Linjära funktioner\n\n- k = lutning\n- m = y-intercept\n- Grafisk representation', 
     'theory', 1, 50, ARRAY['Rita grafer', 'Förstå funktioner'])
    ON CONFLICT DO NOTHING;

    INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points) VALUES
    (exercise1_id, lesson1_id, matematik1_course_id, 'Ekvationstest', 'Lösa ekvationer', 'Lös ekvationerna', 'multiple_choice',
     '[{"id":1,"question":"Vad är x i ekvationen x + 5 = 12?","options":["5","7","12","17"]}]',
     '[{"id":1,"correct":"7"}]', 10)
    ON CONFLICT DO NOTHING;

    INSERT INTO lesson_materials (id, lesson_id, title, description, material_type, content, is_required, order_index) VALUES
    (material1_id, lesson1_id, 'Formelblad', 'Viktiga formler', 'document', 
     '# Algebraformler\n\n- (a+b)² = a² + 2ab + b²\n- (a-b)² = a² - 2ab + b²', true, 1)
    ON CONFLICT DO NOTHING;

    INSERT INTO study_guides (id, course_id, title, description, content, guide_type) VALUES
    (guide1_id, matematik1_course_id, 'Matematik 1a guide', 'Sammanfattning', 
     '# Matematik 1a\n\n- Algebra: Ekvationer och uttryck\n- Funktioner: Linjära samband', 'summary')
    ON CONFLICT DO NOTHING;

    INSERT INTO course_content_tags (id, name, description, color) VALUES
    (tag_algebra_id, 'Algebra', 'Algebraiska uttryck', '#10B981'),
    (tag_funktioner_id, 'Funktioner', 'Matematiska funktioner', '#F59E0B')
    ON CONFLICT (name) DO UPDATE SET description=EXCLUDED.description, color=EXCLUDED.color;

    INSERT INTO lesson_tags (lesson_id, tag_id) VALUES 
    (lesson1_id, tag_algebra_id),
    (lesson2_id, tag_funktioner_id)
    ON CONFLICT DO NOTHING;

    INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
    (assessment1_id, matematik1_course_id, 'Matematik 1a prov', 'Test över algebra och funktioner', 'test', 50, 30, 90)
    ON CONFLICT DO NOTHING;
END$$;

-- =====================================================
-- HISTORIA 1A1
-- =====================================================
DO $$
DECLARE
    historia_course_id UUID;
    mod1_id UUID := gen_random_uuid();
    mod2_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    lesson2_id UUID := gen_random_uuid();
    exercise1_id UUID := gen_random_uuid();
    material1_id UUID := gen_random_uuid();
    guide1_id UUID := gen_random_uuid();
    tag_antiken_id UUID := gen_random_uuid();
    tag_medeltid_id UUID := gen_random_uuid();
    assessment1_id UUID := gen_random_uuid();
BEGIN
    SELECT id INTO historia_course_id FROM courses WHERE title = 'Historia 1a1' LIMIT 1;
    
    IF historia_course_id IS NULL THEN
        historia_course_id := gen_random_uuid();
        INSERT INTO courses (id, title, subject, level, description) VALUES
        (historia_course_id, 'Historia 1a1', 'Historia', 'gymnasie', 'Världshistoria från antiken till 1750');
    END IF;

    INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
    (mod1_id, historia_course_id, 'Antiken', 'Antika civilisationer', 1, 25),
    (mod2_id, historia_course_id, 'Medeltiden', 'Europeisk medeltid', 2, 30)
    ON CONFLICT DO NOTHING;

    INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
    (lesson1_id, mod1_id, historia_course_id, 'Antikens Grekland', 'Demokratins födelse', 
     '# Antikens Grekland\n\n## Athen\n- Demokrati\n- Filosofi\n- Konst och kultur\n\n## Sparta\n- Militärstat\n- Utbildning', 
     'theory', 1, 45, ARRAY['Förstå grekisk demokrati', 'Jämföra Athen och Sparta']),
    (lesson2_id, mod2_id, historia_course_id, 'Feodalismen', 'Medeltida samhällsordning', 
     '# Feodalismen\n\n- Hierarkisk struktur\n- Vasaller och lensherrar\n- Jordbrukssamhälle', 
     'theory', 1, 40, ARRAY['Förstå feodala systemet', 'Analysera maktstrukturer'])
    ON CONFLICT DO NOTHING;

    INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points) VALUES
    (exercise1_id, lesson1_id, historia_course_id, 'Antiktest', 'Test om antiken', 'Svara på frågorna', 'multiple_choice',
     '[{"id":1,"question":"Vilken stad utvecklade demokratin?","options":["Sparta","Athen","Korinth","Thebe"]}]',
     '[{"id":1,"correct":"Athen"}]', 10)
    ON CONFLICT DO NOTHING;

    INSERT INTO lesson_materials (id, lesson_id, title, description, material_type, url, is_required, order_index) VALUES
    (material1_id, lesson1_id, 'Antikens karta', 'Interaktiv karta över antiken', 'interactive', 'https://www.worldhistory.org/maps', true, 1)
    ON CONFLICT DO NOTHING;

    INSERT INTO study_guides (id, course_id, title, description, content, guide_type) VALUES
    (guide1_id, historia_course_id, 'Historia 1a1 guide', 'Historisk översikt', 
     '# Historia 1a1\n\n- Antiken: Grekland och Rom\n- Medeltiden: Feodalismen', 'summary')
    ON CONFLICT DO NOTHING;

    INSERT INTO course_content_tags (id, name, description, color) VALUES
    (tag_antiken_id, 'Antiken', 'Antika civilisationer', '#8B5CF6'),
    (tag_medeltid_id, 'Medeltiden', 'Europeisk medeltid', '#EF4444')
    ON CONFLICT (name) DO UPDATE SET description=EXCLUDED.description, color=EXCLUDED.color;

    INSERT INTO lesson_tags (lesson_id, tag_id) VALUES 
    (lesson1_id, tag_antiken_id),
    (lesson2_id, tag_medeltid_id)
    ON CONFLICT DO NOTHING;

    INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
    (assessment1_id, historia_course_id, 'Historia 1a1 prov', 'Test över antiken och medeltiden', 'test', 50, 30, 75)
    ON CONFLICT DO NOTHING;
END$$;

COMMIT;