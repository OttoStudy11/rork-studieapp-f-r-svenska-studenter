-- =====================================================
-- MATEMATIK 1A - KOMPLETT KURSINNEHÅLL
-- =====================================================

-- Säkerställ att kursen finns
INSERT INTO courses (id, title, subject, level, description, credits, is_published) 
VALUES (
    'matematik-1a-course-id',
    'Matematik 1a',
    'Matematik',
    '1',
    'Grundläggande matematikkurs för gymnasiet med fokus på algebra, funktioner och statistik',
    100,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subject = EXCLUDED.subject,
    level = EXCLUDED.level,
    description = EXCLUDED.description;

-- =====================================================
-- MODULER
-- =====================================================

INSERT INTO course_modules (id, course_id, title, description, order_index, estimated_hours) VALUES
('mod-mat1a-1', 'matematik-1a-course-id', 'Algebra och ekvationer', 'Grundläggande algebra, ekvationslösning och algebraiska uttryck', 1, 25),
('mod-mat1a-2', 'matematik-1a-course-id', 'Funktioner', 'Linjära och exponentiella funktioner, grafer och funktionsanalys', 2, 30),
('mod-mat1a-3', 'matematik-1a-course-id', 'Geometri', 'Geometriska figurer, area, volym och Pythagoras sats', 3, 20),
('mod-mat1a-4', 'matematik-1a-course-id', 'Statistik och sannolikhet', 'Beskrivande statistik, sannolikhetsberäkning och dataanalys', 4, 25);

-- =====================================================
-- MODUL 1: ALGEBRA OCH EKVATIONER - LEKTIONER
-- =====================================================

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
('lesson-mat1a-1-1', 'mod-mat1a-1', 'matematik-1a-course-id', 
'Algebraiska uttryck och förenkling', 
'Lär dig att arbeta med algebraiska uttryck och förenkla dem',
'# Algebraiska uttryck och förenkling

## Vad är ett algebraiskt uttryck?

Ett algebraiskt uttryck är en matematisk fras som innehåller variabler (oftast bokstäver som x, y, z) och tal kombinerade med matematiska operationer.

### Exempel på algebraiska uttryck:
- 3x + 5
- 2a² - 4a + 7
- (x + 3)(x - 2)

## Grundläggande termer

### Koefficient
Talet framför en variabel kallas koefficient. I uttrycket 5x är 5 koefficienten.

### Term
En term är en del av ett uttryck som är separerad med plus eller minus. I uttrycket 3x + 2y - 5 finns tre termer: 3x, 2y och -5.

### Lika termer
Termer som har samma variabeldel kallas lika termer. Exempel: 3x och 5x är lika termer.

## Förenkling av uttryck

### Regel 1: Addera och subtrahera lika termer
3x + 5x = 8x
7y - 2y = 5y

### Regel 2: Multiplicera koefficienter
2 · 3x = 6x
-4 · 2y = -8y

### Regel 3: Distributiva lagen
a(b + c) = ab + ac

Exempel: 3(x + 4) = 3x + 12

### Regel 4: Kvadreringsreglerna
(a + b)² = a² + 2ab + b²
(a - b)² = a² - 2ab + b²

## Praktiska exempel

### Exempel 1: Förenkla 5x + 3x - 2x
5x + 3x - 2x = 8x - 2x = 6x

### Exempel 2: Förenkla 2(x + 3) + 4x
2(x + 3) + 4x = 2x + 6 + 4x = 6x + 6

### Exempel 3: Förenkla (x + 2)²
(x + 2)² = x² + 2·x·2 + 2² = x² + 4x + 4

## Övningsuppgifter

1. Förenkla: 7a + 3a - 2a
2. Förenkla: 3(2x + 1) - 2x
3. Förenkla: (x + 3)(x - 3)
4. Förenkla: 2x² + 3x - x² + 5x',
'theory', 1, 45, 
ARRAY['Förstå vad algebraiska uttryck är', 'Kunna identifiera lika termer', 'Förenkla algebraiska uttryck', 'Använda distributiva lagen']);

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
('lesson-mat1a-1-2', 'mod-mat1a-1', 'matematik-1a-course-id',
'Linjära ekvationer',
'Lös linjära ekvationer med en obekant',
'# Linjära ekvationer

## Vad är en ekvation?

En ekvation är ett matematiskt påstående som säger att två uttryck är lika. En linjär ekvation innehåller variabler i första potensen.

### Exempel på linjära ekvationer:
- 2x + 5 = 13
- 3y - 7 = 2y + 4
- 5(a - 2) = 3a + 6

## Grundprinciper för ekvationslösning

### Regel 1: Likhetsprincipen
Det du gör på ena sidan av likhetstecknet måste du göra på andra sidan.

### Regel 2: Isolera variabeln
Målet är att få variabeln ensam på ena sidan.

## Steg-för-steg metod

### Steg 1: Förenkla båda sidor
Ta bort parenteser och förenkla uttryck.

### Steg 2: Samla termer med variabel på ena sidan
Flytta alla termer med variabel till vänster sida.

### Steg 3: Samla konstanter på andra sidan
Flytta alla tal utan variabel till höger sida.

### Steg 4: Lös ut variabeln
Dividera eller multiplicera för att få variabeln ensam.

## Exempel

### Exempel 1: Lös 2x + 5 = 13

Steg 1: Subtrahera 5 från båda sidor
2x + 5 - 5 = 13 - 5
2x = 8

Steg 2: Dividera båda sidor med 2
2x/2 = 8/2
x = 4

Kontroll: 2·4 + 5 = 8 + 5 = 13 ✓

### Exempel 2: Lös 3x - 7 = 2x + 4

Steg 1: Subtrahera 2x från båda sidor
3x - 2x - 7 = 2x - 2x + 4
x - 7 = 4

Steg 2: Addera 7 till båda sidor
x - 7 + 7 = 4 + 7
x = 11

### Exempel 3: Lös 5(x - 2) = 3x + 6

Steg 1: Ta bort parentesen
5x - 10 = 3x + 6

Steg 2: Subtrahera 3x från båda sidor
5x - 3x - 10 = 3x - 3x + 6
2x - 10 = 6

Steg 3: Addera 10 till båda sidor
2x - 10 + 10 = 6 + 10
2x = 16

Steg 4: Dividera med 2
x = 8

## Vanliga misstag att undvika

1. Glöm inte att göra samma operation på båda sidor
2. Var försiktig med minustecken
3. Kontrollera alltid ditt svar genom att sätta in det i ursprungsekvationen

## Övningsuppgifter

1. Lös: x + 7 = 15
2. Lös: 3x - 5 = 16
3. Lös: 2(x + 3) = 14
4. Lös: 5x - 3 = 2x + 9
5. Lös: 4(x - 1) = 2(x + 3)',
'theory', 2, 50,
ARRAY['Förstå vad en linjär ekvation är', 'Använda likhetsprincipen', 'Lösa linjära ekvationer steg för steg', 'Kontrollera lösningar']);

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
('lesson-mat1a-1-3', 'mod-mat1a-1', 'matematik-1a-course-id',
'Ekvationssystem',
'Lös system av två linjära ekvationer',
'# Ekvationssystem

## Vad är ett ekvationssystem?

Ett ekvationssystem består av två eller flera ekvationer som ska vara uppfyllda samtidigt.

### Exempel:
x + y = 10
x - y = 2

## Metoder för att lösa ekvationssystem

### Metod 1: Substitutionsmetoden

Lös ut en variabel i en ekvation och sätt in i den andra.

#### Exempel:
x + y = 10  ... (1)
x - y = 2   ... (2)

Från (1): x = 10 - y

Sätt in i (2):
(10 - y) - y = 2
10 - 2y = 2
-2y = -8
y = 4

Sätt in y = 4 i (1):
x + 4 = 10
x = 6

Svar: x = 6, y = 4

### Metod 2: Additionsmetoden

Addera eller subtrahera ekvationerna för att eliminera en variabel.

#### Exempel:
2x + y = 12  ... (1)
x - y = 3    ... (2)

Addera ekvationerna:
2x + y + x - y = 12 + 3
3x = 15
x = 5

Sätt in x = 5 i (2):
5 - y = 3
y = 2

Svar: x = 5, y = 2

### Metod 3: Grafisk metod

Rita graferna för båda ekvationerna. Skärningspunkten är lösningen.

## Olika typer av lösningar

### En unik lösning
Linjerna skär varandra i en punkt.

### Oändligt många lösningar
Linjerna sammanfaller (är samma linje).

### Ingen lösning
Linjerna är parallella.

## Praktiska tillämpningar

### Exempel: Biljettpriser

På en biograf kostar vuxenbiljetter 120 kr och barnbiljetter 80 kr.
En familj köper totalt 5 biljetter för 520 kr.
Hur många vuxen- respektive barnbiljetter köpte de?

Lösning:
Låt x = antal vuxenbiljetter
Låt y = antal barnbiljetter

x + y = 5        ... (1)
120x + 80y = 520 ... (2)

Från (1): x = 5 - y

Sätt in i (2):
120(5 - y) + 80y = 520
600 - 120y + 80y = 520
600 - 40y = 520
-40y = -80
y = 2

x = 5 - 2 = 3

Svar: 3 vuxenbiljetter och 2 barnbiljetter

## Övningsuppgifter

1. Lös med substitution:
   x + y = 8
   x - y = 2

2. Lös med addition:
   2x + 3y = 13
   x - 3y = -4

3. Lös:
   3x + 2y = 16
   x + y = 6

4. Problemlösning:
   Summan av två tal är 50. Det större talet är 8 mer än det mindre.
   Vilka är talen?',
'theory', 3, 55,
ARRAY['Förstå vad ett ekvationssystem är', 'Använda substitutionsmetoden', 'Använda additionsmetoden', 'Lösa praktiska problem med ekvationssystem']);

-- =====================================================
-- MODUL 2: FUNKTIONER - LEKTIONER
-- =====================================================

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
('lesson-mat1a-2-1', 'mod-mat1a-2', 'matematik-1a-course-id',
'Introduktion till funktioner',
'Grundläggande begrepp om funktioner',
'# Introduktion till funktioner

## Vad är en funktion?

En funktion är en regel som till varje värde på x (input) ger exakt ett värde på y (output).

### Notation
f(x) = 2x + 3

Detta läses "f av x är lika med 2x plus 3"

## Funktionsvärden

För att beräkna f(2):
f(2) = 2·2 + 3 = 4 + 3 = 7

### Exempel:
Om f(x) = x² - 3x + 2, beräkna:

f(0) = 0² - 3·0 + 2 = 2
f(1) = 1² - 3·1 + 2 = 0
f(3) = 3² - 3·3 + 2 = 9 - 9 + 2 = 2

## Definitionsmängd och värdemängd

### Definitionsmängd (Df)
Alla x-värden som funktionen är definierad för.

### Värdemängd (Vf)
Alla y-värden som funktionen kan anta.

### Exempel:
f(x) = √x

Definitionsmängd: x ≥ 0 (kan inte ta roten ur negativa tal)
Värdemängd: y ≥ 0 (roten ur ett tal är alltid positivt)

## Grafer

En funktions graf visar sambandet mellan x och y visuellt.

### Att rita en graf:
1. Välj några x-värden
2. Beräkna motsvarande y-värden
3. Markera punkterna i ett koordinatsystem
4. Dra en kurva genom punkterna

## Funktionstyper

### Linjära funktioner
f(x) = kx + m
Grafen är en rät linje

### Kvadratiska funktioner
f(x) = ax² + bx + c
Grafen är en parabel

### Exponentialfunktioner
f(x) = a·bˣ
Grafen växer eller avtar exponentiellt

## Praktiska exempel

### Exempel 1: Temperaturomvandling
F(C) = 1.8C + 32

Omvandlar Celsius till Fahrenheit.

F(0) = 32°F (vattnets fryspunkt)
F(100) = 212°F (vattnets kokpunkt)

### Exempel 2: Taxiresa
K(x) = 50 + 15x

Där K är kostnaden i kr och x är antal km.

K(0) = 50 kr (grundavgift)
K(10) = 200 kr (10 km resa)

## Övningsuppgifter

1. Om f(x) = 3x - 5, beräkna f(2), f(0) och f(-1)

2. Om g(x) = x² + 2x, beräkna g(3) och g(-2)

3. Bestäm definitionsmängden för:
   a) f(x) = 1/x
   b) g(x) = √(x-2)

