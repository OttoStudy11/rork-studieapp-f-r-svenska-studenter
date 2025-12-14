-- Verified Swedish Gymnasium Schools
-- Based on official school registries and EDNIA data
-- Last updated: 2025

-- Clear existing data
TRUNCATE TABLE gymnasiums CASCADE;

-- Insert verified gymnasium schools
INSERT INTO gymnasiums (id, name, city, type, created_at, updated_at) VALUES

-- =====================================================
-- STOCKHOLM REGION
-- =====================================================

-- Stockholm Stad - Kommunala
(gen_random_uuid(), 'Blackebergs gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Bromma gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Enskede gårds gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Farsta gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Globala gymnasiet', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Kungsholmens gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Kulturama gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Norra Real', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Östra Real', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'S:t Eriks gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Södra Latins gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Thorildsplans gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Stockholms Idrottsgymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Stockholms hotell- och restaurangskola', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Frans Schartaus gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Anna Whitlocks gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Kärrtorps gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Skarpnäcks gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Åsö gymnasium', 'Stockholm', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Bernadottegymnasiet', 'Stockholm', 'kommunal', NOW(), NOW()),

-- Stockholm Stad - Friskolor
(gen_random_uuid(), 'Viktor Rydberg Gymnasium Odenplan', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Viktor Rydberg Gymnasium Jarlaplan', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Enskilda gymnasiet', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Stockholms Enskilda Gymnasium', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Stockholm City', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Norra', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Gamla Stan', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Stockholm City', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Södertörn', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'LBS Kreativa Gymnasiet Stockholm', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Sjölins Gymnasium Södermalm', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Sjölins Gymnasium Vasastan', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'ProCivitas Privata Gymnasium Stockholm', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Rytmus Musikergymnasiet Stockholm', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Fredrika Bremer-gymnasiet', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Thoren Business School Stockholm', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Stockholm', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Stockholms fria gymnasium', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Medborgarskolan gymnasium Stockholm', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Klara gymnasium Stockholm', 'Stockholm', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Hermods gymnasium Stockholm', 'Stockholm', 'friskola', NOW(), NOW()),

