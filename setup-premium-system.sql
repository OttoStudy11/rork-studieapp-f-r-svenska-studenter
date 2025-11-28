-- Ensure subscription_type and subscription_expires_at columns exist in profiles table
-- This should already exist, but we're adding it here for reference

-- Update profiles table to ensure proper constraints
ALTER TABLE profiles 
  ALTER COLUMN subscription_type SET DEFAULT 'free',
  ADD CONSTRAINT check_subscription_type CHECK (subscription_type IN ('free', 'premium'));

-- Create index for faster premium status queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON profiles(subscription_type, subscription_expires_at);

-- Function to check if user is premium
CREATE OR REPLACE FUNCTION is_user_premium(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_type TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT subscription_type, subscription_expires_at 
  INTO sub_type, expires_at
  FROM profiles
  WHERE id = user_id_param;
  
  IF sub_type IS NULL OR sub_type = 'free' THEN
    RETURN FALSE;
  END IF;
  
  IF sub_type = 'premium' THEN
    -- If no expiration date, it's lifetime premium
    IF expires_at IS NULL THEN
      RETURN TRUE;
    END IF;
    
    -- Check if subscription is still active
    IF expires_at > NOW() THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user premium status (for Apple/Google IAP integration)
CREATE OR REPLACE FUNCTION update_premium_status(
  user_id_param UUID,
  new_status TEXT,
  expires_at_param TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    subscription_type = new_status,
    subscription_expires_at = expires_at_param
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_user_premium(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_premium_status(UUID, TEXT, TIMESTAMP WITH TIME ZONE) TO service_role;

-- Example usage:
-- To check if a user is premium:
-- SELECT is_user_premium('user-uuid-here');

-- To update a user to premium (this should be called from your backend after IAP verification):
-- SELECT update_premium_status('user-uuid-here', 'premium', NOW() + INTERVAL '1 month');

-- To update a user to lifetime premium:
-- SELECT update_premium_status('user-uuid-here', 'premium', NULL);

-- To downgrade a user to free:
-- SELECT update_premium_status('user-uuid-here', 'free', NULL);
