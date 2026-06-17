/**
 * Conditional logger that only outputs in development mode.
 * Critical errors always log regardless of environment.
 */
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function formatMessage(level: LogLevel, tag: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString().slice(11, 23);
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${tag}]`;
  return data !== undefined ? `${prefix} ${message}` : `${prefix} ${message}`;
}

export const logger = {
  debug(tag: string, message: string, data?: unknown): void {
    if (!isDev) return;
    console.log(formatMessage('debug', tag, message, data));
  },

  info(tag: string, message: string, data?: unknown): void {
    if (!isDev) return;
    console.log(formatMessage('info', tag, message, data));
  },

  warn(tag: string, message: string, data?: unknown): void {
    if (isDev) {
      console.warn(formatMessage('warn', tag, message, data));
    }
  },

  error(tag: string, message: string, error?: unknown): void {
    // Always log errors
    const errMsg = error instanceof Error ? error.message : String(error ?? '');
    console.error(formatMessage('error', tag, message, errMsg ? ` | ${errMsg}` : ''));
  },
};

export default logger;
