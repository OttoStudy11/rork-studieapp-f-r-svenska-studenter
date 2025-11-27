import React, { createContext, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

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
  question_type: 'multiple_choice' | 'true_false' | 'diagram' | 'reading_comprehension';
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
  attempt_type: 'full_test' | 'section_practice' | 'question_practice';
  status: 'in_progress' | 'completed' | 'abandoned';
  total_questions: number;
  correct_answers: number;
  score_percentage?: number;
  time_spent_minutes: number;
  started_at: string;
  completed_at?: string;
}

interface HogskoleprovetContextValue {
  sections: HPSection[];
  tests: HPTest[];
  isLoadingSections: boolean;
  isLoadingTests: boolean;
  getQuestionsBySection: (sectionId: string, testId?: string) => Promise<HPQuestion[]>;
  submitAnswer: (questionId: string, selectedAnswer: string, timeSpentSeconds: number) => Promise<boolean>;
  startAttempt: (type: 'full_test' | 'section_practice' | 'question_practice', sectionId?: string, testId?: string) => Promise<string | null>;
  completeAttempt: (attemptId: string, totalQuestions: number, correctAnswers: number, timeSpentMinutes?: number) => Promise<void>;
  getUserStats: () => Promise<{ totalAttempts: number; averageScore: number; strongSections: string[]; weakSections: string[] }>;
}

const HogskoleprovetContext = createContext<HogskoleprovetContextValue | undefined>(undefined);

export function HogskoleprovetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading: isLoadingSections } = useQuery({
    queryKey: ['hp-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hp_sections')
        .select('*')
        .order('section_order');

      if (error) throw error;
      return (data || []) as HPSection[];
    },
  });

  const { data: tests = [], isLoading: isLoadingTests } = useQuery({
    queryKey: ['hp-tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hp_tests')
        .select('*')
        .eq('is_published', true)
        .order('test_date', { ascending: false });

      if (error) throw error;
      return (data || []) as HPTest[];
    },
  });

  const getQuestionsBySection = useCallback(async (sectionId: string, testId?: string): Promise<HPQuestion[]> => {
    try {
      let query = supabase
        .from('hp_questions')
        .select('*')
        .eq('section_id', sectionId)
        .order('question_number');

      if (testId) {
        query = query.eq('test_id', testId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      })) as HPQuestion[];
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  }, []);

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, selectedAnswer, timeSpentSeconds, correctAnswer }: {
      questionId: string;
      selectedAnswer: string;
      timeSpentSeconds: number;
      correctAnswer: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const isCorrect = selectedAnswer === correctAnswer;

      const { error } = await supabase
        .from('user_hp_question_answers')
        .insert({
          user_id: user.id,
          question_id: questionId,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_spent_seconds: timeSpentSeconds,
        });

      if (error) throw error;

      return isCorrect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hp-user-stats'] });
    },
  });

  const submitAnswer = useCallback(
    async (questionId: string, selectedAnswer: string, timeSpentSeconds: number): Promise<boolean> => {
      const question = await supabase
        .from('hp_questions')
        .select('correct_answer')
        .eq('id', questionId)
        .single();

      if (question.error || !question.data) {
        console.error('Error fetching question:', question.error);
        return false;
      }

      const isCorrect = await submitAnswerMutation.mutateAsync({
        questionId,
        selectedAnswer,
        timeSpentSeconds,
        correctAnswer: question.data.correct_answer,
      });

      return isCorrect;
    },
    [submitAnswerMutation.mutateAsync]
  );

  const startAttemptMutation = useMutation({
    mutationFn: async ({ type, sectionId, testId }: {
      type: 'full_test' | 'section_practice' | 'question_practice';
      sectionId?: string;
      testId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_hp_test_attempts')
        .insert({
          user_id: user.id,
          test_id: testId || null,
          section_id: sectionId || null,
          attempt_type: type,
          status: 'in_progress',
          total_questions: 0,
          correct_answers: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    },
  });

  const startAttempt = useCallback(
    async (type: 'full_test' | 'section_practice' | 'question_practice', sectionId?: string, testId?: string): Promise<string | null> => {
      try {
        const attemptId = await startAttemptMutation.mutateAsync({ type, sectionId, testId });
        return attemptId;
      } catch (error) {
        console.error('Error starting attempt:', error);
        Alert.alert('Fel', 'Kunde inte starta övningen');
        return null;
      }
    },
    [startAttemptMutation.mutateAsync]
  );

  const completeAttemptMutation = useMutation({
    mutationFn: async ({ attemptId, totalQuestions, correctAnswers, timeSpentMinutes }: {
      attemptId: string;
      totalQuestions: number;
      correctAnswers: number;
      timeSpentMinutes: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      const { error } = await supabase
        .from('user_hp_test_attempts')
        .update({
          status: 'completed',
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          score_percentage: scorePercentage,
          time_spent_minutes: timeSpentMinutes,
          completed_at: new Date().toISOString(),
        })
        .eq('id', attemptId)
        .eq('user_id', user.id);

      if (error) throw error;

      const points = Math.round(correctAnswers * 10);
      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('total_points')
        .eq('user_id', user.id)
        .single();

      if (currentProgress) {
        await supabase
          .from('user_progress')
          .update({
            total_points: (currentProgress.total_points || 0) + points,
          })
          .eq('user_id', user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hp-user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    },
  });

  const completeAttempt = useCallback(
    async (attemptId: string, totalQuestions: number, correctAnswers: number, timeSpentMinutes: number = 0) => {
      try {
        await completeAttemptMutation.mutateAsync({ attemptId, totalQuestions, correctAnswers, timeSpentMinutes });
      } catch (error) {
        console.error('Error completing attempt:', error);
      }
    },
    [completeAttemptMutation.mutateAsync]
  );

  const getUserStats = useCallback(async () => {
    if (!user?.id) {
      return { totalAttempts: 0, averageScore: 0, strongSections: [], weakSections: [] };
    }

    try {
      const { data: attempts, error } = await supabase
        .from('user_hp_test_attempts')
        .select('*, hp_sections(section_name, section_code)')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (error) throw error;

      const totalAttempts = attempts?.length || 0;
      const averageScore = totalAttempts > 0
        ? attempts!.reduce((sum, a) => sum + (a.score_percentage || 0), 0) / totalAttempts
        : 0;

      const sectionScores = new Map<string, { total: number; count: number; name: string }>();
      attempts?.forEach(attempt => {
        if (attempt.section_id && attempt.hp_sections) {
          const sectionName = (attempt.hp_sections as any).section_name;
          const current = sectionScores.get(attempt.section_id) || { total: 0, count: 0, name: sectionName };
          current.total += attempt.score_percentage || 0;
          current.count += 1;
          sectionScores.set(attempt.section_id, current);
        }
      });

      const sectionAverages = Array.from(sectionScores.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          average: data.total / data.count,
        }))
        .sort((a, b) => b.average - a.average);

      const strongSections = sectionAverages.slice(0, 3).map(s => s.name);
      const weakSections = sectionAverages.slice(-3).reverse().map(s => s.name);

      return { totalAttempts, averageScore, strongSections, weakSections };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { totalAttempts: 0, averageScore: 0, strongSections: [], weakSections: [] };
    }
  }, [user?.id]);

  return (
    <HogskoleprovetContext.Provider
      value={{
        sections,
        tests,
        isLoadingSections,
        isLoadingTests,
        getQuestionsBySection,
        submitAnswer,
        startAttempt,
        completeAttempt,
        getUserStats,
      }}
    >
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
