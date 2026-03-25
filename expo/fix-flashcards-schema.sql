-- Fix flashcards table schema and indexes
-- Run this to ensure flashcards table exists with correct schema

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_flashcards_course_id;
DROP INDEX IF EXISTS idx_flashcards_module_id;
DROP INDEX IF EXISTS idx_flashcards_lesson_id;
DROP INDEX IF EXISTS idx_user_flashcard_progress_user_id;
DROP INDEX IF EXISTS idx_user_flashcard_progress_flashcard_id;
DROP INDEX IF EXISTS idx_user_flashcard_progress_next_review;

-- Create or recreate flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
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

-- Create user flashcard progress table if not exists
CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_flashcards_course_id ON public.flashcards(course_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_module_id ON public.flashcards(module_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_lesson_id ON public.flashcards(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_id ON public.user_flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_flashcard_id ON public.user_flashcard_progress(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_next_review ON public.user_flashcard_progress(next_review_at);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_flashcard ON public.user_flashcard_progress(user_id, flashcard_id);

-- Enable RLS
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can view their own flashcard progress" ON public.user_flashcard_progress;
DROP POLICY IF EXISTS "Users can insert their own flashcard progress" ON public.user_flashcard_progress;
DROP POLICY IF EXISTS "Users can update their own flashcard progress" ON public.user_flashcard_progress;

-- Create RLS policies
CREATE POLICY "Anyone can view flashcards"
  ON public.flashcards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own flashcard progress"
  ON public.user_flashcard_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcard progress"
  ON public.user_flashcard_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard progress"
  ON public.user_flashcard_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
