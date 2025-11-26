-- ============================================
-- SEPARATE COURSE AND MODULE PROGRESS TRACKING
-- ============================================
-- This migration separates:
-- 1. Course progress - manually tracked with +/- 10% increments
-- 2. Module progress - automatically tracked as completed/not completed
-- 
-- Run this in your Supabase SQL editor.

-- ============================================
-- PART 1: UPDATE USER_COURSES TABLE
-- ============================================
-- Add manual_progress column to track course progress separately

ALTER TABLE public.user_courses 
ADD COLUMN IF NOT EXISTS manual_progress INTEGER DEFAULT 0 
CHECK (manual_progress >= 0 AND manual_progress <= 100);

-- Migrate existing progress to manual_progress
UPDATE public.user_courses 
SET manual_progress = progress 
WHERE manual_progress = 0;

-- Add comment explaining the columns
COMMENT ON COLUMN public.user_courses.progress IS 'Deprecated: Use manual_progress instead';
COMMENT ON COLUMN public.user_courses.manual_progress IS 'Manually tracked course progress (0-100%)';

-- ============================================
-- PART 2: CREATE MODULE PROGRESS TABLE
-- ============================================
-- Track completion status for each module

CREATE TABLE IF NOT EXISTS public.user_module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    -- Module completion status
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    
    -- Track progress within module based on lessons
    completed_lessons INTEGER NOT NULL DEFAULT 0,
    total_lessons INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, module_id)
);

CREATE INDEX idx_user_module_progress_user_id ON public.user_module_progress(user_id);
CREATE INDEX idx_user_module_progress_module_id ON public.user_module_progress(module_id);
CREATE INDEX idx_user_module_progress_course_id ON public.user_module_progress(course_id);
CREATE INDEX idx_user_module_progress_completed ON public.user_module_progress(user_id, is_completed);

-- Enable RLS
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own module progress" ON public.user_module_progress
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own module progress" ON public.user_module_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own module progress" ON public.user_module_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- PART 3: UPDATE TRIGGER FOR MODULE PROGRESS
-- ============================================
-- Automatically update module progress when lessons are completed

CREATE OR REPLACE FUNCTION update_module_progress_on_lesson_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_module_id UUID;
    v_course_id TEXT;
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
    v_is_completed BOOLEAN;
BEGIN
    -- Get module_id and course_id from the lesson
    SELECT module_id, course_id
    INTO v_module_id, v_course_id
    FROM public.course_lessons
    WHERE id = NEW.lesson_id;
    
    -- Count total and completed lessons in this module
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END)
    INTO v_total_lessons, v_completed_lessons
    FROM public.course_lessons cl
    LEFT JOIN public.user_lesson_progress ulp 
        ON ulp.lesson_id = cl.id 
        AND ulp.user_id = NEW.user_id
    WHERE cl.module_id = v_module_id 
        AND cl.is_published = true;
    
    -- Check if all lessons are completed
    v_is_completed := (v_completed_lessons = v_total_lessons AND v_total_lessons > 0);
    
    -- Upsert module progress
    INSERT INTO public.user_module_progress (
        user_id,
        module_id,
        course_id,
        completed_lessons,
        total_lessons,
        is_completed,
        completed_at,
        updated_at
    ) VALUES (
        NEW.user_id,
        v_module_id,
        v_course_id,
        v_completed_lessons,
        v_total_lessons,
        v_is_completed,
        CASE WHEN v_is_completed THEN NOW() ELSE NULL END,
        NOW()
    )
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        completed_lessons = v_completed_lessons,
        total_lessons = v_total_lessons,
        is_completed = v_is_completed,
        completed_at = CASE 
            WHEN v_is_completed AND NOT EXCLUDED.is_completed THEN NOW()
            WHEN NOT v_is_completed THEN NULL
            ELSE EXCLUDED.completed_at
        END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_module_progress ON public.user_lesson_progress;

-- Create trigger
CREATE TRIGGER trigger_update_module_progress
    AFTER INSERT OR UPDATE ON public.user_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_module_progress_on_lesson_completion();

-- ============================================
-- PART 4: UPDATED_AT TRIGGER FOR MODULE PROGRESS
-- ============================================

DROP TRIGGER IF EXISTS update_user_module_progress_updated_at ON public.user_module_progress;
CREATE TRIGGER update_user_module_progress_updated_at 
    BEFORE UPDATE ON public.user_module_progress
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 5: HELPER FUNCTIONS
-- ============================================

-- Function to update course manual progress
CREATE OR REPLACE FUNCTION update_course_manual_progress(
    p_user_id UUID,
    p_course_id TEXT,
    p_adjustment INTEGER  -- +10 or -10
)
RETURNS INTEGER AS $$
DECLARE
    v_current_progress INTEGER;
    v_new_progress INTEGER;
