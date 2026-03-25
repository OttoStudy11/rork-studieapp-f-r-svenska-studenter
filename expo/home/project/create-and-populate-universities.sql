-- =====================================================
-- SKAPA OCH FYLL UNIVERSITIES TABELL
-- =====================================================
-- Skapar universities tabell och fyller den med alla
-- högskolor och universitet i Sverige
-- =====================================================

BEGIN;

-- Radera befintlig tabell om den finns
DROP TABLE IF EXISTS universities CASCADE;

-- Skapa universities tabell
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('university', 'college', 'art_school', 'business_school', 'vocational_school', 'specialized_school')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för snabbare sökningar
CREATE INDEX idx_universities_city ON universities(city);
CREATE INDEX idx_universities_type ON universities(type);
CREATE INDEX idx_universities_name ON universities(name);
CREATE INDEX idx_universities_category ON universities(category);

-- Aktivera RLS
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

-- Policy för att alla kan läsa universities
CREATE POLICY "Anyone can view universities"
  ON universities FOR SELECT
  USING (true);

-- =====================================================
-- UNIVERSITET
-- =====================================================

INSERT INTO universities (id, name, city, type, category) VALUES
(gen_random_uuid(), 'Uppsala universitet', 'Uppsala', 'university', 'Universitet'),
(gen_random_uuid(), 'Lunds universitet', 'Lund', 'university', 'Universitet'),
(gen_random_uuid(), 'Göteborgs universitet', 'Göteborg', 'university', 'Universitet'),
(gen_random_uuid(), 'Stockholms universitet', 'Stockholm', 'university', 'Universitet'),
(gen_random_uuid(), 'Umeå universitet', 'Umeå', 'university', 'Universitet'),
(gen_random_uuid(), 'Linköpings universitet', 'Linköping', 'university', 'Universitet'),
(gen_random_uuid(), 'Karolinska Institutet', 'Stockholm', 'university', 'Universitet'),
(gen_random_uuid(), 'Kungliga Tekniska högskolan (KTH)', 'Stockholm', 'university', 'Universitet'),
(gen_random_uuid(), 'Luleå tekniska universitet', 'Luleå', 'university', 'Universitet'),
(gen_random_uuid(), 'Sveriges lantbruksuniversitet (SLU)', 'Uppsala', 'university', 'Universitet'),
(gen_random_uuid(), 'Karlstads universitet', 'Karlstad', 'university', 'Universitet'),
(gen_random_uuid(), 'Linnéuniversitetet', 'Växjö', 'university', 'Universitet'),
(gen_random_uuid(), 'Örebro universitet', 'Örebro', 'university', 'Universitet'),
(gen_random_uuid(), 'Mittuniversitetet', 'Sundsvall', 'university', 'Universitet'),
(gen_random_uuid(), 'Malmö universitet', 'Malmö', 'university', 'Universitet'),

-- =====================================================
-- KONSTNÄRLIGA HÖGSKOLOR
-- =====================================================

