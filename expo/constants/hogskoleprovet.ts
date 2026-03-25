// Högskoleprov Constants and Sample Questions

export interface HPSectionConfig {
  code: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  color: string;
  gradientColors: readonly [string, string];
  timeMinutes: number;
  questionCount: number;
  maxScore: number;
  tips: string[];
}

export const HP_SECTIONS: HPSectionConfig[] = [
  // === VERBAL DEL ===
  {
    code: 'ORD',
    name: 'ORD',
    fullName: 'Ordförståelse',
    description: 'Testa ditt ordförråd och förmåga att förstå ords betydelse och synonymer',
    icon: '📚',
    color: '#6366F1',
    gradientColors: ['#6366F1', '#8B5CF6'] as const,
    timeMinutes: 20,
    questionCount: 20,
    maxScore: 20,
    tips: [
      'Läs mycket för att bygga ordförråd',
      'Lär dig ordstammar och prefix/suffix',
      'Öva på synonymer och antonymer',
    ],
  },
  {
    code: 'LÄS',
    name: 'LÄS',
    fullName: 'Läsförståelse',
    description: 'Förstå och analysera svenska texter av olika slag',
    icon: '📖',
    color: '#10B981',
    gradientColors: ['#10B981', '#059669'] as const,
    timeMinutes: 55,
    questionCount: 20,
    maxScore: 20,
    tips: [
      'Läs frågan först, sedan texten',
      'Markera nyckelord i texten',
      'Var uppmärksam på nyanser',
    ],
  },
  {
    code: 'MEK',
    name: 'MEK',
    fullName: 'Meningskomplettering',
    description: 'Komplettera meningar logiskt och grammatiskt korrekt',
    icon: '✏️',
    color: '#F59E0B',
    gradientColors: ['#F59E0B', '#D97706'] as const,
    timeMinutes: 25,
    questionCount: 20,
    maxScore: 20,
    tips: [
      'Leta efter ledtrådar i meningen',
      'Tänk på grammatisk kongruens',
      'Eliminera uppenbart felaktiga alternativ',
    ],
  },
  {
    code: 'ELF',
    name: 'ELF',
    fullName: 'Engelsk läsförståelse',
    description: 'Läs och förstå engelska texter inom olika ämnesområden',
    icon: '🇬🇧',
    color: '#8B5CF6',
    gradientColors: ['#8B5CF6', '#7C3AED'] as const,
    timeMinutes: 30,
    questionCount: 20,
    maxScore: 20,
    tips: [
      'Skumläs texten snabbt för att få en helhetsbild',
      'Fokusera på nyckelmeningar i varje stycke',
      'Svara utifrån texten, inte din egen kunskap',
    ],
  },
  // === KVANTITATIV DEL ===
  {
    code: 'XYZ',
    name: 'XYZ',
    fullName: 'Matematisk problemlösning',
    description: 'Lös matematiska problem inom algebra, geometri och aritmetik',
    icon: '🔣',
    color: '#EC4899',
    gradientColors: ['#EC4899', '#DB2777'] as const,
    timeMinutes: 25,
    questionCount: 20,
    maxScore: 20,
    tips: [
      'Rita upp problemet för att visualisera',
      'Kontrollera enheterna i svaret',
      'Uppskatta svaret innan du räknar exakt',
    ],
  },
  {
    code: 'KVA',
    name: 'KVA',
    fullName: 'Kvantitativa jämförelser',
    description: 'Jämför kvantiteter och analysera matematiska samband',
    icon: '🔢',
    color: '#06B6D4',
    gradientColors: ['#06B6D4', '#0891B2'] as const,
    timeMinutes: 25,
    questionCount: 20,
    maxScore: 20,
    tips: [
      'Sätt in enkla värden för att testa',
      'Jämför systematiskt',
      'Var uppmärksam på specialfall som 0 och negativa tal',
    ],
  },
  {
    code: 'NOG',
    name: 'NOG',
    fullName: 'Begreppet nog',
    description: 'Avgör om given information är tillräcklig för att lösa ett problem',
    icon: '🔍',
    color: '#14B8A6',
    gradientColors: ['#14B8A6', '#0D9488'] as const,
    timeMinutes: 25,
    questionCount: 20,
    maxScore: 20,
    tips: [
      'Analysera varje påstående separat först',
      'Fråga dig: räcker påstående 1 ensamt? Påstående 2 ensamt?',
      'Var försiktig med att dra slutsatser du inte kan bevisa',
    ],
  },
  {
    code: 'DTK',
    name: 'DTK',
    fullName: 'Diagram, tabeller & kartor',
    description: 'Tolka och analysera visuell data, diagram, tabeller och kartor',
    icon: '📈',
    color: '#EF4444',
    gradientColors: ['#EF4444', '#DC2626'] as const,
    timeMinutes: 55,
    questionCount: 20,
    maxScore: 20,
    tips: [
      'Läs alltid rubriker och axlar noga',
      'Notera trender och mönster',
      'Var noga med enheter och skalor',
    ],
  },
];

