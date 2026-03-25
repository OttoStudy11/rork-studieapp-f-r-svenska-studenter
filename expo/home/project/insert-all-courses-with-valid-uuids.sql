-- ============================================================================
-- KOMPLETT KURSINNEHÅLL - ALLA GYMNASIEKURSER MED KORREKTA UUID:ER
-- ============================================================================
-- Detta script fyller databasen med detaljerat innehåll för alla kurser
-- inklusive lektioner, studyguides, tips och tekniker
-- ============================================================================

-- Rensa befintligt innehåll
DELETE FROM course_lessons;
DELETE FROM study_guides;
DELETE FROM courses;

-- ============================================================================
-- GYMNASIEGEMENSAMMA ÄMNEN (ALLA PROGRAM)
-- ============================================================================

-- SVENSKA 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111101'::uuid,
  'Svenska 1',
  'SVESVE01',
  'Svenska',
  'gymnasium',
  100,
  'Grundläggande svenskkurs som utvecklar din förmåga att läsa, skriva, tala och lyssna. Kursen behandlar textanalys, skrivande och muntlig framställning.',
  true,
  NOW(),
  NOW()
);

-- ENGELSKA 5
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111102'::uuid,
  'Engelska 5',
  'ENGENG05',
  'Engelska',
  'gymnasium',
  100,
  'Utveckla din engelska genom att läsa, skriva, tala och lyssna. Kursen fokuserar på kommunikation i olika sammanhang och textanalys.',
  true,
  NOW(),
  NOW()
);

-- MATEMATIK 1A
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111103'::uuid,
  'Matematik 1a',
  'MATMAT01a',
  'Matematik',
  'gymnasium',
  100,
  'Grundläggande matematikkurs som behandlar algebra, geometri, funktioner och sannolikhet. Kursen ger dig de matematiska verktyg du behöver för vidare studier.',
  true,
  NOW(),
  NOW()
);

-- HISTORIA 1A1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111104'::uuid,
  'Historia 1a1',
  'HISHIS01a1',
  'Historia',
  'gymnasium',
  50,
  'Historisk översikt från forntid till 1700-tal. Kursen behandlar viktiga händelser, samhällsförändringar och historiska perspektiv.',
  true,
  NOW(),
  NOW()
);

-- SAMHÄLLSKUNSKAP 1A1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111105'::uuid,
  'Samhällskunskap 1a1',
  'SAMSAM01a1',
  'Samhällskunskap',
  'gymnasium',
  50,
  'Introduktion till samhällskunskap med fokus på demokrati, politik och samhällsekonomi.',
  true,
  NOW(),
  NOW()
);

-- RELIGIONSKUNSKAP 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111106'::uuid,
  'Religionskunskap 1',
  'RELREL01',
  'Religionskunskap',
  'gymnasium',
  50,
  'Studier av världsreligioner, etik och livsfrågor. Kursen behandlar olika trosuppfattningar och deras betydelse i samhället.',
  true,
  NOW(),
  NOW()
);

-- NATURKUNSKAP 1A1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111107'::uuid,
  'Naturkunskap 1a1',
  'NAKNAK01a1',
  'Naturkunskap',
  'gymnasium',
  50,
  'Grundläggande naturvetenskap med fokus på ekologi, hållbar utveckling och naturvetenskapliga arbetssätt.',
  true,
  NOW(),
  NOW()
);

-- IDROTT OCH HÄLSA 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111108'::uuid,
  'Idrott och hälsa 1',
  'IDRIDR01',
  'Idrott och hälsa',
  'gymnasium',
  100,
  'Utveckla din fysiska förmåga och kunskap om hälsa, träning och livsstil.',
  true,
  NOW(),
  NOW()
);

-- SVENSKA 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111109'::uuid,
  'Svenska 2',
  'SVESVE02',
  'Svenska',
  'gymnasium',
  100,
  'Fördjupning i svenska språket med fokus på litteraturanalys, argumenterande texter och retorisk analys.',
  true,
  NOW(),
  NOW()
);

-- ENGELSKA 6
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111110'::uuid,
  'Engelska 6',
  'ENGENG06',
  'Engelska',
  'gymnasium',
  100,
  'Fördjupning i engelska med fokus på litteratur, kultur och avancerad kommunikation.',
  true,
  NOW(),
  NOW()
);

