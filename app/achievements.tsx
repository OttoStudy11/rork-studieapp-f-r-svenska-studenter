import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Trophy, Star, Zap, Medal, Crown, Sparkles } from 'lucide-react-native';
import { useAchievements, Achievement } from '@/contexts/AchievementContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { FadeInView, SlideInView } from '@/components/Animations';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/design-system';

const { width } = Dimensions.get('window');

type CategoryFilter = 'all' | 'study' | 'social' | 'streak' | 'milestone';

const ACHIEVEMENT_CATEGORIES = [
  { id: 'all' as const, label: 'Alla', icon: '🎯', gradient: ['#6366F1', '#8B5CF6'] },
  { id: 'study' as const, label: 'Studier', icon: '📚', gradient: ['#3B82F6', '#2563EB'] },
  { id: 'social' as const, label: 'Socialt', icon: '👥', gradient: ['#10B981', '#059669'] },
  { id: 'streak' as const, label: 'Streak', icon: '🔥', gradient: ['#F59E0B', '#D97706'] },
  { id: 'milestone' as const, label: 'Milstolpar', icon: '🏆', gradient: ['#8B5CF6', '#7C3AED'] },
];

const ACHIEVEMENT_EMOJIS = {
  study: ['📚', '✏️', '🎓', '📖', '💡', '🧠', '📝', '🔬', '🎯', '⚡'],
  social: ['👥', '🤝', '💬', '🎉', '👋', '💪', '🌟', '🎊', '🏅', '💫'],
  streak: ['🔥', '⚡', '💥', '🌟', '✨', '💪', '🎯', '🚀', '⭐', '💫'],
  milestone: ['🏆', '👑', '🎖️', '🥇', '🎯', '🏅', '💎', '🌟', '✨', '🔮'],
};

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
          opacity: isUnlocked ? 1 : 0.85,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {isUnlocked && (
        <View style={styles.shimmerOverlay}>
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.05)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmer}
          />
        </View>
      )}
      
      <View style={styles.achievementContent}>
        <View style={styles.achievementLeft}>
          <LinearGradient
            colors={isUnlocked ? categoryGradient as any : [isDark ? '#374151' : '#E5E7EB', isDark ? '#4B5563' : '#F3F4F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.achievementIconContainer}
          >
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            {!isUnlocked && (
              <View style={styles.lockOverlay}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            )}
          </LinearGradient>
          
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
            
            {isUnlocked && achievement.unlockedAt && (
              <View style={styles.unlockedBadge}>
                <Sparkles size={12} color="#10B981" />
                <Text style={styles.unlockedText}>
                  Upplåst {new Date(achievement.unlockedAt).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.achievementRight}>
          {isUnlocked ? (
            <View style={styles.pointsBadge}>
              <LinearGradient
                colors={['#10B981', '#059669'] as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pointsGradient}
              >
                <Star size={14} color="white" fill="white" />
                <Text style={styles.pointsText}>+{achievement.reward.points}</Text>
              </LinearGradient>
            </View>
          ) : (
            <View style={[styles.lockedPointsBadge, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
              <Text style={[styles.lockedPointsText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {achievement.reward.points}p
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {!isUnlocked && (
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
            { color: isDark ? '#9CA3AF' : '#6B7280' }
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
                <Crown size={32} color="white" />
                <Text style={styles.heroLevelNumber}>Nivå {userLevel.level}</Text>
              </View>
              <Text style={styles.heroLevelTitle}>{userLevel.title}</Text>
            </View>
            
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Trophy size={24} color="white" />
                <Text style={styles.heroStatNumber}>{unlockedAchievements.length}</Text>
                <Text style={styles.heroStatLabel}>Upplåsta</Text>
              </View>
              
              <View style={styles.heroStatDivider} />
              
              <View style={styles.heroStatItem}>
                <Star size={24} color="white" />
                <Text style={styles.heroStatNumber}>{totalPoints}</Text>
                <Text style={styles.heroStatLabel}>Poäng</Text>
              </View>
              
              <View style={styles.heroStatDivider} />
              
              <View style={styles.heroStatItem}>
                <Zap size={24} color="white" />
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
                <Medal size={20} color="#10B981" />
              </View>
              <Text style={[styles.quickStatNumber, { color: theme.colors.text }]}>
                {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
              </Text>
              <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>Slutfört</Text>
            </View>
            
            <View style={[styles.quickStatCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.quickStatIconContainer, { backgroundColor: '#F59E0B' + '20' }]}>
                <Sparkles size={20} color="#F59E0B" />
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
  heroLevelNumber: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: 'white',
    marginTop: SPACING.sm,
    letterSpacing: -1,
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
    gap: SPACING.xs,
  },
  heroStatNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: 'white',
  },
  heroStatLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.8)',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
    overflow: 'hidden',
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  achievementIcon: {
    fontSize: 28,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 20,
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
    marginTop: SPACING.xs,
  },
  unlockedText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#10B981',
  },
  achievementRight: {
    marginLeft: SPACING.md,
  },
  pointsBadge: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  pointsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: 'white',
  },
  lockedPointsBadge: {
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  lockedPointsText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  progressSection: {
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'right',
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
