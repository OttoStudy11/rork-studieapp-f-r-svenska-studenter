-- Complete Structure Example: Matematik 1b
-- This shows how to populate a complete course with modules, lessons, and content

-- ===========================================
-- 1. COURSE METADATA
-- ===========================================

INSERT INTO public.courses (
    id,
    course_code,
    title,
    description,
    subject,
    level,
    points,
    created_at
) VALUES (
    'c1b2e3f4-1111-2222-3333-444455556666',
    'MATMAT01b',
    'Matematik 1b',
    'Kursen Matematik 1b omfattar grundläggande matematiska begrepp och metoder. Syftet är att utveckla matematisk kompetens och förmåga att använda matematik i vardagen och kommande studier.',
    'Matematik',
    'gymnasie',
    100,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- ===========================================
-- 2. MODULES (Chapters/Topics)
-- ===========================================

-- Module 1: Algebra och ekvationer
INSERT INTO public.course_modules (
    id,
    course_id,
    title,
    description,
    order_index,
    estimated_hours,
    is_published,
    created_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'c1b2e3f4-1111-2222-3333-444455556666',
    'Algebra och ekvationer',
    'Lär dig att arbeta med algebraiska uttryck, lösa ekvationer och tillämpa dessa kunskaper i praktiska problem.',
    1,
    80,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_published = EXCLUDED.is_published;

-- Module 2: Funktioner
INSERT INTO public.course_modules (
    id,
    course_id,
    title,
    description,
    order_index,
    estimated_hours,
    is_published,
    created_at
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'c1b2e3f4-1111-2222-3333-444455556666',
    'Funktioner',
    'Utforska linjära och exponentiella funktioner, hur man tolkar grafer och använder funktioner för att modellera verkliga situationer.',
    2,
    100,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_published = EXCLUDED.is_published;

-- Module 3: Geometri
INSERT INTO public.course_modules (
    id,
    course_id,
    title,
    description,
    order_index,
    estimated_hours,
    is_published,
    created_at
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'c1b2e3f4-1111-2222-3333-444455556666',
    'Geometri',
    'Studera geometriska figurer, beräkna area och volym, samt tillämpa Pythagoras sats och trigonometri.',
    3,
    80,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_published = EXCLUDED.is_published;

-- Module 4: Sannolikhet och statistik
INSERT INTO public.course_modules (
    id,
    course_id,
    title,
    description,
    order_index,
    estimated_hours,
    is_published,
    created_at
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'c1b2e3f4-1111-2222-3333-444455556666',
    'Sannolikhet och statistik',
    'Lär dig grundläggande begrepp inom sannolikhetslära och statistik, samt hur man analyserar och tolkar data.',
    4,
    60,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_published = EXCLUDED.is_published;

-- ===========================================
-- 3. LESSONS - Module 1: Algebra och ekvationer
-- ===========================================

-- Lesson 1.1: Räkneregler och prioriteringsregler
INSERT INTO public.course_lessons (
    id,
    course_id,
    module_id,
    title,
    description,
    content,
    order_index,
    estimated_minutes,
    difficulty_level,
    lesson_type,
    is_published,
    created_at
) VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'c1b2e3f4-1111-2222-3333-444455556666',
    '11111111-1111-1111-1111-111111111111',
    'Räkneregler och prioriteringsregler',
    'Grundläggande räkneregler och hur man använder prioriteringsreglerna korrekt.',
    '# Räkneregler och prioriteringsregler

## Introduktion
När vi räknar matematik är det viktigt att följa rätt ordning. Annars kan vi få helt olika svar på samma uppgift!

## Prioriteringsregler (PEMDAS/BODMAS)
Räkneoperationer ska utföras i följande ordning:

1. **P**arenteser först
2. **E**xponenter (potenser)
3. **M**ultiplikation och **D**ivision (från vänster till höger)
4. **A**ddition och **S**ubtraktion (från vänster till höger)

### Exempel 1: Enkel räkning
```
8 + 2 × 3 = ?
```

**Fel:** 8 + 2 = 10, sedan 10 × 3 = 30 ❌
**Rätt:** Multiplikation först! 2 × 3 = 6, sedan 8 + 6 = 14 ✅

### Exempel 2: Med parenteser
```
(8 + 2) × 3 = ?
```

Nu räknar vi först inom parentesen:
8 + 2 = 10, sedan 10 × 3 = 30 ✅

## Räknelagar

### Kommutativa lagen
Ordningen spelar ingen roll vid addition och multiplikation:
- a + b = b + a
- a × b = b × a

Exempel: 5 + 3 = 3 + 5 = 8

### Associativa lagen
Grupperingen spelar ingen roll:
- (a + b) + c = a + (b + c)
- (a × b) × c = a × (b × c)

Exempel: (2 + 3) + 4 = 2 + (3 + 4) = 9

### Distributiva lagen
Multiplicera med summan = multiplicera varje term:
- a × (b + c) = a × b + a × c

Exempel: 5 × (2 + 3) = 5 × 2 + 5 × 3 = 10 + 15 = 25

## Praktiska tips
1. Skriv alltid ut alla steg
2. Använd parenteser när du är osäker
3. Dubbelkolla dina beräkningar
4. Räkna från vänster till höger vid samma prioritet

## Övningsuppgifter

### Nivå 1: Grundläggande
1. 12 + 4 × 2 = ?
2. 20 - 3 × 4 = ?
3. (15 + 5) ÷ 4 = ?

### Nivå 2: Mellan
4. 3 × (8 - 2) + 4 = ?
5. 24 ÷ (2 + 4) × 3 = ?
6. 5² + 3 × 2 = ?

### Nivå 3: Avancerad
7. (8 + 2²) × 3 - 6 ÷ 2 = ?
8. 100 - [50 - (10 + 5)] = ?

## Facit
1. 20  2. 8  3. 5  4. 22  5. 12  6. 31  7. 33  8. 65

## Sammanfattning
- Följ alltid prioriteringsreglerna
- Parenteser styr beräkningsordningen
- Räknelagar hjälper oss förenkla uttryck
- Öva mycket för att bli säker!',
    1,
    45,
    'easy',
    'theory',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    is_published = EXCLUDED.is_published;

-- Lesson 1.2: Algebraiska uttryck
INSERT INTO public.course_lessons (
    id,
    course_id,
    module_id,
    title,
    description,
    content,
    order_index,
    estimated_minutes,
    difficulty_level,
    lesson_type,
    is_published,
    created_at
) VALUES (
    'a1111111-2222-1111-1111-111111111111',
    'c1b2e3f4-1111-2222-3333-444455556666',
    '11111111-1111-1111-1111-111111111111',
    'Algebraiska uttryck',
    'Lär dig att förenkla och arbeta med algebraiska uttryck.',
    '# Algebraiska uttryck

## Vad är algebra?
Algebra är att använda bokstäver (variabler) för att representera okända tal eller tal som kan variera.

## Grundläggande begrepp

### Variabler
En variabel är en bokstav som representerar ett tal:
- x, y, z är vanliga variabler
- De kan ha olika värden

### Termer
En term är en del av ett algebraiskt uttryck:
- 3x är en term
- -5y² är en term
- 7 är en term (konstant)

### Koefficient
Talet framför variabeln kallas koefficient:
- I 5x är 5 koefficienten
- I -3y² är -3 koefficienten

## Förenkla uttryck

### Samla lika termer
Termer med samma variabel och exponent kan läggas ihop:

```
3x + 5x = 8x
2y² - y² = y²
4a + 3b - 2a = 2a + 3b
```

### Exempel 1: Grundläggande förenkling
```
Förenkla: 5x + 3 - 2x + 7
```

Steg 1: Identifiera lika termer
- x-termer: 5x, -2x
- Konstanter: 3, 7

Steg 2: Samla lika termer
5x - 2x = 3x
3 + 7 = 10

**Svar: 3x + 10**

### Exempel 2: Med parenteser
```
Förenkla: 3(x + 4) - 2x
```

Steg 1: Multiplicera in
3(x + 4) = 3x + 12

Steg 2: Skriv om uttrycket
3x + 12 - 2x

Steg 3: Samla lika termer
3x - 2x + 12 = x + 12

**Svar: x + 12**

## Multiplicera uttryck

### Distributiva lagen
a(b + c) = ab + ac

Exempel:
```
5(2x + 3) = 5 × 2x + 5 × 3 = 10x + 15
```

### Kvadreringsregler
Viktiga formler att kunna:

**(a + b)² = a² + 2ab + b²**

Exempel: (x + 3)² = x² + 6x + 9

**(a - b)² = a² - 2ab + b²**

Exempel: (x - 2)² = x² - 4x + 4

### Konjugatregeln
**(a + b)(a - b) = a² - b²**

Exempel: (x + 4)(x - 4) = x² - 16

## Övningsuppgifter

### Nivå 1: Förenkla
1. 4x + 2x - x = ?
2. 7y - 3y + 5y = ?
3. 3a + 5 - a + 2 = ?

### Nivå 2: Med parenteser
4. 2(3x + 1) + 4x = ?
5. 5(y - 2) - 3(y + 1) = ?
6. 4(2a + 3) - (a + 5) = ?

### Nivå 3: Kvadrering
7. (x + 5)² = ?
8. (2y - 3)² = ?
9. (x + 2)(x - 2) = ?

## Facit
1. 5x
2. 9y
3. 2a + 7
4. 10x + 2
5. 2y - 13
6. 7a + 7
7. x² + 10x + 25
8. 4y² - 12y + 9
9. x² - 4

## Tips för framgång
- Var noga med plus- och minustecken
- Kontrollera alltid ditt svar
- Öva kvadreringsreglerna tills de sitter
- Rita streck under lika termer för att hitta dem lättare

## Sammanfattning
- Algebra använder bokstäver för tal
- Samla lika termer för att förenkla
- Använd distributiva lagen vid multiplikation
- Lär dig kvadreringsreglerna utantill',
    2,
    60,
    'easy',
    'theory',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    is_published = EXCLUDED.is_published;

-- Lesson 1.3: Linjära ekvationer
INSERT INTO public.course_lessons (
    id,
    course_id,
    module_id,
    title,
    description,
    content,
    order_index,
    estimated_minutes,
    difficulty_level,
    lesson_type,
    is_published,
    created_at
) VALUES (
    'a1111111-3333-1111-1111-111111111111',
    'c1b2e3f4-1111-2222-3333-444455556666',
    '11111111-1111-1111-1111-111111111111',
    'Linjära ekvationer',
    'Lär dig att lösa linjära ekvationer med en obekant.',
    '# Linjära ekvationer

## Vad är en ekvation?
En ekvation är en likhet mellan två uttryck som innehåller en eller flera obekanta.

Exempel: 2x + 5 = 13

## Grundprinciper

### Likhetens princip
Det som görs på ena sidan av likhetstecknet måste göras på andra sidan också.

**Mål:** Få x ensamt på ena sidan

## Lösningsmetod

### Steg-för-steg
1. Förenkla båda sidor (om möjligt)
2. Samla alla x-termer på ena sidan
3. Samla alla konstanter på andra sidan
4. Isolera x genom att dividera

### Exempel 1: Enkel ekvation
```
Lös: x + 7 = 15
```

Steg 1: Subtrahera 7 från båda sidor
x + 7 - 7 = 15 - 7
x = 8

**Svar: x = 8**

Kontroll: 8 + 7 = 15 ✓

### Exempel 2: Med multiplikation
```
Lös: 3x = 21
```

Steg 1: Dividera båda sidor med 3
3x ÷ 3 = 21 ÷ 3
x = 7

**Svar: x = 7**

Kontroll: 3 × 7 = 21 ✓

### Exempel 3: Fler steg
```
Lös: 4x + 5 = 25
```

Steg 1: Subtrahera 5 från båda sidor
4x + 5 - 5 = 25 - 5
4x = 20

Steg 2: Dividera båda sidor med 4
4x ÷ 4 = 20 ÷ 4
x = 5

**Svar: x = 5**

Kontroll: 4(5) + 5 = 20 + 5 = 25 ✓

### Exempel 4: X på båda sidor
```
Lös: 5x + 3 = 2x + 15
```

Steg 1: Subtrahera 2x från båda sidor
5x - 2x + 3 = 2x - 2x + 15
3x + 3 = 15

Steg 2: Subtrahera 3 från båda sidor
3x = 12

Steg 3: Dividera med 3
x = 4

**Svar: x = 4**

Kontroll: 5(4) + 3 = 20 + 3 = 23, 2(4) + 15 = 8 + 15 = 23 ✓

### Exempel 5: Med parenteser
```
Lös: 3(x + 2) = 21
```

Steg 1: Multiplicera in
3x + 6 = 21

Steg 2: Subtrahera 6
3x = 15

Steg 3: Dividera med 3
x = 5

**Svar: x = 5**

## Vanliga misstag att undvika
1. ❌ Glömma att göra samma sak på båda sidor
2. ❌ Teckenfel (speciellt med negativa tal)
3. ❌ Glömma att multiplicera in i parenteser
4. ❌ Inte kontrollera svaret

## Praktiska tillämpningar

### Åldersproblem
"Anna är 5 år äldre än Björn. Tillsammans är de 37 år. Hur gamla är de?"

Lösning:
- Låt x = Björns ålder
- Anna = x + 5
- x + (x + 5) = 37
- 2x + 5 = 37
- 2x = 32
- x = 16

Svar: Björn är 16 år, Anna är 21 år

### Prisproblem
"Ett paket kostar 15 kr mer än en lösvikt. Om du köper 3 paket betalar du 195 kr. Vad kostar ett paket?"

Lösning:
- Låt x = priset för ett paket
- 3x = 195
- x = 65

Svar: Ett paket kostar 65 kr

## Övningsuppgifter

### Nivå 1: Grundläggande
1. x + 8 = 15
2. 2x = 18
3. x - 5 = 12
4. 4x = 32

### Nivå 2: Flera steg
5. 3x + 7 = 22
6. 5x - 10 = 15
7. 2x + 8 = x + 14
8. 4(x + 3) = 28

### Nivå 3: Utmaningar
9. 2(3x - 1) + 5 = 4x + 11
10. 3(x + 4) - 2x = 5x - 8

## Facit
1. x = 7
2. x = 9
3. x = 17
4. x = 8
5. x = 5
6. x = 5
7. x = 6
8. x = 4
9. x = 4
10. x = 5

## Tips för att lyckas
- Arbeta systematiskt, steg för steg
- Skriv ner alla steg
- Kontrollera alltid ditt svar
- Öva mycket – det blir enklare!

## Sammanfattning
- Gör samma sak på båda sidor av likhetstecknet
- Målet är att isolera x
- Kontrollera alltid genom att sätta in svaret
- Linjära ekvationer har exakt en lösning',
    3,
    75,
    'medium',
    'theory',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    is_published = EXCLUDED.is_published;

-- ===========================================
-- 4. STUDY GUIDES - Module 1
-- ===========================================

-- Study Guide 1: Algebra och ekvationer - Sammanfattning
INSERT INTO public.study_guides (
    id,
    course_id,
    title,
    description,
    content,
    estimated_read_time,
    difficulty_level,
    is_published,
    created_at
) VALUES (
    'ab111111-1111-1111-1111-111111111111',
    'c1b2e3f4-1111-2222-3333-444455556666',
    'Algebra och ekvationer - Komplett guide',
    'En omfattande sammanfattning av algebra och ekvationer med tips och tricks.',
    '# Studieplan: Algebra och ekvationer

## Översikt
Den här modulen täcker grunderna i algebra och ekvationslösning. Rekommenderad studietid: 4 veckor.

## Vecka 1: Räkneregler
- ✅ Prioriteringsregler (PEMDAS)
- ✅ Räknelagar (kommutativ, associativ, distributiv)
- ✅ Arbeta med parenteser
- ⏰ Studera: 3-4 timmar
- 📝 Övningar: Minst 20 uppgifter

## Vecka 2: Algebraiska uttryck
- ✅ Termer och koefficienter
- ✅ Förenkla uttryck
- ✅ Samla lika termer
- ✅ Kvadreringsregler
- ⏰ Studera: 4-5 timmar
- 📝 Övningar: Minst 30 uppgifter

## Vecka 3-4: Linjära ekvationer
- ✅ Lösa enkla ekvationer
- ✅ Ekvationer med x på båda sidor
- ✅ Ekvationer med parenteser
- ✅ Praktiska tillämpningar
- ⏰ Studera: 5-6 timmar
- 📝 Övningar: Minst 40 uppgifter

## Viktiga formler att kunna

### Kvadreringsregler
```
(a + b)² = a² + 2ab + b²
(a - b)² = a² - 2ab + b²
(a + b)(a - b) = a² - b²
```

### Ekvationslösning
```
ax + b = c
x = (c - b) / a
```

## Studietips
1. 📖 Läs teori först, sedan öva
2. ✍️ Skriv ner viktiga formler
3. 🔄 Upprepa svåra moment
4. ✅ Kontrollera alltid dina svar
5. 💪 Öva regelbundet (hellre lite varje dag än mycket en gång)

## Vanliga fallgropar
- ❌ Glömma minustecken
- ❌ Fel prioritetsordning
- ❌ Glömma multiplicera in i parenteser
- ❌ Inte kontrollera svaret

## Självtest - Kan du detta?
Testa dig själv innan provet:

□ Jag kan tillämpa prioriteringsreglerna
□ Jag kan förenkla algebraiska uttryck
□ Jag kan använda kvadreringsreglerna
□ Jag kan lösa linjära ekvationer
□ Jag kan lösa ekvationer med parenteser
□ Jag kan lösa vardagsproblem med ekvationer

## Resurser
- 📺 Khan Academy: Algebra basics
- 📱 Photomath: Steg-för-steg lösningar
- 📚 Matteboken.se: Teori och övningar
- 👥 Plugga med kompisar

## Provförberedelse
### Veckan före provet
- Gå igenom alla anteckningar
- Gör gamla prov
- Repetera alla formler
- Identifiera svaga områden

### Dagen före provet
- Lätt repetition
- Vila ordentligt
- Ät bra frukost
- Positiv attityd!

## Lycka till!
Du klarar det här! Kom ihåg att matematik handlar om träning – ju mer du övar, desto bättre blir du. 💪📐',
    30,
    'medium',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    is_published = EXCLUDED.is_published;

-- ===========================================
-- 5. REPEAT FOR OTHER MODULES
-- ===========================================
-- For brevity, I''ll show the structure for one more module

-- Module 2: Funktioner - Lesson 2.1
INSERT INTO public.course_lessons (
    id,
    course_id,
    module_id,
    title,
    description,
    content,
    order_index,
    estimated_minutes,
    difficulty_level,
    lesson_type,
    is_published,
    created_at
) VALUES (
    'a2222222-1111-2222-2222-222222222222',
    'c1b2e3f4-1111-2222-3333-444455556666',
    '22222222-2222-2222-2222-222222222222',
    'Introduktion till funktioner',
    'Grundläggande begrepp om funktioner, definitionsmängd och värdemängd.',
    '# Introduktion till funktioner

## Vad är en funktion?
En funktion är en regel som kopplar varje värde från en mängd (definitionsmängd) till exakt ett värde i en annan mängd (värdemängd).

Notation: f(x) - "f av x"

## Grundläggande begrepp

### Definitionsmängd (Df)
Alla x-värden som funktionen är definierad för.

Exempel: f(x) = x + 2
Df: alla reella tal (ℝ)

### Värdemängd (Vf)
Alla möjliga y-värden som funktionen kan anta.

### Funktionsvärde
Värdet av funktionen för ett specifikt x.

Exempel: f(x) = 2x + 3
- f(2) = 2(2) + 3 = 7
- f(0) = 2(0) + 3 = 3
- f(-1) = 2(-1) + 3 = 1

## Olika sätt att visa funktioner

### 1. Formel
f(x) = 2x + 5

### 2. Tabell
| x  | f(x) |
|----|------|
| 0  | 5    |
| 1  | 7    |
| 2  | 9    |
| 3  | 11   |

### 3. Graf
En linje genom punkterna i tabellen.

### 4. Ordpar
{(0,5), (1,7), (2,9), (3,11)}

## Grafritning

### Steg för att rita en graf:
1. Välj några x-värden
2. Beräkna motsvarande y-värden
3. Markera punkterna i ett koordinatsystem
4. Dra en linje genom punkterna

### Exempel: Rita f(x) = x + 1

| x  | f(x) |
|----|------|
| -2 | -1   |
| 0  | 1    |
| 2  | 3    |

Punkter: (-2,-1), (0,1), (2,3)
Rita en rak linje genom dessa!

## Linjära funktioner
En linjär funktion har formen: f(x) = kx + m

- **k** = riktningskoefficient (lutning)
- **m** = skärning med y-axeln

### Lutning (k)
- k > 0: Funktionen stiger
- k < 0: Funktionen faller  
- k = 0: Horisontell linje

### Y-skärning (m)
Punkten där linjen skär y-axeln: (0, m)

## Praktiska tillämpningar

### Exempel 1: Taxiresa
En taxi kostar 50 kr i startavgift + 8 kr/km.

Funktion: f(x) = 8x + 50

- x = antal km
- f(x) = totalkostnad

Vad kostar en 15 km lång resa?
f(15) = 8(15) + 50 = 120 + 50 = 170 kr

### Exempel 2: Temperatur
Omvandla Celsius till Fahrenheit:

f(C) = 1.8C + 32

Vad är 20°C i Fahrenheit?
f(20) = 1.8(20) + 32 = 36 + 32 = 68°F

## Övningsuppgifter

### Nivå 1: Funktionsvärden
Givet f(x) = 3x - 2, beräkna:
1. f(0)
2. f(2)
3. f(-1)
4. f(5)

### Nivå 2: Skapa tabell
För f(x) = -2x + 4, skapa en värdetabell för x = -1, 0, 1, 2, 3

### Nivå 3: Tolka grafer
Givet en linje som går genom (0,3) och (2,7):
5. Vad är k-värdet?
6. Vad är m-värdet?
7. Skriv funktionens formel

## Facit
1. f(0) = -2
2. f(2) = 4
3. f(-1) = -5
4. f(5) = 13
5. k = 2
6. m = 3
7. f(x) = 2x + 3

## Tips
- Rita alltid en graf när du kan
- Kontrollera dina punkter noga
- Använd linjal för raka linjer
- Märk ut axlarna tydligt

## Sammanfattning
- Funktioner kopplar x till f(x)
- Linjära funktioner: f(x) = kx + m
- k är lutningen, m är y-skärningen
- Grafer visualiserar funktioner',
    1,
    60,
    'easy',
    'theory',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    is_published = EXCLUDED.is_published;

-- ===========================================
-- 6. SUCCESS MESSAGE
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE '✅ Exempel på kursstruktur för Matematik 1b skapat!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Struktur:';
    RAISE NOTICE '  📚 1 Kurs (Matematik 1b)';
    RAISE NOTICE '  📖 4 Moduler';
    RAISE NOTICE '  📝 4 Lektioner (exempel)';
    RAISE NOTICE '  📋 1 Studieguide';
    RAISE NOTICE '';
    RAISE NOTICE 'Varje lektion innehåller:';
    RAISE NOTICE '  ✓ Teori med förklaringar';
    RAISE NOTICE '  ✓ Exempel med lösningar';
    RAISE NOTICE '  ✓ Övningsuppgifter (3 nivåer)';
    RAISE NOTICE '  ✓ Facit för självkontroll';
    RAISE NOTICE '  ✓ Tips och sammanfattning';
    RAISE NOTICE '';
    RAISE NOTICE 'Detta är en mall - upprepa för alla moduler och lektioner!';
    RAISE NOTICE '==================================================';
END $$;