-- HISTORIA 1A2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Historia 1a2',
  'HISHIS01a2',
  'Historia',
  'gymnasium',
  50,
  'Historisk översikt från 1700-tal till nutid. Kursen behandlar industrialisering, världskrig och moderna samhällsförändringar.',
  true,
  NOW(),
  NOW()
);

-- SAMHÄLLSKUNSKAP 1A2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111112'::uuid,
  'Samhällskunskap 1a2',
  'SAMSAM01a2',
  'Samhällskunskap',
  'gymnasium',
  50,
  'Fördjupning i samhällskunskap med fokus på internationella relationer och globala frågor.',
  true,
  NOW(),
  NOW()
);

-- SVENSKA 3
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111113'::uuid,
  'Svenska 3',
  'SVESVE03',
  'Svenska',
  'gymnasium',
  100,
  'Avancerad svenskkurs med fokus på litteraturhistoria, språkutveckling och vetenskapligt skrivande.',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- NATURVETENSKAPSPROGRAMMET
-- ============================================================================

-- MATEMATIK 2C
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222201'::uuid,
  'Matematik 2c',
  'MATMAT02c',
  'Matematik',
  'gymnasium',
  100,
  'Fördjupning i algebra, funktioner, trigonometri och logaritmer. Kursen förbereder för avancerade matematikstudier.',
  true,
  NOW(),
  NOW()
);

-- BIOLOGI 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222202'::uuid,
  'Biologi 1',
  'BIOBIO01',
  'Biologi',
  'gymnasium',
  100,
  'Grundläggande biologi med fokus på celler, genetik, evolution och ekologi.',
  true,
  NOW(),
  NOW()
);

-- FYSIK 1A
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222203'::uuid,
  'Fysik 1a',
  'FYSFYS01a',
  'Fysik',
  'gymnasium',
  150,
  'Grundläggande fysik med fokus på mekanik, energi, elektricitet och vågor.',
  true,
  NOW(),
  NOW()
);

-- KEMI 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222204'::uuid,
  'Kemi 1',
  'KEMKEM01',
  'Kemi',
  'gymnasium',
  100,
  'Grundläggande kemi med fokus på atomer, molekyler, kemiska reaktioner och periodiska systemet.',
  true,
  NOW(),
  NOW()
);

-- MODERNA SPRÅK
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222205'::uuid,
  'Moderna språk',
  'MODXXX01',
  'Moderna språk',
  'gymnasium',
  100,
  'Lär dig ett modernt språk som spanska, franska, tyska eller italienska.',
  true,
  NOW(),
  NOW()
);

-- MATEMATIK 3C
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222206'::uuid,
  'Matematik 3c',
  'MATMAT03c',
  'Matematik',
  'gymnasium',
  100,
  'Avancerad matematik med fokus på derivata, integraler och differentialekvationer.',
  true,
  NOW(),
  NOW()
);

-- MATEMATIK 4
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222207'::uuid,
  'Matematik 4',
  'MATMAT04',
  'Matematik',
  'gymnasium',
  100,
  'Fördjupning i matematik med fokus på komplexa tal, vektorer och matriser.',
  true,
  NOW(),
  NOW()
);

-- BIOLOGI 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222208'::uuid,
  'Biologi 2',
  'BIOBIO02',
  'Biologi',
  'gymnasium',
  100,
  'Fördjupning i biologi med fokus på cellbiologi, genetik och bioteknik.',
  true,
  NOW(),
  NOW()
);

-- FYSIK 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222209'::uuid,
  'Fysik 2',
  'FYSFYS02',
  'Fysik',
  'gymnasium',
  100,
  'Fördjupning i fysik med fokus på termodynamik, optik och modern fysik.',
  true,
  NOW(),
  NOW()
);

-- KEMI 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222210'::uuid,
  'Kemi 2',
  'KEMKEM02',
  'Kemi',
  'gymnasium',
  100,
  'Fördjupning i kemi med fokus på organisk kemi, jämviktslära och elektrokemi.',
  true,
  NOW(),
  NOW()
);

