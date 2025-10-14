-- ============================================================================
-- KOMPLETT KURSINNEHÅLL - ALLA GYMNASIEKURSER
-- ============================================================================
-- Detta script fyller databasen med detaljerat innehåll för alla kurser
-- inklusive lektioner, studyguides, tips och tekniker
-- ============================================================================

-- Rensa befintligt innehåll
DELETE FROM lessons;
DELETE FROM study_guides;
DELETE FROM courses;

-- ============================================================================
-- MATEMATIK 1A - GRUNDLÄGGANDE MATEMATIK
-- ============================================================================

INSERT INTO courses (id, name, code, points, year, mandatory, category, program, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Matematik 1a',
  'MATMAT01a',
  100,
  1,
  true,
  'gymnasiegemensam',
  'Alla program',
  'Grundläggande matematikkurs som behandlar algebra, geometri, funktioner och sannolikhet. Kursen ger dig de matematiska verktyg du behöver för vidare studier.',
  NOW(),
  NOW()
) RETURNING id;

-- Spara course_id för Matematik 1a
DO $$
DECLARE
  mat1a_id UUID;
  lesson1_id UUID;
  lesson2_id UUID;
  lesson3_id UUID;
  lesson4_id UUID;
  lesson5_id UUID;
  lesson6_id UUID;
  lesson7_id UUID;
  lesson8_id UUID;
