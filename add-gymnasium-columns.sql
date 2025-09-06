-- Add gymnasium columns to profiles table
ALTER TABLE profiles 
ADD COLUMN gymnasium_id TEXT,
ADD COLUMN gymnasium_name TEXT,
ADD COLUMN gymnasium_grade TEXT CHECK (gymnasium_grade IN ('1', '2', '3'));

-- Add comment to explain the columns
COMMENT ON COLUMN profiles.gymnasium_id IS 'ID of the gymnasium from the app constants';
COMMENT ON COLUMN profiles.gymnasium_name IS 'Name of the gymnasium for display purposes';
COMMENT ON COLUMN profiles.gymnasium_grade IS 'Grade level in gymnasium (1, 2, or 3)';