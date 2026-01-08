-- ============================================================
-- EXEMPEL: SF1624 - Algebra och geometri (KTH)
-- ============================================================
-- Detta är ett komplett exempel som visar hur du fyller i mallen
-- ============================================================

-- STEG 1: Kursen finns redan, men vi uppdaterar den
INSERT INTO university_courses (
  id, 
  course_code, 
  title, 
  description, 
  credits, 
  level, 
  subject_area, 
  prerequisites, 
  learning_outcomes
)
VALUES (
  gen_random_uuid(),
  'SF1624',
  'Algebra och geometri',
  'Kursen behandlar grundläggande linjär algebra och analytisk geometri. Centrala begrepp är vektorer, matriser, linjära avbildningar, determinanter, egenvärden och egenvektorer.',
  7.5,
  'grundnivå',
  'Matematik',
  ARRAY[]::TEXT[],
  ARRAY[
    'Behärska vektoralgebra och geometriska tillämpningar',
    'Lösa linjära ekvationssystem med Gausselimination',
    'Beräkna determinanter och använda dem för att lösa ekvationer',
    'Förstå linjära avbildningar och deras matrisrepresentation',
    'Beräkna egenvärden och egenvektorer'
  ]
)
ON CONFLICT (course_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- STEG 2: Skapa moduler
INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
SELECT
  gen_random_uuid(),
  id,
  'Vektorer och vektorgeometri',
  'Grundläggande vektoralgebra och geometriska tillämpningar i plan och rum.',
  1,
  15,
  true
FROM university_courses WHERE course_code = 'SF1624';

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
SELECT
  gen_random_uuid(),
  id,
  'Matriser och linjära ekvationssystem',
  'Matrisalgebra och metoder för att lösa linjära ekvationssystem.',
  2,
  18,
  true
FROM university_courses WHERE course_code = 'SF1624';

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
SELECT
  gen_random_uuid(),
  id,
  'Determinanter och egenvärden',
  'Determinantberäkning och egenvärdesteori med tillämpningar.',
  3,
  15,
  true
FROM university_courses WHERE course_code = 'SF1624';

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours, is_published)
SELECT
  gen_random_uuid(),
  id,
  'Linjära avbildningar',
  'Linjära avbildningar, matrisrepresentation och avbildningsgeometri.',
  4,
  12,
  true
FROM university_courses WHERE course_code = 'SF1624';

-- STEG 3: Skapa lektioner

-- MODUL 1 - LEKTION 1
INSERT INTO course_lessons (
  id, module_id, course_id, title, description, content,
  lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published
)
SELECT
  gen_random_uuid(), cm.id, uc.id,
  'Introduktion till vektorer',
  'Grundläggande begrepp om vektorer i plan och rum.',
  '## Vektorer - Grundläggande begrepp

### Vad är en vektor?
En vektor är en storhet som har både **storlek** (längd) och **riktning**. Vi skriver vektorer med pilar: **v** eller i komponentform.

**I planet (ℝ²):**
v = (v₁, v₂)

**I rummet (ℝ³):**
v = (v₁, v₂, v₃)

### Vektorrepresentation
En vektor kan representeras som:
- En pil från startpunkt till slutpunkt
- Ett kolonnvektor: v = [v₁]
                      [v₂]
- Ett radvektor: v = (v₁, v₂)

### Exempel
Punkterna A = (1, 2) och B = (4, 6) ger vektorn:
AB = B - A = (4-1, 6-2) = (3, 4)

### Längd (norm) av vektor
Längden av en vektor v = (v₁, v₂) beräknas med Pythagoras sats:

|v| = √(v₁² + v₂²)

**Exempel:** |v| = |(3, 4)| = √(3² + 4²) = √25 = 5

### Enhetsvektor
En vektor med längd 1 kallas enhetsvektor. För att normalisera en vektor:

v̂ = v / |v|

**Exempel:** (3, 4) / 5 = (0.6, 0.8)

### Övningar
1. Beräkna längden av v = (5, 12)
2. Finn enhetsvektorn för v = (3, 4)
3. Givet A = (2, 3) och B = (5, 7), beräkna AB',
  'theory', 1, 45, 'easy',
  ARRAY['Förstå vektorbegreppet', 'Beräkna vektorlängd', 'Normalisera vektorer'],
  true
FROM university_courses uc
JOIN course_modules cm ON cm.course_id = uc.id
WHERE uc.course_code = 'SF1624' AND cm.order_index = 1;

