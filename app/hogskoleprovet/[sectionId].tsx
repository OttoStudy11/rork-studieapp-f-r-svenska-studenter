import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useHogskoleprovet, HPQuestion } from '@/contexts/HogskoleprovetContext';
import { Clock, CheckCircle, XCircle, Award, TrendingUp, BarChart3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HogskoleprovetPracticeScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const { theme, isDark } = useTheme();
  const { sections, getQuestionsBySection, submitAnswer, startAttempt, completeAttempt } = useHogskoleprovet();
  
  const [questions, setQuestions] = useState<HPQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);

  const currentSection = sections.find(s => s.id === sectionId);

  useEffect(() => {
    loadQuestions();
  }, [sectionId]);

  const loadQuestions = async () => {
    if (!sectionId) {
      console.log('[HP Practice] No section ID provided');
      return;
    }
    
    try {
      console.log('[HP Practice] Loading questions for section:', sectionId);
      setIsLoading(true);
      
      const fetchedQuestions = await getQuestionsBySection(sectionId);
      console.log('[HP Practice] Fetched questions:', fetchedQuestions.length);
      
      if (fetchedQuestions.length === 0) {
        console.warn('[HP Practice] No questions found');
        Alert.alert(
          'Inga frågor tillgängliga', 
          'Det finns inga frågor för detta avsnitt ännu. Kontrollera att databasen är korrekt populerad.',
          [
            { text: 'OK', onPress: () => router.back() }
          ]
        );
        return;
      }
      
      setQuestions(fetchedQuestions);
      
      const id = await startAttempt('section_practice', sectionId);
      console.log('[HP Practice] Started attempt:', id);
      setAttemptId(id);
      setStartTime(Date.now());
    } catch (error) {
      console.error('[HP Practice] Error loading questions:', error);
      Alert.alert(
        'Fel',
        'Kunde inte ladda frågor. Kontrollera din internetanslutning och försök igen.',
        [
          { text: 'Försök igen', onPress: loadQuestions },
          { text: 'Gå tillbaka', onPress: () => router.back() }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || isAnswered || !questions[currentQuestionIndex]) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correct = await submitAnswer(questions[currentQuestionIndex].id, selectedAnswer, timeSpent);
    
    setIsAnswered(true);
    setIsCorrect(correct);
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setStartTime(Date.now());
    } else {
      finishPractice();
    }
  };

  const finishPractice = async () => {
    if (attemptId) {
      const sessionStartTime = Date.now();
      const totalTimeMinutes = Math.floor((sessionStartTime - Date.now()) / 60000);
      await completeAttempt(attemptId, score.total, score.correct, Math.max(1, totalTimeMinutes));
    }
    setShowResults(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Stack.Screen options={{ title: 'Laddar...', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Laddar frågor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showResults) {
    const percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Stack.Screen options={{ title: 'Resultat', headerShown: true }} />
        
        <ScrollView style={styles.content} contentContainerStyle={styles.resultsContainer}>
          <LinearGradient
            colors={percentage >= 70 ? ['#10B981', '#059669'] : percentage >= 50 ? ['#F59E0B', '#D97706'] : ['#EF4444', '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.resultsHeader}
          >
            <Award size={64} color="white" />
            <Text style={styles.resultsTitle}>
              {percentage >= 70 ? 'Bra jobbat! 🎉' : percentage >= 50 ? 'Inte dåligt! 👍' : 'Öva mer! 💪'}
            </Text>
            <Text style={styles.resultsPercentage}>{percentage}%</Text>
          </LinearGradient>

          <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <CheckCircle size={32} color="#10B981" />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{score.correct}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Rätt</Text>
              </View>
              <View style={styles.statItem}>
                <XCircle size={32} color="#EF4444" />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{score.total - score.correct}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Fel</Text>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={32} color="#3B82F6" />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{score.total}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Totalt</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Tillbaka</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.border }]}
            onPress={() => {
              setCurrentQuestionIndex(0);
              setScore({ correct: 0, total: 0 });
              setShowResults(false);
              loadQuestions();
            }}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>Öva igen</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return null;
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack.Screen 
        options={{ 
          title: currentSection?.section_name || 'Högskoleprovet',
          headerShown: true,
        }} 
      />
      
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            Fråga {currentQuestionIndex + 1} av {questions.length}
          </Text>
          <View style={styles.scoreContainer}>
            <BarChart3 size={16} color={theme.colors.primary} />
            <Text style={[styles.scoreText, { color: theme.colors.text }]}>
              {score.correct}/{score.total}
            </Text>
          </View>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.borderLight }]}>
          <View 
            style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.colors.primary }]} 
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentQuestion.reading_passage && (
          <View style={[styles.passageCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.passageLabel, { color: theme.colors.textSecondary }]}>Läs texten:</Text>
            <Text style={[styles.passageText, { color: theme.colors.text }]}>
              {currentQuestion.reading_passage}
            </Text>
          </View>
        )}

        <View style={[styles.questionCard, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.difficultyBadge, { 
            backgroundColor: currentQuestion.difficulty_level === 'easy' ? '#10B981' : 
                            currentQuestion.difficulty_level === 'medium' ? '#F59E0B' : '#EF4444' 
          }]}>
            <Text style={styles.difficultyText}>
              {currentQuestion.difficulty_level === 'easy' ? 'Lätt' : 
               currentQuestion.difficulty_level === 'medium' ? 'Medel' : 'Svår'}
            </Text>
          </View>
          <Text style={[styles.questionText, { color: theme.colors.text }]}>
            {currentQuestion.question_text}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option[0];
            const isCorrectOption = isAnswered && option[0] === currentQuestion.correct_answer;
            const isWrongSelection = isAnswered && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  { 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                  isSelected && !isAnswered && { 
                    borderColor: theme.colors.primary,
                    backgroundColor: theme.colors.primary + '15',
                  },
                  isCorrectOption && { 
                    borderColor: '#10B981',
                    backgroundColor: '#10B981' + '15',
                  },
                  isWrongSelection && { 
                    borderColor: '#EF4444',
                    backgroundColor: '#EF4444' + '15',
                  },
                ]}
                onPress={() => handleAnswerSelect(option[0])}
                disabled={isAnswered}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionCircle,
                    { borderColor: theme.colors.border },
                    isSelected && !isAnswered && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
                    isCorrectOption && { borderColor: '#10B981', backgroundColor: '#10B981' },
                    isWrongSelection && { borderColor: '#EF4444', backgroundColor: '#EF4444' },
                  ]}>
                    {(isSelected || isCorrectOption || isWrongSelection) && (
                      isCorrectOption ? <CheckCircle size={18} color="white" /> :
                      isWrongSelection ? <XCircle size={18} color="white" /> :
                      <View style={styles.selectedDot} />
                    )}
                  </View>
                  <Text style={[styles.optionText, { color: theme.colors.text }]}>
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {isAnswered && currentQuestion.explanation && (
          <View style={[styles.explanationCard, { backgroundColor: isCorrect ? '#10B981' + '15' : '#EF4444' + '15' }]}>
            <View style={styles.explanationHeader}>
              {isCorrect ? (
                <CheckCircle size={24} color="#10B981" />
              ) : (
                <XCircle size={24} color="#EF4444" />
              )}
              <Text style={[styles.explanationTitle, { color: isCorrect ? '#10B981' : '#EF4444' }]}>
                {isCorrect ? 'Rätt svar!' : 'Fel svar'}
              </Text>
            </View>
            <Text style={[styles.explanationText, { color: theme.colors.text }]}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
        {!isAnswered ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.primary },
              !selectedAnswer && { opacity: 0.5 },
            ]}
            onPress={handleSubmit}
            disabled={!selectedAnswer}
          >
            <Text style={styles.submitButtonText}>Svara</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.submitButtonText}>
              {currentQuestionIndex < questions.length - 1 ? 'Nästa fråga' : 'Se resultat'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  progressContainer: {
    padding: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  passageCard: {
    margin: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  passageLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  passageText: {
    fontSize: 14,
    lineHeight: 22,
  },
  questionCard: {
    margin: 16,
    marginTop: 4,
    padding: 16,
    borderRadius: 12,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: 'white',
    textTransform: 'uppercase' as const,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  explanationCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsHeader: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  resultsPercentage: {
    fontSize: 48,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  statsCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: 'white',
  },
});