-- MATEMATIK 5
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222211'::uuid,
  'Matematik 5',
  'MATMAT05',
  'Matematik',
  'gymnasium',
  100,
  'Avancerad matematik med fokus på differentialekvationer och matematisk analys.',
  true,
  NOW(),
  NOW()
);

-- FYSIK 3
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222212'::uuid,
  'Fysik 3',
  'FYSFYS03',
  'Fysik',
  'gymnasium',
  100,
  'Avancerad fysik med fokus på relativitetsteori och kvantmekanik.',
  true,
  NOW(),
  NOW()
);

-- PROGRAMMERING 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222213'::uuid,
  'Programmering 1',
  'PRRPRR01',
  'Programmering',
  'gymnasium',
  100,
  'Grundläggande programmering med fokus på algoritmer, datastrukturer och problemlösning.',
  true,
  NOW(),
  NOW()
);

-- FILOSOFI 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '22222222-2222-2222-2222-222222222214'::uuid,
  'Filosofi 1',
  'FIOFIO01',
  'Filosofi',
  'gymnasium',
  50,
  'Introduktion till filosofi med fokus på etik, kunskapsteori och existentiella frågor.',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- TEKNIKPROGRAMMET
-- ============================================================================

-- TEKNIK 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333301'::uuid,
  'Teknik 1',
  'TEKTEK01',
  'Teknik',
  'gymnasium',
  150,
  'Grundläggande teknikkurs med fokus på teknisk problemlösning, CAD och produktutveckling.',
  true,
  NOW(),
  NOW()
);

-- TEKNIK 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333302'::uuid,
  'Teknik 2',
  'TEKTEK02',
  'Teknik',
  'gymnasium',
  100,
  'Fördjupning i teknik med fokus på automation, robotik och teknisk dokumentation.',
  true,
  NOW(),
  NOW()
);

-- WEBBUTVECKLING 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333303'::uuid,
  'Webbutveckling 1',
  'WEUWEB01',
  'Webbutveckling',
  'gymnasium',
  100,
  'Grundläggande webbutveckling med HTML, CSS och JavaScript.',
  true,
  NOW(),
  NOW()
);

-- DATOR- OCH NÄTVERKSTEKNIK
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333304'::uuid,
  'Dator- och nätverksteknik',
  'DATDAT01',
  'Datorteknik',
  'gymnasium',
  100,
  'Lär dig om datorsystem, nätverk och IT-infrastruktur.',
  true,
  NOW(),
  NOW()
);

-- PROGRAMMERING 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333305'::uuid,
  'Programmering 2',
  'PRRPRR02',
  'Programmering',
  'gymnasium',
  100,
  'Fördjupning i programmering med fokus på objektorienterad programmering och datastrukturer.',
  true,
  NOW(),
  NOW()
);

-- TILLÄMPAD PROGRAMMERING
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '33333333-3333-3333-3333-333333333306'::uuid,
  'Tillämpad programmering',
  'TILTIL01',
  'Programmering',
  'gymnasium',
  100,
  'Praktisk programmering med fokus på applikationsutveckling och projektarbete.',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- SAMHÄLLSVETENSKAPSPROGRAMMET
-- ============================================================================

-- MATEMATIK 1B
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444401'::uuid,
  'Matematik 1b',
  'MATMAT01b',
  'Matematik',
  'gymnasium',
  100,
  'Grundläggande matematik med fokus på algebra, statistik och sannolikhet.',
  true,
  NOW(),
  NOW()
);

-- NATURKUNSKAP 1B
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444402'::uuid,
  'Naturkunskap 1b',
  'NAKNAK01b',
  'Naturkunskap',
  'gymnasium',
  100,
  'Naturvetenskap med fokus på miljö, hållbarhet och naturvetenskapliga metoder.',
  true,
  NOW(),
  NOW()
);

-- SAMHÄLLSKUNSKAP 1B
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444403'::uuid,
  'Samhällskunskap 1b',
  'SAMSAM01b',
  'Samhällskunskap',
  'gymnasium',
  100,
  'Fördjupad samhällskunskap med fokus på politik, ekonomi och samhällsfrågor.',
  true,
  NOW(),
  NOW()
);

