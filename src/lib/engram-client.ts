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
 * DASHBOARD ENDPOINTS (implemented in Engram backend):
 * - GET /v1/stats - Dashboard statistics
 * - GET /v1/memories - List memories with filters (pagination)
 * - GET /v1/users - List all users (InternalOnlyGuard)
 * - GET /v1/users/:id - Get user detail (InternalOnlyGuard)
 * - DELETE /v1/users/:id - Delete user
 * - GET/POST/DELETE /v1/account/api-keys - API key management
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
  GraphNode,
  ListMemoriesResponse,
  ListUsersResponse,
  UserDetailResponse,
  ApiKey,
  EngramApiError,
  MergeCandidate,
  Timeline,
  TimelineLod,
  ArcSearchRequest,
  ArcSearchResponse,
  GetTimelinesParams,
} from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

import { getApiBaseUrl, getApiKey, getDefaultUserId } from './api-config';

const isBrowser = typeof window !== 'undefined';

const getConfig = () => ({
  // In the browser, route through Next.js API proxy to keep API key server-side (HEY-203).
  baseUrl: isBrowser ? '/api/engram' : getApiBaseUrl(),
  apiKey: isBrowser ? '' : getApiKey(),
  defaultUserId: getDefaultUserId(),
});

function stringField(
  value: unknown,
  fallback = '',
): string {
  return typeof value === 'string' ? value : fallback;
}

function timestampStringField(
  value: unknown,
  fallback = '',
): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const millis = value > 1_000_000_000_000 ? value : value * 1000;
    return new Date(millis).toISOString();
  }
  return fallback;
}

