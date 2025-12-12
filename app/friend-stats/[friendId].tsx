import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { fetchTotalStudyMinutesForUser } from '@/lib/study-stats';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/Avatar';
import type { AvatarConfig } from '@/constants/avatar-config';
import {
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  Flame,
  BookOpen,
  Zap,
} from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';
import { LinearGradient } from 'expo-linear-gradient';
import { PremiumGate } from '@/components/PremiumGate';



interface FriendData {
  id: string;
  username: string;
  display_name: string;
  program: string;
  level: 'gymnasie' | 'högskola';
  gymnasium_grade: string | null;
  avatar?: AvatarConfig;
  studyTime: number;
  sessionCount: number;
  streak: number;
  courseCount: number;
}

interface ComparisonStat {
  label: string;
  yourValue: number;
  friendValue: number;
  unit: string;
  icon: any;
  color: string;
  comparison: 'better' | 'worse' | 'equal';
  difference: number;
}

export default function FriendStatsScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const { user } = useAuth();
  const { user: studyUser } = useStudy();
  const { theme, isDark } = useTheme();
  const [friend, setFriend] = useState<FriendData | null>(null);
  const [yourStats, setYourStats] = useState<{ studyTime: number; sessionCount: number; streak: number; courseCount: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!friendId || !user) return;

    try {
      setErrorMessage(null);
      setIsLoading(true);

      // Load friend profile
      const { data: friendProfile, error: friendError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', friendId)
        .single();

      if (friendError) throw friendError;

      // Load friend progress
      const { data: friendProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', friendId)
        .maybeSingle();

      // Load friend courses
      const { data: friendCourses } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', friendId);

      // Load friend sessions from pomodoro_sessions
      const { data: friendSessions } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', friendId);

      // Load your progress
      const { data: yourProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Load your courses
      const { data: yourCourses } = await supabase
        .from('user_courses')
        .select('*')
        .eq('user_id', user.id);

      // Load your sessions from pomodoro_sessions
      const { data: yourSessions } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id);

      const friendStudyTimeMinutes = await fetchTotalStudyMinutesForUser(friendId);
      const yourStudyTimeMinutes = await fetchTotalStudyMinutesForUser(user.id);

      setFriend({
        id: friendProfile.id,
        username: friendProfile.username,
        display_name: friendProfile.display_name,
        program: friendProfile.program,
        level: friendProfile.level as 'gymnasie' | 'högskola',
        gymnasium_grade: friendProfile.gymnasium_grade,
        avatar: (() => {
          if (!friendProfile.avatar_url) return undefined;
          try {
            return JSON.parse(friendProfile.avatar_url) as AvatarConfig;
          } catch {
            return undefined;
          }
        })(),
        studyTime: friendStudyTimeMinutes, // Keep in minutes for calculations
        sessionCount: friendSessions?.length || 0,
        streak: friendProgress?.current_streak || 0,
        courseCount: friendCourses?.length || 0,
      });

      setYourStats({
        studyTime: yourStudyTimeMinutes,
        sessionCount: yourSessions?.length || 0,
        streak: yourProgress?.current_streak || 0,
        courseCount: yourCourses?.length || 0,
      });
    } catch (error: any) {
      setErrorMessage(error?.message || 'Kunde inte ladda statistik');
      setFriend(null);
      setYourStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [friendId, user]);

  useEffect(() => {
    if (friendId && user) {
      void loadStats();
    }
  }, [friendId, loadStats, user]);

  useEffect(() => {
    if (!friendId || !user) return;

    const intervalId = setInterval(() => {
      void loadStats();
    }, 20000);

    return () => clearInterval(intervalId);
  }, [friendId, loadStats, user]);

  const calculateComparison = (yourValue: number, friendValue: number): 'better' | 'worse' | 'equal' => {
    if (yourValue > friendValue) return 'better';
    if (yourValue < friendValue) return 'worse';
    return 'equal';
  };

  const comparisonStats = useMemo<ComparisonStat[]>(() => {
    if (!friend || !yourStats) return [];

    return [
      {
        label: 'Total studietid',
        yourValue: yourStats.studyTime,
        friendValue: friend.studyTime,
        unit: 'min',
        icon: Clock,
        color: theme.colors.primary,
        comparison: calculateComparison(yourStats.studyTime, friend.studyTime),
        difference: Math.abs(yourStats.studyTime - friend.studyTime),
      },
      {
        label: 'Studiesessioner',
        yourValue: yourStats.sessionCount,
        friendValue: friend.sessionCount,
        unit: 'st',
        icon: BookOpen,
        color: theme.colors.secondary,
        comparison: calculateComparison(yourStats.sessionCount, friend.sessionCount),
        difference: Math.abs(yourStats.sessionCount - friend.sessionCount),
      },
      {
        label: 'Streak',
        yourValue: yourStats.streak,
        friendValue: friend.streak,
        unit: 'dagar',
        icon: Flame,
        color: theme.colors.warning,
        comparison: calculateComparison(yourStats.streak, friend.streak),
        difference: Math.abs(yourStats.streak - friend.streak),
      },
      {
        label: 'Aktiva kurser',
        yourValue: yourStats.courseCount,
        friendValue: friend.courseCount,
        unit: 'st',
        icon: Target,
        color: theme.colors.success,
        comparison: calculateComparison(yourStats.courseCount, friend.courseCount),
        difference: Math.abs(yourStats.courseCount - friend.courseCount),
      },
    ];
  }, [friend, theme.colors.primary, theme.colors.secondary, theme.colors.success, theme.colors.warning, yourStats]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getComparisonText = (stat: ComparisonStat): string => {
    if (stat.comparison === 'equal') return 'Lika bra!';
    const diffText = stat.unit === 'min' ? formatTime(stat.difference) : `${stat.difference} ${stat.unit}`;
    if (stat.comparison === 'better') {
      return `+${diffText} mer än ${friend?.display_name}`;
    }
    return `-${diffText} mindre än ${friend?.display_name}`;
  };

  const overallScore = useMemo((): { you: number; friend: number } => {
    const youWins = comparisonStats.filter((s) => s.comparison === 'better').length;
    const friendWins = comparisonStats.filter((s) => s.comparison === 'worse').length;
    return { you: youWins, friend: friendWins };
  }, [comparisonStats]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Laddar statistik...</Text>
      </View>
    );
  }

  if (!friend || !yourStats) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Kunde inte ladda data</Text>
        {errorMessage ? (
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>{errorMessage}</Text>
        ) : null}
        <TouchableOpacity
          testID="retry-friend-stats"
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => void loadStats()}
        >
          <Text style={styles.retryButtonText}>Försök igen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <PremiumGate feature="battle">
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Jämför statistik',
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header with avatars */}
        <FadeInView delay={0}>
          <View style={styles.headerSection}>
            <LinearGradient
              colors={theme.colors.gradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.vsContainer}>
                <View style={styles.avatarSection}>
                  <View style={[styles.avatarCircle, { borderColor: theme.colors.primary }]}> 
                    {studyUser?.avatar ? (
                      <Avatar config={studyUser.avatar} size={84} />
                    ) : (
                      <Text style={styles.avatarText}>Du</Text>
                    )}
                  </View>
                  <Text style={styles.scoreBadge}>{overallScore.you}</Text>
                </View>

                <View style={styles.vsMiddle}>
                  <Trophy size={32} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.vsText}>VS</Text>
                </View>

                <View style={styles.avatarSection}>
                  <View style={[styles.avatarCircle, { borderColor: theme.colors.secondary }]}>
                    {friend.avatar ? (
                      <Avatar config={friend.avatar} size={80} />
                    ) : (
                      <Text style={styles.avatarText}>{friend.display_name[0]}</Text>
                    )}
                  </View>
                  <Text style={styles.scoreBadge}>{overallScore.friend}</Text>
                </View>
              </View>

              <View style={styles.friendInfoBox}>
                <View style={styles.friendNameRow}>
                  <Text style={styles.friendName} numberOfLines={1}>
                    {friend.display_name}
                  </Text>
                </View>
                <Text style={styles.friendProgram} numberOfLines={1}>
                  {friend.program}{friend.gymnasium_grade ? ` • Årskurs ${friend.gymnasium_grade}` : ''}
                </Text>
                <View style={styles.aheadPill}>
                  <Text style={styles.aheadPillText}>
                    {friend.studyTime === yourStats.studyTime
                      ? 'Ni är lika'
                      : yourStats.studyTime > friend.studyTime
                        ? 'Du leder'
                        : `${friend.display_name} leder`}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </FadeInView>

        {/* Comparison Stats */}
        <View style={styles.statsSection}>
          <SlideInView direction="up" delay={100}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Jämförelse</Text>
          </SlideInView>

          {comparisonStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <SlideInView key={stat.label} direction="up" delay={200 + index * 100}>
                <View style={[styles.statComparisonCard, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.statHeader}>
                    <View style={[styles.statIconCircle, { backgroundColor: stat.color + '15' }]}>
                      <Icon size={20} color={stat.color} />
                    </View>
                    <Text style={[styles.statLabel, { color: theme.colors.text }]}>{stat.label}</Text>
                  </View>

                  <View style={styles.statComparisonRow}>
                    <View style={styles.statValueBox}>
                      <Text style={[styles.statValueLabel, { color: theme.colors.textSecondary }]}>Du</Text>
                      <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {stat.unit === 'min' ? formatTime(stat.yourValue) : stat.yourValue}
                      </Text>
                    </View>

                    <View style={styles.statDivider}>
                      <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                    </View>

                    <View style={styles.statValueBox}>
                      <Text style={[styles.statValueLabel, { color: theme.colors.textSecondary }]}>{friend.display_name}</Text>
                      <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {stat.unit === 'min' ? formatTime(stat.friendValue) : stat.friendValue}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.comparisonBadge, {
                    backgroundColor: stat.comparison === 'better'
                      ? theme.colors.success + '15'
                      : stat.comparison === 'worse'
                        ? theme.colors.error + '15'
                        : theme.colors.textMuted + '15'
                  }]}>
                    <Text style={[styles.comparisonText, {
                      color: stat.comparison === 'better'
                        ? theme.colors.success
                        : stat.comparison === 'worse'
                          ? theme.colors.error
                          : theme.colors.textSecondary
                    }]}>
                      {getComparisonText(stat)}
                    </Text>
                  </View>
                </View>
              </SlideInView>
            );
          })}
        </View>

        {/* Motivational Message */}
        <SlideInView direction="up" delay={600}>
          <View style={[styles.motivationCard, { backgroundColor: theme.colors.card }]}>
            <Zap size={24} color={theme.colors.warning} />
            <Text style={[styles.motivationText, { color: theme.colors.text }]}>
              {overallScore.you > overallScore.friend
                ? `Fantastiskt! Du leder med ${overallScore.you} - ${overallScore.friend}! 🎉`
                : overallScore.you < overallScore.friend
                  ? `${friend.display_name} leder! Men du kan ta igen! 💪`
                  : 'Ni är jämna! Fortsätt plugga! 🔥'}
            </Text>
          </View>
        </SlideInView>
      </ScrollView>
    </SafeAreaView>
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerGradient: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  scoreBadge: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  vsMiddle: {
    alignItems: 'center',
    gap: 8,
  },
  vsText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  friendInfoBox: {
    alignItems: 'center',
    gap: 8,
  },
  friendNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  friendEmoji: {
    fontSize: 24,
  },
  friendName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  friendProgram: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  statComparisonCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  statComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValueBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValueLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statDivider: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    width: 2,
    height: 40,
  },
  comparisonBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  comparisonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  aheadPill: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  aheadPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.92)',
  },
  motivationCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  motivationText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
});
