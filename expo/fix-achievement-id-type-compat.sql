-- Fix achievement_id type mismatch: user_achievements.achievement_id (TEXT) -> UUID
-- to match achievements.id (UUID)

DO $$
BEGIN
  -- Step 1: Drop existing FK constraint if it exists
  ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_achievement_id_fkey;
  RAISE NOTICE 'Dropped FK constraint user_achievements_achievement_id_fkey';

  -- Step 2: Check if user_achievements.achievement_id is TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_achievements' AND column_name = 'achievement_id'
    AND data_type = 'text'
  ) THEN
    RAISE NOTICE 'achievement_id is TEXT, converting to UUID...';

    -- Add temp UUID column
    ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS achievement_id_uuid UUID;

    -- Try to cast existing TEXT values to UUID where possible
    UPDATE user_achievements SET achievement_id_uuid = achievement_id::UUID
    WHERE achievement_id IS NOT NULL AND achievement_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

    -- For rows where achievement_id couldn't be cast, try matching by achievements.achievement_key
    UPDATE user_achievements ua
    SET achievement_id_uuid = a.id
    FROM achievements a
    WHERE ua.achievement_id_uuid IS NULL
    AND ua.achievement_id IS NOT NULL
    AND ua.achievement_id = a.achievement_key;

    -- Set NOT NULL
    ALTER TABLE user_achievements ALTER COLUMN achievement_id_uuid SET NOT NULL;

    -- Drop old TEXT column and rename
    ALTER TABLE user_achievements DROP COLUMN achievement_id;
    ALTER TABLE user_achievements RENAME COLUMN achievement_id_uuid TO achievement_id;

    RAISE NOTICE 'achievement_id converted to UUID';
  ELSE
    RAISE NOTICE 'achievement_id is already UUID, no conversion needed';
  END IF;

  -- Step 3: Recreate the FK constraint
  ALTER TABLE user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE;

  RAISE NOTICE 'FK constraint recreated with matching UUID types';
END $$;
