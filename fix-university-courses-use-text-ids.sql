-- =====================================================
-- ÄNDRA UNIVERSITY_COURSES TILL ATT ANVÄNDA TEXT ID
-- =====================================================
-- Ändrar från UUID till TEXT för att matcha gymnasium-systemet
-- Detta löser problemet med kurskoder som "SPEC-G2" etc.
-- =====================================================

BEGIN;

-- =====================================================
-- STEG 1: DROP BEFINTLIGA TABELLER OCH SKAPA OM
-- =====================================================

DROP TABLE IF EXISTS user_university_courses CASCADE;
DROP TABLE IF EXISTS university_program_courses CASCADE;
DROP TABLE IF EXISTS university_courses CASCADE;
DROP TABLE IF EXISTS university_programs CASCADE;
DROP TABLE IF EXISTS universities CASCADE;

-- =====================================================
-- STEG 2: SKAPA UNIVERSITIES TABELL
-- =====================================================

CREATE TABLE universities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('university', 'college', 'art_school', 'business_school', 'vocational_school', 'specialized_school')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_universities_city ON universities(city);
CREATE INDEX idx_universities_type ON universities(type);

-- =====================================================
-- STEG 3: SKAPA UNIVERSITY_PROGRAMS TABELL
-- =====================================================

CREATE TABLE university_programs (
  id TEXT PRIMARY KEY,
  university_id TEXT REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  abbreviation TEXT,
  degree_type TEXT NOT NULL CHECK (degree_type IN ('kandidat', 'magister', 'master', 'civilingenjör', 'högskoleingenjör', 'yrkeshögskola', 'professionsprogram')),
  field TEXT NOT NULL,
  credits INTEGER NOT NULL,
  duration_years NUMERIC(2,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, university_id)
);

CREATE INDEX idx_university_programs_university_id ON university_programs(university_id);
CREATE INDEX idx_university_programs_field ON university_programs(field);

-- =====================================================
-- STEG 4: SKAPA UNIVERSITY_COURSES TABELL (TEXT ID)
-- =====================================================

