import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  HP_SECTIONS, 
  SAMPLE_HP_QUESTIONS, 
  calculateHPScore,
  HPSectionConfig,
  HPQuestion as LocalHPQuestion,
  HP_TEST_VERSIONS,
  HPTestVersion,
} from '@/constants/hogskoleprovet';
import { EXTENDED_HP_QUESTIONS } from '@/constants/hogskoleprovet-questions-extended';
import { ALL_HP_QUESTIONS } from '@/constants/hogskoleprovet-questions';
import { shuffleAnswerOptions } from '@/lib/question-utils';
import { generateHPQuestionBank } from '@/lib/hp-question-generator';

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
}

const STORAGE_KEYS = {
  HP_STATS: 'hp_user_stats',
  HP_SESSION: 'hp_active_session',
  HP_STREAK: 'hp_streak_data',
  HP_MILESTONES: 'hp_unlocked_milestones',
};

interface HogskoleprovetContextValue {
  sections: HPSectionConfig[];
  isLoadingSections: boolean;
  
  availableTestVersions: HPTestVersion[];
  getTestVersionsBySection: (sectionCode: string) => HPTestVersion[];
  
  getQuestionsBySection: (sectionCode: string, count?: number) => LocalHPQuestion[];
  getQuestionsByTestVersion: (testVersionId: string) => LocalHPQuestion[];
  getAllQuestionsForFullTest: () => LocalHPQuestion[];
  
  startPracticeSession: (sectionCode: string, testVersionId?: string) => Promise<string | null>;
  startFullTest: () => Promise<string | null>;
  
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
  
  isLoading: boolean;
}

const HogskoleprovetContext = createContext<HogskoleprovetContextValue | undefined>(undefined);

