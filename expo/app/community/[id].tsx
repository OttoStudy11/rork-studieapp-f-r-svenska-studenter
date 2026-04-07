import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCommunity, CommunityMember } from '@/contexts/CommunityContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/Avatar';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  ChevronLeft,
  Users,
  Crown,
  MessageSquare,
  Trophy,
  Send,
  UserMinus,
  LogOut,
  Clock,
  ImagePlus,
  X,
  MoreHorizontal,
  Trash2,
  Shield,
} from 'lucide-react-native';
import type { AvatarConfig } from '@/constants/avatar-config';
import { compressImage } from '@/utils/compressImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CommunityPost {
  id: string;
  userId: string;
  message: string;
  imageUrl?: string;
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
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postInput, setPostInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'leaderboard'>('feed');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  const tabIndicator = useRef(new Animated.Value(0)).current;
  const composerAnim = useRef(new Animated.Value(0)).current;

  const animateTab = useCallback((index: number) => {
    Animated.spring(tabIndicator, {
      toValue: index,
      useNativeDriver: true,
      tension: 300,
      friction: 25,
    }).start();
  }, [tabIndicator]);

  const toggleComposer = useCallback((show: boolean) => {
    setShowComposer(show);
    Animated.spring(composerAnim, {
      toValue: show ? 1 : 0,
      useNativeDriver: true,
      tension: 280,
      friction: 22,
    }).start();
    if (show && Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [composerAnim]);

  const loadCommunityData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      console.log('[Community] Loading community data for:', id);
      const { community: comm, members: mems, requests: reqs, error } = await getCommunityDetails(id);

      if (error) {
        console.error('[Community] getCommunityDetails error:', error);
        showError(error);
        router.back();
        return;
      }

      console.log('[Community] Got community:', comm?.name, 'members:', mems?.length, 'requests:', reqs?.length);

      if (comm && mems) {
        setCommunity({ ...comm, memberCount: mems.length });
      } else {
        setCommunity(comm);
      }
      setRequests(reqs || []);

      if (mems && mems.length > 0) {
        const memberIds = mems.map((m) => m.userId).filter(Boolean);
        console.log('[Community] Member IDs:', memberIds);

        let progressMap = new Map<string, number>();
        let sessionCountMap: Record<string, number> = {};

        if (memberIds.length > 0) {
          try {
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('user_id, total_study_time')
              .in('user_id', memberIds);

            const { data: sessionData } = await supabase
              .from('pomodoro_sessions')
              .select('user_id')
              .in('user_id', memberIds);

            sessionData?.forEach((s: any) => {
              sessionCountMap[s.user_id] = (sessionCountMap[s.user_id] || 0) + 1;
            });

            progressMap = new Map(
              progressData?.map((p: any) => [p.user_id, p.total_study_time]) || []
            );
          } catch (statsErr) {
            console.log('[Community] Stats fetch optional, continuing:', statsErr);
          }
        }

        const membersWithStats: MemberWithStats[] = mems.map((m) => ({
          ...m,
          totalStudyTime: progressMap.get(m.userId) || 0,
          sessionCount: sessionCountMap[m.userId] || 0,
        }));

        console.log('[Community] Members with stats:', membersWithStats.length);
        membersWithStats.forEach((m) => {
          console.log('[Community] Member:', m.user?.displayName, '(@' + m.user?.username + ')', 'role:', m.role);
        });

        setMembers(membersWithStats);
      } else {
        console.log('[Community] No members returned');
        setMembers([]);
      }
    } catch (err: any) {
      console.error('[Community] Error loading:', err);
      showError('Kunde inte ladda community');
    } finally {
      setIsLoading(false);
    }
  }, [id, getCommunityDetails, showError, router]);

  const loadPosts = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await (supabase as any)
        .from('community_messages')
        .select('*')
        .eq('community_id', id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[Community] Error loading posts:', error);
        return;
      }

      const userIds: string[] = [];
      if (data && data.length > 0) {
        const ids = data.map((m: any) => m.user_id).filter((uid: any): uid is string => typeof uid === 'string');
        const uniqueIds = Array.from(new Set(ids)) as string[];
        for (const uid of uniqueIds) {
          userIds.push(uid);
        }
      }

      if (userIds.length === 0) {
        setPosts([]);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const mapped: CommunityPost[] = (data || []).map((m: any) => {
        const profile = profileMap.get(m.user_id);
        return {
          id: m.id,
          userId: m.user_id,
          message: m.message,
          imageUrl: m.image_url || undefined,
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

      setPosts(mapped);
    } catch (error) {
      console.error('[Community] Error loading posts:', error);
    }
  }, [id]);

  const handleSendPost = async () => {
    if (!postInput.trim() || !user || !id) return;

    const messageToSend = postInput.trim();
    setIsSending(true);

    try {
      const { data: membership, error: membershipError } = await (supabase as any)
        .from('community_members')
        .select('id')
        .eq('community_id', id)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        showError('Du måste vara medlem för att posta');
        setIsSending(false);
        return;
      }

      const insertData: any = {
        community_id: id,
        user_id: user.id,
        message: messageToSend,
      };

      if (selectedImage) {
        insertData.image_url = selectedImage;
      }

      const { error } = await (supabase as any)
        .from('community_messages')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[Community] Post error:', error);
        showError(`Kunde inte skicka: ${error.message || 'Okänt fel'}`);
        setIsSending(false);
        return;
      }

      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setPostInput('');
      setSelectedImage(null);
      toggleComposer(false);
      await loadPosts();
    } catch (error: any) {
      console.error('[Community] Exception posting:', error);
      showError('Kunde inte skicka inlägg');
    } finally {
      setIsSending(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        const pickedUri = result.assets[0].uri;
        console.log('[Community] Image picked, compressing...');
        try {
          const compressed = await compressImage(pickedUri);
          if (compressed.base64) {
            const dataUri = `data:${compressed.mimeType};base64,${compressed.base64}`;
            console.log('[Community] Image compressed, base64 length:', compressed.base64.length);
            setSelectedImage(dataUri);
          } else {
            showError('Kunde inte bearbeta bilden');
          }
        } catch (compressErr) {
          console.error('[Community] Image compression error:', compressErr);
          showError('Kunde inte bearbeta bilden');
        }
      }
    } catch (err) {
      console.error('[Community] Image picker error:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert('Ta bort inlägg', 'Vill du ta bort detta inlägg?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Ta bort',
        style: 'destructive',
        onPress: async () => {
          const { error } = await (supabase as any)
            .from('community_messages')
            .delete()
            .eq('id', postId);
          if (error) {
            showError('Kunde inte ta bort inlägg');
            return;
          }
          if (Platform.OS !== 'web') {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          await loadPosts();
        },
      },
    ]);
  };

  const handleLeaveCommunity = async () => {
    if (!id) return;
    Alert.alert('Lämna community', 'Är du säker?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Lämna',
        style: 'destructive',
        onPress: async () => {
          const { error } = await leaveCommunity(id);
          if (error) { showError(error); return; }
          showSuccess('Du har lämnat communityn');
          router.back();
        },
      },
    ]);
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
          if (error) { showError(error); return; }
          showSuccess('Medlem borttagen');
          await loadCommunityData();
        },
      },
    ]);
  };

  const handleDeleteCommunity = async () => {
    if (!id) return;
    Alert.alert('Ta bort community', 'Detta går inte att ångra.', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Ta bort',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteCommunity(id);
          if (error) { showError(error); return; }
          showSuccess('Community raderad');
          router.back();
        },
      },
    ]);
  };

  const handleAcceptRequest = async (requestId: string) => {
    const { error } = await handleRequest(requestId, true);
    if (error) { showError(error); return; }
    showSuccess('Ansökan accepterad!');
    await loadCommunityData();
  };

  const handleRejectRequest = async (requestId: string) => {
    const { error } = await handleRequest(requestId, false);
    if (error) { showError(error); return; }
    showSuccess('Ansökan avvisad');
    await loadCommunityData();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadCommunityData(), loadPosts()]);
    setRefreshing(false);
  }, [loadCommunityData, loadPosts]);

  useEffect(() => {
    void loadCommunityData();
    void loadPosts();
  }, [loadCommunityData, loadPosts]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`community:${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `community_id=eq.${id}`,
      }, () => { void loadPosts(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [id, loadPosts]);

  const safeParseAvatar = (raw: string | null | undefined): AvatarConfig | undefined => {
    if (!raw) return undefined;
    try { return JSON.parse(raw) as AvatarConfig; } catch { return undefined; }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatPostDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Nu';
    if (diffMin < 60) return `${diffMin}m sedan`;
    if (diffHours < 24) return `${diffHours}h sedan`;
    if (diffDays < 7) return `${diffDays}d sedan`;
    return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
  };

  const sortedLeaderboard = [...members].sort(
    (a, b) => (b.totalStudyTime || 0) - (a.totalStudyTime || 0)
  );

  const tabWidth = (SCREEN_WIDTH - 48) / 3;
  const translateX = tabIndicator.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, tabWidth, tabWidth * 2],
  });

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

  const renderMemberAvatar = (avatarUrl: string | undefined, displayName: string | undefined, size: number) => {
    const parsed = safeParseAvatar(avatarUrl);
    if (parsed) {
      return <Avatar config={parsed} size={size} />;
    }
    return (
      <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.primary + '18' }]}>
        <Text style={[styles.avatarFallbackText, { color: theme.colors.primary, fontSize: size * 0.4 }]}>
          {displayName?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.border + '60' }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: theme.colors.card }]}
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {community.name}
            </Text>
            <View style={styles.headerMeta}>
              <Users size={11} color={theme.colors.textMuted} />
              <Text style={[styles.headerMetaText, { color: theme.colors.textMuted }]}>
                {community.memberCount} medlemmar
              </Text>
              {community.isAdmin && (
                <View style={[styles.adminPill, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Crown size={10} color={theme.colors.warning} />
                  <Text style={[styles.adminPillText, { color: theme.colors.warning }]}>Admin</Text>
                </View>
              )}
            </View>
          </View>
          {community.isAdmin && (
            <TouchableOpacity
              onPress={handleDeleteCommunity}
              style={[styles.menuBtn, { backgroundColor: theme.colors.card }]}
              activeOpacity={0.7}
            >
              <MoreHorizontal size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {community.isAdmin && requests.length > 0 && (
          <TouchableOpacity
            style={[styles.requestsBanner, { backgroundColor: theme.colors.warning + '12' }]}
            onPress={() => { setActiveTab('members'); animateTab(1); }}
            activeOpacity={0.8}
          >
            <View style={styles.requestsBannerLeft}>
              <View style={[styles.requestsBadge, { backgroundColor: theme.colors.warning }]}>
                <Text style={styles.requestsBadgeText}>{requests.length}</Text>
              </View>
              <Text style={[styles.requestsBannerText, { color: theme.colors.warning }]}>
                Väntande ansökningar
              </Text>
            </View>
            <ChevronLeft size={16} color={theme.colors.warning} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        )}

        <View style={[styles.tabBar, { backgroundColor: theme.colors.card }]}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                backgroundColor: theme.colors.primary,
                width: tabWidth - 8,
                transform: [{ translateX: Animated.add(translateX, new Animated.Value(4)) }],
              },
            ]}
          />
          {[
            { key: 'feed' as const, label: 'Inlägg', icon: MessageSquare, idx: 0 },
            { key: 'members' as const, label: 'Medlemmar', icon: Users, idx: 1 },
            { key: 'leaderboard' as const, label: 'Topplista', icon: Trophy, idx: 2 },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => {
                setActiveTab(tab.key);
                animateTab(tab.idx);
                if (Platform.OS !== 'web') void Haptics.selectionAsync();
              }}
              activeOpacity={0.7}
            >
              <tab.icon
                size={17}
                color={activeTab === tab.key ? theme.colors.primary : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.key ? theme.colors.primary : theme.colors.textMuted },
                  activeTab === tab.key && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'feed' && (
          <View style={styles.feedContainer}>
            <ScrollView
              style={styles.feedScroll}
              contentContainerStyle={styles.feedContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
              }
            >
              {posts.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primary + '12' }]}>
                    <MessageSquare size={32} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                    Inga inlägg än
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                    Var först med att dela något med gruppen!
                  </Text>
                </View>
              ) : (
                posts.map((post) => {
                  const isOwn = post.userId === user?.id;
                  return (
                    <View key={post.id} style={[styles.postCard, { backgroundColor: theme.colors.card }]}>
                      <View style={styles.postHeader}>
                        <View style={styles.postAuthor}>
                          <View style={styles.postAvatarWrap}>
                            {renderMemberAvatar(post.user?.avatarUrl, post.user?.displayName, 40)}
                          </View>
                          <View style={styles.postAuthorInfo}>
                            <Text style={[styles.postAuthorName, { color: theme.colors.text }]}>
                              {post.user?.displayName || 'Okänd'}
                            </Text>
                            <Text style={[styles.postTimestamp, { color: theme.colors.textMuted }]}>
                              @{post.user?.username || 'okänd'} · {formatPostDate(post.createdAt)}
                            </Text>
                          </View>
                        </View>
                        {(isOwn || community.isAdmin) && (
                          <TouchableOpacity
                            style={styles.postMenuBtn}
                            onPress={() => handleDeletePost(post.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Trash2 size={16} color={theme.colors.textMuted} />
                          </TouchableOpacity>
                        )}
                      </View>

                      <Text style={[styles.postBody, { color: theme.colors.text }]}>
                        {post.message}
                      </Text>

                      {post.imageUrl ? (
                        <View style={[styles.postImageContainer, { backgroundColor: theme.colors.border + '30' }]}>
                          <Image
                            source={{ uri: post.imageUrl }}
                            style={styles.postImage}
                            resizeMode="cover"
                          />
                        </View>
                      ) : null}
                    </View>
                  );
                })
              )}
              <View style={{ height: 100 }} />
            </ScrollView>

            {showComposer && (
              <Animated.View
                style={[
                  styles.composerOverlay,
                  {
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    opacity: composerAnim,
                  },
                ]}
              >
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => toggleComposer(false)} />
              </Animated.View>
            )}

            <Animated.View
              style={[
                styles.composerContainer,
                {
                  backgroundColor: theme.colors.card,
                  borderTopColor: theme.colors.border + '40',
                  transform: [{
                    translateY: composerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [200, 0],
                    }),
                  }],
                },
                !showComposer && styles.composerHidden,
              ]}
            >
              <View style={styles.composerHeader}>
                <Text style={[styles.composerTitle, { color: theme.colors.text }]}>Nytt inlägg</Text>
                <TouchableOpacity onPress={() => toggleComposer(false)}>
                  <X size={22} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedImage && (
                <View style={styles.composerImagePreview}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
                  <TouchableOpacity
                    style={[styles.removeImageBtn, { backgroundColor: theme.colors.error }]}
                    onPress={() => setSelectedImage(null)}
                  >
                    <X size={14} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              <TextInput
                style={[styles.composerInput, { color: theme.colors.text, backgroundColor: theme.colors.background }]}
                placeholder="Dela något med gruppen..."
                placeholderTextColor={theme.colors.textMuted}
                value={postInput}
                onChangeText={setPostInput}
                multiline
                maxLength={1000}
                textAlignVertical="top"
              />

              <View style={styles.composerFooter}>
                <TouchableOpacity
                  style={[styles.composerImageBtn, { backgroundColor: theme.colors.primary + '12' }]}
                  onPress={handlePickImage}
                >
                  <ImagePlus size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.composerSendBtn,
                    { backgroundColor: postInput.trim() ? theme.colors.primary : theme.colors.border },
                  ]}
                  onPress={handleSendPost}
                  disabled={!postInput.trim() || isSending}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Send size={16} color="white" />
                      <Text style={styles.composerSendText}>Publicera</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>

            {!showComposer && (
              <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => toggleComposer(true)}
                activeOpacity={0.85}
              >
                <MessageSquare size={22} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {activeTab === 'members' && (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
            }
          >
            {community.isAdmin && requests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Shield size={16} color={theme.colors.warning} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Ansökningar ({requests.length})
                  </Text>
                </View>
                {requests.map((req) => (
                  <View key={req.id} style={[styles.requestCard, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.requestInfo}>
                      <View style={styles.requestAvatarWrap}>
                        {renderMemberAvatar(req.user?.avatarUrl, req.user?.displayName, 44)}
                      </View>
                      <View style={styles.requestDetails}>
                        <Text style={[styles.memberName, { color: theme.colors.text }]}>
                          {req.user?.displayName || 'Okänd'}
                        </Text>
                        <Text style={[styles.memberUsername, { color: theme.colors.textSecondary }]}>
                          @{req.user?.username || 'okänd'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.requestBtns}>
                      <TouchableOpacity
                        style={[styles.rejectBtn, { borderColor: theme.colors.border }]}
                        onPress={() => handleRejectRequest(req.id)}
                      >
                        <Text style={[styles.rejectBtnText, { color: theme.colors.textSecondary }]}>Avvisa</Text>
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
              <View style={styles.sectionHeaderRow}>
                <Users size={16} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Medlemmar ({members.length})
                </Text>
              </View>
              {members.map((member, idx) => (
                <View
                  key={member.id}
                  style={[
                    styles.memberCard,
                    { backgroundColor: theme.colors.card },
                    idx === 0 && { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
                    idx === members.length - 1 && { borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginBottom: 0 },
                  ]}
                >
                  <View style={styles.memberLeft}>
                    <View style={styles.memberAvatarWrap}>
                      {renderMemberAvatar(member.user?.avatarUrl, member.user?.displayName, 44)}
                    </View>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text style={[styles.memberName, { color: theme.colors.text }]} numberOfLines={1}>
                          {member.user?.displayName || 'Okänd'}
                        </Text>
                        {member.role === 'admin' && (
                          <View style={[styles.memberRoleBadge, { backgroundColor: theme.colors.warning + '18' }]}>
                            <Crown size={10} color={theme.colors.warning} />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.memberUsername, { color: theme.colors.textMuted }]}>
                        @{member.user?.username || 'okänd'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.memberRight}>
                    {member.totalStudyTime ? (
                      <View style={[styles.memberStatPill, { backgroundColor: theme.colors.primary + '10' }]}>
                        <Clock size={11} color={theme.colors.primary} />
                        <Text style={[styles.memberStatText, { color: theme.colors.primary }]}>
                          {formatTime(member.totalStudyTime)}
                        </Text>
                      </View>
                    ) : null}
                    {community.isAdmin && member.userId !== user?.id && (
                      <TouchableOpacity
                        style={styles.removeMemberBtn}
                        onPress={() => handleRemoveMember(member.userId)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <UserMinus size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {!community.isAdmin && (
              <TouchableOpacity
                style={[styles.leaveBtn, { backgroundColor: theme.colors.error + '10' }]}
                onPress={handleLeaveCommunity}
                activeOpacity={0.7}
              >
                <LogOut size={18} color={theme.colors.error} />
                <Text style={[styles.leaveBtnText, { color: theme.colors.error }]}>Lämna community</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {activeTab === 'leaderboard' && (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
            }
          >
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Trophy size={16} color={theme.colors.warning} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Topplista</Text>
              </View>

              {sortedLeaderboard.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIcon, { backgroundColor: theme.colors.warning + '12' }]}>
                    <Trophy size={32} color={theme.colors.warning} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Ingen data än</Text>
                  <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                    Starta en studiesession för att synas här
                  </Text>
                </View>
              ) : (
                sortedLeaderboard.map((member, index) => {
                  const isCurrentUser = member.userId === user?.id;
                  const isTop3 = index < 3;
                  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

                  return (
                    <View
                      key={member.id}
                      style={[
                        styles.leaderboardCard,
                        { backgroundColor: theme.colors.card },
                        isCurrentUser && { borderColor: theme.colors.primary, borderWidth: 1.5 },
                      ]}
                    >
                      <View style={styles.leaderboardLeft}>
                        <View style={[
                          styles.rankBadge,
                          isTop3
                            ? { backgroundColor: rankColors[index] + '20' }
                            : { backgroundColor: theme.colors.border + '40' },
                        ]}>
                          <Text style={[
                            styles.rankText,
                            isTop3
                              ? { color: rankColors[index] }
                              : { color: theme.colors.textMuted },
                          ]}>
                            {index + 1}
                          </Text>
                        </View>
                        <View style={styles.leaderboardAvatarWrap}>
                          {renderMemberAvatar(member.user?.avatarUrl, member.user?.displayName, 40)}
                        </View>
                        <View style={styles.leaderboardInfo}>
                          <Text style={[styles.leaderboardName, { color: theme.colors.text }]} numberOfLines={1}>
                            {member.user?.displayName || 'Okänd'}
                            {isCurrentUser ? ' (Du)' : ''}
                          </Text>
                          <View style={styles.leaderboardMeta}>
                            <Clock size={11} color={theme.colors.textMuted} />
                            <Text style={[styles.leaderboardMetaText, { color: theme.colors.textMuted }]}>
                              {member.sessionCount || 0} sessioner
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text style={[
                        styles.leaderboardTime,
                        { color: isTop3 ? rankColors[index] : theme.colors.primary },
                      ]}>
                        {formatTime(member.totalStudyTime || 0)}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  headerMetaText: {
    fontSize: 12,
  },
  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  adminPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  requestsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requestsBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestsBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  requestsBannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 10,
    opacity: 0.12,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 5,
    borderRadius: 10,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '700' as const,
  },
  feedContainer: {
    flex: 1,
    position: 'relative',
  },
  feedScroll: {
    flex: 1,
  },
  feedContent: {
    padding: 16,
    gap: 12,
  },
  postCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  postAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthorName: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  postTimestamp: {
    fontSize: 12,
    marginTop: 1,
  },
  postMenuBtn: {
    padding: 6,
  },
  postBody: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  postImageContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  composerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  composerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 24,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  composerHidden: {
    display: 'none',
  },
  composerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  composerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  composerImagePreview: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composerInput: {
    minHeight: 80,
    maxHeight: 140,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    lineHeight: 21,
  },
  composerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  composerImageBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composerSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  composerSendText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  contentScroll: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  requestCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  requestDetails: {
    flex: 1,
  },
  requestBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  memberAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  memberRoleBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberUsername: {
    fontSize: 12,
    marginTop: 1,
  },
  memberRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberStatText: {
    fontSize: 11,
    fontWeight: '600',
  },
  removeMemberBtn: {
    padding: 6,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontWeight: '700',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  leaveBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 240,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '800',
  },
  leaderboardAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  leaderboardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  leaderboardMetaText: {
    fontSize: 11,
  },
  leaderboardTime: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
