/**
 * Lightweight, provider-agnostic logging utility.
 * Designed to easily integrate with Sentry, LogRocket, or Firebase Crashlytics in the future.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

export function logError(error: Error | string, context?: LogContext) {
  _log('error', error, context);
}

export function logWarn(message: string, context?: LogContext) {
  _log('warn', message, context);
}

export function logInfo(message: string, context?: LogContext) {
  _log('info', message, context);
}

function _log(level: LogLevel, messageOrError: Error | string, context?: LogContext) {
  const timestamp = new Date().toISOString();
  
  // In development, log to console
  if (process.env.NODE_ENV !== 'production') {
    if (level === 'error') {
      console.error(`[${timestamp}] ERROR:`, messageOrError, context || '');
    } else if (level === 'warn') {
      console.warn(`[${timestamp}] WARN:`, messageOrError, context || '');
    } else {
      console.info(`[${timestamp}] INFO:`, messageOrError, context || '');
    }
  }

  // In production, this would send to an external service
  // Example: 
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(messageOrError, { extra: context });
  // }
}
