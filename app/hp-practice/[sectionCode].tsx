import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  AlertCircle,
  Flag,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { HP_SECTIONS } from '@/constants/hogskoleprovet';
import { COLORS } from '@/constants/design-system';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HPPracticeScreen() {
  const { sectionCode } = useLocalSearchParams<{ sectionCode: string }>();
  const { theme, isDark } = useTheme();
  const { 
    sessionState, 
    setSessionState,
    startPracticeSession, 
    submitAnswer,
    completeSession,
    abandonSession,
  } = useHogskoleprovet();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));

  const section = HP_SECTIONS.find(s => s.code === sectionCode);

  useEffect(() => {
    const initSession = async () => {
      if (!sessionState && sectionCode) {
        console.log('[HP Practice] Starting session for:', sectionCode);
        await startPracticeSession(sectionCode);
      }
    };
    initSession();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionCode]);

  useEffect(() => {
    if (sessionState && sessionState.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSessionState(prev => {
          if (!prev) return prev;
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            handleTimeUp();
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionState?.attemptId]);

  const handleTimeUp = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    Alert.alert(
      'Tiden är slut!',
      'Ditt resultat sparas nu.',
      [{ text: 'OK' }]
    );
  }, []);

  const currentQuestion = sessionState?.questions[sessionState.currentQuestionIndex];
  const totalQuestions = sessionState?.questions.length || 0;
  const currentIndex = (sessionState?.currentQuestionIndex || 0) + 1;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || !sessionState) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    submitAnswer(currentQuestion.id, selectedAnswer, timeSpent);
    setShowExplanation(true);
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    Haptics.notificationAsync(
      isCorrect 
        ? Haptics.NotificationFeedbackType.Success 
        : Haptics.NotificationFeedbackType.Error
    );
  };

  const handleNextQuestion = () => {
    if (!sessionState) return;

    if (sessionState.currentQuestionIndex < sessionState.questions.length - 1) {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -SCREEN_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();

      setSessionState(prev => {
        if (!prev) return prev;
        return { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 };
      });
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      handleFinish();
    }
  };

  const handlePreviousQuestion = () => {
    if (!sessionState || sessionState.currentQuestionIndex === 0) return;

    setSessionState(prev => {
      if (!prev) return prev;
      return { ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 };
    });

    const prevQuestion = sessionState.questions[sessionState.currentQuestionIndex - 1];
    const prevAnswer = sessionState.answers[prevQuestion.id];
    setSelectedAnswer(prevAnswer?.answer || null);
    setShowExplanation(!!prevAnswer);
  };

  const handleFinish = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const result = await completeSession();
    
    if (result) {
      router.replace({
        pathname: '/hp-results' as any,
        params: {
          totalQuestions: result.totalQuestions.toString(),
          correctAnswers: result.correctAnswers.toString(),
          scorePercentage: result.scorePercentage.toFixed(1),
          estimatedHPScore: result.estimatedHPScore.toFixed(2),
          timeSpentMinutes: result.timeSpentMinutes.toString(),
          sectionCode: result.sectionCode || '',
          newMilestones: JSON.stringify(result.newMilestones),
        },
      });
    }
  };

  const handleQuit = () => {
    Alert.alert(
      'Avbryt övningen?',
      'Din nuvarande progress sparas inte.',
      [
        { text: 'Fortsätt', style: 'cancel' },
        { 
          text: 'Avbryt', 
          style: 'destructive',
          onPress: async () => {
            await abandonSession();
            router.back();
          }
        },
      ]
    );
  };

  if (!sessionState || !currentQuestion || !section) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Laddar frågor...
        </Text>
      </View>
    );
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const timeRemaining = sessionState.timeRemaining;
  const isLowTime = timeRemaining < 60;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBg, { backgroundColor: theme.colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(currentIndex / totalQuestions) * 100}%`,
                    backgroundColor: section.color,
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {currentIndex} / {totalQuestions}
            </Text>
          </View>

          <View style={[
            styles.timerContainer,
            isLowTime && styles.timerLow,
          ]}>
            <Clock size={16} color={isLowTime ? COLORS.error : theme.colors.textSecondary} />
            <Text style={[
              styles.timerText,
              { color: isLowTime ? COLORS.error : theme.colors.text },
            ]}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[
            styles.questionCard,
            { 
              backgroundColor: theme.colors.surface,
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            }
          ]}>
            <View style={styles.questionHeader}>
              <LinearGradient
                colors={section.gradientColors as any}
                style={styles.sectionBadge}
              >
                <Text style={styles.sectionBadgeText}>{section.name}</Text>
              </LinearGradient>
              <Text style={[styles.difficultyBadge, { 
                backgroundColor: currentQuestion.difficulty === 'easy' 
                  ? `${COLORS.success}20` 
                  : currentQuestion.difficulty === 'hard'
                    ? `${COLORS.error}20`
                    : `${COLORS.warning}20`,
                color: currentQuestion.difficulty === 'easy'
                  ? COLORS.success
                  : currentQuestion.difficulty === 'hard'
                    ? COLORS.error
                    : COLORS.warning,
              }]}>
                {currentQuestion.difficulty === 'easy' ? 'Lätt' : currentQuestion.difficulty === 'hard' ? 'Svår' : 'Medel'}
              </Text>
            </View>

            {currentQuestion.readingPassage && (
              <View style={[styles.passageContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <Text style={[styles.passageLabel, { color: theme.colors.textSecondary }]}>
                  Läs texten:
                </Text>
                <Text style={[styles.passageText, { color: theme.colors.text }]}>
                  {currentQuestion.readingPassage}
                </Text>
              </View>
            )}

            <Text style={[styles.questionText, { color: theme.colors.text }]}>
              {currentQuestion.questionText}
            </Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = option === currentQuestion.correctAnswer;
                const showCorrect = showExplanation && isCorrectOption;
                const showWrong = showExplanation && isSelected && !isCorrectOption;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: theme.colors.background,
                        borderColor: isSelected 
                          ? showWrong 
                            ? COLORS.error 
                            : showCorrect 
                              ? COLORS.success 
                              : section.color
                          : showCorrect
                            ? COLORS.success
                            : theme.colors.border,
                      },
                      isSelected && styles.optionSelected,
                      showCorrect && styles.optionCorrect,
                      showWrong && styles.optionWrong,
                    ]}
                    onPress={() => handleSelectAnswer(option)}
                    disabled={showExplanation}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.optionIndicator,
                      { 
                        borderColor: isSelected 
                          ? showWrong 
                            ? COLORS.error 
                            : showCorrect
                              ? COLORS.success
                              : section.color
                          : showCorrect
                            ? COLORS.success
                            : theme.colors.border,
                        backgroundColor: isSelected 
                          ? showWrong 
                            ? COLORS.error 
                            : showCorrect
                              ? COLORS.success
                              : section.color
                          : showCorrect
                            ? COLORS.success
                            : 'transparent',
                      }
                    ]}>
                      {(isSelected || showCorrect) && (
                        showCorrect || (isSelected && !showWrong)
                          ? <CheckCircle size={16} color="#FFF" />
                          : showWrong
                            ? <X size={16} color="#FFF" />
                            : <Circle size={16} color="#FFF" />
                      )}
                    </View>
                    <Text style={[
                      styles.optionText,
                      { color: theme.colors.text },
                      (showCorrect || (isSelected && !showWrong && showExplanation)) && styles.optionTextCorrect,
                      showWrong && styles.optionTextWrong,
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {showExplanation && currentQuestion.explanation && (
              <View style={[
                styles.explanationContainer,
                { backgroundColor: isCorrect ? `${COLORS.success}10` : `${COLORS.error}10` }
              ]}>
                <View style={styles.explanationHeader}>
                  {isCorrect ? (
                    <CheckCircle size={20} color={COLORS.success} />
                  ) : (
                    <AlertCircle size={20} color={COLORS.error} />
                  )}
                  <Text style={[
                    styles.explanationTitle,
                    { color: isCorrect ? COLORS.success : COLORS.error }
                  ]}>
                    {isCorrect ? 'Rätt svar!' : 'Fel svar'}
                  </Text>
                </View>
                <Text style={[styles.explanationText, { color: theme.colors.text }]}>
                  {currentQuestion.explanation}
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: theme.colors.surface },
              sessionState.currentQuestionIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePreviousQuestion}
            disabled={sessionState.currentQuestionIndex === 0}
          >
            <ChevronLeft size={24} color={sessionState.currentQuestionIndex === 0 ? theme.colors.textSecondary : theme.colors.text} />
          </TouchableOpacity>

          {!showExplanation ? (
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: selectedAnswer ? section.color : theme.colors.border },
              ]}
              onPress={handleSubmitAnswer}
              disabled={!selectedAnswer}
            >
              <Text style={[
                styles.submitButtonText,
                { color: selectedAnswer ? '#FFF' : theme.colors.textSecondary },
              ]}>
                Svara
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: section.color }]}
              onPress={handleNextQuestion}
            >
              <Text style={styles.submitButtonText}>
                {currentIndex === totalQuestions ? 'Avsluta' : 'Nästa'}
              </Text>
              {currentIndex !== totalQuestions && (
                <ChevronRight size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleFinish}
          >
            <Flag size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  quitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  timerLow: {
    backgroundColor: `${COLORS.error}15`,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  questionCard: {
    borderRadius: 20,
    padding: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '600' as const,
    overflow: 'hidden',
  },
  passageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  passageLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  passageText: {
    fontSize: 14,
    lineHeight: 22,
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
    borderWidth: 2,
    gap: 14,
  },
  optionSelected: {},
  optionCorrect: {
    backgroundColor: `${COLORS.success}10`,
  },
  optionWrong: {
    backgroundColor: `${COLORS.error}10`,
  },
  optionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  optionTextCorrect: {
    fontWeight: '600' as const,
    color: COLORS.success,
  },
  optionTextWrong: {
    color: COLORS.error,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
  },
});
