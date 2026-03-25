-- Fix university_courses table to add missing title column if it doesn't exist

-- Add title column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'university_courses' AND column_name = 'title'
  ) THEN
    ALTER TABLE university_courses ADD COLUMN title TEXT;
    RAISE NOTICE 'Added title column to university_courses';
  ELSE
    RAISE NOTICE 'Title column already exists in university_courses';
  END IF;
END $$;

-- Update title to be NOT NULL after adding default values
UPDATE university_courses 
SET title = course_code 
WHERE title IS NULL OR title = '';

-- Make title NOT NULL
ALTER TABLE university_courses ALTER COLUMN title SET NOT NULL;

-- Verify the fix
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'university_courses'
ORDER BY ordinal_position;
