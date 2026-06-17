import { logger } from './logger';

/**
 * Safely parse JSON with fallback and error logging.
 * Prevents crashes from malformed AsyncStorage data.
 */
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T, tag = 'safeJsonParse'): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown parse error';
    logger.error(tag, `Failed to parse JSON, using fallback`, message);
    return fallback;
  }
}

export function safeJsonParseOrNull<T>(raw: string | null | undefined, tag = 'safeJsonParse'): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown parse error';
    logger.error(tag, `Failed to parse JSON, returning null`, message);
    return null;
  }
}
