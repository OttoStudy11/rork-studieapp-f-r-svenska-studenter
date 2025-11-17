import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MessageCircle,
  Calendar,
  TrendingUp,
  Users,
  Settings,
  Lock,
  Globe
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myRole, setMyRole] = useState<string | null>(null);

  const fetchGroupData = useCallback(async () => {
    if (!id || !user) return;

    try {
      setIsLoading(true);

      const { data: groupData, error: groupError } = await supabase
        .from('study_groups')
        .select(`
          *,
          courses (name),
          profiles!study_groups_created_by_fkey (display_name, username)
        `)
        .eq('id', id as string)
        .single();

      if (groupError) {
        console.error('Error fetching group:', groupError);
        return;
      }

      const { count } = await supabase
        .from('study_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', id as string);

      setGroup({
        ...groupData,
        course: groupData.courses,
        creator: groupData.profiles,
        member_count: count || 0
      });

      const { data: memberData } = await supabase
        .from('study_group_members')
        .select(`
          *,
          profiles (display_name, username, avatar_config)
        `)
        .eq('group_id', id as string)
        .order('joined_at', { ascending: true });

      if (memberData) {
        setMembers(memberData.map(m => ({
          ...m,
          profile: m.profiles
        })));

        const myMembership = memberData.find(m => m.user_id === user.id);
        setMyRole(myMembership?.role || null);
      }

      const { data: sessionsData } = await supabase
        .from('study_group_sessions')
        .select('*')
        .eq('group_id', id as string)
        .gte('scheduled_start', new Date().toISOString())
        .order('scheduled_start', { ascending: true })
        .limit(5);

      if (sessionsData) {
        const sessionsWithParticipants = await Promise.all(
          sessionsData.map(async (session) => {
            const { count } = await supabase
              .from('study_group_session_participants')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id);

            return {
              ...session,
              participant_count: count || 0
            };
          })
        );

        setUpcomingSessions(sessionsWithParticipants);
      }
    } catch (err) {
      console.error('Exception fetching group data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGroupData();
    setRefreshing(false);
  };

  if (isLoading || !group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {group.name}
        </Text>
        {(myRole === 'owner' || myRole === 'admin') && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push(`/group/${id}/settings` as any)}
          >
            <Settings size={22} color={theme.colors.text} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
      >
        <LinearGradient
          colors={isDark ? ['#1a1a2e', '#16213e'] : ['#e3f2fd', '#bbdefb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroHeader}>
              <Text style={[styles.heroTitle, { color: isDark ? '#fff' : theme.colors.text }]}>
                {group.name}
              </Text>
              {group.is_private ? (
                <Lock size={20} color={isDark ? '#fff' : theme.colors.textMuted} />
              ) : (
                <Globe size={20} color={isDark ? '#fff' : theme.colors.textMuted} />
              )}
            </View>

            {group.description && (
              <Text style={[styles.heroDescription, { color: isDark ? '#e0e0e0' : theme.colors.textMuted }]}>
                {group.description}
              </Text>
            )}

            {group.course && (
              <View style={[styles.courseTag, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.courseText, { color: theme.colors.primary }]}>
                  {group.course.name}
                </Text>
              </View>
            )}

            <View style={styles.heroStats}>
              <View style={styles.statItem}>
                <Users size={16} color={isDark ? '#fff' : theme.colors.text} strokeWidth={2} />
                <Text style={[styles.statText, { color: isDark ? '#fff' : theme.colors.text }]}>
                  {group.member_count} medlemmar
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(`/group/${id}/chat` as any)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionIcon}
            >
              <MessageCircle size={24} color="#fff" strokeWidth={2} />
            </LinearGradient>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Chatt</Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textMuted }]}>
              Gruppkonversationer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(`/group/${id}/sessions` as any)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionIcon}
            >
              <Calendar size={24} color="#fff" strokeWidth={2} />
            </LinearGradient>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Sessioner</Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textMuted }]}>
              {upcomingSessions.length} kommande
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(`/group/${id}/leaderboard` as any)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionIcon}
            >
              <TrendingUp size={24} color="#fff" strokeWidth={2} />
            </LinearGradient>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Leaderboard</Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textMuted }]}>
              Gruppstatistik
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(`/group/${id}/members` as any)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#43e97b', '#38f9d7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionIcon}
            >
              <Users size={24} color="#fff" strokeWidth={2} />
            </LinearGradient>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Medlemmar</Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textMuted }]}>
              {group.member_count} aktiva
            </Text>
          </TouchableOpacity>
        </View>

        {upcomingSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Kommande sessioner
            </Text>
            {upcomingSessions.map((session) => (
              <View key={session.id} style={[styles.sessionCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.sessionHeader}>
                  <Text style={[styles.sessionTitle, { color: theme.colors.text }]}>{session.title}</Text>
                  <Text style={[styles.sessionDate, { color: theme.colors.primary }]}>
                    {new Date(session.scheduled_start).toLocaleDateString('sv-SE', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                {session.description && (
                  <Text style={[styles.sessionDescription, { color: theme.colors.textMuted }]}>
                    {session.description}
                  </Text>
                )}
                <View style={styles.sessionMeta}>
                  <Users size={14} color={theme.colors.textMuted} />
                  <Text style={[styles.sessionMetaText, { color: theme.colors.textMuted }]}>
                    {session.participant_count} deltagare
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Medlemmar</Text>
          {members.slice(0, 5).map((member) => (
            <View key={member.id} style={[styles.memberCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.memberAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.memberAvatarText, { color: theme.colors.primary }]}>
                  {member.profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: theme.colors.text }]}>
                  {member.profile?.display_name || 'Användare'}
                </Text>
                <Text style={[styles.memberUsername, { color: theme.colors.textMuted }]}>
                  @{member.profile?.username || 'användare'}
                </Text>
              </View>
              <View style={[styles.roleTag, { backgroundColor: getRoleColor(member.role, theme) + '20' }]}>
                <Text style={[styles.roleText, { color: getRoleColor(member.role, theme) }]}>
                  {getRoleLabel(member.role)}
                </Text>
              </View>
            </View>
          ))}
          {members.length > 5 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => router.push(`/group/${id}/members` as any)}
            >
              <Text style={[styles.showMoreText, { color: theme.colors.primary }]}>
                Visa alla {members.length} medlemmar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'owner':
      return 'Ägare';
    case 'admin':
      return 'Admin';
    default:
      return 'Medlem';
  }
}

function getRoleColor(role: string, theme: any): string {
  switch (role) {
    case 'owner':
      return '#f59e0b';
    case 'admin':
      return theme.colors.primary;
    default:
      return theme.colors.textMuted;
  }
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
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  settingsButton: {
    padding: 4,
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
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  heroContent: {
    gap: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
  },
  heroDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  courseTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  courseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  heroStats: {
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    width: (screenWidth - 56) / 2,
    padding: 20,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  sessionDate: {
    fontSize: 13,
    fontWeight: '600',
  },
  sessionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionMetaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
  },
  memberUsername: {
    fontSize: 13,
    fontWeight: '500',
  },
  roleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  showMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
