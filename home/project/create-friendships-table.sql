-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure users can't friend themselves
    CONSTRAINT no_self_friendship CHECK (user1_id != user2_id),
    
    -- Ensure unique friendship pairs (prevent duplicate friendships)
    CONSTRAINT unique_friendship UNIQUE (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS friendships_user1_id_idx ON public.friendships(user1_id);
CREATE INDEX IF NOT EXISTS friendships_user2_id_idx ON public.friendships(user2_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON public.friendships(status);

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can insert friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can update their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON public.friendships;

-- Users can view friendships where they are either user1 or user2
CREATE POLICY "Users can view their friendships" ON public.friendships
    FOR SELECT USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Users can create friendships where they are user1
CREATE POLICY "Users can insert friendships" ON public.friendships
    FOR INSERT WITH CHECK (
        auth.uid() = user1_id
    );

-- Users can update friendships where they are either user1 or user2
CREATE POLICY "Users can update their friendships" ON public.friendships
    FOR UPDATE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    ) WITH CHECK (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Users can delete friendships where they are either user1 or user2
CREATE POLICY "Users can delete their friendships" ON public.friendships
    FOR DELETE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );