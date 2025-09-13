-- Fix programs table structure and populate with all programs from the app

-- First, ensure the programs table has the correct structure
-- The table should already exist based on database.types.ts, but let's make sure it has all columns

-- Create programs table if it doesn't exist (it should exist based on types)
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  gymnasium TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing data to avoid conflicts
DELETE FROM programs;

-- Insert all unique programs with proper UUIDs
-- We'll create program entries for each gymnasium-program combination

-- Generate UUIDs for each program-gymnasium combination
INSERT INTO programs (id, name, description, gymnasium, created_at) VALUES

-- Kungsholmens gymnasium
('kungsholmens-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Kungsholmens gymnasium', 'Kungsholmens gymnasium', NOW()),
('kungsholmens-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Kungsholmens gymnasium', 'Kungsholmens gymnasium', NOW()),
('kungsholmens-humanistiska', 'Humanistiska programmet', 'Humanistiska programmet vid Kungsholmens gymnasium', 'Kungsholmens gymnasium', NOW()),

-- Norra Real
('norra-real-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Norra Real', 'Norra Real', NOW()),
('norra-real-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Norra Real', 'Norra Real', NOW()),
('norra-real-teknik', 'Teknikprogrammet', 'Teknikprogrammet vid Norra Real', 'Norra Real', NOW()),

-- Södra Latin
('sodra-latin-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Södra Latin', 'Södra Latin', NOW()),
('sodra-latin-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Södra Latin', 'Södra Latin', NOW()),
('sodra-latin-ekonomi', 'Ekonomiprogrammet', 'Ekonomiprogrammet vid Södra Latin', 'Södra Latin', NOW()),
('sodra-latin-humanistiska', 'Humanistiska programmet', 'Humanistiska programmet vid Södra Latin', 'Södra Latin', NOW()),

-- Östra Real
('ostra-real-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Östra Real', 'Östra Real', NOW()),
('ostra-real-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Östra Real', 'Östra Real', NOW()),
('ostra-real-ekonomi', 'Ekonomiprogrammet', 'Ekonomiprogrammet vid Östra Real', 'Östra Real', NOW()),

-- Viktor Rydberg gymnasium
('viktor-rydberg-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Viktor Rydberg gymnasium', 'Viktor Rydberg gymnasium', NOW()),
('viktor-rydberg-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Viktor Rydberg gymnasium', 'Viktor Rydberg gymnasium', NOW()),
('viktor-rydberg-humanistiska', 'Humanistiska programmet', 'Humanistiska programmet vid Viktor Rydberg gymnasium', 'Viktor Rydberg gymnasium', NOW()),

-- NTI-gymnasiet Umeå
('nti-umea-teknik', 'Teknikprogrammet', 'Teknikprogrammet vid NTI-gymnasiet Umeå', 'NTI-gymnasiet Umeå', NOW()),
('nti-umea-el-energi', 'El- och energiprogrammet', 'El- och energiprogrammet vid NTI-gymnasiet Umeå', 'NTI-gymnasiet Umeå', NOW()),

-- Stockholms estetiska gymnasium
('stockholm-estetiska-estetiska', 'Estetiska programmet', 'Estetiska programmet vid Stockholms estetiska gymnasium', 'Stockholms estetiska gymnasium', NOW()),

-- International High School of the Gothenburg Region
('ihsgr-ib', 'International Baccalaureate', 'International Baccalaureate vid International High School of the Gothenburg Region', 'International High School of the Gothenburg Region', NOW()),

-- Sigtunaskolan Humanistiska Läroverket
('sigtuna-ib', 'International Baccalaureate', 'International Baccalaureate vid Sigtunaskolan Humanistiska Läroverket', 'Sigtunaskolan Humanistiska Läroverket', NOW()),
('sigtuna-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Sigtunaskolan Humanistiska Läroverket', 'Sigtunaskolan Humanistiska Läroverket', NOW()),
('sigtuna-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Sigtunaskolan Humanistiska Läroverket', 'Sigtunaskolan Humanistiska Läroverket', NOW()),

-- Hvitfeldtska gymnasiet
('hvitfeldtska-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Hvitfeldtska gymnasiet', 'Hvitfeldtska gymnasiet', NOW()),
('hvitfeldtska-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Hvitfeldtska gymnasiet', 'Hvitfeldtska gymnasiet', NOW()),
('hvitfeldtska-ib', 'International Baccalaureate', 'International Baccalaureate vid Hvitfeldtska gymnasiet', 'Hvitfeldtska gymnasiet', NOW()),

