/**
 * Centralized API Configuration
 *
 * Single source of truth for the Engram API base URL and common fetch helpers.
 * All files should import from here instead of computing the URL independently.
 *
 * Resolves HEY-209 (fragmented base URL computation) and HEY-212 (env var duplication).
 */

// ============================================================================
// BASE URL
// ============================================================================

const DEFAULT_API_URL = 'https://api.openengram.ai';

/**
 * Returns the Engram API base URL.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_ENGRAM_API_URL  (client + server)
 *  2. ENGRAM_API_URL              (server-only fallback)
 *  3. https://api.openengram.ai   (default)
 *
 * The deprecated NEXT_PUBLIC_API_URL is intentionally NOT checked.
 */
export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_ENGRAM_API_URL ||
    process.env.ENGRAM_API_URL ||
    DEFAULT_API_URL
  );
}

// ============================================================================
// CREDENTIALS
// ============================================================================

export function getApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_ENGRAM_API_KEY ||
    process.env.ENGRAM_API_KEY ||
    ''
  );
}

export function getDefaultUserId(): string {
  return (
    process.env.NEXT_PUBLIC_ENGRAM_USER_ID ||
    process.env.ENGRAM_USER_ID ||
    ''
  );
}

// ============================================================================
// AUTH TOKEN (browser-only)
// ============================================================================

export function getBrowserToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('engram_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt') ||
    null
  );
}

// ============================================================================
// SHARED FETCH HELPERS
// ============================================================================

import { EngramApiError } from './types';

/**
 * Build standard auth headers used across all API clients.
 *
 * Priority: API key → browser JWT token.
 * Optionally includes X-AM-User-ID when a userId is provided.
 */
export function buildAuthHeaders(options?: {
  apiKey?: string;
  userId?: string;
  extraHeaders?: Record<string, string>;
}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.extraHeaders,
  };

  const apiKey = options?.apiKey || getApiKey();
  if (apiKey) {
    headers['X-AM-API-Key'] = apiKey;
  } else {
    const token = getBrowserToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (options?.userId) {
    headers['X-AM-User-ID'] = options.userId;
  }

  return headers;
}

/**
 * Lightweight authenticated fetch against the Engram API.
 *
 * Used by account-api.ts and ensemble-client.ts so they don't need to
 * duplicate URL resolution, header construction, or error handling.
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { userId?: string }
): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;

  const userId =
    options?.userId !== undefined ? options.userId : getDefaultUserId();

  const headers = buildAuthHeaders({
    userId: userId || undefined,
    extraHeaders: options?.headers as Record<string, string>,
  });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    throw new EngramApiError(
      response.status,
      `API Error: ${response.statusText}`,
      errorBody,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