-- MODUL 1 - LEKTION 2
INSERT INTO course_lessons (
  id, module_id, course_id, title, description, content,
  lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published
)
SELECT
  gen_random_uuid(), cm.id, uc.id,
  'Vektoroperationer',
  'Addition, subtraktion och skalär multiplikation av vektorer.',
  '## Vektoroperationer

### Addition av vektorer
Addition sker komponentvis:
u + v = (u₁ + v₁, u₂ + v₂)

**Geometrisk tolkning:** Parallelogramregeln eller triangelmetoden.

**Exempel:**
u = (2, 3), v = (1, 4)
u + v = (3, 7)

### Subtraktion av vektorer
Subtraktion sker också komponentvis:
u - v = (u₁ - v₁, u₂ - v₂)

**Geometrisk tolkning:** Vektor från spetsen av v till spetsen av u.

### Skalär multiplikation
Multiplikation med ett tal (skalär) k:
kv = (kv₁, kv₂)

**Egenskaper:**
- Om k > 0: samma riktning, längd multipliceras med k
- Om k < 0: motsatt riktning, längd multipliceras med |k|
- Om k = 0: nollvektorn

**Exempel:**
3(2, 1) = (6, 3)
-2(1, 2) = (-2, -4)

### Linjärkombination
En vektor w är en linjärkombination av u och v om:
w = au + bv för några skalärer a och b

**Exempel:**
Kan (5, 7) skrivas som linjärkombination av (1, 2) och (2, 1)?
(5, 7) = a(1, 2) + b(2, 1)
Detta ger ekvationssystemet:
a + 2b = 5
2a + b = 7

Lösning: a = 3, b = 1
Svar: Ja, (5, 7) = 3(1, 2) + 1(2, 1)

### Övningar
1. Beräkna (3, 5) + (2, -1)
2. Beräkna 4(2, 3) - 2(1, 5)
3. Skriv (7, 8) som linjärkombination av (1, 0) och (0, 1)',
  'theory', 2, 60, 'medium',
  ARRAY['Utföra vektoraddition och subtraktion', 'Multiplicera vektorer med skalärer', 'Förstå linjärkombinationer'],
  true
FROM university_courses uc
JOIN course_modules cm ON cm.course_id = uc.id
WHERE uc.course_code = 'SF1624' AND cm.order_index = 1;

-- MODUL 1 - LEKTION 3
INSERT INTO course_lessons (
  id, module_id, course_id, title, description, content,
  lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published
)
SELECT
  gen_random_uuid(), cm.id, uc.id,
  'Skalärprodukt',
  'Skalärprodukt (dot product) och dess geometriska tolkning.',
  '## Skalärprodukt

### Definition
Skalärprodukten (dot product, inner product) av två vektorer u och v:

u · v = u₁v₁ + u₂v₂ + u₃v₃

**Resultat:** Ett tal (skalär), inte en vektor!

### Geometrisk tolkning
u · v = |u| |v| cos(θ)

där θ är vinkeln mellan vektorerna.

### Vinkel mellan vektorer
cos(θ) = (u · v) / (|u| |v|)

θ = arccos((u · v) / (|u| |v|))

**Exempel:**
u = (1, 0), v = (1, 1)
u · v = 1·1 + 0·1 = 1
|u| = 1, |v| = √2
cos(θ) = 1 / (1·√2) = 1/√2
θ = 45°

### Ortogonalitet
Två vektorer är **ortogonala** (vinkelräta) om och endast om:
u · v = 0

**Exempel:** (1, 2) · (2, -1) = 1·2 + 2·(-1) = 0 ✓ Ortogonala!

### Projektion
Projektionen av u på v:
proj_v(u) = ((u · v) / (v · v)) v

**Geometrisk tolkning:** Skuggan av u på v.

### Egenskaper
- Kommutativ: u · v = v · u
- Distributiv: u · (v + w) = u · v + u · w
- u · u = |u|²

### Tillämpningar
1. **Arbete i fysik:** W = F · s
2. **Avstånd punkt-linje**
3. **Vinkelberäkningar**

### Övningar
1. Beräkna (3, 4) · (1, 2)
2. Är (1, 3) och (6, -2) ortogonala?
3. Beräkna vinkeln mellan (1, 0) och (1, √3)',
  'theory', 3, 60, 'medium',
  ARRAY['Beräkna skalärprodukt', 'Bestämma vinkel mellan vektorer', 'Identifiera ortogonala vektorer'],
  true
