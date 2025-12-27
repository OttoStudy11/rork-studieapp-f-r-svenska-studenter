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
import { Users, Plus, Search, X, UserPlus, Trophy, Medal, Crown, Award, Share2, Copy, User, Target, TrendingUp, Flame, UsersRound, Globe } from 'lucide-react-native';
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
    setGlobalLeaderboardLoading(true);
    setGlobalLeaderboardError(null);

    try {
      const entries = await fetchGlobalLeaderboardTop15();

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

      setGlobalLeaderboard(mapped);
    } catch (error: any) {
      const message = error?.message || 'Kunde inte ladda global topplista';
      setGlobalLeaderboardError(message);
      setGlobalLeaderboard([]);
    } finally {
      setGlobalLeaderboardLoading(false);
    }
  }, [safeParseAvatar]);

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
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId);
      
      if (error) throw error;
      
      showSuccess('Vänförfrågan accepterad! 🎉');
      await loadFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      showError('Kunde inte acceptera vänförfrågan');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId);
      
      if (error) throw error;
      
      showSuccess('Vänförfrågan avvisad');
      await loadFriends();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      showError('Kunde inte avvisa vänförfrågan');
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
                              {friend.streak && friend.streak > 0 && (
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
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Topplista</Text>
            <TouchableOpacity onPress={() => setShowLeaderboard(false)}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            {/* View Selector (Friends/Global) */}
            <View style={[styles.viewSelectorContainer, { backgroundColor: theme.colors.card }]}>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  leaderboardView === 'friends' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setLeaderboardView('friends')}
              >
                <UsersRound size={16} color={leaderboardView === 'friends' ? 'white' : theme.colors.textSecondary} />
                <Text style={[
                  styles.viewButtonText,
                  { color: theme.colors.textSecondary },
                  leaderboardView === 'friends' && { color: 'white', fontWeight: '600' }
                ]}>
                  Vänner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewButton,
                  leaderboardView === 'global' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setLeaderboardView('global')}
              >
                <Globe size={16} color={leaderboardView === 'global' ? 'white' : theme.colors.textSecondary} />
                <Text style={[
                  styles.viewButtonText,
                  { color: theme.colors.textSecondary },
                  leaderboardView === 'global' && { color: 'white', fontWeight: '600' }
                ]}>
                  Globalt
                </Text>
              </TouchableOpacity>
            </View>

            {/* Timeframe Selector */}
            <View style={[styles.timeframeContainer, { backgroundColor: theme.colors.card }]}>
              <TouchableOpacity
                style={[
                  styles.timeframeButton,
                  timeframe === 'week' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setTimeframe('week')}
              >
                <Text style={[
                  styles.timeframeButtonText,
                  { color: theme.colors.textSecondary },
                  timeframe === 'week' && { color: 'white', fontWeight: '600' }
                ]}>
                  Vecka
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeframeButton,
                  timeframe === 'month' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setTimeframe('month')}
              >
                <Text style={[
                  styles.timeframeButtonText,
                  { color: theme.colors.textSecondary },
                  timeframe === 'month' && { color: 'white', fontWeight: '600' }
                ]}>
                  Månad
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeframeButton,
                  timeframe === 'all' && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setTimeframe('all')}
              >
                <Text style={[
                  styles.timeframeButtonText,
                  { color: theme.colors.textSecondary },
                  timeframe === 'all' && { color: 'white', fontWeight: '600' }
                ]}>
                  Totalt
                </Text>
              </TouchableOpacity>
            </View>

            {/* Leaderboard List */}
            <ScrollView style={styles.leaderboardContainer} showsVerticalScrollIndicator={false}>
              {leaderboardView === 'global' ? (
                globalLeaderboardLoading ? (
                  <View style={styles.leaderboardLoading}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Laddar global topplista...</Text>
                  </View>
                ) : globalLeaderboardError ? (
                  <View style={styles.emptyLeaderboard}>
                    <Trophy size={48} color={theme.colors.textMuted} />
                    <Text style={[styles.emptyLeaderboardTitle, { color: theme.colors.text }]}>
                      Kunde inte ladda
                    </Text>
                    <Text style={[styles.emptyLeaderboardText, { color: theme.colors.textSecondary }]}>
                      {globalLeaderboardError}
                    </Text>
                    <TouchableOpacity
                      testID="retry-global-leaderboard"
                      style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => void loadGlobalLeaderboard()}
                    >
                      <Text style={styles.retryButtonText}>Försök igen</Text>
                    </TouchableOpacity>
                  </View>
                ) : globalLeaderboard.length > 0 ? (
                  globalLeaderboard.map((entry, index) => (
                    <FadeInView key={entry.id} delay={100 + index * 50}>
                    <View style={[
                      styles.leaderboardItem,
                      { backgroundColor: theme.colors.card },
                      entry.id === user?.id && { 
                        borderWidth: 2, 
                        borderColor: theme.colors.primary,
                        backgroundColor: theme.colors.primary + '10'
                      }
                    ]}>
                      <View style={styles.leaderboardPosition}>
                        {entry.position <= 3 ? (
                          getPositionIcon(entry.position)
                        ) : (
                          <Text style={[styles.positionText, { color: theme.colors.textSecondary }]}>
                            {entry.position}
                          </Text>
                        )}
                      </View>
                      <View style={styles.leaderboardUserInfo}>
                        {entry.avatar ? (
                          <Avatar config={entry.avatar} size={48} />
                        ) : (
                          <View style={[styles.leaderboardAvatar, { backgroundColor: theme.colors.primary + '15' }]}>
                            <User size={20} color={theme.colors.primary} />
                          </View>
                        )}
                        <View style={styles.userDetails}>
                          <Text style={[
                            styles.leaderboardUserName,
                            { color: theme.colors.text },
                            entry.id === user?.id && { color: theme.colors.primary, fontWeight: '700' }
                          ]}>
                            {entry.display_name}
                          </Text>
                          <Text style={[styles.leaderboardUserProgram, { color: theme.colors.textSecondary }]}>
                            {entry.program}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.leaderboardStats}>
                        <Text style={[styles.studyTime, { color: theme.colors.text }]}>
                          {formatLeaderboardTime(entry.studyTime)}
                        </Text>
                        <Text style={[styles.sessionCount, { color: theme.colors.textSecondary }]}>
                          {entry.sessionCount} sessioner
                        </Text>
                      </View>
                    </View>
                  </FadeInView>
                  ))
                ) : (
                  <View style={styles.emptyLeaderboard}>
                    <Trophy size={48} color={theme.colors.textMuted} />
                    <Text style={[styles.emptyLeaderboardTitle, { color: theme.colors.text }]}>Ingen data än</Text>
                    <Text style={[styles.emptyLeaderboardText, { color: theme.colors.textSecondary }]}>Inga studieminuter hittades</Text>
                  </View>
                )
              ) : leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <FadeInView key={entry.id} delay={100 + index * 50}>
                    <View style={[
                      styles.leaderboardItem,
                      { backgroundColor: theme.colors.card },
                      entry.id === user?.id && {
                        borderWidth: 2,
                        borderColor: theme.colors.primary,
                        backgroundColor: theme.colors.primary + '10',
                      },
                    ]}>
                      <View style={styles.leaderboardPosition}>
                        {entry.position <= 3 ? (
                          getPositionIcon(entry.position)
                        ) : (
                          <Text style={[styles.positionText, { color: theme.colors.textSecondary }]}>
                            {entry.position}
                          </Text>
                        )}
                      </View>
                      <View style={styles.leaderboardUserInfo}>
                        {entry.avatar ? (
                          <Avatar config={entry.avatar} size={48} />
                        ) : (
                          <View style={[styles.leaderboardAvatar, { backgroundColor: theme.colors.primary + '15' }]}>
                            <User size={20} color={theme.colors.primary} />
                          </View>
                        )}
                        <View style={styles.userDetails}>
                          <Text
                            style={[
                              styles.leaderboardUserName,
                              { color: theme.colors.text },
                              entry.id === user?.id && { color: theme.colors.primary, fontWeight: '700' },
                            ]}
                          >
                            {entry.display_name}
                          </Text>
                          <Text style={[styles.leaderboardUserProgram, { color: theme.colors.textSecondary }]}>
                            {entry.program}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.leaderboardStats}>
                        <Text style={[styles.studyTime, { color: theme.colors.text }]}>
                          {formatLeaderboardTime(entry.studyTime)}
                        </Text>
                        <Text style={[styles.sessionCount, { color: theme.colors.textSecondary }]}>
                          {entry.sessionCount} sessioner
                        </Text>
                      </View>
                    </View>
                  </FadeInView>
                ))
              ) : (
                <View style={styles.emptyLeaderboard}>
                  <Trophy size={48} color={theme.colors.textMuted} />
                  <Text style={[styles.emptyLeaderboardTitle, { color: theme.colors.text }]}>Ingen data än</Text>
                  <Text style={[styles.emptyLeaderboardText, { color: theme.colors.textSecondary }]}>Lägg till vänner för att se topplistan</Text>
                </View>
              )}
            </ScrollView>
          </View>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardPosition: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  positionText: {
    fontSize: 18,
    fontWeight: '700',
  },
  leaderboardUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userDetails: {
    flex: 1,
  },
  leaderboardUserName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  leaderboardUserProgram: {
    fontSize: 12,
  },
  leaderboardStats: {
    alignItems: 'flex-end',
  },
  studyTime: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  sessionCount: {
    fontSize: 12,
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
});
