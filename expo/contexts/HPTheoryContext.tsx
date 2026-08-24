import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery } from '@tanstack/react-query';
import { fetchMergedTheoryArticles } from '@/lib/hp-content';
import { HP_THEORY_ARTICLES, HPTheoryArticle } from '@/constants/hogskoleprovet-theory';
import { safeJsonParse } from '@/utils/safeJsonParse';

const STORAGE_KEY = 'hp_theory_reading_progress_v1';

export interface HPArticleProgress {
  /** 0-100 scroll progress */
  progress: number;
  completedAt?: string;
  lastOpenedAt: string;
}

type ProgressMap = Record<string, HPArticleProgress>;

export const [HPTheoryProvider, useHPTheory] = createContextHook(() => {
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  const articlesQuery = useQuery({
    queryKey: ['hp-theory-articles'],
    queryFn: () => fetchMergedTheoryArticles(),
    staleTime: 1000 * 60 * 30,
  });

  const articles: HPTheoryArticle[] = articlesQuery.data ?? HP_THEORY_ARTICLES;

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!mounted) return;
        if (raw) {
          const parsed = safeJsonParse<ProgressMap>(raw, {});
          setProgressMap(parsed ?? {});
        }
        setIsHydrated(true);
      })
      .catch(() => setIsHydrated(true));
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback((next: ProgressMap) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const updateProgress = useCallback((articleId: string, progress: number) => {
    setProgressMap(prev => {
      const existing = prev[articleId];
      const clamped = Math.max(existing?.progress ?? 0, Math.min(100, Math.round(progress)));
      if (existing && existing.progress === clamped) return prev;
      const next: ProgressMap = {
        ...prev,
        [articleId]: {
          progress: clamped,
          completedAt: clamped >= 95 ? (existing?.completedAt ?? new Date().toISOString()) : existing?.completedAt,
          lastOpenedAt: new Date().toISOString(),
        },
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const markCompleted = useCallback((articleId: string) => {
    setProgressMap(prev => {
      const next: ProgressMap = {
        ...prev,
        [articleId]: {
          progress: 100,
          completedAt: prev[articleId]?.completedAt ?? new Date().toISOString(),
          lastOpenedAt: new Date().toISOString(),
        },
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const readArticleIds = useMemo(
    () => Object.keys(progressMap).filter(id => (progressMap[id]?.progress ?? 0) >= 95),
    [progressMap]
  );

  const completedCount = readArticleIds.length;

  const getProgress = useCallback(
    (articleId: string): number => progressMap[articleId]?.progress ?? 0,
    [progressMap]
  );

  return {
    articles,
    isLoadingArticles: articlesQuery.isLoading,
    isHydrated,
    progressMap,
    readArticleIds,
    completedCount,
    getProgress,
    updateProgress,
    markCompleted,
  };
});