(gen_random_uuid(), 'Konstfack', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
(gen_random_uuid(), 'Kungliga Konsthögskolan', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
(gen_random_uuid(), 'Kungliga Musikhögskolan i Stockholm', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
(gen_random_uuid(), 'Stockholms konstnärliga högskola', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
(gen_random_uuid(), 'Dans och cirkushögskolan', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
(gen_random_uuid(), 'Stockholms dramatiska högskola', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
(gen_random_uuid(), 'Beckmans designhögskola', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
(gen_random_uuid(), 'Musikhögskolan Ingesund', 'Arvika', 'art_school', 'Konstnärliga högskolor'),
(gen_random_uuid(), 'Operahögskolan i Stockholm', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
(gen_random_uuid(), 'Högskolan för fotografi', 'Göteborg', 'art_school', 'Konstnärliga högskolor'),

-- =====================================================
-- HANDELSHÖGSKOLOR
-- =====================================================

(gen_random_uuid(), 'Handelshögskolan i Stockholm', 'Stockholm', 'business_school', 'Handelshögskolor'),
(gen_random_uuid(), 'Handelshögskolan vid Göteborgs universitet', 'Göteborg', 'business_school', 'Handelshögskolor'),
(gen_random_uuid(), 'Handelshögskolan vid Umeå universitet', 'Umeå', 'business_school', 'Handelshögskolor'),
(gen_random_uuid(), 'Handelshögskolan vid Örebro universitet', 'Örebro', 'business_school', 'Handelshögskolor'),
(gen_random_uuid(), 'Handelshögskolan vid Karlstads universitet', 'Karlstad', 'business_school', 'Handelshögskolor'),
(gen_random_uuid(), 'IHM Business School', 'Stockholm', 'business_school', 'Handelshögskolor'),

-- =====================================================
-- TEKNISKA HÖGSKOLOR
-- =====================================================

(gen_random_uuid(), 'Chalmers tekniska högskola', 'Göteborg', 'university', 'Högskolor'),
(gen_random_uuid(), 'Blekinge tekniska högskola', 'Karlskrona', 'college', 'Högskolor'),
(gen_random_uuid(), 'Mälardalens universitet', 'Västerås', 'university', 'Högskolor'),

-- =====================================================
-- STATLIGA HÖGSKOLOR
-- =====================================================

(gen_random_uuid(), 'Högskolan i Borås', 'Borås', 'college', 'Högskolor'),
(gen_random_uuid(), 'Högskolan Dalarna', 'Falun', 'college', 'Högskolor'),
(gen_random_uuid(), 'Högskolan i Gävle', 'Gävle', 'college', 'Högskolor'),
(gen_random_uuid(), 'Högskolan i Halmstad', 'Halmstad', 'college', 'Högskolor'),
(gen_random_uuid(), 'Högskolan Kristianstad', 'Kristianstad', 'college', 'Högskolor'),
(gen_random_uuid(), 'Högskolan i Skövde', 'Skövde', 'college', 'Högskolor'),
(gen_random_uuid(), 'Högskolan Väst', 'Trollhättan', 'college', 'Högskolor'),
(gen_random_uuid(), 'Södertörns högskola', 'Huddinge', 'college', 'Högskolor'),
(gen_random_uuid(), 'Högskolan i Jönköping', 'Jönköping', 'college', 'Högskolor'),

-- =====================================================
-- SPECIALHÖGSKOLOR
-- =====================================================

(gen_random_uuid(), 'Försvarshögskolan', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Gymnastik- och idrottshögskolan (GIH)', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Marie Cederschiöld högskola', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Röda Korsets högskola', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Sophiahemmet högskola', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Polishögskolan', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Polishögskolan Sörentorp', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Räddningshögskolan Sandö', 'Sandö', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Trafikflyghögskolan', 'Ljungbyhed', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Militärhögskolan Halmstad', 'Halmstad', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Militärhögskolan Karlberg', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Ersta Sköndal Bräcke högskola', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
(gen_random_uuid(), 'Evidens högskola', 'Göteborg', 'specialized_school', 'Specialhögskolor'),

-- =====================================================
-- YRKESHÖGSKOLOR
-- =====================================================

(gen_random_uuid(), 'Nackademin', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Medieinstitutet', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Changemaker Educations', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Chas Academy', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'EC Utbildning', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Folkuniversitetet', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Hermods', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Jensen Education', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'KYH - Yrkeshögskolan', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Lernia YH', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Newton Yrkeshögskola', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Plushögskolan', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'STI - Scandinavian Technology Institute', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'TUC Yrkeshögskola', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Yrgo', 'Göteborg', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'YrkesAkademin', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Berghs School of Communication', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Hyper Island', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
(gen_random_uuid(), 'Kulturama', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),

-- =====================================================
-- TEOLOGISKA HÖGSKOLOR OCH SEMINARIER
-- =====================================================

(gen_random_uuid(), 'Johannelunds teologiska högskola', 'Uppsala', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Newmaninstitutet', 'Uppsala', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Stockholm School of Theology', 'Stockholm', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Teologiska högskolan Stockholm', 'Stockholm', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Örebro teologiska högskola', 'Örebro', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Enskilda Högskolan Stockholm', 'Stockholm', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Akademi för Ledarskap och Teologi (ALT)', 'Stockholm', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Evangeliska Frikyrkan (EFK) - Teologiska seminariet', 'Stockholm', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Pingst - Teologiska seminariet', 'Stockholm', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Svenska Baptistsamfundet - Teologiska seminariet', 'Stockholm', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Svenska kyrkans utbildningsinstitut', 'Uppsala', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Rudolf Steinerhögskolan', 'Järna', 'specialized_school', 'Teologiska högskolor'),
(gen_random_uuid(), 'Waldorfhögskolan', 'Stockholm', 'specialized_school', 'Teologiska högskolor'),

-- =====================================================
-- CAMPUS OCH FILIALER
-- =====================================================

(gen_random_uuid(), 'Campus Gotland (Uppsala universitet)', 'Visby', 'university', 'Campus'),
(gen_random_uuid(), 'Campus Helsingborg (Lunds universitet)', 'Helsingborg', 'university', 'Campus'),
(gen_random_uuid(), 'Campus Norrköping (Linköpings universitet)', 'Norrköping', 'university', 'Campus'),
(gen_random_uuid(), 'Campus Skellefteå (Luleå tekniska universitet)', 'Skellefteå', 'university', 'Campus'),
(gen_random_uuid(), 'Campus Sundsvall (Mittuniversitetet)', 'Sundsvall', 'university', 'Campus'),
(gen_random_uuid(), 'Campus Östersund (Mittuniversitetet)', 'Östersund', 'university', 'Campus'),
(gen_random_uuid(), 'Campus Växjö (Linnéuniversitetet)', 'Växjö', 'university', 'Campus'),
(gen_random_uuid(), 'Campus Kalmar (Linnéuniversitetet)', 'Kalmar', 'university', 'Campus'),
(gen_random_uuid(), 'Campus Visby (Uppsala universitet)', 'Visby', 'university', 'Campus'),
(gen_random_uuid(), 'Campus Kiruna (Luleå tekniska universitet)', 'Kiruna', 'university', 'Campus'),
(gen_random_uuid(), 'Campus Piteå (Luleå tekniska universitet)', 'Piteå', 'university', 'Campus'),
(gen_random_uuid(), 'Campus Borlänge (Högskolan Dalarna)', 'Borlänge', 'college', 'Campus'),

-- =====================================================
-- BRANSCHSPECIFIKA HÖGSKOLOR
-- =====================================================

(gen_random_uuid(), 'Hotell- och restauranghögskolan (Örebro universitet)', 'Örebro', 'specialized_school', 'Branschspecifika'),
(gen_random_uuid(), 'Textilhögskolan (Högskolan i Borås)', 'Borås', 'specialized_school', 'Branschspecifika'),
(gen_random_uuid(), 'Sjöfartshögskolan (Chalmers)', 'Göteborg', 'specialized_school', 'Branschspecifika'),
(gen_random_uuid(), 'Sjöfartshögskolan (Linnéuniversitetet)', 'Kalmar', 'specialized_school', 'Branschspecifika'),
(gen_random_uuid(), 'Sveriges Ridgymnasium Strömsholm', 'Strömsholm', 'specialized_school', 'Branschspecifika'),
(gen_random_uuid(), 'Stockholms Musikpedagogiska Institut (SMI)', 'Stockholm', 'specialized_school', 'Branschspecifika'),
(gen_random_uuid(), 'Gammelkroppa skogsskola', 'Filipstad', 'specialized_school', 'Branschspecifika'),

-- =====================================================
-- REGIONALA HÖGSKOLECENTRUM
-- =====================================================

(gen_random_uuid(), 'Högskolecentrum Bohuslän', 'Uddevalla', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolecentrum Sjuhärad', 'Borås', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolecentrum Skaraborg', 'Skövde', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Lärcentrum Falun', 'Falun', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Campus Värnamo', 'Värnamo', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Campus Ljungby', 'Ljungby', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Campus Varberg', 'Varberg', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Campus Hultsfred', 'Hultsfred', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Campus Filipstad', 'Filipstad', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Campus Torsby', 'Torsby', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Campus Arvika', 'Arvika', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Campus Säffle', 'Säffle', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Campus Åmål', 'Åmål', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Campus Mölndal', 'Mölndal', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Eskilstuna', 'Eskilstuna', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Hudiksvall', 'Hudiksvall', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Karlskoga', 'Karlskoga', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Lidköping', 'Lidköping', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Mariestad', 'Mariestad', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Motala', 'Motala', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Nyköping', 'Nyköping', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Oskarshamn', 'Oskarshamn', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Trollhättan', 'Trollhättan', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Uddevalla', 'Uddevalla', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Vänersborg', 'Vänersborg', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Västervik', 'Västervik', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Ystad', 'Ystad', 'college', 'Regionala centrum'),
(gen_random_uuid(), 'Högskolan i Ängelholm', 'Ängelholm', 'college', 'Regionala centrum'),

-- =====================================================
-- INTERNATIONELLA SAMARBETEN
-- =====================================================

(gen_random_uuid(), 'World Maritime University (Malmö)', 'Malmö', 'university', 'Internationella'),
(gen_random_uuid(), 'United Nations University', 'Stockholm', 'university', 'Internationella'),
(gen_random_uuid(), 'European Spallation Source (ESS)', 'Lund', 'specialized_school', 'Internationella'),
(gen_random_uuid(), 'Stockholm School of Economics in Riga', 'Stockholm', 'business_school', 'Internationella'),
(gen_random_uuid(), 'European Business School (EBS)', 'Stockholm', 'business_school', 'Internationella'),

-- =====================================================
-- FORSKNINGSINSTITUT MED UTBILDNING
-- =====================================================

(gen_random_uuid(), 'IVL Svenska Miljöinstitutet', 'Stockholm', 'specialized_school', 'Forskningsinstitut'),
(gen_random_uuid(), 'RISE Research Institutes of Sweden', 'Stockholm', 'specialized_school', 'Forskningsinstitut'),
(gen_random_uuid(), 'Nordiska Afrikainstitutet', 'Uppsala', 'specialized_school', 'Forskningsinstitut'),
(gen_random_uuid(), 'Institutet för framtidsstudier', 'Stockholm', 'specialized_school', 'Forskningsinstitut'),
(gen_random_uuid(), 'Institutet för social forskning (SOFI)', 'Stockholm', 'specialized_school', 'Forskningsinstitut'),
(gen_random_uuid(), 'Skandinaviens akademi för psykoterapiutveckling', 'Stockholm', 'specialized_school', 'Forskningsinstitut'),
(gen_random_uuid(), 'Svenska institutet för kognitiv psykoterapi', 'Stockholm', 'specialized_school', 'Forskningsinstitut'),

-- =====================================================
-- SOMMARUNIVERSITET
-- =====================================================

(gen_random_uuid(), 'Sommaruniversitetet i Visby', 'Visby', 'college', 'Sommaruniversitet'),
(gen_random_uuid(), 'Sommaruniversitetet i Marstrand', 'Marstrand', 'college', 'Sommaruniversitet'),
(gen_random_uuid(), 'Sommaruniversitetet i Båstad', 'Båstad', 'college', 'Sommaruniversitet');

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'Totalt antal högskolor/universitet:' as info, COUNT(*) as antal FROM universities;
SELECT 'Antal universitet:' as info, COUNT(*) as antal FROM universities WHERE type = 'university';
SELECT 'Antal högskolor:' as info, COUNT(*) as antal FROM universities WHERE type = 'college';
SELECT 'Antal konstnärliga högskolor:' as info, COUNT(*) as antal FROM universities WHERE type = 'art_school';
SELECT 'Antal handelshögskolor:' as info, COUNT(*) as antal FROM universities WHERE type = 'business_school';
SELECT 'Antal yrkeshögskolor:' as info, COUNT(*) as antal FROM universities WHERE type = 'vocational_school';
SELECT 'Antal specialhögskolor:' as info, COUNT(*) as antal FROM universities WHERE type = 'specialized_school';
