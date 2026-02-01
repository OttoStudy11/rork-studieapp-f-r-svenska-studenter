-- Communities System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('school', 'program', 'study-group', 'other')),
  visibility TEXT NOT NULL DEFAULT 'open' CHECK (visibility IN ('open', 'closed')),
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  school_name TEXT,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  program_name TEXT,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create community_members table
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Create community_requests table (for closed communities)
CREATE TABLE IF NOT EXISTS community_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Create community_invites table
CREATE TABLE IF NOT EXISTS community_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, invitee_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by);
CREATE INDEX IF NOT EXISTS idx_communities_school_id ON communities(school_id);
CREATE INDEX IF NOT EXISTS idx_communities_type ON communities(type);
CREATE INDEX IF NOT EXISTS idx_communities_visibility ON communities(visibility);
CREATE INDEX IF NOT EXISTS idx_communities_member_count ON communities(member_count DESC);

CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_role ON community_members(role);

CREATE INDEX IF NOT EXISTS idx_community_requests_community_id ON community_requests(community_id);
CREATE INDEX IF NOT EXISTS idx_community_requests_user_id ON community_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_community_requests_status ON community_requests(status);

CREATE INDEX IF NOT EXISTS idx_community_invites_community_id ON community_invites(community_id);
CREATE INDEX IF NOT EXISTS idx_community_invites_invitee_id ON community_invites(invitee_id);
CREATE INDEX IF NOT EXISTS idx_community_invites_status ON community_invites(status);

-- Enable Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities
CREATE POLICY "Anyone can view communities" ON communities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community creator can update" ON communities
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Community creator can delete" ON communities
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for community_members
CREATE POLICY "Anyone can view community members" ON community_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can add members" ON community_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

CREATE POLICY "Users can leave communities" ON community_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can remove members" ON community_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

CREATE POLICY "Admins can update member roles" ON community_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

-- RLS Policies for community_requests
CREATE POLICY "Users can view their own requests" ON community_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view requests for their communities" ON community_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_requests.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

CREATE POLICY "Users can create requests" ON community_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update requests" ON community_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_requests.community_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
    )
  );

CREATE POLICY "Users can delete their own requests" ON community_requests
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_invites
CREATE POLICY "Users can view invites sent to them" ON community_invites
  FOR SELECT USING (auth.uid() = invitee_id);

CREATE POLICY "Users can view invites they sent" ON community_invites
  FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "Members can create invites" ON community_invites
  FOR INSERT WITH CHECK (
    auth.uid() = inviter_id AND
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_invites.community_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Invitees can update their invites" ON community_invites
  FOR UPDATE USING (auth.uid() = invitee_id);

CREATE POLICY "Invitees can delete their invites" ON community_invites
  FOR DELETE USING (auth.uid() = invitee_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_communities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS communities_updated_at ON communities;
CREATE TRIGGER communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW
  EXECUTE FUNCTION update_communities_updated_at();

DROP TRIGGER IF EXISTS community_requests_updated_at ON community_requests;
CREATE TRIGGER community_requests_updated_at
  BEFORE UPDATE ON community_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_communities_updated_at();

DROP TRIGGER IF EXISTS community_invites_updated_at ON community_invites;
CREATE TRIGGER community_invites_updated_at
  BEFORE UPDATE ON community_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_communities_updated_at();

-- Grant permissions
GRANT ALL ON communities TO authenticated;
GRANT ALL ON community_members TO authenticated;
GRANT ALL ON community_requests TO authenticated;
GRANT ALL ON community_invites TO authenticated;
