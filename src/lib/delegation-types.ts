/**
 * Delegation, Teams & Challenge types for Phase 2 UI
 * HEY-303, HEY-304, HEY-305, HEY-307
 */

// ============================================================================
// DELEGATION (HEY-303)
// ============================================================================

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface DelegationTask {
  id: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: TaskStatus;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ContractState = 'PROPOSED' | 'ACCEPTED' | 'COMPLETED' | 'VERIFIED';

export interface DelegationContract {
  id: string;
  taskId: string;
  delegatorId: string;
  delegateeId: string;
  state: ContractState;
  terms: string;
  capabilities: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  verifiedAt: string | null;
}

export interface DelegationTemplate {
  id: string;
  name: string;
  taskType: string;
  capabilities: string[];
  estimatedDuration: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CHALLENGES (HEY-304)
// ============================================================================

export type ChallengeStatus = 'OPEN' | 'UPHELD' | 'DISMISSED' | 'RESOLVED';
export type ResolutionMethod = 'uphold' | 'dismiss' | 'resolve';

export interface Challenge {
  id: string;
  memoryId: string;
  memoryPreview: string;
  memoryFull: string;
  challengerId: string;
  challengerName: string;
  reason: string;
  evidence: string;
  status: ChallengeStatus;
  resolutionMethod: ResolutionMethod | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TEAMS (HEY-305)
// ============================================================================

export interface TeamMember {
  id: string;
  agentId: string;
  name: string;
  role: string;
  joinedAt: string;
  trustScore: number;
}

export interface TeamCapability {
  name: string;
  level: number;
}

export interface TeamTimelineEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  agentId: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  trustScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamDetail extends Team {
  members: TeamMember[];
  capabilities: TeamCapability[];
  timeline: TeamTimelineEvent[];
}

// ============================================================================
// DELEGATION RECALL (HEY-307)
// ============================================================================

export interface RecalledMemory {
  id: string;
  raw: string;
  score: number;
  delegationBoost: number;
  layer: string;
  createdAt: string;
}

export interface RecommendedAgent {
  agentId: string;
  name: string;
  trustScore: number;
  relevantCapabilities: string[];
  pastTaskCount: number;
}

export interface DelegationRecallResponse {
  memories: RecalledMemory[];
  recommendedAgents: RecommendedAgent[];
}
