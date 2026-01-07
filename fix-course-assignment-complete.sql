-- ============================================================================
-- FIX COURSE ASSIGNMENT DURING ACCOUNT CREATION
-- ============================================================================
-- This script ensures courses are properly assigned during onboarding
-- for both gymnasium and university students
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENSURE COURSES TABLE HAS CORRECT SCHEMA
-- ============================================================================

-- Make sure courses table exists with correct structure
DO $$ 
BEGIN
  -- Check if courses table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    CREATE TABLE public.courses (
      id TEXT PRIMARY KEY,
      course_code TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      subject TEXT NOT NULL,
      level TEXT NOT NULL CHECK (level IN ('gymnasie', 'högskola')),
      points NUMERIC DEFAULT 0,
      resources JSONB DEFAULT '[]'::jsonb,
      tips JSONB DEFAULT '[]'::jsonb,
      progress INTEGER DEFAULT 0,
      related_courses JSONB DEFAULT '[]'::jsonb,
      course_status TEXT DEFAULT 'active',
      education_level TEXT,
      education_year INTEGER,
      semester INTEGER,
      program_id TEXT,
      school_id TEXT,
      emoji TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  ELSE
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'course_status') THEN
      ALTER TABLE public.courses ADD COLUMN course_status TEXT DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'education_level') THEN
      ALTER TABLE public.courses ADD COLUMN education_level TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'education_year') THEN
      ALTER TABLE public.courses ADD COLUMN education_year INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'semester') THEN
      ALTER TABLE public.courses ADD COLUMN semester INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'program_id') THEN
      ALTER TABLE public.courses ADD COLUMN program_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'school_id') THEN
      ALTER TABLE public.courses ADD COLUMN school_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'emoji') THEN
      ALTER TABLE public.courses ADD COLUMN emoji TEXT;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 2. ENSURE USER_COURSES TABLE HAS CORRECT SCHEMA
-- ============================================================================

-- Make sure user_courses table exists with correct structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_courses') THEN
    CREATE TABLE public.user_courses (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL,
      course_id TEXT NOT NULL,
      progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      is_active BOOLEAN DEFAULT true,
      target_grade TEXT,
      last_studied TIMESTAMPTZ,
      studied_hours NUMERIC DEFAULT 0,
      total_hours NUMERIC DEFAULT 0,
      manual_progress INTEGER DEFAULT 0 CHECK (manual_progress >= 0 AND manual_progress <= 100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, course_id)
    );
    
    -- Add foreign key constraints
    ALTER TABLE public.user_courses 
      ADD CONSTRAINT user_courses_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    
    ALTER TABLE public.user_courses 
      ADD CONSTRAINT user_courses_course_id_fkey 
      FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
  ELSE
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_courses' AND column_name = 'target_grade') THEN
      ALTER TABLE public.user_courses ADD COLUMN target_grade TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_courses' AND column_name = 'last_studied') THEN
      ALTER TABLE public.user_courses ADD COLUMN last_studied TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_courses' AND column_name = 'studied_hours') THEN
      ALTER TABLE public.user_courses ADD COLUMN studied_hours NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_courses' AND column_name = 'total_hours') THEN
      ALTER TABLE public.user_courses ADD COLUMN total_hours NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_courses' AND column_name = 'manual_progress') THEN
      ALTER TABLE public.user_courses ADD COLUMN manual_progress INTEGER DEFAULT 0 CHECK (manual_progress >= 0 AND manual_progress <= 100);
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON public.user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_course_id ON public.user_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_is_active ON public.user_courses(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_courses_progress ON public.user_courses(user_id, progress DESC);
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(course_status);
CREATE INDEX IF NOT EXISTS idx_courses_program ON public.courses(program_id);

-- ============================================================================
-- 4. SETUP RLS POLICIES (PERMISSIVE)
-- ============================================================================

-- Enable RLS on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can view courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can insert courses" ON public.courses;

-- Create permissive policies for courses
CREATE POLICY "Anyone can view active courses" ON public.courses
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert courses" ON public.courses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable RLS on user_courses table
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can insert their own courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can update their own courses" ON public.user_courses;
DROP POLICY IF EXISTS "Users can delete their own courses" ON public.user_courses;

-- Create permissive policies for user_courses
CREATE POLICY "Users can view their own courses" ON public.user_courses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses" ON public.user_courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses" ON public.user_courses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses" ON public.user_courses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. CREATE TRIGGER FUNCTION FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_courses_updated_at ON public.user_courses;
CREATE TRIGGER update_user_courses_updated_at
  BEFORE UPDATE ON public.user_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. INSERT SAMPLE GYMNASIUM COURSES (if they don't exist)
-- ============================================================================

-- Insert sample gymnasium courses
INSERT INTO public.courses (id, course_code, title, description, subject, level, points, course_status)
VALUES 
  ('MATMAT01a', 'MATMAT01a', 'Matematik 1a', 'Grundläggande matematikkurs med fokus på algebra och funktioner', 'Matematik', 'gymnasie', 100, 'active'),
  ('MATMAT01b', 'MATMAT01b', 'Matematik 1b', 'Grundläggande matematikkurs med teknisk inriktning', 'Matematik', 'gymnasie', 100, 'active'),
  ('MATMAT01c', 'MATMAT01c', 'Matematik 1c', 'Grundläggande matematikkurs med naturvetenskaplig inriktning', 'Matematik', 'gymnasie', 100, 'active'),
  ('SVESVE01', 'SVESVE01', 'Svenska 1', 'Grundläggande svenskkurs', 'Svenska', 'gymnasie', 100, 'active'),
  ('ENGENG05', 'ENGENG05', 'Engelska 5', 'Grundläggande engelskakurs', 'Engelska', 'gymnasie', 100, 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. VERIFY SETUP
-- ============================================================================

DO $$
DECLARE
  course_count INTEGER;
  user_course_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO course_count FROM public.courses;
  SELECT COUNT(*) INTO user_course_count FROM public.user_courses;
  
  RAISE NOTICE '✅ Setup complete!';
  RAISE NOTICE '📚 Total courses in database: %', course_count;
  RAISE NOTICE '👤 Total user course assignments: %', user_course_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Next steps:';
  RAISE NOTICE '1. Create a new account';
  RAISE NOTICE '2. Complete onboarding';
  RAISE NOTICE '3. Courses should be automatically assigned';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 To debug, check the browser console for:';
  RAISE NOTICE '   - "Creating course in database"';
  RAISE NOTICE '   - "Error inserting course"';
  RAISE NOTICE '   - "Error syncing user course"';
END $$;
