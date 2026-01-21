import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'perf_cache_';
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const performanceCache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!raw) return null;
      
      const entry: CacheEntry<T> = JSON.parse(raw);
      const now = Date.now();
      
      if (now - entry.timestamp > entry.ttl) {
        AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }
      
      return entry.data;
    } catch {
      return null;
    }
  },
  
  async set<T>(key: string, data: T, ttl: number = DEFAULT_CACHE_TTL): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch {
      // Ignore cache write errors
    }
  },
  
  async invalidate(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch {
      // Ignore
    }
  },
  
  async invalidateAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch {
      // Ignore
    }
  }
};

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  key: string,
  delay: number
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    const existing = debounceTimers.get(key);
    if (existing) {
      clearTimeout(existing);
    }
    
    const timer = setTimeout(() => {
      debounceTimers.delete(key);
      fn(...args);
    }, delay);
    
    debounceTimers.set(key, timer);
  };
}

const throttleLastCall = new Map<string, number>();

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  key: string,
  interval: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    const last = throttleLastCall.get(key) || 0;
    
    if (now - last >= interval) {
      throttleLastCall.set(key, now);
      return fn(...args);
    }
    return undefined;
  };
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback?: T
): Promise<T> {
  const timeout = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), ms);
  });
  
  try {
    return await Promise.race([promise, timeout]);
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}

export function createDeferredLoader<T>(
  loader: () => Promise<T>,
  options: { delayMs?: number; onError?: (error: Error) => void } = {}
): { load: () => void; getData: () => T | null; isLoaded: () => boolean } {
  let data: T | null = null;
  let loaded = false;
  let loading = false;
  
  return {
    load: () => {
      if (loaded || loading) return;
      loading = true;
      
      const execute = async () => {
        try {
          data = await loader();
          loaded = true;
        } catch (error) {
          options.onError?.(error as Error);
        } finally {
          loading = false;
        }
      };
      
      if (options.delayMs) {
        setTimeout(execute, options.delayMs);
      } else {
        execute();
      }
    },
    getData: () => data,
    isLoaded: () => loaded,
  };
}

export const batchedUpdates = {
  queue: [] as Array<() => void>,
  scheduled: false,
  
  add(fn: () => void) {
    this.queue.push(fn);
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        const batch = [...this.queue];
        this.queue = [];
        this.scheduled = false;
        batch.forEach(f => f());
      });
    }
  }
};

export async function parallelWithLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  limit: number = 3
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];
  
  for (const item of items) {
    const p = fn(item).then(result => {
      results.push(result);
    });
    executing.push(p);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(e => e === p), 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}

let sessionCacheValid = true;

export const sessionCache = {
  markStale: () => { sessionCacheValid = false; },
  markFresh: () => { sessionCacheValid = true; },
  isValid: () => sessionCacheValid,
};
