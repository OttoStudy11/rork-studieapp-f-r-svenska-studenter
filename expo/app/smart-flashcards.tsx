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
  Image,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  BookOpen,
  Layers,
  Camera,
  ImageIcon,
  X,
  Send,
  ScanText,
} from 'lucide-react-native';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { PremiumGate } from '@/components/PremiumGate';
import { FadeInView } from '@/components/Animations';
import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { compressImage } from '@/utils/compressImage';

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

interface AttachedImage {
  uri: string;
  base64: string;
  mimeType: string;
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
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { user: authUser } = useAuth();
  const { courses } = useStudy();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const activeCourses = courses.filter(c => c.isActive);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const hasText = inputText.trim().length >= 10;
      const hasImages = attachedImages.length > 0;

      if (!hasText && !hasImages) {
        throw new Error('Skriv text eller bifoga en bild för att generera flashcards.');
      }

      console.log('[SmartFlashcards] Generating flashcards...', { hasText, hasImages, imageCount: attachedImages.length });

      const difficultyInstruction = selectedDifficulty === 'mixed'
        ? 'Mix of easy, medium, and hard questions'
        : `All questions should be ${selectedDifficulty} difficulty`;

      const contentParts: Array<{ type: 'text'; text: string } | { type: 'image'; image: string }> = [];

      for (const img of attachedImages) {
        contentParts.push({
          type: 'image',
          image: `data:${img.mimeType};base64,${img.base64}`,
        });
      }

      let promptText = `Du är en expert på att skapa studiematerial. `;

      if (hasImages && hasText) {
        promptText += `Analysera BÅDE bilderna och texten nedan. Extrahera all viktig information från bilderna (text, formler, diagram, tabeller, etc.) och kombinera med den angivna texten. `;
      } else if (hasImages) {
        promptText += `Analysera bilderna noggrant. Extrahera ALL text, formler, diagram, tabeller och viktig information från bilderna. `;
      } else {
        promptText += `Analysera följande text. `;
      }

      promptText += `Skapa ${cardCount} flashcards på SVENSKA baserat på innehållet.

REGLER:
- Identifiera nyckelbegrepp och viktiga fakta
- Skapa frågor på olika kognitiva nivåer (minne, förståelse, tillämpning)
- Svaren ska vara koncisa men fullständiga
- ${difficultyInstruction}
- Varje kort ska ha en kort förklaring om varför konceptet är viktigt
- Tagga varje kort med dess nyckelbegrepp
- Om innehållet har matematiska formler, inkludera dem i frågorna och svaren`;

      if (hasText) {
        promptText += `\n\nTEXT ATT ANALYSERA:\n${inputText}`;
      }

      contentParts.push({ type: 'text', text: promptText });

      const result = await generateObject({
        messages: [{ role: 'user', content: contentParts }],
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
        scrollRef.current?.scrollToEnd({ animated: true });
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

  const handlePickImage = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 4,
      });