export const HP_VERBAL_SECTIONS = ['ORD', 'LÄS', 'MEK', 'ELF'];
export const HP_QUANTITATIVE_SECTIONS = ['XYZ', 'KVA', 'NOG', 'DTK'];

export const HP_FULL_TEST_CONFIG = {
  totalTime: 260,
  totalQuestions: 160,
  maxScore: 2.0,
  passingScore: 0.0,
  sections: HP_SECTIONS,
};

export const HP_SCORE_RANGES = [
  { min: 0.0, max: 0.4, label: 'Grundnivå', description: 'Du har potential att förbättras mycket!', color: '#EF4444' },
  { min: 0.4, max: 0.8, label: 'Under medel', description: 'Fortsätt träna så kommer du dit!', color: '#F59E0B' },
  { min: 0.8, max: 1.2, label: 'Medelnivå', description: 'Du ligger bra till!', color: '#06B6D4' },
  { min: 1.2, max: 1.6, label: 'Över medel', description: 'Starkt resultat!', color: '#10B981' },
  { min: 1.6, max: 2.0, label: 'Toppnivå', description: 'Utmärkt prestation!', color: '#6366F1' },
];

export const HP_MILESTONES = [
  { id: 'first_section', name: 'Första steget', description: 'Genomför din första delprovsövning', icon: '🎯', xp: 50 },
  { id: 'first_full_test', name: 'Hela provet', description: 'Genomför ett komplett högskoleprov', icon: '🏆', xp: 200 },
  { id: 'perfect_section', name: 'Perfekt sektion', description: 'Få 100% på ett delprov', icon: '⭐', xp: 100 },
  { id: 'five_tests', name: 'Dedikerad', description: 'Genomför 5 kompletta prov', icon: '🔥', xp: 300 },
  { id: 'all_sections', name: 'Allsidig', description: 'Öva på alla 8 delprov', icon: '🎓', xp: 150 },
  { id: 'streak_3', name: '3-dagars streak', description: 'Öva 3 dagar i rad', icon: '📆', xp: 75 },
  { id: 'streak_7', name: 'Veckostjärna', description: 'Öva 7 dagar i rad', icon: '🌟', xp: 150 },
  { id: 'improvement', name: 'Framsteg', description: 'Förbättra ditt resultat med 0.2 poäng', icon: '📈', xp: 100 },
];

export interface HPQuestion {
  id: string;
  sectionCode: string;
  testVersion?: string;
  questionNumber: number;
  questionText: string;
  questionType: 'multiple_choice' | 'comparison' | 'reading_comprehension';
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  readingPassage?: string;
  imageUrl?: string;
}

export interface HPTestVersion {
  id: string;
  sectionCode: string;
  name: string;
  questionCount: number;
  season?: 'spring' | 'fall';
  year?: number;
}

export interface HPFullTestVersion {
  id: string;
  name: string;
  displayName: string;
  season: 'spring' | 'fall';
  year: number;
  questionCount: number;
  timeMinutes: number;
}

