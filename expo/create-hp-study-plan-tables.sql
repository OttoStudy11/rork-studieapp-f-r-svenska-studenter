-- ============================================================
-- HP Study Plan Tables for Supabase
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Main study plan table (one row per user)
CREATE TABLE IF NOT EXISTS hp_study_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('LUGN', 'BALANSERAD', 'INTENSIV')),
  hp_date_key TEXT NOT NULL CHECK (hp_date_key IN ('spring2026', 'fall2026')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notifications_enabled BOOLEAN DEFAULT true,
  daily_reminder_hour INTEGER DEFAULT 18 CHECK (daily_reminder_hour BETWEEN 0 AND 23),
  daily_reminder_minute INTEGER DEFAULT 0 CHECK (daily_reminder_minute BETWEEN 0 AND 59),
  streak_warnings BOOLEAN DEFAULT true,
  milestones_enabled BOOLEAN DEFAULT true,
  paused_until DATE,
  notification_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Aggregate progress table (one row per user)
CREATE TABLE IF NOT EXISTS hp_study_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_words_learned INTEGER DEFAULT 0,
  total_mek_completed INTEGER DEFAULT 0,
  total_quant_completed INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. Daily progress history (one row per user per day)
CREATE TABLE IF NOT EXISTS hp_daily_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  ord_completed INTEGER DEFAULT 0,
  mek_completed INTEGER DEFAULT 0,
  quant_completed INTEGER DEFAULT 0,
  minutes_spent INTEGER DEFAULT 0,
  fully_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ============================================================
-- Enable Row Level Security
-- ============================================================

ALTER TABLE hp_study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE hp_study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hp_daily_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================

-- hp_study_plans
DROP POLICY IF EXISTS "Users can manage own HP plan" ON hp_study_plans;
CREATE POLICY "Users can manage own HP plan"
  ON hp_study_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- hp_study_progress
DROP POLICY IF EXISTS "Users can manage own HP progress" ON hp_study_progress;
CREATE POLICY "Users can manage own HP progress"
  ON hp_study_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- hp_daily_progress
DROP POLICY IF EXISTS "Users can manage own HP daily progress" ON hp_daily_progress;
CREATE POLICY "Users can manage own HP daily progress"
  ON hp_daily_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Auto-update timestamp trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_hp_study_plans_updated_at ON hp_study_plans;
CREATE TRIGGER update_hp_study_plans_updated_at
  BEFORE UPDATE ON hp_study_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hp_study_progress_updated_at ON hp_study_progress;
CREATE TRIGGER update_hp_study_progress_updated_at
  BEFORE UPDATE ON hp_study_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hp_daily_progress_updated_at ON hp_daily_progress;
CREATE TRIGGER update_hp_daily_progress_updated_at
  BEFORE UPDATE ON hp_daily_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Indexes for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_hp_study_plans_user_id ON hp_study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_hp_study_progress_user_id ON hp_study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hp_daily_progress_user_id ON hp_daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hp_daily_progress_user_date ON hp_daily_progress(user_id, date DESC);

-- ============================================================
-- Upsert helper functions
-- ============================================================

-- Upsert daily progress (called each time user marks a task complete)
CREATE OR REPLACE FUNCTION upsert_hp_daily_progress(
  p_user_id UUID,
  p_date DATE,
  p_ord_completed INTEGER DEFAULT 0,
  p_mek_completed INTEGER DEFAULT 0,
  p_quant_completed INTEGER DEFAULT 0,
  p_minutes_spent INTEGER DEFAULT 0,
  p_fully_completed BOOLEAN DEFAULT false
)
RETURNS void AS $$
BEGIN
  INSERT INTO hp_daily_progress (
    user_id, date, ord_completed, mek_completed,
    quant_completed, minutes_spent, fully_completed
  )
  VALUES (
    p_user_id, p_date, p_ord_completed, p_mek_completed,
    p_quant_completed, p_minutes_spent, p_fully_completed
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    ord_completed = EXCLUDED.ord_completed,
    mek_completed = EXCLUDED.mek_completed,
    quant_completed = EXCLUDED.quant_completed,
    minutes_spent = EXCLUDED.minutes_spent,
    fully_completed = EXCLUDED.fully_completed,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate and update streak for a user
CREATE OR REPLACE FUNCTION calculate_hp_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_check_date DATE;
  v_has_entry BOOLEAN;
BEGIN
  v_check_date := CURRENT_DATE;

  -- Check if completed today or yesterday to start streak
  SELECT EXISTS (
    SELECT 1 FROM hp_daily_progress
    WHERE user_id = p_user_id
      AND date = v_check_date
      AND fully_completed = true
  ) INTO v_has_entry;

  IF NOT v_has_entry THEN
    v_check_date := CURRENT_DATE - 1;
    SELECT EXISTS (
      SELECT 1 FROM hp_daily_progress
      WHERE user_id = p_user_id
        AND date = v_check_date
        AND fully_completed = true
    ) INTO v_has_entry;
    IF NOT v_has_entry THEN
      RETURN 0;
    END IF;
  END IF;

  -- Count consecutive completed days
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM hp_daily_progress
      WHERE user_id = p_user_id
        AND date = v_check_date
        AND fully_completed = true
    ) INTO v_has_entry;

    EXIT WHEN NOT v_has_entry;
    v_streak := v_streak + 1;
    v_check_date := v_check_date - 1;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get last 7 days of daily progress for a user
CREATE OR REPLACE FUNCTION get_hp_week_stats(p_user_id UUID)
RETURNS TABLE (
  date DATE,
  ord_completed INTEGER,
  mek_completed INTEGER,
  quant_completed INTEGER,
  minutes_spent INTEGER,
  fully_completed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gs.day::DATE AS date,
    COALESCE(dp.ord_completed, 0) AS ord_completed,
    COALESCE(dp.mek_completed, 0) AS mek_completed,
    COALESCE(dp.quant_completed, 0) AS quant_completed,
    COALESCE(dp.minutes_spent, 0) AS minutes_spent,
    COALESCE(dp.fully_completed, false) AS fully_completed
  FROM generate_series(
    CURRENT_DATE - INTERVAL '6 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  ) AS gs(day)
  LEFT JOIN hp_daily_progress dp
    ON dp.date = gs.day::DATE
    AND dp.user_id = p_user_id
  ORDER BY gs.day ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Verification
-- ============================================================

SELECT
  'hp_study_plans' AS table_name, COUNT(*) AS rows FROM hp_study_plans
UNION ALL
SELECT 'hp_study_progress', COUNT(*) FROM hp_study_progress
UNION ALL
SELECT 'hp_daily_progress', COUNT(*) FROM hp_daily_progress;
