import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAchievements, Achievement } from '@/contexts/AchievementContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { FadeInView, SlideInView } from '@/components/Animations';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/design-system';

type CategoryFilter = 'all' | 'study' | 'social' | 'streak' | 'milestone';

const ACHIEVEMENT_CATEGORIES = [
  { id: 'all' as const, label: 'Alla', icon: '🎯', gradient: ['#6366F1', '#8B5CF6'] },
  { id: 'study' as const, label: 'Studier', icon: '📚', gradient: ['#3B82F6', '#2563EB'] },
  { id: 'social' as const, label: 'Socialt', icon: '👥', gradient: ['#10B981', '#059669'] },
  { id: 'streak' as const, label: 'Streak', icon: '🔥', gradient: ['#F59E0B', '#D97706'] },
  { id: 'milestone' as const, label: 'Milstolpar', icon: '🏆', gradient: ['#8B5CF6', '#7C3AED'] },
];

interface AchievementCardProps {
  achievement: Achievement;
  isDark: boolean;
  onPress?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isDark, onPress }) => {
  const isUnlocked = !!achievement.unlockedAt;
  const progress = Math.min(100, achievement.progress);
  
  const categoryGradient = ACHIEVEMENT_CATEGORIES.find(c => c.id === achievement.category)?.gradient || ['#6366F1', '#8B5CF6'];

  return (
    <TouchableOpacity 
      style={[
        styles.achievementCard,
        { 
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          opacity: isUnlocked ? 1 : 0.7,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      {isUnlocked && (
        <View style={styles.shimmerOverlay}>
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmer}
          />
        </View>
      )}
      
      <View style={styles.achievementContent}>
        <View style={styles.achievementLeft}>
          <View
            style={[
              styles.achievementIconContainer,
              { 
                backgroundColor: isUnlocked 
                  ? categoryGradient[0] + '20' 
                  : (isDark ? '#374151' : '#F3F4F6')
              }
            ]}
          >
            <Text style={[
              styles.achievementIcon,
              !isUnlocked && styles.achievementIconLocked
            ]}>
              {achievement.icon}
            </Text>
            {!isUnlocked && (
              <View style={styles.lockOverlay}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            )}
          </View>
          
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementTitle,
              { color: isDark ? '#FFFFFF' : '#111827' },
              !isUnlocked && { opacity: 0.6 }
            ]}>
              {achievement.title}
            </Text>
            <Text style={[
              styles.achievementDescription,
              { color: isDark ? '#9CA3AF' : '#6B7280' }
            ]}>
              {achievement.description}
            </Text>
            
            {isUnlocked && achievement.unlockedAt && (
              <View style={styles.unlockedBadge}>
                <Text style={styles.unlockedEmoji}>✨</Text>
                <Text style={styles.unlockedText}>
                  {new Date(achievement.unlockedAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.achievementRight}>
          {isUnlocked ? (
            <LinearGradient
              colors={categoryGradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pointsBadge}
            >
              <Text style={styles.pointsEmoji}>⭐</Text>
              <Text style={styles.pointsText}>{achievement.reward.points}</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.lockedPointsBadge, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
              <Text style={[styles.lockedPointsText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                {achievement.reward.points}p
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {!isUnlocked && progress > 0 && (
        <View style={styles.progressSection}>
          <View style={[
            styles.progressBar,
            { backgroundColor: isDark ? '#374151' : '#E5E7EB' }
          ]}>
            <LinearGradient
              colors={categoryGradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={[
            styles.progressText,
            { color: isDark ? '#6B7280' : '#9CA3AF' }
          ]}>
            {Math.round(progress)}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function AchievementsScreen() {
  const { theme, isDark } = useTheme();
  const {
    achievements,
    totalPoints,
    getUserLevel,
    getProgressToNextLevel,
    getAchievementsByCategory,
    getUnlockedAchievements,
    currentStreak,
    isLoading
  } = useAchievements();
  
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  
  const userLevel = getUserLevel();
  const levelProgress = getProgressToNextLevel();
  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);
  
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : getAchievementsByCategory(selectedCategory);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Custom Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Prestationer</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Stats Card */}
        <SlideInView direction="up" delay={100}>
          <LinearGradient
            colors={theme.colors.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroLevelBadge}>
                <Text style={styles.heroLevelIcon}>👑</Text>
                <Text style={styles.heroLevelNumber}>Nivå {userLevel.level}</Text>
              </View>
              <Text style={styles.heroLevelTitle}>{userLevel.title}</Text>
            </View>
            
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatEmoji}>🏆</Text>
                <Text style={styles.heroStatNumber}>{unlockedAchievements.length}</Text>
                <Text style={styles.heroStatLabel}>Upplåsta</Text>
              </View>
              
              <View style={styles.heroStatDivider} />
              
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatEmoji}>⭐</Text>
                <Text style={styles.heroStatNumber}>{totalPoints}</Text>
                <Text style={styles.heroStatLabel}>Poäng</Text>
              </View>
              
              <View style={styles.heroStatDivider} />
              
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatEmoji}>🔥</Text>
                <Text style={styles.heroStatNumber}>{currentStreak}</Text>
                <Text style={styles.heroStatLabel}>Streak</Text>
              </View>
            </View>
            
            {levelProgress.needed > 0 && (
              <View style={styles.heroProgress}>
                <Text style={styles.heroProgressText}>
                  {levelProgress.current}/{levelProgress.needed} poäng till nästa nivå
                </Text>
                <View style={styles.heroProgressBar}>
                  <View style={[styles.heroProgressFill, { width: `${levelProgress.progress}%` }]} />
                </View>
              </View>
            )}
          </LinearGradient>
        </SlideInView>

        {/* Quick Stats */}
        <SlideInView direction="up" delay={200}>
          <View style={styles.quickStatsContainer}>
            <View style={[styles.quickStatCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.quickStatIconContainer, { backgroundColor: '#10B981' + '20' }]}>
                <Text style={styles.quickStatEmoji}>🎯</Text>
              </View>
              <Text style={[styles.quickStatNumber, { color: theme.colors.text }]}>
                {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
              </Text>
              <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>Slutfört</Text>
            </View>
            
            <View style={[styles.quickStatCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.quickStatIconContainer, { backgroundColor: '#F59E0B' + '20' }]}>
                <Text style={styles.quickStatEmoji}>✨</Text>
              </View>
              <Text style={[styles.quickStatNumber, { color: theme.colors.text }]}>
                {lockedAchievements.length}
              </Text>
              <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>Återstår</Text>
            </View>
          </View>
        </SlideInView>

        {/* Category Filter */}
        <SlideInView direction="up" delay={300}>
          <View style={styles.categoryContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {ACHIEVEMENT_CATEGORIES.map((category, index) => {
                const isSelected = selectedCategory === category.id;
                
                return (
                  <FadeInView key={category.id} delay={350 + index * 50}>
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        { 
                          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                          borderColor: isSelected ? category.gradient[0] : (isDark ? '#374151' : '#E5E7EB'),
                          borderWidth: isSelected ? 2 : 1,
                        }
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                      activeOpacity={0.7}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={category.gradient as any}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.categoryButtonSelected}
                        >
                          <Text style={styles.categoryIconSelected}>{category.icon}</Text>
                          <Text style={styles.categoryLabelSelected}>{category.label}</Text>
                        </LinearGradient>
                      ) : (
                        <>
                          <Text style={styles.categoryIcon}>{category.icon}</Text>
                          <Text style={[styles.categoryLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                            {category.label}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </FadeInView>
                );
              })}
            </ScrollView>
          </View>
        </SlideInView>
        
        {/* Achievements List */}
        <View style={styles.achievementsContainer}>
          {filteredAchievements.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                Inga prestationer
              </Text>
              <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
                Fortsätt studera för att låsa upp prestationer!
              </Text>
            </View>
          ) : (
            filteredAchievements.map((achievement, index) => (
              <FadeInView key={achievement.id} delay={400 + index * 50}>
                <AchievementCard
                  achievement={achievement}
                  isDark={isDark}
                />
              </FadeInView>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
  },
  heroCard: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    ...SHADOWS.lg,
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroLevelBadge: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroLevelIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  heroLevelNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: 'white',
    letterSpacing: -0.5,
  },
  heroLevelTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: SPACING.lg,
  },
  heroStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  heroStatEmoji: {
    fontSize: 28,
  },
  heroStatNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: 'white',
    marginTop: 2,
  },
  heroStatLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroProgress: {
    gap: SPACING.sm,
  },
  heroProgressText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  heroProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  quickStatIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickStatEmoji: {
    fontSize: 24,
  },
  quickStatNumber: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.xs,
  },
  quickStatLabel: {
    ...TYPOGRAPHY.caption,
  },
  categoryContainer: {
    marginBottom: SPACING.xl,
  },
  categoryScrollContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  categoryButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  categoryButtonSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  categoryIconSelected: {
    fontSize: 18,
  },
  categoryLabelSelected: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: 'white',
  },
  categoryIcon: {
    fontSize: 18,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginRight: SPACING.lg,
  },
  achievementsContainer: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  achievementCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmer: {
    flex: 1,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  achievementLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: SPACING.md,
  },
  achievementIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  achievementIcon: {
    fontSize: 36,
  },
  achievementIconLocked: {
    opacity: 0.4,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  achievementTitle: {
    ...TYPOGRAPHY.labelLarge,
  },
  achievementDescription: {
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 18,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  unlockedEmoji: {
    fontSize: 12,
  },
  unlockedText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  achievementRight: {
    marginLeft: SPACING.md,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
    ...SHADOWS.sm,
  },
  pointsEmoji: {
    fontSize: 16,
  },
  pointsText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: 'white',
  },
  lockedPointsBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  lockedPointsText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  progressSection: {
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'right',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.massive,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    ...TYPOGRAPHY.bodyMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
});
