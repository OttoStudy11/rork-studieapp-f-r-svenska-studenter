-- =====================================================
-- POPULATE ALL UNIVERSITY AND COLLEGE COURSES
-- =====================================================
-- Skapar alla kurser för högskole- och universitetsprogram
-- Motsvarande gymnasiesystemet men för högskola
-- =====================================================

BEGIN;

-- =====================================================
-- TEKNISKA KURSER - CIVILINGENJÖR & HÖGSKOLEINGENJÖR
-- =====================================================

-- Grundläggande tekniska kurser (för alla tekniska program)
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'SF1624', 'Algebra och geometri', 'Grundläggande algebra och geometri för ingenjörer', 7.5, 'grundnivå', 'Matematik', ARRAY[]::TEXT[], ARRAY['Behärska linjär algebra', 'Förstå geometriska koncept', 'Lösa matematiska problem']),
  (gen_random_uuid(), 'SF1625', 'Envariabelanalys', 'Matematik med en variabel', 7.5, 'grundnivå', 'Matematik', ARRAY[]::TEXT[], ARRAY['Differentiera och integrera', 'Lösa differentialekvationer', 'Använda matematik i tekniska problem']),
  (gen_random_uuid(), 'SF1626', 'Flervariabelanalys', 'Matematik med flera variabler', 7.5, 'grundnivå', 'Matematik', ARRAY['SF1625']::TEXT[], ARRAY['Behärska flervariabelkalkyl', 'Förstå partiella derivator', 'Lösa komplexa problem']),
  (gen_random_uuid(), 'SF1627', 'Transformer och komplex analys', 'Avancerad matematisk analys', 7.5, 'grundnivå', 'Matematik', ARRAY['SF1626']::TEXT[], ARRAY['Använda Fourier- och Laplace-transformer', 'Förstå komplex analys']),
  (gen_random_uuid(), 'SF1901', 'Sannolikhetsteori och statistik', 'Grundläggande statistik för ingenjörer', 6, 'grundnivå', 'Matematik', ARRAY[]::TEXT[], ARRAY['Beräkna sannolikheter', 'Analysera statistiska data', 'Tillämpa statistiska metoder']),
  (gen_random_uuid(), 'SI1142', 'Hållfasthetslära', 'Mekanik och materialegenskaper', 7.5, 'grundnivå', 'Maskinteknik', ARRAY[]::TEXT[], ARRAY['Förstå mekanik', 'Analysera strukturer', 'Beräkna belastningar']),
  (gen_random_uuid(), 'SK1118', 'Ellära', 'Grundläggande elektroteknik', 7.5, 'grundnivå', 'Elektroteknik', ARRAY[]::TEXT[], ARRAY['Förstå el-teori', 'Analysera kretsar', 'Mäta elektriska storheter']),
  (gen_random_uuid(), 'DD1331', 'Grundläggande programmering', 'Introduktion till programmering', 7.5, 'grundnivå', 'Datavetenskap', ARRAY[]::TEXT[], ARRAY['Programmera i Python/Java', 'Förstå algoritmer', 'Lösa problem med kod']);

