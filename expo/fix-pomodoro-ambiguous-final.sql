-- FINAL FIX for ambiguous column reference in sync_user_points function
-- This definitively resolves the "column reference 'user_id' is ambiguous" error

-- Drop existing trigger first
DROP TRIGGER IF EXISTS sync_points_on_session_insert ON public.pomodoro_sessions;

-- Recreate the sync_user_points function with fully qualified column names
CREATE OR REPLACE FUNCTION sync_user_points()
RETURNS TRIGGER AS $$
DECLARE
    v_new_points INTEGER;
BEGIN
    -- Calculate new points based on study time
    v_new_points := calculate_user_points(NEW.user_id);
    
    -- Update user_progress with new points
    -- CRITICAL FIX: Fully qualify the table and column to avoid ambiguity
    UPDATE public.user_progress AS up
    SET 
        total_points = v_new_points,
        updated_at = NOW()
    WHERE up.user_id = NEW.user_id;
    
    -- If no row was updated, insert a new one
    IF NOT FOUND THEN
        INSERT INTO public.user_progress (user_id, total_points, total_study_time, total_sessions, current_streak, longest_streak, created_at, updated_at)
        VALUES (NEW.user_id, v_new_points, 0, 0, 0, 0, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET total_points = v_new_points, updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also fix the calculate_user_points function to be explicit
CREATE OR REPLACE FUNCTION calculate_user_points(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total_minutes INTEGER;
    v_calculated_points INTEGER;
BEGIN
    -- Get total study time from pomodoro_sessions
    -- Use table alias to be explicit
    SELECT COALESCE(SUM(ps.duration), 0)
    INTO v_total_minutes
    FROM public.pomodoro_sessions AS ps
    WHERE ps.user_id = p_user_id;
    
    -- Calculate points: 1 point per 5 minutes
    v_calculated_points := FLOOR(v_total_minutes / 5);
    
    RETURN v_calculated_points;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER sync_points_on_session_insert
    AFTER INSERT ON public.pomodoro_sessions
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_points();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION sync_user_points TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_points TO authenticated;

-- Output success message
DO $$
BEGIN
    RAISE NOTICE '✅ FIXED: Ambiguous column reference in sync_user_points function';
    RAISE NOTICE '✅ Pomodoro session saving should now work correctly';
    RAISE NOTICE '✅ Trigger recreated successfully';
END $$;
