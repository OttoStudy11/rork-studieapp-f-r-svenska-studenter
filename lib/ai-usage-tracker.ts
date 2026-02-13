import AsyncStorage from '@react-native-async-storage/async-storage';

const AI_USAGE_KEY = 'ai_generation_usage';
const FREE_WEEKLY_LIMIT = 10;

interface AIUsageData {
  count: number;
  weekStart: string;
}

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

export async function getAIUsageCount(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(AI_USAGE_KEY);
    if (!stored) return 0;

    const data: AIUsageData = JSON.parse(stored);
    const currentWeekStart = getWeekStart();

    if (data.weekStart !== currentWeekStart) {
      await AsyncStorage.setItem(AI_USAGE_KEY, JSON.stringify({ count: 0, weekStart: currentWeekStart }));
      return 0;
    }

    return data.count;
  } catch (error) {
    console.error('[AIUsageTracker] Error reading usage:', error);
    return 0;
  }
}

export async function incrementAIUsage(): Promise<number> {
  try {
    const currentWeekStart = getWeekStart();
    const currentCount = await getAIUsageCount();
    const newCount = currentCount + 1;

    await AsyncStorage.setItem(AI_USAGE_KEY, JSON.stringify({
      count: newCount,
      weekStart: currentWeekStart,
    }));

    console.log(`[AIUsageTracker] Usage incremented: ${newCount}/${FREE_WEEKLY_LIMIT}`);
    return newCount;
  } catch (error) {
    console.error('[AIUsageTracker] Error incrementing usage:', error);
    return 0;
  }
}

export async function canGenerateAI(isPremium: boolean): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  if (isPremium) {
    return { allowed: true, remaining: Infinity, limit: Infinity };
  }

  const count = await getAIUsageCount();
  const remaining = Math.max(0, FREE_WEEKLY_LIMIT - count);

  return {
    allowed: remaining > 0,
    remaining,
    limit: FREE_WEEKLY_LIMIT,
  };
}

export async function resetAIUsage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AI_USAGE_KEY);
    console.log('[AIUsageTracker] Usage reset');
  } catch (error) {
    console.error('[AIUsageTracker] Error resetting usage:', error);
  }
}

export const FREE_AI_LIMIT = FREE_WEEKLY_LIMIT;
