import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Home,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/design-system';
import { hpAITestService, StoredAITest } from '@/services/hp-ai-tests';
import { GeneratedHPQuestion } from '@/lib/hp-ai-generator';
import { HP_SECTIONS } from '@/constants/hogskoleprovet';
import * as Haptics from 'expo-haptics';

Dimensions.get('window');

interface AnswerState {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export default function HPAIPracticeScreen() {
  const { theme, isDark } = useTheme();
  const { testId } = useLocalSearchParams<{ testId: string }>();
  
  const [test, setTest] = useState<StoredAITest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const slideAnim = useRef(new Animated.Value(0)).current;

  const loadTest = useCallback(async () => {
    if (!testId) {
      Alert.alert('Fel', 'Inget test valt');
      router.back();
      return;
    }

    try {
      const loadedTest = await hpAITestService.getTestById(testId);
      if (!loadedTest) {
        Alert.alert('Fel', 'Kunde inte hitta testet');
        router.back();
        return;
      }
      setTest(loadedTest);
      setStartTime(Date.now());
      setQuestionStartTime(Date.now());
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading test:', error);
      Alert.alert('Fel', 'Kunde inte ladda testet');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [testId, fadeAnim]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);



  const currentQuestion: GeneratedHPQuestion | null = test?.questions[currentIndex] || null;
  const totalQuestions = test?.questions.length || 0;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const getSectionConfig = (sectionCode: string) => {
    return HP_SECTIONS.find(s => s.code === sectionCode);
  };

  const handleSelectOption = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || !currentQuestion) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    const answerState: AnswerState = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedOption,
      isCorrect,
      timeSpent,
    };

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerState,
    }));

    setShowResult(true);
    Haptics.notificationAsync(
      isCorrect 
        ? Haptics.NotificationFeedbackType.Success 
        : Haptics.NotificationFeedbackType.Error
    );
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setQuestionStartTime(Date.now());
    } else {
      handleCompleteTest();
    }
  };

  const handleCompleteTest = async () => {
    if (!test) return;

    const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
    const scorePercentage = (correctCount / totalQuestions) * 100;

    await hpAITestService.updateTestStats(test.id, scorePercentage, correctCount);

    setIsCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setShowResult(false);
    setIsCompleted(false);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return selectedOption === option
        ? { borderColor: COLORS.primary, borderWidth: 2 }
        : {};
    }

    if (option === currentQuestion?.correctAnswer) {
      return { borderColor: COLORS.success, borderWidth: 2, backgroundColor: `${COLORS.success}15` };
    }

    if (option === selectedOption && option !== currentQuestion?.correctAnswer) {
      return { borderColor: COLORS.error, borderWidth: 2, backgroundColor: `${COLORS.error}15` };
    }

    return { opacity: 0.5 };
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Laddar test...
        </Text>
      </View>
    );
  }

  if (isCompleted) {
    const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
    const scorePercentage = (correctCount / totalQuestions) * 100;
    const totalTime = Math.round((Date.now() - startTime) / 60000);

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <LinearGradient
          colors={isDark 
            ? ['#0F172A', '#1E293B', '#334155'] 
            : ['#10B981', '#059669', '#047857']
          }
          style={styles.resultGradient}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIconContainer}>
                <Trophy size={48} color="#FFF" />
              </View>
              <Text style={styles.resultTitle}>Test avslutat!</Text>
              <Text style={styles.resultSubtitle}>
                {test?.name}
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView style={styles.resultContent} contentContainerStyle={styles.resultScrollContent}>
          <View style={[styles.scoreCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.scoreMainRow}>
              <View style={styles.scoreCircle}>
                <Text style={[styles.scorePercentage, { color: COLORS.success }]}>
                  {scorePercentage.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.scoreDetails}>
                <View style={styles.scoreDetailRow}>
                  <CheckCircle size={18} color={COLORS.success} />
                  <Text style={[styles.scoreDetailText, { color: theme.colors.text }]}>
                    {correctCount} rätt
                  </Text>
                </View>
                <View style={styles.scoreDetailRow}>
                  <XCircle size={18} color={COLORS.error} />
                  <Text style={[styles.scoreDetailText, { color: theme.colors.text }]}>
                    {totalQuestions - correctCount} fel
                  </Text>
                </View>
                <View style={styles.scoreDetailRow}>
                  <Clock size={18} color={theme.colors.textSecondary} />
                  <Text style={[styles.scoreDetailText, { color: theme.colors.text }]}>
                    {totalTime} min
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.resultButton, { backgroundColor: COLORS.primary }]}
              onPress={handleRetry}
            >
              <RotateCcw size={20} color="#FFF" />
              <Text style={styles.resultButtonText}>Gör om testet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resultButtonOutline, { borderColor: theme.colors.border }]}
              onPress={() => router.push('/hp-ai-generator' as any)}
            >
              <Sparkles size={20} color={COLORS.primary} />
              <Text style={[styles.resultButtonOutlineText, { color: COLORS.primary }]}>
                Generera nytt test
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resultButtonOutline, { borderColor: theme.colors.border }]}
              onPress={() => router.push('/hogskoleprovet' as any)}
            >
              <Home size={20} color={theme.colors.text} />
              <Text style={[styles.resultButtonOutlineText, { color: theme.colors.text }]}>
                Tillbaka till HP
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Inga frågor tillgängliga
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: COLORS.primary }]}>Gå tillbaka</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sectionConfig = getSectionConfig(currentQuestion.sectionCode);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface }}>
        <View style={[styles.topBar, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              Alert.alert(
                'Avsluta test',
                'Är du säker på att du vill avsluta? Dina framsteg sparas inte.',
                [
                  { text: 'Fortsätt', style: 'cancel' },
                  { text: 'Avsluta', style: 'destructive', onPress: () => router.back() },
                ]
              );
            }}
          >
            <ChevronLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: sectionConfig?.color || COLORS.primary },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {currentIndex + 1} / {totalQuestions}
            </Text>
          </View>

          <View style={[styles.sectionBadge, { backgroundColor: `${sectionConfig?.color || COLORS.primary}20` }]}>
            <Text style={[styles.sectionBadgeText, { color: sectionConfig?.color || COLORS.primary }]}>
              {currentQuestion.sectionCode}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.questionContainer}
        contentContainerStyle={styles.questionContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.questionCard,
            { backgroundColor: theme.colors.surface, transform: [{ translateX: slideAnim }] },
          ]}
        >
          {currentQuestion.readingPassage && (
            <View style={[styles.passageContainer, { backgroundColor: `${COLORS.primary}08` }]}>
              <Text style={[styles.passageLabel, { color: theme.colors.textSecondary }]}>
                Läs texten:
              </Text>
              <Text style={[styles.passageText, { color: theme.colors.text }]}>
                {currentQuestion.readingPassage}
              </Text>
            </View>
          )}

          <View style={styles.questionHeader}>
            <View style={[styles.difficultyBadge, {
              backgroundColor: currentQuestion.difficulty === 'easy' ? `${COLORS.success}20` :
                currentQuestion.difficulty === 'medium' ? `${COLORS.warning}20` : `${COLORS.error}20`
            }]}>
              <Text style={[styles.difficultyText, {
                color: currentQuestion.difficulty === 'easy' ? COLORS.success :
                  currentQuestion.difficulty === 'medium' ? COLORS.warning : COLORS.error
              }]}>
                {currentQuestion.difficulty === 'easy' ? 'Lätt' :
                  currentQuestion.difficulty === 'medium' ? 'Medel' : 'Svår'}
              </Text>
            </View>
          </View>

          <Text style={[styles.questionText, { color: theme.colors.text }]}>
            {currentQuestion.questionText}
          </Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.colors.background },
                  getOptionStyle(option),
                ]}
                onPress={() => handleSelectOption(option)}
                disabled={showResult}
                activeOpacity={0.7}
              >
                <View style={[styles.optionLetter, {
                  backgroundColor: selectedOption === option && !showResult
                    ? COLORS.primary
                    : theme.colors.surface,
                }]}>
                  <Text style={[styles.optionLetterText, {
                    color: selectedOption === option && !showResult
                      ? '#FFF'
                      : theme.colors.textSecondary,
                  }]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: theme.colors.text }]}>
                  {option}
                </Text>
                {showResult && option === currentQuestion.correctAnswer && (
                  <CheckCircle size={20} color={COLORS.success} />
                )}
                {showResult && option === selectedOption && option !== currentQuestion.correctAnswer && (
                  <XCircle size={20} color={COLORS.error} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {showResult && (
            <View style={[styles.explanationContainer, { backgroundColor: `${COLORS.primary}10` }]}>
              <Text style={[styles.explanationLabel, { color: COLORS.primary }]}>
                Förklaring:
              </Text>
              <Text style={[styles.explanationText, { color: theme.colors.text }]}>
                {currentQuestion.explanation}
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.surface }}>
        <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface }]}>
          {!showResult ? (
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedOption && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirmAnswer}
              disabled={!selectedOption}
            >
              <LinearGradient
                colors={selectedOption ? ['#6366F1', '#8B5CF6'] : ['#9CA3AF', '#6B7280']}
                style={styles.confirmButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.confirmButtonText}>Bekräfta svar</Text>
                <CheckCircle size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.nextButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.nextButtonText}>
                  {currentIndex < totalQuestions - 1 ? 'Nästa fråga' : 'Avsluta test'}
                </Text>
                <ArrowRight size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 12,
  },
  backLink: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  questionContainer: {
    flex: 1,
  },
  questionContent: {
    padding: 16,
  },
  questionCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  passageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  passageLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  passageText: {
    fontSize: 15,
    lineHeight: 24,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  explanationLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  confirmButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  nextButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  resultGradient: {
    paddingBottom: 30,
  },
  resultHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFF',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultScrollContent: {
    padding: 20,
  },
  scoreCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
  },
  scorePercentage: {
    fontSize: 32,
    fontWeight: '800' as const,
  },
  scoreDetails: {
    flex: 1,
    gap: 10,
  },
  scoreDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreDetailText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  resultActions: {
    gap: 12,
  },
  resultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  resultButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  resultButtonOutlineText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 40,
  },
});