-- Datateknik-specifika kurser
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'DD1337', 'Programmering', 'Objektorienterad programmering', 7.5, 'grundnivå', 'Datavetenskap', ARRAY['DD1331']::TEXT[], ARRAY['Behärska OOP', 'Designa program', 'Arbeta med datastrukturer']),
  (gen_random_uuid(), 'DD1338', 'Algoritmer och datastrukturer', 'Grundläggande datastrukturer och algoritmer', 7.5, 'grundnivå', 'Datavetenskap', ARRAY['DD1337']::TEXT[], ARRAY['Implementera datastrukturer', 'Analysera algoritmkomplexitet', 'Optimera kod']),
  (gen_random_uuid(), 'DD1396', 'Parallellprogrammering', 'Parallella och distribuerade system', 6, 'grundnivå', 'Datavetenskap', ARRAY['DD1338']::TEXT[], ARRAY['Programmera parallella system', 'Förstå samtidighet', 'Optimera prestanda']),
  (gen_random_uuid(), 'DD2350', 'Algoritmer, datastrukturer och komplexitet', 'Avancerade algoritmer', 7.5, 'avancerad nivå', 'Datavetenskap', ARRAY['DD1338']::TEXT[], ARRAY['Behärska avancerade algoritmer', 'Analysera komplexitet', 'Designa effektiva lösningar']),
  (gen_random_uuid(), 'DD2372', 'Databaser', 'Databassystem och SQL', 7.5, 'grundnivå', 'Datavetenskap', ARRAY['DD1337']::TEXT[], ARRAY['Designa databaser', 'Skriva SQL-frågor', 'Optimera databasdesign']),
  (gen_random_uuid(), 'DD2380', 'Artificiell intelligens', 'Introduktion till AI och maskininlärning', 6, 'avancerad nivå', 'Datavetenskap', ARRAY['DD1338', 'SF1901']::TEXT[], ARRAY['Förstå AI-koncept', 'Implementera ML-algoritmer', 'Utvärdera modeller']),
  (gen_random_uuid(), 'DD2458', 'Problemlösning och programmering under press', 'Tävlingsprogrammering', 7.5, 'avancerad nivå', 'Datavetenskap', ARRAY['DD1338']::TEXT[], ARRAY['Lösa komplexa problem snabbt', 'Implementera effektiva algoritmer', 'Tävla i programmering']),
  (gen_random_uuid(), 'DD1368', 'Databasteknik', 'Avancerad databasteknik', 7.5, 'grundnivå', 'Datavetenskap', ARRAY['DD2372']::TEXT[], ARRAY['Optimera databaser', 'Förstå transaktioner', 'Implementera databaslösningar']);

-- Elektroteknik-specifika kurser
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'IE1204', 'Digital design', 'Digitala kretsar och system', 6, 'grundnivå', 'Elektroteknik', ARRAY['SK1118']::TEXT[], ARRAY['Designa digitala kretsar', 'Förstå logikkretsar', 'Implementera digitala system']),
  (gen_random_uuid(), 'IE1206', 'Elektronik', 'Analog och digital elektronik', 7.5, 'grundnivå', 'Elektroteknik', ARRAY['SK1118']::TEXT[], ARRAY['Analysera elektroniska kretsar', 'Designa förstärkare', 'Arbeta med komponenter']),
  (gen_random_uuid(), 'IE1332', 'Signaler och system', 'Signalbehandling och systemteori', 7.5, 'grundnivå', 'Elektroteknik', ARRAY['SF1627']::TEXT[], ARRAY['Analysera signaler', 'Designa filter', 'Förstå systemegenskaper']),
  (gen_random_uuid(), 'IE2450', 'Radiosystem', 'Trådlös kommunikation', 7.5, 'avancerad nivå', 'Elektroteknik', ARRAY['IE1332']::TEXT[], ARRAY['Förstå radioteknik', 'Designa trådlösa system', 'Analysera kommunikationssystem']),
  (gen_random_uuid(), 'IE1304', 'Elkraftteknik', 'Elkraftsgenerering och distribution', 7.5, 'grundnivå', 'Elektroteknik', ARRAY['SK1118']::TEXT[], ARRAY['Förstå elkraftsystem', 'Beräkna effekter', 'Analysera elnät']);

-- Maskinteknik-specifika kurser
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'MF1016', 'Termodynamik', 'Grundläggande termodynamik', 7.5, 'grundnivå', 'Maskinteknik', ARRAY[]::TEXT[], ARRAY['Förstå termodynamiska lagar', 'Beräkna värmeöverföring', 'Analysera energisystem']),
  (gen_random_uuid(), 'MF1017', 'Strömningslära', 'Fluid- och strömningsmekanik', 7.5, 'grundnivå', 'Maskinteknik', ARRAY['MF1016']::TEXT[], ARRAY['Förstå fluidmekanik', 'Beräkna tryck och flöden', 'Analysera strömningar']),
  (gen_random_uuid(), 'MF1083', 'Fordonsdynamik', 'Dynamik för fordon', 7.5, 'grundnivå', 'Maskinteknik', ARRAY['SI1142']::TEXT[], ARRAY['Analysera fordonsdynamik', 'Beräkna rörelser', 'Förstå styrning och bromsning']),
  (gen_random_uuid(), 'ME2063', 'Konstruktionsmaterial', 'Materialteknik för konstruktion', 6, 'avancerad nivå', 'Maskinteknik', ARRAY['SI1142']::TEXT[], ARRAY['Välja material', 'Förstå materialegenskaper', 'Analysera hållfasthet']),
  (gen_random_uuid(), 'MG1033', 'Produktionsteknik', 'Tillverkningsmetoder', 7.5, 'grundnivå', 'Maskinteknik', ARRAY[]::TEXT[], ARRAY['Förstå tillverkning', 'Välja produktionsmetoder', 'Optimera processer']);

