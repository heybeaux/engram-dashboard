/**
 * Identity Framework API Client
 *
 * Provides methods for the Engram Identity features:
 * Teams, Trust Profiles, Delegation Recall, Portable Identity,
 * Agent Overview, Delegation Contracts, and Challenge Protocol.
 */

import { buildAuthHeaders } from './api-config';

// Use the Next.js API proxy to avoid CORS and centralize auth
const PROXY_BASE = '/api/engram';

/**
 * Fetch through the /api/engram proxy with auth headers.
 */
async function identityFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${PROXY_BASE}${endpoint}`;
  const headers = buildAuthHeaders({
    extraHeaders: options?.headers as Record<string, string>,
  });

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let msg: string;
    try {
      const body = await response.json();
      msg = body.error || body.message || response.statusText;
    } catch {
      msg = response.statusText;
    }
    throw new Error(msg);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// ============================================================================
// TYPES — Core (Teams, Trust, Recall)
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  trustScore?: number;
}

export interface CollaborationPair {
  agentA: string;
  agentB: string;
  score: number;
  taskCount: number;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: Agent[];
  collaborationScore: number;
  collaborationPairs: CollaborationPair[];
  aggregatedCapabilities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  memberIds: string[];
}

export interface TrustDomain {
  domain: string;
  score: number;
  trend: 'improving' | 'declining' | 'stable';
  sampleCount: number;
}

export interface TrustHistoryPoint {
  date: string;
  overall: number;
  domains: Record<string, number>;
}

export interface TrustProfile {
  agentId: string;
  agentName: string;
  overallTrust: number;
  domains: TrustDomain[];
  history: TrustHistoryPoint[];
}

export interface DelegationResult {
  id: string;
  taskDescription: string;
  agentId: string;
  agentName: string;
  outcome: 'success' | 'partial' | 'failure';
  duration: number;
  similarity: number;
  timestamp: string;
  notes?: string;
}

export interface FailurePattern {
  pattern: string;
  frequency: number;
  lastSeen: string;
  affectedAgents: string[];
}

export interface DelegationRecallResponse {
  results: DelegationResult[];
  recommendedAgentId: string | null;
  recommendedAgentName: string | null;
  failurePatterns: FailurePattern[];
}

export interface IdentityExport {
  schemaVersion: string;
  exportedAt: string;
  integrityHash: string;
  data: Record<string, unknown>;
}

export interface ImportPreview {
  schemaVersion: string;
  integrityHash: string;
  valid: boolean;
  agentCount: number;
  teamCount: number;
  memoryCount: number;
  conflicts: string[];
}

// ============================================================================
// TYPES — Agent Identity Pages (HEY-301 through HEY-304)
// ============================================================================

export interface AgentProfile {
  id: string;
  name: string;
  description?: string;
  type?: string;
  capabilities: string[];
  trustScore?: number;
  taskCount?: number;
  successRate?: number;
  lastActive?: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface DomainScore {
  domain: string;
  confidence: number;
  taskCount: number;
}

export interface TaskCompletion {
  id: string;
  taskName: string;
  domain: string;
  status: 'completed' | 'failed' | 'partial';
  completedAt: string;
  score?: number;
}

export interface BehavioralPattern {
  label: string;
  value: number;
  description: string;
}

export interface AgentTrustProfile {
  agentId: string;
  overallTrust: number;
  domainScores: DomainScore[];
  recentCompletions: TaskCompletion[];
  behavioralPatterns: BehavioralPattern[];
}

export type ContractStatus = 'pending' | 'active' | 'completed' | 'failed' | 'timed_out' | 'expired' | 'violated';

export interface DelegationContract {
  id: string;
  title: string;
  description?: string;
  delegatorId: string;
  delegatorName?: string;
  delegateeId: string;
  delegateeName?: string;
  status: ContractStatus;
  domain?: string;
  constraints?: string[];
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  timeoutAt?: string;
  expiresAt?: string | null;
  isTemplate?: boolean;
}

export interface CreateContractRequest {
  title: string;
  description?: string;
  delegateeId: string;
  delegatorId?: string;
  domain?: string;
  constraints?: string[];
  timeoutMinutes?: number;
  expiresAt?: string;
}

export type ChallengeType = 'unsafe' | 'underspecified' | 'capability_mismatch' | 'resource_constraint';
export type ChallengeResolution = 'accept' | 'override' | 'modify';

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  raisedBy: string;
  raisedByName?: string;
  contractId?: string;
  status: 'open' | 'resolved' | 'dismissed';
  resolution?: ChallengeResolution;
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CreateChallengeRequest {
  type: ChallengeType;
  title: string;
  description: string;
  contractId?: string;
}

export interface ResolveChallengeRequest {
  resolution: ChallengeResolution;
  note?: string;
}

// ============================================================================
// TYPES — Sources (HEY-286)
// ============================================================================

export interface Source {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  signalCount: number;
  lastSyncAt: string | null;
  config?: Record<string, string>;
}

// ============================================================================
// TYPES — Reconciliation (HEY-285)
// ============================================================================

export interface PreviewData {
  localOnly: number;
  cloudOnly: number;
  shared: number;
}

export interface ReconcileResult {
  pushed: number;
  pulled: number;
  errors: number;
  durationMs: number;
}

export type ReconcileStrategy = 'push-all' | 'pull-all' | 'selective';

// ============================================================================
// API CLIENT (object-style, used by teams/trust/recall/export pages)
// ============================================================================

export const identityApi = {
  // --- Agents ---
  async listAgents(): Promise<Agent[]> {
    return identityFetch<Agent[]>('/v1/identity/agents');
  },

  // --- Teams ---
  async listTeams(): Promise<Team[]> {
    return identityFetch<Team[]>('/v1/identity/teams');
  },

  async getTeam(id: string): Promise<Team> {
    return identityFetch<Team>(`/v1/identity/teams/${id}`);
  },

  async createTeam(req: CreateTeamRequest): Promise<Team> {
    return identityFetch<Team>('/v1/identity/teams', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async deleteTeam(id: string): Promise<void> {
    return identityFetch<void>(`/v1/identity/teams/${id}`, { method: 'DELETE' });
  },

  // --- Trust Profiles ---
  async getTrustProfile(agentId: string): Promise<TrustProfile> {
    return identityFetch<TrustProfile>(`/v1/identity/trust/${agentId}`);
  },

  // --- Delegation Recall ---
  async recallDelegation(query: string): Promise<DelegationRecallResponse> {
    return identityFetch<DelegationRecallResponse>('/v1/identity/recall', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  // --- Portable Identity ---
  async exportIdentity(): Promise<IdentityExport> {
    return identityFetch<IdentityExport>('/v1/identity/export');
  },

  async previewImport(file: File): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = buildAuthHeaders();
    // Remove Content-Type so browser sets multipart boundary
    delete headers['Content-Type'];
    const res = await fetch(`${PROXY_BASE}/v1/identity/import/preview`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error(`Import preview failed: ${res.statusText}`);
    return res.json();
  },

  async confirmImport(file: File): Promise<{ imported: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = buildAuthHeaders();
    delete headers['Content-Type'];
    const res = await fetch(`${PROXY_BASE}/v1/identity/import`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error(`Import failed: ${res.statusText}`);
    return res.json();
  },
};

// ============================================================================
// STANDALONE FUNCTIONS (HEY-301 through HEY-304 pages)
// ============================================================================

export async function getAgents(): Promise<{ agents: AgentProfile[] }> {
  return identityFetch<{ agents: AgentProfile[] }>('/v1/identity/agents');
}

export async function getAgent(agentId: string): Promise<AgentProfile> {
  return identityFetch<AgentProfile>(`/v1/identity/agents/${agentId}`);
}

export async function getAgentTrustProfile(agentId: string): Promise<AgentTrustProfile> {
  return identityFetch<AgentTrustProfile>(`/v1/identity/agents/${agentId}/trust-profile`);
}

export async function getContracts(params?: {
  status?: ContractStatus;
  isTemplate?: boolean;
}): Promise<{ contracts: DelegationContract[] }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.isTemplate !== undefined) searchParams.set('isTemplate', String(params.isTemplate));
  const qs = searchParams.toString();
  return identityFetch<{ contracts: DelegationContract[] }>(`/v1/identity/contracts${qs ? `?${qs}` : ''}`);
}

export async function getContract(id: string): Promise<DelegationContract> {
  return identityFetch<DelegationContract>(`/v1/identity/contracts/${id}`);
}

export async function createContract(data: CreateContractRequest): Promise<DelegationContract> {
  return identityFetch<DelegationContract>('/v1/identity/contracts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getChallenges(params?: {
  status?: string;
  type?: ChallengeType;
}): Promise<{ challenges: Challenge[] }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.type) searchParams.set('type', params.type);
  const qs = searchParams.toString();
  return identityFetch<{ challenges: Challenge[] }>(`/v1/identity/challenges${qs ? `?${qs}` : ''}`);
}

export async function createChallenge(data: CreateChallengeRequest): Promise<Challenge> {
  return identityFetch<Challenge>('/v1/identity/challenges', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resolveChallenge(id: string, data: ResolveChallengeRequest): Promise<Challenge> {
  return identityFetch<Challenge>(`/v1/identity/challenges/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function completeContract(agentId: string, id: string): Promise<DelegationContract> {
  return identityFetch<DelegationContract>(
    `/v1/identity/agents/${agentId}/contracts/${id}/complete`,
    { method: 'POST' },
  );
}

