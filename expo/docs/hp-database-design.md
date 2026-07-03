# HP Database Schema — Design Document

> Komplett datamodell för Högskoleprovet-funktionen. Hanterar alla 8 delprov
> (ORD, LÄS, MEK, ELF, XYZ, KVA, NOG, DTK), ordbank med SRS, provförsök och
> användarprogress.

---

## 1. Arkitekturoversikt

### ER-översikt (text)

```
hp_exam_sets (1) ──── (8) hp_sections
      │                       │
      │                  (N) hp_questions
      │                       │
      │                  (N) hp_answer_options
      │
      ├── (N) hp_word_exam_refs ──── hp_words
      │
      └── (N) hp_norming_tables

hp_user_exam_attempts (1) ──── (N) hp_user_attempt_answers
      │                                    │
      └── user_id                    hp_user_question_progress
                                          
hp_user_word_progress ──── hp_words
```

### Lager

| Lager          | Tabeller                                                                  | RLS                       |
| -------------- | ------------------------------------------------------------------------- | ------------------------- |
| Innehåll       | `hp_exam_sets`, `hp_sections`, `hp_questions`, `hp_answer_options`       | Public read (published)   |
| Ordbank        | `hp_words`, `hp_word_exam_refs`                                           | Public read               |
| Normering      | `hp_norming_tables`                                                       | Public read               |
| Användardata   | `hp_user_exam_attempts`, `hp_user_attempt_answers`, `hp_user_question_progress`, `hp_user_word_progress` | User äger sin egen data |

---

## 2. Tabell-förklaringar

### 2.1 `hp_exam_sets` — Provtillfälle

Ett konkret högskoleprov, t.ex. "Högskoleprov Vårterminen 2024".

| Kolumn             | Typ      | Beskrivning                              |
| ------------------ | -------- | ---------------------------------------- |
| `id`               | uuid PK  | Unikt ID                                 |
| `year`             | int      | År, t.ex. 2024                           |
| `season`           | text     | `'vår'` eller `'höst'`                   |
| `title`            | text     | Visningsnamn                             |
| `source`           | text     | `'official'` eller `'generated'`         |
| `is_published`     | bool     | Synlig i appen först när `true`          |
| `duration_minutes` | int      | Total tid (default 240)                  |
| `created_at`       | ts       |                                          |

**Unique**: `(year, season)` — ett prov per termin.

**Designbeslut**: `is_published` gör att ni kan fylla frågor i databasen
utan att de syns för användare. När ni godkänt innehållet sätter ni
`is_published = true`.

---

### 2.2 `hp_sections` — 8 delprov per provtillfälle

Varje provtillfälle har exakt 8 sektioner med fasta tidsgränser.

| Kolumn              | Typ      | Beskrivning                                   |
| ------------------- | -------- | --------------------------------------------- |
| `id`                | uuid PK  |                                               |
| `exam_set_id`       | FK       | → `hp_exam_sets`                              |
| `type`              | text     | `ORD`,`LÄS`,`MEK`,`ELF`,`XYZ`,`KVA`,`NOG`,`DTK` |
| `part`              | text     | `'verbal'` eller `'kvantitativ'`              |
| `order_index`       | int      | Sortering inom provet                         |
| `time_limit_minutes`| int      | Tidsgräns för sektionen                       |
| `question_count`    | int      | Antal frågor (uppdateras när data fylls i)    |

**Unique**: `(exam_set_id, type)`.

**Tidsgränser (fast för alla år)**:

| Sektion | Del          | Min | Frågor |
| ------- | ------------ | --- | ------ |
| ORD     | Verbal       | 20  | 20     |
| LÄS     | Verbal       | 55  | 20     |
| MEK     | Verbal       | 15  | 20     |
| ELF     | Verbal       | 30  | 20     |
| XYZ     | Kvantitativ  | 55  | 20     |
| KVA     | Kvantitativ  | 20  | 20     |
| NOG     | Kvantitativ  | 20  | 20     |
| DTK     | Kvantitativ  | 45  | 20     |

---

### 2.3 `hp_questions` — Frågor (alla delprov)

En enhetlig tabell som hanterar alla frågetyper genom `question_type`.