CREATE TABLE university_courses (
  id TEXT PRIMARY KEY,
  course_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL DEFAULT 7,
  level TEXT NOT NULL CHECK (level IN ('grundnivå', 'avancerad nivå', 'forskarnivå')),
  subject_area TEXT NOT NULL,
  prerequisites TEXT,
  learning_outcomes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_university_courses_course_code ON university_courses(course_code);
CREATE INDEX idx_university_courses_subject_area ON university_courses(subject_area);
CREATE INDEX idx_university_courses_level ON university_courses(level);

-- =====================================================
-- STEG 5: SKAPA UNIVERSITY_PROGRAM_COURSES (TEXT IDS)
-- =====================================================

CREATE TABLE university_program_courses (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES university_programs(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(program_id, course_id)
);

CREATE INDEX idx_university_program_courses_program_id ON university_program_courses(program_id);
CREATE INDEX idx_university_program_courses_course_id ON university_program_courses(course_id);

-- =====================================================
-- STEG 6: SKAPA USER_UNIVERSITY_COURSES (TEXT IDS)
-- =====================================================

CREATE TABLE user_university_courses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id TEXT REFERENCES university_programs(id) ON DELETE SET NULL,
  course_id TEXT NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_user_university_courses_user_id ON user_university_courses(user_id);
CREATE INDEX idx_user_university_courses_program_id ON user_university_courses(program_id);
CREATE INDEX idx_user_university_courses_course_id ON user_university_courses(course_id);

-- =====================================================
-- STEG 7: AKTIVERA RLS
-- =====================================================

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_program_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_courses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEG 8: SKAPA RLS POLICIES
-- =====================================================

CREATE POLICY "Anyone can view universities"
  ON universities FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view university programs"
  ON university_programs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view university courses"
  ON university_courses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view university program courses"
  ON university_program_courses FOR SELECT
  USING (true);

CREATE POLICY "Users can view own university courses"
  ON user_university_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own university courses"
  ON user_university_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own university courses"
  ON user_university_courses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own university courses"
  ON user_university_courses FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- STEG 9: LÄGG IN EXEMPEL-UNIVERSITET
-- =====================================================

INSERT INTO universities (id, name, city, type, category) VALUES
('kth', 'Kungliga Tekniska Högskolan', 'Stockholm', 'university', 'technical'),
('lu', 'Lunds Universitet', 'Lund', 'university', 'comprehensive'),
('gu', 'Göteborgs Universitet', 'Göteborg', 'university', 'comprehensive'),
('su', 'Stockholms Universitet', 'Stockholm', 'university', 'comprehensive'),
('uu', 'Uppsala Universitet', 'Uppsala', 'university', 'comprehensive'),
('ltu', 'Luleå Tekniska Universitet', 'Luleå', 'university', 'technical'),
('chalmers', 'Chalmers Tekniska Högskola', 'Göteborg', 'university', 'technical'),
('slu', 'Sveriges Lantbruksuniversitet', 'Uppsala', 'university', 'specialized'),
('ki', 'Karolinska Institutet', 'Stockholm', 'university', 'medical'),
('liu', 'Linköpings Universitet', 'Linköping', 'university', 'comprehensive')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEG 10: LÄGG IN EXEMPEL-PROGRAM
-- =====================================================

INSERT INTO university_programs (id, university_id, name, abbreviation, degree_type, field, credits, duration_years) VALUES
-- KTH Program
('civ-datateknik-kth', 'kth', 'Civilingenjör Datateknik', 'CDATE', 'civilingenjör', 'Teknik', 300, 5.0),
('civ-industriell-ekonomi-kth', 'kth', 'Civilingenjör Industriell Ekonomi', 'CIEEK', 'civilingenjör', 'Teknik/Ekonomi', 300, 5.0),
('hsk-datateknik-kth', 'kth', 'Högskoleingenjör Datateknik', 'TIDAA', 'högskoleingenjör', 'Teknik', 180, 3.0),

-- Lunds Universitet
('civ-datateknik-lu', 'lu', 'Civilingenjör Datateknik', 'D', 'civilingenjör', 'Teknik', 300, 5.0),
('civ-industriell-ekonomi-lu', 'lu', 'Civilingenjör Industriell Ekonomi', 'I', 'civilingenjör', 'Teknik/Ekonomi', 300, 5.0),
('ekonomprogrammet-lu', 'lu', 'Ekonomprogrammet', 'EKON', 'kandidat', 'Ekonomi', 180, 3.0),
('juristprogrammet-lu', 'lu', 'Juristprogrammet', 'JUR', 'professionsprogram', 'Juridik', 270, 4.5),
('lakarprogrammet-lu', 'lu', 'Läkarprogrammet', 'LÄK', 'professionsprogram', 'Medicin', 330, 5.5),
('psykologprogrammet-lu', 'lu', 'Psykologprogrammet', 'PSY', 'professionsprogram', 'Psykologi', 300, 5.0),

-- Göteborgs Universitet
('sjukskoterskeprogrammet-gu', 'gu', 'Sjuksköterskeprogrammet', 'SSK', 'professionsprogram', 'Vårdvetenskap', 180, 3.0),
('kand-datavetenskap-gu', 'gu', 'Kandidatprogram i Datavetenskap', 'DVKAN', 'kandidat', 'Naturvetenskap', 180, 3.0),

-- Stockholms Universitet
('ekonomprogrammet-su', 'su', 'Ekonomprogrammet', 'EKON', 'kandidat', 'Ekonomi', 180, 3.0),
('psykologprogrammet-su', 'su', 'Psykologprogrammet', 'PSY', 'professionsprogram', 'Psykologi', 300, 5.0)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEG 11: LÄGG IN EXEMPEL-KURSER (TEXT IDS)
-- =====================================================

-- Datateknik kurser (Civilingenjör)
INSERT INTO university_courses (id, course_code, title, description, credits, level, subject_area, prerequisites, learning_outcomes) VALUES
('FMAB20', 'FMAB20', 'Linjär Algebra', 'Grundläggande linjär algebra med vektorer, matriser och determinanter', 6, 'grundnivå', 'Matematik', 'Gymnasiematematik', 'Förstå och tillämpa linjär algebra'),
('EDAA45', 'EDAA45', 'Programmering Grundkurs', 'Introduktion till programmering med Java', 7, 'grundnivå', 'Datavetenskap', 'Inga', 'Kunna programmera i Java'),
('FMAA05', 'FMAA05', 'Endimensionell Analys', 'Envariabelanalys med derivata och integraler', 15, 'grundnivå', 'Matematik', 'Gymnasiematematik', 'Behärska envariabelanalys'),
('FMAA15', 'FMAA15', 'Diskret Matematik', 'Logik, mängdlära och kombinatorik', 5, 'grundnivå', 'Matematik', 'Gymnasiematematik', 'Förstå diskret matematik'),

-- Industriell Ekonomi kurser
('FMAB20-IE', 'FMAB20-IE', 'Linjär Algebra', 'Linjär algebra för ingenjörer', 6, 'grundnivå', 'Matematik', 'Gymnasiematematik', 'Tillämpa linjär algebra'),
('MIOF01', 'MIOF01', 'Företagsekonomi', 'Grundläggande företagsekonomi', 6, 'grundnivå', 'Ekonomi', 'Inga', 'Förstå företagsekonomi'),

-- Ekonomprogrammet kurser
('NEKN21', 'NEKN21', 'Mikroekonomi', 'Grundläggande mikroekonomisk teori', 15, 'grundnivå', 'Ekonomi', 'Inga', 'Behärska mikroekonomi'),
('FEKA01', 'FEKA01', 'Extern Redovisning', 'Finansiell redovisning och bokföring', 7, 'grundnivå', 'Ekonomi', 'Inga', 'Kunna bokföring'),

-- Jurist kurser
('JURA01', 'JURA01', 'Juridisk Introduktionskurs', 'Introduktion till rättsvetenskapen', 15, 'grundnivå', 'Juridik', 'Inga', 'Förstå juridisk metod'),
('JURA10', 'JURA10', 'Konstitutionell Rätt', 'Statsrätt och grundläggande rättigheter', 15, 'grundnivå', 'Juridik', 'JURA01', 'Behärska konstitutionell rätt'),

-- Läkarprogrammet kurser
('MEDA01', 'MEDA01', 'Cellbiologi och Genetik', 'Cellens uppbyggnad och funktion', 15, 'grundnivå', 'Medicin', 'Inga', 'Förstå cellbiologi'),
('MEDA10', 'MEDA10', 'Anatomi 1', 'Rörelseapparatens anatomi', 15, 'grundnivå', 'Medicin', 'Inga', 'Behärska grundläggande anatomi'),

-- Sjuksköterska kurser
('HSKA10', 'HSKA10', 'Anatomi och Fysiologi', 'Människokroppens uppbyggnad', 15, 'grundnivå', 'Medicin', 'Inga', 'Förstå anatomi och fysiologi'),
('HSKA20', 'HSKA20', 'Omvårdnad - Grunder', 'Grundläggande omvårdnadsteori', 15, 'grundnivå', 'Vårdvetenskap', 'Inga', 'Behärska grundläggande omvårdnad'),

-- Psykolog kurser
('PSY101', 'PSY101', 'Introduktion till Psykologi', 'Översikt av psykologins delområden', 15, 'grundnivå', 'Psykologi', 'Inga', 'Förstå psykologins grunder'),
('PSY102', 'PSY102', 'Biologisk Psykologi', 'Hjärnans struktur och funktion', 15, 'grundnivå', 'Psykologi', 'Inga', 'Behärska biologisk psykologi'),

-- Datavetenskap kandidat
('DT001', 'DT001', 'Introduktion till Programmering', 'Grundläggande Python-programmering', 7, 'grundnivå', 'Datavetenskap', 'Inga', 'Kunna programmera i Python'),
('DT002', 'DT002', 'Diskret Matematik för Datavetare', 'Logik och grafteori', 7, 'grundnivå', 'Matematik', 'Inga', 'Förstå diskret matematik'),

-- Högskoleingenjör kurser
('DVA117', 'DVA117', 'Programmering I', 'Grundläggande C-programmering', 7, 'grundnivå', 'Datavetenskap', 'Inga', 'Kunna programmera i C'),
('MAA115', 'MAA115', 'Matematik I', 'Linjär algebra och analys', 7, 'grundnivå', 'Matematik', 'Gymnasiematematik', 'Behärska grundläggande matematik')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEG 12: KOPPLA KURSER TILL PROGRAM
-- =====================================================

-- Civilingenjör Datateknik (KTH/LU) - År 1
INSERT INTO university_program_courses (id, program_id, course_id, semester, is_mandatory) VALUES
('civ-dt-fmab20', 'civ-datateknik-kth', 'FMAB20', 1, true),
('civ-dt-edaa45', 'civ-datateknik-kth', 'EDAA45', 1, true),
('civ-dt-fmaa05', 'civ-datateknik-kth', 'FMAA05', 1, true),
('civ-dt-fmaa15', 'civ-datateknik-kth', 'FMAA15', 2, true),

-- Civilingenjör Industriell Ekonomi - År 1
('civ-ie-fmab20', 'civ-industriell-ekonomi-kth', 'FMAB20-IE', 1, true),
('civ-ie-miof01', 'civ-industriell-ekonomi-kth', 'MIOF01', 1, true),

-- Ekonomprogrammet
('ekon-nekn21', 'ekonomprogrammet-lu', 'NEKN21', 1, true),
('ekon-feka01', 'ekonomprogrammet-lu', 'FEKA01', 1, true),

-- Juristprogrammet
('jur-jura01', 'juristprogrammet-lu', 'JURA01', 1, true),
('jur-jura10', 'juristprogrammet-lu', 'JURA10', 1, true),

-- Läkarprogrammet
('lak-meda01', 'lakarprogrammet-lu', 'MEDA01', 1, true),
('lak-meda10', 'lakarprogrammet-lu', 'MEDA10', 1, true),

-- Sjuksköterskeprogrammet
('ssk-hska10', 'sjukskoterskeprogrammet-gu', 'HSKA10', 1, true),
('ssk-hska20', 'sjukskoterskeprogrammet-gu', 'HSKA20', 1, true),

-- Psykologprogrammet
('psy-psy101', 'psykologprogrammet-lu', 'PSY101', 1, true),
('psy-psy102', 'psykologprogrammet-lu', 'PSY102', 1, true),

-- Kandidat Datavetenskap
('kand-dv-dt001', 'kand-datavetenskap-gu', 'DT001', 1, true),
('kand-dv-dt002', 'kand-datavetenskap-gu', 'DT002', 1, true),

-- Högskoleingenjör Datateknik
('hsk-dt-dva117', 'hsk-datateknik-kth', 'DVA117', 1, true),
('hsk-dt-maa115', 'hsk-datateknik-kth', 'MAA115', 1, true)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'University courses system fixed with TEXT IDs!' as status;
SELECT COUNT(*) as total_universities FROM universities;
SELECT COUNT(*) as total_programs FROM university_programs;
SELECT COUNT(*) as total_courses FROM university_courses;
SELECT COUNT(*) as total_program_courses FROM university_program_courses;
