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
  /** Group key for reading-comprehension questions sharing one passage */
  passageGroup?: string;
  /** Sort order of this question within its passage group */
  orderInPassage?: number;
  imageUrl?: string;
  /** Fine-grained topic within the section, e.g. 'synonymer', 'geometri', 'procent' */
  topic?: string;
  /** ISO date when the question was added to the bank */
  dateAdded?: string;
  /** Source of the question: bundled locally or imported from Supabase */
  source?: 'local' | 'supabase';
}

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
