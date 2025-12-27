import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, TrendingUp, Star, Crown } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  LevelDefinition, 
  TierType,
  TIER_COLORS,
  TIER_NAMES,
  formatXp,
} from '@/constants/gamification';

interface LevelBadgeProps {
  level: number;
  tier: TierType;
  emoji: string;
  size?: 'small' | 'medium' | 'large';
  showTier?: boolean;
  animated?: boolean;
}

export function LevelBadge({ 
  level, 
  tier, 
  emoji, 
  size = 'medium', 
  showTier = false,
  animated = false,
}: LevelBadgeProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, scaleAnim, glowAnim]);

  const tierColor = TIER_COLORS[tier];
  
  const sizes = {
    small: { container: 40, text: 14, emoji: 16 },
    medium: { container: 56, text: 18, emoji: 22 },
    large: { container: 80, text: 24, emoji: 32 },
  };

  const sizeConfig = sizes[size];

  return (
    <View style={styles.badgeWrapper}>
      <Animated.View
        style={[
          styles.badgeContainer,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: sizeConfig.container / 2,
            borderColor: tierColor,
            backgroundColor: tierColor + '20',
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={{ fontSize: sizeConfig.emoji }}>{emoji}</Text>
        <View style={[styles.levelNumber, { backgroundColor: tierColor }]}>
          <Text style={[styles.levelNumberText, { fontSize: sizeConfig.text * 0.5 }]}>
            {level}
          </Text>
        </View>
      </Animated.View>
      {showTier && (
        <View style={[styles.tierBadge, { backgroundColor: tierColor }]}>
          <Text style={styles.tierText}>{TIER_NAMES[tier].sv}</Text>
        </View>
      )}
    </View>
  );
}

interface LevelProgressBarProps {
  current: number;
  required: number;
  percent: number;
  tierColor: string;
  showLabels?: boolean;
  height?: number;
}

export function LevelProgressBar({
  current,
  required,
  percent,
  tierColor,
  showLabels = true,
  height = 12,
}: LevelProgressBarProps) {
  const { theme } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: percent,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [percent, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressContainer}>
      {showLabels && (
        <View style={styles.progressLabels}>
          <Text style={[styles.progressCurrent, { color: theme.colors.text }]}>
            {formatXp(current)} XP
          </Text>
          <Text style={[styles.progressRequired, { color: theme.colors.textSecondary }]}>
            {required > 0 ? `${formatXp(required)} XP till nästa` : 'Max nivå!'}
          </Text>
        </View>
      )}
      <View style={[styles.progressTrack, { height, backgroundColor: theme.colors.borderLight }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressWidth,
              backgroundColor: tierColor,
            },
          ]}
        />
        <View style={[styles.progressGlow, { backgroundColor: tierColor }]} />
      </View>
    </View>
  );
}

interface LevelCardProps {
  currentLevel: LevelDefinition;
  xpProgress: {
    current: number;
    required: number;
    percent: number;
    nextLevel: LevelDefinition | null;
  };
  totalXp: number;
  streak?: number;
  onPress?: () => void;
  compact?: boolean;
}