BEGIN
  -- Hämta course_id
  SELECT id INTO mat1a_id FROM courses WHERE code = 'MATMAT01a' LIMIT 1;

  -- Lektion 1: Tal och räkning
  INSERT INTO lessons (id, course_id, title, description, content, order_index, duration_minutes, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    mat1a_id,
    'Tal och räkning',
    'Grundläggande talbegrepp, de fyra räknesätten och prioriteringsregler',
    '# Tal och räkning

## Introduktion
I denna lektion går vi igenom grundläggande talbegrepp och räkneregler som är fundamentala för all matematik.

## Talområden

### Naturliga tal (ℕ)
De naturliga talen är de positiva heltalen: 1, 2, 3, 4, 5, ...

**Exempel:**
- Antal äpplen i en korg
- Antal elever i ett klassrum

### Hela tal (ℤ)
Hela tal inkluderar både positiva och negativa heltal samt noll: ..., -3, -2, -1, 0, 1, 2, 3, ...

Exempel:
- Temperatur (kan vara negativ)
- Kontobalans (kan vara negativ vid skuld)
    
Rationella tal (ℚ)
Tal som kan skrivas som bråk a/b där a och b är hela tal och b ≠ 0.

Exempel:
- 1/2, 3/4, -2/5
- Alla heltal (t.ex. 5 = 5/1)
- Decimala tal som tar slut eller är periodiska (0.5, 0.333...)

 Irrationella tal
Tal som inte kan skrivas som bråk, med oändliga icke-periodiska decimaler.

Exempel:
- π (pi) ≈ 3.14159...
- √2 ≈ 1.41421...
- e ≈ 2.71828...

Reella tal (ℝ)
Alla rationella och irrationella tal tillsammans.

De fyra räknesätten

Addition (+)
Att lägga ihop tal.
- 5 + 3 = 8
- (-2) + 7 = 5
- 1.5 + 2.3 = 3.8

Subtraktion (−)
Att ta bort eller minska.
- 10 − 4 = 6
- 3 − 8 = −5
- 5.7 − 2.3 = 3.4

### Multiplikation (×)
Upprepad addition.
- 4 × 3 = 12 (samma som 4 + 4 + 4)
- (−2) × 5 = −10
- 0.5 × 6 = 3

**Teckenregler:**
- Positivt × Positivt = Positivt
- Negativt × Negativt = Positivt
- Positivt × Negativt = Negativt
- Negativt × Positivt = Negativt

### Division (÷ eller /)
Att dela upp i lika delar.
- 12 ÷ 3 = 4
- 15 / 5 = 3
- (−20) ÷ 4 = −5

**Teckenregler:** Samma som för multiplikation.

**OBS!** Division med noll är inte definierad: 5 ÷ 0 är inte möjligt!

## Prioriteringsregler

När vi har flera räknesätt i samma uttryck måste vi följa rätt ordning:

1. **Parenteser** - Räkna alltid det som står inom parenteser först
2. **Potenser** - Beräkna potenser
3. **Multiplikation och Division** - Från vänster till höger
4. **Addition och Subtraktion** - Från vänster till höger

**Minnesregel:** PEMDAS eller "Parenteser, Exponenter, Multiplikation/Division, Addition/Subtraktion"

### Exempel 1
Beräkna: 5 + 3 × 2

**Lösning:**
- Först multiplikation: 3 × 2 = 6
- Sedan addition: 5 + 6 = 11

**Svar:** 11

### Exempel 2
Beräkna: (5 + 3) × 2

**Lösning:**
- Först parentesen: 5 + 3 = 8
- Sedan multiplikation: 8 × 2 = 16

**Svar:** 16

### Exempel 3
Beräkna: 20 − 3 × 2 + 8 ÷ 4

**Lösning:**
1. Multiplikation: 3 × 2 = 6
2. Division: 8 ÷ 4 = 2
3. Nu har vi: 20 − 6 + 2
4. Från vänster till höger: 20 − 6 = 14
5. Sedan: 14 + 2 = 16

**Svar:** 16

## Bråkräkning

### Addition och subtraktion av bråk
För att addera eller subtrahera bråk måste de ha samma nämnare.

**Exempel:**
1/4 + 2/4 = 3/4

Om nämnarna är olika, hitta minsta gemensamma nämnare (MGN):
1/3 + 1/4 = 4/12 + 3/12 = 7/12

### Multiplikation av bråk
Multiplicera täljare med täljare och nämnare med nämnare.

**Exempel:**
2/3 × 3/5 = (2×3)/(3×5) = 6/15 = 2/5

### Division av bråk
Vänd det andra bråket och multiplicera.

**Exempel:**
2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6

## Procent

Procent betyder "per hundra" och skrivs med symbolen %.

### Omvandlingar
- Bråk till procent: (täljare/nämnare) × 100%
- Procent till decimal: dela med 100
- Decimal till procent: multiplicera med 100

**Exempel:**
- 1/4 = 0.25 = 25%
- 75% = 0.75 = 3/4

### Procenträkning
**Beräkna procent av ett tal:**
30% av 200 = 0.30 × 200 = 60

**Ökning med procent:**
Öka 100 med 20% = 100 × 1.20 = 120

**Minskning med procent:**
Minska 100 med 20% = 100 × 0.80 = 80

## Övningsuppgifter

1. Beräkna: 15 + 3 × 4 − 2
2. Beräkna: (8 + 2) × (5 − 3)
3. Förenkla: 2/5 + 1/10
4. Beräkna: 3/4 × 2/3
5. Vad är 15% av 80?
6. Öka 50 med 30%

## Sammanfattning
- Det finns olika talområden: naturliga, hela, rationella, irrationella och reella tal
- De fyra räknesätten är addition, subtraktion, multiplikation och division
- Prioriteringsregler: Parenteser → Potenser → Multiplikation/Division → Addition/Subtraktion
- Bråk kan adderas, subtraheras, multipliceras och divideras med specifika regler
- Procent är ett sätt att uttrycka andelar av 100',
    1,
    90,
    NOW(),
    NOW()
  ) RETURNING id INTO lesson1_id;

  -- Lektion 2: Algebra och ekvationer
  INSERT INTO lessons (id, course_id, title, description, content, order_index, duration_minutes, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    mat1a_id,
    'Algebra och ekvationer',
    'Introduktion till algebra, variabler och lösning av enkla ekvationer',
    '# Algebra och ekvationer

## Vad är algebra?
Algebra är en gren av matematiken där vi använder bokstäver (variabler) för att representera okända tal. Detta gör det möjligt att lösa problem och beskriva samband på ett generellt sätt.

## Variabler
En variabel är en bokstav som representerar ett okänt tal. Vanliga variabler är x, y, z, a, b, c.

**Exempel:**
- x kan representera din ålder
- y kan representera priset på en vara
- t kan representera tid

## Algebraiska uttryck

Ett algebraiskt uttryck innehåller variabler, tal och räkneoperationer.

**Exempel:**
- 3x + 5
- 2y − 7
- x² + 2x + 1

### Termer
En term är en del av ett uttryck som är separerad med + eller −.

I uttrycket 3x + 5 − 2y finns tre termer:
- 3x (första termen)
- 5 (andra termen)
- −2y (tredje termen)

### Koefficient
Koefficienten är talet framför variabeln.

I termen 3x är 3 koefficienten.
I termen −2y är −2 koefficienten.

### Konstant
En konstant är ett tal utan variabel.

I uttrycket 3x + 5 är 5 en konstant.

## Förenkla uttryck

### Samla lika termer
Termer med samma variabel kan adderas eller subtraheras.

**Exempel 1:**
3x + 5x = 8x

**Exempel 2:**
7y − 2y + 3 = 5y + 3

**Exempel 3:**
2x + 3y + 4x − y = 6x + 2y

### Multiplicera in i parentes
När vi multiplicerar ett tal med en parentes multiplicerar vi talet med varje term i parentesen.

**Exempel 1:**
3(x + 2) = 3x + 6

**Exempel 2:**
−2(y − 4) = −2y + 8

**Exempel 3:**
5(2x + 3y − 1) = 10x + 15y − 5

### Bryta ut gemensam faktor
Motsatsen till att multiplicera in är att bryta ut.

**Exempel 1:**
6x + 9 = 3(2x + 3)

**Exempel 2:**
4y − 8 = 4(y − 2)

## Ekvationer

En ekvation är ett påstående att två uttryck är lika.

**Exempel:**
- x + 5 = 12
- 2y − 3 = 7
- 3(x + 1) = 15

### Lösning av ekvationer
Att lösa en ekvation betyder att hitta värdet på variabeln som gör ekvationen sann.

**Grundprincip:** Vad du gör på ena sidan måste du göra på andra sidan!

### Exempel 1: Enkel addition/subtraktion
Lös ekvationen: x + 5 = 12

**Lösning:**
x + 5 = 12
x + 5 − 5 = 12 − 5  (subtrahera 5 från båda sidor)
x = 7

**Kontroll:** 7 + 5 = 12 ✓

### Exempel 2: Enkel multiplikation/division
Lös ekvationen: 3x = 15

**Lösning:**
3x = 15
3x ÷ 3 = 15 ÷ 3  (dividera båda sidor med 3)
x = 5

**Kontroll:** 3 × 5 = 15 ✓

### Exempel 3: Flera steg
Lös ekvationen: 2x + 3 = 11

**Lösning:**
2x + 3 = 11
2x + 3 − 3 = 11 − 3  (subtrahera 3)
2x = 8
2x ÷ 2 = 8 ÷ 2  (dividera med 2)
x = 4

**Kontroll:** 2(4) + 3 = 8 + 3 = 11 ✓

### Exempel 4: Med parentes
Lös ekvationen: 3(x − 2) = 12

**Lösning:**
3(x − 2) = 12
3x − 6 = 12  (multiplicera in)
3x − 6 + 6 = 12 + 6  (addera 6)
3x = 18
x = 6

**Kontroll:** 3(6 − 2) = 3(4) = 12 ✓

### Exempel 5: Variabel på båda sidor
Lös ekvationen: 5x + 3 = 2x + 12

**Lösning:**
5x + 3 = 2x + 12
5x − 2x + 3 = 2x − 2x + 12  (subtrahera 2x)
3x + 3 = 12
3x + 3 − 3 = 12 − 3  (subtrahera 3)
3x = 9
x = 3

**Kontroll:** 5(3) + 3 = 18 och 2(3) + 12 = 18 ✓

## Problemlösning med ekvationer

### Exempel 1: Åldersproblem
Anna är 5 år äldre än Björn. Tillsammans är de 35 år. Hur gamla är de?

**Lösning:**
Låt x = Björns ålder
Då är x + 5 = Annas ålder

Ekvation: x + (x + 5) = 35
2x + 5 = 35
2x = 30
x = 15

**Svar:** Björn är 15 år, Anna är 20 år.

### Exempel 2: Prisproblem
En tröja kostar 200 kr efter 20% rabatt. Vad var ursprungspriset?

**Lösning:**
Låt x = ursprungspriset
Efter 20% rabatt betalar man 80% av priset.

Ekvation: 0.80x = 200
x = 200 ÷ 0.80
x = 250

**Svar:** Ursprungspriset var 250 kr.

## Formler

En formel är en ekvation som visar sambandet mellan olika storheter.

### Exempel: Rektangelns area
A = l × b

där:
- A = area
- l = längd
- b = bredd

Om vi vet arean och längden kan vi lösa ut bredden:
b = A ÷ l

## Övningsuppgifter

1. Förenkla: 5x + 3x − 2x
2. Förenkla: 3(x + 4) − 2x
3. Lös: x + 7 = 15
4. Lös: 4x = 28
5. Lös: 2x + 5 = 17
6. Lös: 3(x − 1) = 18
7. Lös: 4x + 2 = 2x + 10
8. Ett tal ökat med 7 är 23. Vilket är talet?

## Sammanfattning
- Algebra använder variabler (bokstäver) för att representera okända tal
- Algebraiska uttryck innehåller variabler, tal och operationer
- Vi kan förenkla uttryck genom att samla lika termer
- Ekvationer löses genom att isolera variabeln
- Vad vi gör på ena sidan måste vi göra på andra sidan
- Ekvationer kan användas för att lösa verkliga problem',
    2,
    90,
    NOW(),
    NOW()
  ) RETURNING id INTO lesson2_id;

  -- Lektion 3: Geometri - Grundläggande former
  INSERT INTO lessons (id, course_id, title, description, content, order_index, duration_minutes, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    mat1a_id,
    'Geometri - Grundläggande former',
    'Area och omkrets för rektanglar, trianglar och cirklar',
    '# Geometri - Grundläggande former

## Introduktion
Geometri är läran om former, storlekar och egenskaper hos figurer i planet och rummet. I denna lektion fokuserar vi på grundläggande tvådimensionella former.

## Grundläggande begrepp

### Punkt
En punkt har ingen storlek, bara en position. Betecknas ofta med en stor bokstav (A, B, C).

### Linje
En linje är oändligt lång och rak. Betecknas ofta med små bokstäver (l, m, n).

### Sträcka
En sträcka är den kortaste vägen mellan två punkter. Betecknas med två punkter, t.ex. AB.

### Vinkel
En vinkel bildas när två linjer möts. Mäts i grader (°).

**Vinkeltyper:**
- Spetsig vinkel: mindre än 90°
- Rät vinkel: exakt 90°
- Trubbig vinkel: mellan 90° och 180°
- Rak vinkel: exakt 180°

## Rektangel

En rektangel är en fyrhörning med fyra räta vinklar.

### Egenskaper
- Fyra räta vinklar (90°)
- Motstående sidor är lika långa och parallella
- Diagonalerna är lika långa och delar varandra mitt itu

### Omkrets
Omkretsen är summan av alla sidor.

**Formel:**
O = 2l + 2b = 2(l + b)

där l = längd och b = bredd

**Exempel:**
En rektangel har längden 8 cm och bredden 5 cm.
O = 2(8 + 5) = 2(13) = 26 cm

### Area
Arean är ytan som figuren täcker.

**Formel:**
A = l × b

**Exempel:**
En rektangel har längden 8 cm och bredden 5 cm.
A = 8 × 5 = 40 cm²

## Kvadrat

En kvadrat är en speciell rektangel där alla sidor är lika långa.

### Egenskaper
- Fyra räta vinklar
- Alla sidor är lika långa
- Diagonalerna är lika långa, står vinkelrätt mot varandra och delar varandra mitt itu

### Omkrets
**Formel:**
O = 4s

där s = sidans längd

**Exempel:**
En kvadrat har sidan 6 cm.
O = 4 × 6 = 24 cm

### Area
**Formel:**
A = s²

**Exempel:**
En kvadrat har sidan 6 cm.
A = 6² = 36 cm²

## Triangel

En triangel är en figur med tre hörn och tre sidor.

### Triangeltyper efter sidor
- **Liksidig triangel:** Alla sidor lika långa, alla vinklar 60°
- **Likbent triangel:** Två sidor lika långa
- **Oliksidig triangel:** Alla sidor olika långa

### Triangeltyper efter vinklar
- **Spetsvinklig:** Alla vinklar mindre än 90°
- **Rätvinklig:** En vinkel är 90°
- **Trubbvinklig:** En vinkel är större än 90°

### Vinkelsumma
Summan av alla vinklar i en triangel är alltid 180°.

**Exempel:**
Om två vinklar är 60° och 70°, vad är den tredje?
180° − 60° − 70° = 50°

### Omkrets
**Formel:**
O = a + b + c

där a, b, c är sidornas längder

**Exempel:**
En triangel har sidorna 3 cm, 4 cm och 5 cm.
O = 3 + 4 + 5 = 12 cm

### Area
**Formel:**
A = (b × h) / 2

där b = bas och h = höjd

**Exempel:**
En triangel har basen 8 cm och höjden 5 cm.
A = (8 × 5) / 2 = 40 / 2 = 20 cm²

## Cirkel

En cirkel är alla punkter som har samma avstånd till en mittpunkt.

### Begrepp
- **Radie (r):** Avståndet från mittpunkten till cirkeln
- **Diameter (d):** Avståndet tvärs över cirkeln genom mittpunkten, d = 2r
- **Pi (π):** En konstant ≈ 3.14159...

### Omkrets (Circumferens)
**Formel:**
O = 2πr = πd

**Exempel:**
En cirkel har radien 5 cm.
O = 2π × 5 = 10π ≈ 31.4 cm

### Area
**Formel:**
A = πr²

**Exempel:**
En cirkel har radien 5 cm.
A = π × 5² = 25π ≈ 78.5 cm²

## Sammansatta figurer

Ibland behöver vi beräkna area för figurer som består av flera grundformer.

### Exempel 1
Beräkna arean av en figur som består av en rektangel (6×4 cm) med en halvcirkel (radie 2 cm) ovanpå.

**Lösning:**
Area rektangel = 6 × 4 = 24 cm²
Area halvcirkel = (π × 2²) / 2 = 2π ≈ 6.28 cm²
Total area = 24 + 6.28 ≈ 30.28 cm²

### Exempel 2
Beräkna arean av en stor rektangel (10×8 cm) med ett rektangulärt hål (4×3 cm) i mitten.

**Lösning:**
Area stor rektangel = 10 × 8 = 80 cm²
Area hål = 4 × 3 = 12 cm²
Kvarvarande area = 80 − 12 = 68 cm²

## Enheter

### Längd
- mm (millimeter)
- cm (centimeter): 1 cm = 10 mm
- dm (decimeter): 1 dm = 10 cm
- m (meter): 1 m = 10 dm = 100 cm
- km (kilometer): 1 km = 1000 m

### Area
- mm² (kvadratmillimeter)
- cm² (kvadratcentimeter): 1 cm² = 100 mm²
- dm² (kvadratdecimeter): 1 dm² = 100 cm²
- m² (kvadratmeter): 1 m² = 100 dm²
- km² (kvadratkilometer): 1 km² = 1 000 000 m²

## Övningsuppgifter

1. En rektangel har längden 12 cm och bredden 7 cm. Beräkna omkrets och area.
2. En kvadrat har omkretsen 32 cm. Hur lång är sidan? Vad är arean?
3. En triangel har basen 10 cm och höjden 6 cm. Beräkna arean.
4. En cirkel har diametern 14 cm. Beräkna omkrets och area.
5. En triangel har vinklarna 45° och 65°. Hur stor är den tredje vinkeln?
6. Beräkna arean av en figur som består av en kvadrat (sida 8 cm) med en triangel (bas 8 cm, höjd 5 cm) ovanpå.

## Sammanfattning
- Rektangel: O = 2(l + b), A = l × b
- Kvadrat: O = 4s, A = s²
- Triangel: O = a + b + c, A = (b × h) / 2, vinkelsumma = 180°
- Cirkel: O = 2πr, A = πr²
- Sammansatta figurer beräknas genom att dela upp dem i grundformer',
    3,
    90,
    NOW(),
    NOW()
  ) RETURNING id INTO lesson3_id;

  -- Lägg till fler lektioner för Matematik 1a...
  -- (Fortsättning med funktioner, statistik, sannolikhet etc.)

  -- Skapa studyguides för Matematik 1a
  INSERT INTO study_guides (id, course_id, title, description, content, category, difficulty, estimated_time_minutes, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    mat1a_id,
    'Komplett guide till Matematik 1a',
    'En omfattande guide som täcker alla moment i kursen',
    '# Komplett guide till Matematik 1a

## Kursöversikt

Matematik 1a är en grundläggande kurs som ger dig de matematiska verktyg du behöver för vidare studier. Kursen är uppdelad i flera områden:

1. **Aritmetik och algebra** - Tal, räkning och ekvationer
2. **Geometri** - Former, area och volym
3. **Funktioner** - Linjära funktioner och grafer
4. **Sannolikhet och statistik** - Dataanalys och slumpförsök
5. **Problemlösning** - Tillämpa matematik i verkliga situationer

## Studietips

### Innan lektionen
- Läs igenom nästa avsnitt i boken
- Anteckna frågor du har
- Repetera tidigare moment

### Under lektionen
- Var aktiv och ställ frågor
- Gör anteckningar med egna ord
- Lös exempel tillsammans med läraren

### Efter lektionen
- Gör läxorna samma dag
- Repetera genom att förklara för någon annan
- Öva på extra uppgifter

## Viktiga formler att kunna

### Algebra
- Distributiva lagen: a(b + c) = ab + ac
- Kvadreringsreglerna: (a + b)² = a² + 2ab + b²
- Konjugatregeln: (a + b)(a − b) = a² − b²

### Geometri
- Rektangel: A = l × b, O = 2(l + b)
- Triangel: A = (b × h) / 2
- Cirkel: A = πr², O = 2πr

### Funktioner
- Linjär funktion: y = kx + m
- k = lutning (riktningskoefficient)
- m = skärning med y-axeln

## Vanliga misstag att undvika

1. **Glömma prioriteringsregler**
   - Fel: 5 + 3 × 2 = 16
   - Rätt: 5 + 3 × 2 = 11

2. **Teckenfel vid multiplikation**
   - Kom ihåg: minus × minus = plus

3. **Glömma att göra samma sak på båda sidor**
   - Vid ekvationslösning måste båda sidor behandlas lika

4. **Förväxla area och omkrets**
   - Area = yta (cm²)
   - Omkrets = runt om (cm)

## Förberedelse inför prov

### 2 veckor innan
- Gå igenom alla kapitel
- Lista områden du behöver öva mer på
- Gör gamla prov

### 1 vecka innan
- Fokusera på svåra områden
- Öva på problemlösning
- Repetera formler

### Dagen innan
- Lätt repetition
- Gå igenom formler
- Vila och sov gott

### Provdagen
- Ät frukost
- Kom i tid
- Läs igenom hela provet först
- Börja med det du kan bäst

## Resurser

### Böcker och material
- Läroboken och övningsboken
- Formelblad
- Gamla prov

### Digitala verktyg
- Räknare (godkänd modell)
- GeoGebra för geometri
- Wolfram Alpha för kontroll

### Hjälp och stöd
- Läraren på lektionstid
- Mattehjälp efter skolan
- Studiegrupper med klasskamrater

## Bedömning

Kursen bedöms med betygen F, E, D, C, B, A.

### För E krävs att du kan:
- Lösa enkla problem inom alla områden
- Använda grundläggande begrepp och metoder
- Föra enkla resonemang

### För C krävs att du kan:
- Lösa lite mer komplexa problem
- Välja och använda lämpliga metoder
- Föra utvecklade resonemang

### För A krävs att du kan:
- Lösa komplexa problem
- Anpassa och kombinera metoder
- Föra välutvecklade och nyanserade resonemang

## Avslutande råd

Matematik handlar om övning! Ju mer du övar, desto bättre blir du. Ge inte upp om något känns svårt - alla kan lära sig matematik med rätt inställning och tillräckligt med träning.

Lycka till!',
    'overview',
    'beginner',
    120,
    NOW(),
    NOW()
  );

  INSERT INTO study_guides (id, course_id, title, description, content, category, difficulty, estimated_time_minutes, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    mat1a_id,
    'Snabbguide: Ekvationslösning',
    'Steg-för-steg guide för att lösa olika typer av ekvationer',
    '# Snabbguide: Ekvationslösning

## Grundprincip
**Vad du gör på ena sidan måste du göra på andra sidan!**

## Typ 1: Enkel addition/subtraktion

### Exempel: x + 5 = 12
1. Subtrahera 5 från båda sidor
2. x = 7

### Exempel: x − 3 = 10
1. Addera 3 till båda sidor
2. x = 13

## Typ 2: Enkel multiplikation/division

### Exempel: 3x = 15
1. Dividera båda sidor med 3
2. x = 5

### Exempel: x/4 = 2
1. Multiplicera båda sidor med 4
2. x = 8

## Typ 3: Flera steg

### Exempel: 2x + 3 = 11
1. Subtrahera 3: 2x = 8
2. Dividera med 2: x = 4

### Exempel: 5x − 7 = 18
1. Addera 7: 5x = 25
2. Dividera med 5: x = 5

## Typ 4: Med parentes

### Exempel: 3(x + 2) = 18
**Metod 1: Multiplicera in**
1. 3x + 6 = 18
2. 3x = 12
3. x = 4

**Metod 2: Dividera först**
1. x + 2 = 6
2. x = 4

## Typ 5: Variabel på båda sidor

### Exempel: 5x + 3 = 2x + 12
1. Subtrahera 2x: 3x + 3 = 12
2. Subtrahera 3: 3x = 9
3. Dividera med 3: x = 3

## Typ 6: Med bråk

### Exempel: x/3 + 2 = 5
1. Subtrahera 2: x/3 = 3
2. Multiplicera med 3: x = 9

### Exempel: (2x + 1)/4 = 3
1. Multiplicera med 4: 2x + 1 = 12
2. Subtrahera 1: 2x = 11
3. Dividera med 2: x = 5.5

## Kontrollera alltid!
Sätt in ditt svar i ursprungsekvationen och kontrollera att det stämmer.

## Vanliga misstag
1. Glömma att göra samma sak på båda sidor
2. Teckenfel vid subtraktion av negativa tal
3. Glömma att multiplicera alla termer när man multiplicerar in i parentes

## Övning ger färdighet!
Lös minst 10 ekvationer av varje typ för att bli säker.',
    'quick_reference',
    'beginner',
    30,
    NOW(),
    NOW()
  );

