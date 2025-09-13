-- Insert all gymnasium programs safely (handles duplicates)
-- This script will only insert programs that don't already exist

INSERT INTO programs (id, name, level, created_at) VALUES
  (gen_random_uuid(), 'Naturvetenskapsprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Teknikprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Samhällsvetenskapsprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Ekonomiprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Estetiska programmet', 'gymnasie', now()),
  (gen_random_uuid(), 'Humanistiska programmet', 'gymnasie', now()),
  (gen_random_uuid(), 'Barn- och fritidsprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Bygg- och anläggningsprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'El- och energiprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Fordons- och transportprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Handels- och administrationsprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Hantverksprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Hotell- och turismprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Industritekniska programmet', 'gymnasie', now()),
  (gen_random_uuid(), 'Naturbruksprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Restaurang- och livsmedelsprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'VVS- och fastighetsprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'Vård- och omsorgsprogrammet', 'gymnasie', now()),
  (gen_random_uuid(), 'International Baccalaureate', 'gymnasie', now())
ON CONFLICT (name) DO NOTHING;

-- Verify the insert
SELECT COUNT(*) as total_programs FROM programs WHERE level = 'gymnasie';
SELECT name FROM programs WHERE level = 'gymnasie' ORDER BY name;