export function LevelCard({
  currentLevel,
  xpProgress,
  totalXp,
  streak = 0,
  onPress,
  compact = false,
}: LevelCardProps) {
  const { theme } = useTheme();
  const tierColor = TIER_COLORS[currentLevel.tier];

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: theme.colors.card }]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        <LevelBadge
          level={currentLevel.level}
          tier={currentLevel.tier}
          emoji={currentLevel.iconEmoji}
          size="small"
        />
        <View style={styles.compactInfo}>
          <Text style={[styles.compactTitle, { color: theme.colors.text }]}>
            Nivå {currentLevel.level}
          </Text>
          <View style={styles.compactProgressContainer}>
            <View style={[styles.compactProgressTrack, { backgroundColor: theme.colors.borderLight }]}>
              <View
                style={[
                  styles.compactProgressFill,
                  { width: `${xpProgress.percent}%`, backgroundColor: tierColor },
                ]}
              />
            </View>
            <Text style={[styles.compactXp, { color: theme.colors.textSecondary }]}>
              {formatXp(totalXp)}
            </Text>
          </View>
        </View>
        {streak > 0 && (
          <View style={[styles.streakBadge, { backgroundColor: theme.colors.warning + '20' }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakText, { color: theme.colors.warning }]}>{streak}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <LinearGradient
        colors={[tierColor + '30', tierColor + '10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.levelCard, { borderColor: tierColor + '40' }]}
      >
        <View style={styles.levelHeader}>
          <LevelBadge
            level={currentLevel.level}
            tier={currentLevel.tier}
            emoji={currentLevel.iconEmoji}
            size="large"
            showTier
            animated
          />
          <View style={styles.levelInfo}>
            <Text style={[styles.levelTitle, { color: theme.colors.text }]}>
              {currentLevel.titleSv}
            </Text>
            <Text style={[styles.levelDescription, { color: theme.colors.textSecondary }]}>
              {currentLevel.description}
            </Text>
            <View style={styles.xpRow}>
              <Zap size={16} color={tierColor} />
              <Text style={[styles.totalXp, { color: tierColor }]}>
                {formatXp(totalXp)} Total XP
              </Text>
            </View>
          </View>
        </View>

        <LevelProgressBar
          current={xpProgress.current}
          required={xpProgress.required}
          percent={xpProgress.percent}
          tierColor={tierColor}
        />

        {xpProgress.nextLevel && (
          <View style={styles.nextLevelPreview}>
            <TrendingUp size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.nextLevelText, { color: theme.colors.textSecondary }]}>
              Nästa: {xpProgress.nextLevel.iconEmoji} {xpProgress.nextLevel.titleSv}
            </Text>
          </View>
        )}

        <View style={styles.statsRow}>
          {streak > 0 && (
            <View style={[styles.statItem, { backgroundColor: theme.colors.warning + '15' }]}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>streak</Text>
            </View>
          )}
          <View style={[styles.statItem, { backgroundColor: tierColor + '15' }]}>
            <Star size={16} color={tierColor} />
            <Text style={[styles.statValue, { color: tierColor }]}>{currentLevel.level}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>nivå</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

interface LevelComparisonProps {
  yourLevel: LevelDefinition;
  yourXp: number;
  friendLevel: LevelDefinition;
  friendXp: number;
  friendName: string;
}

export function LevelComparison({
  yourLevel,
  yourXp,
  friendLevel,
  friendXp,
  friendName,
}: LevelComparisonProps) {
  const { theme } = useTheme();
  const yourColor = TIER_COLORS[yourLevel.tier];
  const friendColor = TIER_COLORS[friendLevel.tier];
  const isAhead = yourXp > friendXp;
  const difference = Math.abs(yourXp - friendXp);

  return (
    <View style={[styles.comparisonContainer, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.comparisonTitle, { color: theme.colors.text }]}>
        Nivåjämförelse
      </Text>
      
      <View style={styles.comparisonRow}>
        <View style={styles.comparisonSide}>
          <LevelBadge
            level={yourLevel.level}
            tier={yourLevel.tier}
            emoji={yourLevel.iconEmoji}
            size="medium"
          />
          <Text style={[styles.comparisonName, { color: theme.colors.text }]}>Du</Text>
          <Text style={[styles.comparisonXp, { color: yourColor }]}>{formatXp(yourXp)} XP</Text>
        </View>

        <View style={styles.comparisonMiddle}>
          <View style={[
            styles.comparisonBadge,
            { backgroundColor: isAhead ? theme.colors.success + '20' : theme.colors.error + '20' }
          ]}>
            <Text style={[
              styles.comparisonDiff,
              { color: isAhead ? theme.colors.success : theme.colors.error }
            ]}>
              {isAhead ? '+' : '-'}{formatXp(difference)}
            </Text>
          </View>
          <Crown size={20} color={isAhead ? yourColor : friendColor} />
        </View>

        <View style={styles.comparisonSide}>
          <LevelBadge
            level={friendLevel.level}
            tier={friendLevel.tier}
            emoji={friendLevel.iconEmoji}
            size="medium"
          />
          <Text style={[styles.comparisonName, { color: theme.colors.text }]} numberOfLines={1}>
            {friendName}
          </Text>
          <Text style={[styles.comparisonXp, { color: friendColor }]}>{formatXp(friendXp)} XP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeWrapper: {
    alignItems: 'center',
  },
  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    position: 'relative',
  },
  levelNumber: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  levelNumberText: {
    color: 'white',
    fontWeight: '700',
  },
  tierBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    marginTop: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressCurrent: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressRequired: {
    fontSize: 12,
  },
  progressTrack: {
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: '100%',
    opacity: 0.5,
  },
  levelCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalXp: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextLevelPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  nextLevelText: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statEmoji: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  compactProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  compactXp: {
    fontSize: 12,
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
  },
  comparisonContainer: {
    borderRadius: 20,
    padding: 20,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comparisonSide: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  comparisonMiddle: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  comparisonName: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 80,
  },
  comparisonXp: {
    fontSize: 12,
    fontWeight: '500',
  },
  comparisonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  comparisonDiff: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LevelCard;
