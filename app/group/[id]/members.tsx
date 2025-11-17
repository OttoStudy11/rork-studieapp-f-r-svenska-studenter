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
import { ArrowLeft, Users, Crown, Shield, User as UserIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Member {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  profile?: {
    display_name: string;
    username: string;
    avatar_config: any;
  };
}

export default function GroupMembersScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myRole, setMyRole] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('study_group_members')
        .select(`
          *,
          profiles (display_name, username, avatar_config)
        `)
        .eq('group_id', id as string)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching members:', error);
        return;
      }

      const membersData = data.map(m => ({
        ...m,
        profile: m.profiles
      }));

      setMembers(membersData);

      const myMembership = membersData.find(m => m.user_id === user?.id);
      setMyRole(myMembership?.role || null);
    } catch (err) {
      console.error('Exception fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown size={18} color="#f59e0b" strokeWidth={2.5} />;
      case 'admin':
        return <Shield size={18} color={theme.colors.primary} strokeWidth={2.5} />;
      default:
        return <UserIcon size={18} color={theme.colors.textMuted} strokeWidth={2.5} />;
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'owner':
        return 'Ägare';
      case 'admin':
        return 'Admin';
      default:
        return 'Medlem';
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'owner':
        return '#f59e0b';
      case 'admin':
        return theme.colors.primary;
      default:
        return theme.colors.textMuted;
    }
  };

  const owners = members.filter(m => m.role === 'owner');
  const admins = members.filter(m => m.role === 'admin');
  const regularMembers = members.filter(m => m.role === 'member');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Medlemmar</Text>
        <View style={styles.headerBadge}>
          <Users size={16} color={theme.colors.primary} strokeWidth={2} />
          <Text style={[styles.headerBadgeText, { color: theme.colors.primary }]}>
            {members.length}
          </Text>
        </View>
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
          {owners.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ägare</Text>
              {owners.map((member) => (
                <View key={member.id} style={[styles.memberCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={[styles.avatar, { backgroundColor: '#f59e0b20' }]}>
                    <Text style={[styles.avatarText, { color: '#f59e0b' }]}>
                      {member.profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberHeader}>
                      <Text style={[styles.memberName, { color: theme.colors.text }]}>
                        {member.profile?.display_name || 'Användare'}
                        {member.user_id === user?.id && ' (Du)'}
                      </Text>
                      {getRoleIcon(member.role)}
                    </View>
                    <Text style={[styles.memberUsername, { color: theme.colors.textMuted }]}>
                      @{member.profile?.username || 'användare'}
                    </Text>
                    <Text style={[styles.memberDate, { color: theme.colors.textMuted }]}>
                      Gick med {new Date(member.joined_at).toLocaleDateString('sv-SE', { 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={[styles.roleTag, { backgroundColor: getRoleColor(member.role) + '20' }]}>
                    <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                      {getRoleLabel(member.role)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {admins.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Admins</Text>
              {admins.map((member) => (
                <View key={member.id} style={[styles.memberCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                      {member.profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberHeader}>
                      <Text style={[styles.memberName, { color: theme.colors.text }]}>
                        {member.profile?.display_name || 'Användare'}
                        {member.user_id === user?.id && ' (Du)'}
                      </Text>
                      {getRoleIcon(member.role)}
                    </View>
                    <Text style={[styles.memberUsername, { color: theme.colors.textMuted }]}>
                      @{member.profile?.username || 'användare'}
                    </Text>
                    <Text style={[styles.memberDate, { color: theme.colors.textMuted }]}>
                      Gick med {new Date(member.joined_at).toLocaleDateString('sv-SE', { 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={[styles.roleTag, { backgroundColor: getRoleColor(member.role) + '20' }]}>
                    <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                      {getRoleLabel(member.role)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {regularMembers.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Medlemmar</Text>
              {regularMembers.map((member) => (
                <View key={member.id} style={[styles.memberCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.textMuted + '20' }]}>
                    <Text style={[styles.avatarText, { color: theme.colors.textMuted }]}>
                      {member.profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberHeader}>
                      <Text style={[styles.memberName, { color: theme.colors.text }]}>
                        {member.profile?.display_name || 'Användare'}
                        {member.user_id === user?.id && ' (Du)'}
                      </Text>
                      {getRoleIcon(member.role)}
                    </View>
                    <Text style={[styles.memberUsername, { color: theme.colors.textMuted }]}>
                      @{member.profile?.username || 'användare'}
                    </Text>
                    <Text style={[styles.memberDate, { color: theme.colors.textMuted }]}>
                      Gick med {new Date(member.joined_at).toLocaleDateString('sv-SE', { 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
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
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBadgeText: {
    fontSize: 16,
    fontWeight: '800',
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 17,
    fontWeight: '700',
  },
  memberUsername: {
    fontSize: 14,
    fontWeight: '500',
  },
  memberDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  roleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
