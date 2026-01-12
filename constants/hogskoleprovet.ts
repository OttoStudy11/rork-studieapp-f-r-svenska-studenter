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
  {
    code: 'ORD',
    name: 'ORD',
    fullName: 'Ordförståelse',
    description: 'Testa din ordförråd och förmåga att förstå ords betydelse',
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
    description: 'Förstå och analysera texter av olika slag',
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
    code: 'XYZ',
    name: 'XYZ',
    fullName: 'Diagram, tabeller & kartor',
    description: 'Tolka och analysera visuell information',
    icon: '📊',
    color: '#EC4899',
    gradientColors: ['#EC4899', '#DB2777'] as const,
    timeMinutes: 55,
    questionCount: 20,
    maxScore: 20,
    tips: [
      'Läs alltid rubriker och axlar först',
      'Var noga med enheter',
      'Dubbelkolla beräkningar',
    ],
  },
  {
    code: 'KVA',
    name: 'KVA',
    fullName: 'Kvantitativ analys',
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
      'Var uppmärksam på specialfall',
    ],
  },
  {
    code: 'DTK',
    name: 'DTK',
    fullName: 'Diagram, tabeller & kartor',
    description: 'Avancerad tolkning av data och teknisk information',
    icon: '📈',
    color: '#EF4444',
    gradientColors: ['#EF4444', '#DC2626'] as const,
    timeMinutes: 55,
    questionCount: 20,
    maxScore: 20,
    tips: [
      'Ta god tid på dig att förstå datan',
      'Notera trender och mönster',
      'Använd uteslutningsmetoden',
    ],
  },
];

export const HP_VERBAL_SECTIONS = ['ORD', 'LÄS', 'MEK'];
export const HP_QUANTITATIVE_SECTIONS = ['XYZ', 'KVA', 'DTK'];

export const HP_FULL_TEST_CONFIG = {
  totalTime: 235,
  totalQuestions: 120,
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
  { id: 'all_sections', name: 'Allsidig', description: 'Öva på alla 6 delprov', icon: '🎓', xp: 150 },
  { id: 'streak_3', name: '3-dagars streak', description: 'Öva 3 dagar i rad', icon: '📆', xp: 75 },
  { id: 'streak_7', name: 'Veckostjärna', description: 'Öva 7 dagar i rad', icon: '🌟', xp: 150 },
  { id: 'improvement', name: 'Framsteg', description: 'Förbättra ditt resultat med 0.2 poäng', icon: '📈', xp: 100 },
];

