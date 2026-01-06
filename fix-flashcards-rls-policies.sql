-- =====================================================
-- Fix Flashcards RLS Policies
-- =====================================================
-- IMPORTANT: Run this SQL in Supabase SQL Editor to fix flashcard generation
-- The flashcards table is missing INSERT policy which prevents saving AI-generated flashcards
-- =====================================================

-- Drop existing policies first to recreate them properly
DROP POLICY IF EXISTS "Anyone can view flashcards" ON flashcards;
DROP POLICY IF EXISTS "Anyone can insert flashcards" ON flashcards;
DROP POLICY IF EXISTS "Anyone can update flashcards" ON flashcards;
DROP POLICY IF EXISTS "Anyone can delete flashcards" ON flashcards;
DROP POLICY IF EXISTS "Authenticated users can view flashcards" ON flashcards;
DROP POLICY IF EXISTS "Authenticated users can insert flashcards" ON flashcards;
DROP POLICY IF EXISTS "Authenticated users can update flashcards" ON flashcards;
DROP POLICY IF EXISTS "Authenticated users can delete flashcards" ON flashcards;

-- Enable RLS on flashcards table
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Recreate SELECT policy - allows authenticated users to view all flashcards
CREATE POLICY "Authenticated users can view flashcards"
  ON flashcards FOR SELECT
  TO authenticated
  USING (true);

-- Add INSERT policy - allows authenticated users to insert flashcards (CRITICAL FOR AI GENERATION)
CREATE POLICY "Authenticated users can insert flashcards"
  ON flashcards FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy - allows authenticated users to update flashcards
CREATE POLICY "Authenticated users can update flashcards"
  ON flashcards FOR UPDATE
  TO authenticated
  USING (true);

-- Add DELETE policy - allows authenticated users to delete flashcards
CREATE POLICY "Authenticated users can delete flashcards"
  ON flashcards FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- Fix Flashcard Decks RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view flashcard decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Anyone can insert flashcard decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Anyone can update flashcard decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Anyone can delete flashcard decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Authenticated users can view flashcard decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Authenticated users can insert flashcard decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Authenticated users can update flashcard decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Authenticated users can delete flashcard decks" ON flashcard_decks;

ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view flashcard decks"
  ON flashcard_decks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert flashcard decks"
  ON flashcard_decks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update flashcard decks"
  ON flashcard_decks FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete flashcard decks"
  ON flashcard_decks FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- Fix User Flashcard Progress RLS Policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own flashcard progress" ON user_flashcard_progress;
DROP POLICY IF EXISTS "Users can insert their own flashcard progress" ON user_flashcard_progress;
DROP POLICY IF EXISTS "Users can update their own flashcard progress" ON user_flashcard_progress;
DROP POLICY IF EXISTS "Users can delete their own flashcard progress" ON user_flashcard_progress;

ALTER TABLE user_flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flashcard progress"
  ON user_flashcard_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcard progress"
  ON user_flashcard_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard progress"
  ON user_flashcard_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcard progress"
  ON user_flashcard_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- Verify Setup - Run this to check policies exist
-- =====================================================
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN ('flashcards', 'flashcard_decks', 'user_flashcard_progress');
