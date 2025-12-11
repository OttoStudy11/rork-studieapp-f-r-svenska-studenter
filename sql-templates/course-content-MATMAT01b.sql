-- ============================================================
-- COURSE CONTENT: MATMAT01b (Matematik 1b)
-- ============================================================

-- Step 1: Ensure course entry exists
INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'MATMAT01b',
  'MATMAT01b',
  'Matematik 1b',
  'Fördjupad kurs i gymnasiematematik som kopplar algebra, funktioner och statistik till praktiska sammanhang för studieförberedande program.',
  'Matematik',
  'gymnasie',
  100,
  '["Digitala läromedel", "Grafräknare eller CAS", "Formelsamling", "Videogenomgångar"]'::jsonb,
  '["Skissa lösningar innan du räknar", "Arbeta metodiskt med en struktur per uppgift", "Utnyttja digitala verktyg för att verifiera resultat"]'::jsonb,
  '["MATMAT01a", "MATMAT02b", "FYSFYS01a"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  points = EXCLUDED.points;

-- Step 2: Modules
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES
  ('0dc2b5f2-2c71-49cf-969a-5c3fa541c101'::uuid, 'MATMAT01b', 'Modul 1: Algebraiska modeller', 'Uttryck, ekvationer och problemlösning med kontextnära exempel.', 1, 10, true),
  ('0dc2b5f2-2c71-49cf-969a-5c3fa541c102'::uuid, 'MATMAT01b', 'Modul 2: Funktioner och förändring', 'Linjära samband, proportionalitet och grafer i digitala verktyg.', 2, 12, true),
  ('0dc2b5f2-2c71-49cf-969a-5c3fa541c103'::uuid, 'MATMAT01b', 'Modul 3: Geometri och trigonometri', 'Geometriska modeller i koordinatsystem och vinkelsamband.', 3, 9, true),
  ('0dc2b5f2-2c71-49cf-969a-5c3fa541c104'::uuid, 'MATMAT01b', 'Modul 4: Statistik och sannolikhet', 'Datainsamling, centralmått och riskbedömning.', 4, 9, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_published = EXCLUDED.is_published;

-- Step 3: Lessons (Markdown content kept kortfattat men komplett)
INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70101'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c101'::uuid, 'MATMAT01b', 'Uttryck & variabler i kontext', 'Bygg algebraiska uttryck från verkliga problem.', '# Algebra i vardagen\n\n- Identifiera storheter (t.ex. biljettpris, antal varor)\n- Sätt variabler: p = pris per biljett\n- Bygg uttryck: totalkostnad = 2p + 120\n\n### Övning\n1. Formulera uttryck för månadskostnad med abonnemang + dataköp.\n2. Bestäm vilka termer som är konstanter respektive variabler.\n', 'theory', 1, 35, 'easy', ARRAY['Översätta textproblem till algebra', 'Dela upp uttryck i termer och koefficienter'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70102'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c101'::uuid, 'MATMAT01b', 'Ekvationslösning med strategier', 'Systematisk lösning av linjära ekvationer.', '## Metodik\n1. Förenkla båda sidor\n2. Samla variabler på ena sidan\n3. Dela för att isolera variabeln\n\n### Exempel\n4(x - 2) + 3 = 19 → x = 4.5\n\n### Reflektion\n- Kontrollera lösning genom insättning\n- Resonera kring rimlighet i kontext', 'theory', 2, 45, 'medium', ARRAY['Välja passande metod', 'Verifiera lösning'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70103'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c101'::uuid, 'MATMAT01b', 'Likformighet & proportioner', 'Relationer som hålls konstanta.', '## Proportioner\n- Direkt proportion: y = kx\n- Invers proportion: y = k/x\n\n#### Trappövning\n1. Beräkna skalfaktor mellan två ritningar\n2. Bestäm saknade mått via proportionstabell', 'theory', 3, 40, 'medium', ARRAY['Koppla proportioner till grafer', 'Tillämpa skala i ritningar'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70104'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c101'::uuid, 'MATMAT01b', 'Problemlösning laboration', 'Laboration med öppna problem.', '### Laboration: Eco-café\n- Intäktsfunktion: I(x) = 45x\n- Kostnadsfunktion: K(x) = 1200 + 20x\n- Resultatfunktion: R(x) = I(x) - K(x)\n\nUppgifter\n1. Bestäm nollpunkt (break-even)\n2. Diskutera hur ändrad råvarukostnad påverkar modellen\n3. Presentera i tabell + graf', 'project', 4, 50, 'hard', ARRAY['Modellera intäkter/kostnader', 'Presentera resultat grafiskt'], true),

  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70201'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c102'::uuid, 'MATMAT01b', 'Linjära funktioner & tolkning', 'Koppla riktningskoefficient till verkliga förändringar.', '# Linjära samband\n- f(x) = kx + m\n- k beskriver förändring per enhet\n- m beskriver startvärde\n\n### Exempel\nVattentank: f(t) = -3t + 120\n- Tömning 3 L/min\n- Start 120 L\n\n### Övning\nMät temperaturdata, anpassa linjär modell.', 'theory', 1, 40, 'medium', ARRAY['Tolka parametrar', 'Ställa upp modeller från data'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70202'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c102'::uuid, 'MATMAT01b', 'Funktionsanalys i grafräknare', 'Digital analys av funktioner.', '## Digitalt arbetssätt\n1. Ange funktion i grafräknare/CAS\n2. Läs av skärningar och extrempunkter\n3. Exportera tabell till kalkylark\n\n### Checklista\n- Ange fönster med rimlig x- och y-skala\n- Kontrollera resultat mot manuell beräkning', 'theory', 2, 35, 'easy', ARRAY['Använda digitala verktyg', 'Analysera funktionsegenskaper'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70203'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c102'::uuid, 'MATMAT01b', 'Exponentialmodeller', 'Procentuell förändring och ränta.', '### Exponentialfunktion\nF(t) = A · (1 + p)^t\n- A = startvärde\n- p = förändring per period\n\n#### Scenario\nSpara 5000 kr, ränta 1.2% per månad.\nF(12) = 5000 · 1.012^12 ≈ 5683 kr.\n\nReflektera kring begränsningar: Ränta kan ändras, praktiska tak.', 'theory', 3, 45, 'medium', ARRAY['Tillämpa procentuella modeller', 'Analysera långsiktiga effekter'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70204'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c102'::uuid, 'MATMAT01b', 'Mini-projekt: Data storytelling', 'Skapa berättelse med data och grafer.', '## Projekt\n- Välj dataset (t.ex. klimat, ekonomi)\n- Modellera med linjär eller exponential funktion\n- Visualisera i presentation\n\nBedömning: Matematiskt språk, tolkning, kvalitet på slutsatser.', 'project', 4, 60, 'hard', ARRAY['Kommunicera matematiska resultat', 'Värdera modellernas giltighet'], true),

  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70301'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c103'::uuid, 'MATMAT01b', 'Koordinatgeometri', 'Avstånd och mittpunkt i koordinatsystem.', '### Avståndsformel\nAB = √((x2 - x1)^2 + (y2 - y1)^2)\n### Mittpunkt\nM = ((x1 + x2)/2 , (y1 + y2)/2)\n\nÖvning: Analysera sträckor i stadsplan.', 'theory', 1, 35, 'easy', ARRAY['Beräkna avstånd', 'Tillämpa mittpunkter'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70302'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c103'::uuid, 'MATMAT01b', 'Area & volym i praktiken', 'Beräkna materialåtgång.', '## Metoder\n- Triangel: A = bh/2\n- Cirkelsektor: A = (v/360)·πr²\n- Prisma: V = basarea·höjd\n\nCase: Dimensionera en planteringslåda.', 'theory', 2, 45, 'medium', ARRAY['Anpassa formler till objekt', 'Resonera om avrundning'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70303'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c103'::uuid, 'MATMAT01b', 'Intro trigonometri', 'Sin, cos och tan i rätvinkliga trianglar.', '### Definitioner\n- sin v = motstående / hypotenusa\n- cos v = närliggande / hypotenusa\n- tan v = motstående / närliggande\n\nÖvningar\n1. Bestäm höjd på flaggstång via vinkelmätning\n2. Avgör lutning på ramp', 'theory', 3, 40, 'medium', ARRAY['Använda trigonometriska kvoter', 'Lösa praktiska problem'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70304'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c103'::uuid, 'MATMAT01b', 'Geometriworkshop', 'Problemlösning i grupp.', '## Workshopmoment\n- Station 1: Triangulering av avstånd\n- Station 2: Optimera yta vid given omkrets\n- Station 3: Reflektera kring felkällor\n\nBedömning: Samarbete, strategier, matematiskt språk.', 'exercise', 4, 55, 'hard', ARRAY['Planera lösningsstrategier', 'Argumentera matematiskt'], true),

  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70401'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c104'::uuid, 'MATMAT01b', 'Datainsamling & diagram', 'Planera undersökning.', '### Process\n1. Formulera fråga\n2. Välj urvalsmetod\n3. Samla data digitalt\n4. Visualisera (stapeldiagram/boxplot)\n\nReflektera kring bortfall.', 'theory', 1, 35, 'easy', ARRAY['Planera statistisk undersökning', 'Välja diagramtyp'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70402'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c104'::uuid, 'MATMAT01b', 'Läges- och spridningsmått', 'Medelvärde, median, kvartiler.', '## Centralmått\n- Medelvärde = Σx / n\n- Median = mittvärde\n- Typvärde = vanligaste värdet\n\n## Spridning\n- Variationsbredd\n- Kvartilavstånd\n\nÖvning med elevdata.', 'theory', 2, 40, 'medium', ARRAY['Beräkna mått korrekt', 'Tolkar spridning'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70403'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c104'::uuid, 'MATMAT01b', 'Sannolikhet och risk', 'Bedöm risker i vardagliga situationer.', '## Begrepp\n- Komplementhändelse\n- Oberoende vs beroende händelser\n\nCase: Säkerhet i trafikmiljö – kombinera sannolikheter.', 'theory', 3, 35, 'medium', ARRAY['Identifiera händelser', 'Resonera kring risk'], true),
  ('5a1c6c42-5b0c-4cf0-8e4b-52f2e2e70404'::uuid, '0dc2b5f2-2c71-49cf-969a-5c3fa541c104'::uuid, 'MATMAT01b', 'Statistikrapport', 'Skriv rapport från egen undersökning.', '### Rapportstruktur\n1. Syfte & metod\n2. Resultat med tabell/diagram\n3. Analys av osäkerhet\n4. Slutsats + förbättringsförslag\n\nBedömning: Struktur, matematiskt språk, källkritik.', 'project', 4, 60, 'hard', ARRAY['Kommunicera statistik', 'Bedöma trovärdighet'], true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published;
