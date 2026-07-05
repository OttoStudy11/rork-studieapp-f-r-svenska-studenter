// RatingContext — App Rating & Review System
// Shows a premium glassmorphism rating modal at well-timed success moments,
// routes 5-star ratings to the native store review API, and routes low ratings
// to internal feedback. Enforces strict frequency rules via rating-storage.

import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import * as Haptics from 'expo-haptics';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';
import {
  RatingState,
  TriggerSource,
  loadRatingState,
  canPromptNow,
  recordPromptShown,
  recordDismissed,
  recordLowRating,
  recordReviewed,
  recordMilestoneChecked,
  incrementAppOpen,
} from '@/lib/rating-storage';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------
export type RatingModalPhase = 'hidden' | 'celebrating' | 'rating' | 'feedback' | 'thanks';

export interface PendingPrompt {
  source: TriggerSource;
  celebrationTitle?: string;
  celebrationMessage?: string;
}

export interface RatingContextValue {
  /** True when the rating modal is currently visible. */
  isModalVisible: boolean;
  modalPhase: RatingModalPhase;
  pendingPrompt: PendingPrompt | null;
  selectedRating: number;
  /** Try to show a prompt for a given trigger. Respects all frequency rules. */
  triggerRating: (source: TriggerSource, celebration?: { title: string; message: string }) => Promise<void>;
  /** Mark a milestone as already-satisfied so it won't trigger again. */
  markMilestoneChecked: (key: string) => Promise<void>;
  /** Increment app open counter (called once per app foreground). */
  trackAppOpen: () => Promise<void>;
  /** Internal handlers used by the modal component. */
  onRatingSelected: (rating: number) => Promise<void>;
  onDismiss: () => Promise<void>;
  onSubmitFeedback: (kind: 'bug' | 'feature' | 'general', text: string) => Promise<void>;
  onCloseThanks: () => void;
  /** Whether the native store review API is available on this device. */
  isNativeReviewAvailable: boolean;
  /** Dev helper to reset all rating state. */
  resetRatingState: () => Promise<void>;
}

// ----------------------------------------------------------------------------
// Analytics
// ----------------------------------------------------------------------------
type RatingEventType = 'prompt_shown' | 'prompt_dismissed' | 'rating_selected' | 'review_submitted' | 'feedback_submitted';

async function trackRatingEvent(
  userId: string | null,
  eventType: RatingEventType,
  triggerSource: TriggerSource | null,
  payload: { rating?: number; feedbackKind?: 'bug' | 'feature' | 'general'; feedbackText?: string; metadata?: Record<string, unknown> } = {},
): Promise<void> {
  try {
    if (!userId) return;
    const { error } = await (supabase as any).from('rating_events').insert({
      user_id: userId,
      event_type: eventType,
      trigger_source: triggerSource ?? 'app_opened_15',
      rating: payload.rating ?? null,
      feedback_kind: payload.feedbackKind ?? null,
      feedback_text: payload.feedbackText ?? null,
      metadata: payload.metadata ?? {},
    });
    if (error) {
      logger.warn('RatingContext', 'analytics insert failed', error.message);
    }
  } catch (e) {
    // Analytics are best-effort — never block UX
    logger.warn('RatingContext', 'analytics exception', String(e));
  }
}

