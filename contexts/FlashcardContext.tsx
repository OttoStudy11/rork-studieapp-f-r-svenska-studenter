import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { calculateSM2, getQualityFromSwipe } from '@/lib/sm2-algorithm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Flashcard {
  id: string;
  course_id: string;
  module_id?: string;
  lesson_id?: string;
  question: string;
  answer: string;
  difficulty: number;
  explanation?: string;
  context?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserFlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  last_reviewed_at?: string;
  next_review_at: string;
  quality?: number;
  total_reviews: number;
  correct_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardDeck {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  total_cards: number;
  created_at: string;
  updated_at: string;
}

interface FlashcardContextValue {
  flashcards: Flashcard[];
  isLoadingFlashcards: boolean;
  userProgress: Map<string, UserFlashcardProgress>;
  reviewCard: (flashcardId: string, correct: boolean) => Promise<void>;
  generateFlashcards: (courseId: string) => Promise<void>;
  getDueCards: (courseId: string) => Flashcard[];
  getProgress: (flashcardId: string) => UserFlashcardProgress | undefined;
  isGenerating: boolean;
}

const FlashcardContext = createContext<FlashcardContextValue | undefined>(undefined);

export function FlashcardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data: flashcards = [], isLoading: isLoadingFlashcards } = useQuery({
    queryKey: ['flashcards', selectedCourseId],
    queryFn: async () => {
      if (!selectedCourseId) return [];
      
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('course_id', selectedCourseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Flashcard[];
    },
    enabled: !!selectedCourseId,
  });

  const { data: progressData = [] } = useQuery({
    queryKey: ['flashcard-progress', user?.id, selectedCourseId],
    queryFn: async () => {
      if (!user?.id || !selectedCourseId) return [];

      const { data: flashcardsData } = await supabase
        .from('flashcards')
        .select('id')
        .eq('course_id', selectedCourseId);

      if (!flashcardsData || flashcardsData.length === 0) return [];

      const flashcardIds = flashcardsData.map((f) => f.id);

      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('flashcard_id', flashcardIds);

      if (error) throw error;
      return (data || []) as UserFlashcardProgress[];
    },
    enabled: !!user?.id && !!selectedCourseId,
  });

  const userProgress = React.useMemo(() => {
    const map = new Map<string, UserFlashcardProgress>();
    progressData.forEach((progress) => {
      map.set(progress.flashcard_id, progress);
    });
    return map;
  }, [progressData]);

  const reviewCardMutation = useMutation({
    mutationFn: async ({ flashcardId, correct }: { flashcardId: string; correct: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const existingProgress = userProgress.get(flashcardId);
      const quality = getQualityFromSwipe(correct);

      const sm2Result = calculateSM2(
        quality,
        existingProgress?.repetitions || 0,
        existingProgress?.ease_factor || 2.5,
        existingProgress?.interval || 0
      );

      const progressData = {
        user_id: user.id,
        flashcard_id: flashcardId,
        ease_factor: sm2Result.easeFactor,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: sm2Result.nextReview.toISOString(),
        quality,
        total_reviews: (existingProgress?.total_reviews || 0) + 1,
        correct_reviews: (existingProgress?.correct_reviews || 0) + (correct ? 1 : 0),
      };

      const { error } = await supabase
        .from('user_flashcard_progress')
        .upsert(progressData, {
          onConflict: 'user_id,flashcard_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-progress'] });
    },
  });

  const generateFlashcardsMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          modules (
            *,
            lessons (*)
          )
        `)
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      if (!courseData) throw new Error('Course not found');

      return { course: courseData, courseId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      setSelectedCourseId(null);
    },
  });

  const { mutateAsync: reviewCardMutateAsync } = reviewCardMutation;
  const { mutateAsync: generateFlashcardsMutateAsync } = generateFlashcardsMutation;

  const reviewCard = useCallback(
    async (flashcardId: string, correct: boolean) => {
      await reviewCardMutateAsync({ flashcardId, correct });
    },
    [reviewCardMutateAsync]
  );

  const generateFlashcards = useCallback(
    async (courseId: string) => {
      setSelectedCourseId(courseId);
      await generateFlashcardsMutateAsync(courseId);
    },
    [generateFlashcardsMutateAsync]
  );

  const getDueCards = useCallback(
    (courseId: string) => {
      const now = new Date();
      return flashcards.filter((card) => {
        const progress = userProgress.get(card.id);
        if (!progress) return true;
        return new Date(progress.next_review_at) <= now;
      });
    },
    [flashcards, userProgress]
  );

  const getProgress = useCallback(
    (flashcardId: string) => {
      return userProgress.get(flashcardId);
    },
    [userProgress]
  );

  return (
    <FlashcardContext.Provider
      value={{
        flashcards,
        isLoadingFlashcards,
        userProgress,
        reviewCard,
        generateFlashcards,
        getDueCards,
        getProgress,
        isGenerating: generateFlashcardsMutation.isPending,
      }}
    >
      {children}
    </FlashcardContext.Provider>
  );
}

export function useFlashcards() {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within FlashcardProvider');
  }
  return context;
}
