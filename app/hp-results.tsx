import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Sparkles,
  Home,
  RotateCcw,
  Brain,
  Lightbulb,
  CheckCircle,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { HP_SECTIONS, HP_MILESTONES, getScoreLabel } from '@/constants/hogskoleprovet';
import { COLORS } from '@/constants/design-system';
import { generateText } from '@rork-ai/toolkit-sdk';
import * as Haptics from 'expo-haptics';

export default function HPResultsScreen() {
  const params = useLocalSearchParams<{
    totalQuestions: string;
    correctAnswers: string;
    scorePercentage: string;
    estimatedHPScore: string;
    timeSpentMinutes: string;
    sectionCode: string;
    newMilestones: string;
  }>();

  const { theme, isDark } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [aiTips, setAiTips] = useState<string | null>(null);
  const [isLoadingTips, setIsLoadingTips] = useState(true);

  const totalQuestions = parseInt(params.totalQuestions || '0');
  const correctAnswers = parseInt(params.correctAnswers || '0');
  const scorePercentage = parseFloat(params.scorePercentage || '0');
  const estimatedHPScore = parseFloat(params.estimatedHPScore || '0');
  const timeSpentMinutes = parseInt(params.timeSpentMinutes || '0');
  const sectionCode = params.sectionCode || '';
  const newMilestones: string[] = params.newMilestones ? JSON.parse(params.newMilestones) : [];

  const section = sectionCode ? HP_SECTIONS.find(s => s.code === sectionCode) : null;
  const scoreInfo = getScoreLabel(estimatedHPScore);
  const wrongAnswers = totalQuestions - correctAnswers;

  const fetchAITips = useCallback(async () => {
    try {
      setIsLoadingTips(true);
      
      const prompt = `Du är en expert på högskoleprovet. En student har just avslutat en övning med följande resultat:
- Delprov: ${section?.fullName || 'Komplett prov'}
- Rätt svar: ${correctAnswers} av ${totalQuestions} (${scorePercentage.toFixed(0)}%)
- Uppskattat HP-poäng: ${estimatedHPScore.toFixed(2)}/2.0
- Tid: ${timeSpentMinutes} minuter

Ge 2-3 korta, konkreta tips på svenska för hur studenten kan förbättra sitt resultat. Var uppmuntrande men realistisk. Svara i punktform, max 3 meningar per punkt.`;

      const tips = await generateText(prompt);
      setAiTips(tips);
    } catch (error) {
      console.error('[HP Results] Error fetching AI tips:', error);
      setAiTips(null);
    } finally {
      setIsLoadingTips(false);
    }
  }, [section, correctAnswers, totalQuestions, scorePercentage, estimatedHPScore, timeSpentMinutes]);

  useEffect(() => {
    Haptics.notificationAsync(
      scorePercentage >= 70 
        ? Haptics.NotificationFeedbackType.Success 
        : Haptics.NotificationFeedbackType.Warning
    );

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    fetchAITips();
  }, [fadeAnim, scaleAnim, scorePercentage, fetchAITips]);

  const handlePracticeAgain = () => {
    if (sectionCode) {
      router.replace(`/hp-practice/${sectionCode}` as any);
    } else {
      router.replace('/hp-test' as any);
    }
  };

  const handleGoHome = () => {
    router.replace('/hogskoleprovet' as any);
  };

  const handleViewStats = () => {
    router.push('/hp-stats' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark 
          ? [scoreInfo.color + '40', theme.colors.background]
          : [scoreInfo.color + '20', theme.colors.background]
        }
        style={styles.gradient}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[
              styles.resultCard,
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}>
              <View style={[styles.scoreCircle, { borderColor: scoreInfo.color }]}>
                <Trophy size={40} color={scoreInfo.color} />
                <Text style={[styles.scoreValue, { color: scoreInfo.color }]}>
                  {estimatedHPScore.toFixed(2)}
                </Text>
                <Text style={[styles.scoreMax, { color: theme.colors.textSecondary }]}>
                  / 2.0
                </Text>
              </View>

              <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
                {scorePercentage >= 80 ? 'Utmärkt!' : scorePercentage >= 60 ? 'Bra jobbat!' : 'Fortsätt träna!'}
              </Text>
              
              <View style={[styles.scoreBadge, { backgroundColor: scoreInfo.color + '20' }]}>
                <Text style={[styles.scoreBadgeText, { color: scoreInfo.color }]}>
                  {scoreInfo.label}
                </Text>
              </View>

              <Text style={[styles.scoreDescription, { color: theme.colors.textSecondary }]}>
                {scoreInfo.description}
              </Text>
            </Animated.View>

            <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.statIcon, { backgroundColor: `${COLORS.success}15` }]}>
                  <CheckCircle size={20} color={COLORS.success} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {correctAnswers}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Rätt svar
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.statIcon, { backgroundColor: `${COLORS.error}15` }]}>
                  <Target size={20} color={COLORS.error} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {wrongAnswers}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Fel svar
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.statIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                  <TrendingUp size={20} color={COLORS.primary} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {scorePercentage.toFixed(0)}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Träffsäkerhet
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.statIcon, { backgroundColor: `${COLORS.warning}15` }]}>
                  <Clock size={20} color={COLORS.warning} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {timeSpentMinutes}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Minuter
                </Text>
              </View>
            </Animated.View>

            {newMilestones.length > 0 && (
              <Animated.View style={[styles.milestonesSection, { opacity: fadeAnim }]}>
                <View style={styles.sectionHeader}>
                  <Sparkles size={20} color={COLORS.primary} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Nya milstolpar!
                  </Text>
                </View>
                
                <View style={styles.milestonesContainer}>
                  {newMilestones.map((milestoneId) => {
                    const milestone = HP_MILESTONES.find(m => m.id === milestoneId);
                    if (!milestone) return null;
                    
                    return (
                      <View 
                        key={milestoneId}
                        style={[styles.milestoneCard, { backgroundColor: theme.colors.surface }]}
                      >
                        <View style={[styles.milestoneIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                          <Text style={styles.milestoneEmoji}>{milestone.icon}</Text>
                        </View>
                        <View style={styles.milestoneInfo}>
                          <Text style={[styles.milestoneName, { color: theme.colors.text }]}>
                            {milestone.name}
                          </Text>
                          <Text style={[styles.milestoneXP, { color: COLORS.primary }]}>
                            +{milestone.xp} XP
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            )}

            <Animated.View style={[styles.aiSection, { opacity: fadeAnim }]}>
              <View style={styles.sectionHeader}>
                <Brain size={20} color={COLORS.info} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  AI-tips för förbättring
                </Text>
              </View>
              
              <View style={[styles.aiCard, { backgroundColor: theme.colors.surface }]}>
                {isLoadingTips ? (
                  <View style={styles.aiLoading}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={[styles.aiLoadingText, { color: theme.colors.textSecondary }]}>
                      Analyserar ditt resultat...
                    </Text>
                  </View>
                ) : aiTips ? (
                  <View style={styles.aiContent}>
                    <View style={[styles.aiIconBg, { backgroundColor: `${COLORS.info}15` }]}>
                      <Lightbulb size={24} color={COLORS.info} />
                    </View>
                    <Text style={[styles.aiTips, { color: theme.colors.text }]}>
                      {aiTips}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.aiError, { color: theme.colors.textSecondary }]}>
                    Kunde inte ladda AI-tips just nu. Försök igen senare.
                  </Text>
                )}
              </View>
            </Animated.View>

            <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
              <TouchableOpacity
                style={[styles.primaryButton]}
                onPress={handlePracticeAgain}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.primaryButtonGradient}
                >
                  <RotateCcw size={20} color="#FFF" />
                  <Text style={styles.primaryButtonText}>Träna igen</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.secondaryButtons}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: theme.colors.surface }]}
                  onPress={handleViewStats}
                >
                  <TrendingUp size={20} color={theme.colors.text} />
                  <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                    Statistik
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: theme.colors.surface }]}
                  onPress={handleGoHome}
                >
                  <Home size={20} color={theme.colors.text} />
                  <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                    Tillbaka
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  resultCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: '800' as const,
    marginTop: 8,
  },
  scoreMax: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: -4,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    marginBottom: 12,
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  scoreDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  milestonesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  milestonesContainer: {
    gap: 10,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 14,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneEmoji: {
    fontSize: 24,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  milestoneXP: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  aiSection: {
    marginBottom: 24,
  },
  aiCard: {
    padding: 18,
    borderRadius: 16,
  },
  aiLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  aiLoadingText: {
    fontSize: 14,
  },
  aiContent: {
    gap: 14,
  },
  aiIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTips: {
    fontSize: 14,
    lineHeight: 22,
  },
  aiError: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 10,
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 40,
  },
});
