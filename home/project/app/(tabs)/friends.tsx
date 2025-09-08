import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Users, Trophy, Clock, TrendingUp, UserPlus } from 'lucide-react-native';

const mockFriends = [
  { id: '1', name: 'Emma Andersson', studyHours: 156, streak: 12, avatar: null, status: 'online' },
  { id: '2', name: 'Oscar Nilsson', studyHours: 142, streak: 8, avatar: null, status: 'studying' },
  { id: '3', name: 'Maja Eriksson', studyHours: 138, streak: 15, avatar: null, status: 'offline' },
  { id: '4', name: 'Lucas Johansson', studyHours: 125, streak: 6, avatar: null, status: 'online' },
  { id: '5', name: 'Alva Larsson', studyHours: 118, streak: 10, avatar: null, status: 'studying' },
];

export default function Friends() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Vänner & Topplistor</Text>
        <TouchableOpacity style={styles.addButton}>
          <UserPlus size={24} color="#4ECDC4" />
        </TouchableOpacity>
      </View>

      <View style={styles.leaderboardCard}>
        <View style={styles.leaderboardHeader}>
          <Trophy size={24} color="#FFD93D" />
          <Text style={styles.leaderboardTitle}>Veckans topplista</Text>
        </View>
        
        {mockFriends.slice(0, 3).map((friend, index) => (
          <View key={friend.id} style={styles.leaderboardItem}>
            <View style={styles.rank}>
              <Text style={[styles.rankText, index === 0 && styles.goldRank]}>
                {index + 1}
              </Text>
            </View>
            <View style={styles.friendInfo}>
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(friend.name) }]}>
                <Text style={styles.avatarText}>
                  {friend.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.friendDetails}>
                <Text style={styles.friendName}>{friend.name}</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alla vänner</Text>
        {mockFriends.map((friend) => (
          <TouchableOpacity key={friend.id} style={styles.friendCard}>
            <View style={styles.friendCardContent}>
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(friend.name) }]}>
                <Text style={styles.avatarText}>
                  {friend.name.split(' ').map(n => n[0]).join('')}
                </Text>
                {friend.status === 'online' && <View style={styles.onlineIndicator} />}
                {friend.status === 'studying' && <View style={styles.studyingIndicator} />}
              </View>
              <View style={styles.friendCardInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
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

      <TouchableOpacity style={styles.inviteButton}>
        <Users size={20} color="#fff" />
        <Text style={styles.inviteButtonText}>Bjud in vänner</Text>
      </TouchableOpacity>
    </ScrollView>
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
});