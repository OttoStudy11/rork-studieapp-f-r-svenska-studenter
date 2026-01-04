-- Migration: Unified XP System
-- This migration adds support for a consistent XP/points system across the entire app

-- Step 1: Add total_points column to profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'total_points'
  ) THEN
    ALTER TABLE profiles ADD COLUMN total_points INTEGER DEFAULT 0;
  END IF;
END $$;

-- Step 2: Convert level column from VARCHAR to INTEGER
-- First, backup existing level data, convert to integer (extract numeric part if needed)
DO $$
BEGIN
  -- Check if level column exists and is varchar
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'level' 
    AND data_type = 'character varying'
  ) THEN
    -- Add temporary column
    ALTER TABLE profiles ADD COLUMN level_temp INTEGER DEFAULT 1;
    
    -- Try to convert existing values (extract numbers from strings like "Gymnasium 1", "Bachelor 2", etc)
    UPDATE profiles 
    SET level_temp = CASE 
      WHEN level ~ '^\d+$' THEN level::INTEGER
      WHEN level ~ '\d+' THEN (regexp_match(level, '\d+'))[1]::INTEGER
      ELSE 1
    END;
    
    -- Drop old column and rename temp
    ALTER TABLE profiles DROP COLUMN level;
    ALTER TABLE profiles RENAME COLUMN level_temp TO level;
  ELSE
    -- If level doesn't exist or is already integer, ensure it exists as integer
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'level'
    ) THEN
      ALTER TABLE profiles ADD COLUMN level INTEGER DEFAULT 1;
    END IF;
  END IF;
END $$;

-- Step 3: Create user_points table for detailed XP tracking
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  source_category VARCHAR(50) NOT NULL, -- 'lesson', 'exercise', 'streak', 'achievement', 'challenge', 'bonus', etc
  source_id VARCHAR(255) NOT NULL, -- ID of the source (lesson_id, exercise_id, etc)
  source_type VARCHAR(100) NOT NULL, -- Specific XP type (e.g., 'LESSON_EASY_COMPLETE')
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_points
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_created_at ON user_points(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_user_source ON user_points(user_id, source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_user_points_course ON user_points(course_id);

-- Step 4: Create user_level_history table for tracking level-ups
CREATE TABLE IF NOT EXISTS user_level_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user_level_history
CREATE INDEX IF NOT EXISTS idx_user_level_history_user_id ON user_level_history(user_id, achieved_at DESC);

-- Step 5: Add missing columns to courses table for better structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'school_id') THEN
    ALTER TABLE courses ADD COLUMN school_id UUID REFERENCES gymnasiums(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'program_id') THEN
    ALTER TABLE courses ADD COLUMN program_id UUID REFERENCES programs(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'education_year') THEN
    ALTER TABLE courses ADD COLUMN education_year INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'education_level') THEN
    ALTER TABLE courses ADD COLUMN education_level VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'difficulty_level') THEN
    ALTER TABLE courses ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'medium';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'emoji') THEN
    ALTER TABLE courses ADD COLUMN emoji VARCHAR(10);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'color_code') THEN
    ALTER TABLE courses ADD COLUMN color_code VARCHAR(7);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_required') THEN
    ALTER TABLE courses ADD COLUMN is_required BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_elective') THEN
    ALTER TABLE courses ADD COLUMN is_elective BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'credits_or_points') THEN
    ALTER TABLE courses ADD COLUMN credits_or_points INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'total_modules') THEN
    ALTER TABLE courses ADD COLUMN total_modules INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'total_lessons') THEN
    ALTER TABLE courses ADD COLUMN total_lessons INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'total_exercises') THEN
    ALTER TABLE courses ADD COLUMN total_exercises INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'estimated_total_hours') THEN
    ALTER TABLE courses ADD COLUMN estimated_total_hours INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'course_status') THEN
    ALTER TABLE courses ADD COLUMN course_status VARCHAR(20) DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'language') THEN
    ALTER TABLE courses ADD COLUMN language VARCHAR(5) DEFAULT 'sv';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'prerequisites') THEN
    ALTER TABLE courses ADD COLUMN prerequisites JSONB DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'learning_outcomes') THEN
    ALTER TABLE courses ADD COLUMN learning_outcomes JSONB DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'published_at') THEN
    ALTER TABLE courses ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'updated_at') THEN
    ALTER TABLE courses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Step 6: Create indexes for courses table
CREATE INDEX IF NOT EXISTS idx_courses_school_program ON courses(school_id, program_id, education_year);
CREATE INDEX IF NOT EXISTS idx_courses_education_level ON courses(education_level);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(course_status);

-- Step 7: Enable RLS on new tables
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_level_history ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for user_points
CREATE POLICY "Users can view their own points"
  ON user_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
  ON user_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 9: Create RLS policies for user_level_history
CREATE POLICY "Users can view their own level history"
  ON user_level_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own level history"
  ON user_level_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 10: Create function to update total_points automatically
CREATE OR REPLACE FUNCTION update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate total points for the user
  UPDATE profiles
  SET total_points = (
    SELECT COALESCE(SUM(points), 0)
    FROM user_points
    WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic total_points update
DROP TRIGGER IF EXISTS trigger_update_user_total_points ON user_points;
CREATE TRIGGER trigger_update_user_total_points
  AFTER INSERT ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION update_user_total_points();

-- Step 11: Migrate existing data (if any profiles have points in other tables)
-- This is a placeholder - adjust based on your existing data structure
UPDATE profiles SET total_points = 0 WHERE total_points IS NULL;
UPDATE profiles SET level = 1 WHERE level IS NULL;

-- Step 12: Add constraint to ensure total_points is never negative
ALTER TABLE profiles ADD CONSTRAINT profiles_total_points_non_negative CHECK (total_points >= 0);
ALTER TABLE profiles ADD CONSTRAINT profiles_level_positive CHECK (level > 0);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Unified XP System migration completed successfully!';
  RAISE NOTICE 'Added tables: user_points, user_level_history';
  RAISE NOTICE 'Added columns: total_points, level (as INTEGER) to profiles';
  RAISE NOTICE 'Added enhanced course metadata columns';
  RAISE NOTICE 'Created indexes and RLS policies';
END $$;
