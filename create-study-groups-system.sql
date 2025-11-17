-- Create study groups system

-- Study groups table
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_members INTEGER DEFAULT 20,
  is_private BOOLEAN DEFAULT false,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study group members table
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Study group messages table
CREATE TABLE IF NOT EXISTS study_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  reply_to UUID REFERENCES study_group_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study group sessions table (scheduled group study sessions)
CREATE TABLE IF NOT EXISTS study_group_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study group session participants table
CREATE TABLE IF NOT EXISTS study_group_session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES study_group_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_groups_course ON study_groups(course_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON study_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_messages_group ON study_group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_messages_user ON study_group_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_messages_created ON study_group_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_group_sessions_group ON study_group_sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_sessions_start ON study_group_sessions(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_study_group_session_participants_session ON study_group_session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_study_group_session_participants_user ON study_group_session_participants(user_id);

-- Enable Row Level Security
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_session_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_groups
CREATE POLICY "Users can view public groups" ON study_groups
  FOR SELECT USING (is_private = false OR id IN (
    SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view their private groups" ON study_groups
  FOR SELECT USING (id IN (
    SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create groups" ON study_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group owners can update their groups" ON study_groups
  FOR UPDATE USING (
    id IN (
      SELECT group_id FROM study_group_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Group owners can delete their groups" ON study_groups
  FOR DELETE USING (
    id IN (
      SELECT group_id FROM study_group_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for study_group_members
CREATE POLICY "Users can view members of groups they belong to" ON study_group_members
  FOR SELECT USING (
    group_id IN (
      SELECT id FROM study_groups WHERE is_private = false
    ) OR group_id IN (
      SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public groups" ON study_group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      (SELECT is_private FROM study_groups WHERE id = group_id) = false OR
      (SELECT invite_code FROM study_groups WHERE id = group_id) IS NOT NULL
    )
  );

CREATE POLICY "Users can leave groups" ON study_group_members
  FOR DELETE USING (auth.uid() = user_id OR group_id IN (
    SELECT group_id FROM study_group_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- RLS Policies for study_group_messages
CREATE POLICY "Group members can view messages" ON study_group_messages
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can send messages" ON study_group_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND group_id IN (
      SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own messages" ON study_group_messages
  FOR DELETE USING (auth.uid() = user_id OR group_id IN (
    SELECT group_id FROM study_group_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- RLS Policies for study_group_sessions
CREATE POLICY "Group members can view sessions" ON study_group_sessions
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can create sessions" ON study_group_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND group_id IN (
      SELECT group_id FROM study_group_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "Session creators can update sessions" ON study_group_sessions
  FOR UPDATE USING (auth.uid() = created_by OR group_id IN (
    SELECT group_id FROM study_group_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Session creators can delete sessions" ON study_group_sessions
  FOR DELETE USING (auth.uid() = created_by OR group_id IN (
    SELECT group_id FROM study_group_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- RLS Policies for study_group_session_participants
CREATE POLICY "Group members can view participants" ON study_group_session_participants
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM study_group_sessions WHERE group_id IN (
        SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can join sessions" ON study_group_session_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON study_group_session_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger for study_groups
CREATE OR REPLACE FUNCTION update_study_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_groups_timestamp
  BEFORE UPDATE ON study_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_study_groups_updated_at();

-- Create updated_at trigger for study_group_messages
CREATE OR REPLACE FUNCTION update_study_group_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_group_messages_timestamp
  BEFORE UPDATE ON study_group_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_study_group_messages_updated_at();

-- Create updated_at trigger for study_group_sessions
CREATE OR REPLACE FUNCTION update_study_group_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_group_sessions_timestamp
  BEFORE UPDATE ON study_group_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_study_group_sessions_updated_at();

-- Function to automatically add creator as owner when creating a group
CREATE OR REPLACE FUNCTION add_group_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO study_group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_group_creator_trigger
  AFTER INSERT ON study_groups
  FOR EACH ROW
  EXECUTE FUNCTION add_group_creator_as_owner();

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    code := substring(md5(random()::text) from 1 for 8);
    SELECT EXISTS(SELECT 1 FROM study_groups WHERE invite_code = code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE study_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_session_participants;

-- Grant permissions
GRANT ALL ON study_groups TO authenticated;
GRANT ALL ON study_group_members TO authenticated;
GRANT ALL ON study_group_messages TO authenticated;
GRANT ALL ON study_group_sessions TO authenticated;
GRANT ALL ON study_group_session_participants TO authenticated;

-- Grant permissions for sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