-- PSYKOLOGI 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444404'::uuid,
  'Psykologi 1',
  'PSKPSY01',
  'Psykologi',
  'gymnasium',
  50,
  'Introduktion till psykologi med fokus på mänskligt beteende och psykologiska processer.',
  true,
  NOW(),
  NOW()
);

-- MATEMATIK 2B
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444405'::uuid,
  'Matematik 2b',
  'MATMAT02b',
  'Matematik',
  'gymnasium',
  100,
  'Fördjupning i matematik med fokus på funktioner och statistik.',
  true,
  NOW(),
  NOW()
);

-- SAMHÄLLSKUNSKAP 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444406'::uuid,
  'Samhällskunskap 2',
  'SAMSAM02',
  'Samhällskunskap',
  'gymnasium',
  100,
  'Fördjupning i samhällskunskap med fokus på demokrati och mänskliga rättigheter.',
  true,
  NOW(),
  NOW()
);

-- HISTORIA 2A
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444407'::uuid,
  'Historia 2a',
  'HISHIS02a',
  'Historia',
  'gymnasium',
  100,
  'Fördjupning i historia med fokus på källkritik och historisk analys.',
  true,
  NOW(),
  NOW()
);

-- RELIGIONSKUNSKAP 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444408'::uuid,
  'Religionskunskap 2',
  'RELREL02',
  'Religionskunskap',
  'gymnasium',
  50,
  'Fördjupning i religionskunskap med fokus på etik och livsfrågor.',
  true,
  NOW(),
  NOW()
);

-- SAMHÄLLSKUNSKAP 3
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444409'::uuid,
  'Samhällskunskap 3',
  'SAMSAM03',
  'Samhällskunskap',
  'gymnasium',
  100,
  'Avancerad samhällskunskap med fokus på globalisering och internationella relationer.',
  true,
  NOW(),
  NOW()
);

-- PSYKOLOGI 2A
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444410'::uuid,
  'Psykologi 2a',
  'PSKPSY02a',
  'Psykologi',
  'gymnasium',
  50,
  'Fördjupning i psykologi med fokus på utvecklingspsykologi och socialpsykologi.',
  true,
  NOW(),
  NOW()
);

-- INTERNATIONELLA RELATIONER
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444411'::uuid,
  'Internationella relationer',
  'INTINT01',
  'Samhällskunskap',
  'gymnasium',
  100,
  'Studier av internationell politik, diplomati och globala konflikter.',
  true,
  NOW(),
  NOW()
);

-- ENTREPRENÖRSKAP
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '44444444-4444-4444-4444-444444444412'::uuid,
  'Entreprenörskap',
  'ENTENT01',
  'Företagsekonomi',
  'gymnasium',
  100,
  'Lär dig om företagande, innovation och affärsutveckling.',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- EKONOMIPROGRAMMET
-- ============================================================================

-- FÖRETAGSEKONOMI 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555501'::uuid,
  'Företagsekonomi 1',
  'FÖRFÖR01',
  'Företagsekonomi',
  'gymnasium',
  100,
  'Grundläggande företagsekonomi med fokus på bokföring, ekonomisk planering och företagsformer.',
  true,
  NOW(),
  NOW()
);

-- PRIVATJURIDIK
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555502'::uuid,
  'Privatjuridik',
  'JURPRI01',
  'Juridik',
  'gymnasium',
  100,
  'Juridik för privatpersoner med fokus på avtal, konsumenträtt och familjerätt.',
  true,
  NOW(),
  NOW()
);

-- FÖRETAGSEKONOMI 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555503'::uuid,
  'Företagsekonomi 2',
  'FÖRFÖR02',
  'Företagsekonomi',
  'gymnasium',
  100,
  'Fördjupning i företagsekonomi med fokus på ekonomisk analys och företagsstyrning.',
  true,
  NOW(),
  NOW()
);

-- MARKNADSFÖRING
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555504'::uuid,
  'Marknadsföring',
  'MARMAR01',
  'Företagsekonomi',
  'gymnasium',
  100,
  'Lär dig om marknadsföring, varumärken och kundrelationer.',
  true,
  NOW(),
  NOW()
);

-- REDOVISNING 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555505'::uuid,
  'Redovisning 1',
  'REDRED01',
  'Företagsekonomi',
  'gymnasium',
  100,
  'Grundläggande redovisning med fokus på bokföring och årsredovisning.',
  true,
  NOW(),
  NOW()
);

