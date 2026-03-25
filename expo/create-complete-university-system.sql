-- =====================================================
-- SKAPA KOMPLETT HÖGSKOLESYSTEM
-- =====================================================
-- Skapar universitet, högskolor, program och kurser
-- Motsvarande gymnasiesystemet men för högskola
-- =====================================================

BEGIN;

-- =====================================================
-- RADERA BEFINTLIGA TABELLER
-- =====================================================

DROP TABLE IF EXISTS university_program_courses CASCADE;
DROP TABLE IF EXISTS university_courses CASCADE;
DROP TABLE IF EXISTS user_university_courses CASCADE;
DROP TABLE IF EXISTS university_programs CASCADE;
DROP TABLE IF EXISTS universities CASCADE;

-- =====================================================
-- SKAPA UNIVERSITIES TABELL
-- =====================================================

CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  city TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('university', 'college', 'art_school', 'business_school', 'vocational_school', 'specialized_school')),
  category TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för snabbare sökningar
CREATE INDEX idx_universities_city ON universities(city);
CREATE INDEX idx_universities_type ON universities(type);
CREATE INDEX idx_universities_name ON universities(name);
CREATE INDEX idx_universities_category ON universities(category);

-- =====================================================
-- SKAPA UNIVERSITY_PROGRAMS TABELL
-- =====================================================

CREATE TABLE university_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  abbreviation TEXT,
  degree_type TEXT NOT NULL CHECK (degree_type IN ('kandidat', 'magister', 'master', 'civilingenjör', 'högskoleingenjör', 'yrkeshögskola', 'professionsprogram')),
  field TEXT NOT NULL,
  credits INTEGER NOT NULL,
  duration_years NUMERIC(2,1) NOT NULL,
  language TEXT DEFAULT 'svenska',
  description TEXT,
  admission_requirements TEXT,
  career_prospects TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(university_id, name)
);

CREATE INDEX idx_university_programs_university_id ON university_programs(university_id);
CREATE INDEX idx_university_programs_degree_type ON university_programs(degree_type);
CREATE INDEX idx_university_programs_field ON university_programs(field);

-- =====================================================
-- SKAPA UNIVERSITY_COURSES TABELL
-- =====================================================

CREATE TABLE university_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('grundnivå', 'avancerad nivå', 'forskarnivå')),
  subject_area TEXT NOT NULL,
  prerequisites TEXT[],
  learning_outcomes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_university_courses_course_code ON university_courses(course_code);
CREATE INDEX idx_university_courses_subject_area ON university_courses(subject_area);
CREATE INDEX idx_university_courses_level ON university_courses(level);

-- =====================================================
-- SKAPA UNIVERSITY_PROGRAM_COURSES KOPPLINGSTABEL
-- =====================================================

CREATE TABLE university_program_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES university_programs(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(program_id, course_id, semester)
);

CREATE INDEX idx_university_program_courses_program_id ON university_program_courses(program_id);
CREATE INDEX idx_university_program_courses_course_id ON university_program_courses(course_id);

-- =====================================================
-- SKAPA USER_UNIVERSITY_COURSES TABELL
-- =====================================================

CREATE TABLE user_university_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES university_programs(id) ON DELETE SET NULL,
  course_id UUID NOT NULL REFERENCES university_courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pågående' CHECK (status IN ('pågående', 'godkänd', 'underkänd', 'pausad')),
  grade TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_user_university_courses_user_id ON user_university_courses(user_id);
CREATE INDEX idx_user_university_courses_program_id ON user_university_courses(program_id);
CREATE INDEX idx_user_university_courses_course_id ON user_university_courses(course_id);

-- =====================================================
-- AKTIVERA RLS PÅ ALLA TABELLER
-- =====================================================

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_program_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_university_courses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SKAPA RLS POLICIES
-- =====================================================

-- Alla kan läsa universities
CREATE POLICY "Anyone can view universities"
  ON universities FOR SELECT
  USING (true);

-- Alla kan läsa university_programs
CREATE POLICY "Anyone can view university programs"
  ON university_programs FOR SELECT
  USING (true);

-- Alla kan läsa university_courses
CREATE POLICY "Anyone can view university courses"
  ON university_courses FOR SELECT
  USING (true);

-- Alla kan läsa university_program_courses
CREATE POLICY "Anyone can view university program courses"
  ON university_program_courses FOR SELECT
  USING (true);

-- Users kan läsa sina egna user_university_courses
CREATE POLICY "Users can view own university courses"
  ON user_university_courses FOR SELECT
  USING (auth.uid() = user_id);

-- Users kan uppdatera sina egna user_university_courses
CREATE POLICY "Users can update own university courses"
  ON user_university_courses FOR UPDATE
  USING (auth.uid() = user_id);

-- Users kan skapa sina egna user_university_courses
CREATE POLICY "Users can insert own university courses"
  ON user_university_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users kan radera sina egna user_university_courses
CREATE POLICY "Users can delete own university courses"
  ON user_university_courses FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'Tabeller skapade!' as status;
