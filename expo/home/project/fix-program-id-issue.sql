-- Fix program_id issue by adding program_id column to profiles and populating it
-- This will ensure proper linking between profiles and programs

-- Step 1: Add program_id column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id);

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_program_id ON profiles(program_id);

-- Step 3: Insert all programs from gymnasium-programs.ts into the programs table
-- First, let's insert the programs with proper UUIDs

-- Naturvetenskapsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'nat-program-id',
  'Naturvetenskapsprogrammet',
  'Högskoleförberedande program med fokus på naturvetenskap och matematik',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Teknikprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'tek-program-id',
  'Teknikprogrammet',
  'Högskoleförberedande program med fokus på teknik och ingenjörsvetenskap',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Samhällsvetenskapsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'sam-program-id',
  'Samhällsvetenskapsprogrammet',
  'Högskoleförberedande program med fokus på samhällsvetenskap',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Ekonomiprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'eko-program-id',
  'Ekonomiprogrammet',
  'Högskoleförberedande program med fokus på ekonomi och företagande',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Estetiska programmet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'est-program-id',
  'Estetiska programmet',
  'Högskoleförberedande program med fokus på konst och estetik',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Humanistiska programmet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'hum-program-id',
  'Humanistiska programmet',
  'Högskoleförberedande program med fokus på humaniora och språk',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Barn- och fritidsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'baf-program-id',
  'Barn- och fritidsprogrammet',
  'Yrkesprogram för arbete med barn och ungdomar',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Bygg- och anläggningsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'bya-program-id',
  'Bygg- och anläggningsprogrammet',
  'Yrkesprogram för byggbranschen',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- El- och energiprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'ele-program-id',
  'El- och energiprogrammet',
  'Yrkesprogram för el- och energibranschen',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Fordons- och transportprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'for-program-id',
  'Fordons- och transportprogrammet',
  'Yrkesprogram för fordons- och transportbranschen',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Handels- och administrationsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'han-program-id',
  'Handels- och administrationsprogrammet',
  'Yrkesprogram för handel och administration',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Hantverksprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'hnt-program-id',
  'Hantverksprogrammet',
  'Yrkesprogram för traditionellt hantverk',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Hotell- och turismprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'hot-program-id',
  'Hotell- och turismprogrammet',
  'Yrkesprogram för hotell- och turismbranschen',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Industritekniska programmet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'ind-program-id',
  'Industritekniska programmet',
  'Yrkesprogram för industri och tillverkning',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Naturbruksprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'nab-program-id',
  'Naturbruksprogrammet',
  'Yrkesprogram för naturbruk och lantbruk',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Restaurang- och livsmedelsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'res-program-id',
  'Restaurang- och livsmedelsprogrammet',
  'Yrkesprogram för restaurang- och livsmedelsbranschen',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- VVS- och fastighetsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'vvs-program-id',
  'VVS- och fastighetsprogrammet',
  'Yrkesprogram för VVS och fastighetsförvaltning',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Vård- och omsorgsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'var-program-id',
  'Vård- och omsorgsprogrammet',
  'Yrkesprogram för vård och omsorg',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- International Baccalaureate
INSERT INTO programs (id, name, description, gymnasium, created_at) 
VALUES (
  'ib-program-id',
  'International Baccalaureate',
  'Internationellt högskoleförberedande program',
  'Allmänt',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 4: Update existing profiles to set program_id based on program name
UPDATE profiles 
SET program_id = 'nat-program-id'
WHERE program = 'Naturvetenskapsprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'tek-program-id'
WHERE program = 'Teknikprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'sam-program-id'
WHERE program = 'Samhällsvetenskapsprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'eko-program-id'
WHERE program = 'Ekonomiprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'est-program-id'
WHERE program = 'Estetiska programmet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'hum-program-id'
WHERE program = 'Humanistiska programmet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'baf-program-id'
WHERE program = 'Barn- och fritidsprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'bya-program-id'
WHERE program = 'Bygg- och anläggningsprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'ele-program-id'
WHERE program = 'El- och energiprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'for-program-id'
WHERE program = 'Fordons- och transportprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'han-program-id'
WHERE program = 'Handels- och administrationsprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'hnt-program-id'
WHERE program = 'Hantverksprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'hot-program-id'
WHERE program = 'Hotell- och turismprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'ind-program-id'
WHERE program = 'Industritekniska programmet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'nab-program-id'
WHERE program = 'Naturbruksprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'res-program-id'
WHERE program = 'Restaurang- och livsmedelsprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'vvs-program-id'
WHERE program = 'VVS- och fastighetsprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'var-program-id'
WHERE program = 'Vård- och omsorgsprogrammet' AND program_id IS NULL;

UPDATE profiles 
SET program_id = 'ib-program-id'
WHERE program = 'International Baccalaureate' AND program_id IS NULL;

-- Step 5: Create a function to automatically set program_id when program is updated
CREATE OR REPLACE FUNCTION set_program_id_from_program_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update program_id if program name has changed and program_id is null or different
  IF NEW.program IS NOT NULL AND (OLD.program IS NULL OR NEW.program != OLD.program OR NEW.program_id IS NULL) THEN
    CASE NEW.program
      WHEN 'Naturvetenskapsprogrammet' THEN NEW.program_id := 'nat-program-id';
      WHEN 'Teknikprogrammet' THEN NEW.program_id := 'tek-program-id';
      WHEN 'Samhällsvetenskapsprogrammet' THEN NEW.program_id := 'sam-program-id';
      WHEN 'Ekonomiprogrammet' THEN NEW.program_id := 'eko-program-id';
      WHEN 'Estetiska programmet' THEN NEW.program_id := 'est-program-id';
      WHEN 'Humanistiska programmet' THEN NEW.program_id := 'hum-program-id';
      WHEN 'Barn- och fritidsprogrammet' THEN NEW.program_id := 'baf-program-id';
      WHEN 'Bygg- och anläggningsprogrammet' THEN NEW.program_id := 'bya-program-id';
      WHEN 'El- och energiprogrammet' THEN NEW.program_id := 'ele-program-id';
      WHEN 'Fordons- och transportprogrammet' THEN NEW.program_id := 'for-program-id';
      WHEN 'Handels- och administrationsprogrammet' THEN NEW.program_id := 'han-program-id';
      WHEN 'Hantverksprogrammet' THEN NEW.program_id := 'hnt-program-id';
      WHEN 'Hotell- och turismprogrammet' THEN NEW.program_id := 'hot-program-id';
      WHEN 'Industritekniska programmet' THEN NEW.program_id := 'ind-program-id';
      WHEN 'Naturbruksprogrammet' THEN NEW.program_id := 'nab-program-id';
      WHEN 'Restaurang- och livsmedelsprogrammet' THEN NEW.program_id := 'res-program-id';
      WHEN 'VVS- och fastighetsprogrammet' THEN NEW.program_id := 'vvs-program-id';
      WHEN 'Vård- och omsorgsprogrammet' THEN NEW.program_id := 'var-program-id';
      WHEN 'International Baccalaureate' THEN NEW.program_id := 'ib-program-id';
      ELSE NEW.program_id := NULL; -- Unknown program
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to automatically set program_id
DROP TRIGGER IF EXISTS trigger_set_program_id ON profiles;
CREATE TRIGGER trigger_set_program_id
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_program_id_from_program_name();

-- Step 7: Update database types to include program_id in profiles
-- This will be reflected when you regenerate the types

-- Verification queries (uncomment to run manually):
-- SELECT program, program_id, COUNT(*) FROM profiles GROUP BY program, program_id;
-- SELECT * FROM programs ORDER BY name;