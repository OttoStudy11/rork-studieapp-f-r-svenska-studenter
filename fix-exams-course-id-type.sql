-- Fix exams table course_id to match courses table id type (TEXT)
-- The courses table uses TEXT ids (like "MATMAT01a"), not UUID

-- Drop existing foreign key constraint if it exists
ALTER TABLE exams 
  DROP CONSTRAINT IF EXISTS exams_course_id_fkey;

-- Ensure course_id is TEXT to match courses.id
ALTER TABLE exams 
  ALTER COLUMN course_id TYPE TEXT;

-- Add foreign key constraint with correct type
ALTER TABLE exams
  ADD CONSTRAINT exams_course_id_fkey 
  FOREIGN KEY (course_id) 
  REFERENCES courses(id) 
  ON DELETE SET NULL;

-- Add index for course_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON exams(course_id);

-- Add a composite index for user_id and course_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_exams_user_course ON exams(user_id, course_id);

-- Update helper function to get exams for a course (with TEXT course_id)
CREATE OR REPLACE FUNCTION get_course_exams(p_course_id TEXT, p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  exam_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  location TEXT,
  exam_type TEXT,
  status TEXT,
  grade TEXT,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.description,
    e.exam_date,
    e.duration_minutes,
    e.location,
    e.exam_type,
    e.status,
    e.grade,
    e.notes
  FROM exams e
  WHERE e.course_id = p_course_id
    AND e.user_id = p_user_id
  ORDER BY e.exam_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update helper function to get upcoming exams (with TEXT course_id)
CREATE OR REPLACE FUNCTION get_upcoming_exams(p_user_id UUID, days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  course_id TEXT,
  course_title TEXT,
  title TEXT,
  exam_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  location TEXT,
  exam_type TEXT,
  days_until INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.course_id,
    c.title as course_title,
    e.title,
    e.exam_date,
    e.duration_minutes,
    e.location,
    e.exam_type,
    EXTRACT(DAY FROM (e.exam_date - NOW()))::INTEGER as days_until
  FROM exams e
  LEFT JOIN courses c ON e.course_id = c.id
  WHERE e.user_id = p_user_id
    AND e.status = 'scheduled'
    AND e.exam_date >= NOW()
    AND e.exam_date <= NOW() + (days_ahead || ' days')::INTERVAL
  ORDER BY e.exam_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
