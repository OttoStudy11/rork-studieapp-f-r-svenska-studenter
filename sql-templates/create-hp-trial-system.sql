-- Högskoleprov Trial System
-- Allows free users to try one full test OR one section before requiring premium

-- Create the trial tracking table
CREATE TABLE IF NOT EXISTS user_hp_trial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_type TEXT NOT NULL CHECK (trial_type IN ('full_test', 'delprov')),
  trial_content TEXT NOT NULL,
  trial_started_at TIMESTAMPTZ DEFAULT now(),
  trial_completed_at TIMESTAMPTZ,
  trial_score_percentage NUMERIC(5,2),
  trial_estimated_score NUMERIC(3,2),
  trial_total_questions INTEGER,
  trial_correct_answers INTEGER,
  trial_time_spent INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_hp_trial_user_id ON user_hp_trial(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hp_trial_completed ON user_hp_trial(trial_completed_at) WHERE trial_completed_at IS NOT NULL;

-- Enable RLS
ALTER TABLE user_hp_trial ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own trial" ON user_hp_trial;
CREATE POLICY "Users can view their own trial"
  ON user_hp_trial FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own trial" ON user_hp_trial;
CREATE POLICY "Users can insert their own trial"
  ON user_hp_trial FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trial" ON user_hp_trial;
CREATE POLICY "Users can update their own trial"
  ON user_hp_trial FOR UPDATE
  USING (auth.uid() = user_id);

-- Function: Get trial status for a user
CREATE OR REPLACE FUNCTION get_hp_trial_status(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial RECORD;
  v_profile RECORD;
  v_result jsonb;
BEGIN
  -- Get user profile
  SELECT subscription_type INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  -- Check if user has premium
  IF v_profile.subscription_type = 'premium' THEN
    RETURN jsonb_build_object(
      'has_premium', true,
      'trial_available', false,
      'trial_used', false
    );
  END IF;

  -- Check for existing trial
  SELECT * INTO v_trial
  FROM user_hp_trial
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- No trial started yet
    RETURN jsonb_build_object(
      'has_premium', false,
      'trial_available', true,
      'trial_used', false
    );
  END IF;

  -- Trial exists
  RETURN jsonb_build_object(
    'has_premium', false,
    'trial_available', false,
    'trial_used', true,
    'trial_type', v_trial.trial_type,
    'trial_content', v_trial.trial_content,
    'trial_started_at', v_trial.trial_started_at,
    'trial_completed_at', v_trial.trial_completed_at,
    'trial_score_percentage', v_trial.trial_score_percentage,
    'trial_estimated_score', v_trial.trial_estimated_score
  );
END;
$$;

-- Function: Start a trial
CREATE OR REPLACE FUNCTION start_hp_trial(
  p_user_id UUID,
  p_trial_type TEXT,
  p_trial_content TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_trial RECORD;
  v_profile RECORD;
BEGIN
  -- Validate trial type
  IF p_trial_type NOT IN ('full_test', 'delprov') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid trial type'
    );
  END IF;

  -- Get user profile
  SELECT subscription_type INTO v_profile
  FROM profiles
  WHERE id = p_user_id;

  -- Premium users don't need trials
  IF v_profile.subscription_type = 'premium' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Premium users have full access'
    );
  END IF;

  -- Check if trial already exists
  SELECT * INTO v_existing_trial
  FROM user_hp_trial
  WHERE user_id = p_user_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Trial already used'
    );
  END IF;

  -- Insert new trial
  INSERT INTO user_hp_trial (
    user_id,
    trial_type,
    trial_content,
    trial_started_at
  ) VALUES (
    p_user_id,
    p_trial_type,
    p_trial_content,
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'trial_type', p_trial_type,
    'trial_content', p_trial_content
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function: Complete a trial
CREATE OR REPLACE FUNCTION complete_hp_trial(
  p_user_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update trial as completed
  UPDATE user_hp_trial
  SET 
    trial_completed_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id
    AND trial_completed_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No active trial found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function: Save trial results (optional, for detailed tracking)
CREATE OR REPLACE FUNCTION save_hp_trial_results(
  p_user_id UUID,
  p_total_questions INTEGER,
  p_correct_answers INTEGER,
  p_score_percentage NUMERIC,
  p_estimated_score NUMERIC,
  p_time_spent INTEGER
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_hp_trial
  SET 
    trial_total_questions = p_total_questions,
    trial_correct_answers = p_correct_answers,
    trial_score_percentage = p_score_percentage,
    trial_estimated_score = p_estimated_score,
    trial_time_spent = p_time_spent,
    trial_completed_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Trial not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_hp_trial_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION start_hp_trial(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_hp_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION save_hp_trial_results(UUID, INTEGER, INTEGER, NUMERIC, NUMERIC, INTEGER) TO authenticated;

-- Add helpful comment
COMMENT ON TABLE user_hp_trial IS 'Tracks free trial usage for Högskoleprov content. Each user can try once: either full test or one section.';
