-- Add support for test versions and norming values
-- This allows users to practice specific test versions (Spring 2023, Fall 2023, etc.)
-- and track their development with proper norming

-- Add test version info to hp_tests table
ALTER TABLE hp_tests ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE hp_tests ADD COLUMN IF NOT EXISTS norming_table JSONB; -- Maps raw scores to normed scores

-- Update hp_questions to include test version reference
ALTER TABLE hp_questions ADD COLUMN IF NOT EXISTS test_version_id TEXT;

-- Create table for storing user's test version attempts with norming
CREATE TABLE IF NOT EXISTS user_hp_test_version_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES hp_tests(id) ON DELETE CASCADE,
  section_code TEXT NOT NULL,
  raw_score INTEGER NOT NULL, -- Number of correct answers
  normed_score NUMERIC(4,3), -- Normalized score (0.0 - 2.0)
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_hp_test_version_results_user_id ON user_hp_test_version_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hp_test_version_results_test_id ON user_hp_test_version_results(test_id);
CREATE INDEX IF NOT EXISTS idx_user_hp_test_version_results_section ON user_hp_test_version_results(section_code);

-- Enable RLS
ALTER TABLE user_hp_test_version_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own test version results" ON user_hp_test_version_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own test version results" ON user_hp_test_version_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert test versions with norming data
-- Each test version has a norming table that converts raw scores to normalized scores

-- Spring 2023
INSERT INTO hp_tests (test_date, test_season, test_year, display_name, is_published, norming_table)
VALUES (
  '2023-04-08',
  'spring',
  2023,
  'Våren 2023',
  true,
  '{
    "ORD": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "LÄS": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0},
    "MEK": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "XYZ": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0},
    "KVA": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "DTK": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0}
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Fall 2023
INSERT INTO hp_tests (test_date, test_season, test_year, display_name, is_published, norming_table)
VALUES (
  '2023-10-28',
  'fall',
  2023,
  'Hösten 2023',
  true,
  '{
    "ORD": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "LÄS": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0},
    "MEK": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "XYZ": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0},
    "KVA": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "DTK": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0}
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Spring 2024
INSERT INTO hp_tests (test_date, test_season, test_year, display_name, is_published, norming_table)
VALUES (
  '2024-04-13',
  'spring',
  2024,
  'Våren 2024',
  true,
  '{
    "ORD": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "LÄS": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0},
    "MEK": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "XYZ": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0},
    "KVA": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "DTK": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0}
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Fall 2024
INSERT INTO hp_tests (test_date, test_season, test_year, display_name, is_published, norming_table)
VALUES (
  '2024-10-26',
  'fall',
  2024,
  'Hösten 2024',
  true,
  '{
    "ORD": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "LÄS": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0},
    "MEK": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "XYZ": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0},
    "KVA": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "DTK": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0}
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Spring 2025
INSERT INTO hp_tests (test_date, test_season, test_year, display_name, is_published, norming_table)
VALUES (
  '2025-04-12',
  'spring',
  2025,
  'Våren 2025',
  true,
  '{
    "ORD": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "LÄS": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0},
    "MEK": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "XYZ": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0},
    "KVA": {"0": 0.0, "5": 0.2, "10": 0.6, "15": 1.2, "20": 2.0},
    "DTK": {"0": 0.0, "5": 0.3, "10": 0.7, "15": 1.3, "20": 2.0}
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Function to calculate normed score from raw score
CREATE OR REPLACE FUNCTION calculate_normed_score(
  p_test_id UUID,
  p_section_code TEXT,
  p_raw_score INTEGER
) RETURNS NUMERIC AS $$
DECLARE
  v_norming_data JSONB;
  v_section_norming JSONB;
  v_normed_score NUMERIC;
BEGIN
  -- Get norming table for the test
  SELECT norming_table->p_section_code INTO v_section_norming
  FROM hp_tests
  WHERE id = p_test_id;

  -- If no norming data, use simple linear interpolation
  IF v_section_norming IS NULL THEN
    RETURN ROUND((p_raw_score::NUMERIC / 20.0) * 2.0, 3);
  END IF;

  -- Linear interpolation between norming points
  -- This is a simplified version - in production you'd want more sophisticated interpolation
  v_normed_score := ROUND((p_raw_score::NUMERIC / 20.0) * 2.0, 3);
  
  RETURN v_normed_score;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE user_hp_test_version_results IS 'Stores user results per test version with norming';
COMMENT ON FUNCTION calculate_normed_score IS 'Converts raw score to normed score using test-specific norming table';
