-- Fix programs table and create all programs from the app
-- This SQL creates program entries for all gymnasium-program combinations

-- First, let's create programs for all the specific gymnasium-program mappings
INSERT INTO programs (id, name, gymnasium, created_at) VALUES
-- Kungsholmens gymnasium
('kungsholmens-naturvetenskap', 'Naturvetenskapsprogrammet', 'Kungsholmens gymnasium', NOW()),
('kungsholmens-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Kungsholmens gymnasium', NOW()),
('kungsholmens-humanistiska', 'Humanistiska programmet', 'Kungsholmens gymnasium', NOW()),

-- Norra Real
('norra-real-naturvetenskap', 'Naturvetenskapsprogrammet', 'Norra Real', NOW()),
('norra-real-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Norra Real', NOW()),
('norra-real-teknik', 'Teknikprogrammet', 'Norra Real', NOW()),

-- Södra Latin
('sodra-latin-naturvetenskap', 'Naturvetenskapsprogrammet', 'Södra Latin', NOW()),
('sodra-latin-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Södra Latin', NOW()),
('sodra-latin-ekonomi', 'Ekonomiprogrammet', 'Södra Latin', NOW()),
('sodra-latin-humanistiska', 'Humanistiska programmet', 'Södra Latin', NOW()),

-- Östra Real
('ostra-real-naturvetenskap', 'Naturvetenskapsprogrammet', 'Östra Real', NOW()),
('ostra-real-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Östra Real', NOW()),
('ostra-real-ekonomi', 'Ekonomiprogrammet', 'Östra Real', NOW()),

-- Viktor Rydberg gymnasium
('viktor-rydberg-naturvetenskap', 'Naturvetenskapsprogrammet', 'Viktor Rydberg gymnasium', NOW()),
('viktor-rydberg-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Viktor Rydberg gymnasium', NOW()),
('viktor-rydberg-humanistiska', 'Humanistiska programmet', 'Viktor Rydberg gymnasium', NOW()),

-- NTI-gymnasiet Umeå
('nti-umea-teknik', 'Teknikprogrammet', 'NTI-gymnasiet Umeå', NOW()),
('nti-umea-el-energi', 'El- och energiprogrammet', 'NTI-gymnasiet Umeå', NOW()),

-- Stockholms estetiska gymnasium
('stockholms-estetiska-estetiska', 'Estetiska programmet', 'Stockholms estetiska gymnasium', NOW()),

-- International High School of the Gothenburg Region
('ihsgr-ib', 'International Baccalaureate', 'International High School of the Gothenburg Region', NOW()),

-- Sigtunaskolan Humanistiska Läroverket
('sigtuna-ib', 'International Baccalaureate', 'Sigtunaskolan Humanistiska Läroverket', NOW()),
('sigtuna-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Sigtunaskolan Humanistiska Läroverket', NOW()),
('sigtuna-naturvetenskap', 'Naturvetenskapsprogrammet', 'Sigtunaskolan Humanistiska Läroverket', NOW()),

-- Hvitfeldtska gymnasiet
('hvitfeldtska-naturvetenskap', 'Naturvetenskapsprogrammet', 'Hvitfeldtska gymnasiet', NOW()),
('hvitfeldtska-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Hvitfeldtska gymnasiet', NOW()),
('hvitfeldtska-ib', 'International Baccalaureate', 'Hvitfeldtska gymnasiet', NOW()),

-- Katrinelundsgymnasiet
('katrinelunds-naturvetenskap', 'Naturvetenskapsprogrammet', 'Katrinelundsgymnasiet', NOW()),
('katrinelunds-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Katrinelundsgymnasiet', NOW()),
('katrinelunds-ekonomi', 'Ekonomiprogrammet', 'Katrinelundsgymnasiet', NOW()),