| Kolumn            | Typ     | Beskrivning                                    |
| ----------------- | ------- | ---------------------------------------------- |
| `id`              | uuid PK |                                                |
| `section_id`      | FK      | → `hp_sections`                                |
| `question_number` | int     | Nummer inom sektionen                          |
| `question_text`   | text    | Frågan                                         |
| `question_type`   | text    | `multiple_choice`, `reading_comprehension`, `comparison`, `diagram`, `nog` |
| `reading_passage` | text    | Text för LÄS/ELF (null för andra)              |
| `image_url`       | text    | URL för DTK-diagram, NOG-figurer               |
| `needs_image`     | bool    | `true` om bild saknas och måste läggas till    |
| `difficulty`      | text    | `easy`, `medium`, `hard`                       |
| `topic`           | text    | t.ex. `synonymer`, `procent`, `geometri`        |
| `correct_answer`  | char(1) | Bokstav A–E som pekar på `hp_answer_options`   |
| `explanation`     | text    | Förklaring av rätt svar                        |

**Unique**: `(section_id, question_number)`.

**Designbeslut — `correct_answer` som bokstav**:
Istället för att lagra hela rätt-svar-text lagras en bokstavsreferens
(`A`, `B`, `C`, `D`). Fördelar:

1. Om option-text ändras bryts inte `correct_answer`.
2. Svarsjämförelse i appen blir `selected_letter === question.correct_answer`.
3. Eliminerar risk för att `correct_answer` och option-text driftar isär.

---

### 2.4 `hp_answer_options` — Normaliserade svarsalternativ

| Kolumn       | Typ     | Beskrivning                       |
| ------------ | ------- | --------------------------------- |
| `id`         | uuid PK |                                   |
| `question_id`| FK      | → `hp_questions`                  |
| `letter`     | char(1) | `A`, `B`, `C`, `D`, `E`           |
| `text`       | text    | Svarsalternativets text           |
| `is_correct` | bool    | Sann om detta är rätt svar        |

**Unique**: `(question_id, letter)`.

**Varför normaliserade options istället för JSON-array?**

Tre anledningar:

1. **Sökbarhet** — möjliggör sökning i option-text för felanalys.
2. **Snabba "visa rätt svar"-queries** — `is_correct` boolean ger omedelbar
   åtkomst utan JSON-parsning.
3. **Framtida features** — t.ex. "visa alla frågor där option B är korrekt"
   blir en enkel `WHERE is_correct AND letter = 'B'`.

---

### 2.5 `hp_words` — Ordbank

| Kolumn       | Typ     | Beskrivning                              |
| ------------ | ------- | ---------------------------------------- |
| `id`         | uuid PK |                                          |
| `word`       | text    | Ordet (unique)                           |
| `definition` | text    | Definition                               |
| `synonyms`   | text[]  | Synonymer                                |
| `antonyms`   | text[]  | Antonymer                                |
| `example`    | text    | Exempelmening                            |
| `etymology`  | text    | Etymologi                                |
| `memory_tip` | text    | Minnesteknik                             |
| `category`   | text    | t.ex. `lånord`, `fackspråk`              |
| `difficulty` | text    | `easy`, `medium`, `hard`                 |
| `frequency`  | int     | Hur vanligt ordet är                     |

---

### 2.6 `hp_word_exam_refs` — Ord ↔ Provtillfälle

Länkar ord till specifika provtillfällen så att appen kan visa
"ord från HP Vår 2024".

| Kolumn       | Typ | Beskrivning            |
| ------------ | --- | ---------------------- |
| `word_id`    | FK  | → `hp_words`           |
| `exam_set_id`| FK  | → `hp_exam_sets`       |
| **PK**       |     | `(word_id, exam_set_id)` |

---

### 2.7 `hp_norming_tables` — Poängomvandling

HP använder olika normeringstabeller per år. Raw score (antal rätt) →
normerad poäng (0.0–2.0).

| Kolumn        | Typ        | Beskrivning                              |
| ------------- | ---------- | ---------------------------------------- |
| `id`          | uuid PK    |                                          |
| `exam_set_id` | FK, nullable | Null = generisk tabell                 |
| `raw_score`   | int        | Antal rätt                               |
| `normed_score`| numeric(3,1)| HP-poäng, t.ex. 1.3                     |
| `part`        | text       | `verbal`, `kvantitativ`, `total`         |

