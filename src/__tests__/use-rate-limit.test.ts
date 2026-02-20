import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRateLimit } from '@/hooks/use-rate-limit';

describe('useRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts unlocked with full attempts', () => {
    const { result } = renderHook(() => useRateLimit(3));
    expect(result.current.isLocked).toBe(false);
    expect(result.current.attemptsRemaining).toBe(3);
    expect(result.current.failureCount).toBe(0);
  });

  it('decrements attempts on failure', () => {
    const { result } = renderHook(() => useRateLimit(3));
    act(() => result.current.recordFailure());
    expect(result.current.failureCount).toBe(1);
    expect(result.current.attemptsRemaining).toBe(2);
  });

  it('locks after maxAttempts failures', () => {
    const { result } = renderHook(() => useRateLimit(3));
    act(() => {
      result.current.recordFailure();
      result.current.recordFailure();
      result.current.recordFailure();
    });
    expect(result.current.isLocked).toBe(true);
    expect(result.current.secondsLeft).toBeGreaterThan(0);
  });

  it('resets on success', () => {
    const { result } = renderHook(() => useRateLimit(3));
    act(() => {
      result.current.recordFailure();
      result.current.recordFailure();
    });
    expect(result.current.failureCount).toBe(2);
    act(() => result.current.recordSuccess());
    expect(result.current.failureCount).toBe(0);
    expect(result.current.isLocked).toBe(false);
  });

  it('unlocks after cooldown expires', () => {
    const { result } = renderHook(() => useRateLimit(3));
    act(() => {
      result.current.recordFailure();
      result.current.recordFailure();
      result.current.recordFailure();
    });
    expect(result.current.isLocked).toBe(true);

    // Advance past 30s cooldown
    act(() => {
      vi.advanceTimersByTime(31_000);
    });
    expect(result.current.isLocked).toBe(false);
  });
});
