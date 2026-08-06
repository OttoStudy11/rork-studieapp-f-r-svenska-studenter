import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Award,
  BarChart3,
  Zap,
  History,
  Calendar,
  CheckCircle2,
  Layers,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useHogskoleprovet } from '@/contexts/HogskoleprovetContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { HP_SECTIONS, HP_MILESTONES, getScoreLabel } from '@/constants/hogskoleprovet';
import { RadarChart } from '@/components/shared/RadarChart';

interface AttemptRecord {
  id: string;
  attempt_type: 'full_test' | 'section_practice' | 'question_practice';
  section_code: string | null;
  status: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number | null;
  normed_score: number | null;
  estimated_hp_score: number | null;
  time_spent_seconds: number | null;
  time_spent_minutes: number | null;
  completed_at: string | null;
  started_at: string;
}

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Idag';
  if (diffDays === 1) return 'Igår';
  if (diffDays < 7) return `${diffDays} dagar sedan`;

  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
};

const formatDuration = (seconds: number | null, minutes: number | null): string => {
  const totalMinutes = minutes ?? Math.round((seconds ?? 0) / 60);
  if (totalMinutes < 1) return '<1 min';
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const getAttemptTypeLabel = (type: string, sectionCode: string | null): { label: string; icon: typeof Layers } => {
  if (type === 'full_test') return { label: 'Hela provet', icon: Layers };
  if (type === 'section_practice') {
    const section = HP_SECTIONS.find((s) => s.code === sectionCode);
    return { label: section ? section.fullName : 'Delprov', icon: Target };
  }
  return { label: 'Frågeövning', icon: CheckCircle2 };
};

const getScoreColor = (percentage: number): string => {
  if (percentage >= 80) return '#10B981';
  if (percentage >= 60) return '#06B6D4';
  if (percentage >= 40) return '#F59E0B';
  return '#EF4444';
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HPStatsScreen() {
  const { theme, isDark } = useTheme();
  const { getUserStats, getSectionProgress, getUnlockedMilestones } = useHogskoleprovet();
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = getUserStats();
  const unlockedMilestones = getUnlockedMilestones();
  const scoreInfo = getScoreLabel(stats.estimatedHPScore);

  const { data: attemptHistory = [], refetch } = useQuery<AttemptRecord[]>({
    queryKey: ['hp-attempt-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('hp_user_exam_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false }) as any;
      if (error) {
        console.error('[HP Stats] Error fetching attempt history:', error);
        return [];
      }
      return (data || []) as AttemptRecord[];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const groupedHistory = useMemo(() => {
    const groups: Record<string, AttemptRecord[]> = {};
    attemptHistory.forEach((attempt) => {
      const dateKey = attempt.completed_at
        ? new Date(attempt.completed_at).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Okänt datum';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(attempt);
    });
    return Object.entries(groups).slice(0, 10);
  }, [attemptHistory]);

  const totalCompleted = attemptHistory.length;
  const fullTestCount = attemptHistory.filter((a) => a.attempt_type === 'full_test').length;
  const sectionPracticeCount = attemptHistory.filter((a) => a.attempt_type === 'section_practice').length;

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
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
                Radaröversikt
              </Text>
            </View>

            <View style={[styles.radarContainer, { backgroundColor: theme.colors.card }]}>
              <RadarChart
                data={HP_SECTIONS.map((section) => ({
                  label: section.code,
                  value: getSectionProgress(section.code).averageScore || 0,
                  color: section.color,
                }))}
                size={SCREEN_WIDTH - 80}
              />
            </View>
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

          {/* ═══════════════════ EXAM HISTORY ═══════════════════ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <History size={18} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Provhistorik
              </Text>
            </View>

            {totalCompleted === 0 ? (
              <View style={[styles.historyEmpty, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.historyEmptyIcon, { backgroundColor: theme.colors.primary + '12' }]}>
                  <History size={28} color={theme.colors.primary} />
                </View>
                <Text style={[styles.historyEmptyTitle, { color: theme.colors.text }]}>
                  Inga genomförda prov än
                </Text>
                <Text style={[styles.historyEmptySub, { color: theme.colors.textSecondary }]}>
                  Slutför ditt första prov för att se din historik här
                </Text>
              </View>
            ) : (
              <>
                {/* Summary row */}
                <View style={[styles.historySummary, { backgroundColor: theme.colors.card, borderColor: isDark ? theme.colors.border : 'rgba(0,0,0,0.04)' }]}>
                  <View style={styles.historySummaryItem}>
                    <Text style={[styles.historySummaryValue, { color: theme.colors.text }]}>{totalCompleted}</Text>
                    <Text style={[styles.historySummaryLabel, { color: theme.colors.textSecondary }]}>Totalt</Text>
                  </View>
                  <View style={[styles.historySummaryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
                  <View style={styles.historySummaryItem}>
                    <Text style={[styles.historySummaryValue, { color: theme.colors.text }]}>{fullTestCount}</Text>
                    <Text style={[styles.historySummaryLabel, { color: theme.colors.textSecondary }]}>Hela prov</Text>
                  </View>
                  <View style={[styles.historySummaryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
                  <View style={styles.historySummaryItem}>
                    <Text style={[styles.historySummaryValue, { color: theme.colors.text }]}>{sectionPracticeCount}</Text>
                    <Text style={[styles.historySummaryLabel, { color: theme.colors.textSecondary }]}>Delprov</Text>
                  </View>
                </View>

                {/* Grouped history */}
                {groupedHistory.map(([dateLabel, attempts]) => (
                  <View key={dateLabel} style={styles.historyGroup}>
                    <View style={styles.historyDateRow}>
                      <Calendar size={13} color={theme.colors.textSecondary} />
                      <Text style={[styles.historyDateText, { color: theme.colors.textSecondary }]}>
                        {dateLabel}
                      </Text>
                      <View style={[styles.historyDateLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
                    </View>

                    {attempts.map((attempt) => {
                      const typeInfo = getAttemptTypeLabel(attempt.attempt_type, attempt.section_code);
                      const TypeIcon = typeInfo.icon;
                      const scorePct = attempt.score_percentage
                        ?? (attempt.total_questions > 0
                          ? (attempt.correct_answers / attempt.total_questions) * 100
                          : 0);
                      const scoreColor = getScoreColor(scorePct);
                      const isExpanded = expandedId === attempt.id;
                      const section = attempt.section_code
                        ? HP_SECTIONS.find((s) => s.code === attempt.section_code)
                        : null;
                      const normedScore = attempt.normed_score ? attempt.normed_score * 50 : null;

                      return (
                        <TouchableOpacity
                          key={attempt.id}
                          style={[
                            styles.historyCard,
                            { backgroundColor: theme.colors.card, borderColor: isDark ? theme.colors.border : 'rgba(0,0,0,0.04)' },
                          ]}
                          onPress={() => setExpandedId(isExpanded ? null : attempt.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.historyCardTop}>
                            <View style={[
                              styles.historyTypeIcon,
                              { backgroundColor: (section?.color ?? theme.colors.primary) + '15' },
                            ]}>
                              <TypeIcon size={16} color={section?.color ?? theme.colors.primary} />
                            </View>
                            <View style={styles.historyCardInfo}>
                              <Text style={[styles.historyCardTitle, { color: theme.colors.text }]} numberOfLines={1}>
                                {typeInfo.label}
                              </Text>
                              <Text style={[styles.historyCardSub, { color: theme.colors.textSecondary }]}>
                                {formatDate(attempt.completed_at || attempt.started_at)}
                              </Text>
                            </View>
                            <View style={styles.historyScoreCol}>
                              <Text style={[styles.historyScorePct, { color: scoreColor }]}>
                                {Math.round(scorePct)}%
                              </Text>
                              <Text style={[styles.historyScoreCorrect, { color: theme.colors.textMuted }]}>
                                {attempt.correct_answers}/{attempt.total_questions}
                              </Text>
                            </View>
                          </View>

                          {/* Expanded details */}
                          {isExpanded && (
                            <View style={[styles.historyCardDetails, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                              <View style={styles.historyDetailRow}>
                                <Clock size={14} color={theme.colors.textSecondary} />
                                <Text style={[styles.historyDetailText, { color: theme.colors.textSecondary }]}>
                                  Tid: {formatDuration(attempt.time_spent_seconds, attempt.time_spent_minutes)}
                                </Text>
                              </View>
                              {normedScore !== null && (
                                <View style={styles.historyDetailRow}>
                                  <Trophy size={14} color={theme.colors.textSecondary} />
                                  <Text style={[styles.historyDetailText, { color: theme.colors.textSecondary }]}>
                                    Normerat: {normedScore.toFixed(1)}
                                  </Text>
                                </View>
                              )}
                              {attempt.estimated_hp_score !== null && (
                                <View style={styles.historyDetailRow}>
                                  <TrendingUp size={14} color={theme.colors.textSecondary} />
                                  <Text style={[styles.historyDetailText, { color: theme.colors.textSecondary }]}>
                                    Uppskattat HP: {attempt.estimated_hp_score.toFixed(2)}
                                  </Text>
                                </View>
                              )}
                              {/* Score bar */}
                              <View style={[styles.historyScoreBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                                <View style={[styles.historyScoreBarFill, { backgroundColor: scoreColor, width: `${Math.min(100, scorePct)}%` }]} />
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </>
            )}
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
  radarContainer: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },

  // ═══ EXAM HISTORY ═══
  historyEmpty: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 10,
  },
  historyEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyEmptyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  historyEmptySub: {
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
    lineHeight: 18,
  },
  historySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  historySummaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  historySummaryValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  historySummaryLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  historySummaryDivider: {
    width: 1,
    height: 32,
  },
  historyGroup: {
    marginBottom: 16,
  },
  historyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  historyDateText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  historyDateLine: {
    flex: 1,
    height: 1,
    borderRadius: 0.5,
  },
  historyCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyTypeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyCardInfo: {
    flex: 1,
    gap: 2,
  },
  historyCardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  historyCardSub: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  historyScoreCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  historyScorePct: {
    fontSize: 18,
    fontWeight: '800' as const,
    letterSpacing: -0.3,
  },
  historyScoreCorrect: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  historyCardDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  historyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyDetailText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  historyScoreBar: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  historyScoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
