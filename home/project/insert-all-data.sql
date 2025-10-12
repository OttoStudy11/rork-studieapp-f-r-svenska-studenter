-- =====================================================
-- KOMPLETT DATAINMATNING FÖR STUDIEAPPEN
-- =====================================================
-- Detta script matar in all data för:
-- 1. Gymnasium
-- 2. Gymnasieprogram
-- 3. Kurser (kopplade till program)
-- 4. Högskolor/Universitet
-- 5. Universitetsprogram
-- =====================================================

BEGIN;

-- =====================================================
-- 1. RENSA BEFINTLIG DATA (för att undvika dubbletter)
-- =====================================================

DELETE FROM user_courses;
DELETE FROM courses;
DELETE FROM programs;
DELETE FROM gymnasiums;
DELETE FROM universities;
DELETE FROM university_programs;

-- =====================================================
-- 2. MATA IN GYMNASIUM
-- =====================================================

INSERT INTO gymnasiums (id, name, city, type) VALUES
-- Stockholm
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
(gen_random_uuid(), 'Nacka gymnasium', 'Nacka', 'public'),
(gen_random_uuid(), 'Rudbeck', 'Sollentuna', 'public'),
(gen_random_uuid(), 'S:t Eriks gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Spånga gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Stockholms estetiska gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Thorildsplans gymnasium', 'Stockholm', 'public'),
(gen_random_uuid(), 'Tumba gymnasium', 'Botkyrka', 'public'),
(gen_random_uuid(), 'Viktor Rydberg gymnasium', 'Stockholm', 'private'),
(gen_random_uuid(), 'Åsö gymnasium', 'Stockholm', 'public'),

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

-- Malmö
(gen_random_uuid(), 'Malmö Borgarskola', 'Malmö', 'public'),
(gen_random_uuid(), 'Malmö latinskola', 'Malmö', 'public'),
(gen_random_uuid(), 'Pauliskolan', 'Malmö', 'private'),
(gen_random_uuid(), 'S:t Petri skola', 'Malmö', 'private'),
(gen_random_uuid(), 'Heleneholms gymnasium', 'Malmö', 'public'),
(gen_random_uuid(), 'John Bauer gymnasiet Malmö', 'Malmö', 'private'),
(gen_random_uuid(), 'Malmö idrottsgymnasium', 'Malmö', 'public'),
(gen_random_uuid(), 'Montessorigymnasiet', 'Malmö', 'private'),

-- Uppsala
(gen_random_uuid(), 'Katedralskolan', 'Uppsala', 'public'),
(gen_random_uuid(), 'Lundellska skolan', 'Uppsala', 'public'),
(gen_random_uuid(), 'Rosendalsgymnasiet', 'Uppsala', 'public'),
(gen_random_uuid(), 'Fyrisskolan', 'Uppsala', 'public'),
(gen_random_uuid(), 'Celsiusskolan', 'Uppsala', 'public'),
(gen_random_uuid(), 'GUC - Gymnasieskolan Uppsala', 'Uppsala', 'private'),

-- Linköping
(gen_random_uuid(), 'Berzeliusskolan', 'Linköping', 'public'),
(gen_random_uuid(), 'Folkungaskolan', 'Linköping', 'public'),
(gen_random_uuid(), 'Katedralskolan Linköping', 'Linköping', 'public'),
(gen_random_uuid(), 'Anders Ljungstedts gymnasium', 'Linköping', 'public'),

-- Lund
(gen_random_uuid(), 'Katedralskolan Lund', 'Lund', 'public'),
(gen_random_uuid(), 'Polhemskolan', 'Lund', 'public'),
(gen_random_uuid(), 'Spyken', 'Lund', 'public'),

-- Örebro
(gen_random_uuid(), 'Karolinska gymnasiet', 'Örebro', 'public'),
(gen_random_uuid(), 'Rudbecksgymnasiet', 'Örebro', 'public'),
(gen_random_uuid(), 'Tullängsgymnasiet', 'Örebro', 'public'),
(gen_random_uuid(), 'Virginska gymnasiet', 'Örebro', 'public');

