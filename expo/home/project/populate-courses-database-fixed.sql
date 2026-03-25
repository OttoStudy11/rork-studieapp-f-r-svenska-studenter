-- =====================================================
-- SVENSKA 2
-- =====================================================
DO $$
DECLARE
    svenska2_course_id UUID := gen_random_uuid();
    mod1_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    exercise1_id UUID := gen_random_uuid();
    tag_grammatik_id UUID;
    guide1_id UUID := gen_random_uuid();
    assessment1_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO courses (id, title, subject, level, description) VALUES
    (svenska2_course_id, 'Svenska 2', 'Svenska', 'gymnasie', 'Fördjupning i svenska språket, textanalys och skrivande.')
    ON CONFLICT (title) DO UPDATE SET description=EXCLUDED.description;

    INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
    (mod1_id, svenska2_course_id, 'Skriftlig kommunikation', 'Förbättra skriftliga färdigheter', 1, 25);

    INSERT INTO course_lessons (id, module_id, course_id, title, description, content,
        lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
    (lesson1_id, mod1_id, svenska2_course_id, 'Textproduktion', 'Att skriva olika typer av texter',
     '# Textproduktion\n\n- Argumenterande text\n- Informerande text\n- Kreativt skrivande', 
     'theory', 1, 50, ARRAY['Kunna skriva argumenterande texter', 'Förbättra grammatik och stil']);

    INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points) VALUES
    (exercise1_id, lesson1_id, svenska2_course_id, 'Grammatiktest', 'Testa grammatikkunskaper', 'Svara på frågorna', 'multiple_choice',
     '[{"id":1,"question":"Vilken satsdel är subjekt?","options":["Den som utför handlingen","Handlingen","Objektet","Adjektivet"]}]',
     '[{"id":1,"correct":"Den som utför handlingen"}]', 5);

    -- Get existing tag or create new one
    SELECT id INTO tag_grammatik_id FROM course_content_tags WHERE name = 'Grammatik';
    IF tag_grammatik_id IS NULL THEN
        tag_grammatik_id := gen_random_uuid();
        INSERT INTO course_content_tags (id, name, description, color) VALUES
        (tag_grammatik_id, 'Grammatik', 'Grammatiska ämnen', '#10B981');
    END IF;

    INSERT INTO lesson_tags (lesson_id, tag_id) VALUES
    (lesson1_id, tag_grammatik_id)
    ON CONFLICT (lesson_id, tag_id) DO NOTHING;

    INSERT INTO study_guides (id, course_id, title, description, content, guide_type) VALUES
    (guide1_id, svenska2_course_id, 'Svenska 2 guide', 'Sammanfattning av kursinnehållet', '# Viktiga delar: Textproduktion, Grammatik', 'summary');

    INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
    (assessment1_id, svenska2_course_id, 'Svenska 2 prov', 'Test över textproduktion och grammatik', 'test', 50, 30, 60);
END $$;

-- =====================================================
-- SVENSKA 3
-- =====================================================
DO $$
DECLARE
    svenska3_course_id UUID := gen_random_uuid();
    mod1_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    exercise1_id UUID := gen_random_uuid();
    tag_litteratur_id UUID;
    guide1_id UUID := gen_random_uuid();
    assessment1_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO courses (id, title, subject, level, description) VALUES
    (svenska3_course_id, 'Svenska 3', 'Svenska', 'gymnasie', 'Fördjupning i litteraturanalys och språklig stil.')
    ON CONFLICT (title) DO UPDATE SET description=EXCLUDED.description;

    INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
    (mod1_id, svenska3_course_id, 'Litteraturanalys', 'Analysera och diskutera litteratur', 1, 30);

    INSERT INTO course_lessons (id, module_id, course_id, title, description, content,
        lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
    (lesson1_id, mod1_id, svenska3_course_id, 'Romananalys', 'Analysera romaner och berättarteknik',
     '# Romananalys\n\n- Tema\n- Karaktärer\n- Miljöbeskrivning', 
     'theory', 1, 50, ARRAY['Kunna analysera romaner', 'Diskutera tema och karaktärer']);

    INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points) VALUES
    (exercise1_id, lesson1_id, svenska3_course_id, 'Litteraturtest', 'Testa litteraturkunskaper', 'Svara på frågorna', 'multiple_choice',
     '[{"id":1,"question":"Vad är huvudtemat i romanen?","options":["Kärlek","Kriminalitet","Historia","Ekonomi"]}]',
     '[{"id":1,"correct":"Kärlek"}]', 5);

    -- Get existing tag or create new one
    SELECT id INTO tag_litteratur_id FROM course_content_tags WHERE name = 'Litteratur';
    IF tag_litteratur_id IS NULL THEN
        tag_litteratur_id := gen_random_uuid();
        INSERT INTO course_content_tags (id, name, description, color) VALUES
        (tag_litteratur_id, 'Litteratur', 'Analys och förståelse av litteratur', '#F59E0B');
    END IF;

    INSERT INTO lesson_tags (lesson_id, tag_id) VALUES
    (lesson1_id, tag_litteratur_id)
    ON CONFLICT (lesson_id, tag_id) DO NOTHING;

    INSERT INTO study_guides (id, course_id, title, description, content, guide_type) VALUES
    (guide1_id, svenska3_course_id, 'Svenska 3 guide', 'Sammanfattning av kursinnehållet', '# Viktiga delar: Litteraturanalys, Stil', 'summary');

    INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
    (assessment1_id, svenska3_course_id, 'Svenska 3 prov', 'Test över litteraturanalys', 'test', 50, 30, 60);
