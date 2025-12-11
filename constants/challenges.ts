export type ChallengeCadence = 'daily' | 'weekly' | 'seasonal';
export type ChallengeCategory = 'focus' | 'habit' | 'social' | 'knowledge';

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  cadence: ChallengeCadence;
  rewardPoints: number;
  target: number;
  unit: string;
  icon: string;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'focus-25',
    title: 'Laserfokus',
    description: 'Slutför 3 fokussessioner på minst 25 minuter samma dag',
    category: 'focus',
    cadence: 'daily',
    rewardPoints: 60,
    target: 3,
    unit: 'sessioner',
    icon: '🔥',
    color: '#FDBA74',
    difficulty: 'medium',
  },
  {
    id: 'focus-90',
    title: 'Maratonpass',
    description: 'Studera totalt 90 minuter utan att bryta streaken',
    category: 'focus',
    cadence: 'weekly',
    rewardPoints: 120,
    target: 90,
    unit: 'minuter',
    icon: '⏱️',
    color: '#FCD34D',
    difficulty: 'hard',
  },
  {
    id: 'habit-streak',
    title: '3-dagars streak',
    description: 'Logga in och slutför minst en aktivitet tre dagar i rad',
    category: 'habit',
    cadence: 'weekly',
    rewardPoints: 80,
    target: 3,
    unit: 'dagar',
    icon: '📆',
    color: '#A5B4FC',
    difficulty: 'medium',
  },
  {
    id: 'habit-notes',
    title: 'Reflektionsjournal',
    description: 'Skapa 2 anteckningar med reflektioner denna vecka',
    category: 'habit',
    cadence: 'weekly',
    rewardPoints: 70,
    target: 2,
    unit: 'anteckningar',
    icon: '📝',
    color: '#F9A8D4',
    difficulty: 'easy',
  },
  {
    id: 'knowledge-review',
    title: 'Kunskapslyft',
    description: 'Repetera 5 flashcards för en kurs',
    category: 'knowledge',
    cadence: 'daily',
    rewardPoints: 40,
    target: 5,
    unit: 'kort',
    icon: '🧠',
    color: '#93C5FD',
    difficulty: 'easy',
  },
  {
    id: 'knowledge-module',
    title: 'Avsluta en modul',
    description: 'Klara en hel modul i valfri kurs denna vecka',
    category: 'knowledge',
    cadence: 'weekly',
    rewardPoints: 150,
    target: 1,
    unit: 'moduler',
    icon: '📚',
    color: '#86EFAC',
    difficulty: 'hard',
  },
  {
    id: 'social-friend',
    title: 'Peppa en vän',
    description: 'Skicka ett meddelande eller dela framsteg med en vän',
    category: 'social',
    cadence: 'daily',
    rewardPoints: 30,
    target: 1,
    unit: 'delningar',
    icon: '🤝',
    color: '#FBCFE8',
    difficulty: 'easy',
  },
  {
    id: 'social-compare',
    title: 'Topplista',
    description: 'Klättra minst en plats på vänlistans leaderboard',
    category: 'social',
    cadence: 'weekly',
    rewardPoints: 110,
    target: 1,
    unit: 'placeringar',
    icon: '🏆',
    color: '#FDE68A',
    difficulty: 'medium',
  },
];

export const getTemplatesByCadence = (cadence: ChallengeCadence) => CHALLENGE_TEMPLATES.filter((template) => template.cadence === cadence);
