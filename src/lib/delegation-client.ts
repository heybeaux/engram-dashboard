/**
 * Delegation API Client
 * HEY-303, HEY-304, HEY-305, HEY-307
 */

import { apiFetch } from './api-config';
import type {
  DelegationTask,
  DelegationContract,
  DelegationTemplate,
  Challenge,
  ResolutionMethod,
  Team,
  TeamDetail,
  DelegationRecallResponse,
} from './delegation-types';

// ============================================================================
// TASKS (HEY-303)
// ============================================================================

export async function getTasks(): Promise<DelegationTask[]> {
  const data = await apiFetch<{ tasks: DelegationTask[] } | DelegationTask[]>('/v1/tasks');
  return Array.isArray(data) ? data : data.tasks;
}

// ============================================================================
// CONTRACTS (HEY-303)
// ============================================================================

export async function getContracts(): Promise<DelegationContract[]> {
  const data = await apiFetch<{ contracts: DelegationContract[] } | DelegationContract[]>('/v1/delegation-contracts');
  return Array.isArray(data) ? data : data.contracts;
}

// ============================================================================
// TEMPLATES (HEY-303)
// ============================================================================

export async function getTemplates(): Promise<DelegationTemplate[]> {
  const data = await apiFetch<{ templates: DelegationTemplate[] } | DelegationTemplate[]>('/v1/delegation-templates');
  return Array.isArray(data) ? data : data.templates;
}

export async function createTemplate(body: Omit<DelegationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<DelegationTemplate> {
  return apiFetch<DelegationTemplate>('/v1/delegation-templates', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateTemplate(id: string, body: Partial<DelegationTemplate>): Promise<DelegationTemplate> {
  return apiFetch<DelegationTemplate>(`/v1/delegation-templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiFetch<void>(`/v1/delegation-templates/${id}`, { method: 'DELETE' });
}

// ============================================================================
// CHALLENGES (HEY-304)
// ============================================================================

export async function getChallenges(): Promise<Challenge[]> {
  const data = await apiFetch<{ challenges: Challenge[] } | Challenge[]>('/v1/challenges');
  return Array.isArray(data) ? data : data.challenges;
}

export async function resolveChallenge(id: string, method: ResolutionMethod): Promise<void> {
  await apiFetch<void>(`/v1/challenges/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ method }),
  });
}

// ============================================================================
// TEAMS (HEY-305)
// ============================================================================

export async function getTeams(): Promise<Team[]> {
  const data = await apiFetch<{ teams: Team[] } | Team[]>('/v1/teams');
  return Array.isArray(data) ? data : data.teams;
}

export async function getTeamDetail(id: string): Promise<TeamDetail> {
  return apiFetch<TeamDetail>(`/v1/teams/${id}`);
}

export async function addTeamMember(teamId: string, agentId: string): Promise<void> {
  await apiFetch<void>(`/v1/teams/${teamId}/members`, {
    method: 'POST',
    body: JSON.stringify({ agentId }),
  });
}

export async function removeTeamMember(teamId: string, memberId: string): Promise<void> {
  await apiFetch<void>(`/v1/teams/${teamId}/members`, {
    method: 'DELETE',
    body: JSON.stringify({ memberId }),
  });
}

// ============================================================================
// DELEGATION RECALL (HEY-307)
// ============================================================================

export async function delegationRecall(taskDescription: string, delegatingAgent?: string): Promise<DelegationRecallResponse> {
  return apiFetch<DelegationRecallResponse>('/v1/recall/contextual', {
    method: 'POST',
    body: JSON.stringify({
      query: taskDescription,
      delegationContext: {
        taskDescription,
        delegatingAgent: delegatingAgent || undefined,
      },
    }),
  });
}
