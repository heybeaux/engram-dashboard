/**
 * Engram API Types
 * Matches the Engram server's Prisma schema and API responses
 */

// ============================================================================
// ENUMS
// ============================================================================

export type MemoryLayer = 'IDENTITY' | 'PROJECT' | 'SESSION' | 'TASK';

export type MemorySource =
  | 'EXPLICIT_STATEMENT'
  | 'AGENT_OBSERVATION'
  | 'CORRECTION'
  | 'PATTERN_DETECTED'
  | 'SYSTEM';

export type ImportanceHint = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ChainLinkType =
  | 'LED_TO'
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'UPDATES'
  | 'RELATED';

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface MemoryExtraction {
  id: string;
  memoryId: string;
  who: string | null;
  what: string | null;
  when: string | null; // ISO date string
  whereCtx: string | null;
  why: string | null;
  how: string | null;
  topics: string[];
  rawJson?: Record<string, unknown>;
  extractedAt: string;
  model?: string;
}

export interface Memory {
  id: string;
  userId: string;
  projectId: string | null;
  sessionId: string | null;

  // Content
  raw: string;
  layer: MemoryLayer;
  source: MemorySource;

  // Importance
  importanceHint: ImportanceHint | null;
  importanceScore: number;
  confidence: number;

  // Position
  sessionPosition: number | null;

  // Embedding
  embeddingId: string | null;
  embeddingModel: string | null;

  // Usage tracking
  retrievalCount: number;
  lastRetrievedAt: string | null;
  usedCount: number;
  lastUsedAt: string | null;

  // Consolidation
  consolidated: boolean;
  consolidatedAt: string | null;
  supersededById: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // Relations (optional, included when requested)
  extraction?: MemoryExtraction | null;
  chain?: Memory[];
}

export interface MemoryWithScore extends Memory {
  score?: number; // Similarity score from vector search (0-1)
}

