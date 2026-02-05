-- ============================================================================
-- HÖGSKOLEPROV TRIAL SYSTEM
-- ============================================================================
-- This system allows free users to try one full test OR one delprov as a trial
-- Trial state is persisted server-side and cannot be reset by reinstalling

-- Create table to track HP trial usage
CREATE TABLE IF NOT EXISTS user_hp_trial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trial_type TEXT NOT NULL CHECK (trial_type IN ('full_test', 'delprov')),
  trial_content TEXT NOT NULL, -- 'full' or section_code like 'ORD', 'LÄS', etc.
  trial_used BOOLEAN DEFAULT FALSE,
  trial_started_at TIMESTAMPTZ,
  trial_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one trial per user
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_hp_trial_user_id ON user_hp_trial(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hp_trial_trial_used ON user_hp_trial(trial_used);

-- Enable RLS
ALTER TABLE user_hp_trial ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own trial" ON user_hp_trial;
CREATE POLICY "Users can view their own trial" ON user_hp_trial
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own trial" ON user_hp_trial;
CREATE POLICY "Users can insert their own trial" ON user_hp_trial
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trial" ON user_hp_trial;
CREATE POLICY "Users can update their own trial" ON user_hp_trial
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to check if user has trial available
CREATE OR REPLACE FUNCTION check_hp_trial_available(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_premium BOOLEAN;
  v_trial_used BOOLEAN;
BEGIN
  -- Check if user has premium subscription
  SELECT subscription_type = 'premium'
  INTO v_has_premium
  FROM profiles
  WHERE id = p_user_id;
  
  -- Premium users don't need trial
  IF v_has_premium THEN
    RETURN FALSE;
  END IF;
  
  -- Check if trial exists and is used
  SELECT trial_used
  INTO v_trial_used
  FROM user_hp_trial
  WHERE user_id = p_user_id;
  
  -- No trial record = trial available
  IF v_trial_used IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Trial available if not used
  RETURN NOT v_trial_used;
END;
$$;

-- Function to start trial
CREATE OR REPLACE FUNCTION start_hp_trial(
  p_user_id UUID,
  p_trial_type TEXT,
  p_trial_content TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_available BOOLEAN;
  v_trial_id UUID;
BEGIN
  -- Check if trial is available
  v_trial_available := check_hp_trial_available(p_user_id);
  
  IF NOT v_trial_available THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Trial not available'
    );
  END IF;
  
  -- Create or update trial record
  INSERT INTO user_hp_trial (user_id, trial_type, trial_content, trial_used, trial_started_at)
  VALUES (p_user_id, p_trial_type, p_trial_content, TRUE, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    trial_type = EXCLUDED.trial_type,
    trial_content = EXCLUDED.trial_content,
    trial_used = TRUE,
    trial_started_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_trial_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'trial_id', v_trial_id
  );
END;
$$;

-- Function to complete trial (mark as finished)
CREATE OR REPLACE FUNCTION complete_hp_trial(
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_hp_trial
  SET trial_completed_at = NOW(),
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND trial_completed_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Function to get trial status
CREATE OR REPLACE FUNCTION get_hp_trial_status(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_premium BOOLEAN;
  v_trial_record RECORD;
BEGIN
  -- Check if user has premium
  SELECT subscription_type = 'premium'
  INTO v_has_premium
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_has_premium THEN
    RETURN json_build_object(
      'has_premium', TRUE,
      'trial_available', FALSE,
      'trial_used', FALSE
    );
  END IF;
  
  -- Get trial record
  SELECT *
  INTO v_trial_record
  FROM user_hp_trial
  WHERE user_id = p_user_id;
  
  -- No trial record = trial available
  IF v_trial_record IS NULL THEN
    RETURN json_build_object(
      'has_premium', FALSE,
      'trial_available', TRUE,
      'trial_used', FALSE
    );
  END IF;
  
  -- Return trial status
  RETURN json_build_object(
    'has_premium', FALSE,
    'trial_available', NOT v_trial_record.trial_used,
    'trial_used', v_trial_record.trial_used,
    'trial_type', v_trial_record.trial_type,
    'trial_content', v_trial_record.trial_content,
    'trial_started_at', v_trial_record.trial_started_at,
    'trial_completed_at', v_trial_record.trial_completed_at
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_hp_trial_available(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION start_hp_trial(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_hp_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_hp_trial_status(UUID) TO authenticated;
