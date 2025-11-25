import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FlashcardSwipe } from '@/components/FlashcardSwipe';
import { generateFlashcardsFromContent, generateAIExplanation } from '@/lib/flashcard-ai';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Sparkles, BarChart3, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { calculateSM2, getQualityFromSwipe } from '@/lib/sm2-algorithm';

interface Flashcard {
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
  created_at?: string;
  updated_at?: string;
}

interface UserFlashcardProgress {
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
}

export default function FlashcardsScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string | undefined>();
  const [isExplaining, setIsExplaining] = useState(false);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single();

      if (error) {
        console.log('Course not found in DB, might be hardcoded:', courseId);
        return null;
      }
      return data;
    },
    enabled: !!courseId,
  });

  const { data: flashcards = [], isLoading } = useQuery({
    queryKey: ['flashcards', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Flashcard[];
    },
  });

  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting flashcard generation for course:', courseId);
      if (!courseId) {
        throw new Error('Ingen kurs vald');
      }
      
      await generateFlashcardsFromContent({
        courseId: courseId,
        count: 30,
      });
    },
    onSuccess: () => {
      console.log('Flashcards generated successfully');
      queryClient.invalidateQueries({ queryKey: ['flashcards', courseId] });
      Alert.alert('Klart! 🎉', 'Flashcards har genererats. Du kan börja träna nu!');
    },
    onError: (error: any) => {
      console.error('Failed to generate flashcards:', error);
      
      let errorMessage = 'Ett okänt fel uppstod';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      console.error('Formatted error message:', errorMessage);
      Alert.alert('Kunde inte generera flashcards', errorMessage);
    },
  });

  React.useEffect(() => {
    if (!isLoading && flashcards.length === 0 && courseId && !generateMutation.isPending && !hasAttemptedGeneration) {
      console.log('Auto-generating flashcards for course:', courseId);
      setHasAttemptedGeneration(true);
      generateMutation.mutate();
    }
  }, [isLoading, flashcards.length, courseId, generateMutation.isPending, hasAttemptedGeneration]);

  const { data: progressData = [] } = useQuery({
    queryKey: ['flashcard-progress', user?.id, courseId],
    queryFn: async () => {
      if (!user?.id) return [];

      const flashcardIds = flashcards.map((f) => f.id);
      if (flashcardIds.length === 0) return [];

      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('flashcard_id', flashcardIds);

      if (error) throw error;
      return (data || []) as UserFlashcardProgress[];
    },
    enabled: !!user?.id && flashcards.length > 0,
  });

  const progressMap = React.useMemo(() => {
    const map = new Map<string, UserFlashcardProgress>();
    progressData.forEach((progress) => {
      map.set(progress.flashcard_id, progress);
    });
    return map;
  }, [progressData]);

  const dueCards = React.useMemo(() => {
    const now = new Date();
    return flashcards.filter((card) => {
      const progress = progressMap.get(card.id);
      if (!progress) return true;
      return new Date(progress.next_review_at) <= now;
    });
  }, [flashcards, progressMap]);

  const reviewMutation = useMutation({
    mutationFn: async ({ flashcardId, correct }: { flashcardId: string; correct: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const existingProgress = progressMap.get(flashcardId);
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

  const handleSwipeLeft = async () => {
    if (currentIndex < dueCards.length) {
      await reviewMutation.mutateAsync({
        flashcardId: dueCards[currentIndex].id,
        correct: false,
      });
      setCurrentIndex((prev) => prev + 1);
      setAiExplanation(undefined);
    }
  };

  const handleSwipeRight = async () => {
    if (currentIndex < dueCards.length) {
      await reviewMutation.mutateAsync({
        flashcardId: dueCards[currentIndex].id,
        correct: true,
      });
      setCurrentIndex((prev) => prev + 1);
      setAiExplanation(undefined);
    }
  };

  const handleExplain = async () => {
    const card = dueCards[currentIndex];
    if (!card) return;

    setIsExplaining(true);
    try {
      const explanation = await generateAIExplanation(card.question, card.answer);
      setAiExplanation(explanation);
    } catch (error: any) {
      Alert.alert('Fel', 'Kunde inte generera förklaring: ' + error.message);
    } finally {
      setIsExplaining(false);
    }
  };

  const stats = React.useMemo(() => {
    const total = flashcards.length;
    const reviewed = progressData.length;
    const mastered = progressData.filter((p) => p.repetitions >= 3).length;
    const due = dueCards.length;

    return { total, reviewed, mastered, due };
  }, [flashcards, progressData, dueCards]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#F1F5F9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flashcards</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.emptyContainer}>
          <BookOpen size={80} color="#6366F1" />
          <Text style={styles.emptyTitle}>Inga flashcards än</Text>
          <Text style={styles.emptyText}>
            Generera flashcards från {course?.title || 'denna kurs'} med AI
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.generateGradient}
            >
              {generateMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Sparkles size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>Generera Flashcards</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= dueCards.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#F1F5F9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flashcards</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.completedContainer}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.completedCard}
          >
            <Text style={styles.completedEmoji}>🎉</Text>
            <Text style={styles.completedTitle}>Bra jobbat!</Text>
            <Text style={styles.completedText}>
              Du har gått igenom alla flashcards för idag
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.reviewed}</Text>
                <Text style={styles.statLabel}>Granskade</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.mastered}</Text>
                <Text style={styles.statLabel}>Behärskade</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.back()}
            >
              <Text style={styles.doneButtonText}>Tillbaka</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#F1F5F9" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{course?.title || 'Flashcards'}</Text>
          <Text style={styles.headerSubtitle}>
            {currentIndex + 1} / {dueCards.length}
          </Text>
        </View>
        <TouchableOpacity style={styles.statsButton}>
          <BarChart3 size={24} color="#F1F5F9" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / dueCards.length) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.swipeContainer}>
        {dueCards[currentIndex] && (
          <FlashcardSwipe
            flashcard={{
              ...dueCards[currentIndex],
              created_at: dueCards[currentIndex].created_at || new Date().toISOString(),
              updated_at: dueCards[currentIndex].updated_at || new Date().toISOString()
            }}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onExplain={handleExplain}
            isExplaining={isExplaining}
            explanation={aiExplanation}
          />
        )}
      </View>

      <View style={styles.instructions}>
        <View style={styles.instructionItem}>
          <View style={[styles.instructionDot, { backgroundColor: '#F87171' }]} />
          <Text style={styles.instructionText}>Swipe vänster = Visa igen</Text>
        </View>
        <View style={styles.instructionItem}>
          <View style={[styles.instructionDot, { backgroundColor: '#4ADE80' }]} />
          <Text style={styles.instructionText}>Swipe höger = Jag kunde det</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  statsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
  },
  swipeContainer: {
    flex: 1,
    marginTop: 20,
  },
  instructions: {
    paddingHorizontal: 40,
    paddingVertical: 24,
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  instructionText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1F5F9',
    marginTop: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  generateButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  completedCard: {
    width: '100%',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  completedEmoji: {
    fontSize: 64,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginTop: 16,
  },
  completedText: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#C7D2FE',
    marginTop: 4,
  },
  doneButton: {
    marginTop: 32,
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
});
