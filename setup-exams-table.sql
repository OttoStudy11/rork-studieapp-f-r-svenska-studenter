-- Complete setup for exams table with proper schema and RLS policies

-- Drop existing table if needed (for clean setup)
-- DROP TABLE IF EXISTS exams CASCADE;

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  exam_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  location TEXT,
  exam_type TEXT DEFAULT 'written' CHECK (exam_type IN ('written', 'oral', 'practical', 'online', 'other')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed', 'cancelled')),
  grade TEXT,
  notes TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  notification_time_before_minutes INTEGER DEFAULT 1440,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_exam_date ON exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_user_status ON exams(user_id, status);
CREATE INDEX IF NOT EXISTS idx_exams_user_date ON exams(user_id, exam_date DESC);

-- Enable Row Level Security
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own exams" ON exams;
DROP POLICY IF EXISTS "Users can insert their own exams" ON exams;
DROP POLICY IF EXISTS "Users can update their own exams" ON exams;
DROP POLICY IF EXISTS "Users can delete their own exams" ON exams;

-- Create RLS policies
CREATE POLICY "Users can view their own exams"
  ON exams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exams"
  ON exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams"
  ON exams FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams"
  ON exams FOR DELETE
  USING (auth.uid() = user_id);

-- Create or replace function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_exams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS exams_updated_at ON exams;

-- Create trigger for updated_at
CREATE TRIGGER exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_exams_updated_at();

-- Grant necessary permissions
GRANT ALL ON exams TO authenticated;
GRANT ALL ON exams TO service_role;

-- Verify table creation
SELECT 
  'Exams table setup completed successfully' AS message,
  COUNT(*) AS existing_exams
FROM exams;
