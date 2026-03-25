-- Add daily_goal_hours column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_goal_hours DECIMAL(3,1) DEFAULT 2.0;

-- Add comment to explain the column
COMMENT ON COLUMN profiles.daily_goal_hours IS 'User daily study goal in hours (e.g., 2.5 for 2.5 hours)';