-- Polhemsgymnasiet
('polhems-gbg-teknik', 'Teknikprogrammet', 'Polhemsgymnasiet', NOW()),
('polhems-gbg-naturvetenskap', 'Naturvetenskapsprogrammet', 'Polhemsgymnasiet', NOW()),
('polhems-gbg-industritekniska', 'Industritekniska programmet', 'Polhemsgymnasiet', NOW()),

-- Schillerska gymnasiet
('schillerska-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Schillerska gymnasiet', NOW()),
('schillerska-humanistiska', 'Humanistiska programmet', 'Schillerska gymnasiet', NOW()),
('schillerska-estetiska', 'Estetiska programmet', 'Schillerska gymnasiet', NOW()),

-- Malmö Borgarskola
('malmo-borgarskola-naturvetenskap', 'Naturvetenskapsprogrammet', 'Malmö Borgarskola', NOW()),
('malmo-borgarskola-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Malmö Borgarskola', NOW()),
('malmo-borgarskola-ekonomi', 'Ekonomiprogrammet', 'Malmö Borgarskola', NOW()),

-- Malmö latinskola
('malmo-latin-naturvetenskap', 'Naturvetenskapsprogrammet', 'Malmö latinskola', NOW()),
('malmo-latin-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Malmö latinskola', NOW()),
('malmo-latin-humanistiska', 'Humanistiska programmet', 'Malmö latinskola', NOW()),

-- Malmö idrottsgymnasium
('malmo-idrott-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Malmö idrottsgymnasium', NOW()),
('malmo-idrott-naturvetenskap', 'Naturvetenskapsprogrammet', 'Malmö idrottsgymnasium', NOW()),
('malmo-idrott-ekonomi', 'Ekonomiprogrammet', 'Malmö idrottsgymnasium', NOW()),

-- Katedralskolan (Uppsala)
('katedralskolan-uppsala-naturvetenskap', 'Naturvetenskapsprogrammet', 'Katedralskolan', NOW()),
('katedralskolan-uppsala-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Katedralskolan', NOW()),
('katedralskolan-uppsala-humanistiska', 'Humanistiska programmet', 'Katedralskolan', NOW()),
('katedralskolan-uppsala-estetiska', 'Estetiska programmet', 'Katedralskolan', NOW()),

-- Lundellska skolan
('lundellska-naturvetenskap', 'Naturvetenskapsprogrammet', 'Lundellska skolan', NOW()),
('lundellska-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Lundellska skolan', NOW()),
('lundellska-ekonomi', 'Ekonomiprogrammet', 'Lundellska skolan', NOW()),

-- Fyrisskolan
('fyrisskolan-naturvetenskap', 'Naturvetenskapsprogrammet', 'Fyrisskolan', NOW()),
('fyrisskolan-teknik', 'Teknikprogrammet', 'Fyrisskolan', NOW()),
('fyrisskolan-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Fyrisskolan', NOW()),

-- Celsiusskolan
('celsiusskolan-teknik', 'Teknikprogrammet', 'Celsiusskolan', NOW()),
('celsiusskolan-el-energi', 'El- och energiprogrammet', 'Celsiusskolan', NOW()),
('celsiusskolan-industritekniska', 'Industritekniska programmet', 'Celsiusskolan', NOW()),

-- Berzeliusskolan
('berzeliusskolan-naturvetenskap', 'Naturvetenskapsprogrammet', 'Berzeliusskolan', NOW()),
('berzeliusskolan-teknik', 'Teknikprogrammet', 'Berzeliusskolan', NOW()),

-- Folkungaskolan
('folkungaskolan-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Folkungaskolan', NOW()),
('folkungaskolan-ekonomi', 'Ekonomiprogrammet', 'Folkungaskolan', NOW()),
('folkungaskolan-estetiska', 'Estetiska programmet', 'Folkungaskolan', NOW()),

-- Katedralskolan Linköping
('katedralskolan-linkoping-naturvetenskap', 'Naturvetenskapsprogrammet', 'Katedralskolan Linköping', NOW()),
('katedralskolan-linkoping-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Katedralskolan Linköping', NOW()),
('katedralskolan-linkoping-humanistiska', 'Humanistiska programmet', 'Katedralskolan Linköping', NOW()),

