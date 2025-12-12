import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo } from 'react';
import { useStudy } from '@/contexts/StudyContext';
import { usePoints } from '@/contexts/PointsContext';

export type ChallengePeriod = 'daily' | 'weekly';

export type ChallengeStatus = 'locked' | 'available' | 'completed' | 'claimed';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  period: ChallengePeriod;
  rewardPoints: number;
  target: number;
  current: number;
  percent: number;
  status: ChallengeStatus;
}

interface ChallengesContextValue {
  challenges: Challenge[];
  todaysChallenges: Challenge[];
  weeklyChallenges: Challenge[];
  claimChallenge: (challengeId: string) => Promise<void>;
  refresh: () => void;
}

const startOfDayKey = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

const startOfWeekKey = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

export const [ChallengesProvider, useChallenges] = createContextHook<ChallengesContextValue>(() => {
  const { pomodoroSessions } = useStudy();
  const { addPoints, claimedChallengeIds, markChallengeClaimed } = usePoints();

  const refresh = useCallback(() => {
    // Derived from pomodoroSessions + claimedChallengeIds; kept for a stable API.
  }, []);

  const computed = useMemo(() => {
    const now = new Date();
    const todayKey = startOfDayKey(now);
    const weekKey = startOfWeekKey(now);

    const sessionsToday = pomodoroSessions.filter((s) => {
      const end = new Date(s.endTime);
      return startOfDayKey(end) === todayKey;
    });

    const minutesToday = sessionsToday.reduce((sum, s) => sum + (Number.isFinite(s.duration) ? s.duration : 0), 0);

    const sessionsThisWeek = pomodoroSessions.filter((s) => {
      const end = new Date(s.endTime);
      return startOfWeekKey(end) === weekKey;
    });

    const minutesThisWeek = sessionsThisWeek.reduce((sum, s) => sum + (Number.isFinite(s.duration) ? s.duration : 0), 0);

    const make = (base: Omit<Challenge, 'current' | 'percent' | 'status'> & { current: number }) => {
      const percent = base.target <= 0 ? 0 : Math.min(100, Math.max(0, (base.current / base.target) * 100));
      const completed = base.current >= base.target;

      const scopedId = base.period === 'daily'
        ? `${base.id}:${todayKey}`
        : `${base.id}:${weekKey}`;

      const claimed = claimedChallengeIds.includes(scopedId);

      const status: ChallengeStatus = claimed
        ? 'claimed'
        : completed
          ? 'completed'
          : 'available';

      return {
        ...base,
        percent,
        status,
        id: scopedId,
      };
    };

    const daily = [
      make({
        id: 'daily_focus_25',
        title: 'Fokuspass',
        description: 'Studera 25 minuter idag',
        emoji: '⏱️',
        period: 'daily',
        rewardPoints: 15,
        target: 25,
        current: minutesToday,
      }),
      make({
        id: 'daily_two_sessions',
        title: 'Dubbelpass',
        description: 'Gör 2 studiepass idag',
        emoji: '🔥',
        period: 'daily',
        rewardPoints: 20,
        target: 2,
        current: sessionsToday.length,
      }),
    ];

    const weekly = [
      make({
        id: 'weekly_300',
        title: 'Veckorutin',
        description: 'Studera 300 minuter denna vecka',
        emoji: '📈',
        period: 'weekly',
        rewardPoints: 60,
        target: 300,
        current: minutesThisWeek,
      }),
    ];

    return { all: [...daily, ...weekly], daily, weekly };
  }, [claimedChallengeIds, pomodoroSessions]);

  const claimChallenge = useCallback(async (challengeId: string) => {
    const challenge = computed.all.find((c) => c.id === challengeId);
    if (!challenge) return;
    if (challenge.status !== 'completed') return;

    await markChallengeClaimed(challengeId);
    await addPoints(challenge.rewardPoints, {
      type: 'challenge',
      description: `Utmaning avklarad: ${challenge.title}`,
      sourceId: challengeId,
    });

    refresh();
  }, [addPoints, computed.all, markChallengeClaimed, refresh]);

  useEffect(() => {
    // Refresh is a stable function that doesn't trigger re-renders
  }, []);

  return useMemo(() => ({
    challenges: computed.all,
    todaysChallenges: computed.daily,
    weeklyChallenges: computed.weekly,
    claimChallenge,
    refresh,
  }), [claimChallenge, computed.all, computed.daily, computed.weekly, refresh]);
});