-- =====================================================
-- 3. MATA IN GYMNASIEPROGRAM
-- =====================================================

INSERT INTO programs (id, name, type, description) VALUES
-- Högskoleförberedande program
(gen_random_uuid(), 'Naturvetenskapsprogrammet', 'gymnasium', 'Högskoleförberedande program med fokus på naturvetenskap och matematik'),
(gen_random_uuid(), 'Teknikprogrammet', 'gymnasium', 'Högskoleförberedande program med fokus på teknik och ingenjörsvetenskap'),
(gen_random_uuid(), 'Samhällsvetenskapsprogrammet', 'gymnasium', 'Högskoleförberedande program med fokus på samhällsvetenskap'),
(gen_random_uuid(), 'Ekonomiprogrammet', 'gymnasium', 'Högskoleförberedande program med fokus på ekonomi och företagande'),
(gen_random_uuid(), 'Estetiska programmet', 'gymnasium', 'Högskoleförberedande program med fokus på konst, musik, dans och teater'),
(gen_random_uuid(), 'Humanistiska programmet', 'gymnasium', 'Högskoleförberedande program med fokus på språk och kultur'),

-- Yrkesprogram
(gen_random_uuid(), 'Barn- och fritidsprogrammet', 'gymnasium', 'Yrkesprogram för arbete med barn och ungdomar'),
(gen_random_uuid(), 'Bygg- och anläggningsprogrammet', 'gymnasium', 'Yrkesprogram för byggbranschen'),
(gen_random_uuid(), 'El- och energiprogrammet', 'gymnasium', 'Yrkesprogram för el- och energibranschen'),
(gen_random_uuid(), 'Fordons- och transportprogrammet', 'gymnasium', 'Yrkesprogram för fordonsbranschen'),
(gen_random_uuid(), 'Handels- och administrationsprogrammet', 'gymnasium', 'Yrkesprogram för handel och administration'),
(gen_random_uuid(), 'Hantverksprogrammet', 'gymnasium', 'Yrkesprogram för olika hantverksyrken'),
(gen_random_uuid(), 'Hotell- och turismprogrammet', 'gymnasium', 'Yrkesprogram för hotell- och turismbranschen'),
(gen_random_uuid(), 'Industritekniska programmet', 'gymnasium', 'Yrkesprogram för industribranschen'),
(gen_random_uuid(), 'Naturbruksprogrammet', 'gymnasium', 'Yrkesprogram för lantbruk, skog och djurvård'),
(gen_random_uuid(), 'Restaurang- och livsmedelsprogrammet', 'gymnasium', 'Yrkesprogram för restaurang- och livsmedelsbranschen'),
(gen_random_uuid(), 'VVS- och fastighetsprogrammet', 'gymnasium', 'Yrkesprogram för VVS och fastighetsförvaltning'),
(gen_random_uuid(), 'Vård- och omsorgsprogrammet', 'gymnasium', 'Yrkesprogram för vård och omsorg'),

-- Internationella program
(gen_random_uuid(), 'International Baccalaureate', 'gymnasium', 'Internationellt högskoleförberedande program');

-- =====================================================
-- 4. MATA IN KURSER FÖR VARJE PROGRAM
-- =====================================================

-- Hämta program-ID för att koppla kurser
DO $$
DECLARE
    nat_id UUID;
    tek_id UUID;
    sam_id UUID;
    eko_id UUID;
    est_id UUID;
    hum_id UUID;
    bar_id UUID;
    byg_id UUID;
    ele_id UUID;
    for_id UUID;
    han_id UUID;
    hnt_id UUID;
    hot_id UUID;
    ind_id UUID;
    nab_id UUID;
    res_id UUID;
    vvs_id UUID;
    var_id UUID;
    ib_id UUID;
