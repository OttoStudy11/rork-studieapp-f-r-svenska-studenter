# Guide för att synka med Supabase-databasen

## Översikt
Din Rork-kod använder redan rätt tabellstruktur som matchar din Supabase-databas. Här är vad du behöver verifiera:

## Viktiga tabeller som används

### 1. **user_lesson_progress**
Används för att spåra användarens framsteg i lektioner:
- `user_id` - Användar-ID
- `lesson_id` - Lektions-ID
- `course_id` - Kurs-ID
- `status` - Status (in_progress, completed)
- `progress_percentage` - Procent slutfört (0-100)
- `time_spent_minutes` - Tid spenderad i minuter
- `started_at` - När lektionen startades
- `completed_at` - När lektionen slutfördes
- `last_accessed_at` - Senast åtkomst

**Används i:** `app/lesson/[id].tsx` (rad 68-78, 106-135, 137-170)

### 2. **user_exercise_attempts**
Används för att spåra övningsförsök:
- `user_id` - Användar-ID
- `exercise_id` - Övnings-ID
- `course_id` - Kurs-ID
- `attempt_number` - Försöksnummer
- `score` - Poäng
- `max_score` - Max poäng
- `percentage` - Procent
- `is_completed` - Om slutförd
- `answers` - Svar (jsonb)

### 3. **user_assessment_results**
Används för bedömningsresultat:
- `user_id` - Användar-ID
- `assessment_id` - Bedömnings-ID
- `course_id` - Kurs-ID
- `score` - Poäng
- `max_score` - Max poäng
- `percentage` - Procent
- `passed` - Om godkänd

### 4. **user_progress**
Används för övergripande användarframsteg:
- `user_id` - Användar-ID
- `xp` - Erfarenhetspoäng
- `level` - Nivå
- `total_study_time` - Total studietid
- `total_sessions` - Totalt antal sessioner
- `current_streak` - Nuvarande streak
- `longest_streak` - Längsta streak

## Vad du behöver kontrollera i Supabase

### 1. RLS (Row Level Security) Policies
Kontrollera att du har rätt RLS-policies för dessa tabeller:

```sql
-- user_lesson_progress
CREATE POLICY "Users can view own lesson progress"
ON user_lesson_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress"
ON user_lesson_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
ON user_lesson_progress FOR UPDATE
USING (auth.uid() = user_id);

-- user_exercise_attempts
CREATE POLICY "Users can view own exercise attempts"
ON user_exercise_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise attempts"
ON user_exercise_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- user_assessment_results
CREATE POLICY "Users can view own assessment results"
ON user_assessment_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessment results"
ON user_assessment_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- user_progress
CREATE POLICY "Users can view own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);
```

### 2. Kontrollera att RLS är aktiverat
```sql
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
```

### 3. Kontrollera unique constraints
För `user_lesson_progress` behöver du en unique constraint:
```sql
ALTER TABLE user_lesson_progress 
ADD CONSTRAINT user_lesson_progress_user_lesson_unique 
UNIQUE (user_id, lesson_id);
```

### 4. Kontrollera att kursinnehåll finns
Kör dessa queries i Supabase SQL Editor för att se om du har innehåll:

```sql
-- Kontrollera kurser
SELECT COUNT(*) FROM courses;

-- Kontrollera moduler
SELECT COUNT(*) FROM course_modules;

-- Kontrollera lektioner
SELECT COUNT(*) FROM course_lessons;

-- Kontrollera övningar
SELECT COUNT(*) FROM course_exercises;

-- Kontrollera studiehjälpmedel
SELECT COUNT(*) FROM study_guides;
```

## Vanliga problem och lösningar

### Problem 1: "Inga lektioner visas"
**Lösning:** Kontrollera att `is_published` är `true` för moduler och lektioner:
```sql
UPDATE course_modules SET is_published = true;
UPDATE course_lessons SET is_published = true;
```

### Problem 2: "Progress sparas inte"
**Lösning:** Kontrollera RLS-policies och att unique constraint finns på `user_lesson_progress`.

### Problem 3: "Kan inte se kursinnehåll"
**Lösning:** Kontrollera att kurser är kopplade till moduler och lektioner via `course_id`:
```sql
SELECT 
  c.title as course,
  COUNT(DISTINCT m.id) as modules,
  COUNT(DISTINCT l.id) as lessons
FROM courses c
LEFT JOIN course_modules m ON m.course_id = c.id
LEFT JOIN course_lessons l ON l.course_id = c.id
GROUP BY c.id, c.title;
```

## Hur koden fungerar

### När en lektion öppnas (`app/lesson/[id].tsx`):
1. Laddar lektionsdata från `course_lessons`
2. Laddar användarens progress från `user_lesson_progress`
3. Om ingen progress finns, skapas en ny rad med status `in_progress`
4. När användaren klickar "Markera som slutförd", uppdateras status till `completed`

### När en kurs öppnas (`app/course/[id].tsx`):
1. Laddar kursdata från `courses`
2. Laddar moduler från `course_modules` med nested `course_lessons`
3. Laddar användarens progress för varje lektion
4. Beräknar total progress baserat på slutförda lektioner

## Nästa steg

1. **Verifiera RLS-policies** - Kör SQL-kommandona ovan i Supabase SQL Editor
2. **Kontrollera innehåll** - Se till att du har kurser, moduler och lektioner i databasen
3. **Testa appen** - Öppna en kurs och lektion för att se om progress sparas
4. **Kontrollera logs** - Titta på console.log i appen för att se eventuella fel

## Debug-tips

Om något inte fungerar, lägg till detta i din kod för att se vad som händer:

```typescript
// I app/lesson/[id].tsx, efter rad 125
console.log('Created/updated progress:', data);

// I app/course/[id].tsx, efter rad 106
console.log('Loaded modules:', processedModules);
console.log('User progress:', { completed: completedLessons, total: totalLessons });
```