END $$;

-- ============================================================================
-- SVENSKA 1 - GRUNDLÄGGANDE SVENSKA
-- ============================================================================

INSERT INTO courses (id, name, code, points, year, mandatory, category, program, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Svenska 1',
  'SVESVE01',
  100,
  1,
  true,
  'gymnasiegemensam',
  'Alla program',
  'Grundläggande svenskkurs som utvecklar din förmåga att läsa, skriva, tala och lyssna. Kursen behandlar skönlitteratur, sakprosa, språkets struktur och retorik.',
  NOW(),
  NOW()
);

-- Lägg till lektioner och studyguides för Svenska 1...

-- ============================================================================
-- ENGELSKA 5 - GRUNDLÄGGANDE ENGELSKA
-- ============================================================================

INSERT INTO courses (id, name, code, points, year, mandatory, category, program, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Engelska 5',
  'ENGENG05',
  100,
  1,
  true,
  'gymnasiegemensam',
  'Alla program',
  'Grundläggande engelskakurs som utvecklar din kommunikativa förmåga på engelska. Kursen behandlar muntlig och skriftlig kommunikation, läsförståelse och kulturella aspekter.',
  NOW(),
  NOW()
);

-- ============================================================================
-- HISTORIA 1A1 - GRUNDLÄGGANDE HISTORIA
-- ============================================================================

