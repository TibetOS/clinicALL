/**
 * Production-safe logger utility
 *
 * In production, logs are suppressed to prevent sensitive data leakage.
 * In development, logs are passed through to the console.
 *
 * IMPORTANT: Never log sensitive patient data (PII, health info, etc.)
 */

const isDevelopment = import.meta.env.DEV;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const noop = () => {};

/**
 * Creates a logger instance for a specific module
 * @param module - The name of the module (e.g., 'AuthContext', 'usePatients')
 */
export function createLogger(module: string): Logger {
  if (!isDevelopment) {
    // In production, suppress all logs
    return {
      debug: noop,
      info: noop,
      warn: noop,
      error: noop,
    };
  }

  const prefix = `[${module}]`;

  return {
    debug: (...args: unknown[]) => console.debug(prefix, ...args),
    info: (...args: unknown[]) => console.info(prefix, ...args),
    warn: (...args: unknown[]) => console.warn(prefix, ...args),
    error: (...args: unknown[]) => console.error(prefix, ...args),
  };
}

// Default logger for quick use
export const logger = createLogger('App');