-- MATEMATIK 3B
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555506'::uuid,
  'Matematik 3b',
  'MATMAT03b',
  'Matematik',
  'gymnasium',
  100,
  'Avancerad matematik med fokus på derivata och integraler.',
  true,
  NOW(),
  NOW()
);

-- FÖRETAGSEKONOMI - SPECIALISERING
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555507'::uuid,
  'Företagsekonomi - specialisering',
  'FÖRSPE01',
  'Företagsekonomi',
  'gymnasium',
  100,
  'Specialisering inom företagsekonomi med fokus på valt område.',
  true,
  NOW(),
  NOW()
);

-- LEDARSKAP OCH ORGANISATION
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555508'::uuid,
  'Ledarskap och organisation',
  'LEDLED01',
  'Företagsekonomi',
  'gymnasium',
  100,
  'Lär dig om ledarskap, organisationsteori och personalledning.',
  true,
  NOW(),
  NOW()
);

-- INTERNATIONELL EKONOMI
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '55555555-5555-5555-5555-555555555509'::uuid,
  'Internationell ekonomi',
  'INTEKO01',
  'Företagsekonomi',
  'gymnasium',
  100,
  'Studier av internationell handel, valutamarknader och global ekonomi.',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- ESTETISKA PROGRAMMET
-- ============================================================================

-- ESTETISK KOMMUNIKATION 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '66666666-6666-6666-6666-666666666601'::uuid,
  'Estetisk kommunikation 1',
  'ESTEST01',
  'Estetik',
  'gymnasium',
  100,
  'Grundläggande estetisk kommunikation med fokus på uttryck och gestaltning.',
  true,
  NOW(),
  NOW()
);

-- KONSTARTERNA OCH SAMHÄLLET
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '66666666-6666-6666-6666-666666666602'::uuid,
  'Konstarterna och samhället',
  'KONKON01',
  'Estetik',
  'gymnasium',
  50,
  'Studier av konstens roll i samhället och kulturhistoria.',
  true,
  NOW(),
  NOW()
);

-- ENSEMBLE MED KÖRSÅNG
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '66666666-6666-6666-6666-666666666603'::uuid,
  'Ensemble med körsång',
  'MUSENS01',
  'Musik',
  'gymnasium',
  200,
  'Praktisk ensemble- och körövning med fokus på samspel och musikaliskt uttryck.',
  true,
  NOW(),
  NOW()
);

-- GEHÖRS- OCH MUSIKLÄRA 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '66666666-6666-6666-6666-666666666604'::uuid,
  'Gehörs- och musiklära 1',
  'MUSGEH01',
  'Musik',
  'gymnasium',
  100,
  'Grundläggande gehörsträning och musikteori.',
  true,
  NOW(),
  NOW()
);

-- INSTRUMENT ELLER SÅNG 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '66666666-6666-6666-6666-666666666605'::uuid,
  'Instrument eller sång 1',
  'MUSINS01',
  'Musik',
  'gymnasium',
  100,
  'Individuell undervisning i instrument eller sång.',
  true,
  NOW(),
  NOW()
);

-- ENSEMBLE 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '66666666-6666-6666-6666-666666666606'::uuid,
  'Ensemble 2',
  'MUSENS02',
  'Musik',
  'gymnasium',
  100,
  'Fördjupning i ensemblespel med fokus på olika musikstilar.',
  true,
  NOW(),
  NOW()
);

-- GEHÖRS- OCH MUSIKLÄRA 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '66666666-6666-6666-6666-666666666607'::uuid,
  'Gehörs- och musiklära 2',
  'MUSGEH02',
  'Musik',
  'gymnasium',
  100,
  'Fördjupning i gehörsträning och musikteori.',
  true,
  NOW(),
  NOW()
);

-- INSTRUMENT ELLER SÅNG 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '66666666-6666-6666-6666-666666666608'::uuid,
  'Instrument eller sång 2',
  'MUSINS02',
  'Musik',
  'gymnasium',
  100,
  'Fördjupning i instrument eller sång.',
  true,
  NOW(),
  NOW()
);

