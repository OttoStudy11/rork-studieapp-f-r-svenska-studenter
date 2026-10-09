import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ChevronRight,
  Clock,
  Target,
  CheckCircle2,
  X,
  Award,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { ROUTES } from '@/utils/typedRoutes';
import { COLORS } from '@/constants/design-system';
import { HP_SECTIONS } from '@/constants/hogskoleprovet';

type ReviewItem = {
  id: string;
  questionText: string;
  correctAnswer: string;
  userAnswer: string | null;
  explanation?: string;
};

type ReviewFilter = 'all' | 'correct' | 'wrong';

const MILESTONE_LABELS: Record<string, string> = {
  first_section: 'Första delprovet klart',
  first_full_test: 'Första hela provet klart',
  perfect_section: 'Helt perfekt delprov',
  all_sections: 'Alla delprov testade',
  five_tests: 'Fem prov genomförda',
};

// ─── Animated Score Ring ─────────────────────────────────────────────────────

function ScoreRing({ pct, color, size = 132 }: { pct: number; color: string; size?: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [displayPct, setDisplayPct] = useState(0);
  const strokeWidth = 10;
  const clamped = Math.min(1, Math.max(0, pct / 100));

  useEffect(() => {
    const listenerId = progress.addListener(({ value }) => setDisplayPct(value));
    Animated.timing(progress, {
      toValue: pct,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => progress.removeListener(listenerId);
  }, [pct, progress]);

  const seg = (active: boolean) => (active ? color : 'transparent');

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Track */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color + '1E',
        }}
      />
      {/* Fill — quadrant borders revealed step by step */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderTopColor: progress.interpolate({
            inputRange: [0, 5, 100],
            outputRange: ['transparent', seg(true), seg(true)],
          }),
          borderRightColor: progress.interpolate({
            inputRange: [0, 25, 100],
            outputRange: ['transparent', seg(clamped > 0.25), seg(clamped > 0.25)],
          }),
          borderBottomColor: progress.interpolate({
            inputRange: [0, 50, 100],
            outputRange: ['transparent', seg(clamped > 0.5), seg(clamped > 0.5)],
          }),
          borderLeftColor: progress.interpolate({
            inputRange: [0, 75, 100],
            outputRange: ['transparent', seg(clamped > 0.75), seg(clamped > 0.75)],
          }),
          transform: [{ rotate: '-90deg' }],
        }}
      />
      <Text style={[styles.ringValue, { color }]} maxFontSizeMultiplier={1.3}>
        {Math.round(displayPct)}%
      </Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HPResultScreen() {
  const { theme, isDark } = useTheme();
  const { sessionState, completeSession } = useHogskoleprovet();

  const [results, setResults] = useState<any>(null);
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!sessionState) {
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

        const result = await completeSession();
        if (result) setResults(result);
      } catch (error) {
        console.error('[HP Results] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = useCallback(() => {
    router.replace(ROUTES.hogskoleprovetMain);
  }, []);

  const filteredReview = useMemo(() => {
    if (filter === 'correct') return review.filter(r => r.userAnswer === r.correctAnswer);
    if (filter === 'wrong') return review.filter(r => r.userAnswer !== r.correctAnswer);
    return review;
  }, [review, filter]);

  if (isLoading || !results) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Bearbetar resultat…
        </Text>
      </View>
    );
  }

  const scorePercentage = Math.round(results.scorePercentage);
  const wrongCount = results.totalQuestions - results.correctAnswers;
  const scoreColor =
    scorePercentage >= 80 ? '#10B981' : scorePercentage >= 60 ? '#F59E0B' : '#EF4444';
  const headline =
    scorePercentage >= 80
      ? 'Fantastiskt jobbat!'
      : scorePercentage >= 60
      ? 'Bra jobbat!'
      : 'Du gör framsteg!';
  const sectionName = results.sectionCode
    ? HP_SECTIONS.find(s => s.code === results.sectionCode)?.fullName ?? results.sectionCode
    : 'Hela provet';
  const newMilestones: string[] = results.newMilestones ?? [];

  const filters: Array<{ id: ReviewFilter; label: string; count: number; color: string }> = [
    { id: 'all', label: 'Alla', count: review.length, color: COLORS.primary },
    { id: 'correct', label: 'Rätta', count: results.correctAnswers, color: COLORS.success },
    { id: 'wrong', label: 'Fel', count: wrongCount, color: COLORS.error },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero: score ring ── */}
          <View style={styles.hero}>
            <Text style={[styles.eyebrow, { color: theme.colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
              RESULTAT
            </Text>
            <Text style={[styles.sectionName, { color: theme.colors.text }]} maxFontSizeMultiplier={1.2}>
              {sectionName}
            </Text>

            <View style={styles.ringWrap}>
              <ScoreRing pct={scorePercentage} color={scoreColor} />
            </View>

            <Text style={[styles.headline, { color: theme.colors.text }]} maxFontSizeMultiplier={1.2}>
              {headline}
            </Text>
            <Text style={[styles.subline, { color: theme.colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
              {results.correctAnswers} av {results.totalQuestions} frågor rätt
            </Text>

            {/* Correct / wrong split bar */}
            <View style={[styles.splitBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <View
                style={{
                  width: `${(results.correctAnswers / results.totalQuestions) * 100}%`,
                  backgroundColor: COLORS.success,
                }}
              />
              <View
                style={{
                  flex: 1,
                  backgroundColor: wrongCount > 0 ? COLORS.error : 'transparent',
                  borderTopRightRadius: wrongCount > 0 ? 4 : 0,
                  borderBottomRightRadius: wrongCount > 0 ? 4 : 0,
                }}
              />
            </View>
          </View>

          {/* ── Stat chips ── */}
          <View style={styles.statRow}>
            <View style={[styles.statChip, { backgroundColor: theme.colors.surface }]}>
              <Target size={18} color={COLORS.primary} />
              <Text style={[styles.statChipValue, { color: theme.colors.text }]} maxFontSizeMultiplier={1.2}>
                {results.correctAnswers}
              </Text>
              <Text style={[styles.statChipLabel, { color: theme.colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                rätta svar
              </Text>
            </View>

            <View style={[styles.statChip, { backgroundColor: theme.colors.surface }]}>
              <Clock size={18} color={COLORS.primary} />
              <Text style={[styles.statChipValue, { color: theme.colors.text }]} maxFontSizeMultiplier={1.2}>
                {results.timeSpentMinutes} min
              </Text>
              <Text style={[styles.statChipLabel, { color: theme.colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                tidsåtgång
              </Text>
            </View>

            {!!results.estimatedHPScore && (
              <View style={[styles.statChip, { backgroundColor: theme.colors.surface }]}>
                <Award size={18} color="#F59E0B" />
                <Text style={[styles.statChipValue, { color: theme.colors.text }]} maxFontSizeMultiplier={1.2}>
                  {results.estimatedHPScore.toFixed(1)}
                </Text>
                <Text style={[styles.statChipLabel, { color: theme.colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                  HP-poäng
                </Text>
              </View>
            )}
          </View>

          {/* ── New milestones ── */}
          {newMilestones.length > 0 && (
            <View style={[styles.milestoneBanner, { backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.10)' }]}>
              <Sparkles size={18} color="#F59E0B" />
              <View style={styles.milestoneTextBlock}>
                <Text style={[styles.milestoneTitle, { color: '#F59E0B' }]} maxFontSizeMultiplier={1.2}>
                  Ny milstolpe upplåst!
                </Text>
                <Text style={[styles.milestoneNames, { color: theme.colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                  {newMilestones.map(m => MILESTONE_LABELS[m] ?? m).join(' · ')}
                </Text>
              </View>
            </View>
          )}

          {/* ── Genomgång ── */}
          {review.length > 0 && (
            <View style={styles.reviewSection}>
              <Text style={[styles.reviewTitle, { color: theme.colors.text }]} maxFontSizeMultiplier={1.2}>
                Genomgång
              </Text>

              <View style={styles.filterRow}>
                {filters.map(f => {
                  const isActive = filter === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isActive ? f.color : theme.colors.surface,
                          borderColor: isActive ? f.color : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        },
                      ]}
                      onPress={() => setFilter(f.id)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Visa ${f.label.toLowerCase()}`}
                    >
                      <Text
                        style={[styles.filterChipText, { color: isActive ? '#FFF' : theme.colors.textSecondary }]}
                        maxFontSizeMultiplier={1.2}
                      >
                        {f.label} {f.count}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {filteredReview.map((item, index) => {
                const isCorrect = item.userAnswer === item.correctAnswer;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.reviewCard,
                      { backgroundColor: theme.colors.surface },
                      !isCorrect && {
                        borderLeftWidth: 3,
                        borderLeftColor: COLORS.error,
                      },
                    ]}
                  >
                    <View style={styles.reviewCardHeader}>
                      <View
                        style={[
                          styles.reviewBadge,
                          { backgroundColor: isCorrect ? `${COLORS.success}1A` : `${COLORS.error}1A` },
                        ]}
                      >
                        {isCorrect ? (
                          <CheckCircle2 size={15} color={COLORS.success} />
                        ) : (
                          <X size={15} color={COLORS.error} />
                        )}
                      </View>
                      <Text style={[styles.reviewIndex, { color: theme.colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                        Fråga {index + 1}
                      </Text>
                    </View>

                    <Text style={[styles.reviewQuestion, { color: theme.colors.text }]} maxFontSizeMultiplier={1.3}>
                      {item.questionText}
                    </Text>

                    <View style={styles.reviewAnswers}>
                      {!isCorrect && item.userAnswer && (
                        <Text style={[styles.reviewAnswerText, { color: COLORS.error }]} maxFontSizeMultiplier={1.2}>
                          Ditt svar: {item.userAnswer}
                        </Text>
                      )}
                      <Text style={[styles.reviewAnswerText, { color: COLORS.success }]} maxFontSizeMultiplier={1.2}>
                        Rätt svar: {item.correctAnswer}
                      </Text>
                    </View>

                    {item.explanation ? (
                      <View
                        style={[
                          styles.reviewExplanation,
                          { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.035)' },
                        ]}
                      >
                        <Text style={[styles.reviewExplanationText, { color: theme.colors.text }]} maxFontSizeMultiplier={1.2}>
                          {item.explanation}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}

              {filteredReview.length === 0 && (
                <Text style={[styles.emptyFilterText, { color: theme.colors.textSecondary }]}>
                  Inga frågor i den här kategorien.
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* ── Footer CTA ── */}
        <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: COLORS.primary }]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText} maxFontSizeMultiplier={1.2}>
              Fortsätt
            </Text>
            <ChevronRight size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
  },

  // Hero
  content: {
    padding: 20,
    paddingBottom: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1.6,
    marginTop: 8,
  },
  sectionName: {
    fontSize: 21,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
    marginTop: 4,
    textAlign: 'center',
  },
  ringWrap: {
    marginTop: 22,
    marginBottom: 20,
  },
  ringValue: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 30,
    fontWeight: '900' as const,
    letterSpacing: -1,
  },
  headline: {
    fontSize: 19,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  subline: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  splitBar: {
    flexDirection: 'row',
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },

  // Stat chips
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    gap: 3,
  },
  statChipValue: {
    fontSize: 17,
    fontWeight: '800' as const,
  },
  statChipLabel: {
    fontSize: 11.5,
  },

  // Milestones
  milestoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    marginBottom: 24,
  },
  milestoneTextBlock: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
  },
  milestoneNames: {
    fontSize: 12.5,
    marginTop: 2,
  },

  // Review
  reviewSection: {},
  reviewTitle: {
    fontSize: 19,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '700' as const,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewIndex: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
  reviewQuestion: {
    fontSize: 14.5,
    lineHeight: 21,
    fontWeight: '600' as const,
    marginBottom: 10,
  },
  reviewAnswers: {
    gap: 4,
  },
  reviewAnswerText: {
    fontSize: 13.5,
    fontWeight: '600' as const,
  },
  reviewExplanation: {
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  reviewExplanationText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  emptyFilterText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 6,
  },
  continueButtonText: {
    fontSize: 16.5,
    fontWeight: '700' as const,
    color: '#FFF',
  },
});
