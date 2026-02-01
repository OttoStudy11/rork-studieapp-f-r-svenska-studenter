-- ============================================================================
-- COMMUNITIES SYSTEM DATABASE SCHEMA
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor
-- This creates all tables needed for the community functionality
-- ============================================================================

-- ============================================================================
-- 1. DROP EXISTING OBJECTS (if any)
-- ============================================================================

DROP TRIGGER IF EXISTS communities_updated_at ON communities CASCADE;
DROP TRIGGER IF EXISTS community_requests_updated_at ON community_requests CASCADE;
DROP TRIGGER IF EXISTS community_invites_updated_at ON community_invites CASCADE;
DROP TRIGGER IF EXISTS update_community_member_count ON community_members CASCADE;

DROP FUNCTION IF EXISTS update_communities_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_community_member_count() CASCADE;

DROP TABLE IF EXISTS community_messages CASCADE;
DROP TABLE IF EXISTS community_invites CASCADE;
DROP TABLE IF EXISTS community_requests CASCADE;
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS communities CASCADE;

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Main communities table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('school', 'program', 'study-group', 'other')),
  visibility TEXT NOT NULL DEFAULT 'open' CHECK (visibility IN ('open', 'closed')),
  -- Store school/program info as text (no foreign keys to non-existent tables)
  school_name TEXT,
  program_name TEXT,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community members table
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Community join requests (for closed communities)
CREATE TABLE community_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Community invites
CREATE TABLE community_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, invitee_id)
);

-- Community messages/chat (simple implementation)
CREATE TABLE community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

-- Communities indexes
CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_communities_type ON communities(type);
CREATE INDEX idx_communities_visibility ON communities(visibility);
CREATE INDEX idx_communities_member_count ON communities(member_count DESC);
CREATE INDEX idx_communities_school_name ON communities(school_name);
CREATE INDEX idx_communities_program_name ON communities(program_name);
CREATE INDEX idx_communities_created_at ON communities(created_at DESC);

