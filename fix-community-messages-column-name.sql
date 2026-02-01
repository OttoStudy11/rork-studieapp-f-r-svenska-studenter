-- Fix community_messages column name mismatch
-- The table was created with 'content' but the app uses 'message'

-- Check if the column exists as 'content' and rename it to 'message'
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'community_messages' 
    AND column_name = 'content'
  ) THEN
    ALTER TABLE community_messages RENAME COLUMN content TO message;
    RAISE NOTICE 'Column renamed from content to message';
  ELSE
    RAISE NOTICE 'Column content does not exist, checking for message column';
  END IF;
END $$;

-- If the table doesn't have the message column at all, add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'community_messages' 
    AND column_name = 'message'
  ) THEN
    ALTER TABLE community_messages ADD COLUMN message TEXT NOT NULL;
    RAISE NOTICE 'Column message added';
  ELSE
    RAISE NOTICE 'Column message already exists';
  END IF;
END $$;

-- Verify the fix
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'community_messages'
ORDER BY ordinal_position;
