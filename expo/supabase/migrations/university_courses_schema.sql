-- ============================================================
-- UNIVERSITY COURSES SCHEMA — Kurs-tilldelning för universitet/högskola
-- ============================================================
-- Fixar "kurserna läggs inte till vid konto-skapande" för högskola:
--   1. Skapar de tabeller appen förväntar sig (universities,
--      university_programs, university_courses, university_program_courses,
--      user_university_courses) med kolumner som MATCHAR appens kod.
--   2. Fyller med all kursdata från appens konstanter.
--   3. RLS + en atomär RPC (assign_university_courses) som appen
--      anropar vid konto-skapande.
-- Lägg till valfri skola (universitet/högskola) på profilen via
-- profiles.university_id / profiles.university_name.
--
-- Kör hela filen i Supabase SQL Editor. Idempotent: kan köras om.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 0. RENSA GAMMALT BÖJAT SCHEMA
-- Appens gamla kod blandade kolumnnamn (code/name vs course_code/title)
-- och tabellerna saknade unika constraints + RLS. Vi börjar om rent.
-- Användardata (user_university_courses) raderas — enrolment sker igen
-- automatiskt nästa gång appen tilldelar kurser.
-- ============================================================

drop table if exists public.user_university_courses cascade;
drop table if exists public.university_program_courses cascade;
drop table if exists public.university_courses cascade;
drop table if exists public.university_programs cascade;
drop table if exists public.universities cascade;

