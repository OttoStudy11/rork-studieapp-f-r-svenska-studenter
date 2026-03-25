-- Add total_points column to user_progress table
-- This column will track the total points earned by users from completing study sessions and achievements

ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;

-- Update existing records to have 0 points
UPDATE user_progress
SET total_points = 0
WHERE total_points IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN user_progress.total_points IS 'Total points earned from study sessions and achievements';