INSERT INTO courses (id, name, code, points, year, mandatory, category, program, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Historia 1a1',
  'HISHIS01a1',
  50,
  1,
  true,
  'gymnasiegemensam',
  'Alla program',
  'Grundläggande historiekurs som behandlar viktiga händelser och processer från forntid till nutid. Kursen utvecklar din historiska medvetenhet och källkritiska förmåga.',
  NOW(),
  NOW()
);

-- ============================================================================
-- SAMHÄLLSKUNSKAP 1A1 - GRUNDLÄGGANDE SAMHÄLLSKUNSKAP
-- ============================================================================

INSERT INTO courses (id, name, code, points, year, mandatory, category, program, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Samhällskunskap 1a1',
  'SAMSAM01a1',
  50,
  1,
  true,
  'gymnasiegemensam',
  'Alla program',
  'Grundläggande samhällskunskapskurs som behandlar demokrati, mänskliga rättigheter, ekonomi och samhällsfrågor. Kursen utvecklar din samhällsförståelse och kritiska tänkande.',
  NOW(),
  NOW()
);

-- ============================================================================
-- NATURKUNSKAP 1A1 - GRUNDLÄGGANDE NATURKUNSKAP
-- ============================================================================

INSERT INTO courses (id, name, code, points, year, mandatory, category, program, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Naturkunskap 1a1',
  'NAKNAK01a1',
  50,
  1,
  true,
  'gymnasiegemensam',
  'Alla program',
  'Grundläggande naturkunskapskurs som behandlar ekologi, evolution, energi och hållbar utveckling. Kursen ger dig en naturvetenskaplig grund och miljömedvetenhet.',
  NOW(),
  NOW()
);

