-- ============================================================
-- COURSE CONTENT: ENGENG06 (Engelska 6)
-- ============================================================

INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'ENGENG06',
  'ENGENG06',
  'Engelska 6',
  'Avancerad engelskkurs med fokus på akademisk kommunikation, litterär analys, retorik och global samhällsdebatt.',
  'Språk',
  'gymnasie',
  100,
  '["Vetenskapliga artiklar", "Internationella poddar", "Retorikhandböcker", "Digitala samarbetsytor"]'::jsonb,
  '["Använd engelska i alla diskussioner", "Spara ordlistor i Anki", "Planera lärjournal varje vecka"]'::jsonb,
  '["ENGENG05", "SAMSAM02", "SVESVE03"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, points = EXCLUDED.points;

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES
  ('9f9d4317-e5fd-4ea6-93c7-4d6f70670101'::uuid, 'ENGENG06', 'Module 1: Advanced Communication', 'Debatt, improvisation och retorik.', 1, 10, true),
  ('9f9d4317-e5fd-4ea6-93c7-4d6f70670102'::uuid, 'ENGENG06', 'Module 2: Academic Literacy', 'Fördjupad läsning av vetenskapligt material.', 2, 12, true),
  ('9f9d4317-e5fd-4ea6-93c7-4d6f70670103'::uuid, 'ENGENG06', 'Module 3: Advanced Writing', 'Research paper, synthesis essay och reflektiv text.', 3, 13, true),
  ('9f9d4317-e5fd-4ea6-93c7-4d6f70670104'::uuid, 'ENGENG06', 'Module 4: Global Issue Capstone', 'Tvärvetenskapligt projekt och presentation.', 4, 10, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, is_published = EXCLUDED.is_published;

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
-- Module 1
('ee7a3f40-1853-4df9-90ac-9e2de6000101'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670101'::uuid, 'ENGENG06', 'Debate Frameworks', 'Oxford- och Karl Popper-debatt.', '### Structure\n- Motion, teams, timings\n- Roles: Prime Minister, Leader of Opposition\n- Flow notes och rebuttal teknik\n\nÖvning: mini-debatt om AI ethics.', 'theory', 1, 45, 'medium', ARRAY['Planera debatt', 'Utveckla rebuttal'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000102'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670101'::uuid, 'ENGENG06', 'Impromptu Speaking Challenge', 'Spontantal med kort förberedelse.', 'Format\n- Dra ämne\n- 2 min preparation\n- 3 min speech\nFeedback: coherence, delivery, accuracy.', 'exercise', 2, 35, 'medium', ARRAY['Tala spontant', 'Strukturera tankar snabbt'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000103'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670101'::uuid, 'ENGENG06', 'Rhetorical Devices in Speeches', 'Analysera avancerade stilgrepp.', 'Innehåll: parallelism, antithesis, extended metaphor.\nUppgift: annotera Barack Obamas tal, skriv egen passage.', 'theory', 3, 40, 'medium', ARRAY['Identifiera retoriska grepp', 'Använda dem i eget tal'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000104'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670101'::uuid, 'ENGENG06', 'Peer Coaching Session', 'Parvis coachning.', 'Moment\n- Spela in tal\n- Markera styrkor i transcript\n- Sätt personliga speaking goals', 'exercise', 4, 40, 'medium', ARRAY['Ge coachande feedback', 'Sätta mål'], true),

-- Module 2
('ee7a3f40-1853-4df9-90ac-9e2de6000201'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670102'::uuid, 'ENGENG06', 'Scholarly Reading Strategies', 'Meta-lässtrategier.', '### Toolkit\n- Abstract mapping\n- Chunking paragraphs\n- Discussion log\n\nText: Nature-artikel om energi.', 'theory', 1, 50, 'hard', ARRAY['Extrahera syfte', 'Sammanfatta akademiskt'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000202'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670102'::uuid, 'ENGENG06', 'Data Commentary Workshop', 'Skriva om diagram/tabeller.', 'Steg\n1. Identify key trend\n2. Compare data points\n3. Interpret significance\n\nÖvning: OECD-statistik.', 'exercise', 2, 45, 'medium', ARRAY['Skriva datakommentarer', 'Tolkar statistik på engelska'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000203'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670102'::uuid, 'ENGENG06', 'Literary Criticism Lens', 'Feministisk, postkolonial, marxistisk.', 'Studera kortnovell genom tre analytiska linser. Diskutera i jigsaw-grupper.', 'theory', 3, 45, 'medium', ARRAY['Applicera kritiska perspektiv', 'Jämföra tolkningar'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000204'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670102'::uuid, 'ENGENG06', 'Socratic Seminar', 'Elevlett textseminarium.', 'Förbered 3 öppna frågor, använd textbevis. Bedömning på resonemang.', 'exercise', 4, 40, 'medium', ARRAY['Leda akademiskt samtal', 'Stötta resonemang med text'], true),

-- Module 3
('ee7a3f40-1853-4df9-90ac-9e2de6000301'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670103'::uuid, 'ENGENG06', 'Research Paper Planning', 'Ämnesval, frågeställning, outline.', 'Guide\n- Narrow topic\n- Draft thesis\n- Annotated bibliography\n\nCheck-in med lärare.', 'theory', 1, 55, 'hard', ARRAY['Utveckla forskningsfråga', 'Skapa källförteckning'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000302'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670103'::uuid, 'ENGENG06', 'Synthesis Essay Lab', 'Kombinera flera källor.', 'Moment\n- Highlight key claims per källa\n- Skapa tematiska grupper\n- Skriv sammanvävda stycken', 'exercise', 2, 50, 'medium', ARRAY['Integrera källor', 'Citere korrekt APA/MLA'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000303'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670103'::uuid, 'ENGENG06', 'Language Precision Clinic', 'Nominalisering, hedging, formell ton.', 'Checklista + övningar. Elever redigerar egna texter via färgkodning.', 'theory', 3, 35, 'medium', ARRAY['Förbättra språkprecision', 'Anpassa ton'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000304'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670103'::uuid, 'ENGENG06', 'Publication & Peer Review', 'Simulerad tidskriftsprocess.', 'Roller: editors, reviewers, authors. Deadline, feedback, revidering.', 'project', 4, 60, 'hard', ARRAY['Delta i peer review-process', 'Revidera utifrån feedback'], true),

-- Module 4
('ee7a3f40-1853-4df9-90ac-9e2de6000401'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670104'::uuid, 'ENGENG06', 'Issue Mapping Sprint', 'Kartlägg global fråga.', 'Steg\n1. Stakeholder map\n2. Konsekvenser lokalt/globalt\n3. Datainsamling\n\nVisualisera i Miro-board.', 'project', 1, 50, 'medium', ARRAY['Kartlägga komplex fråga', 'Arbeta visuellt'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000402'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670104'::uuid, 'ENGENG06', 'Solution Pitch Workshop', 'Utveckla lösningsförslag.', 'Pitchstruktur\n- Problem statement\n- Evidence\n- Proposed action\n- Call to action\n\nTräna pitch med timer.', 'exercise', 2, 40, 'medium', ARRAY['Presentera lösningar', 'Argumentera övertygande'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000403'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670104'::uuid, 'ENGENG06', 'Multimodal Presentation Build', 'Skapa video/podcast/poster.', 'Checklista: tydligt manus, visuellt stöd, ljudkvalitet. Styrt av publik.', 'project', 3, 55, 'hard', ARRAY['Skapa multimodalt innehåll', 'Anpassa budskap till publik'], true),
('ee7a3f40-1853-4df9-90ac-9e2de6000404'::uuid, '9f9d4317-e5fd-4ea6-93c7-4d6f70670104'::uuid, 'ENGENG06', 'Capstone Symposium', 'Avslutande presentation + Q&A.', 'Publik ställer frågor, elever reflekterar över lärdomar i exit essay.', 'project', 4, 60, 'hard', ARRAY['Genomföra professionell presentation', 'Reflektera över process'], true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, is_published = EXCLUDED.is_published;
