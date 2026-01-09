import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createLogger } from '../lib/logger';

const logger = createLogger('useSessionTimeout');

/**
 * Session Timeout Hook for Healthcare Compliance
 *
 * Automatically logs out users after a period of inactivity to protect
 * sensitive patient data. This is a requirement for HIPAA compliance.
 *
 * Features:
 * - Configurable timeout duration (default: 15 minutes)
 * - Warning dialog before logout (default: 1 minute before)
 * - Resets on user activity (mouse move, keypress, click, scroll)
 * - Navigates to lock screen on timeout
 *
 * Usage:
 * ```typescript
 * // In your main App or AdminLayout component:
 * const { showWarning, remainingTime, resetTimeout, dismissWarning } = useSessionTimeout({
 *   timeoutMinutes: 15,
 *   warningMinutes: 1,
 *   onTimeout: () => console.log('User timed out'),
 * });
 *
 * // Show a warning dialog when showWarning is true
 * ```
 */

interface SessionTimeoutConfig {
  /** Minutes of inactivity before timeout (default: 15) */
  timeoutMinutes?: number;
  /** Minutes before timeout to show warning (default: 1) */
  warningMinutes?: number;
  /** Callback when user times out */
  onTimeout?: () => void;
  /** Callback when warning is shown */
  onWarning?: () => void;
  /** Whether to automatically navigate to lock screen (default: true) */
  navigateToLock?: boolean;
  /** Whether the hook is enabled (default: true) */
  enabled?: boolean;
}

interface SessionTimeoutState {
  /** Whether the warning dialog should be shown */
  showWarning: boolean;
  /** Remaining seconds before timeout (only set when warning is shown) */
  remainingSeconds: number;
  /** Manually reset the timeout */
  resetTimeout: () => void;
  /** Dismiss the warning and reset timeout */
  dismissWarning: () => void;
  /** Whether the hook is currently active */
  isActive: boolean;
}

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

export function useSessionTimeout(config: SessionTimeoutConfig = {}): SessionTimeoutState {
  const {
    timeoutMinutes = 15,
    warningMinutes = 1,
    onTimeout,
    onWarning,
    navigateToLock = true,
    enabled = true,
  } = config;

  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Refs to track timers
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Convert to milliseconds
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;
  const warningThreshold = timeoutMs - warningMs;

  /**
   * Clear all timers
   */
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  /**
   * Handle timeout - logout and navigate to lock screen
   */
  const handleTimeout = useCallback(async () => {
    logger.info('Session timed out due to inactivity');
    clearTimers();
    setShowWarning(false);

    // Call custom timeout handler if provided
    onTimeout?.();

    // Sign out the user
    await signOut();

    // Navigate to lock screen if enabled
    if (navigateToLock) {
      navigate('/locked', {
        state: { reason: 'timeout', message: 'הסשן פג עקב חוסר פעילות' }
      });
    }
  }, [clearTimers, onTimeout, signOut, navigateToLock, navigate]);

  /**
   * Show warning and start countdown
   */
  const startWarning = useCallback(() => {
    logger.debug('Showing session timeout warning');
    setShowWarning(true);
    setRemainingSeconds(Math.floor(warningMs / 1000));
    onWarning?.();

    // Start countdown
    countdownRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningMs, onWarning, handleTimeout]);

  /**
   * Reset the timeout - call on user activity
   */
  const resetTimeout = useCallback(() => {
    if (!enabled || !user) return;

    lastActivityRef.current = Date.now();
    clearTimers();
    setShowWarning(false);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      startWarning();
    }, warningThreshold);

    // Set final timeout timer
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, timeoutMs);

    setIsActive(true);
  }, [enabled, user, clearTimers, warningThreshold, timeoutMs, startWarning, handleTimeout]);

  /**
   * Dismiss warning and reset timeout
   */
  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    resetTimeout();
  }, [resetTimeout]);

  /**
   * Handle user activity
   */
  const handleActivity = useCallback(() => {
    // Throttle activity detection to every 10 seconds to reduce overhead
    const now = Date.now();
    if (now - lastActivityRef.current > 10000) {
      resetTimeout();
    }
  }, [resetTimeout]);

  /**
   * Setup and cleanup
   */
  useEffect(() => {
    if (!enabled || !user) {
      clearTimers();
      setIsActive(false);
      return;
    }

    // Start the timeout
    resetTimeout();

    // Add activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, user, resetTimeout, handleActivity, clearTimers]);

  return {
    showWarning,
    remainingSeconds,
    resetTimeout,
    dismissWarning,
    isActive,
  };
}

/**
 * Format remaining seconds as MM:SS
 */
export function formatRemainingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
