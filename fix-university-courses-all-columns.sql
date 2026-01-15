-- Fix university_courses table - add ALL missing columns
-- Run this in Supabase SQL Editor

-- Add all missing columns
DO $$
BEGIN
  -- Add code column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'university_courses' AND column_name = 'code') THEN
    ALTER TABLE university_courses ADD COLUMN code TEXT;
  END IF;
  
  -- Add mandatory column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'university_courses' AND column_name = 'mandatory') THEN
    ALTER TABLE university_courses ADD COLUMN mandatory BOOLEAN DEFAULT true;
  END IF;
  
  -- Add category column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'university_courses' AND column_name = 'category') THEN
    ALTER TABLE university_courses ADD COLUMN category TEXT DEFAULT 'grundkurs';
  END IF;
  
  -- Add field column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'university_courses' AND column_name = 'field') THEN
    ALTER TABLE university_courses ADD COLUMN field TEXT;
  END IF;
  
  -- Add program_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'university_courses' AND column_name = 'program_id') THEN
    ALTER TABLE university_courses ADD COLUMN program_id TEXT;
  END IF;
  
  -- Add description column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'university_courses' AND column_name = 'description') THEN
    ALTER TABLE university_courses ADD COLUMN description TEXT;
  END IF;
  
  -- Add credits column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'university_courses' AND column_name = 'credits') THEN
    ALTER TABLE university_courses ADD COLUMN credits NUMERIC DEFAULT 7.5;
  END IF;
  
  -- Add year column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'university_courses' AND column_name = 'year') THEN
    ALTER TABLE university_courses ADD COLUMN year INTEGER DEFAULT 1;
  END IF;
  
  RAISE NOTICE 'All columns added successfully';
END $$;

-- Update code from id where null
UPDATE university_courses SET code = id WHERE code IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_university_courses_code ON university_courses(code);
CREATE INDEX IF NOT EXISTS idx_university_courses_program_id ON university_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_university_courses_mandatory ON university_courses(mandatory);

-- Verify columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'university_courses'
ORDER BY ordinal_position;
