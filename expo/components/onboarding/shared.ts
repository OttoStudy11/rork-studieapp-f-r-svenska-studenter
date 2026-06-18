import type { Gymnasium, GymnasiumGrade } from '@/constants/gymnasiums';
import type { GymnasiumProgram } from '@/constants/gymnasium-programs';
import type { GymnasiumCourse } from '@/constants/gymnasium-courses';
import type { KomvuxCourse } from '@/constants/komvux-courses';
import type { University, UniversityProgram, UniversityProgramYear } from '@/constants/universities';
import type { AvatarConfig } from '@/constants/avatar-config';
import type { PurchasesPackage } from 'react-native-purchases';

export interface OnboardingData {
  username: string;
  displayName: string;
  studyLevel: 'gymnasie' | 'högskola' | 'komvux' | '';
  gymnasium: Gymnasium | null;
  gymnasiumProgram: GymnasiumProgram | null;
  gymnasiumGrade: GymnasiumGrade | null;
  university: University | null;
  universityProgram: UniversityProgram | null;
  universityProgramType: string | null;
  universityYear: UniversityProgramYear | null;
  program: string;
  goals: string[];
  problems: string[];
  selectedCourses: Set<string>;
  year: 1 | 2 | 3 | null;
  avatarConfig: AvatarConfig;
  dailyGoalMinutes: number;
  stressLevel: number;
  acceptedTerms: boolean;
}

export type StepName = 'welcome' | 'profile' | 'intro' | 'level' | 'school' | 'problems' | 'stress' | 'notalone' | 'dailygoal' | 'goals' | 'wow' | 'socialproof' | 'testimonials' | 'paywall';

export interface StepProps {
  step: StepName;
  data: OnboardingData;
  setData: (d: OnboardingData) => void;
  usernameAvailable: boolean | null;
  checkingUsername: boolean;
  checkUsername: (u: string) => void;
  availableCourses: GymnasiumCourse[];
  gymnasiumSearch: string;
  setGymnasiumSearch: (s: string) => void;
  universitySearch: string;
  setUniversitySearch: (s: string) => void;
  komvuxSubjectFilter: string;
  setKomvuxSubjectFilter: (s: string) => void;
  testimonialDisplay: number;
  setTestimonialDisplay: (n: number) => void;
  offerings: PurchasesPackage[];
  selectedPkg: 'annual' | 'monthly';
  setSelectedPkg: (t: 'annual' | 'monthly') => void;
  isPurchasing: boolean;
  isRestoringPurchase: boolean;
  onPurchase: () => void;
  onRestore: () => void;
  onSkip: () => void;
}

export const EDUCATION_PATHS = [
  {
    id: 'gymnasie',
    label: 'Gymnasiet',
    sub: 'Naturvetenskap, Teknik, Samhäll...',
    emoji: '📚',
    color: '#10B981',
    bgColor: '#ECFDF5',
    description: 'Välj program, kurs och lägg upp din gymnasieskolgång steg för steg.',
  },
  {
    id: 'högskola',
    label: 'Högskola / Universitet',
    sub: 'Kandidat, Civilingenjör, Master...',
    emoji: '🎓',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    description: 'Koppla ditt program, välj termin och hämta rekommenderade kurser automatiskt.',
  },
  {
    id: 'komvux',
    label: 'Komvux',
    sub: 'Komplettera betyg, läsa upp kurser...',
    emoji: '🏫',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    description: 'Välj exakt de kurser du ska läsa och get en personlig studieplan.',
  },
] as const;

export const PROBLEMS = [
  { id: 'procrastination', label: 'Svårt att komma igång', emoji: '😰' },
  { id: 'memory', label: 'För mycket att komma ihåg', emoji: '📚' },
  { id: 'time', label: 'Dålig tidsplanering', emoji: '⏰' },
  { id: 'motivation', label: 'Låg motivation', emoji: '😴' },
  { id: 'focus', label: 'Svårt att fokusera', emoji: '📝' },
  { id: 'start', label: 'Vet inte var jag ska börja', emoji: '🎯' },
];

export const GOALS = [
  { id: 'better_grades', label: 'Bättre betyg', emoji: '🎯' },
  { id: 'hp_score', label: 'Högre HP-poäng', emoji: '📈' },
  { id: 'less_stress', label: 'Mindre stress', emoji: '😌' },
  { id: 'routines', label: 'Bättre studierutiner', emoji: '💪' },
  { id: 'memory', label: 'Komma ihåg mer', emoji: '🧠' },
  { id: 'save_time', label: 'Spara tid', emoji: '⏰' },
  { id: 'dreams', label: 'Nå mina drömmar', emoji: '🏆' },
];

export const DAILY_MINS = [
  { value: 15, label: '15 minuter', note: '' },
  { value: 30, label: '30 minuter', note: 'REKOMMENDERAD' },
  { value: 45, label: '45 minuter', note: '' },
  { value: 60, label: '60 minuter', note: '' },
  { value: 90, label: '90+ minuter', note: '' },
];

export const TESTIMONIALS = [
  {
    text: 'StudieStugan hjälpte mig höja mitt HP-resultat från 1.0 till 1.6!',
    name: 'Emma',
    age: 19,
    city: 'Stockholm',
  },
  {
    text: 'Äntligen en app som förstår hur stressigt det är att plugga. AI-flashcards är magiska!',
    name: 'Viktor',
    age: 20,
    city: 'Göteborg',
  },
  {
    text: 'Quizzen sparade mig timmar inför tentan. 10/10 rekommenderar!',
    name: 'Erik',
    age: 18,
    city: 'Gävle',
  },
];

export const BG = '#FFFFFF';
export const BG2 = '#F2F2F7';
export const TEXT1 = '#1C1C1E';
export const TEXT2 = '#636366';
export const TEXT3 = '#AEAEB2';
export const ACCENT = '#10B981';
export const DARK_BTN = '#1C1C1E';
export const BORDER = '#E5E5EA';

export function getStressEmoji(val: number): string {
  if (val <= 2) return '😌';
  if (val <= 4) return '🙂';
  if (val <= 6) return '😐';
  if (val <= 8) return '😟';
  return '😰';
}

export function getStressLabel(val: number): string {
  if (val <= 2) return 'Jag är ganska lugn.';
  if (val <= 4) return 'Jag känner lite stress ibland.';
  if (val <= 6) return 'Jag känner mig stressad ibland.';
  if (val <= 8) return 'Jag känner mig ofta stressad.';
  return 'Jag är extremt stressad inför prov.';
}