function nullableStringField(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function nullableTimestampStringField(value: unknown): string | null {
  const timestamp = timestampStringField(value);
  return timestamp || null;
}

function normalizeAgentSession(
  raw: Record<string, unknown>,
): import('./types').AgentSession {
  return {
    id: stringField(raw.id),
    sessionKey: stringField(raw.sessionKey ?? raw.session_key),
    label: nullableStringField(raw.label),
    status: stringField(raw.status, 'ACTIVE') as import('./types').AgentSessionStatus,
    parentSessionKey: nullableStringField(raw.parentSessionKey ?? raw.parent_session_key),
    taskDescription: nullableStringField(raw.taskDescription ?? raw.task_description),
    startedAt: timestampStringField(
      raw.startedAt ??
        raw.started_at ??
        raw.started ??
        raw.started_at_ms ??
        raw.startTime ??
        raw.start_time ??
        raw.createdAt ??
        raw.created_at,
    ),
    endedAt: nullableTimestampStringField(
      raw.endedAt ??
        raw.ended_at ??
        raw.ended ??
        raw.ended_at_ms ??
        raw.endTime ??
        raw.end_time,
    ),
    createdAt: timestampStringField(raw.createdAt ?? raw.created_at),
    updatedAt: timestampStringField(raw.updatedAt ?? raw.updated_at),
  };
}


function getErrorDetail(errorBody: unknown): string | null {
  if (typeof errorBody === 'string') return errorBody.trim() || null;
  if (!errorBody || typeof errorBody !== 'object') return null;

  const body = errorBody as Record<string, unknown>;
  const message = body.message;
  if (typeof message === 'string' && message.trim()) return message.trim();
  if (Array.isArray(message)) {
    const parts = message.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
    if (parts.length) return parts.join('; ');
  }

  const error = body.error;
  if (typeof error === 'string' && error.trim()) return error.trim();
  return null;
}

function buildApiErrorMessage(response: Response, errorBody: unknown): string {
  const statusText = response.statusText ? ` ${response.statusText}` : '';
  const detail = getErrorDetail(errorBody);
  return detail
    ? `Request failed (${response.status}${statusText}): ${detail}`
    : `Request failed (${response.status}${statusText})`;
}

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
        buildApiErrorMessage(response, errorBody),
        errorBody
      );
    }

    // Handle empty success bodies defensively. Some backend miss paths can
    // currently arrive through the dashboard proxy as 200 + empty text, which
    // should not crash detail pages while the route renders its not-found state.
    if (response.status === 204) {
      return undefined as T;
    }

    if (typeof response.text === "function") {
      const text = await response.text();
      if (!text.trim()) {
        return null as T;
      }
      return JSON.parse(text) as T;
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
    return this.fetch<Memory | null>(`/v1/memories/${id}`, { userId: '' });
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
      /** Search across all users in the authenticated account instead of only the resolved/default user. */
      scope?: 'account';
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

    const endpoint = options?.scope === 'account'
      ? '/v1/memories/query?scope=account'
      : '/v1/memories/query';

    return this.fetch<QueryResult>(endpoint, {
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
  // DASHBOARD ENDPOINTS
  // ==========================================================================

  /**
   * Get memory graph data for visualization
   * Fetches graph data from the memory graph endpoint which uses
   * existing Entity/MemoryEntity associations (always populated).
   * @endpoint GET /v1/memories/graph
   */
  async getGraphData(params?: { limit?: number }): Promise<GraphData> {
    const limit = params?.limit ?? 500;

    // Use the memory graph endpoint which queries memories + entity associations directly.
    // This works even without GRAPH_ENABLED since entities are extracted during normal ingestion.
    const qs = new URLSearchParams({ limit: String(limit), includeAgent: 'true' });

    const raw = await this.fetch<{
      nodes: Array<Record<string, unknown>>;
      edges: Array<Record<string, unknown>>;
      entities: Array<Record<string, unknown>>;
      stats?: { human: number; agent: number };
    }>(`/v1/memories/graph?${qs.toString()}`, { userId: '' });
    return {
      nodes: (raw.nodes ?? []).map((n) => ({
        id: String(n.id ?? ''),
        raw: String(n.raw ?? ''),
        layer: String(n.layer ?? 'WORKING') as import('./types').MemoryLayer,
        source: (n.source ?? 'AGENT_OBSERVATION') as import('./types').MemorySource,
        importanceScore: Number(n.importanceScore ?? 0.5),
        confidence: Number(n.confidence ?? 1.0),
        createdAt: String(n.createdAt ?? new Date().toISOString()),
        extraction: n.extraction as GraphNode['extraction'] ?? null,
        entities: Array.isArray(n.entities) ? (n.entities as Array<Record<string, unknown>>).map((e) => ({
          id: String(e.id ?? ''),
          name: String(e.name ?? ''),
          type: String(e.type ?? 'UNKNOWN'),
        })) : [],
        primaryEntityType: String(n.primaryEntityType ?? 'UNKNOWN'),
      })),
      edges: (raw.edges ?? []).map((e) => ({
        id: String(e.id ?? ''),
        source: String(e.sourceId ?? e.source ?? ''),
        target: String(e.targetId ?? e.target ?? ''),
        linkType: String(e.linkType ?? 'RELATED') as import('./types').ChainLinkType,
        confidence: Number(e.confidence ?? e.weight ?? 1.0),
        createdAt: String(e.createdAt ?? new Date().toISOString()),
      })),
      entities: (raw.entities ?? []).map((e) => ({
        id: String(e.id ?? ''),
        name: String(e.name ?? ''),
        normalizedName: String(e.normalizedName ?? e.name ?? ''),
        type: String(e.type ?? 'UNKNOWN'),
      })),
    };
  }

  /**
   * Get dashboard statistics
   * @endpoint GET /v1/stats
   */
  async getStats(): Promise<DashboardStats> {
    return this.fetch<DashboardStats>('/v1/stats');
  }

  /**
   * List memories with pagination and filters
   * @endpoint GET /v1/memories
   */
  async getMemories(params?: {
    userId?: string;
    layer?: MemoryLayer;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ListMemoriesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set('userId', params.userId);
    if (params?.layer) searchParams.set('layer', params.layer);
    if (params?.search) searchParams.set('q', params.search);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/memories?${queryString}` : '/v1/memories';

    return this.fetch<ListMemoriesResponse>(endpoint);
  }

  /**
   * Get all users
   * @endpoint GET /v1/users
   */
  async getUsers(): Promise<ListUsersResponse> {
    return this.fetch<ListUsersResponse>('/v1/users');
  }

  /**
   * Get user detail with memories
   * @endpoint GET /v1/users/:id
   */
  async getUser(id: string): Promise<UserDetailResponse | null> {
    try {
      return await this.fetch<UserDetailResponse>(`/v1/users/${id}`);
    } catch (error) {
      if (error instanceof EngramApiError && error.statusCode === 404) {
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
  // API KEYS (via /v1/account/api-keys)
  // ==========================================================================

  /**
   * Get all API keys
   * @endpoint GET /v1/account/api-keys
   */
  async getApiKeys(): Promise<{ keys: ApiKey[] }> {
    return this.fetch<{ keys: ApiKey[] }>('/v1/account/api-keys');
  }

  /**
   * Create a new API key
   * @endpoint POST /v1/account/api-keys
   */
  async createApiKey(name: string): Promise<{ key: string; id: string }> {
    return this.fetch<{ key: string; id: string }>('/v1/account/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Revoke an API key
   * @endpoint DELETE /v1/account/api-keys/:id
   */
  async revokeApiKey(id: string): Promise<void> {
    await this.fetch<void>(`/v1/account/api-keys/${id}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // EMAIL ENDPOINTS
  // ==========================================================================

  /**
   * List emails with pagination and filters
   * @endpoint GET /v1/emails
   */
  async getEmails(params?: {
    page?: number;
    limit?: number;
    search?: string;
    from?: string;
    to?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{
    data: Array<{
      id: string;
      from: string;
      to: string;
      subject: string;
      textBody: string;
      htmlBody: string;
      status: string;
      createdAt: string;
      processedAt: string | null;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/emails?${queryString}` : '/v1/emails';

    return this.fetch(endpoint);
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
  // TIMELINES / ARCS (add-arc-search — ENG-166)
  // ==========================================================================

  /**
   * Browse daily timelines by date range.
   * @endpoint GET /v1/timelines
   */
  async getTimelines(params?: GetTimelinesParams): Promise<Timeline[]> {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    if (params?.arcId) searchParams.set('arcId', params.arcId);
    if (params?.lod) searchParams.set('lod', params.lod);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/timelines?${queryString}` : '/v1/timelines';

    const data = await this.fetch<Timeline[] | { timelines?: Timeline[] } | null>(endpoint);
    if (Array.isArray(data)) return data;
    return data?.timelines ?? [];
  }

  /**
   * Recall an entire arc's member day timelines in chronological order.
   * @endpoint GET /v1/timelines/arc/:arcId
   */
  async getArc(arcId: string, lod: TimelineLod = 'summary'): Promise<Timeline[]> {
    const searchParams = new URLSearchParams({ lod });
    const endpoint = `/v1/timelines/arc/${encodeURIComponent(arcId)}?${searchParams.toString()}`;

    const data = await this.fetch<Timeline[] | { timelines?: Timeline[] } | null>(endpoint);
    if (Array.isArray(data)) return data;
    return data?.timelines ?? [];
  }

  /**
   * Search arcs semantically and/or by calendar window.
   * At least one of query/from/to must be provided (else the backend 400s).
   * @endpoint POST /v1/timelines/arc/search
   */
  async searchArcs(body: ArcSearchRequest): Promise<ArcSearchResponse> {
    const data = await this.fetch<ArcSearchResponse | null>('/v1/timelines/arc/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return { arcs: data?.arcs ?? [] };
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

  /**
   * Get dream cycle reports
   * @endpoint GET /v1/consolidation/dream-cycle/reports
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getDreamCycleReports(userId?: string, limit: number = 10): Promise<any[]> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    params.set('limit', String(limit));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await this.fetch<any>(`/v1/consolidation/dream-cycle/reports?${params}`);
    return Array.isArray(data) ? data : data.reports || [];
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
    const rawSessions = Array.isArray(data) ? data : data.sessions ?? [];
    return {
      sessions: rawSessions.map((session: Record<string, unknown>) => normalizeAgentSession(session)),
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
  // FOG INDEX
  // ==========================================================================

  async getFogIndex(userId?: string): Promise<import('./types').FogIndexResult> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.fetch(`/v1/fog-index${params}`);
  }

  async getFogIndexHistory(limit = 30): Promise<import('./types').FogIndexHistory[]> {
    return this.fetch(`/v1/fog-index/history?limit=${limit}`);
  }

  // ==========================================================================
  // HEALTH METRICS
  // ==========================================================================

  async getHealthMetrics(): Promise<import('./types').HealthMetricsResult> {
    return this.fetch('/v1/health/metrics');
  }

  async refreshHealthMetrics(): Promise<void> {
    return this.fetch('/v1/health/metrics/refresh', { method: 'POST' });
  }

  // ==========================================================================
  // AGENT IDENTITY (Phase 2)
  // ==========================================================================

  async getAgents(): Promise<{ agents: import('./types').AgentSummary[] }> {
    return this.fetch('/v1/agents');
  }

  async getAgentIdentity(agentId: string): Promise<import('./types').AgentIdentity> {
    return this.fetch(`/v1/agents/${agentId}/identity`);
  }

  async getAgentTrustNarrative(agentId: string): Promise<import('./types').AgentTrustNarrative> {
    return this.fetch(`/v1/agents/${agentId}/trust/narrative`);
  }

  async exportAgentIdentity(agentId: string): Promise<Blob> {
    const url = `${this.baseUrl}/v1/agents/${agentId}/export`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['X-AM-API-Key'] = this.apiKey;
    else if (typeof window !== 'undefined') {
      const token = localStorage.getItem('engram_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Export failed: ${res.status}`);
    return res.blob();
  }

  async importAgentIdentity(agentId: string, data: unknown): Promise<{ success: boolean; message?: string }> {
    return this.fetch(`/v1/agents/${agentId}/import`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
