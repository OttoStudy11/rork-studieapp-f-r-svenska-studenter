import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { supabase } from '@/lib/supabase';
import { performanceCache } from '@/lib/performance';
import { safeJsonParse } from '@/utils/safeJsonParse';
import { logger } from '@/utils/logger';
import {
  LEVELS,
  LevelDefinition,
  TierType,
  RarityType,
  ChallengeDifficulty,
  getLevelForXp,
  getXpProgress,
  calculateStudySessionXp,
  calculateQuizXp,
  isOffPeakHour,
  POINT_SOURCES,
  TIER_COLORS,
  RARITY_COLORS,
  DIFFICULTY_CONFIG,
} from '@/constants/gamification';

export type PointSourceType = 
  | 'lesson_complete' 
  | 'quiz_complete' 
  | 'daily_streak' 
  | 'challenge_complete'
  | 'achievement_unlock' 
  | 'level_up_bonus' 
  | 'course_complete' 
  | 'off_peak_bonus'
  | 'first_achievement' 
  | 'manual' 
  | 'penalty'
  | 'study_session';

export interface PointTransaction {
  id: string;
  amount: number;
  sourceType: PointSourceType;
  sourceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'study' | 'social' | 'streak' | 'milestone';
  rarity: RarityType;
  xpReward: number;
  requirementType: string;
  requirementTarget: number;
  isHidden: boolean;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  isClaimed: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: string;
  targetValue: number;
  xpReward: number;
  difficulty: ChallengeDifficulty;
  currentProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt?: string;
}

export interface LevelUpEvent {
  previousLevel: number;
  newLevel: number;
  newTier?: TierType;
  bonusXp: number;
}

interface GamificationState {
  totalXp: number;
  currentLevel: LevelDefinition;
  xpProgress: {
    current: number;
    required: number;
    percent: number;
    nextLevel: LevelDefinition | null;
  };
  streak: number;
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  recentTransactions: PointTransaction[];
  unclaimedAchievements: number;
  unclaimedChallenges: number;
}

interface GamificationContextValue extends GamificationState {
  isLoading: boolean;
  isReady: boolean;
  addXp: (amount: number, sourceType: PointSourceType, sourceId?: string, metadata?: Record<string, unknown>) => Promise<LevelUpEvent | null>;
  awardLessonComplete: () => Promise<LevelUpEvent | null>;
  awardQuizComplete: (scorePercent: number) => Promise<LevelUpEvent | null>;
  awardStudySession: (minutes: number, courseId?: string) => Promise<LevelUpEvent | null>;
  awardChallengeComplete: (challengeId: string) => Promise<LevelUpEvent | null>;
  claimAchievement: (achievementId: string) => Promise<void>;
  claimChallenge: (challengeId: string) => Promise<void>;
  checkAchievements: () => Promise<void>;
  refreshAll: () => Promise<void>;
  getLeaderboardPosition: () => Promise<number>;
  updateChallengeProgress: (type: 'study_minutes' | 'sessions_count', amount: number) => Promise<void>;
}

const STORAGE_KEY = 'gamification_state_v2';
const XP_AWARD_COOLDOWN_MS = 2000;
const GAMIFICATION_CACHE_KEY = 'gamification_data';

const defaultState: GamificationState = {
  totalXp: 0,
  currentLevel: LEVELS[0],
  xpProgress: { current: 0, required: 100, percent: 0, nextLevel: LEVELS[1] },
  streak: 0,
  achievements: [],
  dailyChallenges: [],
  recentTransactions: [],
  unclaimedAchievements: 0,
  unclaimedChallenges: 0,
};