4. Rita grafen för f(x) = 2x + 1',
'theory', 1, 50,
ARRAY['Förstå funktionsbegreppet', 'Beräkna funktionsvärden', 'Förstå definitionsmängd och värdemängd', 'Rita enkla funktionsgrafer']);

INSERT INTO course_lessons (id, module_id, course_id, title, description, content, lesson_type, order_index, estimated_minutes, learning_objectives) VALUES
('lesson-mat1a-2-2', 'mod-mat1a-2', 'matematik-1a-course-id',
'Linjära funktioner',
'Räta linjens ekvation och k-värde',
'# Linjära funktioner

## Räta linjens ekvation

En linjär funktion har formen:
f(x) = kx + m

Där:
- k = riktningskoefficient (lutning)
- m = y-intercept (skärning med y-axeln)

## Riktningskoefficienten k

k anger hur mycket y ändras när x ökar med 1.

### Beräkna k från två punkter:
k = (y₂ - y₁)/(x₂ - x₁)

### Exempel:
Punkterna (1, 3) och (4, 9)

k = (9 - 3)/(4 - 1) = 6/3 = 2

### Tolkning av k:
- k > 0: Linjen stiger (går uppåt)
- k < 0: Linjen faller (går nedåt)
- k = 0: Horisontell linje
- Stort |k|: Brant linje
- Litet |k|: Flack linje

## Y-intercept m

m är y-värdet när x = 0.

### Att hitta m:
1. Använd en punkt och k-värdet
2. Sätt in i y = kx + m
3. Lös ut m

### Exempel:
k = 2 och punkten (1, 3)

3 = 2·1 + m
3 = 2 + m
m = 1

Funktionen: f(x) = 2x + 1

## Bestämma linjens ekvation

### Metod 1: Från två punkter
1. Beräkna k
2. Beräkna m
3. Skriv ekvationen

### Exempel:
Punkterna (2, 5) och (6, 13)

k = (13 - 5)/(6 - 2) = 8/4 = 2

Använd punkt (2, 5):
5 = 2·2 + m
5 = 4 + m
m = 1

Ekvation: y = 2x + 1

### Metod 2: Från k och en punkt
Om k = -3 och punkten (1, 4)

4 = -3·1 + m
4 = -3 + m
m = 7

Ekvation: y = -3x + 7

## Parallella och vinkelräta linjer

### Parallella linjer
Har samma k-värde.

Exempel:
y = 2x + 3 och y = 2x - 1 är parallella

### Vinkelräta linjer
Produkten av k-värdena är -1.

Om k₁ = 2, då är k₂ = -1/2 för vinkelrät linje.

## Praktiska tillämpningar

### Exempel 1: Vattenförbrukning
En pool innehåller 5000 liter vatten.
Vatten rinner ut med 50 liter per minut.

V(t) = 5000 - 50t

Där V är volym i liter och t är tid i minuter.

### Exempel 2: Löneberäkning
Grundlön 15000 kr + 150 kr per såld produkt.

L(x) = 15000 + 150x

Där L är lön i kr och x är antal sålda produkter.

## Övningsuppgifter

1. Bestäm k och m för linjen genom (1, 2) och (3, 8)

2. Skriv ekvationen för linjen med k = -2 genom (2, 5)

3. Är linjerna y = 3x + 1 och y = 3x - 2 parallella?

4. Bestäm ekvationen för linjen som är vinkelrät mot y = 2x + 1
   och går genom (0, 3)',
'theory', 2, 55,
ARRAY['Förstå räta linjens ekvation', 'Beräkna riktningskoefficient', 'Bestämma linjens ekvation från punkter', 'Identifiera parallella och vinkelräta linjer']);

