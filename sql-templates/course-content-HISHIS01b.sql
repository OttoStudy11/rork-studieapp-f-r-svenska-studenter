-- ============================================================
-- COURSE CONTENT: HISHIS01b (Historia 1b)
-- ============================================================

INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'HISHIS01b',
  'HISHIS01b',
  'Historia 1b',
  'Översiktskurs med källkritik, historiebruk och teman från forntid till nutid.',
  'Historia',
  'gymnasie',
  100,
  '["Historiska atlaser", "Digitala arkiv", "UR-program", "Tidslinjeverktyg"]'::jsonb,
  '["Arbeta kronologiskt och tematiskt", "Använd begrepp som kontinuitet/förändring", "Diskutera historiebruk i vardagen"]'::jsonb,
  '["SAMSAM01b", "RELREL01", "ENGENG05"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, points = EXCLUDED.points;

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES
  ('f6c5b663-0cfa-4dc5-b6a5-d44ea7010101'::uuid, 'HISHIS01b', 'Modul 1: Historisk överblick', 'Från forntiden till industriella revolutionen.', 1, 10, true),
  ('f6c5b663-0cfa-4dc5-b6a5-d44ea7010102'::uuid, 'HISHIS01b', 'Modul 2: Demokrati och konflikter', '1900-talet och demokratisering.', 2, 11, true),
  ('f6c5b663-0cfa-4dc5-b6a5-d44ea7010103'::uuid, 'HISHIS01b', 'Modul 3: Källkritik & historiebruk', 'Arbeta med primär- och sekundärkällor.', 3, 10, true),
  ('f6c5b663-0cfa-4dc5-b6a5-d44ea7010104'::uuid, 'HISHIS01b', 'Modul 4: Tematiska fördjupningar', 'Genus, kolonialism och teknikutveckling.', 4, 9, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, is_published = EXCLUDED.is_published;

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
-- Modul 1
('df318284-6d04-4c57-8d2e-4af800010101'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010101'::uuid, 'HISHIS01b', 'Tidslinje workshop', 'Skapa visuell tidslinje.', 'Uppgift: bygg digital tidslinje med minst 12 nedslag. Markera kontinuitet/förändring.', 'project', 1, 50, 'medium', ARRAY['Arbeta kronologiskt', 'Identifiera viktiga händelser'], true),
('df318284-6d04-4c57-8d2e-4af800010102'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010101'::uuid, 'HISHIS01b', 'Antiken till medeltiden', 'Jämför civilisationer.', 'Genomgång + case: Aten vs Rom vs Norden. Fokus på samhällsstruktur.', 'theory', 2, 40, 'medium', ARRAY['Jämföra samhällen', 'Använda begrepp som imperium, feodalism'], true),
('df318284-6d04-4c57-8d2e-4af800010103'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010101'::uuid, 'HISHIS01b', 'Vetenskaplig revolution', 'Orsaker och konsekvenser.', 'Seminarie: analysera källor om Kopernikus & Newton. Diskutera konsekvenser för synen på kunskap.', 'exercise', 3, 45, 'medium', ARRAY['Analysera orsak/konsekvens', 'Arbeta med källor'], true),
('df318284-6d04-4c57-8d2e-4af800010104'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010101'::uuid, 'HISHIS01b', 'Industriella revolutionen', 'Global påverkan.', 'Case-baserad lektion där elever får roller (arbetare, kapitalist, uppfinnare) och skriver perspektivtext.', 'exercise', 4, 45, 'medium', ARRAY['Beskriva samhällsförändring', 'Förstå perspektiv'], true),

-- Modul 2
('df318284-6d04-4c57-8d2e-4af800020101'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010102'::uuid, 'HISHIS01b', 'Första världskriget', 'Bakgrund och följder.', 'Genomgång med begrepp: allianser, imperialism, nationalism. Uppgift: skapa orsaksdiagram.', 'theory', 1, 40, 'medium', ARRAY['Redogöra för orsaker', 'Analysera följder'], true),
('df318284-6d04-4c57-8d2e-4af800020102'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010102'::uuid, 'HISHIS01b', 'Mellankrigstiden & demokrati', 'Weimarrepubliken och Sverige.', 'Jämför demokratiprocess i Sverige med Tyskland. Diskutera riskfaktorer.', 'theory', 2, 45, 'medium', ARRAY['Jämföra demokratiutveckling', ' förstå sociala faktorer'], true),
('df318284-6d04-4c57-8d2e-4af800020103'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010102'::uuid, 'HISHIS01b', 'Andra världskriget – källstudie', 'Analysera soldatbrev, propaganda, fotografier.', 'Arbetsstationer med primärkällor. Elever fyller analysmall.', 'exercise', 3, 55, 'hard', ARRAY['Källgranska primärkällor', 'Resonera kring propaganda'], true),
('df318284-6d04-4c57-8d2e-4af800020104'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010102'::uuid, 'HISHIS01b', 'Kalla kriget rollspel', 'Simulerad FN-debatt.', 'Grupproller (USA, Sovjet, alliansfria). Debatt om Kubakrisen. Bedömning på saklighet.', 'project', 4, 60, 'hard', ARRAY['Förklara blockpolitik', 'Argumentera historiskt'], true),

-- Modul 3
('df318284-6d04-4c57-8d2e-4af800030101'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010103'::uuid, 'HISHIS01b', 'Källkritiska kriterier', 'Äkthet, tid, beroende, tendens.', 'Workshop: analysera artikel med checklista. Bedöm trovärdighet.', 'theory', 1, 35, 'easy', ARRAY['Använda källkritiska begrepp', 'Dokumentera bedömning'], true),
('df318284-6d04-4c57-8d2e-4af800030102'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010103'::uuid, 'HISHIS01b', 'Historiebruk i populärkultur', 'Film, spel, reklam.', 'Elever analyserar valt verk, identifierar brukstyp (kommersiellt, moraliskt etc.).', 'exercise', 2, 45, 'medium', ARRAY['Klassificera historiebruk', 'Kritiskt granska populärkultur'], true),
('df318284-6d04-4c57-8d2e-4af800030103'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010103'::uuid, 'HISHIS01b', 'Historisk metod rapport', 'Skriv kort rapport av egen källstudie.', 'Guide + mall. Fokus på frågeställning, metod, källor, slutsats.', 'project', 3, 50, 'medium', ARRAY['Skriva historisk rapport', 'Presentera källor korrekt'], true),
('df318284-6d04-4c57-8d2e-4af800030104'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010103'::uuid, 'HISHIS01b', 'Seminarium historiebruk', 'Diskussion baserad på elevrapporter.', 'Bedömning: samtalsteknik, begreppsanvändning, källkritik.', 'exercise', 4, 45, 'medium', ARRAY['Argumentera med källstöd', 'Lyssna och bemöta'], true),

-- Modul 4
('df318284-6d04-4c57-8d2e-4af800040101'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010104'::uuid, 'HISHIS01b', 'Tema: Kolonialism & motstånd', 'Globalt perspektiv.', 'Fördjupningsföreläsning + case om Kongo/Indien. Elevuppgift: skapa jämförande mindmap.', 'theory', 1, 45, 'medium', ARRAY['Beskriva kolonialismens effekter', 'Se globala samband'], true),
('df318284-6d04-4c57-8d2e-4af800040102'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010104'::uuid, 'HISHIS01b', 'Tema: Genus i historien', 'Kvinnors och mäns roller.', 'Analysera statistik, dagböcker, lagtexter. Skriv kort analys.', 'exercise', 2, 40, 'medium', ARRAY['Analysera genusroller', 'Använda historiska belägg'], true),
('df318284-6d04-4c57-8d2e-4af800040103'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010104'::uuid, 'HISHIS01b', 'Tema: Teknik & samhälle', 'Teknologiska innovationer 1950–idag.', 'Grupp gör poddavsnitt som kopplar teknik till samhällsförändring.', 'project', 3, 55, 'hard', ARRAY['Koppla teknik och historia', 'Skapa multimodalt innehåll'], true),
('df318284-6d04-4c57-8d2e-4af800040104'::uuid, 'f6c5b663-0cfa-4dc5-b6a5-d44ea7010104'::uuid, 'HISHIS01b', 'Avslutande historiebruksspaning', 'Fältstudie i stadsmiljö.', 'Uppgift: fotografera minnesmärken, analysera syfte och budskap. Presentera i galleri.', 'project', 4, 50, 'medium', ARRAY['Identifiera historiebruk i vardagen', 'Kommunicera visuellt'], true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, is_published = EXCLUDED.is_published;
