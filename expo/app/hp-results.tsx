import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Clock, Trophy, Target, CheckCircle2, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { ROUTES } from '@/utils/typedRoutes';
import { COLORS } from '@/constants/design-system';

type ReviewItem = {
  id: string;
  questionText: string;
  correctAnswer: string;
  userAnswer: string | null;
  explanation?: string;
};

export default function HPResultScreen() {
  const { theme, isDark } = useTheme();
  const { sessionState, completeSession } = useHogskoleprovet();

  const [results, setResults] = useState<any>(null);
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!sessionState) {
        console.log('[HP Results] No session state');
        router.replace(ROUTES.hogskoleprovetMain);
        return;
      }

      try {
        // Fånga frågor/svar innan completeSession rensar sessionsstate
        setReview(
          sessionState.questions.map(q => ({
            id: q.id,
            questionText: q.questionText,
            correctAnswer: q.correctAnswer,
            userAnswer: sessionState.answers[q.id]?.answer ?? null,
            explanation: q.explanation,
          }))
        );

        console.log('[HP Results] Completing session');
        const result = await completeSession();

        if (result) {
          setResults(result);
        }
      } catch (error) {
        console.error('[HP Results] Error:', error);
        Alert.alert('Fel', 'Kunde inte spara resultatet');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, []);

  const handleContinue = useCallback(() => {
    router.replace(ROUTES.hogskoleprovetMain);
  }, []);

  if (isLoading || !results) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={styles.centered}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Bearbetar resultat...
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  const scorePercentage = results.scorePercentage;
  const scoreColor = scorePercentage >= 80 ? '#10B981' : scorePercentage >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient
        colors={isDark ? ['#0F172A', '#1E293B'] : [scoreColor, scoreColor + 'DD']}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerBadge}>
                <Trophy size={18} color="#FFF" />
              </View>
              <View style={styles.headerTexts}>
                <Text style={styles.headerTitle}>Resultat</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {scorePercentage >= 80
                    ? 'Fantastiskt!'
                    : scorePercentage >= 60
                    ? 'Bra jobbat!'
                    : 'Du gör framsteg!'}
                </Text>
              </View>
            </View>
            <View style={styles.headerScore}>
              <Text style={styles.headerScoreValue}>{scorePercentage.toFixed(0)}%</Text>
              <Text style={styles.headerScoreSub}>
                {results.correctAnswers} av {results.totalQuestions} rätt
              </Text>
            </View>
          </View>
          <View style={styles.headerProgressTrack}>
            <View
              style={[
                styles.headerProgressFill,
                {
                  width: `${scorePercentage}%`,
                  backgroundColor: isDark ? scoreColor : '#FFF',
                },
              ]}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: `${COLORS.primary}20` }]}>
              <Target size={24} color={COLORS.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {results.correctAnswers}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Rätta svar
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: `${COLORS.primary}20` }]}>
              <Clock size={24} color={COLORS.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {results.timeSpentMinutes}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Minuter
            </Text>
          </View>
        </View>

        {results.estimatedHPScore && (
          <View style={[styles.hpScoreCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.hpScoreLabel, { color: theme.colors.textSecondary }]}>
              Uppskattat HP-resultat
            </Text>
            <Text style={[styles.hpScoreValue, { color: COLORS.primary }]}>
              {results.estimatedHPScore.toFixed(2)} / 2.0
            </Text>
          </View>
        )}

        {review.length > 0 && (
          <View style={styles.reviewSection}>
            <Text style={[styles.reviewTitle, { color: theme.colors.text }]}>Genomgång</Text>
            {review.map((item, index) => {
              const isCorrect = item.userAnswer === item.correctAnswer;
              return (
                <View key={item.id} style={[styles.reviewCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.reviewCardHeader}>
                    <View style={[styles.reviewBadge, { backgroundColor: isCorrect ? `${COLORS.success}20` : `${COLORS.error}20` }]}>
                      {isCorrect ? (
                        <CheckCircle2 size={16} color={COLORS.success} />
                      ) : (
                        <X size={16} color={COLORS.error} />
                      )}
                    </View>
                    <Text style={[styles.reviewIndex, { color: theme.colors.textSecondary }]}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.reviewQuestion, { color: theme.colors.text }]}>
                    {item.questionText}
                  </Text>
                  <View style={styles.reviewAnswers}>
                    {!isCorrect && item.userAnswer && (
                      <Text style={[styles.reviewAnswerText, { color: COLORS.error }]}>
                        Ditt svar: {item.userAnswer}
                      </Text>
                    )}
                    <Text style={[styles.reviewAnswerText, { color: COLORS.success }]}>
                      Rätt svar: {item.correctAnswer}
                    </Text>
                  </View>
                  {item.explanation ? (
                    <View style={[styles.reviewExplanation, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                      <Text style={[styles.reviewExplanationLabel, { color: theme.colors.textSecondary }]}>Förklaring</Text>
                      <Text style={[styles.reviewExplanationText, { color: theme.colors.text }]}>
                        {item.explanation}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: COLORS.primary }]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Fortsätt</Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  headerGradient: {
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTexts: {
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  headerScore: {
    alignItems: 'flex-end',
  },
  headerScoreValue: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  headerScoreSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  headerProgressTrack: {
    marginHorizontal: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  headerProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
  },
  hpScoreCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  hpScoreLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  hpScoreValue: {
    fontSize: 36,
    fontWeight: '800' as const,
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    marginBottom: 12,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewIndex: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  reviewQuestion: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as const,
    marginBottom: 10,
  },
  reviewAnswers: {
    gap: 4,
    marginBottom: 8,
  },
  reviewAnswerText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  reviewExplanation: {
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  reviewExplanationLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reviewExplanationText: {
    fontSize: 14,
    lineHeight: 21,
  },
  trialInfoCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 20,
    gap: 16,
    marginBottom: 20,
  },
  trialInfoContent: {
    flex: 1,
  },
  trialInfoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  trialInfoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
  },
});
