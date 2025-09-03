import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Award, Trophy, Target, Users, Flame, BookOpen } from 'lucide-react-native';
import { useAchievements, Achievement } from '@/contexts/AchievementContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingScreen } from '@/components/LoadingScreen';

type CategoryFilter = 'all' | 'study' | 'social' | 'streak' | 'milestone';

const categoryIcons = {
  study: BookOpen,
  social: Users,
  streak: Flame,
  milestone: Trophy,
};

const categoryNames = {
  all: 'Alla',
  study: 'Studier',
  social: 'Socialt',
  streak: 'Streak',
  milestone: 'Milstolpar',
};

interface AchievementCardProps {
  achievement: Achievement;
  isDark: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isDark }) => {
  const isUnlocked = !!achievement.unlockedAt;
  const progress = Math.min(100, achievement.progress);
  
  return (
    <View style={[
      styles.achievementCard,
      { 
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        opacity: isUnlocked ? 1 : 0.7
      }
    ]}>
      <View style={styles.achievementHeader}>
        <View style={[
          styles.achievementIconContainer,
          { 
            backgroundColor: isUnlocked 
              ? (isDark ? '#4F46E5' : '#4F46E5')
              : (isDark ? '#374151' : '#F3F4F6')
          }
        ]}>
          <Text style={[
            styles.achievementIcon,
            { color: isUnlocked ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280') }
          ]}>
            {achievement.icon}
          </Text>
        </View>
        <View style={styles.achievementInfo}>
          <Text style={[
            styles.achievementTitle,
            { color: isDark ? '#FFFFFF' : '#111827' }
          ]}>
            {achievement.title}
          </Text>
          <Text style={[
            styles.achievementDescription,
            { color: isDark ? '#9CA3AF' : '#6B7280' }
          ]}>
            {achievement.description}
          </Text>
        </View>
        {isUnlocked && (
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardPoints}>+{achievement.reward.points}</Text>
          </View>
        )}
      </View>
      
      {!isUnlocked && (
        <View style={styles.progressContainer}>
          <View style={[
            styles.progressBar,
            { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
          ]}>
            <View style={[
              styles.progressFill,
              { 
                width: `${progress}%`,
                backgroundColor: '#4F46E5'
              }
            ]} />
          </View>
          <Text style={[
            styles.progressText,
            { color: isDark ? '#9CA3AF' : '#6B7280' }
          ]}>
            {Math.round(progress)}% klar
          </Text>
        </View>
      )}
      
      {isUnlocked && achievement.unlockedAt && (
        <Text style={[
          styles.unlockedDate,
          { color: isDark ? '#9CA3AF' : '#6B7280' }
        ]}>
          Upplåst {new Date(achievement.unlockedAt).toLocaleDateString('sv-SE')}
        </Text>
      )}
    </View>
  );
};

export default function AchievementsScreen() {
  const { isDark } = useTheme();
  const {
    achievements,
    totalPoints,
    getUserLevel,
    getProgressToNextLevel,
    getAchievementsByCategory,
    getUnlockedAchievements,
    isLoading
  } = useAchievements();
  
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  
  const userLevel = getUserLevel();
  const levelProgress = getProgressToNextLevel();
  const unlockedCount = getUnlockedAchievements().length;
  
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : getAchievementsByCategory(selectedCategory);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#F9FAFB' }
    ]}>
      <Stack.Screen 
        options={{
          title: 'Prestationer',
          headerStyle: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#111827',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Header */}
        <View style={[
          styles.statsContainer,
          { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
        ]}>
          <View style={styles.statItem}>
            <View style={[
              styles.statIcon,
              { backgroundColor: '#4F46E5' }
            ]}>
              <Trophy size={20} color="#FFFFFF" />
            </View>
            <Text style={[
              styles.statValue,
              { color: isDark ? '#FFFFFF' : '#111827' }
            ]}>
              {unlockedCount}/{achievements.length}
            </Text>
            <Text style={[
              styles.statLabel,
              { color: isDark ? '#9CA3AF' : '#6B7280' }
            ]}>
              Upplåsta
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[
              styles.statIcon,
              { backgroundColor: '#10B981' }
            ]}>
              <Award size={20} color="#FFFFFF" />
            </View>
            <Text style={[
              styles.statValue,
              { color: isDark ? '#FFFFFF' : '#111827' }
            ]}>
              {totalPoints}
            </Text>
            <Text style={[
              styles.statLabel,
              { color: isDark ? '#9CA3AF' : '#6B7280' }
            ]}>
              Poäng
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[
              styles.statIcon,
              { backgroundColor: '#F59E0B' }
            ]}>
              <Target size={20} color="#FFFFFF" />
            </View>
            <Text style={[
              styles.statValue,
              { color: isDark ? '#FFFFFF' : '#111827' }
            ]}>
              {userLevel.level}
            </Text>
            <Text style={[
              styles.statLabel,
              { color: isDark ? '#9CA3AF' : '#6B7280' }
            ]}>
              {userLevel.title}
            </Text>
          </View>
        </View>
        
        {/* Level Progress */}
        {levelProgress.needed > 0 && (
          <View style={[
            styles.levelProgressContainer,
            { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
          ]}>
            <Text style={[
              styles.levelProgressTitle,
              { color: isDark ? '#FFFFFF' : '#111827' }
            ]}>
              Nästa nivå: {levelProgress.current}/{levelProgress.needed} poäng
            </Text>
            <View style={[
              styles.levelProgressBar,
              { backgroundColor: isDark ? '#374151' : '#F3F4F6' }
            ]}>
              <View style={[
                styles.levelProgressFill,
                { 
                  width: `${levelProgress.progress}%`,
                  backgroundColor: '#4F46E5'
                }
              ]} />
            </View>
          </View>
        )}
        
        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {(Object.keys(categoryNames) as CategoryFilter[]).map((category) => {
              const isSelected = selectedCategory === category;
              const Icon = category === 'all' ? Award : categoryIcons[category as keyof typeof categoryIcons];
              
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: isSelected 
                        ? '#4F46E5' 
                        : (isDark ? '#1F2937' : '#FFFFFF'),
                      borderColor: isSelected 
                        ? '#4F46E5' 
                        : (isDark ? '#374151' : '#E5E7EB')
                    }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Icon 
                    size={16} 
                    color={isSelected ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')} 
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    {
                      color: isSelected 
                        ? '#FFFFFF' 
                        : (isDark ? '#9CA3AF' : '#6B7280')
                    }
                  ]}>
                    {categoryNames[category]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        
        {/* Achievements List */}
        <View style={styles.achievementsContainer}>
          {filteredAchievements.length === 0 ? (
            <View style={[
              styles.emptyState,
              { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
            ]}>
              <Award size={48} color={isDark ? '#4B5563' : '#D1D5DB'} />
              <Text style={[
                styles.emptyStateTitle,
                { color: isDark ? '#9CA3AF' : '#6B7280' }
              ]}>
                Inga prestationer hittades
              </Text>
              <Text style={[
                styles.emptyStateDescription,
                { color: isDark ? '#6B7280' : '#9CA3AF' }
              ]}>
                Fortsätt studera för att låsa upp prestationer!
              </Text>
            </View>
          ) : (
            filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isDark={isDark}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 12,
    marginLeft: -4,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  levelProgressContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelProgressTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryContainer: {
    marginVertical: 8,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsContainer: {
    padding: 16,
    gap: 12,
  },
  achievementCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  rewardBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardPoints: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  unlockedDate: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});