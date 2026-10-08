import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse } from '@/utils/safeJsonParse';
import { logger } from '@/utils/logger';
import { 
  HP_SECTIONS, 
  calculateHPScore,
  HPSectionConfig,
  HPQuestion as LocalHPQuestion,
} from '@/constants/hogskoleprovet';
import { useHPQuestionBank } from '@/lib/hp-content';
import { fetchPerformances } from '@/lib/hp-training-store';
import { HPQuestionPerformance } from '@/lib/hp-training-engine';
import { shuffleAnswerOptions, shuffleQuestions } from '@/lib/question-utils';

export interface HPSection {
  id: string;
  section_code: string;
  section_name: string;
  description: string;
  time_limit_minutes: number;
  max_score: number;
  section_order: number;
}

export interface HPQuestion {
  id: string;
  test_id: string;
  section_id: string;
  question_number: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'diagram' | 'reading_comprehension' | 'comparison';
  options: string[];
  correct_answer: string;
  explanation?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  points: number;
  time_estimate_seconds: number;
  reading_passage?: string;
  diagram_url?: string;
}

export interface HPTest {
  id: string;
  test_date: string;
  test_season: 'spring' | 'fall';
  test_year: number;
  is_published: boolean;
  display_name?: string;
  norming_table?: Record<string, Record<string, number>>;
}

export interface UserHPAnswer {
  id: string;
  user_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_spent_seconds?: number;
  answered_at: string;
}

export interface UserHPAttempt {
  id: string;
  user_id: string;
  test_id?: string;
  section_id?: string;
  section_code?: string;
  attempt_type: 'full_test' | 'section_practice' | 'question_practice';
  status: 'in_progress' | 'completed' | 'abandoned';
  total_questions: number;
  correct_answers: number;
  score_percentage?: number;
  estimated_hp_score?: number;
  time_spent_minutes: number;
  started_at: string;
  completed_at?: string;
}

export interface HPUserStats {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  strongSections: string[];
  weakSections: string[];
  totalStudyTime: number;
  currentStreak: number;
  longestStreak: number;
  sectionStats: Record<string, {
    attempts: number;
    averageScore: number;
    bestScore: number;
    lastAttempt?: string;
  }>;
  unlockedMilestones: string[];
  estimatedHPScore: number;
  recentImprovement: number;
}

export interface HPSessionState {
  attemptId: string | null;
  sectionCode: string | null;
  testVersionId?: string;
  questions: LocalHPQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, { answer: string; timeSpent: number }>;
  startTime: number;
  timeRemaining: number;
  isPaused: boolean;
  isCompleted: boolean;
  isTrialMode?: boolean;
  trialId?: string;
}

const STORAGE_KEYS = {
  HP_STATS: 'hp_user_stats',
  HP_SESSION: 'hp_active_session',
  HP_STREAK: 'hp_streak_data',
  HP_MILESTONES: 'hp_unlocked_milestones',
};

/** Which half of the exam a full test covers. */
export type HPFullTestPart = 'verbal' | 'kvantitativ';

/** Official HP distribution per part: 40 questions / 55 minutes each. */
const FULL_TEST_PARTS: Record<HPFullTestPart, Array<{ code: string; count: number }>> = {
  verbal: [
    { code: 'ORD', count: 10 },
    { code: 'LÄS', count: 10 },
    { code: 'MEK', count: 10 },
    { code: 'ELF', count: 10 },
  ],
  kvantitativ: [
    { code: 'XYZ', count: 12 },
    { code: 'KVA', count: 10 },
    { code: 'NOG', count: 6 },
    { code: 'DTK', count: 12 },
  ],
};

const FULL_TEST_PART_MINUTES = 55;

interface PassageQuestionGroup {
  questions: LocalHPQuestion[];
  /** True when at least one question in the group has never been shown. */
  hasUnseen: boolean;
  /** Newest last-seen timestamp inside the group (null if entirely unseen). */
  lastSeenAt: string | null;
}

/**
 * Groups questions by passage. Reading-comprehension questions sharing a
 * passageGroup always travel together, ordered by orderInPassage; standalone
 * questions become singleton groups.
 */
