-- ============================================================
-- COURSE CONTENT: SVESVE02 (Svenska 2)
-- ============================================================

INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'SVESVE02',
  'SVESVE02',
  'Svenska 2',
  'Fördjupning i svenska med fokus på vetenskapligt skrivande, litteraturhistoria och retorisk analys.',
  'Språk',
  'gymnasie',
  100,
  '["Vetenskapliga artiklar", "Korpusverktyg", "Digitalt skrivstöd", "Litteraturantologier"]'::jsonb,
  '["Planera uppsatser med tydlig forskningsfråga", "Använd källhänvisningar konsekvent", "Var kritisk till språknormer"]'::jsonb,
  '["SVESVE01", "SVESVE03", "SAMSAM01b"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, points = EXCLUDED.points;

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES
  ('7198fb1d-ef5f-4931-86d4-2c1d2b020101'::uuid, 'SVESVE02', 'Modul 1: Språksociologi & normer', 'Språkförändring, makt och identitet.', 1, 9, true),
  ('7198fb1d-ef5f-4931-86d4-2c1d2b020102'::uuid, 'SVESVE02', 'Modul 2: Vetenskapligt skrivande', 'PM, rapport och essä.', 2, 13, true),
  ('7198fb1d-ef5f-4931-86d4-2c1d2b020103'::uuid, 'SVESVE02', 'Modul 3: Litteraturhistoria', 'Epoker från antiken till modernism.', 3, 11, true),
  ('7198fb1d-ef5f-4931-86d4-2c1d2b020104'::uuid, 'SVESVE02', 'Modul 4: Retorisk analys', 'Analys av tal och medietexter.', 4, 9, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, is_published = EXCLUDED.is_published;

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
-- Modul 1
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00101'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020101'::uuid, 'SVESVE02', 'Språklig variation – fördjupning', 'Analysera maktperspektiv.', '### Fokus\n- Standardspråk vs dialekt\n- Språk och klass\n- Digitalt språk\n\nÖvning: mikroanalys av kommentarsfält.', 'theory', 1, 45, 'medium', ARRAY['Koppla språk till makt', 'Analysera digitalt språkbruk'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00102'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020101'::uuid, 'SVESVE02', 'Språkpolitik och lagstiftning', 'Minoritetsspråk, svensk språklag.', '## Innehåll\n- Språklagen 2009\n- Nationella minoritetsspråk\n- Språkplanering\n\nCase: argumentera för skyltning på flera språk.', 'theory', 2, 40, 'medium', ARRAY['Redogöra för språklag', 'Argumentera om språkpolitik'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00103'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020101'::uuid, 'SVESVE02', 'Fältstudie språkligt landskap', 'Dokumentera skyltar och slogans.', '### Uppdrag\n1. Fotografera 10 skyltar i närområde\n2. Analysera språkval, mottagare, syfte\n3. Presentera i bildspel', 'project', 3, 50, 'hard', ARRAY['Genomföra fältstudie', 'Presentera med visuellt stöd'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00104'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020101'::uuid, 'SVESVE02', 'Reflekterande seminarium', 'Diskussion styrd av frågekort.', 'Syfte: fördjupa förståelse för identitet och språk.\nBedömning: deltagande + textstöd i resonemang.', 'exercise', 4, 35, 'medium', ARRAY['Föra samtal med textstöd', 'Resonera på avancerad nivå'], true),

-- Modul 2
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00201'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020102'::uuid, 'SVESVE02', 'Vetenskaplig metod – översikt', 'Frågeställning, syfte, material.', '### Checklista\n- Tydlig forskningsfråga\n- Avgränsning\n- Metodval\n\nSkapa forskningsplan i par.', 'theory', 1, 45, 'medium', ARRAY['Formulera syfte', 'Välja metod'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00202'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020102'::uuid, 'SVESVE02', 'PM-skrivning steg för steg', 'Disposition och språkdrag.', '## Struktur\n1. Inledning (bakgrund, syfte)\n2. Avhandling (resultat, resonemang)\n3. Avslut (slutsats, vidare forskning)\n\nSpråkdrag: formellt, tydligt, källsäkrat.', 'theory', 2, 55, 'hard', ARRAY['Skriva formellt', 'Använda referenssystem'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00203'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020102'::uuid, 'SVESVE02', 'Källhantering i Zotero', 'Digital referenshantering.', 'Workshop i datorsal. Fokus på\n- Import av källor\n- Skapa referenslista\n- Citat i löptext\n\nExit ticket: rätta källor i exempeltext.', 'exercise', 3, 40, 'medium', ARRAY['Skapa källförteckning', 'Citerar korrekt'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00204'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020102'::uuid, 'SVESVE02', 'Opposition & seminarie', 'Kamratrespons enligt mall.', 'Moment\n- Läs kollegas text\n- Förbered frågor\n- Genomför opponering\n\nBedömning på analys + saklighet.', 'exercise', 4, 50, 'hard', ARRAY['Bedöma text vetenskapligt', 'Ge saklig respons'], true),

-- Modul 3
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00301'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020103'::uuid, 'SVESVE02', 'Epoköversikt', 'Från antiken till romantiken.', '### Översiktstavla\n- Nyckelbegrepp per epok\n- Centrala författare\n- Typiska teman\n\nElever fyller tidslinje.', 'theory', 1, 40, 'easy', ARRAY['Placera verk i epok', 'Koppla teman till tidsanda'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00302'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020103'::uuid, 'SVESVE02', 'Text närläsning', 'Analysera språk och motiv.', '### Arbetsgång\n1. Välj stycke\n2. Markera stilfigurer\n3. Tolka motiv/symboler\n4. Koppla till epok', 'theory', 2, 45, 'medium', ARRAY['Närläsa med textstöd', 'Argumentera om motiv'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00303'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020103'::uuid, 'SVESVE02', 'Litterär essä', 'Skriv essä som knyter verk till nutid.', 'Instruktion\n- Välj verk + tema (frihet, identitet)\n- Jämför med samtida fenomen\n- Använd citat och tolkning', 'project', 3, 60, 'hard', ARRAY['Jämföra epoker', 'Koppla text till nutid'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00304'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020103'::uuid, 'SVESVE02', 'Epokseminarium', 'Elevledda stationer.', 'Varje grupp leder miniföreläsning om epok. Inkluderar quiz och reflektionsfrågor.', 'exercise', 4, 45, 'medium', ARRAY['Presentera litterär kontext', 'Aktivera målgruppen'], true),

-- Modul 4
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00401'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020104'::uuid, 'SVESVE02', 'Retorik repetition', 'Aristoteles appellformer + dispositio.', 'Sammanfattning + miniövningar på reklamklipp.', 'theory', 1, 30, 'easy', ARRAY['Identifiera ethos/logos/pathos', 'Använda dispositio'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00402'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020104'::uuid, 'SVESVE02', 'Retorisk analys av tal', 'Analysera historiskt tal.', '### Checklista\n- Kontext\n- Dispositio\n- Stilfigurer\n- Appellformer\n\nSkriv analys på 400 ord.', 'theory', 2, 40, 'medium', ARRAY['Strukturera analys', 'Belägga med citat'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00403'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020104'::uuid, 'SVESVE02', 'Medieretorik', 'Analysera politisk kampanj.', 'Gruppuppgift med Canva: bryt ned budskap, målgrupp och visuella knep. Ställ förbättringsförslag.', 'exercise', 3, 50, 'hard', ARRAY['Tolkar multimodala texter', 'Föreslå förbättringar'], true),
('6d3fd23e-0a46-4eb1-b8ed-a0572ce00404'::uuid, '7198fb1d-ef5f-4931-86d4-2c1d2b020104'::uuid, 'SVESVE02', 'Avslutande retoriktal', 'Elev producerar tal + analys.', 'Leverans\n- 5-min tal\n- Kort självanalys av retoriska val\n\nBedömning: struktur, språk, analys.', 'project', 4, 55, 'hard', ARRAY['Genomföra avancerat tal', 'Metareflektera'], true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, is_published = EXCLUDED.is_published;
