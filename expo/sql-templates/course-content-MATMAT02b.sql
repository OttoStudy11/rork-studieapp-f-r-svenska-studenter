-- ============================================================
-- COURSE CONTENT: MATMAT02b (Matematik 2b)
-- ============================================================

INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'MATMAT02b',
  'MATMAT02b',
  'Matematik 2b',
  'Utvidgar Matematik 1b med fokus på andragradsekvationer, logaritmer, trigonometri och statistik för samhällsvetenskapliga program.',
  'Matematik',
  'gymnasie',
  100,
  '["Grafräknare", "Digitalt CAS", "Formelsamling", "Geogebra"]'::jsonb,
  '["Sätt upp modeller grafiskt innan algebra", "Kontrollera svar genom insättning", "Arbeta med felanalys"]'::jsonb,
  '["MATMAT01b", "MATMAT03b", "FYSFYS01a"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, points = EXCLUDED.points;

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES
  ('8bf0a9a0-4b43-4d08-9758-3f6ef9020101'::uuid, 'MATMAT02b', 'Modul 1: Algebra & andragrad', 'Andragradspolynom, kvadratkomplettering och pq-formeln.', 1, 11, true),
  ('8bf0a9a0-4b43-4d08-9758-3f6ef9020102'::uuid, 'MATMAT02b', 'Modul 2: Funktioner & derivatornas idé', 'Fördjupning i funktioner, exponential och logaritm.', 2, 12, true),
  ('8bf0a9a0-4b43-4d08-9758-3f6ef9020103'::uuid, 'MATMAT02b', 'Modul 3: Trigonometri & geometri', 'Trigonometriska samband och vektorer.', 3, 10, true),
  ('8bf0a9a0-4b43-4d08-9758-3f6ef9020104'::uuid, 'MATMAT02b', 'Modul 4: Statistik & sannolikhet', 'Regression, binomialfördelning och riskanalys.', 4, 9, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, is_published = EXCLUDED.is_published;

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
-- Modul 1
('593c3f6d-f7cd-45df-9acf-9540d2e70101'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020101'::uuid, 'MATMAT02b', 'Andragradspolynom och grafer', 'Identifiera koefficienter och grafens form.', '### Standardform\nax^2 + bx + c\n- a styr öppning\n- b påverkar symmetri\n- c är skärning\n\nÖvning: rita tre grafer genom tabell + digitalt verktyg.', 'theory', 1, 40, 'medium', ARRAY['Koppla koefficienter till graf', 'Analysera symmetriaxel'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70102'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020101'::uuid, 'MATMAT02b', 'pq-formeln & kvadratkomplettering', 'Två metoder för rötter.', '## pq-formeln\nx = -p/2 ± √((p/2)^2 - q)\n\n## Kvadratkomplettering\nax^2 + bx + c = a[(x + b/2a)^2 - (b/2a)^2 + c/a]\n\nCase: lös 3x^2 - 9x + 4 = 0 med båda metoder.', 'theory', 2, 50, 'hard', ARRAY['Välja metod', 'Kontrollera rötter'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70103'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020101'::uuid, 'MATMAT02b', 'Optimering med andragrad', 'Tillämpningar i ekonomi.', 'Projekt: maximera area av inhägnad med begränsad stängsellängd. Skapa modell, derivatainspirerad diskussion utan formell derivering.', 'project', 3, 60, 'hard', ARRAY['Modellera praktiskt problem', 'Tolkar toppvärde'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70104'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020101'::uuid, 'MATMAT02b', 'Faktorform & nollproduktregeln', 'Faktorisering och rötter.', 'Övning: faktorisera polynom via gemensam faktor, kvadreringsregler och konjugat. Koppla till grafens nollställen.', 'exercise', 4, 40, 'medium', ARRAY['Faktorisera korrekt', 'Använda nollproduktregeln'], true),

-- Modul 2
('593c3f6d-f7cd-45df-9acf-9540d2e70201'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020102'::uuid, 'MATMAT02b', 'Funktioners förändringstakt', 'Begreppet derivata intuitivt.', '### Genomsnittlig vs momentan förändring\n- Sekant lutning\n- Tangent som gränsvärde\n\nAnvänd video + laboration i Geogebra.', 'theory', 1, 45, 'medium', ARRAY['Skilja mellan lutningar', 'Tolka tangent'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70202'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020102'::uuid, 'MATMAT02b', 'Exponential- & logaritmfunktioner', 'Samband och log-lagar.', '## Definitioner\n- y = a^x\n- log_a y = x\n\nLagar: log(ab) = log a + log b, etc.\nÖvning: lös 3·1.05^t = 8 i två steg via logaritmer.', 'theory', 2, 45, 'medium', ARRAY['Omvandla mellan exponential/log', 'Använda log-lagar'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70203'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020102'::uuid, 'MATMAT02b', 'Funktionsanalys digitalt', 'Nollställen, extrempunkter, skärningar.', 'Laboration i CAS: undersök f(x)= -0.2x^3+0.5x^2+2. Visualisera tabell samt derivative approx.', 'exercise', 3, 50, 'medium', ARRAY['Använda digitala verktyg', 'Sammanställa observationer'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70204'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020102'::uuid, 'MATMAT02b', 'Modeller i samhällskontext', 'Analysera ränta, befolkning, energi.', 'Gruppuppgift: välj dataset, anpassa funktion (linjär/exponential/log). Rapport + muntlig presentation.', 'project', 4, 60, 'hard', ARRAY['Modellera verklig data', 'Kommunicera resultat'], true),

-- Modul 3
('593c3f6d-f7cd-45df-9acf-9540d2e70301'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020103'::uuid, 'MATMAT02b', 'Trigonometri i enhetscirkel', 'Definiera sin, cos, tan med koordinater.', 'Genomgång + hands-on ritande av enhetscirkel. Beräkna trigvärden för 30°,45°,60°.', 'theory', 1, 40, 'medium', ARRAY['Placera vinklar på cirkel', 'Koppla koordinater till trigvärden'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70302'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020103'::uuid, 'MATMAT02b', 'Trigonometriska ekvationer', 'Lös sin x = 0.6 och liknande.', 'Metod: använd grafräknare + tabell. Diskutera perioder och flera lösningar.', 'theory', 2, 45, 'hard', ARRAY['Lösa trigekvationer', 'Motivera flera svar'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70303'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020103'::uuid, 'MATMAT02b', 'Vektorer i planet', 'Addition, skalärprodukt, projektion.', '## Begrepp\n- Vektor som pilar\n- Komponentform\n- Längd |v|\n\nApplicera på vindresultanter.', 'theory', 3, 40, 'medium', ARRAY['Addera vektorer', 'Beräkna skalärprodukt'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70304'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020103'::uuid, 'MATMAT02b', 'Trig-projekt: arkitektur', 'Mät byggnadshöjder via vinklar.', 'Planera fältstudie med inclinometer. Sammanställ tabell, beräkningar, osäkerheter.', 'project', 4, 60, 'hard', ARRAY['Använda trig i verkligheten', 'Redovisa felkällor'], true),

-- Modul 4
('593c3f6d-f7cd-45df-9acf-9540d2e70401'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020104'::uuid, 'MATMAT02b', 'Statistiska modeller & regression', 'Spridningsdiagram, linjär regression.', 'Laboration: importera data, använd kalkylark för trendlinje, tolka R^2.', 'theory', 1, 45, 'medium', ARRAY['Skapa regression', 'Tolkar koefficienter'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70402'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020104'::uuid, 'MATMAT02b', 'Binomialfördelning', 'Sannolikhet vid två utfall.', 'Formel: P(X = k) = C(n,k) p^k (1-p)^{n-k}. Laboration med slumpgenerator + teori.', 'theory', 2, 45, 'hard', ARRAY['Beräkna binomialtal', 'Modellera risk'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70403'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020104'::uuid, 'MATMAT02b', 'Konfidensintervall intro', 'Förstå stickprov kontra population.', 'Simulera stickprov i kalkylark, beräkna 95%-intervall för medelvärde (normalapprox).', 'exercise', 3, 50, 'hard', ARRAY['Tolka konfidensintervall', 'Utföra beräkningar digitalt'], true),
('593c3f6d-f7cd-45df-9acf-9540d2e70404'::uuid, '8bf0a9a0-4b43-4d08-9758-3f6ef9020104'::uuid, 'MATMAT02b', 'Data Story Presentation', 'Avslutande statistikrapport.', 'Innehåll\n- Syfte & metod\n- Modellval\n- Resultat & slutsatser\n- Risk- och felanalys', 'project', 4, 55, 'hard', ARRAY['Presentera statistik', 'Kritiskt värdera resultat'], true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, is_published = EXCLUDED.is_published;