export function HogskoleprovetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
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
        const stats = JSON.parse(statsJson);
        setUserStats(prev => ({ ...prev, ...stats }));
        console.log('[HP] Loaded stats:', stats);
      }

      if (sessionJson) {
        const session = JSON.parse(sessionJson);
        if (session && session.attemptId && !session.isCompleted) {
          setSessionState(session);
          console.log('[HP] Restored active session');
        }
      }

      if (milestonesJson) {
        const milestones = JSON.parse(milestonesJson);
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
        .from('user_hp_test_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('[HP] Error fetching attempts:', error);
        return;
      }

      if (attempts && attempts.length > 0) {
        const sectionStatsLocal: Record<string, { attempts: number; totalScore: number; bestScore: number; lastAttempt?: string }> = {};
        let totalScore = 0;
        let bestScore = 0;
        let totalTime = 0;

        attempts.forEach(attempt => {
          const score = attempt.score_percentage || 0;
          totalScore += score;
          totalTime += attempt.time_spent_minutes || 0;
          
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
        .from('user_hp_test_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('[HP] Error fetching attempts:', error);
        return;
      }

      if (attempts && attempts.length > 0) {
        const sectionStats: Record<string, { attempts: number; totalScore: number; bestScore: number; lastAttempt?: string }> = {};
        let totalScore = 0;
        let bestScore = 0;
        let totalTime = 0;

        attempts.forEach(attempt => {
          const score = attempt.score_percentage || 0;
          totalScore += score;
          totalTime += attempt.time_spent_minutes || 0;
          
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

  const getQuestionsBySection = useCallback((sectionCode: string, count: number = 40): LocalHPQuestion[] => {
    const staticQuestions = [...SAMPLE_HP_QUESTIONS, ...EXTENDED_HP_QUESTIONS, ...ALL_HP_QUESTIONS];
    const generatedQuestions = generateHPQuestionBank({ sectionCode, count: Math.max(240, count * 6) });

    const questions = [...staticQuestions, ...generatedQuestions].filter(q => q.sectionCode === sectionCode);
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(count, questions.length));

    console.log('[HP] getQuestionsBySection', { sectionCode, requested: count, available: questions.length, selected: selectedQuestions.length });

    return selectedQuestions.map(q => shuffleAnswerOptions(q));
  }, []);

  const getQuestionsByTestVersion = useCallback((testVersionId: string): LocalHPQuestion[] => {
    const staticQuestions = [...SAMPLE_HP_QUESTIONS, ...EXTENDED_HP_QUESTIONS, ...ALL_HP_QUESTIONS];

    const baseVersionQuestions = staticQuestions.filter(q => q.testVersion === testVersionId);
    if (baseVersionQuestions.length >= 20) {
      console.log('[HP] getQuestionsByTestVersion using static', { testVersionId, count: baseVersionQuestions.length });
      return baseVersionQuestions.map(q => shuffleAnswerOptions(q));
    }

    const sectionCode = HP_TEST_VERSIONS.find(v => v.id === testVersionId)?.sectionCode;
    if (!sectionCode) {
      console.warn('[HP] getQuestionsByTestVersion could not resolve sectionCode', { testVersionId });
      return baseVersionQuestions.map(q => shuffleAnswerOptions(q));
    }

    const needed = Math.max(0, 20 - baseVersionQuestions.length);
    const generatedTopUp = generateHPQuestionBank({ sectionCode, count: Math.max(needed * 8, 80), testVersion: testVersionId }).slice(0, needed);

    console.log('[HP] getQuestionsByTestVersion top-up', {
      testVersionId,
      sectionCode,
      staticCount: baseVersionQuestions.length,
      generatedCount: generatedTopUp.length,
    });

    return [...baseVersionQuestions, ...generatedTopUp].map(q => shuffleAnswerOptions(q));
  }, []);

  const getTestVersionsBySection = useCallback((sectionCode: string): HPTestVersion[] => {
    return HP_TEST_VERSIONS.filter(v => v.sectionCode === sectionCode);
  }, []);

  const getAllQuestionsForFullTest = useCallback((): LocalHPQuestion[] => {
    const allQuestions: LocalHPQuestion[] = [];

    const staticQuestions = [...SAMPLE_HP_QUESTIONS, ...EXTENDED_HP_QUESTIONS, ...ALL_HP_QUESTIONS];

    HP_SECTIONS.forEach(section => {
      const generated = generateHPQuestionBank({ sectionCode: section.code, count: 260 });
      const sectionQuestions = [...staticQuestions, ...generated].filter(q => q.sectionCode === section.code);

      const shuffled = [...sectionQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(20, sectionQuestions.length));

      console.log('[HP] FullTest section pick', {
        sectionCode: section.code,
        available: sectionQuestions.length,
        selected: selected.length,
      });

      allQuestions.push(...selected.map(q => shuffleAnswerOptions(q)));
    });

    console.log('[HP] getAllQuestionsForFullTest', { total: allQuestions.length });

    return allQuestions;
  }, []);

  const startPracticeSession = useCallback(async (sectionCode: string, testVersionId?: string): Promise<string | null> => {
    if (!user?.id) {
      Alert.alert('Fel', 'Du måste vara inloggad för att starta en övning');
      return null;
    }

    try {
      console.log('[HP] Starting practice session for section:', sectionCode);
      
      const section = HP_SECTIONS.find(s => s.code === sectionCode);
      if (!section) {
        Alert.alert('Fel', 'Kunde inte hitta delprovet');
        return null;
      }

      let questions: LocalHPQuestion[];
      if (testVersionId) {
        questions = getQuestionsByTestVersion(testVersionId);
        const targetCount = section.questionCount || 20;
        if (questions.length > targetCount) {
          const shuffled = [...questions].sort(() => Math.random() - 0.5);
          questions = shuffled.slice(0, targetCount);
        }
        console.log('[HP] Using test version:', testVersionId, 'questions:', questions.length);
      } else {
        questions = getQuestionsBySection(sectionCode, section.questionCount || 20);
      }
      
      if (questions.length === 0) {
        Alert.alert('Fel', 'Inga frågor tillgängliga för detta delprov');
        return null;
      }

      const attemptId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newSession: HPSessionState = {
        attemptId,
        sectionCode,
        testVersionId,
        questions,
        currentQuestionIndex: 0,
        answers: {},
        startTime: Date.now(),
        timeRemaining: section.timeMinutes * 60,
        isPaused: false,
        isCompleted: false,
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
  }, [user?.id, getQuestionsBySection, getQuestionsByTestVersion]);

  const startFullTest = useCallback(async (): Promise<string | null> => {
    if (!user?.id) {
      Alert.alert('Fel', 'Du måste vara inloggad för att starta provet');
      return null;
    }

    try {
      console.log('[HP] Starting full test');
      
      const allQuestions = getAllQuestionsForFullTest();
      if (allQuestions.length === 0) {
        Alert.alert('Fel', 'Inga frågor tillgängliga');
        return null;
      }

      const attemptId = `local_full_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const totalTime = HP_SECTIONS.reduce((sum, s) => sum + s.timeMinutes, 0);

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
  }, [user?.id, getAllQuestionsForFullTest]);

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

    if (sectionsCount >= 6 && !currentMilestones.includes('all_sections')) {
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
          .from('user_hp_test_attempts')
          .insert({
            user_id: user.id,
            section_code: sectionCode,
            attempt_type: sectionCode ? 'section_practice' : 'full_test',
            status: 'completed',
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            score_percentage: scorePercentage,
            time_spent_minutes: timeSpentMinutes,
            completed_at: new Date().toISOString(),
          });
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
    
    availableTestVersions: HP_TEST_VERSIONS,
    getTestVersionsBySection,
    
    getQuestionsBySection,
    getQuestionsByTestVersion,
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
    isLoading,
  }), [
    getQuestionsBySection,
    getQuestionsByTestVersion,
    getTestVersionsBySection,
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
