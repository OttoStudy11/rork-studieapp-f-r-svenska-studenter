-- =====================================================
-- UNIFIERA KURSSYSTEMET FÖR GYMNASIUM OCH HÖGSKOLA
-- =====================================================
-- Detta script lägger till stöd för högskolekurser i huvudtabellen 'courses'
-- så att samma system används för både gymnasium och högskola
-- =====================================================

BEGIN;

-- =====================================================
-- STEG 1: LÄGG TILL NYA KOLUMNER I COURSES TABELLEN
-- =====================================================

-- Lägg till education_level kolumn
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT 'gymnasie' 
CHECK (education_level IN ('gymnasie', 'högskola', 'yrkeshögskola'));

-- Lägg till credits för högskolepoäng (hp)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS credits INTEGER;

-- Lägg till program_id för koppling till program
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS program_id TEXT;

-- Lägg till year för årskurs/termin
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS education_year INTEGER;

-- Lägg till semester för högskolekurser
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS semester INTEGER;

-- Lägg till is_mandatory
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT true;

-- Lägg till field (ämnesområde)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS field TEXT;

-- Uppdatera befintliga gymnasiekurser
UPDATE courses 
SET education_level = 'gymnasie' 
WHERE education_level IS NULL OR education_level = '';

-- =====================================================
-- STEG 2: SKAPA INDEX FÖR SNABBARE SÖKNINGAR
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_courses_education_level ON courses(education_level);
CREATE INDEX IF NOT EXISTS idx_courses_program_id ON courses(program_id);
CREATE INDEX IF NOT EXISTS idx_courses_education_year ON courses(education_year);
CREATE INDEX IF NOT EXISTS idx_courses_field ON courses(field);

-- =====================================================
-- STEG 3: LÄGG IN HÖGSKOLEKURSER FRÅN UNIVERSITY_COURSES
-- =====================================================

-- Migrera befintliga kurser från university_courses till courses
-- (Om tabellen finns)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'university_courses') THEN
    INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, resources, tips, progress, related_courses)
    SELECT 
      id,
      course_code,
      title,
      COALESCE(description, ''),
      subject_area,
      'högskola',
      'högskola',
      credits,
      COALESCE(learning_outcomes, ARRAY[]::TEXT[]),
      COALESCE(prerequisites, ARRAY[]::TEXT[]),
      0,
      ARRAY[]::TEXT[]
    FROM university_courses
    ON CONFLICT (id) DO UPDATE SET
      education_level = 'högskola',
      credits = EXCLUDED.credits;
  END IF;
END $$;

-- =====================================================
-- STEG 4: LÄGG IN STANDARDKURSER FÖR HÖGSKOLA
-- =====================================================

