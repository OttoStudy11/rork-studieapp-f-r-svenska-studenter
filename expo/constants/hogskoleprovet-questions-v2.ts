// HP Question Bank V2 — expanded question set with topic metadata
// Every question is tagged with topic, difficulty and dateAdded so the bank
// can be filtered, analyzed and merged with questions imported from Supabase.

import { HPQuestion } from './hogskoleprovet';

const D = '2026-08-24';

export const HP_QUESTIONS_V2: HPQuestion[] = [
  // =====================================================
  // ORD — Ordförståelse
  // =====================================================
  {
    id: 'v2-ord-1', sectionCode: 'ORD', questionNumber: 1, questionType: 'multiple_choice',
    questionText: 'Vad betyder "ackumulera"?',
    options: ['Fördela', 'Samla på hög', 'Förbruka', 'Beräkna'],
    correctAnswer: 'Samla på hög',
    explanation: 'Ackumulera betyder att samla eller lagra över tid, från latinets accumulare.',
    difficulty: 'easy', topic: 'främmande ord', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-ord-2', sectionCode: 'ORD', questionNumber: 2, questionType: 'multiple_choice',
    questionText: 'Vad betyder "dikotomi"?',
    options: ['Tudelning', 'Sammanslagning', 'Upprepning', 'Motsägelse'],
    correctAnswer: 'Tudelning',
    explanation: 'Dikotomi är en uppdelning i två skilda, ofta motsatta, delar (grekiska dicha = itu, tomia = skärning).',
    difficulty: 'hard', topic: 'grekiska rötter', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-ord-3', sectionCode: 'ORD', questionNumber: 3, questionType: 'multiple_choice',
    questionText: 'Vilket ord är en synonym till "nonchalant"?',
    options: ['Omsorgsfull', 'Likgiltig', 'Blyg', 'Aggressiv'],
    correctAnswer: 'Likgiltig',
    explanation: 'Nonchalant beskriver en vårdslös eller likgiltig attityd.',
    difficulty: 'easy', topic: 'synonymer', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-ord-4', sectionCode: 'ORD', questionNumber: 4, questionType: 'multiple_choice',
    questionText: 'Vad betyder "implicit"?',
    options: ['Uttryckligen angiven', 'Underförstådd', 'Omöjlig', 'Komplicerad'],
    correctAnswer: 'Underförstådd',
    explanation: 'Implicit betyder underförstådd — motsatsen är explicit, som betyder uttrycklig.',
    difficulty: 'medium', topic: 'främmande ord', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-ord-5', sectionCode: 'ORD', questionNumber: 5, questionType: 'multiple_choice',
    questionText: 'Vad betyder "gagna"?',
    options: ['Skada', 'Vara till nytta för', 'Ignorera', 'Utmana'],
    correctAnswer: 'Vara till nytta för',
    explanation: 'Gagna betyder att vara till fördel eller nytta för någon eller något.',
    difficulty: 'easy', topic: 'svenska ord', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-ord-6', sectionCode: 'ORD', questionNumber: 6, questionType: 'multiple_choice',
    questionText: 'Vad betyder "ambivalent"?',
    options: ['Beslutsam', 'Kluven', 'Entusiastisk', 'Ointresserad'],
    correctAnswer: 'Kluven',
    explanation: 'Ambivalent betyder att ha motstridiga känslor samtidigt — att vara kluven.',
    difficulty: 'medium', topic: 'latinska rötter', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-ord-7', sectionCode: 'ORD', questionNumber: 7, questionType: 'multiple_choice',
    questionText: 'Vad betyder "konsensus"?',
    options: ['Konflikt', 'Enighet', 'Omröstning', 'Kompromiss'],
    correctAnswer: 'Enighet',
    explanation: 'Konsensus betyder samstämmighet eller bred enighet i en grupp.',
    difficulty: 'easy', topic: 'latinska rötter', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-ord-8', sectionCode: 'ORD', questionNumber: 8, questionType: 'multiple_choice',
    questionText: 'Vad betyder "obstinat"?',
    options: ['Envis och trotsig', 'Lydig', 'Osäker', 'Otydlig'],
    correctAnswer: 'Envis och trotsig',
    explanation: 'Obstinat beskriver någon som är envist motsträvig eller trotsig.',
    difficulty: 'hard', topic: 'främmande ord', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-ord-9', sectionCode: 'ORD', questionNumber: 9, questionType: 'multiple_choice',
    questionText: 'Vad betyder "paradigm"?',
    options: ['Undantag', 'Tankemönster eller förebild', 'Bevis', 'Slutsats'],
    correctAnswer: 'Tankemönster eller förebild',
    explanation: 'Ett paradigm är ett rådande tankemönster eller mönsterbildande exempel inom ett område.',
    difficulty: 'medium', topic: 'grekiska rötter', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-ord-10', sectionCode: 'ORD', questionNumber: 10, questionType: 'multiple_choice',
    questionText: 'Vad betyder "försumlig"?',
    options: ['Noggrann', 'Slarvig med sina skyldigheter', 'Generös', 'Snabbtänkt'],
    correctAnswer: 'Slarvig med sina skyldigheter',
    explanation: 'Försumlig betyder vårdslös eller slarvig, särskilt när det gäller plikter och ansvar.',
    difficulty: 'medium', topic: 'svenska ord', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-ord-11', sectionCode: 'ORD', questionNumber: 11, questionType: 'multiple_choice',
    questionText: 'Vad betyder "eklektisk"?',
    options: ['Enhetlig', 'Som blandar från olika källor', 'Elektronisk', 'Föråldrad'],
    correctAnswer: 'Som blandar från olika källor',
    explanation: 'Eklektisk beskriver något som väljer och blandar det bästa från olika stilar eller källor.',
    difficulty: 'hard', topic: 'grekiska rötter', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-ord-12', sectionCode: 'ORD', questionNumber: 12, questionType: 'multiple_choice',
    questionText: 'Vilket ord är en antonym till "frekvent"?',
    options: ['Ofta förekommande', 'Sällsynt', 'Regelbunden', 'Upprepad'],
    correctAnswer: 'Sällsynt',
    explanation: 'Frekvent betyder ofta förekommande; motsatsen är sällsynt.',
    difficulty: 'easy', topic: 'antonymer', dateAdded: D, source: 'local',
  },

  // =====================================================
  // MEK — Meningskomplettering
  // =====================================================
  {
    id: 'v2-mek-1', sectionCode: 'MEK', questionNumber: 1, questionType: 'multiple_choice',
    questionText: 'Trots att rapporten var ____ valde styrelsen att fatta beslut utan att läsa den i sin helhet.',
    options: ['kortfattad', 'omfattande', 'obetydlig', 'försenad'],
    correctAnswer: 'omfattande',
    explanation: '"Trots att" signalerar kontrast: rapporten var omfattande, ändå lästes den inte i sin helhet.',
    difficulty: 'medium', topic: 'kontrastord', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-mek-2', sectionCode: 'MEK', questionNumber: 2, questionType: 'multiple_choice',
    questionText: 'Forskarens resultat var så ____ att flera oberoende grupper genast försökte ____ studien.',
    options: ['uppseendeväckande – replikera', 'triviala – avfärda', 'otydliga – publicera', 'väntade – kritisera'],
    correctAnswer: 'uppseendeväckande – replikera',
    explanation: 'Uppseendeväckande resultat leder naturligt till att andra forskare vill upprepa (replikera) studien.',
    difficulty: 'medium', topic: 'dubbelluckor', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-mek-3', sectionCode: 'MEK', questionNumber: 3, questionType: 'multiple_choice',
    questionText: 'Kommunens budget var ansträngd; ____ beslutade fullmäktige att skjuta upp renoveringen.',
    options: ['däremot', 'följaktligen', 'emellertid', 'trots detta'],
    correctAnswer: 'följaktligen',
    explanation: 'Den andra satsen är en logisk följd av den första — "följaktligen" markerar konsekvens.',
    difficulty: 'easy', topic: 'sambandsord', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-mek-4', sectionCode: 'MEK', questionNumber: 4, questionType: 'multiple_choice',
    questionText: 'Hennes argumentation var visserligen ____, men den saknade helt ____ i empirisk forskning.',
    options: ['elegant – förankring', 'rörig – struktur', 'kortfattad – längd', 'ologisk – brister'],
    correctAnswer: 'elegant – förankring',
    explanation: '"Visserligen … men" kräver något positivt följt av en brist: elegant men utan empirisk förankring.',
    difficulty: 'hard', topic: 'dubbelluckor', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-mek-5', sectionCode: 'MEK', questionNumber: 5, questionType: 'multiple_choice',
    questionText: 'Det nya vaccinet visade sig vara ____ mot samtliga kända varianter av viruset.',
    options: ['verksamt', 'känsligt', 'skadligt', 'beroende'],
    correctAnswer: 'verksamt',
    explanation: 'Ett vaccin som fungerar mot varianter beskrivs som verksamt (effektivt).',
    difficulty: 'easy', topic: 'ordval', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-mek-6', sectionCode: 'MEK', questionNumber: 6, questionType: 'multiple_choice',
    questionText: 'Journalisten anklagades för att ha ____ källor och därmed ____ tidningens trovärdighet.',
    options: ['fabricerat – undergrävt', 'citerat – stärkt', 'granskat – förbättrat', 'skyddat – ökat'],
    correctAnswer: 'fabricerat – undergrävt',
    explanation: 'En anklagelse handlar om något negativt: fabricerade källor undergräver trovärdigheten.',
    difficulty: 'medium', topic: 'dubbelluckor', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-mek-7', sectionCode: 'MEK', questionNumber: 7, questionType: 'multiple_choice',
    questionText: 'Även de mest ____ kritikerna fick medge att föreställningen höll hög klass.',
    options: ['välvilliga', 'oförsonliga', 'entusiastiska', 'okunniga'],
    correctAnswer: 'oförsonliga',
    explanation: '"Även de mest … fick medge" pekar på motvilliga kritiker — de oförsonliga.',
    difficulty: 'medium', topic: 'kontrastord', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-mek-8', sectionCode: 'MEK', questionNumber: 8, questionType: 'multiple_choice',
    questionText: 'Arkeologernas fynd ____ den tidigare uppfattningen om när området först befolkades.',
    options: ['bekräftade', 'omkullkastade', 'upprepade', 'fördröjde'],
    correctAnswer: 'omkullkastade',
    explanation: 'Nya fynd som ändrar historieskrivningen sägs omkullkasta tidigare uppfattningar.',
    difficulty: 'hard', topic: 'ordval', dateAdded: D, source: 'local',
  },

  // =====================================================
  // LÄS — Läsförståelse
  // =====================================================
  {
    id: 'v2-las-1', sectionCode: 'LÄS', questionNumber: 1, questionType: 'reading_comprehension',
    readingPassage: 'Urbaniseringen i Sverige har under det senaste seklet förändrat landets demografi i grunden. Medan över hälften av befolkningen vid 1900-talets början bodde på landsbygden, lever i dag nästan nio av tio svenskar i tätorter. Denna omflyttning har inte skett i jämn takt: efterkrigstidens rekordår innebar en särskilt snabb inflyttning till städerna, driven av industrins expansion. Samtidigt pekar forskare på att bilden av en total landsbygdsflykt är förenklad. Många mindre orter i storstädernas närhet växer i dag snabbare än städerna själva, ett fenomen som ibland kallas kontraurbanisering.',
    questionText: 'Vad menar författaren med att bilden av en total landsbygdsflykt är "förenklad"?',
    options: [
      'Att urbaniseringen aldrig har ägt rum',
      'Att vissa orter utanför städerna faktiskt växer snabbt',
      'Att statistiken över tätorter är felaktig',
      'Att industrin inte påverkade inflyttningen',
    ],
    correctAnswer: 'Att vissa orter utanför städerna faktiskt växer snabbt',
    explanation: 'Texten lyfter kontraurbanisering: orter nära storstäder växer snabbare än städerna, vilket nyanserar bilden.',
    difficulty: 'medium', topic: 'sakprosa', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-las-2', sectionCode: 'LÄS', questionNumber: 2, questionType: 'reading_comprehension',
    readingPassage: 'Urbaniseringen i Sverige har under det senaste seklet förändrat landets demografi i grunden. Medan över hälften av befolkningen vid 1900-talets början bodde på landsbygden, lever i dag nästan nio av tio svenskar i tätorter. Denna omflyttning har inte skett i jämn takt: efterkrigstidens rekordår innebar en särskilt snabb inflyttning till städerna, driven av industrins expansion. Samtidigt pekar forskare på att bilden av en total landsbygdsflykt är förenklad. Många mindre orter i storstädernas närhet växer i dag snabbare än städerna själva, ett fenomen som ibland kallas kontraurbanisering.',
    questionText: 'Vilken faktor anges som drivkraft bakom efterkrigstidens snabba urbanisering?',
    options: ['Jordbrukets mekanisering', 'Industrins expansion', 'Bostadsbristen på landsbygden', 'Statliga flyttbidrag'],
    correctAnswer: 'Industrins expansion',
    explanation: 'Texten anger uttryckligen att inflyttningen drevs av industrins expansion under rekordåren.',
    difficulty: 'easy', topic: 'sakprosa', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-las-3', sectionCode: 'LÄS', questionNumber: 3, questionType: 'reading_comprehension',
    readingPassage: 'Sömnforskningen har på senare år alltmer intresserat sig för sömnens betydelse för minneskonsolidering. Under djupsömnen tycks hjärnan "spela upp" dagens intryck och flytta information från korttidsminnet i hippocampus till mer permanenta lagringsplatser i hjärnbarken. Studier visar att personer som sover efter inlärning presterar bättre på minnestester än de som hålls vakna, även när tiden som förflutit är densamma. Detta har lett vissa forskare till slutsatsen att sömn inte bör betraktas som ett passivt vilotillstånd utan som en aktiv del av inlärningsprocessen.',
    questionText: 'Vilken är textens huvudsakliga slutsats?',
    options: [
      'Sömn är en aktiv del av inlärningen, inte bara vila',
      'Hippocampus är hjärnans viktigaste del',
      'Minnestester är opålitliga utan sömn',
      'Korttidsminnet försvinner alltid under sömn',
    ],
    correctAnswer: 'Sömn är en aktiv del av inlärningen, inte bara vila',
    explanation: 'Textens avslutande mening formulerar huvudtesen: sömn är en aktiv del av inlärningsprocessen.',
    difficulty: 'medium', topic: 'vetenskaplig text', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-las-4', sectionCode: 'LÄS', questionNumber: 4, questionType: 'reading_comprehension',
    readingPassage: 'Sömnforskningen har på senare år alltmer intresserat sig för sömnens betydelse för minneskonsolidering. Under djupsömnen tycks hjärnan "spela upp" dagens intryck och flytta information från korttidsminnet i hippocampus till mer permanenta lagringsplatser i hjärnbarken. Studier visar att personer som sover efter inlärning presterar bättre på minnestester än de som hålls vakna, även när tiden som förflutit är densamma. Detta har lett vissa forskare till slutsatsen att sömn inte bör betraktas som ett passivt vilotillstånd utan som en aktiv del av inlärningsprocessen.',
    questionText: 'Vad innebär "minneskonsolidering" enligt texten?',
    options: [
      'Att glömma oviktig information',
      'Att information flyttas till mer permanent lagring',
      'Att korttidsminnet förstärks under vakenhet',
      'Att hjärnbarken raderar intryck',
    ],
    correctAnswer: 'Att information flyttas till mer permanent lagring',
    explanation: 'Texten beskriver hur intryck flyttas från hippocampus till permanenta lagringsplatser i hjärnbarken.',
    difficulty: 'easy', topic: 'vetenskaplig text', dateAdded: D, source: 'local',
  },

  // =====================================================
  // ELF — Engelsk läsförståelse
  // =====================================================
  {
    id: 'v2-elf-1', sectionCode: 'ELF', questionNumber: 1, questionType: 'reading_comprehension',
    readingPassage: 'The rise of remote work has forced companies to reconsider what an office is actually for. Rather than rows of desks occupied five days a week, many firms now treat their headquarters as a hub for collaboration: a place employees visit for workshops, team-building and creative sessions, while routine tasks are completed at home. Critics argue that this hybrid model erodes company culture and mentorship, particularly for younger employees. Proponents counter that flexibility widens the talent pool and that culture depends on trust rather than physical presence.',
    questionText: 'According to the passage, what do proponents of hybrid work believe about company culture?',
    options: [
      'It requires daily physical presence',
      'It is built on trust rather than being in the office',
      'It matters mostly to younger employees',
      'It cannot survive remote work',
    ],
    correctAnswer: 'It is built on trust rather than being in the office',
    explanation: 'The final sentence states that proponents believe culture depends on trust rather than physical presence.',
    difficulty: 'medium', topic: 'argumentative text', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-elf-2', sectionCode: 'ELF', questionNumber: 2, questionType: 'reading_comprehension',
    readingPassage: 'The rise of remote work has forced companies to reconsider what an office is actually for. Rather than rows of desks occupied five days a week, many firms now treat their headquarters as a hub for collaboration: a place employees visit for workshops, team-building and creative sessions, while routine tasks are completed at home. Critics argue that this hybrid model erodes company culture and mentorship, particularly for younger employees. Proponents counter that flexibility widens the talent pool and that culture depends on trust rather than physical presence.',
    questionText: 'The word "erodes" in the passage is closest in meaning to:',
    options: ['strengthens', 'gradually weakens', 'replaces', 'defines'],
    correctAnswer: 'gradually weakens',
    explanation: 'To erode means to wear away or weaken gradually.',
    difficulty: 'easy', topic: 'vocabulary in context', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-elf-3', sectionCode: 'ELF', questionNumber: 3, questionType: 'reading_comprehension',
    readingPassage: 'For decades, the Antarctic ice sheet was considered too vast and too cold to respond quickly to global warming. Recent satellite measurements have challenged that assumption. Glaciers in West Antarctica are thinning at an accelerating rate, and some researchers fear that a threshold may already have been crossed beyond which retreat becomes self-sustaining. While the timescale of a potential collapse is measured in centuries rather than years, the implications for global sea levels are profound, since the West Antarctic ice sheet alone holds enough ice to raise oceans by several metres.',
    questionText: 'What assumption have recent satellite measurements challenged?',
    options: [
      'That sea levels are rising slowly',
      'That the Antarctic ice sheet reacts slowly to warming',
      'That West Antarctica has little ice',
      'That glacier retreat is impossible to measure',
    ],
    correctAnswer: 'That the Antarctic ice sheet reacts slowly to warming',
    explanation: 'The passage says the ice sheet was "considered too vast and too cold to respond quickly" — an assumption now challenged.',
    difficulty: 'medium', topic: 'scientific text', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-elf-4', sectionCode: 'ELF', questionNumber: 4, questionType: 'reading_comprehension',
    readingPassage: 'For decades, the Antarctic ice sheet was considered too vast and too cold to respond quickly to global warming. Recent satellite measurements have challenged that assumption. Glaciers in West Antarctica are thinning at an accelerating rate, and some researchers fear that a threshold may already have been crossed beyond which retreat becomes self-sustaining. While the timescale of a potential collapse is measured in centuries rather than years, the implications for global sea levels are profound, since the West Antarctic ice sheet alone holds enough ice to raise oceans by several metres.',
    questionText: 'What does "self-sustaining" imply about the glacier retreat?',
    options: [
      'It will stop without human intervention',
      'It would continue even if warming stopped',
      'It only occurs during summer months',
      'It is caused by satellite measurements',
    ],
    correctAnswer: 'It would continue even if warming stopped',
    explanation: 'A self-sustaining process feeds itself — the retreat would continue on its own once the threshold is crossed.',
    difficulty: 'hard', topic: 'vocabulary in context', dateAdded: D, source: 'local',
  },

  // =====================================================
  // XYZ — Matematisk problemlösning
  // =====================================================
  {
    id: 'v2-xyz-1', sectionCode: 'XYZ', questionNumber: 1, questionType: 'multiple_choice',
    questionText: 'Om 3x − 7 = 14, vad är x?',
    options: ['3', '7', '21/3', '7/3'],
    correctAnswer: '7',
    explanation: '3x = 21 ger x = 7.',
    difficulty: 'easy', topic: 'algebra', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-xyz-2', sectionCode: 'XYZ', questionNumber: 2, questionType: 'multiple_choice',
    questionText: 'En vara kostar 480 kr efter en prissänkning med 20 %. Vad var priset före sänkningen?',
    options: ['576 kr', '600 kr', '560 kr', '620 kr'],
    correctAnswer: '600 kr',
    explanation: '480 kr motsvarar 80 % av ursprungspriset: 480/0,8 = 600 kr.',
    difficulty: 'medium', topic: 'procent', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-xyz-3', sectionCode: 'XYZ', questionNumber: 3, questionType: 'multiple_choice',
    questionText: 'En rektangel har omkretsen 28 cm och längden 8 cm. Vad är arean?',
    options: ['48 cm²', '40 cm²', '56 cm²', '32 cm²'],
    correctAnswer: '48 cm²',
    explanation: 'Omkrets 28 ⇒ längd + bredd = 14 ⇒ bredd = 6. Area = 8 × 6 = 48 cm².',
    difficulty: 'easy', topic: 'geometri', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-xyz-4', sectionCode: 'XYZ', questionNumber: 4, questionType: 'multiple_choice',
    questionText: 'Medelvärdet av fem tal är 12. Fyra av talen är 10, 11, 13 och 14. Vilket är det femte talet?',
    options: ['12', '10', '14', '13'],
    correctAnswer: '12',
    explanation: 'Summan ska vara 5 × 12 = 60. De fyra talen summerar till 48, så det femte är 60 − 48 = 12.',
    difficulty: 'medium', topic: 'statistik', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-xyz-5', sectionCode: 'XYZ', questionNumber: 5, questionType: 'multiple_choice',
    questionText: 'Om x² = 49 och x < 0, vad är x + 10?',
    options: ['3', '17', '−3', '7'],
    correctAnswer: '3',
    explanation: 'x = −7 (eftersom x < 0). Då är x + 10 = 3.',
    difficulty: 'medium', topic: 'algebra', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-xyz-6', sectionCode: 'XYZ', questionNumber: 6, questionType: 'multiple_choice',
    questionText: 'En bil kör 90 km/h. Hur långt hinner den på 40 minuter?',
    options: ['54 km', '60 km', '66 km', '45 km'],
    correctAnswer: '60 km',
    explanation: '40 minuter = 2/3 timme. 90 × 2/3 = 60 km.',
    difficulty: 'easy', topic: 'hastighet', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-xyz-7', sectionCode: 'XYZ', questionNumber: 7, questionType: 'multiple_choice',
    questionText: 'Förhållandet mellan pojkar och flickor i en klass är 3:4. Om klassen har 28 elever, hur många är pojkar?',
    options: ['12', '14', '16', '21'],
    correctAnswer: '12',
    explanation: '3 + 4 = 7 delar. 28/7 = 4 elever per del. Pojkar: 3 × 4 = 12.',
    difficulty: 'medium', topic: 'proportioner', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-xyz-8', sectionCode: 'XYZ', questionNumber: 8, questionType: 'multiple_choice',
    questionText: 'Vad är 2⁵ × 2³ / 2⁴?',
    options: ['2⁴', '2⁶', '2²', '2⁸'],
    correctAnswer: '2⁴',
    explanation: 'Exponentregler: 5 + 3 − 4 = 4, alltså 2⁴ = 16.',
    difficulty: 'hard', topic: 'potenser', dateAdded: D, source: 'local',
  },

  // =====================================================
  // KVA — Kvantitativa jämförelser
  // =====================================================
  {
    id: 'v2-kva-1', sectionCode: 'KVA', questionNumber: 1, questionType: 'comparison',
    questionText: 'Kvantitet I: 25 % av 80\nKvantitet II: 80 % av 25',
    options: ['I är större än II', 'II är större än I', 'I är lika med II', 'Informationen är otillräcklig'],
    correctAnswer: 'I är lika med II',
    explanation: 'a % av b = b % av a. Båda är 20.',
    difficulty: 'easy', topic: 'procent', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-kva-2', sectionCode: 'KVA', questionNumber: 2, questionType: 'comparison',
    questionText: 'x > 0\nKvantitet I: x + 1/x\nKvantitet II: 2',
    options: ['I är större än II', 'II är större än I', 'I är lika med II', 'Informationen är otillräcklig'],
    correctAnswer: 'Informationen är otillräcklig',
    explanation: 'För x = 1 är I = 2 (lika). För alla andra positiva x är I > 2. Relationen varierar, alltså otillräcklig information.',
    difficulty: 'hard', topic: 'algebra', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-kva-3', sectionCode: 'KVA', questionNumber: 3, questionType: 'comparison',
    questionText: 'En kvadrat har omkretsen 24 cm.\nKvantitet I: Kvadratens area\nKvantitet II: 36 cm²',
    options: ['I är större än II', 'II är större än I', 'I är lika med II', 'Informationen är otillräcklig'],
    correctAnswer: 'I är lika med II',
    explanation: 'Sidan är 6 cm, arean 36 cm².',
    difficulty: 'easy', topic: 'geometri', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-kva-4', sectionCode: 'KVA', questionNumber: 4, questionType: 'comparison',
    questionText: 'a och b är heltal där a < b < 0.\nKvantitet I: a · b\nKvantitet II: 0',
    options: ['I är större än II', 'II är större än I', 'I är lika med II', 'Informationen är otillräcklig'],
    correctAnswer: 'I är större än II',
    explanation: 'Produkten av två negativa tal är alltid positiv, alltså större än 0.',
    difficulty: 'medium', topic: 'negativa tal', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-kva-5', sectionCode: 'KVA', questionNumber: 5, questionType: 'comparison',
    questionText: 'Kvantitet I: Medelvärdet av 3, 7 och 11\nKvantitet II: Medianen av 3, 7 och 11',
    options: ['I är större än II', 'II är större än I', 'I är lika med II', 'Informationen är otillräcklig'],
    correctAnswer: 'I är lika med II',
    explanation: 'Medelvärdet är (3+7+11)/3 = 7 och medianen är 7.',
    difficulty: 'easy', topic: 'statistik', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-kva-6', sectionCode: 'KVA', questionNumber: 6, questionType: 'comparison',
    questionText: '0 < x < 1\nKvantitet I: x²\nKvantitet II: x',
    options: ['I är större än II', 'II är större än I', 'I är lika med II', 'Informationen är otillräcklig'],
    correctAnswer: 'II är större än I',
    explanation: 'Kvadraten på ett tal mellan 0 och 1 är alltid mindre än talet självt.',
    difficulty: 'medium', topic: 'algebra', dateAdded: D, source: 'local',
  },

  // =====================================================
  // NOG — Begreppet nog
  // =====================================================
  {
    id: 'v2-nog-1', sectionCode: 'NOG', questionNumber: 1, questionType: 'multiple_choice',
    questionText: 'Hur gammal är Sara?\n(1) Sara är dubbelt så gammal som sin bror.\n(2) Saras bror är 9 år.',
    options: [
      '(1) ensamt är tillräcklig men inte (2)',
      '(2) ensamt är tillräcklig men inte (1)',
      '(1) och (2) tillsammans är tillräckliga',
      'Vardera påståendet är ensamt tillräckligt',
      'Informationen är otillräcklig även tillsammans',
    ],
    correctAnswer: '(1) och (2) tillsammans är tillräckliga',
    explanation: 'Ensamma räcker inte påståendena, men tillsammans ger de 2 × 9 = 18 år.',
    difficulty: 'easy', topic: 'ekvationer', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-nog-2', sectionCode: 'NOG', questionNumber: 2, questionType: 'multiple_choice',
    questionText: 'Är heltalet n jämnt?\n(1) n + 4 är jämnt.\n(2) 3n är jämnt.',
    options: [
      '(1) ensamt är tillräcklig men inte (2)',
      '(2) ensamt är tillräcklig men inte (1)',
      '(1) och (2) tillsammans är tillräckliga',
      'Vardera påståendet är ensamt tillräckligt',
      'Informationen är otillräcklig även tillsammans',
    ],
    correctAnswer: 'Vardera påståendet är ensamt tillräckligt',
    explanation: '(1): n + 4 jämnt ⇒ n jämnt. (2): 3n jämnt ⇒ n måste vara jämnt eftersom 3 är udda. Båda räcker ensamma.',
    difficulty: 'medium', topic: 'talteori', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-nog-3', sectionCode: 'NOG', questionNumber: 3, questionType: 'multiple_choice',
    questionText: 'Vad kostar en biobiljett?\n(1) Tre biljetter kostar 360 kr.\n(2) Två biljetter och en popcorn kostar 305 kr.',
    options: [
      '(1) ensamt är tillräcklig men inte (2)',
      '(2) ensamt är tillräcklig men inte (1)',
      '(1) och (2) tillsammans är tillräckliga',
      'Vardera påståendet är ensamt tillräckligt',
      'Informationen är otillräcklig även tillsammans',
    ],
    correctAnswer: '(1) ensamt är tillräcklig men inte (2)',
    explanation: '(1) ger direkt 360/3 = 120 kr. (2) har två okända och räcker inte ensamt.',
    difficulty: 'easy', topic: 'ekvationer', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-nog-4', sectionCode: 'NOG', questionNumber: 4, questionType: 'multiple_choice',
    questionText: 'Hur stor är triangelns area?\n(1) Triangelns bas är 10 cm.\n(2) Triangelns två övriga sidor är 13 cm vardera.',
    options: [
      '(1) ensamt är tillräcklig men inte (2)',
      '(2) ensamt är tillräcklig men inte (1)',
      '(1) och (2) tillsammans är tillräckliga',
      'Vardera påståendet är ensamt tillräckligt',
      'Informationen är otillräcklig även tillsammans',
    ],
    correctAnswer: '(1) och (2) tillsammans är tillräckliga',
    explanation: 'Tillsammans bestämmer de en likbent triangel: höjden = √(13² − 5²) = 12, arean = 10 × 12 / 2 = 60 cm².',
    difficulty: 'hard', topic: 'geometri', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-nog-5', sectionCode: 'NOG', questionNumber: 5, questionType: 'multiple_choice',
    questionText: 'Hur många elever går i klassen?\n(1) Om eleverna delas i grupper om 4 blir ingen över.\n(2) Klassen har fler än 20 men färre än 30 elever.',
    options: [
      '(1) ensamt är tillräcklig men inte (2)',
      '(2) ensamt är tillräcklig men inte (1)',
      '(1) och (2) tillsammans är tillräckliga',
      'Vardera påståendet är ensamt tillräckligt',
      'Informationen är otillräcklig även tillsammans',
    ],
    correctAnswer: 'Informationen är otillräcklig även tillsammans',
    explanation: 'Tillsammans ger de delbarhet med 4 i intervallet 21–29: både 24 och 28 är möjliga. Otillräckligt.',
    difficulty: 'medium', topic: 'talteori', dateAdded: D, source: 'local',
  },

  // =====================================================
  // DTK — Diagram, tabeller & kartor
  // =====================================================
  {
    id: 'v2-dtk-1', sectionCode: 'DTK', questionNumber: 1, questionType: 'multiple_choice',
    readingPassage: 'Tabell: Elproduktion i Sverige 2023 (TWh)\nVattenkraft: 66 · Kärnkraft: 47 · Vindkraft: 34 · Solkraft: 3 · Övrigt (kraftvärme m.m.): 15\nTotal produktion: 165 TWh',
    questionText: 'Ungefär hur stor andel av elproduktionen kom från vindkraft?',
    options: ['13 %', '21 %', '29 %', '34 %'],
    correctAnswer: '21 %',
    explanation: '34/165 ≈ 0,206 ≈ 21 %.',
    difficulty: 'easy', topic: 'tabeller', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-dtk-2', sectionCode: 'DTK', questionNumber: 2, questionType: 'multiple_choice',
    readingPassage: 'Tabell: Elproduktion i Sverige 2023 (TWh)\nVattenkraft: 66 · Kärnkraft: 47 · Vindkraft: 34 · Solkraft: 3 · Övrigt (kraftvärme m.m.): 15\nTotal produktion: 165 TWh',
    questionText: 'Hur mycket större var produktionen från vattenkraft än från vindkraft och solkraft tillsammans?',
    options: ['29 TWh', '32 TWh', '35 TWh', '37 TWh'],
    correctAnswer: '29 TWh',
    explanation: 'Vind + sol = 37 TWh. 66 − 37 = 29 TWh.',
    difficulty: 'medium', topic: 'tabeller', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-dtk-3', sectionCode: 'DTK', questionNumber: 3, questionType: 'multiple_choice',
    readingPassage: 'Diagram (beskrivning): Antal sålda cyklar per kvartal hos en butik.\nKv1 2024: 120 · Kv2 2024: 310 · Kv3 2024: 280 · Kv4 2024: 90\nKv1 2025: 150 · Kv2 2025: 340 · Kv3 2025: 260 · Kv4 2025: 110',
    questionText: 'Med hur många procent ökade försäljningen under Kv1 från 2024 till 2025?',
    options: ['20 %', '25 %', '30 %', '15 %'],
    correctAnswer: '25 %',
    explanation: 'Ökning: (150 − 120)/120 = 0,25 = 25 %.',
    difficulty: 'medium', topic: 'diagram', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-dtk-4', sectionCode: 'DTK', questionNumber: 4, questionType: 'multiple_choice',
    readingPassage: 'Diagram (beskrivning): Antal sålda cyklar per kvartal hos en butik.\nKv1 2024: 120 · Kv2 2024: 310 · Kv3 2024: 280 · Kv4 2024: 90\nKv1 2025: 150 · Kv2 2025: 340 · Kv3 2025: 260 · Kv4 2025: 110',
    questionText: 'Hur många cyklar såldes totalt under 2025?',
    options: ['800', '860', '900', '820'],
    correctAnswer: '860',
    explanation: '150 + 340 + 260 + 110 = 860.',
    difficulty: 'easy', topic: 'diagram', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-dtk-5', sectionCode: 'DTK', questionNumber: 5, questionType: 'multiple_choice',
    readingPassage: 'Tabell: Befolkning och yta för fyra kommuner\nKommun A: 45 000 inv, 1 500 km² · Kommun B: 120 000 inv, 400 km²\nKommun C: 30 000 inv, 3 000 km² · Kommun D: 90 000 inv, 900 km²',
    questionText: 'Vilken kommun har högst befolkningstäthet?',
    options: ['Kommun A', 'Kommun B', 'Kommun C', 'Kommun D'],
    correctAnswer: 'Kommun B',
    explanation: 'B: 300 inv/km², D: 100, A: 30, C: 10. Kommun B är tätast befolkad.',
    difficulty: 'easy', topic: 'tabeller', dateAdded: D, source: 'local',
  },
  {
    id: 'v2-dtk-6', sectionCode: 'DTK', questionNumber: 6, questionType: 'multiple_choice',
    readingPassage: 'Tabell: Befolkning och yta för fyra kommuner\nKommun A: 45 000 inv, 1 500 km² · Kommun B: 120 000 inv, 400 km²\nKommun C: 30 000 inv, 3 000 km² · Kommun D: 90 000 inv, 900 km²',
    questionText: 'Hur många gånger större är kommun C:s yta jämfört med kommun B:s?',
    options: ['5,5 gånger', '7,5 gånger', '6 gånger', '8 gånger'],
    correctAnswer: '7,5 gånger',
    explanation: '3 000 / 400 = 7,5.',
    difficulty: 'medium', topic: 'tabeller', dateAdded: D, source: 'local',
  },
];

/** Number of V2 questions per section, used for stats and future imports */
export const HP_QUESTIONS_V2_COUNTS: Record<string, number> = HP_QUESTIONS_V2.reduce<Record<string, number>>((acc, q) => {
  acc[q.sectionCode] = (acc[q.sectionCode] ?? 0) + 1;
  return acc;
}, {});