-- =====================================================
-- ÖVNINGAR
-- =====================================================

INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points, difficulty_level) VALUES
('ex-mat1a-1-1', 'lesson-mat1a-1-1', 'matematik-1a-course-id',
'Förenkling av algebraiska uttryck',
'Testa dina kunskaper i att förenkla uttryck',
'Förenkla följande algebraiska uttryck',
'multiple_choice',
'[
  {
    "question": "Förenkla: 5x + 3x - 2x",
    "options": ["6x", "10x", "8x", "4x"],
    "id": 1
  },
  {
    "question": "Förenkla: 3(x + 2)",
    "options": ["3x + 2", "3x + 6", "3x + 5", "x + 6"],
    "id": 2
  },
  {
    "question": "Förenkla: 2x² + 3x - x² + 5x",
    "options": ["x² + 8x", "3x² + 8x", "x² + 2x", "2x² + 8x"],
    "id": 3
  },
  {
    "question": "Vad är koefficienten i uttrycket 7y?",
    "options": ["7", "y", "7y", "1"],
    "id": 4
  }
]',
'[
  {"id": 1, "correct": "6x"},
  {"id": 2, "correct": "3x + 6"},
  {"id": 3, "correct": "x² + 8x"},
  {"id": 4, "correct": "7"}
]',
20, 'easy');

