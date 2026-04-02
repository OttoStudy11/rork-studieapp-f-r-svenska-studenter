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
      duration: 400,
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

      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.back()}
          >
            <ChevronLeft size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Statistik
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View
            style={[
              styles.scoreCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: isDark ? theme.colors.border : scoreInfo.color + '25',
              },
            ]}
          >
            <View style={styles.scoreHeader}>
              <View style={[styles.scoreIconBg, { backgroundColor: scoreInfo.color + '15' }]}>
                <Trophy size={28} color={scoreInfo.color} />
              </View>
              <View style={styles.scoreInfo}>
                <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
                  Uppskattat HP-resultat
                </Text>
                <View style={styles.scoreValueRow}>
                  <Text style={[styles.scoreValue, { color: theme.colors.text }]}>
                    {stats.estimatedHPScore.toFixed(2)}
                  </Text>
                  <Text style={[styles.scoreMax, { color: theme.colors.textMuted }]}>
                    / 2.0
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: scoreInfo.color + '15' }]}>
              <Text style={[styles.scoreBadgeText, { color: scoreInfo.color }]}>
                {scoreInfo.label}
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            {[
              { icon: Target, value: `${stats.totalAttempts}`, label: 'Övningar', color: theme.colors.primary },
              { icon: TrendingUp, value: `${stats.averageScore.toFixed(0)}%`, label: 'Snitt', color: theme.colors.success },
              { icon: Award, value: `${stats.bestScore.toFixed(0)}%`, label: 'Bästa', color: theme.colors.warning },
              { icon: Clock, value: formatTime(stats.totalStudyTime), label: 'Studietid', color: theme.colors.info },
            ].map((item, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statIcon, { backgroundColor: item.color + '12' }]}>
                  <item.icon size={20} color={item.color} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {item.value}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={18} color={theme.colors.primary} />
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
                    style={[styles.sectionRow, { backgroundColor: theme.colors.card }]}
                  >
                    <View style={[styles.sectionIconBg, { backgroundColor: section.color + '15' }]}>
                      <Text style={styles.sectionIcon}>{section.icon}</Text>
                    </View>

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
                        <Text style={[styles.sectionScore, { color: theme.colors.text }]}>
                          {progress.averageScore.toFixed(0)}%
                        </Text>
                        <Text style={[styles.sectionAttempts, { color: theme.colors.textMuted }]}>
                          {progress.attempts} övn.
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.noProgress, { color: theme.colors.textMuted }]}>
                        Ej tränat
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={18} color={theme.colors.warning} />
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
                      { backgroundColor: theme.colors.card },
                      isUnlocked && { borderColor: theme.colors.primary + '30', borderWidth: 1 },
                    ]}
                  >
                    <View style={[
                      styles.milestoneIconBg,
                      { backgroundColor: isUnlocked ? theme.colors.primary + '15' : theme.colors.border + '40' }
                    ]}>
                      <Text style={[
                        styles.milestoneIcon,
                        !isUnlocked && { opacity: 0.35 },
                      ]}>
                        {milestone.icon}
                      </Text>
                    </View>
                    <Text style={[
                      styles.milestoneName,
                      { color: isUnlocked ? theme.colors.text : theme.colors.textMuted }
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
                      { color: isUnlocked ? theme.colors.primary : theme.colors.textMuted }
                    ]}>
                      +{milestone.xp} XP
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {stats.strongSections.length > 0 && (
            <View style={styles.section}>
              <View style={styles.insightsContainer}>
                <View style={[styles.insightCard, { backgroundColor: theme.colors.success + '10' }]}>
                  <View style={[styles.insightIconBg, { backgroundColor: theme.colors.success + '15' }]}>
                    <TrendingUp size={18} color={theme.colors.success} />
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={[styles.insightTitle, { color: theme.colors.success }]}>
                      Starka områden
                    </Text>
                    <Text style={[styles.insightText, { color: theme.colors.text }]}>
                      {stats.strongSections.join(', ')}
                    </Text>
                  </View>
                </View>

                {stats.weakSections.length > 0 && (
                  <View style={[styles.insightCard, { backgroundColor: theme.colors.warning + '10' }]}>
                    <View style={[styles.insightIconBg, { backgroundColor: theme.colors.warning + '15' }]}>
                      <Target size={18} color={theme.colors.warning} />
                    </View>
                    <View style={styles.insightContent}>
                      <Text style={[styles.insightTitle, { color: theme.colors.warning }]}>
                        Förbättringsområden
                      </Text>
                      <Text style={[styles.insightText, { color: theme.colors.text }]}>
                        {stats.weakSections.join(', ')}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  scoreCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  scoreIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 34,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginLeft: 4,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  sectionsList: {
    gap: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  sectionIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  sectionFullName: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  sectionStats: {
    alignItems: 'flex-end',
  },
  sectionScore: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  sectionAttempts: {
    fontSize: 11,
    fontWeight: '400' as const,
    marginTop: 2,
  },
  noProgress: {
    fontSize: 13,
    fontWeight: '400' as const,
    fontStyle: 'italic' as const,
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  milestoneCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  milestoneIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneIcon: {
    fontSize: 20,
  },
  milestoneName: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 11,
    fontWeight: '400' as const,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 6,
  },
  milestoneXP: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  insightsContainer: {
    gap: 10,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  insightIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '500' as const,
  },
  bottomPadding: {
    height: 20,
  },
});
