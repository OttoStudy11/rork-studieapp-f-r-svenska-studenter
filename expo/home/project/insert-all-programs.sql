-- First add missing columns to programs table
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS gymnasium TEXT NOT NULL DEFAULT '';

-- Update the gymnasium column to be NOT NULL after adding default values
UPDATE programs SET gymnasium = 'Unknown' WHERE gymnasium IS NULL OR gymnasium = '';

-- Insert all unique programs that exist in the app
-- Using proper UUIDs and mapping to gymnasiums

-- First, insert all unique programs
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES
-- Naturvetenskapsprogrammet
('550e8400-e29b-41d4-a716-446655440001', 'Naturvetenskapsprogrammet', 'Program med fokus på naturvetenskap, matematik och teknik', 'General', NOW()),

-- Teknikprogrammet  
('550e8400-e29b-41d4-a716-446655440002', 'Teknikprogrammet', 'Program med fokus på teknik, ingenjörsvetenskap och innovation', 'General', NOW()),

-- Samhällsvetenskapsprogrammet
('550e8400-e29b-41d4-a716-446655440003', 'Samhällsvetenskapsprogrammet', 'Program med fokus på samhällsvetenskap, politik och ekonomi', 'General', NOW()),

-- Ekonomiprogrammet
('550e8400-e29b-41d4-a716-446655440004', 'Ekonomiprogrammet', 'Program med fokus på ekonomi, företagande och handel', 'General', NOW()),

-- Estetiska programmet
('550e8400-e29b-41d4-a716-446655440005', 'Estetiska programmet', 'Program med fokus på konst, design och kreativitet', 'General', NOW()),

-- Humanistiska programmet
('550e8400-e29b-41d4-a716-446655440006', 'Humanistiska programmet', 'Program med fokus på språk, litteratur och kultur', 'General', NOW()),

-- Barn- och fritidsprogrammet
('550e8400-e29b-41d4-a716-446655440007', 'Barn- och fritidsprogrammet', 'Program för arbete med barn och ungdomar', 'General', NOW()),

-- Bygg- och anläggningsprogrammet
('550e8400-e29b-41d4-a716-446655440008', 'Bygg- och anläggningsprogrammet', 'Program för byggbranschen och anläggningsarbete', 'General', NOW()),

-- El- och energiprogrammet
('550e8400-e29b-41d4-a716-446655440009', 'El- och energiprogrammet', 'Program för elinstallationer och energisystem', 'General', NOW()),

-- Fordons- och transportprogrammet
('550e8400-e29b-41d4-a716-446655440010', 'Fordons- och transportprogrammet', 'Program för fordonstekniker och transport', 'General', NOW()),

-- Handels- och administrationsprogrammet
('550e8400-e29b-41d4-a716-446655440011', 'Handels- och administrationsprogrammet', 'Program för handel och administration', 'General', NOW()),

-- Hantverksprogrammet
('550e8400-e29b-41d4-a716-446655440012', 'Hantverksprogrammet', 'Program för traditionellt hantverk och konsthantverk', 'General', NOW()),

-- Hotell- och turismprogrammet
('550e8400-e29b-41d4-a716-446655440013', 'Hotell- och turismprogrammet', 'Program för hotell- och turismbranschen', 'General', NOW()),

-- Industritekniska programmet
('550e8400-e29b-41d4-a716-446655440014', 'Industritekniska programmet', 'Program för industriell produktion och teknik', 'General', NOW()),

-- Naturbruksprogrammet
('550e8400-e29b-41d4-a716-446655440015', 'Naturbruksprogrammet', 'Program för jordbruk, skogsbruk och naturvård', 'General', NOW()),

-- Restaurang- och livsmedelsprogrammet
('550e8400-e29b-41d4-a716-446655440016', 'Restaurang- och livsmedelsprogrammet', 'Program för restaurang- och livsmedelsbranschen', 'General', NOW()),

-- VVS- och fastighetsprogrammet
('550e8400-e29b-41d4-a716-446655440017', 'VVS- och fastighetsprogrammet', 'Program för VVS-teknik och fastighetsförvaltning', 'General', NOW()),

-- Vård- och omsorgsprogrammet
('550e8400-e29b-41d4-a716-446655440018', 'Vård- och omsorgsprogrammet', 'Program för vård- och omsorgssektorn', 'General', NOW()),

-- International Baccalaureate
('550e8400-e29b-41d4-a716-446655440019', 'International Baccalaureate', 'Internationellt erkänt utbildningsprogram', 'General', NOW())

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  gymnasium = EXCLUDED.gymnasium,
  created_at = EXCLUDED.created_at;