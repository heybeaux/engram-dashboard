/**
 * Account & Billing API client
 * 
 * Uses JWT auth (Bearer token) for account-level endpoints.
 * These are separate from the Engram memory API which uses API keys.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.openengram.ai';
const USER_ID = process.env.NEXT_PUBLIC_ENGRAM_USER_ID || 'default';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('engram_token') || localStorage.getItem('token') || localStorage.getItem('jwt') || null;
}

async function authFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-AM-User-ID': USER_ID,
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

export interface AccountRaw {
  id: string;
  email: string;
  name: string;
  plan: string;
  usage?: {
    memoriesUsed?: number;
    apiCallsToday?: number;
  };
  limits?: {
    memories?: number;
    apiCallsPerDay?: number;
    agents?: number;
    usersPerAgent?: number;
  };
  agents?: { id: string; name: string }[];
}

export interface AccountLimits {
  memories: number;
  apiCallsPerDay: number;
  agents: number;
  usersPerAgent: number;
}

export interface Account {
  id: string;
  email: string;
  name: string;
  plan: string;
  memoriesUsed: number;
  apiCallsToday: number;
  agents: { id: string; name: string }[];
  limits: AccountLimits;
}

function normalizeAccount(raw: AccountRaw): Account {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    plan: raw.plan?.toLowerCase() ?? 'free',
    memoriesUsed: raw.usage?.memoriesUsed ?? 0,
    apiCallsToday: raw.usage?.apiCallsToday ?? 0,
    agents: raw.agents ?? [],
    limits: {
      memories: raw.limits?.memories ?? 1_000,
      apiCallsPerDay: raw.limits?.apiCallsPerDay ?? 100,
      agents: raw.limits?.agents ?? 1,
      usersPerAgent: raw.limits?.usersPerAgent ?? 1,
    },
  };
}

export async function getAccount(): Promise<Account> {
  const raw = await authFetch<AccountRaw>('/v1/account');
  return normalizeAccount(raw);
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
  return authFetch<void>('/v1/account/change-password', {
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
  agentName?: string;
  apiKeyHint: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export async function getApiKeys(): Promise<{ keys: ApiKeyInfo[] }> {
  const data = await authFetch<ApiKeyInfo[] | { keys: ApiKeyInfo[] }>('/v1/account/api-keys');
  // API returns a plain array, but we normalize to { keys: [...] }
  if (Array.isArray(data)) {
    return { keys: data };
  }
  return data;
}

export async function createApiKey(name: string) {
  const result = await authFetch<{ apiKey: string; agent: { id: string; name: string; apiKeyHint: string } }>('/v1/account/api-keys', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return { key: result.apiKey, id: result.agent.id };
}

export function deleteApiKey(id: string) {
  // TODO: DELETE /v1/account/api-keys/:id endpoint may not exist yet
  return authFetch<void>(`/v1/account/api-keys/${id}`, { method: 'DELETE' });
}

// ── Instance API Keys ────────────────────────────────────────────────────────

export interface InstanceKeyInfo {
  id: string;
  name: string;
  keyHint: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export async function getInstanceKeys(): Promise<InstanceKeyInfo[]> {
  return authFetch<InstanceKeyInfo[]>('/v1/account/instance-keys');
}

export async function createInstanceKey(name: string, scopes?: string[]) {
  return authFetch<{ key: string; id: string; name: string; keyHint: string; scopes: string[]; createdAt: string }>(
    '/v1/account/instance-keys',
    { method: 'POST', body: JSON.stringify({ name, scopes }) },
  );
}

export function deleteInstanceKey(id: string) {
  return authFetch<void>(`/v1/account/instance-keys/${id}`, { method: 'DELETE' });
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

// ── Admin ────────────────────────────────────────────────────────────────────

export interface AdminAccount {
  id: string;
  email: string;
  plan: string;
  memories_used: number;
  api_calls_today: number;
  created_at: string;
}

export async function getAdminAccounts(): Promise<AdminAccount[]> {
  const data = await authFetch<{ accounts: AdminAccount[] }>('/v1/admin/accounts');
  return data.accounts;
}
