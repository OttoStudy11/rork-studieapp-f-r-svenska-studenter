# Kursinnehåll - Prioriterad Lista

## Batch 1: Gymnasiegemensamma Obligatoriska (Alla program)
De mest kritiska kurserna som alla elever läser:

| # | Kurskod | Kursnamn | Poäng | Status |
|---|---------|----------|-------|--------|
| 1 | MATMAT01a | Matematik 1a | 100 | ✅ Klar |
| 2 | MATMAT01b | Matematik 1b | 100 | 🔄 Batch 1 |
| 3 | SVESVE01 | Svenska 1 | 100 | 🔄 Batch 1 |
| 4 | ENGENG05 | Engelska 5 | 100 | 🔄 Batch 1 |
| 5 | SVESVE02 | Svenska 2 | 100 | ⏳ Batch 2 |
| 6 | ENGENG06 | Engelska 6 | 100 | ⏳ Batch 2 |
| 7 | MATMAT02b | Matematik 2b | 100 | ⏳ Batch 2 |
| 8 | HISHIS01b | Historia 1b | 100 | ⏳ Batch 3 |
| 9 | SAMSAM01b | Samhällskunskap 1b | 100 | ⏳ Batch 3 |
| 10 | RELREL01 | Religionskunskap 1 | 50 | ⏳ Batch 3 |

## Batch 4-6: Naturvetenskapliga kurser
| # | Kurskod | Kursnamn | Poäng | Status |
|---|---------|----------|-------|--------|
| 11 | BIOBIO01 | Biologi 1 | 100 | ⏳ Batch 4 |
| 12 | FYSFYS01a | Fysik 1a | 150 | ⏳ Batch 4 |
| 13 | KEMKEM01 | Kemi 1 | 100 | ⏳ Batch 4 |
| 14 | BIOBIO02 | Biologi 2 | 100 | ⏳ Batch 5 |
| 15 | FYSFYS02 | Fysik 2 | 100 | ⏳ Batch 5 |
| 16 | KEMKEM02 | Kemi 2 | 100 | ⏳ Batch 5 |
| 17 | MATMAT03b | Matematik 3b | 100 | ⏳ Batch 6 |
| 18 | MATMAT04 | Matematik 4 | 100 | ⏳ Batch 6 |
| 19 | MATMAT05 | Matematik 5 | 100 | ⏳ Batch 6 |

## Batch 7-9: Samhällsvetenskapliga kurser
| # | Kurskod | Kursnamn | Poäng | Status |
|---|---------|----------|-------|--------|
| 20 | PSKPSY01 | Psykologi 1 | 50 | ⏳ Batch 7 |
| 21 | FILFIL01 | Filosofi 1 | 50 | ⏳ Batch 7 |
| 22 | GEOGEO01 | Geografi 1 | 100 | ⏳ Batch 7 |
| 23 | SAMSAM02 | Samhällskunskap 2 | 100 | ⏳ Batch 8 |
| 24 | HISHIS02a | Historia 2a | 100 | ⏳ Batch 8 |
| 25 | RELREL02 | Religionskunskap 2 | 50 | ⏳ Batch 8 |
| 26 | SAMSAM03 | Samhällskunskap 3 | 100 | ⏳ Batch 9 |
| 27 | PSKPSY02a | Psykologi 2a | 50 | ⏳ Batch 9 |
| 28 | SOCSOC01 | Sociologi | 100 | ⏳ Batch 9 |

## Batch 10-12: Ekonomiprogrammet
| # | Kurskod | Kursnamn | Poäng | Status |
|---|---------|----------|-------|--------|
| 29 | FÖRFÖR01 | Företagsekonomi 1 | 100 | ⏳ Batch 10 |
| 30 | JURJUR01 | Juridik 1 | 100 | ⏳ Batch 10 |
| 31 | ENTENT01 | Entreprenörskap | 100 | ⏳ Batch 10 |
| 32 | FÖRFÖR02 | Företagsekonomi 2 | 100 | ⏳ Batch 11 |
| 33 | JURJUR02 | Affärsjuridik | 100 | ⏳ Batch 11 |
| 34 | JURJUR03 | Rätten och samhället | 100 | ⏳ Batch 11 |

## Batch 13-15: Teknikprogrammet
| # | Kurskod | Kursnamn | Poäng | Status |
|---|---------|----------|-------|--------|
| 35 | TEKTEO01 | Teknik 1 | 150 | ⏳ Batch 13 |
| 36 | PRRPRR01 | Programmering 1 | 100 | ⏳ Batch 13 |
| 37 | PRRPRR02 | Programmering 2 | 100 | ⏳ Batch 13 |
| 38 | WEBWEB01 | Webbutveckling 1 | 100 | ⏳ Batch 14 |
| 39 | WEBWEB02 | Webbutveckling 2 | 100 | ⏳ Batch 14 |
| 40 | DAODAT01 | Dator- och nätverksteknik | 100 | ⏳ Batch 14 |

## Övriga prioriterade kurser
| # | Kurskod | Kursnamn | Poäng | Status |
|---|---------|----------|-------|--------|
| 41 | IDRIDR01 | Idrott och hälsa 1 | 100 | ⏳ Framtid |
| 42 | NAKNAK01a1 | Naturkunskap 1a1 | 50 | ⏳ Framtid |
| 43 | MODMOD | Moderna språk | 100 | ⏳ Framtid |
| 44 | SVESVE03 | Svenska 3 | 100 | ⏳ Framtid |

---

## SQL-filnamn struktur
Varje kurs får en egen SQL-fil:
- `course-content-KURSKOD.sql`

Exempel:
- `course-content-MATMAT01b.sql`
- `course-content-SVESVE01.sql`
- `course-content-ENGENG05.sql`

## Modulstruktur per kurs (mall)
Varje kurs bör ha 4-6 moduler med 3-5 lektioner per modul:
- Total: 15-25 lektioner per kurs
- Varje lektion: 30-90 minuter
- Inkludera: Teori, exempel, övningar, facit

## Status förklaring
- ✅ Klar - Implementerad i databasen
- 🔄 Pågående - Skapas just nu
- ⏳ Väntande - Planerad för framtida batch