      if (!result.canceled && result.assets.length > 0) {
        console.log('[SmartFlashcards] Picked', result.assets.length, 'images');
        for (const asset of result.assets) {
          const compressed = await compressImage(asset.uri);
          if (compressed.base64) {
            setAttachedImages(prev => [...prev.slice(0, 3), {
              uri: compressed.uri,
              base64: compressed.base64,
              mimeType: compressed.mimeType,
            }]);
          }
        }
        if (Platform.OS !== 'web') {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    } catch (err) {
      console.error('[SmartFlashcards] Error picking image:', err);
      Alert.alert('Fel', 'Kunde inte välja bild.');
    }
  }, []);

  const handleTakePhoto = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
        console.log('[SmartFlashcards] Photo taken');
        const compressed = await compressImage(result.assets[0].uri);
        if (compressed.base64) {
          setAttachedImages(prev => [...prev.slice(0, 3), {
            uri: compressed.uri,
            base64: compressed.base64,
            mimeType: compressed.mimeType,
          }]);
          if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      }
    } catch (err) {
      console.error('[SmartFlashcards] Error taking photo:', err);
      Alert.alert('Fel', 'Kunde inte ta bild.');
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

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

  const canGenerate = inputText.trim().length >= 10 || attachedImages.length > 0;
  const isGenerating = generateMutation.isPending;

  const bgColor = isDark ? '#0B1120' : '#F8FAFC';
  const cardBg = isDark ? '#1A2332' : '#FFFFFF';
  const cardBorder = isDark ? '#2A3544' : '#E8ECF0';
  const inputBg = isDark ? '#111B2A' : '#F1F5F9';
  const accentColor = '#F59E0B';
  const accentDark = '#D97706';

  return (
    <PremiumGate feature="flashcards" fullScreen>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
          <LinearGradient
            colors={isDark ? ['#78350F', '#92400E'] : ['#FFFBEB', '#FEF3C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.backBtn, { backgroundColor: isDark ? '#1C1917' + '80' : '#FFFFFF' + '90' }]}
              >
                <ArrowLeft size={20} color={accentDark} strokeWidth={2.5} />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <View style={styles.headerIconWrap}>
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.headerIcon}>
                    <Zap size={16} color="#fff" />
                  </LinearGradient>
                </View>
                <View>
                  <Text style={[styles.headerTitle, { color: isDark ? '#FEF3C7' : '#78350F' }]}>Smart Flashcards</Text>
                  <Text style={[styles.headerSubtitle, { color: isDark ? '#FDE68A' : '#B45309' }]}>AI skapar kort från text & bilder</Text>
                </View>
              </View>
              <View style={styles.onlineDotWrap}>
                <View style={styles.onlineDot} />
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
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {generatedCards.length === 0 && !isGenerating && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconOuter}>
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.emptyIconContainer}>
                    <Text style={styles.emptyIconEmoji}>⚡</Text>
                  </LinearGradient>
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  Skapa flashcards direkt!
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                  Fota dina anteckningar, klistra in text,{'\n'}eller gör båda — AI:n skapar korten åt dig
                </Text>

                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={[styles.quickActionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                    onPress={handleTakePhoto}
                    activeOpacity={0.7}
                  >
                    <LinearGradient colors={['#FEF3C7', '#FDE68A']} style={styles.quickActionIcon}>
                      <Camera size={22} color="#D97706" />
                    </LinearGradient>
                    <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>📸 Fota</Text>
                    <Text style={[styles.quickActionDesc, { color: theme.colors.textMuted }]}>Anteckningar & böcker</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickActionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                    onPress={handlePickImage}
                    activeOpacity={0.7}
                  >
                    <LinearGradient colors={['#DBEAFE', '#BFDBFE']} style={styles.quickActionIcon}>
                      <ImageIcon size={22} color="#2563EB" />
                    </LinearGradient>
                    <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>🖼️ Galleri</Text>
                    <Text style={[styles.quickActionDesc, { color: theme.colors.textMuted }]}>Välj screenshots</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quickActionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
                    onPress={() => inputRef.current?.focus()}
                    activeOpacity={0.7}
                  >
                    <LinearGradient colors={['#D1FAE5', '#A7F3D0']} style={styles.quickActionIcon}>
                      <ScanText size={22} color="#059669" />
                    </LinearGradient>
                    <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>✍️ Text</Text>
                    <Text style={[styles.quickActionDesc, { color: theme.colors.textMuted }]}>Klistra in text</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {generatedCards.length === 0 && (
              <>
                <TouchableOpacity
                  style={[styles.settingsToggle, { backgroundColor: cardBg, borderColor: cardBorder }]}
                  onPress={() => setShowSettings(!showSettings)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingsToggleLeft}>
                    <Sparkles size={16} color={accentColor} />
                    <Text style={[styles.settingsToggleText, { color: theme.colors.text }]}>
                      {cardCount} kort · {DIFFICULTY_LEVELS.find(d => d.id === selectedDifficulty)?.label}
                      {selectedCourseId ? ` · ${activeCourses.find(c => c.id === selectedCourseId)?.title}` : ''}
                    </Text>
                  </View>
                  {showSettings ? (
                    <ChevronUp size={18} color={theme.colors.textMuted} />
                  ) : (
                    <ChevronDown size={18} color={theme.colors.textMuted} />
                  )}
                </TouchableOpacity>

                {showSettings && (
                  <FadeInView duration={200}>
                    <View style={[styles.settingsPanel, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                      {activeCourses.length > 0 && (
                        <View style={styles.settingRow}>
                          <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>Kurs</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.chipRow}>
                              {activeCourses.map(c => (
                                <TouchableOpacity
                                  key={c.id}
                                  style={[
                                    styles.chip,
                                    {
                                      backgroundColor: selectedCourseId === c.id ? accentColor : inputBg,
                                      borderColor: selectedCourseId === c.id ? accentColor : cardBorder,
                                    },
                                  ]}
                                  onPress={() => setSelectedCourseId(selectedCourseId === c.id ? null : c.id)}
                                >
                                  <Text style={[styles.chipText, { color: selectedCourseId === c.id ? '#fff' : theme.colors.text }]} numberOfLines={1}>
                                    {c.title}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                      )}

                      <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>Svårighetsgrad</Text>
                        <View style={styles.chipRow}>
                          {DIFFICULTY_LEVELS.map(d => (
                            <TouchableOpacity
                              key={d.id}
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: selectedDifficulty === d.id ? d.color + '20' : inputBg,
                                  borderColor: selectedDifficulty === d.id ? d.color : cardBorder,
                                },
                              ]}
                              onPress={() => setSelectedDifficulty(d.id)}
                            >
                              <Text style={styles.chipEmoji}>{d.emoji}</Text>
                              <Text style={[styles.chipText, { color: selectedDifficulty === d.id ? d.color : theme.colors.textSecondary }]}>
                                {d.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: theme.colors.textSecondary }]}>Antal kort</Text>
                        <View style={styles.chipRow}>
                          {[5, 8, 12, 15].map(n => (
                            <TouchableOpacity
                              key={n}
                              style={[
                                styles.countChip,
                                {
                                  backgroundColor: cardCount === n ? accentColor : inputBg,
                                  borderColor: cardCount === n ? accentColor : cardBorder,
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
                  </FadeInView>
                )}
              </>
            )}

            {isGenerating && (
              <View style={[styles.generatingCard, { backgroundColor: cardBg, borderColor: accentColor }]}>
                <ActivityIndicator color={accentColor} size="small" />
                <View style={styles.generatingTextWrap}>
                  <Text style={[styles.generatingTitle, { color: theme.colors.text }]}>Skapar flashcards...</Text>
                  <Text style={[styles.generatingSubtitle, { color: theme.colors.textMuted }]}>
                    AI:n läser {attachedImages.length > 0 ? 'bilderna' : 'texten'} och skapar {cardCount} kort
                  </Text>
                </View>
              </View>
            )}

            {generatedCards.length > 0 && (
              <View style={styles.resultsSection}>
                <View style={styles.resultsHeader}>
                  <View style={styles.resultsHeaderLeft}>
                    <Layers size={20} color={accentColor} />
                    <Text style={[styles.resultsTitle, { color: theme.colors.text }]}>
                      {generatedCards.length} Flashcards
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.saveAllBtn, { backgroundColor: accentColor }]}
                    onPress={() => saveAllMutation.mutate()}
                    disabled={saveAllMutation.isPending || savedCards.size === generatedCards.length}
                    activeOpacity={0.8}
                  >
                    {saveAllMutation.isPending ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Check size={14} color="#fff" />
                        <Text style={styles.saveAllText}>
                          {savedCards.size === generatedCards.length ? 'Alla sparade' : 'Spara alla'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {generatedCards.map((card, index) => (
                  <FadeInView key={index} delay={index * 50} duration={250}>
                    <TouchableOpacity
                      style={[
                        styles.cardItem,
                        {
                          backgroundColor: cardBg,
                          borderColor: savedCards.has(index) ? '#10B981' : cardBorder,
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
                          <View style={[styles.tagBadge, { backgroundColor: inputBg }]}>
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
                              style={[styles.saveBtn, { backgroundColor: accentColor + '15' }]}
                              onPress={() => saveCardMutation.mutate(index)}
                              disabled={saveCardMutation.isPending}
                            >
                              <BookOpen size={14} color={accentColor} />
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
                          <View style={[styles.cardAnswer, { backgroundColor: inputBg, borderColor: cardBorder }]}>
                            <Text style={[styles.answerLabel, { color: accentColor }]}>Svar</Text>
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
                  style={[styles.regenerateBtn, { borderColor: cardBorder }]}
                  onPress={() => {
                    setGeneratedCards([]);
                    setSavedCards(new Set());
                    setAttachedImages([]);
                    setInputText('');
                  }}
                  activeOpacity={0.7}
                >
                  <RotateCcw size={18} color={theme.colors.textSecondary} />
                  <Text style={[styles.regenerateText, { color: theme.colors.textSecondary }]}>Generera nya kort</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {attachedImages.length > 0 && (
            <View style={[styles.imagePreviewBar, { backgroundColor: cardBg, borderTopColor: cardBorder }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagePreviewScroll}>
                {attachedImages.map((img, i) => (
                  <View key={i} style={styles.previewImageWrap}>
                    <Image source={{ uri: img.uri }} style={styles.previewThumbnail} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => removeImage(i)}
                    >
                      <X size={10} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <Text style={[styles.previewCount, { color: theme.colors.textMuted }]}>
                {attachedImages.length} bild{attachedImages.length > 1 ? 'er' : ''}
              </Text>
            </View>
          )}

          <View style={[styles.inputContainer, { backgroundColor: cardBg, borderTopColor: cardBorder, paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
            <View style={styles.inputRow}>
              <View style={styles.mediaButtonsRow}>
                <TouchableOpacity
                  style={[styles.mediaButton, { backgroundColor: isDark ? '#1C2A3A' : '#FEF3C7', borderColor: isDark ? '#2A3A4A' : '#FDE68A' }]}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <Camera size={18} color={accentDark} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mediaButton, { backgroundColor: isDark ? '#1C2A3A' : '#FEF3C7', borderColor: isDark ? '#2A3A4A' : '#FDE68A' }]}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <ImageIcon size={18} color={accentDark} />
                </TouchableOpacity>
              </View>
              <View style={styles.inputFieldWrap}>
                <TextInput
                  ref={inputRef}
                  style={[styles.input, { backgroundColor: inputBg, color: theme.colors.text, borderColor: cardBorder }]}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Klistra in text eller fota..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  maxLength={10000}
                  editable={!isGenerating}
                />
              </View>
              <TouchableOpacity
                style={[styles.sendButton, (!canGenerate || isGenerating) && styles.sendButtonDisabled]}
                onPress={() => generateMutation.mutate()}
                disabled={!canGenerate || isGenerating}
              >
                <LinearGradient
                  colors={(!canGenerate || isGenerating) ? ['#CBD5E1', '#94A3B8'] : [accentColor, accentDark]}
                  style={styles.sendButtonGradient}
                >
                  {isGenerating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Sparkles size={16} color="#fff" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {},
  headerGradient: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  headerIconWrap: {},
  headerIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' as const, letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.1 },
  onlineDotWrap: { width: 40, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  scrollContent: { padding: 16 },

  emptyState: { alignItems: 'center', paddingHorizontal: 12, paddingTop: 32, marginBottom: 24 },
  emptyIconOuter: { marginBottom: 16, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8 },
  emptyIconContainer: { width: 68, height: 68, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  emptyIconEmoji: { fontSize: 28 },
  emptyTitle: { fontSize: 22, fontWeight: '800' as const, marginBottom: 6, letterSpacing: -0.5, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 24, paddingHorizontal: 8 },

  quickActions: { flexDirection: 'row', gap: 10, width: '100%' },
  quickActionCard: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  quickActionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickActionTitle: { fontSize: 13, fontWeight: '700' as const, marginBottom: 2 },
  quickActionDesc: { fontSize: 11, textAlign: 'center' },

  settingsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  settingsToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  settingsToggleText: { fontSize: 13, fontWeight: '500' as const },

  settingsPanel: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  settingRow: { marginBottom: 14 },
  settingLabel: { fontSize: 12, fontWeight: '600' as const, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: 13, fontWeight: '500' as const },
  countChip: { width: 46, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  countText: { fontSize: 15, fontWeight: '600' as const },

  generatingCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18, borderWidth: 1.5, marginBottom: 16 },
  generatingTextWrap: { flex: 1 },
  generatingTitle: { fontSize: 15, fontWeight: '600' as const },
  generatingSubtitle: { fontSize: 13, marginTop: 2 },

  resultsSection: { marginBottom: 16 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  resultsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultsTitle: { fontSize: 18, fontWeight: '700' as const },
  saveAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  saveAllText: { color: '#fff', fontSize: 13, fontWeight: '600' as const },
  cardItem: { borderRadius: 16, padding: 16, borderWidth: 1, borderLeftWidth: 4, marginBottom: 10 },
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
  regenerateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, marginTop: 6 },
  regenerateText: { fontSize: 14, fontWeight: '500' as const },

  imagePreviewBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, gap: 8 },
  imagePreviewScroll: { gap: 8, flexDirection: 'row' },
  previewImageWrap: { position: 'relative' },
  previewThumbnail: { width: 52, height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  removeImageBtn: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  previewCount: { fontSize: 12, fontWeight: '500' as const },

  inputContainer: { paddingTop: 8, paddingHorizontal: 12, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  mediaButtonsRow: { flexDirection: 'row', gap: 4 },
  mediaButton: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  inputFieldWrap: { flex: 1 },
  input: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, borderWidth: 1.5 },
  sendButton: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonGradient: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});
