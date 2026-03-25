# Guide: Skapa kursinnehåll för universitetskurser

## 📊 Översikt

Du har **85 universitetskurser** som behöver innehåll. Dessa är fördelade enligt:

- **26 st** Tekniska kurser (Datateknik, Elektroteknik, Maskinteknik, Matematik)
- **15 st** Medicinska kurser (Läkarprogrammet, Sjuksköterskeprogrammet)
- **13 st** Naturvetenskap (Biologi, Kemi, Fysik)
- **18 st** Samhällsvetenskap (Juridik, Ekonomi, Psykologi, Statsvetenskap)
- **5 st** Humaniora (Historia, Filosofi)
- **4 st** Lärarutbildningar
- **5 st** IT & Systemvetenskap (Yrkeshögskola)
- **5 st** Konstnärliga kurser

## 📁 Filer du behöver

1. **sql-templates/university-course-content-template.sql** - Tom mall att kopiera
2. **sql-templates/example-SF1624-algebra-geometri.sql** - Komplett exempel

## 🏗️ Struktur för varje kurs

Varje kurs ska ha:

```
KURS (t.ex. SF1624)
├── 3-5 MODULER
│   ├── Modul 1
│   │   ├── 3-5 lektioner
│   │   │   ├── Teori-lektioner
│   │   │   ├── Övnings-lektioner
│   │   │   └── Quiz (valfritt)
│   ├── Modul 2
│   │   └── ...
│   └── Modul 3
│       └── ...
└── Studiehandledning (formelsamling, sammanfattning)
```

## 📝 Arbetsflöde

### Steg 1: Välj en kurs
Börja med de viktigaste kurserna från varje kategori.

**Rekommenderad prioritering:**
1. Grundläggande tekniska kurser (SF1624, SF1625, DD1331)
2. Medicinska grundkurser (MED101, MED102)
3. Naturvetenskapliga grundkurser (BIO101, KEM101, FYS101)
4. Samhällsvetenskapliga grundkurser (JUR101, EKO101, PSY101)

### Steg 2: Kopiera mallen
```bash
cp sql-templates/university-course-content-template.sql sql-templates/course-content-[KURSKOD].sql
```

### Steg 3: Fyll i kursdata
Ersätt alla PLACEHOLDER-värden:

```sql
-- Kursinformation
course_code: 'SF1624'
title: 'Algebra och geometri'
credits: 7.5
level: 'grundnivå' eller 'avancerad nivå'
subject_area: 'Matematik', 'Datavetenskap', etc.
```

### Steg 4: Planera moduler
Dela upp kursen i 3-5 logiska moduler:

**Exempel för SF1624:**
- Modul 1: Vektorer och vektorgeometri
- Modul 2: Matriser och linjära ekvationssystem
- Modul 3: Determinanter och egenvärden
- Modul 4: Linjära avbildningar

### Steg 5: Skapa lektioner
Varje modul ska ha 3-5 lektioner:

**Lektionstyper:**
- `'theory'` - Teorigenomsång med förklaringar och exempel
- `'exercise'` - Övningsuppgifter med facit
- `'video'` - Videolektion (om du har videos)
- `'quiz'` - Interaktivt quiz

**Innehållsstruktur (Markdown):**
```markdown
## Huvudrubrik

### Underrubrik
Förklarande text...

**Viktiga begrepp:**
- Begrepp 1
- Begrepp 2

### Exempel
Visa konkreta exempel...

### Övningar
1. Övning 1
2. Övning 2
```

### Steg 6: Lägg till quiz (valfritt)
Skapa multiple-choice quiz för viktiga lektioner:
```json
{
  "question": "Frågan här?",
  "options": ["Alt A", "Alt B", "Alt C", "Alt D"]
}
```

### Steg 7: Skapa studiehandledning
Formelsamling eller sammanfattning av kursen.

### Steg 8: Kör SQL-filen
```bash
# I Supabase SQL Editor eller via CLI
psql -f sql-templates/course-content-SF1624.sql
```