-- Community members indexes
CREATE INDEX idx_community_members_community_id ON community_members(community_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_community_members_role ON community_members(role);

-- Community requests indexes
CREATE INDEX idx_community_requests_community_id ON community_requests(community_id);
CREATE INDEX idx_community_requests_user_id ON community_requests(user_id);
CREATE INDEX idx_community_requests_status ON community_requests(status);

-- Community invites indexes
CREATE INDEX idx_community_invites_community_id ON community_invites(community_id);
CREATE INDEX idx_community_invites_invitee_id ON community_invites(invitee_id);
CREATE INDEX idx_community_invites_inviter_id ON community_invites(inviter_id);
CREATE INDEX idx_community_invites_status ON community_invites(status);

-- Community messages indexes
CREATE INDEX idx_community_messages_community_id ON community_messages(community_id);
CREATE INDEX idx_community_messages_user_id ON community_messages(user_id);
CREATE INDEX idx_community_messages_created_at ON community_messages(created_at DESC);

-- ============================================================================
-- 4. CREATE FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_communities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities 
    SET member_count = GREATEST(0, member_count - 1) 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CREATE TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW
  EXECUTE FUNCTION update_communities_updated_at();

CREATE TRIGGER community_requests_updated_at
  BEFORE UPDATE ON community_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_communities_updated_at();

CREATE TRIGGER community_invites_updated_at
  BEFORE UPDATE ON community_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_communities_updated_at();

-- Member count trigger
CREATE TRIGGER update_community_member_count
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_member_count();

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. CREATE RLS POLICIES
-- ============================================================================

-- Communities policies
DROP POLICY IF EXISTS "Anyone can view communities" ON communities;
CREATE POLICY "Anyone can view communities" ON communities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create communities" ON communities;
CREATE POLICY "Authenticated users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Community creator can update" ON communities;
CREATE POLICY "Community creator can update" ON communities
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = communities.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Community creator can delete" ON communities;
CREATE POLICY "Community creator can delete" ON communities
  FOR DELETE USING (auth.uid() = created_by);

-- Community members policies
DROP POLICY IF EXISTS "Anyone can view community members" ON community_members;
CREATE POLICY "Anyone can view community members" ON community_members
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join open communities" ON community_members;
CREATE POLICY "Users can join open communities" ON community_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_id
      AND (c.visibility = 'open' OR c.created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can add members to closed communities" ON community_members;
CREATE POLICY "Admins can add members to closed communities" ON community_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can leave communities" ON community_members;
CREATE POLICY "Users can leave communities" ON community_members
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can remove members" ON community_members;
CREATE POLICY "Admins can remove members" ON community_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update member roles" ON community_members;
CREATE POLICY "Admins can update member roles" ON community_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

-- Community requests policies
DROP POLICY IF EXISTS "Users can view their own requests" ON community_requests;
CREATE POLICY "Users can view their own requests" ON community_requests
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view requests for their communities" ON community_requests;
CREATE POLICY "Admins can view requests for their communities" ON community_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_requests.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can create requests" ON community_requests;
CREATE POLICY "Users can create requests" ON community_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update requests" ON community_requests;
CREATE POLICY "Admins can update requests" ON community_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_requests.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can delete their own requests" ON community_requests;
CREATE POLICY "Users can delete their own requests" ON community_requests
  FOR DELETE USING (auth.uid() = user_id);

-- Community invites policies
DROP POLICY IF EXISTS "Users can view invites sent to them" ON community_invites;
CREATE POLICY "Users can view invites sent to them" ON community_invites
  FOR SELECT USING (auth.uid() = invitee_id);

DROP POLICY IF EXISTS "Users can view invites they sent" ON community_invites;
CREATE POLICY "Users can view invites they sent" ON community_invites
  FOR SELECT USING (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "Members can create invites" ON community_invites;
CREATE POLICY "Members can create invites" ON community_invites
  FOR INSERT WITH CHECK (
    auth.uid() = inviter_id AND
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_invites.community_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Invitees can update their invites" ON community_invites;
CREATE POLICY "Invitees can update their invites" ON community_invites
  FOR UPDATE USING (auth.uid() = invitee_id);

DROP POLICY IF EXISTS "Invitees can delete their invites" ON community_invites;
CREATE POLICY "Invitees can delete their invites" ON community_invites
  FOR DELETE USING (auth.uid() = invitee_id);

-- Community messages policies
DROP POLICY IF EXISTS "Members can view community messages" ON community_messages;
CREATE POLICY "Members can view community messages" ON community_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_messages.community_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can send messages" ON community_messages;
CREATE POLICY "Members can send messages" ON community_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_messages.community_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own messages" ON community_messages;
CREATE POLICY "Users can delete their own messages" ON community_messages
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete any message" ON community_messages;
CREATE POLICY "Admins can delete any message" ON community_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_messages.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON communities TO authenticated;
GRANT ALL ON community_members TO authenticated;
GRANT ALL ON community_requests TO authenticated;
GRANT ALL ON community_invites TO authenticated;
GRANT ALL ON community_messages TO authenticated;

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to get communities for a user
CREATE OR REPLACE FUNCTION get_user_communities(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  type TEXT,
  visibility TEXT,
  school_name TEXT,
  program_name TEXT,
  image_url TEXT,
  member_count INTEGER,
  user_role TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.type,
    c.visibility,
    c.school_name,
    c.program_name,
    c.image_url,
    c.member_count,
    cm.role as user_role,
    c.created_at
  FROM communities c
  INNER JOIN community_members cm ON cm.community_id = c.id
  WHERE cm.user_id = p_user_id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get suggested communities based on user's school/program
CREATE OR REPLACE FUNCTION get_suggested_communities(p_user_id UUID, p_school_name TEXT DEFAULT NULL, p_program_name TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  type TEXT,
  visibility TEXT,
  school_name TEXT,
  program_name TEXT,
  image_url TEXT,
  member_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.type,
    c.visibility,
    c.school_name,
    c.program_name,
    c.image_url,
    c.member_count,
    c.created_at
  FROM communities c
  WHERE NOT EXISTS (
    SELECT 1 FROM community_members cm
    WHERE cm.community_id = c.id AND cm.user_id = p_user_id
  )
  AND (
    (p_school_name IS NOT NULL AND c.school_name ILIKE '%' || p_school_name || '%')
    OR (p_program_name IS NOT NULL AND c.program_name ILIKE '%' || p_program_name || '%')
    OR c.visibility = 'open'
  )
  ORDER BY 
    CASE 
      WHEN c.school_name ILIKE '%' || COALESCE(p_school_name, '') || '%' THEN 1
      WHEN c.program_name ILIKE '%' || COALESCE(p_program_name, '') || '%' THEN 2
      ELSE 3
    END,
    c.member_count DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin of a community
CREATE OR REPLACE FUNCTION is_community_admin(p_community_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = p_community_id
    AND user_id = p_user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending requests count for a community
CREATE OR REPLACE FUNCTION get_pending_requests_count(p_community_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM community_requests
    WHERE community_id = p_community_id
    AND status = 'pending'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_communities(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_suggested_communities(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_community_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_requests_count(UUID) TO authenticated;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- The communities system is now ready to use.
-- Tables created:
--   - communities: Main community information
--   - community_members: Tracks who is in each community
--   - community_requests: Join requests for closed communities
--   - community_invites: Invitations to join communities
--   - community_messages: Simple chat/messages for communities
-- ============================================================================