BEGIN
    -- Hämta program-ID
    SELECT id INTO nat_id FROM programs WHERE name = 'Naturvetenskapsprogrammet';
    SELECT id INTO tek_id FROM programs WHERE name = 'Teknikprogrammet';
    SELECT id INTO sam_id FROM programs WHERE name = 'Samhällsvetenskapsprogrammet';
    SELECT id INTO eko_id FROM programs WHERE name = 'Ekonomiprogrammet';
    SELECT id INTO est_id FROM programs WHERE name = 'Estetiska programmet';
    SELECT id INTO hum_id FROM programs WHERE name = 'Humanistiska programmet';
    SELECT id INTO bar_id FROM programs WHERE name = 'Barn- och fritidsprogrammet';
    SELECT id INTO byg_id FROM programs WHERE name = 'Bygg- och anläggningsprogrammet';
    SELECT id INTO ele_id FROM programs WHERE name = 'El- och energiprogrammet';
    SELECT id INTO for_id FROM programs WHERE name = 'Fordons- och transportprogrammet';
    SELECT id INTO han_id FROM programs WHERE name = 'Handels- och administrationsprogrammet';
    SELECT id INTO hnt_id FROM programs WHERE name = 'Hantverksprogrammet';
    SELECT id INTO hot_id FROM programs WHERE name = 'Hotell- och turismprogrammet';
    SELECT id INTO ind_id FROM programs WHERE name = 'Industritekniska programmet';
    SELECT id INTO nab_id FROM programs WHERE name = 'Naturbruksprogrammet';
    SELECT id INTO res_id FROM programs WHERE name = 'Restaurang- och livsmedelsprogrammet';
    SELECT id INTO vvs_id FROM programs WHERE name = 'VVS- och fastighetsprogrammet';
    SELECT id INTO var_id FROM programs WHERE name = 'Vård- och omsorgsprogrammet';
    SELECT id INTO ib_id FROM programs WHERE name = 'International Baccalaureate';

    -- NATURVETENSKAPSPROGRAMMET
    INSERT INTO courses (id, program_id, code, name, points, year, mandatory, category) VALUES
    (gen_random_uuid(), nat_id, 'ENGENG05', 'Engelska 5', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'ENGENG06', 'Engelska 6', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'HISHIS01b', 'Historia 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'IDRIDR01', 'Idrott och hälsa 1', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'IDRIDR02', 'Idrott och hälsa 2', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'MATMAT01b', 'Matematik 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'MATMAT02b', 'Matematik 2b', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'RELREL01', 'Religionskunskap 1', 50, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'SAMSAM01b', 'Samhällskunskap 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'SVESVE01', 'Svenska 1', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'SVESVE02', 'Svenska 2', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'SVESVE03', 'Svenska 3', 100, 3, true, 'gymnasiegemensam'),
    (gen_random_uuid(), nat_id, 'BIOBIO01', 'Biologi 1', 100, 1, true, 'programgemensam'),
    (gen_random_uuid(), nat_id, 'FYSFYS01a', 'Fysik 1a', 150, 1, true, 'programgemensam'),
    (gen_random_uuid(), nat_id, 'KEMKEM01', 'Kemi 1', 100, 1, true, 'programgemensam'),
    (gen_random_uuid(), nat_id, 'MATMAT03b', 'Matematik 3b', 100, 2, true, 'programgemensam'),
    (gen_random_uuid(), nat_id, 'MATMAT04', 'Matematik 4', 100, 3, true, 'programgemensam'),
    (gen_random_uuid(), nat_id, 'MODMOD', 'Moderna språk', 100, 1, true, 'programgemensam'),
    (gen_random_uuid(), nat_id, 'BIOBIO02', 'Biologi 2', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), nat_id, 'FYSFYS02', 'Fysik 2', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), nat_id, 'KEMKEM02', 'Kemi 2', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), nat_id, 'MATMAT05', 'Matematik 5', 100, 3, false, 'inriktning'),
    (gen_random_uuid(), nat_id, 'GEOGEO01', 'Geografi 1', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), nat_id, 'SAMSAM02', 'Samhällskunskap 2', 100, 2, false, 'inriktning');

    -- TEKNIKPROGRAMMET
    INSERT INTO courses (id, program_id, code, name, points, year, mandatory, category) VALUES
    (gen_random_uuid(), tek_id, 'ENGENG05', 'Engelska 5', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'ENGENG06', 'Engelska 6', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'HISHIS01b', 'Historia 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'IDRIDR01', 'Idrott och hälsa 1', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'IDRIDR02', 'Idrott och hälsa 2', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'MATMAT01b', 'Matematik 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'MATMAT02b', 'Matematik 2b', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'RELREL01', 'Religionskunskap 1', 50, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'SAMSAM01b', 'Samhällskunskap 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'SVESVE01', 'Svenska 1', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'SVESVE02', 'Svenska 2', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'SVESVE03', 'Svenska 3', 100, 3, true, 'gymnasiegemensam'),
    (gen_random_uuid(), tek_id, 'FYSFYS01a', 'Fysik 1a', 150, 1, true, 'programgemensam'),
    (gen_random_uuid(), tek_id, 'KEMKEM01', 'Kemi 1', 100, 1, true, 'programgemensam'),
    (gen_random_uuid(), tek_id, 'MATMAT03c', 'Matematik 3c', 100, 2, true, 'programgemensam'),
    (gen_random_uuid(), tek_id, 'MATMAT04', 'Matematik 4', 100, 3, true, 'programgemensam'),
    (gen_random_uuid(), tek_id, 'TEKTEO01', 'Teknik 1', 150, 1, true, 'programgemensam'),
    (gen_random_uuid(), tek_id, 'DAODAT01', 'Dator- och nätverksteknik', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), tek_id, 'PRRPRR01', 'Programmering 1', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), tek_id, 'PRRPRR02', 'Programmering 2', 100, 3, false, 'inriktning'),
    (gen_random_uuid(), tek_id, 'WEBWEB01', 'Webbutveckling 1', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), tek_id, 'WEBWEB02', 'Webbutveckling 2', 100, 3, false, 'inriktning');

    -- SAMHÄLLSVETENSKAPSPROGRAMMET
    INSERT INTO courses (id, program_id, code, name, points, year, mandatory, category) VALUES
    (gen_random_uuid(), sam_id, 'ENGENG05', 'Engelska 5', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'ENGENG06', 'Engelska 6', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'HISHIS01b', 'Historia 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'IDRIDR01', 'Idrott och hälsa 1', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'IDRIDR02', 'Idrott och hälsa 2', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'MATMAT01b', 'Matematik 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'MATMAT02b', 'Matematik 2b', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'RELREL01', 'Religionskunskap 1', 50, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'SAMSAM01b', 'Samhällskunskap 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'SVESVE01', 'Svenska 1', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'SVESVE02', 'Svenska 2', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'SVESVE03', 'Svenska 3', 100, 3, true, 'gymnasiegemensam'),
    (gen_random_uuid(), sam_id, 'FILFIL01', 'Filosofi 1', 50, 1, true, 'programgemensam'),
    (gen_random_uuid(), sam_id, 'MODMOD', 'Moderna språk', 200, 1, true, 'programgemensam'),
    (gen_random_uuid(), sam_id, 'PSKPSY01', 'Psykologi 1', 50, 1, true, 'programgemensam'),
    (gen_random_uuid(), sam_id, 'KOTKMU01', 'Kommunikation', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), sam_id, 'PSKPSY02a', 'Psykologi 2a', 50, 2, false, 'inriktning'),
    (gen_random_uuid(), sam_id, 'SOCSOC01', 'Sociologi', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), sam_id, 'HISHIS02a', 'Historia 2a', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), sam_id, 'RELREL02', 'Religionskunskap 2', 50, 2, false, 'inriktning'),
    (gen_random_uuid(), sam_id, 'SAMSAM02', 'Samhällskunskap 2', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), sam_id, 'SAMSAM03', 'Samhällskunskap 3', 100, 3, false, 'inriktning');

    -- EKONOMIPROGRAMMET
    INSERT INTO courses (id, program_id, code, name, points, year, mandatory, category) VALUES
    (gen_random_uuid(), eko_id, 'ENGENG05', 'Engelska 5', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'ENGENG06', 'Engelska 6', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'HISHIS01b', 'Historia 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'IDRIDR01', 'Idrott och hälsa 1', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'IDRIDR02', 'Idrott och hälsa 2', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'MATMAT01b', 'Matematik 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'MATMAT02b', 'Matematik 2b', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'RELREL01', 'Religionskunskap 1', 50, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'SAMSAM01b', 'Samhällskunskap 1b', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'SVESVE01', 'Svenska 1', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'SVESVE02', 'Svenska 2', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'SVESVE03', 'Svenska 3', 100, 3, true, 'gymnasiegemensam'),
    (gen_random_uuid(), eko_id, 'FÖRFÖR01', 'Företagsekonomi 1', 100, 1, true, 'programgemensam'),
    (gen_random_uuid(), eko_id, 'JURJUR01', 'Juridik 1', 100, 1, true, 'programgemensam'),
    (gen_random_uuid(), eko_id, 'MODMOD', 'Moderna språk', 200, 1, true, 'programgemensam'),
    (gen_random_uuid(), eko_id, 'PSKPSY01', 'Psykologi 1', 50, 1, true, 'programgemensam'),
    (gen_random_uuid(), eko_id, 'FÖRFÖR02', 'Företagsekonomi 2', 100, 2, false, 'inriktning'),
    (gen_random_uuid(), eko_id, 'MATMAT03b', 'Matematik 3b', 100, 3, false, 'inriktning'),
    (gen_random_uuid(), eko_id, 'ENTENT01', 'Entreprenörskap och företagande', 100, 2, false, 'inriktning');

    -- VÅRD- OCH OMSORGSPROGRAMMET
    INSERT INTO courses (id, program_id, code, name, points, year, mandatory, category) VALUES
    (gen_random_uuid(), var_id, 'ENGENG05', 'Engelska 5', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), var_id, 'HISHIS01a1', 'Historia 1a1', 50, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), var_id, 'IDRIDR01', 'Idrott och hälsa 1', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), var_id, 'MATMAT01a', 'Matematik 1a', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), var_id, 'RELREL01', 'Religionskunskap 1', 50, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), var_id, 'SVESVE01', 'Svenska 1', 100, 1, true, 'gymnasiegemensam'),
    (gen_random_uuid(), var_id, 'SVESVE02', 'Svenska 2', 100, 2, true, 'gymnasiegemensam'),
    (gen_random_uuid(), var_id, 'HÄLHÄL01', 'Hälsopedagogik', 100, 1, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'MEDMED01', 'Medicin 1', 150, 1, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'ETIETK01', 'Etik och människans livsvillkor', 100, 1, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'PSKPSY01', 'Psykologi 1', 50, 1, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'PSKPSY02a', 'Psykiatri 1', 100, 2, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'SAMSAM01a2', 'Samhällskunskap 1a2', 50, 1, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'SPEPED01', 'Specialpedagogik 1', 100, 2, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'GERGEA01', 'Gerontologi och geriatrik', 100, 2, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'HÄLHSO01', 'Hälso- och sjukvård 1', 100, 2, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'HÄLHSO02', 'Hälso- och sjukvård 2', 100, 3, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'OMVOMV01', 'Omvårdnad 1', 100, 2, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'OMVOMV02', 'Omvårdnad 2', 100, 3, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'SOCSOC01', 'Social omsorg 1', 100, 2, true, 'programgemensam'),
    (gen_random_uuid(), var_id, 'SOCSOC02', 'Social omsorg 2', 100, 3, true, 'programgemensam');

