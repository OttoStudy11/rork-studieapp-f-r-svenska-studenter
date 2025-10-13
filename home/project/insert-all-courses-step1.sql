-- ============================================================================
-- STEG 1: INFOGA ALLA GYMNASIEKURSER
-- ============================================================================
-- Detta steg fyller courses-tabellen med alla gymnasiekurser från svenska gymnasiet
-- ============================================================================

-- Rensa befintliga kurser (valfritt - ta bort om du vill behålla befintliga)
-- DELETE FROM courses;

-- ============================================================================
-- GYMNASIEGEMENSAMMA ÄMNEN (Alla program)
-- ============================================================================

-- Svenska
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Svenska 1', 'SVESVE01', 100, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande svenskkurs med fokus på läsning, skrivning och kommunikation'),
('Svenska 2', 'SVESVE02', 100, 2, true, 'gymnasiegemensam', NULL, 'Fördjupning i svenska språket med litteraturanalys och argumenterande texter'),
('Svenska 3', 'SVESVE03', 100, 3, true, 'gymnasiegemensam', NULL, 'Avancerad svenska med fokus på retorik och språklig medvetenhet');

-- Engelska
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Engelska 5', 'ENGENG05', 100, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande engelska med fokus på kommunikation och förståelse'),
('Engelska 6', 'ENGENG06', 100, 2, true, 'gymnasiegemensam', NULL, 'Fördjupning i engelska språket med litteratur och samhällsfrågor'),
('Engelska 7', 'ENGENG07', 100, 3, false, 'gymnasiegemensam', NULL, 'Avancerad engelska med akademiskt skrivande');