// Full test versions (complete HP tests)
export const HP_FULL_TEST_VERSIONS: HPFullTestVersion[] = [
  { id: 'hp-2024-spring', name: 'Vår 2024', displayName: 'Högskoleprov Vår 2024', season: 'spring', year: 2024, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2023-fall', name: 'Höst 2023', displayName: 'Högskoleprov Höst 2023', season: 'fall', year: 2023, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2023-spring', name: 'Vår 2023', displayName: 'Högskoleprov Vår 2023', season: 'spring', year: 2023, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2022-fall', name: 'Höst 2022', displayName: 'Högskoleprov Höst 2022', season: 'fall', year: 2022, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2022-spring', name: 'Vår 2022', displayName: 'Högskoleprov Vår 2022', season: 'spring', year: 2022, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2021-fall', name: 'Höst 2021', displayName: 'Högskoleprov Höst 2021', season: 'fall', year: 2021, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2021-spring', name: 'Vår 2021', displayName: 'Högskoleprov Vår 2021', season: 'spring', year: 2021, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2020-fall', name: 'Höst 2020', displayName: 'Högskoleprov Höst 2020', season: 'fall', year: 2020, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2020-spring', name: 'Vår 2020', displayName: 'Högskoleprov Vår 2020', season: 'spring', year: 2020, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2019-fall', name: 'Höst 2019', displayName: 'Högskoleprov Höst 2019', season: 'fall', year: 2019, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2019-spring', name: 'Vår 2019', displayName: 'Högskoleprov Vår 2019', season: 'spring', year: 2019, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2018-fall', name: 'Höst 2018', displayName: 'Högskoleprov Höst 2018', season: 'fall', year: 2018, questionCount: 120, timeMinutes: 235 },
  { id: 'hp-2018-spring', name: 'Vår 2018', displayName: 'Högskoleprov Vår 2018', season: 'spring', year: 2018, questionCount: 120, timeMinutes: 235 },
];

// Test versions available for each section
export const HP_TEST_VERSIONS: HPTestVersion[] = [
  { id: 'ord-2024-spring', sectionCode: 'ORD', name: 'Vår 2024', questionCount: 20, season: 'spring', year: 2024 },
  { id: 'ord-2023-fall', sectionCode: 'ORD', name: 'Höst 2023', questionCount: 20, season: 'fall', year: 2023 },
  { id: 'ord-2023-spring', sectionCode: 'ORD', name: 'Vår 2023', questionCount: 20, season: 'spring', year: 2023 },
  { id: 'ord-2022-fall', sectionCode: 'ORD', name: 'Höst 2022', questionCount: 20, season: 'fall', year: 2022 },
  { id: 'ord-2022-spring', sectionCode: 'ORD', name: 'Vår 2022', questionCount: 20, season: 'spring', year: 2022 },
  { id: 'ord-2021-fall', sectionCode: 'ORD', name: 'Höst 2021', questionCount: 20, season: 'fall', year: 2021 },
  { id: 'ord-2021-spring', sectionCode: 'ORD', name: 'Vår 2021', questionCount: 20, season: 'spring', year: 2021 },
  { id: 'ord-2020-fall', sectionCode: 'ORD', name: 'Höst 2020', questionCount: 20, season: 'fall', year: 2020 },

  { id: 'las-2024-spring', sectionCode: 'LÄS', name: 'Vår 2024', questionCount: 20, season: 'spring', year: 2024 },
  { id: 'las-2023-fall', sectionCode: 'LÄS', name: 'Höst 2023', questionCount: 20, season: 'fall', year: 2023 },
  { id: 'las-2023-spring', sectionCode: 'LÄS', name: 'Vår 2023', questionCount: 20, season: 'spring', year: 2023 },
  { id: 'las-2022-fall', sectionCode: 'LÄS', name: 'Höst 2022', questionCount: 20, season: 'fall', year: 2022 },
  { id: 'las-2022-spring', sectionCode: 'LÄS', name: 'Vår 2022', questionCount: 20, season: 'spring', year: 2022 },
  { id: 'las-2021-fall', sectionCode: 'LÄS', name: 'Höst 2021', questionCount: 20, season: 'fall', year: 2021 },
  { id: 'las-2021-spring', sectionCode: 'LÄS', name: 'Vår 2021', questionCount: 20, season: 'spring', year: 2021 },
  { id: 'las-2020-fall', sectionCode: 'LÄS', name: 'Höst 2020', questionCount: 20, season: 'fall', year: 2020 },

  { id: 'mek-2024-spring', sectionCode: 'MEK', name: 'Vår 2024', questionCount: 20, season: 'spring', year: 2024 },
  { id: 'mek-2023-fall', sectionCode: 'MEK', name: 'Höst 2023', questionCount: 20, season: 'fall', year: 2023 },
  { id: 'mek-2023-spring', sectionCode: 'MEK', name: 'Vår 2023', questionCount: 20, season: 'spring', year: 2023 },
  { id: 'mek-2022-fall', sectionCode: 'MEK', name: 'Höst 2022', questionCount: 20, season: 'fall', year: 2022 },
  { id: 'mek-2022-spring', sectionCode: 'MEK', name: 'Vår 2022', questionCount: 20, season: 'spring', year: 2022 },
  { id: 'mek-2021-fall', sectionCode: 'MEK', name: 'Höst 2021', questionCount: 20, season: 'fall', year: 2021 },
  { id: 'mek-2021-spring', sectionCode: 'MEK', name: 'Vår 2021', questionCount: 20, season: 'spring', year: 2021 },
  { id: 'mek-2020-fall', sectionCode: 'MEK', name: 'Höst 2020', questionCount: 20, season: 'fall', year: 2020 },

  { id: 'elf-2024-spring', sectionCode: 'ELF', name: 'Vår 2024', questionCount: 20, season: 'spring', year: 2024 },
  { id: 'elf-2023-fall', sectionCode: 'ELF', name: 'Höst 2023', questionCount: 20, season: 'fall', year: 2023 },
  { id: 'elf-2023-spring', sectionCode: 'ELF', name: 'Vår 2023', questionCount: 20, season: 'spring', year: 2023 },
  { id: 'elf-2022-fall', sectionCode: 'ELF', name: 'Höst 2022', questionCount: 20, season: 'fall', year: 2022 },
  { id: 'elf-2022-spring', sectionCode: 'ELF', name: 'Vår 2022', questionCount: 20, season: 'spring', year: 2022 },
  { id: 'elf-2021-fall', sectionCode: 'ELF', name: 'Höst 2021', questionCount: 20, season: 'fall', year: 2021 },
  { id: 'elf-2021-spring', sectionCode: 'ELF', name: 'Vår 2021', questionCount: 20, season: 'spring', year: 2021 },
  { id: 'elf-2020-fall', sectionCode: 'ELF', name: 'Höst 2020', questionCount: 20, season: 'fall', year: 2020 },

  { id: 'xyz-2024-spring', sectionCode: 'XYZ', name: 'Vår 2024', questionCount: 20, season: 'spring', year: 2024 },
  { id: 'xyz-2023-fall', sectionCode: 'XYZ', name: 'Höst 2023', questionCount: 20, season: 'fall', year: 2023 },
  { id: 'xyz-2023-spring', sectionCode: 'XYZ', name: 'Vår 2023', questionCount: 20, season: 'spring', year: 2023 },
  { id: 'xyz-2022-fall', sectionCode: 'XYZ', name: 'Höst 2022', questionCount: 20, season: 'fall', year: 2022 },
  { id: 'xyz-2022-spring', sectionCode: 'XYZ', name: 'Vår 2022', questionCount: 20, season: 'spring', year: 2022 },
  { id: 'xyz-2021-fall', sectionCode: 'XYZ', name: 'Höst 2021', questionCount: 20, season: 'fall', year: 2021 },
  { id: 'xyz-2021-spring', sectionCode: 'XYZ', name: 'Vår 2021', questionCount: 20, season: 'spring', year: 2021 },
  { id: 'xyz-2020-fall', sectionCode: 'XYZ', name: 'Höst 2020', questionCount: 20, season: 'fall', year: 2020 },

  { id: 'kva-2024-spring', sectionCode: 'KVA', name: 'Vår 2024', questionCount: 20, season: 'spring', year: 2024 },
  { id: 'kva-2023-fall', sectionCode: 'KVA', name: 'Höst 2023', questionCount: 20, season: 'fall', year: 2023 },
  { id: 'kva-2023-spring', sectionCode: 'KVA', name: 'Vår 2023', questionCount: 20, season: 'spring', year: 2023 },
  { id: 'kva-2022-fall', sectionCode: 'KVA', name: 'Höst 2022', questionCount: 20, season: 'fall', year: 2022 },
  { id: 'kva-2022-spring', sectionCode: 'KVA', name: 'Vår 2022', questionCount: 20, season: 'spring', year: 2022 },
  { id: 'kva-2021-fall', sectionCode: 'KVA', name: 'Höst 2021', questionCount: 20, season: 'fall', year: 2021 },
  { id: 'kva-2021-spring', sectionCode: 'KVA', name: 'Vår 2021', questionCount: 20, season: 'spring', year: 2021 },
  { id: 'kva-2020-fall', sectionCode: 'KVA', name: 'Höst 2020', questionCount: 20, season: 'fall', year: 2020 },

  { id: 'nog-2024-spring', sectionCode: 'NOG', name: 'Vår 2024', questionCount: 20, season: 'spring', year: 2024 },
  { id: 'nog-2023-fall', sectionCode: 'NOG', name: 'Höst 2023', questionCount: 20, season: 'fall', year: 2023 },
  { id: 'nog-2023-spring', sectionCode: 'NOG', name: 'Vår 2023', questionCount: 20, season: 'spring', year: 2023 },
  { id: 'nog-2022-fall', sectionCode: 'NOG', name: 'Höst 2022', questionCount: 20, season: 'fall', year: 2022 },
  { id: 'nog-2022-spring', sectionCode: 'NOG', name: 'Vår 2022', questionCount: 20, season: 'spring', year: 2022 },
  { id: 'nog-2021-fall', sectionCode: 'NOG', name: 'Höst 2021', questionCount: 20, season: 'fall', year: 2021 },
  { id: 'nog-2021-spring', sectionCode: 'NOG', name: 'Vår 2021', questionCount: 20, season: 'spring', year: 2021 },
  { id: 'nog-2020-fall', sectionCode: 'NOG', name: 'Höst 2020', questionCount: 20, season: 'fall', year: 2020 },

  { id: 'dtk-2024-spring', sectionCode: 'DTK', name: 'Vår 2024', questionCount: 20, season: 'spring', year: 2024 },
  { id: 'dtk-2023-fall', sectionCode: 'DTK', name: 'Höst 2023', questionCount: 20, season: 'fall', year: 2023 },
  { id: 'dtk-2023-spring', sectionCode: 'DTK', name: 'Vår 2023', questionCount: 20, season: 'spring', year: 2023 },
  { id: 'dtk-2022-fall', sectionCode: 'DTK', name: 'Höst 2022', questionCount: 20, season: 'fall', year: 2022 },
  { id: 'dtk-2022-spring', sectionCode: 'DTK', name: 'Vår 2022', questionCount: 20, season: 'spring', year: 2022 },
  { id: 'dtk-2021-fall', sectionCode: 'DTK', name: 'Höst 2021', questionCount: 20, season: 'fall', year: 2021 },
  { id: 'dtk-2021-spring', sectionCode: 'DTK', name: 'Vår 2021', questionCount: 20, season: 'spring', year: 2021 },
  { id: 'dtk-2020-fall', sectionCode: 'DTK', name: 'Höst 2020', questionCount: 20, season: 'fall', year: 2020 },
];

// Helper function to get questions by section and version
export const getQuestionsBySection = (
  sectionCode: string,
  testVersion?: string
): HPQuestion[] => {
  let questions = SAMPLE_HP_QUESTIONS.filter(q => q.sectionCode === sectionCode);
  
  if (testVersion) {
    questions = questions.filter(q => q.testVersion === testVersion);
  }
  
  return questions;
};

// SAMPLE_HP_QUESTIONS is empty - all questions are in hogskoleprovet-questions.ts to avoid duplicates
export const SAMPLE_HP_QUESTIONS: HPQuestion[] = [];

export const getSectionByCode = (code: string): HPSectionConfig | undefined => {
  return HP_SECTIONS.find(s => s.code === code);
};

export const calculateHPScore = (correctAnswers: number, totalQuestions: number): number => {
  const rawScore = correctAnswers / totalQuestions;
  return Math.round(rawScore * 2 * 100) / 100;
};

export const getScoreLabel = (score: number): { label: string; description: string; color: string } => {
  const range = HP_SCORE_RANGES.find(r => score >= r.min && score <= r.max);
  return range || HP_SCORE_RANGES[0];
};