-- Civilingenjör Datateknik - År 1
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-civ-dt-linalg', 'FMAB20', 'Linjär Algebra', 'Grundläggande linjär algebra med vektorer, matriser, determinanter och linjära avbildningar', 'Matematik', 'högskola', 'högskola', 6, 'civ_datateknik', 1, 1, true, 'Teknik', '["Kurslitteratur", "Övningsuppgifter", "Videoföreläsningar"]', '["Öva matrisberäkningar dagligen", "Visualisera geometriskt"]', 0, '[]'),
('uni-civ-dt-prog1', 'EDAA45', 'Programmering Grundkurs', 'Introduktion till programmering med Java', 'Datavetenskap', 'högskola', 'högskola', 7, 'civ_datateknik', 1, 1, true, 'Teknik', '["Java dokumentation", "Kodexempel", "Labbar"]', '["Programmera varje dag", "Bygg egna projekt"]', 0, '[]'),
('uni-civ-dt-analys1', 'FMAA05', 'Endimensionell Analys', 'Envariabelanalys: derivata, integraler, gränsvärden och serier', 'Matematik', 'högskola', 'högskola', 15, 'civ_datateknik', 1, 1, true, 'Teknik', '["Formelsamling", "Övningsbok", "Gamla tentor"]', '["Förstå teorin bakom formlerna", "Öva dagligen"]', 0, '[]'),
('uni-civ-dt-diskmat', 'FMAA15', 'Diskret Matematik', 'Logik, mängdlära, kombinatorik och grafteori', 'Matematik', 'högskola', 'högskola', 5, 'civ_datateknik', 1, 2, true, 'Teknik', '["Kurslitteratur", "Problemsamling"]', '["Träna på bevis", "Koppla till programmering"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Civilingenjör Datateknik - År 2
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-civ-dt-analys2', 'FMAB30', 'Flervariabelanalys', 'Partiella derivator, multipla integraler och vektoranalys', 'Matematik', 'högskola', 'högskola', 6, 'civ_datateknik', 2, 3, true, 'Teknik', '["Kurslitteratur", "3D-visualiseringar"]', '["Visualisera i 3D", "Repetera från Analys I"]', 0, '[]'),
('uni-civ-dt-prog2', 'EDAA01', 'Programmeringsteknik - Fördjupning', 'Objektorienterad programmering, datastrukturer och algoritmer', 'Datavetenskap', 'högskola', 'högskola', 7, 'civ_datateknik', 2, 3, true, 'Teknik', '["Java/C++ guide", "Design patterns"]', '["Bygg större projekt", "Lär dig debugging"]', 0, '[]'),
('uni-civ-dt-datorsys', 'EIT070', 'Datorsystemteknik', 'Datorarkitektur, operativsystem och lågnivåprogrammering', 'Datavetenskap', 'högskola', 'högskola', 6, 'civ_datateknik', 2, 3, true, 'Teknik', '["Referensmaterial", "Labhandledningar"]', '["Experimentera med Linux", "Förstå assembler"]', 0, '[]'),
('uni-civ-dt-algo', 'EDAF05', 'Algoritmer, datastrukturer och komplexitet', 'Algoritmer, komplexitetsanalys och avancerade datastrukturer', 'Datavetenskap', 'högskola', 'högskola', 5, 'civ_datateknik', 2, 4, true, 'Teknik', '["Algoritmbok", "LeetCode"]', '["Implementera själv", "Analysera tidskomplexitet"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Civilingenjör Industriell Ekonomi - År 1
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-civ-ie-linalg', 'FMAB20-IE', 'Linjär Algebra', 'Grundläggande linjär algebra för ingenjörer med ekonomiska tillämpningar', 'Matematik', 'högskola', 'högskola', 6, 'civ_industriell_ekonomi', 1, 1, true, 'Teknik/Ekonomi', '["Kurslitteratur", "Övningar"]', '["Förstå matriser", "Koppla till ekonomiska modeller"]', 0, '[]'),
('uni-civ-ie-analys', 'FMAA01', 'Analys 1', 'Matematisk analys med tillämpningar inom teknik och ekonomi', 'Matematik', 'högskola', 'högskola', 15, 'civ_industriell_ekonomi', 1, 1, true, 'Teknik/Ekonomi', '["Kurslitteratur", "Formelsamling"]', '["Öva dagligen", "Förstå koncepten"]', 0, '[]'),
('uni-civ-ie-ekon', 'MIOF01', 'Företagsekonomi', 'Grundläggande företagsekonomi, redovisning och kalkylering', 'Ekonomi', 'högskola', 'högskola', 6, 'civ_industriell_ekonomi', 1, 1, true, 'Teknik/Ekonomi', '["Lärobok", "Case-studier"]', '["Läs affärstidningar", "Följ företag"]', 0, '[]'),
('uni-civ-ie-prog', 'EDAA20', 'Programmering och databaser', 'Programmering för ingenjörer med databashantering', 'Datavetenskap', 'högskola', 'högskola', 5, 'civ_industriell_ekonomi', 1, 2, true, 'Teknik/Ekonomi', '["Python guide", "SQL tutorial"]', '["Automatisera beräkningar", "Bygg ekonomiska modeller"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Civilingenjör Industriell Ekonomi - År 2
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-civ-ie-stat', 'FMSF45', 'Matematisk Statistik', 'Statistik och sannolikhetslära med tillämpningar', 'Matematik', 'högskola', 'högskola', 6, 'civ_industriell_ekonomi', 2, 3, true, 'Teknik/Ekonomi', '["Kurslitteratur", "R/Excel"]', '["Förstå distributioner", "Tillämpa på verkliga data"]', 0, '[]'),
('uni-civ-ie-mek', 'FMEA05', 'Mekanik - Statik och partikeldynamik', 'Teknisk mekanik med fokus på statik', 'Teknik', 'högskola', 'högskola', 6, 'civ_industriell_ekonomi', 2, 3, true, 'Teknik/Ekonomi', '["Lärobok", "Labbhandledningar"]', '["Visualisera krafter", "Öva fri-kroppdiagram"]', 0, '[]'),
('uni-civ-ie-mktg', 'MIOF20', 'Marknadsföring', 'Marknadsföringsteori och praktik', 'Ekonomi', 'högskola', 'högskola', 6, 'civ_industriell_ekonomi', 2, 3, true, 'Teknik/Ekonomi', '["Kotler bok", "Case-studier"]', '["Analysera verkliga kampanjer", "Följ trender"]', 0, '[]'),
('uni-civ-ie-org', 'MIOF10', 'Organisation och ledarskap', 'Organisationsteori, ledarskap och grupprocesser', 'Ekonomi', 'högskola', 'högskola', 6, 'civ_industriell_ekonomi', 2, 4, true, 'Teknik/Ekonomi', '["Kurslitteratur", "Case-studier"]', '["Reflektera över erfarenheter", "Diskutera i grupp"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Ekonomprogrammet - År 1
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-ekon-mikro', 'NEKN21', 'Mikroekonomi', 'Grundläggande mikroekonomisk teori: utbud, efterfrågan och marknadsmekanismer', 'Ekonomi', 'högskola', 'högskola', 15, 'ekonomprogrammet', 1, 1, true, 'Ekonomi', '["Kurslitteratur", "Övningar"]', '["Förstå grafer", "Öva på beräkningar"]', 0, '[]'),
('uni-ekon-redov', 'FEKA01', 'Extern redovisning', 'Finansiell redovisning och bokföring', 'Ekonomi', 'högskola', 'högskola', 7, 'ekonomprogrammet', 1, 1, true, 'Ekonomi', '["Redovisningsbok", "Övningsuppgifter"]', '["Lär dig bokföringsregler", "Öva på bokslut"]', 0, '[]'),
('uni-ekon-stat', 'STAA10', 'Grundläggande Statistik', 'Beskrivande statistik och grundläggande inferens', 'Matematik', 'högskola', 'högskola', 7, 'ekonomprogrammet', 1, 2, true, 'Ekonomi', '["Statistikbok", "Excel/SPSS"]', '["Förstå teori", "Tillämpa på ekonomiska data"]', 0, '[]'),
('uni-ekon-makro', 'NEKN22', 'Makroekonomi', 'Makroekonomisk teori: BNP, inflation, arbetslöshet', 'Ekonomi', 'högskola', 'högskola', 15, 'ekonomprogrammet', 1, 2, true, 'Ekonomi', '["Kurslitteratur", "Nyhetsartiklar"]', '["Följ ekonomiska nyheter", "Koppla teori till verklighet"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Ekonomprogrammet - År 2
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-ekon-finansiering', 'FEKH89', 'Finansiering', 'Företagsfinansiering, investeringsbedömning och kapitalkostnad', 'Ekonomi', 'högskola', 'högskola', 7, 'ekonomprogrammet', 2, 3, true, 'Ekonomi', '["Finansieringsbok", "Excel-modeller"]', '["Lär dig nuvärdesberäkningar", "Analysera företag"]', 0, '[]'),
('uni-ekon-mgmt', 'FEKA50', 'Management', 'Strategisk ledning och organisationsutveckling', 'Ekonomi', 'högskola', 'högskola', 7, 'ekonomprogrammet', 2, 3, true, 'Ekonomi', '["Management-bok", "Case-studier"]', '["Analysera verkliga företag", "Delta i grupparbeten"]', 0, '[]'),
('uni-ekon-ekonometri', 'NEKN32', 'Ekonometri', 'Ekonometriska metoder och tillämpningar', 'Ekonomi', 'högskola', 'högskola', 7, 'ekonomprogrammet', 2, 4, true, 'Ekonomi', '["Ekonometri-bok", "Stata/R"]', '["Lär dig regressionsanalys", "Öva på dataset"]', 0, '[]'),
('uni-ekon-skatteratt', 'HARH12', 'Skatterätt', 'Grundläggande skatterätt för företag och privatpersoner', 'Juridik', 'högskola', 'högskola', 7, 'ekonomprogrammet', 2, 4, true, 'Ekonomi', '["Skattelagstiftning", "Övningsuppgifter"]', '["Håll dig uppdaterad på skatteregler", "Öva på fall"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Juristprogrammet - År 1
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-jur-intro', 'JURA01', 'Juridisk introduktionskurs', 'Introduktion till rättsvetenskapen och juridisk metod', 'Juridik', 'högskola', 'högskola', 15, 'juristprogrammet', 1, 1, true, 'Juridik', '["Rättsvetenskap", "Lagbok"]', '["Lär dig juridisk metod", "Läs rättsfall"]', 0, '[]'),
('uni-jur-konstrat', 'JURA10', 'Konstitutionell rätt', 'Statsrätt och grundläggande fri- och rättigheter', 'Juridik', 'högskola', 'högskola', 15, 'juristprogrammet', 1, 1, true, 'Juridik', '["Grundlagarna", "Konstitutionell rätt-bok"]', '["Förstå maktfördelning", "Läs regeringsformen"]', 0, '[]'),
('uni-jur-civilratt', 'JURA20', 'Civilrätt - Allmän förmögenhetsrätt', 'Avtalsrätt, köprätt och skadeståndsrätt', 'Juridik', 'högskola', 'högskola', 15, 'juristprogrammet', 1, 2, true, 'Juridik', '["Avtalsrätt-bok", "Rättsfall"]', '["Lär dig avtalslagen", "Analysera rättsfall"]', 0, '[]'),
('uni-jur-straff', 'JURA25', 'Straffrätt', 'Brottsbalken och straffprocessrätt', 'Juridik', 'högskola', 'högskola', 15, 'juristprogrammet', 1, 2, true, 'Juridik', '["Brottsbalken", "Straffrätt-bok"]', '["Förstå brottsrekvisit", "Läs domar"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Juristprogrammet - År 2
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-jur-familj', 'JURA30', 'Familjerätt och arvsrätt', 'Äktenskapsbalken, föräldrabalken och ärvdabalken', 'Juridik', 'högskola', 'högskola', 10, 'juristprogrammet', 2, 3, true, 'Juridik', '["Äktenskapsbalken", "Familjerätt-bok"]', '["Förstå familjerättsliga frågor", "Öva på fall"]', 0, '[]'),
('uni-jur-arbetsratt', 'JURA35', 'Arbetsrätt', 'Arbetsrättslig lagstiftning och kollektivavtal', 'Juridik', 'högskola', 'högskola', 10, 'juristprogrammet', 2, 3, true, 'Juridik', '["LAS", "Arbetsrätt-bok"]', '["Lär dig anställningsskydd", "Följ arbetsrättsmål"]', 0, '[]'),
('uni-jur-processratt', 'JURA40', 'Processrätt', 'Civilprocess och förvaltningsprocess', 'Juridik', 'högskola', 'högskola', 15, 'juristprogrammet', 2, 4, true, 'Juridik', '["Rättegångsbalken", "Processrätt-bok"]', '["Förstå domstolsväsendet", "Besök rättegångar"]', 0, '[]'),
('uni-jur-forvalt', 'JURA45', 'Förvaltningsrätt', 'Förvaltningslagen och myndighetsutövning', 'Juridik', 'högskola', 'högskola', 10, 'juristprogrammet', 2, 4, true, 'Juridik', '["Förvaltningslagen", "Förvaltningsrätt-bok"]', '["Förstå myndighetsbeslut", "Analysera avgöranden"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Sjuksköterskeprogrammet - År 1
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-ssk-anatomi', 'HSKA10', 'Anatomi och fysiologi', 'Människokroppens uppbyggnad och funktion', 'Medicin', 'högskola', 'högskola', 15, 'sjukskoterskeprogrammet', 1, 1, true, 'Vårdvetenskap', '["Anatomiatlas", "Fysiologibok"]', '["Använd anatomiska modeller", "Öva terminologi"]', 0, '[]'),
('uni-ssk-omvard1', 'HSKA20', 'Omvårdnad - Grunder', 'Grundläggande omvårdnadsteori och praxis', 'Vårdvetenskap', 'högskola', 'högskola', 15, 'sjukskoterskeprogrammet', 1, 1, true, 'Vårdvetenskap', '["Omvårdnadsbok", "Labbövningar"]', '["Delta aktivt på VFU", "Reflektera över patientmöten"]', 0, '[]'),
('uni-ssk-farmakologi', 'HSKA30', 'Farmakologi', 'Läkemedels verkan och biverkningar', 'Medicin', 'högskola', 'högskola', 7, 'sjukskoterskeprogrammet', 1, 2, true, 'Vårdvetenskap', '["FASS", "Farmakologibok"]', '["Lär dig läkemedelsgrupper", "Förstå interaktioner"]', 0, '[]'),
('uni-ssk-metod', 'HSKA25', 'Vetenskaplig metod', 'Forskningsmetodik inom vårdvetenskap', 'Metod', 'högskola', 'högskola', 7, 'sjukskoterskeprogrammet', 1, 2, true, 'Vårdvetenskap', '["Metodbok", "Vetenskapliga artiklar"]', '["Läs forskning", "Öva kritisk granskning"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Sjuksköterskeprogrammet - År 2
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-ssk-klinisk', 'HSKA40', 'Klinisk omvårdnad', 'Omvårdnad vid somatisk sjukdom', 'Vårdvetenskap', 'högskola', 'högskola', 15, 'sjukskoterskeprogrammet', 2, 3, true, 'Vårdvetenskap', '["Klinisk handbok", "Procedurfilmer"]', '["Öva kliniska moment", "Dokumentera noggrant"]', 0, '[]'),
('uni-ssk-psyk', 'HSKA45', 'Psykiatrisk omvårdnad', 'Omvårdnad vid psykisk ohälsa', 'Vårdvetenskap', 'högskola', 'högskola', 10, 'sjukskoterskeprogrammet', 2, 3, true, 'Vårdvetenskap', '["Psykiatribok", "Case-studier"]', '["Utveckla kommunikationsfärdigheter", "Självreflektion"]', 0, '[]'),
('uni-ssk-vfu2', 'HSKA50', 'Verksamhetsförlagd utbildning 2', 'Praktik på vårdavdelning', 'Vårdvetenskap', 'högskola', 'högskola', 15, 'sjukskoterskeprogrammet', 2, 4, true, 'Vårdvetenskap', '["VFU-handbok", "Reflektionsdagbok"]', '["Var proaktiv", "Ställ frågor till handledare"]', 0, '[]'),
('uni-ssk-geriatrik', 'HSKA55', 'Geriatrisk omvårdnad', 'Omvårdnad av äldre', 'Vårdvetenskap', 'högskola', 'högskola', 7, 'sjukskoterskeprogrammet', 2, 4, true, 'Vårdvetenskap', '["Geriatrikbok", "Fallstudier"]', '["Förstå multisjuklighet", "Personcentrerad vård"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Läkarprogrammet - År 1
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-lak-cellbio', 'MEDA01', 'Cellbiologi och genetik', 'Cellens uppbyggnad, funktion och genetiska mekanismer', 'Medicin', 'högskola', 'högskola', 15, 'lakarprogrammet', 1, 1, true, 'Medicin', '["Cellbiologibok", "Labbar"]', '["Förstå molekylära mekanismer", "Koppla till sjukdomar"]', 0, '[]'),
('uni-lak-anatomi1', 'MEDA10', 'Anatomi 1', 'Rörelseapparatens anatomi och nervsystemet', 'Medicin', 'högskola', 'högskola', 15, 'lakarprogrammet', 1, 1, true, 'Medicin', '["Anatomiatlas", "Dissektionsövningar"]', '["Lär dig strukturer systematiskt", "Använd anatomiska modeller"]', 0, '[]'),
('uni-lak-fysiologi', 'MEDA20', 'Fysiologi', 'Kroppens normala funktioner och reglering', 'Medicin', 'högskola', 'högskola', 15, 'lakarprogrammet', 1, 2, true, 'Medicin', '["Fysiologibok", "Laborationer"]', '["Förstå homeostatiska mekanismer", "Koppla till klinik"]', 0, '[]'),
('uni-lak-biokemi', 'MEDA25', 'Biokemi', 'Metabolism och biokemiska processer', 'Medicin', 'högskola', 'högskola', 10, 'lakarprogrammet', 1, 2, true, 'Medicin', '["Biokemibok", "Laborationer"]', '["Förstå metabola vägar", "Memorera enzymsystem"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Läkarprogrammet - År 2
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-lak-patofys', 'MEDA30', 'Patofysiologi', 'Sjukdomars uppkomst och mekanismer', 'Medicin', 'högskola', 'högskola', 15, 'lakarprogrammet', 2, 3, true, 'Medicin', '["Patofysiologibok", "Fallstudier"]', '["Koppla normal fysiologi till sjukdom", "Använd kliniska fall"]', 0, '[]'),
('uni-lak-farmako', 'MEDA35', 'Farmakologi för läkare', 'Läkemedelsbehandling och farmakokinetik', 'Medicin', 'högskola', 'högskola', 10, 'lakarprogrammet', 2, 3, true, 'Medicin', '["FASS", "Farmakologibok"]', '["Lär dig indikationer och kontraindikationer", "Förstå interaktioner"]', 0, '[]'),
('uni-lak-klinintro', 'MEDA40', 'Klinisk introduktion', 'Grundläggande kliniska färdigheter och patientkontakt', 'Medicin', 'högskola', 'högskola', 10, 'lakarprogrammet', 2, 4, true, 'Medicin', '["Klinisk handbok", "Auskultationsövningar"]', '["Öva undersökningsmoment", "Utveckla kommunikation"]', 0, '[]'),
('uni-lak-mikrobio', 'MEDA45', 'Mikrobiologi och infektionssjukdomar', 'Bakterier, virus och infektionsmedicin', 'Medicin', 'högskola', 'högskola', 10, 'lakarprogrammet', 2, 4, true, 'Medicin', '["Mikrobiologibok", "Labbar"]', '["Lär dig patogener systematiskt", "Antibiotikaresistens"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Kandidatprogram i Datavetenskap - År 1
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-kand-dv-prog1', 'DT001', 'Introduktion till programmering', 'Grundläggande programmering med Python', 'Datavetenskap', 'högskola', 'högskola', 7, 'kand_datavetenskap', 1, 1, true, 'Naturvetenskap', '["Python dokumentation", "Onlinekurser"]', '["Koda varje dag", "Experimentera med kod"]', 0, '[]'),
('uni-kand-dv-mat', 'DT002', 'Diskret matematik för datavetare', 'Logik, mängder, relationer och grafteori', 'Matematik', 'högskola', 'högskola', 7, 'kand_datavetenskap', 1, 1, true, 'Naturvetenskap', '["Kursbok", "Övningar"]', '["Träna på bevisföring", "Koppla till programmering"]', 0, '[]'),
('uni-kand-dv-web', 'DT003', 'Webbutveckling', 'HTML, CSS, JavaScript och grundläggande webbutveckling', 'Datavetenskap', 'högskola', 'högskola', 7, 'kand_datavetenskap', 1, 2, true, 'Naturvetenskap', '["MDN Web Docs", "Projektmall"]', '["Bygg egna webbsidor", "Lär dig responsiv design"]', 0, '[]'),
('uni-kand-dv-data', 'DT004', 'Datastrukturer och algoritmer', 'Grundläggande datastrukturer och algoritmanalys', 'Datavetenskap', 'högskola', 'högskola', 7, 'kand_datavetenskap', 1, 2, true, 'Naturvetenskap', '["Algoritmbok", "Övningar"]', '["Implementera själv", "Förstå komplexitet"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Kandidatprogram i Datavetenskap - År 2
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-kand-dv-db', 'DT010', 'Databaser och SQL', 'Relationsdatabaser, SQL och databasdesign', 'Datavetenskap', 'högskola', 'högskola', 7, 'kand_datavetenskap', 2, 3, true, 'Naturvetenskap', '["SQL tutorial", "PostgreSQL"]', '["Öva på SQL queries", "Designa egna databaser"]', 0, '[]'),
('uni-kand-dv-oop', 'DT011', 'Objektorienterad programmering', 'OOP-principer med Java eller C#', 'Datavetenskap', 'högskola', 'högskola', 7, 'kand_datavetenskap', 2, 3, true, 'Naturvetenskap', '["OOP-bok", "Design patterns"]', '["Förstå designmönster", "Bygg större projekt"]', 0, '[]'),
('uni-kand-dv-os', 'DT012', 'Operativsystem', 'Processer, minne, filsystem och säkerhet', 'Datavetenskap', 'högskola', 'högskola', 7, 'kand_datavetenskap', 2, 4, true, 'Naturvetenskap', '["OS-bok", "Linux-labbar"]', '["Experimentera med Linux", "Förstå lågnivådetaljer"]', 0, '[]'),
('uni-kand-dv-natverk', 'DT013', 'Datornätverk', 'TCP/IP, nätverksprotokoll och säkerhet', 'Datavetenskap', 'högskola', 'högskola', 7, 'kand_datavetenskap', 2, 4, true, 'Naturvetenskap', '["Nätverk-bok", "Wireshark"]', '["Analysera nätverkstrafik", "Sätt upp egna servrar"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Psykologprogrammet - År 1
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-psy-intro', 'PSY101', 'Introduktion till psykologi', 'Översikt av psykologins delområden och historia', 'Psykologi', 'högskola', 'högskola', 15, 'psykologprogrammet', 1, 1, true, 'Psykologi', '["Psykologibok", "Vetenskapliga artiklar"]', '["Läs brett", "Koppla teori till vardagen"]', 0, '[]'),
('uni-psy-bio', 'PSY102', 'Biologisk psykologi', 'Hjärnans struktur och funktion, neurotransmittorer', 'Psykologi', 'högskola', 'högskola', 15, 'psykologprogrammet', 1, 1, true, 'Psykologi', '["Neuropsykologibok", "Anatomiska modeller"]', '["Lär dig hjärnans delar", "Koppla till beteende"]', 0, '[]'),
('uni-psy-utveckling', 'PSY103', 'Utvecklingspsykologi', 'Psykologisk utveckling genom livet', 'Psykologi', 'högskola', 'högskola', 15, 'psykologprogrammet', 1, 2, true, 'Psykologi', '["Utvecklingspsykologi-bok", "Observationer"]', '["Förstå stadierna", "Gör egna observationer"]', 0, '[]'),
('uni-psy-metod', 'PSY104', 'Forskningsmetodik', 'Kvantitativa och kvalitativa metoder inom psykologi', 'Metod', 'högskola', 'högskola', 7, 'psykologprogrammet', 1, 2, true, 'Psykologi', '["Metodbok", "SPSS"]', '["Lär dig statistik", "Planera egna studier"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Psykologprogrammet - År 2
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-psy-kognitiv', 'PSY201', 'Kognitiv psykologi', 'Perception, minne, tänkande och beslutsfattande', 'Psykologi', 'högskola', 'högskola', 15, 'psykologprogrammet', 2, 3, true, 'Psykologi', '["Kognitionsbok", "Experiment"]', '["Förstå kognitiva processer", "Gör experiment"]', 0, '[]'),
('uni-psy-social', 'PSY202', 'Socialpsykologi', 'Grupprocesser, attityder och social påverkan', 'Psykologi', 'högskola', 'högskola', 15, 'psykologprogrammet', 2, 3, true, 'Psykologi', '["Socialpsykologi-bok", "Klassiska studier"]', '["Läs om klassiska experiment", "Reflektera över egna beteenden"]', 0, '[]'),
('uni-psy-klinisk', 'PSY203', 'Klinisk psykologi 1', 'Psykopatologi och diagnostik', 'Psykologi', 'högskola', 'högskola', 15, 'psykologprogrammet', 2, 4, true, 'Psykologi', '["DSM-5", "Klinisk psykologi-bok"]', '["Lär dig diagnoskriterier", "Fallstudier"]', 0, '[]'),
('uni-psy-personlighet', 'PSY204', 'Personlighetspsykologi', 'Personlighetsteorier och individuella skillnader', 'Psykologi', 'högskola', 'högskola', 7, 'psykologprogrammet', 2, 4, true, 'Psykologi', '["Personlighetsbok", "Tester"]', '["Jämför teorier", "Kritiskt tänkande"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Högskoleingenjör Datateknik - År 1
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-hsk-dt-prog1', 'DVA117', 'Programmering I', 'Grundläggande programmering i C', 'Datavetenskap', 'högskola', 'högskola', 7, 'hsk_datateknik', 1, 1, true, 'Teknik', '["C programmering", "Kodexempel"]', '["Öva pekare", "Förstå minneshantering"]', 0, '[]'),
('uni-hsk-dt-mat', 'MAA115', 'Matematik I', 'Linjär algebra och envariabelanalys', 'Matematik', 'högskola', 'högskola', 7, 'hsk_datateknik', 1, 1, true, 'Teknik', '["Matematikbok", "Övningar"]', '["Öva dagligen", "Förstå koncepten"]', 0, '[]'),
('uni-hsk-dt-elekt', 'DVA118', 'Elektronik och digitalteknik', 'Grundläggande elektronik och digital logik', 'Elektroteknik', 'högskola', 'högskola', 7, 'hsk_datateknik', 1, 2, true, 'Teknik', '["Elektronikbok", "Labbar"]', '["Bygg kretsar", "Förstå grindar"]', 0, '[]'),
('uni-hsk-dt-prog2', 'DVA119', 'Programmering II', 'Objektorienterad programmering', 'Datavetenskap', 'högskola', 'högskola', 7, 'hsk_datateknik', 1, 2, true, 'Teknik', '["OOP-bok", "Projekt"]', '["Bygg projekt", "Designmönster"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- Högskoleingenjör Datateknik - År 2
INSERT INTO courses (id, course_code, title, description, subject, level, education_level, credits, program_id, education_year, semester, is_mandatory, field, resources, tips, progress, related_courses) VALUES
('uni-hsk-dt-db', 'DVA228', 'Databasteknik', 'Databaser, SQL och datamodellering', 'Datavetenskap', 'högskola', 'högskola', 7, 'hsk_datateknik', 2, 3, true, 'Teknik', '["Databasbok", "SQL-övningar"]', '["Öva SQL", "Designa databaser"]', 0, '[]'),
('uni-hsk-dt-os', 'DVA245', 'Operativsystem', 'Processer, trådar och systemanrop', 'Datavetenskap', 'högskola', 'högskola', 7, 'hsk_datateknik', 2, 3, true, 'Teknik', '["OS-bok", "Linux-labbar"]', '["Använd Linux", "Förstå systemanrop"]', 0, '[]'),
('uni-hsk-dt-natverk', 'DVA254', 'Datorkommunikation', 'Nätverksprotokoll och nätverkssäkerhet', 'Datavetenskap', 'högskola', 'högskola', 7, 'hsk_datateknik', 2, 4, true, 'Teknik', '["Nätverksbok", "Wireshark"]', '["Analysera trafik", "Konfigurera nätverk"]', 0, '[]'),
('uni-hsk-dt-projekt', 'DVA255', 'Projektarbete', 'Projektmetodik och mjukvaruprojekt', 'Datavetenskap', 'högskola', 'högskola', 7, 'hsk_datateknik', 2, 4, true, 'Teknik', '["Projektguide", "Scrum"]', '["Planera noggrant", "Kommunicera med teamet"]', 0, '[]')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEG 5: SKAPA FUNKTION FÖR ATT HÄMTA KURSER PER PROGRAM
-- =====================================================

CREATE OR REPLACE FUNCTION get_courses_for_program(
  p_program_id TEXT,
  p_year INTEGER DEFAULT NULL,
  p_education_level TEXT DEFAULT 'högskola'
)
RETURNS SETOF courses AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM courses c
  WHERE c.program_id = p_program_id
    AND c.education_level = p_education_level
    AND (p_year IS NULL OR c.education_year = p_year)
  ORDER BY c.semester, c.title;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEG 6: UPPDATERA user_courses TABELLEN
-- =====================================================

-- Lägg till education_level kolumn om den inte finns
ALTER TABLE user_courses
ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT 'gymnasie';

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'Kurssystemet har unifierats!' as status;

-- Visa antal kurser per utbildningsnivå
SELECT education_level, COUNT(*) as antal_kurser 
FROM courses 
GROUP BY education_level;

-- Visa antal kurser per program
SELECT program_id, COUNT(*) as antal_kurser 
FROM courses 
WHERE program_id IS NOT NULL 
GROUP BY program_id 
ORDER BY antal_kurser DESC;
