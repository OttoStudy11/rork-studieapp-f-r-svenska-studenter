-- Create community_messages table for chat
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_messages_community_id ON community_messages(community_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_user_id ON community_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at DESC);

-- Enable RLS
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view messages in their communities"
  ON community_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_messages.community_id
      AND community_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their communities"
  ON community_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_messages.community_id
      AND community_members.user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;

COMMENT ON TABLE community_messages IS 'Chat messages within communities';