// ----------------------------------------------------------------------------
// Provider
// ----------------------------------------------------------------------------
export const [RatingProvider, useRating] = createContextHook<RatingContextValue>(() => {
  const { user: authUser, isAuthenticated } = useAuth();
  const { showSuccess } = useToast();

  const [state, setState] = useState<RatingState | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalPhase, setModalPhase] = useState<RatingModalPhase>('hidden');
  const [pendingPrompt, setPendingPrompt] = useState<PendingPrompt | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isNativeReviewAvailable, setIsNativeReviewAvailable] = useState(false);

  const stateRef = useRef<RatingState | null>(null);
  const appOpenTrackedRef = useRef(false);
  const lastTriggerCheckRef = useRef<number>(0);

  // Keep ref in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Load persisted state + check native review availability on mount
  useEffect(() => {
    (async () => {
      const loaded = await loadRatingState();
      setState(loaded);
      try {
        const available = await StoreReview.isAvailableAsync();
        setIsNativeReviewAvailable(available);
      } catch {
        setIsNativeReviewAvailable(false);
      }
    })();
  }, []);

  // Reset transient state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setIsModalVisible(false);
      setModalPhase('hidden');
      setPendingPrompt(null);
      setSelectedRating(0);
      appOpenTrackedRef.current = false;
    }
  }, [isAuthenticated]);

  // ----------------------------------------------------------------------------
  // Track app open (once per foreground)
  // ----------------------------------------------------------------------------
  const trackAppOpen = useCallback(async () => {
    if (appOpenTrackedRef.current) return;
    appOpenTrackedRef.current = true;
    let current = stateRef.current;
    if (!current) {
      current = await loadRatingState();
      setState(current);
    }
    const next = await incrementAppOpen(current);
    setState(next);

    // After tracking, check usage-based triggers
    const now = Date.now();
    if (now - lastTriggerCheckRef.current < 5000) return;
    lastTriggerCheckRef.current = now;

    const daysSinceInstall = (now - next.appInstallAt) / (24 * 60 * 60 * 1000);
    if (daysSinceInstall >= 7 && !next.triggeredMilestones['app_usage_7d']) {
      await triggerRating('app_usage_7d');
      return;
    }
    if (next.appOpenCount >= 15 && !next.triggeredMilestones['app_opened_15']) {
      await triggerRating('app_opened_15');
    }
  }, []);

  // ----------------------------------------------------------------------------
  // markMilestoneChecked — prevent a trigger from ever firing
  // ----------------------------------------------------------------------------
  const markMilestoneChecked = useCallback(async (key: string) => {
    const current = stateRef.current;
    if (!current) return;
    const next = await recordMilestoneChecked(current, key);
    setState(next);
  }, []);

  // ----------------------------------------------------------------------------
  // triggerRating — the main entry point called from success moments
  // ----------------------------------------------------------------------------
  const triggerRating = useCallback(async (
    source: TriggerSource,
    celebration?: { title: string; message: string },
  ) => {
    // Never show during onboarding / unauthenticated
    if (!isAuthenticated || !authUser) return;
    // Never show if a modal is already up
    if (isModalVisible) return;

    let current = stateRef.current;
    if (!current) {
      current = await loadRatingState();
      setState(current);
    }

    // Already triggered this exact milestone? Skip silently
    if (current.triggeredMilestones[source]) return;

    // Enforce all cooldown / quota rules
    if (!canPromptNow(current)) {
      return;
    }

    // Record + persist
    const next = await recordPromptShown(current, source);
    setState(next);

    // Analytics
    await trackRatingEvent(authUser.id, 'prompt_shown', source, {
      metadata: { celebration: !!celebration },
    });

    // Haptic
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}

    // Show modal — celebrate first if a celebration was provided
    setPendingPrompt({ source, celebrationTitle: celebration?.title, celebrationMessage: celebration?.message });
    setSelectedRating(0);
    setModalPhase(celebration ? 'celebrating' : 'rating');
    setIsModalVisible(true);
  }, [isAuthenticated, authUser, isModalVisible]);

  // ----------------------------------------------------------------------------
  // onRatingSelected — 5★ → native review; 1–4★ → feedback
  // ----------------------------------------------------------------------------
  const onRatingSelected = useCallback(async (rating: number) => {
    setSelectedRating(rating);
    const current = stateRef.current;
    if (!current || !authUser) return;

    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}

    await trackRatingEvent(authUser.id, 'rating_selected', pendingPrompt?.source ?? null, { rating });

    if (rating >= 5) {
      // Route straight to native store review — no extra screen
      const reviewed = await recordReviewed(current);
      setState(reviewed);

      await trackRatingEvent(authUser.id, 'review_submitted', pendingPrompt?.source ?? null, { rating });

      try {
        if (isNativeReviewAvailable) {
          await StoreReview.requestReview();
        } else {
          // Fallback: open store listing directly
          const storeUrl = Platform.OS === 'ios'
            ? 'itms-apps://itunes.apple.com/app/idStudiestugan'
            : 'market://details?id=com.studiestugan';
          Linking.openURL(storeUrl).catch(() => {});
        }
      } catch (e) {
        logger.warn('RatingContext', 'native review failed', String(e));
      }

      // Close modal after native sheet
      setIsModalVisible(false);
      setModalPhase('hidden');
      setPendingPrompt(null);
      showSuccess('Tack för din recension!', 'Vi uppskattar verkligen ditt stöd.');
    } else {
      // Low rating → feedback screen, never leave the app
      const low = await recordLowRating(current);
      setState(low);
      setModalPhase('feedback');
    }
  }, [authUser, pendingPrompt, isNativeReviewAvailable, showSuccess]);

  // ----------------------------------------------------------------------------
  // onSubmitFeedback — internal feedback for low ratings
  // ----------------------------------------------------------------------------
  const onSubmitFeedback = useCallback(async (kind: 'bug' | 'feature' | 'general', text: string) => {
    if (!authUser) return;
    await trackRatingEvent(authUser.id, 'feedback_submitted', pendingPrompt?.source ?? null, {
      feedbackKind: kind,
      feedbackText: text,
    });
    setModalPhase('thanks');
    try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
  }, [authUser, pendingPrompt]);

  // ----------------------------------------------------------------------------
  // onDismiss / onCloseThanks
  // ----------------------------------------------------------------------------
  const onDismiss = useCallback(async () => {
    const current = stateRef.current;
    if (current) {
      const next = await recordDismissed(current);
      setState(next);
    }
    if (authUser) {
      await trackRatingEvent(authUser.id, 'prompt_dismissed', pendingPrompt?.source ?? null);
    }
    setIsModalVisible(false);
    setModalPhase('hidden');
    setPendingPrompt(null);
    setSelectedRating(0);
  }, [authUser, pendingPrompt]);

  const onCloseThanks = useCallback(() => {
    setIsModalVisible(false);
    setModalPhase('hidden');
    setPendingPrompt(null);
    setSelectedRating(0);
  }, []);

  // ----------------------------------------------------------------------------
  // resetRatingState — dev helper
  // ----------------------------------------------------------------------------
  const resetRatingState = useCallback(async () => {
    await AsyncStorage.removeItem('rating_state_v1');
    const fresh = await loadRatingState();
    setState(fresh);
    showSuccess('Betyg-state rensad', 'Klar att testa igen.');
  }, [showSuccess]);

  return useMemo(() => ({
    isModalVisible,
    modalPhase,
    pendingPrompt,
    selectedRating,
    triggerRating,
    markMilestoneChecked,
    trackAppOpen,
    onRatingSelected,
    onDismiss,
    onSubmitFeedback,
    onCloseThanks,
    isNativeReviewAvailable,
    resetRatingState,
  }), [
    isModalVisible,
    modalPhase,
    pendingPrompt,
    selectedRating,
    triggerRating,
    markMilestoneChecked,
    trackAppOpen,
    onRatingSelected,
    onDismiss,
    onSubmitFeedback,
    onCloseThanks,
    isNativeReviewAvailable,
    resetRatingState,
  ]);
});
