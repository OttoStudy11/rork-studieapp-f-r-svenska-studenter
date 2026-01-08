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
import { useGamification } from '@/contexts/GamificationContext';
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
  Calendar,
  Star,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import { FadeInView, SlideInView } from '@/components/Animations';
import { LinearGradient } from 'expo-linear-gradient';
import { PremiumGate } from '@/components/PremiumGate';
import { LevelComparison } from '@/components/LevelProgress';
import { getLevelForXp } from '@/constants/gamification';



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
  totalXp: number;
  currentLevel: number;
  achievementCount: number;
  completedChallenges: number;
  longestStreak: number;
  joinedAt: string | null;
  courses: { id: string; name: string; code: string }[];
  studyTimeThisWeek: number;
  sessionsThisWeek: number;
  lastActive: string | null;
  totalPoints: number;
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
  const gamificationData = useGamification();
  const { totalXp = 0, currentLevel } = gamificationData || {};
  const [friend, setFriend] = useState<FriendData | null>(null);
  const [yourStats, setYourStats] = useState<{ studyTime: number; sessionCount: number; streak: number; courseCount: number; totalXp: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!friendId || !user) return;

    try {
      setErrorMessage(null);
      setIsLoading(true);
      console.log('Loading friend stats for:', friendId);

      // Try to use the RPC function first for comprehensive stats
      const { data: friendStats, error: rpcError } = await (supabase as any)
        .rpc('get_friend_stats', { p_friend_id: friendId });

      if (!rpcError && friendStats) {
        console.log('Got friend stats from RPC:', friendStats);
        const profile = friendStats.profile;
        const levelData = friendStats.level_data;
        const progress = friendStats.progress;
        const courses = friendStats.courses || [];
        const recentActivity = friendStats.recent_activity || {};

        const mappedCourses = courses.map((c: any) => ({
          id: c.id,
          name: c.name || 'Okänd kurs',
          code: c.course_code || '',
        }));

        setFriend({
          id: profile?.id || friendId,
          username: profile?.username || 'unknown',
          display_name: profile?.display_name || 'Okänd användare',
          program: profile?.program || '',
          level: (profile?.level || 'gymnasie') as 'gymnasie' | 'högskola',
          gymnasium_grade: profile?.gymnasium_grade || null,
          avatar: (() => {
            if (!profile?.avatar_url) return undefined;
            try {
              return JSON.parse(profile.avatar_url) as AvatarConfig;
            } catch {
              return undefined;
            }
          })(),
          studyTime: progress?.total_study_time || 0,
          sessionCount: friendStats.session_count || 0,
          streak: progress?.current_streak || 0,
          courseCount: courses.length,
          totalXp: levelData?.total_xp || progress?.total_xp || 0,
          currentLevel: levelData?.current_level || 1,
          achievementCount: friendStats.achievement_count || 0,
          completedChallenges: 0,
          longestStreak: progress?.longest_streak || progress?.current_streak || 0,
          joinedAt: profile?.created_at || null,
          courses: mappedCourses,
          studyTimeThisWeek: recentActivity?.study_time_this_week || 0,
          sessionsThisWeek: recentActivity?.sessions_this_week || 0,
          lastActive: recentActivity?.last_session || null,
          totalPoints: progress?.total_points || 0,
        });
      } else {
        // Fallback to individual queries if RPC fails
        console.log('RPC failed, falling back to individual queries:', rpcError);
        
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

        // Load friend courses count
        const { data: friendCourses } = await supabase
          .from('user_courses')
          .select('course_id')
          .eq('user_id', friendId)
          .eq('is_active', true);

        // Load friend sessions from pomodoro_sessions
        const { data: friendSessions } = await supabase
          .from('pomodoro_sessions')
          .select('id, duration, start_time, end_time')
          .eq('user_id', friendId);

        // Load sessions from this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { data: weekSessions } = await supabase
          .from('pomodoro_sessions')
          .select('id, duration')
          .eq('user_id', friendId)
          .gte('start_time', weekAgo.toISOString());

        // Load friend's XP/level data
        const { data: friendLevelData } = await (supabase as any)
          .from('user_levels')
          .select('total_xp, current_level')
          .eq('user_id', friendId)
          .maybeSingle();

        // Load friend's achievements count
        const { data: friendAchievements } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', friendId)
          .not('unlocked_at', 'is', null);

        // Load friend's course details
        const { data: friendCourseDetails } = await supabase
          .from('user_courses')
          .select('course_id, courses(id, name, course_code)')
          .eq('user_id', friendId)
          .eq('is_active', true);

        const friendStudyTimeMinutes = await fetchTotalStudyMinutesForUser(friendId);

        const mappedCourses = (friendCourseDetails || []).map((fc: any) => ({
          id: fc.course_id,
          name: fc.courses?.name || 'Okänd kurs',
          code: fc.courses?.course_code || '',
        }));

        // Calculate study time this week
        const studyTimeThisWeek = (weekSessions || []).reduce(
          (sum: number, s: any) => sum + (s.duration || 0),
          0
        );

        // Get last active time
        const sortedSessions = [...(friendSessions || [])].sort(
          (a, b) => new Date(b.end_time || 0).getTime() - new Date(a.end_time || 0).getTime()
        );
        const lastSession = sortedSessions[0];

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
          studyTime: friendStudyTimeMinutes,
          sessionCount: friendSessions?.length || 0,
          streak: friendProgress?.current_streak || 0,
          courseCount: friendCourses?.length || 0,
          totalXp: friendLevelData?.total_xp || 0,
          currentLevel: friendLevelData?.current_level || 1,
          achievementCount: friendAchievements?.length || 0,
          completedChallenges: 0,
          longestStreak: friendProgress?.longest_streak || friendProgress?.current_streak || 0,
          joinedAt: friendProfile.created_at || null,
          courses: mappedCourses,
          studyTimeThisWeek,
          sessionsThisWeek: weekSessions?.length || 0,
          lastActive: lastSession?.end_time || null,
          totalPoints: friendProgress?.total_points || 0,
        });
      }

      // Load your stats
      const { data: yourProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: yourCourses } = await supabase
        .from('user_courses')
        .select('course_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const { data: yourSessions } = await supabase
        .from('pomodoro_sessions')
        .select('id')
        .eq('user_id', user.id);

      const yourStudyTimeMinutes = await fetchTotalStudyMinutesForUser(user.id);

      setYourStats({
        studyTime: yourStudyTimeMinutes,
        sessionCount: yourSessions?.length || 0,
        streak: yourProgress?.current_streak || 0,
        courseCount: yourCourses?.length || 0,
        totalXp: totalXp ?? 0,
      });
    } catch (error: any) {
      console.error('Error loading friend stats:', error);
      setErrorMessage(error?.message || 'Kunde inte ladda statistik');
      setFriend(null);
      setYourStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [friendId, user, totalXp]);

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

  const formatLastActive = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just nu';
    if (diffHours < 24) return `${diffHours}h sedan`;
    if (diffDays === 1) return 'Igår';
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
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

            {/* Level Comparison Card */}
        {friend && yourStats && currentLevel && (
          <SlideInView direction="up" delay={100}>
            <View style={styles.levelComparisonSection}>
              <LevelComparison
                yourLevel={currentLevel}
                yourXp={totalXp ?? 0}
                friendLevel={getLevelForXp(friend.totalXp)}
                friendXp={friend.totalXp}
                friendName={friend.display_name}
              />
            </View>
          </SlideInView>
        )}

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

        {/* Friend Profile Details */}
        <SlideInView direction="up" delay={500}>
          <View style={styles.profileSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{friend.display_name}s profil</Text>
            
            {/* Level Badge */}
            <View style={[styles.levelBadgeCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.levelBadgeContent}>
                <View style={[styles.levelCircle, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.levelNumber}>{friend.currentLevel}</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelTitle, { color: theme.colors.text }]}>Nivå {friend.currentLevel}</Text>
                  <Text style={[styles.levelXp, { color: theme.colors.textSecondary }]}>
                    {friend.totalXp.toLocaleString()} XP totalt
                  </Text>
                </View>
                <View style={[styles.tierBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Star size={14} color={theme.colors.warning} />
                </View>
              </View>
            </View>
            
            <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.profileStatsGrid}>
                <View style={styles.profileStatItem}>
                  <View style={[styles.profileStatIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Zap size={18} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.profileStatValue, { color: theme.colors.text }]}>
                    {friend.totalXp.toLocaleString()}
                  </Text>
                  <Text style={[styles.profileStatLabel, { color: theme.colors.textSecondary }]}>Total XP</Text>
                </View>
                
                <View style={styles.profileStatItem}>
                  <View style={[styles.profileStatIcon, { backgroundColor: theme.colors.success + '15' }]}>
                    <Trophy size={18} color={theme.colors.success} />
                  </View>
                  <Text style={[styles.profileStatValue, { color: theme.colors.text }]}>
                    {friend.achievementCount}
                  </Text>
                  <Text style={[styles.profileStatLabel, { color: theme.colors.textSecondary }]}>Prestationer</Text>
                </View>
                
                <View style={styles.profileStatItem}>
                  <View style={[styles.profileStatIcon, { backgroundColor: theme.colors.warning + '15' }]}>
                    <Flame size={18} color={theme.colors.warning} />
                  </View>
                  <Text style={[styles.profileStatValue, { color: theme.colors.text }]}>
                    {friend.longestStreak}
                  </Text>
                  <Text style={[styles.profileStatLabel, { color: theme.colors.textSecondary }]}>Längsta streak</Text>
                </View>
                
                <View style={styles.profileStatItem}>
                  <View style={[styles.profileStatIcon, { backgroundColor: theme.colors.secondary + '15' }]}>
                    <Clock size={18} color={theme.colors.secondary} />
                  </View>
                  <Text style={[styles.profileStatValue, { color: theme.colors.text }]}>
                    {formatTime(friend.studyTime)}
                  </Text>
                  <Text style={[styles.profileStatLabel, { color: theme.colors.textSecondary }]}>Pluggat totalt</Text>
                </View>
              </View>
            </View>

            {/* Weekly Activity */}
            <View style={[styles.weeklyCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.weeklyHeader}>
                <TrendingUp size={18} color={theme.colors.primary} />
                <Text style={[styles.weeklyTitle, { color: theme.colors.text }]}>Denna vecka</Text>
              </View>
              <View style={styles.weeklyStats}>
                <View style={styles.weeklyStat}>
                  <Text style={[styles.weeklyValue, { color: theme.colors.text }]}>
                    {formatTime(friend.studyTimeThisWeek || 0)}
                  </Text>
                  <Text style={[styles.weeklyLabel, { color: theme.colors.textSecondary }]}>Studietid</Text>
                </View>
                <View style={[styles.weeklyDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.weeklyStat}>
                  <Text style={[styles.weeklyValue, { color: theme.colors.text }]}>
                    {friend.sessionsThisWeek || 0}
                  </Text>
                  <Text style={[styles.weeklyLabel, { color: theme.colors.textSecondary }]}>Sessioner</Text>
                </View>
                <View style={[styles.weeklyDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.weeklyStat}>
                  <Text style={[styles.weeklyValue, { color: theme.colors.text }]}>
                    {friend.streak || 0}
                  </Text>
                  <Text style={[styles.weeklyLabel, { color: theme.colors.textSecondary }]}>Streak</Text>
                </View>
              </View>
            </View>

            {/* Additional Stats */}
            <View style={[styles.additionalStatsCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.additionalStatRow}>
                <View style={styles.additionalStatLeft}>
                  <BookOpen size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.additionalStatLabel, { color: theme.colors.textSecondary }]}>Totalt sessioner</Text>
                </View>
                <Text style={[styles.additionalStatValue, { color: theme.colors.text }]}>
                  {friend.sessionCount}
                </Text>
              </View>
              <View style={[styles.additionalStatDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.additionalStatRow}>
                <View style={styles.additionalStatLeft}>
                  <Award size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.additionalStatLabel, { color: theme.colors.textSecondary }]}>Poäng</Text>
                </View>
                <Text style={[styles.additionalStatValue, { color: theme.colors.text }]}>
                  {(friend.totalPoints || 0).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.additionalStatDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.additionalStatRow}>
                <View style={styles.additionalStatLeft}>
                  <Calendar size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.additionalStatLabel, { color: theme.colors.textSecondary }]}>Medlem sedan</Text>
                </View>
                <Text style={[styles.additionalStatValue, { color: theme.colors.text }]}>
                  {friend.joinedAt ? new Date(friend.joinedAt).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' }) : '-'}
                </Text>
              </View>
              {friend.lastActive && (
                <>
                  <View style={[styles.additionalStatDivider, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.additionalStatRow}>
                    <View style={styles.additionalStatLeft}>
                      <Clock size={16} color={theme.colors.textSecondary} />
                      <Text style={[styles.additionalStatLabel, { color: theme.colors.textSecondary }]}>Senast aktiv</Text>
                    </View>
                    <Text style={[styles.additionalStatValue, { color: theme.colors.text }]}>
                      {formatLastActive(friend.lastActive)}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </SlideInView>

        {/* Friend's Courses */}
        {friend.courses && friend.courses.length > 0 && (
          <SlideInView direction="up" delay={550}>
            <View style={styles.coursesSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aktiva kurser</Text>
              <View style={[styles.coursesCard, { backgroundColor: theme.colors.card }]}>
                {friend.courses.slice(0, 5).map((course, index) => (
                  <View
                    key={course.id}
                    style={[
                      styles.courseItem,
                      index < friend.courses.length - 1 && index < 4 && {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.courseIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                      <BookOpen size={16} color={theme.colors.primary} />
                    </View>
                    <View style={styles.courseInfo}>
                      <Text style={[styles.courseName, { color: theme.colors.text }]} numberOfLines={1}>
                        {course.name}
                      </Text>
                      {course.code ? (
                        <Text style={[styles.courseCode, { color: theme.colors.textSecondary }]}>
                          {course.code}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
                {friend.courses.length > 5 && (
                  <Text style={[styles.moreCoursesText, { color: theme.colors.textSecondary }]}>
                    +{friend.courses.length - 5} fler kurser
                  </Text>
                )}
              </View>
            </View>
          </SlideInView>
        )}

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
  levelComparisonSection: {
    marginBottom: 20,
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
  profileSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  profileStatItem: {
    width: '45%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  profileStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  coursesSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  coursesCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  courseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  courseCode: {
    fontSize: 12,
  },
  moreCoursesText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingTop: 12,
  },
  levelBadgeCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  levelBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  levelXp: {
    fontSize: 14,
  },
  tierBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weeklyCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyStat: {
    flex: 1,
    alignItems: 'center',
  },
  weeklyValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  weeklyLabel: {
    fontSize: 12,
  },
  weeklyDivider: {
    width: 1,
    height: 40,
  },
  additionalStatsCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  additionalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  additionalStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  additionalStatLabel: {
    fontSize: 14,
  },
  additionalStatValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  additionalStatDivider: {
    height: 1,
  },
});