-- =====================================================
-- MEDICINSKA KURSER
-- =====================================================

INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'MED101', 'Medicinsk terminologi', 'Grundläggande medicinsk terminologi', 5, 'grundnivå', 'Medicin', ARRAY[]::TEXT[], ARRAY['Förstå medicinsk terminologi', 'Kommunicera medicinskt', 'Använda facktermer korrekt']),
  (gen_random_uuid(), 'MED102', 'Anatomi och fysiologi I', 'Människokroppens uppbyggnad och funktion', 15, 'grundnivå', 'Medicin', ARRAY[]::TEXT[], ARRAY['Förstå anatomi', 'Beskriva organ och system', 'Förklara fysiologiska processer']),
  (gen_random_uuid(), 'MED103', 'Anatomi och fysiologi II', 'Fördjupad anatomi och fysiologi', 15, 'grundnivå', 'Medicin', ARRAY['MED102']::TEXT[], ARRAY['Fördjupa anatomiska kunskaper', 'Förstå komplex fysiologi', 'Integrera kunskap']),
  (gen_random_uuid(), 'MED201', 'Patologi', 'Sjukdomslära', 10, 'grundnivå', 'Medicin', ARRAY['MED103']::TEXT[], ARRAY['Förstå sjukdomsprocesser', 'Identifiera symtom', 'Klassificera sjukdomar']),
  (gen_random_uuid(), 'MED202', 'Farmakologi', 'Läkemedelsvetenskap', 10, 'grundnivå', 'Medicin', ARRAY['MED103']::TEXT[], ARRAY['Förstå läkemedelsverkan', 'Beräkna doser', 'Identifiera biverkningar']),
  (gen_random_uuid(), 'MED301', 'Kirurgi', 'Grundläggande kirurgisk teknik', 15, 'avancerad nivå', 'Medicin', ARRAY['MED201', 'MED202']::TEXT[], ARRAY['Utföra kirurgiska ingrepp', 'Förstå kirurgisk teknik', 'Hantera patienter perioperativt']),
  (gen_random_uuid(), 'MED302', 'Internmedicin', 'Diagnostik och behandling av interna sjukdomar', 15, 'avancerad nivå', 'Medicin', ARRAY['MED201', 'MED202']::TEXT[], ARRAY['Diagnostisera sjukdomar', 'Planera behandling', 'Följa upp patienter']),
  (gen_random_uuid(), 'MED303', 'Pediatrik', 'Barnmedicin', 10, 'avancerad nivå', 'Medicin', ARRAY['MED201', 'MED202']::TEXT[], ARRAY['Behandla barn', 'Förstå utveckling', 'Kommunicera med barn och föräldrar']),
  (gen_random_uuid(), 'MED304', 'Psykiatri', 'Psykisk hälsa och sjukdom', 10, 'avancerad nivå', 'Medicin', ARRAY['MED201']::TEXT[], ARRAY['Diagnostisera psykiska störningar', 'Behandla psykisk ohälsa', 'Förstå psykiatrin']),
  (gen_random_uuid(), 'MED305', 'Kvinnosjukdomar och förlossning', 'Gynekologi och obstetrik', 10, 'avancerad nivå', 'Medicin', ARRAY['MED201', 'MED202']::TEXT[], ARRAY['Hantera graviditet och förlossning', 'Behandla gynekologiska problem', 'Stödja blivande mödrar']);

