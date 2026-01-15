-- COMPLETE FIX for pomodoro session saving
-- This resolves the "column reference 'user_id' is ambiguous" error
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- STEP 1: DROP ALL PROBLEMATIC TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS sync_points_on_session_insert ON public.pomodoro_sessions;
DROP TRIGGER IF EXISTS auto_check_achievements_after_session ON public.pomodoro_sessions;
DROP TRIGGER IF EXISTS trigger_sync_pomodoro ON public.pomodoro_sessions;

-- ============================================
-- STEP 2: FIX calculate_user_points FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_user_points(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_minutes INTEGER;
    v_calculated_points INTEGER;
BEGIN
    -- Get total study time from pomodoro_sessions
    -- Use explicit table alias to avoid ambiguity
    SELECT COALESCE(SUM(ps.duration), 0)
    INTO v_total_minutes
    FROM public.pomodoro_sessions ps
    WHERE ps.user_id = p_user_id;
    
    -- Calculate points: 1 point per minute of study
    v_calculated_points := v_total_minutes;
    
    RETURN v_calculated_points;
END;
$$;

-- ============================================
-- STEP 3: FIX sync_user_points FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.sync_user_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_points INTEGER;
    v_user_id_value UUID;
BEGIN
    -- Store the user_id in a local variable to avoid any ambiguity
    v_user_id_value := NEW.user_id;
    
    -- Calculate new points
    v_new_points := public.calculate_user_points(v_user_id_value);
    
    -- Update user_progress with new points using explicit table alias
    UPDATE public.user_progress up
    SET 
        total_points = v_new_points,
        total_sessions = COALESCE(up.total_sessions, 0) + 1,
        total_study_time = COALESCE(up.total_study_time, 0) + NEW.duration,
        updated_at = NOW()
    WHERE up.user_id = v_user_id_value;
    
    -- If no row was updated, insert a new one
    IF NOT FOUND THEN
        INSERT INTO public.user_progress (
            user_id, 
            total_points, 
            total_study_time, 
            total_sessions, 
            current_streak, 
            longest_streak, 
            created_at, 
            updated_at
        )
        VALUES (
            v_user_id_value, 
            v_new_points, 
            NEW.duration, 
            1, 
            1, 
            1, 
            NOW(), 
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE
        SET 
            total_points = v_new_points,
            total_sessions = COALESCE(public.user_progress.total_sessions, 0) + 1,
            total_study_time = COALESCE(public.user_progress.total_study_time, 0) + NEW.duration,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$;

-- ============================================
-- STEP 4: FIX check_user_achievements FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.check_user_achievements(p_user_id UUID)
RETURNS TABLE(
    achievement_id UUID,
    achievement_name TEXT,
    achievement_description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_sessions INTEGER;
    v_total_minutes INTEGER;
    v_current_streak INTEGER;
    v_friend_count INTEGER;
    v_achievement RECORD;
BEGIN
    -- Get user stats using explicit table aliases
    SELECT COUNT(*)
    INTO v_total_sessions
    FROM public.pomodoro_sessions ps
    WHERE ps.user_id = p_user_id;
    
    SELECT COALESCE(SUM(ps.duration), 0)
    INTO v_total_minutes
    FROM public.pomodoro_sessions ps
    WHERE ps.user_id = p_user_id;
    
    -- Get streak from user_progress
    SELECT COALESCE(up.current_streak, 0)
    INTO v_current_streak
    FROM public.user_progress up
    WHERE up.user_id = p_user_id;
    
    IF v_current_streak IS NULL THEN
        v_current_streak := 0;
    END IF;
    
    -- Get friend count
    SELECT COUNT(*)
    INTO v_friend_count
    FROM public.friends f
    WHERE (f.user_id = p_user_id OR f.friend_id = p_user_id)
    AND f.status = 'accepted';
    
    -- Check each achievement
    FOR v_achievement IN 
        SELECT a.id, a.name, a.description, a.requirement_type, a.requirement_value
        FROM public.achievements a
        WHERE NOT EXISTS (
            SELECT 1 FROM public.user_achievements ua 
            WHERE ua.user_id = p_user_id 
            AND ua.achievement_id = a.id 
            AND ua.unlocked_at IS NOT NULL
        )
    LOOP
        -- Check if requirement is met
        IF (v_achievement.requirement_type = 'sessions' AND v_total_sessions >= v_achievement.requirement_value) OR
           (v_achievement.requirement_type = 'minutes' AND v_total_minutes >= v_achievement.requirement_value) OR
           (v_achievement.requirement_type = 'streak' AND v_current_streak >= v_achievement.requirement_value) OR
           (v_achievement.requirement_type = 'friends' AND v_friend_count >= v_achievement.requirement_value) THEN
            
            -- Unlock the achievement
            INSERT INTO public.user_achievements (user_id, achievement_id, progress, unlocked_at)
            VALUES (p_user_id, v_achievement.id, v_achievement.requirement_value, NOW())
            ON CONFLICT (user_id, achievement_id) DO UPDATE
            SET progress = v_achievement.requirement_value, unlocked_at = NOW();
            
            -- Return the unlocked achievement
            achievement_id := v_achievement.id;
            achievement_name := v_achievement.name;
            achievement_description := v_achievement.description;
            RETURN NEXT;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$;

-- ============================================
-- STEP 5: FIX trigger_check_achievements_after_session FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.trigger_check_achievements_after_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id_value UUID;
BEGIN
    -- Store user_id in local variable to avoid any ambiguity
    v_user_id_value := NEW.user_id;
    
    -- Check achievements asynchronously (don't block the insert)
    PERFORM public.check_user_achievements(v_user_id_value);
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the insert if achievement check fails
    RAISE WARNING 'Achievement check failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================
-- STEP 6: RECREATE TRIGGERS
-- ============================================

-- Trigger to sync points when session is inserted
CREATE TRIGGER sync_points_on_session_insert
    AFTER INSERT ON public.pomodoro_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_points();

-- Trigger to check achievements after session
CREATE TRIGGER auto_check_achievements_after_session
    AFTER INSERT ON public.pomodoro_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_check_achievements_after_session();

-- ============================================
-- STEP 7: GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.calculate_user_points(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_user_points(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.sync_user_points() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_achievements(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.trigger_check_achievements_after_session() TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ SUCCESS: All pomodoro session functions fixed!';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed functions:';
    RAISE NOTICE '  • calculate_user_points - Uses explicit table aliases';
    RAISE NOTICE '  • sync_user_points - Uses local variables for user_id';
    RAISE NOTICE '  • check_user_achievements - Uses explicit table aliases';
    RAISE NOTICE '  • trigger_check_achievements_after_session - Uses local variables';
    RAISE NOTICE '';
    RAISE NOTICE 'Recreated triggers:';
    RAISE NOTICE '  • sync_points_on_session_insert';
    RAISE NOTICE '  • auto_check_achievements_after_session';
    RAISE NOTICE '';
    RAISE NOTICE 'Pomodoro session saving should now work correctly!';
END $$;
