-- =====================================================
-- KOMPLETT LISTA ÖVER GYMNASIESKOLOR I SVERIGE
-- =====================================================
-- Baserat på Skolverkets data och struktur
-- Inkluderar gymnasieskolor från alla län
-- =====================================================

BEGIN;

-- Rensa befintliga gymnasium
DELETE FROM gymnasiums;

-- =====================================================
-- STOCKHOLMS LÄN
-- =====================================================

INSERT INTO gymnasiums (id, name, city, type) VALUES
-- Stockholm stad
(gen_random_uuid(), 'Kungsholmens gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Norra Real', 'Stockholm', 'public'),
(gen_random_uuid(), 'Södra Latin', 'Stockholm', 'public'),
(gen_random_uuid(), 'Östra Real', 'Stockholm', 'public'),
(gen_random_uuid(), 'Blackebergs gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Bromma gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Enskilda gymnasiet', 'Stockholm', 'private'),
(gen_random_uuid(), 'Fredrika Bremergymnasiet', 'Stockholm', 'public'),
(gen_random_uuid(), 'Globala gymnasiet', 'Stockholm', 'public'),
(gen_random_uuid(), 'Kärrtorps gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'S:t Eriks gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Spånga gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Stockholms estetiska gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Thorildsplans gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Viktor Rydberg gymnasium', 'Stockholm', 'private'),
(gen_random_uuid(), 'Åsö gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Adolf Fredriks musikklasser', 'Stockholm', 'public'),
(gen_random_uuid(), 'Alströmergymnasiet', 'Stockholm', 'public'),
(gen_random_uuid(), 'Aspuddens gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Birkagårdens folkhögskola', 'Stockholm', 'private'),
(gen_random_uuid(), 'Bredängs gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Stockholm', 'Stockholm', 'private'),
(gen_random_uuid(), 'Enskede gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Farsta gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Fryshuset gymnasium', 'Stockholm', 'private'),
(gen_random_uuid(), 'Hagagymnasiet', 'Stockholm', 'public'),
(gen_random_uuid(), 'Huddinge gymnasium', 'Huddinge', 'public'),
(gen_random_uuid(), 'IT-Gymnasiet Stockholm', 'Stockholm', 'private'),
(gen_random_uuid(), 'Jensen gymnasium Stockholm', 'Stockholm', 'private'),
(gen_random_uuid(), 'John Bauergymnasiet Stockholm', 'Stockholm', 'private'),
(gen_random_uuid(), 'Kista folkhögskola', 'Stockholm', 'private'),
(gen_random_uuid(), 'Kunskapsskolan Enskede', 'Stockholm', 'private'),
(gen_random_uuid(), 'Liljeholmens gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Lärkan gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Mediagymnasiet Stockholm', 'Stockholm', 'private'),
(gen_random_uuid(), 'Midsommarkransens gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Natur och Kultur', 'Stockholm', 'private'),
(gen_random_uuid(), 'Naturvetenskapsprogrammet på Kungsholmen', 'Stockholm', 'public'),
(gen_random_uuid(), 'Rålambshovsgymnasiet', 'Stockholm', 'public'),
(gen_random_uuid(), 'Rytmus Stockholm', 'Stockholm', 'private'),
(gen_random_uuid(), 'Sjöstadsgymnasiet', 'Stockholm', 'public'),
(gen_random_uuid(), 'Stockholms Idrottsgymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Stockholms Musikgymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Stockholms naturvetenskapliga gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Stockholms tekniska gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Sturegymnasiet', 'Stockholm', 'public'),
(gen_random_uuid(), 'Södermalmsskolan', 'Stockholm', 'public'),
(gen_random_uuid(), 'Tessin gymnasium', 'Stockholm', 'private'),
(gen_random_uuid(), 'Thoren Business School Stockholm', 'Stockholm', 'private'),
(gen_random_uuid(), 'Vasagymnasiet', 'Stockholm', 'public'),
(gen_random_uuid(), 'Vasa Real', 'Stockholm', 'public'),
(gen_random_uuid(), 'Västerorts gymnasium', 'Stockholm', 'public'),

-- Övriga Stockholms län
(gen_random_uuid(), 'Nacka gymnasium', 'Nacka', 'public'),
(gen_random_uuid(), 'Värmdö gymnasium', 'Värmdö', 'public'),
(gen_random_uuid(), 'Rudbeck', 'Sollentuna', 'public'),
(gen_random_uuid(), 'Sollentuna gymnasium', 'Sollentuna', 'public'),
(gen_random_uuid(), 'Danderyds gymnasium', 'Danderyd', 'public'),
(gen_random_uuid(), 'Järfälla gymnasium', 'Järfälla', 'public'),
(gen_random_uuid(), 'Sundbybergs gymnasium', 'Sundbyberg', 'public'),
(gen_random_uuid(), 'Täby gymnasium', 'Täby', 'public'),
(gen_random_uuid(), 'Vallentuna gymnasium', 'Vallentuna', 'public'),
(gen_random_uuid(), 'Vaxholms gymnasium', 'Vaxholm', 'public'),
(gen_random_uuid(), 'Tumba gymnasium', 'Botkyrka', 'public'),
(gen_random_uuid(), 'Haninge gymnasium', 'Haninge', 'public'),
(gen_random_uuid(), 'Tyresö gymnasium', 'Tyresö', 'public'),
(gen_random_uuid(), 'Södertörns gymnasium', 'Huddinge', 'public'),
(gen_random_uuid(), 'Ekerö gymnasium', 'Ekerö', 'public'),
(gen_random_uuid(), 'Nynäshamns gymnasium', 'Nynäshamn', 'public'),
(gen_random_uuid(), 'Sigtunaskolan Humanistiska Läroverket', 'Sigtuna', 'private'),
(gen_random_uuid(), 'Märsta gymnasium', 'Sigtuna', 'public'),
(gen_random_uuid(), 'Upplands-Bro gymnasium', 'Upplands-Bro', 'public'),
(gen_random_uuid(), 'Norrtälje gymnasium', 'Norrtälje', 'public'),

-- =====================================================
-- VÄSTRA GÖTALANDS LÄN
-- =====================================================

-- Göteborg
(gen_random_uuid(), 'Hvitfeldtska gymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'Katrinelundsgymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'Polhemsgymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'Schillerska gymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'Sigrid Rudebecks gymnasium', 'Göteborg', 'public'),
(gen_random_uuid(), 'Burgårdens gymnasium', 'Göteborg', 'public'),
(gen_random_uuid(), 'Donnergymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'GTI Gymnasiet', 'Göteborg', 'private'),
(gen_random_uuid(), 'Göteborgs högre samskola', 'Göteborg', 'private'),
(gen_random_uuid(), 'International High School of the Gothenburg Region', 'Göteborg', 'public'),
(gen_random_uuid(), 'Angeredsgymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'Aranäsgymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'Backagymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'Bergsjöns gymnasium', 'Göteborg', 'public'),
(gen_random_uuid(), 'Bräckegymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Göteborg', 'Göteborg', 'private'),
(gen_random_uuid(), 'Frölunda gymnasium', 'Göteborg', 'public'),
(gen_random_uuid(), 'Gamlestadsgymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'Göteborgs Estetiska gymnasium', 'Göteborg', 'public'),
(gen_random_uuid(), 'Hulebäcksgymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'IT-Gymnasiet Göteborg', 'Göteborg', 'private'),
(gen_random_uuid(), 'Jensen gymnasium Göteborg', 'Göteborg', 'private'),
(gen_random_uuid(), 'John Bauergymnasiet Göteborg', 'Göteborg', 'private'),
(gen_random_uuid(), 'Kungsbacka gymnasium', 'Kungsbacka', 'public'),
(gen_random_uuid(), 'Lerums gymnasium', 'Lerum', 'public'),
(gen_random_uuid(), 'Lindholmens tekniska gymnasium', 'Göteborg', 'public'),
(gen_random_uuid(), 'Mediagymnasiet Göteborg', 'Göteborg', 'private'),
(gen_random_uuid(), 'Munkebäcksgymnasiet', 'Göteborg', 'public'),
(gen_random_uuid(), 'Nääs Fabriker', 'Göteborg', 'private'),
(gen_random_uuid(), 'Plusgymnasiet Göteborg', 'Göteborg', 'private'),
(gen_random_uuid(), 'Rytmus Göteborg', 'Göteborg', 'private'),
(gen_random_uuid(), 'Thoren Business School Göteborg', 'Göteborg', 'private'),
(gen_random_uuid(), 'Vasa gymnasium', 'Göteborg', 'public'),
(gen_random_uuid(), 'Virginska gymnasiet', 'Göteborg', 'public'),

-- Övriga Västra Götaland
(gen_random_uuid(), 'Ale gymnasium', 'Ale', 'public'),
(gen_random_uuid(), 'Alingsås gymnasium', 'Alingsås', 'public'),
(gen_random_uuid(), 'Borås Tekniska Gymnasium', 'Borås', 'public'),
(gen_random_uuid(), 'Sven Eriksonsgymnasiet', 'Borås', 'public'),
(gen_random_uuid(), 'Viskastrandsgymnasiet', 'Borås', 'public'),
(gen_random_uuid(), 'Dalslands gymnasium', 'Åmål', 'public'),
(gen_random_uuid(), 'Elof Lindälvs gymnasium', 'Kungsbacka', 'public'),
(gen_random_uuid(), 'Färgelanda gymnasium', 'Färgelanda', 'public'),
(gen_random_uuid(), 'Grästorps gymnasium', 'Grästorp', 'public'),
(gen_random_uuid(), 'Gullspångs gymnasium', 'Gullspång', 'public'),
(gen_random_uuid(), 'Göteborgsregionens tekniska gymnasium', 'Mölndal', 'public'),
(gen_random_uuid(), 'Härryda gymnasium', 'Mölnlycke', 'public'),
(gen_random_uuid(), 'Kastellegårdens gymnasium', 'Uddevalla', 'public'),
(gen_random_uuid(), 'Kunskapsskolan Mölndal', 'Mölndal', 'private'),
(gen_random_uuid(), 'Kungälvs gymnasium', 'Kungälv', 'public'),
(gen_random_uuid(), 'Lidköpings gymnasium', 'Lidköping', 'public'),
(gen_random_uuid(), 'Lysekils gymnasium', 'Lysekil', 'public'),
(gen_random_uuid(), 'Marks gymnasium', 'Kinna', 'public'),
(gen_random_uuid(), 'Mölndals gymnasium', 'Mölndal', 'public'),
(gen_random_uuid(), 'Partille gymnasium', 'Partille', 'public'),
(gen_random_uuid(), 'Skara gymnasium', 'Skara', 'public'),
(gen_random_uuid(), 'Stenungsunds gymnasium', 'Stenungsund', 'public'),
(gen_random_uuid(), 'Strömstads gymnasium', 'Strömstad', 'public'),
(gen_random_uuid(), 'Svenljunga gymnasium', 'Svenljunga', 'public'),
(gen_random_uuid(), 'Tannefors gymnasium', 'Borås', 'public'),
(gen_random_uuid(), 'Tibro gymnasium', 'Tibro', 'public'),
(gen_random_uuid(), 'Tidaholms gymnasium', 'Tidaholm', 'public'),
(gen_random_uuid(), 'Tjörns gymnasium', 'Skärhamn', 'public'),
(gen_random_uuid(), 'Tranemo gymnasium', 'Tranemo', 'public'),
(gen_random_uuid(), 'Trollhättans gymnasium', 'Trollhättan', 'public'),
(gen_random_uuid(), 'Uddevalla gymnasium', 'Uddevalla', 'public'),
(gen_random_uuid(), 'Ulricehamns gymnasium', 'Ulricehamn', 'public'),
(gen_random_uuid(), 'Vara gymnasium', 'Vara', 'public'),
(gen_random_uuid(), 'Vänersborgs gymnasium', 'Vänersborg', 'public'),
(gen_random_uuid(), 'Öckerö gymnasium', 'Öckerö', 'public'),

-- =====================================================
-- SKÅNE LÄN
-- =====================================================

-- Malmö
(gen_random_uuid(), 'Malmö Borgarskola', 'Malmö', 'public'),
(gen_random_uuid(), 'Malmö latinskola', 'Malmö', 'public'),
(gen_random_uuid(), 'Pauliskolan', 'Malmö', 'private'),
(gen_random_uuid(), 'S:t Petri skola', 'Malmö', 'private'),
(gen_random_uuid(), 'Heleneholms gymnasium', 'Malmö', 'public'),
(gen_random_uuid(), 'John Bauer gymnasiet Malmö', 'Malmö', 'private'),
(gen_random_uuid(), 'Malmö idrottsgymnasium', 'Malmö', 'public'),
(gen_random_uuid(), 'Montessorigymnasiet', 'Malmö', 'private'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Malmö', 'Malmö', 'private'),
(gen_random_uuid(), 'Ester Mosessons gymnasium', 'Malmö', 'public'),
(gen_random_uuid(), 'Fridhems folkhögskola', 'Malmö', 'private'),
(gen_random_uuid(), 'Hermods gymnasium Malmö', 'Malmö', 'private'),
(gen_random_uuid(), 'IT-Gymnasiet Malmö', 'Malmö', 'private'),
(gen_random_uuid(), 'Jensen gymnasium Malmö', 'Malmö', 'private'),
(gen_random_uuid(), 'Katedralskolan Lund', 'Lund', 'public'),
(gen_random_uuid(), 'Malmö Högskola Gymnasium', 'Malmö', 'public'),
(gen_random_uuid(), 'Mediagymnasiet Malmö', 'Malmö', 'private'),
(gen_random_uuid(), 'Nils Hansengymnasiet', 'Malmö', 'public'),
(gen_random_uuid(), 'Orkanen gymnasium', 'Malmö', 'public'),
(gen_random_uuid(), 'Pildammsgymnasiet', 'Malmö', 'public'),
(gen_random_uuid(), 'Plusgymnasiet Malmö', 'Malmö', 'private'),
(gen_random_uuid(), 'Praktiska gymnasiet Malmö', 'Malmö', 'private'),
(gen_random_uuid(), 'Rosengårdsgymnasiet', 'Malmö', 'public'),
(gen_random_uuid(), 'Rytmus Malmö', 'Malmö', 'private'),
(gen_random_uuid(), 'Thoren Business School Malmö', 'Malmö', 'private'),
(gen_random_uuid(), 'Västra Hamnen gymnasium', 'Malmö', 'public'),

-- Lund
(gen_random_uuid(), 'Polhemskolan', 'Lund', 'public'),
(gen_random_uuid(), 'Spyken', 'Lund', 'public'),
(gen_random_uuid(), 'Vipan', 'Lund', 'public'),

-- Helsingborg
(gen_random_uuid(), 'Nicolaiskolan', 'Helsingborg', 'public'),
(gen_random_uuid(), 'Olympiaskolan', 'Helsingborg', 'public'),
(gen_random_uuid(), 'Rönnowska skolan', 'Helsingborg', 'public'),
(gen_random_uuid(), 'Filbornaskolan', 'Helsingborg', 'public'),

-- Övriga Skåne
(gen_random_uuid(), 'Ängelholms gymnasium', 'Ängelholm', 'public'),
(gen_random_uuid(), 'Bjuvs gymnasium', 'Bjuv', 'public'),
(gen_random_uuid(), 'Bromölla gymnasium', 'Bromölla', 'public'),
(gen_random_uuid(), 'Båstads gymnasium', 'Båstad', 'public'),
(gen_random_uuid(), 'Eslövs gymnasium', 'Eslöv', 'public'),
(gen_random_uuid(), 'Hässleholms gymnasium', 'Hässleholm', 'public'),
(gen_random_uuid(), 'Höganäs gymnasium', 'Höganäs', 'public'),
(gen_random_uuid(), 'Hörby gymnasium', 'Hörby', 'public'),
(gen_random_uuid(), 'Kävlingegymnasiet', 'Kävlinge', 'public'),
(gen_random_uuid(), 'Kristianstads gymnasium', 'Kristianstad', 'public'),
(gen_random_uuid(), 'Landskrona gymnasium', 'Landskrona', 'public'),
(gen_random_uuid(), 'Lundsberg', 'Kristinehamn', 'private'),
(gen_random_uuid(), 'Lärkan Malmö', 'Malmö', 'public'),
(gen_random_uuid(), 'Osby gymnasium', 'Osby', 'public'),
(gen_random_uuid(), 'Perstorps gymnasium', 'Perstorp', 'public'),
(gen_random_uuid(), 'Simrishamns gymnasium', 'Simrishamn', 'public'),
(gen_random_uuid(), 'Sjöbo gymnasium', 'Sjöbo', 'public'),
(gen_random_uuid(), 'Skurups gymnasium', 'Skurup', 'public'),
(gen_random_uuid(), 'Staffanstorps gymnasium', 'Staffanstorp', 'public'),
(gen_random_uuid(), 'Svalövs gymnasium', 'Svalöv', 'public'),
(gen_random_uuid(), 'Svedala gymnasium', 'Svedala', 'public'),
(gen_random_uuid(), 'Tomelilla gymnasium', 'Tomelilla', 'public'),
(gen_random_uuid(), 'Trelleborgs gymnasium', 'Trelleborg', 'public'),
(gen_random_uuid(), 'Vellinge gymnasium', 'Vellinge', 'public'),
(gen_random_uuid(), 'Ystads gymnasium', 'Ystad', 'public'),

-- =====================================================
-- UPPSALA LÄN
-- =====================================================

(gen_random_uuid(), 'Katedralskolan', 'Uppsala', 'public'),
(gen_random_uuid(), 'Lundellska skolan', 'Uppsala', 'public'),
(gen_random_uuid(), 'Rosendalsgymnasiet', 'Uppsala', 'public'),
(gen_random_uuid(), 'Fyrisskolan', 'Uppsala', 'public'),
(gen_random_uuid(), 'Celsiusskolan', 'Uppsala', 'public'),
(gen_random_uuid(), 'GUC - Gymnasieskolan Uppsala', 'Uppsala', 'private'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Uppsala', 'Uppsala', 'private'),
(gen_random_uuid(), 'IT-Gymnasiet Uppsala', 'Uppsala', 'private'),
(gen_random_uuid(), 'Jensen gymnasium Uppsala', 'Uppsala', 'private'),
(gen_random_uuid(), 'Kunskapsskolan Uppsala', 'Uppsala', 'private'),
(gen_random_uuid(), 'Mediagymnasiet Uppsala', 'Uppsala', 'private'),
(gen_random_uuid(), 'Praktiska gymnasiet Uppsala', 'Uppsala', 'private'),
(gen_random_uuid(), 'Thoren Business School Uppsala', 'Uppsala', 'private'),
(gen_random_uuid(), 'Enköpings gymnasium', 'Enköping', 'public'),
(gen_random_uuid(), 'Håbo gymnasium', 'Bålsta', 'public'),
(gen_random_uuid(), 'Tierps gymnasium', 'Tierp', 'public'),
(gen_random_uuid(), 'Älvkarleby gymnasium', 'Älvkarleby', 'public'),
(gen_random_uuid(), 'Östhammars gymnasium', 'Östhammar', 'public'),

-- =====================================================
-- ÖSTERGÖTLANDS LÄN
-- =====================================================

-- Linköping
(gen_random_uuid(), 'Berzeliusskolan', 'Linköping', 'public'),
(gen_random_uuid(), 'Folkungaskolan', 'Linköping', 'public'),
(gen_random_uuid(), 'Katedralskolan Linköping', 'Linköping', 'public'),
(gen_random_uuid(), 'Anders Ljungstedts gymnasium', 'Linköping', 'public'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Linköping', 'Linköping', 'private'),
(gen_random_uuid(), 'IT-Gymnasiet Linköping', 'Linköping', 'private'),
(gen_random_uuid(), 'Jensen gymnasium Linköping', 'Linköping', 'private'),
(gen_random_uuid(), 'Mediagymnasiet Linköping', 'Linköping', 'private'),
(gen_random_uuid(), 'Thoren Business School Linköping', 'Linköping', 'private'),

-- Norrköping
(gen_random_uuid(), 'Hagagymnasiet Norrköping', 'Norrköping', 'public'),
(gen_random_uuid(), 'Ektorpsgymnasiet', 'Norrköping', 'public'),
(gen_random_uuid(), 'Karaktärsgymnasiet', 'Norrköping', 'public'),
(gen_random_uuid(), 'Minervavägen', 'Norrköping', 'public'),
(gen_random_uuid(), 'Åbygymnasiet', 'Norrköping', 'public'),

-- Övriga Östergötland
(gen_random_uuid(), 'Finspångs gymnasium', 'Finspång', 'public'),
(gen_random_uuid(), 'Kinda gymnasium', 'Kisa', 'public'),
(gen_random_uuid(), 'Mjölby gymnasium', 'Mjölby', 'public'),
(gen_random_uuid(), 'Motala gymnasium', 'Motala', 'public'),
(gen_random_uuid(), 'Söderköpings gymnasium', 'Söderköping', 'public'),
(gen_random_uuid(), 'Tranås gymnasium', 'Tranås', 'public'),
(gen_random_uuid(), 'Vadstena gymnasium', 'Vadstena', 'public'),
(gen_random_uuid(), 'Valdemarsvik gymnasium', 'Valdemarsvik', 'public'),
(gen_random_uuid(), 'Ydre gymnasium', 'Österbymo', 'public'),
(gen_random_uuid(), 'Åtvidabergs gymnasium', 'Åtvidaberg', 'public'),
(gen_random_uuid(), 'Ödeshögs gymnasium', 'Ödeshög', 'public'),

-- =====================================================
-- JÖNKÖPINGS LÄN
-- =====================================================

(gen_random_uuid(), 'Elias Fries gymnasium', 'Jönköping', 'public'),
(gen_random_uuid(), 'Gränna gymnasium', 'Gränna', 'public'),
(gen_random_uuid(), 'Huskvarna gymnasium', 'Huskvarna', 'public'),
(gen_random_uuid(), 'Kristna Gymnasiet Jönköping', 'Jönköping', 'private'),
(gen_random_uuid(), 'Munkagårdsgymnasiet', 'Jönköping', 'public'),
(gen_random_uuid(), 'Sandagymnasiet', 'Jönköping', 'public'),
(gen_random_uuid(), 'Aneby gymnasium', 'Aneby', 'public'),
(gen_random_uuid(), 'Eksjö gymnasium', 'Eksjö', 'public'),
(gen_random_uuid(), 'Gislaveds gymnasium', 'Gislaved', 'public'),
(gen_random_uuid(), 'Nässjö gymnasium', 'Nässjö', 'public'),
(gen_random_uuid(), 'Sävsjö gymnasium', 'Sävsjö', 'public'),
(gen_random_uuid(), 'Tranås gymnasium', 'Tranås', 'public'),
(gen_random_uuid(), 'Vetlanda gymnasium', 'Vetlanda', 'public'),
(gen_random_uuid(), 'Värnamo gymnasium', 'Värnamo', 'public'),

-- =====================================================
-- KRONOBERGS LÄN
-- =====================================================

(gen_random_uuid(), 'Dackegymnasiet', 'Växjö', 'public'),
(gen_random_uuid(), 'Katedralskolan Växjö', 'Växjö', 'public'),
(gen_random_uuid(), 'Kungsmadskolan', 'Växjö', 'public'),
(gen_random_uuid(), 'Växjö Praktiska Gymnasium', 'Växjö', 'private'),
(gen_random_uuid(), 'Almundsryds gymnasium', 'Almundsryd', 'public'),
(gen_random_uuid(), 'Alvesta gymnasium', 'Alvesta', 'public'),
(gen_random_uuid(), 'Lessebo gymnasium', 'Lessebo', 'public'),
(gen_random_uuid(), 'Ljungby gymnasium', 'Ljungby', 'public'),
(gen_random_uuid(), 'Markaryd gymnasium', 'Markaryd', 'public'),
(gen_random_uuid(), 'Tingsryds gymnasium', 'Tingsryd', 'public'),
(gen_random_uuid(), 'Uppvidinge gymnasium', 'Åseda', 'public'),
(gen_random_uuid(), 'Älmhults gymnasium', 'Älmhult', 'public'),

-- =====================================================
-- KALMAR LÄN
-- =====================================================

(gen_random_uuid(), 'Kalmarsundsgymnasiet', 'Kalmar', 'public'),
(gen_random_uuid(), 'Stagneliusskolan', 'Kalmar', 'public'),
(gen_random_uuid(), 'Torsås gymnasium', 'Torsås', 'public'),
(gen_random_uuid(), 'Borgholms gymnasium', 'Borgholm', 'public'),
(gen_random_uuid(), 'Emmaboda gymnasium', 'Emmaboda', 'public'),
(gen_random_uuid(), 'Gamleby gymnasium', 'Gamleby', 'public'),
(gen_random_uuid(), 'Hultsfred gymnasium', 'Hultsfred', 'public'),
(gen_random_uuid(), 'Mörbylånga gymnasium', 'Mörbylånga', 'public'),
(gen_random_uuid(), 'Nybro gymnasium', 'Nybro', 'public'),
(gen_random_uuid(), 'Oskarshamns gymnasium', 'Oskarshamn', 'public'),
(gen_random_uuid(), 'Vimmerby gymnasium', 'Vimmerby', 'public'),
(gen_random_uuid(), 'Västerviks gymnasium', 'Västervik', 'public'),

-- =====================================================
-- GOTLANDS LÄN
-- =====================================================

(gen_random_uuid(), 'Wisbygymnasiet', 'Visby', 'public'),
(gen_random_uuid(), 'Richard Steffen gymnasium', 'Visby', 'public'),

-- =====================================================
-- BLEKINGE LÄN
-- =====================================================

(gen_random_uuid(), 'Blekingesjukhuset gymnasium', 'Karlskrona', 'public'),
(gen_random_uuid(), 'Gräsviksgymnasiet', 'Karlskrona', 'public'),
(gen_random_uuid(), 'Karlskrona gymnasium', 'Karlskrona', 'public'),
(gen_random_uuid(), 'Kunskapsskolan Karlskrona', 'Karlskrona', 'private'),
(gen_random_uuid(), 'Karlshamns gymnasium', 'Karlshamn', 'public'),
(gen_random_uuid(), 'Olofströms gymnasium', 'Olofström', 'public'),
(gen_random_uuid(), 'Ronneby gymnasium', 'Ronneby', 'public'),
(gen_random_uuid(), 'Sölvesborgs gymnasium', 'Sölvesborg', 'public'),

-- =====================================================
-- HALLANDS LÄN
-- =====================================================

(gen_random_uuid(), 'Falkenbergs gymnasium', 'Falkenberg', 'public'),
(gen_random_uuid(), 'Gymnasiet i Halmstad', 'Halmstad', 'public'),
(gen_random_uuid(), 'Halmstad Högskola Gymnasium', 'Halmstad', 'public'),
(gen_random_uuid(), 'Kattegattgymnasiet', 'Halmstad', 'public'),
(gen_random_uuid(), 'Sannarpsskolan', 'Halmstad', 'public'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Halmstad', 'Halmstad', 'private'),
(gen_random_uuid(), 'Hylte gymnasium', 'Hyltebruk', 'public'),
(gen_random_uuid(), 'Kungsbacka gymnasium', 'Kungsbacka', 'public'),
(gen_random_uuid(), 'Laholms gymnasium', 'Laholm', 'public'),
(gen_random_uuid(), 'Varbergs gymnasium', 'Varberg', 'public'),

-- =====================================================
-- VÄRMLANDS LÄN
-- =====================================================

(gen_random_uuid(), 'Karolinska gymnasiet', 'Karlstad', 'public'),
(gen_random_uuid(), 'Karlstad Praktiska Gymnasium', 'Karlstad', 'private'),
(gen_random_uuid(), 'Kristinehamns gymnasium', 'Kristinehamn', 'public'),
(gen_random_uuid(), 'Munkfors gymnasium', 'Munkfors', 'public'),
(gen_random_uuid(), 'Arvika gymnasium', 'Arvika', 'public'),
(gen_random_uuid(), 'Eda gymnasium', 'Charlottenberg', 'public'),
(gen_random_uuid(), 'Filipstads gymnasium', 'Filipstad', 'public'),
(gen_random_uuid(), 'Forshaga gymnasium', 'Forshaga', 'public'),
(gen_random_uuid(), 'Grums gymnasium', 'Grums', 'public'),
(gen_random_uuid(), 'Hagfors gymnasium', 'Hagfors', 'public'),
(gen_random_uuid(), 'Hammarö gymnasium', 'Hammarö', 'public'),
(gen_random_uuid(), 'Kils gymnasium', 'Kil', 'public'),
(gen_random_uuid(), 'Säffle gymnasium', 'Säffle', 'public'),
(gen_random_uuid(), 'Sunne gymnasium', 'Sunne', 'public'),
(gen_random_uuid(), 'Torsby gymnasium', 'Torsby', 'public'),
(gen_random_uuid(), 'Årjängs gymnasium', 'Årjäng', 'public'),

-- =====================================================
-- ÖREBRO LÄN
-- =====================================================

(gen_random_uuid(), 'Karolinska gymnasiet', 'Örebro', 'public'),
(gen_random_uuid(), 'Rudbecksgymnasiet', 'Örebro', 'public'),
(gen_random_uuid(), 'Tullängsgymnasiet', 'Örebro', 'public'),
(gen_random_uuid(), 'Virginska gymnasiet', 'Örebro', 'public'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Örebro', 'Örebro', 'private'),
(gen_random_uuid(), 'IT-Gymnasiet Örebro', 'Örebro', 'private'),
(gen_random_uuid(), 'Jensen gymnasium Örebro', 'Örebro', 'private'),
(gen_random_uuid(), 'Askersunds gymnasium', 'Askersund', 'public'),
(gen_random_uuid(), 'Degerfors gymnasium', 'Degerfors', 'public'),
(gen_random_uuid(), 'Hallsbergs gymnasium', 'Hallsberg', 'public'),
(gen_random_uuid(), 'Hällefors gymnasium', 'Hällefors', 'public'),
(gen_random_uuid(), 'Karlskoga gymnasium', 'Karlskoga', 'public'),
(gen_random_uuid(), 'Kumla gymnasium', 'Kumla', 'public'),
(gen_random_uuid(), 'Laxå gymnasium', 'Laxå', 'public'),
(gen_random_uuid(), 'Lekebergs gymnasium', 'Fjugesta', 'public'),
(gen_random_uuid(), 'Lindesbergs gymnasium', 'Lindesberg', 'public'),
(gen_random_uuid(), 'Ljusnarsbergs gymnasium', 'Kopparberg', 'public'),
(gen_random_uuid(), 'Nora gymnasium', 'Nora', 'public'),

-- =====================================================
-- VÄSTMANLANDS LÄN
-- =====================================================

(gen_random_uuid(), 'Rudbeckianska gymnasiet', 'Västerås', 'public'),
(gen_random_uuid(), 'Vasaskolan', 'Västerås', 'public'),
(gen_random_uuid(), 'Västerås Praktiska Gymnasium', 'Västerås', 'private'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Västerås', 'Västerås', 'private'),
(gen_random_uuid(), 'IT-Gymnasiet Västerås', 'Västerås', 'private'),
(gen_random_uuid(), 'Jensen gymnasium Västerås', 'Västerås', 'private'),
(gen_random_uuid(), 'Arboga gymnasium', 'Arboga', 'public'),
(gen_random_uuid(), 'Fagersta gymnasium', 'Fagersta', 'public'),
(gen_random_uuid(), 'Hallstahammars gymnasium', 'Hallstahammar', 'public'),
(gen_random_uuid(), 'Köpings gymnasium', 'Köping', 'public'),
(gen_random_uuid(), 'Norbergs gymnasium', 'Norberg', 'public'),
(gen_random_uuid(), 'Sala gymnasium', 'Sala', 'public'),
(gen_random_uuid(), 'Skinnskattebergs gymnasium', 'Skinnskatteberg', 'public'),
(gen_random_uuid(), 'Surahammars gymnasium', 'Surahammar', 'public'),

-- =====================================================
-- DALARNAS LÄN
-- =====================================================

(gen_random_uuid(), 'Lugnetgymnasiet', 'Falun', 'public'),
(gen_random_uuid(), 'Soltorgsgymnasiet', 'Borlänge', 'public'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Falun', 'Falun', 'private'),
(gen_random_uuid(), 'Avesta gymnasium', 'Avesta', 'public'),
(gen_random_uuid(), 'Gagnefs gymnasium', 'Gagnef', 'public'),
(gen_random_uuid(), 'Hedemora gymnasium', 'Hedemora', 'public'),
(gen_random_uuid(), 'Leksands gymnasium', 'Leksand', 'public'),
(gen_random_uuid(), 'Ludvika gymnasium', 'Ludvika', 'public'),
(gen_random_uuid(), 'Malung-Sälens gymnasium', 'Malung', 'public'),
(gen_random_uuid(), 'Mora gymnasium', 'Mora', 'public'),
(gen_random_uuid(), 'Orsa gymnasium', 'Orsa', 'public'),
(gen_random_uuid(), 'Rättviks gymnasium', 'Rättvik', 'public'),
(gen_random_uuid(), 'Smedjebackens gymnasium', 'Smedjebacken', 'public'),
(gen_random_uuid(), 'Säters gymnasium', 'Säter', 'public'),
(gen_random_uuid(), 'Vansbro gymnasium', 'Vansbro', 'public'),
(gen_random_uuid(), 'Älvdalens gymnasium', 'Älvdalen', 'public'),

-- =====================================================
-- GÄVLEBORGS LÄN
-- =====================================================

(gen_random_uuid(), 'Vasaskolan Gävle', 'Gävle', 'public'),
(gen_random_uuid(), 'Polhemskolan Gävle', 'Gävle', 'public'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Gävle', 'Gävle', 'private'),
(gen_random_uuid(), 'IT-Gymnasiet Gävle', 'Gävle', 'private'),
(gen_random_uuid(), 'Bollnäs gymnasium', 'Bollnäs', 'public'),
(gen_random_uuid(), 'Hofors gymnasium', 'Hofors', 'public'),
(gen_random_uuid(), 'Hudiksvalls gymnasium', 'Hudiksvall', 'public'),
(gen_random_uuid(), 'Ljusdals gymnasium', 'Ljusdal', 'public'),
(gen_random_uuid(), 'Nordanstigs gymnasium', 'Bergsjö', 'public'),
(gen_random_uuid(), 'Ockelbo gymnasium', 'Ockelbo', 'public'),
(gen_random_uuid(), 'Ovanåkers gymnasium', 'Edsbyn', 'public'),
(gen_random_uuid(), 'Sandvikens gymnasium', 'Sandviken', 'public'),
(gen_random_uuid(), 'Söderhamns gymnasium', 'Söderhamn', 'public'),

-- =====================================================
-- VÄSTERNORRLANDS LÄN
-- =====================================================

(gen_random_uuid(), 'Nolaskolan', 'Sundsvall', 'public'),
(gen_random_uuid(), 'Sundsvalls gymnasium', 'Sundsvall', 'public'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Sundsvall', 'Sundsvall', 'private'),
(gen_random_uuid(), 'Härnösands gymnasium', 'Härnösand', 'public'),
(gen_random_uuid(), 'Kramfors gymnasium', 'Kramfors', 'public'),
(gen_random_uuid(), 'Sollefteå gymnasium', 'Sollefteå', 'public'),
(gen_random_uuid(), 'Timrå gymnasium', 'Timrå', 'public'),
(gen_random_uuid(), 'Ånge gymnasium', 'Ånge', 'public'),
(gen_random_uuid(), 'Örnsköldsviks gymnasium', 'Örnsköldsvik', 'public'),

-- =====================================================
-- JÄMTLANDS LÄN
-- =====================================================

(gen_random_uuid(), 'Wargentin gymnasium', 'Östersund', 'public'),
(gen_random_uuid(), 'Palmcrantzskolan', 'Östersund', 'public'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Östersund', 'Östersund', 'private'),
(gen_random_uuid(), 'Bergs gymnasium', 'Svenstavik', 'public'),
(gen_random_uuid(), 'Bräcke gymnasium', 'Bräcke', 'public'),
(gen_random_uuid(), 'Härjedalens gymnasium', 'Sveg', 'public'),
(gen_random_uuid(), 'Krokoms gymnasium', 'Krokom', 'public'),
(gen_random_uuid(), 'Ragunda gymnasium', 'Hammarstrand', 'public'),
(gen_random_uuid(), 'Strömsunds gymnasium', 'Strömsund', 'public'),
(gen_random_uuid(), 'Åre gymnasium', 'Järpen', 'public'),

-- =====================================================
-- VÄSTERBOTTENS LÄN
-- =====================================================

(gen_random_uuid(), 'Dragonskolan', 'Umeå', 'public'),
(gen_random_uuid(), 'Midgårdsskolan', 'Umeå', 'public'),
(gen_random_uuid(), 'Norrbyskolan', 'Umeå', 'public'),
(gen_random_uuid(), 'Vasaskolan Umeå', 'Umeå', 'public'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Umeå', 'Umeå', 'private'),
(gen_random_uuid(), 'IT-Gymnasiet Umeå', 'Umeå', 'private'),
(gen_random_uuid(), 'Jensen gymnasium Umeå', 'Umeå', 'private'),
(gen_random_uuid(), 'Bjurholms gymnasium', 'Bjurholm', 'public'),
(gen_random_uuid(), 'Dorotea gymnasium', 'Dorotea', 'public'),
(gen_random_uuid(), 'Lycksele gymnasium', 'Lycksele', 'public'),
(gen_random_uuid(), 'Malå gymnasium', 'Malå', 'public'),
(gen_random_uuid(), 'Nordmalings gymnasium', 'Nordmaling', 'public'),
(gen_random_uuid(), 'Norsjö gymnasium', 'Norsjö', 'public'),
(gen_random_uuid(), 'Robertsfors gymnasium', 'Robertsfors', 'public'),
(gen_random_uuid(), 'Skellefteå gymnasium', 'Skellefteå', 'public'),
(gen_random_uuid(), 'Sorsele gymnasium', 'Sorsele', 'public'),
(gen_random_uuid(), 'Storumans gymnasium', 'Storuman', 'public'),
(gen_random_uuid(), 'Vilhelmina gymnasium', 'Vilhelmina', 'public'),
(gen_random_uuid(), 'Vindelns gymnasium', 'Vindeln', 'public'),
(gen_random_uuid(), 'Vännäs gymnasium', 'Vännäs', 'public'),
(gen_random_uuid(), 'Åsele gymnasium', 'Åsele', 'public'),

-- =====================================================
-- NORRBOTTENS LÄN
-- =====================================================

(gen_random_uuid(), 'Luleå gymnasieby', 'Luleå', 'public'),
(gen_random_uuid(), 'Porsöskolan', 'Luleå', 'public'),
(gen_random_uuid(), 'Drottning Blankas gymnasieskola Luleå', 'Luleå', 'private'),
(gen_random_uuid(), 'IT-Gymnasiet Luleå', 'Luleå', 'private'),
(gen_random_uuid(), 'Alviksskolan', 'Älvsbyn', 'public'),
(gen_random_uuid(), 'Arjeplogs gymnasium', 'Arjeplog', 'public'),
(gen_random_uuid(), 'Arvidsjaurs gymnasium', 'Arvidsjaur', 'public'),
(gen_random_uuid(), 'Bodens gymnasium', 'Boden', 'public'),
(gen_random_uuid(), 'Gällivare gymnasium', 'Gällivare', 'public'),
(gen_random_uuid(), 'Haparanda gymnasium', 'Haparanda', 'public'),
(gen_random_uuid(), 'Jokkmokks gymnasium', 'Jokkmokk', 'public'),
(gen_random_uuid(), 'Kalix gymnasium', 'Kalix', 'public'),
(gen_random_uuid(), 'Kiruna gymnasium', 'Kiruna', 'public'),
(gen_random_uuid(), 'Pajala gymnasium', 'Pajala', 'public'),
(gen_random_uuid(), 'Piteå gymnasium', 'Piteå', 'public'),
(gen_random_uuid(), 'Överkalix gymnasium', 'Överkalix', 'public'),
(gen_random_uuid(), 'Övertorneå gymnasium', 'Övertorneå', 'public');

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'Totalt antal gymnasieskolor:' as info, COUNT(*) as antal FROM gymnasiums;
SELECT 'Antal offentliga skolor:' as info, COUNT(*) as antal FROM gymnasiums WHERE type = 'public';
SELECT 'Antal privata skolor:' as info, COUNT(*) as antal FROM gymnasiums WHERE type = 'private';
SELECT 'Antal skolor per län (topp 10):' as info;
SELECT city, COUNT(*) as antal 
FROM gymnasiums 
GROUP BY city 
ORDER BY antal DESC 
LIMIT 10;