END $$;

-- =====================================================
-- 5. MATA IN HÖGSKOLOR OCH UNIVERSITET
-- =====================================================

INSERT INTO universities (id, name, city, type, category) VALUES
-- Stora universitet
(gen_random_uuid(), 'Uppsala universitet', 'Uppsala', 'public', 'universitet'),
(gen_random_uuid(), 'Lunds universitet', 'Lund', 'public', 'universitet'),
(gen_random_uuid(), 'Göteborgs universitet', 'Göteborg', 'public', 'universitet'),
(gen_random_uuid(), 'Stockholms universitet', 'Stockholm', 'public', 'universitet'),
(gen_random_uuid(), 'Umeå universitet', 'Umeå', 'public', 'universitet'),
(gen_random_uuid(), 'Linköpings universitet', 'Linköping', 'public', 'universitet'),
(gen_random_uuid(), 'Karolinska Institutet', 'Stockholm', 'public', 'universitet'),
(gen_random_uuid(), 'Kungliga Tekniska högskolan (KTH)', 'Stockholm', 'public', 'universitet'),
(gen_random_uuid(), 'Luleå tekniska universitet', 'Luleå', 'public', 'universitet'),
(gen_random_uuid(), 'Sveriges lantbruksuniversitet (SLU)', 'Uppsala', 'public', 'universitet'),
(gen_random_uuid(), 'Karlstads universitet', 'Karlstad', 'public', 'universitet'),
(gen_random_uuid(), 'Linnéuniversitetet', 'Växjö', 'public', 'universitet'),
(gen_random_uuid(), 'Örebro universitet', 'Örebro', 'public', 'universitet'),
(gen_random_uuid(), 'Mittuniversitetet', 'Sundsvall', 'public', 'universitet'),
(gen_random_uuid(), 'Malmö universitet', 'Malmö', 'public', 'universitet'),