-- Omvårdnad (Sjuksköterska)
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'OMV101', 'Omvårdnad - grunder', 'Grundläggande omvårdnad', 15, 'grundnivå', 'Omvårdnad', ARRAY[]::TEXT[], ARRAY['Utföra grundläggande omvårdnad', 'Kommunicera med patienter', 'Arbeta säkert']),
  (gen_random_uuid(), 'OMV102', 'Farmakologi för sjuksköterskor', 'Läkemedelshantering i omvårdnad', 7.5, 'grundnivå', 'Omvårdnad', ARRAY[]::TEXT[], ARRAY['Hantera läkemedel säkert', 'Administrera mediciner', 'Förstå läkemedelseffekter']),
  (gen_random_uuid(), 'OMV201', 'Klinisk omvårdnad', 'Omvårdnad i klinisk miljö', 15, 'grundnivå', 'Omvårdnad', ARRAY['OMV101']::TEXT[], ARRAY['Vårda patienter kliniskt', 'Arbeta i team', 'Dokumentera omvårdnad']),
  (gen_random_uuid(), 'OMV202', 'Akut omvårdnad', 'Omvårdnad i akuta situationer', 10, 'grundnivå', 'Omvårdnad', ARRAY['OMV201']::TEXT[], ARRAY['Hantera akuta situationer', 'Prioritera vård', 'Arbeta under press']),
  (gen_random_uuid(), 'OMV301', 'Palliativ vård', 'Vård i livets slutskede', 7.5, 'avancerad nivå', 'Omvårdnad', ARRAY['OMV201']::TEXT[], ARRAY['Ge palliativ vård', 'Stödja patienter och anhöriga', 'Arbeta existentiellt']);

-- =====================================================
-- NATURVETENSKAP - BIOLOGI, KEMI, FYSIK
-- =====================================================

-- Biologi
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'BIO101', 'Allmän biologi I', 'Cellbiologi och genetik', 15, 'grundnivå', 'Biologi', ARRAY[]::TEXT[], ARRAY['Förstå cellens uppbyggnad', 'Förklara genetiska principer', 'Beskriva biologiska processer']),
  (gen_random_uuid(), 'BIO102', 'Allmän biologi II', 'Ekologi och evolution', 15, 'grundnivå', 'Biologi', ARRAY['BIO101']::TEXT[], ARRAY['Förstå ekologiska system', 'Förklara evolution', 'Analysera populationer']),
  (gen_random_uuid(), 'BIO201', 'Molekylärbiologi', 'Molekylära processer i cellen', 15, 'grundnivå', 'Biologi', ARRAY['BIO101']::TEXT[], ARRAY['Förstå molekylärbiologi', 'Arbeta med DNA och RNA', 'Analysera gener']),
  (gen_random_uuid(), 'BIO202', 'Mikrobiologi', 'Mikroorganismers biologi', 15, 'grundnivå', 'Biologi', ARRAY['BIO101']::TEXT[], ARRAY['Odla mikroorganismer', 'Identifiera bakterier', 'Förstå mikrobiell ekologi']),
  (gen_random_uuid(), 'BIO301', 'Immunologi', 'Immunsystemets funktion', 15, 'avancerad nivå', 'Biologi', ARRAY['BIO201']::TEXT[], ARRAY['Förklara immunsvar', 'Förstå autoimmuna sjukdomar', 'Analysera immunologiska processer']);

-- Kemi
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'KEM101', 'Allmän kemi', 'Grundläggande kemi', 15, 'grundnivå', 'Kemi', ARRAY[]::TEXT[], ARRAY['Förstå kemiska reaktioner', 'Beräkna molmassor', 'Arbeta i labb']),
  (gen_random_uuid(), 'KEM201', 'Organisk kemi I', 'Grundläggande organisk kemi', 15, 'grundnivå', 'Kemi', ARRAY['KEM101']::TEXT[], ARRAY['Förstå organiska föreningar', 'Syntetisera molekyler', 'Analysera strukturer']),
  (gen_random_uuid(), 'KEM202', 'Fysikalisk kemi', 'Kemins fysikaliska principer', 15, 'grundnivå', 'Kemi', ARRAY['KEM101']::TEXT[], ARRAY['Förstå termodynamik', 'Beräkna reaktionskinetik', 'Analysera elektrokemi']),
  (gen_random_uuid(), 'KEM301', 'Analytisk kemi', 'Kemisk analys och instrumentering', 15, 'avancerad nivå', 'Kemi', ARRAY['KEM202']::TEXT[], ARRAY['Utföra kemisk analys', 'Använda analytiska instrument', 'Tolka spektra']);

