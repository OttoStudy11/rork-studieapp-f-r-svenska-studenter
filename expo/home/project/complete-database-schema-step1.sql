-- ============================================================================
-- KOMPLETT DATABAS SCHEMA - STEG 1: GRUNDLÄGGANDE TABELLER OCH AUTENTISERING
-- ============================================================================
-- Detta är steg 1 av den kompletta databasuppsättningen
-- Kör detta först innan du går vidare till steg 2
-- ============================================================================

-- Rensa befintliga tabeller (VARNING: Detta raderar all data!)
DROP TABLE IF EXISTS remember_me_sessions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- PROFILES TABELL - Användarprofiler
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Grundläggande information
  email TEXT,
  username TEXT UNIQUE,
  display_name TEXT,
  name TEXT,
  avatar_url TEXT,
  
  -- Gymnasieinformation
  gymnasium TEXT,
  gymnasium_id TEXT,
  gymnasium_name TEXT,
  gymnasium_grade TEXT,
  
  -- Programinformation
  program TEXT,
  program_id UUID,
  
  -- Årskurs och nivå
  year INTEGER CHECK (year >= 1 AND year <= 3),
  level TEXT,
  
  -- Kurser
  courses JSON,
  selected_courses JSONB,
  
  -- Premium och prenumeration
  premium_status BOOLEAN DEFAULT FALSE,
  subscription_type TEXT,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Onboarding och inställningar
  onboarding_completed BOOLEAN DEFAULT FALSE,
  purpose TEXT,
  
  -- Tidsstämplar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för snabbare sökningar
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_program_id ON profiles(program_id);
CREATE INDEX idx_profiles_gymnasium_id ON profiles(gymnasium_id);

-- ============================================================================
-- REMEMBER ME SESSIONS - För "Kom ihåg mig" funktionalitet
-- ============================================================================
CREATE TABLE remember_me_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  device_info JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för snabbare sökningar
CREATE INDEX idx_remember_me_user_id ON remember_me_sessions(user_id);
CREATE INDEX idx_remember_me_token_hash ON remember_me_sessions(token_hash);
CREATE INDEX idx_remember_me_expires_at ON remember_me_sessions(expires_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Aktivera RLS på profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies för profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies för att tillåta användare att se andra användares publika information
CREATE POLICY "Users can view other users' public profiles"
  ON profiles FOR SELECT
  USING (true);

-- Aktivera RLS på remember_me_sessions
ALTER TABLE remember_me_sessions ENABLE ROW LEVEL SECURITY;

-- Policies för remember_me_sessions
CREATE POLICY "Users can view their own sessions"
  ON remember_me_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON remember_me_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON remember_me_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON remember_me_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Funktion för att automatiskt uppdatera updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger för profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funktion för att automatiskt skapa profil när en användare registrerar sig
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, username, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger för att skapa profil automatiskt
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FUNKTIONER FÖR REMEMBER ME SESSIONS
-- ============================================================================

-- Radera befintlig funktion först
DROP FUNCTION IF EXISTS cleanup_expired_remember_me_sessions();

-- Funktion för att rensa utgångna sessioner
CREATE OR REPLACE FUNCTION cleanup_expired_remember_me_sessions()
RETURNS void AS $
BEGIN
  DELETE FROM remember_me_sessions
  WHERE expires_at < NOW() OR is_active = FALSE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- KOMMENTARER
-- ============================================================================

COMMENT ON TABLE profiles IS 'Användarprofiler med gymnasie- och programinformation';
COMMENT ON TABLE remember_me_sessions IS 'Sessioner för "Kom ihåg mig" funktionalitet';

COMMENT ON COLUMN profiles.username IS 'Unikt användarnamn för användaren';
COMMENT ON COLUMN profiles.display_name IS 'Visningsnamn som visas i appen';
COMMENT ON COLUMN profiles.gymnasium_id IS 'ID för valt gymnasium';
COMMENT ON COLUMN profiles.program_id IS 'ID för valt program';
COMMENT ON COLUMN profiles.year IS 'Årskurs (1-3)';
COMMENT ON COLUMN profiles.premium_status IS 'Om användaren har premium';
COMMENT ON COLUMN profiles.selected_courses IS 'Valda kurser i JSONB format';

-- ============================================================================
-- STEG 1 KLART!
-- ============================================================================
-- Nästa steg: Kör complete-database-schema-step2.sql för kurser och innehåll
-- ============================================================================