BEGIN
    -- Get current manual progress
    SELECT manual_progress INTO v_current_progress
    FROM public.user_courses
    WHERE user_id = p_user_id AND course_id = p_course_id;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.user_courses (
            id,
            user_id,
            course_id,
            manual_progress,
            is_active
        ) VALUES (
            p_user_id || '-' || p_course_id,
            p_user_id,
            p_course_id,
            GREATEST(0, LEAST(100, p_adjustment)),
            true
        );
        RETURN GREATEST(0, LEAST(100, p_adjustment));
    END IF;
    
    -- Calculate new progress (ensure it stays within 0-100)
    v_new_progress := GREATEST(0, LEAST(100, v_current_progress + p_adjustment));
    
    -- Update manual progress
    UPDATE public.user_courses
    SET manual_progress = v_new_progress,
        updated_at = NOW()
    WHERE user_id = p_user_id AND course_id = p_course_id;
    
    RETURN v_new_progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get complete course progress
CREATE OR REPLACE FUNCTION get_course_progress(
    p_user_id UUID,
    p_course_id TEXT
)
RETURNS TABLE (
    manual_progress INTEGER,
    modules_completed INTEGER,
    modules_total INTEGER,
    lessons_completed INTEGER,
    lessons_total INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(uc.manual_progress, 0) as manual_progress,
        COUNT(CASE WHEN ump.is_completed THEN 1 END)::INTEGER as modules_completed,
        COUNT(ump.id)::INTEGER as modules_total,
        COALESCE(SUM(ump.completed_lessons), 0)::INTEGER as lessons_completed,
        COALESCE(SUM(ump.total_lessons), 0)::INTEGER as lessons_total
    FROM public.user_courses uc
    LEFT JOIN public.user_module_progress ump 
        ON ump.user_id = uc.user_id 
        AND ump.course_id = uc.course_id
    WHERE uc.user_id = p_user_id 
        AND uc.course_id = p_course_id
    GROUP BY uc.manual_progress;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 6: INITIALIZE MODULE PROGRESS FOR EXISTING DATA
-- ============================================
-- Populate module progress based on existing lesson progress

INSERT INTO public.user_module_progress (
    user_id,
    module_id,
    course_id,
    completed_lessons,
    total_lessons,
    is_completed,
    completed_at
)
SELECT 
    ulp.user_id,
    cl.module_id,
    cl.course_id,
    COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END)::INTEGER,
    COUNT(*)::INTEGER,
    COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END) = COUNT(*),
    CASE 
        WHEN COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END) = COUNT(*) 
        THEN MAX(ulp.completed_at)
        ELSE NULL 
    END
FROM public.user_lesson_progress ulp
JOIN public.course_lessons cl ON cl.id = ulp.lesson_id
WHERE cl.is_published = true
GROUP BY ulp.user_id, cl.module_id, cl.course_id
ON CONFLICT (user_id, module_id) DO UPDATE SET
    completed_lessons = EXCLUDED.completed_lessons,
    total_lessons = EXCLUDED.total_lessons,
    is_completed = EXCLUDED.is_completed,
    completed_at = EXCLUDED.completed_at,
    updated_at = NOW();

-- ============================================
-- PART 7: ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_module_progress;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE '✅ Course & Module Progress Separation Complete!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '  ✓ Added manual_progress column to user_courses';
    RAISE NOTICE '  ✓ Created user_module_progress table';
    RAISE NOTICE '  ✓ Set up automatic module progress tracking';
    RAISE NOTICE '  ✓ Initialized module progress from existing data';
    RAISE NOTICE '';
    RAISE NOTICE 'Progress tracking now works as follows:';
    RAISE NOTICE '  📊 Course Progress:';
    RAISE NOTICE '      - Manually tracked with +/- 10%% increments';
    RAISE NOTICE '      - Stored in user_courses.manual_progress';
    RAISE NOTICE '      - Use update_course_manual_progress() function';
    RAISE NOTICE '';
    RAISE NOTICE '  📚 Module Progress:';
    RAISE NOTICE '      - Automatically tracked as completed/not completed';
    RAISE NOTICE '      - Updated when lessons are marked as completed';
    RAISE NOTICE '      - Stored in user_module_progress table';
    RAISE NOTICE '';
    RAISE NOTICE 'Helper functions available:';
    RAISE NOTICE '  - update_course_manual_progress(user_id, course_id, adjustment)';
    RAISE NOTICE '  - get_course_progress(user_id, course_id)';
    RAISE NOTICE '==================================================';
END $$;
