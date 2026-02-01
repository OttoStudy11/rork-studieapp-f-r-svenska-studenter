-- ============================================================================
-- COMMUNITY MESSAGES SYSTEM - COMPLETE FIX
-- ============================================================================
-- This creates the community_messages table with correct schema and policies
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Drop existing table and policies if they exist
DROP POLICY IF EXISTS "Users can view messages in their communities" ON community_messages;
DROP POLICY IF EXISTS "Users can send messages to their communities" ON community_messages;
DROP POLICY IF EXISTS "Members can view messages" ON community_messages;
DROP POLICY IF EXISTS "Members can send messages" ON community_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON community_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON community_messages;

DROP TABLE IF EXISTS community_messages CASCADE;

-- ============================================================================
-- CREATE TABLE
-- ============================================================================

CREATE TABLE community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_community_messages_community_id ON community_messages(community_id);
CREATE INDEX idx_community_messages_user_id ON community_messages(user_id);
CREATE INDEX idx_community_messages_created_at ON community_messages(created_at DESC);

-- Composite index for efficient queries
CREATE INDEX idx_community_messages_community_created ON community_messages(community_id, created_at DESC);

-- ============================================================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_community_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER community_messages_updated_at
  BEFORE UPDATE ON community_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_community_messages_updated_at();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Members can view messages in communities they belong to
CREATE POLICY "Members can view community messages"
  ON community_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_messages.community_id
      AND community_members.user_id = auth.uid()
    )
  );

-- Members can send messages to communities they belong to
CREATE POLICY "Members can send messages"
  ON community_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_messages.community_id
      AND community_members.user_id = auth.uid()
    )
  );

-- Users can update their own messages (for editing)
CREATE POLICY "Users can update own messages"
  ON community_messages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON community_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Community admins can delete any message in their community
CREATE POLICY "Admins can delete any message"
  ON community_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_messages.community_id
      AND community_members.user_id = auth.uid()
      AND community_members.role = 'admin'
    )
  );

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

-- Enable realtime for community_messages
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON community_messages TO authenticated;

-- ============================================================================
-- CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get messages for a community with user details
CREATE OR REPLACE FUNCTION get_community_messages(
  p_community_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  community_id UUID,
  user_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_name TEXT,
  user_username TEXT,
  user_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.community_id,
    cm.user_id,
    cm.content,
    cm.created_at,
    cm.updated_at,
    p.name as user_name,
    p.username as user_username,
    p.avatar_url as user_avatar_url
  FROM community_messages cm
  INNER JOIN profiles p ON p.id = cm.user_id
  WHERE cm.community_id = p_community_id
  ORDER BY cm.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_community_messages(UUID, INT, INT) TO authenticated;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

COMMENT ON TABLE community_messages IS 'Chat messages within communities with full realtime support';
COMMENT ON FUNCTION get_community_messages(UUID, INT, INT) IS 'Get community messages with user details - paginated';