-- Fysik
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'FYS101', 'Mekanik', 'Klassisk mekanik', 15, 'grundnivå', 'Fysik', ARRAY[]::TEXT[], ARRAY['Förstå Newtons lagar', 'Beräkna rörelser', 'Analysera dynamik']),
  (gen_random_uuid(), 'FYS102', 'Elektromagnetism', 'Elektricitet och magnetism', 15, 'grundnivå', 'Fysik', ARRAY['FYS101']::TEXT[], ARRAY['Förstå elektromagnetiska fält', 'Beräkna elektriska kretsar', 'Analysera vågor']),
  (gen_random_uuid(), 'FYS201', 'Kvantmekanik', 'Grundläggande kvantmekanik', 15, 'grundnivå', 'Fysik', ARRAY['FYS102']::TEXT[], ARRAY['Förstå kvantmekaniska principer', 'Lösa Schrödingerekvationen', 'Analysera atomsystem']),
  (gen_random_uuid(), 'FYS202', 'Termodynamik och statistisk fysik', 'Termiska system', 15, 'grundnivå', 'Fysik', ARRAY['FYS101']::TEXT[], ARRAY['Förstå termodynamik', 'Använda statistisk mekanik', 'Analysera entropiska system']);

-- =====================================================
-- SAMHÄLLSVETENSKAP
-- =====================================================

-- Juridik
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'JUR101', 'Introduktion till juridik', 'Grundläggande juridik och rättssystem', 15, 'grundnivå', 'Juridik', ARRAY[]::TEXT[], ARRAY['Förstå rättssystemet', 'Läsa och tolka lagtext', 'Använda juridisk metod']),
  (gen_random_uuid(), 'JUR201', 'Avtalsrätt', 'Avtals- och obligationsrätt', 15, 'grundnivå', 'Juridik', ARRAY['JUR101']::TEXT[], ARRAY['Förstå avtalsrätt', 'Upprätta avtal', 'Hantera tvister']),
  (gen_random_uuid(), 'JUR202', 'Straffrätt', 'Allmän och speciell straffrätt', 15, 'grundnivå', 'Juridik', ARRAY['JUR101']::TEXT[], ARRAY['Förstå straffrätt', 'Analysera brott', 'Tillämpa straffrättsliga regler']),
  (gen_random_uuid(), 'JUR301', 'Processrätt', 'Civilprocess och straffprocess', 15, 'avancerad nivå', 'Juridik', ARRAY['JUR201', 'JUR202']::TEXT[], ARRAY['Förstå rättegångsförfaranden', 'Företräda klienter', 'Skriva processkrifter']),
  (gen_random_uuid(), 'JUR302', 'Fastighetsrätt', 'Fastighets- och sakrätt', 15, 'avancerad nivå', 'Juridik', ARRAY['JUR201']::TEXT[], ARRAY['Förstå fastighetsrätt', 'Hantera fastighetsköp', 'Analysera rättigheter']);

-- Ekonomi
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'EKO101', 'Introduktion till ekonomi', 'Mikro- och makroekonomi', 15, 'grundnivå', 'Ekonomi', ARRAY[]::TEXT[], ARRAY['Förstå ekonomiska principer', 'Analysera marknader', 'Beskriva ekonomiska system']),
  (gen_random_uuid(), 'EKO102', 'Företagsekonomi', 'Grundläggande företagsekonomi', 15, 'grundnivå', 'Ekonomi', ARRAY[]::TEXT[], ARRAY['Förstå företagsekonomi', 'Analysera finanser', 'Beräkna lönsamhet']),
  (gen_random_uuid(), 'EKO201', 'Redovisning', 'Extern och intern redovisning', 15, 'grundnivå', 'Ekonomi', ARRAY['EKO102']::TEXT[], ARRAY['Upprätta bokslut', 'Analysera finansiella rapporter', 'Tillämpa redovisningsprinciper']),
  (gen_random_uuid(), 'EKO202', 'Finansiell ekonomi', 'Investeringar och finansiering', 15, 'grundnivå', 'Ekonomi', ARRAY['EKO101']::TEXT[], ARRAY['Värdera investeringar', 'Analysera risk', 'Optimera portföljer']),
  (gen_random_uuid(), 'EKO301', 'Marknadsföring', 'Strategisk marknadsföring', 15, 'avancerad nivå', 'Ekonomi', ARRAY['EKO102']::TEXT[], ARRAY['Utveckla marknadsstrategier', 'Analysera marknader', 'Positionera varumärken']);

