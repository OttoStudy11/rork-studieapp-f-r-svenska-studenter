import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ChevronLeft, 
  Users, 
  Settings, 
  UserPlus, 
  Crown, 
  MoreVertical,
  Lock,
  Globe,
  Trash2,
  LogOut,
  Shield,
  X,
  Search,
  Check,
  UserMinus,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunity, Community, CommunityMember, CommunityRequest } from '@/contexts/CommunityContext';
import { useToast } from '@/contexts/ToastContext';
import Avatar from '@/components/Avatar';
import { FadeInView, SlideInView } from '@/components/Animations';
import { supabase } from '@/lib/supabase';
import type { AvatarConfig } from '@/constants/avatar-config';

interface FriendForInvite {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { 
    getCommunityDetails, 
    joinCommunity, 
    leaveCommunity, 
    handleRequest,
    inviteUser,
    removeMember,
    updateMemberRole,
    deleteCommunity,
  } = useCommunity();
  const { showSuccess, showError } = useToast();

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [requests, setRequests] = useState<CommunityRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [friends, setFriends] = useState<FriendForInvite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviting, setIsInviting] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const loadCommunityData = useCallback(async () => {
    if (!id) return;

    try {
      console.log('[CommunityDetail] Loading community:', id);
      const { community: communityData, members: memberData, requests: requestData, error } = 
        await getCommunityDetails(id);

      if (error) {
        console.error('[CommunityDetail] Error:', error);
        showError(error);
        return;
      }

      setCommunity(communityData || null);
      setMembers(memberData || []);
      setRequests(requestData || []);
    } catch (err) {
      console.error('[CommunityDetail] Exception:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, getCommunityDetails, showError]);

  const loadFriends = useCallback(async () => {
    if (!user) return;

    try {
      const { data: friendsDataSent } = await supabase
        .from('friends')
        .select(`
          friend:profiles!friend_id(id, username, display_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      const { data: friendsDataReceived } = await supabase
        .from('friends')
        .select(`
          friend:profiles!user_id(id, username, display_name, avatar_url)
        `)
        .eq('friend_id', user.id)
        .eq('status', 'accepted');

      const allFriends = [
        ...(friendsDataSent || []),
        ...(friendsDataReceived || []),
      ];

      const memberIds = new Set(members.map(m => m.userId));
      const uniqueFriends = new Map<string, FriendForInvite>();

      allFriends.forEach((f: any) => {
        if (f.friend && !memberIds.has(f.friend.id)) {
          uniqueFriends.set(f.friend.id, {
            id: f.friend.id,
            username: f.friend.username,
            displayName: f.friend.display_name,
            avatarUrl: f.friend.avatar_url,
          });
        }
      });

      setFriends(Array.from(uniqueFriends.values()));
    } catch (err) {
      console.error('[CommunityDetail] Error loading friends:', err);
    }
  }, [user, members]);

  useEffect(() => {
    loadCommunityData();
  }, [loadCommunityData]);

  useEffect(() => {
    if (showInviteModal) {
      loadFriends();
    }
  }, [showInviteModal, loadFriends]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCommunityData();
  };

  const handleJoin = async () => {
    if (!community) return;

    if (community.visibility === 'closed') {
      setShowJoinModal(true);
      return;
    }

    setIsJoining(true);
    const { error } = await joinCommunity(community.id);
    setIsJoining(false);

    if (error) {
      showError(error);
      return;
    }

    showSuccess('Du gick med i communityn! 🎉');
    loadCommunityData();
  };

  const submitJoinRequest = async () => {
    if (!community) return;

    setIsJoining(true);
    const { error } = await joinCommunity(community.id, joinMessage);
    setIsJoining(false);
    setShowJoinModal(false);
    setJoinMessage('');

    if (error) {
      showError(error);
      return;
    }

    showSuccess('Din ansökan har skickats! 📬');
    loadCommunityData();
  };

  const handleLeave = () => {
    Alert.alert(
      'Lämna community',
      'Är du säker på att du vill lämna denna community?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Lämna',
          style: 'destructive',
          onPress: async () => {
            const { error } = await leaveCommunity(community!.id);
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

  const handleDelete = () => {
    Alert.alert(
      'Ta bort community',
      'Är du säker på att du vill ta bort denna community? Detta kan inte ångras.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteCommunity(community!.id);
            if (error) {
              showError(error);
              return;
            }
            showSuccess('Community har tagits bort');
            router.back();
          },
        },
      ]
    );
  };

  const handleRequestAction = async (requestId: string, accept: boolean) => {
    const { error } = await handleRequest(requestId, accept);
    if (error) {
      showError(error);
      return;
    }
    showSuccess(accept ? 'Ansökan godkänd! ✅' : 'Ansökan avvisad');
    loadCommunityData();
  };

  const handleInvite = async (friendId: string) => {
    if (!community) return;

    setIsInviting(friendId);
    const { error } = await inviteUser(community.id, friendId);
    setIsInviting(null);

    if (error) {
      showError(error);
      return;
    }

    showSuccess('Inbjudan skickad! 📨');
    setFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'Ta bort medlem',
      `Vill du ta bort ${memberName} från communityn?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            const { error } = await removeMember(community!.id, memberId);
            if (error) {
              showError(error);
              return;
            }
            showSuccess('Medlem borttagen');
            loadCommunityData();
          },
        },
      ]
    );
  };

  const handleMakeAdmin = async (memberId: string) => {
    const { error } = await updateMemberRole(community!.id, memberId, 'admin');
    if (error) {
      showError(error);
      return;
    }
    showSuccess('Användaren är nu admin');
    loadCommunityData();
  };

  const safeParseAvatar = (raw: string | null | undefined): AvatarConfig | undefined => {
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as AvatarConfig;
    } catch {
      return undefined;
    }
  };

  const filteredFriends = friends.filter(f =>
    f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Laddar community...
        </Text>
      </View>
    );
  }

  if (!community) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Community hittades inte
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Gå tillbaka</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const admins = members.filter(m => m.role === 'admin');
  const regularMembers = members.filter(m => m.role === 'member');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {community.name}
          </Text>
        </View>
        {community.isMember && (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowOptionsMenu(true)}
          >
            <MoreVertical size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Community Info */}
        <SlideInView direction="up" delay={100}>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.infoHeader}>
              <View style={[styles.visibilityBadge, { 
                backgroundColor: community.visibility === 'open' 
                  ? theme.colors.success + '20' 
                  : theme.colors.warning + '20' 
              }]}>
                {community.visibility === 'open' ? (
                  <Globe size={14} color={theme.colors.success} />
                ) : (
                  <Lock size={14} color={theme.colors.warning} />
                )}
                <Text style={[styles.visibilityText, { 
                  color: community.visibility === 'open' ? theme.colors.success : theme.colors.warning 
                }]}>
                  {community.visibility === 'open' ? 'Öppen' : 'Stängd'}
                </Text>
              </View>
              <View style={styles.memberCount}>
                <Users size={14} color={theme.colors.textMuted} />
                <Text style={[styles.memberCountText, { color: theme.colors.textMuted }]}>
                  {community.memberCount} medlemmar
                </Text>
              </View>
            </View>

            {community.description ? (
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                {community.description}
              </Text>
            ) : null}

            {community.schoolName && (
              <View style={[styles.metaTag, { backgroundColor: theme.colors.border + '50' }]}>
                <Text style={[styles.metaTagText, { color: theme.colors.textSecondary }]}>
                  🏫 {community.schoolName}
                </Text>
              </View>
            )}

            {!community.isMember && (
              <TouchableOpacity
                style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleJoin}
                disabled={isJoining || community.hasPendingRequest}
              >
                {isJoining ? (
                  <ActivityIndicator color="white" size="small" />
                ) : community.hasPendingRequest ? (
                  <Text style={styles.joinButtonText}>Ansökan skickad</Text>
                ) : (
                  <Text style={styles.joinButtonText}>
                    {community.visibility === 'closed' ? 'Ansök om medlemskap' : 'Gå med i community'}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {community.isMember && community.isAdmin && (
              <TouchableOpacity
                style={[styles.inviteButton, { backgroundColor: theme.colors.primary + '15' }]}
                onPress={() => setShowInviteModal(true)}
              >
                <UserPlus size={18} color={theme.colors.primary} />
                <Text style={[styles.inviteButtonText, { color: theme.colors.primary }]}>
                  Bjud in vänner
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SlideInView>

        {/* Tabs */}
        {community.isMember && (
          <SlideInView direction="up" delay={200}>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  { backgroundColor: theme.colors.card },
                  activeTab === 'members' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setActiveTab('members')}
              >
                <Text style={[
                  styles.tabText,
                  { color: theme.colors.textSecondary },
                  activeTab === 'members' && { color: 'white', fontWeight: '600' as const }
                ]}>
                  Medlemmar ({members.length})
                </Text>
              </TouchableOpacity>

              {community.isAdmin && requests.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.tab,
                    { backgroundColor: theme.colors.card },
                    activeTab === 'requests' && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setActiveTab('requests')}
                >
                  <Text style={[
                    styles.tabText,
                    { color: theme.colors.textSecondary },
                    activeTab === 'requests' && { color: 'white', fontWeight: '600' as const }
                  ]}>
                    Ansökningar ({requests.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </SlideInView>
        )}

        {/* Members List */}
        {community.isMember && activeTab === 'members' && (
          <SlideInView direction="up" delay={300}>
            <View style={styles.section}>
              {admins.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                    Admins
                  </Text>
                  {admins.map((member, index) => (
                    <FadeInView key={member.id} delay={350 + index * 50}>
                      <View style={[styles.memberCard, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.memberLeft}>
                          {member.user?.avatarUrl ? (
                            <View style={styles.avatarContainer}>
                              <Avatar config={safeParseAvatar(member.user.avatarUrl)} size={44} />
                            </View>
                          ) : (
                            <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary + '20' }]}>
                              <Text style={[styles.avatarFallbackText, { color: theme.colors.primary }]}>
                                {(member.user?.displayName?.[0] || '?').toUpperCase()}
                              </Text>
                            </View>
                          )}
                          <View style={styles.memberInfo}>
                            <Text style={[styles.memberName, { color: theme.colors.text }]}>
                              {member.user?.displayName || 'Okänd'}
                            </Text>
                            <Text style={[styles.memberUsername, { color: theme.colors.primary }]}>
                              @{member.user?.username || 'unknown'}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.adminBadge, { backgroundColor: theme.colors.warning + '20' }]}>
                          <Crown size={12} color={theme.colors.warning} />
                          <Text style={[styles.adminBadgeText, { color: theme.colors.warning }]}>
                            Admin
                          </Text>
                        </View>
                      </View>
                    </FadeInView>
                  ))}
                </>
              )}

              {regularMembers.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, marginTop: 16 }]}>
                    Medlemmar
                  </Text>
                  {regularMembers.map((member, index) => (
                    <FadeInView key={member.id} delay={400 + index * 50}>
                      <View style={[styles.memberCard, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.memberLeft}>
                          {member.user?.avatarUrl ? (
                            <View style={styles.avatarContainer}>
                              <Avatar config={safeParseAvatar(member.user.avatarUrl)} size={44} />
                            </View>
                          ) : (
                            <View style={[styles.avatarFallback, { backgroundColor: theme.colors.border }]}>
                              <Text style={[styles.avatarFallbackText, { color: theme.colors.textSecondary }]}>
                                {(member.user?.displayName?.[0] || '?').toUpperCase()}
                              </Text>
                            </View>
                          )}
                          <View style={styles.memberInfo}>
                            <Text style={[styles.memberName, { color: theme.colors.text }]}>
                              {member.user?.displayName || 'Okänd'}
                            </Text>
                            <Text style={[styles.memberUsername, { color: theme.colors.primary }]}>
                              @{member.user?.username || 'unknown'}
                            </Text>
                          </View>
                        </View>
                        {community.isAdmin && member.userId !== user?.id && (
                          <View style={styles.memberActions}>
                            <TouchableOpacity
                              style={[styles.memberActionButton, { backgroundColor: theme.colors.primary + '15' }]}
                              onPress={() => handleMakeAdmin(member.userId)}
                            >
                              <Shield size={14} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.memberActionButton, { backgroundColor: theme.colors.error + '15' }]}
                              onPress={() => handleRemoveMember(member.userId, member.user?.displayName || 'medlemmen')}
                            >
                              <UserMinus size={14} color={theme.colors.error} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </FadeInView>
                  ))}
                </>
              )}
            </View>
          </SlideInView>
        )}

        {/* Requests List */}
        {community.isMember && community.isAdmin && activeTab === 'requests' && (
          <SlideInView direction="up" delay={300}>
            <View style={styles.section}>
              {requests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Inga väntande ansökningar
                  </Text>
                </View>
              ) : (
                requests.map((request, index) => (
                  <FadeInView key={request.id} delay={350 + index * 50}>
                    <View style={[styles.requestCard, { backgroundColor: theme.colors.card }]}>
                      <View style={styles.requestHeader}>
                        {request.user?.avatarUrl ? (
                          <View style={styles.avatarContainer}>
                            <Avatar config={safeParseAvatar(request.user.avatarUrl)} size={44} />
                          </View>
                        ) : (
                          <View style={[styles.avatarFallback, { backgroundColor: theme.colors.border }]}>
                            <Text style={[styles.avatarFallbackText, { color: theme.colors.textSecondary }]}>
                              {(request.user?.displayName?.[0] || '?').toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <View style={styles.memberInfo}>
                          <Text style={[styles.memberName, { color: theme.colors.text }]}>
                            {request.user?.displayName || 'Okänd'}
                          </Text>
                          <Text style={[styles.memberUsername, { color: theme.colors.primary }]}>
                            @{request.user?.username || 'unknown'}
                          </Text>
                        </View>
                      </View>
                      {request.message && (
                        <Text style={[styles.requestMessage, { color: theme.colors.textSecondary }]}>
                          "{request.message}"
                        </Text>
                      )}
                      <View style={styles.requestActions}>
                        <TouchableOpacity
                          style={[styles.rejectButton, { borderColor: theme.colors.border }]}
                          onPress={() => handleRequestAction(request.id, false)}
                        >
                          <Text style={[styles.rejectButtonText, { color: theme.colors.textSecondary }]}>
                            Avvisa
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.acceptButton, { backgroundColor: theme.colors.primary }]}
                          onPress={() => handleRequestAction(request.id, true)}
                        >
                          <Text style={styles.acceptButtonText}>Godkänn</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </FadeInView>
                ))
              )}
            </View>
          </SlideInView>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Options Menu Modal */}
      <Modal
        visible={showOptionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View style={[styles.optionsMenu, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsMenu(false);
                setShowInviteModal(true);
              }}
            >
              <UserPlus size={20} color={theme.colors.text} />
              <Text style={[styles.optionText, { color: theme.colors.text }]}>
                Bjud in vänner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsMenu(false);
                handleLeave();
              }}
            >
              <LogOut size={20} color={theme.colors.error} />
              <Text style={[styles.optionText, { color: theme.colors.error }]}>
                Lämna community
              </Text>
            </TouchableOpacity>

            {community.createdBy === user?.id && (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  setShowOptionsMenu(false);
                  handleDelete();
                }}
              >
                <Trash2 size={20} color={theme.colors.error} />
                <Text style={[styles.optionText, { color: theme.colors.error }]}>
                  Ta bort community
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Invite Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={[styles.inviteModal, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.inviteHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.inviteTitle, { color: theme.colors.text }]}>
              Bjud in vänner
            </Text>
            <TouchableOpacity onPress={() => setShowInviteModal(false)}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
            <Search size={20} color={theme.colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Sök bland vänner..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.inviteList}>
            {filteredFriends.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  {searchQuery ? 'Inga vänner hittades' : 'Inga vänner att bjuda in'}
                </Text>
              </View>
            ) : (
              filteredFriends.map((friend) => (
                <View 
                  key={friend.id} 
                  style={[styles.inviteFriendCard, { backgroundColor: theme.colors.card }]}
                >
                  <View style={styles.memberLeft}>
                    {friend.avatarUrl ? (
                      <View style={styles.avatarContainer}>
                        <Avatar config={safeParseAvatar(friend.avatarUrl)} size={44} />
                      </View>
                    ) : (
                      <View style={[styles.avatarFallback, { backgroundColor: theme.colors.border }]}>
                        <Text style={[styles.avatarFallbackText, { color: theme.colors.textSecondary }]}>
                          {(friend.displayName?.[0] || '?').toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: theme.colors.text }]}>
                        {friend.displayName}
                      </Text>
                      <Text style={[styles.memberUsername, { color: theme.colors.primary }]}>
                        @{friend.username}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.inviteSendButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => handleInvite(friend.id)}
                    disabled={isInviting === friend.id}
                  >
                    {isInviting === friend.id ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <UserPlus size={14} color="white" />
                        <Text style={styles.inviteSendText}>Bjud in</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Join Request Modal */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.joinModal, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.joinModalTitle, { color: theme.colors.text }]}>
              Ansök om medlemskap
            </Text>
            <Text style={[styles.joinModalSubtitle, { color: theme.colors.textSecondary }]}>
              Denna community kräver godkännande för att gå med.
            </Text>
            <TextInput
              style={[styles.joinMessageInput, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              placeholder="Valfritt meddelande till admins..."
              placeholderTextColor={theme.colors.textMuted}
              value={joinMessage}
              onChangeText={setJoinMessage}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.joinModalActions}>
              <TouchableOpacity
                style={[styles.joinModalCancel, { borderColor: theme.colors.border }]}
                onPress={() => {
                  setShowJoinModal(false);
                  setJoinMessage('');
                }}
              >
                <Text style={[styles.joinModalCancelText, { color: theme.colors.textSecondary }]}>
                  Avbryt
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.joinModalSubmit, { backgroundColor: theme.colors.primary }]}
                onPress={submitJoinRequest}
                disabled={isJoining}
              >
                {isJoining ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.joinModalSubmitText}>Skicka ansökan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberCountText: {
    fontSize: 13,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  metaTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  metaTagText: {
    fontSize: 13,
  },
  joinButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  inviteButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarFallbackText: {
    fontSize: 16,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  memberUsername: {
    fontSize: 13,
    fontWeight: '500',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  memberActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  optionsMenu: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inviteModal: {
    flex: 1,
    paddingTop: 60,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  inviteTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  inviteList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inviteFriendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  inviteSendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  inviteSendText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  joinModal: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
  },
  joinModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  joinModalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  joinMessageInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 80,
    marginBottom: 20,
  },
  joinModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  joinModalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  joinModalCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  joinModalSubmit: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinModalSubmitText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
