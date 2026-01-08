import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Trophy, Medal, Crown, Clock, TrendingUp, Users, Star, Award, Target, Zap, Globe } from 'lucide-react-native';
import { useFriends } from '../../contexts/FriendsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useMemo } from 'react';
import { usePremium } from '../../contexts/PremiumContext';
import { useProgress } from '../../contexts/ProgressContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { getGlobalLeaderboardV2 } from '../../../../lib/database';
import { useQuery } from '@tanstack/react-query';

type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'alltime';
type LeaderboardCategory = 'studyTime' | 'streak' | 'sessions';
type LeaderboardMode = 'friends' | 'global';

export default function Leaderboard() {
  const { friends } = useFriends();
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const { userProgress } = useProgress();
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('studyTime');
  const [selectedMode, setSelectedMode] = useState<LeaderboardMode>('friends');

  const { data: globalLeaderboardData = [] } = useQuery({
    queryKey: ['globalLeaderboard', user?.id, selectedPeriod],
    queryFn: () => user?.id ? getGlobalLeaderboardV2(user.id, selectedPeriod) : [],
    enabled: !!user?.id && selectedMode === 'global',
  });

  const leaderboardData = useMemo(() => {
    if (selectedMode === 'global') {
      return globalLeaderboardData.map((item: any, index: number) => ({
        id: item.user_id,
        username: item.username || 'Unknown',
        displayName: item.display_name || item.username || 'Unknown',
        avatarUrl: item.avatar_url,
        studyHours: Math.floor((item.study_time || 0) / 60),
        streak: item.current_streak || item.streak || 0,
        sessions: item.sessions || 0,
        rank: index + 1,
        isCurrentUser: item.user_id === user?.id,
        status: 'online' as const,
        lastActive: new Date().toISOString(),
      }));
    }

    const allUsers = [...friends];
    
    if (user && userProgress) {
      const currentUserData = {
        id: user.id,
        username: 'Du',
        displayName: 'Du',
        avatarUrl: undefined,
        status: 'online' as const,
        studyHours: Math.floor(userProgress.totalStudyTime / 60),
        streak: userProgress.currentStreak,
        sessions: userProgress.totalSessions,
        lastActive: userProgress.lastStudyDate?.toISOString() || new Date().toISOString()
      };
      allUsers.push(currentUserData);
    }

    const sortedUsers = allUsers.sort((a, b) => {
      switch (selectedCategory) {
        case 'studyTime':
          return (b.studyHours || 0) - (a.studyHours || 0);
        case 'streak':
          return (b.streak || 0) - (a.streak || 0);
        case 'sessions':
          return ((b as any).sessions || Math.floor((b.studyHours || 0) / 2)) - 
                 ((a as any).sessions || Math.floor((a.studyHours || 0) / 2));
        default:
          return (b.studyHours || 0) - (a.studyHours || 0);
      }
    });

    return sortedUsers.map((userData, index) => ({
      ...userData,
      rank: index + 1,
      isCurrentUser: userData.id === user?.id
    }));
  }, [friends, user, userProgress, selectedCategory, selectedMode, globalLeaderboardData]);

  const periods = [
    { key: 'daily' as const, label: 'Idag', premium: false },
    { key: 'weekly' as const, label: 'Vecka', premium: false },
    { key: 'monthly' as const, label: 'Månad', premium: true },
    { key: 'alltime' as const, label: 'Totalt', premium: true }
  ];

  const categories = [
    { key: 'studyTime' as const, label: 'Studietid', icon: Clock, unit: 'h' },
    { key: 'streak' as const, label: 'Streak', icon: TrendingUp, unit: 'd' },
    { key: 'sessions' as const, label: 'Sessioner', icon: Target, unit: '' }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Award size={24} color="#CD7F32" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return '#7f8c8d';
    }
  };

  const getStatValue = (userData: any) => {
    if (!userData || typeof userData !== 'object') return '0';
    
    const studyHours = typeof userData.studyHours === 'number' ? userData.studyHours : 0;
    const streak = typeof userData.streak === 'number' ? userData.streak : 0;
    const sessions = typeof userData.sessions === 'number' ? userData.sessions : Math.floor(studyHours / 2);
    
    switch (selectedCategory) {
      case 'studyTime':
        return `${studyHours}h`;
      case 'streak':
        return `${streak}d`;
      case 'sessions':
        return `${sessions}`;
      default:
        return `${studyHours}h`;
    }
  };

  const handlePremiumUpgrade = () => {
    router.push('/premium');
  };

  const getCurrentUserRank = () => {
    const currentUserEntry = leaderboardData.find((entry: any) => entry.isCurrentUser);
    return currentUserEntry?.rank || null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Trophy size={32} color="#FFD700" />
            <Text style={styles.title}>Topplista</Text>
            {isPremium && <Crown size={24} color="#FFD700" />}
          </View>
          <Text style={styles.subtitle}>
            {selectedMode === 'global' 
              ? 'Tävla med alla användare över hela världen!' 
              : 'Tävla med dina vänner och se vem som studerar mest!'}
          </Text>
          
          {getCurrentUserRank() && (
            <View style={styles.userRankBadge}>
              <Text style={styles.userRankText}>
                Din placering: #{getCurrentUserRank()}
              </Text>
              <Zap size={16} color="#4ECDC4" />
            </View>
          )}
        </View>

        {/* Mode Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorTitle}>Läge</Text>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selectedMode === 'friends' && styles.modeButtonSelected
              ]}
              onPress={() => setSelectedMode('friends')}
            >
              <Users size={16} color={selectedMode === 'friends' ? '#fff' : '#4ECDC4'} />
              <Text style={[
                styles.modeButtonText,
                selectedMode === 'friends' && styles.modeButtonTextSelected
              ]}>
                Vänner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selectedMode === 'global' && styles.modeButtonSelected
              ]}
              onPress={() => setSelectedMode('global')}
            >
              <Globe size={16} color={selectedMode === 'global' ? '#fff' : '#4ECDC4'} />
              <Text style={[
                styles.modeButtonText,
                selectedMode === 'global' && styles.modeButtonTextSelected
              ]}>
                Globalt
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorTitle}>Tidsperiod</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodSelector}>
            {periods.map((period) => {
              const isLocked = period.premium && !isPremium;
              const isSelected = selectedPeriod === period.key;
              
              return (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.periodButton,
                    isSelected && styles.periodButtonSelected,
                    isLocked && styles.periodButtonLocked
                  ]}
                  onPress={() => {
                    if (!isLocked) {
                      setSelectedPeriod(period.key);
                    } else {
                      handlePremiumUpgrade();
                    }
                  }}
                  disabled={isLocked}
                >
                  <Text style={[
                    styles.periodButtonText,
                    isSelected && styles.periodButtonTextSelected,
                    isLocked && styles.periodButtonTextLocked
                  ]}>
                    {period.label}
                  </Text>
                  {isLocked && <Crown size={12} color="#FFD700" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Category Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorTitle}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
            {categories.map((category) => {
              const isSelected = selectedCategory === category.key;
              const IconComponent = category.icon;
              
              return (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonSelected
                  ]}
                  onPress={() => setSelectedCategory(category.key)}
                >
                  <IconComponent 
                    size={16} 
                    color={isSelected ? '#fff' : '#4ECDC4'} 
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    isSelected && styles.categoryButtonTextSelected
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Top 3 Podium */}
        {leaderboardData.length >= 3 && (
          <View style={styles.podiumContainer}>
            <View style={styles.podium}>
              {/* Second Place */}
              <View style={[styles.podiumPosition, styles.secondPlace]}>
                <View style={[styles.podiumAvatar, { backgroundColor: getAvatarColor(leaderboardData[1].displayName) }]}>
                  <Text style={styles.podiumAvatarText}>
                    {leaderboardData[1].displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.podiumRank}>
                  <Medal size={20} color="#C0C0C0" />
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {leaderboardData[1].isCurrentUser ? 'Du' : leaderboardData[1].displayName}
                </Text>
                <Text style={styles.podiumScore}>{getStatValue(leaderboardData[1])}</Text>
              </View>

              {/* First Place */}
              <View style={[styles.podiumPosition, styles.firstPlace]}>
                <View style={[styles.podiumAvatar, styles.winnerAvatar, { backgroundColor: getAvatarColor(leaderboardData[0].displayName) }]}>
                  <Text style={styles.podiumAvatarText}>
                    {leaderboardData[0].displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.podiumRank}>
                  <Trophy size={24} color="#FFD700" />
                </View>
                <Text style={[styles.podiumName, styles.winnerName]} numberOfLines={1}>
                  {leaderboardData[0].isCurrentUser ? 'Du' : leaderboardData[0].displayName}
                </Text>
                <Text style={[styles.podiumScore, styles.winnerScore]}>{getStatValue(leaderboardData[0])}</Text>
              </View>

              {/* Third Place */}
              <View style={[styles.podiumPosition, styles.thirdPlace]}>
                <View style={[styles.podiumAvatar, { backgroundColor: getAvatarColor(leaderboardData[2].displayName) }]}>
                  <Text style={styles.podiumAvatarText}>
                    {leaderboardData[2].displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.podiumRank}>
                  <Award size={20} color="#CD7F32" />
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {leaderboardData[2].isCurrentUser ? 'Du' : leaderboardData[2].displayName}
                </Text>
                <Text style={styles.podiumScore}>{getStatValue(leaderboardData[2])}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Full Leaderboard */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>Fullständig rankning</Text>
          
          {leaderboardData.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={64} color="#bdc3c7" />
              <Text style={styles.emptyTitle}>Ingen data än</Text>
              <Text style={styles.emptyText}>
                {selectedMode === 'global' 
                  ? 'Börja studera för att synas på topplistan!'
                  : 'Lägg till vänner för att se topplistor och tävla!'}
              </Text>
              {selectedMode === 'friends' && (
                <TouchableOpacity 
                  style={styles.addFriendsButton}
                  onPress={() => router.push('/(tabs)/friends')}
                >
                  <Users size={16} color="#fff" />
                  <Text style={styles.addFriendsButtonText}>Lägg till vänner</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            leaderboardData.map((userData: any) => (
              <View 
                key={userData.id} 
                style={[
                  styles.leaderboardItem,
                  userData.isCurrentUser && styles.currentUserItem
                ]}
              >
                <View style={styles.itemLeftSection}>
                  <View style={styles.rankContainer}>
                    {getRankIcon(userData.rank) || (
                      <Text style={[styles.rankText, { color: getRankColor(userData.rank) }]}>
                        {userData.rank}
                      </Text>
                    )}
                  </View>
                  
                  <View style={[styles.avatar, { backgroundColor: getAvatarColor(userData.displayName) }]}>
                    <Text style={styles.avatarText}>
                      {userData.displayName.charAt(0).toUpperCase()}
                    </Text>
                    {userData.status === 'studying' && <View style={styles.studyingIndicator} />}
                  </View>
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={[
                    styles.userName,
                    userData.isCurrentUser && styles.currentUserName
                  ]}>
                    {userData.isCurrentUser ? 'Du' : userData.displayName}
                  </Text>
                  <Text style={styles.userStatus}>
                    {userData.status === 'studying' ? 'Studerar nu' : 
                     userData.status === 'online' ? 'Online' : 'Offline'}
                  </Text>
                </View>
                
                <View style={styles.scoreContainer}>
                  <Text style={[
                    styles.scoreValue,
                    userData.isCurrentUser && styles.currentUserScore
                  ]}>
                    {getStatValue(userData)}
                  </Text>
                  {userData.rank <= 3 && (
                    <Star size={12} color={getRankColor(userData.rank)} />
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {!isPremium && (
          <View style={styles.premiumPromo}>
            <View style={styles.premiumPromoContent}>
              <Crown size={32} color="#FFD700" />
              <Text style={styles.premiumPromoTitle}>Uppgradera till Premium</Text>
              <Text style={styles.premiumPromoText}>
                Få tillgång till månads- och totaltopplistor, avancerad statistik och mycket mer!
              </Text>
              <TouchableOpacity 
                style={styles.premiumPromoButton}
                onPress={handlePremiumUpgrade}
              >
                <Text style={styles.premiumPromoButtonText}>Uppgradera nu</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getAvatarColor(name: string): string {
  if (!name || typeof name !== 'string' || name.length === 0) return '#4ECDC4';
  
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
    backgroundColor: '#4ECDC4',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  selectorContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4ECDC4',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  modeButtonSelected: {
    backgroundColor: '#4ECDC4',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#4ECDC4',
  },
  modeButtonTextSelected: {
    color: '#fff',
  },
  periodSelector: {
    flexDirection: 'row',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
    gap: 4,
  },
  periodButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  periodButtonLocked: {
    opacity: 0.6,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#7f8c8d',
  },
  periodButtonTextSelected: {
    color: '#fff',
  },
  periodButtonTextLocked: {
    color: '#bdc3c7',
  },
  categorySelector: {
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    gap: 6,
  },
  categoryButtonSelected: {
    backgroundColor: '#4ECDC4',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#4ECDC4',
  },
  categoryButtonTextSelected: {
    color: '#fff',
  },
  podiumContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 200,
    gap: 8,
  },
  podiumPosition: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 100,
  },
  firstPlace: {
    height: 160,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  secondPlace: {
    height: 140,
    borderWidth: 2,
    borderColor: '#C0C0C0',
  },
  thirdPlace: {
    height: 120,
    borderWidth: 2,
    borderColor: '#CD7F32',
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  winnerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFD700',
    overflow: 'hidden',
  },
  podiumAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  podiumRank: {
    marginBottom: 8,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'center',
  },
  winnerName: {
    fontSize: 16,
    color: '#FFD700',
  },
  podiumScore: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#4ECDC4',
  },
  winnerScore: {
    fontSize: 18,
    color: '#FFD700',
  },
  leaderboardContainer: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  currentUserItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
    marginVertical: 2,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
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
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#2c3e50',
    marginBottom: 3,
  },
  currentUserName: {
    fontWeight: 'bold' as const,
    color: '#4ECDC4',
  },
  userStatus: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 70,
    justifyContent: 'flex-end',
  },
  scoreValue: {
    fontSize: 17,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
  },
  currentUserScore: {
    color: '#4ECDC4',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
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
    fontWeight: 'bold' as const,
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
    fontWeight: '600' as const,
  },
  userRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userRankText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  addFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  addFriendsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