### Steg 9: Verifiera
Kontrollera att allt finns i databasen:
```sql
SELECT 
  uc.course_code,
  COUNT(DISTINCT cm.id) as moduler,
  COUNT(DISTINCT cl.id) as lektioner
FROM university_courses uc
LEFT JOIN course_modules cm ON cm.course_id = uc.id
LEFT JOIN course_lessons cl ON cl.course_id = uc.id
WHERE uc.course_code = 'SF1624'
GROUP BY uc.course_code;
```

## 💡 Tips för innehållsskapande

### Teori-lektioner
- Börja med grundläggande begrepp
- Använd konkreta exempel
- Inkludera bilder/diagram (via URL om möjligt)
- Bygg gradvis upp komplexiteten

### Övnings-lektioner
- Starta enkelt, öka svårighetsgraden
- Ge tydliga lösningar med förklaringar
- Inkludera olika typer av problem
- Koppla till verkliga tillämpningar

### Tidsberäkningar
- Teori-lektion: 30-60 minuter
- Övnings-lektion: 60-90 minuter
- Quiz: 10-15 minuter
- Modul totalt: 10-20 timmar

## 🎯 Kvalitetskrav

### Innehållskvalitet
✅ Korrekt och aktuell information
✅ Tydliga förklaringar
✅ Konkreta exempel
✅ Progressiv svårighetsgrad
✅ Övningar med lösningar

### Struktur
✅ Logisk uppdelning i moduler
✅ 3-5 moduler per kurs
✅ 3-5 lektioner per modul
✅ Tydliga lärandemål för varje lektion

### Format
✅ Markdown-formatering
✅ Korrekta UUID:er
✅ Korrekt metadata (tid, svårighetsgrad)
✅ Published = true när klart

## 📋 Checklista per kurs

- [ ] Kursdata fylld i (titel, beskrivning, credits, etc.)
- [ ] 3-5 moduler skapade
- [ ] Varje modul har 3-5 lektioner
- [ ] Minst en övningslektion per modul
- [ ] Minst ett quiz för kursen
- [ ] Studiehandledning/formelsamling skapad
- [ ] SQL-fil testad och verifierad
- [ ] Innehåll granskat för kvalitet

## 🚀 Produktionsstrategi

### Fas 1: Grundkurser (10 kurser)
De mest kritiska kurserna först:
- SF1624, SF1625 (Matematik)
- DD1331, DD1337 (Programmering)
- MED101, MED102 (Medicin)
- JUR101 (Juridik)
- EKO101 (Ekonomi)
- PSY101 (Psykologi)
- BIO101 (Biologi)

### Fas 2: Fortsättningskurser (30 kurser)
Kurser som bygger på grundkurserna.

### Fas 3: Fördjupningskurser (45 kurser)
Avancerade och specialiserade kurser.

## 🔧 Tekniska detaljer

### UUID:er
Alla ID:n i `course_modules` och `course_lessons` MÅSTE vara UUID:er:
```sql
gen_random_uuid()  -- Låt databasen generera
```

### Foreign Keys
```
university_courses.id (UUID) → course_modules.course_id
course_modules.id (UUID) → course_lessons.module_id
course_lessons.id (UUID) → course_exercises.lesson_id
```

### Svårighetsgrader
- `'easy'` - Grundläggande
- `'medium'` - Medel
- `'hard'` - Avancerad

### Lektionstyper
- `'theory'` - Teori
- `'exercise'` - Övningar
- `'video'` - Video
- `'quiz'` - Quiz

## 📞 Support

Om du stöter på problem:
1. Kontrollera att alla UUID:er är korrekta
2. Verifiera att course_code matchar university_courses
3. Se till att order_index är unika per modul/lektion
4. Testa SQL-filen i en staging-miljö först

## 📚 Exempel att studera

Se `sql-templates/example-SF1624-algebra-geometri.sql` för ett komplett exempel på hur en färdig kurs ska se ut.

---

**Lycka till med innehållsskapandet! 🎓**
