// HP Training — personalized daily training pass.
// Runs the plan built by HPTrainingContext, records every answer with timing,
// and shows post-session results that feed back into future plans.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import {
  X,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Dumbbell,
  Repeat,
  Target,
  Sparkles,
  Clock,
  TrendingUp,
  RefreshCw,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useHPTraining,
  HPActiveTrainingSession,
} from '@/contexts/HPTrainingContext';
import { HP_SECTIONS } from '@/constants/hogskoleprovet';
import {
  HPTrainingQuestion,
  HPTrainingReason,
  HPTrainingResults,
} from '@/lib/hp-training-engine';
import { hapticsManager } from '@/lib/haptics-manager';

const REASON_META: Record<HPTrainingReason, { label: string; color: string }> = {
  repeat: { label: 'Repetition', color: '#F59E0B' },
  weak: { label: 'Svagt område', color: '#EF4444' },
  untrained: { label: 'Nytt område', color: '#10B981' },
  maintenance: { label: 'Underhåll', color: '#6366F1' },
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const sectionColor = (code: string): string =>
  HP_SECTIONS.find(s => s.code === code)?.color ?? '#6366F1';

export default function HPTrainingScreen() {
  const { theme, isDark } = useTheme();
  const {
    activeSession,
    isLoading,
    startTraining,
    submitTrainingAnswer,
    completeTraining,
    abandonTraining,
  } = useHPTraining();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [results, setResults] = useState<HPTrainingResults | null>(null);
  const questionStartRef = useRef<number>(Date.now());
  const [fadeAnim] = useState(new Animated.Value(0));

  const currentIndex = activeSession
    ? activeSession.questions.findIndex(q => !activeSession.answers[q.id])
    : 0;
  const question: HPTrainingQuestion | undefined =
    activeSession?.questions[currentIndex === -1 ? 0 : currentIndex];

  // Per-question timing + entrance animation.
  useEffect(() => {
    if (question) {
      questionStartRef.current = Date.now();
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    }
  }, [question?.id, fadeAnim]);

  const handleStart = useCallback(async () => {
    hapticsManager.triggerHaptic('medium');
    const ok = await startTraining();
    if (!ok) {
      Alert.alert('Fel', 'Kunde inte bygga ett träningspass just nu. Försök igen.');
    }
  }, [startTraining]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!question || selectedAnswer !== null) return;
      const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
      setSelectedAnswer(answer);
      submitTrainingAnswer(question.id, answer, timeSpent);
      hapticsManager.triggerHaptic(answer === question.correctAnswer ? 'success' : 'error');
    },
    [question, selectedAnswer, submitTrainingAnswer]
  );

  const handleNext = useCallback(async () => {
    if (!activeSession) return;
    const answeredCount = Object.keys(activeSession.answers).length;
    setSelectedAnswer(null);

    if (answeredCount >= activeSession.questions.length) {
      setIsCompleting(true);
      hapticsManager.triggerHaptic('medium');
      const sessionResults = await completeTraining();
      setIsCompleting(false);
      if (sessionResults) {
        setResults(sessionResults);
      } else {
        Alert.alert('Fel', 'Kunde inte spara resultatet.');
      }
      return;
    }
    hapticsManager.triggerHaptic('light');
  }, [activeSession, completeTraining]);

  const handleExit = useCallback(() => {
    Alert.alert('Avsluta träningen?', 'Ditt pågående pass sparas inte om du avslutar nu.', [
      { text: 'Fortsätt träna', style: 'cancel' },
      {
        text: 'Avsluta',
        style: 'destructive',
        onPress: () => {
          void abandonTraining().then(() => router.back());
        },
      },
    ]);
  }, [abandonTraining]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading && !activeSession) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────
  if (results) {
    return <ResultsView results={results} onDone={() => router.back()} />;
  }

  // ── Idle / no active session ──────────────────────────────────────────────
  if (!activeSession || !question) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.centerContainer}>
          <ScrollView contentContainerStyle={styles.idleContent} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.idleHero}
            >
              <Dumbbell size={40} color="#FFF" />
              <Text style={styles.idleHeroTitle}>Personlig HP-träning</Text>
              <Text style={styles.idleHeroText}>
                Ett skräddarsytt pass baserat på dina resultat, dina svagheter och vad som återstår tills provet.
              </Text>
            </LinearGradient>
            <TouchableOpacity
              style={styles.idleCta}
              onPress={handleStart}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Bygg träningspass"
            >
              <Sparkles size={20} color="#FFF" />
              <Text style={styles.idleCtaText}>Bygg träningspass</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ── Active session ────────────────────────────────────────────────────────
  const answeredCount = Object.keys(activeSession.answers).length;
  const total = activeSession.questions.length;
  const isAnswered = selectedAnswer !== null || Boolean(activeSession.answers[question.id]);
  const givenAnswer = selectedAnswer ?? activeSession.answers[question.id]?.answer ?? null;
  const isCorrect = givenAnswer === question.correctAnswer;
  const isLastQuestion = currentIndex >= total - 1;
  const reasonMeta = REASON_META[question.reason];
  const progressPct = Math.round((answeredCount / total) * 100);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.card }]}
            onPress={handleExit}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Avsluta träning"
          >
            <X size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerProgressText, { color: theme.colors.text }]}>
              Fråga {currentIndex + 1} av {total}
            </Text>
            <View style={[styles.headerProgressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }]}>
              <View style={[styles.headerProgressFill, { width: `${progressPct}%`, backgroundColor: '#6366F1' }]} />
            </View>
          </View>
          <View style={[styles.iconButton, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.headerCount, { color: theme.colors.textMuted }]}>{answeredCount}/{total}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Section + reason pills */}
          <View style={styles.pillRow}>
            <View style={[styles.sectionPill, { backgroundColor: sectionColor(question.sectionCode) + '1A' }]}>
              <Text style={[styles.sectionPillText, { color: sectionColor(question.sectionCode) }]}>
                {question.sectionCode} · {HP_SECTIONS.find(s => s.code === question.sectionCode)?.name ?? ''}
              </Text>
            </View>
            <View style={[styles.reasonPill, { backgroundColor: reasonMeta.color + '1A' }]}>
              {question.reason === 'repeat' ? (
                <Repeat size={11} color={reasonMeta.color} />
              ) : (
                <Target size={11} color={reasonMeta.color} />
              )}
              <Text style={[styles.reasonPillText, { color: reasonMeta.color }]}>{reasonMeta.label}</Text>
            </View>
          </View>

          {/* Reading passage */}
          {question.readingPassage && (
            <View style={[styles.passageCard, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <Text style={[styles.passageText, { color: theme.colors.textSecondary }]}>{question.readingPassage}</Text>
            </View>
          )}

          {/* Question */}
          <Text style={[styles.questionText, { color: theme.colors.text }]}>{question.questionText}</Text>

          {/* Options */}
          <View style={styles.options}>
            {question.options.map(option => {
              const isGiven = givenAnswer === option;
              const isRight = option === question.correctAnswer;
              let optionStyle: ViewStyle = {
                backgroundColor: theme.colors.surface,
                borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
              };
              if (isAnswered && isRight) {
                optionStyle = { backgroundColor: isDark ? 'rgba(16,185,129,0.14)' : '#ECFDF5', borderColor: '#10B981' };
              } else if (isAnswered && isGiven && !isRight) {
                optionStyle = { backgroundColor: isDark ? 'rgba(239,68,68,0.14)' : '#FEF2F2', borderColor: '#EF4444' };
              } else if (isAnswered) {
                optionStyle = { backgroundColor: theme.colors.surface, borderColor: 'transparent', opacity: 0.5 };
              }
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionRow, optionStyle]}
                  onPress={() => handleAnswer(option)}
                  disabled={isAnswered}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`Svar: ${option}`}
                >
                  <Text
                    numberOfLines={3}
                    style={[
                      styles.optionText,
                      {
                        color: isAnswered && isRight
                          ? '#10B981'
                          : isAnswered && isGiven && !isRight
                            ? '#EF4444'
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {option}
                  </Text>
                  {isAnswered && isRight && <CheckCircle2 size={18} color="#10B981" />}
                  {isAnswered && isGiven && !isRight && <XCircle size={18} color="#EF4444" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback + explanation */}
          {isAnswered && (
            <View
              style={[
                styles.feedbackCard,
                {
                  backgroundColor: isCorrect
                    ? isDark ? 'rgba(16,185,129,0.10)' : '#ECFDF5'
                    : isDark ? 'rgba(239,68,68,0.10)' : '#FEF2F2',
                  borderColor: isCorrect ? '#10B98133' : '#EF444433',
                },
              ]}
            >
              <View style={styles.feedbackHeader}>
                {isCorrect ? <CheckCircle2 size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
                <Text style={[styles.feedbackTitle, { color: isCorrect ? '#10B981' : '#EF4444' }]}>
                  {isCorrect ? 'Rätt svar!' : 'Fel svar'}
                </Text>
              </View>
              {question.explanation && (
                <Text style={[styles.feedbackExplanation, { color: theme.colors.textSecondary }]}>
                  {question.explanation}
                </Text>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Footer CTA */}
      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
        {isCompleting ? (
          <View style={[styles.footerCta, styles.footerCtaDisabled]}>
            <ActivityIndicator size="small" color="#FFF" />
            <Text style={styles.footerCtaText}>Sparar resultat …</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.footerCta, !isAnswered && styles.footerCtaDisabled]}
            onPress={() => void handleNext()}
            disabled={!isAnswered}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={isLastQuestion ? 'Avsluta och visa resultat' : 'Nästa fråga'}
          >
            <Text style={styles.footerCtaText}>
              {isLastQuestion ? 'Avsluta & visa resultat' : 'Nästa fråga'}
            </Text>
            <ChevronRight size={18} color="#FFF" />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Results view
// ─────────────────────────────────────────────────────────────────────────────

const ResultsView = ({ results, onDone }: { results: HPTrainingResults; onDone: () => void }) => {
  const { theme, isDark } = useTheme();
  const accuracyColor = results.accuracy >= 80 ? '#10B981' : results.accuracy >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top']} style={styles.safeArea} />
      <ScrollView contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
        {/* Score hero */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.resultsHero}
        >
          <Text style={styles.resultsHeroLabel}>PASS KLART</Text>
          <Text style={[styles.resultsHeroScore, { color: results.accuracy >= 80 ? '#6EE7B7' : '#FFF' }]}>
            {results.accuracy}%
          </Text>
          <Text style={styles.resultsHeroSub}>
            {results.correctCount} av {results.answeredQuestions} svarade rätt · {formatTime(results.durationSeconds)}
          </Text>
        </LinearGradient>

        {/* Section breakdown */}
        <Text style={[styles.resultsSectionTitle, { color: theme.colors.text }]}>Per delprov</Text>
        <View style={[styles.resultsCard, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          {results.sectionResults.map(section => {
            const color = sectionColor(section.sectionCode);
            return (
              <View key={section.sectionCode} style={styles.sectionRow}>
                <Text style={[styles.sectionRowCode, { color: theme.colors.text }]}>{section.sectionCode}</Text>
                <View style={[styles.sectionBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                  <View style={[styles.sectionBarFill, { width: `${section.accuracy}%`, backgroundColor: color }]} />
                </View>
                <Text style={[styles.sectionRowPct, { color: theme.colors.textMuted }]}>
                  {section.correct}/{section.total}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Weaknesses */}
        {results.weaknesses.length > 0 && (
          <>
            <Text style={[styles.resultsSectionTitle, { color: theme.colors.text }]}>Svagheter identifierade</Text>
            <View style={styles.chipRow}>
              {results.weaknesses.map(code => (
                <View key={code} style={[styles.weakChip, { backgroundColor: '#EF44441A' }]}>
                  <TrendingUp size={12} color="#EF4444" />
                  <Text style={[styles.weakChipText, { color: '#EF4444' }]}>{code}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* New repetition points */}
        <Text style={[styles.resultsSectionTitle, { color: theme.colors.text }]}>Nya repetitionsbehov</Text>
        <View style={[styles.resultsCard, { backgroundColor: theme.colors.surface, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          <View style={styles.repHeaderRow}>
            <RefreshCw size={16} color="#F59E0B" />
            <Text style={[styles.repCountText, { color: theme.colors.text }]}>
              {results.newRepetitionPoints.length} frågor schemalagda
            </Text>
          </View>
          {results.newRepetitionPoints.slice(0, 3).map(point => (
            <View key={point.questionId} style={styles.repItemRow}>
              <View style={[styles.repDot, { backgroundColor: sectionColor(point.sectionCode) }]} />
              <Text numberOfLines={1} style={[styles.repItemText, { color: theme.colors.textSecondary }]}>
                {point.questionText}
              </Text>
            </View>
          ))}
          {results.newRepetitionPoints.length === 0 && (
            <Text style={[styles.repEmptyText, { color: theme.colors.textMuted }]}>
              Inget repetitionbehov just nu — bra jobbat!
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.resultsDoneBtn}
          onPress={onDone}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Klart"
        >
          <Text style={styles.resultsDoneText}>Klart</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safeArea: { backgroundColor: 'transparent' },

  // Loading
  loadingText: { marginTop: 12, fontSize: 14 },

  // Idle
  idleContent: { padding: 20, paddingTop: 24, flexGrow: 1, justifyContent: 'center' },
  idleHero: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  idleHeroTitle: { fontSize: 22, fontWeight: '800' as const, color: '#FFF', textAlign: 'center' },
  idleHeroText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 21 },
  idleCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    minHeight: 54,
  },
  idleCtaText: { color: '#FFF', fontSize: 16, fontWeight: '700' as const },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, gap: 6 },
  headerProgressText: { fontSize: 13, fontWeight: '700' as const, textAlign: 'center' },
  headerProgressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  headerProgressFill: { height: '100%', borderRadius: 3 },
  headerCount: { fontSize: 12, fontWeight: '600' as const, textAlign: 'center' },

  // Scroll content
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },

  // Pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  sectionPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  sectionPillText: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.4 },
  reasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  reasonPillText: { fontSize: 11, fontWeight: '700' as const },

  // Passage + question
  passageCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  passageText: { fontSize: 13.5, lineHeight: 21 },
  questionText: { fontSize: 17, fontWeight: '700' as const, lineHeight: 25, marginBottom: 18 },

  // Options
  options: { gap: 10, marginBottom: 16 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    minHeight: 52,
  },
  optionText: { fontSize: 14.5, fontWeight: '600' as const, flex: 1, lineHeight: 20 },

  // Feedback
  feedbackCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  feedbackTitle: { fontSize: 14, fontWeight: '700' as const },
  feedbackExplanation: { fontSize: 13.5, lineHeight: 20 },

  // Footer
  footer: { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 10 },
  footerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    minHeight: 54,
    marginBottom: 8,
  },
  footerCtaDisabled: { opacity: 0.45 },
  footerCtaText: { color: '#FFF', fontSize: 15.5, fontWeight: '700' as const },

  // Results
  resultsContent: { padding: 16, paddingBottom: 40 },
  resultsHero: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 6,
    marginBottom: 22,
  },
  resultsHeroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 1.4,
  },
  resultsHeroScore: { fontSize: 56, fontWeight: '800' as const },
  resultsHeroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13.5, fontWeight: '600' as const },
  resultsSectionTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    marginBottom: 10,
    marginTop: 4,
  },
  resultsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 18,
    gap: 10,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionRowCode: { fontSize: 12.5, fontWeight: '800' as const, width: 38 },
  sectionBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  sectionBarFill: { height: '100%', borderRadius: 4 },
  sectionRowPct: { fontSize: 12, fontWeight: '600' as const, width: 36, textAlign: 'right' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  weakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  weakChipText: { fontSize: 12.5, fontWeight: '700' as const },
  repHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  repCountText: { fontSize: 14, fontWeight: '700' as const },
  repItemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 2 },
  repDot: { width: 8, height: 8, borderRadius: 4 },
  repItemText: { fontSize: 12.5, flex: 1 },
  repEmptyText: { fontSize: 13, fontStyle: 'italic' as const },
  resultsDoneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 16,
    minHeight: 54,
    marginTop: 8,
  },
  resultsDoneText: { color: '#FFF', fontSize: 16, fontWeight: '700' as const },
});