INSERT INTO course_exercises (id, lesson_id, course_id, title, description, instructions, exercise_type, questions, correct_answers, points, difficulty_level) VALUES
('ex-mat1a-1-2', 'lesson-mat1a-1-2', 'matematik-1a-course-id',
'Lösning av linjära ekvationer',
'Öva på att lösa linjära ekvationer',
'Lös följande ekvationer',
'multiple_choice',
'[
  {
    "question": "Lös: x + 5 = 12",
    "options": ["x = 7", "x = 17", "x = 5", "x = 12"],
    "id": 1
  },
  {
    "question": "Lös: 2x = 10",
    "options": ["x = 5", "x = 20", "x = 2", "x = 8"],
    "id": 2
  },
  {
    "question": "Lös: 3x - 5 = 16",
    "options": ["x = 7", "x = 11", "x = 21", "x = 3"],
    "id": 3
  },
  {
    "question": "Lös: 2(x + 3) = 14",
    "options": ["x = 4", "x = 7", "x = 5", "x = 11"],
    "id": 4
  }
]',
'[
  {"id": 1, "correct": "x = 7"},
  {"id": 2, "correct": "x = 5"},
  {"id": 3, "correct": "x = 7"},
  {"id": 4, "correct": "x = 4"}
]',
25, 'medium');

