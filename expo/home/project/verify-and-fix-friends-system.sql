-- ============================================
-- VERIFY AND FIX FRIENDS SYSTEM
-- ============================================
-- This script checks and fixes the database structure for the friends system

-- First, let's make sure friendships table exists and has correct structure
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT no_self_friendship CHECK (user1_id != user2_id)
);

-- Enable RLS on friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Create unique index if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'friendships_unique_pair_idx') THEN
        CREATE UNIQUE INDEX friendships_unique_pair_idx ON public.friendships (
            LEAST(user1_id, user2_id), 
            GREATEST(user1_id, user2_id)
        );
    END IF;
END $$;

-- Create other indexes if they don't exist
CREATE INDEX IF NOT EXISTS friendships_user1_id_idx ON public.friendships(user1_id);
CREATE INDEX IF NOT EXISTS friendships_user2_id_idx ON public.friendships(user2_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON public.friendships(status);

-- Drop and recreate RLS policies for friendships
DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can insert friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can update their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON public.friendships;

CREATE POLICY "Users can view their friendships" ON public.friendships
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert friendships" ON public.friendships
    FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their friendships" ON public.friendships
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their friendships" ON public.friendships
    FOR DELETE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Now let's ensure user_progress table has all necessary columns
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_study_time INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date TIMESTAMP WITH TIME ZONE,
    daily_study_time INTEGER DEFAULT 0,
    weekly_study_time INTEGER DEFAULT 0,
    monthly_study_time INTEGER DEFAULT 0,
    daily_sessions INTEGER DEFAULT 0,
    weekly_sessions INTEGER DEFAULT 0,
    monthly_sessions INTEGER DEFAULT 0,
    last_daily_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_weekly_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_monthly_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns to user_progress if they don't exist
DO $$ 
BEGIN
    -- Add total_study_time if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_progress' AND column_name='total_study_time') THEN
        ALTER TABLE public.user_progress ADD COLUMN total_study_time INTEGER DEFAULT 0;
    END IF;
    
    -- Add current_streak if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_progress' AND column_name='current_streak') THEN
        ALTER TABLE public.user_progress ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;
    
    -- Add last_study_date if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_progress' AND column_name='last_study_date') THEN
        ALTER TABLE public.user_progress ADD COLUMN last_study_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Enable RLS on user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create indexes for user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_total_study_time ON public.user_progress(total_study_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_current_streak ON public.user_progress(current_streak DESC);

-- Drop and recreate RLS policies for user_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view friends progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;

CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view friends progress" ON public.user_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.friendships
            WHERE status = 'accepted'
            AND (
                (user1_id = auth.uid() AND user2_id = user_progress.user_id)
                OR
                (user2_id = auth.uid() AND user1_id = user_progress.user_id)
            )
        )
    );

CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create or replace the search function
CREATE OR REPLACE FUNCTION search_users_by_username(search_term TEXT)
RETURNS TABLE(
    id UUID,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.display_name,
        p.avatar_url
    FROM public.profiles p
    WHERE 
        (p.username ILIKE '%' || search_term || '%' OR
        p.display_name ILIKE '%' || search_term || '%')
        AND p.id != auth.uid()
    ORDER BY 
        CASE WHEN p.username = search_term THEN 1 ELSE 2 END,
        p.username
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_users_by_username(TEXT) TO authenticated;

-- Enable realtime for friendships
DO $$
BEGIN
    -- This will fail if realtime is not enabled, but that's okay
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================
-- Run this script in your Supabase SQL editor
-- After running, refresh the friends page in your app
