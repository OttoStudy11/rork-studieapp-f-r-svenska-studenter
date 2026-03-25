-- ============================================================
-- COURSE CONTENT: SAMSAM01b (Samhällskunskap 1b)
-- ============================================================

INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'SAMSAM01b',
  'SAMSAM01b',
  'Samhällskunskap 1b',
  'Introduktion till demokrati, ekonomi, internationella relationer och individens rättigheter.',
  'Samhällskunskap',
  'gymnasie',
  100,
  '["Riksdagens öppna data", "SCB", "Nyhetsappar", "Eurostat"]'::jsonb,
  '["Följ dagliga nyheter", "Koppla teorier till verkliga exempel", "Diskutera i smågrupper"]'::jsonb,
  '["SAMSAM02", "HISHIS01b", "ENGENG05"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, points = EXCLUDED.points;

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES
  ('8c9fe64d-78f7-4fd0-8e52-c2c101010101'::uuid, 'SAMSAM01b', 'Modul 1: Demokrati & statsskick', 'Svenskt statsskick och demokratiska modeller.', 1, 10, true),
  ('8c9fe64d-78f7-4fd0-8e52-c2c101010102'::uuid, 'SAMSAM01b', 'Modul 2: Ekonomiska system', 'Nationalekonomi och privatekonomi.', 2, 11, true),
  ('8c9fe64d-78f7-4fd0-8e52-c2c101010103'::uuid, 'SAMSAM01b', 'Modul 3: Rättigheter & medier', 'MR, lagstiftning och medielandskap.', 3, 10, true),
  ('8c9fe64d-78f7-4fd0-8e52-c2c101010104'::uuid, 'SAMSAM01b', 'Modul 4: Globalisering & hållbarhet', 'Internationella organisationer och globala mål.', 4, 9, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, is_published = EXCLUDED.is_published;

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
-- Modul 1
('a4be3d12-0f7f-4d66-9bf8-e81101010101'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010101'::uuid, 'SAMSAM01b', 'Vad är demokrati?', 'Direkt vs representativ, demokratikriterier.', 'Genomgång + exit ticket (digital quiz).', 'theory', 1, 35, 'easy', ARRAY['Definiera demokrati', 'Känna till kriterier'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010102'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010101'::uuid, 'SAMSAM01b', 'Svenska statsskicket', 'Riksdag, regering, domstolar.', 'Skapa organisationsschema + case: regeringsbildning.', 'exercise', 2, 45, 'medium', ARRAY['Redogöra för maktdelning', 'Tillämpa på scenario'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010103'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010101'::uuid, 'SAMSAM01b', 'Partisystem & ideologier', 'Konservatism, liberalism, socialism, ekologism.', 'Stationsarbete med partiprogram + ideologikort.', 'exercise', 3, 45, 'medium', ARRAY['Koppla partier till ideologi', 'Analysera valmanifest'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010104'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010101'::uuid, 'SAMSAM01b', 'Simulerat utskottsarbete', 'Elevroller i utskott, skriver betänkande.', 'Projekt: fördela roller, skriva propositionstext, debatt i klass.', 'project', 4, 60, 'hard', ARRAY['Förstå lagprocess', 'Argumentera sakligt'], true),

-- Modul 2
('a4be3d12-0f7f-4d66-9bf8-e81101010201'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010102'::uuid, 'SAMSAM01b', 'Ekonomiska kretsloppet', 'Hushåll, företag, offentlig sektor, banker.', 'Rita kretslopp + identifiera flöden. Diskutera störningar.', 'theory', 1, 40, 'medium', ARRAY['Beskriva kretslopp', 'Analysera balans'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010202'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010102'::uuid, 'SAMSAM01b', 'Konjunkturer & finanspolitik', 'Stabiliseringspolitikens verktyg.', 'Case: recession – vilka åtgärder? Gruppdiskussion.', 'exercise', 2, 45, 'medium', ARRAY['Förstå finanspolitik', 'Applicera verktyg'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010203'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010102'::uuid, 'SAMSAM01b', 'Privatekonomi & budget', 'Skapa personlig budget, jämföra sparformer.', 'Workshop i kalkylark. Uppgift: skapa 12-mån budget + riskanalys.', 'exercise', 3, 50, 'medium', ARRAY['Planera privatekonomi', 'Värdera sparalternativ'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010204'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010102'::uuid, 'SAMSAM01b', 'Ekonomipodden', 'Elevproducerad podd om ekonomiskt ämne.', 'Projekt: research, manus, inspelning, publicering. Bedömning: fakta + pedagogik.', 'project', 4, 60, 'hard', ARRAY['Kommunicera ekonomi', 'Samarbeta digitalt'], true),

-- Modul 3
('a4be3d12-0f7f-4d66-9bf8-e81101010301'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010103'::uuid, 'SAMSAM01b', 'Mänskliga rättigheter', 'Deklarationer och konventioner.', 'Genomgång + case om YKMR. Grupp analyserar fall.', 'theory', 1, 40, 'medium', ARRAY['Lista centrala MR', 'Koppla till fallstudie'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010302'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010103'::uuid, 'SAMSAM01b', 'Svenskt rättssystem', 'Domstolar och lagstiftning.', 'Studiebesök/rollspel: rättegångssimulation.', 'exercise', 2, 50, 'hard', ARRAY['Beskriva domstolar', 'Förstå rättsprocess'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010303'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010103'::uuid, 'SAMSAM01b', 'Medielandskap & algoritmer', 'Public service, filterbubblor, källkritik.', 'Workshop: analysera flöden, kartlägg algoritmer. Skapa källkritisk guide.', 'exercise', 3, 45, 'medium', ARRAY['Kritiskt granska medier', 'Förklara filterbubblor'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010304'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010103'::uuid, 'SAMSAM01b', 'MR-fallstudie', 'Skriv policy brief.', 'Elev väljer aktuellt MR-fall, analyserar aktörer, föreslår åtgärder. Leverans: policy brief + pitch.', 'project', 4, 60, 'hard', ARRAY['Applicera MR-kunskaper', 'Föreslå lösningar'], true),

-- Modul 4
('a4be3d12-0f7f-4d66-9bf8-e81101010401'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010104'::uuid, 'SAMSAM01b', 'Globalisering 360°', 'Ekonomisk, kulturell, politisk globalisering.', 'Mindmap + case: globala leverantörskedjor.', 'theory', 1, 40, 'medium', ARRAY['Definiera globalisering', 'Analysera konsekvenser'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010402'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010104'::uuid, 'SAMSAM01b', 'Internationella organisationer', 'FN, EU, WTO, IMF.', 'Grupp gör infographic över organisationers uppdrag & kritik.', 'exercise', 2, 45, 'medium', ARRAY['Skilja roller', 'Värdera effektivitet'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010403'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010104'::uuid, 'SAMSAM01b', 'Agenda 2030 Hackathon', 'Idégenerering kring globala mål.', 'Design thinking-pass. Elever prototypar lösning på valt mål.', 'project', 3, 55, 'hard', ARRAY['Koppla teori till innovation', 'Presentera lösningar'], true),
('a4be3d12-0f7f-4d66-9bf8-e81101010404'::uuid, '8c9fe64d-78f7-4fd0-8e52-c2c101010104'::uuid, 'SAMSAM01b', 'Avslutande simulering', 'Globalt toppmöte.', 'Rollspel med länder som förhandlar klimatavtal. Bedömning: argumentation + kompromissförmåga.', 'project', 4, 60, 'hard', ARRAY['Förhandla internationellt', 'Söka kompromisser'], true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, is_published = EXCLUDED.is_published;
