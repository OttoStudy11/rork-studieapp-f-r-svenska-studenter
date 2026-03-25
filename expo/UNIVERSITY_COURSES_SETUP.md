# Setup Guide för Universitets- och Högskolekurser

Detta dokument beskriver hur man skapar och populerar universitets- och högskolekurser i databasen.

## Översikt

Systemet består av följande komponenter:

1. **universities** - Alla svenska universitet, högskolor och yrkeshögskolor
2. **university_programs** - Program på varje lärosäte
3. **university_courses** - Individuella kurser
4. **university_program_courses** - Kopplingstabell mellan program och kurser
5. **user_university_courses** - Användarnas valda kurser

## Installation - Steg för steg

### Steg 1: Skapa databastabeller
Kör först denna SQL-fil för att skapa alla nödvändiga tabeller:

```sql
-- Fil: create-complete-university-system.sql
-- Skapar: universities, university_programs, university_courses, 
--         university_program_courses, user_university_courses
-- RLS policies aktiveras
```

### Steg 2: Populera lärosäten och program
Fyll databasen med alla svenska lärosäten och deras program:

```sql
-- Fil: populate-all-universities-programs.sql
-- Fyller: 
--   - 40+ universitet, högskolor och yrkeshögskolor
--   - 200+ program inom alla områden:
--     * Civilingenjör och högskoleingenjör
--     * Medicin och hälsa  
--     * Naturvetenskap
--     * Samhällsvetenskap
--     * Humaniora
--     * Lärarutbildningar
--     * Yrkeshögskola
--     * Konstnärliga program
```

### Steg 3: Skapa alla kurser
Populera databasen med kurser för alla ämnesområden:

```sql
-- Fil: populate-all-university-courses-complete.sql
-- Skapar 100+ kurser inom:
--   - Teknik (Datateknik, Elektroteknik, Maskinteknik)
--   - Medicin och omvårdnad
--   - Naturvetenskap (Biologi, Kemi, Fysik)
--   - Samhällsvetenskap (Juridik, Ekonomi, Psykologi, Statsvetenskap)
--   - Humaniora (Historia, Filosofi)
--   - Pedagogik
--   - Webbutveckling och IT
--   - Konst och musik
```

### Steg 4: Koppla kurser till program
Skapa kopplingar mellan kurser och program:

```sql
-- Fil: link-university-courses-to-programs.sql
-- Kopplar kurser till program och terminer
-- Exempel:
--   - KTH Datateknik: 15+ kurser fördelade över 10 terminer
--   - Läkarprogrammet: 10+ kurser fördelade över 11 terminer
--   - Juristprogrammet: 5+ kurser fördelade över 9 terminer
--   - Kandidatprogram: 4-5 kurser per program
```

## Kör alla SQL-filer i följd

I Supabase SQL Editor, kör i denna ordning:

```bash
1. create-complete-university-system.sql
2. populate-all-universities-programs.sql  
3. populate-all-university-courses-complete.sql
4. link-university-courses-to-programs.sql
```

## Verifiera installation

Efter installation, kör dessa queries för att verifiera:

```sql
-- Kontrollera antal lärosäten
SELECT COUNT(*) as antal_larosaten FROM universities;
-- Förväntat: 40+

-- Kontrollera antal program
SELECT COUNT(*) as antal_program FROM university_programs;
-- Förväntat: 200+

-- Kontrollera antal kurser
SELECT COUNT(*) as antal_kurser FROM university_courses;
-- Förväntat: 100+

-- Kontrollera program-kurskopplingar
SELECT COUNT(*) as antal_kopplingar FROM university_program_courses;
-- Förväntat: 200+

-- Visa fördelning per lärosäte
SELECT 
  u.short_name,
  u.name,
  COUNT(DISTINCT up.id) as antal_program,
  COUNT(DISTINCT upc.course_id) as antal_kurser
FROM universities u
LEFT JOIN university_programs up ON up.university_id = u.id
LEFT JOIN university_program_courses upc ON upc.program_id = up.id
GROUP BY u.id, u.short_name, u.name
ORDER BY antal_program DESC
LIMIT 20;
```

## Lärosäten som ingår

### Stora Universitet (10+)
- Uppsala universitet (UU)
- Lunds universitet (LU)  
- Stockholms universitet (SU)
- Göteborgs universitet (GU)
- KTH - Kungliga Tekniska högskolan
- Chalmers tekniska högskola
- Linköpings universitet (LiU)
- Umeå universitet (UmU)
- Karolinska Institutet (KI)
- m.fl.

### Högskolor (15+)
- Blekinge tekniska högskola (BTH)
- Mälardalens universitet (MDU)
- Högskolan i Borås (HB)
- Högskolan i Jönköping (HJ)
- m.fl.

### Handelshögskolor (2+)
- Handelshögskolan i Stockholm (HHS)
- IHM Business School

### Konstnärliga högskolor (7+)
- Konstfack
- Kungliga Konsthögskolan
- Kungliga Musikhögskolan
- m.fl.