-- ============================================================
-- 1. universities — Lärosäten
-- ============================================================
create table public.universities (
  id         text primary key,
  name       text not null,
  city       text not null,
  type       text not null,
  category   text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. university_programs — Program/linjer
-- ============================================================
create table public.university_programs (
  id             text primary key,
  university_id  text,
  name           text not null,
  abbreviation   text,
  degree_type    text not null,
  field          text not null,
  credits        int  not null,
  duration_years numeric(4,1) not null,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- 3. university_courses — Kurser (id = kurskod, globalt unik)
-- Kolumner matchar appens SELECT/INSERT (course_code/title/subject_area).
-- Samma kurskod kan ingå i flera program via kopplingstabellen nedan.
-- ============================================================
create table public.university_courses (
  id                text primary key,
  course_code       text not null,
  title             text not null,
  description       text,
  credits           numeric(5,1) not null default 7.5,
  level             text not null default 'hogskola',
  subject_area      text not null default 'Allmänt',
  prerequisites     text,
  learning_outcomes text,
  year              int  not null check (year between 1 and 5),
  category          text not null default 'grundkurs',
  program_id        text references public.university_programs(id) on delete set null,
  mandatory         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- 4. university_program_courses — Program ↔ kurs-koppling
-- ============================================================
create table public.university_program_courses (
  id           uuid primary key default gen_random_uuid(),
  program_id   text not null references public.university_programs(id) on delete cascade,
  course_id    text not null references public.university_courses(id) on delete cascade,
  semester     int  not null,
  year         int  not null check (year between 1 and 5),
  is_mandatory boolean not null default true,
  unique (program_id, course_id)
);

-- ============================================================
-- 5. user_university_courses — Användarens enrolment
-- unik(user_id, course_id) = upsert-målet appen använder.
-- ============================================================
create table public.user_university_courses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  course_id  text not null references public.university_courses(id) on delete cascade,
  program_id text,
  semester   int,
  progress   int  not null default 0 check (progress between 0 and 100),
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ============================================================
-- 6. profiles — extra kolumner för val av skola
-- (gymnasium_id/gymnasium_name finns redan; högskola läggs till här)
-- ============================================================
alter table public.profiles add column if not exists university_id   text;
alter table public.profiles add column if not exists university_name text;

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_uni_courses_program_year on public.university_courses(program_id, year);
create index idx_uni_courses_code         on public.university_courses(course_code);
create index idx_upc_program_sem          on public.university_program_courses(program_id, semester);
create index idx_upc_program_year         on public.university_program_courses(program_id, year);
create index idx_uuc_user                 on public.user_university_courses(user_id);
create index idx_uuc_user_active          on public.user_university_courses(user_id, is_active);

-- ============================================================
-- SEED 1: Lärosäten (alla från appens SWEDISH_UNIVERSITIES)
-- ============================================================
insert into public.universities (id, name, city, type, category) values
  ('uppsala', 'Uppsala universitet', 'Uppsala', 'university', 'Universitet'),
  ('lund', 'Lunds universitet', 'Lund', 'university', 'Universitet'),
  ('goteborg', 'Göteborgs universitet', 'Göteborg', 'university', 'Universitet'),
  ('stockholm', 'Stockholms universitet', 'Stockholm', 'university', 'Universitet'),
  ('umea', 'Umeå universitet', 'Umeå', 'university', 'Universitet'),
  ('linkoping', 'Linköpings universitet', 'Linköping', 'university', 'Universitet'),
  ('kth', 'Kungliga Tekniska högskolan (KTH)', 'Stockholm', 'university', 'Tekniskt universitet'),
  ('chalmers', 'Chalmers tekniska högskola', 'Göteborg', 'university', 'Tekniskt universitet'),
  ('ltu', 'Luleå tekniska universitet', 'Luleå', 'university', 'Tekniskt universitet'),
  ('ki', 'Karolinska Institutet', 'Stockholm', 'specialized_school', 'Medicinskt universitet'),
  ('slu', 'Sveriges lantbruksuniversitet (SLU)', 'Uppsala', 'specialized_school', 'Specialiserat universitet'),
  ('karlstad', 'Karlstads universitet', 'Karlstad', 'university', 'Universitet'),
  ('linnaeus', 'Linnéuniversitetet', 'Växjö', 'university', 'Universitet'),
  ('orebro', 'Örebro universitet', 'Örebro', 'university', 'Universitet'),
  ('miun', 'Mittuniversitetet', 'Sundsvall', 'university', 'Universitet'),
  ('malmo', 'Malmö universitet', 'Malmö', 'university', 'Universitet'),
  ('hhs', 'Handelshögskolan i Stockholm', 'Stockholm', 'business_school', 'Handelshögskola'),
  ('bth', 'Blekinge tekniska högskola', 'Karlskrona', 'college', 'Högskola'),
  ('mdh', 'Mälardalens universitet', 'Västerås', 'college', 'Högskola'),
  ('hb', 'Högskolan i Borås', 'Borås', 'college', 'Högskola'),
  ('hda', 'Högskolan Dalarna', 'Falun', 'college', 'Högskola'),
  ('hig', 'Högskolan i Gävle', 'Gävle', 'college', 'Högskola'),
  ('hh', 'Högskolan i Halmstad', 'Halmstad', 'college', 'Högskola'),
  ('hkr', 'Högskolan Kristianstad', 'Kristianstad', 'college', 'Högskola'),
  ('his', 'Högskolan i Skövde', 'Skövde', 'college', 'Högskola'),
  ('hv', 'Högskolan Väst', 'Trollhättan', 'college', 'Högskola'),
  ('sh', 'Södertörns högskola', 'Stockholm', 'college', 'Högskola'),
  ('hj', 'Högskolan i Jönköping', 'Jönköping', 'college', 'Högskola'),
  ('konstfack', 'Konstfack', 'Stockholm', 'art_school', 'Konstnärlig högskola'),
  ('kkh', 'Kungliga Konsthögskolan', 'Stockholm', 'art_school', 'Konstnärlig högskola'),
  ('kmh', 'Kungliga Musikhögskolan', 'Stockholm', 'art_school', 'Konstnärlig högskola'),
  ('fhs', 'Försvarshögskolan', 'Stockholm', 'specialized_school', 'Specialhögskola'),
  ('gih', 'Gymnastik- och idrottshögskolan (GIH)', 'Stockholm', 'specialized_school', 'Specialhögskola'),
  ('polishogskolan', 'Polishögskolan', 'Stockholm', 'specialized_school', 'Specialhögskola'),
  ('nackademin', 'Nackademin', 'Stockholm', 'vocational_school', 'Yrkeshögskola'),
  ('ihm', 'IHM Business School', 'Stockholm', 'vocational_school', 'Yrkeshögskola'),
  ('chas', 'Chas Academy', 'Stockholm', 'vocational_school', 'Yrkeshögskola'),
  ('jensen', 'Jensen Education', 'Stockholm', 'vocational_school', 'Yrkeshögskola'),
  ('yrgo', 'Yrgo', 'Göteborg', 'vocational_school', 'Yrkeshögskola')
on conflict (id) do nothing;

-- ============================================================
-- SEED 2: Program (alla från appens UNIVERSITY_PROGRAMS + YH)
-- ============================================================
insert into public.university_programs (id, name, abbreviation, degree_type, field, credits, duration_years) values
  ('civ_datateknik', 'Civilingenjör - Datateknik', 'CI-DT', 'civilingenjör', 'Teknik', 300, 5),
  ('civ_elektroteknik', 'Civilingenjör - Elektroteknik', 'CI-EL', 'civilingenjör', 'Teknik', 300, 5),
  ('civ_maskinteknik', 'Civilingenjör - Maskinteknik', 'CI-MA', 'civilingenjör', 'Teknik', 300, 5),
  ('civ_teknisk_fysik', 'Civilingenjör - Teknisk fysik', 'CI-TF', 'civilingenjör', 'Teknik', 300, 5),
  ('civ_kemiteknik', 'Civilingenjör - Kemiteknik', 'CI-KE', 'civilingenjör', 'Teknik', 300, 5),
  ('civ_industriell_ekonomi', 'Civilingenjör - Industriell ekonomi', 'CI-IE', 'civilingenjör', 'Teknik/Ekonomi', 300, 5),
  ('civ_samhallsbyggnad', 'Civilingenjör - Samhällsbyggnad', 'CI-SB', 'civilingenjör', 'Teknik', 300, 5),
  ('civ_bioteknik', 'Civilingenjör - Bioteknik', 'CI-BT', 'civilingenjör', 'Teknik', 300, 5),
  ('hsk_datateknik', 'Högskoleingenjör - Datateknik', 'HI-DT', 'högskoleingenjör', 'Teknik', 180, 3),
  ('hsk_elektroteknik', 'Högskoleingenjör - Elektroteknik', 'HI-EL', 'högskoleingenjör', 'Teknik', 180, 3),
  ('hsk_maskinteknik', 'Högskoleingenjör - Maskinteknik', 'HI-MA', 'högskoleingenjör', 'Teknik', 180, 3),
  ('hsk_byggteknik', 'Högskoleingenjör - Byggteknik', 'HI-BY', 'högskoleingenjör', 'Teknik', 180, 3),
  ('lakarprogrammet', 'Läkarprogrammet', null, 'professionsprogram', 'Medicin', 330, 5.5),
  ('tandlakarprogrammet', 'Tandläkarprogrammet', null, 'professionsprogram', 'Medicin', 300, 5),
  ('sjukskoterskeprogrammet', 'Sjuksköterskeprogrammet', null, 'professionsprogram', 'Vårdvetenskap', 180, 3),
  ('fysioterapeutprogrammet', 'Fysioterapeutprogrammet', null, 'professionsprogram', 'Vårdvetenskap', 180, 3),
  ('psykologprogrammet', 'Psykologprogrammet', null, 'professionsprogram', 'Psykologi', 300, 5),
  ('kand_biologi', 'Kandidatprogram i biologi', null, 'kandidat', 'Naturvetenskap', 180, 3),
  ('kand_kemi', 'Kandidatprogram i kemi', null, 'kandidat', 'Naturvetenskap', 180, 3),
  ('kand_fysik', 'Kandidatprogram i fysik', null, 'kandidat', 'Naturvetenskap', 180, 3),
  ('kand_matematik', 'Kandidatprogram i matematik', null, 'kandidat', 'Naturvetenskap', 180, 3),
  ('kand_datavetenskap', 'Kandidatprogram i datavetenskap', null, 'kandidat', 'Naturvetenskap', 180, 3),
  ('juristprogrammet', 'Juristprogrammet', null, 'professionsprogram', 'Juridik', 270, 4.5),
  ('ekonomprogrammet', 'Ekonomprogrammet', null, 'kandidat', 'Ekonomi', 180, 3),
  ('civilekonomprogrammet', 'Civilekonomprogrammet', null, 'professionsprogram', 'Ekonomi', 240, 4),
  ('socionomprogrammet', 'Socionomprogrammet', null, 'professionsprogram', 'Socialt arbete', 210, 3.5),
  ('politices_kandidat', 'Politices kandidatprogram', null, 'kandidat', 'Statsvetenskap', 180, 3),
  ('kand_statsvetenskap', 'Kandidatprogram i statsvetenskap', null, 'kandidat', 'Samhällsvetenskap', 180, 3),
  ('kand_sociologi', 'Kandidatprogram i sociologi', null, 'kandidat', 'Samhällsvetenskap', 180, 3),
  ('kand_historia', 'Kandidatprogram i historia', null, 'kandidat', 'Humaniora', 180, 3),
  ('kand_filosofi', 'Kandidatprogram i filosofi', null, 'kandidat', 'Humaniora', 180, 3),
  ('kand_litteraturvetenskap', 'Kandidatprogram i litteraturvetenskap', null, 'kandidat', 'Humaniora', 180, 3),
  ('kand_sprakvetenskap', 'Kandidatprogram i språkvetenskap', null, 'kandidat', 'Humaniora', 180, 3),
  ('forskollararprogrammet', 'Förskollärarprogrammet', null, 'professionsprogram', 'Utbildningsvetenskap', 210, 3.5),
  ('grundlararprogrammet_f3', 'Grundlärarprogrammet F-3', null, 'professionsprogram', 'Utbildningsvetenskap', 240, 4),
  ('grundlararprogrammet_46', 'Grundlärarprogrammet 4-6', null, 'professionsprogram', 'Utbildningsvetenskap', 240, 4),
  ('amneslararprogrammet_79', 'Ämneslärarprogrammet 7-9', null, 'professionsprogram', 'Utbildningsvetenskap', 270, 4.5),
  ('amneslararprogrammet_gym', 'Ämneslärarprogrammet gymnasiet', null, 'professionsprogram', 'Utbildningsvetenskap', 300, 5),
  ('journalistprogrammet', 'Journalistprogrammet', null, 'kandidat', 'Media', 180, 3),
  ('medie_kommunikation', 'Medie- och kommunikationsvetenskap', null, 'kandidat', 'Media', 180, 3),
  ('systemvetenskap', 'Systemvetenskap', null, 'kandidat', 'IT', 180, 3),
  ('business_economics', 'Business and Economics', null, 'kandidat', 'Ekonomi', 180, 3),
  ('international_business', 'International Business', null, 'kandidat', 'Ekonomi', 180, 3),
  ('foretagsekonomi', 'Företagsekonomi', null, 'kandidat', 'Ekonomi', 180, 3),
  ('veterinarprogrammet', 'Veterinärprogrammet', null, 'professionsprogram', 'Veterinärmedicin', 330, 5.5),
  ('agronomprogram', 'Agronomprogram', null, 'kandidat', 'Lantbruk', 180, 3),
  ('jagmastarprogrammet', 'Jägmästarprogrammet', null, 'professionsprogram', 'Skogshushållning', 300, 5),
  ('webbutvecklare', 'Webbutvecklare', null, 'yrkeshögskola', 'Webbutveckling', 120, 2),
  ('ux_designer', 'UX Designer', null, 'yrkeshögskola', 'Design', 120, 2)
on conflict (id) do nothing;

-- ============================================================
-- SEED 3: Kurser (från appens UNIVERSITY_PROGRAM_COURSES)
-- id = kurskod → globalt unikt; delade kurser (t.ex. SF1624) länkas
-- till flera program via university_program_courses nedan.
-- ============================================================

-- Civilingenjör Datateknik
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('SF1624', 'SF1624', 'Algebra och geometri', 7.5, 'Matematik', 1, 'grundkurs', 'civ_datateknik', true),
  ('SF1625', 'SF1625', 'Envariabelanalys', 7.5, 'Matematik', 1, 'grundkurs', 'civ_datateknik', true),
  ('DD1301', 'DD1301', 'Introduktion till programmering', 7.5, 'Datateknik', 1, 'grundkurs', 'civ_datateknik', true),
  ('DD1320', 'DD1320', 'Tillämpad datalogi', 6, 'Datateknik', 1, 'grundkurs', 'civ_datateknik', true),
  ('SF1626', 'SF1626', 'Flervariabelanalys', 7.5, 'Matematik', 1, 'grundkurs', 'civ_datateknik', true),
  ('DD1337', 'DD1337', 'Programmeringsteknik', 7.5, 'Datateknik', 1, 'grundkurs', 'civ_datateknik', true),
  ('IS1200', 'IS1200', 'Datorteknik', 7.5, 'Datateknik', 1, 'grundkurs', 'civ_datateknik', true),
  ('SF1627', 'SF1627', 'Diskret matematik', 7.5, 'Matematik', 1, 'grundkurs', 'civ_datateknik', true),
  ('DD1324', 'DD1324', 'Algoritmer och datastrukturer', 7.5, 'Datateknik', 2, 'grundkurs', 'civ_datateknik', true),
  ('DD1351', 'DD1351', 'Logik för dataloger', 6, 'Datateknik', 2, 'grundkurs', 'civ_datateknik', true),
  ('DD1352', 'DD1352', 'Arkitektur, operativsystem och nätverk', 9, 'Datateknik', 2, 'fördjupningskurs', 'civ_datateknik', true),
  ('SF1680', 'SF1680', 'Sannolikhetsteori och statistik', 7.5, 'Matematik', 2, 'grundkurs', 'civ_datateknik', true),
  ('DD1361', 'DD1361', 'Programmeringsparadigm', 7.5, 'Datateknik', 2, 'fördjupningskurs', 'civ_datateknik', true),
  ('DD1396', 'DD1396', 'Parallellprogrammering', 6, 'Datateknik', 2, 'fördjupningskurs', 'civ_datateknik', true),
  ('DD2350', 'DD2350', 'Algoritmer och komplexitet', 6, 'Datateknik', 2, 'fördjupningskurs', 'civ_datateknik', true),
  ('DD2380', 'DD2380', 'Artificiell intelligens', 7.5, 'Datateknik', 3, 'fördjupningskurs', 'civ_datateknik', false),
  ('DD2421', 'DD2421', 'Maskininlärning', 7.5, 'Datateknik', 3, 'fördjupningskurs', 'civ_datateknik', false),
  ('DH2642', 'DH2642', 'Interaktionsprogrammering', 7.5, 'Datateknik', 3, 'fördjupningskurs', 'civ_datateknik', false),
  ('DD2440', 'DD2440', 'Avancerad webbprogrammering', 7.5, 'Datateknik', 3, 'fördjupningskurs', 'civ_datateknik', false),
  ('DD2412', 'DD2412', 'Kandidatexjobb', 15, 'Datateknik', 3, 'fördjupningskurs', 'civ_datateknik', true)
on conflict (id) do nothing;

-- Civilingenjör Elektroteknik
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('EI1210', 'EI1210', 'Introduktion till elektroteknik', 7.5, 'Elektroteknik', 1, 'grundkurs', 'civ_elektroteknik', true),
  ('EI1220', 'EI1220', 'Elektriska kretsar', 7.5, 'Elektroteknik', 1, 'grundkurs', 'civ_elektroteknik', true),
  ('SI1140', 'SI1140', 'Elektromagnetism', 6, 'Fysik', 1, 'grundkurs', 'civ_elektroteknik', true),
  ('DD1310', 'DD1310', 'Programmering för elektroingenjörer', 7.5, 'Datateknik', 1, 'grundkurs', 'civ_elektroteknik', true),
  ('EI2300', 'EI2300', 'Signalbehandling', 7.5, 'Elektroteknik', 2, 'fördjupningskurs', 'civ_elektroteknik', true),
  ('EI2310', 'EI2310', 'Analog elektronik', 7.5, 'Elektroteknik', 2, 'fördjupningskurs', 'civ_elektroteknik', true),
  ('EI2320', 'EI2320', 'Digital elektronik', 7.5, 'Elektroteknik', 2, 'fördjupningskurs', 'civ_elektroteknik', true),
  ('EI2330', 'EI2330', 'Reglerteknik', 7.5, 'Elektroteknik', 2, 'fördjupningskurs', 'civ_elektroteknik', true),
  ('EI2340', 'EI2340', 'Elkraftteknik', 7.5, 'Elektroteknik', 2, 'fördjupningskurs', 'civ_elektroteknik', true),
  ('EI3350', 'EI3350', 'Trådlös kommunikation', 7.5, 'Elektroteknik', 3, 'fördjupningskurs', 'civ_elektroteknik', false),
  ('EI3360', 'EI3360', 'Inbyggda system', 7.5, 'Elektroteknik', 3, 'fördjupningskurs', 'civ_elektroteknik', false),
  ('EI3370', 'EI3370', 'Kraft- och energisystem', 7.5, 'Elektroteknik', 3, 'fördjupningskurs', 'civ_elektroteknik', false),
  ('EI3900', 'EI3900', 'Kandidatexjobb', 15, 'Elektroteknik', 3, 'fördjupningskurs', 'civ_elektroteknik', true)
on conflict (id) do nothing;

-- Civilingenjör Industriell ekonomi
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('ME1003', 'ME1003', 'Industriell ekonomi och organisation', 6, 'Ekonomi', 1, 'grundkurs', 'civ_industriell_ekonomi', true),
  ('ME1312', 'ME1312', 'Företagsekonomi', 7.5, 'Ekonomi', 1, 'grundkurs', 'civ_industriell_ekonomi', true),
  ('ME1313', 'ME1313', 'Bokföring och ekonomistyrning', 6, 'Ekonomi', 1, 'grundkurs', 'civ_industriell_ekonomi', true),
  ('ME2063', 'ME2063', 'Produktionsekonomi', 7.5, 'Ekonomi', 2, 'fördjupningskurs', 'civ_industriell_ekonomi', true),
  ('ME2015', 'ME2015', 'Marknadsföring', 7.5, 'Ekonomi', 2, 'fördjupningskurs', 'civ_industriell_ekonomi', true),
  ('ME2073', 'ME2073', 'Finansiell ekonomi', 7.5, 'Ekonomi', 2, 'fördjupningskurs', 'civ_industriell_ekonomi', true),
  ('ME2016', 'ME2016', 'Strategisk ledning', 7.5, 'Ekonomi', 2, 'fördjupningskurs', 'civ_industriell_ekonomi', true),
  ('ME3031', 'ME3031', 'Produktionsutveckling', 7.5, 'Produktion', 3, 'fördjupningskurs', 'civ_industriell_ekonomi', false),
  ('ME3032', 'ME3032', 'Supply Chain Management', 7.5, 'Logistik', 3, 'fördjupningskurs', 'civ_industriell_ekonomi', false),
  ('ME3033', 'ME3033', 'Innovation och entreprenörskap', 7.5, 'Ekonomi', 3, 'fördjupningskurs', 'civ_industriell_ekonomi', false),
  ('ME3900', 'ME3900', 'Kandidatexjobb', 15, 'Ekonomi', 3, 'fördjupningskurs', 'civ_industriell_ekonomi', true)
on conflict (id) do nothing;

-- Läkarprogrammet
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('KI1001', 'KI1001', 'Medicinens grunder', 15, 'Medicin', 1, 'professionskurs', 'lakarprogrammet', true),
  ('KI1002', 'KI1002', 'Människokroppen', 30, 'Medicin', 1, 'professionskurs', 'lakarprogrammet', true),
  ('KI1003', 'KI1003', 'Fysiologi och biokemi', 15, 'Medicin', 1, 'professionskurs', 'lakarprogrammet', true),
  ('KI2001', 'KI2001', 'Sjukdomslära', 30, 'Medicin', 2, 'professionskurs', 'lakarprogrammet', true),
  ('KI2002', 'KI2002', 'Klinisk medicin introduktion', 15, 'Medicin', 2, 'professionskurs', 'lakarprogrammet', true),
  ('KI2003', 'KI2003', 'Mikrobiologi och immunologi', 15, 'Medicin', 2, 'professionskurs', 'lakarprogrammet', true),
  ('KI3001', 'KI3001', 'Kirurgi', 15, 'Medicin', 3, 'professionskurs', 'lakarprogrammet', true),
  ('KI3002', 'KI3002', 'Internmedicin', 15, 'Medicin', 3, 'professionskurs', 'lakarprogrammet', true),
  ('KI3003', 'KI3003', 'Psykiatri', 10, 'Medicin', 3, 'professionskurs', 'lakarprogrammet', true),
  ('KI3004', 'KI3004', 'Pediatrik', 10, 'Medicin', 3, 'professionskurs', 'lakarprogrammet', true),
  ('KI3005', 'KI3005', 'Obstetrik och gynekologi', 10, 'Medicin', 3, 'professionskurs', 'lakarprogrammet', true)
on conflict (id) do nothing;

-- Sjuksköterskeprogrammet
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('OM1001', 'OM1001', 'Omvårdnadens grunder', 15, 'Omvårdnad', 1, 'professionskurs', 'sjukskoterskeprogrammet', true),
  ('OM1002', 'OM1002', 'Anatomi och fysiologi', 15, 'Medicin', 1, 'professionskurs', 'sjukskoterskeprogrammet', true),
  ('OM1003', 'OM1003', 'Biokemi och farmakologi', 15, 'Medicin', 1, 'professionskurs', 'sjukskoterskeprogrammet', true),
  ('OM1004', 'OM1004', 'Verksamhetsförlagd utbildning 1', 15, 'Omvårdnad', 1, 'professionskurs', 'sjukskoterskeprogrammet', true),
  ('OM2001', 'OM2001', 'Sjukdomslära', 15, 'Medicin', 2, 'professionskurs', 'sjukskoterskeprogrammet', true),
  ('OM2002', 'OM2002', 'Klinisk omvårdnad', 15, 'Omvårdnad', 2, 'professionskurs', 'sjukskoterskeprogrammet', true),
  ('OM2003', 'OM2003', 'Psykiatri och psykisk hälsa', 15, 'Omvårdnad', 2, 'professionskurs', 'sjukskoterskeprogrammet', true),
  ('OM2004', 'OM2004', 'Verksamhetsförlagd utbildning 2', 15, 'Omvårdnad', 2, 'professionskurs', 'sjukskoterskeprogrammet', true),
  ('OM3001', 'OM3001', 'Avancerad omvårdnad', 15, 'Omvårdnad', 3, 'professionskurs', 'sjukskoterskeprogrammet', true),
  ('OM3002', 'OM3002', 'Folkhälsa och hälsofrämjande', 7.5, 'Omvårdnad', 3, 'professionskurs', 'sjukskoterskeprogrammet', true),
  ('OM3003', 'OM3003', 'Verksamhetsförlagd utbildning 3', 22.5, 'Omvårdnad', 3, 'professionskurs', 'sjukskoterskeprogrammet', true),
  ('OM3004', 'OM3004', 'Examensarbete', 15, 'Omvårdnad', 3, 'professionskurs', 'sjukskoterskeprogrammet', true)
on conflict (id) do nothing;

-- Psykologprogrammet
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('PS1001', 'PS1001', 'Psykologins grunder', 30, 'Psykologi', 1, 'grundkurs', 'psykologprogrammet', true),
  ('PS1002', 'PS1002', 'Utvecklingspsykologi', 15, 'Psykologi', 1, 'grundkurs', 'psykologprogrammet', true),
  ('PS1003', 'PS1003', 'Biologisk psykologi', 15, 'Psykologi', 1, 'grundkurs', 'psykologprogrammet', true),
  ('PS2001', 'PS2001', 'Socialpsykologi', 15, 'Psykologi', 2, 'fördjupningskurs', 'psykologprogrammet', true),
  ('PS2002', 'PS2002', 'Klinisk psykologi', 15, 'Psykologi', 2, 'fördjupningskurs', 'psykologprogrammet', true),
  ('PS2003', 'PS2003', 'Kognitiv psykologi', 15, 'Psykologi', 2, 'fördjupningskurs', 'psykologprogrammet', true),
  ('PS2004', 'PS2004', 'Psykologisk metodik', 15, 'Psykologi', 2, 'fördjupningskurs', 'psykologprogrammet', true),
  ('PS3001', 'PS3001', 'Personlighetspsykologi', 15, 'Psykologi', 3, 'fördjupningskurs', 'psykologprogrammet', true),
  ('PS3002', 'PS3002', 'Psykoterapi och behandling', 15, 'Psykologi', 3, 'avancerad', 'psykologprogrammet', true),
  ('PS3003', 'PS3003', 'Verksamhetsförlagd utbildning', 15, 'Psykologi', 3, 'professionskurs', 'psykologprogrammet', true),
  ('PS3004', 'PS3004', 'Examensarbete psykologi', 15, 'Psykologi', 3, 'avancerad', 'psykologprogrammet', true)
on conflict (id) do nothing;

-- Juristprogrammet
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('JU1001', 'JU1001', 'Introduktion till juridiken', 7.5, 'Juridik', 1, 'grundkurs', 'juristprogrammet', true),
  ('JU1002', 'JU1002', 'Förmögenhetsrätt', 22.5, 'Juridik', 1, 'grundkurs', 'juristprogrammet', true),
  ('JU1003', 'JU1003', 'Associationsrätt', 15, 'Juridik', 1, 'grundkurs', 'juristprogrammet', true),
  ('JU1004', 'JU1004', 'Offentlig rätt', 15, 'Juridik', 1, 'grundkurs', 'juristprogrammet', true),
  ('JU2001', 'JU2001', 'Straffrätt', 22.5, 'Juridik', 2, 'fördjupningskurs', 'juristprogrammet', true),
  ('JU2002', 'JU2002', 'Processrätt', 22.5, 'Juridik', 2, 'fördjupningskurs', 'juristprogrammet', true),
  ('JU2003', 'JU2003', 'Skatterätt', 15, 'Juridik', 2, 'fördjupningskurs', 'juristprogrammet', true),
  ('JU3001', 'JU3001', 'Arbetsrätt', 15, 'Juridik', 3, 'fördjupningskurs', 'juristprogrammet', true),
  ('JU3002', 'JU3002', 'EU-rätt', 15, 'Juridik', 3, 'fördjupningskurs', 'juristprogrammet', true),
  ('JU3003', 'JU3003', 'Miljörätt', 7.5, 'Juridik', 3, 'fördjupningskurs', 'juristprogrammet', false),
  ('JU3004', 'JU3004', 'Familjerätt', 7.5, 'Juridik', 3, 'fördjupningskurs', 'juristprogrammet', false)
on conflict (id) do nothing;

-- Ekonomprogrammet
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('EK1001', 'EK1001', 'Företagsekonomi grund', 15, 'Ekonomi', 1, 'grundkurs', 'ekonomprogrammet', true),
  ('EK1002', 'EK1002', 'Mikroekonomi', 15, 'Ekonomi', 1, 'grundkurs', 'ekonomprogrammet', true),
  ('EK1003', 'EK1003', 'Makroekonomi', 15, 'Ekonomi', 1, 'grundkurs', 'ekonomprogrammet', true),
  ('ST1001', 'ST1001', 'Statistik för ekonomer', 15, 'Statistik', 1, 'grundkurs', 'ekonomprogrammet', true),
  ('EK2001', 'EK2001', 'Redovisning och bokföring', 15, 'Ekonomi', 2, 'fördjupningskurs', 'ekonomprogrammet', true),
  ('EK2002', 'EK2002', 'Marknadsföring', 15, 'Ekonomi', 2, 'fördjupningskurs', 'ekonomprogrammet', true),
  ('EK2003', 'EK2003', 'Finansiell ekonomi', 15, 'Ekonomi', 2, 'fördjupningskurs', 'ekonomprogrammet', true),
  ('EK2004', 'EK2004', 'Ekonometri', 15, 'Ekonomi', 2, 'fördjupningskurs', 'ekonomprogrammet', true),
  ('EK3001', 'EK3001', 'Strategisk management', 15, 'Ekonomi', 3, 'fördjupningskurs', 'ekonomprogrammet', false),
  ('EK3002', 'EK3002', 'Internationell ekonomi', 15, 'Ekonomi', 3, 'fördjupningskurs', 'ekonomprogrammet', false),
  ('EK3003', 'EK3003', 'Corporate Finance', 15, 'Ekonomi', 3, 'fördjupningskurs', 'ekonomprogrammet', false),
  ('EK3900', 'EK3900', 'Kandidatuppsats', 15, 'Ekonomi', 3, 'fördjupningskurs', 'ekonomprogrammet', true)
on conflict (id) do nothing;

-- Kandidatprogram i biologi
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('BIO101', 'BIO101', 'Biologi I', 15, 'Biologi', 1, 'grundkurs', 'kand_biologi', true),
  ('KEM101', 'KEM101', 'Kemi för biologer', 15, 'Kemi', 1, 'grundkurs', 'kand_biologi', true),
  ('BIO102', 'BIO102', 'Cellbiologi', 15, 'Biologi', 1, 'grundkurs', 'kand_biologi', true),
  ('MAT101', 'MAT101', 'Matematik för biologer', 7.5, 'Matematik', 1, 'grundkurs', 'kand_biologi', true),
  ('STA101', 'STA101', 'Biostatistik', 7.5, 'Statistik', 1, 'grundkurs', 'kand_biologi', true),
  ('BIO201', 'BIO201', 'Genetik', 15, 'Biologi', 2, 'fördjupningskurs', 'kand_biologi', true),
  ('BIO202', 'BIO202', 'Ekologi', 15, 'Biologi', 2, 'fördjupningskurs', 'kand_biologi', true),
  ('BIO203', 'BIO203', 'Mikrobiologi', 15, 'Biologi', 2, 'fördjupningskurs', 'kand_biologi', true),
  ('BIO204', 'BIO204', 'Evolution', 15, 'Biologi', 2, 'fördjupningskurs', 'kand_biologi', true),
  ('BIO301', 'BIO301', 'Molekylärbiologi', 15, 'Biologi', 3, 'fördjupningskurs', 'kand_biologi', false),
  ('BIO302', 'BIO302', 'Fysiologi', 15, 'Biologi', 3, 'fördjupningskurs', 'kand_biologi', false),
  ('BIO303', 'BIO303', 'Biokemi', 15, 'Biologi', 3, 'fördjupningskurs', 'kand_biologi', false),
  ('BIO399', 'BIO399', 'Kandidatarbete biologi', 15, 'Biologi', 3, 'fördjupningskurs', 'kand_biologi', true)
on conflict (id) do nothing;

-- Kandidatprogram i datavetenskap
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('CS101', 'CS101', 'Programmering I', 7.5, 'Datavetenskap', 1, 'grundkurs', 'kand_datavetenskap', true),
  ('CS102', 'CS102', 'Programmering II', 7.5, 'Datavetenskap', 1, 'grundkurs', 'kand_datavetenskap', true),
  ('MA101', 'MA101', 'Matematisk analys', 7.5, 'Matematik', 1, 'grundkurs', 'kand_datavetenskap', true),
  ('MA102', 'MA102', 'Diskret matematik', 7.5, 'Matematik', 1, 'grundkurs', 'kand_datavetenskap', true),
  ('CS103', 'CS103', 'Datastrukturer', 7.5, 'Datavetenskap', 1, 'grundkurs', 'kand_datavetenskap', true),
  ('CS104', 'CS104', 'Objektorienterad programmering', 7.5, 'Datavetenskap', 1, 'grundkurs', 'kand_datavetenskap', true),
  ('CS201', 'CS201', 'Algoritmer och datastrukturer', 7.5, 'Datavetenskap', 2, 'fördjupningskurs', 'kand_datavetenskap', true),
  ('CS202', 'CS202', 'Databaser', 7.5, 'Datavetenskap', 2, 'fördjupningskurs', 'kand_datavetenskap', true),
  ('CS203', 'CS203', 'Operativsystem', 7.5, 'Datavetenskap', 2, 'fördjupningskurs', 'kand_datavetenskap', true),
  ('CS204', 'CS204', 'Webbutveckling', 7.5, 'Datavetenskap', 2, 'fördjupningskurs', 'kand_datavetenskap', true),
  ('CS205', 'CS205', 'Mjukvaruutveckling', 7.5, 'Datavetenskap', 2, 'fördjupningskurs', 'kand_datavetenskap', true),
  ('CS301', 'CS301', 'Maskininlärning', 7.5, 'Datavetenskap', 3, 'fördjupningskurs', 'kand_datavetenskap', false),
  ('CS302', 'CS302', 'IT-säkerhet', 7.5, 'Datavetenskap', 3, 'fördjupningskurs', 'kand_datavetenskap', false),
  ('CS303', 'CS303', 'Distribuerade system', 7.5, 'Datavetenskap', 3, 'fördjupningskurs', 'kand_datavetenskap', false),
  ('CS399', 'CS399', 'Kandidatarbete', 15, 'Datavetenskap', 3, 'fördjupningskurs', 'kand_datavetenskap', true)
on conflict (id) do nothing;

-- Förskollärarprogrammet
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('FÖ1001', 'FÖ1001', 'Förskolan i samhället', 15, 'Utbildningsvetenskap', 1, 'professionskurs', 'forskollararprogrammet', true),
  ('FÖ1002', 'FÖ1002', 'Barns utveckling och lärande', 15, 'Utbildningsvetenskap', 1, 'professionskurs', 'forskollararprogrammet', true),
  ('FÖ1003', 'FÖ1003', 'Verksamhetsförlagd utbildning 1', 15, 'Utbildningsvetenskap', 1, 'professionskurs', 'forskollararprogrammet', true),
  ('FÖ1004', 'FÖ1004', 'Pedagogiskt ledarskap', 15, 'Utbildningsvetenskap', 1, 'professionskurs', 'forskollararprogrammet', true),
  ('FÖ2001', 'FÖ2001', 'Språk och kommunikation', 15, 'Utbildningsvetenskap', 2, 'professionskurs', 'forskollararprogrammet', true),
  ('FÖ2002', 'FÖ2002', 'Matematik och naturvetenskap', 15, 'Utbildningsvetenskap', 2, 'professionskurs', 'forskollararprogrammet', true),
  ('FÖ2003', 'FÖ2003', 'Skapande verksamhet', 15, 'Utbildningsvetenskap', 2, 'professionskurs', 'forskollararprogrammet', true),
  ('FÖ2004', 'FÖ2004', 'Verksamhetsförlagd utbildning 2', 15, 'Utbildningsvetenskap', 2, 'professionskurs', 'forskollararprogrammet', true),
  ('FÖ3001', 'FÖ3001', 'Specialpedagogik', 15, 'Utbildningsvetenskap', 3, 'professionskurs', 'forskollararprogrammet', true),
  ('FÖ3002', 'FÖ3002', 'Verksamhetsförlagd utbildning 3', 22.5, 'Utbildningsvetenskap', 3, 'professionskurs', 'forskollararprogrammet', true),
  ('FÖ3003', 'FÖ3003', 'Examensarbete', 15, 'Utbildningsvetenskap', 3, 'professionskurs', 'forskollararprogrammet', true)
on conflict (id) do nothing;

-- Webbutvecklare (YH)
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('WEB101', 'WEB101', 'HTML och CSS', 20, 'Webbutveckling', 1, 'grundkurs', 'webbutvecklare', true),
  ('WEB102', 'WEB102', 'JavaScript grund', 30, 'Webbutveckling', 1, 'grundkurs', 'webbutvecklare', true),
  ('WEB103', 'WEB103', 'React och moderna ramverk', 30, 'Webbutveckling', 1, 'grundkurs', 'webbutvecklare', true),
  ('WEB104', 'WEB104', 'Backend utveckling', 30, 'Webbutveckling', 1, 'grundkurs', 'webbutvecklare', true),
  ('WEB105', 'WEB105', 'Databaser', 20, 'Webbutveckling', 1, 'grundkurs', 'webbutvecklare', true),
  ('WEB106', 'WEB106', 'UX/UI Design', 20, 'Design', 1, 'grundkurs', 'webbutvecklare', true),
  ('WEB201', 'WEB201', 'Avancerad JavaScript', 30, 'Webbutveckling', 2, 'fördjupningskurs', 'webbutvecklare', true),
  ('WEB202', 'WEB202', 'Cloud och DevOps', 20, 'Webbutveckling', 2, 'fördjupningskurs', 'webbutvecklare', true),
  ('WEB203', 'WEB203', 'Examensarbete', 30, 'Webbutveckling', 2, 'fördjupningskurs', 'webbutvecklare', true),
  ('LIA001', 'LIA001', 'LIA (Lärande i Arbete)', 80, 'Webbutveckling', 2, 'professionskurs', 'webbutvecklare', true)
on conflict (id) do nothing;

-- UX Designer (YH)
insert into public.university_courses (id, course_code, title, credits, subject_area, year, category, program_id, mandatory) values
  ('UX101', 'UX101', 'Introduktion till UX', 20, 'Design', 1, 'grundkurs', 'ux_designer', true),
  ('UX102', 'UX102', 'Användarforskning', 30, 'Design', 1, 'grundkurs', 'ux_designer', true),
  ('UX103', 'UX103', 'Prototyping och wireframing', 30, 'Design', 1, 'grundkurs', 'ux_designer', true),
  ('UX104', 'UX104', 'Visual Design', 30, 'Design', 1, 'grundkurs', 'ux_designer', true),
  ('UX105', 'UX105', 'Interaktionsdesign', 30, 'Design', 1, 'grundkurs', 'ux_designer', true),
  ('UX106', 'UX106', 'Frontend för designers', 20, 'Design', 1, 'grundkurs', 'ux_designer', true),
  ('UX201', 'UX201', 'Avancerad UX', 30, 'Design', 2, 'fördjupningskurs', 'ux_designer', true),
  ('UX202', 'UX202', 'Design system', 20, 'Design', 2, 'fördjupningskurs', 'ux_designer', true),
  ('UX203', 'UX203', 'Examensarbete', 30, 'Design', 2, 'fördjupningskurs', 'ux_designer', true),
  ('LIA002', 'LIA002', 'LIA (Lärande i Arbete)', 80, 'Design', 2, 'professionskurs', 'ux_designer', true)
on conflict (id) do nothing;

-- Generera beskrivningar
update public.university_courses
set description = title || ' – ' || credits::text || ' hp'
where description is null;

-- ============================================================
-- SEED 4: Program ↔ kurs-kopplingar
-- Delade kurser (SF1624, SF1625, SF1626, SF1680, DD1301) länkas
-- till ALLA tre civilingenjörsprogrammen.
-- semester = startterminen för året: (år-1)*2 + 1.
-- ============================================================

-- Per program: koppla alla kurser som pekar på programmet, plus de delade kurserna.
insert into public.university_program_courses (program_id, course_id, semester, year, is_mandatory)
select p.id, c.id, (c.year - 1) * 2 + 1, c.year, c.mandatory
from public.university_courses c
join public.university_programs p on true
where p.id in ('civ_datateknik', 'civ_elektroteknik', 'civ_industriell_ekonomi')
  and (
    c.program_id = p.id
    or c.id in ('SF1624', 'SF1625', 'SF1626', 'SF1680', 'DD1301')
  )
on conflict do nothing;

-- Övriga program: 1-till-1 koppling via kursernas program_id.
insert into public.university_program_courses (program_id, course_id, semester, year, is_mandatory)
select c.program_id, c.id, (c.year - 1) * 2 + 1, c.year, c.mandatory
from public.university_courses c
where c.program_id is not null
  and c.program_id not in ('civ_datateknik', 'civ_elektroteknik', 'civ_industriell_ekonomi')
on conflict do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Innehållstabeller: publik läsning, inloggade får lägga till rader
-- (appens "se till att kursen finns"-logik).
alter table public.universities             enable row level security;
alter table public.university_programs      enable row level security;
alter table public.university_courses       enable row level security;
alter table public.university_program_courses enable row level security;
alter table public.user_university_courses  enable row level security;

drop policy if exists "Public read universities" on public.universities;
create policy "Public read universities" on public.universities for select using (true);
drop policy if exists "Authenticated insert universities" on public.universities;
create policy "Authenticated insert universities" on public.universities for insert to authenticated with check (true);

drop policy if exists "Public read university programs" on public.university_programs;
create policy "Public read university programs" on public.university_programs for select using (true);
drop policy if exists "Authenticated insert university programs" on public.university_programs;
create policy "Authenticated insert university programs" on public.university_programs for insert to authenticated with check (true);

drop policy if exists "Public read university courses" on public.university_courses;
create policy "Public read university courses" on public.university_courses for select using (true);
drop policy if exists "Authenticated insert university courses" on public.university_courses;
create policy "Authenticated insert university courses" on public.university_courses for insert to authenticated with check (true);

drop policy if exists "Public read program courses" on public.university_program_courses;
create policy "Public read program courses" on public.university_program_courses for select using (true);
drop policy if exists "Authenticated insert program courses" on public.university_program_courses;
create policy "Authenticated insert program courses" on public.university_program_courses for insert to authenticated with check (true);

-- Användardata: ägaren får allt.
drop policy if exists "Users manage own university courses" on public.user_university_courses;
create policy "Users manage own university courses"
  on public.user_university_courses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- RPC: assign_university_courses
-- Atomär kurs-tilldelning vid konto-skapande: hittar årets kurser
-- för programmet (obligatoriska först), skriver in användaren i
-- user_university_courses och returnerar listan för lokalt state.
-- ============================================================
create or replace function public.assign_university_courses(
  p_program_id text,
  p_term int
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid := auth.uid();
  v_year     int;
  v_row      record;
  v_assigned jsonb := '[]'::jsonb;
  v_count    int := 0;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_term is null or p_term < 1 then
    p_term := 1;
  end if;

  -- Termin 1-2 = år 1, termin 3-4 = år 2, osv.
  v_year := least(ceil(p_term / 2.0)::int, 5);

  for v_row in
    select uc.id, uc.title, uc.description, uc.credits, uc.subject_area
    from public.university_program_courses upc
    join public.university_courses uc on uc.id = upc.course_id
    where upc.program_id = p_program_id
      and upc.year = v_year
    order by upc.is_mandatory desc, uc.course_code
    limit 15
  loop
    insert into public.user_university_courses
      (user_id, course_id, program_id, semester, progress, is_active)
    values
      (v_user_id, v_row.id, p_program_id, p_term, 0, true)
    on conflict (user_id, course_id) do update
      set is_active = true,
          program_id = excluded.program_id;

    v_assigned := v_assigned || jsonb_build_object(
      'courseId',    v_row.id,
      'title',       v_row.title,
      'subject',     v_row.subject_area,
      'description', coalesce(v_row.description, v_row.title || ' – ' || v_row.credits::text || ' hp'),
      'credits',     v_row.credits
    );
    v_count := v_count + 1;
  end loop;

  return jsonb_build_object(
    'assigned', v_assigned,
    'count',    v_count,
    'year',     v_year
  );
end;
$$;

grant execute on function public.assign_university_courses(text, int) to authenticated;

-- ============================================================
-- MIGRATION NOTES
-- ============================================================
-- 1. Kör hela filen i Supabase SQL Editor (idempotent).
-- 2. Appen anropar RPC:n assign_university_courses(program_id, termin)
--    vid konto-skapande och vid profiluppdatering.
-- 3. profiles.university_id / university_name används av steget
--    "Vilket universitet/högskola?" i onboarding.
-- ============================================================
