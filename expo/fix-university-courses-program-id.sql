-- Fix university_courses table to add program_id column if missing
-- Run this in Supabase SQL Editor

-- Step 1: Add program_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'university_courses' 
    AND column_name = 'program_id'
  ) THEN
    ALTER TABLE university_courses ADD COLUMN program_id TEXT;
    RAISE NOTICE 'Added program_id column to university_courses';
  ELSE
    RAISE NOTICE 'program_id column already exists';
  END IF;
END $$;

-- Step 2: Add year column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'university_courses' 
    AND column_name = 'year'
  ) THEN
    ALTER TABLE university_courses ADD COLUMN year INTEGER DEFAULT 1;
    RAISE NOTICE 'Added year column to university_courses';
  ELSE
    RAISE NOTICE 'year column already exists';
  END IF;
END $$;

-- Step 3: Add mandatory column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'university_courses' 
    AND column_name = 'mandatory'
  ) THEN
    ALTER TABLE university_courses ADD COLUMN mandatory BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added mandatory column to university_courses';
  ELSE
    RAISE NOTICE 'mandatory column already exists';
  END IF;
END $$;

-- Step 4: Add field column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'university_courses' 
    AND column_name = 'field'
  ) THEN
    ALTER TABLE university_courses ADD COLUMN field TEXT DEFAULT 'Allmänt';
    RAISE NOTICE 'Added field column to university_courses';
  ELSE
    RAISE NOTICE 'field column already exists';
  END IF;
END $$;

-- Step 5: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_university_courses_program_id ON university_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_university_courses_year ON university_courses(year);
CREATE INDEX IF NOT EXISTS idx_university_courses_mandatory ON university_courses(mandatory);

-- Step 6: Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'university_courses'
ORDER BY ordinal_position;

-- Step 7: Show current row count
SELECT 'Total university courses:' as info, COUNT(*) as count FROM university_courses;
