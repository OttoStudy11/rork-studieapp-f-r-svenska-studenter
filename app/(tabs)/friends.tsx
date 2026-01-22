import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Platform,
  Share,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { useGamification } from '@/contexts/GamificationContext';
import { Users, Plus, Search, X, UserPlus, Trophy, Medal, Crown, Award, Share2, Copy, User, Target, TrendingUp, Flame, UsersRound, Globe, ChevronLeft, MoreHorizontal, ChevronUp } from 'lucide-react-native';
import Avatar from '@/components/Avatar';
import FriendSearch from '@/components/FriendSearch';
import type { AvatarConfig } from '@/constants/avatar-config';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { fetchGlobalLeaderboardTop15 } from '@/lib/study-stats';
import { useTheme } from '@/contexts/ThemeContext';

import { useRouter } from 'expo-router';
import { FadeInView, SlideInView } from '@/components/Animations';



interface Friend {
  id: string;
  username: string;
  display_name: string;
  program: string;
  level: 'gymnasie' | 'högskola';
  avatar?: AvatarConfig;
  studyTime?: number;
  streak?: number;
}

interface FriendRequest {
  id: string;
  username: string;
  display_name: string;
  program: string;
  level: 'gymnasie' | 'högskola';
  avatar?: AvatarConfig;
  request_id: string;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  display_name: string;
  program: string;
  level: 'gymnasie' | 'högskola';
  avatar?: AvatarConfig;
  studyTime: number;
  sessionCount: number;
  position: number;
}

