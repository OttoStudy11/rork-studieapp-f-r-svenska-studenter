-- Fix study groups foreign key type mismatch
-- The courses table uses TEXT for id, not UUID

-- Drop the existing foreign key constraint if it exists
ALTER TABLE IF EXISTS study_groups 
  DROP CONSTRAINT IF EXISTS study_groups_course_id_fkey;

-- Change course_id from UUID to TEXT to match courses.id
ALTER TABLE IF EXISTS study_groups 
  ALTER COLUMN course_id TYPE TEXT;

-- Re-add the foreign key constraint with correct type
ALTER TABLE study_groups 
  ADD CONSTRAINT study_groups_course_id_fkey 
  FOREIGN KEY (course_id) 
  REFERENCES courses(id) 
  ON DELETE CASCADE;

-- Update index to work with TEXT
DROP INDEX IF EXISTS idx_study_groups_course;
CREATE INDEX idx_study_groups_course ON study_groups(course_id);
