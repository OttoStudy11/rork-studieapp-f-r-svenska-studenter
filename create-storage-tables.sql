-- Create tables for storage.ts functionality
-- Run this SQL in your Supabase SQL editor

-- =====================================================
-- USER SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  timer_sound_enabled boolean DEFAULT true,
  timer_haptics_enabled boolean DEFAULT true,
  timer_notifications_enabled boolean DEFAULT true,
  timer_background_enabled boolean DEFAULT true,
  timer_focus_duration integer DEFAULT 25,
  timer_break_duration integer DEFAULT 5,
  dark_mode boolean DEFAULT false,
  theme_color text DEFAULT 'blue',
  language text DEFAULT 'sv',
  achievements_notifications boolean DEFAULT true,
  friend_request_notifications boolean DEFAULT true,
  study_reminder_notifications boolean DEFAULT true,
  profile_visible boolean DEFAULT true,
  show_study_stats boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- ACTIVE TIMER SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS active_timer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('focus', 'break')),
  status text NOT NULL CHECK (status IN ('idle', 'running', 'paused')),
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  course_name text NOT NULL,
  total_duration integer NOT NULL,
  remaining_time integer NOT NULL,
  start_timestamp bigint NOT NULL,
  paused_at bigint,
  device_id text,
  device_platform text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE active_timer_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for active_timer_sessions
CREATE POLICY "Users can view their own active timer sessions"
  ON active_timer_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own active timer sessions"
  ON active_timer_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own active timer sessions"
  ON active_timer_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own active timer sessions"
  ON active_timer_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER ONBOARDING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  current_step text,
  steps_completed text[] DEFAULT '{}',
  selected_courses text[] DEFAULT '{}',
  selected_gymnasium_id text,
  selected_gymnasium_grade text,
  selected_program text,
  selected_purpose text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_onboarding
CREATE POLICY "Users can view their own onboarding status"
  ON user_onboarding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding status"
  ON user_onboarding FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding status"
  ON user_onboarding FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own onboarding status"
  ON user_onboarding FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_active_timer_sessions_user_id ON active_timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_timer_sessions_expires_at ON active_timer_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);

-- =====================================================
-- CREATE UPDATE TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_active_timer_sessions_updated_at BEFORE UPDATE ON active_timer_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_onboarding_updated_at BEFORE UPDATE ON user_onboarding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
