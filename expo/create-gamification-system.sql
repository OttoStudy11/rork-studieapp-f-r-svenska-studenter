-- Comprehensive Gamification System Schema
-- Run this in your Supabase SQL editor

-- 1. Level Definitions Table
CREATE TABLE IF NOT EXISTS level_definitions (
  level INTEGER PRIMARY KEY,
  required_xp INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('beginner', 'intermediate', 'advanced', 'expert', 'master', 'legend')),
  tier_color TEXT NOT NULL,
  icon_emoji TEXT NOT NULL,
  title TEXT NOT NULL,
  title_sv TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Levels Table (tracks user progression)
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1 REFERENCES level_definitions(level),
  total_xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  level_progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  last_level_up TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Points Transactions Table (audit trail)
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'lesson_complete', 'quiz_complete', 'daily_streak', 'challenge_complete',
    'achievement_unlock', 'level_up_bonus', 'course_complete', 'off_peak_bonus',
    'first_achievement', 'manual', 'penalty'
  )),
  source_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enhanced Achievements Table (with rarity)
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common' 
  CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary'));
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 25;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 5. Daily Challenges Table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL,
  title TEXT NOT NULL,
  title_sv TEXT NOT NULL,
  description TEXT NOT NULL,
  description_sv TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN (
    'study_minutes', 'sessions_count', 'quiz_score', 'streak_maintain',
    'lesson_complete', 'notes_create', 'early_bird', 'night_owl'
  )),
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_date, challenge_type)
);

-- 6. User Daily Challenges Progress
CREATE TABLE IF NOT EXISTS user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
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

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_current_level ON user_levels(current_level);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_source_type ON point_transactions(source_type);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user_id ON user_daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_challenge_id ON user_daily_challenges(challenge_id);

