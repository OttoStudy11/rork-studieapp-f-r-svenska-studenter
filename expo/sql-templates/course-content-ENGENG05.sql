-- ============================================================
-- COURSE CONTENT: ENGENG05 (Engelska 5)
-- ============================================================

INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'ENGENG05',
  'ENGENG05',
  'Engelska 5',
  'Kursen utvecklar receptiva och produktiva färdigheter i engelska med fokus på global kommunikation, källkritik och kulturförståelse.',
  'Språk',
  'gymnasie',
  100,
  '["Nyhetsbrev på engelska", "Podcasts", "Digitala anteckningar", "Videokonferensverktyg"]'::jsonb,
  '["Lyssna aktivt varje dag", "Anteckna nya uttryck i en ordlista", "Prata engelska så ofta som möjligt"]'::jsonb,
  '["ENGENG06", "SAMSAM01b", "SVESVE01"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, points = EXCLUDED.points;

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES
  ('1b2a4d4c-8c6c-4f4a-8f90-090af2050101'::uuid, 'ENGENG05', 'Module 1: Communication Fundamentals', 'Listening, speaking and pronunciation routines.', 1, 9, true),
  ('1b2a4d4c-8c6c-4f4a-8f90-090af2050102'::uuid, 'ENGENG05', 'Module 2: Academic Reading & Media', 'Critical reading of articles, reports and multimedia.', 2, 11, true),
  ('1b2a4d4c-8c6c-4f4a-8f90-090af2050103'::uuid, 'ENGENG05', 'Module 3: Writing for Impact', 'Argumentative, descriptive and reflective writing.', 3, 12, true),
  ('1b2a4d4c-8c6c-4f4a-8f90-090af2050104'::uuid, 'ENGENG05', 'Module 4: Global Citizenship Project', 'Collaborative project on cultural topics.', 4, 10, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, is_published = EXCLUDED.is_published;

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
-- Module 1
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050101'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050101'::uuid, 'ENGENG05', 'Active Listening Routines', 'Skapa daglig lyssningsrutin.', '### Steps\n1. Warm-up vocabulary list\n2. Listen to 5-min news clip\n3. Note key facts + expressions\n4. Summarize orally\n\nReflection prompts added i loggbok.', 'theory', 1, 35, 'easy', ARRAY['Förstå huvudidéer i tal', 'Anteckna nya uttryck'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050102'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050101'::uuid, 'ENGENG05', 'Pronunciation Lab', 'Träna segmental och suprasegmental nivå.', '## Lab moment\n- Shadowing technique\n- Stressed syllables\n- Intonation ladders\n\nElev spelar in, får AI-feedback + kamratrespons.', 'exercise', 2, 40, 'medium', ARRAY['Förbättra uttal', 'Analysera intonation'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050103'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050101'::uuid, 'ENGENG05', 'Spontaneous Speaking Circles', 'Kort improvisation på aktuella ämnen.', '### Format\n- 3 frågor per elev\n- 1 min förberedelse, 2 min speaking\n- Peer feedback: clarity, structure, vocabulary', 'exercise', 3, 30, 'medium', ARRAY['Tala sammanhängande', 'Ge respons på tal'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050104'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050101'::uuid, 'ENGENG05', 'Language Portfolio Setup', 'Bygg digital portfölj.', 'Portfölj innehåller\n- Självskattning CEFR\n- Mål för kursen\n- Lista resurser\n\nDelas med lärare i slutet.', 'project', 4, 35, 'easy', ARRAY['Sätta språkmål', 'Dokumentera progression'], true),

-- Module 2
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050201'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050102'::uuid, 'ENGENG05', 'Reading Toolkit', 'Skim, scan och close reading.', '### Toolkit\n- Predict content via visuals\n- Highlight discourse markers\n- Annotate unfamiliar terms\n\nÖvning: FN-rapport om hållbarhet.', 'theory', 1, 45, 'medium', ARRAY['Välja lässtrategi', 'Identifiera textstruktur'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050202'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050102'::uuid, 'ENGENG05', 'Media Bias Investigation', 'Analysera trovärdighet i media.', '## Uppgift\n- Två artiklar samma nyhet\n- Kartlägg vinkling via checklista\n- Presentera jämförelse i Padlet\n\nTränar källkritik och register.', 'project', 2, 55, 'hard', ARRAY['Analysera bias', 'Resonera om källor'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050203'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050102'::uuid, 'ENGENG05', 'Literary Excerpt Study', 'Tolkar kort skönlitterärt utdrag.', '### Process\n- Läs gemensamt\n- Identifiera tone & theme\n- Diskutera karaktärsutveckling\n\nOutput: 200-ord reflektion.', 'theory', 3, 35, 'medium', ARRAY['Identifiera litterära grepp', 'Uttrycka tolkning'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050204'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050102'::uuid, 'ENGENG05', 'Listening Comprehension Live', 'Autentiskt föredrag via TED.', 'Schema\n1. För-lyssning: ordlista\n2. Lyssning: första för helhet\n3. Lyssning: detaljer via frågor\n4. Exit ticket i mentimeter', 'exercise', 4, 40, 'medium', ARRAY['Plocka ut huvudbudskap', 'Anteckna stödjande detaljer'], true),

-- Module 3
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050301'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050103'::uuid, 'ENGENG05', 'Argument Writing Blueprint', 'Struktur för opinion text.', 'Outline\n- Hook\n- Thesis\n- Body paragraphs (PEEL)\n- Counterargument\n- Conclusion\n\nUppgift: planera text om social media.', 'theory', 1, 40, 'medium', ARRAY['Skapa outline', 'Variera textbindning'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050302'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050103'::uuid, 'ENGENG05', 'Drafting & Peer Review', 'Workshop i par.', 'Steg\n1. Draft i Google Docs\n2. Kamratrespons med kommentarsmall\n3. Revidera utifrån feedback\n\nFokus: cohesion & register.', 'exercise', 2, 55, 'medium', ARRAY['Ge återkoppling', 'Förbättra text via revision'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050303'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050103'::uuid, 'ENGENG05', 'Reflective Journaling', 'Skriva reflektioner kring lärande.', '### Journal prompts\n- What did I learn?\n- Which strategies worked?\n- What will I try next time?\n\nLevereras varje vecka.', 'theory', 3, 25, 'easy', ARRAY['Självreflektera', 'Synliggöra lärandeprocess'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050304'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050103'::uuid, 'ENGENG05', 'Formal Email & Report', 'Strikt layout och ton.', 'Checklist\n- Subject line\n- Clear purpose\n- Paragraphing\n- Formal closing\n\nCase: skriv rapport om skolprojekt.', 'theory', 4, 40, 'medium', ARRAY['Följa formella konventioner', 'Anpassa ton'], true),

-- Module 4
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050401'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050104'::uuid, 'ENGENG05', 'Global Issues Research', 'Grupparbete kring global fråga.', 'Moment\n- Välj tema (klimat, equality, tech)\n- Samla källor i Zotero-liknande lista\n- Fördela roller (research, visuals, speaking)', 'project', 1, 60, 'hard', ARRAY['Samarbeta internationellt tema', 'Organisera källor'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050402'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050104'::uuid, 'ENGENG05', 'Presentation Design Sprint', 'Skapa visuellt stöd i Canva/Slides.', 'Checklist\n- 1 idé per slide\n- Ikoner + kort text\n- Öva timing via rehearsal mode', 'exercise', 2, 40, 'medium', ARRAY['Designa visuellt material', 'Tidsätta presentation'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050403'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050104'::uuid, 'ENGENG05', 'Live Panel Discussion', 'Simulerad panel med roller.', '### Struktur\n- Moderator introducerar\n- Panelister levererar statements\n- Q&A från publik\n- Sammanfattning\n\nFokus: spontant språk + argumentation.', 'exercise', 3, 50, 'hard', ARRAY['Hålla samtal igång', 'Reagera på följdfrågor'], true),
('b0a9c6a3-b0fd-4bb1-a221-78b6b8050404'::uuid, '1b2a4d4c-8c6c-4f4a-8f90-090af2050104'::uuid, 'ENGENG05', 'Portfolio Showcase & Reflection', 'Avslutande redovisning.', 'Innehåll\n- Highlight tre artefakter\n- Koppla till kunskapskrav\n- Skriftlig meta-reflektion (300 ord)\n\nBedömning: kommunikativ förmåga + självinsikt.', 'project', 4, 55, 'medium', ARRAY['Presentera portfolio', 'Analysera egen progression'], true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, is_published = EXCLUDED.is_published;
