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
import { router, Stack } from 'expo-router';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  AlertCircle,
  Flag,
  Book,
  Pause,
  Play,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { getSectionByCode } from '@/constants/hogskoleprovet';
import { COLORS } from '@/constants/design-system';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HPFullTestScreen() {
  const { theme, isDark } = useTheme();
  const { 
    sessionState, 
    setSessionState,
    startFullTest, 
    submitAnswer,
    completeSession,
    abandonSession,
  } = useHogskoleprovet();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const initSession = async () => {
      if (!sessionState) {
        console.log('[HP Full Test] Starting full test');
        await startFullTest();
      }
    };
    initSession();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionState && sessionState.timeRemaining > 0 && !isPaused) {
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
    } else if (timerRef.current && isPaused) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionState?.attemptId, isPaused]);

  const handleTimeUp = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    Alert.alert(
      'Tiden är slut!',
      'Ditt resultat sparas nu.',
      [{ text: 'OK', onPress: handleFinish }]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQuestion = sessionState?.questions[sessionState.currentQuestionIndex];
  const totalQuestions = sessionState?.questions.length || 0;
  const currentIndex = (sessionState?.currentQuestionIndex || 0) + 1;

  const currentSectionCode = currentQuestion?.sectionCode;
  const section = currentSectionCode ? getSectionByCode(currentSectionCode) : null;

  const getCurrentSectionProgress = () => {
    if (!sessionState) return { current: 0, total: 0 };
    
    const sectionQuestions = sessionState.questions.filter(q => q.sectionCode === currentSectionCode);
    const sectionStartIndex = sessionState.questions.findIndex(q => q.sectionCode === currentSectionCode);
    const currentInSection = sessionState.currentQuestionIndex - sectionStartIndex + 1;
    
    return {
      current: currentInSection,
      total: sectionQuestions.length,
    };
  };

  const sectionProgress = getCurrentSectionProgress();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
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
          sectionCode: '',
          newMilestones: JSON.stringify(result.newMilestones),
        },
      });
    }
  };

  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleQuit = () => {
    Alert.alert(
      'Avbryt provet?',
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
          Förbereder provet...
        </Text>
      </View>
    );
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const timeRemaining = sessionState.timeRemaining;
  const isLowTime = timeRemaining < 300;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <LinearGradient
          colors={[
            theme.colors.background,
            theme.colors.background,
            'rgba(0,0,0,0)',
          ]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <X size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <LinearGradient
              colors={section.gradientColors as any}
              style={styles.sectionBadge}
            >
              <Text style={styles.sectionBadgeText}>{section.name}</Text>
            </LinearGradient>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              Fråga {sectionProgress.current} / {sectionProgress.total}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.pauseButton, { backgroundColor: theme.colors.surface }]}
              onPress={handleTogglePause}
            >
              {isPaused ? (
                <Play size={18} color={theme.colors.text} />
              ) : (
                <Pause size={18} color={theme.colors.text} />
              )}
            </TouchableOpacity>
          </View>
          </View>
        </LinearGradient>

        <View style={[styles.progressBar, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.progressBg, { backgroundColor: theme.colors.border }]}>
            <LinearGradient
              colors={section.gradientColors as any}
              style={[
                styles.progressFill,
                { width: `${(currentIndex / totalQuestions) * 100}%` }
              ]}
            />
          </View>
          
          <View style={styles.timerRow}>
            <View style={[
              styles.timerContainer,
              isLowTime && styles.timerLow,
            ]}>
              <Clock size={14} color={isLowTime ? COLORS.error : theme.colors.textSecondary} />
              <Text style={[
                styles.timerText,
                { color: isLowTime ? COLORS.error : theme.colors.text },
              ]}>
                {formatTime(timeRemaining)}
              </Text>
            </View>
            
            <Text style={[styles.totalProgress, { color: theme.colors.textSecondary }]}>
              {currentIndex} / {totalQuestions}
            </Text>
          </View>
        </View>

        {isPaused ? (
          <View style={styles.pausedOverlay}>
            <View style={[styles.pausedCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.pausedIcon, { backgroundColor: `${COLORS.warning}20` }]}>
                <Pause size={40} color={COLORS.warning} />
              </View>
              <Text style={[styles.pausedTitle, { color: theme.colors.text }]}>
                Provet är pausat
              </Text>
              <Text style={[styles.pausedSubtitle, { color: theme.colors.textSecondary }]}>
                Tryck på play för att fortsätta
              </Text>
              <TouchableOpacity
                style={styles.resumeButton}
                onPress={handleTogglePause}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.resumeButtonGradient}
                >
                  <Play size={20} color="#FFF" />
                  <Text style={styles.resumeButtonText}>Fortsätt</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
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
                  transform: [
                    { translateX: slideAnim },
                    { scale: scaleAnim },
                  ],
                }
              ]}>
                <View style={styles.questionHeader}>
                  <LinearGradient
                    colors={[
                      currentQuestion.difficulty === 'easy' 
                        ? `${COLORS.success}20` 
                        : currentQuestion.difficulty === 'hard'
                          ? `${COLORS.error}20`
                          : `${COLORS.warning}20`,
                      currentQuestion.difficulty === 'easy' 
                        ? `${COLORS.success}10` 
                        : currentQuestion.difficulty === 'hard'
                          ? `${COLORS.error}10`
                          : `${COLORS.warning}10`,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.difficultyBadge}
                  >
                    <Text style={[styles.difficultyBadgeText, { 
                      color: currentQuestion.difficulty === 'easy'
                        ? COLORS.success
                        : currentQuestion.difficulty === 'hard'
                          ? COLORS.error
                          : COLORS.warning,
                    }]}>
                      {currentQuestion.difficulty === 'easy' ? 'Lätt' : currentQuestion.difficulty === 'hard' ? 'Svår' : 'Medel'}
                    </Text>
                  </LinearGradient>
                </View>

                {currentQuestion.readingPassage && (
                  <View style={[styles.passageContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <View style={styles.passageHeader}>
                      <Book size={16} color={theme.colors.textSecondary} />
                      <Text style={[styles.passageLabel, { color: theme.colors.textSecondary }]}>
                        Läs texten:
                      </Text>
                    </View>
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
                  ]}
                  onPress={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                >
                  <LinearGradient
                    colors={selectedAnswer ? (section.gradientColors as any) : [theme.colors.border, theme.colors.border]}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={[
                      styles.submitButtonText,
                      { color: selectedAnswer ? '#FFF' : theme.colors.textSecondary },
                    ]}>
                      Svara
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleNextQuestion}
                >
                  <LinearGradient
                    colors={section.gradientColors as any}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>
                      {currentIndex === totalQuestions ? 'Avsluta' : 'Nästa'}
                    </Text>
                    {currentIndex !== totalQuestions && (
                      <ChevronRight size={20} color="#FFF" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: theme.colors.surface }]}
                onPress={handleFinish}
              >
                <Flag size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  quitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  sectionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionBadgeText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
    paddingTop: 8,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontWeight: '800' as const,
    letterSpacing: 0.3,
  },
  totalProgress: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  pausedOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pausedCard: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  pausedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pausedTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  pausedSubtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  resumeButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  resumeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  resumeButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  questionCard: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  questionHeader: {
    marginBottom: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  difficultyBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  passageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  passageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  passageLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  passageText: {
    fontSize: 14,
    lineHeight: 22,
  },
  questionText: {
    fontSize: 19,
    fontWeight: '700' as const,
    lineHeight: 28,
    marginBottom: 28,
    letterSpacing: 0.2,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2.5,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionSelected: {},
  optionCorrect: {
    backgroundColor: `${COLORS.success}10`,
  },
  optionWrong: {
    backgroundColor: `${COLORS.error}10`,
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  optionTextCorrect: {
    fontWeight: '600' as const,
    color: COLORS.success,
  },
  optionTextWrong: {
    color: COLORS.error,
  },
  explanationContainer: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  navButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  submitButton: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 10,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFF',
    letterSpacing: 0.5,
  },
});
