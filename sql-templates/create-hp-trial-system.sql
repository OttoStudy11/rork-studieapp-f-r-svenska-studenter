-- Högskoleprovet Free Trial System
-- Allows free users to try one complete test or one section

-- Create table to track trial usage
CREATE TABLE IF NOT EXISTS hp_trial_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_type TEXT NOT NULL CHECK (trial_type IN ('full_test', 'section')),
  trial_target TEXT NOT NULL, -- section code (e.g., 'ORD') or 'full_test'
  test_version_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  total_questions INTEGER,
  correct_answers INTEGER,
  score_percentage NUMERIC(5,2),
  estimated_hp_score NUMERIC(3,2),
  time_spent_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, trial_type, trial_target)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hp_trial_usage_user_id ON hp_trial_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_hp_trial_usage_user_status ON hp_trial_usage(user_id, status);

-- Enable RLS
ALTER TABLE hp_trial_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own trial usage" ON hp_trial_usage;
CREATE POLICY "Users can view their own trial usage"
  ON hp_trial_usage FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own trial usage" ON hp_trial_usage;
CREATE POLICY "Users can insert their own trial usage"
  ON hp_trial_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trial usage" ON hp_trial_usage;
CREATE POLICY "Users can update their own trial usage"
  ON hp_trial_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to check if user has available trial
CREATE OR REPLACE FUNCTION check_hp_trial_available(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_trial_count INTEGER;
  v_is_premium BOOLEAN;
BEGIN
  -- Check if user is premium
  SELECT subscription_type = 'premium' INTO v_is_premium
  FROM profiles
  WHERE id = p_user_id;
  
  -- Premium users don't need trial
  IF v_is_premium THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has already used trial
  SELECT COUNT(*) INTO v_trial_count
  FROM hp_trial_usage
  WHERE user_id = p_user_id
    AND status = 'completed';
  
  RETURN v_trial_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trial status for user
CREATE OR REPLACE FUNCTION get_hp_trial_status(p_user_id UUID)
RETURNS TABLE (
  has_trial_available BOOLEAN,
  trial_used BOOLEAN,
  trial_type TEXT,
  trial_target TEXT,
  trial_completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    check_hp_trial_available(p_user_id) as has_trial_available,
    EXISTS(
      SELECT 1 FROM hp_trial_usage 
      WHERE user_id = p_user_id AND status = 'completed'
    ) as trial_used,
    t.trial_type,
    t.trial_target,
    t.completed_at as trial_completed_at
  FROM hp_trial_usage t
  WHERE t.user_id = p_user_id
    AND t.status = 'completed'
  ORDER BY t.completed_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start trial
CREATE OR REPLACE FUNCTION start_hp_trial(
  p_user_id UUID,
  p_trial_type TEXT,
  p_trial_target TEXT,
  p_test_version_id TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_trial_id UUID;
  v_has_trial BOOLEAN;
BEGIN
  -- Check if trial is available
  SELECT check_hp_trial_available(p_user_id) INTO v_has_trial;
  
  IF NOT v_has_trial THEN
    RAISE EXCEPTION 'Trial not available for this user';
  END IF;
  
  -- Insert trial record
  INSERT INTO hp_trial_usage (
    user_id,
    trial_type,
    trial_target,
    test_version_id,
    status
  ) VALUES (
    p_user_id,
    p_trial_type,
    p_trial_target,
    p_test_version_id,
    'in_progress'
  )
  RETURNING id INTO v_trial_id;
  
  RETURN v_trial_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete trial
CREATE OR REPLACE FUNCTION complete_hp_trial(
  p_trial_id UUID,
  p_total_questions INTEGER,
  p_correct_answers INTEGER,
  p_score_percentage NUMERIC,
  p_estimated_hp_score NUMERIC,
  p_time_spent_minutes INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE hp_trial_usage
  SET 
    status = 'completed',
    completed_at = NOW(),
    total_questions = p_total_questions,
    correct_answers = p_correct_answers,
    score_percentage = p_score_percentage,
    estimated_hp_score = p_estimated_hp_score,
    time_spent_minutes = p_time_spent_minutes,
    updated_at = NOW()
  WHERE id = p_trial_id
    AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_hp_trial_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_hp_trial_usage_updated_at ON hp_trial_usage;
CREATE TRIGGER update_hp_trial_usage_updated_at
  BEFORE UPDATE ON hp_trial_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_hp_trial_updated_at();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON hp_trial_usage TO authenticated;
GRANT EXECUTE ON FUNCTION check_hp_trial_available TO authenticated;
GRANT EXECUTE ON FUNCTION get_hp_trial_status TO authenticated;
GRANT EXECUTE ON FUNCTION start_hp_trial TO authenticated;
GRANT EXECUTE ON FUNCTION complete_hp_trial TO authenticated;
