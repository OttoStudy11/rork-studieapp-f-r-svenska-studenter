import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { FlashcardSwipe } from '@/components/FlashcardSwipe';
import { generateFlashcardsWithAI } from '@/lib/flashcard-ai-v2';
import * as ImagePicker from 'expo-image-picker';
import { extractTextFromImage } from '@/lib/vision-ai';
import { ArrowLeft, Sparkles, BookOpen, RefreshCw, AlertCircle, Plus, Camera, ImageIcon, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { PremiumGate } from '@/components/PremiumGate';
import { FreemiumBanner, FreemiumLimitReached } from '@/components/FreemiumBanner';
import { useFreemiumLimits } from '@/hooks/useFreemiumLimits';

// Local flashcard type for session-only storage (compatible with FlashcardSwipe)
interface LocalFlashcard {
  id: string;
  course_id: string;
  question: string;
  answer: string;
  difficulty: number;
  explanation?: string;
  context?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export default function FlashcardsScreenV2() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const freemium = useFreemiumLimits();
  const flashcardLimit = freemium.checkFlashcards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string | undefined>();
  const [generationCount, setGenerationCount] = useState(20);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');
  const [motivationalIndex, setMotivationalIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [extractingText, setExtractingText] = useState(false);
  const { theme } = useTheme();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const previousCourseId = useRef<string | undefined>(undefined);
  
  // LOCAL STATE ONLY - flashcards are not persisted to database
  const [localFlashcards, setLocalFlashcards] = useState<LocalFlashcard[]>([]);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [correctCards, setCorrectCards] = useState<Set<string>>(new Set());

  // Reset state when courseId changes
  useEffect(() => {
    if (courseId && courseId !== previousCourseId.current) {
      console.log('🎴 Flashcard courseId changed:', courseId);
      setCurrentIndex(0);
      setAiExplanation(undefined);
      setLocalFlashcards([]);
      setReviewedCards(new Set());
      setCorrectCards(new Set());
      previousCourseId.current = courseId;
    }
  }, [courseId]);

  const motivationalMessages = [
    '🧠 AI:n analyserar kursmaterialet...',
    '✨ Skapar smarta frågor baserat på viktiga koncept...',
    '📚 Optimerar svårighetsgraden för bästa inlärning...',
    '🎯 Nästan klart! Färdigställer dina flashcards...',
    '💡 Bra jobbat att du använder flashcards för att lära dig!',
    '🚀 Flashcards är ett bevisat effektivt sätt att memorera!',
  ];

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

  // Local stats computed from session state
  const stats = React.useMemo(() => ({
    total: localFlashcards.length,
    reviewed: reviewedCards.size,
    mastered: correctCards.size,
    due: localFlashcards.length - reviewedCards.size,
  }), [localFlashcards.length, reviewedCards.size, correctCards.size]);

  // All cards are available for study (no spaced repetition since local only)
  const cardsToStudy = localFlashcards;

  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

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
      setGenerationProgress(0);
      
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
      }, (progress) => {
        setGenerationProgress(progress);
      });

      if (!result.success || result.flashcards.length === 0) {
        console.error('❌ [Flashcards] AI generation failed:', result.error);
        throw new Error(result.error || 'AI kunde inte generera flashcards. Försök igen.');
      }

      console.log(`✅ [Flashcards] Generated ${result.flashcards.length} flashcards (local only, not saved to DB)`);
      
      // Convert to local flashcards with unique IDs
      const now = new Date().toISOString();
      const newLocalFlashcards: LocalFlashcard[] = result.flashcards.map((fc, index) => ({
        id: `local-${Date.now()}-${index}`,
        course_id: courseId,
        question: fc.question,
        answer: fc.answer,
        difficulty: fc.difficulty,
        explanation: fc.explanation,
        context: fc.context,
        tags: fc.tags,
        created_at: now,
        updated_at: now,
      }));

      return { flashcards: newLocalFlashcards, count: newLocalFlashcards.length };
    },
    onSuccess: (data) => {
      // Add new flashcards to local state
      setLocalFlashcards(prev => [...data.flashcards, ...prev]);
      setCurrentIndex(0);
      setReviewedCards(new Set());
      setCorrectCards(new Set());
      setShowCustomInput(false);
      setCustomText('');
      setGenerationError(null);
      setGenerationProgress(0);
      Alert.alert('✅ Klart!', `${data.count} flashcards har genererats!\n\nOBS: Flashcards sparas endast under denna session.`);
    },
    onError: (error: any) => {
      console.error('❌ [Flashcards] Generation failed:', error);
      const errorMessage = error?.message || 'Ett oväntat fel uppstod.';
      setGenerationError(errorMessage);
      setGenerationProgress(0);
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

  React.useEffect(() => {
    if (generateMutation.isPending) {
      const interval = setInterval(() => {
        setMotivationalIndex((prev) => (prev + 1) % motivationalMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setMotivationalIndex(0);
    }
  }, [generateMutation.isPending, motivationalMessages.length]);

  // Local review tracking (no database persistence)
  const handleReview = useCallback((flashcardId: string, correct: boolean) => {
    setReviewedCards(prev => new Set(prev).add(flashcardId));
    if (correct) {
      setCorrectCards(prev => new Set(prev).add(flashcardId));
    }
  }, []);

  const handleSwipeLeft = useCallback(() => {
    if (currentIndex < cardsToStudy.length) {
      handleReview(cardsToStudy[currentIndex].id, false);
      setCurrentIndex((prev) => prev + 1);
      setAiExplanation(undefined);
    }
  }, [currentIndex, cardsToStudy, handleReview]);

  const handleSwipeRight = useCallback(() => {
    if (currentIndex < cardsToStudy.length) {
      handleReview(cardsToStudy[currentIndex].id, true);
      setCurrentIndex((prev) => prev + 1);
      setAiExplanation(undefined);
    }
  }, [currentIndex, cardsToStudy, handleReview]);

  if (localFlashcards.length === 0) {
    if (!flashcardLimit.isPremium && !flashcardLimit.isAllowed) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['#1E1B4B', '#0F172A', '#0F172A']}
            locations={[0, 0.3, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Stack.Screen options={{ headerShown: false }} />
          <FreemiumLimitReached
            feature="flashcards"
            status={flashcardLimit}
            onGoBack={() => router.back()}
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1E1B4B', '#0F172A', '#0F172A']}
          locations={[0, 0.3, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <Text style={styles.countLabel}>Hur många flashcards vill du ha?</Text>
            <Text style={styles.countHint}>Fler flashcards = djupare förståelse</Text>
            <View style={styles.countButtons}>
              {[10, 15, 20, 25, 30].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countButton,
                    generationCount === count && styles.countButtonActive,
                  ]}
                  onPress={() => setGenerationCount(count)}
                  disabled={generateMutation.isPending}
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
                  <Text style={styles.generateButtonText}>Genererar {generationCount} flashcards...</Text>
                </>
              ) : (
                <>
                  <Sparkles size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>Generera {generationCount} Flashcards</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {generateMutation.isPending && (
            <View style={styles.progressContainer}>
              <View style={styles.progressIndicator}>
                <ActivityIndicator size="large" color="#6366F1" />
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${generationProgress}%` }]} />
              </View>
              
              <Text style={styles.progressPercentage}>{generationProgress}%</Text>
              
              <View style={styles.motivationalContainer}>
                <Text style={styles.motivationalText}>
                  {motivationalMessages[motivationalIndex]}
                </Text>
              </View>
              
              <View style={styles.tipContainer}>
                <Text style={styles.tipTitle}>💡 Visste du att:</Text>
                <Text style={styles.tipText}>
                  Studier visar att du minns 80% bättre när du använder flashcards
                  jämfört med traditionell läsning.
                </Text>
              </View>
              
              <Text style={styles.dontLeaveText}>
                ⏳ Stanna kvar - tar bara {Math.ceil((30 - generationProgress) / 10)}–{Math.ceil((50 - generationProgress) / 10)} sekunder...
              </Text>
            </View>
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
          onRequestClose={() => {
            setShowCustomInput(false);
            setSelectedImages([]);
          }}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity onPress={() => {
                setShowCustomInput(false);
                setSelectedImages([]);
              }}>
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
                  setSelectedImages([]);
                }}
                disabled={generateMutation.isPending || (customText.trim().length < 20 && selectedImages.length === 0)}
              >
                <Text style={[
                  styles.modalDone, 
                  { color: (generateMutation.isPending || (customText.trim().length < 20 && selectedImages.length === 0)) ? theme.colors.textMuted : theme.colors.primary }
                ]}>
                  Generera
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
                Klistra in text från anteckningar, lärobok eller sammanfattning. Eller ladda upp bilder så extraherar AI:n texten automatiskt!
              </Text>
              
              {selectedImages.length > 0 && (
                <View style={styles.imagePreviewContainer}>
                  <Text style={[styles.imagePreviewTitle, { color: theme.colors.text }]}>
                    📸 Uppladdade bilder ({selectedImages.length})
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewScroll}>
                    {selectedImages.map((imageUri, index) => (
                      <View key={index} style={styles.imagePreviewItem}>
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => {
                            setSelectedImages(prev => prev.filter((_, i) => i !== index));
                          }}
                        >
                          <X size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              <View style={styles.imageButtonsRow}>
                <TouchableOpacity
                  style={[styles.imageButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={async () => {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') {
                      Alert.alert('Tillåtelse behövs', 'Vi behöver tillgång till kameran för att ta foton.');
                      return;
                    }
                    
                    const result = await ImagePicker.launchCameraAsync({
                      mediaTypes: 'images' as any,
                      quality: 0.8,
                      allowsEditing: true,
                    });
                    
                    if (!result.canceled && result.assets[0]) {
                      setSelectedImages(prev => [...prev, result.assets[0].uri]);
                      
                      setExtractingText(true);
                      try {
                        const extractedText = await extractTextFromImage(result.assets[0].uri);
                        if (extractedText) {
                          setCustomText(prev => prev ? `${prev}\n\n${extractedText}` : extractedText);
                        }
                      } catch {
                        Alert.alert('Kunde inte läsa text', 'Försök med en tydligare bild.');
                      } finally {
                        setExtractingText(false);
                      }
                    }
                  }}
                  disabled={extractingText}
                >
                  <Camera size={20} color={theme.colors.primary} />
                  <Text style={[styles.imageButtonText, { color: theme.colors.primary }]}>Ta foto</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.imageButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={async () => {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== 'granted') {
                      Alert.alert('Tillåtelse behövs', 'Vi behöver tillgång till ditt fotoalbum.');
                      return;
                    }
                    
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: 'images' as any,
                      quality: 0.8,
                      allowsEditing: true,
                      allowsMultipleSelection: false,
                    });
                    
                    if (!result.canceled && result.assets[0]) {
                      setSelectedImages(prev => [...prev, result.assets[0].uri]);
                      
                      setExtractingText(true);
                      try {
                        const extractedText = await extractTextFromImage(result.assets[0].uri);
                        if (extractedText) {
                          setCustomText(prev => prev ? `${prev}\n\n${extractedText}` : extractedText);
                        }
                      } catch {
                        Alert.alert('Kunde inte läsa text', 'Försök med en tydligare bild.');
                      } finally {
                        setExtractingText(false);
                      }
                    }
                  }}
                  disabled={extractingText}
                >
                  <ImageIcon size={20} color={theme.colors.primary} />
                  <Text style={[styles.imageButtonText, { color: theme.colors.primary }]}>Välj från galleri</Text>
                </TouchableOpacity>
              </View>
              
              {extractingText && (
                <View style={styles.extractingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.extractingText, { color: theme.colors.textSecondary }]}>
                    Läser text från bild...
                  </Text>
                </View>
              )}
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
      </View>
    );
  }

  if (currentIndex >= cardsToStudy.length) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1E1B4B', '#0F172A', '#0F172A']}
          locations={[0, 0.3, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
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
              Du har gått igenom alla flashcards!
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Totalt</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.reviewed}</Text>
                <Text style={styles.statLabel}>Granskade</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.mastered}</Text>
                <Text style={styles.statLabel}>Rätt</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.reviewAllButton} 
              onPress={() => {
                setCurrentIndex(0);
                setReviewedCards(new Set());
                setCorrectCards(new Set());
              }}
            >
              <Text style={styles.reviewAllButtonText}>Börja om</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>Tillbaka</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.generateMoreButton}
              onPress={() => setShowGenerateModal(true)}
              disabled={generateMutation.isPending}
            >
              <RefreshCw size={16} color="#E0E7FF" />
              <Text style={styles.generateMoreText}>Generera fler</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E1B4B', '#0F172A', '#0F172A']}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#F1F5F9" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{course?.title || 'Flashcards'}</Text>
          <Text style={styles.headerSubtitle}>
            {currentIndex + 1} / {cardsToStudy.length}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowGenerateModal(true)}
        >
          <Plus size={24} color="#F1F5F9" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentIndex + 1) / cardsToStudy.length) * 100}%` },
          ]}
        />
      </View>

      <View style={styles.swipeContainer}>
        {cardsToStudy[currentIndex] && (
          <FlashcardSwipe
            flashcard={cardsToStudy[currentIndex]}
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

      <Modal
        visible={showGenerateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGenerateModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setShowGenerateModal(false)}>
              <Text style={[styles.modalCancel, { color: theme.colors.textSecondary }]}>Stäng</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Skapa Flashcards</Text>
            <View style={{ width: 60 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Välj hur du vill skapa flashcards</Text>
            
            <TouchableOpacity
              style={[styles.generationOptionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => {
                setShowGenerateModal(false);
                setTimeout(() => {
                  setShowCustomInput(true);
                }, 300);
              }}
              disabled={generateMutation.isPending}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: '#6366F1' }]}>
                <Text style={styles.optionIcon}>📝</Text>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Egen text eller bild</Text>
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>Klistra in text eller ladda upp bilder från dina anteckningar</Text>
              </View>
              <ArrowLeft size={20} color={theme.colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>eller</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </View>

            <View style={[styles.generationOptionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.optionIconContainer, { backgroundColor: '#8B5CF6' }]}>
                <Sparkles size={20} color="#fff" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>AI-genererat från kursen</Text>
                <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>Låt AI:n skapa flashcards baserat på kursmaterialet</Text>
              </View>
            </View>

            <View style={styles.countSelector}>
              <Text style={[styles.countLabel, { color: theme.colors.text }]}>Hur många flashcards?</Text>
              <View style={styles.countButtons}>
                {[10, 15, 20, 25, 30].map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.countButton,
                      { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                      generationCount === count && styles.countButtonActive,
                    ]}
                    onPress={() => setGenerationCount(count)}
                    disabled={generateMutation.isPending}
                  >
                    <Text
                      style={[
                        styles.countButtonText,
                        { color: theme.colors.textSecondary },
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
              onPress={() => {
                generateMutation.mutate({ count: generationCount });
                setShowGenerateModal(false);
              }}
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
                    <Text style={styles.generateButtonText}>Genererar...</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} color="#fff" />
                    <Text style={styles.generateButtonText}>Generera {generationCount} Flashcards</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showCustomInput}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowCustomInput(false);
          setSelectedImages([]);
        }}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => {
              setShowCustomInput(false);
              setSelectedImages([]);
            }}>
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
                setSelectedImages([]);
                setShowCustomInput(false);
              }}
              disabled={generateMutation.isPending || (customText.trim().length < 20 && selectedImages.length === 0)}
            >
              <Text style={[
                styles.modalDone, 
                { color: (generateMutation.isPending || (customText.trim().length < 20 && selectedImages.length === 0)) ? theme.colors.textMuted : theme.colors.primary }
              ]}>
                Generera
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
              Klistra in text från anteckningar, lärobok eller sammanfattning. Eller ladda upp bilder så extraherar AI:n texten automatiskt!
            </Text>
            
            {selectedImages.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                <Text style={[styles.imagePreviewTitle, { color: theme.colors.text }]}>
                  📸 Uppladdade bilder ({selectedImages.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewScroll}>
                  {selectedImages.map((imageUri, index) => (
                    <View key={index} style={styles.imagePreviewItem}>
                      <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => {
                          setSelectedImages(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <X size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            
            <View style={styles.imageButtonsRow}>
              <TouchableOpacity
                style={[styles.imageButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={async () => {
                  const { status } = await ImagePicker.requestCameraPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Tillåtelse behövs', 'Vi behöver tillgång till kameran för att ta foton.');
                    return;
                  }
                  
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: 'images' as any,
                    quality: 0.8,
                    allowsEditing: true,
                  });
                  
                  if (!result.canceled && result.assets[0]) {
                    setSelectedImages(prev => [...prev, result.assets[0].uri]);
                    
                    setExtractingText(true);
                    try {
                      const extractedText = await extractTextFromImage(result.assets[0].uri);
                      if (extractedText) {
                        setCustomText(prev => prev ? `${prev}\n\n${extractedText}` : extractedText);
                      }
                    } catch {
                      Alert.alert('Kunde inte läsa text', 'Försök med en tydligare bild.');
                    } finally {
                      setExtractingText(false);
                    }
                  }
                }}
                disabled={extractingText}
              >
                <Camera size={20} color={theme.colors.primary} />
                <Text style={[styles.imageButtonText, { color: theme.colors.primary }]}>Ta foto</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.imageButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={async () => {
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Tillåtelse behövs', 'Vi behöver tillgång till ditt fotoalbum.');
                    return;
                  }
                  
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: 'images' as any,
                    quality: 0.8,
                    allowsEditing: true,
                    allowsMultipleSelection: false,
                  });
                  
                  if (!result.canceled && result.assets[0]) {
                    setSelectedImages(prev => [...prev, result.assets[0].uri]);
                    
                    setExtractingText(true);
                    try {
                      const extractedText = await extractTextFromImage(result.assets[0].uri);
                      if (extractedText) {
                        setCustomText(prev => prev ? `${prev}\n\n${extractedText}` : extractedText);
                      }
                    } catch {
                      Alert.alert('Kunde inte läsa text', 'Försök med en tydligare bild.');
                    } finally {
                      setExtractingText(false);
                    }
                  }
                }}
                disabled={extractingText}
              >
                <ImageIcon size={20} color={theme.colors.primary} />
                <Text style={[styles.imageButtonText, { color: theme.colors.primary }]}>Välj från galleri</Text>
              </TouchableOpacity>
            </View>
            
            {extractingText && (
              <View style={styles.extractingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.extractingText, { color: theme.colors.textSecondary }]}>
                  Läser text från bild...
                </Text>
              </View>
            )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 6,
    textAlign: 'center',
  },
  countHint: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  countButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 10,
    justifyContent: 'center',
  },
  countButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    minWidth: 60,
    alignItems: 'center' as const,
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
  reviewAllButton: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  reviewAllButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerBadge: {
    fontSize: 11,
    color: '#A5B4FC',
    marginTop: 2,
    fontWeight: '600',
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
  progressContainer: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center' as const,
    gap: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressIndicator: {
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#0F172A',
    borderRadius: 5,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 5,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: '#6366F1',
    marginTop: 4,
  },
  motivationalContainer: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#312E81',
    borderRadius: 12,
    width: '100%',
  },
  motivationalText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#C7D2FE',
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  tipContainer: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    width: '100%',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#C7D2FE',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
  },
  dontLeaveText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center' as const,
    marginTop: 12,
    fontStyle: 'italic' as const,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  generationOptionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
    marginBottom: 12,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  optionIcon: {
    fontSize: 22,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  dividerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: 20,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  imageButtonsRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 20,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  imageButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreviewTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  imagePreviewScroll: {
    flexDirection: 'row' as const,
  },
  imagePreviewItem: {
    position: 'relative' as const,
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  extractingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  extractingText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
