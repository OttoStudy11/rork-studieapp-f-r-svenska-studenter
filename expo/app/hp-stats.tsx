import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import {
  ChevronLeft,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Award,
  BarChart3,
  Zap,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { HP_SECTIONS, HP_MILESTONES, getScoreLabel } from '@/constants/hogskoleprovet';
import { COLORS } from '@/constants/design-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HPStatsScreen() {
  const { theme, isDark } = useTheme();
  const { getUserStats, getSectionProgress, getUnlockedMilestones } = useHogskoleprovet();
  const [fadeAnim] = useState(new Animated.Value(0));

  const stats = getUserStats();
  const unlockedMilestones = getUnlockedMilestones();
  const scoreInfo = getScoreLabel(stats.estimatedHPScore);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark 
          ? ['#1E293B', theme.colors.background]
          : ['#F1F5F9', theme.colors.background]
        }
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Statistik
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.scoreOverview, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={[scoreInfo.color + '30', scoreInfo.color + '10']}
            style={[styles.scoreCard, { borderColor: scoreInfo.color + '40' }]}
          >
            <View style={styles.scoreHeader}>
              <Trophy size={32} color={scoreInfo.color} />
              <View style={styles.scoreInfo}>
                <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
                  Uppskattat HP-resultat
                </Text>
                <View style={styles.scoreValueRow}>
                  <Text style={[styles.scoreValue, { color: scoreInfo.color }]}>
                    {stats.estimatedHPScore.toFixed(2)}
                  </Text>
                  <Text style={[styles.scoreMax, { color: theme.colors.textSecondary }]}>
                    / 2.0
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: scoreInfo.color + '20' }]}>
              <Text style={[styles.scoreBadgeText, { color: scoreInfo.color }]}>
                {scoreInfo.label}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: `${COLORS.primary}15` }]}>
              <Target size={20} color={COLORS.primary} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stats.totalAttempts}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Övningar
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: `${COLORS.success}15` }]}>
              <TrendingUp size={20} color={COLORS.success} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stats.averageScore.toFixed(0)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Snitt
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: `${COLORS.warning}15` }]}>
              <Award size={20} color={COLORS.warning} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stats.bestScore.toFixed(0)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Bästa
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: `${COLORS.info}15` }]}>
              <Clock size={20} color={COLORS.info} />
            </View>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {formatTime(stats.totalStudyTime)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Studietid
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color={COLORS.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Per delprov
            </Text>
          </View>

          <View style={styles.sectionsList}>
            {HP_SECTIONS.map((section) => {
              const progress = getSectionProgress(section.code);
              const hasProgress = progress.attempts > 0;
              
              return (
                <View 
                  key={section.code}
                  style={[styles.sectionRow, { backgroundColor: theme.colors.surface }]}
                >
                  <LinearGradient
                    colors={section.gradientColors as any}
                    style={styles.sectionIconBg}
                  >
                    <Text style={styles.sectionIcon}>{section.icon}</Text>
                  </LinearGradient>
                  
                  <View style={styles.sectionInfo}>
                    <Text style={[styles.sectionName, { color: theme.colors.text }]}>
                      {section.name}
                    </Text>
                    <Text style={[styles.sectionFullName, { color: theme.colors.textSecondary }]}>
                      {section.fullName}
                    </Text>
                  </View>

                  {hasProgress ? (
                    <View style={styles.sectionStats}>
                      <Text style={[styles.sectionScore, { color: section.color }]}>
                        {progress.averageScore.toFixed(0)}%
                      </Text>
                      <Text style={[styles.sectionAttempts, { color: theme.colors.textSecondary }]}>
                        {progress.attempts} övn.
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.noProgress, { color: theme.colors.textSecondary }]}>
                      Ej tränat
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Zap size={20} color={COLORS.warning} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Milstolpar ({unlockedMilestones.length}/{HP_MILESTONES.length})
            </Text>
          </View>

          <View style={styles.milestonesGrid}>
            {HP_MILESTONES.map((milestone) => {
              const isUnlocked = unlockedMilestones.includes(milestone.id);
              
              return (
                <View 
                  key={milestone.id}
                  style={[
                    styles.milestoneCard,
                    { backgroundColor: theme.colors.surface },
                    isUnlocked && styles.milestoneUnlocked,
                    isUnlocked && { borderColor: COLORS.primary + '40' },
                  ]}
                >
                  <View style={[
                    styles.milestoneIconBg,
                    { backgroundColor: isUnlocked ? `${COLORS.primary}20` : theme.colors.border }
                  ]}>
                    <Text style={[
                      styles.milestoneIcon,
                      !isUnlocked && styles.milestoneIconLocked,
                    ]}>
                      {milestone.icon}
                    </Text>
                  </View>
                  <Text style={[
                    styles.milestoneName,
                    { color: isUnlocked ? theme.colors.text : theme.colors.textSecondary }
                  ]}>
                    {milestone.name}
                  </Text>
                  <Text style={[
                    styles.milestoneDescription,
                    { color: theme.colors.textSecondary }
                  ]} numberOfLines={2}>
                    {milestone.description}
                  </Text>
                  <Text style={[
                    styles.milestoneXP,
                    { color: isUnlocked ? COLORS.primary : theme.colors.textSecondary }
                  ]}>
                    +{milestone.xp} XP
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {stats.strongSections.length > 0 && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.insightsContainer}>
              <View style={[styles.insightCard, { backgroundColor: `${COLORS.success}15` }]}>
                <TrendingUp size={20} color={COLORS.success} />
                <View style={styles.insightContent}>
                  <Text style={[styles.insightTitle, { color: COLORS.success }]}>
                    Starka områden
                  </Text>
                  <Text style={[styles.insightText, { color: theme.colors.text }]}>
                    {stats.strongSections.join(', ')}
                  </Text>
                </View>
              </View>

              {stats.weakSections.length > 0 && (
                <View style={[styles.insightCard, { backgroundColor: `${COLORS.warning}15` }]}>
                  <Target size={20} color={COLORS.warning} />
                  <View style={styles.insightContent}>
                    <Text style={[styles.insightTitle, { color: COLORS.warning }]}>
                      Förbättringsområden
                    </Text>
                    <Text style={[styles.insightText, { color: theme.colors.text }]}>
                      {stats.weakSections.join(', ')}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scoreOverview: {
    marginBottom: 20,
  },
  scoreCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  scoreValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800' as const,
  },
  scoreMax: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (SCREEN_WIDTH - 44) / 2,
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
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  section: {
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
  sectionsList: {
    gap: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  sectionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  sectionFullName: {
    fontSize: 12,
  },
  sectionStats: {
    alignItems: 'flex-end',
  },
  sectionScore: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  sectionAttempts: {
    fontSize: 11,
    marginTop: 2,
  },
  noProgress: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  milestoneCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  milestoneUnlocked: {
    borderWidth: 1,
  },
  milestoneIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  milestoneIcon: {
    fontSize: 22,
  },
  milestoneIconLocked: {
    opacity: 0.4,
  },
  milestoneName: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 6,
  },
  milestoneXP: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 14,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  insightText: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  bottomPadding: {
    height: 40,
  },
});
