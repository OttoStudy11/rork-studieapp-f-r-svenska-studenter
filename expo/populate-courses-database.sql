-- Populate courses table with all gymnasium courses
-- This script ensures all courses from the initial selection are available in the database

-- Ensure natural keys/columns exist for idempotent upserts
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_code TEXT UNIQUE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS points INTEGER;

-- Function to insert or update courses by course_code
CREATE OR REPLACE FUNCTION insert_course_if_not_exists(
  p_course_code TEXT,
  p_title TEXT,
  p_description TEXT,
  p_subject TEXT,
  p_level TEXT,
  p_points INTEGER DEFAULT NULL,
  p_resources JSONB DEFAULT '[]'::jsonb,
  p_tips JSONB DEFAULT '[]'::jsonb,
  p_related_courses JSONB DEFAULT '[]'::jsonb
) RETURNS void LANGUAGE plpgsql AS $func$
BEGIN
  INSERT INTO courses (course_code, title, description, subject, level, points, resources, tips, related_courses, progress)
  VALUES (
    p_course_code,
    p_title,
    p_description,
    p_subject,
    p_level,
    COALESCE(p_points, NULLIF(regexp_replace(p_description, '[^0-9]', '', 'g'), '')::INTEGER),
    p_resources,
    p_tips,
    p_related_courses,
    0
  )
  ON CONFLICT (course_code) DO UPDATE
    SET title = EXCLUDED.title,
        description = EXCLUDED.description,
        subject = EXCLUDED.subject,
        level = EXCLUDED.level,
        points = EXCLUDED.points,
        resources = EXCLUDED.resources,
        tips = EXCLUDED.tips,
        related_courses = EXCLUDED.related_courses;
END;
$func$;

