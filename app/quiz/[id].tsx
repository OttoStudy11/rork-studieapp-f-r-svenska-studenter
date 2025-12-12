import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TextInput,
  Alert
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Trophy,
  Target,
  Lightbulb,
  RotateCcw,
  Home,
  Award
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { usePoints } from '@/contexts/PointsContext';
import * as Haptics from 'expo-haptics';
import type { Database } from '@/lib/database.types';

type CourseExercise = Database['public']['Tables']['course_exercises']['Row'];

interface Question {
  id: string;
  question: string;
  options?: string[];
  type: 'multiple_choice' | 'true_false' | 'short_answer';
}

interface UserAnswer {
  questionIndex: number;
  answer: string | number;
  isCorrect: boolean;
}

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { addPoints } = usePoints();

  const [exercise, setExercise] = useState<CourseExercise | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<(string | number)[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id) {
      loadExercise();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (exercise && !quizCompleted) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [exercise, quizCompleted]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentQuestionIndex]);

  const loadExercise = async () => {
    try {
      setIsLoading(true);
      console.log('Loading exercise:', id);

      const { data, error } = await supabase
        .from('course_exercises')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading exercise:', error);
        Alert.alert('Fel', 'Kunde inte ladda övningen');
        router.back();
        return;
      }

      console.log('Exercise loaded:', data.title);
      setExercise(data);

      const parsedQuestions = parseQuestions(data.questions, data.exercise_type);
      const parsedAnswers = parseCorrectAnswers(data.correct_answers);
      
      setQuestions(parsedQuestions);
      setCorrectAnswers(parsedAnswers);
    } catch (error) {
      console.error('Error in loadExercise:', error);
      Alert.alert('Fel', 'Ett oväntat fel inträffade');
    } finally {
      setIsLoading(false);
    }
  };

  const parseQuestions = (questionsJson: any, exerciseType: string): Question[] => {
    try {
      const parsed = typeof questionsJson === 'string' ? JSON.parse(questionsJson) : questionsJson;
      
      if (Array.isArray(parsed)) {
        return parsed.map((q, index) => ({
          id: q.id || `q-${index}`,
          question: q.question || q.text || q,
          options: q.options || q.alternatives || (exerciseType === 'true_false' ? ['Sant', 'Falskt'] : undefined),
          type: q.type || (exerciseType === 'true_false' ? 'true_false' : 
                          exerciseType === 'multiple_choice' ? 'multiple_choice' : 'short_answer')
        }));
      }
      
      return [{
        id: 'q-0',
        question: String(parsed),
        type: 'short_answer'
      }];
    } catch (e) {
      console.error('Error parsing questions:', e);
      return [];
    }
  };

  const parseCorrectAnswers = (answersJson: any): (string | number)[] => {
    try {
      const parsed = typeof answersJson === 'string' ? JSON.parse(answersJson) : answersJson;
      
      if (Array.isArray(parsed)) {
        return parsed.map(a => typeof a === 'object' ? (a.answer ?? a.correct ?? a) : a);
      }
      
      return [parsed];
    } catch (e) {
      console.error('Error parsing correct answers:', e);
      return [];
    }
  };

  const checkAnswer = (answer: string | number): boolean => {
    const correctAnswer = correctAnswers[currentQuestionIndex];
    const currentQuestion = questions[currentQuestionIndex];
    
    console.log('Checking answer:', { answer, correctAnswer, type: typeof answer, correctType: typeof correctAnswer });
    
    // If answer is an index number (from multiple choice)
    if (typeof answer === 'number' && currentQuestion.options) {
      const selectedOptionText = currentQuestion.options[answer];
      const normalizedSelected = selectedOptionText?.toLowerCase().trim();
      const normalizedCorrect = String(correctAnswer).toLowerCase().trim();
      
      // Check if correct answer is the index itself
      if (correctAnswer === answer) {
        console.log('Match: correct answer is index');
        return true;
      }
      
      // Check if correct answer is a letter (A, B, C, D)
      const letterIndex = normalizedCorrect.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
      if (normalizedCorrect.length === 1 && letterIndex >= 0 && letterIndex < 26) {
        const isMatch = letterIndex === answer;
        console.log('Letter comparison:', { letterIndex, answer, isMatch });
        return isMatch;
      }
      
      // Check if correct answer matches the option text
      if (normalizedSelected === normalizedCorrect) {
        console.log('Match: option text matches correct answer');
        return true;
      }
      
      // Check if correct answer is a number string matching the index
      if (String(answer) === normalizedCorrect) {
        console.log('Match: string index matches');
        return true;
      }
      
      console.log('No match found:', { normalizedSelected, normalizedCorrect });
      return false;
    }
    
    // For text answers (short_answer type)
    const normalizedAnswer = String(answer).toLowerCase().trim();
    const normalizedCorrect = String(correctAnswer).toLowerCase().trim();
    
    return normalizedAnswer === normalizedCorrect;
  };

  const handleSelectAnswer = (answer: string | number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    const answer = questions[currentQuestionIndex].type === 'short_answer' 
      ? textAnswer 
      : selectedAnswer;

    if (answer === null || answer === '') {
      Alert.alert('Välj ett svar', 'Du måste välja eller skriva ett svar innan du går vidare.');
      return;
    }

    const isCorrect = checkAnswer(answer);
    
    Haptics.notificationAsync(
      isCorrect 
        ? Haptics.NotificationFeedbackType.Success 
        : Haptics.NotificationFeedbackType.Error
    );

    const newUserAnswer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      answer,
      isCorrect
    };

    setUserAnswers(prev => [...prev, newUserAnswer]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTextAnswer('');
      setShowResult(false);
      setShowHint(false);
    } else {
      handleCompleteQuiz();
    }
  };

  const handleCompleteQuiz = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setQuizCompleted(true);
    
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const pointsEarned = Math.round((correctCount / questions.length) * (exercise?.points || 10));

    if (pointsEarned > 0) {
      await addPoints(pointsEarned, { 
        type: 'bonus', 
        description: `Quiz slutförd: ${exercise?.title || 'Quiz'}` 
      });
    }

    console.log('Quiz completed:', {
      userId: user?.id,
      exerciseId: exercise?.id,
      score: scorePercent,
      timeElapsed,
      pointsEarned
    });

    Haptics.notificationAsync(
      scorePercent >= 70 
        ? Haptics.NotificationFeedbackType.Success 
        : Haptics.NotificationFeedbackType.Warning
    );
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setTextAnswer('');
    setShowResult(false);
    setQuizCompleted(false);
    setTimeElapsed(0);
    setShowHint(false);
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return theme.colors.textMuted;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Laddar quiz...
          </Text>
        </View>
      </View>
    );
  }

  if (!exercise || questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Target size={64} color={theme.colors.textMuted} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Quiz inte tillgängligt
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Inga frågor hittades för denna övning.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Gå tillbaka</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (quizCompleted) {
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const scorePercent = Math.round((correctCount / questions.length) * 100);
    const pointsEarned = Math.round((correctCount / questions.length) * (exercise.points || 10));

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={scorePercent >= 70 ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']}
            style={styles.resultHeader}
          >
            <View style={styles.resultIconContainer}>
              {scorePercent >= 70 ? (
                <Trophy size={48} color="white" />
              ) : (
                <Target size={48} color="white" />
              )}
            </View>
            <Text style={styles.resultTitle}>
              {scorePercent >= 90 ? 'Fantastiskt!' : 
               scorePercent >= 70 ? 'Bra jobbat!' : 
               scorePercent >= 50 ? 'Nästan där!' : 'Fortsätt öva!'}
            </Text>
            <Text style={styles.resultSubtitle}>
              Du fick {correctCount} av {questions.length} rätt
            </Text>
          </LinearGradient>

          <View style={styles.resultContent}>
            <View style={styles.scoreContainer}>
              <View style={[styles.scoreCircle, { borderColor: scorePercent >= 70 ? theme.colors.success : theme.colors.warning }]}>
                <Text style={[styles.scorePercent, { color: scorePercent >= 70 ? theme.colors.success : theme.colors.warning }]}>
                  {scorePercent}%
                </Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.success + '15' }]}>
                  <CheckCircle size={20} color={theme.colors.success} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{correctCount}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Rätt</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.error + '15' }]}>
                  <XCircle size={20} color={theme.colors.error} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{questions.length - correctCount}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Fel</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Clock size={20} color={theme.colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{formatTime(timeElapsed)}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Tid</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.warning + '15' }]}>
                  <Award size={20} color={theme.colors.warning} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>+{pointsEarned}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Poäng</Text>
              </View>
            </View>

            <View style={styles.reviewSection}>
              <Text style={[styles.reviewTitle, { color: theme.colors.text }]}>Dina svar</Text>
              {userAnswers.map((ua, index) => (
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
                      {index + 1}. {questions[index]?.question}
                    </Text>
                    {ua.isCorrect ? (
                      <CheckCircle size={20} color={theme.colors.success} />
                    ) : (
                      <XCircle size={20} color={theme.colors.error} />
                    )}
                  </View>
                  <View style={styles.reviewAnswers}>
                    <Text style={[styles.yourAnswerLabel, { color: theme.colors.textMuted }]}>
                      Ditt svar: <Text style={{ color: ua.isCorrect ? theme.colors.success : theme.colors.error }}>{String(ua.answer)}</Text>
                    </Text>
                    {!ua.isCorrect && (
                      <Text style={[styles.correctAnswerLabel, { color: theme.colors.success }]}>
                        Rätt svar: {String(correctAnswers[index])}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
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

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[theme.colors.primary, '#7C3AED']}
        style={styles.header}
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

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{exercise.title}</Text>
          <View style={styles.headerMeta}>
            <View style={styles.timerBadge}>
              <Clock size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty_level) }]}>
              <Text style={styles.difficultyText}>
                {exercise.difficulty_level === 'easy' ? 'Lätt' : 
                 exercise.difficulty_level === 'medium' ? 'Medel' : 'Svår'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Fråga {currentQuestionIndex + 1} av {questions.length}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.questionContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={[styles.questionCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>
              {currentQuestion.question}
            </Text>

            {exercise.hints && exercise.hints.length > 0 && (
              <TouchableOpacity
                style={[styles.hintButton, { backgroundColor: theme.colors.warning + '15' }]}
                onPress={() => setShowHint(!showHint)}
              >
                <Lightbulb size={16} color={theme.colors.warning} />
                <Text style={[styles.hintButtonText, { color: theme.colors.warning }]}>
                  {showHint ? 'Dölj ledtråd' : 'Visa ledtråd'}
                </Text>
              </TouchableOpacity>
            )}

            {showHint && exercise.hints && (
              <View style={[styles.hintBox, { backgroundColor: theme.colors.warning + '10' }]}>
                <Text style={[styles.hintText, { color: theme.colors.text }]}>
                  💡 {exercise.hints[Math.min(currentQuestionIndex, exercise.hints.length - 1)]}
                </Text>
              </View>
            )}
          </View>

          {currentQuestion.type === 'short_answer' ? (
            <View style={styles.textInputContainer}>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: showResult 
                      ? (userAnswers[currentQuestionIndex]?.isCorrect ? theme.colors.success : theme.colors.error)
                      : theme.colors.border
                  }
                ]}
                placeholder="Skriv ditt svar här..."
                placeholderTextColor={theme.colors.textMuted}
                value={textAnswer}
                onChangeText={setTextAnswer}
                editable={!showResult}
                multiline
              />
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {currentQuestion.options?.map((option, index) => {
                const isSelected = selectedAnswer === index || selectedAnswer === option;
                const isCorrect = showResult && checkAnswer(index);
                const isWrong = showResult && isSelected && !checkAnswer(index);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.colors.card },
                      isSelected && !showResult && { borderColor: theme.colors.primary, borderWidth: 2 },
                      isCorrect && { backgroundColor: theme.colors.success + '15', borderColor: theme.colors.success, borderWidth: 2 },
                      isWrong && { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error, borderWidth: 2 }
                    ]}
                    onPress={() => !showResult && handleSelectAnswer(index)}
                    disabled={showResult}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.optionIndex,
                      { backgroundColor: theme.colors.surface },
                      isSelected && !showResult && { backgroundColor: theme.colors.primary },
                      isCorrect && { backgroundColor: theme.colors.success },
                      isWrong && { backgroundColor: theme.colors.error }
                    ]}>
                      <Text style={[
                        styles.optionIndexText,
                        { color: theme.colors.textSecondary },
                        (isSelected || isCorrect || isWrong) && { color: 'white' }
                      ]}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={[
                      styles.optionText,
                      { color: theme.colors.text },
                      isCorrect && { color: theme.colors.success, fontWeight: '600' as const },
                      isWrong && { color: theme.colors.error }
                    ]}>
                      {option}
                    </Text>
                    {showResult && isCorrect && (
                      <CheckCircle size={20} color={theme.colors.success} />
                    )}
                    {showResult && isWrong && (
                      <XCircle size={20} color={theme.colors.error} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {showResult && (
            <View style={[
              styles.resultFeedback,
              { backgroundColor: userAnswers[userAnswers.length - 1]?.isCorrect ? theme.colors.success + '15' : theme.colors.error + '15' }
            ]}>
              {userAnswers[userAnswers.length - 1]?.isCorrect ? (
                <>
                  <CheckCircle size={24} color={theme.colors.success} />
                  <Text style={[styles.resultFeedbackText, { color: theme.colors.success }]}>
                    Rätt svar! 🎉
                  </Text>
                </>
              ) : (
                <>
                  <XCircle size={24} color={theme.colors.error} />
                  <View style={styles.wrongAnswerFeedback}>
                    <Text style={[styles.resultFeedbackText, { color: theme.colors.error }]}>
                      Fel svar
                    </Text>
                    <Text style={[styles.correctAnswerHint, { color: theme.colors.textSecondary }]}>
                      Rätt svar: {String(correctAnswers[currentQuestionIndex])}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        {!showResult ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.primary },
              (selectedAnswer === null && textAnswer === '') && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitAnswer}
            disabled={selectedAnswer === null && textAnswer === ''}
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
              {currentQuestionIndex < questions.length - 1 ? 'Nästa fråga' : 'Se resultat'}
            </Text>
            <ChevronRight size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
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
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  header: {
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
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: 'white',
    marginBottom: 8,
    paddingRight: 40,
  },
  headerMeta: {
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
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  difficultyText: {
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  resultScrollContent: {
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
    marginBottom: 12,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  hintButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  hintBox: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  hintText: {
    fontSize: 15,
    lineHeight: 22,
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
  textInputContainer: {
    marginTop: 8,
  },
  textInput: {
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 2,
  },
  resultFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 14,
  },
  resultFeedbackText: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  wrongAnswerFeedback: {
    flex: 1,
  },
  correctAnswerHint: {
    fontSize: 14,
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
  resultHeader: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  resultIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500' as const,
  },
  resultContent: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
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
