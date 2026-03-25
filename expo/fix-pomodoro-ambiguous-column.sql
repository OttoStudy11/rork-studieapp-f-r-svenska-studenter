-- Fix ambiguous column reference error in sync_user_points function
-- This fixes the "column reference 'user_id' is ambiguous" error when saving pomodoro sessions

-- Recreate the function with properly qualified column names
CREATE OR REPLACE FUNCTION sync_user_points()
RETURNS TRIGGER AS $$
DECLARE
    v_new_points INTEGER;
BEGIN
    -- Calculate new points based on study time
    v_new_points := calculate_user_points(NEW.user_id);
    
    -- Update user_progress with new points
    -- Fixed: Explicitly qualify the column name to avoid ambiguity
    UPDATE public.user_progress
    SET total_points = v_new_points,
        updated_at = NOW()
    WHERE public.user_progress.user_id = NEW.user_id;
    
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
    SELECT COALESCE(SUM(ps.duration), 0)
    INTO v_total_minutes
    FROM public.pomodoro_sessions ps
    WHERE ps.user_id = p_user_id;
    
    -- Calculate points: 1 point per 5 minutes
    v_calculated_points := FLOOR(v_total_minutes / 5);
    
    RETURN v_calculated_points;
END;
$$ LANGUAGE plpgsql;

-- Verify the trigger is still active
DROP TRIGGER IF EXISTS sync_points_on_session_insert ON public.pomodoro_sessions;
CREATE TRIGGER sync_points_on_session_insert
    AFTER INSERT ON public.pomodoro_sessions
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_points();

-- Output success message
DO $$
BEGIN
    RAISE NOTICE '✅ Fixed ambiguous column reference in sync_user_points function';
    RAISE NOTICE '✅ Pomodoro session saving should now work correctly';
END $$;
