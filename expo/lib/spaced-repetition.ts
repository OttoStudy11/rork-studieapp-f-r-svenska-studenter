import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const SRS_NOTIFICATIONS_KEY = '@srs_notifications';
const SRS_STATS_KEY = '@srs_stats';

export interface DueCardsSummary {
  courseId: string;
  courseTitle: string;
  dueCount: number;
  totalCards: number;
  masteredCards: number;
  averageEaseFactor: number;
  nextReviewDate: string | null;
}

export interface SRSStats {
  totalReviews: number;
  correctReviews: number;
  averageRetention: number;
  cardsLearned: number;
  cardsMastered: number;
  reviewsToday: number;
  streakDays: number;
  lastReviewDate: string | null;
}

export interface ReviewForecast {
  date: string;
  count: number;
}

export async function getDueCardsByCourse(userId: string): Promise<DueCardsSummary[]> {
  try {
    console.log('📚 Fetching due cards for user:', userId);

    const { data: flashcards, error: fcError } = await supabase
      .from('flashcards')
      .select('id, course_id');

    if (fcError) {
      console.error('Error fetching flashcards:', fcError);
      return [];
    }

    if (!flashcards || flashcards.length === 0) return [];

    const flashcardIds = flashcards.map(f => f.id);

    const { data: progress, error: progError } = await supabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', userId)
      .in('flashcard_id', flashcardIds);

    if (progError) {
      console.error('Error fetching flashcard progress:', progError);
      return [];
    }

    const courseIds = [...new Set(flashcards.map(f => f.course_id))];

    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .in('id', courseIds);

    const courseMap = new Map<string, string>();
    (courses || []).forEach(c => courseMap.set(c.id, c.title));

    const progressMap = new Map<string, any>();
    (progress || []).forEach(p => progressMap.set(p.flashcard_id, p));

    const now = new Date();
    const summaryMap = new Map<string, DueCardsSummary>();

    for (const fc of flashcards) {
      if (!summaryMap.has(fc.course_id)) {
        summaryMap.set(fc.course_id, {
          courseId: fc.course_id,
          courseTitle: courseMap.get(fc.course_id) || 'Okänd kurs',
          dueCount: 0,
          totalCards: 0,
          masteredCards: 0,
          averageEaseFactor: 0,
          nextReviewDate: null,
        });
      }

      const summary = summaryMap.get(fc.course_id)!;
      summary.totalCards++;

      const prog = progressMap.get(fc.id);
      if (!prog) {
        summary.dueCount++;
      } else {
        summary.averageEaseFactor += prog.ease_factor || 2.5;
        if (prog.repetitions >= 3) {
          summary.masteredCards++;
        }
        if (new Date(prog.next_review_at) <= now) {
          summary.dueCount++;
        }
        if (!summary.nextReviewDate || prog.next_review_at < summary.nextReviewDate) {
          summary.nextReviewDate = prog.next_review_at;
        }
      }
    }

    const results = Array.from(summaryMap.values());
    results.forEach(s => {
      if (s.totalCards > 0) {
        s.averageEaseFactor = Number((s.averageEaseFactor / s.totalCards).toFixed(2));
      }
    });

    results.sort((a, b) => b.dueCount - a.dueCount);

    console.log(`📚 Found ${results.length} courses with flashcards`);
    return results;
  } catch (error) {
    console.error('Error in getDueCardsByCourse:', error);
    return [];
  }
}

export async function getSRSStats(userId: string): Promise<SRSStats> {
  try {
    const { data: progress } = await supabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', userId);

    const allProgress = progress || [];
    const totalReviews = allProgress.reduce((sum, p) => sum + (p.total_reviews || 0), 0);
    const correctReviews = allProgress.reduce((sum, p) => sum + (p.correct_reviews || 0), 0);
    const mastered = allProgress.filter(p => (p.repetitions || 0) >= 3).length;

    const today = new Date().toISOString().split('T')[0];
    const reviewsToday = allProgress.filter(p => {
      if (!p.last_reviewed_at) return false;
      return p.last_reviewed_at.startsWith(today);
    }).length;

    const stored = await AsyncStorage.getItem(SRS_STATS_KEY);
    const storedStats = stored ? JSON.parse(stored) : {};

    let streakDays = storedStats.streakDays || 0;
    const lastReviewDate = storedStats.lastReviewDate || null;

    if (reviewsToday > 0 && lastReviewDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastReviewDate === yesterdayStr) {
        streakDays++;
      } else if (lastReviewDate !== today) {
        streakDays = 1;
      }

      await AsyncStorage.setItem(SRS_STATS_KEY, JSON.stringify({
        streakDays,
        lastReviewDate: today,
      }));
    }

    return {
      totalReviews,
      correctReviews,
      averageRetention: totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0,
      cardsLearned: allProgress.length,
      cardsMastered: mastered,
      reviewsToday,
      streakDays,
      lastReviewDate,
    };
  } catch (error) {
    console.error('Error getting SRS stats:', error);
    return {
      totalReviews: 0,
      correctReviews: 0,
      averageRetention: 0,
      cardsLearned: 0,
      cardsMastered: 0,
      reviewsToday: 0,
      streakDays: 0,
      lastReviewDate: null,
    };
  }
}

export async function getReviewForecast(userId: string, days: number = 7): Promise<ReviewForecast[]> {
  try {
    const { data: progress } = await supabase
      .from('user_flashcard_progress')
      .select('next_review_at')
      .eq('user_id', userId);

    const forecast: ReviewForecast[] = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const count = (progress || []).filter(p => {
        if (!p.next_review_at) return false;
        return p.next_review_at.startsWith(dateStr);
      }).length;

      forecast.push({ date: dateStr, count });
    }

    return forecast;
  } catch (error) {
    console.error('Error getting review forecast:', error);
    return [];
  }
}

export async function scheduleSRSNotifications(_userId: string): Promise<void> {
  await cancelSRSNotifications();
}

export async function cancelSRSNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const stored = await AsyncStorage.getItem(SRS_NOTIFICATIONS_KEY);
    if (!stored) return;

    const ids: string[] = JSON.parse(stored);
    for (const id of ids) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    await AsyncStorage.removeItem(SRS_NOTIFICATIONS_KEY);
    console.log('✅ Cancelled SRS notifications');
  } catch (error) {
    console.error('Failed to cancel SRS notifications:', error);
  }
}

export function getRetentionColor(retention: number): string {
  if (retention >= 90) return '#10B981';
  if (retention >= 70) return '#F59E0B';
  if (retention >= 50) return '#F97316';
  return '#EF4444';
}

export function getEaseLabel(easeFactor: number): string {
  if (easeFactor >= 2.5) return 'Lätt';
  if (easeFactor >= 2.0) return 'Normal';
  if (easeFactor >= 1.5) return 'Svår';
  return 'Mycket svår';
}

export function formatNextReview(dateStr: string | null): string {
  if (!dateStr) return 'Inga kort';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Nu';
  if (diffDays === 1) return 'Imorgon';
  if (diffDays <= 7) return `Om ${diffDays} dagar`;
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}