FROM university_courses uc
JOIN course_modules cm ON cm.course_id = uc.id
WHERE uc.course_code = 'SF1624' AND cm.order_index = 1;

-- MODUL 1 - LEKTION 4 (Övningar)
INSERT INTO course_lessons (
  id, module_id, course_id, title, description, content,
  lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published
)
SELECT
  gen_random_uuid(), cm.id, uc.id,
  'Övningar: Vektorer',
  'Samlade övningar på vektoralgebra och geometri.',
  '## Övningsuppgifter: Vektorer

### Del A: Grundläggande operationer
1. Givet u = (2, 3) och v = (1, -2), beräkna:
   a) u + v
   b) 3u - 2v
   c) |u|
   d) |v|

2. Normalisera vektorn w = (3, 4)

3. Beräkna avståndet mellan punkterna A = (1, 2) och B = (4, 6)

### Del B: Skalärprodukt
4. Beräkna u · v för u = (2, 3) och v = (4, -1)

5. Bestäm vinkeln mellan u = (1, 1) och v = (0, 1)

6. Avgör om följande vektorpar är ortogonala:
   a) (2, 3) och (3, -2)
   b) (1, 2) och (2, 1)
   c) (4, -2) och (1, 2)

### Del C: Tillämpningar
7. En kraft F = (10, 20) N verkar på ett objekt som rör sig från punkt A = (0, 0) till B = (5, 3) meter. Beräkna arbetet.

8. Finn alla vektorer v = (x, y) som är ortogonala mot (3, 4) och har längd 1.

9. Skriv (5, 13) som linjärkombination av (1, 3) och (2, 1).

### Del D: Fördjupning
10. Visa att u · (v + w) = u · v + u · w

11. Beräkna projektionen av u = (4, 2) på v = (1, 0)

12. Givet tre punkter A = (0, 0), B = (3, 0), C = (1, 2), beräkna alla vinklar i triangeln ABC.

### FACIT

**Del A:**
1a) (3, 1)
1b) (4, 13)
1c) √13
1d) √5

2) (3/5, 4/5)

3) 5

**Del B:**
4) 5

5) 45°

6a) Ja (2·3 + 3·(-2) = 0)
6b) Nej (1·2 + 2·1 = 4 ≠ 0)
6c) Ja (4·1 + (-2)·2 = 0)

**Del C:**
7) W = F · AB = (10, 20) · (5, 3) = 50 + 60 = 110 J

8) (4/5, -3/5) och (-4/5, 3/5)

9) (5, 13) = 3(1, 3) + 1(2, 1)

**Del D:**
11) (4, 0)

12) Vinkel vid A ≈ 33.7°, vid B ≈ 90°, vid C ≈ 56.3°',
  'exercise', 4, 90, 'medium',
  ARRAY['Tillämpa vektoroperationer', 'Lösa geometriska problem med vektorer', 'Använda skalärprodukt i praktiken'],
  true
FROM university_courses uc
JOIN course_modules cm ON cm.course_id = uc.id
WHERE uc.course_code = 'SF1624' AND cm.order_index = 1;

-- MODUL 2 - LEKTION 1
INSERT INTO course_lessons (
  id, module_id, course_id, title, description, content,
  lesson_type, order_index, estimated_minutes, difficulty_level, learning_objectives, is_published
)
SELECT
  gen_random_uuid(), cm.id, uc.id,
  'Introduktion till matriser',
  'Matrisnotation, matrisoperationer och grundläggande begrepp.',
  '## Matriser

### Vad är en matris?
En matris är en rektangulär anordning av tal i rader och kolumner.

En m×n matris har m rader och n kolumner:

A = [a₁₁ a₁₂ ... a₁ₙ]
    [a₂₁ a₂₂ ... a₂ₙ]
    [... ... ... ...]
    [aₘ₁ aₘ₂ ... aₘₙ]

### Exempel
En 2×3 matris:
A = [1  2  3]
    [4  5  6]

### Specialmatriser

**Kvadratisk matris:** m = n (lika många rader och kolumner)

**Enhetsmatris (I):**
I = [1  0  0]
    [0  1  0]
    [0  0  1]

**Nollmatris (0):**
0 = [0  0  0]
    [0  0  0]

**Diagonal matris:** Alla element utanför diagonalen är 0

**Symmetrisk matris:** A = Aᵀ (lika med sin transponat)

### Matrisaddition
Matriser adderas elementvis (måste ha samma dimension):

[1  2] + [5  6] = [6   8]
[3  4]   [7  8]   [10  12]

### Skalär multiplikation
Multiplicera varje element med skalären:

