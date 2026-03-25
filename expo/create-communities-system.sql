-- ============================================================================
-- COMMUNITIES SYSTEM - COMPLETE SETUP
-- ============================================================================
-- This creates all tables and functions for the communities feature
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: CLEAN UP (Drop everything in reverse dependency order)
-- ============================================================================

-- Drop policies first
DROP POLICY IF EXISTS "Anyone can view communities" ON communities;
DROP POLICY IF EXISTS "Authenticated users can create communities" ON communities;
DROP POLICY IF EXISTS "Community creator can update" ON communities;
DROP POLICY IF EXISTS "Community creator can delete" ON communities;
DROP POLICY IF EXISTS "Anyone can view community members" ON community_members;
DROP POLICY IF EXISTS "Users can join open communities" ON community_members;
DROP POLICY IF EXISTS "Admins can add members to closed communities" ON community_members;
DROP POLICY IF EXISTS "Users can leave communities" ON community_members;
DROP POLICY IF EXISTS "Admins can remove members" ON community_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON community_members;
DROP POLICY IF EXISTS "Users can view their own requests" ON community_requests;
DROP POLICY IF EXISTS "Admins can view requests for their communities" ON community_requests;
DROP POLICY IF EXISTS "Users can create requests" ON community_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON community_requests;
DROP POLICY IF EXISTS "Users can delete their own requests" ON community_requests;
DROP POLICY IF EXISTS "Users can view invites sent to them" ON community_invites;
DROP POLICY IF EXISTS "Users can view invites they sent" ON community_invites;
DROP POLICY IF EXISTS "Members can create invites" ON community_invites;
DROP POLICY IF EXISTS "Invitees can update their invites" ON community_invites;
DROP POLICY IF EXISTS "Invitees can delete their invites" ON community_invites;
DROP POLICY IF EXISTS "Members can view community messages" ON community_messages;
DROP POLICY IF EXISTS "Members can send messages" ON community_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON community_messages;
DROP POLICY IF EXISTS "Admins can delete any message" ON community_messages;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS community_messages CASCADE;
DROP TABLE IF EXISTS community_invites CASCADE;
DROP TABLE IF EXISTS community_requests CASCADE;
DROP TABLE IF EXISTS community_members CASCADE;
DROP TABLE IF EXISTS communities CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_user_communities(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_suggested_communities(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS is_community_admin(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_pending_requests_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_communities_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_community_member_count() CASCADE;

-- ============================================================================
-- STEP 2: CREATE TABLES
-- ============================================================================

-- Communities table (main table)
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('school', 'program', 'study-group', 'other')),
  visibility TEXT NOT NULL DEFAULT 'open' CHECK (visibility IN ('open', 'closed')),
  school_name TEXT,
  program_name TEXT,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 1,
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

-- Community join requests
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

-- Community messages
CREATE TABLE community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_communities_type ON communities(type);
CREATE INDEX idx_communities_visibility ON communities(visibility);
CREATE INDEX idx_communities_member_count ON communities(member_count DESC);
CREATE INDEX idx_communities_school_name ON communities(school_name);
CREATE INDEX idx_communities_program_name ON communities(program_name);
CREATE INDEX idx_communities_created_at ON communities(created_at DESC);

CREATE INDEX idx_community_members_community_id ON community_members(community_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_community_members_role ON community_members(role);

CREATE INDEX idx_community_requests_community_id ON community_requests(community_id);
CREATE INDEX idx_community_requests_user_id ON community_requests(user_id);
CREATE INDEX idx_community_requests_status ON community_requests(status);

CREATE INDEX idx_community_invites_community_id ON community_invites(community_id);
CREATE INDEX idx_community_invites_invitee_id ON community_invites(invitee_id);
CREATE INDEX idx_community_invites_inviter_id ON community_invites(inviter_id);
CREATE INDEX idx_community_invites_status ON community_invites(status);

CREATE INDEX idx_community_messages_community_id ON community_messages(community_id);
CREATE INDEX idx_community_messages_user_id ON community_messages(user_id);
CREATE INDEX idx_community_messages_created_at ON community_messages(created_at DESC);

-- ============================================================================
-- STEP 4: CREATE FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_communities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- STEP 5: CREATE TRIGGERS
-- ============================================================================

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

CREATE TRIGGER update_community_member_count
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_member_count();

-- ============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES
-- ============================================================================

-- COMMUNITIES POLICIES
CREATE POLICY "Anyone can view communities" 
  ON communities FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create communities" 
  ON communities FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community admins can update" 
  ON communities FOR UPDATE 
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = communities.id
      AND community_members.user_id = auth.uid()
      AND community_members.role = 'admin'
    )
  );

CREATE POLICY "Community creator can delete" 
  ON communities FOR DELETE 
  USING (auth.uid() = created_by);

-- COMMUNITY MEMBERS POLICIES
CREATE POLICY "Anyone can view community members" 
  ON community_members FOR SELECT 
  USING (true);

CREATE POLICY "Users can join open communities" 
  ON community_members FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_id
      AND communities.visibility = 'open'
    )
  );

