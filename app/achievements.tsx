import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { 
  ArrowLeft, 
  Info, 
  X, 
  Zap, 
  Trophy, 
  Target, 
  Flame,
  ChevronRight,
  Gift,
  CheckCircle,
  Lock
} from 'lucide-react-native';
import { useGamification, TIER_COLORS, RARITY_COLORS, DIFFICULTY_CONFIG, Achievement, DailyChallenge } from '@/contexts/GamificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { FadeInView, SlideInView } from '@/components/Animations';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/design-system';
import { LEVELS, formatXp, TIER_NAMES, RARITY_NAMES, TierType } from '@/constants/gamification';
import * as Haptics from 'expo-haptics';



type TabType = 'overview' | 'achievements' | 'challenges' | 'levels';

const TABS = [
  { id: 'overview' as const, label: 'Översikt', icon: '📊' },
  { id: 'achievements' as const, label: 'Prestationer', icon: '🏆' },
  { id: 'challenges' as const, label: 'Utmaningar', icon: '🎯' },
  { id: 'levels' as const, label: 'Nivåer', icon: '⭐' },
];

interface AchievementCardProps {
  achievement: Achievement;
  isDark: boolean;
  onClaim?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isDark, onClaim }) => {
  const isUnlocked = achievement.isUnlocked;
  const canClaim = isUnlocked && !achievement.isClaimed;
  const progress = Math.min(100, achievement.progress);
  const rarityColor = RARITY_COLORS[achievement.rarity];

  return (
    <View 
      style={[
        styles.achievementCard,
        { 
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderLeftWidth: 4,
          borderLeftColor: isUnlocked ? rarityColor : (isDark ? '#374151' : '#E5E7EB'),
        }
      ]}
    >
      <View style={styles.achievementContent}>
        <View style={styles.achievementLeft}>
          <View
            style={[
              styles.achievementIconContainer,
              { 
                backgroundColor: isUnlocked 
                  ? rarityColor + '20' 
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
                <Lock size={16} color="#9CA3AF" />
              </View>
            )}
          </View>
          
          <View style={styles.achievementInfo}>
            <View style={styles.achievementHeader}>
              <Text style={[
                styles.achievementTitle,
                { color: isDark ? '#FFFFFF' : '#111827' },
                !isUnlocked && { opacity: 0.6 }
              ]}>
                {achievement.title}
              </Text>
              <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
                <Text style={[styles.rarityText, { color: rarityColor }]}>
                  {RARITY_NAMES[achievement.rarity].sv}
                </Text>
              </View>
            </View>
            <Text style={[
              styles.achievementDescription,
              { color: isDark ? '#9CA3AF' : '#6B7280' }
            ]}>
              {achievement.description}
            </Text>
            
            {isUnlocked && achievement.unlockedAt && (
              <View style={styles.unlockedBadge}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={styles.unlockedText}>
                  Upplåst {new Date(achievement.unlockedAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.achievementRight}>
          {canClaim ? (
            <TouchableOpacity
              style={[styles.claimButton, { backgroundColor: rarityColor }]}
              onPress={onClaim}
              activeOpacity={0.8}
            >
              <Gift size={14} color="#FFFFFF" />
              <Text style={styles.claimButtonText}>+{achievement.xpReward}</Text>
            </TouchableOpacity>
          ) : isUnlocked ? (
            <View style={[styles.claimedBadge, { backgroundColor: '#10B981' + '20' }]}>
              <CheckCircle size={14} color="#10B981" />
              <Text style={[styles.claimedText, { color: '#10B981' }]}>
                +{achievement.xpReward}
              </Text>
            </View>
          ) : (
            <View style={[styles.xpPreview, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
              <Zap size={12} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <Text style={[styles.xpPreviewText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                {achievement.xpReward} XP
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
            <View
              style={[styles.progressFill, { width: `${progress}%`, backgroundColor: rarityColor }]}
            />
          </View>
          <Text style={[
            styles.progressText,
            { color: isDark ? '#6B7280' : '#9CA3AF' }
          ]}>
            {Math.round(progress)}% klar
          </Text>
        </View>
      )}
    </View>
  );
};

interface ChallengeCardProps {
  challenge: DailyChallenge;
  isDark: boolean;
  onClaim?: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, isDark, onClaim }) => {
  const difficultyConfig = DIFFICULTY_CONFIG[challenge.difficulty];
  const progress = Math.min(100, (challenge.currentProgress / challenge.targetValue) * 100);
  const canClaim = challenge.isCompleted && !challenge.isClaimed;

  return (
    <View 
      style={[
        styles.challengeCard,
        { 
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderColor: challenge.isCompleted ? '#10B981' : (isDark ? '#374151' : '#E5E7EB'),
          borderWidth: challenge.isCompleted ? 2 : 1,
        }
      ]}
    >
      <View style={styles.challengeHeader}>
        <View style={styles.challengeLeft}>
          <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
          <View style={styles.challengeInfo}>
            <Text style={[styles.challengeTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {challenge.title}
            </Text>
            <Text style={[styles.challengeDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {challenge.description}
            </Text>
          </View>
        </View>
        
        <View style={styles.challengeRight}>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyConfig.color + '20' }]}>
            <Text style={[styles.difficultyText, { color: difficultyConfig.color }]}>
              {difficultyConfig.label}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.challengeProgress}>
        <View style={[styles.challengeProgressBar, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
          <View
            style={[
              styles.challengeProgressFill, 
              { 
                width: `${progress}%`, 
                backgroundColor: challenge.isCompleted ? '#10B981' : difficultyConfig.color 
              }
            ]}
          />
        </View>
        <Text style={[styles.challengeProgressText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {challenge.currentProgress}/{challenge.targetValue}
        </Text>
      </View>

      <View style={styles.challengeFooter}>
        <View style={styles.xpRewardContainer}>
          <Zap size={14} color="#F59E0B" />
          <Text style={[styles.xpRewardText, { color: '#F59E0B' }]}>
            +{challenge.xpReward} XP
          </Text>
        </View>
        
        {canClaim ? (
          <TouchableOpacity
            style={styles.claimChallengeButton}
            onPress={onClaim}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.claimChallengeGradient}
            >
              <Gift size={14} color="#FFFFFF" />
              <Text style={styles.claimChallengeText}>Hämta belöning</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : challenge.isClaimed ? (
          <View style={styles.challengeClaimedBadge}>
            <CheckCircle size={14} color="#10B981" />
            <Text style={styles.challengeClaimedText}>Hämtad</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

interface LevelCardProps {
  level: typeof LEVELS[0];
  isCurrentLevel: boolean;
  isUnlocked: boolean;
  isDark: boolean;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, isCurrentLevel, isUnlocked, isDark }) => {
  const tierColor = TIER_COLORS[level.tier];

  return (
    <View 
      style={[
        styles.levelCard,
        { 
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderColor: isCurrentLevel ? tierColor : 'transparent',
          borderWidth: isCurrentLevel ? 2 : 0,
          opacity: isUnlocked ? 1 : 0.5,
        }
      ]}
    >
      {isCurrentLevel && (
        <View style={[styles.currentLevelBadge, { backgroundColor: tierColor }]}>
          <Text style={styles.currentLevelText}>Nu</Text>
        </View>
      )}
      
      <Text style={styles.levelEmoji}>{level.iconEmoji}</Text>
      <Text style={[styles.levelNumber, { color: tierColor }]}>Nivå {level.level}</Text>
      <Text style={[styles.levelTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
        {level.titleSv}
      </Text>
      <Text style={[styles.levelXp, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
        {formatXp(level.requiredXp)} XP
      </Text>
      
      {!isUnlocked && (
        <View style={styles.levelLockOverlay}>
          <Lock size={20} color="#9CA3AF" />
        </View>
      )}
    </View>
  );
};

export default function AchievementsScreen() {
  const { theme, isDark } = useTheme();
  const {
    totalXp,
    currentLevel,
    xpProgress,
    streak,
    achievements,
    dailyChallenges,
    unclaimedAchievements,
    unclaimedChallenges,
    claimAchievement,
    claimChallenge,
    isLoading,
    isReady,
  } = useGamification();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);
  const completedChallenges = dailyChallenges.filter(c => c.isCompleted);

  const handleClaimAchievement = useCallback(async (achievementId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await claimAchievement(achievementId);
    } catch (error) {
      console.log('Error claiming achievement:', error);
    }
  }, [claimAchievement]);

  const handleClaimChallenge = useCallback(async (challengeId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await claimChallenge(challengeId);
    } catch (error) {
      console.log('Error claiming challenge:', error);
    }
  }, [claimChallenge]);

  if (isLoading || !isReady) {
    return <LoadingScreen />;
  }

  const tierColor = TIER_COLORS[currentLevel.tier];

  const renderOverview = () => (
    <>
      {/* Hero Card */}
      <SlideInView direction="up" delay={100}>
        <LinearGradient
          colors={[tierColor, tierColor + 'DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroLevelSection}>
              <Text style={styles.heroEmoji}>{currentLevel.iconEmoji}</Text>
              <View>
                <Text style={styles.heroLevelLabel}>Nivå {currentLevel.level}</Text>
                <Text style={styles.heroLevelTitle}>{currentLevel.titleSv}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowInfoModal(true)}
            >
              <Info size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroXpSection}>
            <View style={styles.xpRow}>
              <Zap size={18} color="#FFFFFF" />
              <Text style={styles.heroXpText}>{formatXp(totalXp)} XP totalt</Text>
            </View>
            {xpProgress.nextLevel && (
              <>
                <View style={styles.heroProgressBar}>
                  <View style={[styles.heroProgressFill, { width: `${xpProgress.percent}%` }]} />
                </View>
                <Text style={styles.heroProgressText}>
                  {xpProgress.current} / {xpProgress.required} XP till nivå {xpProgress.nextLevel.level}
                </Text>
              </>
            )}
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Flame size={20} color="#FFFFFF" />
              <Text style={styles.heroStatValue}>{streak}</Text>
              <Text style={styles.heroStatLabel}>Streak</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Trophy size={20} color="#FFFFFF" />
              <Text style={styles.heroStatValue}>{unlockedAchievements.length}</Text>
              <Text style={styles.heroStatLabel}>Prestationer</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Target size={20} color="#FFFFFF" />
              <Text style={styles.heroStatValue}>{completedChallenges.length}/{dailyChallenges.length}</Text>
              <Text style={styles.heroStatLabel}>Utmaningar</Text>
            </View>
          </View>
        </LinearGradient>
      </SlideInView>

      {/* Unclaimed Rewards Alert */}
      {(unclaimedAchievements > 0 || unclaimedChallenges > 0) && (
        <SlideInView direction="up" delay={200}>
          <TouchableOpacity
            style={[styles.unclaimedAlert, { backgroundColor: '#F59E0B' + '15' }]}
            onPress={() => setActiveTab(unclaimedAchievements > 0 ? 'achievements' : 'challenges')}
            activeOpacity={0.8}
          >
            <View style={styles.unclaimedContent}>
              <Gift size={20} color="#F59E0B" />
              <Text style={[styles.unclaimedText, { color: '#F59E0B' }]}>
                Du har {unclaimedAchievements + unclaimedChallenges} belöningar att hämta!
              </Text>
            </View>
            <ChevronRight size={20} color="#F59E0B" />
          </TouchableOpacity>
        </SlideInView>
      )}

      {/* Today's Challenges */}
      <SlideInView direction="up" delay={300}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Dagens utmaningar</Text>
          <TouchableOpacity onPress={() => setActiveTab('challenges')}>
            <Text style={[styles.sectionLink, { color: tierColor }]}>Visa alla</Text>
          </TouchableOpacity>
        </View>
        
        {dailyChallenges.slice(0, 3).map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            isDark={isDark}
            onClaim={() => handleClaimChallenge(challenge.id)}
          />
        ))}
      </SlideInView>

      {/* Recent Achievements */}
      {unlockedAchievements.length > 0 && (
        <SlideInView direction="up" delay={400}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Senaste prestationer</Text>
            <TouchableOpacity onPress={() => setActiveTab('achievements')}>
              <Text style={[styles.sectionLink, { color: tierColor }]}>Visa alla</Text>
            </TouchableOpacity>
          </View>
          
          {unlockedAchievements.slice(0, 3).map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isDark={isDark}
              onClaim={() => handleClaimAchievement(achievement.id)}
            />
          ))}
        </SlideInView>
      )}
    </>
  );

  const renderAchievements = () => (
    <>
      {/* Stats Summary */}
      <SlideInView direction="up" delay={100}>
        <View style={styles.achievementStats}>
          <View style={[styles.achievementStatCard, { backgroundColor: theme.colors.card }]}>
            <Text style={styles.achievementStatEmoji}>🏆</Text>
            <Text style={[styles.achievementStatValue, { color: theme.colors.text }]}>
              {unlockedAchievements.length}/{achievements.length}
            </Text>
            <Text style={[styles.achievementStatLabel, { color: theme.colors.textSecondary }]}>
              Upplåsta
            </Text>
          </View>
          <View style={[styles.achievementStatCard, { backgroundColor: theme.colors.card }]}>
            <Text style={styles.achievementStatEmoji}>✨</Text>
            <Text style={[styles.achievementStatValue, { color: theme.colors.text }]}>
              {Math.round((unlockedAchievements.length / Math.max(1, achievements.length)) * 100)}%
            </Text>
            <Text style={[styles.achievementStatLabel, { color: theme.colors.textSecondary }]}>
              Framsteg
            </Text>
          </View>
        </View>
      </SlideInView>

      {/* Claimable Achievements */}
      {achievements.filter(a => a.isUnlocked && !a.isClaimed).length > 0 && (
        <SlideInView direction="up" delay={150}>
          <Text style={[styles.achievementSectionTitle, { color: '#F59E0B' }]}>
            🎁 Att hämta
          </Text>
          {achievements.filter(a => a.isUnlocked && !a.isClaimed).map((achievement, index) => (
            <FadeInView key={achievement.id} delay={200 + index * 50}>
              <AchievementCard
                achievement={achievement}
                isDark={isDark}
                onClaim={() => handleClaimAchievement(achievement.id)}
              />
            </FadeInView>
          ))}
        </SlideInView>
      )}

      {/* Unlocked Achievements */}
      {unlockedAchievements.filter(a => a.isClaimed).length > 0 && (
        <SlideInView direction="up" delay={200}>
          <Text style={[styles.achievementSectionTitle, { color: '#10B981' }]}>
            ✅ Avklarade
          </Text>
          {unlockedAchievements.filter(a => a.isClaimed).map((achievement, index) => (
            <FadeInView key={achievement.id} delay={250 + index * 50}>
              <AchievementCard
                achievement={achievement}
                isDark={isDark}
              />
            </FadeInView>
          ))}
        </SlideInView>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <SlideInView direction="up" delay={300}>
          <Text style={[styles.achievementSectionTitle, { color: theme.colors.textSecondary }]}>
            🔒 Låsta ({lockedAchievements.length})
          </Text>
          {lockedAchievements.map((achievement, index) => (
            <FadeInView key={achievement.id} delay={350 + index * 50}>
              <AchievementCard
                achievement={achievement}
                isDark={isDark}
              />
            </FadeInView>
          ))}
        </SlideInView>
      )}

      {achievements.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Inga prestationer än
          </Text>
          <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
            Fortsätt studera för att låsa upp prestationer!
          </Text>
        </View>
      )}
    </>
  );

  const renderChallenges = () => (
    <>
      <SlideInView direction="up" delay={100}>
        <View style={[styles.challengeHeader, { backgroundColor: theme.colors.card }]}>
          <View style={styles.challengeHeaderContent}>
            <Text style={styles.challengeHeaderEmoji}>🎯</Text>
            <View>
              <Text style={[styles.challengeHeaderTitle, { color: theme.colors.text }]}>
                Dagliga utmaningar
              </Text>
              <Text style={[styles.challengeHeaderSubtitle, { color: theme.colors.textSecondary }]}>
                Återställs vid midnatt
              </Text>
            </View>
          </View>
          <View style={styles.challengeHeaderStats}>
            <Text style={[styles.challengeHeaderProgress, { color: tierColor }]}>
              {completedChallenges.length}/{dailyChallenges.length}
            </Text>
          </View>
        </View>
      </SlideInView>

      {dailyChallenges.map((challenge, index) => (
        <FadeInView key={challenge.id} delay={150 + index * 50}>
          <ChallengeCard
            challenge={challenge}
            isDark={isDark}
            onClaim={() => handleClaimChallenge(challenge.id)}
          />
        </FadeInView>
      ))}

      {dailyChallenges.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Inga utmaningar idag
          </Text>
          <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
            Kom tillbaka imorgon för nya utmaningar!
          </Text>
        </View>
      )}
    </>
  );

  const renderLevels = () => {
    const tiers: TierType[] = ['beginner', 'intermediate', 'advanced', 'expert', 'master', 'legend'];
    
    return (
      <>
        {tiers.map((tier) => {
          const tierLevels = LEVELS.filter(l => l.tier === tier);
          const tierColor = TIER_COLORS[tier];
          
          return (
            <SlideInView key={tier} direction="up" delay={100}>
              <View style={styles.tierSection}>
                <View style={[styles.tierHeader, { borderLeftColor: tierColor }]}>
                  <Text style={[styles.tierTitle, { color: tierColor }]}>
                    {TIER_NAMES[tier].sv}
                  </Text>
                  <Text style={[styles.tierRange, { color: theme.colors.textSecondary }]}>
                    Nivå {tierLevels[0]?.level} - {tierLevels[tierLevels.length - 1]?.level}
                  </Text>
                </View>
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.levelScroll}
                >
                  {tierLevels.map((level) => (
                    <LevelCard
                      key={level.level}
                      level={level}
                      isCurrentLevel={level.level === currentLevel.level}
                      isUnlocked={totalXp >= level.requiredXp}
                      isDark={isDark}
                    />
                  ))}
                </ScrollView>
              </View>
            </SlideInView>
          );
        })}
      </>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
        >
          <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Framsteg & XP</Text>
        <TouchableOpacity 
          onPress={() => setShowInfoModal(true)}
          style={[styles.infoHeaderButton, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}
        >
          <Info size={20} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  isActive && { backgroundColor: tierColor + '20', borderColor: tierColor }
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[
                  styles.tabLabel,
                  { color: isActive ? tierColor : theme.colors.textSecondary }
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'challenges' && renderChallenges()}
        {activeTab === 'levels' && renderLevels()}
      </ScrollView>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Hur fungerar XP-systemet?
              </Text>
              <TouchableOpacity onPress={() => setShowInfoModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>⚡</Text>
                <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Tjäna XP</Text>
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  • Studera med timern: 5 XP per 5 minuter{'\n'}
                  • Quiz 50-75%: 20 XP{'\n'}
                  • Quiz 75-90%: 35 XP{'\n'}
                  • Quiz 90-100%: 50 XP{'\n'}
                  • Slutför lektioner: 10 XP{'\n'}
                  • Dagliga utmaningar: 30-150 XP{'\n'}
                  • Morgonbonus (05:00-08:00): +10 XP
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>🏆</Text>
                <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Prestationer</Text>
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  Lås upp prestationer genom att nå milstolpar. Varje prestation ger XP baserat på sällsynthet:{'\n\n'}
                  • Vanlig: 25-50 XP{'\n'}
                  • Ovanlig: 75-150 XP{'\n'}
                  • Sällsynt: 200-350 XP{'\n'}
                  • Episk: 400-600 XP{'\n'}
                  • Legendarisk: 750-1000 XP
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>⭐</Text>
                <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Nivåer & Tiers</Text>
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  Det finns 50 nivåer fördelade på 6 tiers:{'\n\n'}
                  • Nybörjare (1-9): Grå{'\n'}
                  • Mellanliggande (10-19): Blå{'\n'}
                  • Avancerad (20-29): Lila{'\n'}
                  • Expert (30-39): Rosa{'\n'}
                  • Mästare (40-49): Guld{'\n'}
                  • Legend (50): Röd{'\n\n'}
                  Du får +50 XP bonus vid varje nivåuppgång!
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>🎯</Text>
                <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Dagliga utmaningar</Text>
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  Nya utmaningar varje dag med olika svårighetsgrader:{'\n\n'}
                  • Lätt: ~30 XP{'\n'}
                  • Medel: ~60-75 XP{'\n'}
                  • Svår: ~120-150 XP{'\n\n'}
                  Slutför utmaningar för att få extra XP och hålla din streak igång!
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : SPACING.xl,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  infoHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    paddingBottom: SPACING.sm,
  },
  tabScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  heroLevelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroLevelLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  heroLevelTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroXpSection: {
    marginBottom: SPACING.lg,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  heroXpText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  heroProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  heroProgressText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  heroStat: {
    alignItems: 'center',
    gap: 4,
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  heroStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  unclaimedAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  unclaimedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  unclaimedText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  achievementCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
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
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
    gap: 4,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  achievementDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  unlockedText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#10B981',
  },
  achievementRight: {
    marginLeft: SPACING.sm,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  claimButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  claimedText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  xpPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  xpPreviewText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  progressSection: {
    marginTop: SPACING.md,
    gap: 4,
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
    fontWeight: '500' as const,
    textAlign: 'right',
  },
  challengeCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  challengeLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: SPACING.md,
  },
  challengeEmoji: {
    fontSize: 32,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  challengeDescription: {
    fontSize: 13,
  },
  challengeRight: {},
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  challengeProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  challengeProgressText: {
    fontSize: 12,
    fontWeight: '600' as const,
    minWidth: 40,
    textAlign: 'right',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpRewardText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  claimChallengeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  claimChallengeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  claimChallengeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  challengeClaimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeClaimedText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  achievementStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  achievementStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  achievementStatEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  achievementStatValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  achievementStatLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  achievementSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  challengeHeaderCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  challengeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  challengeHeaderEmoji: {
    fontSize: 32,
  },
  challengeHeaderTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  challengeHeaderSubtitle: {
    fontSize: 13,
  },
  challengeHeaderStats: {},
  challengeHeaderProgress: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  tierSection: {
    marginBottom: SPACING.xl,
  },
  tierHeader: {
    borderLeftWidth: 4,
    paddingLeft: SPACING.md,
    marginBottom: SPACING.md,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  tierRange: {
    fontSize: 13,
  },
  levelScroll: {
    gap: SPACING.md,
    paddingRight: SPACING.md,
  },
  levelCard: {
    width: 100,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    position: 'relative',
    ...SHADOWS.sm,
  },
  currentLevelBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentLevelText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  levelEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  levelNumber: {
    fontSize: 12,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  levelTitle: {
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 2,
  },
  levelXp: {
    fontSize: 10,
  },
  levelLockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: SPACING.xs,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  infoSection: {
    marginBottom: SPACING.xl,
  },
  infoEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
