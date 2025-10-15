import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, RefreshControl } from 'react-native';
import { Users, Trophy, Clock, TrendingUp, UserPlus, Crown, Lock, Check, X, Bell } from 'lucide-react-native';
import { usePremium } from '@/contexts/PremiumContext';
import { useFriends } from '../../contexts/FriendsContext';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { useState } from 'react';
import FriendSearch from '../../components/FriendSearch';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function Friends() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isPremium, canAddFriend, limits } = usePremium();
  const { 
    friends, 
    friendRequests, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    refreshFriends 
  } = useFriends();
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const currentFriends = friends.length;
  const canAddMoreFriends = canAddFriend(currentFriends);

  const handleAddFriend = () => {
    if (!canAddMoreFriends) {
      Alert.alert(
        'Premium krävs',
        `Du har nått gränsen för vänner (${limits.maxFriends}). Uppgradera till Premium för obegränsade vänner!`,
        [
          { text: 'Avbryt', style: 'cancel' },
          { text: 'Uppgradera', onPress: () => router.push('/premium') }
        ]
      );
      return;
    }
    setShowSearch(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshFriends();
    setRefreshing(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    const { error } = await acceptFriendRequest(requestId);
    if (error) {
      Alert.alert('Fel', error.message || 'Kunde inte acceptera vänförfrågan');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const { error } = await rejectFriendRequest(requestId);
    if (error) {
      Alert.alert('Fel', error.message || 'Kunde inte avvisa vänförfrågan');
    }
  };

  const topFriends = friends
    .sort((a, b) => b.studyHours - a.studyHours)
    .slice(0, 5);

  const totalFriendsStudyHours = friends.reduce((sum, f) => sum + f.studyHours, 0);
  const averageStudyHours = friends.length > 0 ? Math.round(totalFriendsStudyHours / friends.length) : 0;
  const myRank = friends.sort((a, b) => b.studyHours - a.studyHours).findIndex(f => f.id === user?.id) + 1;

  return (
    <>
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Vänner & Topplistor</Text>
          {isPremium && <Crown size={24} color="#FFD700" />}
        </View>
        <View style={styles.headerRight}>
          {friendRequests.length > 0 && (
            <View style={styles.notificationBadge}>
              <Bell size={20} color="#4ECDC4" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{friendRequests.length}</Text>
              </View>
            </View>
          )}
          <Text style={styles.friendsCount}>
            {currentFriends}/{limits.maxFriends === Infinity ? '∞' : limits.maxFriends}
          </Text>
          <TouchableOpacity 
            style={[styles.addButton, !canAddMoreFriends && styles.addButtonDisabled]}
            onPress={handleAddFriend}
          >
            {canAddMoreFriends ? (
              <UserPlus size={24} color="#4ECDC4" />
            ) : (
              <Lock size={24} color="#95a5a6" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards - Similar to Home/Courses */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Users size={24} color="#4ECDC4" />
          <Text style={styles.statValue}>{friends.length}</Text>
          <Text style={styles.statLabel}>Vänner</Text>
        </View>
        <View style={styles.statCard}>
          <Trophy size={24} color="#FFD93D" />
          <Text style={styles.statValue}>#{myRank || '-'}</Text>
          <Text style={styles.statLabel}>Min Rank</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={24} color="#FF6B6B" />
          <Text style={styles.statValue}>{averageStudyHours}h</Text>
          <Text style={styles.statLabel}>Snitt</Text>
        </View>
      </View>

      {/* Friend Requests Section */}
      {friendRequests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Bell size={20} color="#4ECDC4" />
              <Text style={styles.sectionTitle}>Vänförfrågningar</Text>
            </View>
            <View style={styles.requestBadge}>
              <Text style={styles.requestBadgeText}>{friendRequests.length}</Text>
            </View>
          </View>
          
          <View style={styles.requestsContainer}>
            {friendRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={[styles.requestAvatar, { backgroundColor: getAvatarColor(request.fromUser.displayName) }]}>
                  <Text style={styles.requestAvatarText}>
                    {request.fromUser.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{request.fromUser.displayName}</Text>
                  <Text style={styles.requestUsername}>@{request.fromUser.username}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRequest(request.id)}
                  >
                    <Check size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => handleRejectRequest(request.id)}
                  >
                    <X size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Leaderboard Section - Larger Display */}
      {friends.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Trophy size={20} color="#FFD93D" />
              <Text style={styles.sectionTitle}>Veckans Topplista</Text>
            </View>
          </View>
          
          <View style={styles.leaderboardContainer}>
            {topFriends.map((friend, index) => {
              const rankColors = ['#FFD93D', '#C0C0C0', '#CD7F32', '#4ECDC4', '#95a5a6'];
              const rankColor = rankColors[index] || '#95a5a6';
              
              return (
                <TouchableOpacity key={friend.id} style={styles.leaderboardCard}>
                  <View style={styles.leaderboardRank}>
                    <View style={[styles.rankBadge, { backgroundColor: rankColor + '20' }]}>
                      <Text style={[styles.rankNumber, { color: rankColor }]}>#{index + 1}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.leaderboardAvatar, { backgroundColor: getAvatarColor(friend.displayName) }]}>
                    <Text style={styles.leaderboardAvatarText}>
                      {friend.displayName.split(' ').map(n => n[0]).join('')}
                    </Text>
                    {friend.status === 'studying' && <View style={styles.studyingIndicator} />}
                  </View>
                  
                  <View style={styles.leaderboardInfo}>
                    <Text style={styles.leaderboardName}>{friend.displayName}</Text>
                    <View style={styles.leaderboardStats}>
                      <View style={styles.leaderboardStat}>
                        <Clock size={14} color="#7f8c8d" />
                        <Text style={styles.leaderboardStatText}>{friend.studyHours}h</Text>
                      </View>
                      <View style={styles.leaderboardStat}>
                        <TrendingUp size={14} color="#7f8c8d" />
                        <Text style={styles.leaderboardStatText}>{friend.streak}d streak</Text>
                      </View>
                    </View>
                  </View>
                  
                  {index < 3 && (
                    <Trophy size={24} color={rankColor} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* All Friends Section */}
      {friends.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Users size={20} color="#4ECDC4" />
              <Text style={styles.sectionTitle}>Alla Vänner</Text>
            </View>
            <Text style={styles.friendsCountText}>{friends.length}</Text>
          </View>
          
          <View style={styles.friendsGrid}>
            {friends.map((friend) => (
              <TouchableOpacity key={friend.id} style={styles.friendCard}>
                <View style={[styles.friendAvatar, { backgroundColor: getAvatarColor(friend.displayName) }]}>
                  <Text style={styles.friendAvatarText}>
                    {friend.displayName.split(' ').map(n => n[0]).join('')}
                  </Text>
                  {friend.status === 'online' && <View style={styles.onlineIndicator} />}
                  {friend.status === 'studying' && <View style={styles.studyingIndicator} />}
                </View>
                
                <View style={styles.friendCardInfo}>
                  <Text style={styles.friendCardName} numberOfLines={1}>{friend.displayName}</Text>
                  <Text style={styles.friendCardStatus}>
                    {friend.status === 'online' ? '🟢 Online' : 
                     friend.status === 'studying' ? '📚 Studerar' : '⚫ Offline'}
                  </Text>
                </View>
                
                <View style={styles.friendCardStats}>
                  <View style={styles.friendCardStat}>
                    <Clock size={14} color="#4ECDC4" />
                    <Text style={styles.friendCardStatText}>{friend.studyHours}h</Text>
                  </View>
                  <View style={styles.friendCardStat}>
                    <TrendingUp size={14} color="#4ECDC4" />
                    <Text style={styles.friendCardStatText}>{friend.streak}d</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Users size={80} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>Inga vänner än</Text>
          <Text style={styles.emptyText}>
            Börja bygga ditt studienätverk genom att lägga till vänner!
          </Text>
          <TouchableOpacity 
            style={styles.emptyActionButton}
            onPress={handleAddFriend}
          >
            <UserPlus size={20} color="#fff" />
            <Text style={styles.emptyActionText}>Lägg till vänner</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      {friends.length > 0 && (
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, !canAddMoreFriends && styles.actionButtonDisabled]}
            onPress={handleAddFriend}
          >
            <UserPlus size={20} color="#fff" />
            <Text style={styles.actionButtonText}>
              {canAddMoreFriends ? 'Bjud in vänner' : 'Premium krävs'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {!isPremium && (
        <View style={styles.premiumPromo}>
          <View style={styles.premiumPromoContent}>
            <Crown size={32} color="#FFD700" />
            <Text style={styles.premiumPromoTitle}>Uppgradera till Premium</Text>
            <Text style={styles.premiumPromoText}>
              Få obegränsade vänner, avancerad statistik och mycket mer!
            </Text>
            <TouchableOpacity 
              style={styles.premiumPromoButton}
              onPress={() => router.push('/premium')}
            >
              <Text style={styles.premiumPromoButtonText}>Läs mer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
    
    <Modal
      visible={showSearch}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <FriendSearch onClose={() => setShowSearch(false)} />
    </Modal>
    </>
  );
}

function getAvatarColor(name: string): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  friendsCount: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500' as const,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  friendsCountText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#7f8c8d',
  },
  leaderboardContainer: {
    gap: 12,
  },
  leaderboardCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  leaderboardRank: {
    marginRight: 16,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  leaderboardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  leaderboardAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700' as const,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 6,
  },
  leaderboardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  leaderboardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leaderboardStatText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500' as const,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2ecc71',
    borderWidth: 3,
    borderColor: '#fff',
  },
  studyingIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f39c12',
    borderWidth: 3,
    borderColor: '#fff',
  },
  friendsGrid: {
    gap: 16,
  },
  friendCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  friendAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    alignSelf: 'center',
  },
  friendAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700' as const,
  },
  friendCardInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  friendCardName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'center',
  },
  friendCardStatus: {
    fontSize: 13,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  friendCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  friendCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  friendCardStatText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600' as const,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    padding: 18,
    gap: 10,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  actionButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#95a5a6',
  },
  premiumPromo: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  premiumPromoContent: {
    alignItems: 'center',
  },
  premiumPromoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 12,
    marginBottom: 8,
  },
  premiumPromoText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  premiumPromoButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  premiumPromoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationBadge: {
    position: 'relative',
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  requestBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700' as const,
  },
  requestsContainer: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  requestAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  requestAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700' as const,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
  },
  requestUsername: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  rejectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});