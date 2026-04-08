-- ============================================================
-- UNIFIED SYSTEMS SQL: Achievements, Focus, Leaderboards, Community
-- Run this in your Supabase SQL Editor to set up all systems
-- ============================================================

-- ============================================================
-- 1. CORE TABLES (ensure they exist with all required columns)
-- ============================================================

-- 1a. user_progress - central table for tracking study stats & leaderboard
CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_study_time INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date TIMESTAMPTZ,
  total_points INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS total_study_time INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_study_date TIMESTAMPTZ;

-- 1b. user_levels - XP and leveling system
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  level_progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  last_level_up TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 1c. point_transactions - audit trail for all XP/point awards
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1d. level_definitions - level tier data
CREATE TABLE IF NOT EXISTS level_definitions (
  level INTEGER PRIMARY KEY,
  required_xp INTEGER NOT NULL,
  tier TEXT NOT NULL,
  tier_color TEXT NOT NULL,
  icon_emoji TEXT NOT NULL,
  title TEXT NOT NULL,
  title_sv TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. ACHIEVEMENTS SYSTEM
-- ============================================================

-- 2a. achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  category TEXT NOT NULL DEFAULT 'study',
  requirement_type TEXT NOT NULL,
  requirement_target INTEGER NOT NULL DEFAULT 1,
  requirement_timeframe TEXT DEFAULT 'total',
  reward_points INTEGER NOT NULL DEFAULT 25,
  reward_badge TEXT,
  rarity TEXT DEFAULT 'common',
  xp_reward INTEGER DEFAULT 25,
  is_hidden BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE achievements ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common';
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 25;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 2b. user_achievements - per-user progress
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- ============================================================
-- 3. DAILY CHALLENGES SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL,
  title TEXT NOT NULL,
  title_sv TEXT NOT NULL,
  description TEXT NOT NULL,
  description_sv TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy',
  emoji TEXT NOT NULL DEFAULT '🎯',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_date, challenge_type)
);

CREATE TABLE IF NOT EXISTS user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  challenge_date DATE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_daily_challenges ADD COLUMN IF NOT EXISTS challenge_date DATE;

-- ============================================================
-- 4. COMMUNITY SYSTEM
-- ============================================================

-- 4a. communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'study-group',
  visibility TEXT NOT NULL DEFAULT 'open',
  school_id TEXT,
  school_name TEXT,
  program_id TEXT,
  program_name TEXT,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4b. community_members
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- 4c. community_requests
CREATE TABLE IF NOT EXISTS community_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- 4d. community_invites
CREATE TABLE IF NOT EXISTS community_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, invitee_id)
);

-- 4e. community_messages - posts/messages in communities
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'discussion',
  image_url TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES community_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'discussion';
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES community_messages(id) ON DELETE CASCADE;

-- 4f. community_message_likes
CREATE TABLE IF NOT EXISTS community_message_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- ============================================================
-- 5. POMODORO SESSIONS (ensure proper structure)
-- ============================================================

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT,
  duration INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. FRIENDS SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ============================================================