-- Psykologi
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'PSY101', 'Introduktion till psykologi', 'Psykologins grunder', 15, 'grundnivå', 'Psykologi', ARRAY[]::TEXT[], ARRAY['Förstå psykologiska processer', 'Beskriva utveckling', 'Analysera beteende']),
  (gen_random_uuid(), 'PSY201', 'Kognitiv psykologi', 'Perception, minne och tänkande', 15, 'grundnivå', 'Psykologi', ARRAY['PSY101']::TEXT[], ARRAY['Förstå kognitiva processer', 'Analysera perception', 'Beskriva minnessystem']),
  (gen_random_uuid(), 'PSY202', 'Socialpsykologi', 'Individen i sociala sammanhang', 15, 'grundnivå', 'Psykologi', ARRAY['PSY101']::TEXT[], ARRAY['Förstå social påverkan', 'Analysera gruppdynamik', 'Beskriva attityder']),
  (gen_random_uuid(), 'PSY301', 'Klinisk psykologi', 'Psykisk ohälsa och behandling', 15, 'avancerad nivå', 'Psykologi', ARRAY['PSY201']::TEXT[], ARRAY['Diagnostisera psykisk ohälsa', 'Planera behandling', 'Utföra samtal']),
  (gen_random_uuid(), 'PSY302', 'Utvecklingspsykologi', 'Utveckling över livsloppet', 15, 'avancerad nivå', 'Psykologi', ARRAY['PSY101']::TEXT[], ARRAY['Förstå utveckling', 'Beskriva åldrande', 'Analysera utvecklingsstörningar']);

-- Statsvetenskap
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'STV101', 'Introduktion till statsvetenskap', 'Statsvetenskapens grunder', 15, 'grundnivå', 'Statsvetenskap', ARRAY[]::TEXT[], ARRAY['Förstå politiska system', 'Analysera makt', 'Beskriva demokrati']),
  (gen_random_uuid(), 'STV201', 'Jämförande politik', 'Politiska system i världen', 15, 'grundnivå', 'Statsvetenskap', ARRAY['STV101']::TEXT[], ARRAY['Jämföra politiska system', 'Analysera institutioner', 'Förstå politisk kultur']),
  (gen_random_uuid(), 'STV202', 'Internationell politik', 'Internationella relationer', 15, 'grundnivå', 'Statsvetenskap', ARRAY['STV101']::TEXT[], ARRAY['Förstå internationell politik', 'Analysera konflikter', 'Beskriva globalisering']);

-- =====================================================
-- HUMANIORA
-- =====================================================

-- Historia
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'HIS101', 'Historiens grundkurs', 'Introduktion till historia', 15, 'grundnivå', 'Historia', ARRAY[]::TEXT[], ARRAY['Förstå historisk metod', 'Analysera källor', 'Beskriva historiska processer']),
  (gen_random_uuid(), 'HIS201', 'Svensk historia', 'Sveriges historia från medeltid till nutid', 15, 'grundnivå', 'Historia', ARRAY['HIS101']::TEXT[], ARRAY['Beskriva svensk historia', 'Analysera historiska händelser', 'Förstå historisk utveckling']),
  (gen_random_uuid(), 'HIS202', 'Europeisk historia', 'Europas historia', 15, 'grundnivå', 'Historia', ARRAY['HIS101']::TEXT[], ARRAY['Beskriva europeisk historia', 'Förstå europeisk integration', 'Analysera krig och konflikter']);

-- Filosofi
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'FIL101', 'Introduktion till filosofi', 'Filosofins grunder', 15, 'grundnivå', 'Filosofi', ARRAY[]::TEXT[], ARRAY['Förstå filosofiska problem', 'Analysera argument', 'Reflektera kritiskt']),
  (gen_random_uuid(), 'FIL201', 'Etik', 'Moralfilosofi och tillämpad etik', 15, 'grundnivå', 'Filosofi', ARRAY['FIL101']::TEXT[], ARRAY['Förstå etiska teorier', 'Analysera moraliska dilemman', 'Tillämpa etik']);

-- =====================================================
-- LÄRARUTBILDNINGAR
-- =====================================================

INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'PED101', 'Allmän didaktik', 'Undervisning och lärande', 15, 'grundnivå', 'Pedagogik', ARRAY[]::TEXT[], ARRAY['Planera undervisning', 'Bedöma lärande', 'Reflektera över undervisning']),
  (gen_random_uuid(), 'PED102', 'Utveckling och lärande', 'Barns och ungas utveckling', 15, 'grundnivå', 'Pedagogik', ARRAY[]::TEXT[], ARRAY['Förstå utveckling', 'Stödja lärande', 'Anpassa undervisning']),
  (gen_random_uuid(), 'PED201', 'Specialpedagogik', 'Inkludering och särskilt stöd', 15, 'grundnivå', 'Pedagogik', ARRAY['PED101', 'PED102']::TEXT[], ARRAY['Identifiera svårigheter', 'Ge extra stöd', 'Arbeta inkluderande']),
  (gen_random_uuid(), 'PED301', 'Verksamhetsförlagd utbildning', 'Praktik i skolan', 30, 'avancerad nivå', 'Pedagogik', ARRAY['PED101', 'PED102']::TEXT[], ARRAY['Undervisa självständigt', 'Reflektera över undervisning', 'Utveckla yrkesskicklighet']);

-- =====================================================
-- IT & SYSTEMVETENSKAP (Yrkeshögskola)
-- =====================================================

INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'WEB101', 'HTML och CSS', 'Webbutveckling grund', 10, 'grundnivå', 'Webbutveckling', ARRAY[]::TEXT[], ARRAY['Skapa webbsidor med HTML', 'Styla med CSS', 'Bygga responsiva sidor']),
  (gen_random_uuid(), 'WEB201', 'JavaScript', 'Klientprogrammering', 15, 'grundnivå', 'Webbutveckling', ARRAY['WEB101']::TEXT[], ARRAY['Programmera i JavaScript', 'Manipulera DOM', 'Bygga interaktiva sidor']),
  (gen_random_uuid(), 'WEB301', 'React och moderna ramverk', 'Frontend-ramverk', 15, 'avancerad nivå', 'Webbutveckling', ARRAY['WEB201']::TEXT[], ARRAY['Bygga React-appar', 'Använda moderna verktyg', 'Utveckla SPA']),
  (gen_random_uuid(), 'SYS101', 'UX Design', 'Användarupplevelse och design', 10, 'grundnivå', 'Design', ARRAY[]::TEXT[], ARRAY['Designa användarvänliga gränssnitt', 'Utföra användartester', 'Skapa prototyper']),
  (gen_random_uuid(), 'SYS201', 'Agila metoder', 'Scrum och agil utveckling', 10, 'grundnivå', 'Systemutveckling', ARRAY[]::TEXT[], ARRAY['Arbeta agilt', 'Använda Scrum', 'Samarbeta i team']);

-- =====================================================
-- KONSTNÄRLIGA KURSER
-- =====================================================

INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
  (gen_random_uuid(), 'KON101', 'Teckning och form', 'Grundläggande teckning', 15, 'grundnivå', 'Konst', ARRAY[]::TEXT[], ARRAY['Teckna från modell', 'Använda olika tekniker', 'Utveckla formspråk']),
  (gen_random_uuid(), 'KON102', 'Färglära', 'Färg och komposition', 10, 'grundnivå', 'Konst', ARRAY[]::TEXT[], ARRAY['Förstå färgteori', 'Använda färg', 'Komponera bilder']),
  (gen_random_uuid(), 'KON201', 'Grafisk design', 'Visuell kommunikation', 15, 'grundnivå', 'Konst', ARRAY['KON101']::TEXT[], ARRAY['Designa grafik', 'Använda designprogram', 'Skapa visuell identitet']),
  (gen_random_uuid(), 'MUS101', 'Musikteori', 'Grundläggande musikteori', 15, 'grundnivå', 'Musik', ARRAY[]::TEXT[], ARRAY['Förstå noter', 'Analysera musik', 'Komponera enkla stycken']),
  (gen_random_uuid(), 'MUS201', 'Musikhistoria', 'Musikens historia', 15, 'grundnivå', 'Musik', ARRAY[]::TEXT[], ARRAY['Beskriva musikhistoria', 'Identifiera stilar', 'Analysera verk']);

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'Antal kurser skapade:' as status, COUNT(*) as antal FROM university_courses;

-- Visa kurser per ämnesområde
SELECT subject_area, COUNT(*) as antal_kurser
FROM university_courses
GROUP BY subject_area
ORDER BY antal_kurser DESC;
