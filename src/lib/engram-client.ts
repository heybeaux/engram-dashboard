/**
 * Engram API Client
 *
 * Client for the Engram Agent Memory API.
 *
 * EXISTING ENDPOINTS:
 * - POST /v1/memories - Create a memory
 * - POST /v1/memories/batch - Batch create memories
 * - POST /v1/memories/query - Semantic search
 * - GET /v1/memories/:id - Get single memory
 * - DELETE /v1/memories/:id - Soft delete memory
 * - POST /v1/memories/:id/used - Mark as used (feedback)
 * - POST /v1/memories/:id/helpful - Mark as helpful
 * - POST /v1/memories/:id/correct - Correct a memory
 * - POST /v1/context - Load context for session
 * - POST /v1/observe - Observe conversation turns
 * - POST /v1/observe/analyze - Analyze without storing
 *
 * MISSING ENDPOINTS (need to be added to Engram):
 * - GET /v1/stats - Dashboard statistics
 * - GET /v1/memories - List memories with filters (pagination)
 * - GET /v1/users - List all users
 * - GET /v1/users/:id - Get user detail
 * - GET/POST/DELETE /v1/api-keys - API key management
 */

import {
  Memory,
  MemoryLayer,
  QueryResult,
  ContextResult,
  BatchCreateResult,
  ObserveResult,
  CreateMemoryRequest,
  CreateMemoryBatchRequest,
  QueryMemoryRequest,
  LoadContextRequest,
  ObserveRequest,
  DashboardStats,
  GraphData,
  ListMemoriesResponse,
  ListUsersResponse,
  UserDetailResponse,
  ApiKey,
  EngramApiError,
  MergeCandidate,
} from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const getConfig = () => ({
  baseUrl: process.env.NEXT_PUBLIC_ENGRAM_API_URL ||
           process.env.ENGRAM_API_URL ||
           'https://api.openengram.ai',
  apiKey: process.env.NEXT_PUBLIC_ENGRAM_API_KEY ||
          process.env.ENGRAM_API_KEY || '',
  defaultUserId: process.env.NEXT_PUBLIC_ENGRAM_USER_ID ||
                 process.env.ENGRAM_USER_ID || '',
});

// ============================================================================
// CLIENT CLASS
// ============================================================================

export class EngramClient {
  private baseUrl: string;
  private apiKey: string;
  private defaultUserId?: string;

