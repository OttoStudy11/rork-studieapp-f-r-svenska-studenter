-- ============================================================================
-- KOMPLETT KURSINNEHÅLL - ALLA GYMNASIEKURSER (KORRIGERAD VERSION)
-- ============================================================================
-- Detta script fyller databasen med detaljerat innehåll för alla kurser
-- inklusive lektioner, studyguides, tips och tekniker
-- ============================================================================

-- Rensa befintligt innehåll (använd rätt tabellnamn)
DELETE FROM course_lessons;
DELETE FROM study_guides;
DELETE FROM courses;

-- ============================================================================
-- MATEMATIK 1A - GRUNDLÄGGANDE MATEMATIK
-- ============================================================================

INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  'mat1a-uuid-001'::uuid,
  'Matematik 1a',
  'MATMAT01a',
  'Matematik',
  'gymnasium',
  100,
  'Grundläggande matematikkurs som behandlar algebra, geometri, funktioner och sannolikhet. Kursen ger dig de matematiska verktyg du behöver för vidare studier.',
  true,
  NOW(),
  NOW()
);

-- Lektioner för Matematik 1a
INSERT INTO course_lessons (id, course_id, title, description, content, lesson_type, difficulty_level, order_index, estimated_minutes, is_published, created_at, updated_at)
VALUES 
(
  gen_random_uuid(),
  'mat1a-uuid-001'::uuid,
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

**Exempel:**
- Temperatur (kan vara negativ)
- Kontobalans (kan vara negativ vid skuld)

### Rationella tal (ℚ)
Tal som kan skrivas som bråk a/b där a och b är hela tal och b ≠ 0.

**Exempel:**
- 1/2, 3/4, -2/5
- Alla heltal (t.ex. 5 = 5/1)
- Decimala tal som tar slut eller är periodiska (0.5, 0.333...)

### Irrationella tal
Tal som inte kan skrivas som bråk, med oändliga icke-periodiska decimaler.

**Exempel:**
- π (pi) ≈ 3.14159...
- √2 ≈ 1.41421...
- e ≈ 2.71828...

### Reella tal (ℝ)
Alla rationella och irrationella tal tillsammans.

## De fyra räknesätten

### Addition (+)
Att lägga ihop tal.
- 5 + 3 = 8
- (-2) + 7 = 5

### Subtraktion (-)
Att ta bort tal.
- 10 - 4 = 6
- 3 - 8 = -5

### Multiplikation (×)
Upprepad addition.
- 4 × 3 = 12 (samma som 4 + 4 + 4)
- (-2) × 5 = -10

### Division (÷)
Att dela upp i lika delar.
- 12 ÷ 3 = 4
- 15 ÷ 2 = 7.5

## Prioriteringsregler (PEMDAS)
1. **P**arenteser först
2. **E**xponenter (potenser)
3. **M**ultiplikation och **D**ivision (från vänster till höger)
4. **A**ddition och **S**ubtraktion (från vänster till höger)

**Exempel:**
- 2 + 3 × 4 = 2 + 12 = 14 (inte 20!)
- (2 + 3) × 4 = 5 × 4 = 20
- 10 - 2 × 3 + 4 = 10 - 6 + 4 = 8

## Övningar
1. Beräkna: 15 + 7 × 2
2. Beräkna: (8 - 3) × 4 + 2
3. Förenkla: 20 ÷ 4 + 3 × 2',
  'theory',
  'beginner',
  1,
  45,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'mat1a-uuid-001'::uuid,
  'Algebra och ekvationer',
  'Grundläggande algebra, variabler och linjära ekvationer',
  '# Algebra och ekvationer

## Vad är algebra?
Algebra är matematikens språk där vi använder bokstäver (variabler) för att representera okända tal.

## Variabler
En variabel är en bokstav som representerar ett tal vi inte känner till ännu.

**Exempel:**
- x, y, z är vanliga variabler
- I uttrycket 2x + 3, är x variabeln

## Algebraiska uttryck

### Termer
En term är en del av ett uttryck som är separerad med + eller -.

**Exempel i uttrycket 3x + 2y - 5:**
- 3x är en term
- 2y är en term
- -5 är en term

### Koefficient
Talet framför variabeln kallas koefficient.

**Exempel:**
- I 5x är 5 koefficienten
- I -3y är -3 koefficienten

### Konstant
Ett tal utan variabel kallas konstant.

**Exempel:**
- I uttrycket x + 7 är 7 en konstant

## Förenkla uttryck

### Samla lika termer
Termer med samma variabel kan adderas eller subtraheras.

**Exempel:**
- 3x + 5x = 8x
- 7y - 2y = 5y
- 4x + 3 + 2x - 1 = 6x + 2

## Linjära ekvationer

### Vad är en ekvation?
En ekvation är ett matematiskt påstående att två uttryck är lika.

**Exempel:**
- x + 5 = 12
- 2y - 3 = 7

### Lösa ekvationer
Målet är att få variabeln ensam på ena sidan.

**Grundregler:**
1. Gör samma sak på båda sidor
2. Använd motsatta operationer

**Exempel 1:**
x + 5 = 12
x + 5 - 5 = 12 - 5
x = 7

**Exempel 2:**
2x = 10
2x ÷ 2 = 10 ÷ 2
x = 5

**Exempel 3:**
3x + 4 = 19
3x + 4 - 4 = 19 - 4
3x = 15
x = 5

**Exempel 4:**
5x - 7 = 2x + 8
5x - 2x = 8 + 7
3x = 15
x = 5

## Kontrollera lösningen
Sätt in värdet i ursprungsekvationen.

**Exempel:**
Om x = 5 i ekvationen 3x + 4 = 19:
3(5) + 4 = 15 + 4 = 19 ✓

## Övningar
1. Förenkla: 5x + 3x - 2x
2. Lös: x + 8 = 15
3. Lös: 4x - 5 = 11
4. Lös: 2x + 7 = x + 12',
  'theory',
  'beginner',
  2,
  50,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'mat1a-uuid-001'::uuid,
  'Geometri - Grundläggande former',
  'Trianglar, fyrhörningar, cirklar och deras egenskaper',
  '# Geometri - Grundläggande former

## Introduktion
Geometri handlar om former, storlekar och egenskaper hos figurer i planet och rummet.

## Trianglar

### Definition
En triangel är en sluten figur med tre sidor och tre hörn (vinklar).

### Typer av trianglar

**Efter sidor:**
- **Liksidig triangel**: Alla tre sidor lika långa
- **Likbent triangel**: Två sidor lika långa
- **Oliksidig triangel**: Alla sidor olika långa

**Efter vinklar:**
- **Spetsvinklig**: Alla vinklar < 90°
- **Rätvinklig**: En vinkel = 90°
- **Trubbvinklig**: En vinkel > 90°

### Viktiga regler
- Summan av vinklarna i en triangel = 180°
- I en liksidig triangel är alla vinklar 60°

### Area och omkrets
- **Omkrets**: O = a + b + c (summan av alla sidor)
- **Area**: A = (bas × höjd) / 2

**Exempel:**
En triangel med bas 6 cm och höjd 4 cm:
A = (6 × 4) / 2 = 12 cm²

## Fyrhörningar

### Rektangel
- Fyra räta vinklar
- Motstående sidor lika långa
- **Omkrets**: O = 2(längd + bredd)
- **Area**: A = längd × bredd

**Exempel:**
Rektangel med längd 8 cm och bredd 5 cm:
- O = 2(8 + 5) = 26 cm
- A = 8 × 5 = 40 cm²

### Kvadrat
- Specialfall av rektangel
- Alla sidor lika långa
- Alla vinklar 90°
- **Omkrets**: O = 4 × sida
- **Area**: A = sida²

**Exempel:**
Kvadrat med sida 6 cm:
- O = 4 × 6 = 24 cm
- A = 6² = 36 cm²

### Parallellogram
- Motstående sidor parallella och lika långa
- Motstående vinklar lika stora
- **Area**: A = bas × höjd

### Trapets
- Ett par parallella sidor
- **Area**: A = ((a + b) / 2) × höjd
  där a och b är de parallella sidorna

## Cirklar

### Definition
En cirkel är alla punkter som ligger på samma avstånd från en mittpunkt.

### Viktiga begrepp
- **Radie (r)**: Avståndet från centrum till kanten
- **Diameter (d)**: Längsta sträckan genom cirkeln, d = 2r
- **Pi (π)**: Konstanten ≈ 3.14159...

### Formler
- **Omkrets**: O = 2πr = πd
- **Area**: A = πr²

**Exempel:**
Cirkel med radie 5 cm:
- O = 2π × 5 ≈ 31.4 cm
- A = π × 5² ≈ 78.5 cm²

## Pythagoras sats
I en rätvinklig triangel gäller:
a² + b² = c²

där c är hypotenusan (längsta sidan) och a, b är kateterna.

**Exempel:**
Rätvinklig triangel med kateter 3 cm och 4 cm:
c² = 3² + 4² = 9 + 16 = 25
c = √25 = 5 cm

## Övningar
1. Beräkna arean av en triangel med bas 10 cm och höjd 6 cm
2. En rektangel har omkretsen 30 cm och bredden 5 cm. Vad är längden?
3. Beräkna arean av en cirkel med diameter 12 cm
4. Använd Pythagoras sats för att hitta hypotenusan i en triangel med kateter 5 cm och 12 cm',
  'theory',
  'beginner',
  3,
  55,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'mat1a-uuid-001'::uuid,
  'Procent och proportioner',
  'Procenträkning, proportionalitet och förhållanden',
  '# Procent och proportioner

## Procent

### Vad är procent?
Procent betyder "per hundra" och skrivs med symbolen %.
- 50% = 50/100 = 0.5
- 25% = 25/100 = 0.25
- 100% = hela

### Omvandla mellan former

**Procent till decimal:**
Dela med 100
- 35% = 35/100 = 0.35
- 8% = 8/100 = 0.08

**Decimal till procent:**
Multiplicera med 100
- 0.75 = 75%
- 0.03 = 3%

**Procent till bråk:**
Skriv över 100 och förenkla
- 50% = 50/100 = 1/2
- 25% = 25/100 = 1/4

### Beräkna procent av ett tal

**Metod 1: Multiplicera med decimal**
30% av 200 = 0.30 × 200 = 60

**Metod 2: Använd bråk**
30% av 200 = (30/100) × 200 = 60

### Procentuell förändring

**Ökning:**
Nytt värde = Gammalt värde × (1 + procent/100)

**Exempel:**
Pris 500 kr ökar med 20%:
Nytt pris = 500 × 1.20 = 600 kr

**Minskning:**
Nytt värde = Gammalt värde × (1 - procent/100)

**Exempel:**
Pris 800 kr minskar med 15%:
Nytt pris = 800 × 0.85 = 680 kr

### Beräkna procentuell förändring
Procentuell förändring = ((Nytt - Gammalt) / Gammalt) × 100%

**Exempel:**
Från 50 till 65:
((65 - 50) / 50) × 100% = 30% ökning

## Proportioner

### Direkt proportionalitet
Två storheter är direkt proportionella om de ökar/minskar i samma takt.

**Exempel:**
Om 3 äpplen kostar 15 kr, vad kostar 5 äpplen?

Sätt upp proportion:
3/15 = 5/x
3x = 75
x = 25 kr

### Omvänd proportionalitet
När en storhet ökar, minskar den andra.

**Exempel:**
4 personer kan måla ett hus på 12 dagar. Hur lång tid tar det för 6 personer?

4 × 12 = 6 × x
48 = 6x
x = 8 dagar

## Förhållanden

### Vad är ett förhållande?
Ett förhållande jämför två eller flera storheter.

**Exempel:**
Förhållandet mellan pojkar och flickor i en klass är 3:2
Om det finns 15 pojkar, hur många flickor finns det?

3/2 = 15/x
3x = 30
x = 10 flickor

### Dela i förhållande

**Exempel:**
Dela 100 kr i förhållandet 2:3

Totalt antal delar = 2 + 3 = 5
En del = 100/5 = 20 kr
Första delen = 2 × 20 = 40 kr
Andra delen = 3 × 20 = 60 kr

## Praktiska tillämpningar

### Rabatter
En tröja kostar 400 kr med 30% rabatt:
Rabatt = 400 × 0.30 = 120 kr
Slutpris = 400 - 120 = 280 kr

Eller direkt:
Slutpris = 400 × 0.70 = 280 kr

### Moms
Pris utan moms 200 kr, moms 25%:
Moms = 200 × 0.25 = 50 kr
Totalpris = 200 + 50 = 250 kr

Eller direkt:
Totalpris = 200 × 1.25 = 250 kr

## Övningar
1. Beräkna 15% av 240
2. Ett pris ökar från 80 kr till 100 kr. Hur stor är den procentuella ökningen?
3. Om 5 böcker kostar 250 kr, vad kostar 8 böcker?
4. Dela 150 kr i förhållandet 2:3:5',
  'theory',
  'beginner',
  4,
  50,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'mat1a-uuid-001'::uuid,
  'Funktioner och grafer',
  'Introduktion till funktioner, koordinatsystem och linjära funktioner',
  '# Funktioner och grafer

## Koordinatsystem

### Kartesiskt koordinatsystem
Ett system med två axlar som möts i origo (0, 0).

**Komponenter:**
- **x-axel**: Horisontell axel (vågrätt)
- **y-axel**: Vertikal axel (lodrätt)
- **Origo**: Punkten (0, 0) där axlarna möts

### Rita punkter
En punkt skrivs som (x, y):
- x-värdet: hur långt åt höger/vänster
- y-värdet: hur långt upp/ner

**Exempel:**
- (3, 2): 3 steg höger, 2 steg upp
- (-2, 4): 2 steg vänster, 4 steg upp
- (0, -3): i origo horisontellt, 3 steg ner

## Funktioner

### Vad är en funktion?
En funktion är en regel som till varje x-värde (input) ger exakt ett y-värde (output).

**Notation:**
- f(x) = 2x + 3
- y = 2x + 3

### Funktionsvärde
Att beräkna f(x) för ett specifikt x.

**Exempel:**
Om f(x) = 2x + 3, beräkna f(4):
f(4) = 2(4) + 3 = 8 + 3 = 11

## Linjära funktioner

### Allmän form
y = kx + m

där:
- **k** = lutning (riktningskoefficient)
- **m** = y-intercept (skärning med y-axeln)

### Lutning (k)
Lutningen beskriver hur brant linjen är.

**Beräkna lutning från två punkter:**
k = (y₂ - y₁) / (x₂ - x₁)

**Exempel:**
Punkter (1, 2) och (3, 6):
k = (6 - 2) / (3 - 1) = 4/2 = 2

**Tolkning av k:**
- k > 0: Linjen stiger (går uppåt)
- k < 0: Linjen faller (går nedåt)
- k = 0: Horisontell linje
- Större |k|: Brantare linje

### Y-intercept (m)
Punkten där linjen skär y-axeln (när x = 0).

**Exempel:**
I funktionen y = 2x + 3:
- k = 2 (lutning)
- m = 3 (skär y-axeln vid (0, 3))

## Rita grafer

### Metod 1: Värdetabell
Välj x-värden och beräkna motsvarande y-värden.

**Exempel: y = 2x - 1**

| x  | y = 2x - 1 | (x, y) |
|----|------------|--------|
| -1 | -3         | (-1, -3)|
| 0  | -1         | (0, -1) |
| 1  | 1          | (1, 1)  |
| 2  | 3          | (2, 3)  |

Rita punkterna och dra en linje genom dem.

### Metod 2: Lutning och intercept
1. Rita m på y-axeln
2. Använd k för att hitta nästa punkt

**Exempel: y = 3x + 1**
1. Rita punkt (0, 1)
2. k = 3 = 3/1, så från (0, 1): 1 steg höger, 3 steg upp → (1, 4)
3. Dra linje genom punkterna

## Ekvationssystem

### Grafisk lösning
Skärningspunkten mellan två linjer är lösningen.

**Exempel:**
y = 2x + 1
y = -x + 4

Rita båda linjerna. Skärningspunkten är lösningen.

### Algebraisk lösning

**Substitutionsmetoden:**
2x + 1 = -x + 4
3x = 3
x = 1

y = 2(1) + 1 = 3

Lösning: (1, 3)

## Specialfall

### Horisontella linjer
y = c (konstant)
- Lutning k = 0
- Parallell med x-axeln

**Exempel:** y = 3

### Vertikala linjer
x = c (konstant)
- Odefinierad lutning
- Parallell med y-axeln
- Inte en funktion!

**Exempel:** x = 2

## Övningar
1. Rita punkterna (2, 3), (-1, 4), (0, -2) i ett koordinatsystem
2. Beräkna f(5) om f(x) = 3x - 7
3. Bestäm lutning och y-intercept för y = -2x + 5
4. Rita grafen för y = x + 2
5. Hitta skärningspunkten mellan y = x + 1 och y = -2x + 7',
  'theory',
  'intermediate',
  5,
  60,
  true,
  NOW(),
  NOW()
);

