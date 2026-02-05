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
} from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const getConfig = () => ({
  baseUrl: process.env.NEXT_PUBLIC_ENGRAM_API_URL ||
           process.env.ENGRAM_API_URL ||
           'http://localhost:3001',
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
    const userId = options?.userId ?? this.defaultUserId;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers['X-AM-API-Key'] = this.apiKey;
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
   * @endpoint GET /v1/memories/graph
   */
  async getGraphData(params?: { limit?: number }): Promise<GraphData> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/v1/memories/graph?${queryString}` : '/v1/memories/graph';
    return this.fetch<GraphData>(endpoint);
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
      ],
      recentActivity: [],
      apiRequests: [],
    };
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