**Varför en norming-table?**

Dagens app använder en approximativ uträkning för HP-poäng. Med en
databastabell kan appen visa exakt normerad poäng per provtillfälle,
vilket är viktigt eftersom normeringen varierar mellan år.

---

### 2.8 `hp_user_exam_attempts` — Provförsök

| Kolumn             | Typ        | Beskrivning                              |
| ------------------ | ---------- | ---------------------------------------- |
| `id`               | uuid PK    |                                          |
| `user_id`          | FK         | → `auth.users`                           |
| `exam_set_id`      | FK, null   | Null för fristående sektionsövning       |
| `section_id`       | FK, null   | Null för helt prov                       |
| `attempt_type`     | text       | `full_test` eller `section_practice`     |
| `status`           | text       | `in_progress`, `completed`, `abandoned`  |
| `total_questions`  | int        |                                          |
| `correct_answers`  | int        |                                          |
| `raw_score`        | int, null  | Antal rätt                               |
| `normed_score`     | numeric, null | Normerad HP-poäng                     |
| `time_spent_seconds`| int       | Total tid                                |
| `section_scores`   | jsonb      | `{"ORD": {"correct": 15, "total": 20}}` |
| `started_at`       | ts         |                                          |
| `completed_at`     | ts, null   |                                          |

---

### 2.9 `hp_user_attempt_answers` — Enskilda svar

| Kolumn           | Typ     | Beskrivning                          |
| ---------------- | ------- | ------------------------------------ |
| `id`             | uuid PK |                                      |
| `attempt_id`     | FK      | → `hp_user_exam_attempts` (cascade)  |
| `user_id`        | FK      | → `auth.users`                       |
| `question_id`    | FK      | → `hp_questions`                     |
| `selected_letter`| char(1) | Null = obesvarad/hoppad              |
| `is_correct`     | bool    |                                      |
| `time_seconds`   | int     | Tid på frågan                        |
| `answered_at`    | ts      |                                      |

---

### 2.10 `hp_user_question_progress` — Aggregerad per-fråga

Håller koll på hur användaren presterar på varje fråga över tid.

| Kolumn            | Typ | Beskrivning                          |
| ----------------- | --- | ------------------------------------ |
| `user_id`         | FK  | → `auth.users`                       |
| `question_id`     | FK  | → `hp_questions`                     |
| `correct_count`   | int | Antal rätt svar                      |
| `incorrect_count` | int | Antal fel svar                       |
| `total_attempts`  | int | Totalt försök                        |
| `last_correct`    | bool| Senaste svaret rätt?                 |
| `avg_time_seconds`| int | Snitttid                             |
| `last_seen_at`    | ts  |                                      |
| **PK**            |     | `(user_id, question_id)`             |

**Användning**: "Frågor jag fått fel" → `WHERE last_correct = false`.
"Accuracy per sektion" → gruppera via join till `hp_questions` → `hp_sections`.

---

### 2.11 `hp_user_word_progress` — SRS för ordbank

Spaced repetition-system baserat på SM-2-algoritmen.

| Kolumn           | Typ      | Beskrivning                              |
| ---------------- | -------- | ---------------------------------------- |
| `user_id`        | FK       | → `auth.users`                           |
| `word_id`        | FK       | → `hp_words`                             |
| `mastery`        | int 0-5  | Behärskningsnivå                         |
| `ease_factor`    | numeric  | SM-2 ease factor (start 2.50)            |
| `interval_days`  | int      | Dagar till nästa repetition              |
| `repetitions`    | int      | Antal repetitioner                       |
| `next_review_at` | ts       | När ordet ska repeteras                  |
| `streak`         | int      | Rätt-i-rad-streak                        |
| `last_reviewed_at`| ts      |                                          |
| **PK**           |          | `(user_id, word_id)`                     |

**Query**: "Ord att repetera idag"
```sql
select w.*
from hp_user_word_progress p
join hp_words w on w.id = p.word_id
where p.user_id = auth.uid()
  and p.next_review_at <= now()
order by p.next_review_at asc;
```

---

## 3. Hur varje delprov mappar