-- Tekniska högskolor
(gen_random_uuid(), 'Chalmers tekniska högskola', 'Göteborg', 'private', 'teknisk_högskola'),
(gen_random_uuid(), 'Blekinge tekniska högskola', 'Karlskrona', 'public', 'teknisk_högskola'),
(gen_random_uuid(), 'Mälardalens universitet', 'Västerås', 'public', 'högskola'),

-- Handelshögskolor
(gen_random_uuid(), 'Handelshögskolan i Stockholm', 'Stockholm', 'private', 'handelshögskola'),
(gen_random_uuid(), 'Handelshögskolan vid Göteborgs universitet', 'Göteborg', 'public', 'handelshögskola'),

-- Statliga högskolor
(gen_random_uuid(), 'Högskolan i Borås', 'Borås', 'public', 'högskola'),
(gen_random_uuid(), 'Högskolan Dalarna', 'Falun', 'public', 'högskola'),
(gen_random_uuid(), 'Högskolan i Gävle', 'Gävle', 'public', 'högskola'),
(gen_random_uuid(), 'Högskolan i Halmstad', 'Halmstad', 'public', 'högskola'),
(gen_random_uuid(), 'Högskolan Kristianstad', 'Kristianstad', 'public', 'högskola'),
(gen_random_uuid(), 'Högskolan i Skövde', 'Skövde', 'public', 'högskola'),
(gen_random_uuid(), 'Högskolan Väst', 'Trollhättan', 'public', 'högskola'),
(gen_random_uuid(), 'Södertörns högskola', 'Stockholm', 'public', 'högskola'),
(gen_random_uuid(), 'Högskolan i Jönköping', 'Jönköping', 'private', 'högskola'),