-- 8. Insert Level Definitions (50 levels with escalating XP)
INSERT INTO level_definitions (level, required_xp, tier, tier_color, icon_emoji, title, title_sv, description) VALUES
  (1, 0, 'beginner', '#9CA3AF', '🌱', 'Newcomer', 'Nybörjare', 'Just starting your learning journey'),
  (2, 100, 'beginner', '#9CA3AF', '📚', 'Student', 'Student', 'Beginning to learn'),
  (3, 250, 'beginner', '#9CA3AF', '✏️', 'Learner', 'Lärling', 'Developing study habits'),
  (4, 450, 'beginner', '#9CA3AF', '📖', 'Apprentice', 'Lärjunge', 'Growing knowledge'),
  (5, 700, 'beginner', '#9CA3AF', '🎯', 'Focused', 'Fokuserad', 'Building consistency'),
  (6, 1000, 'beginner', '#10B981', '🌟', 'Dedicated', 'Dedikerad', 'Committed to learning'),
  (7, 1350, 'beginner', '#10B981', '💡', 'Bright', 'Ljus', 'Ideas are flowing'),
  (8, 1750, 'beginner', '#10B981', '🔥', 'On Fire', 'På Eld', 'Burning with passion'),
  (9, 2200, 'beginner', '#10B981', '⚡', 'Energized', 'Energisk', 'Full of energy'),
  (10, 2700, 'intermediate', '#3B82F6', '🚀', 'Rising Star', 'Stigande Stjärna', 'Taking off!'),
  (11, 3300, 'intermediate', '#3B82F6', '🎖️', 'Achiever', 'Presterare', 'Achieving goals'),
  (12, 4000, 'intermediate', '#3B82F6', '🏅', 'Medal Winner', 'Medaljvinnare', 'Earning recognition'),
  (13, 4800, 'intermediate', '#3B82F6', '🎓', 'Scholar', 'Lärd', 'Deep understanding'),
  (14, 5700, 'intermediate', '#3B82F6', '📊', 'Analyst', 'Analytiker', 'Critical thinking'),
  (15, 6700, 'intermediate', '#3B82F6', '🧠', 'Intellectual', 'Intellektuell', 'Sharp mind'),
  (16, 7800, 'intermediate', '#3B82F6', '💎', 'Gem', 'Juvel', 'Precious knowledge'),
  (17, 9000, 'intermediate', '#3B82F6', '🌈', 'Versatile', 'Mångsidig', 'Well-rounded'),
  (18, 10300, 'intermediate', '#3B82F6', '🎪', 'Performer', 'Utförare', 'Consistent performer'),
  (19, 11700, 'intermediate', '#3B82F6', '🎭', 'Virtuoso', 'Virtuos', 'Skilled learner'),
  (20, 13200, 'advanced', '#8B5CF6', '⭐', 'Star', 'Stjärna', 'Shining bright'),
  (21, 14800, 'advanced', '#8B5CF6', '🌙', 'Luminary', 'Lysande', 'Guiding light'),
  (22, 16500, 'advanced', '#8B5CF6', '☀️', 'Radiant', 'Strålande', 'Bright future'),
  (23, 18300, 'advanced', '#8B5CF6', '🔮', 'Visionary', 'Visionär', 'Seeing ahead'),
  (24, 20200, 'advanced', '#8B5CF6', '🎯', 'Marksman', 'Prickskytt', 'Hitting targets'),
  (25, 22200, 'advanced', '#8B5CF6', '🏆', 'Champion', 'Mästare', 'Top performer'),
  (26, 24300, 'advanced', '#8B5CF6', '🛡️', 'Guardian', 'Väktare', 'Protecting knowledge'),
  (27, 26500, 'advanced', '#8B5CF6', '⚔️', 'Warrior', 'Krigare', 'Fighting for success'),
  (28, 28800, 'advanced', '#8B5CF6', '🦅', 'Eagle', 'Örn', 'Soaring high'),
  (29, 31200, 'advanced', '#8B5CF6', '🐉', 'Dragon', 'Drake', 'Powerful presence'),
  (30, 33700, 'expert', '#EC4899', '👑', 'Royalty', 'Kunglig', 'Ruling the realm'),
  (31, 36300, 'expert', '#EC4899', '💫', 'Cosmic', 'Kosmisk', 'Universal knowledge'),
  (32, 39000, 'expert', '#EC4899', '🌌', 'Galactic', 'Galaktisk', 'Expanding horizons'),
  (33, 41800, 'expert', '#EC4899', '🎇', 'Spectacular', 'Spektakulär', 'Awe-inspiring'),
  (34, 44700, 'expert', '#EC4899', '🏛️', 'Sage', 'Vis', 'Ancient wisdom'),
  (35, 47700, 'expert', '#EC4899', '📜', 'Scribe', 'Skrivare', 'Recording history'),
  (36, 50800, 'expert', '#EC4899', '🗝️', 'Keymaster', 'Nyckelmästare', 'Unlocking secrets'),
  (37, 54000, 'expert', '#EC4899', '🌀', 'Mystic', 'Mystiker', 'Deep mysteries'),
  (38, 57300, 'expert', '#EC4899', '✨', 'Enchanter', 'Förtrollare', 'Magical learning'),
  (39, 60700, 'expert', '#EC4899', '🔱', 'Trident', 'Treudd', 'Triple power'),
  (40, 64200, 'master', '#F59E0B', '🌟', 'Grandmaster', 'Stormästare', 'Peak mastery'),
  (41, 67800, 'master', '#F59E0B', '💠', 'Diamond', 'Diamant', 'Unbreakable'),
  (42, 71500, 'master', '#F59E0B', '🔶', 'Amber', 'Bärnsten', 'Preserved excellence'),
  (43, 75300, 'master', '#F59E0B', '🏰', 'Fortress', 'Fästning', 'Unshakeable'),
  (44, 79200, 'master', '#F59E0B', '⚜️', 'Noble', 'Ädel', 'Distinguished'),
  (45, 83200, 'master', '#F59E0B', '🎺', 'Herald', 'Härold', 'Announcing greatness'),
  (46, 87300, 'master', '#F59E0B', '🦁', 'Lion', 'Lejon', 'King of learning'),
  (47, 91500, 'master', '#F59E0B', '🦋', 'Metamorphosis', 'Metamorfos', 'Complete transformation'),
  (48, 95800, 'master', '#F59E0B', '🌠', 'Shooting Star', 'Stjärnfall', 'Blazing trail'),
  (49, 100200, 'master', '#F59E0B', '🎆', 'Supernova', 'Supernova', 'Explosive brilliance'),
  (50, 104700, 'legend', '#EF4444', '👑', 'Legend', 'Legend', 'Eternal greatness')
