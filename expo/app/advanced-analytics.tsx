import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  Target,
  Flame,
  Calendar,
  BookOpen,
  Zap,
  Brain,
  Crown,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { supabase } from '@/lib/supabase';
import { PremiumGate } from '@/components/PremiumGate';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WeeklyData {
  week: string;
  minutes: number;
  sessions: number;
}

interface CourseBreakdown {
  courseId: string;
  courseTitle: string;
  totalMinutes: number;
  sessions: number;
  percentage: number;
}

interface DailyPattern {
  hour: number;
  minutes: number;
  label: string;
}

async function fetchAdvancedStats(userId: string) {
  console.log('[Analytics] Fetching advanced stats for:', userId);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: sessions, error } = await supabase
    .from('pomodoro_sessions')
    .select('id, start_time, end_time, duration, course_id')
    .eq('user_id', userId)
    .gte('start_time', thirtyDaysAgo.toISOString())
    .order('start_time', { ascending: false });

  if (error) {
    console.error('[Analytics] Error fetching sessions:', error);
    throw error;
  }

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title');

  const courseMap = new Map<string, string>();
  courses?.forEach(c => courseMap.set(c.id, c.title));

  const safeArray = sessions || [];

  const totalMinutes = safeArray.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalSessions = safeArray.length;
  const avgSessionMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  const uniqueDays = new Set(safeArray.map(s => new Date(s.start_time).toDateString()));
  const activeDays = uniqueDays.size;

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (uniqueDays.has(checkDate.toDateString())) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  const weeklyData: WeeklyData[] = [];
  for (let w = 0; w < 4; w++) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - w * 7);

    const weekSessions = safeArray.filter(s => {
      const d = new Date(s.start_time);
      return d >= weekStart && d < weekEnd;
    });

    weeklyData.unshift({
      week: `V${4 - w}`,
      minutes: weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      sessions: weekSessions.length,
    });
  }

  const thisWeekMinutes = weeklyData[weeklyData.length - 1]?.minutes || 0;
  const lastWeekMinutes = weeklyData[weeklyData.length - 2]?.minutes || 0;
  const weeklyTrend = lastWeekMinutes > 0
    ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
    : thisWeekMinutes > 0 ? 100 : 0;

  const courseBreakdownMap = new Map<string, { minutes: number; sessions: number }>();
  safeArray.forEach(s => {
    if (s.course_id) {
      const existing = courseBreakdownMap.get(s.course_id) || { minutes: 0, sessions: 0 };
      existing.minutes += s.duration || 0;
      existing.sessions += 1;
      courseBreakdownMap.set(s.course_id, existing);
    }
  });

  const courseBreakdown: CourseBreakdown[] = Array.from(courseBreakdownMap.entries())
    .map(([courseId, data]) => ({
      courseId,
      courseTitle: courseMap.get(courseId) || 'Okänd kurs',
      totalMinutes: data.minutes,
      sessions: data.sessions,
      percentage: totalMinutes > 0 ? Math.round((data.minutes / totalMinutes) * 100) : 0,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, 6);

  const hourlyMap = new Map<number, number>();
  safeArray.forEach(s => {
    const hour = new Date(s.start_time).getHours();
    hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + (s.duration || 0));
  });

  const dailyPattern: DailyPattern[] = [];
  for (let h = 6; h <= 23; h++) {
    dailyPattern.push({
      hour: h,
      minutes: hourlyMap.get(h) || 0,
      label: `${h}:00`,
    });
  }

  const peakHour = dailyPattern.reduce((max, dp) => dp.minutes > max.minutes ? dp : max, dailyPattern[0]);

  const daysThisMonth = 30;
  const goalProgress = Math.min(100, Math.round((activeDays / daysThisMonth) * 100));

  const predictedMonthlyMinutes = activeDays > 0
    ? Math.round((totalMinutes / activeDays) * 30)
    : 0;

  return {
    totalMinutes,
    totalSessions,
    avgSessionMinutes,
    activeDays,
    currentStreak,
    weeklyData,
    weeklyTrend,
    courseBreakdown,
    dailyPattern,
    peakHour: peakHour?.label || 'N/A',
    goalProgress,
    predictedMonthlyMinutes,
  };
}