export const [GamificationProvider, useGamification] = createContextHook<GamificationContextValue>(() => {
  const { user: authUser, isAuthenticated } = useAuth();
  const { showSuccess, showAchievement } = useToast();
  
  const [state, setState] = useState<GamificationState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  const recentAwardsRef = useRef<Map<string, number>>(new Map());
  const pendingLevelUpBonusRef = useRef<boolean>(false);
  const initStartedRef = useRef(false);
  const lastRefreshRef = useRef<number>(0);

  const loadFromStorage = useCallback(async (): Promise<Partial<GamificationState>> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = safeJsonParse<Record<string, unknown>>(stored, {}, 'GamificationContext');
        return {
          totalXp: (parsed.totalXp as number) ?? 0,
          streak: (parsed.streak as number) ?? 0,
          recentTransactions: (parsed.recentTransactions as PointTransaction[]) ?? [],
        };
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('GamificationContext', 'Failed to load from storage', msg);
    }
    return {};
  }, []);

  const saveToStorage = useCallback(async (data: Partial<GamificationState>) => {
    try {
      const current = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : {};
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, ...data }));
    } catch (error) {
      console.log('Failed to save gamification to storage:', error);
    }
  }, []);

  const loadUserLevel = useCallback(async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.log('Error loading user level:', error);
        return null;
      }

      return data as { user_id: string; current_level: number; total_xp: number; xp_to_next_level: number; level_progress_percent: number } | null;
    } catch (error) {
      console.log('Exception loading user level:', error);
      return null;
    }
  }, []);

  const loadDailyChallenges = useCallback(async (userId: string): Promise<DailyChallenge[]> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: challenges, error: challengesError } = await (supabase as any)
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today);

      if (challengesError) {
        console.log('Error loading daily challenges:', challengesError);
        return generateLocalChallenges();
      }

      if (!challenges || challenges.length === 0) {
        return generateLocalChallenges();
      }

      const challengeIds = (challenges as any[]).map((c: any) => c.id);
      const { data: userProgress } = await (supabase as any)
        .from('user_daily_challenges')
        .select('*')
        .eq('user_id', userId)
        .in('challenge_id', challengeIds);

      return (challenges as any[]).map((challenge: any) => {
        const progress = (userProgress as any[] | null)?.find((p: any) => p.challenge_id === challenge.id);
        return {
          id: challenge.id,
          title: challenge.title_sv || challenge.title,
          description: challenge.description_sv || challenge.description,
          emoji: challenge.emoji,
          type: challenge.challenge_type,
          targetValue: challenge.target_value,
          xpReward: challenge.xp_reward,
          difficulty: challenge.difficulty as ChallengeDifficulty,
          currentProgress: progress?.current_progress ?? 0,
          isCompleted: progress?.is_completed ?? false,
          isClaimed: progress?.is_claimed ?? false,
          completedAt: progress?.completed_at ?? undefined,
        };
      });
    } catch (error) {
      console.log('Exception loading daily challenges:', error);
      return generateLocalChallenges();
    }
  }, []);

  const loadAchievements = useCallback(async (userId: string): Promise<Achievement[]> => {
    try {
      console.log('📚 Loading achievements for user:', userId);
      
      const { data: userAchievements, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (*)
        `)
        .eq('user_id', userId);

      if (error) {
        console.log('Error loading achievements:', error);
        return [];
      }

      const achievements = (userAchievements ?? [])
        .filter((ua: any) => ua.achievements)
        .map((ua: any) => {
          const isUnlocked = !!ua.unlocked_at;
          const target = ua.achievements.requirement_target || 1;
          const progress = ua.progress ?? 0;
          
          return {
            id: ua.achievements.id,
            key: ua.achievements.achievement_key,
            title: ua.achievements.title,
            description: ua.achievements.description,
            icon: ua.achievements.icon,
            category: ua.achievements.category,
            rarity: (ua.achievements.rarity || 'common') as RarityType,
            xpReward: ua.achievements.xp_reward || ua.achievements.reward_points || 25,
            requirementType: ua.achievements.requirement_type,
            requirementTarget: target,
            isHidden: ua.achievements.is_hidden || false,
            progress: progress,
            isUnlocked: isUnlocked,
            unlockedAt: ua.unlocked_at ?? undefined,
            // Achievement is claimed when it's been unlocked (XP already awarded by RPC)
            isClaimed: isUnlocked,
          };
        });
      
      const unlockedCount = achievements.filter(a => a.isUnlocked).length;
      console.log(`📚 Loaded ${achievements.length} achievements, ${unlockedCount} unlocked`);
      
      return achievements;
    } catch (error) {
      console.log('Exception loading achievements:', error);
      return [];
    }
  }, []);

  const refreshAll = useCallback(async () => {
    // Rate limit refreshes to avoid excessive API calls
    const now = Date.now();
    if (now - lastRefreshRef.current < 5000) {
      return;
    }
    lastRefreshRef.current = now;

    if (!authUser || !isAuthenticated) {
      const stored = await loadFromStorage();
      setState(prev => ({
        ...defaultState,
        ...stored,
        currentLevel: getLevelForXp(stored.totalXp ?? 0),
        xpProgress: getXpProgress(stored.totalXp ?? 0),
      }));
      setIsLoading(false);
      setIsReady(true);
      return;
    }

    try {
      // Try cache first for instant UI
      const cached = performanceCache.get(GAMIFICATION_CACHE_KEY) as GamificationState | null;
      if (cached && !isReady) {
        setState(cached);
        setIsReady(true);
        setIsLoading(false);
      }

      // Fetch fresh data in parallel
      const [userLevel, achievements, dailyChallenges, stored] = await Promise.all([
        loadUserLevel(authUser.id),
        loadAchievements(authUser.id),
        loadDailyChallenges(authUser.id),
        loadFromStorage(),
      ]);

      const totalXp = (userLevel as any)?.total_xp ?? stored.totalXp ?? 0;
      const currentLevel = getLevelForXp(totalXp);
      const xpProgress = getXpProgress(totalXp);

      // Get streak in background - don't block UI
      let streak = stored.streak ?? 0;
      (async () => {
        try {
          const { data } = await supabase
            .from('user_progress')
            .select('current_streak')
            .eq('user_id', authUser.id)
            .maybeSingle();
          if (data?.current_streak !== undefined) {
            setState(prev => ({ ...prev, streak: data.current_streak }));
          }
        } catch (e) {
          console.warn('Failed to load streak:', e);
        }
      })().catch(() => {});

      const unclaimedAchievements = achievements.filter(a => a.isUnlocked && !a.isClaimed).length;
      const unclaimedChallenges = dailyChallenges.filter(c => c.isCompleted && !c.isClaimed).length;

      const newState: GamificationState = {
        totalXp,
        currentLevel,
        xpProgress,
        streak,
        achievements,
        dailyChallenges,
        recentTransactions: stored.recentTransactions ?? [],
        unclaimedAchievements,
        unclaimedChallenges,
      };

      setState(newState);
      performanceCache.set(GAMIFICATION_CACHE_KEY, newState);
      await saveToStorage({ totalXp, streak });
    } catch (error) {
      console.warn('Error refreshing gamification:', error);
    } finally {
      setIsLoading(false);
      setIsReady(true);
    }
  }, [authUser, isAuthenticated, loadUserLevel, loadAchievements, loadDailyChallenges, loadFromStorage, saveToStorage, isReady]);

  useEffect(() => {
    if (initStartedRef.current && !authUser?.id) return;
    if (authUser?.id) initStartedRef.current = true;
    
    // Defer gamification loading slightly to prioritize UI
    const timer = setTimeout(() => {
      refreshAll();
    }, 100);
    
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id, isAuthenticated]);

  const addXp = useCallback(async (
    amount: number,
    sourceType: PointSourceType,
    sourceId?: string,
    metadata?: Record<string, unknown>
  ): Promise<LevelUpEvent | null> => {
    if (amount <= 0) return null;

    const awardKey = `${sourceType}-${sourceId || 'no-id'}-${amount}`;
    const now = Date.now();
    const lastAward = recentAwardsRef.current.get(awardKey);
    
    if (lastAward && (now - lastAward) < XP_AWARD_COOLDOWN_MS) {
      console.log(`⏳ Skipping duplicate XP award: ${awardKey} (cooldown active)`);
      return null;
    }
    
    recentAwardsRef.current.set(awardKey, now);
    
    if (recentAwardsRef.current.size > 50) {
      const entries = Array.from(recentAwardsRef.current.entries());
      const oldEntries = entries.filter(([, time]) => now - time > 60000);
      oldEntries.forEach(([key]) => recentAwardsRef.current.delete(key));
    }

    const previousLevel = state.currentLevel.level;
    const previousTier = state.currentLevel.tier;
    
    let finalAmount = amount;
    if (isOffPeakHour() && sourceType === 'study_session') {
      finalAmount += POINT_SOURCES.off_peak_bonus.baseXp;
    }

    const newTotalXp = state.totalXp + finalAmount;
    const newLevel = getLevelForXp(newTotalXp);
    const newProgress = getXpProgress(newTotalXp);

    const transaction: PointTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount: finalAmount,
      sourceType,
      sourceId,
      metadata,
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      totalXp: newTotalXp,
      currentLevel: newLevel,
      xpProgress: newProgress,
      recentTransactions: [transaction, ...prev.recentTransactions].slice(0, 50),
    }));

    await saveToStorage({ totalXp: newTotalXp, recentTransactions: [transaction, ...state.recentTransactions].slice(0, 50) });

    if (authUser && isAuthenticated) {
      try {
        console.log(`💾 Syncing XP to database: +${finalAmount} XP (total: ${newTotalXp})`);
        
        // Sync to user_levels table
        const { error: levelError } = await (supabase as any).from('user_levels').upsert({
          user_id: authUser.id,
          current_level: newLevel.level,
          total_xp: newTotalXp,
          xp_to_next_level: newProgress.required - newProgress.current,
          level_progress_percent: newProgress.percent,
          last_level_up: newLevel.level > previousLevel ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        
        if (levelError) {
          console.error('❌ Error syncing user_levels:', levelError);
        } else {
          console.log('✅ user_levels synced successfully');
        }

        // Record point transaction
        const { error: transactionError } = await (supabase as any).from('point_transactions').insert({
          user_id: authUser.id,
          amount: finalAmount,
          source_type: sourceType,
          source_id: sourceId,
          metadata: metadata ?? {},
          created_at: new Date().toISOString(),
        });
        
        if (transactionError) {
          console.error('❌ Error recording point_transaction:', JSON.stringify(transactionError, null, 2));
        } else {
          console.log('✅ point_transaction recorded successfully');
        }

        // Sync total_points AND total_xp to user_progress table (for leaderboard)
        const { error: progressError } = await supabase.from('user_progress').upsert({
          user_id: authUser.id,
          total_points: newTotalXp,
          total_xp: newTotalXp,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        
        if (progressError) {
          console.error('❌ Error syncing user_progress:', progressError);
        } else {
          console.log('✅ user_progress synced (total_points + total_xp):', newTotalXp);
        }
        
      } catch (error) {
        console.error('❌ Error syncing XP to database:', error);
      }
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (newLevel.level > previousLevel) {
      const tierChanged = newLevel.tier !== previousTier;
      const bonusXp = POINT_SOURCES.level_up_bonus.baseXp;
      
      if (sourceType !== 'level_up_bonus') {
        showAchievement(
          `🎉 Nivå ${newLevel.level}!`,
          `${newLevel.iconEmoji} ${newLevel.titleSv} - ${tierChanged ? 'Ny tier!' : ''} +${bonusXp} XP`
        );

        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }

      if (!pendingLevelUpBonusRef.current && sourceType !== 'level_up_bonus') {
        pendingLevelUpBonusRef.current = true;
        setTimeout(() => {
          pendingLevelUpBonusRef.current = false;
          addXp(bonusXp, 'level_up_bonus', `level_${newLevel.level}`);
        }, 500);
      }

      return {
        previousLevel,
        newLevel: newLevel.level,
        newTier: tierChanged ? newLevel.tier : undefined,
        bonusXp,
      };
    }

    return null;
  }, [state.totalXp, state.currentLevel, state.recentTransactions, authUser, isAuthenticated, saveToStorage, showAchievement]);

  const awardLessonComplete = useCallback(async (): Promise<LevelUpEvent | null> => {
    return addXp(POINT_SOURCES.lesson_complete.baseXp, 'lesson_complete');
  }, [addXp]);

  const awardQuizComplete = useCallback(async (scorePercent: number): Promise<LevelUpEvent | null> => {
    const xp = calculateQuizXp(scorePercent);
    if (xp > 0) {
      return addXp(xp, 'quiz_complete', undefined, { scorePercent });
    }
    return null;
  }, [addXp]);

  const updateChallengeProgress = useCallback(async (type: 'study_minutes' | 'sessions_count', amount: number) => {
    console.log(`📊 Updating challenge progress: ${type} +${amount}`);
    
    setState(prev => {
      const updatedChallenges = prev.dailyChallenges.map(challenge => {
        if (challenge.type === type && !challenge.isCompleted) {
          const newProgress = challenge.currentProgress + amount;
          const isNowCompleted = newProgress >= challenge.targetValue;
          
          console.log(`  Challenge "${challenge.title}": ${challenge.currentProgress} -> ${newProgress} / ${challenge.targetValue}`);
          
          if (isNowCompleted && !challenge.isCompleted) {
            console.log(`  🎉 Challenge "${challenge.title}" completed!`);
          }
          
          return {
            ...challenge,
            currentProgress: Math.min(newProgress, challenge.targetValue),
            isCompleted: isNowCompleted,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          };
        }
        return challenge;
      });
      
      const unclaimedChallenges = updatedChallenges.filter(c => c.isCompleted && !c.isClaimed).length;
      
      return {
        ...prev,
        dailyChallenges: updatedChallenges,
        unclaimedChallenges,
      };
    });

    if (authUser && isAuthenticated) {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        for (const challenge of state.dailyChallenges) {
          if (challenge.type === type) {
            const newProgress = Math.min(challenge.currentProgress + amount, challenge.targetValue);
            const isCompleted = newProgress >= challenge.targetValue;
            
            await (supabase as any).from('user_daily_challenges').upsert({
              user_id: authUser.id,
              challenge_id: challenge.id,
              challenge_date: today,
              current_progress: newProgress,
              is_completed: isCompleted,
              completed_at: isCompleted && !challenge.isCompleted ? new Date().toISOString() : challenge.completedAt,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,challenge_id' });
          }
        }
      } catch (error) {
        console.log('Error syncing challenge progress to database:', error);
      }
    }
  }, [authUser, isAuthenticated, state.dailyChallenges]);

  const awardStudySession = useCallback(async (minutes: number, courseId?: string): Promise<LevelUpEvent | null> => {
    console.log(`🎯 Awarding study session: ${minutes} minutes, courseId: ${courseId}`);
    
    // Update challenge progress
    await updateChallengeProgress('study_minutes', minutes);
    await updateChallengeProgress('sessions_count', 1);
    
    const xp = calculateStudySessionXp(minutes);
    if (xp > 0) {
      return addXp(xp, 'study_session', courseId, { minutes });
    }
    return null;
  }, [addXp, updateChallengeProgress, authUser, isAuthenticated]);

  const awardChallengeComplete = useCallback(async (challengeId: string): Promise<LevelUpEvent | null> => {
    const challenge = state.dailyChallenges.find(c => c.id === challengeId);
    if (!challenge || !challenge.isCompleted || challenge.isClaimed) return null;
    
    return addXp(challenge.xpReward, 'challenge_complete', challengeId, { 
      difficulty: challenge.difficulty,
      title: challenge.title,
    });
  }, [state.dailyChallenges, addXp]);

  const claimAchievement = useCallback(async (achievementId: string) => {
    const achievement = state.achievements.find(a => a.id === achievementId);
    if (!achievement || !achievement.isUnlocked || achievement.isClaimed) return;

    await addXp(achievement.xpReward, 'achievement_unlock', achievementId, {
      title: achievement.title,
      rarity: achievement.rarity,
    });

    setState(prev => ({
      ...prev,
      achievements: prev.achievements.map(a => 
        a.id === achievementId ? { ...a, isClaimed: true } : a
      ),
      unclaimedAchievements: Math.max(0, prev.unclaimedAchievements - 1),
    }));

    showSuccess(`${achievement.icon} ${achievement.title} - +${achievement.xpReward} XP`);
  }, [state.achievements, addXp, showSuccess]);

  const claimChallenge = useCallback(async (challengeId: string) => {
    const challenge = state.dailyChallenges.find(c => c.id === challengeId);
    if (!challenge || !challenge.isCompleted || challenge.isClaimed) return;

    await awardChallengeComplete(challengeId);

    setState(prev => ({
      ...prev,
      dailyChallenges: prev.dailyChallenges.map(c => 
        c.id === challengeId ? { ...c, isClaimed: true } : c
      ),
      unclaimedChallenges: Math.max(0, prev.unclaimedChallenges - 1),
    }));

    if (authUser && isAuthenticated) {
      try {
        await (supabase as any).from('user_daily_challenges').upsert({
          user_id: authUser.id,
          challenge_id: challengeId,
          is_claimed: true,
          claimed_at: new Date().toISOString(),
          xp_earned: challenge.xpReward,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,challenge_id' });
      } catch (error) {
        console.log('Error updating challenge claim status:', error);
      }
    }

    showSuccess(`${challenge.emoji} Utmaning klar! +${challenge.xpReward} XP`);
  }, [state.dailyChallenges, awardChallengeComplete, authUser, isAuthenticated, showSuccess]);

  // Fallback achievement check when RPC fails
  const checkAchievementsFallback = useCallback(async () => {
    if (!authUser || !isAuthenticated) return;
    
    try {
      console.log('🔄 Running fallback achievement check...');
      
      // Get user stats from pomodoro_sessions
      const { data: sessions } = await (supabase as any)
        .from('pomodoro_sessions')
        .select('duration, course_id')
        .eq('user_id', authUser.id);
      
      const totalStudyTime = (sessions || []).reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
      const sessionsCompleted = (sessions || []).length;
      const uniqueCourses = new Set((sessions || []).filter((s: any) => s.course_id).map((s: any) => s.course_id)).size;
      
      console.log(`📊 User stats: ${sessionsCompleted} sessions, ${totalStudyTime} minutes, ${uniqueCourses} courses`);
      
      // Get friend count (both directions)
      const { count: friendCountSent } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id)
        .eq('status', 'accepted');
      
      const { count: friendCountReceived } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .eq('friend_id', authUser.id)
        .eq('status', 'accepted');
      
      const friendCount = (friendCountSent || 0) + (friendCountReceived || 0);
      console.log(`👥 Friend count: ${friendCount}`);
      
      // Get user streak
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('current_streak')
        .eq('user_id', authUser.id)
        .maybeSingle();
      
      const currentStreak = progressData?.current_streak || 0;
      console.log(`🔥 Current streak: ${currentStreak}`);
      
      // Get all achievements
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*');
      
      if (!allAchievements || allAchievements.length === 0) {
        console.log('⚠️ No achievements found in database');
        return;
      }
      
      // Get user's current achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at, progress')
        .eq('user_id', authUser.id);
      
      const unlockedIds = new Set(
        (userAchievements || [])
          .filter(ua => ua.unlocked_at)
          .map(ua => ua.achievement_id)
      );
      
      let newlyUnlockedCount = 0;
      
      // Check each achievement
      for (const achievement of (allAchievements || [])) {
        if (unlockedIds.has(achievement.id)) continue;
        
        let currentProgress = 0;
        const target = achievement.requirement_target || 0;
        
        switch (achievement.requirement_type) {
          case 'study_time':
            currentProgress = totalStudyTime;
            break;
          case 'sessions':
            currentProgress = sessionsCompleted;
            break;
          case 'friends':
            currentProgress = friendCount;
            break;
          case 'streak':
            currentProgress = currentStreak;
            break;
          case 'courses':
            currentProgress = uniqueCourses;
            break;
          default:
            continue;
        }
        
        // Update progress
        await supabase.from('user_achievements').upsert({
          user_id: authUser.id,
          achievement_id: achievement.id,
          progress: currentProgress,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,achievement_id' });
        
        if (currentProgress >= target) {
          console.log(`🏆 Fallback: Unlocking achievement: ${achievement.title} (${currentProgress}/${target})`);
          
          // Update user_achievements with unlock
          await supabase.from('user_achievements').upsert({
            user_id: authUser.id,
            achievement_id: achievement.id,
            unlocked_at: new Date().toISOString(),
            progress: currentProgress,
          }, { onConflict: 'user_id,achievement_id' });
          
          const xpReward = (achievement as any).xp_reward || achievement.reward_points || 25;
          
          showAchievement(
            `🏆 ${achievement.title}`,
            `${achievement.description} (+${xpReward} XP)`
          );
          
          // Award XP
          await addXp(xpReward, 'achievement_unlock', achievement.id, { title: achievement.title });
          newlyUnlockedCount++;
        }
      }
      
      if (newlyUnlockedCount > 0) {
        console.log(`✅ Fallback unlocked ${newlyUnlockedCount} achievement(s)`);
      } else {
        console.log('ℹ️ Fallback: No new achievements to unlock');
      }
    } catch (error) {
      console.error('❌ Fallback achievement check failed:', error);
    }
  }, [authUser, isAuthenticated, showAchievement, addXp]);

  const checkAchievements = useCallback(async () => {
    if (!authUser || !isAuthenticated) {
      console.log('⚠️ Cannot check achievements: user not authenticated');
      return;
    }
    
    try {
      console.log('🏆 Checking achievements for user:', authUser.id);
      
      // First, try the RPC function
      const { data: newlyUnlocked, error: rpcError } = await (supabase as any).rpc('check_user_achievements', {
        p_user_id: authUser.id,
      });

      if (rpcError) {
        console.error('❌ Error from check_user_achievements RPC:', JSON.stringify(rpcError, null, 2));
        console.log('RPC error code:', rpcError?.code);
        console.log('RPC error message:', rpcError?.message);
        console.log('RPC error details:', rpcError?.details);
        console.log('RPC error hint:', rpcError?.hint);
        
        // Fallback: manually check achievements
        console.log('🔄 Attempting fallback achievement check...');
        await checkAchievementsFallback();
        return;
      }

      console.log('📊 RPC response type:', typeof newlyUnlocked);
      console.log('📊 RPC response:', JSON.stringify(newlyUnlocked, null, 2));

      if (newlyUnlocked && Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) {
        console.log(`🎉 ${newlyUnlocked.length} new achievement(s) unlocked!`);
        
        for (const row of newlyUnlocked as any[]) {
          // The RPC returns a JSONB 'achievements' column with achievement details
          // Parse it if it's a string, otherwise use directly
          let achData = row.achievements;
          if (typeof achData === 'string') {
            try {
              achData = JSON.parse(achData);
            } catch {
              console.warn('Could not parse achievement data:', achData);
              continue;
            }
          }
          
          if (!achData) {
            console.warn('No achievement data in row:', row);
            continue;
          }
          
          const xpReward = achData.xp_reward || achData.reward_points || 25;
          const title = achData.title || 'Achievement';
          const description = achData.description || '';
          
          console.log(`🏆 Achievement unlocked: ${title} (+${xpReward} XP)`);
          
          showAchievement(
            `🏆 ${title}`,
            `${description} (+${xpReward} XP)`
          );
          
          // Note: The RPC function already awards XP in the database
          // We only update local state here, don't double-award
          // The XP was already added to user_progress by the RPC
        }
        
        // Refresh all data to show updated achievements and XP
        await refreshAll();
        console.log('✅ Achievement data refreshed');
      } else {
        console.log('ℹ️ No new achievements unlocked');
        
        // Even if no new achievements, run fallback to ensure progress is updated
        // This helps catch edge cases where RPC returns empty but should have data
        await checkAchievementsFallback();
      }
    } catch (error: any) {
      console.error('❌ Exception checking achievements:', error);
      console.error('Error details:', error?.message || 'Unknown error');
      
      // Always try fallback on exception
      try {
        await checkAchievementsFallback();
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
    }
  }, [authUser, isAuthenticated, showAchievement, refreshAll, checkAchievementsFallback]);

  const getLeaderboardPosition = useCallback(async (): Promise<number> => {
    if (!authUser || !isAuthenticated) return 0;

    try {
      const { data, error } = await (supabase as any)
        .from('user_levels')
        .select('user_id, total_xp')
        .order('total_xp', { ascending: false })
        .limit(100);

      if (error) throw error;

      const position = (data ?? []).findIndex((u: { user_id: string }) => u.user_id === authUser.id) + 1;
      return position > 0 ? position : 0;
    } catch (error) {
      console.log('Error getting leaderboard position:', error);
      return 0;
    }
  }, [authUser, isAuthenticated]);

  return useMemo(() => ({
    ...state,
    isLoading,
    isReady,
    addXp,
    awardLessonComplete,
    awardQuizComplete,
    awardStudySession,
    awardChallengeComplete,
    claimAchievement,
    claimChallenge,
    checkAchievements,
    refreshAll,
    getLeaderboardPosition,
    updateChallengeProgress,
  }), [
    state,
    isLoading,
    isReady,
    addXp,
    awardLessonComplete,
    awardQuizComplete,
    awardStudySession,
    awardChallengeComplete,
    claimAchievement,
    claimChallenge,
    checkAchievements,
    refreshAll,
    getLeaderboardPosition,
    updateChallengeProgress,
  ]);
});

function generateLocalChallenges(): DailyChallenge[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: `local-easy-1-${today}`,
      title: 'Snabbfokus',
      description: 'Studera i 15 minuter idag',
      emoji: '⏱️',
      type: 'study_minutes',
      targetValue: 15,
      xpReward: 30,
      difficulty: 'easy',
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: `local-easy-2-${today}`,
      title: 'Första Passet',
      description: 'Slutför 1 studiepass',
      emoji: '📚',
      type: 'sessions_count',
      targetValue: 1,
      xpReward: 35,
      difficulty: 'easy',
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: `local-medium-1-${today}`,
      title: 'Fokustimme',
      description: 'Studera i 45 minuter idag',
      emoji: '🔥',
      type: 'study_minutes',
      targetValue: 45,
      xpReward: 60,
      difficulty: 'medium',
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: `local-medium-2-${today}`,
      title: 'Dubbelpass',
      description: 'Slutför 2 studiepass',
      emoji: '💪',
      type: 'sessions_count',
      targetValue: 2,
      xpReward: 75,
      difficulty: 'medium',
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: `local-hard-1-${today}`,
      title: 'Studiemaraton',
      description: 'Studera i 90 minuter idag',
      emoji: '🏆',
      type: 'study_minutes',
      targetValue: 90,
      xpReward: 120,
      difficulty: 'hard',
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: `local-hard-2-${today}`,
      title: 'Trippelpass',
      description: 'Slutför 3 studiepass',
      emoji: '⭐',
      type: 'sessions_count',
      targetValue: 3,
      xpReward: 150,
      difficulty: 'hard',
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    },
  ];
}

export { TIER_COLORS, RARITY_COLORS, DIFFICULTY_CONFIG };
