-- Fix daily challenges unique constraint issue
-- The constraint prevents having multiple challenges of the same type on the same day
-- which is needed for easy/medium/hard variations

-- Drop the unique constraint
ALTER TABLE daily_challenges DROP CONSTRAINT IF EXISTS daily_challenges_challenge_date_challenge_type_key;

-- Delete existing challenges to start fresh
DELETE FROM user_daily_challenges;
DELETE FROM daily_challenges;

-- Recreate the generate function with unique challenge identifiers
CREATE OR REPLACE FUNCTION generate_daily_challenges(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  v_seed INTEGER;
BEGIN
  -- Use date as seed for consistent but varied challenges
  v_seed := EXTRACT(DOY FROM p_date)::INTEGER + EXTRACT(YEAR FROM p_date)::INTEGER;
  
  -- Delete existing challenges for this date (if regenerating)
  DELETE FROM daily_challenges WHERE challenge_date = p_date;
  
  -- Insert daily challenges with varied types to avoid duplicates
  INSERT INTO daily_challenges (challenge_date, title, title_sv, description, description_sv, challenge_type, target_value, xp_reward, difficulty, emoji) VALUES
    -- Easy challenges
    (p_date, 'Quick Focus', 'Snabbfokus', 'Study for 15 minutes today', 'Studera i 15 minuter idag', 'study_minutes', 15, 30, 'easy', '⏱️'),
    (p_date, 'First Session', 'Första Passet', 'Complete 1 study session', 'Slutför 1 studiepass', 'sessions_count', 1, 35, 'easy', '📚'),
    
    -- Medium challenges  
    (p_date, 'Steady Progress', 'Stabil Framgång', 'Complete 1 lesson today', 'Slutför 1 lektion idag', 'lesson_complete', 1, 60, 'medium', '📖'),
    (p_date, 'Double Session', 'Dubbelpass', 'Complete 2 study sessions', 'Slutför 2 studiepass', 'sessions_count', 2, 75, 'medium', '💪'),
    
    -- Hard challenges
    (p_date, 'Study Marathon', 'Studiemaraton', 'Study for 90 minutes today', 'Studera i 90 minuter idag', 'study_minutes', 90, 120, 'hard', '🏆'),
    (p_date, 'Perfect Score', 'Perfekt Resultat', 'Score 90% or higher on a quiz', 'Få 90% eller högre på ett quiz', 'quiz_score', 90, 150, 'hard', '⭐');
END;
$$ LANGUAGE plpgsql;

-- Generate today's challenges
SELECT generate_daily_challenges(CURRENT_DATE);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date_difficulty ON daily_challenges(challenge_date, difficulty);
