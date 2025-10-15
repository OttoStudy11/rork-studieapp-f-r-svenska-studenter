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
  SafeAreaView
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/contexts/ToastContext';
import { Users, Plus, Search, X, UserPlus, Trophy, Medal, Crown, Award, Share2, Copy, User, Target, TrendingUp, Flame } from 'lucide-react-native';
import Avatar from '@/components/Avatar';
import FriendSearch from '@/components/FriendSearch';
import type { AvatarConfig } from '@/components/AvatarCustomizer';
import * as Clipboard from 'expo-clipboard';
import { Platform, Share } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
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
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const filteredFriends = friends.filter(friend =>
    friend.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadFriends = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select(`
          id,
          friend:profiles!friends_friend_id_fkey(
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
      
      const { data: requestsData, error: requestsError } = await supabase
        .from('friends')
        .select(`
          id,
          requester:profiles!friends_user_id_fkey(
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
      
      if (friendsError) {
        console.error('Error loading friends:', friendsError);
      }
      
      if (requestsError) {
        console.error('Error loading friend requests:', requestsError);
      }
      
      const mappedFriends: Friend[] = (friendsData || []).map((f: any) => ({
        id: f.friend.id,
        username: f.friend.username,
        display_name: f.friend.display_name,
        program: f.friend.program,
        level: f.friend.level,
        avatar: f.friend.avatar_url ? JSON.parse(f.friend.avatar_url) : undefined,
        studyTime: Math.floor(Math.random() * 500) + 100,
        streak: Math.floor(Math.random() * 30) + 1
      }));
      
      const mappedRequests: FriendRequest[] = (requestsData || []).map((r: any) => ({
        id: r.requester.id,
        username: r.requester.username,
        display_name: r.requester.display_name,
        program: r.requester.program,
        level: r.requester.level,
        avatar: r.requester.avatar_url ? JSON.parse(r.requester.avatar_url) : undefined,
        request_id: r.id
      }));
      
      setFriends(mappedFriends);
      setFriendRequests(mappedRequests);
      
      const leaderboardData: LeaderboardEntry[] = mappedFriends
        .map((friend, index) => ({
          ...friend,
          studyTime: friend.studyTime || 0,
          sessionCount: Math.floor(Math.random() * 50) + 10,
          position: index + 1
        }))
        .sort((a, b) => b.studyTime - a.studyTime)
        .map((entry, index) => ({ ...entry, position: index + 1 }));
      
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading friends:', error);
      showError('Kunde inte ladda vänner');
    } finally {
      setIsLoading(false);
    }
  }, [user, showError]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

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
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>0</Text>
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
                  filteredFriends.map((friend, index) => (
                    <FadeInView key={friend.id} delay={400 + index * 50}>
                      <TouchableOpacity style={[styles.friendCard, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.friendHeader}>
                          {friend.avatar ? (
                            <Avatar config={friend.avatar} size={50} />
                          ) : (
                            <View style={[styles.friendAvatar, { backgroundColor: theme.colors.primary + '15' }]}>
                              <User size={24} color={theme.colors.primary} />
                            </View>
                          )}
                          <View style={styles.friendInfo}>
                            <Text style={[styles.friendName, { color: theme.colors.text }]}>{friend.display_name}</Text>
                            <Text style={[styles.friendUsername, { color: theme.colors.primary }]}>@{friend.username}</Text>
                            <Text style={[styles.friendProgram, { color: theme.colors.textSecondary }]}>
                              {friend.program} • {friend.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                            </Text>
                          </View>
                          <View style={styles.friendStats}>
                            <View style={styles.friendStatItem}>
                              <Text style={[styles.friendStatValue, { color: theme.colors.text }]}>
                                {formatStudyTime(friend.studyTime || 0)}
                              </Text>
                              <Text style={[styles.friendStatLabel, { color: theme.colors.textSecondary }]}>Studietid</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </FadeInView>
                  ))
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
        ) : (
          <>
            {/* Friend Requests */}
            <SlideInView direction="up" delay={200}>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Väntande förfrågningar</Text>
                
                {friendRequests.map((request, index) => (
                  <FadeInView key={request.id} delay={300 + index * 50}>
                    <View style={[styles.requestCard, { backgroundColor: theme.colors.card }]}>
                      <View style={styles.requestHeader}>
                        {request.avatar ? (
                          <Avatar config={request.avatar} size={50} />
                        ) : (
                          <View style={[styles.friendAvatar, { backgroundColor: theme.colors.primary + '15' }]}>
                            <User size={24} color={theme.colors.primary} />
                          </View>
                        )}
                        <View style={styles.friendInfo}>
                          <Text style={[styles.friendName, { color: theme.colors.text }]}>{request.display_name}</Text>
                          <Text style={[styles.friendUsername, { color: theme.colors.primary }]}>@{request.username}</Text>
                          <Text style={[styles.friendProgram, { color: theme.colors.textSecondary }]}>
                            {request.program} • {request.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                          </Text>
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
                ))}

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
        )}
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
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
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
                          <Avatar config={entry.avatar} size={40} />
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
                          {formatStudyTime(entry.studyTime)}
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
                  <Text style={[styles.emptyLeaderboardTitle, { color: theme.colors.text }]}>
                    Ingen data än
                  </Text>
                  <Text style={[styles.emptyLeaderboardText, { color: theme.colors.textSecondary }]}>
                    Lägg till vänner för att se topplistan
                  </Text>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 12,
    marginBottom: 2,
  },
  friendProgram: {
    fontSize: 12,
  },
  friendStats: {
    alignItems: 'flex-end',
  },
  friendStatItem: {
    alignItems: 'flex-end',
  },
  friendStatValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  friendStatLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  requestCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  leaderboardUserName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
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
  },
  emptyLeaderboardText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
});