-- Gymnasiegemensamma ämnen (för yrkesförberedande program)
SELECT insert_course_if_not_exists('ENGENG05', 'Engelska 5', 'Engelska 5 - 100 poäng', 'Engelska', 'gymnasie', 100, '["Kursmaterial", "Övningsuppgifter", "Grammatikövningar"]'::jsonb, '["Öva på att tala engelska dagligen", "Läs engelska texter regelbundet"]'::jsonb, '["ENGENG06"]'::jsonb);
SELECT insert_course_if_not_exists('HISHIS01a1', 'Historia 1a1', 'Historia 1a1 - 50 poäng', 'Historia', 'gymnasie', 50, '["Kursmaterial", "Historiska källor"]'::jsonb, '["Skapa tidslinjer för att minnas händelser", "Koppla historiska händelser till nutiden"]'::jsonb, '["HISHIS01a2"]'::jsonb);
SELECT insert_course_if_not_exists('IDRIDR01', 'Idrott och hälsa 1', 'Idrott och hälsa 1 - 100 poäng', 'Idrott och hälsa', 'gymnasie', 100, '["Träningsprogram", "Hälsoinformation"]'::jsonb, '["Träna regelbundet", "Variera träningsformer"]'::jsonb, '["IDRIDR02"]'::jsonb);
SELECT insert_course_if_not_exists('MATMAT01a', 'Matematik 1a', 'Matematik 1a - 100 poäng', 'Matematik', 'gymnasie', 100, '["Kursmaterial", "Övningsuppgifter", "Formelsamling"]'::jsonb, '["Öva på problemlösning dagligen", "Använd grafräknare effektivt"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('NAKNAK01a1', 'Naturkunskap 1a1', 'Naturkunskap 1a1 - 50 poäng', 'Naturkunskap', 'gymnasie', 50, '["Kursmaterial", "Laborationer"]'::jsonb, '["Koppla teori till vardagen", "Gör egna experiment"]'::jsonb, '["NAKNAK01a2"]'::jsonb);
SELECT insert_course_if_not_exists('RELREL01', 'Religionskunskap 1', 'Religionskunskap 1 - 50 poäng', 'Religionskunskap', 'gymnasie', 50, '["Kursmaterial", "Religiösa texter"]'::jsonb, '["Jämför olika religioner", "Reflektera över etiska frågor"]'::jsonb, '["RELREL02"]'::jsonb);
SELECT insert_course_if_not_exists('SAMSAM01a1', 'Samhällskunskap 1a1', 'Samhällskunskap 1a1 - 50 poäng', 'Samhällskunskap', 'gymnasie', 50, '["Kursmaterial", "Nyhetsartiklar"]'::jsonb, '["Följ aktuella händelser", "Delta i samhällsdebatten"]'::jsonb, '["SAMSAM01a2"]'::jsonb);
SELECT insert_course_if_not_exists('SVESVE01', 'Svenska 1', 'Svenska 1 - 100 poäng', 'Svenska', 'gymnasie', 100, '["Kursmaterial", "Skönlitteratur", "Skrivuppgifter"]'::jsonb, '["Läs varierad litteratur", "Öva på olika texttyper"]'::jsonb, '["SVESVE02"]'::jsonb);

-- Gymnasiegemensamma ämnen för högskoleförberedande program
SELECT insert_course_if_not_exists('ENGENG06', 'Engelska 6', 'Engelska 6 - 100 poäng', 'Engelska', 'gymnasie', 100, '["Kursmaterial", "Avancerade texter"]'::jsonb, '["Läs engelskspråkig litteratur", "Skriv akademiska texter"]'::jsonb, '["ENGENG07"]'::jsonb);
SELECT insert_course_if_not_exists('HISHIS01b', 'Historia 1b', 'Historia 1b - 100 poäng', 'Historia', 'gymnasie', 100, '["Kursmaterial", "Historiska källor", "Dokumentärer"]'::jsonb, '["Analysera historiska källor kritiskt", "Jämför olika perspektiv"]'::jsonb, '["HISHIS02a", "HISHIS02b"]'::jsonb);
SELECT insert_course_if_not_exists('MATMAT01b', 'Matematik 1b', 'Matematik 1b - 100 poäng', 'Matematik', 'gymnasie', 100, '["Kursmaterial", "Problemsamling"]'::jsonb, '["Fokusera på förståelse", "Träna bevisföring"]'::jsonb, '["MATMAT02b"]'::jsonb);
SELECT insert_course_if_not_exists('MATMAT02b', 'Matematik 2b', 'Matematik 2b - 100 poäng', 'Matematik', 'gymnasie', 100, '["Kursmaterial", "Grafräknare"]'::jsonb, '["Öva på funktioner", "Förstå derivata"]'::jsonb, '["MATMAT03b"]'::jsonb);
SELECT insert_course_if_not_exists('SAMSAM01b', 'Samhällskunskap 1b', 'Samhällskunskap 1b - 100 poäng', 'Samhällskunskap', 'gymnasie', 100, '["Kursmaterial", "Statistik"]'::jsonb, '["Analysera samhällsfrågor", "Förstå politiska system"]'::jsonb, '["SAMSAM02", "SAMSAM03"]'::jsonb);
SELECT insert_course_if_not_exists('SVESVE02', 'Svenska 2', 'Svenska 2 - 100 poäng', 'Svenska', 'gymnasie', 100, '["Kursmaterial", "Litteraturhistoria"]'::jsonb, '["Analysera texter djupare", "Utveckla skrivstil"]'::jsonb, '["SVESVE03"]'::jsonb);
SELECT insert_course_if_not_exists('SVESVE03', 'Svenska 3', 'Svenska 3 - 100 poäng', 'Svenska', 'gymnasie', 100, '["Kursmaterial", "Vetenskapliga texter"]'::jsonb, '["Skriv vetenskapligt", "Kritisk källgranskning"]'::jsonb, '[]'::jsonb);

-- Naturvetenskapsprogrammet - Programgemensamma
SELECT insert_course_if_not_exists('BIOBIO01', 'Biologi 1', 'Biologi 1 - 100 poäng', 'Biologi', 'gymnasie', 100, '["Kursmaterial", "Laborationer", "Mikroskop"]'::jsonb, '["Gör egna observationer", "Rita och beskriv biologiska processer"]'::jsonb, '["BIOBIO02"]'::jsonb);
SELECT insert_course_if_not_exists('FYSFYS01a', 'Fysik 1a', 'Fysik 1a - 150 poäng', 'Fysik', 'gymnasie', 150, '["Kursmaterial", "Laborationer", "Formelsamling"]'::jsonb, '["Förstå grundläggande principer", "Öva på problemlösning"]'::jsonb, '["FYSFYS02"]'::jsonb);
SELECT insert_course_if_not_exists('KEMKEM01', 'Kemi 1', 'Kemi 1 - 100 poäng', 'Kemi', 'gymnasie', 100, '["Kursmaterial", "Laborationer", "Periodiska systemet"]'::jsonb, '["Lär dig periodiska systemet", "Öva på kemiska beräkningar"]'::jsonb, '["KEMKEM02"]'::jsonb);
SELECT insert_course_if_not_exists('MATMAT03b', 'Matematik 3b', 'Matematik 3b - 100 poäng', 'Matematik', 'gymnasie', 100, '["Kursmaterial", "Avancerade problem"]'::jsonb, '["Behärska derivata och integraler", "Öva på tillämpningar"]'::jsonb, '["MATMAT04"]'::jsonb);
SELECT insert_course_if_not_exists('MATMAT03c', 'Matematik 3c', 'Matematik 3c - 100 poäng', 'Matematik', 'gymnasie', 100, '["Kursmaterial", "Tekniska tillämpningar"]'::jsonb, '["Fokusera på tekniska tillämpningar", "Använd datorverktyg"]'::jsonb, '["MATMAT04"]'::jsonb);
SELECT insert_course_if_not_exists('MATMAT04', 'Matematik 4', 'Matematik 4 - 100 poäng', 'Matematik', 'gymnasie', 100, '["Kursmaterial", "Avancerad matematik"]'::jsonb, '["Fördjupa förståelsen", "Öva på komplexa problem"]'::jsonb, '["MATMAT05"]'::jsonb);
SELECT insert_course_if_not_exists('MATMAT05', 'Matematik 5', 'Matematik 5 - 100 poäng', 'Matematik', 'gymnasie', 100, '["Kursmaterial", "Universitetsförberedande"]'::jsonb, '["Förbered för högskolestudier", "Öva på bevis"]'::jsonb, '[]'::jsonb);

-- Naturvetenskapsprogrammet - Inriktningar
SELECT insert_course_if_not_exists('BIOBIO02', 'Biologi 2', 'Biologi 2 - 100 poäng', 'Biologi', 'gymnasie', 100, '["Kursmaterial", "Avancerade laborationer"]'::jsonb, '["Fördjupa kunskaper om ekologi", "Studera genetik"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('FYSFYS02', 'Fysik 2', 'Fysik 2 - 100 poäng', 'Fysik', 'gymnasie', 100, '["Kursmaterial", "Avancerad fysik"]'::jsonb, '["Studera kvantfysik", "Fördjupa elektromagnetism"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('KEMKEM02', 'Kemi 2', 'Kemi 2 - 100 poäng', 'Kemi', 'gymnasie', 100, '["Kursmaterial", "Organisk kemi"]'::jsonb, '["Lär dig organisk kemi", "Öva på reaktionsmekanismer"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('GEOGEO01', 'Geografi 1', 'Geografi 1 - 100 poäng', 'Geografi', 'gymnasie', 100, '["Kursmaterial", "Kartor", "GIS"]'::jsonb, '["Studera kartor", "Förstå geografiska processer"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('SAMSAM02', 'Samhällskunskap 2', 'Samhällskunskap 2 - 100 poäng', 'Samhällskunskap', 'gymnasie', 100, '["Kursmaterial", "Fördjupning"]'::jsonb, '["Analysera samhällsstrukturer", "Studera internationella relationer"]'::jsonb, '["SAMSAM03"]'::jsonb);

-- Teknikprogrammet - Programgemensamma
SELECT insert_course_if_not_exists('TEKTEO01', 'Teknik 1', 'Teknik 1 - 150 poäng', 'Teknik', 'gymnasie', 150, '["Kursmaterial", "Tekniska projekt"]'::jsonb, '["Arbeta med projekt", "Utveckla teknisk förståelse"]'::jsonb, '["TEKTEO02"]'::jsonb);

-- Teknikprogrammet - Inriktning Informations- och medieteknik
SELECT insert_course_if_not_exists('DAODAT01', 'Dator- och nätverksteknik', 'Dator- och nätverksteknik - 100 poäng', 'Teknik', 'gymnasie', 100, '["Kursmaterial", "Nätverksutrustning"]'::jsonb, '["Bygg nätverk", "Lär dig protokoll"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('PRRPRR01', 'Programmering 1', 'Programmering 1 - 100 poäng', 'Teknik', 'gymnasie', 100, '["Kursmaterial", "Programmeringsövningar"]'::jsonb, '["Koda dagligen", "Bygg egna projekt"]'::jsonb, '["PRRPRR02"]'::jsonb);
SELECT insert_course_if_not_exists('PRRPRR02', 'Programmering 2', 'Programmering 2 - 100 poäng', 'Teknik', 'gymnasie', 100, '["Kursmaterial", "Avancerade projekt"]'::jsonb, '["Utveckla större projekt", "Lär dig designmönster"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('WEBWEB01', 'Webbutveckling 1', 'Webbutveckling 1 - 100 poäng', 'Teknik', 'gymnasie', 100, '["Kursmaterial", "HTML/CSS/JS"]'::jsonb, '["Bygg webbsidor", "Lär dig responsiv design"]'::jsonb, '["WEBWEB02"]'::jsonb);
SELECT insert_course_if_not_exists('WEBWEB02', 'Webbutveckling 2', 'Webbutveckling 2 - 100 poäng', 'Teknik', 'gymnasie', 100, '["Kursmaterial", "Ramverk"]'::jsonb, '["Använd moderna ramverk", "Bygg fullstack-applikationer"]'::jsonb, '[]'::jsonb);

-- Samhällsvetenskapsprogrammet - Programgemensamma
SELECT insert_course_if_not_exists('FILFIL01', 'Filosofi 1', 'Filosofi 1 - 50 poäng', 'Filosofi', 'gymnasie', 50, '["Kursmaterial", "Filosofiska texter"]'::jsonb, '["Reflektera över existentiella frågor", "Läs klassiska filosofer"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('PSKPSY01', 'Psykologi 1', 'Psykologi 1 - 50 poäng', 'Psykologi', 'gymnasie', 50, '["Kursmaterial", "Psykologiska teorier"]'::jsonb, '["Studera mänskligt beteende", "Gör observationer"]'::jsonb, '["PSKPSY02a"]'::jsonb);
SELECT insert_course_if_not_exists('PSKPSY02a', 'Psykologi 2a', 'Psykologi 2a - 50 poäng', 'Psykologi', 'gymnasie', 50, '["Kursmaterial", "Fördjupning"]'::jsonb, '["Studera utvecklingspsykologi", "Analysera personlighet"]'::jsonb, '[]'::jsonb);

-- Samhällsvetenskapsprogrammet - Inriktningar
SELECT insert_course_if_not_exists('KOTKMU01', 'Kommunikation', 'Kommunikation - 100 poäng', 'Kommunikation', 'gymnasie', 100, '["Kursmaterial", "Kommunikationsövningar"]'::jsonb, '["Öva på presentation", "Studera kommunikationsteorier"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('SOCSOC01', 'Sociologi', 'Sociologi - 100 poäng', 'Sociologi', 'gymnasie', 100, '["Kursmaterial", "Sociologiska studier"]'::jsonb, '["Studera samhällsstrukturer", "Gör fältarbete"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('LEALED01', 'Ledarskap och organisation', 'Ledarskap och organisation - 100 poäng', 'Ledarskap', 'gymnasie', 100, '["Kursmaterial", "Ledarskapsteorier"]'::jsonb, '["Utveckla ledarskapsförmågor", "Studera organisationer"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('HISHIS02a', 'Historia 2a', 'Historia 2a - 100 poäng', 'Historia', 'gymnasie', 100, '["Kursmaterial", "Fördjupning"]'::jsonb, '["Studera modern historia", "Analysera historiska processer"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('HISHIS02b', 'Historia 2b - kultur', 'Historia 2b - kultur - 100 poäng', 'Historia', 'gymnasie', 100, '["Kursmaterial", "Kulturhistoria"]'::jsonb, '["Studera kulturhistoria", "Analysera konsthistoria"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('RELREL02', 'Religionskunskap 2', 'Religionskunskap 2 - 50 poäng', 'Religionskunskap', 'gymnasie', 50, '["Kursmaterial", "Fördjupning"]'::jsonb, '["Studera religionsfilosofi", "Jämför världsreligioner"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('SAMSAM03', 'Samhällskunskap 3', 'Samhällskunskap 3 - 100 poäng', 'Samhällskunskap', 'gymnasie', 100, '["Kursmaterial", "Avancerad samhällsanalys"]'::jsonb, '["Analysera globala frågor", "Studera politisk teori"]'::jsonb, '[]'::jsonb);

-- Ekonomiprogrammet - Programgemensamma
SELECT insert_course_if_not_exists('FÖRFÖR01', 'Företagsekonomi 1', 'Företagsekonomi 1 - 100 poäng', 'Företagsekonomi', 'gymnasie', 100, '["Kursmaterial", "Bokföring"]'::jsonb, '["Lär dig bokföring", "Förstå ekonomiska samband"]'::jsonb, '["FÖRFÖR02"]'::jsonb);
SELECT insert_course_if_not_exists('FÖRFÖR02', 'Företagsekonomi 2', 'Företagsekonomi 2 - 100 poäng', 'Företagsekonomi', 'gymnasie', 100, '["Kursmaterial", "Ekonomisk analys"]'::jsonb, '["Analysera företag", "Gör ekonomiska kalkyler"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('JURJUR01', 'Juridik 1', 'Juridik 1 - 100 poäng', 'Juridik', 'gymnasie', 100, '["Kursmaterial", "Lagtexter"]'::jsonb, '["Studera svensk rätt", "Lösa juridiska problem"]'::jsonb, '["JURJUR02"]'::jsonb);
SELECT insert_course_if_not_exists('JURJUR02', 'Affärsjuridik', 'Affärsjuridik - 100 poäng', 'Juridik', 'gymnasie', 100, '["Kursmaterial", "Affärsrätt"]'::jsonb, '["Studera avtalsrätt", "Förstå bolagsrätt"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('ENTENT01', 'Entreprenörskap och företagande', 'Entreprenörskap och företagande - 100 poäng', 'Entreprenörskap', 'gymnasie', 100, '["Kursmaterial", "Affärsplaner"]'::jsonb, '["Utveckla affärsidéer", "Skapa affärsplan"]'::jsonb, '[]'::jsonb);

-- Estetiska programmet - Programgemensamma
SELECT insert_course_if_not_exists('ESTEST01', 'Estetisk kommunikation 1', 'Estetisk kommunikation 1 - 100 poäng', 'Estetisk kommunikation', 'gymnasie', 100, '["Kursmaterial", "Konstnärliga projekt"]'::jsonb, '["Uttryck dig kreativt", "Experimentera med olika medier"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('KOTKKO01', 'Konstarterna och samhället', 'Konstarterna och samhället - 50 poäng', 'Konstarterna', 'gymnasie', 50, '["Kursmaterial", "Konsthistoria"]'::jsonb, '["Studera konstens roll", "Analysera kulturuttryck"]'::jsonb, '[]'::jsonb);

-- Estetiska programmet - Inriktningar
SELECT insert_course_if_not_exists('BILBIL01', 'Bild', 'Bild - 100 poäng', 'Bild', 'gymnasie', 100, '["Kursmaterial", "Bildteknik"]'::jsonb, '["Utveckla bildspråk", "Experimentera med tekniker"]'::jsonb, '["BILBIL02"]'::jsonb);
SELECT insert_course_if_not_exists('DANDAN01', 'Dansgestaltning 1', 'Dansgestaltning 1 - 100 poäng', 'Dans', 'gymnasie', 100, '["Kursmaterial", "Koreografi"]'::jsonb, '["Utveckla dansuttryck", "Skapa koreografi"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('MUSMUS01', 'Ensemble med körsång', 'Ensemble med körsång - 200 poäng', 'Musik', 'gymnasie', 200, '["Kursmaterial", "Noter"]'::jsonb, '["Öva ensemble", "Utveckla gehör"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('TEATEA01', 'Scenisk gestaltning 1', 'Scenisk gestaltning 1 - 100 poäng', 'Teater', 'gymnasie', 100, '["Kursmaterial", "Manus"]'::jsonb, '["Utveckla scenisk närvaro", "Studera karaktärsarbete"]'::jsonb, '["TEATEA02"]'::jsonb);

-- Yrkesförberedande program - exempel från några program
SELECT insert_course_if_not_exists('BYGBYG01', 'Bygg och anläggning 1', 'Bygg och anläggning 1 - 200 poäng', 'Bygg', 'gymnasie', 200, '["Kursmaterial", "Byggritningar"]'::jsonb, '["Lär dig byggteknik", "Förstå konstruktion"]'::jsonb, '["BYGBYG02"]'::jsonb);
SELECT insert_course_if_not_exists('ELEELE01', 'Elektromekanik', 'Elektromekanik - 100 poäng', 'El', 'gymnasie', 100, '["Kursmaterial", "Elscheman"]'::jsonb, '["Förstå elsäkerhet", "Lär dig elinstallation"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('FORFOR01', 'Fordons- och transportbranschens villkor', 'Fordons- och transportbranschens villkor - 200 poäng', 'Fordon', 'gymnasie', 200, '["Kursmaterial", "Fordonsteknik"]'::jsonb, '["Lär dig fordonsteknik", "Förstå motorer"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('HÄLHÄL01', 'Hälsopedagogik', 'Hälsopedagogik - 100 poäng', 'Hälsa', 'gymnasie', 100, '["Kursmaterial", "Hälsofrämjande"]'::jsonb, '["Främja hälsa", "Förstå livsstilsfaktorer"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('MEDMED01', 'Medicin 1', 'Medicin 1 - 150 poäng', 'Medicin', 'gymnasie', 150, '["Kursmaterial", "Anatomi"]'::jsonb, '["Studera anatomi", "Lär dig sjukdomslära"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('PEDPED01', 'Lärande och utveckling', 'Lärande och utveckling - 100 poäng', 'Pedagogik', 'gymnasie', 100, '["Kursmaterial", "Pedagogiska teorier"]'::jsonb, '["Förstå lärprocesser", "Studera utvecklingspsykologi"]'::jsonb, '[]'::jsonb);

-- Moderna språk (vanliga val)
SELECT insert_course_if_not_exists('MODSPA01', 'Spanska 1', 'Spanska 1 - 100 poäng', 'Moderna språk', 'gymnasie', 100, '["Kursmaterial", "Språkövningar"]'::jsonb, '["Öva dagligen", "Lyssna på spansk media"]'::jsonb, '["MODSPA02"]'::jsonb);
SELECT insert_course_if_not_exists('MODSPA02', 'Spanska 2', 'Spanska 2 - 100 poäng', 'Moderna språk', 'gymnasie', 100, '["Kursmaterial", "Fördjupning"]'::jsonb, '["Läs spansk litteratur", "Konversera på spanska"]'::jsonb, '["MODSPA03"]'::jsonb);
SELECT insert_course_if_not_exists('MODFRA01', 'Franska 1', 'Franska 1 - 100 poäng', 'Moderna språk', 'gymnasie', 100, '["Kursmaterial", "Språkövningar"]'::jsonb, '["Öva uttal", "Studera grammatik"]'::jsonb, '["MODFRA02"]'::jsonb);
SELECT insert_course_if_not_exists('MODFRA02', 'Franska 2', 'Franska 2 - 100 poäng', 'Moderna språk', 'gymnasie', 100, '["Kursmaterial", "Fördjupning"]'::jsonb, '["Läs fransk litteratur", "Se franska filmer"]'::jsonb, '["MODFRA03"]'::jsonb);
SELECT insert_course_if_not_exists('MODTYS01', 'Tyska 1', 'Tyska 1 - 100 poäng', 'Moderna språk', 'gymnasie', 100, '["Kursmaterial", "Språkövningar"]'::jsonb, '["Lär dig kasus", "Öva på ordföljd"]'::jsonb, '["MODTYS02"]'::jsonb);
SELECT insert_course_if_not_exists('MODTYS02', 'Tyska 2', 'Tyska 2 - 100 poäng', 'Moderna språk', 'gymnasie', 100, '["Kursmaterial", "Fördjupning"]'::jsonb, '["Läs tyska texter", "Konversera på tyska"]'::jsonb, '["MODTYS03"]'::jsonb);

-- International Baccalaureate kurser
SELECT insert_course_if_not_exists('IBSWE01', 'Swedish A: Literature HL', 'Swedish A: Literature HL - 240 poäng', 'Svenska', 'gymnasie', 240, '["IB Material", "World Literature"]'::jsonb, '["Analyze literature critically", "Write literary essays"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('IBENG01', 'English A: Language and Literature SL', 'English A: Language and Literature SL - 150 poäng', 'Engelska', 'gymnasie', 150, '["IB Material", "Literary texts"]'::jsonb, '["Develop critical thinking", "Practice essay writing"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('IBTOK01', 'Theory of Knowledge', 'Theory of Knowledge - 100 poäng', 'Filosofi', 'gymnasie', 100, '["TOK Material", "Knowledge questions"]'::jsonb, '["Question knowledge claims", "Explore different perspectives"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('IBCAS01', 'Creativity, Activity, Service', 'CAS - 150 poäng', 'CAS', 'gymnasie', 150, '["CAS Guidelines", "Reflection journals"]'::jsonb, '["Engage in diverse activities", "Reflect on experiences"]'::jsonb, '[]'::jsonb);
SELECT insert_course_if_not_exists('IBEE01', 'Extended Essay', 'Extended Essay - 100 poäng', 'Forskning', 'gymnasie', 100, '["Research guidelines", "Academic writing"]'::jsonb, '["Choose engaging topic", "Develop research skills"]'::jsonb, '[]'::jsonb);

-- Link courses to programs (baseline mappings)
WITH p AS (
  SELECT id, name FROM programs
), c AS (
  SELECT id, course_code FROM courses
)
INSERT INTO program_courses (program_id, course_id)
SELECT p.id, c.id
FROM p
JOIN c ON (
  (
    p.name IN ('Naturvetenskapsprogrammet','Teknikprogrammet','Samhällsvetenskapsprogrammet','Ekonomiprogrammet','Estetiska programmet','Humanistiska programmet','International Baccalaureate')
    AND c.course_code IN ('ENGENG05','ENGENG06','HISHIS01b','IDRIDR01','IDRIDR02','MATMAT01b','MATMAT02b','RELREL01','SAMSAM01b','SVESVE01','SVESVE02','SVESVE03')
  ) OR (
    p.name IN ('Bygg- och anläggningsprogrammet','Barn- och fritidsprogrammet','El- och energiprogrammet','Fordons- och transportprogrammet','Handels- och administrationsprogrammet','Hantverksprogrammet','Hotell- och turismprogrammet','Industritekniska programmet','Naturbruksprogrammet','Restaurang- och livsmedelsprogrammet','VVS- och fastighetsprogrammet','Vård- och omsorgsprogrammet')
    AND c.course_code IN ('ENGENG05','HISHIS01a1','IDRIDR01','MATMAT01a','NAKNAK01a1','RELREL01','SAMSAM01a1','SVESVE01','ENGENG06','HISHIS01a2','IDRIDR02','NAKNAK01a2','SAMSAM01a2','SVESVE02','SVESVE03')
  )
)
ON CONFLICT DO NOTHING;

-- Drop the temporary function
DROP FUNCTION IF EXISTS insert_course_if_not_exists;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(title);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_points ON courses(points);
