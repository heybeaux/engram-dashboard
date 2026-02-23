import { useAuth } from '@/lib/auth-context';

/**
 * Returns the authenticated user's ID for API requests.
 * Falls back to the env-based default for unauthenticated contexts.
 *
 * Dashboard pages should use this instead of the hardcoded
 * NEXT_PUBLIC_ENGRAM_USER_ID env var (HEY-214).
 */
export function useUserId(): string {
  const { user } = useAuth();
  return user?.id || process.env.NEXT_PUBLIC_ENGRAM_USER_ID || 'default';
}