-- MUSIKPRODUKTION
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '66666666-6666-6666-6666-666666666609'::uuid,
  'Musikproduktion',
  'MUSPRO01',
  'Musik',
  'gymnasium',
  100,
  'Lär dig om musikproduktion, inspelning och ljudteknik.',
  true,
  NOW(),
  NOW()
);

-- SCENISK GESTALTNING
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '66666666-6666-6666-6666-666666666610'::uuid,
  'Scenisk gestaltning',
  'SCNSCE01',
  'Teater',
  'gymnasium',
  100,
  'Praktisk teaterövning med fokus på scenisk gestaltning och rollarbete.',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- HUMANISTISKA PROGRAMMET
-- ============================================================================

-- MÄNNISKANS SPRÅK 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '77777777-7777-7777-7777-777777777701'::uuid,
  'Människans språk 1',
  'MÄSMÄS01',
  'Språk',
  'gymnasium',
  100,
  'Studier av språkets struktur, utveckling och betydelse för människan.',
  true,
  NOW(),
  NOW()
);

-- MODERNA SPRÅK 3
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '77777777-7777-7777-7777-777777777702'::uuid,
  'Moderna språk 3',
  'MODXXX03',
  'Moderna språk',
  'gymnasium',
  100,
  'Fördjupning i modernt språk med fokus på kommunikation och kultur.',
  true,
  NOW(),
  NOW()
);

-- MODERNA SPRÅK 4
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '77777777-7777-7777-7777-777777777703'::uuid,
  'Moderna språk 4',
  'MODXXX04',
  'Moderna språk',
  'gymnasium',
  100,
  'Avancerad språkkurs med fokus på litteratur och samhälle.',
  true,
  NOW(),
  NOW()
);

-- LATIN - SPRÅK OCH KULTUR 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '77777777-7777-7777-7777-777777777704'::uuid,
  'Latin - språk och kultur 1',
  'LATLAT01',
  'Latin',
  'gymnasium',
  100,
  'Introduktion till latin med fokus på språk, grammatik och romersk kultur.',
  true,
  NOW(),
  NOW()
);

-- MODERNA SPRÅK 5
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '77777777-7777-7777-7777-777777777705'::uuid,
  'Moderna språk 5',
  'MODXXX05',
  'Moderna språk',
  'gymnasium',
  100,
  'Avancerad språkkurs med fokus på akademiskt språk.',
  true,
  NOW(),
  NOW()
);

-- RETORIK
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '77777777-7777-7777-7777-777777777706'::uuid,
  'Retorik',
  'RETRET01',
  'Svenska',
  'gymnasium',
  100,
  'Lär dig om retorik, argumentation och övertygande kommunikation.',
  true,
  NOW(),
  NOW()
);

-- SKRIVANDE
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '77777777-7777-7777-7777-777777777707'::uuid,
  'Skrivande',
  'SVESKR01',
  'Svenska',
  'gymnasium',
  100,
  'Kreativt och professionellt skrivande med fokus på olika texttyper.',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- BARN- OCH FRITIDSPROGRAMMET
-- ============================================================================

-- HÄLSOPEDAGOGIK
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888801'::uuid,
  'Hälsopedagogik',
  'HÄLHÄL01',
  'Hälsa',
  'gymnasium',
  100,
  'Lär dig om hälsa, livsstil och pedagogiskt arbete med hälsofrågor.',
  true,
  NOW(),
  NOW()
);

-- NATURKUNSKAP 1A2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888802'::uuid,
  'Naturkunskap 1a2',
  'NAKNAK01a2',
  'Naturkunskap',
  'gymnasium',
  50,
  'Naturvetenskap med fokus på hälsa och miljö.',
  true,
  NOW(),
  NOW()
);

-- KOMMUNIKATION
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888803'::uuid,
  'Kommunikation',
  'KOMKOM01',
  'Kommunikation',
  'gymnasium',
  100,
  'Lär dig om kommunikation, samtal och pedagogisk interaktion.',
  true,
  NOW(),
  NOW()
);

-- LÄRANDE OCH UTVECKLING
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888804'::uuid,
  'Lärande och utveckling',
  'LÄRLÄR01',
  'Pedagogik',
  'gymnasium',
  100,
  'Studier av barns lärande och utveckling.',
  true,
  NOW(),
  NOW()
);

