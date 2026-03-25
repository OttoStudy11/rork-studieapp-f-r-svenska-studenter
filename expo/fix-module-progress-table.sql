-- Create user_module_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    
    completed_lessons INTEGER NOT NULL DEFAULT 0,
    total_lessons INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, module_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id ON public.user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_module_id ON public.user_module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_course_id ON public.user_module_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_completed ON public.user_module_progress(user_id, is_completed);

-- Enable RLS
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can insert their own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can update their own module progress" ON public.user_module_progress;

-- Create RLS policies
CREATE POLICY "Users can view their own module progress" ON public.user_module_progress
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own module progress" ON public.user_module_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own module progress" ON public.user_module_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Add manual_progress column to user_courses if it doesn't exist
ALTER TABLE public.user_courses 
ADD COLUMN IF NOT EXISTS manual_progress INTEGER DEFAULT 0 
CHECK (manual_progress >= 0 AND manual_progress <= 100);

-- Verify table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_module_progress'
ORDER BY ordinal_position;
