-- Fix achievements.id to UUID type properly (handles FK dependencies)
DO $$
BEGIN
  -- Check if achievements.id is TEXT type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'achievements' AND column_name = 'id' 
    AND data_type = 'text'
  ) THEN
    -- Drop FK constraint from user_achievements
    ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_achievement_id_fkey;
    
    -- Add temp UUID column
    ALTER TABLE achievements ADD COLUMN IF NOT EXISTS id_uuid UUID;
    UPDATE achievements SET id_uuid = gen_random_uuid() WHERE id_uuid IS NULL;
    ALTER TABLE achievements ALTER COLUMN id_uuid SET NOT NULL;
    
    -- Drop old TEXT id column
    ALTER TABLE achievements DROP COLUMN id;
    ALTER TABLE achievements RENAME COLUMN id_uuid TO id;
    ALTER TABLE achievements ADD PRIMARY KEY (id);
    
    -- Recreate FK constraint with UUID type
    ALTER TABLE user_achievements 
      ADD CONSTRAINT user_achievements_achievement_id_fkey 
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'achievements.id converted from text to uuid (with FK recreation)';
  ELSE
    RAISE NOTICE 'achievements.id is already uuid, no change needed';
  END IF;
END $$;
