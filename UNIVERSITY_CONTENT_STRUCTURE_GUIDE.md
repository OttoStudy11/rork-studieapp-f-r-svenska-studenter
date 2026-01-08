# Guide: Universitets Innehållsstruktur

## Översikt

Nu har vi en parallell innehållsstruktur för universitets-kurser som är helt separat från gymnasiekurserna. Detta löser alla foreign key-problem och gör systemet mycket renare.

## Tabellstruktur

### Gymnasium (befintligt)
```
courses
├── course_modules
    ├── course_lessons
        └── course_exercises
```

### Högskola/Universitet (nytt)
```
university_courses
├── university_course_modules
    ├── university_course_lessons
        └── university_course_exercises
```

## Progress-spårning

### Gymnasium
- `user_courses` - Kopplar användare till gymnasisekurser
- `user_lesson_progress` - Spårar framsteg i lektioner
- `user_module_progress` - Spårar framsteg i moduler

### Högskola/Universitet
- `user_university_courses` - Kopplar användare till universitetskurser
- `user_university_lesson_progress` - Spårar framsteg i lektioner
- `user_university_module_progress` - Spårar framsteg i moduler
- `user_university_exercise_attempts` - Spårar övningsförsök

## Installation

Kör denna SQL-fil i Supabase SQL Editor:
```sql
create-university-content-structure.sql
```

## Hur man skapar innehåll

### 1. Skapa en universitets-kurs
Först måste kursen finnas i `university_courses` tabellen (detta är redan gjort via tidigare migrations).

### 2. Skapa moduler för kursen
```sql
INSERT INTO university_course_modules (course_id, title, description, order_index, duration_minutes, is_published)
VALUES (
  'course-uuid-här',
  'Modul 1: Linjär algebra grunder',
  'Introduktion till vektorer, matriser och linjära ekvationssystem',
  1,
  180,
  true
);
```

### 3. Skapa lektioner för modulen
```sql
INSERT INTO university_course_lessons (module_id, title, content, order_index, duration_minutes, lesson_type, is_published)
VALUES (
  'module-uuid-här',
  'Lektion 1: Vektorer i R²',
  'Lektionsinnehåll här med markdown/HTML...',
  1,
  45,
  'theory',
  true
);
```

### 4. Skapa övningar för lektionen
```sql
INSERT INTO university_course_exercises (lesson_id, question, question_type, options, correct_answer, explanation, difficulty, order_index, points)
VALUES (
  'lesson-uuid-här',
  'Vad är resultatet av vektorsumman (2,3) + (1,-1)?',
  'multiple_choice',
  '["(3,2)", "(1,2)", "(3,4)", "(2,3)"]'::jsonb,
  '(3,2)',
  'När man adderar vektorer adderar man motsvarande komponenter.',
  'easy',
  1,
  1
);
```

## Content Types

### Lesson Types
- `theory` - Teoretisk genomgång
- `exercise` - Praktisk övning
- `video` - Videolektion
- `reading` - Läsmaterial
- `quiz` - Quiz/test

### Question Types
- `multiple_choice` - Flervalsfråga
- `true_false` - Sant/falskt
- `short_answer` - Kort svar
- `essay` - Essäfråga
- `calculation` - Beräkningsuppgift

### Difficulty Levels
- `easy` - Lätt
- `medium` - Medel
- `hard` - Svår

## Automatisk Progress Tracking

Systemet uppdaterar automatiskt:
1. När en lektion markeras som klar → uppdateras `user_university_lesson_progress`
2. Detta triggar automatiskt uppdatering av `user_university_module_progress`
3. Frontend kan visa progress i realtid

## RLS Policies

Alla tabeller har Row Level Security aktiverat:
- **Innehåll (modules, lessons, exercises)**: Alla kan läsa publicerat innehåll (`is_published = true`)
- **Progress**: Användare kan endast se och uppdatera sin egen progress

## Nästa steg

1. Kör `create-university-content-structure.sql` i Supabase
2. Skapa innehåll för dina universitets-kurser
3. Uppdatera din app för att använda rätt tabeller baserat på `level` (gymnasium vs högskola)
4. Se SQL-templates för exempel på hur man fyller i innehåll

## Template för innehållsskapande

Se `sql-templates/university-course-content-template.sql` för en komplett mall.
