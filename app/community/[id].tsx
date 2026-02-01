import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCommunity, CommunityMember } from '@/contexts/CommunityContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/Avatar';
import {
  ChevronLeft,
  Users,
  Crown,
  MessageCircle,
  Trophy,
  Send,
  MoreVertical,
  UserMinus,
  LogOut,
  Clock,
} from 'lucide-react-native';
import type { AvatarConfig } from '@/constants/avatar-config';

interface CommunityMessage {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  user?: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

interface MemberWithStats extends CommunityMember {
  totalStudyTime?: number;
  sessionCount?: number;
}

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showError, showSuccess } = useToast();
  const {
    getCommunityDetails,
    leaveCommunity,
    removeMember,
    deleteCommunity,
    handleRequest,
  } = useCommunity();

  const [community, setCommunity] = useState<any>(null);
  const [members, setMembers] = useState<MemberWithStats[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'members' | 'leaderboard'>('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadCommunityData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const { community: comm, members: mems, requests: reqs, error } = await getCommunityDetails(id);

      if (error) {
        showError(error);
        router.back();
        return;
      }

      setCommunity(comm);
      setRequests(reqs || []);

      if (mems) {
        const memberIds = mems.map((m) => m.userId);
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('user_id, total_study_time')
          .in('user_id', memberIds);

        const { data: sessionData } = await supabase
          .from('pomodoro_sessions')
          .select('user_id')
          .in('user_id', memberIds);

        const sessionCountMap: Record<string, number> = {};
        sessionData?.forEach((s: any) => {
          sessionCountMap[s.user_id] = (sessionCountMap[s.user_id] || 0) + 1;
        });

        const progressMap = new Map(
          progressData?.map((p: any) => [p.user_id, p.total_study_time]) || []
        );

        const membersWithStats: MemberWithStats[] = mems.map((m) => ({
          ...m,
          totalStudyTime: progressMap.get(m.userId) || 0,
          sessionCount: sessionCountMap[m.userId] || 0,
        }));

        setMembers(membersWithStats);
      }
    } catch (err: any) {
      console.error('[Community] Error loading:', err);
      showError('Kunde inte ladda community');
    } finally {
      setIsLoading(false);
    }
  }, [id, getCommunityDetails, showError, router]);

  const loadMessages = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await (supabase as any)
        .from('community_messages')
        .select('*')
        .eq('community_id', id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[Community] Error loading messages:', error);
        return;
      }

      const userIds: string[] = [];
      if (data && data.length > 0) {
        const ids = data.map((m: any) => m.user_id).filter((id: any): id is string => typeof id === 'string');
        const uniqueIds = Array.from(new Set(ids)) as string[];
        for (const id of uniqueIds) {
          userIds.push(id);
        }
      }
      
      if (userIds.length === 0) {
        setMessages([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const mapped: CommunityMessage[] = (data || []).map((m: any) => {
        const profile = profileMap.get(m.user_id);
        return {
          id: m.id,
          userId: m.user_id,
          message: m.message,
          createdAt: m.created_at,
          user: profile
            ? {
                username: profile.username,
                displayName: profile.display_name,
                avatarUrl: profile.avatar_url,
              }
            : undefined,
        };
      });

      setMessages(mapped.reverse());
    } catch (error) {
      console.error('[Community] Error loading messages:', error);
    }
  }, [id]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user || !id) return;

    setIsSending(true);
    try {
      const { error } = await (supabase as any).from('community_messages').insert({
        community_id: id,
        user_id: user.id,
        message: messageInput.trim(),
      });

      if (error) {
        showError('Kunde inte skicka meddelande');
        return;
      }

      setMessageInput('');
      await loadMessages();
    } catch (error) {
      console.error('[Community] Error sending message:', error);
      showError('Kunde inte skicka meddelande');
    } finally {
      setIsSending(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!id) return;

    Alert.alert(
      'Lämna community',
      'Är du säker på att du vill lämna denna community?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Lämna',
          style: 'destructive',
          onPress: async () => {
            const { error } = await leaveCommunity(id);
            if (error) {
              showError(error);
              return;
            }
            showSuccess('Du har lämnat communityn');
            router.back();
          },
        },
      ]
    );
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;

    Alert.alert('Ta bort medlem', 'Är du säker?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Ta bort',
        style: 'destructive',
        onPress: async () => {
          const { error } = await removeMember(id, memberId);
          if (error) {
            showError(error);
            return;
          }
          showSuccess('Medlem borttagen');
          await loadCommunityData();
        },
      },
    ]);
  };

  const handleDeleteCommunity = async () => {
    if (!id) return;

    Alert.alert(
      'Ta bort community',
      'Detta går inte att ångra. All data kommer raderas.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteCommunity(id);
            if (error) {
              showError(error);
              return;
            }
            showSuccess('Community raderad');
            router.back();
          },
        },
      ]
    );
  };

  const handleAcceptRequest = async (requestId: string) => {
    const { error } = await handleRequest(requestId, true);
    if (error) {
      showError(error);
      return;
    }
    showSuccess('Ansökan accepterad! 🎉');
    await loadCommunityData();
  };

  const handleRejectRequest = async (requestId: string) => {
    const { error } = await handleRequest(requestId, false);
    if (error) {
      showError(error);
      return;
    }
    showSuccess('Ansökan avvisad');
    await loadCommunityData();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadCommunityData(), loadMessages()]);
    setRefreshing(false);
  }, [loadCommunityData, loadMessages]);

  useEffect(() => {
    loadCommunityData();
    loadMessages();
  }, [loadCommunityData, loadMessages]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`community:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `community_id=eq.${id}`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, loadMessages]);

  const safeParseAvatar = (raw: string | null | undefined): AvatarConfig | undefined => {
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as AvatarConfig;
    } catch {
      return undefined;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const sortedLeaderboard = [...members].sort(
    (a, b) => (b.totalStudyTime || 0) - (a.totalStudyTime || 0)
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!community) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
          Community hittades inte
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {community.name}
          </Text>
          <View style={styles.headerMeta}>
            <Users size={12} color={theme.colors.textMuted} />
            <Text style={[styles.headerMetaText, { color: theme.colors.textMuted }]}>
              {community.memberCount} medlemmar
            </Text>
          </View>
        </View>
        {community.isAdmin && (
          <TouchableOpacity onPress={handleDeleteCommunity} style={styles.headerButton}>
            <MoreVertical size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {community.isAdmin && requests.length > 0 && (
        <View style={[styles.requestsBanner, { backgroundColor: theme.colors.warning + '20' }]}>
          <Text style={[styles.requestsText, { color: theme.colors.warning }]}>
            {requests.length} väntande ansökan(ar)
          </Text>
          <TouchableOpacity onPress={() => setActiveTab('members')}>
            <Text style={[styles.viewRequestsText, { color: theme.colors.warning }]}>Visa</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.colors.card },
            activeTab === 'chat' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('chat')}
        >
          <MessageCircle size={18} color={activeTab === 'chat' ? 'white' : theme.colors.textSecondary} />
          <Text
            style={[
              styles.tabText,
              { color: theme.colors.textSecondary },
              activeTab === 'chat' && { color: 'white', fontWeight: '600' },
            ]}
          >
            Chatt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.colors.card },
            activeTab === 'members' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('members')}
        >
          <Users size={18} color={activeTab === 'members' ? 'white' : theme.colors.textSecondary} />
          <Text
            style={[
              styles.tabText,
              { color: theme.colors.textSecondary },
              activeTab === 'members' && { color: 'white', fontWeight: '600' },
            ]}
          >
            Medlemmar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: theme.colors.card },
            activeTab === 'leaderboard' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Trophy size={18} color={activeTab === 'leaderboard' ? 'white' : theme.colors.textSecondary} />
          <Text
            style={[
              styles.tabText,
              { color: theme.colors.textSecondary },
              activeTab === 'leaderboard' && { color: 'white', fontWeight: '600' },
            ]}
          >
            Topplista
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' && (
        <View style={styles.chatContainer}>
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
            }
          >
            {messages.length === 0 ? (
              <View style={styles.emptyChat}>
                <MessageCircle size={48} color={theme.colors.textMuted} />
                <Text style={[styles.emptyChatText, { color: theme.colors.textSecondary }]}>
                  Inga meddelanden än. Starta konversationen!
                </Text>
              </View>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.userId === user?.id;
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageRow,
                      isOwnMessage && styles.messageRowOwn,
                    ]}
                  >
                    {!isOwnMessage && (
                      <View style={styles.messageAvatar}>
                        {msg.user?.avatarUrl && safeParseAvatar(msg.user.avatarUrl) ? (
                          <Avatar config={safeParseAvatar(msg.user.avatarUrl)!} size={32} />
                        ) : (
                          <View style={[styles.messageAvatarFallback, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Text style={[styles.messageAvatarText, { color: theme.colors.primary }]}>
                              {msg.user?.displayName?.[0]?.toUpperCase() || '?'}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        { backgroundColor: theme.colors.card },
                        isOwnMessage && { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      {!isOwnMessage && (
                        <Text style={[styles.messageSender, { color: theme.colors.primary }]}>
                          {msg.user?.displayName || 'Okänd'}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.messageText,
                          { color: theme.colors.text },
                          isOwnMessage && { color: 'white' },
                        ]}
                      >
                        {msg.message}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          { color: theme.colors.textMuted },
                          isOwnMessage && { color: 'rgba(255,255,255,0.7)' },
                        ]}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString('sv-SE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={[styles.messageInputContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
            <TextInput
              style={[styles.messageInput, { color: theme.colors.text }]}
              placeholder="Skriv ett meddelande..."
              placeholderTextColor={theme.colors.textMuted}
              value={messageInput}
              onChangeText={setMessageInput}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: messageInput.trim() ? theme.colors.primary : theme.colors.border },
              ]}
              onPress={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Send size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'members' && (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentPadding}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        >
          {community.isAdmin && requests.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Ansökningar ({requests.length})
              </Text>
              {requests.map((req) => (
                <View key={req.id} style={[styles.requestCard, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.requestInfo}>
                    {req.user?.avatarUrl && safeParseAvatar(req.user.avatarUrl) ? (
                      <Avatar config={safeParseAvatar(req.user.avatarUrl)!} size={48} />
                    ) : (
                      <View style={[styles.memberAvatarFallback, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Text style={[styles.memberAvatarText, { color: theme.colors.primary }]}>
                          {req.user?.displayName?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.requestDetails}>
                      <Text style={[styles.memberName, { color: theme.colors.text }]}>
                        {req.user?.displayName || 'Okänd'}
                      </Text>
                      <Text style={[styles.memberUsername, { color: theme.colors.textSecondary }]}>
                        @{req.user?.username || 'okänd'}
                      </Text>
                      {req.message && (
                        <Text style={[styles.requestMessage, { color: theme.colors.textSecondary }]}>
                          &ldquo;{req.message}&rdquo;
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.rejectBtn, { borderColor: theme.colors.border }]}
                      onPress={() => handleRejectRequest(req.id)}
                    >
                      <Text style={[styles.rejectBtnText, { color: theme.colors.textSecondary }]}>
                        Avvisa
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.acceptBtn, { backgroundColor: theme.colors.primary }]}
                      onPress={() => handleAcceptRequest(req.id)}
                    >
                      <Text style={styles.acceptBtnText}>Godkänn</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Medlemmar ({members.length})
            </Text>
            {members.map((member) => (
              <View key={member.id} style={[styles.memberCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.memberLeft}>
                  {member.user?.avatarUrl && safeParseAvatar(member.user.avatarUrl) ? (
                    <Avatar config={safeParseAvatar(member.user.avatarUrl)!} size={48} />
                  ) : (
                    <View style={[styles.memberAvatarFallback, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={[styles.memberAvatarText, { color: theme.colors.primary }]}>
                        {member.user?.displayName?.[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={[styles.memberName, { color: theme.colors.text }]}>
                        {member.user?.displayName || 'Okänd'}
                      </Text>
                      {member.role === 'admin' && (
                        <Crown size={14} color={theme.colors.warning} />
                      )}
                    </View>
                    <Text style={[styles.memberUsername, { color: theme.colors.textSecondary }]}>
                      @{member.user?.username || 'okänd'}
                    </Text>
                  </View>
                </View>
                {community.isAdmin && member.userId !== user?.id && (
                  <TouchableOpacity
                    style={styles.memberActionBtn}
                    onPress={() => handleRemoveMember(member.userId)}
                  >
                    <UserMinus size={18} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {!community.isAdmin && (
            <TouchableOpacity
              style={[styles.leaveButton, { backgroundColor: theme.colors.error + '15' }]}
              onPress={handleLeaveCommunity}
            >
              <LogOut size={20} color={theme.colors.error} />
              <Text style={[styles.leaveButtonText, { color: theme.colors.error }]}>
                Lämna community
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {activeTab === 'leaderboard' && (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentPadding}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Topplista - Studietid
            </Text>
            {sortedLeaderboard.length === 0 ? (
              <View style={styles.emptyLeaderboard}>
                <Trophy size={48} color={theme.colors.textMuted} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Ingen data än
                </Text>
              </View>
            ) : (
              sortedLeaderboard.map((member, index) => {
                const isCurrentUser = member.userId === user?.id;
                return (
                  <View
                    key={member.id}
                    style={[
                      styles.leaderboardCard,
                      { backgroundColor: theme.colors.card },
                      isCurrentUser && { borderColor: theme.colors.primary, borderWidth: 2 },
                    ]}
                  >
                    <View style={styles.leaderboardLeft}>
                      <Text style={[styles.leaderboardRank, { color: theme.colors.textSecondary }]}>
                        #{index + 1}
                      </Text>
                      {member.user?.avatarUrl && safeParseAvatar(member.user.avatarUrl) ? (
                        <Avatar config={safeParseAvatar(member.user.avatarUrl)!} size={40} />
                      ) : (
                        <View
                          style={[
                            styles.leaderboardAvatarFallback,
                            { backgroundColor: theme.colors.primary + '20' },
                          ]}
                        >
                          <Text style={[styles.leaderboardAvatarText, { color: theme.colors.primary }]}>
                            {member.user?.displayName?.[0]?.toUpperCase() || '?'}
                          </Text>
                        </View>
                      )}
                      <View style={styles.leaderboardInfo}>
                        <View style={styles.leaderboardNameRow}>
                          <Text style={[styles.leaderboardName, { color: theme.colors.text }]}>
                            {member.user?.displayName || 'Okänd'}
                          </Text>
                          {member.role === 'admin' && (
                            <Crown size={12} color={theme.colors.warning} />
                          )}
                        </View>
                        <View style={styles.leaderboardStats}>
                          <Clock size={12} color={theme.colors.textMuted} />
                          <Text style={[styles.leaderboardStatsText, { color: theme.colors.textMuted }]}>
                            {member.sessionCount || 0} sessioner
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.leaderboardTime, { color: theme.colors.primary }]}>
                      {formatTime(member.totalStudyTime || 0)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
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
  errorText: {
    fontSize: 16,
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
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerMetaText: {
    fontSize: 12,
  },
  headerButton: {
    padding: 4,
  },
  requestsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  requestsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewRequestsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyChatText: {
    fontSize: 15,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    maxWidth: '80%',
  },
  messageRowOwn: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  messageAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    gap: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 2,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  messageInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  requestCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  requestDetails: {
    flex: 1,
    gap: 2,
  },
  requestMessage: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  memberAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberUsername: {
    fontSize: 13,
  },
  memberActionBtn: {
    padding: 8,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyLeaderboard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  leaderboardRank: {
    fontSize: 16,
    fontWeight: '700',
    width: 32,
  },
  leaderboardAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  leaderboardInfo: {
    flex: 1,
    gap: 4,
  },
  leaderboardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leaderboardName: {
    fontSize: 15,
    fontWeight: '600',
  },
  leaderboardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderboardStatsText: {
    fontSize: 12,
  },
  leaderboardTime: {
    fontSize: 16,
    fontWeight: '700',
  },
});