3[1  2] = [3   6]
 [3  4]   [9  12]

### Transponat
Spegla matrisen över diagonalen (byt rader mot kolumner):

A = [1  2  3]  →  Aᵀ = [1  4]
    [4  5  6]          [2  5]
                       [3  6]

### Övningar
1. Beräkna A + B där A = [1 2; 3 4], B = [5 6; 7 8]
2. Beräkna 2A där A = [1 2; 3 4]
3. Bestäm Aᵀ där A = [1 2 3; 4 5 6]',
  'theory', 1, 45, 'easy',
  ARRAY['Förstå matrisnotation', 'Utföra matrisaddition', 'Beräkna transponat'],
  true
FROM university_courses uc
JOIN course_modules cm ON cm.course_id = uc.id
WHERE uc.course_code = 'SF1624' AND cm.order_index = 2;

-- Skapa ett quiz
INSERT INTO course_exercises (
  id, lesson_id, course_id, title, description, instructions,
  exercise_type, questions, correct_answers, points, difficulty_level, is_published
)
SELECT
  gen_random_uuid(), cl.id, uc.id,
  'Quiz: Grundläggande vektorer',
  'Testa dina kunskaper om vektorer',
  'Välj rätt svar för varje fråga',
  'multiple_choice',
  '[
    {
      "question": "Vad är längden av vektorn v = (3, 4)?",
      "options": ["5", "7", "12", "25"]
    },
    {
      "question": "När är två vektorer ortogonala?",
      "options": [
        "När deras skalärprodukt är 0",
        "När de har samma längd",
        "När de pekar i samma riktning",
        "När deras summa är 0"
      ]
    },
    {
      "question": "Vad är resultatet av 2(1, 2) + (3, 1)?",
      "options": ["(5, 5)", "(4, 3)", "(6, 7)", "(2, 4)"]
    }
  ]'::jsonb,
  '["5", "När deras skalärprodukt är 0", "(5, 5)"]'::jsonb,
  30, 'easy', true
FROM university_courses uc
JOIN course_modules cm ON cm.course_id = uc.id
JOIN course_lessons cl ON cl.module_id = cm.id
WHERE uc.course_code = 'SF1624' AND cm.order_index = 1 AND cl.order_index = 1;

-- Skapa studiehandledning
INSERT INTO study_guides (
  id, course_id, title, description, content,
  guide_type, difficulty_level, estimated_read_time, is_published
)
SELECT
  gen_random_uuid(), id,
  'Formelsamling: Algebra och geometri',
  'Komplett formelsamling för SF1624',
  '# Formelsamling SF1624

## Vektorer

### Längd (Norm)
|v| = √(v₁² + v₂² + v₃²)

### Skalärprodukt
u · v = u₁v₁ + u₂v₂ + u₃v₃ = |u||v|cos(θ)

### Vinkel mellan vektorer
cos(θ) = (u · v) / (|u||v|)

### Ortogonalitet
u ⊥ v ⟺ u · v = 0

### Projektion
proj_v(u) = ((u · v)/(v · v))v

## Matriser

### Matris multiplikation
(AB)ᵢⱼ = Σₖ aᵢₖbₖⱼ

### Transponat
(Aᵀ)ᵢⱼ = aⱼᵢ
(AB)ᵀ = BᵀAᵀ

### Invers matris
AA⁻¹ = A⁻¹A = I

### Determinant (2×2)
det[a b] = ad - bc
   [c d]

### Determinant (3×3)
Sarrus regel eller kofaktorutveckling

## Ekvationssystem

### Gauss-elimination
1. Skapa övre triangelform
2. Bakåtsubstitution

### Cramers regel
xᵢ = det(Aᵢ) / det(A)

## Egenvärden

### Karakteristisk ekvation
det(A - λI) = 0

### Egenvektorer
(A - λI)v = 0',
  'formula_sheet', 'medium', 20, true
FROM university_courses WHERE course_code = 'SF1624';

-- VERIFIERING
SELECT 
  uc.course_code,
  uc.title,
  COUNT(DISTINCT cm.id) as antal_moduler,
  COUNT(DISTINCT cl.id) as antal_lektioner,
  SUM(cl.estimated_minutes) as total_minuter
FROM university_courses uc
LEFT JOIN course_modules cm ON cm.course_id = uc.id
LEFT JOIN course_lessons cl ON cl.course_id = uc.id
WHERE uc.course_code = 'SF1624'
GROUP BY uc.course_code, uc.title;