export async function getBulkTrustProfiles(agentIds: string[]): Promise<TrustProfile[]> {
  return identityFetch<TrustProfile[]>('/v1/identity/trust/bulk', {
    method: 'POST',
    body: JSON.stringify({ agentIds }),
  });
}

// ============================================================================
// SOURCES API (HEY-286)
// ============================================================================

export async function getSources(): Promise<Source[]> {
  const data = await identityFetch<Source[] | { sources: Source[] }>('/v1/awareness/sources');
  return Array.isArray(data) ? data : data.sources;
}

export async function updateSource(id: string, updates: Partial<Pick<Source, 'enabled' | 'config'>>): Promise<Source> {
  return identityFetch<Source>(`/v1/awareness/sources/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteSource(id: string): Promise<void> {
  return identityFetch<void>(`/v1/awareness/sources/${id}`, { method: 'DELETE' });
}

// ============================================================================
// INSIGHTS & AWARENESS API (HEY-309)
// ============================================================================

export interface Insight {
  id: string;
  title?: string;
  content: string;
  category?: string;
  confidence?: number;
  createdAt?: string;
}

export interface CycleStatus {
  phase?: string;
  lastRun?: string;
  nextRun?: string;
  insightsGenerated?: number;
}

export async function getInsights(): Promise<Insight[]> {
  const data = await identityFetch<Insight[] | { insights: Insight[] }>('/v1/awareness/insights');
  return Array.isArray(data) ? data : data.insights;
}

export async function getCycleStatus(): Promise<CycleStatus> {
  return identityFetch<CycleStatus>('/v1/awareness/cycle/status');
}

// ============================================================================
// NOTIFICATION SETTINGS API (HEY-310)
// ============================================================================

export interface NotificationConfig {
  enabled: boolean;
  confidenceThreshold: number;
  webhookUrl: string;
  hmacSecret: string;
}

export interface NotificationEvent {
  id: string;
  type: string;
  status: string;
  sentAt: string;
  insightId?: string;
}

export interface NotificationConfigResponse {
  config?: NotificationConfig;
  history?: NotificationEvent[];
  // May also be flat config fields
  enabled?: boolean;
  confidenceThreshold?: number;
  webhookUrl?: string;
  hmacSecret?: string;
}

export async function getNotificationConfig(): Promise<NotificationConfigResponse> {
  return identityFetch<NotificationConfigResponse>('/v1/notifications/config');
}

export async function saveNotificationConfig(config: NotificationConfig & { test?: boolean }): Promise<void> {
  return identityFetch<void>('/v1/notifications/config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

// ============================================================================
// RECONCILIATION API (HEY-285)
// ============================================================================

export async function getReconcilePreview(): Promise<PreviewData> {
  return identityFetch<PreviewData>('/v1/cloud/reconcile/preview');
}

export async function executeReconcile(strategy: ReconcileStrategy): Promise<ReconcileResult> {
  return identityFetch<ReconcileResult>('/v1/cloud/reconcile', {
    method: 'POST',
    body: JSON.stringify({ strategy }),
  });
}
