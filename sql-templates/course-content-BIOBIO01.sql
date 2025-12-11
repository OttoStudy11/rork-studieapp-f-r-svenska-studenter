-- ============================================================
-- COURSE CONTENT: BIOBIO01 (Biologi 1)
-- ============================================================

INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'BIOBIO01',
  'BIOBIO01',
  'Biologi 1',
  'Grundkurs i biologi med cellbiologi, genetik, ekologi och evolution kopplat till hållbarhetsfrågor.',
  'Biologi',
  'gymnasie',
  100,
  '["Laborationsutrustning", "Digitala mikroskop", "Artbestämningsappar", "Vetenskapliga artiklar"]'::jsonb,
  '["För loggbok över laborationer", "Knyt teorier till vardagsobservationer", "Utnyttja fältstudier"]'::jsonb,
  '["BIOBIO02", "KEKEM01", "NAKNAK01a1"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, points = EXCLUDED.points;

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES
  ('52c17084-7c2e-4d38-86a8-20ac01010101'::uuid, 'BIOBIO01', 'Modul 1: Cellbiologi & biokemi', 'Cellens uppbyggnad, makromolekyler och metabolism.', 1, 11, true),
  ('52c17084-7c2e-4d38-86a8-20ac01010102'::uuid, 'BIOBIO01', 'Modul 2: Genetik & bioteknik', 'Arv, proteinsyntes och genteknik.', 2, 11, true),
  ('52c17084-7c2e-4d38-86a8-20ac01010103'::uuid, 'BIOBIO01', 'Modul 3: Ekologi & hållbar utveckling', 'Ekosystem, energiflöden och bevarande.', 3, 11, true),
  ('52c17084-7c2e-4d38-86a8-20ac01010104'::uuid, 'BIOBIO01', 'Modul 4: Evolution & människans utveckling', 'Naturligt urval, artbildning och människans påverkan.', 4, 9, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, is_published = EXCLUDED.is_published;

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
-- Modul 1
('c2b39249-7b75-4053-846b-c4bb01010101'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010101'::uuid, 'BIOBIO01', 'Cellens komponenter', 'Prokaryota vs eukaryota celler.', 'Genomgång + mikroskopilab: observera växt- och djurcell. Dokumentera i labbrapport.', 'exercise', 1, 50, 'medium', ARRAY['Identifiera organeller', 'Skilja celltyper'], true),
('c2b39249-7b75-4053-846b-c4bb01010102'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010101'::uuid, 'BIOBIO01', 'Makromolekyler', 'Kolhydrater, lipider, proteiner, nukleinsyror.', 'Laboration: biokemiska tester (Benedict, Biuret). Skriv resultat i tabell.', 'project', 2, 55, 'hard', ARRAY['Förstå biomolekyler', 'Dokumentera laboration'], true),
('c2b39249-7b75-4053-846b-c4bb01010103'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010101'::uuid, 'BIOBIO01', 'Cellandning & fotosyntes', 'Energiomvandlingar.', 'Flödesdiagram + simulering i PhET. Diskutera koppling mellan processerna.', 'theory', 3, 45, 'medium', ARRAY['Beskriva processerna', 'Analysera energiutbyte'], true),
('c2b39249-7b75-4053-846b-c4bb01010104'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010101'::uuid, 'BIOBIO01', 'Transport över membran', 'Diffusion, osmos, aktiv transport.', 'Laboration med potatis och saltlösningar. Beräkna procentuell massförändring.', 'exercise', 4, 45, 'medium', ARRAY['Förklara transportmekanismer', 'Bearbeta data'], true),

-- Modul 2
('c2b39249-7b75-4053-846b-c4bb01010201'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010102'::uuid, 'BIOBIO01', 'Mendelsk genetik', 'Monohybrid- och dihybridkorsningar.', 'Problemlösning med Punnett squares, diskussion om arvbarhet.', 'exercise', 1, 45, 'medium', ARRAY['Utföra korsningsscheman', 'Beräkna sannolikhet'], true),
('c2b39249-7b75-4053-846b-c4bb01010202'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010102'::uuid, 'BIOBIO01', 'Proteinsyntes', 'DNA → RNA → protein.', 'Storyboardaktivitet: skapa serietecknad genomgång av transkription/translation.', 'theory', 2, 40, 'medium', ARRAY['Förklara proteinsyntes', 'Använda begrepp korrekt'], true),
('c2b39249-7b75-4053-846b-c4bb01010203'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010102'::uuid, 'BIOBIO01', 'Mutationer & sjukdom', 'Typer av mutationer, konsekvenser.', 'Case: analyserar genetiska sjukdomar, etiska aspekter.', 'theory', 3, 45, 'medium', ARRAY['Koppla mutation till egenskap', 'Diskutera etik'], true),
('c2b39249-7b75-4053-846b-c4bb01010204'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010102'::uuid, 'BIOBIO01', 'Bioteknik och CRISPR', 'Nutida metoder.', 'Debatt: möjligheter och risker. Sammanfattas i policy memo.', 'project', 4, 55, 'hard', ARRAY['Redogöra för tekniker', 'Värdera konsekvenser'], true),

-- Modul 3
('c2b39249-7b75-4053-846b-c4bb01010301'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010103'::uuid, 'BIOBIO01', 'Ekosystem & näringskedjor', 'Producenter, konsumenter, nedbrytare.', 'Fältstudie i närliggande natur. Identifiera arter, rita näringsvävar.', 'project', 1, 60, 'medium', ARRAY['Kartlägga ekosystem', 'Dokumentera fältdata'], true),
('c2b39249-7b75-4053-846b-c4bb01010302'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010103'::uuid, 'BIOBIO01', 'Energi & biogeokemiska kretslopp', 'Kol-, kväve-, vattenkretslopp.', 'Interaktiv lektion med modeller. Uppgift: spåra kolatom genom system.', 'theory', 2, 45, 'medium', ARRAY['Beskriva kretslopp', 'Analysera mänsklig påverkan'], true),
('c2b39249-7b75-4053-846b-c4bb01010303'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010103'::uuid, 'BIOBIO01', 'Populationsdynamik', 'Bärkraft, limiting factors.', 'Simulera populationer i kalkylark. Diskutera resultat.', 'exercise', 3, 45, 'medium', ARRAY['Analysera populationstillväxt', 'Hantera data'], true),
('c2b39249-7b75-4053-846b-c4bb01010304'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010103'::uuid, 'BIOBIO01', 'Hållbarhetscase', 'Lokal miljöutmaning.', 'Grupp arbetar med case (t.ex. övergödning). Producerar handlingsplan.', 'project', 4, 60, 'hard', ARRAY['Tillämpa ekologiska begrepp', 'Föreslå åtgärder'], true),

-- Modul 4
('c2b39249-7b75-4053-846b-c4bb01010401'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010104'::uuid, 'BIOBIO01', 'Evolutionens mekanismer', 'Naturligt urval, genetisk drift, genflöde.', 'Genomgång + kort simulering med bönpåsar.', 'theory', 1, 40, 'medium', ARRAY['Beskriva mekanismer', 'Koppla till exempel'], true),
('c2b39249-7b75-4053-846b-c4bb01010402'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010104'::uuid, 'BIOBIO01', 'Artbildning & klassificering', 'Biologiska artbegreppet, fylogeni.', 'Använd digitalt verktyg för kladogram. Jämför arter.', 'exercise', 2, 45, 'medium', ARRAY['Förstå artbegrepp', 'Läsa evolutionära träd'], true),
('c2b39249-7b75-4053-846b-c4bb01010403'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010104'::uuid, 'BIOBIO01', 'Människans utveckling', 'Homininers släktträd.', 'Case: analysera fossilfynd, diskussion om tolkningar.', 'theory', 3, 40, 'medium', ARRAY['Redogöra för människans evolution', 'Värdera bevis'], true),
('c2b39249-7b75-4053-846b-c4bb01010404'::uuid, '52c17084-7c2e-4d38-86a8-20ac01010104'::uuid, 'BIOBIO01', 'Evolution-projekt – populärvetenskaplig artikel', 'Skriv artikel riktad till allmänheten.', 'Innehåll: förklaring av fenomen, illustrationer, källor. Publicera i klassdigital tidskrift.', 'project', 4, 55, 'hard', ARRAY['Kommunicera naturvetenskap', 'Använda källor korrekt'], true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, is_published = EXCLUDED.is_published;
