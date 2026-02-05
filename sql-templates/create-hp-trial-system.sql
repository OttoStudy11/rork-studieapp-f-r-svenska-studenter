-- Högskoleprov Trial System
-- Allows free users to try one full test or one section before requiring premium

-- Create trial tracking table
CREATE TABLE IF NOT EXISTS user_hp_trial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_type TEXT NOT NULL CHECK (trial_type IN ('full_test', 'delprov')),
  trial_content TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_hp_trial_user_id ON user_hp_trial(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hp_trial_started_at ON user_hp_trial(started_at);

-- Enable RLS
ALTER TABLE user_hp_trial ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own trial" ON user_hp_trial;
CREATE POLICY "Users can view own trial"
  ON user_hp_trial FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own trial" ON user_hp_trial;
CREATE POLICY "Users can insert own trial"
  ON user_hp_trial FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trial" ON user_hp_trial;
CREATE POLICY "Users can update own trial"
  ON user_hp_trial FOR UPDATE
  USING (auth.uid() = user_id);

-- Function: Get trial status for a user
CREATE OR REPLACE FUNCTION get_hp_trial_status(p_user_id UUID)
RETURNS TABLE (
  has_premium BOOLEAN,
  trial_available BOOLEAN,
  trial_used BOOLEAN,
  trial_type TEXT,
  trial_content TEXT,
  trial_started_at TIMESTAMPTZ,
  trial_completed_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_type TEXT;
  v_trial_record RECORD;
BEGIN
  -- Get user's subscription type
  SELECT subscription_type INTO v_subscription_type
  FROM profiles
  WHERE id = p_user_id;
  
  -- Check if user has premium
  IF v_subscription_type IN ('premium', 'pro') THEN
    RETURN QUERY SELECT
      TRUE as has_premium,
      FALSE as trial_available,
      FALSE as trial_used,
      NULL::TEXT as trial_type,
      NULL::TEXT as trial_content,
      NULL::TIMESTAMPTZ as trial_started_at,
      NULL::TIMESTAMPTZ as trial_completed_at;
    RETURN;
  END IF;
  
  -- Get trial record
  SELECT * INTO v_trial_record
  FROM user_hp_trial
  WHERE user_id = p_user_id;
  
  -- If no trial record exists, trial is available
  IF v_trial_record IS NULL THEN
    RETURN QUERY SELECT
      FALSE as has_premium,
      TRUE as trial_available,
      FALSE as trial_used,
      NULL::TEXT as trial_type,
      NULL::TEXT as trial_content,
      NULL::TIMESTAMPTZ as trial_started_at,
      NULL::TIMESTAMPTZ as trial_completed_at;
    RETURN;
  END IF;
  
  -- Trial has been used
  RETURN QUERY SELECT
    FALSE as has_premium,
    FALSE as trial_available,
    TRUE as trial_used,
    v_trial_record.trial_type,
    v_trial_record.trial_content,
    v_trial_record.started_at as trial_started_at,
    v_trial_record.completed_at as trial_completed_at;
END;
$$;

-- Function: Start a trial
CREATE OR REPLACE FUNCTION start_hp_trial(
  p_user_id UUID,
  p_trial_type TEXT,
  p_trial_content TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  error TEXT,
  trial_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_type TEXT;
  v_existing_trial UUID;
  v_new_trial_id UUID;
BEGIN
  -- Check if user has premium
  SELECT subscription_type INTO v_subscription_type
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_subscription_type IN ('premium', 'pro') THEN
    RETURN QUERY SELECT
      FALSE as success,
      'User already has premium' as error,
      NULL::UUID as trial_id;
    RETURN;
  END IF;
  
  -- Check if trial already exists
  SELECT id INTO v_existing_trial
  FROM user_hp_trial
  WHERE user_id = p_user_id;
  
  IF v_existing_trial IS NOT NULL THEN
    RETURN QUERY SELECT
      FALSE as success,
      'Trial already used' as error,
      NULL::UUID as trial_id;
    RETURN;
  END IF;
  
  -- Validate trial type
  IF p_trial_type NOT IN ('full_test', 'delprov') THEN
    RETURN QUERY SELECT
      FALSE as success,
      'Invalid trial type' as error,
      NULL::UUID as trial_id;
    RETURN;
  END IF;
  
  -- Create trial record
  INSERT INTO user_hp_trial (user_id, trial_type, trial_content, started_at)
  VALUES (p_user_id, p_trial_type, p_trial_content, NOW())
  RETURNING id INTO v_new_trial_id;
  
  RETURN QUERY SELECT
    TRUE as success,
    NULL::TEXT as error,
    v_new_trial_id as trial_id;
END;
$$;

-- Function: Complete a trial
CREATE OR REPLACE FUNCTION complete_hp_trial(p_user_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  error TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trial_id UUID;
BEGIN
  -- Get trial record
  SELECT id INTO v_trial_id
  FROM user_hp_trial
  WHERE user_id = p_user_id;
  
  IF v_trial_id IS NULL THEN
    RETURN QUERY SELECT
      FALSE as success,
      'No trial found for user' as error;
    RETURN;
  END IF;
  
  -- Update completion time
  UPDATE user_hp_trial
  SET completed_at = NOW()
  WHERE id = v_trial_id;
  
  RETURN QUERY SELECT
    TRUE as success,
    NULL::TEXT as error;
END;
$$;

-- Function: Check if trial is available for user
CREATE OR REPLACE FUNCTION check_hp_trial_available(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_type TEXT;
  v_trial_exists BOOLEAN;
BEGIN
  -- Check if user has premium
  SELECT subscription_type INTO v_subscription_type
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_subscription_type IN ('premium', 'pro') THEN
    RETURN FALSE;
  END IF;
  
  -- Check if trial already used
  SELECT EXISTS(
    SELECT 1 FROM user_hp_trial WHERE user_id = p_user_id
  ) INTO v_trial_exists;
  
  RETURN NOT v_trial_exists;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_hp_trial_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION start_hp_trial(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_hp_trial(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_hp_trial_available(UUID) TO authenticated;

-- Verify setup
DO $$
BEGIN
  RAISE NOTICE '✅ HP Trial System created successfully';
  RAISE NOTICE 'Table: user_hp_trial';
  RAISE NOTICE 'Functions: get_hp_trial_status, start_hp_trial, complete_hp_trial, check_hp_trial_available';
END $$;