-- Study guides för Matematik 1a
INSERT INTO study_guides (id, course_id, title, description, content, guide_type, difficulty_level, estimated_read_time, is_published, created_at, updated_at)
VALUES
(
  gen_random_uuid(),
  'mat1a-uuid-001'::uuid,
  'Snabbguide: Prioriteringsregler',
  'En snabb referens för räkneordning',
  '# Prioriteringsregler - Snabbguide

## PEMDAS-regeln

1. **P**arenteser
2. **E**xponenter (potenser)
3. **M**ultiplikation och **D**ivision (vänster till höger)
4. **A**ddition och **S**ubtraktion (vänster till höger)

## Exempel

### Exempel 1
2 + 3 × 4
= 2 + 12
= 14

### Exempel 2
(2 + 3) × 4
= 5 × 4
= 20

### Exempel 3
10 - 2 × 3 + 4
= 10 - 6 + 4
= 8

## Tips
- Gör alltid parenteser först
- Multiplikation/division före addition/subtraktion
- Arbeta från vänster till höger vid samma prioritet',
  'cheatsheet',
  'beginner',
  5,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'mat1a-uuid-001'::uuid,
  'Formelsamling: Geometri',
  'Alla viktiga geometriformler på ett ställe',
  '# Geometri - Formelsamling

## Trianglar

### Omkrets
O = a + b + c

### Area
A = (bas × höjd) / 2

### Pythagoras sats
a² + b² = c²

### Vinkelsumma
Summan av vinklarna = 180°

## Fyrhörningar

### Rektangel
- Omkrets: O = 2(l + b)
- Area: A = l × b

### Kvadrat
- Omkrets: O = 4a
- Area: A = a²

### Parallellogram
- Area: A = bas × höjd

### Trapets
- Area: A = ((a + b) / 2) × h

## Cirklar

### Omkrets
O = 2πr = πd

### Area
A = πr²

### Viktigt
- d = 2r
- π ≈ 3.14159

## Volym (3D)

### Kub
V = a³

### Rätblock
V = l × b × h

### Cylinder
V = πr²h

### Sfär (klot)
V = (4/3)πr³',
  'cheatsheet',
  'beginner',
  10,
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- SVENSKA 1 - SPRÅK OCH KOMMUNIKATION
-- ============================================================================

INSERT INTO courses (id, title, course_code, subject, level, points, description, is_published, created_at, updated_at)
VALUES (
  'sve1-uuid-001'::uuid,
  'Svenska 1',
  'SVASVA01',
  'Svenska',
  'gymnasium',
  100,
  'Grundläggande svenskkurs som utvecklar din förmåga att läsa, skriva, tala och lyssna. Kursen behandlar textanalys, skrivande och muntlig framställning.',
  true,
  NOW(),
  NOW()
);

-- Lektioner för Svenska 1
INSERT INTO course_lessons (id, course_id, title, description, content, lesson_type, difficulty_level, order_index, estimated_minutes, is_published, created_at, updated_at)
VALUES 
(
  gen_random_uuid(),
  'sve1-uuid-001'::uuid,
  'Textanalys - Grunderna',
  'Lär dig analysera och tolka olika typer av texter',
  '# Textanalys - Grunderna

## Vad är textanalys?
Textanalys innebär att noggrant undersöka och tolka en text för att förstå dess budskap, syfte och uppbyggnad.

## Analysmodellen

### 1. Innehåll
**Vad handlar texten om?**
- Huvudtema
- Centrala händelser
- Viktiga personer/karaktärer

### 2. Syfte
**Varför är texten skriven?**
- Informera
- Underhålla
- Övertyga
- Beskriva

### 3. Mottagare
**Vem är texten riktad till?**
- Ålder
- Förkunskaper
- Intressen

### 4. Texttyp
**Vilken typ av text är det?**
- Skönlitterär (roman, novell, dikt)
- Sakprosa (artikel, debattinlägg, rapport)

## Språkliga verktyg

### Bildspråk
**Metafor**: Jämförelse utan "som"
- "Tiden är pengar"
- "Livet är en resa"

**Liknelse**: Jämförelse med "som" eller "liksom"
- "Stark som en björn"
- "Snabb som blixten"

**Personifikation**: Ge livlösa ting mänskliga egenskaper
- "Vinden viskade"
- "Solen log"

### Retoriska grepp
**Upprepning**: Upprepa ord eller fraser för effekt
- "Vi ska kämpa, vi ska vinna, vi ska lyckas"

**Kontrast**: Ställa motsatser mot varandra
- "Inte krig, utan fred"

**Retorisk fråga**: Fråga som inte kräver svar
- "Vem vill inte ha en bättre värld?"

## Struktur och uppbyggnad

### Inledning
- Fångar läsarens intresse
- Presenterar ämnet

### Mittdel
- Utvecklar innehållet
- Argument och exempel

### Avslutning
- Sammanfattar
- Ger slutsats eller poäng

## Analysera en text - Steg för steg

### Steg 1: Läs texten
Läs igenom hela texten minst två gånger.

### Steg 2: Identifiera
- Vad är huvudbudskapet?
- Vilka är nyckelorden?

### Steg 3: Undersök språket
- Vilka språkliga verktyg används?
- Hur påverkar de texten?

### Steg 4: Tolka
- Vad vill författaren säga?
- Hur uppnår författaren sitt syfte?

### Steg 5: Värdera
- Är texten övertygande?
- Fungerar språket väl?

## Exempel: Analysera en rubrik

**Rubrik**: "Skolan dödar kreativiteten"

**Analys**:
- **Språk**: Starkt ordval ("dödar")
- **Syfte**: Provocera och väcka uppmärksamhet
- **Effekt**: Får läsaren att vilja veta mer
- **Retoriskt grepp**: Överdrift för effekt

## Övningar
1. Välj en tidningsartikel och identifiera dess syfte
2. Hitta tre exempel på bildspråk i en text
3. Analysera strukturen i en debattartikel
4. Skriv en kort analys av en dikt',
  'theory',
  'beginner',
  1,
  50,
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'sve1-uuid-001'::uuid,
  'Skrivprocessen',
  'Från idé till färdig text - planera, skriva och revidera',
  '# Skrivprocessen

## Introduktion
Att skriva är en process som består av flera steg. Ingen skriver en perfekt text på första försöket!

## De fem faserna

### 1. Förarbete (Planering)

**Brainstorming**
- Skriv ner alla idéer
- Ingen censur i detta skede
- Använd tankekarta eller listor

**Avgränsa ämnet**
- Vad ska du fokusera på?
- Vad är viktigast?

**Samla material**
- Fakta och information
- Källor och referenser

**Disponera**
- Skapa en disposition
- Bestäm ordning på innehållet

### 2. Skriva första utkastet

**Tips för första utkastet:**
- Skriv utan att stanna upp
- Fokusera på innehåll, inte form
- Följ din disposition
- Låt texten flöda

**Kom ihåg:**
- Det behöver inte vara perfekt
- Du kan ändra senare
- Huvudsaken är att få ner ord på papper

### 3. Vila

**Varför vila?**
- Få distans till texten
- Se den med nya ögon
- Upptäcka brister lättare

**Hur länge?**
- Minst några timmar
- Helst över natten
- Längre för viktiga texter

### 4. Revidera

**Innehåll och struktur:**
- Är budskapet tydligt?
- Är ordningen logisk?
- Saknas något viktigt?
- Finns överflödigt material?

**Stycken:**
- Ett stycke = en tanke
- Tydliga övergångar
- Lagom längd

**Meningar:**
- Variera meningslängd
- Undvik för långa meningar
- Kontrollera att de är kompletta

### 5. Korrekturläsa

**Språk och stil:**
- Stavning
- Grammatik
- Interpunktion
- Ordval

**Tips för korrekturläsning:**
- Läs högt
- Läs baklänges (för stavning)
- Använd stavningskontroll
- Låt någon annan läsa

## Olika texttyper

### Berättande text
**Syfte**: Underhålla, berätta en historia

**Struktur**:
- Inledning (situation, personer)
- Händelseförlopp (konflikt, klimax)
- Avslutning (lösning)

### Beskrivande text
**Syfte**: Ge en bild av något

**Fokus**:
- Sinnesintryck
- Detaljer
- Bildspråk

### Argumenterande text
**Syfte**: Övertyga läsaren

**Struktur**:
- Tes (påstående)
- Argument (med bevis)
- Motargument (bemöt invändningar)
- Slutsats

### Utredande text
**Syfte**: Informera och förklara

**Struktur**:
- Frågeställning
- Bakgrund
- Analys
- Slutsats

## Skrivtips

### Inledningen
- Fånga läsarens intresse
- Var konkret
- Undvik klichéer

**Bra inledningar:**
- Ställ en fråga
- Berätta en anekdot
- Ge en överraskande fakta
- Måla upp en scen

### Mittdelen
- En tanke per stycke
- Använd exempel
- Variera meningslängd
- Använd kopplingsord

**Kopplingsord:**
- Därför, således, följaktligen
- Dessutom, vidare, även
- Däremot, å andra sidan, men
- Till exempel, såsom, exempelvis

### Avslutningen
- Sammanfatta huvudpunkterna
- Ge en slutsats
- Lämna läsaren med något att tänka på
- Knyt an till inledningen

## Vanliga misstag att undvika

### Innehåll
- För brett ämne
- Otydligt budskap
- Saknar röd tråd

### Språk
- För långa meningar
- Upprepningar
- Fel ordföljd
- Slarvfel

### Struktur
- Dåliga övergångar
- Obalanserade stycken
- Svag inledning eller avslutning

## Checklista

**Innan du lämnar in:**
- [ ] Har jag följt uppgiften?
- [ ] Är budskapet tydligt?
- [ ] Är strukturen logisk?
- [ ] Har jag varierat språket?
- [ ] Har jag korrekturläst?
- [ ] Har jag källor (om det krävs)?
- [ ] Är formateringen korrekt?

## Övningar
1. Skriv tre olika inledningar till samma text
2. Ta en text och förbättra övergångarna mellan stycken
3. Korrekturläs en klasskamrats text
4. Skriv om en text från en texttyp till en annan',
  'theory',
  'beginner',
  2,
  55,
  true,
  NOW(),
  NOW()
);

-- Study guide för Svenska 1
INSERT INTO study_guides (id, course_id, title, description, content, guide_type, difficulty_level, estimated_read_time, is_published, created_at, updated_at)
VALUES
(
  gen_random_uuid(),
  'sve1-uuid-001'::uuid,
  'Språkliga verktyg - Snabbguide',
  'Översikt över viktiga språkliga verktyg',
  '# Språkliga verktyg - Snabbguide

## Bildspråk

### Metafor
Jämförelse utan "som"
- Tiden är pengar
- Livet är en resa

### Liknelse
Jämförelse med "som"
- Stark som en björn
- Snabb som blixten

### Personifikation
Livlösa ting får mänskliga egenskaper
- Vinden viskade
- Solen log

## Retoriska grepp

### Upprepning
Upprepa för effekt
- Vi ska kämpa, vi ska vinna

### Kontrast
Ställ motsatser mot varandra
- Inte krig, utan fred

### Retorisk fråga
Fråga som inte kräver svar
- Vem vill inte ha fred?

### Tre-regeln
Tre exempel eller argument
- Snabb, stark och smart

## Stilfigurer

### Allitteration
Samma bokstav i början
- Stora starka soldater

### Överdrift (Hyperbol)
Överdriven beskrivning
- Jag har sagt det tusen gånger

### Underdrift (Litotes)
Nedtona genom negation
- Inte helt fel (= rätt bra)

## Användning

**När?**
- Göra texten mer levande
- Skapa känslor
- Övertyga läsaren
- Göra texten minnesvärd',
  'cheatsheet',
  'beginner',
  8,
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- KLART!
-- ============================================================================
-- Databasen innehåller nu:
-- - 2 kurser (Matematik 1a, Svenska 1)
-- - 7 lektioner totalt
-- - 3 study guides
-- ============================================================================
