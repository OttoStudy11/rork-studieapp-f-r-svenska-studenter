import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { supabase } from '@/lib/supabase';
import { generateQuizFromCourse, generateQuizFromText } from '@/lib/quiz-ai';
import type { GeneratedQuiz } from '@/lib/quiz-ai';
import { XP_VALUES } from '@/constants/xp-system';
import { PremiumGate } from '@/components/PremiumGate';
import { FreemiumBanner, FreemiumLimitReached } from '@/components/FreemiumBanner';
import { useFreemiumLimits } from '@/hooks/useFreemiumLimits';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Sparkles,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Award,
  RotateCcw,
  Home,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react-native';

type QuizState = 'loading' | 'empty' | 'playing' | 'review' | 'results';

interface UserAnswer {
  questionIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
}

export default function CourseQuizScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { theme } = useTheme();

  const { addXp, isReady: gamificationReady } = useGamification();
  const freemium = useFreemiumLimits();
  const quizLimit = freemium.checkQuiz();


  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputText, setInputText] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: course } = useQuery({
    queryKey: ['course-title', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const { data } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .maybeSingle();
      if (data) return data;
      const { data: uniData } = await supabase
        .from('university_courses')
        .select('title')
        .eq('id', courseId)
        .maybeSingle();
      return uniData;
    },
    enabled: !!courseId,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!courseId) throw new Error('Ingen kurs vald');
      console.log('🧠 Generating quiz for course:', courseId);
      return generateQuizFromCourse({ courseId, count: 10 });
    },
    onSuccess: (data) => {
      console.log('✅ Quiz generated:', data.questions.length, 'questions');
      freemium.trackUsage('course_quiz', { courseId: courseId || '' });
      setQuiz(data);
      setQuizState('playing');
      setCurrentIndex(0);
      setUserAnswers([]);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeElapsed(0);
    },
    onError: (error: any) => {
      console.error('❌ Quiz generation failed:', error);
      Alert.alert('Fel', error?.message || 'Kunde inte generera quiz');
      setQuizState('empty');
    },
  });

  const generateFromTextMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!courseId) throw new Error('Ingen kurs vald');
      return generateQuizFromText({ text, courseId, count: 10 });
    },
    onSuccess: (data) => {
      console.log('✅ Quiz from text generated:', data.questions.length, 'questions');
      freemium.trackUsage('course_quiz', { courseId: courseId || '' });
      setQuiz(data);
      setQuizState('playing');
      setCurrentIndex(0);
      setUserAnswers([]);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeElapsed(0);
      setShowInputModal(false);
      setInputText('');
    },
    onError: (error: any) => {
      console.error('❌ Quiz from text failed:', error);
      Alert.alert('Fel', error?.message || 'Kunde inte generera quiz från text');
    },
  });

  useEffect(() => {
    if (quizState === 'loading') {
      setQuizState('empty');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (quizState === 'playing' && quiz) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizState, quiz]);

  useEffect(() => {
    if (quizState === 'playing') {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, quizState]);

  const handleSelectAnswer = useCallback((index: number) => {
    if (showFeedback) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAnswer(index);
  }, [showFeedback]);

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer === null || !quiz) return;

    const currentQuestion = quiz.questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;

    Haptics.notificationAsync(
      isCorrect
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );

    setUserAnswers(prev => [...prev, {
      questionIndex: currentIndex,
      selectedIndex: selectedAnswer,
      isCorrect,
    }]);
    setShowFeedback(true);
  }, [selectedAnswer, quiz, currentIndex]);

  const handleCompleteQuiz = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setQuizState('results');

    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = quiz?.questions.length || 0;
    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    let xpEarned = 0;
    if (scorePercent >= 90) {
      xpEarned = XP_VALUES.QUIZ_90_100_PERCENT;
      if (scorePercent === 100) xpEarned += XP_VALUES.PERFECT_QUIZ_BONUS;
    } else if (scorePercent >= 75) {
      xpEarned = XP_VALUES.QUIZ_75_90_PERCENT;
    } else if (scorePercent >= 50) {
      xpEarned = XP_VALUES.QUIZ_50_75_PERCENT;
    }

    if (gamificationReady && xpEarned > 0) {
      try {
        console.log(`🎯 Awarding ${xpEarned} XP for quiz (${scorePercent}%)`);
        await addXp(xpEarned, 'quiz_complete', courseId, {
          quizTitle: quiz?.title,
          scorePercent,
          correctCount,
          totalQuestions,
        });
      } catch (xpError) {
        console.error('Error awarding XP:', xpError);
      }
    }

    Haptics.notificationAsync(
      scorePercent >= 70
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
  }, [userAnswers, quiz, gamificationReady, addXp, courseId]);

  const handleNextQuestion = useCallback(() => {
    if (!quiz) return;

    if (currentIndex < quiz.questions.length - 1) {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      handleCompleteQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, currentIndex, handleCompleteQuiz]);

  const handleRestartQuiz = useCallback(() => {
    setCurrentIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeElapsed(0);
    setQuizState('playing');
  }, []);

  const handleNewQuiz = useCallback(() => {
    setQuiz(null);
    setCurrentIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeElapsed(0);
    setQuizState('empty');
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return theme.colors.textMuted;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Lätt';
      case 'medium': return 'Medel';
      case 'hard': return 'Svår';
      default: return '';
    }
  };

  if (quizState === 'loading') {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (quizState === 'empty') {
    if (!quizLimit.isPremium && !quizLimit.isAllowed) {
      return (
        <View style={[styles.container, { backgroundColor: '#0F172A' }]}>
          <Stack.Screen options={{ headerShown: false }} />
          <FreemiumLimitReached
            feature="course_quiz"
            status={quizLimit}
            onGoBack={() => router.back()}
          />
        </View>
      );
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0F172A' }]} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <ArrowLeft size={24} color="#F1F5F9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
          <View style={styles.headerBackButton} />
        </View>

        {!quizLimit.isPremium && (
          <FreemiumBanner
            feature="course_quiz"
            status={quizLimit}
            compact
            style={{ marginHorizontal: 16, marginBottom: 8 }}
          />
        )}

        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <LinearGradient
                colors={['#F59E0B', '#EF4444']}
                style={styles.emptyIconGradient}
              >
                <Target size={56} color="white" strokeWidth={2} />
              </LinearGradient>
            </View>
            <Text style={styles.emptyTitle}>Testa dina kunskaper</Text>
            <Text style={styles.emptyText}>
              Generera ett quiz med AI-skapade flervalsfrågor baserat på{' '}
              {course?.title || 'din kurs'}
            </Text>

            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#F59E0B', '#EF4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.generateGradient}
              >
                {generateMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Sparkles size={20} color="#fff" />
                    <Text style={styles.generateButtonText}>Generera Quiz</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.orText}>eller</Text>

            <TouchableOpacity
              style={styles.textInputButton}
              onPress={() => setShowInputModal(true)}
            >
              <Plus size={20} color="#F59E0B" />
              <Text style={styles.textInputButtonText}>Skapa från egen text</Text>
            </TouchableOpacity>
          </View>

          {showInputModal && (
            <KeyboardAvoidingView
              style={styles.modalOverlay}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Skapa quiz från text</Text>
                  <TouchableOpacity
                    onPress={() => { setShowInputModal(false); setInputText(''); }}
                    style={styles.modalCloseButton}
                  >
                    <X size={24} color="#F1F5F9" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalDescription}>
                  Klistra in text eller anteckningar. AI:n skapar flervalsfrågor automatiskt.
                </Text>
                <ScrollView style={styles.modalInputScroll}>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Klistra in din text här..."
                    placeholderTextColor="#64748B"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    textAlignVertical="top"
                  />
                </ScrollView>
                <TouchableOpacity
                  style={[styles.modalGenerateButton, generateFromTextMutation.isPending && styles.buttonDisabled]}
                  onPress={() => generateFromTextMutation.mutate(inputText)}
                  disabled={generateFromTextMutation.isPending}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#EF4444']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.generateGradient}
                  >
                    {generateFromTextMutation.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Sparkles size={20} color="#fff" />
                        <Text style={styles.generateButtonText}>Generera quiz</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}
        </SafeAreaView>
    );
  }

  if (quizState === 'results' && quiz) {
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);
    let xpEarned = 0;
    if (scorePercent >= 90) {
      xpEarned = XP_VALUES.QUIZ_90_100_PERCENT;
      if (scorePercent === 100) xpEarned += XP_VALUES.PERFECT_QUIZ_BONUS;
    } else if (scorePercent >= 75) {
      xpEarned = XP_VALUES.QUIZ_75_90_PERCENT;
    } else if (scorePercent >= 50) {
      xpEarned = XP_VALUES.QUIZ_50_75_PERCENT;
    }

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.resultsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={scorePercent >= 70 ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']}
            style={styles.resultsHeader}
          >
            <View style={styles.resultsIconWrap}>
              {scorePercent >= 70 ? (
                <Trophy size={48} color="white" />
              ) : (
                <Target size={48} color="white" />
              )}
            </View>
            <Text style={styles.resultsTitle}>
              {scorePercent >= 90 ? 'Fantastiskt!' :
               scorePercent >= 70 ? 'Bra jobbat!' :
               scorePercent >= 50 ? 'Nästan där!' : 'Fortsätt öva!'}
            </Text>
            <Text style={styles.resultsSubtitle}>
              Du fick {correctCount} av {quiz.questions.length} rätt
            </Text>
          </LinearGradient>

          <View style={styles.resultsBody}>
            <View style={styles.scoreContainer}>
              <View style={[styles.scoreCircle, {
                borderColor: scorePercent >= 70 ? theme.colors.success : theme.colors.warning
              }]}>
                <Text style={[styles.scorePercent, {
                  color: scorePercent >= 70 ? theme.colors.success : theme.colors.warning
                }]}>
                  {scorePercent}%
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIconWrap, { backgroundColor: theme.colors.success + '15' }]}>
                  <CheckCircle size={20} color={theme.colors.success} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{correctCount}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Rätt</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIconWrap, { backgroundColor: theme.colors.error + '15' }]}>
                  <XCircle size={20} color={theme.colors.error} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{quiz.questions.length - correctCount}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Fel</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIconWrap, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Clock size={20} color={theme.colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{formatTime(timeElapsed)}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Tid</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIconWrap, { backgroundColor: '#F59E0B15' }]}>
                  <Award size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>+{xpEarned}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Poäng</Text>
              </View>
            </View>

            <View style={styles.reviewSection}>
              <Text style={[styles.reviewTitle, { color: theme.colors.text }]}>Dina svar</Text>
              {userAnswers.map((ua, index) => {
                const q = quiz.questions[ua.questionIndex];
                return (
                  <View
                    key={index}
                    style={[
                      styles.reviewItem,
                      { backgroundColor: theme.colors.card },
                      ua.isCorrect
                        ? { borderLeftColor: theme.colors.success }
                        : { borderLeftColor: theme.colors.error }
                    ]}
                  >
                    <View style={styles.reviewItemHeader}>
                      <Text style={[styles.reviewQuestion, { color: theme.colors.text }]} numberOfLines={2}>
                        {index + 1}. {q.question}
                      </Text>
                      {ua.isCorrect ? (
                        <CheckCircle size={20} color={theme.colors.success} />
                      ) : (
                        <XCircle size={20} color={theme.colors.error} />
                      )}
                    </View>
                    <View style={styles.reviewAnswers}>
                      <Text style={[styles.yourAnswerLabel, { color: theme.colors.textMuted }]}>
                        Ditt svar:{' '}
                        <Text style={{ color: ua.isCorrect ? theme.colors.success : theme.colors.error }}>
                          {q.options[ua.selectedIndex]}
                        </Text>
                      </Text>
                      {!ua.isCorrect && (
                        <Text style={[styles.correctAnswerLabel, { color: theme.colors.success }]}>
                          Rätt svar: {q.options[q.correctIndex]}
                        </Text>
                      )}
                      {q.explanation && (
                        <Text style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
                          💡 {q.explanation}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleRestartQuiz}
              >
                <RotateCcw size={20} color="white" />
                <Text style={styles.actionButtonText}>Gör om quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
                onPress={handleNewQuiz}
              >
                <Sparkles size={20} color="white" />
                <Text style={styles.actionButtonText}>Nytt quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton, { backgroundColor: theme.colors.card }]}
                onPress={() => router.back()}
              >
                <Home size={20} color={theme.colors.text} />
                <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Tillbaka</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (quizState === 'playing' && quiz) {
    const currentQuestion = quiz.questions[currentIndex];
    const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Stack.Screen options={{ headerShown: false }} />

          <LinearGradient
            colors={['#F59E0B', '#EF4444']}
            style={styles.playingHeader}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                Alert.alert(
                  'Avsluta quiz?',
                  'Din progress kommer att förloras.',
                  [
                    { text: 'Avbryt', style: 'cancel' },
                    { text: 'Avsluta', style: 'destructive', onPress: () => router.back() }
                  ]
                );
              }}
            >
              <XCircle size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.playingHeaderContent}>
              <Text style={styles.playingHeaderTitle} numberOfLines={1}>
                {course?.title || 'Quiz'}
              </Text>
              <View style={styles.playingHeaderMeta}>
                <View style={styles.timerBadge}>
                  <Clock size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(currentQuestion.difficulty) }]}>
                  <Text style={styles.diffBadgeText}>
                    {getDifficultyLabel(currentQuestion.difficulty)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                Fråga {currentIndex + 1} av {quiz.questions.length}
              </Text>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.playingScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.questionContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <View style={[styles.questionCard, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.questionText, { color: theme.colors.text }]}>
                  {currentQuestion.question}
                </Text>
              </View>

              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = showFeedback && index === currentQuestion.correctIndex;
                  const isWrong = showFeedback && isSelected && index !== currentQuestion.correctIndex;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        { backgroundColor: theme.colors.card },
                        isSelected && !showFeedback && { borderColor: theme.colors.primary, borderWidth: 2 },
                        isCorrect && { backgroundColor: theme.colors.success + '15', borderColor: theme.colors.success, borderWidth: 2 },
                        isWrong && { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error, borderWidth: 2 },
                      ]}
                      onPress={() => handleSelectAnswer(index)}
                      disabled={showFeedback}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.optionIndex,
                        { backgroundColor: theme.colors.surface },
                        isSelected && !showFeedback && { backgroundColor: theme.colors.primary },
                        isCorrect && { backgroundColor: theme.colors.success },
                        isWrong && { backgroundColor: theme.colors.error },
                      ]}>
                        <Text style={[
                          styles.optionIndexText,
                          { color: theme.colors.textSecondary },
                          (isSelected || isCorrect || isWrong) && { color: 'white' },
                        ]}>
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>
                      <Text style={[
                        styles.optionText,
                        { color: theme.colors.text },
                        isCorrect && { color: theme.colors.success, fontWeight: '600' as const },
                        isWrong && { color: theme.colors.error },
                      ]}>
                        {option}
                      </Text>
                      {showFeedback && isCorrect && <CheckCircle size={20} color={theme.colors.success} />}
                      {showFeedback && isWrong && <XCircle size={20} color={theme.colors.error} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {showFeedback && (
                <View style={[
                  styles.feedbackContainer,
                  {
                    backgroundColor: userAnswers[userAnswers.length - 1]?.isCorrect
                      ? theme.colors.success + '15'
                      : theme.colors.error + '15'
                  }
                ]}>
                  {userAnswers[userAnswers.length - 1]?.isCorrect ? (
                    <>
                      <CheckCircle size={24} color={theme.colors.success} />
                      <View style={styles.feedbackTextWrap}>
                        <Text style={[styles.feedbackTitle, { color: theme.colors.success }]}>
                          Rätt svar! 🎉
                        </Text>
                        {currentQuestion.explanation && (
                          <Text style={[styles.feedbackExplanation, { color: theme.colors.textSecondary }]}>
                            {currentQuestion.explanation}
                          </Text>
                        )}
                      </View>
                    </>
                  ) : (
                    <>
                      <XCircle size={24} color={theme.colors.error} />
                      <View style={styles.feedbackTextWrap}>
                        <Text style={[styles.feedbackTitle, { color: theme.colors.error }]}>
                          Fel svar
                        </Text>
                        <Text style={[styles.feedbackCorrect, { color: theme.colors.textSecondary }]}>
                          Rätt svar: {currentQuestion.options[currentQuestion.correctIndex]}
                        </Text>
                        {currentQuestion.explanation && (
                          <Text style={[styles.feedbackExplanation, { color: theme.colors.textSecondary }]}>
                            {currentQuestion.explanation}
                          </Text>
                        )}
                      </View>
                    </>
                  )}
                </View>
              )}
            </Animated.View>
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
            {!showFeedback ? (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: theme.colors.primary },
                  selectedAnswer === null && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitAnswer}
                disabled={selectedAnswer === null}
              >
                <Text style={styles.submitButtonText}>Svara</Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleNextQuestion}
              >
                <Text style={styles.submitButtonText}>
                  {currentIndex < quiz.questions.length - 1 ? 'Nästa fråga' : 'Se resultat'}
                </Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#F1F5F9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    marginBottom: 28,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#F1F5F9',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
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
    fontWeight: '700' as const,
    color: '#fff',
  },
  orText: {
    fontSize: 16,
    color: '#64748B',
    marginVertical: 16,
  },
  textInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  textInputButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#F59E0B',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#F1F5F9',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInputScroll: {
    maxHeight: 300,
    marginBottom: 16,
  },
  modalTextInput: {
    minHeight: 200,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    color: '#F1F5F9',
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalGenerateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  playingHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playingHeaderContent: {
    marginBottom: 16,
  },
  playingHeaderTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: 'white',
    marginBottom: 8,
    paddingRight: 40,
  },
  playingHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  diffBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500' as const,
  },
  scrollContent: {
    flex: 1,
  },
  playingScrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  resultsScrollContent: {
    paddingBottom: 40,
  },
  questionContainer: {
    gap: 20,
  },
  questionCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionIndex: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndexText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
    borderRadius: 16,
    gap: 14,
  },
  feedbackTextWrap: {
    flex: 1,
    gap: 4,
  },
  feedbackTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  feedbackCorrect: {
    fontSize: 14,
  },
  feedbackExplanation: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700' as const,
  },
  resultsHeader: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  resultsIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500' as const,
  },
  resultsBody: {
    padding: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 30,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  scorePercent: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    minWidth: '45%' as any,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  reviewItem: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  reviewQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  reviewAnswers: {
    gap: 4,
  },
  yourAnswerLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  correctAnswerLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    fontStyle: 'italic' as const,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryButton: {
    shadowOpacity: 0.06,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700' as const,
  },
});
