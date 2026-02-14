/**
 * Account & Billing API client
 * 
 * Uses JWT auth (Bearer token) for account-level endpoints.
 * These are separate from the Engram memory API which uses API keys.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('engram_token') || localStorage.getItem('token') || localStorage.getItem('jwt') || null;
}

async function authFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${body || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Account ──────────────────────────────────────────────────────────────────

export interface Account {
  id: string;
  email: string;
  name: string;
  plan: string;
  memoriesUsed: number;
  apiCallsToday: number;
  agents: { id: string; name: string }[];
}

export function getAccount() {
  return authFetch<Account>('/v1/account');
}

export function updateAccount(data: { name?: string }) {
  // TODO: PATCH /v1/account endpoint may not exist yet
  return authFetch<Account>('/v1/account', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function changePassword(data: { currentPassword: string; newPassword: string }) {
  // TODO: POST /v1/account/password endpoint may not exist yet
  return authFetch<void>('/v1/account/password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteAccount() {
  // TODO: DELETE /v1/account endpoint may not exist yet
  return authFetch<void>('/v1/account', { method: 'DELETE' });
}

// ── API Keys ─────────────────────────────────────────────────────────────────

export interface ApiKeyInfo {
  id: string;
  name: string;
  lastFour: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function getApiKeys() {
  return authFetch<{ keys: ApiKeyInfo[] }>('/v1/account/api-keys');
}

export function createApiKey(name: string) {
  return authFetch<{ key: string; id: string }>('/v1/account/api-keys', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function deleteApiKey(id: string) {
  // TODO: DELETE /v1/account/api-keys/:id endpoint may not exist yet
  return authFetch<void>(`/v1/account/api-keys/${id}`, { method: 'DELETE' });
}

// ── Billing ──────────────────────────────────────────────────────────────────

export function createCheckout(plan: string) {
  return authFetch<{ url: string }>('/v1/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
}

export function getBillingPortal() {
  return authFetch<{ url: string }>('/v1/billing/portal');
}
