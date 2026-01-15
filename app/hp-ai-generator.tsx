import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Play,
  Clock,
  Target,
  Trophy,
  Trash2,
  Zap,
  BookOpen,
  Brain,
  CheckCircle,
  AlertCircle,
  Crown,
  Lock,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { HP_SECTIONS } from '@/constants/hogskoleprovet';
import { COLORS } from '@/constants/design-system';
import { hpAITestService, StoredAITest } from '@/services/hp-ai-tests';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type GenerationMode = 'section' | 'full';
type Difficulty = 'all' | 'easy' | 'medium' | 'hard';

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; icon: string }[] = [
  { value: 'all', label: 'Blandad', icon: '🎯' },
  { value: 'easy', label: 'Lätt', icon: '🟢' },
  { value: 'medium', label: 'Medel', icon: '🟡' },
  { value: 'hard', label: 'Svår', icon: '🔴' },
];

export default function HPAIGeneratorScreen() {
  const { theme, isDark } = useTheme();
  const { isPremium } = usePremium();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [generationMode, setGenerationMode] = useState<GenerationMode>('section');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [storedTests, setStoredTests] = useState<StoredAITest[]>([]);
  const [, setIsLoadingTests] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const loadStoredTests = useCallback(async () => {
    try {
      const tests = await hpAITestService.getStoredTests();
      setStoredTests(tests);
    } catch (error) {
      console.error('Error loading stored tests:', error);
    } finally {
      setIsLoadingTests(false);
    }
  }, []);

  useEffect(() => {
    loadStoredTests();
  }, [loadStoredTests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStoredTests();
    setRefreshing(false);
  }, [loadStoredTests]);

  const handleGenerateTest = async () => {
    if (!isPremium) {
      router.push('/premium' as any);
      return;
    }

    if (generationMode === 'section' && !selectedSection) {
      Alert.alert('Välj delprov', 'Du måste välja ett delprov att generera frågor för.');
      return;
    }

    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (generationMode === 'section' && selectedSection) {
        setGenerationProgress(`Genererar ${questionCount} frågor...`);
        
        const result = await hpAITestService.generateSectionTest(
          selectedSection,
          questionCount,
          selectedDifficulty
        );

        if (result.success && result.test) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setStoredTests(prev => [result.test!, ...prev].slice(0, 10));
          Alert.alert(
            'Prov genererat! 🎉',
            `${result.test.totalQuestions} frågor har skapats för ${result.test.name}.`,
            [
              { text: 'OK', style: 'cancel' },
              { 
                text: 'Starta test', 
                onPress: () => handleStartTest(result.test!) 
              },
            ]
          );
        } else {
          throw new Error(result.error || 'Kunde inte generera provet');
        }
      } else {
        setGenerationProgress('Genererar komplett prov...');
        
        const result = await hpAITestService.generateFullTest(
          undefined,
          selectedDifficulty
        );

        if (result.success && result.test) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setStoredTests(prev => [result.test!, ...prev].slice(0, 10));
          Alert.alert(
            'Komplett prov genererat! 🎉',
            `${result.test.totalQuestions} frågor har skapats för alla delprov.`,
            [
              { text: 'OK', style: 'cancel' },
              { 
                text: 'Starta test', 
                onPress: () => handleStartTest(result.test!) 
              },
            ]
          );
        } else {
          throw new Error(result.error || 'Kunde inte generera provet');
        }
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Fel', error?.message || 'Något gick fel vid genereringen.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const handleStartTest = (test: StoredAITest) => {
    router.push({
      pathname: '/hp-ai-practice' as any,
      params: { testId: test.id },
    });
  };

  const handleDeleteTest = (testId: string) => {
    Alert.alert(
      'Ta bort test',
      'Är du säker på att du vill ta bort detta test?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            await hpAITestService.deleteTest(testId);
            setStoredTests(prev => prev.filter(t => t.id !== testId));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isPremium) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={isDark 
            ? ['#0F172A', '#1E293B', '#334155'] 
            : ['#4F46E5', '#7C3AED', '#EC4899']
          }
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ChevronLeft size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <View style={styles.headerTitleRow}>
                  <Sparkles size={28} color="#FFF" />
                  <Text style={styles.headerTitle}>AI-generator</Text>
                </View>
                <Text style={styles.headerSubtitle}>
                  Skapa anpassade högskoleprovsfrågor med AI
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.premiumBlockContainer}>
          <View style={[styles.premiumBlockCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.premiumIconContainer}>
              <Lock size={48} color={theme.colors.textSecondary} />
            </View>
            <Text style={[styles.premiumBlockTitle, { color: theme.colors.text }]}>
              Premium-funktion
            </Text>
            <Text style={[styles.premiumBlockText, { color: theme.colors.textSecondary }]}>
              AI-genererade högskoleprovsfrågor är en Premium-funktion. 
              Uppgradera för att få tillgång till obegränsat antal anpassade prov.
            </Text>
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => router.push('/premium' as any)}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.premiumButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Crown size={20} color="#000" />
                <Text style={styles.premiumButtonText}>Uppgradera till Premium</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={isDark 
          ? ['#0F172A', '#1E293B', '#334155'] 
          : ['#4F46E5', '#7C3AED', '#EC4899']
        }
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <View style={styles.headerTitleRow}>
                <Sparkles size={28} color="#FFF" />
                <Text style={styles.headerTitle}>AI-generator</Text>
                <View style={styles.aiBadge}>
                  <Zap size={14} color="#FFD700" />
                </View>
              </View>
              <Text style={styles.headerSubtitle}>
                Skapa anpassade högskoleprovsfrågor med AI
              </Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              generationMode === 'section' && styles.modeButtonActive,
              { backgroundColor: generationMode === 'section' ? COLORS.primary : theme.colors.surface },
            ]}
            onPress={() => setGenerationMode('section')}
          >
            <BookOpen size={20} color={generationMode === 'section' ? '#FFF' : theme.colors.text} />
            <Text style={[
              styles.modeButtonText,
              { color: generationMode === 'section' ? '#FFF' : theme.colors.text },
            ]}>
              Per delprov
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              generationMode === 'full' && styles.modeButtonActive,
              { backgroundColor: generationMode === 'full' ? COLORS.primary : theme.colors.surface },
            ]}
            onPress={() => setGenerationMode('full')}
          >
            <Brain size={20} color={generationMode === 'full' ? '#FFF' : theme.colors.text} />
            <Text style={[
              styles.modeButtonText,
              { color: generationMode === 'full' ? '#FFF' : theme.colors.text },
            ]}>
              Komplett prov
            </Text>
          </TouchableOpacity>
        </View>

        {generationMode === 'section' && (
          <View style={styles.sectionSelector}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
              Välj delprov
            </Text>
            <View style={styles.sectionsGrid}>
              {HP_SECTIONS.map((section) => (
                <TouchableOpacity
                  key={section.code}
                  style={[
                    styles.sectionCard,
                    { backgroundColor: theme.colors.surface },
                    selectedSection === section.code && {
                      borderColor: section.color,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => {
                    setSelectedSection(section.code);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <LinearGradient
                    colors={[...section.gradientColors, `${section.gradientColors[1]}80`] as any}
                    style={styles.sectionIconBg}
                  >
                    <Text style={styles.sectionIcon}>{section.icon}</Text>
                  </LinearGradient>
                  <Text style={[styles.sectionName, { color: theme.colors.text }]}>
                    {section.name}
                  </Text>
                  {selectedSection === section.code && (
                    <View style={[styles.selectedBadge, { backgroundColor: section.color }]}>
                      <CheckCircle size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.difficultySection}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
            Svårighetsgrad
          </Text>
          <View style={styles.difficultyOptions}>
            {DIFFICULTY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.difficultyButton,
                  { backgroundColor: theme.colors.surface },
                  selectedDifficulty === option.value && {
                    borderColor: COLORS.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => {
                  setSelectedDifficulty(option.value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.difficultyIcon}>{option.icon}</Text>
                <Text style={[styles.difficultyLabel, { color: theme.colors.text }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {generationMode === 'section' && (
          <View style={styles.countSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
              Antal frågor
            </Text>
            <View style={styles.countOptions}>
              {[5, 10].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countButton,
                    { backgroundColor: theme.colors.surface },
                    questionCount === count && {
                      borderColor: COLORS.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => {
                    setQuestionCount(count);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[
                    styles.countNumber,
                    { color: questionCount === count ? COLORS.primary : theme.colors.text },
                  ]}>
                    {count}
                  </Text>
                  <Text style={[styles.countLabel, { color: theme.colors.textSecondary }]}>
                    frågor
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.generateButton,
            isGenerating && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerateTest}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isGenerating 
              ? ['#6B7280', '#4B5563'] 
              : ['#6366F1', '#8B5CF6', '#EC4899']
            }
            style={styles.generateButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isGenerating ? (
              <>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.generateButtonText}>{generationProgress || 'Genererar...'}</Text>
              </>
            ) : (
              <>
                <Sparkles size={22} color="#FFF" />
                <Text style={styles.generateButtonText}>
                  {generationMode === 'section' ? 'Generera frågor' : 'Generera komplett prov'}
                </Text>
                <ChevronRight size={20} color="#FFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {storedTests.length > 0 && (
          <View style={styles.savedTestsSection}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>
              Sparade prov
            </Text>
            
            {storedTests.map((test) => (
              <View
                key={test.id}
                style={[styles.savedTestCard, { backgroundColor: theme.colors.surface }]}
              >
                <TouchableOpacity
                  style={styles.savedTestContent}
                  onPress={() => handleStartTest(test)}
                >
                  <View style={styles.savedTestIcon}>
                    <Sparkles size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.savedTestInfo}>
                    <Text style={[styles.savedTestName, { color: theme.colors.text }]} numberOfLines={1}>
                      {test.name}
                    </Text>
                    <View style={styles.savedTestMeta}>
                      <View style={styles.savedTestStat}>
                        <Target size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.savedTestStatText, { color: theme.colors.textSecondary }]}>
                          {test.totalQuestions} frågor
                        </Text>
                      </View>
                      <View style={styles.savedTestStat}>
                        <Clock size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.savedTestStatText, { color: theme.colors.textSecondary }]}>
                          {formatDate(test.createdAt)}
                        </Text>
                      </View>
                    </View>
                    {test.bestScore !== undefined && (
                      <View style={styles.savedTestScore}>
                        <Trophy size={12} color={COLORS.success} />
                        <Text style={[styles.savedTestScoreText, { color: COLORS.success }]}>
                          Bäst: {test.bestScore.toFixed(0)}%
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.savedTestActions}>
                    <TouchableOpacity
                      style={[styles.playButton, { backgroundColor: `${COLORS.primary}20` }]}
                      onPress={() => handleStartTest(test)}
                    >
                      <Play size={18} color={COLORS.primary} fill={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: `${COLORS.error}15` }]}
                      onPress={() => handleDeleteTest(test.id)}
                    >
                      <Trash2 size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={[styles.infoCardContent, { backgroundColor: `${COLORS.primary}10` }]}>
            <AlertCircle size={20} color={COLORS.primary} />
            <View style={styles.infoCardText}>
              <Text style={[styles.infoCardTitle, { color: theme.colors.text }]}>
                Om AI-genererade frågor
              </Text>
              <Text style={[styles.infoCardDescription, { color: theme.colors.textSecondary }]}>
                Frågorna genereras med AI baserat på Skolverkets officiella högskoleprov. 
                De är utformade för att efterlikna verkliga provsituationer och hjälpa dig träna effektivt.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerContent: {
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#FFF',
    flex: 1,
  },
  aiBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,215,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeButtonActive: {},
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  sectionSelector: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionCard: {
    width: (SCREEN_WIDTH - 60) / 3,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionName: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultySection: {
    marginBottom: 24,
  },
  difficultyOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  difficultyIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  difficultyLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  countSection: {
    marginBottom: 24,
  },
  countOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  countButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  countNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  countLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  generateButton: {
    marginBottom: 28,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonDisabled: {
    opacity: 0.8,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  savedTestsSection: {
    marginBottom: 24,
  },
  savedTestCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  savedTestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  savedTestIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  savedTestInfo: {
    flex: 1,
  },
  savedTestName: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  savedTestMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  savedTestStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedTestStatText: {
    fontSize: 12,
  },
  savedTestScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  savedTestScoreText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  savedTestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    marginBottom: 20,
  },
  infoCardContent: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  infoCardText: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  infoCardDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  bottomPadding: {
    height: 100,
  },
  premiumBlockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  premiumBlockCard: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  premiumBlockTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumBlockText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  premiumButton: {
    borderRadius: 14,
    overflow: 'hidden',
    width: '100%',
  },
  premiumButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
});
