-- Fix flashcards table structure and add performance indexes
-- Run this in your Supabase SQL Editor

-- First, check if flashcards table exists and create/update it
DO $$ 
BEGIN
  -- Create flashcards table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'flashcards') THEN
    CREATE TABLE public.flashcards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
      module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
      lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 3),
      explanation TEXT,
      context TEXT,
      tags TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    RAISE NOTICE 'Created flashcards table';
  ELSE
    -- Table exists, ensure course_id column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'flashcards' 
      AND column_name = 'course_id'
    ) THEN
      ALTER TABLE public.flashcards ADD COLUMN course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE;
      RAISE NOTICE 'Added course_id column to flashcards table';
    END IF;
  END IF;
  
  -- Create user_flashcard_progress table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_flashcard_progress') THEN
    CREATE TABLE public.user_flashcard_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
      ease_factor DECIMAL(3, 2) NOT NULL DEFAULT 2.5,
      interval INTEGER NOT NULL DEFAULT 0,
      repetitions INTEGER NOT NULL DEFAULT 0,
      last_reviewed_at TIMESTAMPTZ,
      next_review_at TIMESTAMPTZ DEFAULT NOW(),
      quality INTEGER CHECK (quality >= 0 AND quality <= 5),
      total_reviews INTEGER NOT NULL DEFAULT 0,
      correct_reviews INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, flashcard_id)
    );
    RAISE NOTICE 'Created user_flashcard_progress table';
  END IF;
END $$;

-- Create indexes for flashcards
CREATE INDEX IF NOT EXISTS idx_flashcards_course_id ON public.flashcards(course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flashcards_module_id ON public.flashcards(module_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_lesson_id ON public.flashcards(lesson_id);

-- Create indexes for user_flashcard_progress
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_card ON public.user_flashcard_progress(user_id, flashcard_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_next_review ON public.user_flashcard_progress(user_id, next_review_at) WHERE next_review_at IS NOT NULL;

-- Enable RLS
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Authenticated users can insert flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Authenticated users can update flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Authenticated users can delete flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can view their own flashcard progress" ON public.user_flashcard_progress;
DROP POLICY IF EXISTS "Users can insert their own flashcard progress" ON public.user_flashcard_progress;
DROP POLICY IF EXISTS "Users can update their own flashcard progress" ON public.user_flashcard_progress;

-- Create RLS policies for flashcards
CREATE POLICY "Authenticated users can view flashcards" ON public.flashcards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert flashcards" ON public.flashcards
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update flashcards" ON public.flashcards
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete flashcards" ON public.flashcards
  FOR DELETE TO authenticated USING (true);

-- Create RLS policies for user_flashcard_progress
CREATE POLICY "Users can view their own flashcard progress" ON public.user_flashcard_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcard progress" ON public.user_flashcard_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard progress" ON public.user_flashcard_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_flashcards_updated_at ON public.flashcards;
CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_flashcard_progress_updated_at ON public.user_flashcard_progress;
CREATE TRIGGER update_user_flashcard_progress_updated_at
  BEFORE UPDATE ON public.user_flashcard_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Analyze tables
ANALYZE public.flashcards;
ANALYZE public.user_flashcard_progress;

-- Verify setup
SELECT 
  'Flashcards setup complete!' as status,
  (SELECT COUNT(*) FROM public.flashcards) as flashcards_count,
  (SELECT COUNT(*) FROM public.user_flashcard_progress) as user_progress_count;
