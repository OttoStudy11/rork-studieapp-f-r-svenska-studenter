import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useProgress } from '../contexts/ProgressContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';

export default function AchievementsScreen() {
  const { achievements, userProgress, recentSessions, todayStats, thisWeekStats } = useProgress();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'achievements' | 'stats' | 'sessions'>('achievements');

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Award;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAchievements = () => (
    <View style={styles.tabContent}>
      <View style={styles.progressOverview}>
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Level {userProgress.level}</Text>
          <Text style={styles.progressSubtitle}>{userProgress.xp} XP</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((userProgress.xp % 1000) / 1000) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {1000 - (userProgress.xp % 1000)} XP till nästa level
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Prestationer</Text>
      <View style={styles.achievementsList}>
        {achievements.map((achievement) => {
          const IconComponent = getIconComponent(achievement.icon);
          const progressPercentage = Math.min((achievement.progress / achievement.requirement) * 100, 100);
          
          return (
            <View 
              key={achievement.id} 
              style={[
                styles.achievementCard,
                achievement.unlocked && styles.achievementUnlocked
              ]}
            >
              <View style={styles.achievementIcon}>
                <IconComponent 
                  size={24} 
                  color={achievement.unlocked ? '#FFD700' : '#95a5a6'} 
                />
              </View>
              <View style={styles.achievementContent}>
                <Text style={[
                  styles.achievementName,
                  achievement.unlocked && styles.achievementNameUnlocked
                ]}>
                  {achievement.name}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                {!achievement.unlocked && (
                  <View style={styles.achievementProgress}>
                    <View style={styles.achievementProgressBar}>
                      <View 
                        style={[
                          styles.achievementProgressFill,
                          { width: `${progressPercentage}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.achievementProgressText}>
                      {achievement.progress}/{achievement.requirement}
                    </Text>
                  </View>
                )}
                {achievement.unlocked && achievement.unlockedAt && (
                  <Text style={styles.achievementUnlockedDate}>
                    Upplåst {formatDate(achievement.unlockedAt)}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userProgress.totalSessions}</Text>
          <Text style={styles.statLabel}>Totala sessioner</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatDuration(userProgress.totalStudyTime)}</Text>
          <Text style={styles.statLabel}>Total studietid</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userProgress.currentStreak}</Text>
          <Text style={styles.statLabel}>Nuvarande streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userProgress.longestStreak}</Text>
          <Text style={styles.statLabel}>Längsta streak</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Idag</Text>
      <View style={styles.dailyStats}>
        <View style={styles.dailyStatItem}>
          <Text style={styles.dailyStatValue}>{todayStats.sessionsCompleted}</Text>
          <Text style={styles.dailyStatLabel}>Sessioner</Text>
        </View>
        <View style={styles.dailyStatItem}>
          <Text style={styles.dailyStatValue}>{formatDuration(todayStats.totalMinutes)}</Text>
          <Text style={styles.dailyStatLabel}>Studietid</Text>
        </View>
        <View style={styles.dailyStatItem}>
          <Text style={styles.dailyStatValue}>{todayStats.coursesStudied.length}</Text>
          <Text style={styles.dailyStatLabel}>Kurser</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Denna vecka</Text>
      <View style={styles.weeklyStats}>
        <View style={styles.weeklyStatItem}>
          <Text style={styles.weeklyStatLabel}>Totala sessioner</Text>
          <Text style={styles.weeklyStatValue}>{thisWeekStats.sessionsCompleted}</Text>
        </View>
        <View style={styles.weeklyStatItem}>
          <Text style={styles.weeklyStatLabel}>Total tid</Text>
          <Text style={styles.weeklyStatValue}>{formatDuration(thisWeekStats.totalMinutes)}</Text>
        </View>
        <View style={styles.weeklyStatItem}>
          <Text style={styles.weeklyStatLabel}>Genomsnittlig session</Text>
          <Text style={styles.weeklyStatValue}>{formatDuration(thisWeekStats.averageSessionLength)}</Text>
        </View>
      </View>
    </View>
  );

  const renderSessions = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Senaste sessioner</Text>
      <View style={styles.sessionsList}>
        {recentSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icons.BookOpen size={48} color="#95a5a6" />
            <Text style={styles.emptyStateText}>Inga sessioner än</Text>
            <Text style={styles.emptyStateSubtext}>
              Starta din första studiesession för att se din progress här
            </Text>
          </View>
        ) : (
          recentSessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionCourse}>{session.courseName}</Text>
                <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
              </View>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionDuration}>{formatDuration(session.duration)}</Text>
                {session.technique && (
                  <Text style={styles.sessionTechnique}>{session.technique}</Text>
                )}
              </View>
              {session.notes && (
                <Text style={styles.sessionNotes}>{session.notes}</Text>
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
          onPress={() => setActiveTab('achievements')}
        >
          <Icons.Award size={20} color={activeTab === 'achievements' ? '#4ECDC4' : '#95a5a6'} />
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
            Prestationer
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Icons.BarChart3 size={20} color={activeTab === 'stats' ? '#4ECDC4' : '#95a5a6'} />
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            Statistik
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
          onPress={() => setActiveTab('sessions')}
        >
          <Icons.Clock size={20} color={activeTab === 'sessions' ? '#4ECDC4' : '#95a5a6'} />
          <Text style={[styles.tabText, activeTab === 'sessions' && styles.activeTabText]}>
            Sessioner
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'sessions' && renderSessions()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#95a5a6',
  },
  activeTabText: {
    color: '#4ECDC4',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  progressOverview: {
    marginBottom: 30,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginBottom: 5,
  },
  progressSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginBottom: 15,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    opacity: 0.7,
  },
  achievementUnlocked: {
    opacity: 1,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  achievementNameUnlocked: {
    color: '#2c3e50',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 8,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  achievementProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 12,
    color: '#7f8c8d',
    minWidth: 40,
  },
  achievementUnlockedDate: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#4ECDC4',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  dailyStats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dailyStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  dailyStatValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    marginBottom: 5,
  },
  dailyStatLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  weeklyStats: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weeklyStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  weeklyStatLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  weeklyStatValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionCourse: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2c3e50',
    flex: 1,
  },
  sessionDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  sessionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 5,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#4ECDC4',
  },
  sessionTechnique: {
    fontSize: 12,
    color: '#7f8c8d',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sessionNotes: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#7f8c8d',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});