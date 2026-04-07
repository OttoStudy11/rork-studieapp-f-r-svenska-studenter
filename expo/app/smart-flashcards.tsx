import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Zap,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  ImageIcon,
  BookOpen,
  Layers,
} from 'lucide-react-native';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { PremiumGate } from '@/components/PremiumGate';
import { FadeInView, SlideInView } from '@/components/Animations';
import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { compressImage } from '@/utils/compressImage';
import { extractTextFromImage } from '@/lib/vision-ai';
import { Camera } from 'lucide-react-native';



const DIFFICULTY_LEVELS = [
  { id: 'easy', label: 'Enkel', color: '#10B981', emoji: '🟢' },
  { id: 'medium', label: 'Medel', color: '#F59E0B', emoji: '🟡' },
  { id: 'hard', label: 'Svår', color: '#EF4444', emoji: '🔴' },
  { id: 'mixed', label: 'Blandad', color: '#6366F1', emoji: '🎯' },
] as const;

interface GeneratedFlashcard {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  keyConceptTag: string;
}

const flashcardSchema = z.object({
  flashcards: z.array(z.object({
    question: z.string().describe('The question or prompt for the flashcard, in Swedish'),
    answer: z.string().describe('The answer to the question, in Swedish'),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
    explanation: z.string().describe('Brief explanation of why this is important, in Swedish'),
    keyConceptTag: z.string().describe('A short tag for the key concept, in Swedish'),
  })),
});

