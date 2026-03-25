-- Quick verification: Check if communities tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('communities', 'community_members', 'community_requests', 'community_invites', 'community_messages');
