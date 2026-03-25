-- =====================================================
-- FYLL UNIVERSITET OCH PROGRAM
-- =====================================================
-- Fyller universities med alla svenska lärosäten
-- och university_programs med alla program
-- =====================================================

BEGIN;

-- =====================================================
-- FYLL UNIVERSITIES
-- =====================================================

-- UNIVERSITET
INSERT INTO universities (name, short_name, city, type, category) VALUES
('Uppsala universitet', 'UU', 'Uppsala', 'university', 'Universitet'),
('Lunds universitet', 'LU', 'Lund', 'university', 'Universitet'),
('Göteborgs universitet', 'GU', 'Göteborg', 'university', 'Universitet'),
('Stockholms universitet', 'SU', 'Stockholm', 'university', 'Universitet'),
('Umeå universitet', 'UmU', 'Umeå', 'university', 'Universitet'),
('Linköpings universitet', 'LiU', 'Linköping', 'university', 'Universitet'),
('Karolinska Institutet', 'KI', 'Stockholm', 'university', 'Universitet'),
('Kungliga Tekniska högskolan', 'KTH', 'Stockholm', 'university', 'Universitet'),
('Luleå tekniska universitet', 'LTU', 'Luleå', 'university', 'Universitet'),
('Sveriges lantbruksuniversitet', 'SLU', 'Uppsala', 'university', 'Universitet'),
('Karlstads universitet', 'KaU', 'Karlstad', 'university', 'Universitet'),
('Linnéuniversitetet', 'LnU', 'Växjö', 'university', 'Universitet'),
('Örebro universitet', 'ÖU', 'Örebro', 'university', 'Universitet'),
('Mittuniversitetet', 'MIUN', 'Sundsvall', 'university', 'Universitet'),
('Malmö universitet', 'MAU', 'Malmö', 'university', 'Universitet'),

-- TEKNISKA HÖGSKOLOR
('Chalmers tekniska högskola', 'Chalmers', 'Göteborg', 'university', 'Högskolor'),
('Blekinge tekniska högskola', 'BTH', 'Karlskrona', 'college', 'Högskolor'),
('Mälardalens universitet', 'MDU', 'Västerås', 'university', 'Högskolor'),

-- STATLIGA HÖGSKOLOR
('Högskolan i Borås', 'HB', 'Borås', 'college', 'Högskolor'),
('Högskolan Dalarna', 'HDa', 'Falun', 'college', 'Högskolor'),
('Högskolan i Gävle', 'HiG', 'Gävle', 'college', 'Högskolor'),
('Högskolan i Halmstad', 'HH', 'Halmstad', 'college', 'Högskolor'),
('Högskolan Kristianstad', 'HKr', 'Kristianstad', 'college', 'Högskolor'),
('Högskolan i Skövde', 'HiS', 'Skövde', 'college', 'Högskolor'),
('Högskolan Väst', 'HV', 'Trollhättan', 'college', 'Högskolor'),
('Södertörns högskola', 'SH', 'Huddinge', 'college', 'Högskolor'),
('Högskolan i Jönköping', 'HJ', 'Jönköping', 'college', 'Högskolor'),

-- HANDELSHÖGSKOLOR
('Handelshögskolan i Stockholm', 'HHS', 'Stockholm', 'business_school', 'Handelshögskolor'),
('IHM Business School', 'IHM', 'Stockholm', 'business_school', 'Handelshögskolor'),

