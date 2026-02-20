import { useState, useCallback, useRef, useEffect } from 'react';

const BASE_COOLDOWN_MS = 30_000; // 30 seconds
const MAX_ATTEMPTS = 5;

/**
 * Client-side rate limiting hook for auth forms.
 * After `maxAttempts` consecutive failures, enforces an escalating cooldown.
 * Cooldown doubles each time: 30s → 60s → 120s → ...
 */
export function useRateLimit(maxAttempts = MAX_ATTEMPTS) {
  const [failureCount, setFailureCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  // Countdown timer
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
        // Escalating cooldown: doubles each time we hit the limit
        const multiplier = Math.pow(2, Math.floor(next / maxAttempts) - 1);
        const cooldown = BASE_COOLDOWN_MS * multiplier;
        setLockedUntil(Date.now() + cooldown);
      }
      return next;
    });
  }, [maxAttempts]);

  const recordSuccess = useCallback(() => {
    setFailureCount(0);
    setLockedUntil(null);
  }, []);

  return {
    isLocked,
    secondsLeft,
    failureCount,
    attemptsRemaining: Math.max(0, maxAttempts - failureCount),
    recordFailure,
    recordSuccess,
  };
}
