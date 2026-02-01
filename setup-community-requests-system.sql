-- ============================================================================
-- COMMUNITY REQUEST MANAGEMENT SYSTEM
-- ============================================================================
-- This sets up the complete system for community owners to manage join requests
-- Similar to the friends system with accept/reject functionality
-- ============================================================================

-- Ensure the community_requests table exists with correct structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'community_requests') THEN
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
  END IF;
END $$;

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_community_requests_community_id ON community_requests(community_id);
CREATE INDEX IF NOT EXISTS idx_community_requests_user_id ON community_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_community_requests_status ON community_requests(status);
CREATE INDEX IF NOT EXISTS idx_community_requests_created_at ON community_requests(created_at DESC);

-- Enable RLS
ALTER TABLE community_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own requests" ON community_requests;
DROP POLICY IF EXISTS "Admins can view community requests" ON community_requests;
DROP POLICY IF EXISTS "Users can create requests" ON community_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON community_requests;
DROP POLICY IF EXISTS "Users can delete their own requests" ON community_requests;
DROP POLICY IF EXISTS "Community creators can view requests" ON community_requests;
DROP POLICY IF EXISTS "Community creators can update requests" ON community_requests;

-- Create comprehensive RLS policies
-- 1. Users can view their own requests
CREATE POLICY "Users can view their own requests" 
  ON community_requests FOR SELECT 
  USING (auth.uid() = user_id);

-- 2. Community admins can view all requests for their communities
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

-- 3. Community creators can view all requests (even if not in members table yet)
CREATE POLICY "Community creators can view requests"
  ON community_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_requests.community_id
      AND communities.created_by = auth.uid()
    )
  );

-- 4. Users can create join requests for communities they're not members of
CREATE POLICY "Users can create requests" 
  ON community_requests FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    -- Must be for a closed community
    EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_id
      AND communities.visibility = 'closed'
    ) AND
    -- User must not already be a member
    NOT EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = community_requests.community_id
      AND community_members.user_id = auth.uid()
    )
  );

-- 5. Admins can update request status (accept/reject)
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

-- 6. Community creators can update requests
CREATE POLICY "Community creators can update requests"
  ON community_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_requests.community_id
      AND communities.created_by = auth.uid()
    )
  );

-- 7. Users can delete their own pending requests
CREATE POLICY "Users can delete their own requests" 
  ON community_requests FOR DELETE 
  USING (
    auth.uid() = user_id AND 
    status = 'pending'
  );

-- ============================================================================
-- HELPER FUNCTIONS FOR REQUEST MANAGEMENT
-- ============================================================================

-- Function to get pending requests count for a community
CREATE OR REPLACE FUNCTION get_community_pending_requests_count(p_community_id UUID)
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

-- Function to check if user is admin or creator of community
CREATE OR REPLACE FUNCTION is_community_admin_or_creator(p_community_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM communities
    WHERE id = p_community_id
    AND created_by = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = p_community_id
    AND user_id = p_user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept a join request and add user as member
CREATE OR REPLACE FUNCTION accept_community_request(
  p_request_id UUID,
  p_admin_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_request community_requests;
  v_is_admin BOOLEAN;
BEGIN
  -- Get the request
  SELECT * INTO v_request
  FROM community_requests
  WHERE id = p_request_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Request not found or already processed'
    );
  END IF;

  -- Check if user is admin or creator
  SELECT is_community_admin_or_creator(v_request.community_id, p_admin_user_id)
  INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You must be an admin to accept requests'
    );
  END IF;

  -- Add user as member
  INSERT INTO community_members (community_id, user_id, role)
  VALUES (v_request.community_id, v_request.user_id, 'member')
  ON CONFLICT (community_id, user_id) DO NOTHING;

  -- Update request status
  UPDATE community_requests
  SET 
    status = 'accepted',
    reviewed_by = p_admin_user_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  -- Update community member count
  UPDATE communities
  SET 
    member_count = member_count + 1,
    updated_at = NOW()
  WHERE id = v_request.community_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Request accepted successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a join request
CREATE OR REPLACE FUNCTION reject_community_request(
  p_request_id UUID,
  p_admin_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_request community_requests;
  v_is_admin BOOLEAN;
BEGIN
  -- Get the request
  SELECT * INTO v_request
  FROM community_requests
  WHERE id = p_request_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Request not found or already processed'
    );
  END IF;

  -- Check if user is admin or creator
  SELECT is_community_admin_or_creator(v_request.community_id, p_admin_user_id)
  INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You must be an admin to reject requests'
    );
  END IF;

  -- Update request status
  UPDATE community_requests
  SET 
    status = 'rejected',
    reviewed_by = p_admin_user_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Request rejected'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all pending requests for communities where user is admin
CREATE OR REPLACE FUNCTION get_my_community_requests(p_user_id UUID)
RETURNS TABLE (
  request_id UUID,
  community_id UUID,
  community_name TEXT,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  message TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id as request_id,
    cr.community_id,
    c.name as community_name,
    cr.user_id,
    p.username,
    p.display_name,
    cr.message,
    cr.created_at
  FROM community_requests cr
  INNER JOIN communities c ON c.id = cr.community_id
  INNER JOIN profiles p ON p.id = cr.user_id
  WHERE cr.status = 'pending'
  AND (
    c.created_by = p_user_id OR
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = cr.community_id
      AND cm.user_id = p_user_id
      AND cm.role = 'admin'
    )
  )
  ORDER BY cr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_community_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS community_requests_updated_at ON community_requests;

CREATE TRIGGER community_requests_updated_at
  BEFORE UPDATE ON community_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_community_requests_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON community_requests TO authenticated;
GRANT EXECUTE ON FUNCTION get_community_pending_requests_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_community_admin_or_creator(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_community_request(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_community_request(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_community_requests(UUID) TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if table exists and has correct structure
DO $$
BEGIN
  RAISE NOTICE 'Checking community_requests table...';
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'community_requests') THEN
    RAISE NOTICE '✓ community_requests table exists';
  ELSE
    RAISE WARNING '✗ community_requests table does NOT exist';
  END IF;

  -- Check indexes
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'community_requests' AND indexname = 'idx_community_requests_community_id') THEN
    RAISE NOTICE '✓ Index on community_id exists';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'community_requests' AND indexname = 'idx_community_requests_status') THEN
    RAISE NOTICE '✓ Index on status exists';
  END IF;

  -- Check RLS
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'community_requests' AND rowsecurity = true) THEN
    RAISE NOTICE '✓ RLS is enabled';
  ELSE
    RAISE WARNING '✗ RLS is NOT enabled';
  END IF;

  RAISE NOTICE 'Setup complete! Community request management system is ready.';
END $$;
