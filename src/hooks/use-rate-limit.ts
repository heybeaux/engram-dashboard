import { useState, useCallback, useRef, useEffect } from 'react';

const BASE_COOLDOWN_MS = 30_000;
const MAX_ATTEMPTS = 5;

/**
 * Client-side rate limiting for auth forms.
 * After maxAttempts consecutive failures → escalating cooldown (30s, 60s, 120s…).
 */
export function useRateLimit(maxAttempts = MAX_ATTEMPTS) {
  const [failureCount, setFailureCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setLockedUntil(null);
        clearInterval(timerRef.current);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [lockedUntil]);

  const recordFailure = useCallback(() => {
    setFailureCount((prev) => {
      const next = prev + 1;
      if (next >= maxAttempts) {
        const multiplier = Math.pow(2, Math.floor(next / maxAttempts) - 1);
        setLockedUntil(Date.now() + BASE_COOLDOWN_MS * multiplier);
      }
      return next;
    });
  }, [maxAttempts]);

  const recordSuccess = useCallback(() => {
    setFailureCount(0);
    setLockedUntil(null);
  }, []);

  return { isLocked, secondsLeft, failureCount, attemptsRemaining: Math.max(0, maxAttempts - failureCount), recordFailure, recordSuccess };
}
