import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Clock, Trophy, Target, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { useHPTrial } from '@/contexts/HPTrialContext';
import { HPPaywallModal } from '@/components/hogskoleprovet/HPPaywallModal';
import { ROUTES } from '@/utils/typedRoutes';
import { COLORS } from '@/constants/design-system';

export default function HPResultScreen() {
  const { theme, isDark } = useTheme();
  const { sessionState, completeSession } = useHogskoleprovet();
  const { completeTrial, trialStatus } = useHPTrial();
  const params = useLocalSearchParams();
  
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [isTrialMode] = useState(params.isTrialMode === 'true');

  useEffect(() => {
    const loadResults = async () => {
      if (!sessionState) {
        console.log('[HP Results] No session state');
        router.replace(ROUTES.hogskoleprovetMain);
        return;
      }

      try {
        console.log('[HP Results] Completing session', { isTrialMode });
        const result = await completeSession();
        
        if (result) {
          setResults(result);
          
          if (isTrialMode && sessionState.trialId) {
            console.log('[HP Results] Completing trial', sessionState.trialId);
            await completeTrial(
              sessionState.trialId,
              result.totalQuestions,
              result.correctAnswers,
              result.scorePercentage,
              result.estimatedHPScore,
              result.timeSpentMinutes
            );
            
            setTimeout(() => {
              setPaywallVisible(true);
            }, 1500);
          }
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
            <View style={styles.crownContainer}>
              <Trophy size={64} color="#FFF" />
            </View>
            <Text style={styles.headerTitle}>
              {isTrialMode ? '🎯 Provperiod slutförd!' : 'Resultat'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {scorePercentage >= 80
                ? 'Fantastiskt resultat!'
                : scorePercentage >= 60
                ? 'Bra jobbat!'
                : 'Du gör framsteg!'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.scoreCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.scoreHeader}>
            <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
              Ditt resultat
            </Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {scorePercentage.toFixed(1)}%
              </Text>
            </View>
            <Text style={[styles.scoreSubtext, { color: theme.colors.textSecondary }]}>
              {results.correctAnswers} av {results.totalQuestions} rätt
            </Text>
          </View>

          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${scorePercentage}%`, backgroundColor: scoreColor },
              ]}
            />
          </View>
        </View>

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

        {isTrialMode && (
          <View style={[styles.trialInfoCard, { backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' }]}>
            <CheckCircle2 size={24} color={COLORS.primary} />
            <View style={styles.trialInfoContent}>
              <Text style={[styles.trialInfoTitle, { color: theme.colors.text }]}>
                Tack för att du testade!
              </Text>
              <Text style={[styles.trialInfoText, { color: theme.colors.textSecondary }]}>
                Uppgradera till Premium för obegränsad tillgång till alla prov och funktioner
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: COLORS.primary }]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {isTrialMode ? 'Tillbaka till start' : 'Fortsätt'}
          </Text>
          <ChevronRight size={20} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>

      <HPPaywallModal
        visible={paywallVisible}
        onClose={() => {
          setPaywallVisible(false);
          handleContinue();
        }}
        onUpgrade={() => {
          setPaywallVisible(false);
          router.push(ROUTES.premium);
        }}
        type="after_trial"
        trialScore={scorePercentage}
        trialType={results.sectionCode ? 'section' : 'full_test'}
        trialTarget={results.sectionCode}
      />
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
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  crownContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  scoreCard: {
    padding: 28,
    borderRadius: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  scoreRow: {
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '800' as const,
  },
  scoreSubtext: {
    fontSize: 15,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
