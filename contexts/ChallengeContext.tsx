import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { CHALLENGE_TEMPLATES, ChallengeTemplate, getTemplatesByCadence } from '@/constants/challenges';
import { usePoints } from './PointsContext';
import { useToast } from './ToastContext';

export type ChallengeStatus = 'not_started' | 'in_progress' | 'completed';

export interface ChallengeInstance extends ChallengeTemplate {
  status: ChallengeStatus;
  progress: number;
  assignedAt: string;
  completedAt?: string;
}

interface ChallengeContextValue {
  isLoading: boolean;
  challenges: ChallengeInstance[];
  dailyChallenges: ChallengeInstance[];
  weeklyChallenges: ChallengeInstance[];
  startChallenge: (id: string) => Promise<void>;
  updateChallengeProgress: (id: string, delta: number) => Promise<void>;
  completeChallenge: (id: string) => Promise<void>;
  refreshChallengeBoard: () => Promise<void>;
}

const STORAGE_KEY = 'challenge_state_v1';
const DAILY_COUNT = 3;
const WEEKLY_COUNT = 3;

const pickRandomTemplates = (templates: ChallengeTemplate[], count: number) => {
  const pool = [...templates];
  const picked: ChallengeTemplate[] = [];
  while (pool.length && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
};

const instantiateTemplates = (templates: ChallengeTemplate[]): ChallengeInstance[] => {
  const timestamp = new Date().toISOString();
  return templates.map<ChallengeInstance>((template) => ({
    ...template,
    status: 'not_started' as ChallengeStatus,
    progress: 0,
    assignedAt: timestamp,
  }));
};

const buildDefaultBoard = () => {
  const daily = pickRandomTemplates(getTemplatesByCadence('daily'), DAILY_COUNT);
  const weekly = pickRandomTemplates(getTemplatesByCadence('weekly'), WEEKLY_COUNT);
  const seasonal = CHALLENGE_TEMPLATES.filter((challenge) => challenge.cadence === 'seasonal');
  return instantiateTemplates([...daily, ...weekly, ...seasonal]);
};

export const [ChallengeProvider, useChallenges] = createContextHook<ChallengeContextValue>(() => {
  const { addPoints } = usePoints();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [challenges, setChallenges] = useState<ChallengeInstance[]>([]);

  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ChallengeInstance[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChallenges(parsed);
          } else {
            const defaults = buildDefaultBoard();
            setChallenges(defaults);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
          }
        } else {
          const defaults = buildDefaultBoard();
          setChallenges(defaults);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        }
      } catch (error) {
        console.log('Failed to hydrate challenges', error);
        const defaults = buildDefaultBoard();
        setChallenges(defaults);
      } finally {
        setIsLoading(false);
      }
    };
    hydrate();
  }, []);

  const persist = useCallback(async (payload: ChallengeInstance[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.log('Failed to persist challenges', error);
    }
  }, []);

  const refreshChallengeBoard = useCallback(async () => {
    const nextBoard = buildDefaultBoard();
    setChallenges(nextBoard);
    await persist(nextBoard);
    showSuccess('Nya utmaningar', 'Dina utmaningar har uppdaterats');
  }, [persist, showSuccess]);

  const startChallenge = useCallback(async (id: string) => {
    const exists = challenges.find((challenge) => challenge.id === id);
    if (!exists || exists.status !== 'not_started') return;
    const updated = challenges.map<ChallengeInstance>((challenge) =>
      challenge.id === id
        ? { ...challenge, status: 'in_progress' as ChallengeStatus, progress: 0 }
        : challenge
    );
    setChallenges(updated);
    await persist(updated);
  }, [challenges, persist]);

  const completeChallenge = useCallback(async (id: string) => {
    const target = challenges.find((challenge) => challenge.id === id);
    if (!target || target.status === 'completed') return;
    const timestamp = new Date().toISOString();
    const updated = challenges.map<ChallengeInstance>((challenge) =>
      challenge.id === id
        ? { ...challenge, status: 'completed' as ChallengeStatus, progress: challenge.target, completedAt: timestamp }
        : challenge
    );
    setChallenges(updated);
    await persist(updated);
    try {
      await addPoints(target.rewardPoints, {
        type: 'challenge',
        description: target.title,
        sourceId: target.id,
      });
      showSuccess('Utmaning klar', `+${target.rewardPoints} poäng`);
    } catch (error) {
      console.log('Failed to award challenge points', error);
      showError('Kunde inte ge poäng', 'Försök igen om en stund');
    }
  }, [challenges, addPoints, persist, showSuccess, showError]);

  const updateChallengeProgress = useCallback(async (id: string, delta: number) => {
    if (!delta) return;
    const target = challenges.find((challenge) => challenge.id === id);
    if (!target || target.status === 'completed') return;
    const nextProgress = Math.min(Math.max(target.progress + delta, 0), target.target);
    if (nextProgress >= target.target) {
      await completeChallenge(id);
      return;
    }
    const status: ChallengeStatus = nextProgress > 0 ? 'in_progress' : 'not_started';
    const updated = challenges.map<ChallengeInstance>((challenge) =>
      challenge.id === id
        ? { ...challenge, status, progress: nextProgress }
        : challenge
    );
    setChallenges(updated);
    await persist(updated);
  }, [challenges, completeChallenge, persist]);

  const dailyChallenges = useMemo(() => challenges.filter((challenge) => challenge.cadence === 'daily'), [challenges]);
  const weeklyChallenges = useMemo(() => challenges.filter((challenge) => challenge.cadence === 'weekly'), [challenges]);

  return useMemo(() => ({
    isLoading,
    challenges,
    dailyChallenges,
    weeklyChallenges,
    startChallenge,
    updateChallengeProgress,
    completeChallenge,
    refreshChallengeBoard,
  }), [
    isLoading,
    challenges,
    dailyChallenges,
    weeklyChallenges,
    startChallenge,
    updateChallengeProgress,
    completeChallenge,
    refreshChallengeBoard,
  ]);
});