const groupQuestions = (
  questions: LocalHPQuestion[],
  performances: Record<string, HPQuestionPerformance>
): PassageQuestionGroup[] => {
  const map = new Map<string, LocalHPQuestion[]>();
  for (const q of questions) {
    const key = q.passageGroup ? `${q.sectionCode}:${q.passageGroup}` : `solo:${q.id}`;
    const list = map.get(key);
    if (list) list.push(q);
    else map.set(key, [q]);
  }
  return Array.from(map.values()).map(qs => {
    qs.sort(
      (a, b) => (a.orderInPassage ?? Number.MAX_SAFE_INTEGER) - (b.orderInPassage ?? Number.MAX_SAFE_INTEGER)
    );
    let hasUnseen = false;
    let lastSeenAt: string | null = null;
    for (const q of qs) {
      const perf = performances[q.id];
      if (!perf || perf.timesSeen === 0) hasUnseen = true;
      if (perf?.lastSeenAt && (!lastSeenAt || perf.lastSeenAt > lastSeenAt)) {
        lastSeenAt = perf.lastSeenAt;
      }
    }
    return { questions: qs, hasUnseen, lastSeenAt };
  });
};

/**
 * Picks questions for one section: unseen questions first, then seen ones
 * ordered by how long ago they were shown. Whole passage groups are taken —
 * never a single question out of a passage — and the bank is never padded
 * with generated filler: if it holds fewer questions than requested, fewer
 * are returned.
 */
const pickQuestionsForSection = (
  sectionCode: string,
  count: number,
  difficulty: LocalHPQuestion['difficulty'] | undefined,
  bank: LocalHPQuestion[],
  performances: Record<string, HPQuestionPerformance>
): LocalHPQuestion[] => {
  const candidates = bank.filter(
    q => q.sectionCode === sectionCode && (!difficulty || q.difficulty === difficulty)
  );
  if (candidates.length === 0) return [];

  const groups = groupQuestions(candidates, performances);
  const unseen = shuffleQuestions(groups.filter(g => g.hasUnseen));
  const seen = groups
    .filter(g => !g.hasUnseen)
    .sort((a, b) => (a.lastSeenAt ?? '').localeCompare(b.lastSeenAt ?? ''));
  const ordered = [...unseen, ...seen];

  const picked: LocalHPQuestion[] = [];
  for (const group of ordered) {
    if (picked.length + group.questions.length > count) continue;
    picked.push(...group.questions);
    if (picked.length >= count) break;
  }

  // Every group was too big for the slot — take the smallest whole group so
  // the session still has content rather than nothing.
  if (picked.length === 0) {
    const smallest = [...ordered].sort((a, b) => a.questions.length - b.questions.length)[0];
    if (smallest) picked.push(...smallest.questions);
  }

  return picked.map(q => shuffleAnswerOptions(q));
};

interface HogskoleprovetContextValue {
  sections: HPSectionConfig[];
  isLoadingSections: boolean;
  
  getQuestionsBySection: (sectionCode: string, count?: number, difficulty?: LocalHPQuestion['difficulty']) => LocalHPQuestion[];
  getAllQuestionsForFullTest: (part?: HPFullTestPart) => LocalHPQuestion[];
  
  startPracticeSession: (sectionCode: string, isTrialMode?: boolean, trialId?: string) => Promise<string | null>;
  startFullTest: (isTrialMode?: boolean, trialId?: string, part?: HPFullTestPart) => Promise<string | null>;
  
  submitAnswer: (questionId: string, selectedAnswer: string, timeSpentSeconds: number) => void;
  
  completeSession: () => Promise<{
    totalQuestions: number;
    correctAnswers: number;
    scorePercentage: number;
    estimatedHPScore: number;
    timeSpentMinutes: number;
    sectionCode?: string;
    newMilestones: string[];
  } | null>;
  
  abandonSession: () => Promise<void>;
  
  sessionState: HPSessionState | null;
  setSessionState: React.Dispatch<React.SetStateAction<HPSessionState | null>>;
  
  getUserStats: () => HPUserStats;
  refreshStats: () => Promise<void>;
  
  getSectionProgress: (sectionCode: string) => {
    attempts: number;
    averageScore: number;
    bestScore: number;
    lastAttempt?: string;
  };
  
  getEstimatedHPScore: () => number;
  