ON CONFLICT (level) DO UPDATE SET
  required_xp = EXCLUDED.required_xp,
  tier = EXCLUDED.tier,
  tier_color = EXCLUDED.tier_color,
  icon_emoji = EXCLUDED.icon_emoji,
  title = EXCLUDED.title,
  title_sv = EXCLUDED.title_sv,
  description = EXCLUDED.description;

-- 9. Insert Enhanced Achievements with Rarity
INSERT INTO achievements (id, achievement_key, title, description, icon, category, requirement_type, requirement_target, requirement_timeframe, reward_points, reward_badge, rarity, xp_reward, is_hidden, sort_order) VALUES
  -- Learning Achievements (Common to Rare)
  (gen_random_uuid(), 'first_lesson', 'Första Lektionen', 'Slutför din första lektion', '📚', 'study', 'sessions', 1, 'total', 25, '📚', 'common', 25, false, 1),
  (gen_random_uuid(), 'five_lessons', 'Fem Lektioner', 'Slutför 5 lektioner', '📖', 'study', 'sessions', 5, 'total', 50, '📖', 'common', 50, false, 2),
  (gen_random_uuid(), 'ten_lessons', 'Tio Lektioner', 'Slutför 10 lektioner', '🎯', 'study', 'sessions', 10, 'total', 75, '🎯', 'uncommon', 75, false, 3),
  (gen_random_uuid(), 'twenty_five_lessons', 'Tjugofem Lektioner', 'Slutför 25 lektioner', '🌟', 'study', 'sessions', 25, 'total', 150, '🌟', 'uncommon', 150, false, 4),
  (gen_random_uuid(), 'fifty_lessons', 'Femtio Lektioner', 'Slutför 50 lektioner', '💎', 'study', 'sessions', 50, 'total', 250, '💎', 'rare', 250, false, 5),
  (gen_random_uuid(), 'hundred_lessons', 'Hundra Lektioner', 'Slutför 100 lektioner', '👑', 'study', 'sessions', 100, 'total', 500, '👑', 'epic', 500, false, 6),
  
  -- Study Time Achievements
  (gen_random_uuid(), 'first_hour', 'Första Timmen', 'Studera i totalt 60 minuter', '⏱️', 'study', 'study_time', 60, 'total', 50, '⏱️', 'common', 50, false, 10),
  (gen_random_uuid(), 'five_hours', 'Fem Timmar', 'Studera i totalt 5 timmar', '⏰', 'study', 'study_time', 300, 'total', 100, '⏰', 'uncommon', 100, false, 11),
  (gen_random_uuid(), 'ten_hours', 'Tio Timmar', 'Studera i totalt 10 timmar', '🕐', 'study', 'study_time', 600, 'total', 200, '🕐', 'rare', 200, false, 12),
  (gen_random_uuid(), 'twenty_five_hours', 'Tjugofem Timmar', 'Studera i totalt 25 timmar', '🔥', 'study', 'study_time', 1500, 'total', 400, '🔥', 'epic', 400, false, 13),
  (gen_random_uuid(), 'fifty_hours', 'Femtio Timmar', 'Studera i totalt 50 timmar', '🏆', 'study', 'study_time', 3000, 'total', 750, '🏆', 'legendary', 750, false, 14),
  
  -- Streak Achievements
  (gen_random_uuid(), 'streak_3', 'Tre Dagars Streak', 'Håll en 3 dagars studiestreak', '🔥', 'streak', 'streak', 3, 'total', 50, '🔥', 'common', 50, false, 20),
  (gen_random_uuid(), 'streak_7', 'Veckostreak', 'Håll en 7 dagars studiestreak', '📅', 'streak', 'streak', 7, 'total', 100, '📅', 'uncommon', 100, false, 21),
  (gen_random_uuid(), 'streak_14', 'Två Veckor', 'Håll en 14 dagars studiestreak', '🗓️', 'streak', 'streak', 14, 'total', 200, '🗓️', 'rare', 200, false, 22),
  (gen_random_uuid(), 'streak_30', 'Månadsstreak', 'Håll en 30 dagars studiestreak', '📆', 'streak', 'streak', 30, 'total', 400, '📆', 'epic', 400, false, 23),
  (gen_random_uuid(), 'streak_100', 'Legendstreak', 'Håll en 100 dagars studiestreak', '👑', 'streak', 'streak', 100, 'total', 1000, '👑', 'legendary', 1000, false, 24),
  
  -- Milestone Achievements
  (gen_random_uuid(), 'level_5', 'Nivå 5', 'Nå nivå 5', '⭐', 'milestone', 'sessions', 5, 'total', 100, '⭐', 'common', 100, false, 30),
  (gen_random_uuid(), 'level_10', 'Nivå 10', 'Nå nivå 10', '🌟', 'milestone', 'sessions', 10, 'total', 200, '🌟', 'uncommon', 200, false, 31),
  (gen_random_uuid(), 'level_25', 'Nivå 25', 'Nå nivå 25', '💫', 'milestone', 'sessions', 25, 'total', 400, '💫', 'rare', 400, false, 32),
  (gen_random_uuid(), 'level_50', 'Nivå 50', 'Nå nivå 50', '👑', 'milestone', 'sessions', 50, 'total', 1000, '👑', 'legendary', 1000, false, 33),
  
  -- Social Achievements
  (gen_random_uuid(), 'first_friend', 'Första Vännen', 'Lägg till din första vän', '👋', 'social', 'friends', 1, 'total', 50, '👋', 'common', 50, false, 40),
  (gen_random_uuid(), 'five_friends', 'Fem Vänner', 'Lägg till 5 vänner', '👥', 'social', 'friends', 5, 'total', 100, '👥', 'uncommon', 100, false, 41),
  (gen_random_uuid(), 'ten_friends', 'Tio Vänner', 'Lägg till 10 vänner', '🤝', 'social', 'friends', 10, 'total', 200, '🤝', 'rare', 200, false, 42),
  
  -- Course Achievements
  (gen_random_uuid(), 'first_course', 'Första Kursen', 'Lägg till din första kurs', '📕', 'study', 'courses', 1, 'total', 25, '📕', 'common', 25, false, 50),
  (gen_random_uuid(), 'three_courses', 'Tre Kurser', 'Lägg till 3 kurser', '📗', 'study', 'courses', 3, 'total', 75, '📗', 'uncommon', 75, false, 51),
  (gen_random_uuid(), 'five_courses', 'Fem Kurser', 'Lägg till 5 kurser', '📘', 'study', 'courses', 5, 'total', 150, '📘', 'rare', 150, false, 52)
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