-- Katrinelundsgymnasiet
('katrinelunds-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Katrinelundsgymnasiet', 'Katrinelundsgymnasiet', NOW()),
('katrinelunds-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Katrinelundsgymnasiet', 'Katrinelundsgymnasiet', NOW()),
('katrinelunds-ekonomi', 'Ekonomiprogrammet', 'Ekonomiprogrammet vid Katrinelundsgymnasiet', 'Katrinelundsgymnasiet', NOW()),

-- Polhemsgymnasiet
('polhems-gbg-teknik', 'Teknikprogrammet', 'Teknikprogrammet vid Polhemsgymnasiet', 'Polhemsgymnasiet', NOW()),
('polhems-gbg-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Polhemsgymnasiet', 'Polhemsgymnasiet', NOW()),
('polhems-gbg-industritekniska', 'Industritekniska programmet', 'Industritekniska programmet vid Polhemsgymnasiet', 'Polhemsgymnasiet', NOW()),

-- Schillerska gymnasiet
('schillerska-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Schillerska gymnasiet', 'Schillerska gymnasiet', NOW()),
('schillerska-humanistiska', 'Humanistiska programmet', 'Humanistiska programmet vid Schillerska gymnasiet', 'Schillerska gymnasiet', NOW()),
('schillerska-estetiska', 'Estetiska programmet', 'Estetiska programmet vid Schillerska gymnasiet', 'Schillerska gymnasiet', NOW()),

-- Malmö Borgarskola
('malmo-borgarskola-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Malmö Borgarskola', 'Malmö Borgarskola', NOW()),
('malmo-borgarskola-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Malmö Borgarskola', 'Malmö Borgarskola', NOW()),
('malmo-borgarskola-ekonomi', 'Ekonomiprogrammet', 'Ekonomiprogrammet vid Malmö Borgarskola', 'Malmö Borgarskola', NOW()),

-- Malmö latinskola
('malmo-latin-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Malmö latinskola', 'Malmö latinskola', NOW()),
('malmo-latin-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Malmö latinskola', 'Malmö latinskola', NOW()),
('malmo-latin-humanistiska', 'Humanistiska programmet', 'Humanistiska programmet vid Malmö latinskola', 'Malmö latinskola', NOW()),

-- Malmö idrottsgymnasium
('malmo-idrott-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Malmö idrottsgymnasium', 'Malmö idrottsgymnasium', NOW()),
('malmo-idrott-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Malmö idrottsgymnasium', 'Malmö idrottsgymnasium', NOW()),
('malmo-idrott-ekonomi', 'Ekonomiprogrammet', 'Ekonomiprogrammet vid Malmö idrottsgymnasium', 'Malmö idrottsgymnasium', NOW()),

-- Katedralskolan Uppsala
('katedralskolan-uppsala-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Katedralskolan', 'Katedralskolan', NOW()),
('katedralskolan-uppsala-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Katedralskolan', 'Katedralskolan', NOW()),
('katedralskolan-uppsala-humanistiska', 'Humanistiska programmet', 'Humanistiska programmet vid Katedralskolan', 'Katedralskolan', NOW()),
('katedralskolan-uppsala-estetiska', 'Estetiska programmet', 'Estetiska programmet vid Katedralskolan', 'Katedralskolan', NOW()),

-- Lundellska skolan
('lundellska-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Lundellska skolan', 'Lundellska skolan', NOW()),
('lundellska-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Lundellska skolan', 'Lundellska skolan', NOW()),
('lundellska-ekonomi', 'Ekonomiprogrammet', 'Ekonomiprogrammet vid Lundellska skolan', 'Lundellska skolan', NOW()),

-- Fyrisskolan
('fyrisskolan-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Fyrisskolan', 'Fyrisskolan', NOW()),
('fyrisskolan-teknik', 'Teknikprogrammet', 'Teknikprogrammet vid Fyrisskolan', 'Fyrisskolan', NOW()),
('fyrisskolan-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Fyrisskolan', 'Fyrisskolan', NOW()),

-- Celsiusskolan
('celsiusskolan-teknik', 'Teknikprogrammet', 'Teknikprogrammet vid Celsiusskolan', 'Celsiusskolan', NOW()),
('celsiusskolan-el-energi', 'El- och energiprogrammet', 'El- och energiprogrammet vid Celsiusskolan', 'Celsiusskolan', NOW()),
('celsiusskolan-industritekniska', 'Industritekniska programmet', 'Industritekniska programmet vid Celsiusskolan', 'Celsiusskolan', NOW()),

-- Berzeliusskolan
('berzeliusskolan-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Berzeliusskolan', 'Berzeliusskolan', NOW()),
('berzeliusskolan-teknik', 'Teknikprogrammet', 'Teknikprogrammet vid Berzeliusskolan', 'Berzeliusskolan', NOW()),