### ORD — Ordförståelse
- `question_type = 'multiple_choice'`
- `question_text`: "Vilket ord betyder ungefär samma som ___?"
- `reading_passage`: null
- `image_url`: null
- Exempel:
  ```json
  {
    "question_text": "Vilket ord är synonymt med 'genuin'?",
    "options": {"A": "äkta", "B": "förfalskad", "C": "ytlig", "D": "tillgjord"},
    "correct_answer": "A"
  }
  ```

### LÄS — Läsförståelse
- `question_type = 'reading_comprehension'`
- `reading_passage`: hela texten (kan vara 1–3 stycken)
- `question_text`: frågan om texten
- `image_url`: null
- Exempel:
  ```json
  {
    "reading_passage": "Förr i tiden trodde man att...",
    "question_text": "Vad menar författaren med uttrycket 'X'?",
    "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
    "correct_answer": "B"
  }
  ```

### MEK — Meningskomplettering
- `question_type = 'multiple_choice'`
- `question_text`: mening med lucka "___ ska vi gå hem"
- Exempel:
  ```json
  {
    "question_text": "Det är viktigt att vi ___ i tid kommer.",
    "options": {"A": "ser till", "B": "ser", "C": "ser på", "D": "ser upp"},
    "correct_answer": "A"
  }
  ```

### ELF — Engelsk läsförståelse
- `question_type = 'reading_comprehension'`
- `reading_passage`: engelsk text
- `question_text`: fråga på engelska eller svenska

### XYZ — Matematisk problemlösning
- `question_type = 'multiple_choice'`
- `question_text`: matematiskt problem
- `image_url`: null (kan finnas för geometri)
- `topic`: `algebra`, `geometri`, `aritmetik`, `procent`

### KVA — Kvantitativa jämförelser
- `question_type = 'comparison'`
- `question_text`: två kvantiteter att jämföra
- `options`: standardiserade:
  - A: Kvantitet I är störst
  - B: Kvantitet II är störst
  - C: Kvantiteterna är lika stora
  - D: Kan inte avgöras
- Exempel:
  ```json
  {
    "question_text": "I: priset för 3 kg äpplen till 20 kr/kg\nII: priset för 2 kg äpplen till 30 kr/kg",
    "options": {"A": "I är störst", "B": "II är störst", "C": "Lika", "D": "Kan ej avgöras"},
    "correct_answer": "C"
  }
  ```

### NOG — Begreppet nog
- `question_type = 'nog'`
- `question_text`: problem + två påståenden
- `options`: standardiserade:
  - A: Påstående 1 räcker ensamt
  - B: Påstående 2 räcker ensamt
  - C: Båda behövs tillsammans
  - D: Informationen räcker inte
- `image_url`: kan finnas för figurer

### DTK — Diagram, tabeller & kartor
- `question_type = 'diagram'`
- `image_url`: URL till diagram/tabell i Supabase Storage
- `needs_image`: `true` om bilden inte är uppladdad än
- `question_text`: fråga om datan i bilden
- Exempel:
  ```json
  {
    "question_text": "Vilket år var försäljningen högst?",
    "image_url": "https://xxx.supabase.co/storage/v1/object/public/hp-question-images/2024/vår/DTK/3.webp",
    "options": {"A": "2019", "B": "2020", "C": "2021", "D": "2022"},
    "correct_answer": "C"
  }
  ```

---

## 4. Exempel-queries

### Hämta publicerade prov
```sql
select id, year, season, title
from hp_exam_sets
where is_published = true
order by year desc, season desc;
```

### Hämta frågor för en sektion (med options)
```sql
select
  q.id, q.question_number, q.question_text, q.question_type,
  q.reading_passage, q.image_url, q.difficulty, q.topic,
  jsonb_agg(
    jsonb_build_object('letter', o.letter, 'text', o.text)
    order by o.letter
  ) as options
from hp_questions q
join hp_sections s on s.id = q.section_id
join hp_answer_options o on o.question_id = q.id
where s.exam_set_id = $1 and s.type = 'ORD'
group by q.id
order by q.question_number;
```

### Hämta SRS-ord att repetera idag
```sql
select w.word, w.definition, w.synonyms, p.mastery, p.streak
from hp_user_word_progress p
join hp_words w on w.id = p.word_id
where p.user_id = $1
  and p.next_review_at <= now()
order by p.next_review_at asc
limit 20;
```

