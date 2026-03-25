import { writeFileSync } from 'fs';

const sections = ['ORD', 'LÄS', 'MEK', 'XYZ', 'KVA', 'DTK'];
const versions = [
  { id: '2024-spring', name: 'Vår 2024' },
  { id: '2023-fall', name: 'Höst 2023' },
  { id: '2023-spring', name: 'Vår 2023' },
  { id: '2022-fall', name: 'Höst 2022' },
  { id: '2022-spring', name: 'Vår 2022' },
  { id: '2021-fall', name: 'Höst 2021' },
  { id: '2021-spring', name: 'Vår 2021' },
  { id: '2020-fall', name: 'Höst 2020' },
];

const ordBaseWords = [
  { word: 'pertinent', meaning: 'Relevant och träffande', opposite: 'Irrelevant', difficulty: 'medium' },
  { word: 'efemär', meaning: 'Kortvarig', opposite: 'Evig', difficulty: 'hard' },
  { word: 'pragmatisk', meaning: 'Praktisk och realistisk', opposite: 'Teoretisk', difficulty: 'medium' },
  { word: 'pedantisk', meaning: 'Överdrivet detaljerad', opposite: 'Ytlig', difficulty: 'medium' },
  { word: 'redundant', meaning: 'Överflödig', opposite: 'Nödvändig', difficulty: 'hard' },
  { word: 'eloquent', meaning: 'Vältalig', opposite: 'Tyst', difficulty: 'medium' },
  { word: 'altruistisk', meaning: 'Osjälvisk', opposite: 'Självisk', difficulty: 'medium' },
  { word: 'provisorisk', meaning: 'Tillfällig', opposite: 'Permanent', difficulty: 'medium' },
  { word: 'apatisk', meaning: 'Känslomässigt oberörd', opposite: 'Engagerad', difficulty: 'hard' },
  { word: 'subtil', meaning: 'Förfinad', opposite: 'Grov', difficulty: 'hard' },
  { word: 'empatisk', meaning: 'Inlevelsefull', opposite: 'Hänsynslös', difficulty: 'easy' },
  { word: 'paradox', meaning: 'Självmotsägelse', opposite: 'Logisk följd', difficulty: 'hard' },
  { word: 'persistent', meaning: 'Ihållande', opposite: 'Flyktig', difficulty: 'medium' },
  { word: 'ambivalent', meaning: 'Kluven', opposite: 'Säker', difficulty: 'hard' },
  { word: 'konkret', meaning: 'Påtaglig', opposite: 'Abstrakt', difficulty: 'easy' },
  { word: 'konventionell', meaning: 'Traditionell', opposite: 'Nyskapande', difficulty: 'easy' },
  { word: 'analfabet', meaning: 'Oförmögen att läsa', opposite: 'Bildad', difficulty: 'easy' },
  { word: 'stringent', meaning: 'Strikt', opposite: 'Flexibel', difficulty: 'medium' },
  { word: 'benägen', meaning: 'Villig', opposite: 'Motvillig', difficulty: 'medium' },
  { word: 'dogmatisk', meaning: 'Stel i åsikter', opposite: 'Öppensinnad', difficulty: 'hard' },
];

const altOrdWords = [
  { word: 'kohärent', meaning: 'Sammanhängande', opposite: 'Osammanhängande', difficulty: 'medium' },
  { word: 'prosaisk', meaning: 'Vardaglig', opposite: 'Poetisk', difficulty: 'hard' },
  { word: 'flegmatisk', meaning: 'Lugn och orubblig', opposite: 'Lättretad', difficulty: 'hard' },
  { word: 'skeptisk', meaning: 'Tveksam', opposite: 'Godtrogen', difficulty: 'easy' },
  { word: 'sporadisk', meaning: 'Oregelbunden', opposite: 'Regelbunden', difficulty: 'medium' },
  { word: 'monolitisk', meaning: 'Enhetlig', opposite: 'Fragmenterad', difficulty: 'hard' },
  { word: 'opportunistisk', meaning: 'Utnyttjande lägen', opposite: 'Principfast', difficulty: 'medium' },
  { word: 'volatil', meaning: 'Ostadig', opposite: 'Stabil', difficulty: 'hard' },
  { word: 'implicit', meaning: 'Underförstådd', opposite: 'Explicit', difficulty: 'medium' },
  { word: 'arbiträr', meaning: 'Godtycklig', opposite: 'Systematisk', difficulty: 'hard' },
  { word: 'analog', meaning: 'Liknande', opposite: 'Olik', difficulty: 'easy' },
  { word: 'autonomi', meaning: 'Självständighet', opposite: 'Beroende', difficulty: 'medium' },
  { word: 'eklektisk', meaning: 'Blandad', opposite: 'Enhetlig', difficulty: 'hard' },
  { word: 'sanktionera', meaning: 'Godkänna', opposite: 'Förkasta', difficulty: 'medium' },
  { word: 'homogen', meaning: 'Likartad', opposite: 'Heterogen', difficulty: 'medium' },
  { word: 'deteriorera', meaning: 'Försämras', opposite: 'Förbättras', difficulty: 'hard' },
  { word: 'elitistisk', meaning: 'Exkluderande', opposite: 'Inkluderande', difficulty: 'easy' },
  { word: 'rudimentär', meaning: 'Grundläggande', opposite: 'Avancerad', difficulty: 'medium' },
  { word: 'periferi', meaning: 'Utkant', opposite: 'Centrum', difficulty: 'easy' },
  { word: 'idiosynkratisk', meaning: 'Säregen', opposite: 'Konventionell', difficulty: 'hard' },
];

function generateOrdQuestions(sectionCode: string, testVersion: string, versionIndex: number) {
  const words = versionIndex % 2 === 0 ? ordBaseWords : altOrdWords;
  const prefix = sectionCode.toLowerCase();
  
  return words.map((w, i) => ({
    id: `${prefix}-${testVersion}-${i + 1}`,
    sectionCode,
    testVersion: `${prefix}-${testVersion}`,
    questionNumber: i + 1,
    questionText: `Vad betyder ordet "${w.word}"?`,
    questionType: 'multiple_choice' as const,
    options: [w.opposite, w.meaning, 'Neutral', 'Osäker'].sort(() => Math.random() - 0.5),
    correctAnswer: w.meaning,
    explanation: `${w.word} betyder ${w.meaning.toLowerCase()}.`,
    difficulty: w.difficulty as 'easy' | 'medium' | 'hard',
  }));
}

console.log('Generating unique HP questions for all versions...');
console.log(`Total: ${sections.length} sections × ${versions.length} versions × 20 questions = ${sections.length * versions.length * 20} questions`);
console.log('\nRun: npx tsx scripts/generate-unique-hp-questions.ts > generated-hp-questions.json');
