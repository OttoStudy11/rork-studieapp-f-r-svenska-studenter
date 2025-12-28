-- Fix Flashcards RLS Policies
-- The flashcards table is missing INSERT policy which prevents saving AI-generated flashcards

-- Drop existing policies first to recreate them properly
DROP POLICY IF EXISTS "Anyone can view flashcards" ON flashcards;
DROP POLICY IF EXISTS "Anyone can insert flashcards" ON flashcards;
DROP POLICY IF EXISTS "Anyone can update flashcards" ON flashcards;
DROP POLICY IF EXISTS "Anyone can delete flashcards" ON flashcards;

-- Recreate SELECT policy
CREATE POLICY "Anyone can view flashcards"
  ON flashcards FOR SELECT
  TO authenticated
  USING (true);

-- Add INSERT policy - allows authenticated users to insert flashcards
CREATE POLICY "Anyone can insert flashcards"
  ON flashcards FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy - allows authenticated users to update flashcards
CREATE POLICY "Anyone can update flashcards"
  ON flashcards FOR UPDATE
  TO authenticated
  USING (true);

-- Add DELETE policy - allows authenticated users to delete flashcards
CREATE POLICY "Anyone can delete flashcards"
  ON flashcards FOR DELETE
  TO authenticated
  USING (true);

-- Verify RLS is enabled
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Also ensure flashcard_decks has proper policies
DROP POLICY IF EXISTS "Anyone can view flashcard decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Anyone can insert flashcard decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Anyone can update flashcard decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Anyone can delete flashcard decks" ON flashcard_decks;

CREATE POLICY "Anyone can view flashcard decks"
  ON flashcard_decks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert flashcard decks"
  ON flashcard_decks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update flashcard decks"
  ON flashcard_decks FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can delete flashcard decks"
  ON flashcard_decks FOR DELETE
  TO authenticated
  USING (true);

ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