-- 10. Function to calculate user level from XP
CREATE OR REPLACE FUNCTION get_level_for_xp(p_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER;
BEGIN
  SELECT level INTO v_level
  FROM level_definitions
  WHERE required_xp <= p_xp
  ORDER BY level DESC
  LIMIT 1;
  
  RETURN COALESCE(v_level, 1);
END;
$$ LANGUAGE plpgsql;

-- 11. Function to add XP and handle level ups
CREATE OR REPLACE FUNCTION add_user_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source_type TEXT,
  p_source_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(
  new_total_xp INTEGER,
  new_level INTEGER,
  previous_level INTEGER,
  level_up BOOLEAN,
  xp_to_next INTEGER
) AS $$
DECLARE
  v_current_xp INTEGER;
  v_current_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_next_level_xp INTEGER;
  v_current_level_xp INTEGER;
BEGIN
  -- Get or create user level record
  INSERT INTO user_levels (user_id, current_level, total_xp)
  VALUES (p_user_id, 1, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current state
  SELECT total_xp, current_level INTO v_current_xp, v_current_level
  FROM user_levels WHERE user_id = p_user_id;
  
  -- Calculate new XP
  v_new_xp := v_current_xp + p_amount;
  
  -- Get new level
  v_new_level := get_level_for_xp(v_new_xp);
  
  -- Get XP required for next level
  SELECT required_xp INTO v_next_level_xp
  FROM level_definitions WHERE level = v_new_level + 1;
  
  -- Get XP for current level
  SELECT required_xp INTO v_current_level_xp
  FROM level_definitions WHERE level = v_new_level;
  
  -- Update user level record
  UPDATE user_levels SET
    total_xp = v_new_xp,
    current_level = v_new_level,
    xp_to_next_level = COALESCE(v_next_level_xp - v_new_xp, 0),
    level_progress_percent = CASE 
      WHEN v_next_level_xp IS NULL THEN 100
      ELSE ((v_new_xp - v_current_level_xp)::NUMERIC / (v_next_level_xp - v_current_level_xp)::NUMERIC) * 100
    END,
    last_level_up = CASE WHEN v_new_level > v_current_level THEN NOW() ELSE last_level_up END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO point_transactions (user_id, amount, source_type, source_id, metadata)
  VALUES (p_user_id, p_amount, p_source_type, p_source_id, p_metadata);
  
  -- Return results
  RETURN QUERY SELECT 
    v_new_xp,
    v_new_level,
    v_current_level,
    v_new_level > v_current_level,
    COALESCE(v_next_level_xp - v_new_xp, 0);
END;
$$ LANGUAGE plpgsql;

-- 12. Function to generate daily challenges
CREATE OR REPLACE FUNCTION generate_daily_challenges(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  v_seed INTEGER;
BEGIN
  -- Use date as seed for consistent but varied challenges
  v_seed := EXTRACT(DOY FROM p_date)::INTEGER + EXTRACT(YEAR FROM p_date)::INTEGER;
  
  -- Delete existing challenges for this date (if regenerating)
  DELETE FROM daily_challenges WHERE challenge_date = p_date;
  
  -- Insert daily challenges
  INSERT INTO daily_challenges (challenge_date, title, title_sv, description, description_sv, challenge_type, target_value, xp_reward, difficulty, emoji) VALUES
    -- Easy challenge 1
    (p_date, 'Quick Focus', 'Snabbfokus', 'Study for 15 minutes today', 'Studera i 15 minuter idag', 'study_minutes', 15, 30, 'easy', '⏱️'),
    -- Easy challenge 2
    (p_date, 'First Session', 'Första Passet', 'Complete 1 study session', 'Slutför 1 studiepass', 'sessions_count', 1, 35, 'easy', '📚'),
    -- Medium challenge 1
    (p_date, 'Focus Hour', 'Fokustimme', 'Study for 45 minutes today', 'Studera i 45 minuter idag', 'study_minutes', 45, 60, 'medium', '🔥'),
    -- Medium challenge 2
    (p_date, 'Double Session', 'Dubbelpass', 'Complete 2 study sessions', 'Slutför 2 studiepass', 'sessions_count', 2, 75, 'medium', '💪'),
    -- Hard challenge 1
    (p_date, 'Study Marathon', 'Studiemaraton', 'Study for 90 minutes today', 'Studera i 90 minuter idag', 'study_minutes', 90, 120, 'hard', '🏆'),
    -- Hard challenge 2
    (p_date, 'Triple Threat', 'Trippelpass', 'Complete 3 study sessions', 'Slutför 3 studiepass', 'sessions_count', 3, 150, 'hard', '⭐');
END;
$$ LANGUAGE plpgsql;

-- 13. RLS Policies
ALTER TABLE level_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_challenges ENABLE ROW LEVEL SECURITY;

-- Level definitions are public read
CREATE POLICY "Level definitions are viewable by all" ON level_definitions
  FOR SELECT USING (true);

-- User levels policies
CREATE POLICY "Users can view all levels" ON user_levels
  FOR SELECT USING (true);

CREATE POLICY "Users can update own level" ON user_levels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own level" ON user_levels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Point transactions policies
CREATE POLICY "Users can view own transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON point_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily challenges are public read
CREATE POLICY "Daily challenges are viewable by all" ON daily_challenges
  FOR SELECT USING (true);

-- User daily challenges policies
CREATE POLICY "Users can view own challenge progress" ON user_daily_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress" ON user_daily_challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge progress" ON user_daily_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 14. Generate today's challenges
SELECT generate_daily_challenges(CURRENT_DATE);

-- 15. Add total_xp column to user_progress for leaderboard if not exists
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
