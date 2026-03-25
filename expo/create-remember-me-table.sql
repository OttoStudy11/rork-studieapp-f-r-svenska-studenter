-- Create the remember_me_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS remember_me_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    device_info JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_remember_me_sessions_user_id ON remember_me_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_remember_me_sessions_token ON remember_me_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_remember_me_sessions_expires ON remember_me_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_remember_me_sessions_active ON remember_me_sessions(is_active, expires_at);

-- Function to clean up expired remember me sessions
CREATE OR REPLACE FUNCTION cleanup_expired_remember_me_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM remember_me_sessions 
    WHERE expires_at < NOW() OR is_active = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON remember_me_sessions TO anon;
GRANT ALL ON remember_me_sessions TO authenticated;