export interface HPQuestion {
  id: string;
  sectionCode: string;
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

// Sample questions for each section
export const SAMPLE_HP_QUESTIONS: HPQuestion[] = [
  // ORD - Ordförståelse
  {
    id: 'ord-1',
    sectionCode: 'ORD',
    questionNumber: 1,
    questionText: 'Vad betyder ordet "pertinent"?',
    questionType: 'multiple_choice',
    options: ['Irrelevant', 'Relevant och träffande', 'Förvirrande', 'Motsägelsefull'],
    correctAnswer: 'Relevant och träffande',
    explanation: 'Pertinent betyder relevant, träffande eller som har direkt anknytning till saken.',
    difficulty: 'medium',
  },
  {
    id: 'ord-2',
    sectionCode: 'ORD',
    questionNumber: 2,
    questionText: 'Vilket ord är en synonym till "efemär"?',
    questionType: 'multiple_choice',
    options: ['Evig', 'Kortvarig', 'Stark', 'Vacker'],
    correctAnswer: 'Kortvarig',
    explanation: 'Efemär betyder kortlivad eller flyktig, något som bara varar en kort tid.',
    difficulty: 'hard',
  },
  {
    id: 'ord-3',
    sectionCode: 'ORD',
    questionNumber: 3,
    questionText: 'Vad betyder "pragmatisk"?',
    questionType: 'multiple_choice',
    options: ['Teoretisk', 'Praktisk och realistisk', 'Pessimistisk', 'Idealistisk'],
    correctAnswer: 'Praktisk och realistisk',
    explanation: 'Pragmatisk innebär att ha en praktisk, resultatinriktad inställning snarare än teoretisk.',
    difficulty: 'medium',
  },
  {
    id: 'ord-4',
    sectionCode: 'ORD',
    questionNumber: 4,
    questionText: 'Vilket ord betyder "överdrivet detaljerad"?',
    questionType: 'multiple_choice',
    options: ['Koncis', 'Pedantisk', 'Vag', 'Ytlig'],
    correctAnswer: 'Pedantisk',
    explanation: 'Pedantisk beskriver någon som är överdrivet noggrann med detaljer och regler.',
    difficulty: 'medium',
  },
  {
    id: 'ord-5',
    sectionCode: 'ORD',
    questionNumber: 5,
    questionText: 'Vad är en antonym till "konkret"?',
    questionType: 'multiple_choice',
    options: ['Abstrakt', 'Tydlig', 'Fast', 'Verklig'],
    correctAnswer: 'Abstrakt',
    explanation: 'Konkret betyder påtaglig och verklig, medan abstrakt är motsatsen - teoretisk och otydlig.',
    difficulty: 'easy',
  },

  // LÄS - Läsförståelse
  {
    id: 'las-1',
    sectionCode: 'LÄS',
    questionNumber: 1,
    questionText: 'Vad är författarens huvudsakliga syfte med texten?',
    questionType: 'reading_comprehension',
    readingPassage: 'Klimatförändringarna påverkar ekosystemen på flera sätt. Temperaturen stiger, havsnivåerna höjs och extremväder blir vanligare. Forskare betonar vikten av att agera nu för att begränsa skadorna. Genom att minska utsläppen av växthusgaser kan vi bromsa utvecklingen och ge naturen en chans att anpassa sig.',
    options: [
      'Att skrämma läsaren',
      'Att informera och uppmana till handling',
      'Att kritisera politiker',
      'Att presentera ny forskning'
    ],
    correctAnswer: 'Att informera och uppmana till handling',
    explanation: 'Texten informerar om klimatförändringarnas effekter och avslutar med en uppmaning att agera genom att minska utsläpp.',
    difficulty: 'medium',
  },
  {
    id: 'las-2',
    sectionCode: 'LÄS',
    questionNumber: 2,
    questionText: 'Enligt texten, vad kan hända om vi minskar utsläppen?',
    questionType: 'reading_comprehension',
    readingPassage: 'Klimatförändringarna påverkar ekosystemen på flera sätt. Temperaturen stiger, havsnivåerna höjs och extremväder blir vanligare. Forskare betonar vikten av att agera nu för att begränsa skadorna. Genom att minska utsläppen av växthusgaser kan vi bromsa utvecklingen och ge naturen en chans att anpassa sig.',
    options: [
      'Klimatförändringarna stannar helt',
      'Naturen får tid att anpassa sig',
      'Temperaturen sjunker omedelbart',
      'Havsnivåerna återgår till det normala'
    ],
    correctAnswer: 'Naturen får tid att anpassa sig',
    explanation: 'Texten säger att minskade utsläpp kan "ge naturen en chans att anpassa sig".',
    difficulty: 'easy',
  },
  {
    id: 'las-3',
    sectionCode: 'LÄS',
    questionNumber: 3,
    questionText: 'Vilken ton har författaren i texten?',
    questionType: 'reading_comprehension',
    readingPassage: 'Den digitala revolutionen har förändrat vårt sätt att kommunicera på ett sätt som ingen kunde förutse för bara några decennier sedan. Sociala medier har gett röst åt miljoner, men har också skapat nya utmaningar för demokratin. Informationsspridningen är snabbare än någonsin, men kvaliteten på informationen varierar kraftigt.',
    options: ['Pessimistisk', 'Balanserad och reflekterande', 'Entusiastisk', 'Aggressiv'],
    correctAnswer: 'Balanserad och reflekterande',
    explanation: 'Författaren presenterar både positiva och negativa aspekter av den digitala revolutionen.',
    difficulty: 'medium',
  },

  // MEK - Meningskomplettering
  {
    id: 'mek-1',
    sectionCode: 'MEK',
    questionNumber: 1,
    questionText: 'Trots att han var ____ lyckades han ____ alla hinder.',
    questionType: 'multiple_choice',
    options: [
      'erfaren ... skapa',
      'oerfaren ... övervinna',
      'trött ... ignorera',
      'glad ... förstora'
    ],
    correctAnswer: 'oerfaren ... övervinna',
    explanation: '"Trots" signalerar en kontrast - att han var oerfaren men ändå lyckades övervinna hinder.',
    difficulty: 'medium',
  },
  {
    id: 'mek-2',
    sectionCode: 'MEK',
    questionNumber: 2,
    questionText: 'Hennes ____ personlighet gjorde att hon snabbt ____ många vänner.',
    questionType: 'multiple_choice',
    options: [
      'blyga ... förlorade',
      'utåtriktade ... fick',
      'stränga ... kritiserade',
      'tysta ... ignorerade'
    ],
    correctAnswer: 'utåtriktade ... fick',
    explanation: 'En utåtriktad personlighet leder logiskt till att man får många vänner.',
    difficulty: 'easy',
  },
  {
    id: 'mek-3',
    sectionCode: 'MEK',
    questionNumber: 3,
    questionText: 'Vetenskapliga ____ måste alltid kunna ____ av andra forskare.',
    questionType: 'multiple_choice',
    options: [
      'teorier ... förnekas',
      'resultat ... verifieras',
      'metoder ... ignoreras',
      'fakta ... döljas'
    ],
    correctAnswer: 'resultat ... verifieras',
    explanation: 'Vetenskapliga resultat måste kunna verifieras (bekräftas) av andra forskare för att anses giltiga.',
    difficulty: 'medium',
  },

  // XYZ - Diagram, tabeller & kartor
  {
    id: 'xyz-1',
    sectionCode: 'XYZ',
    questionNumber: 1,
    questionText: 'Ett stapeldiagram visar försäljningen för fyra månader: Jan: 100, Feb: 150, Mar: 125, Apr: 175. Hur stor är den procentuella ökningen från januari till april?',
    questionType: 'multiple_choice',
    options: ['50%', '75%', '25%', '100%'],
    correctAnswer: '75%',
    explanation: 'Ökningen är från 100 till 175, vilket är 75 enheter. 75/100 = 75% ökning.',
    difficulty: 'medium',
  },
  {
    id: 'xyz-2',
    sectionCode: 'XYZ',
    questionNumber: 2,
    questionText: 'En cirkeldiagram visar fördelningen av en budget: Personal 40%, Lokaler 25%, Material 20%, Övrigt 15%. Om totalbudgeten är 2 000 000 kr, hur mycket går till lokaler?',
    questionType: 'multiple_choice',
    options: ['400 000 kr', '500 000 kr', '800 000 kr', '300 000 kr'],
    correctAnswer: '500 000 kr',
    explanation: '25% av 2 000 000 = 0,25 × 2 000 000 = 500 000 kr.',
    difficulty: 'easy',
  },
  {
    id: 'xyz-3',
    sectionCode: 'XYZ',
    questionNumber: 3,
    questionText: 'En tabell visar temperaturer: Måndag 12°C, Tisdag 15°C, Onsdag 11°C, Torsdag 14°C, Fredag 18°C. Vad är medeltemperaturen?',
    questionType: 'multiple_choice',
    options: ['13°C', '14°C', '15°C', '12°C'],
    correctAnswer: '14°C',
    explanation: '(12 + 15 + 11 + 14 + 18) / 5 = 70 / 5 = 14°C.',
    difficulty: 'easy',
  },

  // KVA - Kvantitativ analys
  {
    id: 'kva-1',
    sectionCode: 'KVA',
    questionNumber: 1,
    questionText: 'Jämför: Kvantitet I: 3² + 4²  |  Kvantitet II: 5²',
    questionType: 'comparison',
    options: [
      'Kvantitet I är större',
      'Kvantitet II är större',
      'Kvantiteterna är lika',
      'Informationen är otillräcklig'
    ],
    correctAnswer: 'Kvantiteterna är lika',
    explanation: 'Kvantitet I: 9 + 16 = 25. Kvantitet II: 25. De är lika (Pythagoras trippel).',
    difficulty: 'medium',
  },
  {
    id: 'kva-2',
    sectionCode: 'KVA',
    questionNumber: 2,
    questionText: 'x > 0. Jämför: Kvantitet I: 2x  |  Kvantitet II: x²',
    questionType: 'comparison',
    options: [
      'Kvantitet I är större',
      'Kvantitet II är större',
      'Kvantiteterna är lika',
      'Informationen är otillräcklig'
    ],
    correctAnswer: 'Informationen är otillräcklig',
    explanation: 'Om x = 1: 2(1) = 2 > 1 = 1². Om x = 3: 2(3) = 6 < 9 = 3². Svaret beror på värdet av x.',
    difficulty: 'hard',
  },
  {
    id: 'kva-3',
    sectionCode: 'KVA',
    questionNumber: 3,
    questionText: 'Jämför: Kvantitet I: 0,5 × 0,5  |  Kvantitet II: 0,5 + 0,5',
    questionType: 'comparison',
    options: [
      'Kvantitet I är större',
      'Kvantitet II är större',
      'Kvantiteterna är lika',
      'Informationen är otillräcklig'
    ],
    correctAnswer: 'Kvantitet II är större',
    explanation: 'Kvantitet I: 0,5 × 0,5 = 0,25. Kvantitet II: 0,5 + 0,5 = 1,0. 1,0 > 0,25.',
    difficulty: 'easy',
  },

  // DTK - Data och teknisk förståelse
  {
    id: 'dtk-1',
    sectionCode: 'DTK',
    questionNumber: 1,
    questionText: 'En graf visar att företagets vinst ökade med 20% per år under 3 år. Om startvinsten var 1 miljon kr, vad är vinsten efter 3 år (avrundad)?',
    questionType: 'multiple_choice',
    options: ['1,6 miljoner kr', '1,73 miljoner kr', '1,44 miljoner kr', '1,2 miljoner kr'],
    correctAnswer: '1,73 miljoner kr',
    explanation: '1 × 1,2³ = 1 × 1,728 ≈ 1,73 miljoner kr.',
    difficulty: 'hard',
  },
  {
    id: 'dtk-2',
    sectionCode: 'DTK',
    questionNumber: 2,
    questionText: 'Data visar att 60% av 500 anställda pendlar med bil och 25% med kollektivtrafik. Resten cyklar. Hur många cyklar?',
    questionType: 'multiple_choice',
    options: ['75 personer', '125 personer', '50 personer', '100 personer'],
    correctAnswer: '75 personer',
    explanation: 'Bil + kollektivtrafik = 60% + 25% = 85%. Cykel = 15%. 15% av 500 = 75 personer.',
    difficulty: 'medium',
  },
  {
    id: 'dtk-3',
    sectionCode: 'DTK',
    questionNumber: 3,
    questionText: 'Ett linjediagram visar befolkningstillväxt. År 2000: 8 miljoner, År 2020: 10 miljoner. Vad är den genomsnittliga årliga tillväxten?',
    questionType: 'multiple_choice',
    options: ['100 000 per år', '50 000 per år', '200 000 per år', '150 000 per år'],
    correctAnswer: '100 000 per år',
    explanation: 'Ökning: 10 - 8 = 2 miljoner på 20 år. 2 000 000 / 20 = 100 000 per år.',
    difficulty: 'medium',
  },
];

export const getSectionByCode = (code: string): HPSectionConfig | undefined => {
  return HP_SECTIONS.find(s => s.code === code);
};

export const getQuestionsBySection = (sectionCode: string): HPQuestion[] => {
  return SAMPLE_HP_QUESTIONS.filter(q => q.sectionCode === sectionCode);
};

export const calculateHPScore = (correctAnswers: number, totalQuestions: number): number => {
  const rawScore = correctAnswers / totalQuestions;
  return Math.round(rawScore * 2 * 100) / 100;
};

export const getScoreLabel = (score: number): { label: string; description: string; color: string } => {
  const range = HP_SCORE_RANGES.find(r => score >= r.min && score <= r.max);
  return range || HP_SCORE_RANGES[0];
};