END $$;

-- =====================================================
-- ENGELSKA 5
-- =====================================================
DO $$
DECLARE
    engelska5_course_id UUID := gen_random_uuid();
    mod1_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    exercise1_id UUID := gen_random_uuid();
    tag_grammar_id UUID;
    guide1_id UUID := gen_random_uuid();
    assessment1_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO courses (id, title, subject, level, description) VALUES
    (engelska5_course_id, 'Engelska 5', 'Engelska', 'gymnasie', 'Grundläggande kurs i engelska språket och textförståelse.')
    ON CONFLICT (title) DO UPDATE SET description=EXCLUDED.description;

    INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
    (mod1_id, engelska5_course_id, 'Textanalys', 'Läs och analysera engelska texter', 1, 20);

    INSERT INTO course_lessons (id, module_id, course_id, title, description, content,
        lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
    (lesson1_id, mod1_id, engelska5_course_id, 'Analyzing short stories', 'Läs och analysera korta noveller',
     '# Short stories\n\n- Plot\n- Characters\n- Themes', 'theory', 1, 45, ARRAY['Analysera noveller', 'Känna till litterära begrepp']);

    INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points) VALUES
    (exercise1_id, lesson1_id, engelska5_course_id, 'Short story quiz', 'Testa noveller', 'Svara på frågorna', 'multiple_choice',
     '[{"id":1,"question":"Vad kallas berättelsens handling?","options":["Plot","Theme","Character","Setting"]}]',
     '[{"id":1,"correct":"Plot"}]', 5);

    -- Get existing tag or create new one
    SELECT id INTO tag_grammar_id FROM course_content_tags WHERE name = 'Grammar';
    IF tag_grammar_id IS NULL THEN
        tag_grammar_id := gen_random_uuid();
        INSERT INTO course_content_tags (id, name, description, color) VALUES
        (tag_grammar_id, 'Grammar', 'Engelska grammatik och språkliga strukturer', '#10B981');
    END IF;

    INSERT INTO lesson_tags (lesson_id, tag_id) VALUES
    (lesson1_id, tag_grammar_id)
    ON CONFLICT (lesson_id, tag_id) DO NOTHING;

    INSERT INTO study_guides (id, course_id, title, description, content, guide_type) VALUES
    (guide1_id, engelska5_course_id, 'Engelska 5 guide', 'Sammanfattning av kursinnehållet', '# Viktiga delar: Textanalys, Grammatik', 'summary');

    INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
    (assessment1_id, engelska5_course_id, 'Engelska 5 prov', 'Test över textanalys', 'test', 50, 30, 60);
END $$;

