-- Add RevenueCat columns to profiles table
-- Run this SQL in your Supabase SQL Editor

-- Add revenuecat_customer_id column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS revenuecat_customer_id TEXT;

-- Add index for faster lookups by RevenueCat customer ID
CREATE INDEX IF NOT EXISTS idx_profiles_revenuecat_customer_id 
ON profiles(revenuecat_customer_id);

-- Ensure subscription_type and subscription_expires_at columns exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'free';

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Add subscription_product_id to track which product the user purchased
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_product_id TEXT;

-- Add subscription_updated_at to track when the subscription was last updated
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create a function to update subscription_updated_at automatically
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.subscription_type IS DISTINCT FROM NEW.subscription_type 
     OR OLD.subscription_expires_at IS DISTINCT FROM NEW.subscription_expires_at THEN
    NEW.subscription_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update subscription_updated_at
DROP TRIGGER IF EXISTS trigger_update_subscription_updated_at ON profiles;
CREATE TRIGGER trigger_update_subscription_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Grant necessary permissions
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Success message
SELECT 'RevenueCat columns added successfully!' AS status;