-- Folkungaskolan
('folkungaskolan-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Folkungaskolan', 'Folkungaskolan', NOW()),
('folkungaskolan-ekonomi', 'Ekonomiprogrammet', 'Ekonomiprogrammet vid Folkungaskolan', 'Folkungaskolan', NOW()),
('folkungaskolan-estetiska', 'Estetiska programmet', 'Estetiska programmet vid Folkungaskolan', 'Folkungaskolan', NOW()),

-- Katedralskolan Linköping
('katedralskolan-linkoping-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Katedralskolan Linköping', 'Katedralskolan Linköping', NOW()),
('katedralskolan-linkoping-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Katedralskolan Linköping', 'Katedralskolan Linköping', NOW()),
('katedralskolan-linkoping-humanistiska', 'Humanistiska programmet', 'Humanistiska programmet vid Katedralskolan Linköping', 'Katedralskolan Linköping', NOW()),

-- Katedralskolan Lund
('katedralskolan-lund-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Katedralskolan Lund', 'Katedralskolan Lund', NOW()),
('katedralskolan-lund-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Katedralskolan Lund', 'Katedralskolan Lund', NOW()),
('katedralskolan-lund-humanistiska', 'Humanistiska programmet', 'Humanistiska programmet vid Katedralskolan Lund', 'Katedralskolan Lund', NOW()),
('katedralskolan-lund-ib', 'International Baccalaureate', 'International Baccalaureate vid Katedralskolan Lund', 'Katedralskolan Lund', NOW()),

-- Polhemskolan Lund
('polhemskolan-lund-teknik', 'Teknikprogrammet', 'Teknikprogrammet vid Polhemskolan', 'Polhemskolan', NOW()),
('polhemskolan-lund-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Polhemskolan', 'Polhemskolan', NOW()),

-- Spyken
('spyken-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Spyken', 'Spyken', NOW()),
('spyken-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Spyken', 'Spyken', NOW()),
('spyken-estetiska', 'Estetiska programmet', 'Estetiska programmet vid Spyken', 'Spyken', NOW()),

-- Bäckängsgymnasiet
('backangs-bygg-anlaggning', 'Bygg- och anläggningsprogrammet', 'Bygg- och anläggningsprogrammet vid Bäckängsgymnasiet', 'Bäckängsgymnasiet', NOW()),
('backangs-el-energi', 'El- och energiprogrammet', 'El- och energiprogrammet vid Bäckängsgymnasiet', 'Bäckängsgymnasiet', NOW()),
('backangs-vvs-fastighet', 'VVS- och fastighetsprogrammet', 'VVS- och fastighetsprogrammet vid Bäckängsgymnasiet', 'Bäckängsgymnasiet', NOW()),

-- Sven Eriksonsgymnasiet
('sven-eriksons-vard-omsorg', 'Vård- och omsorgsprogrammet', 'Vård- och omsorgsprogrammet vid Sven Eriksonsgymnasiet', 'Sven Eriksonsgymnasiet', NOW()),
('sven-eriksons-barn-fritid', 'Barn- och fritidsprogrammet', 'Barn- och fritidsprogrammet vid Sven Eriksonsgymnasiet', 'Sven Eriksonsgymnasiet', NOW()),

-- Burgårdens gymnasium
('burgardens-restaurang-livsmedel', 'Restaurang- och livsmedelsprogrammet', 'Restaurang- och livsmedelsprogrammet vid Burgårdens gymnasium', 'Burgårdens gymnasium', NOW()),
('burgardens-hotell-turism', 'Hotell- och turismprogrammet', 'Hotell- och turismprogrammet vid Burgårdens gymnasium', 'Burgårdens gymnasium', NOW()),

-- Svenljunga gymnasium
('svenljunga-naturbruk', 'Naturbruksprogrammet', 'Naturbruksprogrammet vid Svenljunga gymnasium', 'Svenljunga gymnasium', NOW()),

-- Öckerö seglande gymnasieskola
('ockero-naturvetenskap', 'Naturvetenskapsprogrammet', 'Naturvetenskapsprogrammet vid Öckerö seglande gymnasieskola', 'Öckerö seglande gymnasieskola', NOW()),
('ockero-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Samhällsvetenskapsprogrammet vid Öckerö seglande gymnasieskola', 'Öckerö seglande gymnasieskola', NOW());

-- Enable RLS on programs table
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read programs
CREATE POLICY "Allow all users to read programs" ON programs
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert programs (for admin purposes)
CREATE POLICY "Allow authenticated users to insert programs" ON programs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update programs (for admin purposes)
CREATE POLICY "Allow authenticated users to update programs" ON programs
  FOR UPDATE USING (auth.role() = 'authenticated');