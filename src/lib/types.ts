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
    action: 'created' | 'retrieved' | 'deleted' | 'updated';
    memoryId?: string;
    userId?: string;
    timestamp: string;
  }>;

  apiRequests: Array<{
    date: string;
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
