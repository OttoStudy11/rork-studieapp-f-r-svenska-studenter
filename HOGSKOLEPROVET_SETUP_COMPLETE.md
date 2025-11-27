# Högskoleprovet System - Complete Setup Guide

## Overview
Detta system låter användare träna på Högskoleprovet med riktiga frågor från tidigare prov.

## Databas Setup

### Steg 1: Skapa Tabeller
Kör först SQL-filen för att skapa tabellerna:
```bash
create-hogskoleprovet-system.sql
```

Detta skapar:
- `hp_tests` - Prov instanser från specifika datum
- `hp_sections` - De 8 delarna av högskoleprovet
- `hp_questions` - Individuella frågor
- `user_hp_question_answers` - Användarens svar
- `user_hp_test_attempts` - Användarens försök

### Steg 2: Populera med Frågor
Kör sedan SQL-filen för att lägga till frågor:
```bash
populate-hogskoleprovet-questions.sql
```

Detta lägger till:
- 3 test-instanser (HT 2024, VT 2024, HT 2023)
- 8 sektioner (ORD, LÄS, MEK, NOG, ELF, KVA, XYZ, DTK)
- 60+ exempelfrågor fördelade över sektionerna

## Verifiering

### Kontrollera att tabellerna skapades
```sql
-- Kontrollera hp_sections
SELECT * FROM hp_sections ORDER BY section_order;
-- Bör visa 8 rader (ORD, LÄS, MEK, NOG, ELF, KVA, XYZ, DTK)

-- Kontrollera hp_tests
SELECT * FROM hp_tests ORDER BY test_date DESC;
-- Bör visa 3 rader (2024-10-15, 2024-04-15, 2023-10-15)

-- Kontrollera hp_questions
SELECT section_code, COUNT(*) as antal_fragor 
FROM hp_questions 
JOIN hp_sections ON hp_questions.section_id = hp_sections.id 
GROUP BY section_code, hp_sections.section_order
ORDER BY hp_sections.section_order;
-- Bör visa antal frågor per sektion
```

### Testa frågorna manuellt
```sql
-- Hämta frågor för en specifik sektion (t.ex. ORD)
SELECT q.*, s.section_name, s.section_code
FROM hp_questions q
JOIN hp_sections s ON q.section_id = s.id
WHERE s.section_code = 'ORD'
ORDER BY q.question_number;
```

## Felsökning

### Problem: "Inga frågor tillgängliga"

**Orsak**: Databasen har inte blivit korrekt populerad med frågor.

**Lösning**:
1. Kontrollera att båda SQL-filerna har körts i Supabase SQL Editor
2. Verifiera att tabellerna innehåller data (se queries ovan)
3. Kontrollera RLS policies - användaren måste ha läsrättigheter

### Problem: "Kunde inte hämta frågor"

**Orsak**: Nätverksfel eller felaktiga RLS policies.

**Lösning**:
1. Kontrollera internetanslutningen
2. Verifiera RLS policies:
```sql
-- Kontrollera RLS policies för hp_questions
SELECT * FROM pg_policies WHERE tablename = 'hp_questions';

-- Policies bör inkludera:
-- "Anyone can view questions" FOR SELECT USING (true)
```

### Problem: Frågor saknar options eller correct_answer

**Orsak**: JSONB-formatering är felaktig.

**Lösning**:
```sql
-- Kontrollera att options är korrekt formaterade
SELECT id, question_text, options, correct_answer
FROM hp_questions
WHERE section_id = (SELECT id FROM hp_sections WHERE section_code = 'ORD')
LIMIT 5;

-- Options bör vara en JSON-array, t.ex.:
-- ["A) Välvillig", "B) Beredd", "C) Böjd", "D) Villig"]
```

## Debugging

Appen loggar nu omfattande information till konsolen:

### Konsolloggar att leta efter:
```
[HP] Fetching questions for section: <uuid>
[HP] Query result: { data: X, error: null }
[HP] Parsed questions: X
[HP Practice] Loading questions for section: <uuid>
[HP Practice] Fetched questions: X
[HP Practice] Started attempt: <uuid>
```

### Om du ser:
- `[HP] No questions found for section` → Databasen har inga frågor för den sektionen
- `[HP] Error fetching questions` → Supabase-fel eller RLS-problem
- `[HP] Error parsing question options` → JSONB-formatering är felaktig

## Lägg till Fler Frågor

För att lägga till fler frågor, följ detta format:

```sql
INSERT INTO hp_questions (
  test_id, 
  section_id, 
  question_number, 
  question_text, 
  question_type, 
  options, 
  correct_answer, 
  explanation, 
  difficulty_level
) VALUES (
  '<test_id>',
  (SELECT id FROM hp_sections WHERE section_code = 'ORD'),
  11,
  'Vilket ord har närmast samma betydelse som EXEMPEL?',
  'multiple_choice',
  '["A) Alt 1", "B) Alt 2", "C) Alt 3", "D) Alt 4"]'::jsonb,
  'B',
  'Förklaring här',
  'medium'
);
```

## Produktionsklar Implementation

För en fullständig implementation behöver du:

1. **Lägg till alla 20 frågor per sektion** (för varje test)
2. **Lägg till fler test-instanser** från tidigare prov
3. **Inkludera läsförståelse-texter** för LÄS-sektionen
4. **Lägg till diagram-URLs** för visuella frågor
5. **Skapa en admin-panel** för att lägga till frågor via UI

## Upphovsrätt

**VIKTIGT**: Högskoleprovets frågor är upphovsrättsskyddade av Universitets- och högskolerådet (UHR). 
För en produktionsapp måste du:
- Få tillstånd från UHR att använda frågorna
- Skapa egna frågor som liknar provet
- Använda endast officiellt publicerade prov

## Support

Om problem kvarstår:
1. Kontrollera konsolloggarna i appen
2. Kör verifieringsqueries i Supabase
3. Kontrollera att RLS policies är korrekt konfigurerade
4. Verifiera att `HogskoleprovetProvider` är korrekt wrappad i `app/_layout.tsx`
