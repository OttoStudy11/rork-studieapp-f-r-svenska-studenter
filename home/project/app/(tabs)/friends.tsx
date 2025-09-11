import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, RefreshControl } from 'react-native';
import { Users, Trophy, Clock, TrendingUp, UserPlus, Crown, Lock, Check, X, Bell } from 'lucide-react-native';
import { usePremium } from '@/contexts/PremiumContext';
import { useFriends } from '../../contexts/FriendsContext';
import { router } from 'expo-router';
import { useState } from 'react';
import FriendSearch from '../../components/FriendSearch';



export default function Friends() {
  const { isPremium, canAddFriend, limits } = usePremium();
  const { 
    friends, 
    friendRequests, 
    isLoading, 
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

  return (
    <>
    <ScrollView 
      style={styles.container} 
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

      {friendRequests.length > 0 && (
        <View style={styles.requestsCard}>
          <View style={styles.requestsHeader}>
            <Bell size={24} color="#4ECDC4" />
            <Text style={styles.requestsTitle}>Vänförfrågningar ({friendRequests.length})</Text>
          </View>
          
          {friendRequests.map((request) => (
            <View key={request.id} style={styles.requestItem}>
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(request.fromUser.displayName) }]}>
                <Text style={styles.avatarText}>
                  {request.fromUser.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.requestInfo}>
                <Text style={styles.friendName}>{request.fromUser.displayName}</Text>
                <Text style={styles.requestUsername}>@{request.fromUser.username}</Text>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => handleAcceptRequest(request.id)}
                >
                  <Check size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={() => handleRejectRequest(request.id)}
                >
                  <X size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {friends.length > 0 && (
        <View style={styles.leaderboardCard}>
          <View style={styles.leaderboardHeader}>
            <Trophy size={24} color="#FFD93D" />
            <Text style={styles.leaderboardTitle}>Veckans topplista</Text>
          </View>
          
          {friends
            .sort((a, b) => b.studyHours - a.studyHours)
            .slice(0, 3)
            .map((friend, index) => (
            <View key={friend.id} style={styles.leaderboardItem}>
              <View style={styles.rank}>
                <Text style={[styles.rankText, index === 0 && styles.goldRank]}>
                  {index + 1}
                </Text>
              </View>
              <View style={styles.friendInfo}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(friend.displayName) }]}>
                  <Text style={styles.avatarText}>
                    {friend.displayName.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>{friend.displayName}</Text>
                  <View style={styles.friendStats}>
                    <Clock size={12} color="#7f8c8d" />
                    <Text style={styles.friendStatText}>{friend.studyHours}h</Text>
                  </View>
                </View>
              </View>
              {index === 0 && <Trophy size={20} color="#FFD93D" />}
              {index === 1 && <Trophy size={20} color="#C0C0C0" />}
              {index === 2 && <Trophy size={20} color="#CD7F32" />}
            </View>
          ))}
        </View>
      )}

      {friends.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alla vänner ({friends.length})</Text>
          {friends.map((friend) => (
            <TouchableOpacity key={friend.id} style={styles.friendCard}>
              <View style={styles.friendCardContent}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(friend.displayName) }]}>
                  <Text style={styles.avatarText}>
                    {friend.displayName.split(' ').map(n => n[0]).join('')}
                  </Text>
                  {friend.status === 'online' && <View style={styles.onlineIndicator} />}
                  {friend.status === 'studying' && <View style={styles.studyingIndicator} />}
                </View>
                <View style={styles.friendCardInfo}>
                  <Text style={styles.friendName}>{friend.displayName}</Text>
                  <Text style={styles.statusText}>
                    {friend.status === 'online' ? 'Online' : 
                     friend.status === 'studying' ? 'Studerar' : 'Offline'}
                  </Text>
                </View>
                <View style={styles.friendCardStats}>
                  <View style={styles.statItem}>
                    <Clock size={14} color="#7f8c8d" />
                    <Text style={styles.statValue}>{friend.studyHours}h</Text>
                  </View>
                  <View style={styles.statItem}>
                    <TrendingUp size={14} color="#7f8c8d" />
                    <Text style={styles.statValue}>{friend.streak}d</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Users size={64} color="#bdc3c7" />
          <Text style={styles.emptyTitle}>Inga vänner än</Text>
          <Text style={styles.emptyText}>
            Börja bygga ditt studienätverk genom att lägga till vänner!
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.inviteButton, !canAddMoreFriends && styles.inviteButtonDisabled]}
        onPress={handleAddFriend}
      >
        <Users size={20} color="#fff" />
        <Text style={styles.inviteButtonText}>
          {canAddMoreFriends ? 'Bjud in vänner' : 'Premium krävs för fler vänner'}
        </Text>
      </TouchableOpacity>
      
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
    fontWeight: '500',
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
  leaderboardCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rank: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#7f8c8d',
  },
  goldRank: {
    color: '#FFD93D',
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: '#fff',
  },
  studyingIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f39c12',
    borderWidth: 2,
    borderColor: '#fff',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#2c3e50',
    marginBottom: 2,
  },
  friendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendStatText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 15,
  },
  friendCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  friendCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendCardInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  friendCardStats: {
    flexDirection: 'row',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500' as const,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  inviteButtonDisabled: {
    opacity: 0.7,
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
  requestsCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  requestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  requestsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestUsername: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
});