-- Konstnärliga högskolor
(gen_random_uuid(), 'Konstfack', 'Stockholm', 'public', 'konstnärlig'),
(gen_random_uuid(), 'Kungliga Konsthögskolan', 'Stockholm', 'public', 'konstnärlig'),
(gen_random_uuid(), 'Kungliga Musikhögskolan i Stockholm', 'Stockholm', 'public', 'konstnärlig'),
(gen_random_uuid(), 'Beckmans designhögskola', 'Stockholm', 'private', 'konstnärlig'),

-- Specialhögskolor
(gen_random_uuid(), 'Försvarshögskolan', 'Stockholm', 'public', 'special'),
(gen_random_uuid(), 'Gymnastik- och idrottshögskolan (GIH)', 'Stockholm', 'public', 'special'),
(gen_random_uuid(), 'Polishögskolan', 'Stockholm', 'public', 'special'),
(gen_random_uuid(), 'Sophiahemmet högskola', 'Stockholm', 'private', 'special'),

-- Yrkeshögskolor
(gen_random_uuid(), 'Nackademin', 'Stockholm', 'private', 'yrkeshögskola'),
(gen_random_uuid(), 'IHM Business School', 'Stockholm', 'private', 'yrkeshögskola'),
(gen_random_uuid(), 'Medieinstitutet', 'Stockholm', 'private', 'yrkeshögskola'),
(gen_random_uuid(), 'Chas Academy', 'Stockholm', 'private', 'yrkeshögskola'),
(gen_random_uuid(), 'Jensen Education', 'Stockholm', 'private', 'yrkeshögskola'),
(gen_random_uuid(), 'Yrgo', 'Göteborg', 'private', 'yrkeshögskola');