### Användarens accuracy per sektion
```sql
select
  s.type as section,
  count(*) as total_answered,
  count(*) filter (where a.is_correct) as correct,
  round(
    count(*) filter (where a.is_correct)::numeric / count(*) * 100, 1
  ) as accuracy_pct
from hp_user_attempt_answers a
join hp_questions q on q.id = a.question_id
join hp_sections s on s.id = q.section_id
where a.user_id = $1
group by s.type
order by s.type;
```

### Användarens senaste provförsök med normerad poäng
```sql
select
  e.title,
  a.attempt_type,
  a.correct_answers,
  a.total_questions,
  a.normed_score,
  a.time_spent_seconds,
  a.section_scores,
  a.completed_at
from hp_user_exam_attempts a
left join hp_exam_sets e on e.id = a.exam_set_id
where a.user_id = $1 and a.status = 'completed'
order by a.completed_at desc
limit 10;
```

---

## 5. Helper-funktioner

### `hp_create_exam_with_sections(year, season, title)`

Skapar ett provtillfälle med alla 8 sektioner och korrekta tidsgränser
i ett anrop. Returnerar exam_set UUID.

```sql
select hp_create_exam_with_sections(2024, 'vår', 'Högskoleprov Vårterminen 2024');
```

### `hp_record_answer(attempt_id, question_id, selected_letter, time_seconds)`

Sparar ett enskilt svar, uppdaterar aggregerad progress, returnerar
`is_correct`. Centraliserar all svarslogik så att appen bara behöver
anropa denna funktion.

```sql
select hp_record_answer(
  'attempt-uuid-here',
  'question-uuid-here',
  'C',
  45
);
```

### `hp_finalize_attempt(attempt_id)`

Räknar ut correct_answers, raw_score, normed_score (via norming table),
uppdaterar status till `completed`, bygger `section_scores` JSON.
Returnerar sammanställning.

```sql
select hp_finalize_attempt('attempt-uuid-here');
-- Returnerar:
-- {"attempt_id": "...", "total": 80, "correct": 52,
--  "raw_score": 52, "normed_score": 1.1, "time_spent": 7200,
--  "section_scores": {"ORD": {"correct": 15, "total": 20}, ...}}
```

---

## 6. Arbetsprocess för data-extraktion

### Steg 1 — Skapa provtillfälle
```sql
select hp_create_exam_with_sections(2024, 'vår', 'Högskoleprov Vårterminen 2024');
-- Notera returnerat UUID
```

### Steg 2 — Hämta section IDs
```sql
select id, type from hp_sections
where exam_set_id = 'UUID-från-steg-1';
```

### Steg 3 — Extrahera frågor till JSON

Format per fråga:
```json
{
  "section_type": "ORD",
  "question_number": 3,
  "question_text": "Vilket ord betyder samma som 'genuin'?",
  "question_type": "multiple_choice",
  "options": [
    {"letter": "A", "text": "äkta"},
    {"letter": "B", "text": "förfalskad"},
    {"letter": "C", "text": "ytlig"},
    {"letter": "D", "text": "tillgjord"}
  ],
  "correct_answer": "A",
  "difficulty": "easy",
  "topic": "synonymer",
  "explanation": "Genuin betyder äkta, opåverkad."
}
```

För DTK/NOG med diagram: sätt `"needs_image": true` och
`"image_url": null`. Lägg in bilderna i Supabase Storage senare.

### Steg 4 — Konvertera till SQL-inserts

```sql
-- Fråga
insert into hp_questions
  (section_id, question_number, question_text, question_type,
   correct_answer, difficulty, topic, explanation)
values
  ('section-uuid', 3, 'Vilket ord betyder samma som genuin?',
   'multiple_choice', 'A', 'easy', 'synonymer', 'Genuin betyder äkta.');

-- Options (använd currval eller returnera ID från insert)
insert into hp_answer_options (question_id, letter, text, is_correct) values
  ('question-uuid', 'A', 'äkta', true),
  ('question-uuid', 'B', 'förfalskad', false),
  ('question-uuid', 'C', 'ytlig', false),
  ('question-uuid', 'D', 'tillgjord', false);
```

### Steg 5 — Publicera
```sql
update hp_exam_sets set is_published = true where year = 2024 and season = 'vår';
```

---

## 7. Supabase Storage för bilder

Bucket: `hp-question-images` (public)