-- 7. USER POINTS ADJUSTMENTS (for bonus/penalty tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_points_adjustments (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  claimed_challenge_ids JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_progress_total_study_time ON user_progress(total_study_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_total_xp ON user_progress(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_total_points ON user_progress(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_current_streak ON user_progress(current_streak DESC);

CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_total_xp ON user_levels(total_xp DESC);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_start_time ON pomodoro_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_start ON pomodoro_sessions(user_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_achievements_key ON achievements(achievement_key);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(user_id, unlocked_at);

CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_community ON community_messages(community_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_user ON community_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_parent ON community_messages(parent_id);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user ON user_daily_challenges(user_id);

-- ============================================================
-- 9. RLS POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_message_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points_adjustments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating (avoids conflicts)
DO $$ BEGIN
  -- user_progress
  DROP POLICY IF EXISTS "user_progress_select" ON user_progress;
  DROP POLICY IF EXISTS "user_progress_insert" ON user_progress;
  DROP POLICY IF EXISTS "user_progress_update" ON user_progress;
  -- user_levels
  DROP POLICY IF EXISTS "user_levels_select" ON user_levels;
  DROP POLICY IF EXISTS "user_levels_insert" ON user_levels;
  DROP POLICY IF EXISTS "user_levels_update" ON user_levels;
  -- point_transactions
  DROP POLICY IF EXISTS "pt_select" ON point_transactions;
  DROP POLICY IF EXISTS "pt_insert" ON point_transactions;
  -- achievements
  DROP POLICY IF EXISTS "achievements_select" ON achievements;
  -- user_achievements
  DROP POLICY IF EXISTS "ua_select" ON user_achievements;
  DROP POLICY IF EXISTS "ua_insert" ON user_achievements;
  DROP POLICY IF EXISTS "ua_update" ON user_achievements;
  -- daily_challenges
  DROP POLICY IF EXISTS "dc_select" ON daily_challenges;
  -- user_daily_challenges
  DROP POLICY IF EXISTS "udc_select" ON user_daily_challenges;
  DROP POLICY IF EXISTS "udc_insert" ON user_daily_challenges;
  DROP POLICY IF EXISTS "udc_update" ON user_daily_challenges;
  -- communities
  DROP POLICY IF EXISTS "communities_select" ON communities;
  DROP POLICY IF EXISTS "communities_insert" ON communities;
  DROP POLICY IF EXISTS "communities_update" ON communities;
  DROP POLICY IF EXISTS "communities_delete" ON communities;
  -- community_members
  DROP POLICY IF EXISTS "cm_select" ON community_members;
  DROP POLICY IF EXISTS "cm_insert" ON community_members;
  DROP POLICY IF EXISTS "cm_delete" ON community_members;
  -- community_requests
  DROP POLICY IF EXISTS "cr_select" ON community_requests;
  DROP POLICY IF EXISTS "cr_insert" ON community_requests;
  DROP POLICY IF EXISTS "cr_update" ON community_requests;
  DROP POLICY IF EXISTS "cr_delete" ON community_requests;
  -- community_invites
  DROP POLICY IF EXISTS "ci_select" ON community_invites;
  DROP POLICY IF EXISTS "ci_insert" ON community_invites;
  DROP POLICY IF EXISTS "ci_update" ON community_invites;
  -- community_messages
  DROP POLICY IF EXISTS "cmsg_select" ON community_messages;
  DROP POLICY IF EXISTS "cmsg_insert" ON community_messages;
  DROP POLICY IF EXISTS "cmsg_update" ON community_messages;
  DROP POLICY IF EXISTS "cmsg_delete" ON community_messages;
  -- community_message_likes
  DROP POLICY IF EXISTS "cml_select" ON community_message_likes;
  DROP POLICY IF EXISTS "cml_insert" ON community_message_likes;
  DROP POLICY IF EXISTS "cml_delete" ON community_message_likes;
  -- pomodoro_sessions
  DROP POLICY IF EXISTS "ps_select" ON pomodoro_sessions;
  DROP POLICY IF EXISTS "ps_insert" ON pomodoro_sessions;
  -- friends
  DROP POLICY IF EXISTS "friends_select" ON friends;
  DROP POLICY IF EXISTS "friends_insert" ON friends;
  DROP POLICY IF EXISTS "friends_update" ON friends;
  DROP POLICY IF EXISTS "friends_delete" ON friends;
  -- user_points_adjustments
  DROP POLICY IF EXISTS "upa_select" ON user_points_adjustments;
  DROP POLICY IF EXISTS "upa_insert" ON user_points_adjustments;
  DROP POLICY IF EXISTS "upa_update" ON user_points_adjustments;
END $$;

-- user_progress: all can read (for leaderboard), own can write
CREATE POLICY "user_progress_select" ON user_progress FOR SELECT USING (true);
CREATE POLICY "user_progress_insert" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_progress_update" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- user_levels: all can read (for leaderboard), own can write
CREATE POLICY "user_levels_select" ON user_levels FOR SELECT USING (true);
CREATE POLICY "user_levels_insert" ON user_levels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_levels_update" ON user_levels FOR UPDATE USING (auth.uid() = user_id);

-- point_transactions: own only
CREATE POLICY "pt_select" ON point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pt_insert" ON point_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- achievements: public read
CREATE POLICY "achievements_select" ON achievements FOR SELECT USING (true);

-- user_achievements: own can read/write
CREATE POLICY "ua_select" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ua_insert" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ua_update" ON user_achievements FOR UPDATE USING (auth.uid() = user_id);

-- daily_challenges: public read
CREATE POLICY "dc_select" ON daily_challenges FOR SELECT USING (true);

-- user_daily_challenges: own
CREATE POLICY "udc_select" ON user_daily_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "udc_insert" ON user_daily_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "udc_update" ON user_daily_challenges FOR UPDATE USING (auth.uid() = user_id);

-- communities: public read, authenticated write
CREATE POLICY "communities_select" ON communities FOR SELECT USING (true);
CREATE POLICY "communities_insert" ON communities FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "communities_update" ON communities FOR UPDATE USING (true);
CREATE POLICY "communities_delete" ON communities FOR DELETE USING (auth.uid() = created_by);

-- community_members
CREATE POLICY "cm_select" ON community_members FOR SELECT USING (true);
CREATE POLICY "cm_insert" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cm_delete" ON community_members FOR DELETE USING (auth.uid() = user_id);

-- community_requests
CREATE POLICY "cr_select" ON community_requests FOR SELECT USING (true);
CREATE POLICY "cr_insert" ON community_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cr_update" ON community_requests FOR UPDATE USING (true);
CREATE POLICY "cr_delete" ON community_requests FOR DELETE USING (true);

-- community_invites
CREATE POLICY "ci_select" ON community_invites FOR SELECT USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);
CREATE POLICY "ci_insert" ON community_invites FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "ci_update" ON community_invites FOR UPDATE USING (auth.uid() = invitee_id);

-- community_messages: members can read, own can write
CREATE POLICY "cmsg_select" ON community_messages FOR SELECT USING (true);
CREATE POLICY "cmsg_insert" ON community_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cmsg_update" ON community_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cmsg_delete" ON community_messages FOR DELETE USING (auth.uid() = user_id);

-- community_message_likes
CREATE POLICY "cml_select" ON community_message_likes FOR SELECT USING (true);
CREATE POLICY "cml_insert" ON community_message_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cml_delete" ON community_message_likes FOR DELETE USING (auth.uid() = user_id);

-- pomodoro_sessions: own can read/write, all can read (for leaderboard)
CREATE POLICY "ps_select" ON pomodoro_sessions FOR SELECT USING (true);
CREATE POLICY "ps_insert" ON pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- friends
CREATE POLICY "friends_select" ON friends FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "friends_insert" ON friends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "friends_update" ON friends FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "friends_delete" ON friends FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- user_points_adjustments
CREATE POLICY "upa_select" ON user_points_adjustments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "upa_insert" ON user_points_adjustments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "upa_update" ON user_points_adjustments FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 10. FUNCTIONS: Achievement checking
-- ============================================================

CREATE OR REPLACE FUNCTION check_user_achievements(p_user_id UUID)
RETURNS TABLE(
  achievement_id UUID,
  achievement_key TEXT,
  title TEXT,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER,
  achievements JSONB
) AS $$
DECLARE
  v_total_study_time INTEGER;
  v_total_sessions INTEGER;
  v_current_streak INTEGER;
  v_friend_count INTEGER;
  v_course_count INTEGER;
  v_achievement RECORD;
  v_current_progress INTEGER;
BEGIN
  -- Get user stats from user_progress
  SELECT 
    COALESCE(up.total_study_time, 0),
    COALESCE(up.total_sessions, 0),
    COALESCE(up.current_streak, 0)
  INTO v_total_study_time, v_total_sessions, v_current_streak
  FROM user_progress up
  WHERE up.user_id = p_user_id;

  -- If no user_progress, calculate from pomodoro_sessions
  IF v_total_study_time IS NULL OR v_total_study_time = 0 THEN
    SELECT 
      COALESCE(SUM(ps.duration), 0),
      COUNT(ps.id)
    INTO v_total_study_time, v_total_sessions
    FROM pomodoro_sessions ps
    WHERE ps.user_id = p_user_id;
  END IF;

  -- Count friends (both directions)
  SELECT COUNT(*) INTO v_friend_count
  FROM friends f
  WHERE (f.user_id = p_user_id OR f.friend_id = p_user_id)
    AND f.status = 'accepted';

  -- Count active courses
  SELECT COUNT(*) INTO v_course_count
  FROM user_courses uc
  WHERE uc.user_id = p_user_id;

  -- Initialize user achievements if not exists
  INSERT INTO user_achievements (user_id, achievement_id, progress)
  SELECT p_user_id, a.id, 0
  FROM achievements a
  WHERE NOT EXISTS (
    SELECT 1 FROM user_achievements ua
    WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
  );

  -- Check each achievement
  FOR v_achievement IN 
    SELECT a.* FROM achievements a
    JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = p_user_id
    WHERE ua.unlocked_at IS NULL
  LOOP
    -- Calculate current progress based on requirement type
    CASE v_achievement.requirement_type
      WHEN 'study_time' THEN v_current_progress := v_total_study_time;
      WHEN 'sessions' THEN v_current_progress := v_total_sessions;
      WHEN 'streak' THEN v_current_progress := v_current_streak;
      WHEN 'friends' THEN v_current_progress := v_friend_count;
      WHEN 'courses' THEN v_current_progress := v_course_count;
      ELSE v_current_progress := 0;
    END CASE;

    -- Update progress
    UPDATE user_achievements ua
    SET progress = v_current_progress, updated_at = NOW()
    WHERE ua.user_id = p_user_id AND ua.achievement_id = v_achievement.id;

    -- Check if achievement should be unlocked
    IF v_current_progress >= v_achievement.requirement_target THEN
      -- Unlock the achievement
      UPDATE user_achievements ua
      SET unlocked_at = NOW(), progress = v_current_progress, updated_at = NOW()
      WHERE ua.user_id = p_user_id AND ua.achievement_id = v_achievement.id;

      -- Award XP to user_progress
      UPDATE user_progress
      SET total_points = total_points + COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25),
          total_xp = total_xp + COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25),
          updated_at = NOW()
      WHERE user_progress.user_id = p_user_id;

      -- Also update user_levels
      UPDATE user_levels
      SET total_xp = total_xp + COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25),
          updated_at = NOW()
      WHERE user_levels.user_id = p_user_id;

      -- Return newly unlocked achievement
      RETURN QUERY SELECT 
        v_achievement.id,
        v_achievement.achievement_key,
        v_achievement.title,
        v_achievement.description,
        v_achievement.icon,
        COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25)::INTEGER,
        jsonb_build_object(
          'id', v_achievement.id,
          'title', v_achievement.title,
          'description', v_achievement.description,
          'icon', v_achievement.icon,
          'xp_reward', COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25),
          'category', v_achievement.category,
          'rarity', v_achievement.rarity
        );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 11. FUNCTIONS: Leaderboard queries
-- ============================================================

-- Global leaderboard by total study time
CREATE OR REPLACE FUNCTION get_global_leaderboard(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  rank BIGINT,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  program TEXT,
  level TEXT,
  total_study_time INTEGER,
  total_sessions INTEGER,
  total_xp INTEGER,
  current_streak INTEGER,
  is_current_user BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY COALESCE(up.total_study_time, 0) DESC) as rank,
    p.id as user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.program,
    p.level,
    COALESCE(up.total_study_time, 0) as total_study_time,
    COALESCE(up.total_sessions, 0) as total_sessions,
    COALESCE(up.total_xp, COALESCE(up.total_points, 0)) as total_xp,
    COALESCE(up.current_streak, 0) as current_streak,
    (p.id = p_user_id) as is_current_user
  FROM profiles p
  LEFT JOIN user_progress up ON up.user_id = p.id
  WHERE COALESCE(up.total_study_time, 0) > 0
  ORDER BY COALESCE(up.total_study_time, 0) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Weekly leaderboard
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  rank BIGINT,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  program TEXT,
  level TEXT,
  weekly_minutes BIGINT,
  weekly_sessions BIGINT,
  is_current_user BOOLEAN
) AS $$
DECLARE
  v_week_start TIMESTAMPTZ;