const COURSE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AdvancedAnalyticsScreen() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  usePremium();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userId = user?.id || '';

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['advanced-analytics', userId],
    queryFn: () => fetchAdvancedStats(userId),
    enabled: !!userId,
    staleTime: 60000,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const formatMinutes = (min: number) => {
    if (min < 60) return `${min}m`;
    const hours = Math.floor(min / 60);
    const mins = min % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const content = (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.headerBackBtn, { backgroundColor: theme.colors.card }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Avancerad Analys</Text>
            <View style={styles.headerBadge}>
              <Crown size={12} color="#FFD700" />
              <Text style={styles.headerBadgeText}>Premium</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Analyserar din studiedata...</Text>
          </View>
        ) : stats ? (
          <View style={styles.content}>
            <View style={[styles.overviewGrid]}>
              <View style={[styles.overviewCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.overviewIcon, { backgroundColor: '#6366F1' + '15' }]}>
                  <Clock size={20} color="#6366F1" />
                </View>
                <Text style={[styles.overviewValue, { color: theme.colors.text }]}>{formatMinutes(stats.totalMinutes)}</Text>
                <Text style={[styles.overviewLabel, { color: theme.colors.textMuted }]}>Total tid</Text>
              </View>
              <View style={[styles.overviewCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.overviewIcon, { backgroundColor: '#10B981' + '15' }]}>
                  <Flame size={20} color="#10B981" />
                </View>
                <Text style={[styles.overviewValue, { color: theme.colors.text }]}>{stats.currentStreak}</Text>
                <Text style={[styles.overviewLabel, { color: theme.colors.textMuted }]}>Dagars streak</Text>
              </View>
              <View style={[styles.overviewCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.overviewIcon, { backgroundColor: '#F59E0B' + '15' }]}>
                  <BarChart3 size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.overviewValue, { color: theme.colors.text }]}>{stats.totalSessions}</Text>
                <Text style={[styles.overviewLabel, { color: theme.colors.textMuted }]}>Sessioner</Text>
              </View>
              <View style={[styles.overviewCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.overviewIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
                  <Target size={20} color="#8B5CF6" />
                </View>
                <Text style={[styles.overviewValue, { color: theme.colors.text }]}>{stats.avgSessionMinutes}m</Text>
                <Text style={[styles.overviewLabel, { color: theme.colors.textMuted }]}>Snitt/session</Text>
              </View>
            </View>

            <View style={[styles.trendCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.trendHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Veckoutveckling</Text>
                <View style={[
                  styles.trendBadge,
                  { backgroundColor: stats.weeklyTrend >= 0 ? '#10B981' + '15' : '#EF4444' + '15' }
                ]}>
                  {stats.weeklyTrend >= 0
                    ? <TrendingUp size={14} color="#10B981" />
                    : <TrendingDown size={14} color="#EF4444" />
                  }
                  <Text style={{ color: stats.weeklyTrend >= 0 ? '#10B981' : '#EF4444', fontSize: 13, fontWeight: '700' as const }}>
                    {stats.weeklyTrend > 0 ? '+' : ''}{stats.weeklyTrend}%
                  </Text>
                </View>
              </View>
              <View style={styles.weeklyBars}>
                {stats.weeklyData.map((week, i) => {
                  const maxMin = Math.max(...stats.weeklyData.map(w => w.minutes), 1);
                  const barHeight = Math.max(8, (week.minutes / maxMin) * 80);
                  return (
                    <View key={week.week} style={styles.weeklyBarItem}>
                      <Text style={[styles.weeklyBarValue, { color: theme.colors.text }]}>
                        {formatMinutes(week.minutes)}
                      </Text>
                      <View style={[styles.weeklyBarBg, { backgroundColor: theme.colors.border }]}>
                        <LinearGradient
                          colors={i === stats.weeklyData.length - 1 ? ['#6366F1', '#8B5CF6'] : [theme.colors.primary + '40', theme.colors.primary + '60']}
                          style={[styles.weeklyBarFill, { height: barHeight }]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                        />
                      </View>
                      <Text style={[styles.weeklyBarLabel, { color: theme.colors.textMuted }]}>{week.week}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {stats.courseBreakdown.length > 0 && (
              <View style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.sectionHeader}>
                  <BookOpen size={18} color={theme.colors.primary} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tid per kurs</Text>
                </View>
                {stats.courseBreakdown.map((course, i) => (
                  <View key={course.courseId} style={styles.courseRow}>
                    <View style={[styles.courseDot, { backgroundColor: COURSE_COLORS[i % COURSE_COLORS.length] }]} />
                    <View style={styles.courseInfo}>
                      <Text style={[styles.courseTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        {course.courseTitle}
                      </Text>
                      <View style={styles.courseStats}>
                        <Text style={[styles.courseStatText, { color: theme.colors.textMuted }]}>
                          {formatMinutes(course.totalMinutes)}
                        </Text>
                        <Text style={[styles.courseStatText, { color: theme.colors.textMuted }]}>•</Text>
                        <Text style={[styles.courseStatText, { color: theme.colors.textMuted }]}>
                          {course.sessions} sessioner
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.coursePercent, { backgroundColor: COURSE_COLORS[i % COURSE_COLORS.length] + '15' }]}>
                      <Text style={[styles.coursePercentText, { color: COURSE_COLORS[i % COURSE_COLORS.length] }]}>
                        {course.percentage}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.sectionHeader}>
                <Calendar size={18} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Studiemönster per timme</Text>
              </View>
              <View style={styles.hourlyChart}>
                {stats.dailyPattern.map((dp) => {
                  const maxMin = Math.max(...stats.dailyPattern.map(d => d.minutes), 1);
                  const barHeight = Math.max(2, (dp.minutes / maxMin) * 48);
                  const isPeak = dp.label === stats.peakHour;
                  return (
                    <View key={dp.hour} style={styles.hourlyBarItem}>
                      <View style={[styles.hourlyBarBg, { backgroundColor: theme.colors.border }]}>
                        <View
                          style={[
                            styles.hourlyBarFill,
                            {
                              height: barHeight,
                              backgroundColor: isPeak ? '#F59E0B' : theme.colors.primary + '60',
                            },
                          ]}
                        />
                      </View>
                      {dp.hour % 3 === 0 && (
                        <Text style={[styles.hourlyLabel, { color: theme.colors.textMuted }]}>{dp.hour}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
              <View style={styles.peakInfo}>
                <Zap size={14} color="#F59E0B" />
                <Text style={[styles.peakText, { color: theme.colors.textSecondary }]}>
                  Mest produktiv kl. {stats.peakHour}
                </Text>
              </View>
            </View>

            <View style={[styles.predictionsCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.sectionHeader}>
                <Brain size={18} color="#8B5CF6" />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Prediktioner</Text>
              </View>
              <View style={styles.predictionGrid}>
                <View style={styles.predictionItem}>
                  <Text style={[styles.predictionValue, { color: theme.colors.text }]}>
                    {formatMinutes(stats.predictedMonthlyMinutes)}
                  </Text>
                  <Text style={[styles.predictionLabel, { color: theme.colors.textMuted }]}>
                    Beräknad månadstid
                  </Text>
                </View>
                <View style={[styles.predictionDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.predictionItem}>
                  <Text style={[styles.predictionValue, { color: theme.colors.text }]}>
                    {stats.activeDays}/30
                  </Text>
                  <Text style={[styles.predictionLabel, { color: theme.colors.textMuted }]}>
                    Aktiva dagar
                  </Text>
                </View>
                <View style={[styles.predictionDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.predictionItem}>
                  <Text style={[styles.predictionValue, { color: theme.colors.text }]}>
                    {stats.goalProgress}%
                  </Text>
                  <Text style={[styles.predictionLabel, { color: theme.colors.textMuted }]}>
                    Måluppfyllnad
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.insightsLink, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                router.push('/study-insights' as any);
              }}
            >
              <View style={[styles.insightsLinkIcon, { backgroundColor: '#6366F1' + '15' }]}>
                <Brain size={20} color="#6366F1" />
              </View>
              <View style={styles.insightsLinkContent}>
                <Text style={[styles.insightsLinkTitle, { color: theme.colors.text }]}>Studieinsikter</Text>
                <Text style={[styles.insightsLinkSub, { color: theme.colors.textMuted }]}>SRS, Smart Study & Analys</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
            <BarChart3 size={48} color={theme.colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Ingen data ännu</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Starta en studiesession för att se din avancerade analys här.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <PremiumGate feature="statistics" fullScreen>
      {content}
    </PremiumGate>
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
    gap: 12,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700' + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  loadingSection: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  overviewCard: {
    width: (SCREEN_WIDTH - 40 - 10) / 2 - 0.5,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 22,
    fontWeight: '800' as const,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  trendCard: {
    borderRadius: 16,
    padding: 18,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  weeklyBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  weeklyBarItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  weeklyBarValue: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  weeklyBarBg: {
    width: 32,
    height: 84,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weeklyBarFill: {
    width: '100%',
    borderRadius: 8,
  },
  weeklyBarLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  courseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseStatText: {
    fontSize: 12,
  },
  coursePercent: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coursePercentText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  hourlyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  hourlyBarItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  hourlyBarBg: {
    width: 12,
    height: 52,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  hourlyBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  hourlyLabel: {
    fontSize: 9,
    fontWeight: '500' as const,
  },
  peakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  peakText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  predictionsCard: {
    borderRadius: 16,
    padding: 18,
  },
  predictionGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  predictionValue: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  predictionLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  predictionDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 4,
  },
  insightsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  insightsLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsLinkContent: {
    flex: 1,
  },
  insightsLinkTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  insightsLinkSub: {
    fontSize: 12,
  },
  emptyState: {
    margin: 20,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
