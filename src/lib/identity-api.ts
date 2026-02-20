/**
 * Identity Framework API Client
 *
 * Provides methods for the Engram Identity features:
 * Teams, Trust Profiles, Delegation Recall, Portable Identity,
 * Agent Overview, Delegation Contracts, and Challenge Protocol.
 */

import { apiFetch } from './api-config';

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
// API CLIENT (object-style, used by teams/trust/recall/export pages)
// ============================================================================

export const identityApi = {
  // --- Agents ---
  async listAgents(): Promise<Agent[]> {
    return apiFetch<Agent[]>('/v1/identity/agents');
  },

  // --- Teams ---
  async listTeams(): Promise<Team[]> {
    return apiFetch<Team[]>('/v1/identity/teams');
  },

  async getTeam(id: string): Promise<Team> {
    return apiFetch<Team>(`/v1/identity/teams/${id}`);
  },

  async createTeam(req: CreateTeamRequest): Promise<Team> {
    return apiFetch<Team>('/v1/identity/teams', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async deleteTeam(id: string): Promise<void> {
    return apiFetch<void>(`/v1/identity/teams/${id}`, { method: 'DELETE' });
  },

  // --- Trust Profiles ---
  async getTrustProfile(agentId: string): Promise<TrustProfile> {
    return apiFetch<TrustProfile>(`/v1/identity/trust/${agentId}`);
  },

  // --- Delegation Recall ---
  async recallDelegation(query: string): Promise<DelegationRecallResponse> {
    return apiFetch<DelegationRecallResponse>('/v1/identity/recall', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  // --- Portable Identity ---
  async exportIdentity(): Promise<IdentityExport> {
    return apiFetch<IdentityExport>('/v1/identity/export');
  },

  async previewImport(file: File): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${process.env.NEXT_PUBLIC_ENGRAM_API_URL || process.env.ENGRAM_API_URL || 'https://api.openengram.ai'}/v1/identity/import/preview`;
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('engram_token') || localStorage.getItem('token') || '')
      : '';
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error(`Import preview failed: ${res.statusText}`);
    return res.json();
  },

  async confirmImport(file: File): Promise<{ imported: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${process.env.NEXT_PUBLIC_ENGRAM_API_URL || process.env.ENGRAM_API_URL || 'https://api.openengram.ai'}/v1/identity/import`;
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('engram_token') || localStorage.getItem('token') || '')
      : '';
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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
  return apiFetch<{ agents: AgentProfile[] }>('/v1/identity/agents');
}

export async function getAgent(agentId: string): Promise<AgentProfile> {
  return apiFetch<AgentProfile>(`/v1/identity/agents/${agentId}`);
}

export async function getAgentTrustProfile(agentId: string): Promise<AgentTrustProfile> {
  return apiFetch<AgentTrustProfile>(`/v1/identity/agents/${agentId}/trust-profile`);
}

export async function getContracts(params?: {
  status?: ContractStatus;
  isTemplate?: boolean;
}): Promise<{ contracts: DelegationContract[] }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.isTemplate !== undefined) searchParams.set('isTemplate', String(params.isTemplate));
  const qs = searchParams.toString();
  return apiFetch<{ contracts: DelegationContract[] }>(`/v1/identity/contracts${qs ? `?${qs}` : ''}`);
}

export async function getContract(id: string): Promise<DelegationContract> {
  return apiFetch<DelegationContract>(`/v1/identity/contracts/${id}`);
}

export async function createContract(data: CreateContractRequest): Promise<DelegationContract> {
  return apiFetch<DelegationContract>('/v1/identity/contracts', {
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
  return apiFetch<{ challenges: Challenge[] }>(`/v1/identity/challenges${qs ? `?${qs}` : ''}`);
}

export async function createChallenge(data: CreateChallengeRequest): Promise<Challenge> {
  return apiFetch<Challenge>('/v1/identity/challenges', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resolveChallenge(id: string, data: ResolveChallengeRequest): Promise<Challenge> {
  return apiFetch<Challenge>(`/v1/identity/challenges/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
