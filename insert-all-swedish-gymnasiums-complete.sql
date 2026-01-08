-- Complete Swedish Gymnasium Schools
-- Synced with constants/gymnasiums.ts
-- Only includes verified gymnasium schools (no elementary or middle schools)
-- Last updated: 2026-01-08

-- Clear existing data
TRUNCATE TABLE gymnasiums CASCADE;

-- Insert all verified gymnasium schools
INSERT INTO gymnasiums (id, name, city, type, created_at, updated_at) VALUES

-- =====================================================
-- STOCKHOLM REGION
-- =====================================================

-- Stockholm Stad - Kommunala
(gen_random_uuid(), 'Blackebergs gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Bromma gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Enskede gårds gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Farsta gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Globala gymnasiet', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Kungsholmens gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Kulturama gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Norra Real', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Östra Real', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'S:t Eriks gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Södra Latins gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Thorildsplans gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Stockholms Idrottsgymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Stockholms hotell- och restaurangskola', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Frans Schartaus gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Anna Whitlocks gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Kärrtorps gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Skarpnäcks gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Åsö gymnasium', 'Stockholm', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Bernadottegymnasiet', 'Stockholm', 'public', NOW(), NOW()),

-- Stockholm - Friskolor
(gen_random_uuid(), 'Viktor Rydberg Gymnasium Odenplan', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Viktor Rydberg Gymnasium Jarlaplan', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Enskilda gymnasiet', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Stockholms Enskilda Gymnasium', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Stockholm City', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Norra', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Gamla Stan', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Stockholm City', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Södertörn', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'LBS Kreativa Gymnasiet Stockholm', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Sjölins Gymnasium Södermalm', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Sjölins Gymnasium Vasastan', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'ProCivitas Privata Gymnasium Stockholm', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Rytmus Musikergymnasiet Stockholm', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Fredrika Bremer-gymnasiet', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Thoren Business School Stockholm', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Stockholm', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Stockholms fria gymnasium', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Medborgarskolan gymnasium Stockholm', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Klara gymnasium Stockholm', 'Stockholm', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Hermods gymnasium Stockholm', 'Stockholm', 'private', NOW(), NOW()),

