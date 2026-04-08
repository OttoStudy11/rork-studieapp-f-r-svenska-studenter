DROP FUNCTION IF EXISTS public.check_user_achievements(uuid);

CREATE OR REPLACE FUNCTION public.check_user_achievements(p_user_id UUID)
RETURNS TABLE(
    user_id UUID,
    achievement_id UUID,
    achievements JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_sessions INTEGER;
    v_total_minutes INTEGER;
    v_current_streak INTEGER;
    v_friend_count INTEGER;
    v_unique_courses INTEGER;
    v_achievement RECORD;
    v_current_progress INTEGER;
    v_newly_unlocked INTEGER := 0;
BEGIN
    SELECT COUNT(*)
    INTO v_total_sessions
    FROM public.pomodoro_sessions ps
    WHERE ps.user_id = p_user_id;

    SELECT COALESCE(SUM(ps.duration), 0)
    INTO v_total_minutes
    FROM public.pomodoro_sessions ps
    WHERE ps.user_id = p_user_id;

    SELECT COALESCE(up.current_streak, 0)
    INTO v_current_streak
    FROM public.user_progress up
    WHERE up.user_id = p_user_id;

    IF v_current_streak IS NULL THEN
        v_current_streak := 0;
    END IF;

    SELECT COUNT(DISTINCT CASE
        WHEN f.user_id = p_user_id THEN f.friend_id
        WHEN f.friend_id = p_user_id THEN f.user_id
    END)
    INTO v_friend_count
    FROM public.friends f
    WHERE (f.user_id = p_user_id OR f.friend_id = p_user_id)
    AND f.status = 'accepted';

    SELECT COUNT(DISTINCT uc.course_id)
    INTO v_unique_courses
    FROM public.user_courses uc
    WHERE uc.user_id = p_user_id AND uc.is_active = true;

    FOR v_achievement IN
        SELECT a.id, a.achievement_key, a.title, a.description, a.icon,
               a.requirement_type, a.requirement_target, a.xp_reward, a.reward_points,
               a.category, a.rarity
        FROM public.achievements a
        WHERE NOT EXISTS (
            SELECT 1 FROM public.user_achievements ua
            WHERE ua.user_id = p_user_id
            AND ua.achievement_id = a.id
            AND ua.unlocked_at IS NOT NULL
        )
    LOOP
        CASE v_achievement.requirement_type
            WHEN 'sessions' THEN v_current_progress := v_total_sessions;
            WHEN 'study_time' THEN v_current_progress := v_total_minutes;
            WHEN 'streak' THEN v_current_progress := v_current_streak;
            WHEN 'friends' THEN v_current_progress := v_friend_count;
            WHEN 'courses' THEN v_current_progress := v_unique_courses;
            ELSE v_current_progress := 0;
        END CASE;

        INSERT INTO public.user_achievements (user_id, achievement_id, progress, updated_at)
        VALUES (p_user_id, v_achievement.id, v_current_progress, NOW())
        ON CONFLICT (user_id, achievement_id)
        DO UPDATE SET
            progress = v_current_progress,
            updated_at = NOW();

        IF v_current_progress >= v_achievement.requirement_target THEN
            UPDATE public.user_achievements
            SET unlocked_at = NOW(),
                progress = v_achievement.requirement_target
            WHERE user_id = p_user_id
            AND achievement_id = v_achievement.id
            AND unlocked_at IS NULL;

            DECLARE
                v_xp_reward INTEGER := COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25);
            BEGIN
                UPDATE public.user_progress
                SET total_xp = COALESCE(total_xp, 0) + v_xp_reward,
                    total_points = COALESCE(total_points, 0) + v_xp_reward,
                    updated_at = NOW()
                WHERE user_id = p_user_id;

                INSERT INTO public.user_levels (user_id, total_xp, current_level, updated_at)
                VALUES (p_user_id, v_xp_reward, 1, NOW())
                ON CONFLICT (user_id)
                DO UPDATE SET
                    total_xp = COALESCE(user_levels.total_xp, 0) + v_xp_reward,
                    updated_at = NOW();
            END;

            user_id := p_user_id;
            achievement_id := v_achievement.id;
            achievements := jsonb_build_object(
                'id', v_achievement.id,
                'achievement_key', v_achievement.achievement_key,
                'title', v_achievement.title,
                'description', v_achievement.description,
                'icon', v_achievement.icon,
                'xp_reward', COALESCE(v_achievement.xp_reward, v_achievement.reward_points, 25),
                'reward_points', v_achievement.reward_points,
                'category', v_achievement.category,
                'rarity', v_achievement.rarity
            );

            v_newly_unlocked := v_newly_unlocked + 1;
            RETURN NEXT;
        END IF;
    END LOOP;

    RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_user_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_achievements(UUID) TO anon;