-- Matematik
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Matematik 1a', 'MATMAT01a', 100, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande matematik för yrkesförberedande program'),
('Matematik 1b', 'MATMAT01b', 100, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande matematik för samhällsvetenskapliga program'),
('Matematik 1c', 'MATMAT01c', 100, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande matematik för naturvetenskapliga och tekniska program'),
('Matematik 2a', 'MATMAT02a', 100, 2, false, 'gymnasiegemensam', NULL, 'Fortsättningskurs i matematik 1a'),
('Matematik 2b', 'MATMAT02b', 100, 2, false, 'gymnasiegemensam', NULL, 'Fortsättningskurs i matematik 1b'),
('Matematik 2c', 'MATMAT02c', 100, 2, false, 'gymnasiegemensam', NULL, 'Fortsättningskurs i matematik 1c'),
('Matematik 3b', 'MATMAT03b', 100, 3, false, 'gymnasiegemensam', NULL, 'Avancerad matematik för samhällsvetenskapliga program'),
('Matematik 3c', 'MATMAT03c', 100, 3, false, 'gymnasiegemensam', NULL, 'Avancerad matematik för naturvetenskapliga program'),
('Matematik 4', 'MATMAT04', 100, 3, false, 'gymnasiegemensam', NULL, 'Fördjupning i matematik med komplexa tal och differential'),
('Matematik 5', 'MATMAT05', 100, 3, false, 'gymnasiegemensam', NULL, 'Högsta nivån matematik med integraler och differentialekvationer');

-- Historia
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Historia 1a1', 'HISHIS01a1', 50, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande historiekurs del 1'),
('Historia 1a2', 'HISHIS01a2', 50, 2, true, 'gymnasiegemensam', NULL, 'Grundläggande historiekurs del 2'),
('Historia 1b', 'HISHIS01b', 100, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande historiekurs för högskoleförberedande program'),
('Historia 2a', 'HISHIS02a', 100, 2, false, 'gymnasiegemensam', NULL, 'Fördjupning i historia med källkritik'),
('Historia 2b', 'HISHIS02b', 100, 2, false, 'gymnasiegemensam', NULL, 'Fördjupning i historia - kultur och idéer'),
('Historia 3', 'HISHIS03', 100, 3, false, 'gymnasiegemensam', NULL, 'Avancerad historia med historiografi');

-- Samhällskunskap
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Samhällskunskap 1a1', 'SAMSAM01a1', 50, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande samhällskunskap del 1'),
('Samhällskunskap 1a2', 'SAMSAM01a2', 50, 2, true, 'gymnasiegemensam', NULL, 'Grundläggande samhällskunskap del 2'),
('Samhällskunskap 1b', 'SAMSAM01b', 100, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande samhällskunskap för högskoleförberedande program'),
('Samhällskunskap 2', 'SAMSAM02', 100, 2, false, 'gymnasiegemensam', NULL, 'Fördjupning i samhällskunskap med ekonomi och politik'),
('Samhällskunskap 3', 'SAMSAM03', 100, 3, false, 'gymnasiegemensam', NULL, 'Avancerad samhällskunskap med globala perspektiv');

-- Religionskunskap
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Religionskunskap 1', 'RELREL01', 50, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande religionskunskap med världsreligioner'),
('Religionskunskap 2', 'RELREL02', 50, 2, false, 'gymnasiegemensam', NULL, 'Fördjupning i religionskunskap med etik och livsfrågor');

-- Naturkunskap
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Naturkunskap 1a1', 'NAKNAK01a1', 50, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande naturkunskap del 1'),
('Naturkunskap 1a2', 'NAKNAK01a2', 50, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande naturkunskap del 2'),
('Naturkunskap 1b', 'NAKNAK01b', 100, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande naturkunskap för högskoleförberedande program'),
('Naturkunskap 2', 'NAKNAK02', 100, 2, false, 'gymnasiegemensam', NULL, 'Fördjupning i naturkunskap med miljö och hållbarhet');

-- Idrott och hälsa
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Idrott och hälsa 1', 'IDRIDR01', 100, 1, true, 'gymnasiegemensam', NULL, 'Grundläggande idrott och hälsa'),
('Idrott och hälsa 2', 'IDRIDR02', 100, 2, false, 'gymnasiegemensam', NULL, 'Fördjupning i idrott och hälsa');

-- ============================================================================
-- NATURVETENSKAPLIGA ÄMNEN
-- ============================================================================

-- Biologi
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Biologi 1', 'BIOBIO01', 100, 1, false, 'programgemensam', NULL, 'Grundläggande biologi med cell- och evolutionslära'),
('Biologi 2', 'BIOBIO02', 100, 2, false, 'programgemensam', NULL, 'Fördjupning i biologi med ekologi och genetik'),
('Biologi 3', 'BIOBIO03', 100, 3, false, 'programfördjupning', NULL, 'Avancerad biologi med bioteknik');

-- Fysik
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Fysik 1a', 'FYSFYS01a', 150, 1, false, 'programgemensam', NULL, 'Grundläggande fysik med mekanik och energi'),
('Fysik 1b1', 'FYSFYS01b1', 100, 1, false, 'programgemensam', NULL, 'Grundläggande fysik del 1'),
('Fysik 1b2', 'FYSFYS01b2', 100, 2, false, 'programgemensam', NULL, 'Grundläggande fysik del 2'),
('Fysik 2', 'FYSFYS02', 100, 2, false, 'programgemensam', NULL, 'Fördjupning i fysik med elektricitet och vågor'),
('Fysik 3', 'FYSFYS03', 100, 3, false, 'programfördjupning', NULL, 'Avancerad fysik med kvantfysik');

-- Kemi
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Kemi 1', 'KEMKEM01', 100, 1, false, 'programgemensam', NULL, 'Grundläggande kemi med atomlära och kemiska reaktioner'),
('Kemi 2', 'KEMKEM02', 100, 2, false, 'programgemensam', NULL, 'Fördjupning i kemi med organisk kemi'),
('Kemi 3', 'KEMKEM03', 100, 3, false, 'programfördjupning', NULL, 'Avancerad kemi med analytisk kemi');

-- ============================================================================
-- SPRÅK
-- ============================================================================

-- Moderna språk (generiska kurser)
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Moderna språk 1', 'MODXXX01', 100, 1, false, 'programgemensam', NULL, 'Grundläggande moderna språk'),
('Moderna språk 2', 'MODXXX02', 100, 2, false, 'programgemensam', NULL, 'Fortsättning moderna språk'),
('Moderna språk 3', 'MODXXX03', 100, 2, false, 'inriktning', NULL, 'Fördjupning moderna språk'),
('Moderna språk 4', 'MODXXX04', 100, 2, false, 'inriktning', NULL, 'Avancerad moderna språk'),
('Moderna språk 5', 'MODXXX05', 100, 3, false, 'programfördjupning', NULL, 'Högsta nivån moderna språk'),
('Moderna språk 6', 'MODXXX06', 100, 3, false, 'programfördjupning', NULL, 'Specialisering moderna språk'),
('Moderna språk 7', 'MODXXX07', 100, 3, false, 'programfördjupning', NULL, 'Expertis moderna språk');

-- Spanska
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Spanska 1', 'MODSPA01', 100, 1, false, 'individuellt val', NULL, 'Grundläggande spanska'),
('Spanska 2', 'MODSPA02', 100, 2, false, 'individuellt val', NULL, 'Fortsättning spanska'),
('Spanska 3', 'MODSPA03', 100, 2, false, 'individuellt val', NULL, 'Fördjupning spanska'),
('Spanska 4', 'MODSPA04', 100, 3, false, 'individuellt val', NULL, 'Avancerad spanska');

-- Franska
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Franska 1', 'MODFRA01', 100, 1, false, 'individuellt val', NULL, 'Grundläggande franska'),
('Franska 2', 'MODFRA02', 100, 2, false, 'individuellt val', NULL, 'Fortsättning franska'),
('Franska 3', 'MODFRA03', 100, 2, false, 'individuellt val', NULL, 'Fördjupning franska'),
('Franska 4', 'MODFRA04', 100, 3, false, 'individuellt val', NULL, 'Avancerad franska');

-- Tyska
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Tyska 1', 'MODTYS01', 100, 1, false, 'individuellt val', NULL, 'Grundläggande tyska'),
('Tyska 2', 'MODTYS02', 100, 2, false, 'individuellt val', NULL, 'Fortsättning tyska'),
('Tyska 3', 'MODTYS03', 100, 2, false, 'individuellt val', NULL, 'Fördjupning tyska'),
('Tyska 4', 'MODTYS04', 100, 3, false, 'individuellt val', NULL, 'Avancerad tyska');

-- Latin
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Latin - språk och kultur 1', 'LATLAT01', 100, 2, false, 'inriktning', NULL, 'Grundläggande latin'),
('Latin - språk och kultur 2', 'LATLAT02', 100, 3, false, 'programfördjupning', NULL, 'Fördjupning i latin');

-- ============================================================================
-- SAMHÄLLSVETENSKAPLIGA ÄMNEN
-- ============================================================================

-- Psykologi
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Psykologi 1', 'PSKPSY01', 50, 1, false, 'programgemensam', NULL, 'Grundläggande psykologi'),
('Psykologi 2a', 'PSKPSY02a', 50, 2, false, 'programfördjupning', NULL, 'Fördjupning i psykologi'),
('Psykologi 2b', 'PSKPSY02b', 100, 3, false, 'programfördjupning', NULL, 'Avancerad psykologi');

-- Filosofi
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Filosofi 1', 'FIOFIO01', 50, 1, false, 'programgemensam', NULL, 'Grundläggande filosofi med etik och kunskapsteori'),
('Filosofi 2', 'FIOFIO02', 100, 3, false, 'programfördjupning', NULL, 'Fördjupning i filosofi');

-- Företagsekonomi
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Företagsekonomi 1', 'FÖRFÖR01', 100, 1, false, 'programgemensam', NULL, 'Grundläggande företagsekonomi'),
('Företagsekonomi 2', 'FÖRFÖR02', 100, 2, false, 'programgemensam', NULL, 'Fördjupning i företagsekonomi'),
('Företagsekonomi - specialisering', 'FÖRSPE01', 100, 3, false, 'programfördjupning', NULL, 'Specialisering i företagsekonomi');

-- Juridik
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Privatjuridik', 'JURPRI01', 100, 1, false, 'programgemensam', NULL, 'Grundläggande privatjuridik'),
('Affärsjuridik', 'JURAFF01', 100, 2, false, 'inriktning', NULL, 'Affärsjuridik för ekonomer');

-- Entreprenörskap
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Entreprenörskap och företagande', 'ENTENT01', 100, 2, false, 'inriktning', NULL, 'Grundläggande entreprenörskap'),
('Entreprenörskap 2', 'ENTENT02', 100, 3, false, 'programfördjupning', NULL, 'Fördjupning i entreprenörskap');

-- Marknadsföring
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Marknadsföring', 'MARMAR01', 100, 2, false, 'inriktning', NULL, 'Grundläggande marknadsföring'),
('Marknadsföring och kommunikation', 'MARMAR02', 100, 3, false, 'programfördjupning', NULL, 'Fördjupning i marknadsföring');

-- Redovisning
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Redovisning 1', 'REDRED01', 100, 2, false, 'inriktning', NULL, 'Grundläggande redovisning'),
('Redovisning 2', 'REDRED02', 100, 3, false, 'programfördjupning', NULL, 'Fördjupning i redovisning');

-- Internationella relationer
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Internationella relationer', 'INTINT01', 100, 3, false, 'individuellt val', NULL, 'Internationell politik och diplomati'),
('Internationell ekonomi', 'INTEKO01', 100, 3, false, 'individuellt val', NULL, 'Global ekonomi och handel');

-- Ledarskap
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Ledarskap och organisation', 'LEDLED01', 100, 3, false, 'individuellt val', NULL, 'Ledarskap och organisationsteori');

-- ============================================================================
-- TEKNIK OCH PROGRAMMERING
-- ============================================================================

-- Teknik
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Teknik 1', 'TEKTEK01', 150, 1, false, 'programgemensam', NULL, 'Grundläggande teknik'),
('Teknik 2', 'TEKTEK02', 100, 2, false, 'programgemensam', NULL, 'Fördjupning i teknik');

-- Programmering
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Programmering 1', 'PRRPRR01', 100, 2, false, 'inriktning', NULL, 'Grundläggande programmering'),
('Programmering 2', 'PRRPRR02', 100, 3, false, 'programfördjupning', NULL, 'Fördjupning i programmering'),
('Tillämpad programmering', 'TILTIL01', 100, 3, false, 'individuellt val', NULL, 'Praktisk programmering');

-- Webbutveckling
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Webbutveckling 1', 'WEUWEB01', 100, 2, false, 'inriktning', NULL, 'Grundläggande webbutveckling'),
('Webbutveckling 2', 'WEUWEB02', 100, 3, false, 'programfördjupning', NULL, 'Fördjupning i webbutveckling'),
('Webbutveckling 3', 'WEUWEB03', 100, 3, false, 'programfördjupning', NULL, 'Avancerad webbutveckling');

-- Dator- och nätverksteknik
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Dator- och nätverksteknik', 'DATDAT01', 100, 2, false, 'inriktning', NULL, 'Grundläggande dator- och nätverksteknik'),
('Datorteknik 1a', 'DATDAT01a', 100, 2, false, 'inriktning', NULL, 'Datorteknik och hårdvara');

-- ============================================================================
-- ESTETISKA ÄMNEN
-- ============================================================================

-- Estetisk kommunikation
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Estetisk kommunikation 1', 'ESTEST01', 100, 1, false, 'programgemensam', NULL, 'Grundläggande estetisk kommunikation'),
('Estetisk kommunikation 2', 'ESTEST02', 100, 2, false, 'programgemensam', NULL, 'Fördjupning i estetisk kommunikation');

-- Konst
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Konstarterna och samhället', 'KONKON01', 50, 1, false, 'programgemensam', NULL, 'Konsthistoria och samhälle');

-- Musik
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Ensemble med körsång', 'MUSENS01', 200, 1, false, 'inriktning', NULL, 'Ensemble och körsång'),
('Ensemble 2', 'MUSENS02', 100, 2, false, 'inriktning', NULL, 'Fortsättning ensemble'),
('Gehörs- och musiklära 1', 'MUSGEH01', 100, 1, false, 'inriktning', NULL, 'Grundläggande gehör och musiklära'),
('Gehörs- och musiklära 2', 'MUSGEH02', 100, 2, false, 'inriktning', NULL, 'Fördjupning i gehör och musiklära'),
('Instrument eller sång 1', 'MUSINS01', 100, 1, false, 'inriktning', NULL, 'Grundläggande instrument eller sång'),
('Instrument eller sång 2', 'MUSINS02', 100, 2, false, 'inriktning', NULL, 'Fördjupning i instrument eller sång'),
('Musikproduktion', 'MUSPRO01', 100, 3, false, 'programfördjupning', NULL, 'Digital musikproduktion');

-- Scenisk gestaltning
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Scenisk gestaltning', 'SCNSCE01', 100, 3, false, 'individuellt val', NULL, 'Teater och scenkonst');

-- ============================================================================
-- HUMANISTISKA ÄMNEN
-- ============================================================================

-- Människans språk
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Människans språk 1', 'MÄSMÄS01', 100, 1, false, 'programgemensam', NULL, 'Språkvetenskap och lingvistik'),
('Människans språk 2', 'MÄSMÄS02', 100, 2, false, 'programgemensam', NULL, 'Fördjupning i språkvetenskap');

-- Retorik
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Retorik', 'RETRET01', 100, 3, false, 'individuellt val', NULL, 'Retorik och kommunikation');

-- Skrivande
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Skrivande', 'SVESKR01', 100, 3, false, 'individuellt val', NULL, 'Kreativt och akademiskt skrivande');

-- ============================================================================
-- VÅRD OCH OMSORG
-- ============================================================================

-- Hälsopedagogik
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Hälsopedagogik', 'HÄLHÄL01', 100, 1, false, 'programgemensam', NULL, 'Grundläggande hälsopedagogik');

-- Medicin
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Medicin 1', 'MEDMED01', 150, 1, false, 'programgemensam', NULL, 'Grundläggande medicin och anatomi'),
('Medicin 2', 'MEDMED02', 100, 3, false, 'programfördjupning', NULL, 'Fördjupning i medicin');

-- Etik
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Etik och människans livsvillkor', 'ETIETI01', 100, 1, false, 'programgemensam', NULL, 'Etik och livsåskådning');

-- Psykiatri
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Psykiatri 1', 'PSYPSY01', 100, 1, false, 'programgemensam', NULL, 'Grundläggande psykiatri');

-- Specialpedagogik
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Specialpedagogik 1', 'SPCSPC01', 100, 1, false, 'programgemensam', NULL, 'Grundläggande specialpedagogik');

-- Vård och omsorg
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Vård- och omsorgsarbete 1', 'VÅRVÅR01', 200, 2, false, 'inriktning', NULL, 'Grundläggande vård och omsorg'),
('Vård- och omsorgsarbete 2', 'VÅRVÅR02', 150, 2, false, 'inriktning', NULL, 'Fördjupning i vård och omsorg');

-- ============================================================================
-- BARN OCH FRITID
-- ============================================================================

-- Kommunikation
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Kommunikation', 'KOMKOM01', 100, 1, false, 'programgemensam', NULL, 'Kommunikation och samspel');

-- Lärande och utveckling
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Lärande och utveckling', 'LÄRLÄR01', 100, 1, false, 'programgemensam', NULL, 'Barns lärande och utveckling');

-- Människors miljöer
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Människors miljöer', 'MÄNMÄN01', 100, 1, false, 'programgemensam', NULL, 'Miljöer för barn och unga');

-- Pedagogiskt ledarskap
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Pedagogiskt ledarskap', 'PEDPED01', 100, 1, false, 'programgemensam', NULL, 'Grundläggande pedagogiskt ledarskap'),
('Pedagogiskt arbete', 'PEDPED02', 200, 2, false, 'inriktning', NULL, 'Praktiskt pedagogiskt arbete');

-- Barns lärande
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Barns lärande och växande', 'BARBAR01', 100, 2, false, 'inriktning', NULL, 'Barns utveckling och lärande');

-- Skapande verksamhet
INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Skapande verksamhet', 'SKASKA01', 100, 2, false, 'inriktning', NULL, 'Kreativa aktiviteter för barn');

-- ============================================================================
-- YRKESPROGRAM - BYGG OCH ANLÄGGNING
-- ============================================================================

INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Bygg och anläggning 1', 'BYGBYG01', 200, 1, false, 'programgemensam', NULL, 'Grundläggande bygg och anläggning'),
('Bygg och anläggning 2', 'BYGBYG02', 200, 2, false, 'inriktning', NULL, 'Fördjupning i bygg och anläggning'),
('Husbyggnad 1', 'BUSHUS01', 200, 2, false, 'inriktning', NULL, 'Husbyggnadsteknik'),
('Platsbyggnad 1', 'BYPPLÅ01', 200, 2, false, 'inriktning', NULL, 'Platsbyggnad och anläggning');

-- ============================================================================
-- YRKESPROGRAM - EL OCH ENERGI
-- ============================================================================

INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Ellära', 'ELRELL01', 100, 1, false, 'programgemensam', NULL, 'Grundläggande ellära'),
('Elektriska installationer 1', 'ELRELE01', 200, 1, false, 'programgemensam', NULL, 'Grundläggande elinstallationer'),
('Elektriska installationer 2', 'ELRELE02', 200, 2, false, 'inriktning', NULL, 'Fördjupning i elinstallationer'),
('Datorteknik - el', 'DATDAT02', 100, 2, false, 'inriktning', NULL, 'Datorteknik för elektriker');

-- ============================================================================
-- YRKESPROGRAM - FORDON OCH TRANSPORT
-- ============================================================================

INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Fordonsteknik', 'FORFOR01', 200, 1, false, 'programgemensam', NULL, 'Grundläggande fordonsteknik'),
('Fordonsmekanik', 'FORMEK01', 200, 2, false, 'inriktning', NULL, 'Fordonsmekanik och reparation'),
('Karosseri och lackering', 'FORKAR01', 200, 2, false, 'inriktning', NULL, 'Karosseriarbete och lackering');

-- ============================================================================
-- YRKESPROGRAM - HANDEL OCH ADMINISTRATION
-- ============================================================================

INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Handel och administration 1', 'HANHAN01', 200, 1, false, 'programgemensam', NULL, 'Grundläggande handel och administration'),
('Handel och administration 2', 'HANHAN02', 200, 2, false, 'inriktning', NULL, 'Fördjupning i handel och administration'),
('Butikssäljare - specialisering', 'HANHAN03', 200, 2, false, 'inriktning', NULL, 'Butikssäljare och kundservice');

-- ============================================================================
-- YRKESPROGRAM - HOTELL OCH TURISM
-- ============================================================================

INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Hotell och turism 1', 'HOTHOT01', 200, 1, false, 'programgemensam', NULL, 'Grundläggande hotell och turism'),
('Hotell och turism 2', 'HOTHOT02', 200, 2, false, 'inriktning', NULL, 'Fördjupning i hotell och turism'),
('Reception', 'HOTREC01', 200, 2, false, 'inriktning', NULL, 'Receptionsarbete');

-- ============================================================================
-- YRKESPROGRAM - RESTAURANG OCH LIVSMEDEL
-- ============================================================================

INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Matlagning 1', 'RESMAT01', 200, 1, false, 'programgemensam', NULL, 'Grundläggande matlagning'),
('Matlagning 2', 'RESMAT02', 200, 2, false, 'inriktning', NULL, 'Fördjupning i matlagning'),
('Bageri och konditori 1', 'RESBAG01', 200, 2, false, 'inriktning', NULL, 'Bageri och konditori'),
('Servering och dryck 1', 'RESESR01', 200, 2, false, 'inriktning', NULL, 'Servering och dryckeskunskap');

-- ============================================================================
-- YRKESPROGRAM - INDUSTRITEKNISKA
-- ============================================================================

INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Industriteknisk fördjupning', 'INDIND01', 200, 1, false, 'programgemensam', NULL, 'Grundläggande industriteknik'),
('Produktionsteknik 1', 'PRDPRO01', 200, 2, false, 'inriktning', NULL, 'Produktionsteknik och automation'),
('Svets 1', 'SVESVE01', 200, 2, false, 'inriktning', NULL, 'Grundläggande svetsning');

-- ============================================================================
-- YRKESPROGRAM - VVS OCH FASTIGHET
-- ============================================================================

INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('VVS 1', 'VVSVVS01', 200, 1, false, 'programgemensam', NULL, 'Grundläggande VVS'),
('VVS 2', 'VVSVVS02', 200, 2, false, 'inriktning', NULL, 'Fördjupning i VVS'),
('Fastighet och förvaltning', 'FASFAS01', 200, 2, false, 'inriktning', NULL, 'Fastighetsförvaltning');

-- ============================================================================
-- YRKESPROGRAM - NATURBRUK
-- ============================================================================

INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Naturbruk 1', 'NATNAT01', 200, 1, false, 'programgemensam', NULL, 'Grundläggande naturbruk'),
('Djurvård 1', 'DJUDJV01', 200, 2, false, 'inriktning', NULL, 'Djurvård och djurhållning'),
('Växtodling 1', 'VÄXVÄX01', 200, 2, false, 'inriktning', NULL, 'Växtodling och trädgård'),
('Skogsbruk 1', 'SKOSKO01', 200, 2, false, 'inriktning', NULL, 'Skogsbruk och skogsvård');

-- ============================================================================
-- YRKESPROGRAM - HANTVERKSPROGRAM
-- ============================================================================

INSERT INTO courses (name, code, points, year, mandatory, category, program_id, description) VALUES
('Hantverk 1', 'HANHAN04', 200, 1, false, 'programgemensam', NULL, 'Grundläggande hantverk'),
('Hantverk 2', 'HANHAN05', 200, 2, false, 'inriktning', NULL, 'Fördjupning i hantverk'),
('Textilt hantverk', 'HANTEX01', 200, 2, false, 'inriktning', NULL, 'Textilt hantverk och design'),
('Trähantverk', 'HANTRÄ01', 200, 2, false, 'inriktning', NULL, 'Trähantverk och möbelsnickeri');

-- ============================================================================
-- STEG 1 KLART!
-- ============================================================================
-- Alla gymnasiekurser har nu lagts till i databasen
-- Nästa steg: Kör insert-all-study-tips-step2.sql för studietips
-- ============================================================================