-- Solna
(gen_random_uuid(), 'Solna gymnasium', 'Solna', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Washington Internship High School', 'Solna', 'private', NOW(), NOW()),

-- Sundbyberg
(gen_random_uuid(), 'Sundbybergs gymnasium', 'Sundbyberg', 'public', NOW(), NOW()),

-- Nacka
(gen_random_uuid(), 'Nacka gymnasium', 'Nacka', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Sickla gymnasium', 'Nacka', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Design & Construction College', 'Nacka', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Viktor Rydberg Gymnasium Nacka', 'Nacka', 'private', NOW(), NOW()),

-- Danderyd
(gen_random_uuid(), 'Danderyds gymnasium', 'Danderyd', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Viktor Rydberg Gymnasium Djursholm', 'Danderyd', 'private', NOW(), NOW()),

-- Täby
(gen_random_uuid(), 'Åva gymnasium', 'Täby', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Täby Enskilda gymnasium', 'Täby', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Tibble Fristående gymnasium', 'Täby', 'private', NOW(), NOW()),

-- Lidingö
(gen_random_uuid(), 'Hersby gymnasium', 'Lidingö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Gångsätra gymnasium', 'Lidingö', 'public', NOW(), NOW()),

-- Sollentuna
(gen_random_uuid(), 'Rudbecksskolan', 'Sollentuna', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Sollentuna gymnasium', 'Sollentuna', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Sollentuna', 'Sollentuna', 'private', NOW(), NOW()),

-- Järfälla
(gen_random_uuid(), 'Jakobsbergs gymnasium', 'Järfälla', 'public', NOW(), NOW()),
(gen_random_uuid(), 'IT-Gymnasiet Jakobsberg', 'Järfälla', 'private', NOW(), NOW()),

-- Upplands Väsby
(gen_random_uuid(), 'Vilunda gymnasium', 'Upplands Väsby', 'public', NOW(), NOW()),

-- Sigtuna
(gen_random_uuid(), 'Arlandagymnasiet', 'Sigtuna', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Sigtunaskolan Humanistiska Läroverket', 'Sigtuna', 'private', NOW(), NOW()),

-- Vallentuna
(gen_random_uuid(), 'Vallentuna gymnasium', 'Vallentuna', 'public', NOW(), NOW()),

-- Norrtälje
(gen_random_uuid(), 'Rodengymnasiet', 'Norrtälje', 'public', NOW(), NOW()),

-- Huddinge
(gen_random_uuid(), 'Huddinge gymnasium', 'Huddinge', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Sjödalsgymnasiet', 'Huddinge', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Södertörns friskola', 'Huddinge', 'private', NOW(), NOW()),

-- Botkyrka
(gen_random_uuid(), 'Tumba gymnasium', 'Botkyrka', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Botkyrka gymnasium', 'Botkyrka', 'public', NOW(), NOW()),

-- Haninge
(gen_random_uuid(), 'Fredrika Bremergymnasiet', 'Haninge', 'public', NOW(), NOW()),

-- Södertälje
(gen_random_uuid(), 'Torekällgymnasiet', 'Södertälje', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Täljegymnasiet', 'Södertälje', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Fornbygymnasiet', 'Södertälje', 'public', NOW(), NOW()),

-- Nynäshamn
(gen_random_uuid(), 'Nynäshamns gymnasium', 'Nynäshamn', 'public', NOW(), NOW()),

-- Tyresö
(gen_random_uuid(), 'Tyresö gymnasium', 'Tyresö', 'public', NOW(), NOW()),

-- =====================================================
-- GÖTEBORG REGION
-- =====================================================

-- Göteborg - Kommunala
(gen_random_uuid(), 'Hvitfeldtska gymnasiet', 'Göteborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Schillerska gymnasiet', 'Göteborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Polhemsgymnasiet', 'Göteborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Burgårdens utbildningscentrum', 'Göteborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Angeredsgymnasiet', 'Göteborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Katrinelundsgymnasiet', 'Göteborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Lindholmens tekniska gymnasium', 'Göteborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Bräckegymnasiet', 'Göteborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Ester Mosessons gymnasium', 'Göteborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Munkebäcksgymnasiet', 'Göteborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Donnergymnasiet', 'Göteborg', 'public', NOW(), NOW()),

-- Göteborg - Friskolor
(gen_random_uuid(), 'Göteborgs Högre Samskola', 'Göteborg', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Göteborg', 'Göteborg', 'private', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Göteborg', 'Göteborg', 'private', NOW(), NOW()),
(gen_random_uuid(), 'LBS Kreativa Gymnasiet Göteborg', 'Göteborg', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Praktiska Gymnasiet Göteborg', 'Göteborg', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Göteborg', 'Göteborg', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Rytmus Musikergymnasiet Göteborg', 'Göteborg', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Thoren Business School Göteborg', 'Göteborg', 'private', NOW(), NOW()),
(gen_random_uuid(), 'IT-Gymnasiet Göteborg', 'Göteborg', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Drottning Blankas Gymnasieskola Göteborg', 'Göteborg', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Mediegymnasiet Göteborg', 'Göteborg', 'private', NOW(), NOW()),

-- Mölndal
(gen_random_uuid(), 'Fässbergsgymnasiet', 'Mölndal', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Krokslättsgymnasiet', 'Mölndal', 'public', NOW(), NOW()),

-- Partille
(gen_random_uuid(), 'Partille gymnasium', 'Partille', 'public', NOW(), NOW()),

-- Kungsbacka
(gen_random_uuid(), 'Elof Lindälvs gymnasium', 'Kungsbacka', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Aranäsgymnasiet', 'Kungsbacka', 'public', NOW(), NOW()),

-- Lerum
(gen_random_uuid(), 'Lerums gymnasium', 'Lerum', 'public', NOW(), NOW()),

-- Alingsås
(gen_random_uuid(), 'Alströmergymnasiet', 'Alingsås', 'public', NOW(), NOW()),

-- =====================================================
-- MALMÖ REGION (SKÅNE)
-- =====================================================

-- Malmö - Kommunala
(gen_random_uuid(), 'Malmö Latinskola', 'Malmö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Malmö Borgarskola', 'Malmö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Pauliskolan', 'Malmö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Heleneholms gymnasium', 'Malmö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'S:t Petri skola', 'Malmö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Malmö Idrottsgymnasium', 'Malmö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Universitetsholmens gymnasium', 'Malmö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Norra Sorgenfri gymnasium', 'Malmö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Jörgen Kocks gymnasium', 'Malmö', 'public', NOW(), NOW()),

-- Malmö - Friskolor
(gen_random_uuid(), 'Jensen Gymnasium Malmö', 'Malmö', 'private', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Malmö', 'Malmö', 'private', NOW(), NOW()),
(gen_random_uuid(), 'LBS Kreativa Gymnasiet Malmö', 'Malmö', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Praktiska Gymnasiet Malmö', 'Malmö', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Malmö', 'Malmö', 'private', NOW(), NOW()),
(gen_random_uuid(), 'ProCivitas Privata Gymnasium Malmö', 'Malmö', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Thoren Business School Malmö', 'Malmö', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Drottning Blankas Gymnasieskola Malmö', 'Malmö', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Rytmus Musikergymnasiet Malmö', 'Malmö', 'private', NOW(), NOW()),
(gen_random_uuid(), 'IT-Gymnasiet Malmö', 'Malmö', 'private', NOW(), NOW()),

-- Lund
(gen_random_uuid(), 'Katedralskolan Lund', 'Lund', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Spyken', 'Lund', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Polhemskolan Lund', 'Lund', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Vipan', 'Lund', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Lund', 'Lund', 'private', NOW(), NOW()),

-- Helsingborg
(gen_random_uuid(), 'Olympiaskolan', 'Helsingborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Nicolaiskolan', 'Helsingborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Rönnowska skolan', 'Helsingborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Filbornaskolan', 'Helsingborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Wieselgrensskolan', 'Helsingborg', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Helsingborg', 'Helsingborg', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Helsingborg', 'Helsingborg', 'private', NOW(), NOW()),

-- Landskrona
(gen_random_uuid(), 'Lärande i Landskrona', 'Landskrona', 'public', NOW(), NOW()),

-- Trelleborg
(gen_random_uuid(), 'Söderslättsgymnasiet', 'Trelleborg', 'public', NOW(), NOW()),

-- Ystad
(gen_random_uuid(), 'Österportgymnasiet', 'Ystad', 'public', NOW(), NOW()),

-- Kristianstad
(gen_random_uuid(), 'Wendesgymnasiet', 'Kristianstad', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Söderportgymnasiet', 'Kristianstad', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Christian IV:s gymnasium', 'Kristianstad', 'public', NOW(), NOW()),

-- Ängelholm
(gen_random_uuid(), 'Rönnegymnasiet', 'Ängelholm', 'public', NOW(), NOW()),

-- Eslöv
(gen_random_uuid(), 'Eslövs gymnasium', 'Eslöv', 'public', NOW(), NOW()),

-- Hässleholm
(gen_random_uuid(), 'Hässleholms gymnasium', 'Hässleholm', 'public', NOW(), NOW()),

-- =====================================================
-- UPPSALA REGION
-- =====================================================

(gen_random_uuid(), 'Katedralskolan Uppsala', 'Uppsala', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Fyrisskolan', 'Uppsala', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Rosendalsgymnasiet', 'Uppsala', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Lundellska skolan', 'Uppsala', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Bolandgymnasiet', 'Uppsala', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Celsiusskolan', 'Uppsala', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Uppsala', 'Uppsala', 'private', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Uppsala', 'Uppsala', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Uppsala', 'Uppsala', 'private', NOW(), NOW()),
(gen_random_uuid(), 'LBS Kreativa Gymnasiet Uppsala', 'Uppsala', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Thoren Business School Uppsala', 'Uppsala', 'private', NOW(), NOW()),

-- =====================================================
-- VÄSTRA GÖTALAND
-- =====================================================

-- Borås
(gen_random_uuid(), 'Sven Eriksonsgymnasiet', 'Borås', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Almåsgymnasiet', 'Borås', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Bäckängsgymnasiet', 'Borås', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Viskastrandsgymnasiet', 'Borås', 'public', NOW(), NOW()),

-- Trollhättan
(gen_random_uuid(), 'Nils Ericsongymnasiet', 'Trollhättan', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Magnus Åbergsgymnasiet', 'Trollhättan', 'public', NOW(), NOW()),

-- Uddevalla
(gen_random_uuid(), 'Uddevalla gymnasieskola', 'Uddevalla', 'public', NOW(), NOW()),

-- Skövde
(gen_random_uuid(), 'Kavelbro gymnasium', 'Skövde', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Västerhöjdsgymnasiet', 'Skövde', 'public', NOW(), NOW()),

-- Lidköping
(gen_random_uuid(), 'De la Gardiegymnasiet', 'Lidköping', 'public', NOW(), NOW()),

-- Mariestad
(gen_random_uuid(), 'Vadsbogymnasiet', 'Mariestad', 'public', NOW(), NOW()),

-- Falköping
(gen_random_uuid(), 'Ållebergsgymnasiet', 'Falköping', 'public', NOW(), NOW()),

-- Varberg
(gen_random_uuid(), 'Peder Skrivares skola', 'Varberg', 'public', NOW(), NOW()),

-- Falkenberg
(gen_random_uuid(), 'Falkenbergs gymnasium', 'Falkenberg', 'public', NOW(), NOW()),

-- =====================================================
-- ÖSTERGÖTLAND
-- =====================================================

-- Linköping
(gen_random_uuid(), 'Katedralskolan Linköping', 'Linköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Berzeliusskolan', 'Linköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Birgittaskolan', 'Linköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Folkungaskolan', 'Linköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Linköping', 'Linköping', 'private', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Linköping', 'Linköping', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Linköping', 'Linköping', 'private', NOW(), NOW()),

-- Norrköping
(gen_random_uuid(), 'De Geergymnasiet', 'Norrköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Ebersteinska gymnasiet', 'Norrköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Hagagymnasiet', 'Norrköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Norrköping', 'Norrköping', 'private', NOW(), NOW()),

-- Motala
(gen_random_uuid(), 'Platengymnasiet', 'Motala', 'public', NOW(), NOW()),

-- =====================================================
-- ÖREBRO LÄN
-- =====================================================

(gen_random_uuid(), 'Karolinska gymnasiet', 'Örebro', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Virginska gymnasiet', 'Örebro', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Risbergska gymnasiet', 'Örebro', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Rudbecksskolan Örebro', 'Örebro', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Tullängsskolan', 'Örebro', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Örebro', 'Örebro', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Örebro', 'Örebro', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Praktiska Gymnasiet Örebro', 'Örebro', 'private', NOW(), NOW()),

-- Karlskoga
(gen_random_uuid(), 'Möckelngymnasiet', 'Karlskoga', 'public', NOW(), NOW()),

-- =====================================================
-- VÄSTMANLAND
-- =====================================================

-- Västerås
(gen_random_uuid(), 'Rudbeckianska gymnasiet', 'Västerås', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Carlforsska gymnasiet', 'Västerås', 'public', NOW(), NOW()),
(gen_random_uuid(), 'John Bauergymnasiet Västerås', 'Västerås', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Widénska gymnasiet', 'Västerås', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Västerås', 'Västerås', 'private', NOW(), NOW()),
(gen_random_uuid(), 'IT-Gymnasiet Västerås', 'Västerås', 'private', NOW(), NOW()),

-- Sala
(gen_random_uuid(), 'Kungsängsskolan', 'Sala', 'public', NOW(), NOW()),

-- =====================================================
-- SÖDERMANLAND
-- =====================================================

-- Eskilstuna
(gen_random_uuid(), 'Rekarnegymnasiet', 'Eskilstuna', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Carl Engströmgymnasiet', 'Eskilstuna', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Rinmangymnasiet', 'Eskilstuna', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Eskilstuna', 'Eskilstuna', 'private', NOW(), NOW()),

-- Nyköping
(gen_random_uuid(), 'Nyköpings gymnasium', 'Nyköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Gripengymnasiet', 'Nyköping', 'public', NOW(), NOW()),

-- Strängnäs
(gen_random_uuid(), 'Thomasgymnasiet', 'Strängnäs', 'public', NOW(), NOW()),

-- Katrineholm
(gen_random_uuid(), 'Lindengymnasiet', 'Katrineholm', 'public', NOW(), NOW()),

-- =====================================================
-- JÖNKÖPINGS LÄN
-- =====================================================

-- Jönköping
(gen_random_uuid(), 'Per Brahegymnasiet', 'Jönköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Sandagymnasiet', 'Jönköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Bäckadalsgymnasiet', 'Jönköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Erik Dahlbergsgymnasiet', 'Jönköping', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Jönköping', 'Jönköping', 'private', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Jönköping', 'Jönköping', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Kunskapsgymnasiet Jönköping', 'Jönköping', 'private', NOW(), NOW()),

-- Värnamo
(gen_random_uuid(), 'Finnvedens gymnasium', 'Värnamo', 'public', NOW(), NOW()),

-- Nässjö
(gen_random_uuid(), 'Brinellgymnasiet', 'Nässjö', 'public', NOW(), NOW()),

-- =====================================================
-- KRONOBERGS LÄN
-- =====================================================

-- Växjö
(gen_random_uuid(), 'Katedralskolan Växjö', 'Växjö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Kungsmadskolan', 'Växjö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Teknikum', 'Växjö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Allbo lärcenter', 'Växjö', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Växjö', 'Växjö', 'private', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Växjö', 'Växjö', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Praktiska Gymnasiet Växjö', 'Växjö', 'private', NOW(), NOW()),

-- Ljungby
(gen_random_uuid(), 'Sunnerbogymnasiet', 'Ljungby', 'public', NOW(), NOW()),

-- =====================================================
-- KALMAR LÄN
-- =====================================================

-- Kalmar
(gen_random_uuid(), 'Stagneliusskolan', 'Kalmar', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Lars Kaggskolan', 'Kalmar', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Jenny Nyströmskolan', 'Kalmar', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Kalmar', 'Kalmar', 'private', NOW(), NOW()),

-- Oskarshamn
(gen_random_uuid(), 'Oscarsgymnasiet', 'Oskarshamn', 'public', NOW(), NOW()),

-- Västervik
(gen_random_uuid(), 'Västerviks gymnasium', 'Västervik', 'public', NOW(), NOW()),

-- =====================================================
-- BLEKINGE LÄN
-- =====================================================

-- Karlskrona
(gen_random_uuid(), 'Chapmangymnasiet', 'Karlskrona', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Törnströmska gymnasiet', 'Karlskrona', 'public', NOW(), NOW()),

-- Karlshamn
(gen_random_uuid(), 'Väggaskolan', 'Karlshamn', 'public', NOW(), NOW()),

-- =====================================================
-- GOTLAND
-- =====================================================

(gen_random_uuid(), 'Wisbygymnasiet', 'Visby', 'public', NOW(), NOW()),

-- =====================================================
-- HALLAND
-- =====================================================

-- Halmstad
(gen_random_uuid(), 'Kattegattgymnasiet', 'Halmstad', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Sannarpsgymnasiet', 'Halmstad', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Sturegymnasiet', 'Halmstad', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Halmstad', 'Halmstad', 'private', NOW(), NOW()),

-- Laholm
(gen_random_uuid(), 'Osbecksgymnasiet', 'Laholm', 'public', NOW(), NOW()),

-- =====================================================
-- VÄRMLAND
-- =====================================================

-- Karlstad
(gen_random_uuid(), 'Tingvalla gymnasium', 'Karlstad', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Sundsta-Älvkullegymnasiet', 'Karlstad', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Nobelgymnasiet', 'Karlstad', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Karlstad', 'Karlstad', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Karlstad', 'Karlstad', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Drottning Blankas Gymnasieskola Karlstad', 'Karlstad', 'private', NOW(), NOW()),

-- Arvika
(gen_random_uuid(), 'Solbergagymnasiet', 'Arvika', 'public', NOW(), NOW()),

-- Kristinehamn
(gen_random_uuid(), 'Brogårdsgymnasiet', 'Kristinehamn', 'public', NOW(), NOW()),

-- =====================================================
-- DALARNA
-- =====================================================

-- Falun
(gen_random_uuid(), 'Lugnetgymnasiet', 'Falun', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Kristine gymnasium', 'Falun', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Soltorgsgymnasiet', 'Falun', 'public', NOW(), NOW()),

-- Borlänge
(gen_random_uuid(), 'Hagaskolan', 'Borlänge', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Erikslunds gymnasium', 'Borlänge', 'public', NOW(), NOW()),

-- Mora
(gen_random_uuid(), 'Moragymnasiet', 'Mora', 'public', NOW(), NOW()),

-- Ludvika
(gen_random_uuid(), 'Ludvika gymnasium', 'Ludvika', 'public', NOW(), NOW()),

-- Leksand
(gen_random_uuid(), 'Leksands gymnasium', 'Leksand', 'public', NOW(), NOW()),

-- =====================================================
-- GÄVLEBORG
-- =====================================================

-- Gävle
(gen_random_uuid(), 'Vasaskolan', 'Gävle', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Polhemsskolan Gävle', 'Gävle', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Borgarskolan', 'Gävle', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Gävle', 'Gävle', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Gävle', 'Gävle', 'private', NOW(), NOW()),

-- Sandviken
(gen_random_uuid(), 'Bessemerskolan', 'Sandviken', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Göranssonska skolan', 'Sandviken', 'private', NOW(), NOW()),

-- Hudiksvall
(gen_random_uuid(), 'Bromangymnasiet', 'Hudiksvall', 'public', NOW(), NOW()),

-- Bollnäs
(gen_random_uuid(), 'Torsbergsgymnasiet', 'Bollnäs', 'public', NOW(), NOW()),

-- Söderhamn
(gen_random_uuid(), 'Staffangymnasiet', 'Söderhamn', 'public', NOW(), NOW()),

-- =====================================================
-- VÄSTERNORRLAND
-- =====================================================

-- Sundsvall
(gen_random_uuid(), 'Hedbergska skolan', 'Sundsvall', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Västermalms skola', 'Sundsvall', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Sundsvalls gymnasium', 'Sundsvall', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Sundsvall', 'Sundsvall', 'private', NOW(), NOW()),

-- Härnösand
(gen_random_uuid(), 'Härnösands gymnasium', 'Härnösand', 'public', NOW(), NOW()),

-- Örnsköldsvik
(gen_random_uuid(), 'Nolaskolan', 'Örnsköldsvik', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Parkskolan', 'Örnsköldsvik', 'public', NOW(), NOW()),

-- Kramfors
(gen_random_uuid(), 'Ådalsskolan', 'Kramfors', 'public', NOW(), NOW()),

-- =====================================================
-- JÄMTLAND
-- =====================================================

-- Östersund
(gen_random_uuid(), 'Wargentin gymnasium', 'Östersund', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Palmcrantzskolan', 'Östersund', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Jämtlands gymnasium', 'Östersund', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Östersund', 'Östersund', 'private', NOW(), NOW()),

-- =====================================================
-- VÄSTERBOTTEN
-- =====================================================

-- Umeå
(gen_random_uuid(), 'Dragonskolan', 'Umeå', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Midgårdsskolan', 'Umeå', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Fridhemsgymnasiet', 'Umeå', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Forslundagymnasiet', 'Umeå', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Umeå', 'Umeå', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Jensen Gymnasium Umeå', 'Umeå', 'private', NOW(), NOW()),
(gen_random_uuid(), 'Thoren Business School Umeå', 'Umeå', 'private', NOW(), NOW()),

-- Skellefteå
(gen_random_uuid(), 'Anderstorpsgymnasiet', 'Skellefteå', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Balderskolan', 'Skellefteå', 'public', NOW(), NOW()),

-- Lycksele
(gen_random_uuid(), 'Tannbergsskolan', 'Lycksele', 'public', NOW(), NOW()),

-- =====================================================
-- NORRBOTTEN
-- =====================================================

-- Luleå
(gen_random_uuid(), 'Luleå gymnasieskola', 'Luleå', 'public', NOW(), NOW()),
(gen_random_uuid(), 'Björkskatan gymnasium', 'Luleå', 'public', NOW(), NOW()),
(gen_random_uuid(), 'NTI Gymnasiet Luleå', 'Luleå', 'private', NOW(), NOW()),

-- Piteå
(gen_random_uuid(), 'Strömbackaskolan', 'Piteå', 'public', NOW(), NOW()),

-- Boden
(gen_random_uuid(), 'Björknäsgymnasiet', 'Boden', 'public', NOW(), NOW()),

-- Kiruna
(gen_random_uuid(), 'Hjalmar Lundbohmsskolan', 'Kiruna', 'public', NOW(), NOW()),

-- Gällivare
(gen_random_uuid(), 'Gällivare gymnasium', 'Gällivare', 'public', NOW(), NOW()),

-- Kalix
(gen_random_uuid(), 'Kalix Naturbruksgymnasium', 'Kalix', 'public', NOW(), NOW()),

-- Haparanda
(gen_random_uuid(), 'Tornedalsskolan', 'Haparanda', 'public', NOW(), NOW());

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_gymnasiums_city ON gymnasiums(city);
CREATE INDEX IF NOT EXISTS idx_gymnasiums_type ON gymnasiums(type);
CREATE INDEX IF NOT EXISTS idx_gymnasiums_name ON gymnasiums(name);

-- Verify insertion
SELECT COUNT(*) as total_schools FROM gymnasiums;
SELECT city, COUNT(*) as school_count FROM gymnasiums GROUP BY city ORDER BY school_count DESC LIMIT 20;
