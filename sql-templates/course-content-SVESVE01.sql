-- ============================================================
-- COURSE CONTENT: SVESVE01 (Svenska 1)
-- ============================================================

INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'SVESVE01',
  'SVESVE01',
  'Svenska 1',
  'Grundkurs i svenska för gymnasiet med fokus på språkets uppbyggnad, muntlig framställning och litteraturtolkning.',
  'Språk',
  'gymnasie',
  100,
  '["Ordböcker", "Inspelning via mobil", "Digitala anteckningar", "Svenska impulser 1"]'::jsonb,
  '["Anteckna alltid exempel från texter", "Planera tal med tydlig disposition", "Variera källor och granska dem kritiskt"]'::jsonb,
  '["SVESVE02", "SVESVE03", "ENGENG05"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, points = EXCLUDED.points;

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES
  ('f13a8d21-7c5b-4a24-af58-01d4c6b60101'::uuid, 'SVESVE01', 'Modul 1: Språket som verktyg', 'Grammatik, ordförråd och språklig variation.', 1, 8, true),
  ('f13a8d21-7c5b-4a24-af58-01d4c6b60102'::uuid, 'SVESVE01', 'Modul 2: Lässtrategier & texttyper', 'Strategier för sakprosa och berättande texter.', 2, 12, true),
  ('f13a8d21-7c5b-4a24-af58-01d4c6b60103'::uuid, 'SVESVE01', 'Modul 3: Skriftlig framställning', 'Planera, skriva och bearbeta texter.', 3, 12, true),
  ('f13a8d21-7c5b-4a24-af58-01d4c6b60104'::uuid, 'SVESVE01', 'Modul 4: Muntlig framställning & retorik', 'Tala, argumentera och återkoppla.', 4, 8, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, is_published = EXCLUDED.is_published;

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
-- Modul 1
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0101'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60101'::uuid, 'SVESVE01', 'Språkets byggstenar', 'Genomgång av satsdelar och ordföljd.', '# Grammatikstarter\n- Satsdelar: subjekt, predikat, objekt\n- BIFF-regeln för bisatser\n- Position av satsadverbial\n\nÖvning: Markera satsdelar i tre nyhetsmeningar.', 'theory', 1, 40, 'easy', ARRAY['Identifiera satsdelar', 'Förbättra ordföljd'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0102'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60101'::uuid, 'SVESVE01', 'Språklig variation', 'Sociolekter, dialekter och register.', '## Variationstyper\n- Geografisk (dialekter)\n- Social (sociolekter)\n- Situationsanpassning (register)\n\nCase: analysera två sms-konversationer och resonera kring register.', 'theory', 2, 35, 'medium', ARRAY['Beskriva språkvariation', 'Anpassa språk efter mottagare'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0103'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60101'::uuid, 'SVESVE01', 'Ordval & stilfigurer', 'Bygg ordförråd och identifiera stilmedel.', '### Fokus\n- Synonymer/antonymer\n- Stilfigurer: metafor, alliteration, anafor\n\nWorkshop: omskriv en mening med tre olika stilar.', 'theory', 3, 35, 'medium', ARRAY['Variera ordförråd', 'Känna igen stilfigurer'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0104'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60101'::uuid, 'SVESVE01', 'Diagnostiskt språkprojekt', 'Självskattning och målformulering.', '## Uppgift\n1. Spela in kort presentation\n2. Analysera egna styrkor/svagheter\n3. Sätt två konkreta språkmål\n4. Dela kamratrespons', 'project', 4, 45, 'medium', ARRAY['Reflektera över språkbruk', 'Sätta utvecklingsmål'], true),

-- Modul 2
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0201'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60102'::uuid, 'SVESVE01', 'Aktiv läsning av sakprosa', 'Strategier för faktatexter.', '### Metod\n- Förhandsgranska rubriker\n- Gör marginalanteckningar\n- Sammanfatta styckets huvudidé\n\nÖvning på debattartikel.', 'theory', 1, 45, 'medium', ARRAY['Sökläsa och närläsa', 'Formulera huvudbudskap'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0202'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60102'::uuid, 'SVESVE01', 'Berättande text – dramaturgi', 'Narrativ kurva och gestaltning.', '## Dramaturgisk kurva\n1. Presentation\n2. Fördjupning\n3. Konflikt\n4. Upplösning\n\nUppgift: analysera novellens vändpunkt.', 'theory', 2, 35, 'easy', ARRAY['Identifiera berättarkomponenter', 'Beskriva gestaltning'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0203'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60102'::uuid, 'SVESVE01', 'Källkritik i praktiken', 'Bedöma trovärdighet och relevans.', '### Kriterier\n- Äkthet, tid, beroende, tendens\n- Spåra ursprungskälla\n\nCase: jämför två artiklar om samma händelse.', 'theory', 3, 40, 'medium', ARRAY['Granska källor', 'Motivera bedömningar'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0204'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60102'::uuid, 'SVESVE01', 'Litterär analysworkshop', 'Gruppdiskussion om motiv och teman.', '## Workshopstruktur\n- Läs utdrag i förväg\n- Identifiera motiv, budskap, symbolik\n- Dokumentera i delat dokument\n\nSyfte: utveckla tolkning med textstöd.', 'exercise', 4, 50, 'hard', ARRAY['Samarbeta i textanalys', 'Använda citat som belägg'], true),

-- Modul 3
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0301'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60103'::uuid, 'SVESVE01', 'Planera skriven text', 'Disposition, syfte och målgrupp.', '### Planeringsmall\n1. Syfte & mottagare\n2. Huvudpoänger\n3. Disposition (inledning, avhandling, avslut)\n\nÖvning: skapa outline till insändare.', 'theory', 1, 30, 'easy', ARRAY['Skapa tydlig disposition', 'Anpassa innehåll till syfte'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0302'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60103'::uuid, 'SVESVE01', 'Skriva argumenterande text', 'Tes, argument, motargument.', '## Struktur\n- Rubrik\n- Tes\n- Argument med stöd\n- Bemöt motargument\n- Avslut med uppmaning\n\nChecklist: logik, språk, källhänvisning.', 'theory', 2, 50, 'medium', ARRAY['Utveckla tes', 'Stödja argument med källor'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0303'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60103'::uuid, 'SVESVE01', 'Bearbetning & respons', 'Kamratrespons och språklig finslipning.', '### Modell\n1. Läs högt för dig själv\n2. Kontrollera struktur mot outline\n3. Använd responsmall (styrka, fråga, tips)\n4. Implementera ändringar', 'exercise', 3, 45, 'medium', ARRAY['Ge konstruktiv respons', 'Revidera egen text'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0304'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60103'::uuid, 'SVESVE01', 'Språkgranskning & formalia', 'Interpunktion, styckeindelning, källhänvisning.', 'Checklista\n- Punkt/kommatecken vid bisatser\n- Nytt stycke vid ny tanke\n- Enligt Harvard: (Författare, år)\n\nÖvning: korrigera text med markups.', 'theory', 4, 35, 'medium', ARRAY['Förbättra formalia', 'Citera korrekt'], true),

-- Modul 4
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0401'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60104'::uuid, 'SVESVE01', 'Retorikens grunder', 'Ethos, logos, pathos.', '### Retoriska begrepp\n- Ethos: trovärdighet\n- Logos: logik\n- Pathos: känslor\n\nAnalysera tal och markera exempel.', 'theory', 1, 35, 'easy', ARRAY['Använda retoriska begrepp', 'Analysera tal'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0402'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60104'::uuid, 'SVESVE01', 'Muntlig framställning – workshop', 'Öva tal i mindre grupper.', 'Struktur\n1. Disposition på whiteboard\n2. Stödordskort\n3. Filma kort tal (2 min)\n4. Självvärdering via rubrik', 'exercise', 2, 40, 'medium', ARRAY['Bygga stödord', 'Utveckla kroppsspråk'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0403'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60104'::uuid, 'SVESVE01', 'Aktivt lyssnande & respons', 'Ge och ta emot feedback på tal.', '### Responsmetod\n- Börja positivt\n- Ställ klargörande frågor\n- Föreslå förbättring\n\nÖvning: lyssna på klasskamrat och anteckna enligt mall.', 'theory', 3, 30, 'easy', ARRAY['Lyssna aktivt', 'Formulera konstruktiv respons'], true),
('c7cbffe5-28a2-4b38-9dff-1e7d7abf0404'::uuid, 'f13a8d21-7c5b-4a24-af58-01d4c6b60104'::uuid, 'SVESVE01', 'Slutligt retoriktal', 'Genomför bedömt tal.', 'Bedömningspunkter\n- Struktur & tidsram\n- Språk & stilfigurer\n- Anpassning till målgrupp\n- Visuella stöd (frivilligt)\n\nElev lämnar in manus + reflektion.', 'project', 4, 55, 'hard', ARRAY['Genomföra sammanhållet tal', 'Reflektera över egen utveckling'], true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, is_published = EXCLUDED.is_published;
