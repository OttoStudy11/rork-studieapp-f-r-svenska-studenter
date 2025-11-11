-- Add target_grade and update progress column in user_courses table
-- This allows users to set goal grades and track their course completion

-- Add target_grade column (A-F grading system)
ALTER TABLE user_courses 
ADD COLUMN IF NOT EXISTS target_grade VARCHAR(2) DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN user_courses.target_grade IS 'Target grade for the course (A, B, C, D, E, F)';
COMMENT ON COLUMN user_courses.progress IS 'Course completion percentage (0-100)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_courses_target_grade ON user_courses(target_grade);
CREATE INDEX IF NOT EXISTS idx_user_courses_progress ON user_courses(progress);
