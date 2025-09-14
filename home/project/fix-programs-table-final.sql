-- Fix programs table structure and create program entries
-- First, ensure the table has the correct structure
ALTER TABLE programs ADD COLUMN IF NOT EXISTS description TEXT;

-- Clear existing programs to avoid conflicts
DELETE FROM programs;

-- Insert all gymnasium programs with proper UUIDs
-- Naturvetenskapsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Naturvetenskapsprogrammet', 'Naturvetenskap och teknik med fokus på matematik, fysik, kemi och biologi', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Naturvetenskapsprogrammet - Naturvetenskap', 'Fördjupning inom naturvetenskap', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Naturvetenskapsprogrammet - Teknik', 'Fördjupning inom teknik och ingenjörsvetenskap', 'Alla gymnasier', NOW());

-- Teknikprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Teknikprogrammet', 'Teknik och ingenjörsvetenskap', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Teknikprogrammet - Datateknik', 'Fördjupning inom datateknik och programmering', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Teknikprogrammet - Elektroteknik', 'Fördjupning inom elektroteknik', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Teknikprogrammet - Maskin- och fordonsteknik', 'Fördjupning inom maskin- och fordonsteknik', 'Alla gymnasier', NOW());

-- Samhällsvetenskapsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440008', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskap och humaniora', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'Samhällsvetenskapsprogrammet - Beteendevetenskap', 'Fördjupning inom psykologi och sociologi', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-44665544000a', 'Samhällsvetenskapsprogrammet - Samhällsvetenskap', 'Fördjupning inom samhällsvetenskap', 'Alla gymnasier', NOW());

-- Ekonomiprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-44665544000b', 'Ekonomiprogrammet', 'Ekonomi och företagande', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-44665544000c', 'Ekonomiprogrammet - Ekonomi', 'Fördjupning inom ekonomi', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-44665544000d', 'Ekonomiprogrammet - Juridik', 'Fördjupning inom juridik', 'Alla gymnasier', NOW());

-- Humanistiska programmet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-44665544000e', 'Humanistiska programmet', 'Språk, kultur och kommunikation', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-44665544000f', 'Humanistiska programmet - Språk', 'Fördjupning inom språk', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'Humanistiska programmet - Kultur', 'Fördjupning inom kultur och historia', 'Alla gymnasier', NOW());

-- Estetiska programmet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Estetiska programmet', 'Konst, musik och design', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'Estetiska programmet - Bild och form', 'Fördjupning inom bild och form', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'Estetiska programmet - Musik', 'Fördjupning inom musik', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'Estetiska programmet - Teater', 'Fördjupning inom teater och drama', 'Alla gymnasier', NOW());

-- Barn- och fritidsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440015', 'Barn- och fritidsprogrammet', 'Pedagogik och fritidsverksamhet', 'Alla gymnasier', NOW());

-- Vård- och omsorgsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440016', 'Vård- och omsorgsprogrammet', 'Vård, omsorg och hälsa', 'Alla gymnasier', NOW());

-- Hotell- och turismprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440017', 'Hotell- och turismprogrammet', 'Hotell, restaurang och turism', 'Alla gymnasier', NOW());

-- Handelsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440018', 'Handelsprogrammet', 'Handel och administration', 'Alla gymnasier', NOW());

-- Fordon- och transportprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440019', 'Fordon- och transportprogrammet', 'Fordon, transport och logistik', 'Alla gymnasier', NOW());

-- Bygg- och anläggningsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-44665544001a', 'Bygg- och anläggningsprogrammet', 'Byggnad och anläggning', 'Alla gymnasier', NOW());

-- El- och energiprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-44665544001b', 'El- och energiprogrammet', 'Elektricitet och energi', 'Alla gymnasier', NOW());

-- Industritekniska programmet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-44665544001c', 'Industritekniska programmet', 'Industri och produktion', 'Alla gymnasier', NOW());

-- VVS- och fastighetsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-44665544001d', 'VVS- och fastighetsprogrammet', 'VVS och fastighetsförvaltning', 'Alla gymnasier', NOW());

-- Hantverksprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-44665544001e', 'Hantverksprogrammet', 'Traditionellt hantverk', 'Alla gymnasier', NOW());

-- Restaurang- och livsmedelsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-44665544001f', 'Restaurang- och livsmedelsprogrammet', 'Restaurang och livsmedelsproduktion', 'Alla gymnasier', NOW());

-- Naturbruksprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Naturbruksprogrammet', 'Jordbruk, skogsbruk och djurvård', 'Alla gymnasier', NOW());

-- Introduktionsprogrammet
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'Introduktionsprogrammet', 'Förberedande utbildning', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440022', 'Språkintroduktion', 'Svenska som andraspråk', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440023', 'Individuellt alternativ', 'Individuellt anpassad utbildning', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440024', 'Preparandutbildning', 'Förberedelse för nationella program', 'Alla gymnasier', NOW()),
('550e8400-e29b-41d4-a716-446655440025', 'Programinriktat individuellt val', 'Förberedelse för specifikt program', 'Alla gymnasier', NOW());

-- Verify the programs were created
SELECT COUNT(*) as total_programs FROM programs;
SELECT name, gymnasium FROM programs ORDER BY name;