export interface User {
  id: string;
  externalId: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UserWithStats extends User {
  memoryCount: number;
  lastActive: string | null;
}

export interface Project {
  id: string;
  userId: string;
  externalId: string | null;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Session {
  id: string;
  userId: string;
  projectId: string | null;
  externalId: string | null;
  startedAt: string;
  endedAt: string | null;
  consolidated: boolean;
  consolidatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  apiKeyHint: string;
  memoriesLimit: number | null;
  requestsPerDay: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

export interface CreateMemoryRequest {
  raw: string;
  layer?: MemoryLayer;
  importanceHint?: ImportanceHint;
  context?: {
    projectId?: string;
    sessionId?: string;
  };
}

export interface CreateMemoryBatchRequest {
  memories: Array<{
    raw: string;
    ts?: string; // ISO timestamp
    layer?: MemoryLayer;
    importanceHint?: ImportanceHint;
  }>;
  context?: {
    projectId?: string;
    sessionId?: string;
  };
}

export interface QueryMemoryRequest {
  query: string;
  layers?: MemoryLayer[];
  limit?: number;
  includeChains?: boolean;
  projectId?: string;
}

export interface LoadContextRequest {
  projectId?: string;
  sessionId?: string;
  maxTokens?: number;
}

export interface ObserveRequest {
  turns: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
  }>;
  sessionId?: string;
  projectId?: string;
  minImportance?: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface QueryResult {
  memories: MemoryWithScore[];
  queryTokens: number;
  latencyMs: number;
}

export interface ContextResult {
  context: string;
  tokenCount: number;
  memoriesIncluded: number;
  layers: {
    identity: number;
    project: number;
    session: number;
  };
}

export interface BatchCreateResult {
  created: number;
  failed: number;
}

export interface ImportanceSignal {
  type: 'explicit' | 'correction' | 'preference' | 'repetition';
  trigger: string;
  content: string;
  turnIndex: number;
  confidence: number;
}

export interface ExtractedMemory {
  content: string;
  importance: number;
  signals: ImportanceSignal[];
  source: {
    turnIndex: number;
    role: 'user' | 'assistant' | 'system';
  };
}

export interface ObserveResult {
  memories: ExtractedMemory[];
  created: number;
  skipped: number;
  signals: ImportanceSignal[];
  processingMs: number;
}

// ============================================================================
// DASHBOARD-SPECIFIC TYPES
// ============================================================================

/**
 * Dashboard stats - requires custom endpoint in Engram
 * @endpoint GET /v1/stats (NOT YET IMPLEMENTED)
 */
export interface DashboardStats {
  totalMemories: number;
  memoryTrend: number; // % change from previous period
  totalUsers: number;
  userTrend: number;
  healthScore: number; // 0-100

  memoryByLayer: Array<{
    layer: MemoryLayer;
    count: number;
    percentage: number;
  }>;

  recentActivity: Array<{
    id: string;
    action: string; // e.g., "Memory created (EXPLICIT_STATEMENT)"
    memoryId?: string;
    userId?: string;
    time: string; // ISO timestamp - API returns 'time', not 'timestamp'
  }>;

  apiRequests: Array<{
    day: string; // Date string like "2026-01-27" - API returns 'day', not 'date'
    requests: number;
  }>;
}

/**
 * List memories response - requires custom endpoint in Engram
 * @endpoint GET /v1/memories (NOT YET IMPLEMENTED - use POST /v1/memories/query)
 */
export interface ListMemoriesResponse {
  memories: Memory[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * List users response - requires custom endpoint in Engram
 * @endpoint GET /v1/users (NOT YET IMPLEMENTED)
 */
export interface ListUsersResponse {
  users: UserWithStats[];
  total: number;
}

/**
 * User detail with memories - requires custom endpoint in Engram
 * @endpoint GET /v1/users/:id (NOT YET IMPLEMENTED)
 */
export interface UserDetailResponse extends UserWithStats {
  memories: Memory[];
  projects: Project[];
  sessions: Session[];
}

/**
 * API Key (for dashboard API key management)
 * @endpoint Requires new endpoints in Engram
 */
export interface ApiKey {
  id: string;
  name: string;
  keyHint: string;
  createdAt: string;
}

// ============================================================================
// GRAPH VISUALIZATION TYPES
// ============================================================================

export interface GraphNode {
  id: string;
  raw: string;
  layer: MemoryLayer;
  source: MemorySource;
  importanceScore: number;
  confidence: number;
  createdAt: string;
  extraction: {
    who: string | null;
    what: string | null;
    when: string | null;
    where: string | null;
    why: string | null;
    how: string | null;
    topics: string[];
  } | null;
  entities: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  primaryEntityType: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  linkType: ChainLinkType;
  confidence: number;
  createdAt: string;
}

export interface GraphEntity {
  id: string;
  name: string;
  type: string;
  normalizedName: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  entities: GraphEntity[];
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export type MemoryType =
  | 'CONSTRAINT'
  | 'PREFERENCE'
  | 'FACT'
  | 'TASK'
  | 'EVENT'
  | 'LESSON';

export interface TimelineDataPoint {
  timestamp: string;
  count: number;
  cumulative?: number;
}

export interface TimelineResponse {
  granularity: 'hour' | 'day' | 'week';
  data: TimelineDataPoint[];
  total: number;
  range: {
    start: string;
    end: string;
  };
}

export interface TypeBreakdownPoint {
  timestamp: string;
  types: Record<MemoryType, number>;
  total: number;
}

export interface TypeBreakdownResponse {
  granularity: 'day' | 'week' | 'month';
  data: TypeBreakdownPoint[];
  summary: {
    dominant: MemoryType | null;
    distribution: Record<string, { count: number; percentage: number }>;
  };
}

export interface LayerDistribution {
  layer: MemoryLayer;
  count: number;
  percentage: number;
}

export interface LayerTrendPoint {
  timestamp: string;
  layers: Record<MemoryLayer, number>;
}

export interface LayerDistributionResponse {
  current: LayerDistribution[];
  total: number;
  trend?: {
    granularity: 'day' | 'week';
    data: LayerTrendPoint[];
  };
}

export interface AnalyticsSummaryResponse {
  totalMemories: number;
  memoriesToday: number;
  memoriesThisWeek: number;
  avgImportance: number;
  timeline: TimelineDataPoint[];
  typeDistribution: Record<string, { count: number; percentage: number }>;
  layerDistribution: LayerDistribution[];
  lastUpdated: string;
}

// ============================================================================
// DEDUPLICATION / MERGE CANDIDATES
// ============================================================================

export interface MergeCandidateMemory {
  id: string;
  content: string;
  raw?: string;
  effectiveScore: number;
  type?: string;
  source?: string;
  layer?: string;
  createdAt: string;
}

export interface MergeCandidate {
  id: string;
  memoryA: MergeCandidateMemory;
  memoryB: MergeCandidateMemory;
  similarity: number;
  status: 'PENDING' | 'REVIEWED';
  reviewedAt?: string;
  reviewAction?: 'MERGE' | 'KEEP' | 'SKIP';
  createdAt: string;
}

// ============================================================================
// MULTI-AGENT TYPES (v0.7)
// ============================================================================

export type AgentSessionStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
export type PoolVisibility = 'GLOBAL' | 'SHARED' | 'PRIVATE';
export type AccessType = 'CREATED' | 'RECALLED' | 'UPDATED' | 'CONTEXT_LOADED';

export interface AgentSession {
  id: string;
  sessionKey: string;
  label: string | null;
  status: AgentSessionStatus;
  parentSessionKey: string | null;
  taskDescription: string | null;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSessionSummary {
  sessionKey: string;
  label: string | null;
  status: AgentSessionStatus;
  memoriesCreated: number;
  memoriesAccessed: number;
  uniqueMemories: number;
  duration: number | null; // ms
  topTopics: string[];
}

export interface MemoryPool {
  id: string;
  name: string;
  description: string | null;
  visibility: PoolVisibility;
  createdBySession: string | null;
  memberCount?: number;
  grantCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PoolGrant {
  id: string;
  poolId: string;
  sessionKey: string;
  permissions: string;
  grantedAt: string;
}

export interface PoolMember {
  memoryId: string;
  raw: string;
  layer: MemoryLayer;
  createdAt: string;
  importanceScore: number;
}

export interface MemoryAccessLog {
  id: string;
  memoryId: string;
  sessionKey: string;
  accessType: AccessType;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface MemoryAttribution {
  memoryId: string;
  createdBySession: AgentSession | null;
  accessLog: MemoryAccessLog[];
  pools: MemoryPool[];
}

// ============================================================================
// FOG INDEX TYPES
// ============================================================================

export interface FogIndexComponent {
  name: string;
  score: number;
  weight: number;
  details: string;
}

export interface FogIndexResult {
  score: number;
  tier: string;
  components: FogIndexComponent[];
  computedAt: string;
}

export interface FogIndexHistory {
  score: number;
  tier: string;
  computedAt: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export class EngramApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'EngramApiError';
  }
}
