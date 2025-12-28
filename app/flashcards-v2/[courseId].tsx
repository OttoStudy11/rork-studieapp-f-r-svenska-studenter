import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FlashcardSwipe } from '@/components/FlashcardSwipe';
import { generateFlashcardsWithAI } from '@/lib/flashcard-ai-v2';
import {
  getCourseFlashcards,
  getUserFlashcardProgress,
  updateFlashcardProgress,
  saveFlashcardBatch,
  getFlashcardStats,
  UserFlashcardProgress,
} from '@/services/flashcards';
import { calculateSM2, getQualityFromSwipe } from '@/lib/sm2-algorithm';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Sparkles, BarChart3, BookOpen, RefreshCw, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

export default function FlashcardsScreenV2() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string | undefined>();
  const [generationCount, setGenerationCount] = useState(20);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');
  const { theme } = useTheme();

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;

      const { data, error } = await supabase
        .from('courses')
        .select('title, description, subject')
        .eq('id', courseId)
        .single();

      if (error) {
        console.log('📚 [Flashcards] Course not in DB, using courseId:', courseId);
        return null;
      }
      return data;
    },
    enabled: !!courseId,
  });

  const {
    data: flashcards = [],
    isLoading: isLoadingFlashcards,
  } = useQuery({
    queryKey: ['flashcards-v2', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { flashcards, error } = await getCourseFlashcards(courseId);
      if (error) throw new Error(error);
      return flashcards;
    },
    enabled: !!courseId,
  });

  const { data: progressData = [] } = useQuery({
    queryKey: ['flashcard-progress-v2', user?.id, courseId],
    queryFn: async () => {
      if (!user?.id || !courseId) return [];
      const { progress, error } = await getUserFlashcardProgress(user.id, courseId);
      if (error) throw new Error(error);
      return progress;
    },
    enabled: !!user?.id && !!courseId,
  });

  const { data: stats } = useQuery({
    queryKey: ['flashcard-stats', user?.id, courseId],
    queryFn: async () => {
      if (!user?.id || !courseId) {
        return { total: 0, reviewed: 0, mastered: 0, due: 0 };
      }
      return await getFlashcardStats(user.id, courseId);
    },
    enabled: !!user?.id && !!courseId,
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

  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    if (generationError) {
      const timer = setTimeout(() => setGenerationError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [generationError]);

  const generateMutation = useMutation({
    mutationFn: async (params: { count: number; customText?: string }) => {
      console.log('🚀 [Flashcards] Starting generation for:', courseId);
      setGenerationError(null);
      
      if (!courseId) {
        throw new Error('Ingen kurs vald');
      }

      let courseDescription = course?.description;
      if (params.customText && params.customText.trim()) {
        courseDescription = `${course?.description || ''}\n\nAnvändarens text att generera flashcards från:\n${params.customText}`;
      }

      console.log('📡 [Flashcards] Calling AI service...');
      const result = await generateFlashcardsWithAI({
        courseName: course?.title || courseId,
        courseDescription,
        subject: course?.subject,
        targetCount: params.count,
        difficulty: 'all',
        language: 'sv',
      });

      if (!result.success || result.flashcards.length === 0) {
        console.error('❌ [Flashcards] AI generation failed:', result.error);
        throw new Error(result.error || 'AI kunde inte generera flashcards. Försök igen.');
      }

      console.log(`✅ [Flashcards] Generated ${result.flashcards.length} flashcards, saving to database...`);

      const saveResult = await saveFlashcardBatch(result.flashcards, courseId);

      if (!saveResult.success) {
        console.error('❌ [Flashcards] Save failed:', saveResult.error);
        throw new Error(saveResult.error || 'Kunde inte spara flashcards i databasen.');
      }

      console.log(`✅ [Flashcards] Saved ${saveResult.savedCount} flashcards`);
      return saveResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards-v2', courseId] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-stats'] });
      setShowCustomInput(false);
      setCustomText('');
      setGenerationError(null);
      Alert.alert('✅ Klart!', `${data.savedCount} flashcards har genererats och sparats!`);
    },
    onError: (error: any) => {
      console.error('❌ [Flashcards] Generation failed:', error);
      const errorMessage = error?.message || 'Ett oväntat fel uppstod.';
      setGenerationError(errorMessage);
      Alert.alert(
        'Kunde inte generera flashcards',
        errorMessage,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Försök igen', 
            onPress: () => generateMutation.mutate({ count: generationCount }), 
            style: 'cancel' 
          }
        ]
      );
    },
  });

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

      return await updateFlashcardProgress(
        user.id,
        flashcardId,
        {
          easeFactor: sm2Result.easeFactor,
          interval: sm2Result.interval,
          repetitions: sm2Result.repetitions,
          nextReview: sm2Result.nextReview,
          quality,
          correct,
        },
        existingProgress
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-progress-v2'] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-stats'] });
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

  if (isLoadingFlashcards) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Laddar flashcards...</Text>
      </View>
    );
  }

  if (flashcards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#F1F5F9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Flashcards</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <BookOpen size={80} color="#6366F1" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Inga flashcards än</Text>
          <Text style={styles.emptyText}>
            Generera intelligenta flashcards med AI baserat på {course?.title || 'din kurs'}
          </Text>

          <View style={styles.countSelector}>
            <Text style={styles.countLabel}>Antal flashcards</Text>
            <View style={styles.countButtons}>
              {[10, 20, 30, 50].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countButton,
                    generationCount === count && styles.countButtonActive,
                  ]}
                  onPress={() => setGenerationCount(count)}
                >
                  <Text
                    style={[
                      styles.countButtonText,
                      generationCount === count && styles.countButtonTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {generationError && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color="#F87171" />
              <Text style={styles.errorBannerText}>{generationError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => generateMutation.mutate({ count: generationCount })}
            disabled={generateMutation.isPending}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.generateGradient}
            >
              {generateMutation.isPending ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.generateButtonText}>Genererar flashcards...</Text>
                </>
              ) : (
                <>
                  <Sparkles size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>Generera Flashcards</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {generateMutation.isPending && (
            <Text style={styles.generatingHint}>
              AI:n skapar {generationCount} flashcards baserat på kursinnehåll...
            </Text>
          )}

          <TouchableOpacity
            style={[styles.customTextButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => setShowCustomInput(true)}
            disabled={generateMutation.isPending}
          >
            <Text style={[styles.customTextButtonText, { color: theme.colors.primary }]}>
              📝 Generera från egen text
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal
          visible={showCustomInput}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCustomInput(false)}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity onPress={() => setShowCustomInput(false)}>
                <Text style={[styles.modalCancel, { color: theme.colors.textSecondary }]}>Avbryt</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Egen text</Text>
              <TouchableOpacity 
                onPress={() => {
                  if (customText.trim().length < 20) {
                    Alert.alert('För lite text', 'Skriv minst 20 tecken för att generera bra flashcards.');
                    return;
                  }
                  generateMutation.mutate({ count: generationCount, customText });
                }}
                disabled={generateMutation.isPending || customText.trim().length < 20}
              >
                <Text style={[
                  styles.modalDone, 
                  { color: (generateMutation.isPending || customText.trim().length < 20) ? theme.colors.textMuted : theme.colors.primary }
                ]}>
                  Generera
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
                Klistra in text från anteckningar, lärobok eller sammanfattning. AI:n kommer att skapa flashcards baserat på innehållet.
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={customText}
                onChangeText={setCustomText}
                placeholder="Skriv eller klistra in text här...\n\nExempel:\nFotosyntesen är processen där växter använder solenergi för att omvandla koldioxid och vatten till glukos och syrgas."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                textAlignVertical="top"
                autoFocus
              />
              <Text style={[styles.charCount, { color: theme.colors.textMuted }]}>
                {customText.length} tecken (minst 20 behövs)
              </Text>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  if (currentIndex >= dueCards.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
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
                <Text style={styles.statValue}>{stats?.total || 0}</Text>
                <Text style={styles.statLabel}>Totalt</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.reviewed || 0}</Text>
                <Text style={styles.statLabel}>Granskade</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.mastered || 0}</Text>
                <Text style={styles.statLabel}>Behärskade</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>Tillbaka</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.generateMoreButton}
              onPress={() => {
                setCurrentIndex(0);
                generateMutation.mutate({ count: 20 });
              }}
              disabled={generateMutation.isPending}
            >
              <RefreshCw size={16} color="#E0E7FF" />
              <Text style={styles.generateMoreText}>Generera fler</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
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
            flashcard={dueCards[currentIndex]}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
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
  countSelector: {
    width: '100%',
    marginTop: 32,
  },
  countLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
    textAlign: 'center',
  },
  countButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  countButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
  },
  countButtonActive: {
    backgroundColor: '#312E81',
    borderColor: '#6366F1',
  },
  countButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  countButtonTextActive: {
    color: '#C7D2FE',
  },
  generateButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  generateMoreButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  generateMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E7FF',
  },
  customTextButton: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  customTextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCancel: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  textInput: {
    minHeight: 200,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
  },
  charCount: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'right' as const,
  },
  errorBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  errorBannerText: {
    flex: 1,
    color: '#F87171',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  generatingHint: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center' as const,
    marginTop: 12,
    fontStyle: 'italic' as const,
  },
});