-- ============================================================================
-- IDROTT OCH HÄLSA 1 - GRUNDLÄGGANDE IDROTT
-- ============================================================================

INSERT INTO courses (id, name, code, points, year, mandatory, category, program, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Idrott och hälsa 1',
  'IDRIDR01',
  100,
  1,
  true,
  'gymnasiegemensam',
  'Alla program',
  'Grundläggande kurs i idrott och hälsa som utvecklar din fysiska förmåga och hälsomedvetenhet. Kursen behandlar olika idrottsaktiviteter, träningslära och livsstilsfrågor.',
  NOW(),
  NOW()
);

-- ============================================================================
-- RELIGIONSKUNSKAP 1 - GRUNDLÄGGANDE RELIGIONSKUNSKAP
-- ============================================================================

INSERT INTO courses (id, name, code, points, year, mandatory, category, program, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Religionskunskap 1',
  'RELREL01',
  50,
  1,
  true,
  'gymnasiegemensam',
  'Alla program',
  'Grundläggande religionskunskapskurs som behandlar världsreligioner, etik och existentiella frågor. Kursen utvecklar din förståelse för olika livsåskådningar och värderingar.',
  NOW(),
  NOW()
);

-- ============================================================================
-- KOMMENTAR
-- ============================================================================
-- Detta är början på det kompletta kursinnehållet.
-- Nästa steg är att lägga till:
-- 1. Fler lektioner för varje kurs
-- 2. Fler studyguides
-- 3. Programspecifika kurser (Fysik, Kemi, Biologi, etc.)
-- 4. Studietips och studietekniker
-- ============================================================================