Mappstruktur:
```
/{year}/{season}/{section_type}/{question_number}.webp
```

Exempel: `/2024/vår/DTK/3.webp`

Storage RLS:
```sql
create policy "Public read hp images"
  on storage.objects for select
  using (bucket_id = 'hp-question-images');

create policy "Service role upload hp images"
  on storage.objects for insert
  with check (bucket_id = 'hp-question-images' and auth.role() = 'service_role');
```

App-URL:
```
{SUPABASE_URL}/storage/v1/object/public/hp-question-images/{year}/{season}/{section}/{num}.webp
```

---

## 8. App-integrationsplan

### Fas 1 — `hp-db-service.ts`
Skapa en service-fil i `expo/lib/` som wrappar Supabase-anrop:
- `fetchPublishedExams()`
- `fetchQuestions(examSetId, sectionType)`
- `startAttempt(examSetId, attemptType)`
- `submitAnswer(attemptId, questionId, selectedLetter, timeSeconds)`
- `finalizeAttempt(attemptId)`
- `getUserStats(userId)`

### Fas 2 — Uppdatera `HogskoleprovetContext`
Hämta frågor från databasen när `is_published` prov finns. Fallback till
lokala `SAMPLE_HP_QUESTIONS` vid offline eller inga data.

### Fas 3 — SRS-engine för ordbank
Skapa `hp-word-srs.ts` hook som använder `hp_user_word_progress`:
- `getDueWords(userId)` — ord att repetera idag
- `reviewWord(userId, wordId, quality)` — uppdaterar SRS-parametrar
- SM-2-algoritm för ease_factor och interval

### Fas 4 — Normerade poäng i resultat
Uppdatera `hp-results.tsx` att hämta normerad poäng från `hp_norming_tables`
baserat på vilken exam_set användaren övat på.

### Fas 5 — Droppa gamla tabeller
Efter all data migrerad:
```sql
drop table if exists public.user_hp_question_answers cascade;
drop table if exists public.user_hp_test_attempts cascade;
drop table if exists public.hp_questions cascade;  -- gammal version
drop table if exists public.hp_sections cascade;   -- gammal version
drop table if exists public.hp_tests cascade;
drop table if exists public.hp_test_versions cascade;
```

**Studieplanen** (`HPStudyPlanContext`) förblir i AsyncStorage — ingen
förändring där.

---

## 9. Migrationsanteckningar

### Gamla tabeller (i `database.types.ts`)
- `hp_tests` → ersätts av `hp_exam_sets`
- `hp_sections` (gammal) → ny version med `exam_set_id` FK
- `hp_questions` (gammal) → ny version med normaliserade options
- `user_hp_test_attempts` → `hp_user_exam_attempts`
- `user_hp_question_answers` → `hp_user_attempt_answers` + `hp_user_question_progress`

### Data-migration (kör manuellt)
```sql
-- 1. Migrera exam sets
insert into hp_exam_sets (year, season, title, is_published, duration_minutes)
select
  test_year,
  case when test_season = 'spring' then 'vår' else 'höst' end,
  'HP ' || test_season || ' ' || test_year,
  is_published,
  240
from hp_tests
on conflict (year, season) do nothing;

-- 2. Migrera sections och questions manuellt (mappa gammal struktur till ny)
-- 3. Droppa gamla tabeller när klar
```

---

## 10. Index-strategi

| Index                                      | Syfte                              |
| ------------------------------------------ | ---------------------------------- |
| `idx_hp_sections_exam_set`                 | Hämta sektioner för ett prov       |
| `idx_hp_questions_section`                 | Hämta frågor för en sektion        |
| `idx_hp_answer_options_question`           | Hämta options för en fråga         |
| `idx_hp_user_attempts_user`                | Användarens provförsök             |
| `idx_hp_user_attempts_status`              | Filtrera på completed/in_progress  |
| `idx_hp_user_attempt_answers_attempt`      | Hämta svar för ett försök          |
| `idx_hp_user_qprogress_user`               | Användarens fråge-progress         |
| `idx_hp_user_qprogress_last_correct`       | "Frågor jag fått fel"              |
| `idx_hp_user_wprogress_next_review`        | SRS: ord att repetera idag         |
| `idx_hp_norming_exam`                      | Slå upp normerad poäng             |
