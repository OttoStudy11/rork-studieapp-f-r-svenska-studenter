-- Create exams table for users to schedule and track their exams
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  exam_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  location TEXT,
  exam_type TEXT DEFAULT 'written',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed', 'cancelled')),
  grade TEXT,
  notes TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  notification_time_before_minutes INTEGER DEFAULT 1440,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_exam_date ON exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own exams"
  ON exams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exams"
  ON exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams"
  ON exams FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams"
  ON exams FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_exams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_exams_updated_at();
