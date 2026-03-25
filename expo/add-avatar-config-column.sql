-- Add avatar_config column to profiles table
-- This column stores the JSON configuration for the user's custom avatar

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_config JSONB DEFAULT '{
  "skinTone": "medium-light",
  "hairStyle": "medium",
  "hairColor": "brown",
  "eyeShape": "almond",
  "eyeColor": "brown",
  "mouthShape": "smile",
  "clothingStyle": "tshirt",
  "clothingColor": "blue",
  "accessory": "none",
  "backgroundColor": "blue"
}'::jsonb;

-- Add index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_config ON profiles USING GIN (avatar_config);

-- Update RLS policies if needed (avatar_config should follow same rules as other profile fields)
-- Users can read their own avatar_config and update it
