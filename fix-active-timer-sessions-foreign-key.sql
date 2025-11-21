-- Fix foreign key type mismatch in active_timer_sessions table
-- This ensures course_id is TEXT to match courses.id (TEXT)

-- Drop the table if it exists and recreate with correct types
DROP TABLE IF EXISTS active_timer_sessions CASCADE;

CREATE TABLE active_timer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('focus', 'break')),
  status text NOT NULL CHECK (status IN ('idle', 'running', 'paused')),
  course_id text REFERENCES courses(id) ON DELETE SET NULL,
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_active_timer_sessions_user_id ON active_timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_timer_sessions_expires_at ON active_timer_sessions(expires_at);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_active_timer_sessions_updated_at 
  BEFORE UPDATE ON active_timer_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