CREATE POLICY "Community creator can add members"
  ON community_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_id
      AND communities.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can leave communities" 
  ON community_members FOR DELETE 
  USING (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_id
      AND communities.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can remove members" 
  ON community_members FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

CREATE POLICY "Admins can update member roles" 
  ON community_members FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

-- COMMUNITY REQUESTS POLICIES
CREATE POLICY "Users can view their own requests" 
  ON community_requests FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view community requests" 
  ON community_requests FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_requests.community_id
      AND community_members.user_id = auth.uid()
      AND community_members.role = 'admin'
    )
  );

CREATE POLICY "Users can create requests" 
  ON community_requests FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update requests" 
  ON community_requests FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_requests.community_id
      AND community_members.user_id = auth.uid()
      AND community_members.role = 'admin'
    )
  );

CREATE POLICY "Users can delete their own requests" 
  ON community_requests FOR DELETE 
  USING (auth.uid() = user_id);

-- COMMUNITY INVITES POLICIES
CREATE POLICY "Users can view invites sent to them" 
  ON community_invites FOR SELECT 
  USING (auth.uid() = invitee_id);

CREATE POLICY "Users can view invites they sent" 
  ON community_invites FOR SELECT 
  USING (auth.uid() = inviter_id);

CREATE POLICY "Members can create invites" 
  ON community_invites FOR INSERT 
  WITH CHECK (
    auth.uid() = inviter_id AND
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_invites.community_id
      AND community_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Invitees can update invites" 
  ON community_invites FOR UPDATE 
  USING (auth.uid() = invitee_id);

CREATE POLICY "Invitees can delete invites" 
  ON community_invites FOR DELETE 
  USING (auth.uid() = invitee_id);

-- COMMUNITY MESSAGES POLICIES
CREATE POLICY "Members can view messages" 
  ON community_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_messages.community_id
      AND community_members.user_id = auth.uid()
    )
  );

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

CREATE POLICY "Users can delete own messages" 
  ON community_messages FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete messages" 
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
-- STEP 8: HELPER FUNCTIONS
-- ============================================================================

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

CREATE OR REPLACE FUNCTION get_suggested_communities(
  p_user_id UUID, 
  p_school_name TEXT DEFAULT NULL, 
  p_program_name TEXT DEFAULT NULL
)
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
  ORDER BY c.member_count DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- ============================================================================
-- STEP 9: GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON communities TO authenticated;
GRANT ALL ON community_members TO authenticated;
GRANT ALL ON community_requests TO authenticated;
GRANT ALL ON community_invites TO authenticated;
GRANT ALL ON community_messages TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_communities(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_suggested_communities(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_community_admin(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_requests_count(UUID) TO authenticated;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- All tables, policies, and functions have been created successfully.
-- You can now use the communities feature in your app.
-- ============================================================================
