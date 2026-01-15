-- Fix check_user_achievements function by dropping and recreating it
-- This resolves the "cannot change return type of existing function" error

-- ============================================
-- STEP 1: DROP THE EXISTING FUNCTION
-- ============================================

DROP FUNCTION IF EXISTS public.check_user_achievements(uuid);

-- ============================================
-- STEP 2: RECREATE THE FUNCTION WITH CORRECT SIGNATURE
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
-- STEP 3: GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.check_user_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_achievements(UUID) TO anon;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ SUCCESS: check_user_achievements function fixed!';
    RAISE NOTICE '';
    RAISE NOTICE 'The function has been dropped and recreated with the correct return type.';
    RAISE NOTICE 'You can now run other SQL scripts that modify this function.';
    RAISE NOTICE '';
END $$;
