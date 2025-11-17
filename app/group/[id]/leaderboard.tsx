import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trophy, TrendingUp, Clock, Flame } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  username: string;
  avatar_config: any;
  total_minutes: number;
  session_count: number;
  current_streak: number;
}

export default function GroupLeaderboardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');

  const fetchLeaderboard = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      const { data: members } = await supabase
        .from('study_group_members')
        .select('user_id')
        .eq('group_id', id as string);

      if (!members || members.length === 0) {
        setLeaderboard([]);
        return;
      }

      const memberIds = members.map(m => m.user_id);

      let query = supabase
        .from('study_sessions')
        .select('user_id, duration, session_date')
        .in('user_id', memberIds)
        .eq('status', 'completed');

      const now = new Date();
      if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('session_date', weekAgo.toISOString());
      } else if (timeFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte('session_date', monthAgo.toISOString());
      }

      const { data: sessions, error } = await query;

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      const userStats = new Map<string, { totalMinutes: number; sessionCount: number }>();
      
      sessions?.forEach(session => {
        const current = userStats.get(session.user_id) || { totalMinutes: 0, sessionCount: 0 };
        userStats.set(session.user_id, {
          totalMinutes: current.totalMinutes + (session.duration || 0),
          sessionCount: current.sessionCount + 1
        });
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_config')
        .in('id', memberIds);

      const leaderboardData: LeaderboardEntry[] = [];

      for (const profile of profiles || []) {
        const stats = userStats.get(profile.id) || { totalMinutes: 0, sessionCount: 0 };
        
        const { count: streakCount } = await supabase
          .from('study_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('status', 'completed')
          .gte('session_date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

        leaderboardData.push({
          user_id: profile.id,
          display_name: profile.display_name || 'Användare',
          username: profile.username || 'användare',
          avatar_config: profile.avatar_config,
          total_minutes: stats.totalMinutes,
          session_count: stats.sessionCount,
          current_streak: streakCount || 0
        });
      }

      leaderboardData.sort((a, b) => b.total_minutes - a.total_minutes);

      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Exception fetching leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, timeFilter]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const myRank = leaderboard.findIndex(entry => entry.user_id === user?.id) + 1;
  const myStats = leaderboard.find(entry => entry.user_id === user?.id);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === 'week' && { backgroundColor: theme.colors.primary },
            timeFilter !== 'week' && { backgroundColor: theme.colors.surface }
          ]}
          onPress={() => setTimeFilter('week')}
        >
          <Text style={[
            styles.filterText,
            { color: timeFilter === 'week' ? '#fff' : theme.colors.text }
          ]}>
            Vecka
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === 'month' && { backgroundColor: theme.colors.primary },
            timeFilter !== 'month' && { backgroundColor: theme.colors.surface }
          ]}
          onPress={() => setTimeFilter('month')}
        >
          <Text style={[
            styles.filterText,
            { color: timeFilter === 'month' ? '#fff' : theme.colors.text }
          ]}>
            Månad
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            timeFilter === 'all' && { backgroundColor: theme.colors.primary },
            timeFilter !== 'all' && { backgroundColor: theme.colors.surface }
          ]}
          onPress={() => setTimeFilter('all')}
        >
          <Text style={[
            styles.filterText,
            { color: timeFilter === 'all' ? '#fff' : theme.colors.text }
          ]}>
            Totalt
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
          }
        >
          {myStats && myRank > 0 && (
            <View style={[styles.myStatsCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.myStatsTitle, { color: theme.colors.text }]}>Din plats</Text>
              <View style={styles.myStatsContent}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{myRank}</Text>
                </View>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Clock size={16} color={theme.colors.primary} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {Math.floor(myStats.total_minutes / 60)}h {myStats.total_minutes % 60}m
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <TrendingUp size={16} color={theme.colors.success} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {myStats.session_count} sessioner
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Flame size={16} color="#f59e0b" />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {myStats.current_streak} streak
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {leaderboard.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Trophy size={64} color={theme.colors.textMuted} strokeWidth={1.5} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                Ingen statistik än
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                Börja studera för att synas på leaderboard!
              </Text>
            </View>
          ) : (
            leaderboard.map((entry, index) => {
              const isTop3 = index < 3;
              const isMe = entry.user_id === user?.id;

              return (
                <View
                  key={entry.user_id}
                  style={[
                    styles.leaderboardCard,
                    { backgroundColor: theme.colors.surface },
                    isMe && { borderWidth: 2, borderColor: theme.colors.primary }
                  ]}
                >
                  <View style={styles.rankSection}>
                    {isTop3 ? (
                      <LinearGradient
                        colors={
                          index === 0
                            ? ['#ffd700', '#ffed4e']
                            : index === 1
                            ? ['#c0c0c0', '#e8e8e8']
                            : ['#cd7f32', '#dda06a']
                        }
                        style={styles.medalBadge}
                      >
                        <Trophy size={20} color="#fff" strokeWidth={2.5} />
                      </LinearGradient>
                    ) : (
                      <View style={[styles.numberBadge, { backgroundColor: theme.colors.background }]}>
                        <Text style={[styles.rankNumber, { color: theme.colors.text }]}>
                          {index + 1}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                      {entry.display_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={[styles.displayName, { color: theme.colors.text }]}>
                      {entry.display_name}
                      {isMe && ' (Du)'}
                    </Text>
                    <Text style={[styles.username, { color: theme.colors.textMuted }]}>
                      @{entry.username}
                    </Text>
                  </View>

                  <View style={styles.statsSection}>
                    <View style={styles.miniStat}>
                      <Clock size={14} color={theme.colors.primary} />
                      <Text style={[styles.miniStatText, { color: theme.colors.text }]}>
                        {Math.floor(entry.total_minutes / 60)}h
                      </Text>
                    </View>
                    <View style={styles.miniStat}>
                      <TrendingUp size={14} color={theme.colors.success} />
                      <Text style={[styles.miniStatText, { color: theme.colors.text }]}>
                        {entry.session_count}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myStatsCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    gap: 16,
  },
  myStatsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  myStatsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rankBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  statsGrid: {
    flex: 1,
    gap: 8,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  rankSection: {
    width: 40,
    alignItems: 'center',
  },
  medalBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
  },
  username: {
    fontSize: 13,
    fontWeight: '500',
  },
  statsSection: {
    gap: 8,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniStatText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 64,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
  },
});