-- =====================================================
-- 6. MATA IN UNIVERSITETSPROGRAM
-- =====================================================

DO $$
DECLARE
    uppsala_id UUID;
    lund_id UUID;
    gbg_id UUID;
    sthlm_id UUID;
    kth_id UUID;
    ki_id UUID;
    chalmers_id UUID;
    linkoping_id UUID;
BEGIN
    -- Hämta universitet-ID
    SELECT id INTO uppsala_id FROM universities WHERE name = 'Uppsala universitet';
    SELECT id INTO lund_id FROM universities WHERE name = 'Lunds universitet';
    SELECT id INTO gbg_id FROM universities WHERE name = 'Göteborgs universitet';
    SELECT id INTO sthlm_id FROM universities WHERE name = 'Stockholms universitet';
    SELECT id INTO kth_id FROM universities WHERE name = 'Kungliga Tekniska högskolan (KTH)';
    SELECT id INTO ki_id FROM universities WHERE name = 'Karolinska Institutet';
    SELECT id INTO chalmers_id FROM universities WHERE name = 'Chalmers tekniska högskola';
    SELECT id INTO linkoping_id FROM universities WHERE name = 'Linköpings universitet';

    -- Tekniska program
    INSERT INTO university_programs (id, university_id, name, type, points, duration_years, description) VALUES
    (gen_random_uuid(), kth_id, 'Civilingenjör - Datateknik', 'civilingenjör', 300, 5, 'Civilingenjörsprogram i datateknik'),
    (gen_random_uuid(), kth_id, 'Civilingenjör - Elektroteknik', 'civilingenjör', 300, 5, 'Civilingenjörsprogram i elektroteknik'),
    (gen_random_uuid(), kth_id, 'Civilingenjör - Maskinteknik', 'civilingenjör', 300, 5, 'Civilingenjörsprogram i maskinteknik'),
    (gen_random_uuid(), kth_id, 'Civilingenjör - Teknisk fysik', 'civilingenjör', 300, 5, 'Civilingenjörsprogram i teknisk fysik'),
    (gen_random_uuid(), chalmers_id, 'Civilingenjör - Datateknik', 'civilingenjör', 300, 5, 'Civilingenjörsprogram i datateknik'),
    (gen_random_uuid(), chalmers_id, 'Civilingenjör - Industriell ekonomi', 'civilingenjör', 300, 5, 'Civilingenjörsprogram i industriell ekonomi'),
    (gen_random_uuid(), linkoping_id, 'Civilingenjör - Medicinsk teknik', 'civilingenjör', 300, 5, 'Civilingenjörsprogram i medicinsk teknik'),

    -- Medicinska program
    (gen_random_uuid(), ki_id, 'Läkarprogrammet', 'läkare', 330, 5.5, 'Läkarutbildning'),
    (gen_random_uuid(), ki_id, 'Sjuksköterskeprogrammet', 'sjuksköterska', 180, 3, 'Sjuksköterskeprogram'),
    (gen_random_uuid(), ki_id, 'Fysioterapeutprogrammet', 'fysioterapeut', 180, 3, 'Fysioterapeutprogram'),
    (gen_random_uuid(), ki_id, 'Psykologprogrammet', 'psykolog', 300, 5, 'Psykologprogram'),
    (gen_random_uuid(), lund_id, 'Läkarprogrammet', 'läkare', 330, 5.5, 'Läkarutbildning'),
    (gen_random_uuid(), uppsala_id, 'Läkarprogrammet', 'läkare', 330, 5.5, 'Läkarutbildning'),

    -- Juridik
    (gen_random_uuid(), uppsala_id, 'Juristprogrammet', 'jurist', 270, 4.5, 'Juristutbildning'),
    (gen_random_uuid(), lund_id, 'Juristprogrammet', 'jurist', 270, 4.5, 'Juristutbildning'),
    (gen_random_uuid(), sthlm_id, 'Juristprogrammet', 'jurist', 270, 4.5, 'Juristutbildning'),

    -- Ekonomi
    (gen_random_uuid(), sthlm_id, 'Ekonomprogrammet', 'ekonom', 180, 3, 'Ekonomprogram'),
    (gen_random_uuid(), uppsala_id, 'Civilekonomprogrammet', 'civilekonom', 240, 4, 'Civilekonomprogrammet'),
    (gen_random_uuid(), gbg_id, 'Civilekonomprogrammet', 'civilekonom', 240, 4, 'Civilekonomprogrammet'),

    -- Samhällsvetenskap
    (gen_random_uuid(), sthlm_id, 'Socionomprogrammet', 'socionom', 210, 3.5, 'Socionomprogram'),
    (gen_random_uuid(), uppsala_id, 'Politices kandidatprogram', 'kandidat', 180, 3, 'Statsvetenskap'),
    (gen_random_uuid(), lund_id, 'Statsvetarprogrammet', 'kandidat', 180, 3, 'Statsvetenskap'),

    -- Naturvetenskap
    (gen_random_uuid(), uppsala_id, 'Kandidatprogram i biologi', 'kandidat', 180, 3, 'Biologiprogram'),
    (gen_random_uuid(), uppsala_id, 'Kandidatprogram i kemi', 'kandidat', 180, 3, 'Kemiprogram'),
    (gen_random_uuid(), uppsala_id, 'Kandidatprogram i fysik', 'kandidat', 180, 3, 'Fysikprogram'),
    (gen_random_uuid(), uppsala_id, 'Kandidatprogram i matematik', 'kandidat', 180, 3, 'Matematikprogram'),
    (gen_random_uuid(), lund_id, 'Kandidatprogram i datavetenskap', 'kandidat', 180, 3, 'Datavetenskapsprogram'),

    -- Lärarutbildningar
    (gen_random_uuid(), sthlm_id, 'Förskollärarprogrammet', 'förskollärare', 210, 3.5, 'Förskollärarutbildning'),
    (gen_random_uuid(), sthlm_id, 'Grundlärarprogrammet F-3', 'grundlärare', 240, 4, 'Grundlärarutbildning F-3'),
    (gen_random_uuid(), sthlm_id, 'Ämneslärarprogrammet 7-9', 'ämneslärare', 270, 4.5, 'Ämneslärare för årskurs 7-9'),
    (gen_random_uuid(), sthlm_id, 'Ämneslärarprogrammet gymnasiet', 'ämneslärare', 300, 5, 'Ämneslärare för gymnasiet'),

    -- Humaniora
    (gen_random_uuid(), uppsala_id, 'Kandidatprogram i historia', 'kandidat', 180, 3, 'Historieprogram'),
    (gen_random_uuid(), lund_id, 'Kandidatprogram i filosofi', 'kandidat', 180, 3, 'Filosofiprogram'),
    (gen_random_uuid(), gbg_id, 'Kandidatprogram i litteraturvetenskap', 'kandidat', 180, 3, 'Litteraturvetenskap');

END $$;

COMMIT;

-- =====================================================
-- VERIFIERING
-- =====================================================

SELECT 'Antal gymnasium:' as info, COUNT(*) as antal FROM gymnasiums;
SELECT 'Antal program:' as info, COUNT(*) as antal FROM programs;
SELECT 'Antal kurser:' as info, COUNT(*) as antal FROM courses;
SELECT 'Antal universitet:' as info, COUNT(*) as antal FROM universities;
SELECT 'Antal universitetsprogram:' as info, COUNT(*) as antal FROM university_programs;
