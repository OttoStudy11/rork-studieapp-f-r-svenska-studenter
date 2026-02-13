import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
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
  Brain,
  Zap,
  Target,
  TrendingUp,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Flame,
  RefreshCw,
  BookOpen,
  Sparkles,
  Calendar,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getDueCardsByCourse,
  getSRSStats,
  getReviewForecast,
  getRetentionColor,
  formatNextReview,
  scheduleSRSNotifications,
} from '@/lib/spaced-repetition';

import {
  analyzeStudyPatterns,
  generateRecommendations,
  generateWarmupQuestions,
} from '@/lib/smart-study';

import { getWeakPoints, getMasteryHeatmap, getMasteryColor } from '@/lib/weak-points';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabKey = 'srs' | 'smart' | 'weak';

export default function StudyInsightsScreen() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('srs');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedWarmup, setExpandedWarmup] = useState<number | null>(null);
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  const userId = user?.id || '';

  const { data: dueCards = [], isLoading: loadingDue, refetch: refetchDue } = useQuery({
    queryKey: ['due-cards', userId],
    queryFn: () => getDueCardsByCourse(userId),
    enabled: !!userId,
    staleTime: 60000,
  });

  const { data: srsStats, isLoading: loadingSRS, refetch: refetchSRS } = useQuery({
    queryKey: ['srs-stats', userId],
    queryFn: () => getSRSStats(userId),
    enabled: !!userId,
    staleTime: 60000,
  });

  const { data: forecast = [], refetch: refetchForecast } = useQuery({
    queryKey: ['review-forecast', userId],
    queryFn: () => getReviewForecast(userId, 7),
    enabled: !!userId,
    staleTime: 60000,
  });

  const { data: patterns, isLoading: loadingPatterns, refetch: refetchPatterns } = useQuery({
    queryKey: ['study-patterns', userId],
    queryFn: () => analyzeStudyPatterns(userId),
    enabled: !!userId,
    staleTime: 120000,
  });

  const { data: warmupQuestions = [], refetch: refetchWarmup } = useQuery({
    queryKey: ['warmup-questions', userId],
    queryFn: () => generateWarmupQuestions(userId),
    enabled: !!userId,
    staleTime: 300000,
  });

  const { data: weakPoints = [], isLoading: loadingWeak, refetch: refetchWeak } = useQuery({
    queryKey: ['weak-points', userId],
    queryFn: () => getWeakPoints(userId),
    enabled: !!userId,
    staleTime: 120000,
  });

  const { data: heatmap, isLoading: loadingHeatmap, refetch: refetchHeatmap } = useQuery({
    queryKey: ['mastery-heatmap', userId],
    queryFn: () => getMasteryHeatmap(userId),
    enabled: !!userId,
    staleTime: 120000,
  });

  const recommendations = useMemo(() => {
    if (!patterns) return [];
    return generateRecommendations(patterns);
  }, [patterns]);

  const totalDueCards = useMemo(() => {
    return dueCards.reduce((sum, c) => sum + c.dueCount, 0);
  }, [dueCards]);

  useEffect(() => {
    if (userId) {
      scheduleSRSNotifications(userId).catch(console.error);
    }
  }, [userId]);

  const handleTabChange = useCallback((tab: TabKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(tab);
    const tabIndex = tab === 'srs' ? 0 : tab === 'smart' ? 1 : 2;
    Animated.spring(tabIndicatorAnim, {
      toValue: tabIndex,
      useNativeDriver: true,
      tension: 300,
      friction: 25,
    }).start();
  }, [tabIndicatorAnim]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchDue(),
      refetchSRS(),
      refetchForecast(),
      refetchPatterns(),
      refetchWeak(),
      refetchHeatmap(),
      refetchWarmup(),
    ]);
    setIsRefreshing(false);
  }, [refetchDue, refetchSRS, refetchForecast, refetchPatterns, refetchWeak, refetchHeatmap, refetchWarmup]);

  const tabWidth = (SCREEN_WIDTH - 48) / 3;
  const indicatorTranslateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, tabWidth, tabWidth * 2],
  });

  const renderSRSTab = () => {
    if (loadingDue || loadingSRS) {
      return (
        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Laddar repetitionsdata...</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={[styles.statsRow, { backgroundColor: theme.colors.card }]}>
          <View style={styles.statBox}>
            <View style={[styles.statIconBg, { backgroundColor: '#6366F1' + '20' }]}>
              <BookOpen size={18} color="#6366F1" />
            </View>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{srsStats?.cardsLearned || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Inlärda</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statBox}>
            <View style={[styles.statIconBg, { backgroundColor: '#10B981' + '20' }]}>
              <CheckCircle size={18} color="#10B981" />
            </View>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{srsStats?.cardsMastered || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Behärskade</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statBox}>
            <View style={[styles.statIconBg, { backgroundColor: getRetentionColor(srsStats?.averageRetention || 0) + '20' }]}>
              <Target size={18} color={getRetentionColor(srsStats?.averageRetention || 0)} />
            </View>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{srsStats?.averageRetention || 0}%</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Retention</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.statBox}>
            <View style={[styles.statIconBg, { backgroundColor: '#F59E0B' + '20' }]}>
              <Flame size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>{srsStats?.streakDays || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Streak</Text>
          </View>
        </View>

        {totalDueCards > 0 && (
          <LinearGradient
            colors={isDark ? ['#4F46E5', '#7C3AED'] : ['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dueCardsBanner}
          >
            <View style={styles.dueBannerContent}>
              <View style={styles.dueBannerLeft}>
                <View style={styles.dueBadge}>
                  <Text style={styles.dueBadgeText}>{totalDueCards}</Text>
                </View>
                <View>
                  <Text style={styles.dueBannerTitle}>Kort att repetera</Text>
                  <Text style={styles.dueBannerSubtitle}>Granska nu för bästa resultat</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.dueBannerButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  if (dueCards.length > 0) {
                    router.push(`/flashcards/${dueCards[0].courseId}` as any);
                  }
                }}
              >
                <Text style={styles.dueBannerButtonText}>Starta</Text>
                <ChevronRight size={16} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {forecast.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <Calendar size={18} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Repetitionsprognos</Text>
            </View>
            <View style={styles.forecastRow}>
              {forecast.map((day, i) => {
                const dateObj = new Date(day.date);
                const dayName = i === 0 ? 'Idag' : i === 1 ? 'Imorgon' : dateObj.toLocaleDateString('sv-SE', { weekday: 'short' });
                const maxCount = Math.max(...forecast.map(f => f.count), 1);
                const barHeight = Math.max(4, (day.count / maxCount) * 60);

                return (
                  <View key={day.date} style={styles.forecastDay}>
                    <Text style={[styles.forecastCount, { color: day.count > 0 ? theme.colors.text : theme.colors.textMuted }]}>
                      {day.count}
                    </Text>
                    <View style={[styles.forecastBar, { backgroundColor: theme.colors.border }]}>
                      <View
                        style={[
                          styles.forecastBarFill,
                          {
                            height: barHeight,
                            backgroundColor: i === 0 ? '#6366F1' : day.count > 10 ? '#F59E0B' : '#10B981',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.forecastLabel, { color: theme.colors.textMuted }]}>{dayName}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {dueCards.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <BookOpen size={18} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Per kurs</Text>
            </View>
            {dueCards.map((course) => (
              <TouchableOpacity
                key={course.courseId}
                style={[styles.courseRow, { borderBottomColor: theme.colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  router.push(`/flashcards/${course.courseId}` as any);
                }}
              >
                <View style={styles.courseRowLeft}>
                  <Text style={[styles.courseRowTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {course.courseTitle}
                  </Text>
                  <View style={styles.courseRowMeta}>
                    <Text style={[styles.courseRowMetaText, { color: theme.colors.textMuted }]}>
                      {course.masteredCards}/{course.totalCards} behärskade
                    </Text>
                    <Text style={[styles.courseRowMetaText, { color: theme.colors.textMuted }]}>•</Text>
                    <Text style={[styles.courseRowMetaText, { color: theme.colors.textMuted }]}>
                      {formatNextReview(course.nextReviewDate)}
                    </Text>
                  </View>
                </View>
                <View style={styles.courseRowRight}>
                  {course.dueCount > 0 && (
                    <View style={[styles.duePill, { backgroundColor: '#6366F1' + '20' }]}>
                      <Text style={[styles.duePillText, { color: '#6366F1' }]}>{course.dueCount} att göra</Text>
                    </View>
                  )}
                  <ChevronRight size={18} color={theme.colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {dueCards.length === 0 && !loadingDue && (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
            <CheckCircle size={48} color="#10B981" />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Allt klart!</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Du har inga flashcards att repetera just nu. Skapa flashcards i dina kurser för att börja!
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSmartTab = () => {
    if (loadingPatterns) {
      return (
        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Analyserar studiemönster...</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {patterns && (
          <View style={[styles.patternCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.patternGrid}>
              <View style={styles.patternItem}>
                <View style={[styles.patternIconBg, { backgroundColor: '#6366F1' + '15' }]}>
                  <Clock size={20} color="#6366F1" />
                </View>
                <Text style={[styles.patternValue, { color: theme.colors.text }]}>{patterns.optimalSessionMinutes} min</Text>
                <Text style={[styles.patternLabel, { color: theme.colors.textMuted }]}>Optimal tid</Text>
              </View>
              <View style={styles.patternItem}>
                <View style={[styles.patternIconBg, { backgroundColor: '#10B981' + '15' }]}>
                  <TrendingUp size={20} color="#10B981" />
                </View>
                <Text style={[styles.patternValue, { color: theme.colors.text }]}>{patterns.bestTimeOfDay}</Text>
                <Text style={[styles.patternLabel, { color: theme.colors.textMuted }]}>Bästa tid</Text>
              </View>
              <View style={styles.patternItem}>
                <View style={[styles.patternIconBg, { backgroundColor: '#F59E0B' + '15' }]}>
                  <BarChart3 size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.patternValue, { color: theme.colors.text }]}>{patterns.consistencyScore}%</Text>
                <Text style={[styles.patternLabel, { color: theme.colors.textMuted }]}>Konsistens</Text>
              </View>
              <View style={styles.patternItem}>
                <View style={[styles.patternIconBg, { backgroundColor: patterns.fatigueRisk === 'high' ? '#EF4444' + '15' : patterns.fatigueRisk === 'medium' ? '#F59E0B' + '15' : '#10B981' + '15' }]}>
                  <AlertTriangle size={20} color={patterns.fatigueRisk === 'high' ? '#EF4444' : patterns.fatigueRisk === 'medium' ? '#F59E0B' : '#10B981'} />
                </View>
                <Text style={[styles.patternValue, { color: theme.colors.text }]}>
                  {patterns.fatigueRisk === 'high' ? 'Hög' : patterns.fatigueRisk === 'medium' ? 'Medel' : 'Låg'}
                </Text>
                <Text style={[styles.patternLabel, { color: theme.colors.textMuted }]}>Trötthetsrisk</Text>
              </View>
            </View>
          </View>
        )}

        {recommendations.length > 0 && (
          <View style={styles.recsSection}>
            <View style={styles.sectionHeaderRow}>
              <Sparkles size={18} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Rekommendationer</Text>
            </View>
            {recommendations.map((rec, i) => (
              <TouchableOpacity
                key={`rec-${i}`}
                style={[styles.recCard, { backgroundColor: theme.colors.card }]}
                onPress={() => {
                  if (rec.actionRoute) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    router.push(rec.actionRoute as any);
                  }
                }}
                activeOpacity={rec.actionRoute ? 0.7 : 1}
              >
                <View style={[styles.recEmoji, { backgroundColor: rec.priority === 'high' ? '#EF4444' + '15' : rec.priority === 'medium' ? '#F59E0B' + '15' : '#10B981' + '15' }]}>
                  <Text style={styles.recEmojiText}>{rec.emoji}</Text>
                </View>
                <View style={styles.recContent}>
                  <Text style={[styles.recTitle, { color: theme.colors.text }]}>{rec.title}</Text>
                  <Text style={[styles.recDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {rec.description}
                  </Text>
                </View>
                {rec.actionRoute && <ChevronRight size={18} color={theme.colors.textMuted} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {warmupQuestions.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <Brain size={18} color="#8B5CF6" />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Uppvärmningsfrågor</Text>
            </View>
            <Text style={[styles.warmupSubtitle, { color: theme.colors.textSecondary }]}>
              Testa din kunskap snabbt innan du börjar studera
            </Text>
            {warmupQuestions.map((q, i) => (
              <TouchableOpacity
                key={`warmup-${i}`}
                style={[styles.warmupCard, { borderColor: theme.colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setExpandedWarmup(expandedWarmup === i ? null : i);
                }}
              >
                <View style={styles.warmupHeader}>
                  <View style={[styles.warmupNumber, { backgroundColor: '#8B5CF6' + '20' }]}>
                    <Text style={[styles.warmupNumberText, { color: '#8B5CF6' }]}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.warmupQuestion, { color: theme.colors.text }]} numberOfLines={expandedWarmup === i ? undefined : 2}>
                    {q.question}
                  </Text>
                </View>
                {expandedWarmup === i && (
                  <View style={[styles.warmupAnswer, { backgroundColor: isDark ? '#1A2332' : '#F0FDF4' }]}>
                    <Text style={[styles.warmupAnswerLabel, { color: '#10B981' }]}>Svar:</Text>
                    <Text style={[styles.warmupAnswerText, { color: theme.colors.text }]}>{q.answer}</Text>
                  </View>
                )}
                {expandedWarmup !== i && (
                  <Text style={[styles.warmupHint, { color: theme.colors.textMuted }]}>Tryck för att visa svar</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderWeakTab = () => {
    if (loadingWeak || loadingHeatmap) {
      return (
        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Analyserar kunskapsluckor...</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {heatmap && (
          <View style={[styles.overviewCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.overviewRow}>
              <View style={styles.overviewStat}>
                <View style={[styles.masteryCircle, { borderColor: getMasteryColor(heatmap.overallMastery) }]}>
                  <Text style={[styles.masteryCircleText, { color: theme.colors.text }]}>{heatmap.overallMastery}%</Text>
                </View>
                <Text style={[styles.overviewLabel, { color: theme.colors.textMuted }]}>Total behärskning</Text>
              </View>
              <View style={styles.overviewDetails}>
                <View style={styles.overviewDetailRow}>
                  <View style={[styles.overviewDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.overviewDetailLabel, { color: theme.colors.textSecondary }]}>Starkast:</Text>
                  <Text style={[styles.overviewDetailValue, { color: theme.colors.text }]} numberOfLines={1}>{heatmap.strongestArea}</Text>
                </View>
                <View style={styles.overviewDetailRow}>
                  <View style={[styles.overviewDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={[styles.overviewDetailLabel, { color: theme.colors.textSecondary }]}>Svagast:</Text>
                  <Text style={[styles.overviewDetailValue, { color: theme.colors.text }]} numberOfLines={1}>{heatmap.weakestArea}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {heatmap && heatmap.courses.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={18} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kunskapskarta</Text>
            </View>
            {heatmap.courses.map((course) => (
              <View key={course.courseId} style={styles.heatmapCourse}>
                <View style={styles.heatmapCourseHeader}>
                  <Text style={[styles.heatmapCourseTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {course.courseTitle}
                  </Text>
                  <Text style={[styles.heatmapCourseMastery, { color: getMasteryColor(course.averageMastery) }]}>
                    {course.averageMastery}%
                  </Text>
                </View>
                <View style={styles.heatmapGrid}>
                  {course.topics.slice(0, 8).map((topic, i) => (
                    <View
                      key={`${course.courseId}-${i}`}
                      style={[styles.heatmapCell, { backgroundColor: topic.color + '30', borderColor: topic.color + '60' }]}
                    >
                      <Text style={[styles.heatmapCellText, { color: theme.colors.text }]} numberOfLines={1}>
                        {topic.topic}
                      </Text>
                      <Text style={[styles.heatmapCellPercent, { color: topic.color }]}>
                        {topic.masteryPercent}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {weakPoints.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={18} color="#F59E0B" />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kunskapsluckor</Text>
            </View>
            {weakPoints.map((wp, i) => (
              <TouchableOpacity
                key={`wp-${i}`}
                style={[styles.weakPointCard, { borderColor: theme.colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  router.push(`/flashcards/${wp.courseId}` as any);
                }}
              >
                <View style={styles.weakPointTop}>
                  <View style={styles.weakPointInfo}>
                    <Text style={[styles.weakPointTopic, { color: theme.colors.text }]}>{wp.topic}</Text>
                    <Text style={[styles.weakPointCourse, { color: theme.colors.textMuted }]}>{wp.courseTitle}</Text>
                  </View>
                  <View style={styles.weakPointMeter}>
                    <View style={[styles.weakPointMeterBg, { backgroundColor: theme.colors.border }]}>
                      <View
                        style={[
                          styles.weakPointMeterFill,
                          { width: `${wp.masteryPercent}%`, backgroundColor: getMasteryColor(wp.masteryPercent) },
                        ]}
                      />
                    </View>
                    <Text style={[styles.weakPointPercent, { color: getMasteryColor(wp.masteryPercent) }]}>
                      {wp.masteryPercent}%
                    </Text>
                  </View>
                </View>
                <View style={styles.weakPointBottom}>
                  <Sparkles size={12} color={theme.colors.primary} />
                  <Text style={[styles.weakPointSuggestion, { color: theme.colors.textSecondary }]}>{wp.suggestion}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {weakPoints.length === 0 && (!heatmap || heatmap.courses.length === 0) && (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
            <Target size={48} color={theme.colors.primary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Ingen data ännu</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Öva med flashcards och quiz för att se din kunskapsanalys här.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
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
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Studieinsikter</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>AI-driven analys</Text>
          </View>
          <TouchableOpacity
            style={[styles.headerRefreshBtn, { backgroundColor: theme.colors.card }]}
            onPress={handleRefresh}
          >
            <RefreshCw size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.tabBar, { backgroundColor: theme.colors.card }]}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: tabWidth,
                backgroundColor: theme.colors.primary,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          />
          <TouchableOpacity
            style={[styles.tab, { width: tabWidth }]}
            onPress={() => handleTabChange('srs')}
          >
            <Zap size={16} color={activeTab === 'srs' ? '#fff' : theme.colors.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'srs' ? '#fff' : theme.colors.textMuted }]}>Repetition</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, { width: tabWidth }]}
            onPress={() => handleTabChange('smart')}
          >
            <Brain size={16} color={activeTab === 'smart' ? '#fff' : theme.colors.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'smart' ? '#fff' : theme.colors.textMuted }]}>Smart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, { width: tabWidth }]}
            onPress={() => handleTabChange('weak')}
          >
            <Target size={16} color={activeTab === 'weak' ? '#fff' : theme.colors.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'weak' ? '#fff' : theme.colors.textMuted }]}>Analys</Text>
          </TouchableOpacity>
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
        {activeTab === 'srs' && renderSRSTab()}
        {activeTab === 'smart' && renderSmartTab()}
        {activeTab === 'weak' && renderWeakTab()}
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  headerRefreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    borderRadius: 14,
    padding: 3,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  tabIndicator: {
    position: 'absolute' as const,
    top: 3,
    left: 3,
    height: '100%',
    borderRadius: 11,
    zIndex: 0,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    zIndex: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  statsRow: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
  statDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 4,
  },
  dueCardsBanner: {
    borderRadius: 16,
    padding: 18,
  },
  dueBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  dueBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dueBadgeText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: 'white',
  },
  dueBannerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: 'white',
  },
  dueBannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  dueBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  dueBannerButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#6366F1',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  forecastDay: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  forecastCount: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  forecastBar: {
    width: 24,
    height: 64,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden' as const,
  },
  forecastBarFill: {
    width: '100%',
    borderRadius: 6,
  },
  forecastLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  courseRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  courseRowTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  courseRowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseRowMetaText: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  courseRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  duePillText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  patternCard: {
    borderRadius: 16,
    padding: 18,
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  patternItem: {
    width: (SCREEN_WIDTH - 40 - 36 - 12) / 2,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  patternIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  patternLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  recsSection: {
    gap: 10,
  },
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  recEmoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recEmojiText: {
    fontSize: 22,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 3,
  },
  recDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  warmupSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    marginTop: -6,
  },
  warmupCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  warmupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  warmupNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warmupNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  warmupQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  warmupAnswer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
  },
  warmupAnswerLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  warmupAnswerText: {
    fontSize: 13,
    lineHeight: 19,
  },
  warmupHint: {
    fontSize: 11,
    marginTop: 8,
    marginLeft: 38,
    fontStyle: 'italic' as const,
  },
  overviewCard: {
    borderRadius: 16,
    padding: 20,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  overviewStat: {
    alignItems: 'center',
    gap: 8,
  },
  masteryCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  masteryCircleText: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  overviewLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  overviewDetails: {
    flex: 1,
    gap: 10,
  },
  overviewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  overviewDetailLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  overviewDetailValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    flex: 1,
  },
  heatmapCourse: {
    marginBottom: 18,
  },
  heatmapCourseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heatmapCourseTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
  },
  heatmapCourseMastery: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  heatmapCell: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
  },
  heatmapCellText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  heatmapCellPercent: {
    fontSize: 12,
    fontWeight: '700' as const,
    marginTop: 2,
  },
  weakPointCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  weakPointTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  weakPointInfo: {
    flex: 1,
  },
  weakPointTopic: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  weakPointCourse: {
    fontSize: 12,
    marginTop: 2,
  },
  weakPointMeter: {
    alignItems: 'flex-end',
    gap: 4,
  },
  weakPointMeterBg: {
    width: 80,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  weakPointMeterFill: {
    height: '100%',
    borderRadius: 3,
  },
  weakPointPercent: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  weakPointBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  weakPointSuggestion: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
});