-- KONSTNÄRLIGA HÖGSKOLOR
('Konstfack', 'Konstfack', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
('Kungliga Konsthögskolan', 'KKH', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
('Kungliga Musikhögskolan i Stockholm', 'KMH', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
('Stockholms konstnärliga högskola', 'SKH', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
('Dans och cirkushögskolan', 'DOCH', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
('Stockholms dramatiska högskola', 'StDH', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),
('Beckmans designhögskola', 'Beckmans', 'Stockholm', 'art_school', 'Konstnärliga högskolor'),

-- SPECIALHÖGSKOLOR
('Försvarshögskolan', 'FHS', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
('Gymnastik- och idrottshögskolan', 'GIH', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
('Polishögskolan', 'PHS', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
('Röda Korsets högskola', 'RKH', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
('Sophiahemmet högskola', 'SHH', 'Stockholm', 'specialized_school', 'Specialhögskolor'),
('Ersta Sköndal Bräcke högskola', 'ESB', 'Stockholm', 'specialized_school', 'Specialhögskolor'),

-- YRKESHÖGSKOLOR
('Nackademin', 'Nackademin', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
('Medieinstitutet', 'MI', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
('Changemaker Educations', 'Changemaker', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
('Chas Academy', 'Chas', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
('Hyper Island', 'Hyper Island', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
('Berghs School of Communication', 'Berghs', 'Stockholm', 'vocational_school', 'Yrkeshögskolor'),
('Yrgo', 'Yrgo', 'Göteborg', 'vocational_school', 'Yrkeshögskolor');

-- =====================================================
-- FYLL UNIVERSITY_PROGRAMS - TEKNISKA PROGRAM
-- =====================================================

-- KTH PROGRAM
WITH kth_id AS (SELECT id FROM universities WHERE short_name = 'KTH')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  kth_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM kth_id,
(VALUES
  ('Civilingenjörsutbildning i datateknik', 'CDATE', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjörsutbildning i elektroteknik', 'CELTE', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjörsutbildning i maskinteknik', 'CMAST', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjörsutbildning i teknisk fysik', 'CTFYS', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjörsutbildning i kemiteknik', 'CKETK', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjörsutbildning i industriell ekonomi', 'CINEK', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjörsutbildning i samhällsbyggnad', 'CSAMH', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjörsutbildning i bioteknik', 'CBIOT', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjörsutbildning i medicinsk teknik', 'CMEDT', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjörsutbildning i miljöteknik', 'CMILT', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Högskoleingenjörsutbildning i datateknik', 'TDAT', 'högskoleingenjör', 'Teknik', 180, 3.0),
  ('Högskoleingenjörsutbildning i elektroteknik', 'TELK', 'högskoleingenjör', 'Teknik', 180, 3.0),
  ('Högskoleingenjörsutbildning i maskinteknik', 'TMAS', 'högskoleingenjör', 'Teknik', 180, 3.0),
  ('Arkitektprogrammet', 'ARKIT', 'professionsprogram', 'Arkitektur', 300, 5.0),
  ('Kandidatprogram i datavetenskap', 'KDVTK', 'kandidat', 'Datavetenskap', 180, 3.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- CHALMERS PROGRAM
WITH chalmers_id AS (SELECT id FROM universities WHERE short_name = 'Chalmers')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  chalmers_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM chalmers_id,
(VALUES
  ('Civilingenjör datateknik', 'D', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjör elektroteknik', 'E', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjör maskinteknik', 'M', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjör teknisk fysik', 'F', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjör kemiteknik', 'K', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjör industriell ekonomi', 'I', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Arkitekt', 'A', 'professionsprogram', 'Arkitektur', 300, 5.0),
  ('Sjökapten', 'SJO', 'professionsprogram', 'Sjöfart', 210, 3.5)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- =====================================================
-- MEDICIN OCH HÄLSA - KAROLINSKA INSTITUTET
-- =====================================================

WITH ki_id AS (SELECT id FROM universities WHERE short_name = 'KI')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  ki_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM ki_id,
(VALUES
  ('Läkarprogrammet', 'LÄK', 'professionsprogram', 'Medicin', 330, 5.5),
  ('Tandläkarprogrammet', 'TAND', 'professionsprogram', 'Odontologi', 300, 5.0),
  ('Biomedicinprogrammet', 'BIOMED', 'kandidat', 'Biomedicin', 180, 3.0),
  ('Sjuksköterskeprogrammet', 'SJSK', 'professionsprogram', 'Omvårdnad', 180, 3.0),
  ('Fysioterapeutprogrammet', 'FYSIO', 'professionsprogram', 'Fysioterapi', 180, 3.0),
  ('Arbetsterapeutprogrammet', 'ARBTER', 'professionsprogram', 'Arbetsterapi', 180, 3.0),
  ('Psykologprogrammet', 'PSY', 'professionsprogram', 'Psykologi', 300, 5.0),
  ('Logopedprogrammet', 'LOGO', 'professionsprogram', 'Logopedi', 210, 3.5),
  ('Apotekarprogrammet', 'APOT', 'professionsprogram', 'Farmaci', 300, 5.0),
  ('Receptarieprogrammet', 'RECEP', 'professionsprogram', 'Farmaci', 180, 3.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- =====================================================
-- UPPSALA UNIVERSITET - BRED UTBILDNING
-- =====================================================

WITH uu_id AS (SELECT id FROM universities WHERE short_name = 'UU')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  uu_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM uu_id,
(VALUES
  ('Juristprogrammet', 'JUR', 'professionsprogram', 'Juridik', 270, 4.5),
  ('Civilingenjörsprogram datateknik', 'CDAT', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjörsprogram teknisk fysik', 'CTFYS', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Läkarprogrammet', 'LÄK', 'professionsprogram', 'Medicin', 330, 5.5),
  ('Apotekarprogrammet', 'APOT', 'professionsprogram', 'Farmaci', 300, 5.0),
  ('Psykologprogrammet', 'PSY', 'professionsprogram', 'Psykologi', 300, 5.0),
  ('Kandidatprogram i biologi', 'KBIO', 'kandidat', 'Biologi', 180, 3.0),
  ('Kandidatprogram i kemi', 'KKEM', 'kandidat', 'Kemi', 180, 3.0),
  ('Kandidatprogram i fysik', 'KFYS', 'kandidat', 'Fysik', 180, 3.0),
  ('Kandidatprogram i matematik', 'KMAT', 'kandidat', 'Matematik', 180, 3.0),
  ('Kandidatprogram i historia', 'KHIST', 'kandidat', 'Historia', 180, 3.0),
  ('Kandidatprogram i filosofi', 'KFIL', 'kandidat', 'Filosofi', 180, 3.0),
  ('Kandidatprogram i litteraturvetenskap', 'KLITT', 'kandidat', 'Litteraturvetenskap', 180, 3.0),
  ('Kandidatprogram i arkeologi', 'KARK', 'kandidat', 'Arkeologi', 180, 3.0),
  ('Veterinärprogrammet', 'VET', 'professionsprogram', 'Veterinärmedicin', 330, 5.5)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- =====================================================
-- LUNDS UNIVERSITET
-- =====================================================

WITH lu_id AS (SELECT id FROM universities WHERE short_name = 'LU')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  lu_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM lu_id,
(VALUES
  ('Läkarprogrammet', 'LÄK', 'professionsprogram', 'Medicin', 330, 5.5),
  ('Juristprogrammet', 'JUR', 'professionsprogram', 'Juridik', 270, 4.5),
  ('Civilingenjör datateknik', 'D', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjör maskinteknik', 'M', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Arkitektprogrammet', 'ARK', 'professionsprogram', 'Arkitektur', 300, 5.0),
  ('Psykologprogrammet', 'PSY', 'professionsprogram', 'Psykologi', 300, 5.0),
  ('Kandidatprogram i molekylärbiologi', 'KMOLBIO', 'kandidat', 'Molekylärbiologi', 180, 3.0),
  ('Kandidatprogram i fysik', 'KFYS', 'kandidat', 'Fysik', 180, 3.0),
  ('Kandidatprogram i kemi', 'KKEM', 'kandidat', 'Kemi', 180, 3.0),
  ('Kandidatprogram i matematik', 'KMAT', 'kandidat', 'Matematik', 180, 3.0),
  ('Ekonomprogrammet', 'EK', 'kandidat', 'Ekonomi', 180, 3.0),
  ('Statsvetarprogrammet', 'STAT', 'kandidat', 'Statsvetenskap', 180, 3.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- =====================================================
-- GÖTEBORGS UNIVERSITET
-- =====================================================

WITH gu_id AS (SELECT id FROM universities WHERE short_name = 'GU')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  gu_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM gu_id,
(VALUES
  ('Läkarprogrammet', 'LÄK', 'professionsprogram', 'Medicin', 330, 5.5),
  ('Juristprogrammet', 'JUR', 'professionsprogram', 'Juridik', 270, 4.5),
  ('Tandläkarprogrammet', 'TAND', 'professionsprogram', 'Odontologi', 300, 5.0),
  ('Psykologprogrammet', 'PSY', 'professionsprogram', 'Psykologi', 300, 5.0),
  ('Ekonomprogrammet', 'EK', 'kandidat', 'Ekonomi', 180, 3.0),
  ('Kandidatprogram i biologi', 'KBIO', 'kandidat', 'Biologi', 180, 3.0),
  ('Kandidatprogram i kemi', 'KKEM', 'kandidat', 'Kemi', 180, 3.0),
  ('Kandidatprogram i fysik', 'KFYS', 'kandidat', 'Fysik', 180, 3.0),
  ('Kandidatprogram i miljövetenskap', 'KMILJ', 'kandidat', 'Miljövetenskap', 180, 3.0),
  ('Socionomprogrammet', 'SOC', 'professionsprogram', 'Socialt arbete', 210, 3.5),
  ('Sjuksköterskeprogrammet', 'SJSK', 'professionsprogram', 'Omvårdnad', 180, 3.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- =====================================================
-- STOCKHOLMS UNIVERSITET
-- =====================================================

WITH su_id AS (SELECT id FROM universities WHERE short_name = 'SU')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  su_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM su_id,
(VALUES
  ('Juristprogrammet', 'JUR', 'professionsprogram', 'Juridik', 270, 4.5),
  ('Psykologprogrammet', 'PSY', 'professionsprogram', 'Psykologi', 300, 5.0),
  ('Ekonomprogrammet', 'EK', 'kandidat', 'Ekonomi', 180, 3.0),
  ('Kandidatprogram i biologi', 'KBIO', 'kandidat', 'Biologi', 180, 3.0),
  ('Kandidatprogram i kemi', 'KKEM', 'kandidat', 'Kemi', 180, 3.0),
  ('Kandidatprogram i fysik', 'KFYS', 'kandidat', 'Fysik', 180, 3.0),
  ('Kandidatprogram i matematik', 'KMAT', 'kandidat', 'Matematik', 180, 3.0),
  ('Kandidatprogram i geovetenskap', 'KGEO', 'kandidat', 'Geovetenskap', 180, 3.0),
  ('Kandidatprogram i datavetenskap', 'KDVT', 'kandidat', 'Datavetenskap', 180, 3.0),
  ('Kandidatprogram i statistik', 'KSTAT', 'kandidat', 'Statistik', 180, 3.0),
  ('Kandidatprogram i historia', 'KHIST', 'kandidat', 'Historia', 180, 3.0),
  ('Kandidatprogram i filosofi', 'KFIL', 'kandidat', 'Filosofi', 180, 3.0),
  ('Kandidatprogram i litteraturvetenskap', 'KLITT', 'kandidat', 'Litteraturvetenskap', 180, 3.0),
  ('Kandidatprogram i konstvetenskap', 'KKONST', 'kandidat', 'Konstvetenskap', 180, 3.0),
  ('Kandidatprogram i religionsvetenskap', 'KREL', 'kandidat', 'Religionsvetenskap', 180, 3.0),
  ('Kandidatprogram i kulturvetenskap', 'KKULT', 'kandidat', 'Kulturvetenskap', 180, 3.0),
  ('Kandidatprogram i sociologi', 'KSOC', 'kandidat', 'Sociologi', 180, 3.0),
  ('Statsvetarprogrammet', 'STAT', 'kandidat', 'Statsvetenskap', 180, 3.0),
  ('Socionomprogrammet', 'SOC', 'professionsprogram', 'Socialt arbete', 210, 3.5)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- =====================================================
-- LINKÖPINGS UNIVERSITET
-- =====================================================

WITH liu_id AS (SELECT id FROM universities WHERE short_name = 'LiU')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  liu_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM liu_id,
(VALUES
  ('Civilingenjör datateknik', 'D', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjör industriell ekonomi', 'I', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Civilingenjör teknisk fysik och elektroteknik', 'Y', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Läkarprogrammet', 'LÄK', 'professionsprogram', 'Medicin', 330, 5.5),
  ('Kandidatprogram i datavetenskap', 'KDVT', 'kandidat', 'Datavetenskap', 180, 3.0),
  ('Kandidatprogram i kognitiv vetenskap', 'KKOGV', 'kandidat', 'Kognitiv vetenskap', 180, 3.0),
  ('Ekonomprogrammet', 'EK', 'kandidat', 'Ekonomi', 180, 3.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- =====================================================
-- HANDELSHÖGSKOLAN I STOCKHOLM
-- =====================================================

WITH hhs_id AS (SELECT id FROM universities WHERE short_name = 'HHS')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  hhs_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM hhs_id,
(VALUES
  ('Civilekonomprogrammet', 'CEKON', 'professionsprogram', 'Ekonomi', 240, 4.0),
  ('Kandidatprogram i Business & Economics', 'KBECON', 'kandidat', 'Ekonomi', 180, 3.0),
  ('Kandidatprogram i Retail Management', 'KRET', 'kandidat', 'Handel', 180, 3.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- =====================================================
-- LÄRARUTBILDNINGAR - FLERA UNIVERSITET
-- =====================================================

-- Göteborgs universitet lärarutbildningar
WITH gu_id AS (SELECT id FROM universities WHERE short_name = 'GU')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  gu_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM gu_id,
(VALUES
  ('Förskollärarprogrammet', 'FÖRLÄR', 'professionsprogram', 'Lärarutbildning', 210, 3.5),
  ('Grundlärarprogrammet F-3', 'GRLF3', 'professionsprogram', 'Lärarutbildning', 240, 4.0),
  ('Grundlärarprogrammet 4-6', 'GRL46', 'professionsprogram', 'Lärarutbildning', 240, 4.0),
  ('Ämneslärarprogrammet 7-9', 'ÄMLÄR79', 'professionsprogram', 'Lärarutbildning', 270, 4.5),
  ('Ämneslärarprogrammet gymnasiet', 'ÄMLÄRGY', 'professionsprogram', 'Lärarutbildning', 300, 5.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- =====================================================
-- YRKESHÖGSKOLOR
-- =====================================================

WITH nackademin_id AS (SELECT id FROM universities WHERE name = 'Nackademin')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  nackademin_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM nackademin_id,
(VALUES
  ('Webbutvecklare', 'WEBB', 'yrkeshögskola', 'IT', 400, 2.0),
  ('Systemutvecklare .NET', 'SYSNET', 'yrkeshögskola', 'IT', 400, 2.0),
  ('UX Designer', 'UX', 'yrkeshögskola', 'Design', 400, 2.0),
  ('Spelutvecklare', 'SPEL', 'yrkeshögskola', 'IT', 400, 2.0),
  ('Nätverkstekniker', 'NÄT', 'yrkeshögskola', 'IT', 400, 2.0),
  ('IT-säkerhet', 'ITSÄK', 'yrkeshögskola', 'IT', 400, 2.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

WITH hyper_id AS (SELECT id FROM universities WHERE name = 'Hyper Island')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  hyper_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM hyper_id,
(VALUES
  ('Digital Media Creative', 'DMC', 'yrkeshögskola', 'Media', 400, 2.0),
  ('Motion Creative', 'MC', 'yrkeshögskola', 'Media', 400, 2.0),
  ('Frontend Developer', 'FRONT', 'yrkeshögskola', 'IT', 400, 2.0),
  ('Digital Marketing', 'DIGMAR', 'yrkeshögskola', 'Marknadsföring', 400, 2.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

WITH berghs_id AS (SELECT id FROM universities WHERE name = 'Berghs School of Communication')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  berghs_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM berghs_id,
(VALUES
  ('Grafisk design', 'GRAF', 'yrkeshögskola', 'Design', 400, 2.0),
  ('Art Direction', 'ART', 'yrkeshögskola', 'Design', 400, 2.0),
  ('Copywriter', 'COPY', 'yrkeshögskola', 'Kommunikation', 400, 2.0),
  ('Kommunikationsdesign', 'KOMDES', 'yrkeshögskola', 'Design', 400, 2.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- =====================================================
-- FLER UNIVERSITET PROGRAM
-- =====================================================

-- Umeå universitet
WITH umu_id AS (SELECT id FROM universities WHERE short_name = 'UmU')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  umu_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM umu_id,
(VALUES
  ('Läkarprogrammet', 'LÄK', 'professionsprogram', 'Medicin', 330, 5.5),
  ('Tandläkarprogrammet', 'TAND', 'professionsprogram', 'Odontologi', 300, 5.0),
  ('Psykologprogrammet', 'PSY', 'professionsprogram', 'Psykologi', 300, 5.0),
  ('Civilingenjörsprogram datateknik', 'CDAT', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Designprogrammet', 'DESIGN', 'kandidat', 'Design', 180, 3.0),
  ('Arkitektprogrammet', 'ARK', 'professionsprogram', 'Arkitektur', 300, 5.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- Karlstads universitet
WITH kau_id AS (SELECT id FROM universities WHERE short_name = 'KaU')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  kau_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM kau_id,
(VALUES
  ('Civilingenjörsprogram energi- och miljöteknik', 'CEMT', 'civilingenjör', 'Teknik', 300, 5.0),
  ('Ekonomprogrammet', 'EK', 'kandidat', 'Ekonomi', 180, 3.0),
  ('Kandidatprogram i turismprogrammet', 'KTUR', 'kandidat', 'Turism', 180, 3.0),
  ('Kandidatprogram i idrottsvetenskap', 'KIDRT', 'kandidat', 'Idrottsvetenskap', 180, 3.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- Örebro universitet
WITH ou_id AS (SELECT id FROM universities WHERE short_name = 'ÖU')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  ou_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM ou_id,
(VALUES
  ('Juristprogrammet', 'JUR', 'professionsprogram', 'Juridik', 270, 4.5),
  ('Psykologprogrammet', 'PSY', 'professionsprogram', 'Psykologi', 300, 5.0),
  ('Sjuksköterskeprogrammet', 'SJSK', 'professionsprogram', 'Omvårdnad', 180, 3.0),
  ('Ekonomprogrammet', 'EK', 'kandidat', 'Ekonomi', 180, 3.0),
  ('Kandidatprogram i kriminologi', 'KKRIM', 'kandidat', 'Kriminologi', 180, 3.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- Linnéuniversitetet
WITH lnu_id AS (SELECT id FROM universities WHERE short_name = 'LnU')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  lnu_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM lnu_id,
(VALUES
  ('Civilekonomprogrammet', 'CEKON', 'professionsprogram', 'Ekonomi', 240, 4.0),
  ('Kandidatprogram i datavetenskap', 'KDVT', 'kandidat', 'Datavetenskap', 180, 3.0),
  ('Kandidatprogram i spelutveckling', 'KSPEL', 'kandidat', 'Spelutveckling', 180, 3.0),
  ('Kandidatprogram i biologi', 'KBIO', 'kandidat', 'Biologi', 180, 3.0),
  ('Sjökaptensprogrammet', 'SJKAP', 'professionsprogram', 'Sjöfart', 210, 3.5)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

-- Malmö universitet
WITH mau_id AS (SELECT id FROM universities WHERE short_name = 'MAU')
INSERT INTO university_programs (university_id, name, abbreviation, degree_type, field, credits, duration_years)
SELECT 
  mau_id.id,
  program.name,
  program.abbreviation,
  program.degree_type,
  program.field,
  program.credits,
  program.duration_years
FROM mau_id,
(VALUES
  ('Tandläkarprogrammet', 'TAND', 'professionsprogram', 'Odontologi', 300, 5.0),
  ('Kandidatprogram i interaktionsdesign', 'KIAD', 'kandidat', 'Interaktionsdesign', 180, 3.0),
  ('Kandidatprogram i datavetenskap', 'KDVT', 'kandidat', 'Datavetenskap', 180, 3.0),
  ('Ekonomprogrammet', 'EK', 'kandidat', 'Ekonomi', 180, 3.0)
) AS program(name, abbreviation, degree_type, field, credits, duration_years);

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'Antal universitet:' as info, COUNT(*) as antal FROM universities;
SELECT 'Antal program totalt:' as info, COUNT(*) as antal FROM university_programs;
SELECT 'Antal program per lärosäte:' as info;
SELECT u.name, COUNT(p.id) as antal_program
FROM universities u
LEFT JOIN university_programs p ON u.id = p.university_id
GROUP BY u.name
ORDER BY antal_program DESC
LIMIT 20;
