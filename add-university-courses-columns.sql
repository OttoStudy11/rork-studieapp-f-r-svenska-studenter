-- Step 1: Add missing columns to university_courses table
-- Run this FIRST in Supabase SQL Editor

-- Add code column
ALTER TABLE university_courses ADD COLUMN IF NOT EXISTS code TEXT;

-- Add mandatory column  
ALTER TABLE university_courses ADD COLUMN IF NOT EXISTS mandatory BOOLEAN DEFAULT true;

-- Add category column
ALTER TABLE university_courses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'grundkurs';

-- Add field column
ALTER TABLE university_courses ADD COLUMN IF NOT EXISTS field TEXT;

-- Add program_id column
ALTER TABLE university_courses ADD COLUMN IF NOT EXISTS program_id TEXT;

-- Add description column
ALTER TABLE university_courses ADD COLUMN IF NOT EXISTS description TEXT;

-- Add credits column
ALTER TABLE university_courses ADD COLUMN IF NOT EXISTS credits NUMERIC DEFAULT 7.5;

-- Add year column
ALTER TABLE university_courses ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT 1;

-- Update code from id where null
UPDATE university_courses SET code = id WHERE code IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_university_courses_code ON university_courses(code);
CREATE INDEX IF NOT EXISTS idx_university_courses_program_id ON university_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_university_courses_mandatory ON university_courses(mandatory);

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'university_courses'
ORDER BY ordinal_position;
