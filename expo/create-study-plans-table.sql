-- Create study_plans table for persisting AI-generated study plans
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique constraint on user_id + course_id for upsert
CREATE UNIQUE INDEX IF NOT EXISTS study_plans_user_course_unique
  ON study_plans (user_id, course_id);

-- Create index for fast lookups by user
CREATE INDEX IF NOT EXISTS study_plans_user_id_idx ON study_plans (user_id);

-- Enable RLS
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

-- Users can only read their own study plans
CREATE POLICY "Users can read own study plans"
  ON study_plans FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own study plans
CREATE POLICY "Users can insert own study plans"
  ON study_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own study plans
CREATE POLICY "Users can update own study plans"
  ON study_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own study plans
CREATE POLICY "Users can delete own study plans"
  ON study_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_study_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER study_plans_updated_at_trigger
  BEFORE UPDATE ON study_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_study_plans_updated_at();
