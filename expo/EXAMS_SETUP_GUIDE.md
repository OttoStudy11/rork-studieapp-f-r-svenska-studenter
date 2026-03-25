# Provplanering - Setup Guide

## Problem
Prov schemaläggs inte och sparas inte korrekt i databasen.

## Lösning

### 1. Kör SQL-skriptet i Supabase

Öppna Supabase Dashboard → SQL Editor och kör filen `setup-exams-table.sql`:

```bash
# Navigera till SQL Editor i Supabase Dashboard
# Klistra in innehållet från setup-exams-table.sql
# Kör skriptet
```

### 2. Verifiera att tabellen skapades

Kör följande i SQL Editor för att verifiera:

```sql
-- Kontrollera att tabellen finns
SELECT * FROM information_schema.tables 
WHERE table_name = 'exams';

-- Kontrollera RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'exams';

-- Kontrollera indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'exams';
```

### 3. Testa att lägga till ett prov

1. Öppna appen
2. Navigera till Planering (från hemskärmen eller via navigering)
3. Klicka på plus-knappen
4. Fyll i provuppgifter:
   - Titel (obligatorisk)
   - Datum och tid
   - Typ (skriftligt, muntligt, etc.)
   - Plats
   - Längd i minuter
5. Klicka "Lägg till prov"
6. Provet ska nu synas i listan

### 4. Felsökning

Om proven fortfarande inte sparas, kontrollera följande:

**Loggar i konsolen:**
```
📝 Adding exam to database: {title, date, status}
✅ Exam saved to database: <exam_id>
📋 Parsed exam object: <exam_object>
📊 Updated exams list, total count: X
```

**Kontrollera i Supabase:**
1. Gå till Table Editor
2. Välj `exams` tabell
3. Se om det finns några rader

**Vanliga problem:**

1. **RLS policies blockerar:** Se till att `auth.uid()` fungerar korrekt
   ```sql
   -- Testa RLS
   SELECT auth.uid(); -- Ska returnera ditt user ID
   
   -- Se om du kan läsa från exams
   SELECT * FROM exams WHERE user_id = auth.uid();
   ```

2. **User ID saknas:** Se till att du är inloggad
   ```typescript
   // I konsolen
   console.log('User ID:', user?.id);
   ```

3. **Validation error:** Kontrollera att alla required fields finns:
   - `user_id` (sätts automatiskt)
   - `title` (från formulär)
   - `exam_date` (från formulär)
   - `status` (default: 'scheduled')

### 5. Funktioner som nu fungerar

- ✅ Lägg till prov
- ✅ Visa kommande prov
- ✅ Gruppera efter denna vecka / månad / senare
- ✅ Redigera prov
- ✅ Ta bort prov
- ✅ Markera som klart
- ✅ Notifikationer (1 vecka, 3 dagar, 1 dag innan)
- ✅ Historik över genomförda prov
- ✅ Bakåtknapp från Planering och Historik

### 6. Navigation

**Från hemskärmen:**
- Tappa på "Kommande Prov" widget (om du har prov)
- Eller navigera via inställningar

**Planering-sidan:**
- Bakåtknapp (vänster topp)
- Historik-knapp (höger topp)
- Plus-knapp (floating bottom right)

**Historik-sidan:**
- Bakåtknapp (vänster topp)
- Filter per år
- Expanderbara kort med detaljer

## Databasschema

```
exams
├── id (UUID, PK)
├── user_id (UUID, FK -> auth.users)
├── course_id (TEXT, optional)
├── title (TEXT, required)
├── description (TEXT)
├── exam_date (TIMESTAMPTZ, required)
├── duration_minutes (INTEGER)
├── location (TEXT)
├── exam_type (TEXT: written|oral|practical|online|other)
├── status (TEXT: scheduled|completed|missed|cancelled)
├── grade (TEXT)
├── notes (TEXT)
├── notification_enabled (BOOLEAN)
├── notification_time_before_minutes (INTEGER)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

## Support

Om problem kvarstår:
1. Kontrollera konsolloggar
2. Verifiera Supabase-anslutning
3. Se till att RLS policies är korrekt uppsatta
4. Kontrollera att användare är autentiserad