### Yrkeshögskolor (6+)
- Nackademin
- Hyper Island
- Berghs School of Communication
- Chas Academy
- m.fl.

## Programtyper som täcks

### Tekniska program
- **Civilingenjör** (300 hp, 5 år)
  - Datateknik, Elektroteknik, Maskinteknik
  - Teknisk fysik, Kemiteknik, Bioteknik
  - Industriell ekonomi, Samhällsbyggnad

- **Högskoleingenjör** (180 hp, 3 år)
  - Datateknik, Elektroteknik, Maskinteknik

### Medicinska program
- **Professionsprogram**
  - Läkarprogrammet (330 hp, 5.5 år)
  - Tandläkarprogrammet (300 hp, 5 år)
  - Sjuksköterskeprogrammet (180 hp, 3 år)
  - Fysioterapeutprogrammet (180 hp, 3 år)
  - Psykologprogrammet (300 hp, 5 år)

### Naturvetenskap
- **Kandidatprogram** (180 hp, 3 år)
  - Biologi, Kemi, Fysik, Matematik
  - Datavetenskap, Statistik, Geovetenskap

### Samhällsvetenskap
- **Professionsprogram**
  - Juristprogrammet (270 hp, 4.5 år)
  - Civilekonomprogrammet (240 hp, 4 år)
  - Socionomprogrammet (210 hp, 3.5 år)

- **Kandidatprogram** (180 hp, 3 år)
  - Ekonomi, Statsvetenskap, Sociologi

### Humaniora
- **Kandidatprogram** (180 hp, 3 år)
  - Historia, Filosofi, Litteraturvetenskap
  - Språkvetenskap, Religionsvetenskap

### Lärarutbildningar
- **Professionsprogram**
  - Förskollärarprogrammet (210 hp, 3.5 år)
  - Grundlärarprogrammet F-3 (240 hp, 4 år)
  - Grundlärarprogrammet 4-6 (240 hp, 4 år)
  - Ämneslärarprogrammet 7-9 (270 hp, 4.5 år)
  - Ämneslärarprogrammet gymnasiet (300 hp, 5 år)

### Yrkeshögskola
- **YH-program** (400 yhp, 2 år)
  - Webbutvecklare, Systemutvecklare
  - UX Designer, Frontend Developer
  - Grafisk design, Art Direction
  - Digital Marketing

## Kursexempel per område

### Teknik (Datateknik)
- SF1624 - Algebra och geometri (7.5 hp)
- SF1625 - Envariabelanalys (7.5 hp)
- DD1331 - Grundläggande programmering (7.5 hp)
- DD1337 - Programmering (7.5 hp)
- DD1338 - Algoritmer och datastrukturer (7.5 hp)
- DD2372 - Databaser (7.5 hp)
- DD2380 - Artificiell intelligens (6 hp)

### Medicin
- MED101 - Medicinsk terminologi (5 hp)
- MED102 - Anatomi och fysiologi I (15 hp)
- MED201 - Patologi (10 hp)
- MED202 - Farmakologi (10 hp)
- MED301 - Kirurgi (15 hp)

### Naturvetenskap (Biologi)
- BIO101 - Allmän biologi I (15 hp)
- BIO102 - Allmän biologi II (15 hp)
- BIO201 - Molekylärbiologi (15 hp)
- BIO202 - Mikrobiologi (15 hp)

### Juridik
- JUR101 - Introduktion till juridik (15 hp)
- JUR201 - Avtalsrätt (15 hp)
- JUR202 - Straffrätt (15 hp)
- JUR301 - Processrätt (15 hp)

### Yrkeshögskola (Webbutveckling)
- WEB101 - HTML och CSS (10 hp)
- WEB201 - JavaScript (15 hp)
- WEB301 - React och moderna ramverk (15 hp)
- SYS101 - UX Design (10 hp)

## Nästa steg: Hårdkodade kurssidor

Efter att databaskurserna är på plats, skapa hårdkodade kurssidor i:
```
app/course-content/university/
```

Följ samma struktur som för gymnasiekurser i `app/course-content/`:
- Moduler med lektioner
- Studie-guider  
- Övningar och uppgifter
- Resurser och länkar

## Framtida utbyggnad

För att göra systemet komplett:

1. **Fler kurser per program** - Lägg till fler kurser för varje program
2. **Förkunskapskrav** - Använd `prerequisites` arrayen för att visa kurskedjor
3. **Kurslitteratur** - Lägg till rekommenderad litteratur per kurs
4. **Examinationsformer** - Specificera hur kurser examineras
5. **Kurshemsidor** - Länka till officiella kurshemsidor
6. **Betygskalor** - Hantera U-G eller U-3-4-5 beroende på kurs

## Support

Om du har problem med installationen:
1. Kontrollera att RLS policies är aktiverade
2. Verifiera att foreign keys stämmer
3. Kör verifieringsqueries för att se vad som saknas
4. Kontrollera Supabase logs för felmeddelanden