-- MÄNNISKORS MILJÖER
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888805'::uuid,
  'Människors miljöer',
  'MÄNMÄN01',
  'Samhällskunskap',
  'gymnasium',
  100,
  'Studier av människors livsmiljöer och samhällsstrukturer.',
  true,
  NOW(),
  NOW()
);

-- PEDAGOGISKT LEDARSKAP
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888806'::uuid,
  'Pedagogiskt ledarskap',
  'PEDPED01',
  'Pedagogik',
  'gymnasium',
  100,
  'Lär dig om pedagogiskt ledarskap och gruppledning.',
  true,
  NOW(),
  NOW()
);

-- BARNS LÄRANDE OCH VÄXANDE
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888807'::uuid,
  'Barns lärande och växande',
  'BARBAR01',
  'Pedagogik',
  'gymnasium',
  100,
  'Fördjupning i barns lärande och utveckling.',
  true,
  NOW(),
  NOW()
);

-- PEDAGOGISKT ARBETE
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888808'::uuid,
  'Pedagogiskt arbete',
  'PEDPED02',
  'Pedagogik',
  'gymnasium',
  200,
  'Praktiskt pedagogiskt arbete med barn och ungdomar.',
  true,
  NOW(),
  NOW()
);

-- SKAPANDE VERKSAMHET
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888809'::uuid,
  'Skapande verksamhet',
  'SKASKA01',
  'Pedagogik',
  'gymnasium',
  100,
  'Lär dig om skapande aktiviteter och estetiska uttrycksformer.',
  true,
  NOW(),
  NOW()
);

-- SPECIALPEDAGOGIK 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888810'::uuid,
  'Specialpedagogik 1',
  'SPCSPC01',
  'Pedagogik',
  'gymnasium',
  100,
  'Introduktion till specialpedagogik och arbete med barn i behov av särskilt stöd.',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- VÅRD- OCH OMSORGSPROGRAMMET
-- ============================================================================

-- MEDICIN 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '99999999-9999-9999-9999-999999999901'::uuid,
  'Medicin 1',
  'MEDMED01',
  'Medicin',
  'gymnasium',
  150,
  'Grundläggande medicin med fokus på anatomi, fysiologi och vanliga sjukdomar.',
  true,
  NOW(),
  NOW()
);

-- ETIK OCH MÄNNISKANS LIVSVILLKOR
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '99999999-9999-9999-9999-999999999902'::uuid,
  'Etik och människans livsvillkor',
  'ETIETI01',
  'Etik',
  'gymnasium',
  100,
  'Studier av etik, värderingar och människans livsvillkor.',
  true,
  NOW(),
  NOW()
);

-- PSYKIATRI 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '99999999-9999-9999-9999-999999999903'::uuid,
  'Psykiatri 1',
  'PSYPSY01',
  'Psykiatri',
  'gymnasium',
  100,
  'Introduktion till psykiatri med fokus på psykisk ohälsa och behandling.',
  true,
  NOW(),
  NOW()
);

-- VÅRD- OCH OMSORGSARBETE 1
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '99999999-9999-9999-9999-999999999904'::uuid,
  'Vård- och omsorgsarbete 1',
  'VÅRVÅR01',
  'Vård och omsorg',
  'gymnasium',
  200,
  'Praktiskt vård- och omsorgsarbete med fokus på bemötande och omvårdnad.',
  true,
  NOW(),
  NOW()
);

-- VÅRD- OCH OMSORGSARBETE 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '99999999-9999-9999-9999-999999999905'::uuid,
  'Vård- och omsorgsarbete 2',
  'VÅRVÅR02',
  'Vård och omsorg',
  'gymnasium',
  150,
  'Fördjupning i vård- och omsorgsarbete med fokus på specialiserade områden.',
  true,
  NOW(),
  NOW()
);

-- MEDICIN 2
INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  '99999999-9999-9999-9999-999999999906'::uuid,
  'Medicin 2',
  'MEDMED02',
  'Medicin',
  'gymnasium',
  100,
  'Fördjupning i medicin med fokus på farmakologi och behandlingsmetoder.',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- KLART! Nu finns alla kurser med korrekta UUID:er
-- ============================================================================