-- =====================================================
-- ENGELSKA 6
-- =====================================================
DO $$
DECLARE
    engelska6_course_id UUID := gen_random_uuid();
    mod1_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    exercise1_id UUID := gen_random_uuid();
    tag_literature_id UUID;
    guide1_id UUID := gen_random_uuid();
    assessment1_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO courses (id, title, subject, level, description) VALUES
    (engelska6_course_id, 'Engelska 6', 'Engelska', 'gymnasie', 'Fördjupning i engelska språket och litteratur.')
    ON CONFLICT (title) DO UPDATE SET description=EXCLUDED.description;

    INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
    (mod1_id, engelska6_course_id, 'Literature', 'Analysera och diskutera engelska litterära texter', 1, 25);

    INSERT INTO course_lessons (id, module_id, course_id, title, description, content,
        lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
    (lesson1_id, mod1_id, engelska6_course_id, 'Poetry analysis', 'Analysera dikter och poetiska uttryck',
     '# Poetry\n\n- Theme\n- Meter\n- Imagery', 'theory', 1, 50, ARRAY['Kunna analysera dikter', 'Diskutera poetiska uttryck']);

    INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points) VALUES
    (exercise1_id, lesson1_id, engelska6_course_id, 'Poetry quiz', 'Testa poetikkunskaper', 'Svara på frågorna', 'multiple_choice',
     '[{"id":1,"question":"Vad kallas mönstret av betonade och obetonade stavelser?","options":["Theme","Meter","Rhyme","Verse"]}]',
     '[{"id":1,"correct":"Meter"}]', 5);

    -- Get existing tag or create new one
    SELECT id INTO tag_literature_id FROM course_content_tags WHERE name = 'Literature';
    IF tag_literature_id IS NULL THEN
        tag_literature_id := gen_random_uuid();
        INSERT INTO course_content_tags (id, name, description, color) VALUES
        (tag_literature_id, 'Literature', 'Engelsk litteratur och analys', '#F59E0B');
    END IF;

    INSERT INTO lesson_tags (lesson_id, tag_id) VALUES
    (lesson1_id, tag_literature_id)
    ON CONFLICT (lesson_id, tag_id) DO NOTHING;

    INSERT INTO study_guides (id, course_id, title, description, content, guide_type) VALUES
    (guide1_id, engelska6_course_id, 'Engelska 6 guide', 'Sammanfattning av kursinnehållet', '# Viktiga delar: Poetik, Analys', 'summary');

    INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
    (assessment1_id, engelska6_course_id, 'Engelska 6 prov', 'Test över poesi och litteratur', 'test', 50, 30, 60);
END $$;

-- =====================================================
-- MATEMATIK 1a/1b
-- =====================================================
DO $$
DECLARE
    matematik1_course_id UUID := gen_random_uuid();
    mod1_id UUID := gen_random_uuid();
    lesson1_id UUID := gen_random_uuid();
    exercise1_id UUID := gen_random_uuid();
    tag_algebra_id UUID;
    guide1_id UUID := gen_random_uuid();
    assessment1_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO courses (id, title, subject, level, description) VALUES
    (matematik1_course_id, 'Matematik 1a/1b', 'Matematik', 'gymnasie', 'Grundläggande kurs i matematik med algebra och funktioner.')
    ON CONFLICT (title) DO UPDATE SET description=EXCLUDED.description;

    INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
    (mod1_id, matematik1_course_id, 'Algebra och funktioner', 'Lär dig grunderna i algebra och funktioner', 1, 30);

    INSERT INTO course_lessons (id, module_id, course_id, title, description, content,
        lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
    (lesson1_id, mod1_id, matematik1_course_id, 'Grundläggande algebra', 'Introduktion till variabler och ekvationer',
     '# Algebra\n\n- Variabler\n- Ekvationer\n- Förenkling', 'theory', 1, 50, ARRAY['Kunna lösa enkla ekvationer', 'Förstå variabler']);

    INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points) VALUES
    (exercise1_id, lesson1_id, matematik1_course_id, 'Algebratest', 'Testa algebra', 'Svara på frågorna', 'multiple_choice',
     '[{"id":1,"question":"Vad är x i ekvationen x + 3 = 7?","options":["2","3","4","5"]}]',
     '[{"id":1,"correct":"4"}]', 5);

    -- Get existing tag or create new one
    SELECT id INTO tag_algebra_id FROM course_content_tags WHERE name = 'Algebra';
    IF tag_algebra_id IS NULL THEN
        tag_algebra_id := gen_random_uuid();
        INSERT INTO course_content_tags (id, name, description, color) VALUES
        (tag_algebra_id, 'Algebra', 'Matematiska ämnen: algebra', '#10B981');
    END IF;

    INSERT INTO lesson_tags (lesson_id, tag_id) VALUES
    (lesson1_id, tag_algebra_id)
    ON CONFLICT (lesson_id, tag_id) DO NOTHING;

    INSERT INTO study_guides (id, course_id, title, description, content, guide_type) VALUES
    (guide1_id, matematik1_course_id, 'Matematik 1a/1b guide', 'Sammanfattning av kursinnehållet', '# Viktiga delar: Algebra, Funktioner', 'summary');

    INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
    (assessment1_id, matematik1_course_id, 'Matematik 1a/1b prov', 'Test över algebra och funktioner', 'test', 50, 30, 60);
END $$;