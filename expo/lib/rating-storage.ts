// Rating storage layer — frequency rules + analytics state
// Persisted via AsyncStorage. All rules enforced here so the context stays thin.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  lastPromptAt: 'rating_last_prompt_at',
  lastDismissedAt: 'rating_last_dismissed_at',
  lastLowRatingAt: 'rating_last_low_rating_at',
  hasReviewed: 'rating_has_reviewed',
  promptCountYear: 'rating_prompt_count_year',
  promptCountYearResetAt: 'rating_prompt_count_year_reset_at',
  appInstallAt: 'rating_app_install_at',
  appOpenCount: 'rating_app_open_count',
  triggeredMilestones: 'rating_triggered_milestones',
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const YEAR_MS = 365 * DAY_MS;

// Frequency rules
export const COOLDOWN_DISMISS_DAYS = 30;
export const COOLDOWN_LOW_RATING_DAYS = 60;
export const COOLDOWN_DEFAULT_DAYS = 30;
export const MAX_PROMPTS_PER_YEAR = 3;

export type TriggerSource =
  | 'study_session_10'
  | 'study_session_25'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'hp_first_simulation'
  | 'hp_score_improved'
  | 'hp_difficult_quiz'
  | 'flashcards_100'
  | 'flashcards_500'
  | 'premium_purchase'
  | 'app_usage_7d'
  | 'app_opened_15';

export interface RatingState {
  lastPromptAt: number | null;
  lastDismissedAt: number | null;
  lastLowRatingAt: number | null;
  hasReviewed: boolean;
  promptCountYear: number;
  promptCountYearResetAt: number;
  appInstallAt: number;
  appOpenCount: number;
  triggeredMilestones: Record<string, boolean>;
}

const defaultState: RatingState = {
  lastPromptAt: null,
  lastDismissedAt: null,
  lastLowRatingAt: null,
  hasReviewed: false,
  promptCountYear: 0,
  promptCountYearResetAt: 0,
  appInstallAt: 0,
  appOpenCount: 0,
  triggeredMilestones: {},
};

export async function loadRatingState(): Promise<RatingState> {
  try {
    const raw = await AsyncStorage.getItem('rating_state_v1');
    if (!raw) {
      const fresh: RatingState = {
        ...defaultState,
        appInstallAt: Date.now(),
        promptCountYearResetAt: Date.now(),
      };
      await saveRatingState(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<RatingState>;
    return { ...defaultState, ...parsed };
  } catch {
    return { ...defaultState, appInstallAt: Date.now() };
  }
}

export async function saveRatingState(state: RatingState): Promise<void> {
  try {
    await AsyncStorage.setItem('rating_state_v1', JSON.stringify(state));
  } catch (e) {
    console.warn('[Rating] Failed to save state:', e);
  }
}

/** Whether enough time has passed + quota allows another prompt. */
export function canPromptNow(state: RatingState, now: number = Date.now()): boolean {
  if (state.hasReviewed) return false;

  // Reset yearly counter if a year has passed
  let yearCount = state.promptCountYear;
  let yearResetAt = state.promptCountYearResetAt;
  if (now - yearResetAt > YEAR_MS) {
    yearCount = 0;
    yearResetAt = now;
  }
  if (yearCount >= MAX_PROMPTS_PER_YEAR) return false;

  // Pick the longest applicable cooldown
  let cooldown = COOLDOWN_DEFAULT_DAYS * DAY_MS;
  if (state.lastLowRatingAt) {
    cooldown = Math.max(cooldown, COOLDOWN_LOW_RATING_DAYS * DAY_MS);
  }
  if (state.lastDismissedAt) {
    cooldown = Math.max(cooldown, COOLDOWN_DISMISS_DAYS * DAY_MS);
  }
  if (state.lastPromptAt) {
    cooldown = Math.max(cooldown, COOLDOWN_DEFAULT_DAYS * DAY_MS);
  }

  const lastEvent = Math.max(
    state.lastPromptAt ?? 0,
    state.lastDismissedAt ?? 0,
    state.lastLowRatingAt ?? 0,
  );

  return now - lastEvent >= cooldown;
}

export async function recordPromptShown(state: RatingState, source: TriggerSource): Promise<RatingState> {
  const now = Date.now();
  let yearCount = state.promptCountYear;
  let yearResetAt = state.promptCountYearResetAt;
  if (now - yearResetAt > YEAR_MS) {
    yearCount = 0;
    yearResetAt = now;
  }
  const next: RatingState = {
    ...state,
    lastPromptAt: now,
    promptCountYear: yearCount + 1,
    promptCountYearResetAt: yearResetAt,
    triggeredMilestones: { ...state.triggeredMilestones, [source]: true },
  };
  await saveRatingState(next);
  return next;
}

export async function recordDismissed(state: RatingState): Promise<RatingState> {
  const next: RatingState = { ...state, lastDismissedAt: Date.now() };
  await saveRatingState(next);
  return next;
}

export async function recordLowRating(state: RatingState): Promise<RatingState> {
  const next: RatingState = { ...state, lastLowRatingAt: Date.now() };
  await saveRatingState(next);
  return next;
}

export async function recordReviewed(state: RatingState): Promise<RatingState> {
  const next: RatingState = { ...state, hasReviewed: true };
  await saveRatingState(next);
  return next;
}

export async function recordMilestoneChecked(state: RatingState, key: string): Promise<RatingState> {
  if (state.triggeredMilestones[key]) return state;
  const next: RatingState = {
    ...state,
    triggeredMilestones: { ...state.triggeredMilestones, [key]: true },
  };
  await saveRatingState(next);
  return next;
}

export async function incrementAppOpen(state: RatingState): Promise<RatingState> {
  const next: RatingState = { ...state, appOpenCount: state.appOpenCount + 1 };
  await saveRatingState(next);
  return next;
}

/** Wipe everything (used for dev/testing). */
export async function resetRatingState(): Promise<void> {
  await AsyncStorage.removeItem('rating_state_v1');
}
