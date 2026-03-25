-- Fix missing is_active column in user_university_courses table
-- Run this in Supabase SQL Editor

-- Add is_active column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_university_courses' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE user_university_courses ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added is_active column to user_university_courses';
  ELSE
    RAISE NOTICE 'is_active column already exists';
  END IF;
END $$;

-- Also ensure updated_at column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_university_courses' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE user_university_courses ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to user_university_courses';
  ELSE
    RAISE NOTICE 'updated_at column already exists';
  END IF;
END $$;

-- Ensure created_at column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_university_courses' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE user_university_courses ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added created_at column to user_university_courses';
  ELSE
    RAISE NOTICE 'created_at column already exists';
  END IF;
END $$;

-- Ensure progress column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_university_courses' 
    AND column_name = 'progress'
  ) THEN
    ALTER TABLE user_university_courses ADD COLUMN progress INTEGER DEFAULT 0;
    RAISE NOTICE 'Added progress column to user_university_courses';
  ELSE
    RAISE NOTICE 'progress column already exists';
  END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_university_courses'
ORDER BY ordinal_position;
