-- Create function to search users by username
CREATE OR REPLACE FUNCTION search_users_by_username(search_term TEXT)
RETURNS TABLE(
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.avatar_url
  FROM public.profiles p
  WHERE 
    p.username ILIKE '%' || search_term || '%' OR
    p.display_name ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE WHEN p.username = search_term THEN 1 ELSE 2 END,
    p.username
  LIMIT 20;
END;
$$;

-- Grant execute permission on the search function
GRANT EXECUTE ON FUNCTION search_users_by_username(TEXT) TO authenticated;

-- Also update the database types to include the function
-- This ensures TypeScript knows about the function