  constructor(options?: {
    baseUrl?: string;
    apiKey?: string;
    defaultUserId?: string;
  }) {
    const config = getConfig();
    this.baseUrl = options?.baseUrl ?? config.baseUrl;
    this.apiKey = options?.apiKey ?? config.apiKey;
    this.defaultUserId = options?.defaultUserId ?? config.defaultUserId;
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit & { userId?: string }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    // When userId is explicitly empty string, skip the header entirely
    // (allows account-wide queries scoped only by API key).
    // Only fall back to defaultUserId when userId is not provided at all.
    const userId = options?.userId !== undefined ? options.userId : this.defaultUserId;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers['X-AM-API-Key'] = this.apiKey;
    } else if (typeof window !== 'undefined') {
      const token = localStorage.getItem('engram_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (userId) {
      headers['X-AM-User-ID'] = userId;
    }

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
        errorBody
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // ==========================================================================
  // MEMORY CRUD
  // ==========================================================================

  /**
   * Create a single memory
   * @endpoint POST /v1/memories
   */
  async createMemory(
    data: CreateMemoryRequest,
    userId?: string
  ): Promise<Memory> {
    return this.fetch<Memory>('/v1/memories', {
      method: 'POST',
      body: JSON.stringify(data),
      userId,
    });
  }

  /**
   * Create multiple memories in batch
   * @endpoint POST /v1/memories/batch
   */
  async createMemoryBatch(
    data: CreateMemoryBatchRequest,
    userId?: string
  ): Promise<BatchCreateResult> {
    return this.fetch<BatchCreateResult>('/v1/memories/batch', {
      method: 'POST',
      body: JSON.stringify(data),
      userId,
    });
  }

  /**
   * Get a single memory by ID
   * @endpoint GET /v1/memories/:id
   */
  async getMemory(id: string): Promise<Memory | null> {
    return this.fetch<Memory | null>(`/v1/memories/${id}`);
  }

  /**
   * Delete a memory (soft delete)
   * @endpoint DELETE /v1/memories/:id
   */
  async deleteMemory(id: string): Promise<void> {
    await this.fetch<void>(`/v1/memories/${id}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // MEMORY SEARCH & CONTEXT
  // ==========================================================================

  /**
   * Semantic search for memories
   * @endpoint POST /v1/memories/query
   */
  async searchMemories(
    query: string,
    options?: {
      limit?: number;
      layers?: MemoryLayer[];
      includeChains?: boolean;
      projectId?: string;
    },
    userId?: string
  ): Promise<QueryResult> {
    const data: QueryMemoryRequest = {
      query,
      limit: options?.limit ?? 10,
      layers: options?.layers,
      includeChains: options?.includeChains,
      projectId: options?.projectId,
    };

    return this.fetch<QueryResult>('/v1/memories/query', {
      method: 'POST',
      body: JSON.stringify(data),
      userId,
    });
  }

  /**
   * Load context for session start
   * @endpoint POST /v1/context
   */
  async loadContext(
    options?: LoadContextRequest,
    userId?: string
  ): Promise<ContextResult> {
    return this.fetch<ContextResult>('/v1/context', {
      method: 'POST',
      body: JSON.stringify(options ?? {}),
      userId,
    });
  }

  // ==========================================================================
  // FEEDBACK
  // ==========================================================================

  /**
   * Mark a memory as used (implicit feedback)
   * @endpoint POST /v1/memories/:id/used
   */
  async markUsed(memoryId: string): Promise<void> {
    await this.fetch<void>(`/v1/memories/${memoryId}/used`, { method: 'POST' });
  }

  /**
   * Mark a memory as helpful (explicit feedback)
   * @endpoint POST /v1/memories/:id/helpful
   */
  async markHelpful(memoryId: string): Promise<void> {
    await this.fetch<void>(`/v1/memories/${memoryId}/helpful`, {
      method: 'POST',
    });
  }

  /**
   * Correct a memory
   * @endpoint POST /v1/memories/:id/correct
   */
  async correctMemory(
    memoryId: string,
    correction: string,
    userId?: string
  ): Promise<Memory> {
    return this.fetch<Memory>(`/v1/memories/${memoryId}/correct`, {
      method: 'POST',
      body: JSON.stringify({ correction }),
      userId,
    });
  }

  // ==========================================================================
  // AUTO-EXTRACTION (Observe)
  // ==========================================================================

  /**
   * Observe conversation turns and auto-extract memories
   * @endpoint POST /v1/observe
   */
  async observe(data: ObserveRequest, userId?: string): Promise<ObserveResult> {
    return this.fetch<ObserveResult>('/v1/observe', {
      method: 'POST',
      body: JSON.stringify(data),
      userId,
    });
  }

  /**
   * Analyze signals without storing (preview mode)
   * @endpoint POST /v1/observe/analyze
   */
  async analyzeSignals(
    data: ObserveRequest,
    userId?: string
  ): Promise<{
    signals: ObserveResult['signals'];
    aggregateImportance: number;
  }> {
    return this.fetch('/v1/observe/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
      userId,
    });
  }

  // ==========================================================================
  // DASHBOARD ENDPOINTS (NOT YET IMPLEMENTED IN ENGRAM)
  // ==========================================================================

  /**
   * Get memory graph data for visualization
   * Composes data from /v1/graph/entities and /v1/graph/relationships
   * @endpoint GET /v1/graph/entities + GET /v1/graph/relationships
   */
  async getGraphData(params?: { limit?: number }): Promise<GraphData> {
    const userId = this.defaultUserId || '';
    const limit = params?.limit ?? 200;

    // Fetch entities and relationships in parallel
    const [entitiesRaw, relationshipsRaw] = await Promise.all([
      this.fetch<{ entities?: Array<Record<string, unknown>>; data?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>>(
        `/v1/graph/entities?userId=${encodeURIComponent(userId)}&limit=${limit}`
      ).catch(() => []),
      this.fetch<{ relationships?: Array<Record<string, unknown>>; data?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>>(
        `/v1/graph/relationships?userId=${encodeURIComponent(userId)}&limit=${limit}`
      ).catch(() => []),
    ]);

    // Normalize arrays
    const entities: Array<Record<string, unknown>> = Array.isArray(entitiesRaw)
      ? entitiesRaw
      : (entitiesRaw as Record<string, unknown>)?.entities as Array<Record<string, unknown>>
        ?? (entitiesRaw as Record<string, unknown>)?.data as Array<Record<string, unknown>>
        ?? [];

    const relationships: Array<Record<string, unknown>> = Array.isArray(relationshipsRaw)
      ? relationshipsRaw
      : (relationshipsRaw as Record<string, unknown>)?.relationships as Array<Record<string, unknown>>
        ?? (relationshipsRaw as Record<string, unknown>)?.data as Array<Record<string, unknown>>
        ?? [];

    // Transform to GraphData format
    return {
      nodes: [], // Memory nodes aren't directly available from graph API
      edges: relationships.map((r) => ({
        id: String(r.id ?? ''),
        source: String(r.sourceEntityId ?? r.source ?? ''),
        target: String(r.targetEntityId ?? r.target ?? ''),
        linkType: String(r.type ?? r.linkType ?? 'RELATED') as import('./types').ChainLinkType,
        confidence: Number(r.confidence ?? r.weight ?? 1.0),
        createdAt: String(r.createdAt ?? new Date().toISOString()),
      })),
      entities: entities.map((e) => ({
        id: String(e.id ?? ''),
        name: String(e.name ?? ''),
        normalizedName: String(e.normalizedName ?? e.name ?? ''),
        type: String(e.type ?? 'UNKNOWN'),
        mentionCount: Number(e.mentionCount ?? 0),
      })),
    };
  }

  /**
   * Get dashboard statistics
   * @endpoint GET /v1/stats
   * @status NOT IMPLEMENTED - returns mock data
   */
  async getStats(): Promise<DashboardStats> {
    try {
      return await this.fetch<DashboardStats>('/v1/stats');
    } catch (error) {
      if (error instanceof EngramApiError && error.statusCode === 404) {
        console.warn(
          'GET /v1/stats not implemented in Engram. Returning mock data.'
        );
        return this.getMockStats();
      }
      throw error;
    }
  }

  /**
   * List memories with pagination and filters
   * @endpoint GET /v1/memories
   * @status NOT IMPLEMENTED - falls back to query endpoint
   */
  async getMemories(params?: {
    userId?: string;
    layer?: MemoryLayer;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ListMemoriesResponse> {
    // Try the list endpoint first
    try {
      const searchParams = new URLSearchParams();
      if (params?.userId) searchParams.set('userId', params.userId);
      if (params?.layer) searchParams.set('layer', params.layer);
      if (params?.search) searchParams.set('q', params.search);
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));

      const queryString = searchParams.toString();
      const endpoint = queryString ? `/v1/memories?${queryString}` : '/v1/memories';

      return await this.fetch<ListMemoriesResponse>(endpoint);
    } catch (error) {
      // Fallback to query endpoint for search
      if (
        error instanceof EngramApiError &&
        (error.statusCode === 404 || error.statusCode === 405)
      ) {
        console.warn(
          'GET /v1/memories not implemented. Using /v1/memories/query fallback.'
        );

        if (params?.search) {
          const result = await this.searchMemories(
            params.search,
            { limit: params.limit ?? 20 },
            params.userId
          );
          return {
            memories: result.memories,
            total: result.memories.length,
            limit: params.limit ?? 20,
            offset: params.offset ?? 0,
          };
        }

        // Without search, we can't use query - return empty
        return {
          memories: [],
          total: 0,
          limit: params?.limit ?? 20,
          offset: params?.offset ?? 0,
        };
      }
      throw error;
    }
  }

  /**
   * Get all users
   * @endpoint GET /v1/users
   * @status NOT IMPLEMENTED - returns mock data
   */
  async getUsers(): Promise<ListUsersResponse> {
    try {
      return await this.fetch<ListUsersResponse>('/v1/users');
    } catch (error) {
      if (error instanceof EngramApiError && error.statusCode === 404) {
        console.warn('GET /v1/users not implemented. Returning empty list.');
        return { users: [], total: 0 };
      }
      throw error;
    }
  }

  /**
   * Get user detail with memories
   * @endpoint GET /v1/users/:id
   * @status NOT IMPLEMENTED - returns mock data
   */
  async getUser(id: string): Promise<UserDetailResponse | null> {
    try {
      return await this.fetch<UserDetailResponse>(`/v1/users/${id}`);
    } catch (error) {
      if (error instanceof EngramApiError && error.statusCode === 404) {
        console.warn(`GET /v1/users/${id} not implemented.`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete a user
   * @endpoint DELETE /v1/users/:id
   */
  async deleteUser(id: string, deleteMemories: boolean = false): Promise<{ deleted: boolean; memoriesDeleted?: number }> {
    const params = deleteMemories ? '?deleteMemories=true' : '';
    return this.fetch<{ deleted: boolean; memoriesDeleted?: number }>(
      `/v1/users/${id}${params}`,
      { method: 'DELETE' }
    );
  }

  // ==========================================================================
  // API KEYS (NOT YET IMPLEMENTED IN ENGRAM)
  // ==========================================================================

  /**
   * Get all API keys
   * @endpoint GET /v1/api-keys
   * @status NOT IMPLEMENTED
   */
  async getApiKeys(): Promise<{ keys: ApiKey[] }> {
    try {
      return await this.fetch<{ keys: ApiKey[] }>('/v1/api-keys');
    } catch (error) {
      if (error instanceof EngramApiError && error.statusCode === 404) {
        console.warn('GET /v1/api-keys not implemented.');
        return { keys: [] };
      }
      throw error;
    }
  }

  /**
   * Create a new API key
   * @endpoint POST /v1/api-keys
   * @status NOT IMPLEMENTED
   */
  async createApiKey(name: string): Promise<{ key: string; id: string }> {
    return this.fetch<{ key: string; id: string }>('/v1/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Revoke an API key
   * @endpoint DELETE /v1/api-keys/:id
   * @status NOT IMPLEMENTED
   */
  async revokeApiKey(id: string): Promise<void> {
    await this.fetch<void>(`/v1/api-keys/${id}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // ANALYTICS ENDPOINTS
  // ==========================================================================

  /**
   * Get analytics summary
   * @endpoint GET /v1/analytics/summary
   */
  async getAnalyticsSummary(): Promise<import('./types').AnalyticsSummaryResponse> {
    return this.fetch<import('./types').AnalyticsSummaryResponse>('/v1/analytics/summary');
  }

  /**
   * Get timeline data
   * @endpoint GET /v1/analytics/timeline
   */
  async getAnalyticsTimeline(params?: {
    granularity?: 'hour' | 'day' | 'week';
    start?: string;
    end?: string;
    cumulative?: boolean;
  }): Promise<import('./types').TimelineResponse> {
    const searchParams = new URLSearchParams();
    if (params?.granularity) searchParams.set('granularity', params.granularity);
    if (params?.start) searchParams.set('start', params.start);
    if (params?.end) searchParams.set('end', params.end);
    if (params?.cumulative) searchParams.set('cumulative', 'true');
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/analytics/timeline?${queryString}` : '/v1/analytics/timeline';
    return this.fetch<import('./types').TimelineResponse>(endpoint);
  }

  /**
   * Get type breakdown
   * @endpoint GET /v1/analytics/breakdown/type
   */
  async getAnalyticsTypeBreakdown(params?: {
    granularity?: 'day' | 'week' | 'month';
    start?: string;
    end?: string;
  }): Promise<import('./types').TypeBreakdownResponse> {
    const searchParams = new URLSearchParams();
    if (params?.granularity) searchParams.set('granularity', params.granularity);
    if (params?.start) searchParams.set('start', params.start);
    if (params?.end) searchParams.set('end', params.end);
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/analytics/breakdown/type?${queryString}` : '/v1/analytics/breakdown/type';
    return this.fetch<import('./types').TypeBreakdownResponse>(endpoint);
  }

  /**
   * Get layer distribution
   * @endpoint GET /v1/analytics/breakdown/layer
   */
  async getAnalyticsLayerBreakdown(params?: {
    includeTrend?: boolean;
    granularity?: 'day' | 'week';
  }): Promise<import('./types').LayerDistributionResponse> {
    const searchParams = new URLSearchParams();
    if (params?.includeTrend !== undefined) searchParams.set('includeTrend', String(params.includeTrend));
    if (params?.granularity) searchParams.set('granularity', params.granularity);
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/analytics/breakdown/layer?${queryString}` : '/v1/analytics/breakdown/layer';
    return this.fetch<import('./types').LayerDistributionResponse>(endpoint);
  }

  // ==========================================================================
  // DEDUPLICATION / MERGE CANDIDATES
  // ==========================================================================

  /**
   * List merge candidates
   * @endpoint GET /v1/dedup/candidates
   */
  async getMergeCandidates(params?: {
    status?: 'PENDING' | 'REVIEWED';
    minSimilarity?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ candidates: MergeCandidate[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.minSimilarity !== undefined) searchParams.set('minSimilarity', String(params.minSimilarity));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/dedup/candidates?${queryString}` : '/v1/dedup/candidates';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await this.fetch<{ candidates: any[]; total: number; pendingCount?: number }>(endpoint);
    // API returns memories[] array; frontend expects memoryA/memoryB
    const candidates = (raw.candidates ?? []).map((c) => ({
      ...c,
      memoryA: c.memoryA ?? c.memories?.[0] ?? null,
      memoryB: c.memoryB ?? c.memories?.[1] ?? null,
    }));
    return { candidates, total: raw.total ?? 0 };
  }

  /**
   * Review a merge candidate
   * @endpoint POST /v1/dedup/candidates/:id/review
   */
  async reviewMergeCandidate(
    id: string,
    decision: { action: 'MERGE' | 'KEEP' | 'SKIP'; winnerId?: string }
  ): Promise<void> {
    // Engram exposes POST /v1/dedup/review/:candidateId/approve|reject|skip
    const actionMap: Record<string, string> = {
      'MERGE': 'approve',
      'KEEP': 'reject',
      'SKIP': 'skip',
    };
    const endpoint = actionMap[decision.action] || 'skip';
    const body: Record<string, unknown> = {};
    if (decision.winnerId) {
      body.winnerId = decision.winnerId;
    }
    await this.fetch<void>(`/v1/dedup/review/${id}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Trigger a dedup scan
   * @endpoint POST /v1/dedup/scan
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async runDedupScan(): Promise<any> {
    return this.fetch('/v1/dedup/scan', {
      method: 'POST',
      body: JSON.stringify({ userId: this.defaultUserId }),
    });
  }

  /**
   * Trigger a dream cycle (consolidation)
   * @endpoint POST /v1/consolidation/dream-cycle
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async runDreamCycle(dryRun: boolean = false): Promise<any> {
    return this.fetch('/v1/consolidation/dream-cycle', {
      method: 'POST',
      body: JSON.stringify({ dryRun }),
    });
  }

  // ==========================================================================
  // MULTI-AGENT (v0.7)
  // ==========================================================================

  async getAgentSessions(params?: {
    status?: import('./types').AgentSessionStatus;
    parentSessionKey?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ sessions: import('./types').AgentSession[]; total: number }> {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.parentSessionKey) sp.set('parentSessionKey', params.parentSessionKey);
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.offset) sp.set('offset', String(params.offset));
    const qs = sp.toString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.fetch<any>(`/v1/agent-sessions${qs ? `?${qs}` : ''}`);
    return {
      sessions: Array.isArray(data) ? data : data.sessions ?? [],
      total: Array.isArray(data) ? data.length : data.total ?? 0,
    };
  }

  async getAgentSessionSummary(key: string): Promise<import('./types').AgentSessionSummary> {
    return this.fetch(`/v1/agent-sessions/${encodeURIComponent(key)}/summary`);
  }

  async getPools(params?: {
    visibility?: import('./types').PoolVisibility;
    limit?: number;
    offset?: number;
  }): Promise<{ pools: import('./types').MemoryPool[]; total: number }> {
    const sp = new URLSearchParams();
    if (params?.visibility) sp.set('visibility', params.visibility);
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.offset) sp.set('offset', String(params.offset));
    const qs = sp.toString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.fetch<any>(`/v1/pools${qs ? `?${qs}` : ''}`);
    return {
      pools: Array.isArray(data) ? data : data.pools ?? [],
      total: Array.isArray(data) ? data.length : data.total ?? 0,
    };
  }

  async getPool(id: string): Promise<import('./types').MemoryPool> {
    return this.fetch(`/v1/pools/${id}`);
  }

  async getPoolMembers(id: string, params?: { limit?: number; offset?: number }): Promise<{ members: import('./types').PoolMember[]; total: number }> {
    const sp = new URLSearchParams();
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.offset) sp.set('offset', String(params.offset));
    const qs = sp.toString();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.fetch<any>(`/v1/pools/${id}/members${qs ? `?${qs}` : ''}`);
      return {
        members: Array.isArray(data) ? data : data.members ?? [],
        total: Array.isArray(data) ? data.length : data.total ?? 0,
      };
    } catch (error) {
      if (error instanceof EngramApiError && error.statusCode === 404) {
        return { members: [], total: 0 };
      }
      throw error;
    }
  }

  async getPoolGrants(id: string): Promise<{ grants: import('./types').PoolGrant[] }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.fetch<any>(`/v1/pools/${id}/grants`);
      return {
        grants: Array.isArray(data) ? data : data.grants ?? [],
      };
    } catch (error) {
      if (error instanceof EngramApiError && error.statusCode === 404) {
        return { grants: [] };
      }
      throw error;
    }
  }

  async getMemoryAttribution(memoryId: string): Promise<import('./types').MemoryAttribution> {
    return this.fetch(`/v1/memories/${memoryId}/attribution`);
  }

  // ==========================================================================
  // MOCK DATA (for unimplemented endpoints)
  // ==========================================================================

  private getMockStats(): DashboardStats {
    return {
      totalMemories: 0,
      memoryTrend: 0,
      totalUsers: 0,
      userTrend: 0,
      healthScore: 100,
      memoryByLayer: [
        { layer: 'IDENTITY', count: 0, percentage: 0 },
        { layer: 'PROJECT', count: 0, percentage: 0 },
        { layer: 'SESSION', count: 0, percentage: 0 },
        { layer: 'TASK', count: 0, percentage: 0 },
        { layer: 'INSIGHT', count: 0, percentage: 0 },
      ],
      recentActivity: [],
      apiRequests: [],
    };
  }

  // ==========================================================================
  // FOG INDEX
  // ==========================================================================

  async getFogIndex(userId?: string): Promise<import('./types').FogIndexResult> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.fetch(`/v1/fog-index${params}`);
  }

  async getFogIndexHistory(limit = 30): Promise<import('./types').FogIndexHistory[]> {
    return this.fetch(`/v1/fog-index/history?limit=${limit}`);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Default client instance using environment configuration
 */
export const engram = new EngramClient();

/**
 * Create a new client with custom configuration
 */
export function createEngramClient(options?: {
  baseUrl?: string;
  apiKey?: string;
  defaultUserId?: string;
}): EngramClient {
  return new EngramClient(options);
}

// ============================================================================
// CONVENIENCE RE-EXPORTS
// ============================================================================

export * from './types';