BEGIN
  v_week_start := date_trunc('week', NOW());
  
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ps.duration), 0) DESC) as rank,
    p.id as user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.program,
    p.level,
    COALESCE(SUM(ps.duration), 0)::BIGINT as weekly_minutes,
    COUNT(ps.id)::BIGINT as weekly_sessions,
    (p.id = p_user_id) as is_current_user
  FROM profiles p
  LEFT JOIN pomodoro_sessions ps ON ps.user_id = p.id AND ps.start_time >= v_week_start
  GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.program, p.level
  HAVING COALESCE(SUM(ps.duration), 0) > 0
  ORDER BY weekly_minutes DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Friends leaderboard
CREATE OR REPLACE FUNCTION get_friends_leaderboard(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  rank BIGINT,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  program TEXT,
  level TEXT,
  total_study_time INTEGER,
  total_sessions INTEGER,
  current_streak INTEGER,
  is_current_user BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH friend_ids AS (
    SELECT f.friend_id as fid FROM friends f WHERE f.user_id = p_user_id AND f.status = 'accepted'
    UNION
    SELECT f.user_id as fid FROM friends f WHERE f.friend_id = p_user_id AND f.status = 'accepted'
    UNION
    SELECT p_user_id as fid
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY COALESCE(up.total_study_time, 0) DESC) as rank,
    p.id as user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.program,
    p.level,
    COALESCE(up.total_study_time, 0) as total_study_time,
    COALESCE(up.total_sessions, 0) as total_sessions,
    COALESCE(up.current_streak, 0) as current_streak,
    (p.id = p_user_id) as is_current_user
  FROM friend_ids fi
  JOIN profiles p ON p.id = fi.fid
  LEFT JOIN user_progress up ON up.user_id = fi.fid
  ORDER BY COALESCE(up.total_study_time, 0) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 12. FUNCTIONS: Daily challenge generation
-- ============================================================

CREATE OR REPLACE FUNCTION generate_daily_challenges(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
  -- Only generate if not already existing for this date
  IF EXISTS (SELECT 1 FROM daily_challenges WHERE challenge_date = p_date LIMIT 1) THEN
    RETURN;
  END IF;
  
  INSERT INTO daily_challenges (challenge_date, title, title_sv, description, description_sv, challenge_type, target_value, xp_reward, difficulty, emoji) VALUES
    (p_date, 'Quick Focus', 'Snabbfokus', 'Study for 15 minutes today', 'Studera i 15 minuter idag', 'study_minutes', 15, 30, 'easy', '⏱️'),
    (p_date, 'First Session', 'Första Passet', 'Complete 1 study session', 'Slutför 1 studiepass', 'sessions_count', 1, 35, 'easy', '📚'),
    (p_date, 'Focus Hour', 'Fokustimme', 'Study for 45 minutes today', 'Studera i 45 minuter idag', 'study_minutes', 45, 60, 'medium', '🔥'),
    (p_date, 'Double Session', 'Dubbelpass', 'Complete 2 study sessions', 'Slutför 2 studiepass', 'sessions_count', 2, 75, 'medium', '💪'),
    (p_date, 'Study Marathon', 'Studiemaraton', 'Study for 90 minutes today', 'Studera i 90 minuter idag', 'study_minutes', 90, 120, 'hard', '🏆'),
    (p_date, 'Triple Threat', 'Trippelpass', 'Complete 3 study sessions', 'Slutför 3 studiepass', 'sessions_count', 3, 150, 'hard', '⭐');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate today's challenges
SELECT generate_daily_challenges(CURRENT_DATE);

-- ============================================================
-- 13. FUNCTIONS: Sync user_progress after pomodoro session
-- ============================================================

CREATE OR REPLACE FUNCTION sync_user_progress_after_session()
RETURNS TRIGGER AS $$
DECLARE
  v_today DATE;
  v_last_date DATE;
  v_streak INTEGER;
  v_longest INTEGER;
BEGIN
  v_today := CURRENT_DATE;
  
  -- Get current progress
  SELECT current_streak, longest_streak, last_study_date::DATE
  INTO v_streak, v_longest, v_last_date
  FROM user_progress
  WHERE user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    -- Create new progress record
    INSERT INTO user_progress (user_id, total_study_time, total_sessions, current_streak, longest_streak, last_study_date, updated_at)
    VALUES (NEW.user_id, NEW.duration, 1, 1, 1, NOW(), NOW());
    RETURN NEW;
  END IF;
  
  -- Calculate streak
  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    v_streak := 1;
  ELSIF v_last_date = v_today - 1 THEN
    v_streak := v_streak + 1;
  END IF;
  -- If v_last_date = v_today, keep streak as is
  
  v_longest := GREATEST(COALESCE(v_longest, 0), v_streak);
  
  UPDATE user_progress SET
    total_study_time = total_study_time + NEW.duration,
    total_sessions = total_sessions + 1,
    current_streak = v_streak,
    longest_streak = v_longest,
    last_study_date = NOW(),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS trg_sync_user_progress ON pomodoro_sessions;
CREATE TRIGGER trg_sync_user_progress
  AFTER INSERT ON pomodoro_sessions
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_progress_after_session();

-- ============================================================
-- 14. FUNCTIONS: Update community member count
-- ============================================================

CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*) INTO v_count FROM community_members WHERE community_id = NEW.community_id;
    UPDATE communities SET member_count = v_count WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT COUNT(*) INTO v_count FROM community_members WHERE community_id = OLD.community_id;
    UPDATE communities SET member_count = v_count WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_community_count ON community_members;
CREATE TRIGGER trg_update_community_count
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_member_count();

-- ============================================================
-- 15. FUNCTIONS: Update message reply/like counts
-- ============================================================

CREATE OR REPLACE FUNCTION update_message_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_messages SET likes_count = likes_count + 1 WHERE id = NEW.message_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_messages SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.message_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_likes_count ON community_message_likes;
CREATE TRIGGER trg_update_likes_count
  AFTER INSERT OR DELETE ON community_message_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_message_likes_count();

CREATE OR REPLACE FUNCTION update_message_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE community_messages SET replies_count = replies_count + 1 WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE community_messages SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = OLD.parent_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_replies_count ON community_messages;
CREATE TRIGGER trg_update_replies_count
  AFTER INSERT OR DELETE ON community_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_message_replies_count();

-- ============================================================
-- 16. INSERT ACHIEVEMENTS DATA
-- ============================================================

INSERT INTO achievements (achievement_key, title, description, icon, category, requirement_type, requirement_target, requirement_timeframe, reward_points, reward_badge, rarity, xp_reward, is_hidden, sort_order) VALUES
  ('first_lesson', 'Första Lektionen', 'Slutför din första studiesession', '📚', 'study', 'sessions', 1, 'total', 25, '📚', 'common', 25, false, 1),
  ('five_lessons', 'Fem Sessioner', 'Slutför 5 studiesessioner', '📖', 'study', 'sessions', 5, 'total', 50, '📖', 'common', 50, false, 2),
  ('ten_lessons', 'Tio Sessioner', 'Slutför 10 studiesessioner', '🎯', 'study', 'sessions', 10, 'total', 75, '🎯', 'uncommon', 75, false, 3),
  ('twenty_five_lessons', 'Tjugofem Sessioner', 'Slutför 25 studiesessioner', '🌟', 'study', 'sessions', 25, 'total', 150, '🌟', 'uncommon', 150, false, 4),
  ('fifty_lessons', 'Femtio Sessioner', 'Slutför 50 studiesessioner', '💎', 'study', 'sessions', 50, 'total', 250, '💎', 'rare', 250, false, 5),
  ('hundred_lessons', 'Hundra Sessioner', 'Slutför 100 studiesessioner', '👑', 'study', 'sessions', 100, 'total', 500, '👑', 'epic', 500, false, 6),
  ('first_hour', 'Första Timmen', 'Studera i totalt 60 minuter', '⏱️', 'study', 'study_time', 60, 'total', 50, '⏱️', 'common', 50, false, 10),
  ('five_hours', 'Fem Timmar', 'Studera i totalt 5 timmar', '⏰', 'study', 'study_time', 300, 'total', 100, '⏰', 'uncommon', 100, false, 11),
  ('ten_hours', 'Tio Timmar', 'Studera i totalt 10 timmar', '🕐', 'study', 'study_time', 600, 'total', 200, '🕐', 'rare', 200, false, 12),
  ('twenty_five_hours', 'Tjugofem Timmar', 'Studera i totalt 25 timmar', '🔥', 'study', 'study_time', 1500, 'total', 400, '🔥', 'epic', 400, false, 13),
  ('fifty_hours', 'Femtio Timmar', 'Studera i totalt 50 timmar', '🏆', 'study', 'study_time', 3000, 'total', 750, '🏆', 'legendary', 750, false, 14),
  ('streak_3', 'Tre Dagars Streak', 'Håll en 3 dagars studiestreak', '🔥', 'streak', 'streak', 3, 'total', 50, '🔥', 'common', 50, false, 20),
  ('streak_7', 'Veckostreak', 'Håll en 7 dagars studiestreak', '📅', 'streak', 'streak', 7, 'total', 100, '📅', 'uncommon', 100, false, 21),
  ('streak_14', 'Två Veckor', 'Håll en 14 dagars studiestreak', '🗓️', 'streak', 'streak', 14, 'total', 200, '🗓️', 'rare', 200, false, 22),
  ('streak_30', 'Månadsstreak', 'Håll en 30 dagars studiestreak', '📆', 'streak', 'streak', 30, 'total', 400, '📆', 'epic', 400, false, 23),
  ('streak_100', 'Legendstreak', 'Håll en 100 dagars studiestreak', '👑', 'streak', 'streak', 100, 'total', 1000, '👑', 'legendary', 1000, false, 24),
  ('first_friend', 'Första Vännen', 'Lägg till din första vän', '👋', 'social', 'friends', 1, 'total', 50, '👋', 'common', 50, false, 40),
  ('five_friends', 'Fem Vänner', 'Lägg till 5 vänner', '👥', 'social', 'friends', 5, 'total', 100, '👥', 'uncommon', 100, false, 41),
  ('ten_friends', 'Tio Vänner', 'Lägg till 10 vänner', '🤝', 'social', 'friends', 10, 'total', 200, '🤝', 'rare', 200, false, 42),
  ('first_course', 'Första Kursen', 'Lägg till din första kurs', '📕', 'study', 'courses', 1, 'total', 25, '📕', 'common', 25, false, 50),
  ('three_courses', 'Tre Kurser', 'Lägg till 3 kurser', '📗', 'study', 'courses', 3, 'total', 75, '📗', 'uncommon', 75, false, 51),
  ('five_courses', 'Fem Kurser', 'Lägg till 5 kurser', '📘', 'study', 'courses', 5, 'total', 150, '📘', 'rare', 150, false, 52)
ON CONFLICT (achievement_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  requirement_type = EXCLUDED.requirement_type,
  requirement_target = EXCLUDED.requirement_target,
  requirement_timeframe = EXCLUDED.requirement_timeframe,
  reward_points = EXCLUDED.reward_points,
  reward_badge = EXCLUDED.reward_badge,
  rarity = EXCLUDED.rarity,
  xp_reward = EXCLUDED.xp_reward,
  is_hidden = EXCLUDED.is_hidden,
  sort_order = EXCLUDED.sort_order;

-- ============================================================
-- 17. BACKFILL: Sync existing pomodoro_sessions to user_progress
-- ============================================================

INSERT INTO user_progress (user_id, total_study_time, total_sessions, current_streak, longest_streak, last_study_date, updated_at)
SELECT 
  ps.user_id,
  SUM(ps.duration),
  COUNT(ps.id),
  0,
  0,
  MAX(ps.end_time),
  NOW()
FROM pomodoro_sessions ps
WHERE NOT EXISTS (SELECT 1 FROM user_progress up WHERE up.user_id = ps.user_id)
GROUP BY ps.user_id
ON CONFLICT (user_id) DO UPDATE SET
  total_study_time = GREATEST(user_progress.total_study_time, EXCLUDED.total_study_time),
  total_sessions = GREATEST(user_progress.total_sessions, EXCLUDED.total_sessions),
  updated_at = NOW();

-- Also sync user_levels total_xp to user_progress
UPDATE user_progress up
SET total_xp = COALESCE(ul.total_xp, up.total_points, 0)
FROM user_levels ul
WHERE ul.user_id = up.user_id AND ul.total_xp > up.total_xp;

-- ============================================================
-- DONE! All systems are now properly set up and connected.
-- ============================================================