-- Katedralskolan Lund
('katedralskolan-lund-naturvetenskap', 'Naturvetenskapsprogrammet', 'Katedralskolan Lund', NOW()),
('katedralskolan-lund-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Katedralskolan Lund', NOW()),
('katedralskolan-lund-humanistiska', 'Humanistiska programmet', 'Katedralskolan Lund', NOW()),
('katedralskolan-lund-ib', 'International Baccalaureate', 'Katedralskolan Lund', NOW()),

-- Polhemskolan (Lund)
('polhemskolan-lund-teknik', 'Teknikprogrammet', 'Polhemskolan', NOW()),
('polhemskolan-lund-naturvetenskap', 'Naturvetenskapsprogrammet', 'Polhemskolan', NOW()),

-- Spyken
('spyken-naturvetenskap', 'Naturvetenskapsprogrammet', 'Spyken', NOW()),
('spyken-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Spyken', NOW()),
('spyken-estetiska', 'Estetiska programmet', 'Spyken', NOW()),

-- Bäckängsgymnasiet
('backangs-bygg-anlaggning', 'Bygg- och anläggningsprogrammet', 'Bäckängsgymnasiet', NOW()),
('backangs-el-energi', 'El- och energiprogrammet', 'Bäckängsgymnasiet', NOW()),
('backangs-vvs-fastighet', 'VVS- och fastighetsprogrammet', 'Bäckängsgymnasiet', NOW()),

-- Sven Eriksonsgymnasiet
('sven-eriksons-vard-omsorg', 'Vård- och omsorgsprogrammet', 'Sven Eriksonsgymnasiet', NOW()),
('sven-eriksons-barn-fritid', 'Barn- och fritidsprogrammet', 'Sven Eriksonsgymnasiet', NOW()),

-- Burgårdens gymnasium
('burgardens-restaurang-livsmedel', 'Restaurang- och livsmedelsprogrammet', 'Burgårdens gymnasium', NOW()),
('burgardens-hotell-turism', 'Hotell- och turismprogrammet', 'Burgårdens gymnasium', NOW()),

-- Svenljunga gymnasium
('svenljunga-naturbruk', 'Naturbruksprogrammet', 'Svenljunga gymnasium', NOW()),

-- Öckerö seglande gymnasieskola
('ockero-naturvetenskap', 'Naturvetenskapsprogrammet', 'Öckerö seglande gymnasieskola', NOW()),
('ockero-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Öckerö seglande gymnasieskola', NOW())

ON CONFLICT (id) DO NOTHING;

-- Create some additional common programs for major gymnasiums that don't have specific mappings
-- These will use generic IDs for schools that should have these common programs

INSERT INTO programs (id, name, gymnasium, created_at) VALUES
-- Add common programs for some major schools that might need them
('blackeberg-naturvetenskap', 'Naturvetenskapsprogrammet', 'Blackebergs gymnasium', NOW()),
('blackeberg-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Blackeberg gymnasium', NOW()),
('blackeberg-ekonomi', 'Ekonomiprogrammet', 'Blackeberg gymnasium', NOW()),

('bromma-naturvetenskap', 'Naturvetenskapsprogrammet', 'Bromma gymnasium', NOW()),
('bromma-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Bromma gymnasium', NOW()),
('bromma-ekonomi', 'Ekonomiprogrammet', 'Bromma gymnasium', NOW()),

('enskilda-naturvetenskap', 'Naturvetenskapsprogrammet', 'Enskilda gymnasiet', NOW()),
('enskilda-samhallsvetenskap', 'Samhällsvetenskapsprogrammet', 'Enskilda gymnasiet', NOW()),
('enskilda-ekonomi', 'Ekonomiprogrammet', 'Enskilda gymnasiet', NOW())

ON CONFLICT (id) DO NOTHING;