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
import { compressImage } from '@/utils/compressImage';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Sparkles, BookOpen, RefreshCw, AlertCircle, Plus, Camera, ImageIcon, X, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { FreemiumLimitReached } from '@/components/FreemiumBanner';
import { useFreemiumLimits } from '@/hooks/useFreemiumLimits';

interface AttachedImage {
  uri: string;
  base64: string;
  mimeType: string;
}

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
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const { theme } = useTheme();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const previousCourseId = useRef<string | undefined>(undefined);

  const [localFlashcards, setLocalFlashcards] = useState<LocalFlashcard[]>([]);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [correctCards, setCorrectCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId && courseId !== previousCourseId.current) {
      console.log('[Flashcards] courseId changed:', courseId);
      setCurrentIndex(0);
      setAiExplanation(undefined);
      setLocalFlashcards([]);
      setReviewedCards(new Set());
      setCorrectCards(new Set());
      previousCourseId.current = courseId;
    }
  }, [courseId]);

  const motivationalMessages = [
    'AI:n analyserar materialet...',
    'Skapar smarta frågor baserat på viktiga koncept...',
    'Optimerar svårighetsgraden för bästa inlärning...',
    'Nästan klart! Färdigställer dina flashcards...',
    'Bra jobbat att du använder flashcards!',
    'Flashcards är ett bevisat effektivt sätt att memorera!',
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
        console.log('[Flashcards] Course not in DB, using courseId:', courseId);
        return null;
      }
      return data;
    },
    enabled: !!courseId,
  });

  const stats = React.useMemo(() => ({
    total: localFlashcards.length,
    reviewed: reviewedCards.size,
    mastered: correctCards.size,
    due: localFlashcards.length - reviewedCards.size,
  }), [localFlashcards.length, reviewedCards.size, correctCards.size]);

  const cardsToStudy = localFlashcards;

  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    if (generationError) {
      const timer = setTimeout(() => setGenerationError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [generationError]);

  const takePhoto = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Tillåtelse behövs', 'Vi behöver tillgång till kameran.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        console.log('[Flashcards] Compressing camera photo...');
        const compressed = await compressImage(result.assets[0].uri);
        if (compressed.base64) {
          setAttachedImages(prev => [...prev, {
            uri: compressed.uri,
            base64: compressed.base64,
            mimeType: compressed.mimeType,
          }]);
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          console.log('[Flashcards] Photo attached, base64 length:', compressed.base64.length);
        }
      }
    } catch (err) {
      console.error('[Flashcards] Error taking photo:', err);
      Alert.alert('Fel', 'Kunde inte ta foto.');
    }
  }, []);

  const pickImage = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        console.log('[Flashcards] Compressing', result.assets.length, 'picked images...');
        const newImages: AttachedImage[] = [];
        for (const asset of result.assets) {
          const compressed = await compressImage(asset.uri);
          if (compressed.base64) {
            newImages.push({
              uri: compressed.uri,
              base64: compressed.base64,
              mimeType: compressed.mimeType,
            });
          }
        }
        if (newImages.length > 0) {
          setAttachedImages(prev => [...prev, ...newImages]);
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          console.log('[Flashcards]', newImages.length, 'images attached');
        }
      }
    } catch (err) {
      console.error('[Flashcards] Error picking image:', err);
      Alert.alert('Fel', 'Kunde inte välja bild.');
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const generateMutation = useMutation({
    mutationFn: async (params: { count: number; customText?: string; images?: AttachedImage[] }) => {
      console.log('[Flashcards] Starting generation for:', courseId);
      setGenerationError(null);
      setGenerationProgress(0);

      if (!courseId) {
        throw new Error('Ingen kurs vald');
      }

      let courseDescription = course?.description;
      if (params.customText && params.customText.trim()) {
        courseDescription = `${course?.description || ''}\n\nAnvändarens text att generera flashcards från:\n${params.customText}`;
      }

      const imagePayload = params.images && params.images.length > 0
        ? params.images.map(img => ({ base64: img.base64, mimeType: img.mimeType }))
        : undefined;

      if (imagePayload) {
        console.log('[Flashcards] Sending', imagePayload.length, 'images directly to AI');
      }

      console.log('[Flashcards] Calling AI service...');
      const result = await generateFlashcardsWithAI({
        courseName: course?.title || courseId,
        courseDescription,
        subject: course?.subject,
        targetCount: params.count,
        difficulty: 'all',
        language: 'sv',
        images: imagePayload,
      }, (progress) => {
        setGenerationProgress(progress);
      });

      if (!result.success || result.flashcards.length === 0) {
        console.error('[Flashcards] AI generation failed:', result.error);
        throw new Error(result.error || 'AI kunde inte generera flashcards. Försök igen.');
      }

      console.log(`[Flashcards] Generated ${result.flashcards.length} flashcards`);

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
      setLocalFlashcards(prev => [...data.flashcards, ...prev]);
      setCurrentIndex(0);
      setReviewedCards(new Set());
      setCorrectCards(new Set());
      setShowCustomInput(false);
      setShowGenerateModal(false);
      setCustomText('');
      setAttachedImages([]);
      setGenerationError(null);
      setGenerationProgress(0);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Klart!', `${data.count} flashcards har genererats!`);
    },
    onError: (error: any) => {
      console.error('[Flashcards] Generation failed:', error);
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

  const handleGenerateWithImages = useCallback(() => {
    if (attachedImages.length === 0 && customText.trim().length < 20) {
      Alert.alert('Inget material', 'Lägg till bilder eller skriv minst 20 tecken text.');
      return;
    }
    generateMutation.mutate({
      count: generationCount,
      customText: customText.trim() || undefined,
      images: attachedImages.length > 0 ? attachedImages : undefined,
    });
  }, [attachedImages, customText, generationCount, generateMutation]);

  const handleGenerateFromCourse = useCallback(() => {
    generateMutation.mutate({ count: generationCount });
  }, [generationCount, generateMutation]);

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

          <ScrollView contentContainerStyle={styles.emptyContainer} showsVerticalScrollIndicator={false}>
            <BookOpen size={64} color="#818CF8" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Skapa flashcards</Text>
            <Text style={styles.emptyText}>
              {course?.title || 'Din kurs'}
            </Text>

            {attachedImages.length > 0 && (
              <View style={styles.attachedImagesRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {attachedImages.map((img, index) => (
                    <View key={index} style={styles.attachedImageItem}>
                      <Image source={{ uri: img.uri }} style={styles.attachedImageThumb} />
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => removeImage(index)}
                      >
                        <X size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                <Text style={styles.attachedImageCount}>
                  {attachedImages.length} {attachedImages.length === 1 ? 'bild' : 'bilder'} bifogade
                </Text>
              </View>
            )}

            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={takePhoto}
                disabled={generateMutation.isPending}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F6' }]}>
                  <Camera size={22} color="#fff" />
                </View>
                <Text style={styles.quickActionLabel}>Ta foto</Text>
                <Text style={styles.quickActionHint}>Fota</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={pickImage}
                disabled={generateMutation.isPending}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF6' }]}>
                  <ImageIcon size={22} color="#fff" />
                </View>
                <Text style={styles.quickActionLabel}>Galleri</Text>
                <Text style={styles.quickActionHint}>Välj bilder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => setShowCustomInput(true)}
                disabled={generateMutation.isPending}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#10B981' }]}>
                  <FileText size={22} color="#fff" />
                </View>
                <Text style={styles.quickActionLabel}>Text</Text>
                <Text style={styles.quickActionHint}>Klistra in text</Text>
              </TouchableOpacity>
            </View>

            {(attachedImages.length > 0 || customText.trim().length >= 20) && (
              <TouchableOpacity
                style={styles.generateFromImagesButton}
                onPress={handleGenerateWithImages}
                disabled={generateMutation.isPending}
              >
                <LinearGradient
                  colors={['#3B82F6', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.generateGradient}
                >
                  {generateMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Sparkles size={20} color="#fff" />
                      <Text style={styles.generateButtonText}>
                        Skapa från {attachedImages.length > 0 ? `${attachedImages.length} ${attachedImages.length === 1 ? 'bild' : 'bilder'}` : 'text'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>eller generera från kursen</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.countSelector}>
              <Text style={styles.countLabel}>Antal flashcards</Text>
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
              onPress={handleGenerateFromCourse}
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

            {generateMutation.isPending && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarFill, { width: `${generationProgress}%` }]} />
                </View>
                <Text style={styles.progressPercentage}>{generationProgress}%</Text>
                <Text style={styles.motivationalText}>
                  {motivationalMessages[motivationalIndex]}
                </Text>
              </View>
            )}
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
                      Alert.alert('För lite text', 'Skriv minst 20 tecken.');
                      return;
                    }
                    setShowCustomInput(false);
                  }}
                  disabled={customText.trim().length < 20}
                >
                  <Text style={[
                    styles.modalDone,
                    { color: customText.trim().length < 20 ? theme.colors.textMuted : theme.colors.primary }
                  ]}>
                    Klar
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
                  Klistra in text från anteckningar eller lärobok. AI:n skapar flashcards baserat på texten.
                </Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={customText}
                  onChangeText={setCustomText}
                  placeholder="Klistra in din text här..."
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
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Skapa fler</Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalQuickActions}>
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => {
                    setShowGenerateModal(false);
                    setTimeout(takePhoto, 300);
                  }}
                >
                  <Camera size={24} color="#3B82F6" />
                  <Text style={[styles.modalActionLabel, { color: theme.colors.text }]}>Ta foto</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => {
                    setShowGenerateModal(false);
                    setTimeout(pickImage, 300);
                  }}
                >
                  <ImageIcon size={24} color="#8B5CF6" />
                  <Text style={[styles.modalActionLabel, { color: theme.colors.text }]}>Galleri</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => {
                    setShowGenerateModal(false);
                    setTimeout(() => setShowCustomInput(true), 300);
                  }}
                >
                  <FileText size={24} color="#10B981" />
                  <Text style={[styles.modalActionLabel, { color: theme.colors.text }]}>Text</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalDivider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.dividerLabel, { color: theme.colors.textMuted }]}>eller från kursen</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              </View>

              <View style={styles.countSelector}>
                <Text style={[styles.countLabel, { color: theme.colors.text }]}>Antal</Text>
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
                  <Sparkles size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>Generera {generationCount} Flashcards</Text>
                </LinearGradient>
              </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    fontWeight: '700' as const,
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
    paddingVertical: 20,
    gap: 10,
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
    fontWeight: '500' as const,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#F1F5F9',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    width: '100%',
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#F1F5F9',
  },
  quickActionHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  attachedImagesRow: {
    width: '100%',
    marginTop: 20,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  attachedImageItem: {
    position: 'relative',
    marginRight: 10,
  },
  attachedImageThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachedImageCount: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  generateFromImagesButton: {
    marginTop: 16,
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  countSelector: {
    width: '100%',
    marginTop: 20,
  },
  countLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#F1F5F9',
    marginBottom: 10,
    textAlign: 'center',
  },
  countButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    minWidth: 56,
    alignItems: 'center',
  },
  countButtonActive: {
    backgroundColor: '#312E81',
    borderColor: '#6366F1',
  },
  countButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#94A3B8',
  },
  countButtonTextActive: {
    color: '#C7D2FE',
  },
  generateButton: {
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    gap: 10,
    width: '100%',
  },
  errorBannerText: {
    flex: 1,
    color: '#F87171',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#6366F1',
  },
  motivationalText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#94A3B8',
    textAlign: 'center',
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
    fontWeight: '900' as const,
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
    fontWeight: '900' as const,
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
    fontWeight: '700' as const,
    color: '#6366F1',
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
    fontWeight: '700' as const,
    color: '#fff',
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
    fontWeight: '600' as const,
    color: '#E0E7FF',
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
    fontWeight: '700' as const,
  },
  modalCancel: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '700' as const,
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
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  modalQuickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  modalActionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  modalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
});