  checkAndUnlockMilestones: () => string[];
  getUnlockedMilestones: () => string[];
  
  /** True while the question bank has not been fetched yet. */
  isBankLoading: boolean;
  
  isLoading: boolean;
}

const HogskoleprovetContext = createContext<HogskoleprovetContextValue | undefined>(undefined);

export function HogskoleprovetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { questions: questionBank, isLoading: isBankLoading } = useHPQuestionBank();

  // Shares the same query cache as HPTrainingContext — per-question stats
  // (times_seen / last_seen_at) drive the unseen-first selection.
  const performancesQuery = useQuery({
    queryKey: ['hp-question-performances', user?.id ?? null],
    queryFn: () => fetchPerformances(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
  });
  const performances: Record<string, HPQuestionPerformance> = performancesQuery.data ?? {};

  const [sessionState, setSessionState] = useState<HPSessionState | null>(null);
  const [userStats, setUserStats] = useState<HPUserStats>({
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    strongSections: [],
    weakSections: [],
    totalStudyTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    sectionStats: {},
    unlockedMilestones: [],
    estimatedHPScore: 0,
    recentImprovement: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('[HP] Loading stored data for user:', user.id);
      
      const [statsJson, sessionJson, milestonesJson] = await Promise.all([
        AsyncStorage.getItem(`${STORAGE_KEYS.HP_STATS}_${user.id}`),
        AsyncStorage.getItem(`${STORAGE_KEYS.HP_SESSION}_${user.id}`),
        AsyncStorage.getItem(`${STORAGE_KEYS.HP_MILESTONES}_${user.id}`),
      ]);

      if (statsJson) {
        const stats = safeJsonParse<Partial<HPUserStats>>(statsJson, {}, 'HPContext');
        setUserStats(prev => ({ ...prev, ...stats }));
      }

      if (sessionJson) {
        const session = safeJsonParse<HPSessionState | null>(sessionJson, null, 'HPContext');
        if (session && session.attemptId && !session.isCompleted) {
          setSessionState(session);
        }
      }

      if (milestonesJson) {
        const milestones = safeJsonParse<string[]>(milestonesJson, [], 'HPContext');
        setUserStats(prev => ({ ...prev, unlockedMilestones: milestones }));
      }

      await fetchStatsFromDatabaseLocal();
    } catch (error) {
      console.error('[HP] Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatsFromDatabaseLocal = async () => {
    if (!user?.id) return;

    try {
      const { data: attempts, error } = await supabase
        .from('hp_user_exam_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false }) as any;

      if (error) {
        console.error('[HP] Error fetching attempts:', error);
        return;
      }

      if (attempts && attempts.length > 0) {
        const sectionStatsLocal: Record<string, { attempts: number; totalScore: number; bestScore: number; lastAttempt?: string }> = {};
        let totalScore = 0;
        let bestScore = 0;
        let totalTime = 0;

        attempts.forEach((attempt: any) => {
          const score = attempt.normed_score ? attempt.normed_score * 50 : 0;
          totalScore += score;
          totalTime += Math.round((attempt.time_spent_seconds || 0) / 60);
          
          if (score > bestScore) bestScore = score;

          if (attempt.section_id) {
            const sectionCode = (attempt as any).section_code || 'unknown';
            if (!sectionStatsLocal[sectionCode]) {
              sectionStatsLocal[sectionCode] = { attempts: 0, totalScore: 0, bestScore: 0 };
            }
            sectionStatsLocal[sectionCode].attempts++;
            sectionStatsLocal[sectionCode].totalScore += score;
            if (score > sectionStatsLocal[sectionCode].bestScore) {
              sectionStatsLocal[sectionCode].bestScore = score;
            }
            if (!sectionStatsLocal[sectionCode].lastAttempt) {
              sectionStatsLocal[sectionCode].lastAttempt = attempt.completed_at || undefined;
            }
          }
        });

        const processedSectionStats: Record<string, { attempts: number; averageScore: number; bestScore: number; lastAttempt?: string }> = {};
        Object.entries(sectionStatsLocal).forEach(([code, stats]) => {
          processedSectionStats[code] = {
            attempts: stats.attempts,
            averageScore: stats.totalScore / stats.attempts,
            bestScore: stats.bestScore,
            lastAttempt: stats.lastAttempt,
          };
        });

        const sortedSections = Object.entries(processedSectionStats)
          .sort((a, b) => b[1].averageScore - a[1].averageScore);
        
        const strongSections = sortedSections.slice(0, 2).map(([code]) => code);
        const weakSections = sortedSections.slice(-2).reverse().map(([code]) => code);

        const estimatedHP = calculateHPScore(
          Math.round((totalScore / attempts.length) / 100 * 120),
          120
        );

        setUserStats(prev => ({
          ...prev,
          totalAttempts: attempts.length,
          averageScore: totalScore / attempts.length,
          bestScore,
          strongSections,
          weakSections,
          totalStudyTime: totalTime,
          sectionStats: processedSectionStats,
          estimatedHPScore: estimatedHP,
        }));
      }
    } catch (error) {
      console.error('[HP] Error processing database stats:', error);
    }
  };

  loadStoredData();
  }, [user?.id]);

  const fetchStatsFromDatabase = async () => {
    if (!user?.id) return;

    try {
      const { data: attempts, error } = await supabase
        .from('hp_user_exam_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false }) as any;

      if (error) {
        console.error('[HP] Error fetching attempts:', error);
        return;
      }

      if (attempts && attempts.length > 0) {
        const sectionStats: Record<string, { attempts: number; totalScore: number; bestScore: number; lastAttempt?: string }> = {};
        let totalScore = 0;
        let bestScore = 0;
        let totalTime = 0;

        attempts.forEach((attempt: any) => {
          const score = attempt.normed_score ? attempt.normed_score * 50 : 0;
          totalScore += score;
          totalTime += Math.round((attempt.time_spent_seconds || 0) / 60);
          
          if (score > bestScore) bestScore = score;

          if (attempt.section_id) {
            const sectionCode = (attempt as any).section_code || 'unknown';
            if (!sectionStats[sectionCode]) {
              sectionStats[sectionCode] = { attempts: 0, totalScore: 0, bestScore: 0 };
            }
            sectionStats[sectionCode].attempts++;
            sectionStats[sectionCode].totalScore += score;
            if (score > sectionStats[sectionCode].bestScore) {
              sectionStats[sectionCode].bestScore = score;
            }
            if (!sectionStats[sectionCode].lastAttempt) {
              sectionStats[sectionCode].lastAttempt = attempt.completed_at || undefined;
            }
          }
        });

        const processedSectionStats: Record<string, { attempts: number; averageScore: number; bestScore: number; lastAttempt?: string }> = {};
        Object.entries(sectionStats).forEach(([code, stats]) => {
          processedSectionStats[code] = {
            attempts: stats.attempts,
            averageScore: stats.totalScore / stats.attempts,
            bestScore: stats.bestScore,
            lastAttempt: stats.lastAttempt,
          };
        });

        const sortedSections = Object.entries(processedSectionStats)
          .sort((a, b) => b[1].averageScore - a[1].averageScore);
        
        const strongSections = sortedSections.slice(0, 2).map(([code]) => code);
        const weakSections = sortedSections.slice(-2).reverse().map(([code]) => code);

        const estimatedHP = calculateHPScore(
          Math.round((totalScore / attempts.length) / 100 * 120),
          120
        );

        const newStats: HPUserStats = {
          totalAttempts: attempts.length,
          averageScore: totalScore / attempts.length,
          bestScore,
          strongSections,
          weakSections,
          totalStudyTime: totalTime,
          currentStreak: userStats.currentStreak,
          longestStreak: userStats.longestStreak,
          sectionStats: processedSectionStats,
          unlockedMilestones: userStats.unlockedMilestones,
          estimatedHPScore: estimatedHP,
          recentImprovement: 0,
        };

        setUserStats(newStats);
        await AsyncStorage.setItem(`${STORAGE_KEYS.HP_STATS}_${user.id}`, JSON.stringify(newStats));
      }
    } catch (error) {
      console.error('[HP] Error processing database stats:', error);
    }
  };

  const getQuestionsBySection = useCallback((sectionCode: string, count: number = 40, difficulty?: LocalHPQuestion['difficulty']): LocalHPQuestion[] => {
    const selected = pickQuestionsForSection(sectionCode, count, difficulty, questionBank, performances);
    console.log('[HP] getQuestionsBySection', { sectionCode, requested: count, selected: selected.length });
    return selected;
  }, [questionBank, performances]);

  const getAllQuestionsForFullTest = useCallback((part?: HPFullTestPart): LocalHPQuestion[] => {
    const parts: HPFullTestPart[] = part ? [part] : ['verbal', 'kvantitativ'];
    const allQuestions: LocalHPQuestion[] = [];
    for (const p of parts) {
      for (const { code, count } of FULL_TEST_PARTS[p]) {
        allQuestions.push(...pickQuestionsForSection(code, count, undefined, questionBank, performances));
      }
    }
    console.log('[HP] getAllQuestionsForFullTest', { part: part ?? 'both', total: allQuestions.length });
    return allQuestions;
  }, [questionBank, performances]);

  const startPracticeSession = useCallback(async (sectionCode: string, isTrialMode?: boolean, trialId?: string): Promise<string | null> => {
    if (!user?.id) {
      Alert.alert('Fel', 'Du måste vara inloggad för att starta en övning');
      return null;
    }

    if (isBankLoading) {
      Alert.alert('Laddar', 'Frågebanken laddas – försök igen om en stund');
      return null;
    }

    try {
      console.log('[HP] Starting practice session for section:', sectionCode);
      
      const section = HP_SECTIONS.find(s => s.code === sectionCode);
      if (!section) {
        Alert.alert('Fel', 'Kunde inte hitta delprovet');
        return null;
      }

      const questions = getQuestionsBySection(sectionCode, section.questionCount || 20);
      
      if (questions.length === 0) {
        Alert.alert('Fel', 'Inga frågor tillgängliga för detta delprov');
        return null;
      }

      const attemptId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newSession: HPSessionState = {
        attemptId,
        sectionCode,
        questions,
        currentQuestionIndex: 0,
        answers: {},
        startTime: Date.now(),
        timeRemaining: section.timeMinutes * 60,
        isPaused: false,
        isCompleted: false,
        isTrialMode,
        trialId,
      };

      setSessionState(newSession);
      await AsyncStorage.setItem(`${STORAGE_KEYS.HP_SESSION}_${user.id}`, JSON.stringify(newSession));

      console.log('[HP] Practice session started:', attemptId);
      return attemptId;
    } catch (error) {
      console.error('[HP] Error starting practice session:', error);
      Alert.alert('Fel', 'Kunde inte starta övningen');
      return null;
    }
  }, [user?.id, isBankLoading, getQuestionsBySection]);

  const startFullTest = useCallback(async (isTrialMode?: boolean, trialId?: string, part?: HPFullTestPart): Promise<string | null> => {
    if (!user?.id) {
      Alert.alert('Fel', 'Du måste vara inloggad för att starta provet');
      return null;
    }

    if (isBankLoading) {
      Alert.alert('Laddar', 'Frågebanken laddas – försök igen om en stund');
      return null;
    }

    try {
      console.log('[HP] Starting full test', { part: part ?? 'both' });
      
      const allQuestions = getAllQuestionsForFullTest(part);
      if (allQuestions.length === 0) {
        Alert.alert('Fel', 'Inga frågor tillgängliga');
        return null;
      }

      const attemptId = `local_full_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const parts: HPFullTestPart[] = part ? [part] : ['verbal', 'kvantitativ'];
      const totalTime = FULL_TEST_PART_MINUTES * parts.length;

      const newSession: HPSessionState = {
        attemptId,
        sectionCode: null,
        questions: allQuestions,
        currentQuestionIndex: 0,
        answers: {},
        startTime: Date.now(),
        timeRemaining: totalTime * 60,
        isPaused: false,
        isCompleted: false,
        isTrialMode,
        trialId,
      };

      setSessionState(newSession);
      await AsyncStorage.setItem(`${STORAGE_KEYS.HP_SESSION}_${user.id}`, JSON.stringify(newSession));

      console.log('[HP] Full test started:', attemptId);
      return attemptId;
    } catch (error) {
      console.error('[HP] Error starting full test:', error);
      Alert.alert('Fel', 'Kunde inte starta provet');
      return null;
    }
  }, [user?.id, isBankLoading, getAllQuestionsForFullTest]);

  const checkMilestones = useCallback((
    sectionCode: string | null,
    scorePercentage: number,
    totalAttempts: number,
    currentUnlockedMilestones: string[],
    sectionsCount: number
  ): string[] => {
    const newlyUnlocked: string[] = [];
    const currentMilestones = [...currentUnlockedMilestones];

    if (sectionCode && !currentMilestones.includes('first_section')) {
      newlyUnlocked.push('first_section');
      currentMilestones.push('first_section');
    }

    if (!sectionCode && !currentMilestones.includes('first_full_test')) {
      newlyUnlocked.push('first_full_test');
      currentMilestones.push('first_full_test');
    }

    if (scorePercentage === 100 && !currentMilestones.includes('perfect_section')) {
      newlyUnlocked.push('perfect_section');
      currentMilestones.push('perfect_section');
    }

    if (sectionsCount >= 8 && !currentMilestones.includes('all_sections')) {
      newlyUnlocked.push('all_sections');
      currentMilestones.push('all_sections');
    }

    if (totalAttempts >= 5 && !currentMilestones.includes('five_tests')) {
      newlyUnlocked.push('five_tests');
      currentMilestones.push('five_tests');
    }

    if (newlyUnlocked.length > 0 && user?.id) {
      AsyncStorage.setItem(`${STORAGE_KEYS.HP_MILESTONES}_${user.id}`, JSON.stringify(currentMilestones));
      setUserStats(prev => ({ ...prev, unlockedMilestones: currentMilestones }));
    }

    return newlyUnlocked;
  }, [user?.id]);

  const submitAnswer = useCallback((questionId: string, selectedAnswer: string, timeSpentSeconds: number) => {
    if (!sessionState) return;

    const updatedAnswers = {
      ...sessionState.answers,
      [questionId]: { answer: selectedAnswer, timeSpent: timeSpentSeconds },
    };

    const updatedSession = {
      ...sessionState,
      answers: updatedAnswers,
    };

    setSessionState(updatedSession);

    if (user?.id) {
      AsyncStorage.setItem(`${STORAGE_KEYS.HP_SESSION}_${user.id}`, JSON.stringify(updatedSession));
    }
  }, [sessionState, user?.id]);

  const completeSession = useCallback(async () => {
    if (!sessionState || !user?.id) return null;

    try {
      console.log('[HP] Completing session');

      const { questions, answers, startTime, sectionCode } = sessionState;
      
      let correctAnswers = 0;
      questions.forEach(q => {
        const userAnswer = answers[q.id];
        if (userAnswer && userAnswer.answer === q.correctAnswer) {
          correctAnswers++;
        }
      });

      const totalQuestions = questions.length;
      const scorePercentage = (correctAnswers / totalQuestions) * 100;
      const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);
      const estimatedHPScore = calculateHPScore(correctAnswers, totalQuestions);

      try {
        await supabase
          .from('hp_user_exam_attempts')
          .insert({
            user_id: user.id,
            attempt_type: sectionCode ? 'section_practice' : 'full_test',
            status: 'completed',
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            raw_score: correctAnswers,
            time_spent_seconds: timeSpentMinutes * 60,
            completed_at: new Date().toISOString(),
          } as any);
      } catch (dbError) {
        console.error('[HP] Database insert error (continuing locally):', dbError);
      }

      const newMilestones = checkMilestones(
        sectionCode,
        scorePercentage,
        userStats.totalAttempts + 1,
        userStats.unlockedMilestones,
        Object.keys(userStats.sectionStats).length
      );

      const updatedStats = { ...userStats };
      updatedStats.totalAttempts++;
      updatedStats.totalStudyTime += timeSpentMinutes;
      
      const newAverage = (updatedStats.averageScore * (updatedStats.totalAttempts - 1) + scorePercentage) / updatedStats.totalAttempts;
      updatedStats.averageScore = newAverage;
      
      if (scorePercentage > updatedStats.bestScore) {
        updatedStats.bestScore = scorePercentage;
      }

      if (sectionCode) {
        if (!updatedStats.sectionStats[sectionCode]) {
          updatedStats.sectionStats[sectionCode] = {
            attempts: 0,
            averageScore: 0,
            bestScore: 0,
          };
        }
        const sectionStat = updatedStats.sectionStats[sectionCode];
        const newSectionAvg = (sectionStat.averageScore * sectionStat.attempts + scorePercentage) / (sectionStat.attempts + 1);
        sectionStat.attempts++;
        sectionStat.averageScore = newSectionAvg;
        if (scorePercentage > sectionStat.bestScore) {
          sectionStat.bestScore = scorePercentage;
        }
        sectionStat.lastAttempt = new Date().toISOString();
      }

      updatedStats.estimatedHPScore = calculateHPScore(
        Math.round(updatedStats.averageScore / 100 * 120),
        120
      );

      setUserStats(updatedStats);
      await AsyncStorage.setItem(`${STORAGE_KEYS.HP_STATS}_${user.id}`, JSON.stringify(updatedStats));

      setSessionState(null);
      await AsyncStorage.removeItem(`${STORAGE_KEYS.HP_SESSION}_${user.id}`);

      queryClient.invalidateQueries({ queryKey: ['hp-user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });

      console.log('[HP] Session completed:', {
        totalQuestions,
        correctAnswers,
        scorePercentage,
        estimatedHPScore,
        newMilestones,
      });

      return {
        totalQuestions,
        correctAnswers,
        scorePercentage,
        estimatedHPScore,
        timeSpentMinutes,
        sectionCode: sectionCode || undefined,
        newMilestones,
      };
    } catch (error) {
      console.error('[HP] Error completing session:', error);
      Alert.alert('Fel', 'Kunde inte spara resultatet');
      return null;
    }
  }, [sessionState, user?.id, userStats, queryClient, checkMilestones]);

  const abandonSession = useCallback(async () => {
    if (!user?.id) return;

    try {
      setSessionState(null);
      await AsyncStorage.removeItem(`${STORAGE_KEYS.HP_SESSION}_${user.id}`);
      console.log('[HP] Session abandoned');
    } catch (error) {
      console.error('[HP] Error abandoning session:', error);
    }
  }, [user?.id]);

  const checkAndUnlockMilestones = useCallback((): string[] => {
    return userStats.unlockedMilestones;
  }, [userStats.unlockedMilestones]);

  const getUnlockedMilestones = useCallback((): string[] => {
    return userStats.unlockedMilestones;
  }, [userStats.unlockedMilestones]);

  const getUserStats = useCallback((): HPUserStats => {
    return userStats;
  }, [userStats]);

  const refreshStats = useCallback(async () => {
    await fetchStatsFromDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const getSectionProgress = useCallback((sectionCode: string) => {
    return userStats.sectionStats[sectionCode] || {
      attempts: 0,
      averageScore: 0,
      bestScore: 0,
    };
  }, [userStats.sectionStats]);

  const getEstimatedHPScore = useCallback((): number => {
    return userStats.estimatedHPScore;
  }, [userStats.estimatedHPScore]);

  const value = useMemo(() => ({
    sections: HP_SECTIONS,
    isLoadingSections: false,
    
    getQuestionsBySection,
    getAllQuestionsForFullTest,
    startPracticeSession,
    startFullTest,
    submitAnswer,
    completeSession,
    abandonSession,
    sessionState,
    setSessionState,
    getUserStats,
    refreshStats,
    getSectionProgress,
    getEstimatedHPScore,
    checkAndUnlockMilestones,
    getUnlockedMilestones,
    isBankLoading,
    isLoading,
  }), [
    getQuestionsBySection,
    getAllQuestionsForFullTest,
    startPracticeSession,
    startFullTest,
    submitAnswer,
    completeSession,
    abandonSession,
    sessionState,
    getUserStats,
    refreshStats,
    getSectionProgress,
    getEstimatedHPScore,
    checkAndUnlockMilestones,
    getUnlockedMilestones,
    isBankLoading,
    isLoading,
  ]);

  return (
    <HogskoleprovetContext.Provider value={value}>
      {children}
    </HogskoleprovetContext.Provider>
  );
}

export function useHogskoleprovet() {
  const context = useContext(HogskoleprovetContext);
  if (!context) {
    throw new Error('useHogskoleprovet must be used within HogskoleprovetProvider');
  }
  return context;
}
