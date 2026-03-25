-- ============================================================
-- COURSE CONTENT: RELREL01 (Religionskunskap 1)
-- ============================================================

INSERT INTO courses (id, course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
VALUES (
  'RELREL01',
  'RELREL01',
  'Religionskunskap 1',
  'Introduktion till världsreligioner, livsåskådningar och etik med fokus på analys och samtal.',
  'Religionskunskap',
  'gymnasie',
  50,
  '["Religionsatlas", "Intervjupoddar", "Textkompendium", "Padlet"]'::jsonb,
  '["Var nyfiken och respektfull", "Koppla religion till samhälle", "Ställ öppna frågor"]'::jsonb,
  '["RELREL02", "SAMSAM01b", "FILFIL01"]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, points = EXCLUDED.points;

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
VALUES
  ('4f6c9b92-45c0-4f5b-8d6e-2e2c01010101'::uuid, 'RELREL01', 'Modul 1: Religionsbegreppet', 'Grundbegrepp, sekularisering, religionsfrihet.', 1, 6, true),
  ('4f6c9b92-45c0-4f5b-8d6e-2e2c01010102'::uuid, 'RELREL01', 'Modul 2: Världsreligioner', 'Judendom, kristendom, islam, hinduism, buddhism.', 2, 12, true),
  ('4f6c9b92-45c0-4f5b-8d6e-2e2c01010103'::uuid, 'RELREL01', 'Modul 3: Livsåskådningar & sekulära perspektiv', 'Humanism, existentialism, nyandlighet.', 3, 7, true),
  ('4f6c9b92-45c0-4f5b-8d6e-2e2c01010104'::uuid, 'RELREL01', 'Modul 4: Etik i praktik', 'Etiska modeller och dilemman.', 4, 7, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, is_published = EXCLUDED.is_published;

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published)
VALUES
-- Modul 1
('bc1c98f4-1974-4a91-82cd-70f101010101'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010101'::uuid, 'RELREL01', 'Vad är religion?', 'Definitioner och funktioner.', 'Genomgång + exit ticket. Begrepp: tro, riter, myter, gemenskap.', 'theory', 1, 35, 'easy', ARRAY['Definiera religion', 'Resonera om funktioner'], true),
('bc1c98f4-1974-4a91-82cd-70f101010102'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010101'::uuid, 'RELREL01', 'Sekularisering & pluralism', 'Utveckling i Sverige och världen.', 'Analys av statistik, diskussion om religion i offentligheten.', 'theory', 2, 40, 'medium', ARRAY['Beskriva sekularisering', 'Analysera pluralism'], true),
('bc1c98f4-1974-4a91-82cd-70f101010103'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010101'::uuid, 'RELREL01', 'Religionsfrihet i praktiken', 'Rättigheter och begränsningar.', 'Case: klädsel i skola, religiösa symboler. Debatt med källstöd.', 'exercise', 3, 45, 'medium', ARRAY['Tillämpa MR-perspektiv', 'Argumentera respektfullt'], true),

-- Modul 2
('bc1c98f4-1974-4a91-82cd-70f101010201'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010102'::uuid, 'RELREL01', 'Abrahamitiska religioner', 'Likheter/skillnader.', 'Stationsarbete: text, rit, symboler. Sammanställ jämförelsetabell.', 'exercise', 1, 50, 'medium', ARRAY['Känna till centrala drag', 'Jämföra religioner'], true),
('bc1c98f4-1974-4a91-82cd-70f101010202'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010102'::uuid, 'RELREL01', 'Hinduismens mångfald', 'Gudar, skrifter, livsmål.', 'Genomgång + filmklipp. Skriftlig reflektion: dharma & karma.', 'theory', 2, 40, 'medium', ARRAY['Beskriva hinduismens mångfald', 'Använda centrala begrepp'], true),
('bc1c98f4-1974-4a91-82cd-70f101010203'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010102'::uuid, 'RELREL01', 'Buddhismens vägar', 'Fyra ädla sanningar, åttafaldiga vägen.', 'Meditativ övning + loggbok om lidande/balans.', 'exercise', 3, 35, 'easy', ARRAY['Förklara centrala läror', 'Reflektera personligt'], true),
('bc1c98f4-1974-4a91-82cd-70f101010204'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010102'::uuid, 'RELREL01', 'Fältstudie: religionsmöten', 'Intervju eller digitalt studiebesök.', 'Planera frågor, genomför intervju, skriv rapport.', 'project', 4, 55, 'hard', ARRAY['Undersöka levd religion', 'Dokumentera etiskt korrekt'], true),

-- Modul 3
('bc1c98f4-1974-4a91-82cd-70f101010301'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010103'::uuid, 'RELREL01', 'Livsåskådningar utan gudstro', 'Humanism, existentialism.', 'Think-pair-share om meningen med livet.', 'theory', 1, 35, 'medium', ARRAY['Definiera livsåskådning', 'Resonera om mening'], true),
('bc1c98f4-1974-4a91-82cd-70f101010302'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010103'::uuid, 'RELREL01', 'Nyandlighet & individ', 'Meditation, kristaller, nätgemenskaper.', 'Analys av artiklar, skapa korta presentationer.', 'exercise', 2, 40, 'medium', ARRAY['Identifiera nyandliga drag', 'Kritiskt granska källor'], true),
('bc1c98f4-1974-4a91-82cd-70f101010303'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010103'::uuid, 'RELREL01', 'Livsåskådningsuppsats', 'Skriv jämförande text.', 'Struktur: introduktion, jämförelse, personlig reflektion. 800 ord.', 'project', 3, 55, 'hard', ARRAY['Jämföra perspektiv', 'Skriva resonemangstext'], true),

-- Modul 4
('bc1c98f4-1974-4a91-82cd-70f101010401'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010104'::uuid, 'RELREL01', 'Etiska modeller', 'Plikt, konsekvens, dygd.', 'Föreläsning + miniövningar.', 'theory', 1, 35, 'medium', ARRAY['Skilja modellerna', 'Tillämpa begrepp'], true),
('bc1c98f4-1974-4a91-82cd-70f101010402'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010104'::uuid, 'RELREL01', 'Etiska dilemman', 'Gruppdiskussioner med modeller.', 'Case: AI i vården, klimatflyg, gåvor. Elever argumenterar med etisk modell.', 'exercise', 2, 40, 'medium', ARRAY['Argumentera etiskt', 'Knyta teori till praktik'], true),
('bc1c98f4-1974-4a91-82cd-70f101010403'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010104'::uuid, 'RELREL01', 'Etikprojekt – podcast', 'Skapa samtal med case.', 'Planera manus med tydliga modeller. Spela in 8-min podd, publicera i klassbibliotek.', 'project', 3, 55, 'hard', ARRAY['Kommunicera etik', 'Samarbeta kreativt'], true),
('bc1c98f4-1974-4a91-82cd-70f101010404'::uuid, '4f6c9b92-45c0-4f5b-8d6e-2e2c01010104'::uuid, 'RELREL01', 'Självreflektion & exit portfolio', 'Sammanfatta lärdomar.', 'Elev skriver reflektionsbrev + väljer tre artefakter från kursen.', 'project', 4, 35, 'easy', ARRAY['Reflektera över lärande', 'Koppla samman kursens delar'], true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, is_published = EXCLUDED.is_published;