export default function SmartFlashcardsScreen() {
  const [inputText, setInputText] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('mixed');
  const [cardCount, setCardCount] = useState(8);
  const [generatedCards, setGeneratedCards] = useState<GeneratedFlashcard[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [savedCards, setSavedCards] = useState<Set<number>>(new Set());

  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { user: authUser } = useAuth();
  const { courses } = useStudy();
  const scrollRef = useRef<ScrollView>(null);

  const activeCourses = courses.filter(c => c.isActive);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (inputText.trim().length < 30) {
        throw new Error('Texten måste vara minst 30 tecken lång.');
      }

      console.log('[SmartFlashcards] Generating flashcards from text...');

      const difficultyInstruction = selectedDifficulty === 'mixed'
        ? 'Mix of easy, medium, and hard questions'
        : `All questions should be ${selectedDifficulty} difficulty`;

      const result = await generateObject({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Du är en expert på att skapa studiematerial. Analysera följande text och skapa ${cardCount} flashcards på SVENSKA.

REGLER:
- Identifiera nyckelbegrepp och viktiga fakta
- Skapa frågor på olika kognitiva nivåer (minne, förståelse, tillämpning)
- Svaren ska vara koncisa men fullständiga
- ${difficultyInstruction}
- Varje kort ska ha en kort förklaring om varför konceptet är viktigt
- Tagga varje kort med dess nyckelbegrepp

TEXT ATT ANALYSERA:
${inputText}`,
              },
            ],
          },
        ],
        schema: flashcardSchema,
      });

      console.log('[SmartFlashcards] Generated:', result.flashcards.length, 'cards');
      return result.flashcards;
    },
    onSuccess: (data) => {
      setGeneratedCards(data);
      setSavedCards(new Set());
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 400, animated: true });
      }, 300);
    },
    onError: (err: Error) => {
      console.error('[SmartFlashcards] Error:', err);
      Alert.alert('Fel', err.message || 'Kunde inte generera flashcards. Försök igen.');
    },
  });

  const saveCardMutation = useMutation({
    mutationFn: async (cardIndex: number) => {
      if (!authUser?.id) throw new Error('Inte inloggad');
      const card = generatedCards[cardIndex];
      if (!card) throw new Error('Kort hittades inte');

      const difficultyMap: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

      const { error } = await supabase
        .from('flashcards')
        .insert({
          course_id: selectedCourseId || activeCourses[0]?.id || 'general',
          question: card.question,
          answer: card.answer,
          difficulty: difficultyMap[card.difficulty] || 2,
          explanation: card.explanation,
          tags: [card.keyConceptTag],
        });

      if (error) throw error;
      return cardIndex;
    },
    onSuccess: (cardIndex) => {
      setSavedCards(prev => new Set([...prev, cardIndex]));
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    onError: (err: Error) => {
      console.error('[SmartFlashcards] Save error:', err);
      Alert.alert('Fel', 'Kunde inte spara flashcard.');
    },
  });

  const saveAllMutation = useMutation({
    mutationFn: async () => {
      if (!authUser?.id) throw new Error('Inte inloggad');
      const difficultyMap: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

      const unsavedCards = generatedCards
        .filter((_, i) => !savedCards.has(i))
        .map(card => ({
          course_id: selectedCourseId || activeCourses[0]?.id || 'general',
          question: card.question,
          answer: card.answer,
          difficulty: difficultyMap[card.difficulty] || 2,
          explanation: card.explanation,
          tags: [card.keyConceptTag],
        }));

      if (unsavedCards.length === 0) return 0;

      const { error } = await supabase
        .from('flashcards')
        .insert(unsavedCards);

      if (error) throw error;
      return unsavedCards.length;
    },
    onSuccess: (count) => {
      const allIndices = new Set(generatedCards.map((_, i) => i));
      setSavedCards(allIndices);
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Sparat!', `${count} flashcards sparade till din samling.`);
    },
    onError: (_err: Error) => {
      Alert.alert('Fel', 'Kunde inte spara flashcards.');
    },
  });

  const [isExtractingImage, setIsExtractingImage] = useState(false);

  const processImageForText = useCallback(async (uri: string) => {
    setIsExtractingImage(true);
    try {
      console.log('[SmartFlashcards] Compressing image...');
      const compressed = await compressImage(uri);
      console.log('[SmartFlashcards] Extracting text from compressed image...');
      const extractedText = await extractTextFromImage(compressed.uri);
      if (extractedText) {
        setInputText(prev => prev + (prev ? '\n\n' : '') + extractedText);
        console.log('[SmartFlashcards] Extracted text length:', extractedText.length);
      }
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      console.error('[SmartFlashcards] Image extraction error:', err);
      Alert.alert('Fel', err?.message || 'Kunde inte extrahera text från bilden. Försök igen.');
    } finally {
      setIsExtractingImage(false);
    }
  }, []);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tillåtelse behövs', 'Vi behöver tillgång till ditt fotoalbum.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      await processImageForText(result.assets[0].uri);
    }
  }, [processImageForText]);

  const handleTakePhoto = useCallback(async () => {
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
      await processImageForText(result.assets[0].uri);
    }
  }, [processImageForText]);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6366F1';
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy': return 'Enkel';
      case 'medium': return 'Medel';
      case 'hard': return 'Svår';
      default: return diff;
    }
  };

  return (
    <PremiumGate feature="flashcards" fullScreen>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <LinearGradient
            colors={isDark ? ['#713F12', '#92400E'] : ['#FEF3C7', '#FDE68A']}
            style={styles.headerGradient}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={24} color={isDark ? '#FDE68A' : '#92400E'} />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <View style={styles.headerTitleRow}>
                  <Zap size={20} color={isDark ? '#FDE68A' : '#D97706'} />
                  <Text style={[styles.headerTitle, { color: isDark ? '#FEF3C7' : '#78350F' }]}>Smart Flashcards</Text>
                </View>
                <Text style={[styles.headerSubtitle, { color: isDark ? '#FDE68A' : '#B45309' }]}>AI-genererade kort från din text</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
            keyboardShouldPersistTaps="handled"
          >
            <SlideInView direction="up" delay={0} duration={300}>
              <View style={[styles.inputSection, { backgroundColor: isDark ? '#1E293B' : '#fff', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                <View style={styles.inputHeader}>
                  <FileText size={18} color={theme.colors.primary} />
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Klistra in din text</Text>
                </View>
                <Text style={[styles.inputHint, { color: theme.colors.textMuted }]}>
                  Föreläsningsanteckningar, lärobokstext, eller valfritt studiematerial
                </Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', color: theme.colors.text, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Klistra in text här... (min 30 tecken)"
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
                {isExtractingImage && (
                  <View style={styles.extractingRow}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={[styles.extractingLabel, { color: theme.colors.textSecondary }]}>Läser text från bild...</Text>
                  </View>
                )}
                <View style={styles.inputActions}>
                  <View style={styles.imageActionsRow}>
                    <TouchableOpacity
                      style={[styles.actionChip, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}
                      onPress={handleTakePhoto}
                      disabled={isExtractingImage}
                    >
                      <Camera size={16} color={theme.colors.primary} />
                      <Text style={[styles.actionChipText, { color: theme.colors.primary }]}>Ta foto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionChip, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}
                      onPress={handlePickImage}
                      disabled={isExtractingImage}
                    >
                      <ImageIcon size={16} color={theme.colors.primary} />
                      <Text style={[styles.actionChipText, { color: theme.colors.primary }]}>Galleri</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.charCount, { color: theme.colors.textMuted }]}>
                    {inputText.length} tecken
                  </Text>
                </View>
              </View>
            </SlideInView>

            <SlideInView direction="up" delay={100} duration={300}>
              <View style={[styles.settingsSection, { backgroundColor: isDark ? '#1E293B' : '#fff', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                <Text style={[styles.settingsTitle, { color: theme.colors.text }]}>Inställningar</Text>

                {activeCourses.length > 0 && (
                  <View style={styles.settingRow}>
                    <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>Kurs</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseChips}>
                      {activeCourses.map(c => (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            styles.courseChip,
                            {
                              backgroundColor: selectedCourseId === c.id ? theme.colors.primary : (isDark ? '#0F172A' : '#F1F5F9'),
                              borderColor: selectedCourseId === c.id ? theme.colors.primary : (isDark ? '#334155' : '#E2E8F0'),
                            },
                          ]}
                          onPress={() => setSelectedCourseId(selectedCourseId === c.id ? null : c.id)}
                        >
                          <Text style={[styles.courseChipText, { color: selectedCourseId === c.id ? '#fff' : theme.colors.text }]} numberOfLines={1}>
                            {c.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>Svårighetsgrad</Text>
                  <View style={styles.difficultyRow}>
                    {DIFFICULTY_LEVELS.map(d => (
                      <TouchableOpacity
                        key={d.id}
                        style={[
                          styles.difficultyChip,
                          {
                            backgroundColor: selectedDifficulty === d.id ? d.color + '20' : (isDark ? '#0F172A' : '#F8FAFC'),
                            borderColor: selectedDifficulty === d.id ? d.color : (isDark ? '#334155' : '#E2E8F0'),
                          },
                        ]}
                        onPress={() => setSelectedDifficulty(d.id)}
                      >
                        <Text style={styles.difficultyEmoji}>{d.emoji}</Text>
                        <Text style={[styles.difficultyText, { color: selectedDifficulty === d.id ? d.color : theme.colors.textSecondary }]}>
                          {d.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>Antal kort</Text>
                  <View style={styles.countRow}>
                    {[5, 8, 12, 15].map(n => (
                      <TouchableOpacity
                        key={n}
                        style={[
                          styles.countChip,
                          {
                            backgroundColor: cardCount === n ? theme.colors.primary : (isDark ? '#0F172A' : '#F8FAFC'),
                            borderColor: cardCount === n ? theme.colors.primary : (isDark ? '#334155' : '#E2E8F0'),
                          },
                        ]}
                        onPress={() => setCardCount(n)}
                      >
                        <Text style={[styles.countText, { color: cardCount === n ? '#fff' : theme.colors.text }]}>{n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </SlideInView>

            <SlideInView direction="up" delay={200} duration={300}>
              <TouchableOpacity
                style={[styles.generateBtn, generateMutation.isPending && styles.generateBtnDisabled]}
                onPress={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || inputText.trim().length < 30}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={inputText.trim().length < 30 ? ['#94A3B8', '#64748B'] : ['#F59E0B', '#D97706']}
                  style={styles.generateBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {generateMutation.isPending ? (
                    <>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.generateBtnText}>Genererar flashcards...</Text>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} color="#fff" />
                      <Text style={styles.generateBtnText}>Generera {cardCount} Flashcards</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </SlideInView>

            {generatedCards.length > 0 && (
              <View style={styles.resultsSection}>
                <View style={styles.resultsHeader}>
                  <View style={styles.resultsHeaderLeft}>
                    <Layers size={20} color={theme.colors.primary} />
                    <Text style={[styles.resultsTitle, { color: theme.colors.text }]}>
                      {generatedCards.length} Flashcards
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.saveAllBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={() => saveAllMutation.mutate()}
                    disabled={saveAllMutation.isPending || savedCards.size === generatedCards.length}
                  >
                    {saveAllMutation.isPending ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Check size={16} color="#fff" />
                        <Text style={styles.saveAllText}>
                          {savedCards.size === generatedCards.length ? 'Alla sparade' : 'Spara alla'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {generatedCards.map((card, index) => (
                  <FadeInView key={index} delay={index * 60} duration={250}>
                    <TouchableOpacity
                      style={[
                        styles.cardItem,
                        {
                          backgroundColor: isDark ? '#1E293B' : '#fff',
                          borderColor: savedCards.has(index) ? '#10B981' : (isDark ? '#334155' : '#E2E8F0'),
                          borderLeftColor: getDifficultyColor(card.difficulty),
                        },
                      ]}
                      onPress={() => setExpandedCard(expandedCard === index ? null : index)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cardTop}>
                        <View style={styles.cardMeta}>
                          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(card.difficulty) + '15' }]}>
                            <Text style={[styles.difficultyBadgeText, { color: getDifficultyColor(card.difficulty) }]}>
                              {getDifficultyLabel(card.difficulty)}
                            </Text>
                          </View>
                          <View style={[styles.tagBadge, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
                            <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>{card.keyConceptTag}</Text>
                          </View>
                        </View>
                        <View style={styles.cardActions}>
                          {savedCards.has(index) ? (
                            <View style={[styles.savedBadge, { backgroundColor: '#10B981' + '20' }]}>
                              <Check size={14} color="#10B981" />
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={[styles.saveBtn, { backgroundColor: theme.colors.primary + '15' }]}
                              onPress={() => saveCardMutation.mutate(index)}
                              disabled={saveCardMutation.isPending}
                            >
                              <BookOpen size={14} color={theme.colors.primary} />
                            </TouchableOpacity>
                          )}
                          {expandedCard === index ? (
                            <ChevronUp size={18} color={theme.colors.textMuted} />
                          ) : (
                            <ChevronDown size={18} color={theme.colors.textMuted} />
                          )}
                        </View>
                      </View>

                      <Text style={[styles.cardQuestion, { color: theme.colors.text }]}>{card.question}</Text>

                      {expandedCard === index && (
                        <FadeInView duration={200}>
                          <View style={[styles.cardAnswer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
                            <Text style={[styles.answerLabel, { color: theme.colors.primary }]}>Svar</Text>
                            <Text style={[styles.answerText, { color: theme.colors.text }]}>{card.answer}</Text>
                          </View>
                          <View style={[styles.cardExplanation, { backgroundColor: getDifficultyColor(card.difficulty) + '08' }]}>
                            <Text style={[styles.explanationLabel, { color: getDifficultyColor(card.difficulty) }]}>Varför viktigt</Text>
                            <Text style={[styles.explanationText, { color: theme.colors.textSecondary }]}>{card.explanation}</Text>
                          </View>
                        </FadeInView>
                      )}
                    </TouchableOpacity>
                  </FadeInView>
                ))}

                <TouchableOpacity
                  style={[styles.regenerateBtn, { borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                  onPress={() => {
                    setGeneratedCards([]);
                    setSavedCards(new Set());
                  }}
                >
                  <RotateCcw size={18} color={theme.colors.textSecondary} />
                  <Text style={[styles.regenerateText, { color: theme.colors.textSecondary }]}>Generera nya kort</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {},
  headerGradient: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 13, fontWeight: '500' as const, marginTop: 2 },
  scrollContent: { padding: 16 },
  inputSection: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 16 },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  inputLabel: { fontSize: 16, fontWeight: '600' as const },
  inputHint: { fontSize: 13, marginBottom: 12 },
  textArea: { borderRadius: 14, padding: 14, fontSize: 15, lineHeight: 22, minHeight: 160, borderWidth: 1 },
  inputActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  imageActionsRow: { flexDirection: 'row', gap: 8 },
  extractingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingVertical: 8 },
  extractingLabel: { fontSize: 13, fontWeight: '500' as const },
  actionChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionChipText: { fontSize: 13, fontWeight: '600' as const },
  charCount: { fontSize: 12 },
  settingsSection: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 16 },
  settingsTitle: { fontSize: 16, fontWeight: '600' as const, marginBottom: 16 },
  settingRow: { marginBottom: 16 },
  settingLabel: { fontSize: 13, fontWeight: '500' as const, marginBottom: 8 },
  courseChips: { flexDirection: 'row' },
  courseChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginRight: 8 },
  courseChipText: { fontSize: 13, fontWeight: '500' as const },
  difficultyRow: { flexDirection: 'row', gap: 8 },
  difficultyChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  difficultyEmoji: { fontSize: 14 },
  difficultyText: { fontSize: 13, fontWeight: '500' as const },
  countRow: { flexDirection: 'row', gap: 8 },
  countChip: { width: 48, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  countText: { fontSize: 15, fontWeight: '600' as const },
  generateBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  generateBtnDisabled: { opacity: 0.7 },
  generateBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' as const },
  resultsSection: { marginBottom: 24 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultsTitle: { fontSize: 18, fontWeight: '700' as const },
  saveAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  saveAllText: { color: '#fff', fontSize: 13, fontWeight: '600' as const },
  cardItem: { borderRadius: 16, padding: 16, borderWidth: 1, borderLeftWidth: 4, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardMeta: { flexDirection: 'row', gap: 6, flex: 1 },
  difficultyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  difficultyBadgeText: { fontSize: 11, fontWeight: '600' as const },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 11 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveBtn: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  savedBadge: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cardQuestion: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  cardAnswer: { marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  answerLabel: { fontSize: 11, fontWeight: '700' as const, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  answerText: { fontSize: 14, lineHeight: 20 },
  cardExplanation: { marginTop: 8, padding: 12, borderRadius: 12 },
  explanationLabel: { fontSize: 11, fontWeight: '700' as const, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  explanationText: { fontSize: 13, lineHeight: 19 },
  regenerateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, marginTop: 8 },
  regenerateText: { fontSize: 14, fontWeight: '500' as const },
});
