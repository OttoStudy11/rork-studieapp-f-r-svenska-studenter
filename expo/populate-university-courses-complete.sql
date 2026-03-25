-- Complete SQL to populate university_courses table with all program courses
-- Run this in Supabase SQL Editor

-- First, ensure the university_courses table exists with proper structure
CREATE TABLE IF NOT EXISTS university_courses (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  credits DECIMAL(4,1) NOT NULL DEFAULT 7.5,
  year INTEGER NOT NULL CHECK (year >= 1 AND year <= 5),
  mandatory BOOLEAN NOT NULL DEFAULT true,
  category TEXT NOT NULL DEFAULT 'grundkurs',
  field TEXT NOT NULL,
  program_id TEXT NOT NULL,
  description TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  tips JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_university_courses_program_id ON university_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_university_courses_year ON university_courses(year);
CREATE INDEX IF NOT EXISTS idx_university_courses_code ON university_courses(code);

-- Create user_university_courses table to track which courses users are enrolled in
CREATE TABLE IF NOT EXISTS user_university_courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Create index for user course lookups
CREATE INDEX IF NOT EXISTS idx_user_university_courses_user_id ON user_university_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_university_courses_course_id ON user_university_courses(course_id);

-- Enable RLS
ALTER TABLE university_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_courses ENABLE ROW LEVEL SECURITY;

-- RLS policies for university_courses (read-only for all authenticated users)
DROP POLICY IF EXISTS "University courses are viewable by all authenticated users" ON university_courses;
CREATE POLICY "University courses are viewable by all authenticated users"
  ON university_courses FOR SELECT
  TO authenticated
  USING (true);

-- RLS policies for user_university_courses
DROP POLICY IF EXISTS "Users can view their own university course enrollments" ON user_university_courses;
CREATE POLICY "Users can view their own university course enrollments"
  ON user_university_courses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own university course enrollments" ON user_university_courses;
CREATE POLICY "Users can insert their own university course enrollments"
  ON user_university_courses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own university course enrollments" ON user_university_courses;
CREATE POLICY "Users can update their own university course enrollments"
  ON user_university_courses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE university_courses CASCADE;

-- =====================================================
-- CIVILINGENJÖR - DATATEKNIK
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('SF1624', 'SF1624', 'Algebra och geometri', 7.5, 1, true, 'grundkurs', 'Matematik', 'civ_datateknik', 'Grundläggande linjär algebra med vektorer, matriser och linjära ekvationssystem'),
('SF1625', 'SF1625', 'Envariabelanalys', 7.5, 1, true, 'grundkurs', 'Matematik', 'civ_datateknik', 'Differential- och integralkalkyl i en variabel'),
('DD1301', 'DD1301', 'Introduktion till programmering', 7.5, 1, true, 'grundkurs', 'Datateknik', 'civ_datateknik', 'Grundläggande programmering i Python'),
('DD1320', 'DD1320', 'Tillämpad datalogi', 6, 1, true, 'grundkurs', 'Datateknik', 'civ_datateknik', 'Grundläggande datastrukturer och algoritmer'),
('SF1626', 'SF1626', 'Flervariabelanalys', 7.5, 1, true, 'grundkurs', 'Matematik', 'civ_datateknik', 'Differential- och integralkalkyl i flera variabler'),
('DD1337', 'DD1337', 'Programmeringsteknik', 7.5, 1, true, 'grundkurs', 'Datateknik', 'civ_datateknik', 'Objektorienterad programmering i Java'),
('IS1200', 'IS1200', 'Datorteknik', 7.5, 1, true, 'grundkurs', 'Datateknik', 'civ_datateknik', 'Datorns uppbyggnad och assemblerprogrammering'),
('SF1627', 'SF1627', 'Diskret matematik', 7.5, 1, true, 'grundkurs', 'Matematik', 'civ_datateknik', 'Kombinatorik, grafteori och talteori'),
-- År 2
('DD1324', 'DD1324', 'Algoritmer och datastrukturer', 7.5, 2, true, 'grundkurs', 'Datateknik', 'civ_datateknik', 'Avancerade algoritmer och datastrukturer'),
('DD1351', 'DD1351', 'Logik för dataloger', 6, 2, true, 'grundkurs', 'Datateknik', 'civ_datateknik', 'Formell logik och bevisteknik'),
('DD1352', 'DD1352', 'Arkitektur, operativsystem och nätverk', 9, 2, true, 'fördjupningskurs', 'Datateknik', 'civ_datateknik', 'Datorarkitektur, OS och datorkommunikation'),
('SF1680', 'SF1680', 'Sannolikhetsteori och statistik', 7.5, 2, true, 'grundkurs', 'Matematik', 'civ_datateknik', 'Grundläggande sannolikhetslära och statistisk inferens'),
('DD1361', 'DD1361', 'Programmeringsparadigm', 7.5, 2, true, 'fördjupningskurs', 'Datateknik', 'civ_datateknik', 'Funktionell och logikprogrammering'),
('DD1396', 'DD1396', 'Parallellprogrammering', 6, 2, true, 'fördjupningskurs', 'Datateknik', 'civ_datateknik', 'Parallell och distribuerad programmering'),
('DD2350', 'DD2350', 'Algoritmer och komplexitet', 6, 2, true, 'fördjupningskurs', 'Datateknik', 'civ_datateknik', 'Komplexitetsteori och avancerade algoritmer'),
-- År 3
('DD2380', 'DD2380', 'Artificiell intelligens', 7.5, 3, false, 'fördjupningskurs', 'Datateknik', 'civ_datateknik', 'Grundläggande AI-tekniker och tillämpningar'),
('DD2421', 'DD2421', 'Maskininlärning', 7.5, 3, false, 'fördjupningskurs', 'Datateknik', 'civ_datateknik', 'Supervised och unsupervised learning'),
('DH2642', 'DH2642', 'Interaktionsprogrammering', 7.5, 3, false, 'fördjupningskurs', 'Datateknik', 'civ_datateknik', 'Webbprogrammering och användargränssnitt'),
('DD2440', 'DD2440', 'Avancerad webbprogrammering', 7.5, 3, false, 'fördjupningskurs', 'Datateknik', 'civ_datateknik', 'Moderna webbteknologier och ramverk'),
('DD2412', 'DD2412', 'Kandidatexjobb', 15, 3, true, 'fördjupningskurs', 'Datateknik', 'civ_datateknik', 'Självständigt arbete inom datateknik')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- CIVILINGENJÖR - ELEKTROTEKNIK
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('EI_SF1624', 'SF1624', 'Algebra och geometri', 7.5, 1, true, 'grundkurs', 'Matematik', 'civ_elektroteknik', 'Grundläggande linjär algebra'),
('EI_SF1625', 'SF1625', 'Envariabelanalys', 7.5, 1, true, 'grundkurs', 'Matematik', 'civ_elektroteknik', 'Differential- och integralkalkyl'),
('EI1210', 'EI1210', 'Introduktion till elektroteknik', 7.5, 1, true, 'grundkurs', 'Elektroteknik', 'civ_elektroteknik', 'Grundläggande elektroteknik och kretsteori'),
('EI1220', 'EI1220', 'Elektriska kretsar', 7.5, 1, true, 'grundkurs', 'Elektroteknik', 'civ_elektroteknik', 'Analys av elektriska kretsar'),
('EI_SF1626', 'SF1626', 'Flervariabelanalys', 7.5, 1, true, 'grundkurs', 'Matematik', 'civ_elektroteknik', 'Flervariabelanalys'),
('SI1140', 'SI1140', 'Elektromagnetism', 6, 1, true, 'grundkurs', 'Fysik', 'civ_elektroteknik', 'Elektromagnetiska fält och vågor'),
('DD1310', 'DD1310', 'Programmering för elektroingenjörer', 7.5, 1, true, 'grundkurs', 'Datateknik', 'civ_elektroteknik', 'Programmering i Python och MATLAB'),
-- År 2
('EI2300', 'EI2300', 'Signalbehandling', 7.5, 2, true, 'fördjupningskurs', 'Elektroteknik', 'civ_elektroteknik', 'Digital och analog signalbehandling'),
('EI2310', 'EI2310', 'Analog elektronik', 7.5, 2, true, 'fördjupningskurs', 'Elektroteknik', 'civ_elektroteknik', 'Analoga elektronikkretsar'),
('EI2320', 'EI2320', 'Digital elektronik', 7.5, 2, true, 'fördjupningskurs', 'Elektroteknik', 'civ_elektroteknik', 'Digitala kretsar och FPGA'),
('EI2330', 'EI2330', 'Reglerteknik', 7.5, 2, true, 'fördjupningskurs', 'Elektroteknik', 'civ_elektroteknik', 'Reglersystem och återkoppling'),
('EI2340', 'EI2340', 'Elkraftteknik', 7.5, 2, true, 'fördjupningskurs', 'Elektroteknik', 'civ_elektroteknik', 'Elkraft och energisystem'),
-- År 3
('EI3350', 'EI3350', 'Trådlös kommunikation', 7.5, 3, false, 'fördjupningskurs', 'Elektroteknik', 'civ_elektroteknik', 'Radioteknik och trådlösa system'),
('EI3360', 'EI3360', 'Inbyggda system', 7.5, 3, false, 'fördjupningskurs', 'Elektroteknik', 'civ_elektroteknik', 'Programmering av inbyggda system'),
('EI3370', 'EI3370', 'Kraft- och energisystem', 7.5, 3, false, 'fördjupningskurs', 'Elektroteknik', 'civ_elektroteknik', 'Energiproduktion och distribution'),
('EI3900', 'EI3900', 'Kandidatexjobb', 15, 3, true, 'fördjupningskurs', 'Elektroteknik', 'civ_elektroteknik', 'Självständigt arbete inom elektroteknik')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- CIVILINGENJÖR - INDUSTRIELL EKONOMI
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('IE_SF1624', 'SF1624', 'Algebra och geometri', 7.5, 1, true, 'grundkurs', 'Matematik', 'civ_industriell_ekonomi', 'Linjär algebra för ingenjörer'),
('ME1003', 'ME1003', 'Industriell ekonomi och organisation', 6, 1, true, 'grundkurs', 'Ekonomi', 'civ_industriell_ekonomi', 'Introduktion till industriell ekonomi'),
('ME1312', 'ME1312', 'Företagsekonomi', 7.5, 1, true, 'grundkurs', 'Ekonomi', 'civ_industriell_ekonomi', 'Grundläggande företagsekonomi'),
('IE_DD1301', 'DD1301', 'Introduktion till programmering', 7.5, 1, true, 'grundkurs', 'Datateknik', 'civ_industriell_ekonomi', 'Programmering i Python'),
('IE_SF1625', 'SF1625', 'Envariabelanalys', 7.5, 1, true, 'grundkurs', 'Matematik', 'civ_industriell_ekonomi', 'Matematisk analys'),
('ME1313', 'ME1313', 'Bokföring och ekonomistyrning', 6, 1, true, 'grundkurs', 'Ekonomi', 'civ_industriell_ekonomi', 'Redovisning och intern styrning'),
-- År 2
('ME2063', 'ME2063', 'Produktionsekonomi', 7.5, 2, true, 'fördjupningskurs', 'Ekonomi', 'civ_industriell_ekonomi', 'Ekonomi i produktionssystem'),
('ME2015', 'ME2015', 'Marknadsföring', 7.5, 2, true, 'fördjupningskurs', 'Ekonomi', 'civ_industriell_ekonomi', 'Marknadsföringsstrategier'),
('ME2073', 'ME2073', 'Finansiell ekonomi', 7.5, 2, true, 'fördjupningskurs', 'Ekonomi', 'civ_industriell_ekonomi', 'Finansiering och investeringsbedömning'),
('ME2016', 'ME2016', 'Strategisk ledning', 7.5, 2, true, 'fördjupningskurs', 'Ekonomi', 'civ_industriell_ekonomi', 'Strategisk planering och ledning'),
('IE_SF1680', 'SF1680', 'Sannolikhetsteori och statistik', 7.5, 2, true, 'grundkurs', 'Matematik', 'civ_industriell_ekonomi', 'Statistik för ingenjörer'),
-- År 3
('ME3031', 'ME3031', 'Produktionsutveckling', 7.5, 3, false, 'fördjupningskurs', 'Produktion', 'civ_industriell_ekonomi', 'Lean production och effektivisering'),
('ME3032', 'ME3032', 'Supply Chain Management', 7.5, 3, false, 'fördjupningskurs', 'Logistik', 'civ_industriell_ekonomi', 'Leveranskedjor och logistik'),
('ME3033', 'ME3033', 'Innovation och entreprenörskap', 7.5, 3, false, 'fördjupningskurs', 'Ekonomi', 'civ_industriell_ekonomi', 'Innovationsprocesser och startup'),
('ME3900', 'ME3900', 'Kandidatexjobb', 15, 3, true, 'fördjupningskurs', 'Ekonomi', 'civ_industriell_ekonomi', 'Självständigt arbete')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- LÄKARPROGRAMMET
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('KI1001', 'KI1001', 'Medicinens grunder', 15, 1, true, 'professionskurs', 'Medicin', 'lakarprogrammet', 'Introduktion till medicin och vetenskapligt tänkande'),
('KI1002', 'KI1002', 'Människokroppen', 30, 1, true, 'professionskurs', 'Medicin', 'lakarprogrammet', 'Anatomi och histologi'),
('KI1003', 'KI1003', 'Fysiologi och biokemi', 15, 1, true, 'professionskurs', 'Medicin', 'lakarprogrammet', 'Kroppens funktioner på cellulär nivå'),
-- År 2
('KI2001', 'KI2001', 'Sjukdomslära', 30, 2, true, 'professionskurs', 'Medicin', 'lakarprogrammet', 'Patologi och sjukdomsmekanismer'),
('KI2002', 'KI2002', 'Klinisk medicin introduktion', 15, 2, true, 'professionskurs', 'Medicin', 'lakarprogrammet', 'Klinisk undersökningsteknik'),
('KI2003', 'KI2003', 'Mikrobiologi och immunologi', 15, 2, true, 'professionskurs', 'Medicin', 'lakarprogrammet', 'Infektionssjukdomar och immunförsvar'),
-- År 3
('KI3001', 'KI3001', 'Kirurgi', 15, 3, true, 'professionskurs', 'Medicin', 'lakarprogrammet', 'Kirurgiska principer och praktik'),
('KI3002', 'KI3002', 'Internmedicin', 15, 3, true, 'professionskurs', 'Medicin', 'lakarprogrammet', 'Invärtesmedicin'),
('KI3003', 'KI3003', 'Psykiatri', 10, 3, true, 'professionskurs', 'Medicin', 'lakarprogrammet', 'Psykiatriska sjukdomar'),
('KI3004', 'KI3004', 'Pediatrik', 10, 3, true, 'professionskurs', 'Medicin', 'lakarprogrammet', 'Barnmedicin'),
('KI3005', 'KI3005', 'Obstetrik och gynekologi', 10, 3, true, 'professionskurs', 'Medicin', 'lakarprogrammet', 'Kvinnosjukvård och förlossning')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- SJUKSKÖTERSKEPROGRAMMET
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('OM1001', 'OM1001', 'Omvårdnadens grunder', 15, 1, true, 'professionskurs', 'Omvårdnad', 'sjukskoterskeprogrammet', 'Grundläggande omvårdnad och etik'),
('OM1002', 'OM1002', 'Anatomi och fysiologi', 15, 1, true, 'professionskurs', 'Medicin', 'sjukskoterskeprogrammet', 'Kroppens uppbyggnad och funktion'),
('OM1003', 'OM1003', 'Biokemi och farmakologi', 15, 1, true, 'professionskurs', 'Medicin', 'sjukskoterskeprogrammet', 'Läkemedel och biokemiska processer'),
('OM1004', 'OM1004', 'Verksamhetsförlagd utbildning 1', 15, 1, true, 'professionskurs', 'Omvårdnad', 'sjukskoterskeprogrammet', 'Praktik inom vården'),
-- År 2
('OM2001', 'OM2001', 'Sjukdomslära', 15, 2, true, 'professionskurs', 'Medicin', 'sjukskoterskeprogrammet', 'Patofysiologi och sjukdomstillstånd'),
('OM2002', 'OM2002', 'Klinisk omvårdnad', 15, 2, true, 'professionskurs', 'Omvårdnad', 'sjukskoterskeprogrammet', 'Praktisk omvårdnad'),
('OM2003', 'OM2003', 'Psykiatri och psykisk hälsa', 15, 2, true, 'professionskurs', 'Omvårdnad', 'sjukskoterskeprogrammet', 'Psykiatrisk omvårdnad'),
('OM2004', 'OM2004', 'Verksamhetsförlagd utbildning 2', 15, 2, true, 'professionskurs', 'Omvårdnad', 'sjukskoterskeprogrammet', 'Fördjupad klinisk praktik'),
-- År 3
('OM3001', 'OM3001', 'Avancerad omvårdnad', 15, 3, true, 'professionskurs', 'Omvårdnad', 'sjukskoterskeprogrammet', 'Specialiserad omvårdnad'),
('OM3002', 'OM3002', 'Folkhälsa och hälsofrämjande', 7.5, 3, true, 'professionskurs', 'Omvårdnad', 'sjukskoterskeprogrammet', 'Preventivt arbete och folkhälsa'),
('OM3003', 'OM3003', 'Verksamhetsförlagd utbildning 3', 22.5, 3, true, 'professionskurs', 'Omvårdnad', 'sjukskoterskeprogrammet', 'Avslutande klinisk praktik'),
('OM3004', 'OM3004', 'Examensarbete', 15, 3, true, 'professionskurs', 'Omvårdnad', 'sjukskoterskeprogrammet', 'Självständigt vetenskapligt arbete')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- PSYKOLOGPROGRAMMET
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('PS1001', 'PS1001', 'Psykologins grunder', 30, 1, true, 'grundkurs', 'Psykologi', 'psykologprogrammet', 'Introduktion till psykologins huvudområden'),
('PS1002', 'PS1002', 'Utvecklingspsykologi', 15, 1, true, 'grundkurs', 'Psykologi', 'psykologprogrammet', 'Människans utveckling genom livet'),
('PS1003', 'PS1003', 'Biologisk psykologi', 15, 1, true, 'grundkurs', 'Psykologi', 'psykologprogrammet', 'Hjärnans funktion och beteende'),
-- År 2
('PS2001', 'PS2001', 'Socialpsykologi', 15, 2, true, 'fördjupningskurs', 'Psykologi', 'psykologprogrammet', 'Gruppdynamik och social påverkan'),
('PS2002', 'PS2002', 'Klinisk psykologi', 15, 2, true, 'fördjupningskurs', 'Psykologi', 'psykologprogrammet', 'Psykiska störningar och behandling'),
('PS2003', 'PS2003', 'Kognitiv psykologi', 15, 2, true, 'fördjupningskurs', 'Psykologi', 'psykologprogrammet', 'Tänkande, minne och perception'),
('PS2004', 'PS2004', 'Psykologisk metodik', 15, 2, true, 'fördjupningskurs', 'Psykologi', 'psykologprogrammet', 'Forskningsmetoder i psykologi'),
-- År 3
('PS3001', 'PS3001', 'Personlighetspsykologi', 15, 3, true, 'fördjupningskurs', 'Psykologi', 'psykologprogrammet', 'Personlighetsteorier och bedömning'),
('PS3002', 'PS3002', 'Psykoterapi och behandling', 15, 3, true, 'avancerad', 'Psykologi', 'psykologprogrammet', 'Terapeutiska metoder'),
('PS3003', 'PS3003', 'Verksamhetsförlagd utbildning', 15, 3, true, 'professionskurs', 'Psykologi', 'psykologprogrammet', 'Praktik inom psykologyrket'),
('PS3004', 'PS3004', 'Examensarbete psykologi', 15, 3, true, 'avancerad', 'Psykologi', 'psykologprogrammet', 'Självständigt vetenskapligt arbete')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- JURISTPROGRAMMET
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('JU1001', 'JU1001', 'Introduktion till juridiken', 7.5, 1, true, 'grundkurs', 'Juridik', 'juristprogrammet', 'Rättsvetenskapens grunder'),
('JU1002', 'JU1002', 'Förmögenhetsrätt', 22.5, 1, true, 'grundkurs', 'Juridik', 'juristprogrammet', 'Avtalsrätt och obligationsrätt'),
('JU1003', 'JU1003', 'Associationsrätt', 15, 1, true, 'grundkurs', 'Juridik', 'juristprogrammet', 'Bolagsrätt och föreningsrätt'),
('JU1004', 'JU1004', 'Offentlig rätt', 15, 1, true, 'grundkurs', 'Juridik', 'juristprogrammet', 'Statsrätt och förvaltningsrätt'),
-- År 2
('JU2001', 'JU2001', 'Straffrätt', 22.5, 2, true, 'fördjupningskurs', 'Juridik', 'juristprogrammet', 'Brott och straff'),
('JU2002', 'JU2002', 'Processrätt', 22.5, 2, true, 'fördjupningskurs', 'Juridik', 'juristprogrammet', 'Domstolsförfaranden'),
('JU2003', 'JU2003', 'Skatterätt', 15, 2, true, 'fördjupningskurs', 'Juridik', 'juristprogrammet', 'Skattelagstiftning'),
-- År 3
('JU3001', 'JU3001', 'Arbetsrätt', 15, 3, true, 'fördjupningskurs', 'Juridik', 'juristprogrammet', 'Arbetsrättslig reglering'),
('JU3002', 'JU3002', 'EU-rätt', 15, 3, true, 'fördjupningskurs', 'Juridik', 'juristprogrammet', 'EU:s rättsordning'),
('JU3003', 'JU3003', 'Miljörätt', 7.5, 3, false, 'fördjupningskurs', 'Juridik', 'juristprogrammet', 'Miljölagstiftning'),
('JU3004', 'JU3004', 'Familjerätt', 7.5, 3, false, 'fördjupningskurs', 'Juridik', 'juristprogrammet', 'Familjerättsliga frågor')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- EKONOMPROGRAMMET
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('EK1001', 'EK1001', 'Företagsekonomi grund', 15, 1, true, 'grundkurs', 'Ekonomi', 'ekonomprogrammet', 'Introduktion till företagsekonomi'),
('EK1002', 'EK1002', 'Mikroekonomi', 15, 1, true, 'grundkurs', 'Ekonomi', 'ekonomprogrammet', 'Ekonomisk teori på mikronivå'),
('EK1003', 'EK1003', 'Makroekonomi', 15, 1, true, 'grundkurs', 'Ekonomi', 'ekonomprogrammet', 'Nationalekonomi och konjunkturer'),
('ST1001', 'ST1001', 'Statistik för ekonomer', 15, 1, true, 'grundkurs', 'Statistik', 'ekonomprogrammet', 'Statistiska metoder för ekonomer'),
-- År 2
('EK2001', 'EK2001', 'Redovisning och bokföring', 15, 2, true, 'fördjupningskurs', 'Ekonomi', 'ekonomprogrammet', 'Extern redovisning'),
('EK2002', 'EK2002', 'Marknadsföring', 15, 2, true, 'fördjupningskurs', 'Ekonomi', 'ekonomprogrammet', 'Marknadsföringsstrategier'),
('EK2003', 'EK2003', 'Finansiell ekonomi', 15, 2, true, 'fördjupningskurs', 'Ekonomi', 'ekonomprogrammet', 'Finansiering och kapitalmarknader'),
('EK2004', 'EK2004', 'Ekonometri', 15, 2, true, 'fördjupningskurs', 'Ekonomi', 'ekonomprogrammet', 'Ekonomisk statistik'),
-- År 3
('EK3001', 'EK3001', 'Strategisk management', 15, 3, false, 'fördjupningskurs', 'Ekonomi', 'ekonomprogrammet', 'Strategisk företagsledning'),
('EK3002', 'EK3002', 'Internationell ekonomi', 15, 3, false, 'fördjupningskurs', 'Ekonomi', 'ekonomprogrammet', 'Internationell handel och finans'),
('EK3003', 'EK3003', 'Corporate Finance', 15, 3, false, 'fördjupningskurs', 'Ekonomi', 'ekonomprogrammet', 'Företagsfinansiering'),
('EK3900', 'EK3900', 'Kandidatuppsats', 15, 3, true, 'fördjupningskurs', 'Ekonomi', 'ekonomprogrammet', 'Självständigt vetenskapligt arbete')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- KANDIDATPROGRAM I BIOLOGI
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('BIO101', 'BIO101', 'Biologi I', 15, 1, true, 'grundkurs', 'Biologi', 'kand_biologi', 'Introduktion till biologi'),
('KEM101', 'KEM101', 'Kemi för biologer', 15, 1, true, 'grundkurs', 'Kemi', 'kand_biologi', 'Grundläggande kemi'),
('BIO102', 'BIO102', 'Cellbiologi', 15, 1, true, 'grundkurs', 'Biologi', 'kand_biologi', 'Cellens uppbyggnad och funktion'),
('MAT101', 'MAT101', 'Matematik för biologer', 7.5, 1, true, 'grundkurs', 'Matematik', 'kand_biologi', 'Matematiska verktyg för biologer'),
('STA101', 'STA101', 'Biostatistik', 7.5, 1, true, 'grundkurs', 'Statistik', 'kand_biologi', 'Statistik för biologisk forskning'),
-- År 2
('BIO201', 'BIO201', 'Genetik', 15, 2, true, 'fördjupningskurs', 'Biologi', 'kand_biologi', 'Ärftlighet och DNA'),
('BIO202', 'BIO202', 'Ekologi', 15, 2, true, 'fördjupningskurs', 'Biologi', 'kand_biologi', 'Ekosystem och populationer'),
('BIO203', 'BIO203', 'Mikrobiologi', 15, 2, true, 'fördjupningskurs', 'Biologi', 'kand_biologi', 'Bakterier, virus och svampar'),
('BIO204', 'BIO204', 'Evolution', 15, 2, true, 'fördjupningskurs', 'Biologi', 'kand_biologi', 'Evolutionsteori och artbildning'),
-- År 3
('BIO301', 'BIO301', 'Molekylärbiologi', 15, 3, false, 'fördjupningskurs', 'Biologi', 'kand_biologi', 'Molekylära mekanismer i cellen'),
('BIO302', 'BIO302', 'Fysiologi', 15, 3, false, 'fördjupningskurs', 'Biologi', 'kand_biologi', 'Organismers funktioner'),
('BIO303', 'BIO303', 'Biokemi', 15, 3, false, 'fördjupningskurs', 'Biologi', 'kand_biologi', 'Biologisk kemi'),
('BIO399', 'BIO399', 'Kandidatarbete biologi', 15, 3, true, 'fördjupningskurs', 'Biologi', 'kand_biologi', 'Självständigt vetenskapligt arbete')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- KANDIDATPROGRAM I DATAVETENSKAP
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('CS101', 'CS101', 'Programmering I', 7.5, 1, true, 'grundkurs', 'Datavetenskap', 'kand_datavetenskap', 'Introduktion till programmering'),
('CS102', 'CS102', 'Programmering II', 7.5, 1, true, 'grundkurs', 'Datavetenskap', 'kand_datavetenskap', 'Fortsättningskurs i programmering'),
('MA101', 'MA101', 'Matematisk analys', 7.5, 1, true, 'grundkurs', 'Matematik', 'kand_datavetenskap', 'Grundläggande analys'),
('MA102', 'MA102', 'Diskret matematik', 7.5, 1, true, 'grundkurs', 'Matematik', 'kand_datavetenskap', 'Kombinatorik och grafteori'),
('CS103', 'CS103', 'Datastrukturer', 7.5, 1, true, 'grundkurs', 'Datavetenskap', 'kand_datavetenskap', 'Grundläggande datastrukturer'),
('CS104', 'CS104', 'Objektorienterad programmering', 7.5, 1, true, 'grundkurs', 'Datavetenskap', 'kand_datavetenskap', 'OOP-principer och design'),
-- År 2
('CS201', 'CS201', 'Algoritmer och datastrukturer', 7.5, 2, true, 'fördjupningskurs', 'Datavetenskap', 'kand_datavetenskap', 'Avancerade algoritmer'),
('CS202', 'CS202', 'Databaser', 7.5, 2, true, 'fördjupningskurs', 'Datavetenskap', 'kand_datavetenskap', 'Relationsdatabaser och SQL'),
('CS203', 'CS203', 'Operativsystem', 7.5, 2, true, 'fördjupningskurs', 'Datavetenskap', 'kand_datavetenskap', 'OS-arkitektur och principer'),
('CS204', 'CS204', 'Webbutveckling', 7.5, 2, true, 'fördjupningskurs', 'Datavetenskap', 'kand_datavetenskap', 'Frontend och backend utveckling'),
('CS205', 'CS205', 'Mjukvaruutveckling', 7.5, 2, true, 'fördjupningskurs', 'Datavetenskap', 'kand_datavetenskap', 'Mjukvaruprocesser och metodik'),
-- År 3
('CS301', 'CS301', 'Maskininlärning', 7.5, 3, false, 'fördjupningskurs', 'Datavetenskap', 'kand_datavetenskap', 'ML-algoritmer och tillämpningar'),
('CS302', 'CS302', 'IT-säkerhet', 7.5, 3, false, 'fördjupningskurs', 'Datavetenskap', 'kand_datavetenskap', 'Informationssäkerhet'),
('CS303', 'CS303', 'Distribuerade system', 7.5, 3, false, 'fördjupningskurs', 'Datavetenskap', 'kand_datavetenskap', 'Distribuerad arkitektur'),
('CS399', 'CS399', 'Kandidatarbete', 15, 3, true, 'fördjupningskurs', 'Datavetenskap', 'kand_datavetenskap', 'Självständigt vetenskapligt arbete')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- FÖRSKOLLÄRARPROGRAMMET
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('FÖ1001', 'FÖ1001', 'Förskolan i samhället', 15, 1, true, 'professionskurs', 'Utbildningsvetenskap', 'forskollararprogrammet', 'Förskolans uppdrag och historia'),
('FÖ1002', 'FÖ1002', 'Barns utveckling och lärande', 15, 1, true, 'professionskurs', 'Utbildningsvetenskap', 'forskollararprogrammet', 'Utvecklingspsykologi för förskolan'),
('FÖ1003', 'FÖ1003', 'Verksamhetsförlagd utbildning 1', 15, 1, true, 'professionskurs', 'Utbildningsvetenskap', 'forskollararprogrammet', 'Praktik i förskolan'),
('FÖ1004', 'FÖ1004', 'Pedagogiskt ledarskap', 15, 1, true, 'professionskurs', 'Utbildningsvetenskap', 'forskollararprogrammet', 'Ledarskap i pedagogisk verksamhet'),
-- År 2
('FÖ2001', 'FÖ2001', 'Språk och kommunikation', 15, 2, true, 'professionskurs', 'Utbildningsvetenskap', 'forskollararprogrammet', 'Språkutveckling hos barn'),
('FÖ2002', 'FÖ2002', 'Matematik och naturvetenskap', 15, 2, true, 'professionskurs', 'Utbildningsvetenskap', 'forskollararprogrammet', 'Matematiskt och naturvetenskapligt lärande'),
('FÖ2003', 'FÖ2003', 'Skapande verksamhet', 15, 2, true, 'professionskurs', 'Utbildningsvetenskap', 'forskollararprogrammet', 'Estetiska uttrycksformer'),
('FÖ2004', 'FÖ2004', 'Verksamhetsförlagd utbildning 2', 15, 2, true, 'professionskurs', 'Utbildningsvetenskap', 'forskollararprogrammet', 'Fördjupad praktik'),
-- År 3
('FÖ3001', 'FÖ3001', 'Specialpedagogik', 15, 3, true, 'professionskurs', 'Utbildningsvetenskap', 'forskollararprogrammet', 'Barn med särskilda behov'),
('FÖ3002', 'FÖ3002', 'Verksamhetsförlagd utbildning 3', 22.5, 3, true, 'professionskurs', 'Utbildningsvetenskap', 'forskollararprogrammet', 'Avslutande praktik'),
('FÖ3003', 'FÖ3003', 'Examensarbete', 15, 3, true, 'professionskurs', 'Utbildningsvetenskap', 'forskollararprogrammet', 'Självständigt vetenskapligt arbete')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- WEBBUTVECKLARE (YRKESHÖGSKOLA)
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('WEB101', 'WEB101', 'HTML och CSS', 20, 1, true, 'grundkurs', 'Webbutveckling', 'webbutvecklare', 'Grundläggande webbteknologier'),
('WEB102', 'WEB102', 'JavaScript grund', 30, 1, true, 'grundkurs', 'Webbutveckling', 'webbutvecklare', 'Programmering med JavaScript'),
('WEB103', 'WEB103', 'React och moderna ramverk', 30, 1, true, 'grundkurs', 'Webbutveckling', 'webbutvecklare', 'Frontend-ramverk'),
('WEB104', 'WEB104', 'Backend utveckling', 30, 1, true, 'grundkurs', 'Webbutveckling', 'webbutvecklare', 'Serverside-programmering'),
('WEB105', 'WEB105', 'Databaser', 20, 1, true, 'grundkurs', 'Webbutveckling', 'webbutvecklare', 'Databashantoring'),
('WEB106', 'WEB106', 'UX/UI Design', 20, 1, true, 'grundkurs', 'Design', 'webbutvecklare', 'Användbarhet och gränssnittsdesign'),
-- År 2
('WEB201', 'WEB201', 'Avancerad JavaScript', 30, 2, true, 'fördjupningskurs', 'Webbutveckling', 'webbutvecklare', 'Avancerade JS-koncept'),
('WEB202', 'WEB202', 'Cloud och DevOps', 20, 2, true, 'fördjupningskurs', 'Webbutveckling', 'webbutvecklare', 'Molntjänster och CI/CD'),
('WEB203', 'WEB203', 'Examensarbete', 30, 2, true, 'fördjupningskurs', 'Webbutveckling', 'webbutvecklare', 'Självständigt projektarbete'),
('LIA001', 'LIA001', 'LIA (Lärande i Arbete)', 80, 2, true, 'professionskurs', 'Webbutveckling', 'webbutvecklare', 'Praktik på företag')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- UX DESIGNER (YRKESHÖGSKOLA)
-- =====================================================
INSERT INTO university_courses (id, code, name, credits, year, mandatory, category, field, program_id, description) VALUES
-- År 1
('UX101', 'UX101', 'Introduktion till UX', 20, 1, true, 'grundkurs', 'Design', 'ux_designer', 'Grundläggande UX-principer'),
('UX102', 'UX102', 'Användarforskning', 30, 1, true, 'grundkurs', 'Design', 'ux_designer', 'Användarcentrerad design'),
('UX103', 'UX103', 'Prototyping och wireframing', 30, 1, true, 'grundkurs', 'Design', 'ux_designer', 'Designverktyg och prototyper'),
('UX104', 'UX104', 'Visual Design', 30, 1, true, 'grundkurs', 'Design', 'ux_designer', 'Visuell kommunikation'),
('UX105', 'UX105', 'Interaktionsdesign', 30, 1, true, 'grundkurs', 'Design', 'ux_designer', 'Designa interaktioner'),
('UX106', 'UX106', 'Frontend för designers', 20, 1, true, 'grundkurs', 'Design', 'ux_designer', 'HTML/CSS för designers'),
-- År 2
('UX201', 'UX201', 'Avancerad UX', 30, 2, true, 'fördjupningskurs', 'Design', 'ux_designer', 'Fördjupad UX-design'),
('UX202', 'UX202', 'Design system', 20, 2, true, 'fördjupningskurs', 'Design', 'ux_designer', 'Skapa designsystem'),
('UX203', 'UX203', 'Examensarbete', 30, 2, true, 'fördjupningskurs', 'Design', 'ux_designer', 'Självständigt projektarbete'),
('LIA002', 'LIA002', 'LIA (Lärande i Arbete)', 80, 2, true, 'professionskurs', 'Design', 'ux_designer', 'Praktik på företag')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  year = EXCLUDED.year,
  mandatory = EXCLUDED.mandatory,
  category = EXCLUDED.category,
  field = EXCLUDED.field,
  program_id = EXCLUDED.program_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- FUNCTION TO ASSIGN UNIVERSITY COURSES TO USER
-- =====================================================
CREATE OR REPLACE FUNCTION assign_university_courses_to_user(
  p_user_id UUID,
  p_program_id TEXT,
  p_year INTEGER DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  v_course RECORD;
BEGIN
  -- Get all mandatory courses for the program (optionally filtered by year)
  FOR v_course IN 
    SELECT id, code, name
    FROM university_courses
    WHERE program_id = p_program_id
      AND mandatory = true
      AND (p_year IS NULL OR year = p_year)
  LOOP
    -- Insert if not already enrolled
    INSERT INTO user_university_courses (id, user_id, course_id, progress, is_active)
    VALUES (
      p_user_id::text || '-' || v_course.id,
      p_user_id,
      v_course.id,
      0,
      true
    )
    ON CONFLICT (user_id, course_id) DO NOTHING;
    
    IF FOUND THEN
      v_count := v_count + 1;
      RAISE NOTICE 'Enrolled user in course: %', v_course.name;
    END IF;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION assign_university_courses_to_user(UUID, TEXT, INTEGER) TO authenticated;

-- =====================================================
-- VERIFY DATA
-- =====================================================
DO $$
DECLARE
  course_count INTEGER;
  program_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO course_count FROM university_courses;
  SELECT COUNT(DISTINCT program_id) INTO program_count FROM university_courses;
  
  RAISE NOTICE 'Total university courses: %', course_count;
  RAISE NOTICE 'Total programs with courses: %', program_count;
END;
$$;

-- Show course count per program
SELECT 
  program_id,
  COUNT(*) as total_courses,
  SUM(CASE WHEN mandatory THEN 1 ELSE 0 END) as mandatory_courses,
  SUM(credits) as total_credits
FROM university_courses
GROUP BY program_id
ORDER BY program_id;