-- =====================================================
-- STUDIEGUIDER
-- =====================================================

INSERT INTO study_guides (id, course_id, title, description, content, guide_type, estimated_read_time) VALUES
('guide-mat1a-1', 'matematik-1a-course-id',
'Formelblad Algebra',
'Samling av viktiga algebraiska formler',
'# Formelblad - Algebra

## Grundläggande räkneregler

### Prioriteringsregler
1. Parenteser
2. Multiplikation och division (från vänster till höger)
3. Addition och subtraktion (från vänster till höger)

## Algebraiska identiteter

### Distributiva lagen
a(b + c) = ab + ac

### Kvadreringsreglerna
(a + b)² = a² + 2ab + b²
(a - b)² = a² - 2ab + b²

### Konjugatregeln
(a + b)(a - b) = a² - b²

## Ekvationslösning

### Linjär ekvation
ax + b = c
x = (c - b)/a

### Andragradsekvationen
ax² + bx + c = 0

x = (-b ± √(b² - 4ac))/(2a)

## Potensregler

aᵐ · aⁿ = aᵐ⁺ⁿ
aᵐ / aⁿ = aᵐ⁻ⁿ
(aᵐ)ⁿ = aᵐⁿ
a⁰ = 1
a⁻ⁿ = 1/aⁿ

## Procenträkning

Ökning med p%: x · (1 + p/100)
Minskning med p%: x · (1 - p/100)

## Funktioner

### Linjär funktion
f(x) = kx + m

k = riktningskoefficient
m = y-intercept

### Riktningskoefficient från två punkter
k = (y₂ - y₁)/(x₂ - x₁)',
'formula_sheet', 10);

INSERT INTO study_guides (id, course_id, title, description, content, guide_type, estimated_read_time) VALUES
('guide-mat1a-2', 'matematik-1a-course-id',
'Studietips för Matematik',
'Effektiva strategier för att lära sig matematik',
'# Studietips för Matematik

## Allmänna råd

### 1. Öva regelbundet
Matematik kräver träning. Gör lite varje dag istället för mycket sällan.

### 2. Förstå, inte memorera
Försök förstå varför formler fungerar, inte bara lära dig dem utantill.

### 3. Visa alla steg
Skriv ner alla mellansteg när du löser problem. Det hjälper dig att hitta fel.

### 4. Kontrollera dina svar
Sätt alltid in ditt svar i ursprungsekvationen för att kontrollera.

## Problemlösningsstrategier

### Steg 1: Läs problemet noggrant
Identifiera vad som är givet och vad du ska hitta.

### Steg 2: Rita en bild
Visualisera problemet om möjligt.

### Steg 3: Välj metod
Bestäm vilken metod eller formel som passar.

### Steg 4: Lös problemet
Arbeta systematiskt genom lösningen.

### Steg 5: Kontrollera
Är svaret rimligt? Stämmer enheterna?

## Vanliga misstag att undvika

1. Glömma minustecken
2. Fel prioriteringsordning
3. Dividera fel i bråk
4. Glömma att göra samma operation på båda sidor av ekvationen

## Resurser

- Använd grafräknare för att kontrollera grafer
- Kolla YouTube för visuella förklaringar
- Arbeta i studiegrupper
- Fråga läraren när du fastnar

## Förberedelse inför prov

1. Gör gamla prov
2. Sammanfatta viktiga formler
3. Identifiera svåra områden och öva extra på dem
4. Sov gott natten innan
5. Läs igenom hela provet först',
'summary', 15);

-- =====================================================
-- BEDÖMNINGAR
-- =====================================================

INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
('assess-mat1a-1', 'matematik-1a-course-id',
'Algebra och ekvationer - Deltest',
'Test över algebraiska uttryck och ekvationslösning',
'test', 50, 35, 60);

INSERT INTO course_assessments (id, course_id, title, description, assessment_type, total_points, passing_score, time_limit_minutes) VALUES
('assess-mat1a-2', 'matematik-1a-course-id',
'Funktioner - Deltest',
'Test över linjära och exponentiella funktioner',
'test', 50, 35, 60);

-- =====================================================
-- SLUTFÖRT
-- =====================================================