export default function FriendsScreen() {
  const { user } = useAuth();
  const { user: studyUser } = useStudy();
  const { showError, showSuccess } = useToast();
  const { theme, isDark } = useTheme();
  const { checkAchievements } = useGamification();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [globalLeaderboardLoading, setGlobalLeaderboardLoading] = useState(false);
  const [globalLeaderboardError, setGlobalLeaderboardError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [leaderboardView, setLeaderboardView] = useState<'friends' | 'global'>('friends');

  const colors = [
    { bg: '#FF6B6B15', accent: '#FF6B6B' },
    { bg: '#4ECDC415', accent: '#4ECDC4' },
    { bg: '#95E1D315', accent: '#95E1D3' },
    { bg: '#FFE66D15', accent: '#FFE66D' },
    { bg: '#A8E6CF15', accent: '#A8E6CF' },
    { bg: '#FFD3B615', accent: '#FFD3B6' },
  ];
  const router = useRouter();


  const filteredFriends = friends.filter(friend =>
    friend.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [currentUserProgress, setCurrentUserProgress] = useState<{ current_streak?: number; total_study_time?: number } | null>(null);

  const safeParseAvatar = useCallback((raw: string | null | undefined): AvatarConfig | undefined => {
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as AvatarConfig;
    } catch {
      return undefined;
    }
  }, []);

  const loadFriends = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data: friendsDataSent, error: friendsErrorSent } = await supabase
        .from('friends')
        .select(`
          id,
          friend:profiles!friend_id(
            id,
            username,
            display_name,
            program,
            level,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');
      
      const { data: friendsDataReceived, error: friendsErrorReceived } = await supabase
        .from('friends')
        .select(`
          id,
          friend:profiles!user_id(
            id,
            username,
            display_name,
            program,
            level,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'accepted');
      
      const { data: requestsData, error: requestsError } = await supabase
        .from('friends')
        .select(`
          id,
          requester:profiles!user_id(
            id,
            username,
            display_name,
            program,
            level,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');
      
      if (friendsErrorSent) {
        console.error('Error loading friends (sent):', friendsErrorSent);
        showError(`Kunde inte ladda vänner: ${friendsErrorSent.message}`);
        return;
      }
      
      if (friendsErrorReceived) {
        console.error('Error loading friends (received):', friendsErrorReceived);
        showError(`Kunde inte ladda vänner: ${friendsErrorReceived.message}`);
        return;
      }
      
      if (requestsError) {
        console.error('Error loading friend requests:', requestsError);
        showError(`Kunde inte ladda vänförfrågningar: ${requestsError.message}`);
        return;
      }
      
      const friendsData = [...(friendsDataSent || []), ...(friendsDataReceived || [])];
      
      const uniqueFriendsMap = new Map<string, any>();
      friendsData.forEach((f: any) => {
        if (f.friend && f.friend.id) {
          uniqueFriendsMap.set(f.friend.id, f);
        }
      });
      
      const uniqueFriends = Array.from(uniqueFriendsMap.values());
      const friendIds = uniqueFriends
        .filter((f: any) => f.friend)
        .map((f: any) => f.friend.id);
      
      // Fetch progress data for all friends
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('user_id, total_study_time, current_streak')
        .in('user_id', friendIds);
      
      if (progressError) {
        console.warn('Could not load friend progress data:', progressError);
      }
      
      const mappedFriends: Friend[] = uniqueFriends.map((f: any) => {
        if (!f.friend) {
          console.warn('Friend data missing for:', f);
          return null;
        }
        
        // Find progress data for this friend
        const progress = progressData?.find((p: any) => p.user_id === f.friend.id);
        
        return {
          id: f.friend.id,
          username: f.friend.username,
          display_name: f.friend.display_name,
          program: f.friend.program,
          level: f.friend.level,
          avatar: safeParseAvatar(f.friend.avatar_url),
          studyTime: progress?.total_study_time || 0,
          streak: progress?.current_streak || 0
        };
      }).filter(Boolean) as Friend[];
      
      const mappedRequests: FriendRequest[] = (requestsData || []).map((r: any) => {
        if (!r.requester) {
          console.warn('Requester data missing for:', r);
          return null;
        }
        return {
          id: r.requester.id,
          username: r.requester.username,
          display_name: r.requester.display_name,
          program: r.requester.program || 'Okänd program',
          level: r.requester.level || 'gymnasie',
          avatar: safeParseAvatar(r.requester.avatar_url),
          request_id: r.id
        };
      }).filter(Boolean) as FriendRequest[];
      
      setFriends(mappedFriends);
      setFriendRequests(mappedRequests);
      
      // Fetch actual session counts for leaderboard using pomodoro_sessions
      const { data: sessionCounts, error: sessionError } = await supabase
        .from('pomodoro_sessions')
        .select('user_id')
        .in('user_id', friendIds);
      
      if (sessionError) {
        console.warn('Could not load session counts:', sessionError);
      }
      
      // Count sessions per user
      const sessionCountMap: Record<string, number> = {};
      sessionCounts?.forEach((session: any) => {
        sessionCountMap[session.user_id] = (sessionCountMap[session.user_id] || 0) + 1;
      });
      
      // Get current user progress
      const { data: fetchedUserProgress } = await supabase
        .from('user_progress')
        .select('user_id, total_study_time, current_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      setCurrentUserProgress(fetchedUserProgress);
      
      // Get current user session count from pomodoro_sessions
      const { data: currentUserSessions } = await supabase
        .from('pomodoro_sessions')
        .select('user_id')
        .eq('user_id', user.id);
      
      const allUsersForLeaderboard = [
        ...mappedFriends.map((friend) => ({
          ...friend,
          studyTime: friend.studyTime || 0,
          sessionCount: sessionCountMap[friend.id] || 0,
          position: 0,
        })),
        {
          id: user.id,
          username: studyUser?.username || 'Du',
          display_name: studyUser?.displayName || 'Du',
          program: studyUser?.program || '',
          level: (studyUser?.studyLevel || 'gymnasie') as 'gymnasie' | 'högskola',
          avatar: studyUser?.avatar,
          studyTime: fetchedUserProgress?.total_study_time || 0,
          sessionCount: currentUserSessions?.length || 0,
          position: 0,
        },
      ];
      
      // Sort by study time and assign positions
      const leaderboardData: LeaderboardEntry[] = allUsersForLeaderboard
        .sort((a, b) => b.studyTime - a.studyTime)
        .map((entry, index) => ({ ...entry, position: index + 1 }));
      
      setLeaderboard(leaderboardData);
    } catch (error: any) {
      showError(error?.message || 'Kunde inte ladda vänner');
    } finally {
      setIsLoading(false);
    }
  }, [safeParseAvatar, showError, studyUser, user]);

  const loadGlobalLeaderboard = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping global leaderboard load');
      return;
    }

    setGlobalLeaderboardLoading(true);
    setGlobalLeaderboardError(null);

    try {
      console.log('Loading global leaderboard for user:', user.id);
      const entries = await fetchGlobalLeaderboardTop15();
      console.log('Global leaderboard entries:', entries.length);

      if (entries.length === 0) {
        console.log('No entries found in global leaderboard');
        setGlobalLeaderboardError('Inga användare hittades i topplistan än');
        setGlobalLeaderboard([]);
        return;
      }

      const mapped: LeaderboardEntry[] = entries.map((e) => {
        const level = e.level === 'högskola' ? 'högskola' : 'gymnasie';
        return {
          id: e.userId,
          username: e.username,
          display_name: e.displayName,
          program: e.program,
          level,
          avatar: safeParseAvatar(e.avatarUrl),
          studyTime: e.totalMinutes,
          sessionCount: e.totalSessions,
          position: e.rank,
        };
      });

      console.log('Mapped global leaderboard:', mapped.length, 'entries');
      setGlobalLeaderboard(mapped);
    } catch (error: any) {
      console.error('Error loading global leaderboard:', error);
      const message = error?.message || 'Kunde inte ladda global topplista';
      setGlobalLeaderboardError(message);
      setGlobalLeaderboard([]);
    } finally {
      setGlobalLeaderboardLoading(false);
    }
  }, [safeParseAvatar, user]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  useEffect(() => {
    if (showLeaderboard && leaderboardView === 'global') {
      void loadGlobalLeaderboard();
    }
  }, [leaderboardView, loadGlobalLeaderboard, showLeaderboard]);

  const handleAddFriend = () => {
    setShowAddModal(true);
  };

  const handleShareUsername = () => {
    setShowShareModal(true);
  };

  const copyUsernameToClipboard = async () => {
    if (!studyUser?.username) return;
    
    try {
      await Clipboard.setStringAsync(`@${studyUser.username}`);
      showSuccess('Användarnamn kopierat! 📋');
    } catch (error) {
      console.error('Error copying username:', error);
      showError('Kunde inte kopiera användarnamn');
    }
  };

  const shareUsername = async () => {
    if (!studyUser?.username) return;
    
    try {
      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(`@${studyUser.username}`);
        showSuccess('Användarnamn kopierat! 📋');
      } else {
        await Share.share({
          message: `Lägg till mig som vän på StudieStugan! Mitt användarnamn är: @${studyUser.username}`,
          title: 'Lägg till mig som vän'
        });
      }
    } catch (error) {
      console.error('Error sharing username:', error);
      showError('Kunde inte dela användarnamn');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      console.log('Accepting friend request:', requestId, 'for user:', user?.id);
      
      if (!user?.id) {
        showError('Du måste vara inloggad för att acceptera vänförfrågningar');
        return;
      }
      
      const { data, error } = await supabase
        .from('friends')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('friend_id', user.id)
        .select();
      
      if (error) {
        console.error('Supabase error accepting friend request:', JSON.stringify({
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }, null, 2));
        throw new Error(error.message || 'Kunde inte acceptera vänförfrågan');
      }
      
      if (!data || data.length === 0) {
        console.error('No rows updated - request may not exist or user is not the recipient');
        throw new Error('Kunde inte hitta vänförfrågan');
      }
      
      console.log('Friend request accepted, updated data:', JSON.stringify(data, null, 2));
      
      showSuccess('Vänförfrågan accepterad! 🎉');
      await loadFriends();
      
      // Check for friend-related achievements with delay to allow trigger to complete
      setTimeout(async () => {
        try {
          console.log('🏆 Checking for friend achievements...');
          await checkAchievements();
          console.log('✅ Friend achievements checked');
        } catch (achError) {
          console.log('⚠️ Could not check friend achievements:', achError);
        }
      }, 1000);
    } catch (error: any) {
      console.error('Error accepting friend request:', JSON.stringify({
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      }, null, 2));
      const errorMessage = error?.message || 'Kunde inte acceptera vänförfrågan';
      showError(errorMessage);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      if (!user?.id) {
        showError('Du måste vara inloggad för att avvisa vänförfrågningar');
        return;
      }
      
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId)
        .eq('friend_id', user.id);
      
      if (error) {
        console.error('Error rejecting friend request:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      showSuccess('Vänförfrågan avvisad');
      await loadFriends();
    } catch (error: any) {
      console.error('Error rejecting friend request:', JSON.stringify({
        message: error?.message,
        code: error?.code,
      }, null, 2));
      showError(error?.message || 'Kunde inte avvisa vänförfrågan');
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown size={20} color="#FFD700" />;
      case 2:
        return <Medal size={20} color="#C0C0C0" />;
      case 3:
        return <Award size={20} color="#CD7F32" />;
      default:
        return null;
    }
  };



  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatLeaderboardTime = (minutes: number) => {
    return formatStudyTime(minutes);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Laddar vänner...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>Vänner 👥</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Plugga tillsammans</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: theme.colors.primary + '15' }]}
              onPress={() => setShowLeaderboard(true)}
            >
              <Trophy size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: theme.colors.primary + '15' }]}
              onPress={handleShareUsername}
            >
              <Share2 size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <SlideInView direction="up" delay={100}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
            <Search size={20} color={theme.colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Sök vänner..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddFriend}
          >
            <UserPlus size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SlideInView>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab, 
            { backgroundColor: theme.colors.card },
            activeTab === 'friends' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[
            styles.tabText, 
            { color: theme.colors.textSecondary },
            activeTab === 'friends' && { color: 'white', fontWeight: '600' }
          ]}>
            Vänner ({friends.length})
          </Text>
        </TouchableOpacity>
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
            activeTab === 'requests' && { color: 'white', fontWeight: '600' }
          ]}>
            Förfrågningar ({friendRequests.length})
          </Text>
        </TouchableOpacity>

      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'friends' ? (
          <>
            {/* Stats Cards */}
            <SlideInView direction="up" delay={200}>
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.statIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Users size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{friends.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Vänner</Text>
                </View>
                
                <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.statIconContainer, { backgroundColor: theme.colors.success + '15' }]}>
                    <TrendingUp size={20} color={theme.colors.success} />
                  </View>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {leaderboard.length > 0 ? `#${leaderboard.findIndex(e => e.id === user?.id) + 1 || '-'}` : '-'}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Placering</Text>
                </View>
                
                <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                  <View style={[styles.statIconContainer, { backgroundColor: theme.colors.warning + '15' }]}>
                    <Flame size={20} color={theme.colors.warning} />
                  </View>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {currentUserProgress?.current_streak || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Streak</Text>
                </View>
              </View>
            </SlideInView>

            {/* Friends List */}
            <SlideInView direction="up" delay={300}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dina vänner</Text>
                  {friends.length > 0 && (
                    <TouchableOpacity>
                      <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Se alla</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend, index) => {
                    const colorScheme = colors[index % colors.length];
                    return (
                      <FadeInView key={friend.id} delay={400 + index * 50}>
                        <TouchableOpacity 
                          style={[styles.friendCard, { backgroundColor: theme.colors.card }]}
                          onPress={() => router.push(`/friend-stats/${friend.id}` as any)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.friendContent}>
                            <View style={styles.friendLeft}>
                              {friend.avatar ? (
                                <View style={styles.avatarWrap}>
                                  <Avatar config={friend.avatar} size={56} />
                                </View>
                              ) : (
                                <View style={[styles.fallbackAvatar, { backgroundColor: colorScheme.bg }]}> 
                                  <Text style={[styles.fallbackAvatarText, { color: colorScheme.accent }]}>
                                    {(friend.display_name?.[0] ?? '?').toUpperCase()}
                                  </Text>
                                </View>
                              )}
                              <View style={styles.friendInfo}>
                                <Text style={[styles.friendName, { color: theme.colors.text }]} numberOfLines={1}>
                                  {friend.display_name}
                                </Text>
                                <Text style={[styles.friendUsername, { color: theme.colors.primary }]} numberOfLines={1}>
                                  @{friend.username}
                                </Text>
                                <View style={styles.programRow}>
                                  <View style={[styles.levelBadge, { backgroundColor: colorScheme.bg }]}>
                                    <Text style={[styles.levelText, { color: colorScheme.accent }]}>
                                      {friend.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                                    </Text>
                                  </View>
                                  <Text style={[styles.friendProgram, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                                    {friend.program}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View style={styles.friendRight}>
                              <View style={[styles.statPill, { backgroundColor: colorScheme.bg }]}>
                                <Text style={[styles.statPillValue, { color: colorScheme.accent }]}>
                                  {formatStudyTime(friend.studyTime || 0)}
                                </Text>
                              </View>
                              {(friend.streak ?? 0) > 0 && (
                                <View style={styles.streakBadge}>
                                  <Flame size={12} color="#FF6B6B" />
                                  <Text style={[styles.streakText, { color: '#FF6B6B' }]}>{friend.streak}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      </FadeInView>
                    );
                  })
                ) : (
                  <View style={styles.emptyState}>
                    <Target size={48} color={theme.colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                      {searchQuery ? 'Inga vänner hittades' : 'Inga vänner än'}
                    </Text>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                      {searchQuery 
                        ? 'Prova att söka på något annat'
                        : 'Lägg till vänner för att plugga tillsammans'
                      }
                    </Text>
                    <TouchableOpacity 
                      style={[styles.addButtonLarge, { backgroundColor: theme.colors.primary }]} 
                      onPress={handleAddFriend}
                    >
                      <Plus size={20} color="white" />
                      <Text style={styles.addButtonText}>Lägg till vän</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </SlideInView>
          </>
        ) : activeTab === 'requests' ? (
          <>
            {/* Friend Requests */}
            <SlideInView direction="up" delay={200}>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Väntande förfrågningar</Text>
                
                {friendRequests.map((request, index) => {
                  const colorScheme = colors[index % colors.length];
                  return (
                    <FadeInView key={request.id} delay={300 + index * 50}>
                      <View style={[styles.requestCard, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.requestContent}>
                          <View style={styles.requestLeft}>
                            {request.avatar ? (
                              <View style={styles.avatarWrap}>
                                <Avatar config={request.avatar} size={56} />
                              </View>
                            ) : (
                              <View style={[styles.fallbackAvatar, { backgroundColor: colorScheme.bg }]}> 
                                <Text style={[styles.fallbackAvatarText, { color: colorScheme.accent }]}>
                                  {(request.display_name?.[0] ?? '?').toUpperCase()}
                                </Text>
                              </View>
                            )}
                            <View style={styles.friendInfo}>
                              <Text style={[styles.friendName, { color: theme.colors.text }]} numberOfLines={1}>
                                {request.display_name}
                              </Text>
                              <Text style={[styles.friendUsername, { color: theme.colors.primary }]} numberOfLines={1}>
                                @{request.username}
                              </Text>
                              <View style={styles.programRow}>
                                <View style={[styles.levelBadge, { backgroundColor: colorScheme.bg }]}>
                                  <Text style={[styles.levelText, { color: colorScheme.accent }]}>
                                    {request.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                                  </Text>
                                </View>
                                <Text style={[styles.friendProgram, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                                  {request.program}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                        <View style={styles.requestActions}>
                          <TouchableOpacity
                            style={[styles.rejectButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }]}
                            onPress={() => handleRejectRequest(request.request_id)}
                          >
                            <Text style={[styles.rejectButtonText, { color: theme.colors.textSecondary }]}>Avvisa</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.acceptButton, { backgroundColor: theme.colors.primary }]}
                            onPress={() => handleAcceptRequest(request.request_id)}
                          >
                            <Text style={styles.acceptButtonText}>Acceptera</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </FadeInView>
                  );
                })}

                {friendRequests.length === 0 && (
                  <View style={styles.emptyState}>
                    <UserPlus size={48} color={theme.colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Inga vänförfrågningar</Text>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                      Du har inga väntande vänförfrågningar just nu
                    </Text>
                  </View>
                )}
              </View>
            </SlideInView>
          </>
        ) : null}
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Lägg till vän</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <FriendSearch onFriendAdded={() => {
              loadFriends();
              setShowAddModal(false);
            }} />
          </View>
        </View>
      </Modal>

      {/* Leaderboard Modal */}
      <Modal
        visible={showLeaderboard}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.leaderboardModalContainer}>
          {/* Header */}
          <View style={styles.leaderboardHeader}>
            <TouchableOpacity 
              style={styles.leaderboardBackButton}
              onPress={() => setShowLeaderboard(false)}
            >
              <ChevronLeft size={24} color="#4A9EFF" />
            </TouchableOpacity>
            <Text style={styles.leaderboardTitle}>Topplista</Text>
            <TouchableOpacity style={styles.leaderboardMenuButton}>
              <MoreHorizontal size={24} color="#4A9EFF" />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.leaderboardTabContainer}>
            <TouchableOpacity
              style={[
                styles.leaderboardTab,
                leaderboardView === 'friends' && styles.leaderboardTabActive
              ]}
              onPress={() => setLeaderboardView('friends')}
            >
              <Text style={[
                styles.leaderboardTabText,
                leaderboardView === 'friends' && styles.leaderboardTabTextActive
              ]}>
                Vänner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.leaderboardTab,
                leaderboardView === 'global' && styles.leaderboardTabActive
              ]}
              onPress={() => setLeaderboardView('global')}
            >
              <Text style={[
                styles.leaderboardTabText,
                leaderboardView === 'global' && styles.leaderboardTabTextActive
              ]}>
                Globalt
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.leaderboardScrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.leaderboardScrollContent}
          >
            {/* Top 3 Podium */}
            {(() => {
              const currentData = leaderboardView === 'global' ? globalLeaderboard : leaderboard;
              const top3 = currentData.slice(0, 3);
              const rest = currentData.slice(3);
              
              if (leaderboardView === 'global' && globalLeaderboardLoading) {
                return (
                  <View style={styles.leaderboardLoadingContainer}>
                    <ActivityIndicator size="large" color="#4A9EFF" />
                    <Text style={styles.leaderboardLoadingText}>Laddar topplista...</Text>
                  </View>
                );
              }
              
              if (leaderboardView === 'global' && globalLeaderboardError) {
                return (
                  <View style={styles.leaderboardEmptyContainer}>
                    <Trophy size={48} color="#4A5568" />
                    <Text style={styles.leaderboardEmptyTitle}>Kunde inte ladda</Text>
                    <Text style={styles.leaderboardEmptyText}>{globalLeaderboardError}</Text>
                    <TouchableOpacity
                      style={styles.leaderboardRetryButton}
                      onPress={() => void loadGlobalLeaderboard()}
                    >
                      <Text style={styles.leaderboardRetryText}>Försök igen</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              
              if (currentData.length === 0) {
                return (
                  <View style={styles.leaderboardEmptyContainer}>
                    <Trophy size={48} color="#4A5568" />
                    <Text style={styles.leaderboardEmptyTitle}>Ingen data än</Text>
                    <Text style={styles.leaderboardEmptyText}>
                      {leaderboardView === 'friends' 
                        ? 'Lägg till vänner för att se topplistan' 
                        : 'Inga studieminuter hittades'}
                    </Text>
                  </View>
                );
              }
              
              const second = top3.find(e => e.position === 2);
              const first = top3.find(e => e.position === 1);
              const third = top3.find(e => e.position === 3);
              
              return (
                <>
                  {/* Podium Section */}
                  <View style={styles.podiumContainer}>
                    {/* 2nd Place - Left */}
                    <View style={styles.podiumSide}>
                      {second && (
                        <FadeInView delay={100}>
                          <View style={styles.podiumEntry}>
                            <View style={[styles.podiumAvatarContainer, styles.podiumAvatarSecond]}>
                              {second.avatar ? (
                                <Avatar config={second.avatar} size={70} />
                              ) : (
                                <View style={styles.podiumAvatarFallback}>
                                  <User size={28} color="#4A9EFF" />
                                </View>
                              )}
                            </View>
                            <Text style={styles.podiumName} numberOfLines={1}>{second.display_name}</Text>
                            <Text style={[styles.podiumPoints, styles.podiumPointsSecond]}>{formatLeaderboardTime(second.studyTime)}</Text>
                            <Text style={styles.podiumUsername}>@{second.username}</Text>
                          </View>
                        </FadeInView>
                      )}
                    </View>
                    
                    {/* 1st Place - Center */}
                    <View style={styles.podiumCenter}>
                      {first && (
                        <FadeInView delay={50}>
                          <View style={styles.podiumEntryFirst}>
                            <View style={styles.crownContainer}>
                              <Crown size={28} color="#FFD700" fill="#FFD700" />
                            </View>
                            <View style={[styles.podiumAvatarContainer, styles.podiumAvatarFirst]}>
                              {first.avatar ? (
                                <Avatar config={first.avatar} size={85} />
                              ) : (
                                <View style={[styles.podiumAvatarFallback, styles.podiumAvatarFallbackFirst]}>
                                  <User size={34} color="#22C55E" />
                                </View>
                              )}
                            </View>
                            <Text style={[styles.podiumName, styles.podiumNameFirst]} numberOfLines={1}>{first.display_name}</Text>
                            <Text style={[styles.podiumPoints, styles.podiumPointsFirst]}>{formatLeaderboardTime(first.studyTime)}</Text>
                            <Text style={styles.podiumUsername}>@{first.username}</Text>
                          </View>
                        </FadeInView>
                      )}
                    </View>
                    
                    {/* 3rd Place - Right */}
                    <View style={styles.podiumSide}>
                      {third && (
                        <FadeInView delay={150}>
                          <View style={styles.podiumEntry}>
                            <View style={[styles.podiumAvatarContainer, styles.podiumAvatarThird]}>
                              {third.avatar ? (
                                <Avatar config={third.avatar} size={70} />
                              ) : (
                                <View style={styles.podiumAvatarFallback}>
                                  <User size={28} color="#F97316" />
                                </View>
                              )}
                            </View>
                            <Text style={styles.podiumName} numberOfLines={1}>{third.display_name}</Text>
                            <Text style={[styles.podiumPoints, styles.podiumPointsThird]}>{formatLeaderboardTime(third.studyTime)}</Text>
                            <Text style={styles.podiumUsername}>@{third.username}</Text>
                          </View>
                        </FadeInView>
                      )}
                    </View>
                  </View>
                  
                  {/* Rest of the list */}
                  <View style={styles.leaderboardListContainer}>
                    {rest.map((entry, index) => (
                      <FadeInView key={entry.id} delay={200 + index * 30}>
                        <View style={[
                          styles.leaderboardListItem,
                          entry.id === user?.id && styles.leaderboardListItemHighlight
                        ]}>
                          <View style={styles.leaderboardListLeft}>
                            <View style={styles.leaderboardListAvatarContainer}>
                              {entry.avatar ? (
                                <Avatar config={entry.avatar} size={48} />
                              ) : (
                                <View style={styles.leaderboardListAvatarFallback}>
                                  <User size={20} color="#64748B" />
                                </View>
                              )}
                            </View>
                            <View style={styles.leaderboardListInfo}>
                              <Text style={[
                                styles.leaderboardListName,
                                entry.id === user?.id && styles.leaderboardListNameHighlight
                              ]} numberOfLines={1}>
                                {entry.display_name}
                              </Text>
                              <Text style={styles.leaderboardListUsername} numberOfLines={1}>
                                @{entry.username}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.leaderboardListRight}>
                            <Text style={styles.leaderboardListPoints}>{formatLeaderboardTime(entry.studyTime)}</Text>
                            <ChevronUp size={14} color="#22C55E" />
                          </View>
                        </View>
                      </FadeInView>
                    ))}
                  </View>
                </>
              );
            })()}
          </ScrollView>
        </View>
      </Modal>

      {/* Share Username Modal */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Dela användarnamn</Text>
            <TouchableOpacity onPress={() => setShowShareModal(false)}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.shareSection}>
              <Text style={[styles.shareTitle, { color: theme.colors.text }]}>Ditt användarnamn</Text>
              <View style={[styles.usernameCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.usernameInfo}>
                  {studyUser && (
                    <>
                      <Text style={[styles.usernameText, { color: theme.colors.text }]}>@{studyUser.username}</Text>
                      <Text style={[styles.usernameSubtext, { color: theme.colors.textSecondary }]}>
                        Andra kan söka efter detta namn för att lägga till dig som vän
                      </Text>
                    </>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.copyButton, { backgroundColor: theme.colors.primary + '15' }]}
                  onPress={copyUsernameToClipboard}
                >
                  <Copy size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.shareActions}>
              <TouchableOpacity
                style={[styles.shareActionButton, { backgroundColor: theme.colors.primary }]}
                onPress={shareUsername}
              >
                <Share2 size={20} color="white" />
                <Text style={styles.shareActionText}>Dela användarnamn</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.copyActionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary, borderWidth: 1 }]}
                onPress={copyUsernameToClipboard}
              >
                <Copy size={20} color={theme.colors.primary} />
                <Text style={[styles.copyActionText, { color: theme.colors.primary }]}>Kopiera användarnamn</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.instructionsSection, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>Så här fungerar det</Text>
              <Text style={[styles.instructionsText, { color: theme.colors.textSecondary }]}>
                • Dela ditt användarnamn (@{studyUser?.username || 'användarnamn'}) med vänner{"\n"}
                • De kan söka efter ditt exakta användarnamn{"\n"}
                • När de hittar dig kan de skicka en vänförfrågan{"\n"}
                • Du får en notifikation och kan acceptera förfrågan
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    borderRadius: 16,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewSelectorContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  friendCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  friendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 14,
  },
  fallbackAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fallbackAvatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  friendInfo: {
    flex: 1,
    gap: 2,
  },
  friendName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 1,
  },
  friendUsername: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  friendProgram: {
    fontSize: 12,
    flex: 1,
  },
  friendRight: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 92,
  },
  statPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statPillValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FF6B6B15',
    borderRadius: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
  },
  requestCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  requestContent: {
    marginBottom: 16,
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  addButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  timeframeContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  leaderboardContainer: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  leaderboardPosition: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  positionText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  leaderboardUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    minWidth: 0,
  },
  leaderboardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  leaderboardUserName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  leaderboardUserProgram: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.65,
  },
  leaderboardStats: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 90,
    flexShrink: 0,
  },
  studyTime: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sessionCount: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: '600',
  },
  emptyLeaderboard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyLeaderboardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyLeaderboardText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  leaderboardLoading: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  shareSection: {
    marginBottom: 24,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  usernameCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  usernameInfo: {
    flex: 1,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  usernameSubtext: {
    fontSize: 14,
    lineHeight: 18,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
  },
  shareActions: {
    gap: 12,
    marginBottom: 24,
  },
  shareActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  shareActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  copyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  copyActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsSection: {
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  createGroupText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
    gap: 6,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  courseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseText: {
    fontSize: 12,
    fontWeight: '600',
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  leaveGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  leaveGroupText: {
    fontSize: 14,
    fontWeight: '700',
  },
  joinGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinGroupText: {
    fontSize: 14,
    fontWeight: '700',
  },
  // New Leaderboard Modal Styles
  leaderboardModalContainer: {
    flex: 1,
    backgroundColor: '#141A2E',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  leaderboardBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaderboardMenuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardTabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: '#1E2642',
    borderRadius: 24,
    padding: 4,
  },
  leaderboardTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  leaderboardTabActive: {
    backgroundColor: '#2A3655',
  },
  leaderboardTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  leaderboardTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  leaderboardScrollView: {
    flex: 1,
  },
  leaderboardScrollContent: {
    paddingBottom: 40,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    minHeight: 260,
  },
  podiumSide: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 30,
  },
  podiumCenter: {
    flex: 1,
    alignItems: 'center',
  },
  podiumEntry: {
    alignItems: 'center',
    width: 100,
  },
  podiumEntryFirst: {
    alignItems: 'center',
    width: 110,
  },
  crownContainer: {
    marginBottom: 8,
  },
  podiumAvatarContainer: {
    borderRadius: 50,
    padding: 3,
    marginBottom: 10,
  },
  podiumAvatarFirst: {
    borderWidth: 3,
    borderColor: '#22C55E',
    borderRadius: 50,
    width: 91,
    height: 91,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  podiumAvatarSecond: {
    borderWidth: 3,
    borderColor: '#4A9EFF',
    borderRadius: 50,
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  podiumAvatarThird: {
    borderWidth: 3,
    borderColor: '#F97316',
    borderRadius: 50,
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  podiumAvatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#1E2642',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumAvatarFallbackFirst: {
    backgroundColor: '#1E2642',
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumNameFirst: {
    fontSize: 16,
    fontWeight: '700',
  },
  podiumPoints: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  podiumPointsFirst: {
    color: '#22C55E',
    fontSize: 22,
  },
  podiumPointsSecond: {
    color: '#4A9EFF',
  },
  podiumPointsThird: {
    color: '#F97316',
  },
  podiumUsername: {
    fontSize: 11,
    color: '#64748B',
  },
  leaderboardListContainer: {
    backgroundColor: '#1A2138',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 16,
    minHeight: 400,
  },
  leaderboardListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#232D4A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  leaderboardListItemHighlight: {
    backgroundColor: '#2A3A5A',
    borderWidth: 1,
    borderColor: '#4A9EFF',
  },
  leaderboardListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leaderboardListAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    overflow: 'hidden',
  },
  leaderboardListAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A3655',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardListInfo: {
    flex: 1,
    marginRight: 12,
  },
  leaderboardListName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  leaderboardListNameHighlight: {
    color: '#4A9EFF',
  },
  leaderboardListUsername: {
    fontSize: 12,
    color: '#64748B',
  },
  leaderboardListRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderboardListPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  leaderboardLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  leaderboardLoadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 16,
  },
  leaderboardEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  leaderboardEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  leaderboardEmptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  leaderboardRetryButton: {
    backgroundColor: '#4A9EFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  leaderboardRetryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
