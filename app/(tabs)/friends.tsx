import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useStudy } from '@/contexts/StudyContext';
import { Users, Plus, Search, X, UserPlus, Clock, BookOpen, Trophy, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock friends data since we don't have real social features yet
const mockFriends = [
  {
    id: '1',
    name: 'Anna Andersson',
    program: 'Naturvetenskapsprogrammet',
    level: 'gymnasie' as const,
    avatar: '👩‍🎓',
    status: 'online' as const,
    currentActivity: 'Pluggar Matematik 3c',
    todaySessions: 3,
    totalMinutes: 75,
    streak: 5
  },
  {
    id: '2',
    name: 'Erik Eriksson',
    program: 'Civilingenjör Datateknik',
    level: 'högskola' as const,
    avatar: '👨‍💻',
    status: 'studying' as const,
    currentActivity: 'Använder timer - Algoritmer',
    todaySessions: 2,
    totalMinutes: 90,
    streak: 12
  },
  {
    id: '3',
    name: 'Maria Svensson',
    program: 'Samhällsvetenskapsprogrammet',
    level: 'gymnasie' as const,
    avatar: '👩‍📚',
    status: 'offline' as const,
    currentActivity: 'Senast aktiv: 2h sedan',
    todaySessions: 1,
    totalMinutes: 25,
    streak: 3
  },
  {
    id: '4',
    name: 'Johan Johansson',
    program: 'Ekonomiprogrammet',
    level: 'gymnasie' as const,
    avatar: '👨‍💼',
    status: 'online' as const,
    currentActivity: 'Läser anteckningar',
    todaySessions: 4,
    totalMinutes: 120,
    streak: 8
  }
];

const mockFriendRequests = [
  {
    id: '1',
    name: 'Lisa Larsson',
    program: 'Teknikprogrammet',
    level: 'gymnasie' as const,
    avatar: '👩‍🔧',
    mutualFriends: 2
  }
];

export default function FriendsScreen() {
  const { user } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  const filteredFriends = mockFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'studying': return '#F59E0B';
      case 'offline': return '#9CA3AF';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'studying': return 'Pluggar';
      case 'offline': return 'Offline';
      default: return 'Okänd';
    }
  };

  const handleAddFriend = () => {
    Alert.alert('Lägg till vän', 'Sök efter vänner med e-post eller namn');
    setShowAddModal(true);
  };

  const handleAcceptRequest = (friendId: string) => {
    Alert.alert('Vänförfrågan accepterad! 🎉');
  };

  const handleRejectRequest = (friendId: string) => {
    Alert.alert('Vänförfrågan avvisad');
  };

  const sortedFriendsForLeaderboard = [...mockFriends].sort((a, b) => b.totalMinutes - a.totalMinutes);

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
            Vänner ({mockFriends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Förfrågningar ({mockFriendRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'friends' ? (
          <>
            {/* Online Friends First */}
            {filteredFriends.filter(f => f.status !== 'offline').length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Online nu</Text>
                {filteredFriends
                  .filter(f => f.status !== 'offline')
                  .map((friend) => (
                    <TouchableOpacity key={friend.id} style={styles.friendCard}>
                      <View style={styles.friendHeader}>
                        <View style={styles.friendAvatar}>
                          <Text style={styles.avatarText}>{friend.avatar}</Text>
                          <View 
                            style={[styles.statusDot, { backgroundColor: getStatusColor(friend.status) }]} 
                          />
                        </View>
                        <View style={styles.friendInfo}>
                          <Text style={styles.friendName}>{friend.name}</Text>
                          <Text style={styles.friendProgram}>
                            {friend.program} • {friend.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                          </Text>
                          <Text style={styles.friendActivity}>{friend.currentActivity}</Text>
                        </View>
                        <View style={styles.friendStats}>
                          <Text style={styles.statNumber}>{friend.todaySessions}</Text>
                          <Text style={styles.statLabel}>sessioner</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            )}

            {/* Offline Friends */}
            {filteredFriends.filter(f => f.status === 'offline').length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Offline</Text>
                {filteredFriends
                  .filter(f => f.status === 'offline')
                  .map((friend) => (
                    <TouchableOpacity key={friend.id} style={[styles.friendCard, styles.offlineFriend]}>
                      <View style={styles.friendHeader}>
                        <View style={styles.friendAvatar}>
                          <Text style={styles.avatarText}>{friend.avatar}</Text>
                          <View 
                            style={[styles.statusDot, { backgroundColor: getStatusColor(friend.status) }]} 
                          />
                        </View>
                        <View style={styles.friendInfo}>
                          <Text style={styles.friendName}>{friend.name}</Text>
                          <Text style={styles.friendProgram}>
                            {friend.program} • {friend.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                          </Text>
                          <Text style={styles.friendActivity}>{friend.currentActivity}</Text>
                        </View>
                        <View style={styles.friendStats}>
                          <Text style={styles.statNumber}>{friend.todaySessions}</Text>
                          <Text style={styles.statLabel}>sessioner</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            )}

            {filteredFriends.length === 0 && (
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
            {mockFriendRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.avatarText}>{request.avatar}</Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{request.name}</Text>
                    <Text style={styles.friendProgram}>
                      {request.program} • {request.level === 'gymnasie' ? 'Gymnasie' : 'Högskola'}
                    </Text>
                    <Text style={styles.mutualFriends}>
                      {request.mutualFriends} gemensamma vänner
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

            {mockFriendRequests.length === 0 && (
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
              <TextInput
                style={styles.input}
                placeholder="E-post eller namn..."
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <TouchableOpacity style={styles.searchButton}>
              <Search size={20} color="white" />
              <Text style={styles.searchButtonText}>Sök</Text>
            </TouchableOpacity>

            <View style={styles.suggestionSection}>
              <Text style={styles.suggestionTitle}>Förslag</Text>
              <Text style={styles.suggestionText}>
                Här kommer förslag på vänner baserat på ditt program och kurser att visas
              </Text>
            </View>
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
            <Text style={styles.modalTitle}>Topplista - Denna vecka</Text>
            <TouchableOpacity onPress={() => setShowLeaderboard(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {sortedFriendsForLeaderboard.map((friend, index) => (
              <View key={friend.id} style={styles.leaderboardItem}>
                <View style={styles.leaderboardRank}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                  {index < 3 && (
                    <Text style={styles.rankEmoji}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </Text>
                  )}
                </View>
                <View style={styles.friendAvatar}>
                  <Text style={styles.avatarText}>{friend.avatar}</Text>
                </View>
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardName}>{friend.name}</Text>
                  <Text style={styles.leaderboardProgram}>{friend.program}</Text>
                </View>
                <View style={styles.leaderboardStats}>
                  <Text style={styles.leaderboardMinutes}>{friend.totalMinutes} min</Text>
                  <Text style={styles.leaderboardSessions}>{friend.todaySessions} sessioner</Text>
                </View>
              </View>
            ))}
          </ScrollView>
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
  offlineFriend: {
    opacity: 0.7,
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
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
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
  friendActivity: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  friendStats: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
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
  mutualFriends: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
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
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  leaderboardRank: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  rankEmoji: {
    fontSize: 20,
    marginTop: 4,
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  leaderboardProgram: {
    fontSize: 12,
    color: '#6B7280',
  },
  leaderboardStats: {
    alignItems: 'flex-end',
  },
  leaderboardMinutes: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  leaderboardSessions: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});