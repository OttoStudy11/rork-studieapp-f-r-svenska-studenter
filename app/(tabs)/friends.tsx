import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Users, Plus, Search, X, UserPlus, Trophy, Medal, Crown, Award, Share2, Copy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as db from '@/lib/database';
import Avatar from '@/components/Avatar';
import type { AvatarConfig } from '@/components/AvatarCustomizer';
import * as Clipboard from 'expo-clipboard';
import { Platform, Share } from 'react-native';
import { supabase } from '@/lib/supabase';

interface Friend {
  id: string;
  name: string;
  program: string;
  level: 'gymnasie' | 'högskola';
  avatar?: AvatarConfig;
}

interface FriendRequest {
  id: string;
  name: string;
  program: string;
  level: 'gymnasie' | 'högskola';
  avatar?: AvatarConfig;
}

export default function FriendsScreen() {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addFriendQuery, setAddFriendQuery] = useState('');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadFriends = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        db.getUserFriends(user.id),
        db.getFriendRequests(user.id)
      ]);
      
      const mappedFriends: Friend[] = friendsData.map((f: any) => ({
        id: f.friend.id,
        name: f.friend.name,
        program: f.friend.program,
        level: f.friend.level,
        avatar: f.friend.avatar_url ? JSON.parse(f.friend.avatar_url) : undefined
      }));
      
      const mappedRequests: FriendRequest[] = requestsData.map((r: any) => ({
        id: r.id,
        name: r.requester.name,
        program: r.requester.program,
        level: r.requester.level,
        avatar: r.requester.avatar_url ? JSON.parse(r.requester.avatar_url) : undefined
      }));
      
      setFriends(mappedFriends);
      setFriendRequests(mappedRequests);
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

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const results = await db.searchUsers(query);
      // Filter out current user and existing friends
      const filteredResults = results.filter(result => 
        result.id !== user?.id && 
        !friends.some(friend => friend.id === result.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      showError('Kunde inte söka användare');
    } finally {
      setIsSearching(false);
    }
  }, [user?.id, friends, showError]);

  const handleAddFriend = () => {
    setShowAddModal(true);
  };

  const handleShareUsername = () => {
    setShowShareModal(true);
  };

  const copyUsernameToClipboard = async () => {
    if (!user) return;
    
    try {
      const userProfile = await db.getUser(user.id);
      if (userProfile) {
        await Clipboard.setStringAsync(userProfile.name);
        showSuccess('Användarnamn kopierat! 📋');
      }
    } catch (error) {
      console.error('Error copying username:', error);
      showError('Kunde inte kopiera användarnamn');
    }
  };

  const shareUsername = async () => {
    if (!user) return;
    
    try {
      const userProfile = await db.getUser(user.id);
      if (userProfile) {
        if (Platform.OS === 'web') {
          // On web, copy to clipboard
          await Clipboard.setStringAsync(userProfile.name);
          showSuccess('Användarnamn kopierat! 📋');
        } else {
          // On mobile, use native sharing
          await Share.share({
            message: `Lägg till mig som vän på StudieStugan! Mitt användarnamn är: ${userProfile.name}`,
            title: 'Lägg till mig som vän'
          });
        }
      }
    } catch (error) {
      console.error('Error sharing username:', error);
      showError('Kunde inte dela användarnamn');
    }
  };

  const searchByUsername = async (username: string) => {
    if (!username.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      // Search for exact username match
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, level, program, avatar_url')
        .eq('name', username.trim())
        .limit(1);
      
      if (error) throw error;
      
      // Filter out current user and existing friends
      const filteredResults = (data || []).filter((result: any) => 
        result.id !== user?.id && 
        !friends.some(friend => friend.id === result.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching by username:', error);
      showError('Kunde inte söka efter användarnamn');
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;
    
    try {
      await db.sendFriendRequest(user.id, friendId);
      showSuccess('Vänförfrågan skickad!');
      setSearchResults(prev => prev.filter(result => result.id !== friendId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      showError('Kunde inte skicka vänförfrågan');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await db.acceptFriendRequest(requestId);
      showSuccess('Vänförfrågan accepterad! 🎉');
      await loadFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      showError('Kunde inte acceptera vänförfrågan');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await db.rejectFriendRequest(requestId);
      showSuccess('Vänförfrågan avvisad');
      await loadFriends();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      showError('Kunde inte avvisa vänförfrågan');
    }
  };

  const loadLeaderboard = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoadingLeaderboard(true);
      const data = await db.getFriendsLeaderboard(user.id, leaderboardTimeframe);
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      showError('Kunde inte ladda topplistan');
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [user, leaderboardTimeframe, showError]);

  useEffect(() => {
    if (showLeaderboard) {
      loadLeaderboard();
    }
  }, [showLeaderboard, loadLeaderboard]);

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

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Vänner</Text>
          <Text style={styles.headerSubtitle}>Plugga tillsammans</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowLeaderboard(true)}
          >
            <Trophy size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShareUsername}
          >
            <Share2 size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleAddFriend}
          >
            <UserPlus size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Sök vänner..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Vänner ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Förfrågningar ({friendRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Laddar vänner...</Text>
          </View>
        ) : activeTab === 'friends' ? (
          <>
            {filteredFriends.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dina vänner</Text>
                {filteredFriends.map((friend) => (
                  <TouchableOpacity key={friend.id} style={styles.friendCard}>
                    <View style={styles.friendHeader}>
                      {friend.avatar ? (
                        <Avatar config={friend.avatar} size={50} />
                      ) : (
                        <View style={styles.friendAvatar}>
                          <Text style={styles.avatarText}>
                            {friend.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.friendInfo}>
                        <Text style={styles.friendName}>{friend.name}</Text>
                        <Text style={styles.friendProgram}>
                          {friend.program} • {friend.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Users size={64} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>
                  {searchQuery ? 'Inga vänner hittades' : 'Inga vänner än'}
                </Text>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? 'Prova att söka på något annat'
                    : 'Lägg till vänner för att plugga tillsammans'
                  }
                </Text>
                <TouchableOpacity style={styles.addFriendButton} onPress={handleAddFriend}>
                  <Plus size={20} color="white" />
                  <Text style={styles.addFriendButtonText}>Lägg till vän</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Friend Requests */}
            {friendRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  {request.avatar ? (
                    <Avatar config={request.avatar} size={50} />
                  ) : (
                    <View style={styles.friendAvatar}>
                      <Text style={styles.avatarText}>
                        {request.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{request.name}</Text>
                    <Text style={styles.friendProgram}>
                      {request.program} • {request.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                    </Text>
                  </View>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleRejectRequest(request.id)}
                  >
                    <Text style={styles.rejectButtonText}>Avvisa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRequest(request.id)}
                  >
                    <Text style={styles.acceptButtonText}>Acceptera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {friendRequests.length === 0 && (
              <View style={styles.emptyState}>
                <UserPlus size={64} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>Inga vänförfrågningar</Text>
                <Text style={styles.emptyText}>
                  Du har inga väntande vänförfrågningar just nu
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lägg till vän</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sök efter vänner</Text>
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Skriv exakt användarnamn..."
                  value={addFriendQuery}
                  onChangeText={(text) => {
                    setAddFriendQuery(text);
                    // Use exact username search instead of fuzzy search
                    searchByUsername(text);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {isSearching && (
                  <ActivityIndicator size="small" color="#4F46E5" style={styles.searchSpinner} />
                )}
              </View>
            </View>

            {searchResults.length > 0 && (
              <View style={styles.searchResultsSection}>
                <Text style={styles.suggestionTitle}>Sökresultat</Text>
                {searchResults.map((result) => (
                  <View key={result.id} style={styles.searchResultItem}>
                    <View style={styles.friendAvatar}>
                      <Text style={styles.avatarText}>
                        {result.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{result.name}</Text>
                      <Text style={styles.friendProgram}>
                        {result.program} • {result.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => sendFriendRequest(result.id)}
                    >
                      <UserPlus size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {addFriendQuery.length > 0 && searchResults.length === 0 && !isSearching && (
              <View style={styles.suggestionSection}>
                <Text style={styles.suggestionTitle}>Inga resultat</Text>
                <Text style={styles.suggestionText}>
                  Inga användare hittades med det namnet
                </Text>
              </View>
            )}

            {addFriendQuery.length === 0 && (
              <View style={styles.suggestionSection}>
                <Text style={styles.suggestionTitle}>Tips</Text>
                <Text style={styles.suggestionText}>
                  Skriv det exakta användarnamnet för att hitta vänner. Du kan också dela ditt eget användarnamn genom att trycka på delningsknappen.
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Leaderboard Modal */}
      <Modal
        visible={showLeaderboard}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Topplista</Text>
            <TouchableOpacity onPress={() => setShowLeaderboard(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            {/* Timeframe Selector */}
            <View style={styles.timeframeContainer}>
              {(['week', 'month', 'all'] as const).map((timeframe) => (
                <TouchableOpacity
                  key={timeframe}
                  style={[
                    styles.timeframeButton,
                    leaderboardTimeframe === timeframe && styles.activeTimeframeButton
                  ]}
                  onPress={() => setLeaderboardTimeframe(timeframe)}
                >
                  <Text style={[
                    styles.timeframeButtonText,
                    leaderboardTimeframe === timeframe && styles.activeTimeframeButtonText
                  ]}>
                    {timeframe === 'week' ? 'Vecka' : timeframe === 'month' ? 'Månad' : 'Totalt'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Leaderboard */}
            {isLoadingLeaderboard ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Laddar topplista...</Text>
              </View>
            ) : leaderboardData.length > 0 ? (
              <ScrollView style={styles.leaderboardContainer} showsVerticalScrollIndicator={false}>
                {leaderboardData.map((user, index) => (
                  <View key={user.userId} style={[
                    styles.leaderboardItem,
                    user.isCurrentUser && styles.currentUserItem
                  ]}>
                    <View style={styles.leaderboardPosition}>
                      {getPositionIcon(user.position) || (
                        <Text style={[
                          styles.positionText,
                          { color: getPositionColor(user.position) }
                        ]}>
                          {user.position}
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.leaderboardUserInfo}>
                      <View style={styles.friendAvatar}>
                        <Text style={styles.avatarText}>
                          {user.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.userDetails}>
                        <Text style={[
                          styles.leaderboardUserName,
                          user.isCurrentUser && styles.currentUserName
                        ]}>
                          {user.name} {user.isCurrentUser && '(Du)'}
                        </Text>
                        <Text style={styles.leaderboardUserProgram}>
                          {user.program} • {user.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.leaderboardStats}>
                      <Text style={styles.studyTime}>
                        {user.totalHours}h {user.remainingMinutes}m
                      </Text>
                      <Text style={styles.sessionCount}>
                        {user.totalSessions} sessioner
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyLeaderboard}>
                <Trophy size={64} color="#9CA3AF" />
                <Text style={styles.emptyLeaderboardTitle}>Ingen data än</Text>
                <Text style={styles.emptyLeaderboardText}>
                  {leaderboardTimeframe === 'week' 
                    ? 'Ingen har pluggat denna vecka än'
                    : leaderboardTimeframe === 'month'
                    ? 'Ingen har pluggat denna månad än'
                    : 'Ingen studiedata hittades'
                  }
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Share Username Modal */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Dela användarnamn</Text>
            <TouchableOpacity onPress={() => setShowShareModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.shareSection}>
              <Text style={styles.shareTitle}>Ditt användarnamn</Text>
              <View style={styles.usernameCard}>
                <View style={styles.usernameInfo}>
                  {user && (
                    <>
                      <Text style={styles.usernameText}>{user.email ? user.email.split('@')[0] : 'Användarnamn'}</Text>
                      <Text style={styles.usernameSubtext}>Andra kan söka efter detta namn för att lägga till dig som vän</Text>
                    </>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={copyUsernameToClipboard}
                >
                  <Copy size={20} color="#4F46E5" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.shareActions}>
              <TouchableOpacity
                style={styles.shareActionButton}
                onPress={shareUsername}
              >
                <Share2 size={20} color="white" />
                <Text style={styles.shareActionText}>Dela användarnamn</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.copyActionButton}
                onPress={copyUsernameToClipboard}
              >
                <Copy size={20} color="#4F46E5" />
                <Text style={styles.copyActionText}>Kopiera användarnamn</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.instructionsSection}>
              <Text style={styles.instructionsTitle}>Så här fungerar det</Text>
              <Text style={styles.instructionsText}>
                • Dela ditt användarnamn med vänner{"\n"}
                • De kan söka efter ditt exakta användarnamn{"\n"}
                • När de hittar dig kan de skicka en vänförfrågan{"\n"}
                • Du får en notifikation och kan acceptera förfrågan
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    marginRight: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  friendCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    fontSize: 24,
  },

  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  friendProgram: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },

  requestCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
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
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addFriendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchSpinner: {
    marginLeft: 8,
  },
  searchResultsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 8,
    marginLeft: 'auto',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestionSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  
  // Leaderboard styles
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
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
  activeTimeframeButton: {
    backgroundColor: '#4F46E5',
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTimeframeButtonText: {
    color: 'white',
  },
  leaderboardContainer: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#4F46E5',
    backgroundColor: '#F8FAFF',
  },
  leaderboardPosition: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  positionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaderboardUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  leaderboardUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  currentUserName: {
    color: '#4F46E5',
  },
  leaderboardUserProgram: {
    fontSize: 12,
    color: '#6B7280',
  },
  leaderboardStats: {
    alignItems: 'flex-end',
  },
  studyTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  sessionCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyLeaderboard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyLeaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyLeaderboardText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Share modal styles
  shareSection: {
    marginBottom: 24,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  usernameCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  usernameInfo: {
    flex: 1,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  usernameSubtext: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  shareActions: {
    gap: 12,
    marginBottom: 24,
  },
  shareActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  copyActionText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsSection: {
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

});