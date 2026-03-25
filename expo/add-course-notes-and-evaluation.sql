-- Add current_grade, self_evaluation, and notes columns to user_courses
ALTER TABLE user_courses 
  ADD COLUMN IF NOT EXISTS current_grade TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS self_evaluation INTEGER DEFAULT NULL CHECK (self_evaluation >= 1 AND self_evaluation <= 5),
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;

-- Same for university courses
ALTER TABLE user_university_courses 
  ADD COLUMN IF NOT EXISTS current_grade TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS self_evaluation INTEGER DEFAULT NULL CHECK (self_evaluation >= 1 AND self_evaluation <= 5),
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_university_courses_user_id ON user_university_courses(user_id);
