import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, RefreshCcw, PlusCircle, MinusCircle, CheckCircle2, Sparkles, Clock, Activity } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePoints } from '@/contexts/PointsContext';
import { useChallenges, ChallengeStatus } from '@/contexts/ChallengeContext';

const AnimatedBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress, widthAnim]);

  return (
    <Animated.View
      style={[styles.progressFill, { backgroundColor: color, width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}
    />
  );
};

const ChallengeCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  color: string;
  status: ChallengeStatus;
  reward: number;
  progress: number;
  target: number;
  unit: string;
  onStart: () => void;
  onIncrement: () => void;
  onComplete: () => void;
}> = ({ title, description, icon, color, status, reward, progress, target, unit, onStart, onIncrement, onComplete }) => {
  const progressPercent = Math.min(100, (progress / target) * 100);
  const buttonLabel = status === 'not_started' ? 'Starta' : status === 'in_progress' ? 'Logga framsteg' : 'Avklarad';
  const buttonAction = status === 'not_started' ? onStart : status === 'in_progress' ? onIncrement : undefined;

  return (
    <View style={[styles.challengeCard, { backgroundColor: color + '20' }]} testID={`challenge-${title}`}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeIcon}>
          <Text style={styles.challengeIconText}>{icon}</Text>
        </View>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{title}</Text>
          <Text style={styles.challengeDescription}>{description}</Text>
        </View>
        <View style={styles.rewardBadge}>
          <Sparkles size={14} color={color} />
          <Text style={[styles.rewardText, { color }]}>{reward}p</Text>
        </View>
      </View>
      <View style={styles.challengeProgressRow}>
        <View style={styles.challengeProgressText}>
          <Text style={styles.challengeUnit}>{progress}/{target} {unit}</Text>
          <Text style={[styles.challengeStatus, { color }]}>{status === 'completed' ? 'Klart' : status === 'in_progress' ? 'Pågående' : 'Inte startad'}</Text>
        </View>
        <View style={styles.challengeProgressBar}>
          <AnimatedBar progress={progressPercent} color={color} />
        </View>
      </View>
      <View style={styles.challengeActions}>
        {status !== 'completed' && buttonAction && (
          <TouchableOpacity style={[styles.challengeButton, { backgroundColor: color }]} onPress={buttonAction} testID={`challenge-action-${title}`}>
            <Text style={styles.challengeButtonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        )}
        {status !== 'completed' && (
          <TouchableOpacity style={[styles.challengeGhostButton, { borderColor: color }]} onPress={onComplete}>
            <CheckCircle2 size={18} color={color} />
            <Text style={[styles.challengeGhostButtonText, { color }]}>Markera klar</Text>
          </TouchableOpacity>
        )}
        {status === 'completed' && (
          <View style={styles.completedPill}>
            <CheckCircle2 size={16} color={color} />
            <Text style={[styles.completedText, { color }]}>Avklarad</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function RewardsScreen() {
  const { theme } = useTheme();
  const { totalPoints, level, progress, addPoints, deductPoints, breakdown, history } = usePoints();
  const { dailyChallenges, weeklyChallenges, refreshChallengeBoard, startChallenge, updateChallengeProgress, completeChallenge, isLoading } = useChallenges();

  const topHistory = useMemo(() => history.slice(0, 4), [history]);

  const handleAddPoints = useCallback(async () => {
    await addPoints(50, { description: 'Bonusfokus' });
  }, [addPoints]);

  const handleDeductPoints = useCallback(async () => {
    await deductPoints(20, { description: 'Omsättningsjustering' });
  }, [deductPoints]);

  const handleChallengeIncrement = useCallback((id: string, target: number) => {
    const step = Math.max(1, Math.round(target / 4));
    updateChallengeProgress(id, step);
  }, [updateChallengeProgress]);

  const renderChallengeSection = useCallback((title: string, data: typeof dailyChallenges) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshChallengeBoard} testID={`refresh-${title}`}>
          <RefreshCcw size={16} color={theme.colors.primary} />
          <Text style={[styles.refreshText, { color: theme.colors.primary }]}>Uppdatera</Text>
        </TouchableOpacity>
      </View>
      {data.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          title={challenge.title}
          description={challenge.description}
          icon={challenge.icon}
          color={challenge.color}
          status={challenge.status}
          reward={challenge.rewardPoints}
          progress={challenge.progress}
          target={challenge.target}
          unit={challenge.unit}
          onStart={() => startChallenge(challenge.id)}
          onIncrement={() => handleChallengeIncrement(challenge.id, challenge.target)}
          onComplete={() => completeChallenge(challenge.id)}
        />
      ))}
    </View>
  ), [theme.colors.primary, theme.colors.text, refreshChallengeBoard, startChallenge, handleChallengeIncrement, completeChallenge]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={theme.colors.gradient as [string, string, string]} style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>Din nivå</Text>
              <Text style={styles.heroLevel}>Level {level.level}</Text>
              <Text style={styles.heroTitle}>{level.title}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Trophy size={32} color="#fff" />
              <Text style={styles.heroPoints}>{totalPoints} p</Text>
              <Text style={styles.heroSubtitle}>Totalt</Text>
            </View>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Utmaningar</Text>
              <Text style={styles.breakdownValue}>{breakdown.base} p</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Prestationer</Text>
              <Text style={styles.breakdownValue}>{breakdown.achievements} p</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.progressCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <Activity size={18} color={theme.colors.primary} />
              <Text style={[styles.progressTitle, { color: theme.colors.text }]}>Nivåprogress</Text>
            </View>
            {progress.nextLevel && (
              <Text style={[styles.progressNextLevel, { color: theme.colors.textSecondary }]}>Mot nivå {progress.nextLevel.level} · {Math.round(progress.percent)}%</Text>
            )}
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.borderLight }]}
            testID="level-progress-bar"
          >
            <AnimatedBar progress={progress.percent} color={theme.colors.primary} />
          </View>
          <View style={styles.progressLegend}>
            <Text style={[styles.progressLegendText, { color: theme.colors.textSecondary }]}>{Math.round(progress.current)} / {progress.required || progress.current} XP</Text>
            {!progress.required && (
              <Text style={[styles.progressMaxText, { color: theme.colors.textSecondary }]}>Maxnivå</Text>
            )}
          </View>
        </View>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: theme.colors.primary }]} onPress={handleAddPoints} testID="add-points">
            <PlusCircle size={18} color="#fff" />
            <Text style={styles.quickActionText}>+50 Poäng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: theme.colors.secondary }]} onPress={handleDeductPoints} testID="deduct-points">
            <MinusCircle size={18} color="#fff" />
            <Text style={styles.quickActionText}>-20 Poäng</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.historyCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Senaste händelser</Text>
          </View>
          {topHistory.length === 0 ? (
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>Inga transaktioner ännu</Text>
          ) : (
            topHistory.map((entry) => (
              <View key={entry.id} style={styles.historyRow}>
                <View style={styles.historyIcon}>
                  {entry.amount >= 0 ? <PlusCircle size={16} color={theme.colors.success} /> : <MinusCircle size={16} color={theme.colors.error} />}
                </View>
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyTitle, { color: theme.colors.text }]}>{entry.description}</Text>
                  <Text style={[styles.historySubtitle, { color: theme.colors.textSecondary }]}>{new Date(entry.createdAt).toLocaleString('sv-SE')}</Text>
                </View>
                <Text style={[styles.historyAmount, { color: entry.amount >= 0 ? theme.colors.success : theme.colors.error }]}>
                  {entry.amount > 0 ? '+' : ''}{entry.amount}
                </Text>
              </View>
            ))
          )}
        </View>

        {renderChallengeSection('Dagliga utmaningar', dailyChallenges)}
        {renderChallengeSection('Veckans fokus', weeklyChallenges)}

        {isLoading && (
          <View style={styles.loadingBanner}>
            <Clock size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Laddar utmaningar...</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  heroLevel: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.9,
  },
  heroBadge: {
    alignItems: 'flex-end',
  },
  heroPoints: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 18,
  },
  heroBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 4,
  },
  breakdownValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  progressCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressNextLevel: {
    marginTop: 4,
    fontSize: 14,
  },
  progressBarContainer: {
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressLegendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressMaxText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  historyCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.08)',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  historySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyStateText: {
    fontSize: 14,
  },
  challengeCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  challengeIconText: {
    fontSize: 24,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  challengeDescription: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 2,
  },
  rewardBadge: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700',
  },
  challengeProgressRow: {
    marginBottom: 12,
  },
  challengeProgressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  challengeUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.6)',
  },
  challengeStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  challengeProgressBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  challengeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  challengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    flexGrow: 1,
  },
  challengeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  challengeGhostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  challengeGhostButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  completedText: {
    fontSize: 13,
    fontWeight: '700',
  },
  challengeProgressRowView: {
    flexDirection: 'row',
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
});