-- Solna
(gen_random_uuid(), 'Solna gymnasium', 'Solna', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Washington Internship High School', 'Solna', 'friskola', NOW(), NOW()),

-- Sundbyberg
(gen_random_uuid(), 'Sundbybergs gymnasium', 'Sundbyberg', 'kommunal', NOW(), NOW()),

-- Nacka
(gen_random_uuid(), 'Nacka gymnasium', 'Nacka', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Sickla gymnasium', 'Nacka', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Design & Construction College', 'Nacka', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Viktor Rydberg Gymnasium Nacka', 'Nacka', 'friskola', NOW(), NOW()),

-- Danderyd
(gen_random_uuid(), 'Danderyds gymnasium', 'Danderyd', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Viktor Rydberg Gymnasium Djursholm', 'Danderyd', 'friskola', NOW(), NOW()),

-- Täby
(gen_random_uuid(), 'Åva gymnasium', 'Täby', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Täby Enskilda gymnasium', 'Täby', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Tibble Fristående gymnasium', 'Täby', 'friskola', NOW(), NOW()),

-- Lidingö
(gen_random_uuid(), 'Hersby gymnasium', 'Lidingö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Gångsätra gymnasium', 'Lidingö', 'kommunal', NOW(), NOW()),

-- Sollentuna
(gen_random_uuid(), 'Rudbecksskolan', 'Sollentuna', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Sollentuna gymnasium', 'Sollentuna', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Sollentuna', 'Sollentuna', 'friskola', NOW(), NOW()),

-- Järfälla
(gen_random_uuid(), 'Jakobsbergs gymnasium', 'Järfälla', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'IT-Gymnasiet Jakobsberg', 'Järfälla', 'friskola', NOW(), NOW()),

-- Upplands Väsby
(gen_random_uuid(), 'Vilunda gymnasium', 'Upplands Väsby', 'kommunal', NOW(), NOW()),

-- Sigtuna
(gen_random_uuid(), 'Arlandagymnasiet', 'Sigtuna', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Sigtunaskolan Humanistiska Läroverket', 'Sigtuna', 'friskola', NOW(), NOW()),

-- Vallentuna
(gen_random_uuid(), 'Vallentuna gymnasium', 'Vallentuna', 'kommunal', NOW(), NOW()),

-- Norrtälje
(gen_random_uuid(), 'Rodengymnasiet', 'Norrtälje', 'kommunal', NOW(), NOW()),

-- Huddinge
(gen_random_uuid(), 'Huddinge gymnasium', 'Huddinge', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Sjödalsgymnasiet', 'Huddinge', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Södertörns friskola', 'Huddinge', 'friskola', NOW(), NOW()),

-- Botkyrka
(gen_random_uuid(), 'Tumba gymnasium', 'Botkyrka', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Botkyrka gymnasium', 'Botkyrka', 'kommunal', NOW(), NOW()),

-- Haninge
(gen_random_uuid(), 'Fredrika Bremergymnasiet', 'Haninge', 'kommunal', NOW(), NOW()),

-- Södertälje
(gen_random_uuid(), 'Torekällgymnasiet', 'Södertälje', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Täljegymnasiet', 'Södertälje', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Fornbygymnasiet', 'Södertälje', 'kommunal', NOW(), NOW()),

-- Nynäshamn
(gen_random_uuid(), 'Nynäshamns gymnasium', 'Nynäshamn', 'kommunal', NOW(), NOW()),

-- Tyresö
(gen_random_uuid(), 'Tyresö gymnasium', 'Tyresö', 'kommunal', NOW(), NOW()),

-- =====================================================
-- GÖTEBORG REGION
-- =====================================================

-- Göteborg Stad - Kommunala
(gen_random_uuid(), 'Hvitfeldtska gymnasiet', 'Göteborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Schillerska gymnasiet', 'Göteborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Polhemsgymnasiet', 'Göteborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Burgårdens utbildningscentrum', 'Göteborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Angeredsgymnasiet', 'Göteborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Katrinelundsgymnasiet', 'Göteborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Lindholmens tekniska gymnasium', 'Göteborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Bräckegymnasiet', 'Göteborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Ester Mosessons gymnasium', 'Göteborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Munkebäcksgymnasiet', 'Göteborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Donnergymnasiet', 'Göteborg', 'kommunal', NOW(), NOW()),

-- Göteborg - Friskolor
(gen_random_uuid(), 'Göteborgs Högre Samskola', 'Göteborg', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Göteborg', 'Göteborg', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Göteborg', 'Göteborg', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'LBS Kreativa Gymnasiet Göteborg', 'Göteborg', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Praktiska Gymnasiet Göteborg', 'Göteborg', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Göteborg', 'Göteborg', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Rytmus Musikergymnasiet Göteborg', 'Göteborg', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Thoren Business School Göteborg', 'Göteborg', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'IT-Gymnasiet Göteborg', 'Göteborg', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Drottning Blankas Gymnasieskola Göteborg', 'Göteborg', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Mediegymnasiet Göteborg', 'Göteborg', 'friskola', NOW(), NOW()),

-- Mölndal
(gen_random_uuid(), 'Fässbergsgymnasiet', 'Mölndal', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Krokslättsgymnasiet', 'Mölndal', 'kommunal', NOW(), NOW()),

-- Partille
(gen_random_uuid(), 'Partille gymnasium', 'Partille', 'kommunal', NOW(), NOW()),

-- Kungsbacka
(gen_random_uuid(), 'Elof Lindälvs gymnasium', 'Kungsbacka', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Aranäsgymnasiet', 'Kungsbacka', 'kommunal', NOW(), NOW()),

-- Lerum
(gen_random_uuid(), 'Lerums gymnasium', 'Lerum', 'kommunal', NOW(), NOW()),

-- Alingsås
(gen_random_uuid(), 'Alströmergymnasiet', 'Alingsås', 'kommunal', NOW(), NOW()),

-- =====================================================
-- MALMÖ REGION (SKÅNE)
-- =====================================================

-- Malmö Stad - Kommunala
(gen_random_uuid(), 'Malmö Latinskola', 'Malmö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Malmö Borgarskola', 'Malmö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Pauliskolan', 'Malmö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Heleneholms gymnasium', 'Malmö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'S:t Petri skola', 'Malmö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Malmö Idrottsgymnasium', 'Malmö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Universitetsholmens gymnasium', 'Malmö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Norra Sorgenfri gymnasium', 'Malmö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Jörgen Kocks gymnasium', 'Malmö', 'kommunal', NOW(), NOW()),

-- Malmö - Friskolor
(gen_random_uuid(), 'Jensen Gymnasium Malmö', 'Malmö', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Malmö', 'Malmö', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'LBS Kreativa Gymnasiet Malmö', 'Malmö', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Praktiska Gymnasiet Malmö', 'Malmö', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Malmö', 'Malmö', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'ProCivitas Privata Gymnasium Malmö', 'Malmö', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Thoren Business School Malmö', 'Malmö', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Drottning Blankas Gymnasieskola Malmö', 'Malmö', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Rytmus Musikergymnasiet Malmö', 'Malmö', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'IT-Gymnasiet Malmö', 'Malmö', 'friskola', NOW(), NOW()),

-- Lund
(gen_random_uuid(), 'Katedralskolan Lund', 'Lund', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Spyken', 'Lund', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Polhemskolan Lund', 'Lund', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Vipan', 'Lund', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Lund', 'Lund', 'friskola', NOW(), NOW()),

-- Helsingborg
(gen_random_uuid(), 'Olympiaskolan', 'Helsingborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Nicolaiskolan', 'Helsingborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Rönnowska skolan', 'Helsingborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Filbornaskolan', 'Helsingborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Wieselgrensskolan', 'Helsingborg', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Helsingborg', 'Helsingborg', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Helsingborg', 'Helsingborg', 'friskola', NOW(), NOW()),

-- Landskrona
(gen_random_uuid(), 'Lärande i Landskrona', 'Landskrona', 'kommunal', NOW(), NOW()),

-- Trelleborg
(gen_random_uuid(), 'Söderslättsgymnasiet', 'Trelleborg', 'kommunal', NOW(), NOW()),

-- Ystad
(gen_random_uuid(), 'Österportgymnasiet', 'Ystad', 'kommunal', NOW(), NOW()),

-- Kristianstad
(gen_random_uuid(), 'Wendesgymnasiet', 'Kristianstad', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Söderportgymnasiet', 'Kristianstad', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Christian IV:s gymnasium', 'Kristianstad', 'kommunal', NOW(), NOW()),

-- Ängelholm
(gen_random_uuid(), 'Rönnegymnasiet', 'Ängelholm', 'kommunal', NOW(), NOW()),

-- Eslöv
(gen_random_uuid(), 'Eslövs gymnasium', 'Eslöv', 'kommunal', NOW(), NOW()),

-- Hässleholm
(gen_random_uuid(), 'Hässleholms gymnasium', 'Hässleholm', 'kommunal', NOW(), NOW()),

-- =====================================================
-- UPPSALA REGION
-- =====================================================

(gen_random_uuid(), 'Katedralskolan Uppsala', 'Uppsala', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Fyrisskolan', 'Uppsala', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Rosendalsgymnasiet', 'Uppsala', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Lundellska skolan', 'Uppsala', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Bolandgymnasiet', 'Uppsala', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Celsiusskolan', 'Uppsala', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Uppsala', 'Uppsala', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Uppsala', 'Uppsala', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Uppsala', 'Uppsala', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'LBS Kreativa Gymnasiet Uppsala', 'Uppsala', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Thoren Business School Uppsala', 'Uppsala', 'friskola', NOW(), NOW()),

-- =====================================================
-- VÄSTRA GÖTALAND
-- =====================================================

-- Borås
(gen_random_uuid(), 'Sven Eriksonsgymnasiet', 'Borås', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Almåsgymnasiet', 'Borås', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Bäckängsgymnasiet', 'Borås', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Viskastrandsgymnasiet', 'Borås', 'kommunal', NOW(), NOW()),

-- Trollhättan
(gen_random_uuid(), 'Nils Ericsongymnasiet', 'Trollhättan', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Magnus Åbergsgymnasiet', 'Trollhättan', 'kommunal', NOW(), NOW()),

-- Uddevalla
(gen_random_uuid(), 'Uddevalla gymnasieskola', 'Uddevalla', 'kommunal', NOW(), NOW()),

-- Skövde
(gen_random_uuid(), 'Kavelbro gymnasium', 'Skövde', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Västerhöjdsgymnasiet', 'Skövde', 'kommunal', NOW(), NOW()),

-- Lidköping
(gen_random_uuid(), 'De la Gardiegymnasiet', 'Lidköping', 'kommunal', NOW(), NOW()),

-- Mariestad
(gen_random_uuid(), 'Vadsbogymnasiet', 'Mariestad', 'kommunal', NOW(), NOW()),

-- Falköping
(gen_random_uuid(), 'Ållebergsgymnasiet', 'Falköping', 'kommunal', NOW(), NOW()),

-- Varberg
(gen_random_uuid(), 'Peder Skrivares skola', 'Varberg', 'kommunal', NOW(), NOW()),

-- Falkenberg
(gen_random_uuid(), 'Falkenbergs gymnasium', 'Falkenberg', 'kommunal', NOW(), NOW()),

-- =====================================================
-- ÖSTERGÖTLAND
-- =====================================================

-- Linköping
(gen_random_uuid(), 'Katedralskolan Linköping', 'Linköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Berzeliusskolan', 'Linköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Birgittaskolan', 'Linköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Folkungaskolan', 'Linköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Linköping', 'Linköping', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Linköping', 'Linköping', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Linköping', 'Linköping', 'friskola', NOW(), NOW()),

-- Norrköping
(gen_random_uuid(), 'De Geergymnasiet', 'Norrköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Ebersteinska gymnasiet', 'Norrköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Hagagymnasiet', 'Norrköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Norrköping', 'Norrköping', 'friskola', NOW(), NOW()),

-- Motala
(gen_random_uuid(), 'Platengymnasiet', 'Motala', 'kommunal', NOW(), NOW()),

-- =====================================================
-- ÖREBRO LÄN
-- =====================================================

(gen_random_uuid(), 'Karolinska gymnasiet', 'Örebro', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Virginska gymnasiet', 'Örebro', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Risbergska gymnasiet', 'Örebro', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Rudbecksskolan Örebro', 'Örebro', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Tullängsskolan', 'Örebro', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Örebro', 'Örebro', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Örebro', 'Örebro', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Praktiska Gymnasiet Örebro', 'Örebro', 'friskola', NOW(), NOW()),

-- Karlskoga
(gen_random_uuid(), 'Möckelngymnasiet', 'Karlskoga', 'kommunal', NOW(), NOW()),

-- =====================================================
-- VÄSTMANLAND
-- =====================================================

-- Västerås
(gen_random_uuid(), 'Rudbeckianska gymnasiet', 'Västerås', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Carlforsska gymnasiet', 'Västerås', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'John Bauergymnasiet Västerås', 'Västerås', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Widénska gymnasiet', 'Västerås', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Västerås', 'Västerås', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'IT-Gymnasiet Västerås', 'Västerås', 'friskola', NOW(), NOW()),

-- Sala
(gen_random_uuid(), 'Kungsängsskolan', 'Sala', 'kommunal', NOW(), NOW()),

-- =====================================================
-- SÖDERMANLAND
-- =====================================================

-- Eskilstuna
(gen_random_uuid(), 'Rekarnegymnasiet', 'Eskilstuna', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Carl Engströmgymnasiet', 'Eskilstuna', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Rinmangymnasiet', 'Eskilstuna', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Eskilstuna', 'Eskilstuna', 'friskola', NOW(), NOW()),

-- Nyköping
(gen_random_uuid(), 'Nyköpings gymnasium', 'Nyköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Gripengymnasiet', 'Nyköping', 'kommunal', NOW(), NOW()),

-- Strängnäs
(gen_random_uuid(), 'Thomasgymnasiet', 'Strängnäs', 'kommunal', NOW(), NOW()),

-- Katrineholm
(gen_random_uuid(), 'Lindengymnasiet', 'Katrineholm', 'kommunal', NOW(), NOW()),

-- =====================================================
-- JÖNKÖPINGS LÄN
-- =====================================================

-- Jönköping
(gen_random_uuid(), 'Per Brahegymnasiet', 'Jönköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Sandagymnasiet', 'Jönköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Bäckadalsgymnasiet', 'Jönköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Erik Dahlbergsgymnasiet', 'Jönköping', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Jönköping', 'Jönköping', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Jönköping', 'Jönköping', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Jönköping', 'Jönköping', 'friskola', NOW(), NOW()),

-- Värnamo
(gen_random_uuid(), 'Finnvedens gymnasium', 'Värnamo', 'kommunal', NOW(), NOW()),

-- Nässjö
(gen_random_uuid(), 'Brinellgymnasiet', 'Nässjö', 'kommunal', NOW(), NOW()),

-- =====================================================
-- KRONOBERGS LÄN
-- =====================================================

-- Växjö
(gen_random_uuid(), 'Katedralskolan Växjö', 'Växjö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Kungsmadskolan', 'Växjö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Teknikum', 'Växjö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Allbo lärcenter', 'Växjö', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Växjö', 'Växjö', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Växjö', 'Växjö', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Praktiska Gymnasiet Växjö', 'Växjö', 'friskola', NOW(), NOW()),

-- Ljungby
(gen_random_uuid(), 'Sunnerbogymnasiet', 'Ljungby', 'kommunal', NOW(), NOW()),

-- =====================================================
-- KALMAR LÄN
-- =====================================================

-- Kalmar
(gen_random_uuid(), 'Stagneliusskolan', 'Kalmar', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Lars Kaggskolan', 'Kalmar', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Jenny Nyströmskolan', 'Kalmar', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Kalmar', 'Kalmar', 'friskola', NOW(), NOW()),

-- Oskarshamn
(gen_random_uuid(), 'Oscarsgymnasiet', 'Oskarshamn', 'kommunal', NOW(), NOW()),

-- Västervik
(gen_random_uuid(), 'Västerviks gymnasium', 'Västervik', 'kommunal', NOW(), NOW()),

-- =====================================================
-- BLEKINGE LÄN
-- =====================================================

-- Karlskrona
(gen_random_uuid(), 'Chapmangymnasiet', 'Karlskrona', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Törnströmska gymnasiet', 'Karlskrona', 'kommunal', NOW(), NOW()),

-- Karlshamn
(gen_random_uuid(), 'Väggaskolan', 'Karlshamn', 'kommunal', NOW(), NOW()),

-- =====================================================
-- GOTLAND
-- =====================================================

(gen_random_uuid(), 'Wisbygymnasiet', 'Visby', 'kommunal', NOW(), NOW()),

-- =====================================================
-- HALLAND
-- =====================================================

-- Halmstad
(gen_random_uuid(), 'Kattegattgymnasiet', 'Halmstad', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Sannarpsgymnasiet', 'Halmstad', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Sturegymnasiet', 'Halmstad', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Halmstad', 'Halmstad', 'friskola', NOW(), NOW()),

-- Laholm
(gen_random_uuid(), 'Osbecksgymnasiet', 'Laholm', 'kommunal', NOW(), NOW()),

-- =====================================================
-- VÄRMLAND
-- =====================================================

-- Karlstad
(gen_random_uuid(), 'Tingvalla gymnasium', 'Karlstad', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Sundsta-Älvkullegymnasiet', 'Karlstad', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Nobelgymnasiet', 'Karlstad', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Karlstad', 'Karlstad', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Karlstad', 'Karlstad', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Drottning Blankas Gymnasieskola Karlstad', 'Karlstad', 'friskola', NOW(), NOW()),

-- Arvika
(gen_random_uuid(), 'Solbergagymnasiet', 'Arvika', 'kommunal', NOW(), NOW()),

-- Kristinehamn
(gen_random_uuid(), 'Brogårdsgymnasiet', 'Kristinehamn', 'kommunal', NOW(), NOW()),

-- =====================================================
-- DALARNA
-- =====================================================

-- Falun
(gen_random_uuid(), 'Lugnetgymnasiet', 'Falun', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Kristine gymnasium', 'Falun', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Soltorgsgymnasiet', 'Falun', 'kommunal', NOW(), NOW()),

-- Borlänge
(gen_random_uuid(), 'Hagaskolan', 'Borlänge', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Erikslunds gymnasium', 'Borlänge', 'kommunal', NOW(), NOW()),

-- Mora
(gen_random_uuid(), 'Moragymnasiet', 'Mora', 'kommunal', NOW(), NOW()),

-- Ludvika
(gen_random_uuid(), 'Ludvika gymnasium', 'Ludvika', 'kommunal', NOW(), NOW()),

-- Leksand
(gen_random_uuid(), 'Leksands gymnasium', 'Leksand', 'kommunal', NOW(), NOW()),

-- =====================================================
-- GÄVLEBORG
-- =====================================================

-- Gävle
(gen_random_uuid(), 'Vasaskolan', 'Gävle', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Polhemsskolan Gävle', 'Gävle', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Borgarskolan', 'Gävle', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Gävle', 'Gävle', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Gävle', 'Gävle', 'friskola', NOW(), NOW()),

-- Sandviken
(gen_random_uuid(), 'Bessemerskolan', 'Sandviken', 'kommunal', NOW(), NOW()),

-- Hudiksvall
(gen_random_uuid(), 'Bromangymnasiet', 'Hudiksvall', 'kommunal', NOW(), NOW()),

-- Bollnäs
(gen_random_uuid(), 'Torsbergsgymnasiet', 'Bollnäs', 'kommunal', NOW(), NOW()),

-- Söderhamn
(gen_random_uuid(), 'Staffangymnasiet', 'Söderhamn', 'kommunal', NOW(), NOW()),

-- =====================================================
-- VÄSTERNORRLAND
-- =====================================================

-- Sundsvall
(gen_random_uuid(), 'Hedbergska skolan', 'Sundsvall', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Västermalms skola', 'Sundsvall', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Sundsvalls gymnasium', 'Sundsvall', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Sundsvall', 'Sundsvall', 'friskola', NOW(), NOW()),

-- Härnösand
(gen_random_uuid(), 'Härnösands gymnasium', 'Härnösand', 'kommunal', NOW(), NOW()),

-- Örnsköldsvik
(gen_random_uuid(), 'Nolaskolan', 'Örnsköldsvik', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Parkskolan', 'Örnsköldsvik', 'kommunal', NOW(), NOW()),

-- Kramfors
(gen_random_uuid(), 'Ådalsskolan', 'Kramfors', 'kommunal', NOW(), NOW()),

-- =====================================================
-- JÄMTLAND
-- =====================================================

-- Östersund
(gen_random_uuid(), 'Wargentin gymnasium', 'Östersund', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Palmcrantzskolan', 'Östersund', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Jämtlands gymnasium', 'Östersund', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Östersund', 'Östersund', 'friskola', NOW(), NOW()),

-- =====================================================
-- VÄSTERBOTTEN
-- =====================================================

-- Umeå
(gen_random_uuid(), 'Dragonskolan', 'Umeå', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Midgårdsskolan', 'Umeå', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Fridhemsgymnasiet', 'Umeå', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Forslundagymnasiet', 'Umeå', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Umeå', 'Umeå', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Umeå', 'Umeå', 'friskola', NOW(), NOW()),
(gen_random_uuid(), 'Thoren Business School Umeå', 'Umeå', 'friskola', NOW(), NOW()),

-- Skellefteå
(gen_random_uuid(), 'Anderstorpsgymnasiet', 'Skellefteå', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Balderskolan', 'Skellefteå', 'kommunal', NOW(), NOW()),

-- Lycksele
(gen_random_uuid(), 'Tannbergsskolan', 'Lycksele', 'kommunal', NOW(), NOW()),

-- =====================================================
-- NORRBOTTEN
-- =====================================================

-- Luleå
(gen_random_uuid(), 'Luleå gymnasieskola', 'Luleå', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'Björkskatan gymnasium', 'Luleå', 'kommunal', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Luleå', 'Luleå', 'friskola', NOW(), NOW()),

-- Piteå
(gen_random_uuid(), 'Strömbackaskolan', 'Piteå', 'kommunal', NOW(), NOW()),

-- Boden
(gen_random_uuid(), 'Björknäsgymnasiet', 'Boden', 'kommunal', NOW(), NOW()),

-- Kiruna
(gen_random_uuid(), 'Hjalmar Lundbohmsskolan', 'Kiruna', 'kommunal', NOW(), NOW()),

-- Gällivare
(gen_random_uuid(), 'Gällivare gymnasium', 'Gällivare', 'kommunal', NOW(), NOW()),

-- Kalix
(gen_random_uuid(), 'Kalix Naturbruksgymnasium', 'Kalix', 'kommunal', NOW(), NOW()),

-- Haparanda
(gen_random_uuid(), 'Tornedalsskolan', 'Haparanda', 'kommunal', NOW(), NOW());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gymnasiums_city ON gymnasiums(city);
CREATE INDEX IF NOT EXISTS idx_gymnasiums_type ON gymnasiums(type);
CREATE INDEX IF NOT EXISTS idx_gymnasiums_name ON gymnasiums(name);

-- Verify insertion
SELECT COUNT(*) as total_schools FROM gymnasiums;
SELECT city, COUNT(*) as school_count FROM gymnasiums GROUP BY city ORDER BY school_count DESC LIMIT 20;
