/**
 * Engram Code API Client
 * 
 * Client for the engram-code service
 * 
 * ENDPOINTS:
 * - GET /v1/projects — list projects
 * - POST /v1/projects — create project
 * - GET /v1/projects/:id — get project
 * - GET /v1/projects/:id/stats — get stats
 * - DELETE /v1/projects/:id — delete project
 * - POST /v1/projects/:id/ingest — trigger ingestion
 * - GET /v1/projects/:id/jobs — list ingest jobs
 * - POST /v1/search — search code
 */

import {
  CodeProject,
  CreateProjectDto,
  ProjectStats,
  SearchOptions,
  SearchResponse,
  SearchResult,
  IngestResult,
  IngestOptions,
  IngestJob,
  FileTreeNode,
  EngramCodeError,
} from '@/types/code';

// ============================================================================
// CONFIGURATION
// ============================================================================

const getConfig = () => ({
  baseUrl: process.env.NEXT_PUBLIC_ENGRAM_CODE_URL ||
           process.env.ENGRAM_CODE_URL ||
           'https://code.openengram.ai',
});

// ============================================================================
// CLIENT CLASS
// ============================================================================

export class EngramCodeClient {
  private baseUrl: string;

  constructor(options?: { baseUrl?: string }) {
    const config = getConfig();
    this.baseUrl = options?.baseUrl ?? config.baseUrl;
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

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
      throw new EngramCodeError(
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
  // PROJECT CRUD
  // ==========================================================================

  /**
   * List all code projects
   * @endpoint GET /v1/projects
   */
  async listProjects(): Promise<CodeProject[]> {
    return this.fetch<CodeProject[]>('/v1/projects');
  }

  /**
   * Get a single project by ID
   * @endpoint GET /v1/projects/:id
   */
  async getProject(id: string): Promise<CodeProject> {
    return this.fetch<CodeProject>(`/v1/projects/${id}`);
  }

  /**
   * Create a new code project
   * @endpoint POST /v1/projects
   */
  async createProject(data: CreateProjectDto): Promise<CodeProject> {
    return this.fetch<CodeProject>('/v1/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a project and all its chunks
   * @endpoint DELETE /v1/projects/:id
   */
  async deleteProject(id: string): Promise<void> {
    await this.fetch<void>(`/v1/projects/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get project statistics
   * @endpoint GET /v1/projects/:id/stats
   */
  async getProjectStats(id: string): Promise<ProjectStats> {
    const response = await this.fetch<{
      project: CodeProject;
      stats: {
        totalChunks: number;
        fileCount: number;
        byType: Record<string, number>;
      };
    }>(`/v1/projects/${id}/stats`);
    
    // Transform API response to expected format
    return {
      totalFiles: response.stats.fileCount,
      totalChunks: response.stats.totalChunks,
      chunksByType: response.stats.byType,
      chunksByLanguage: {}, // Not returned by API currently
    };
  }

  // ==========================================================================
  // INGESTION
  // ==========================================================================

  /**
   * Trigger project ingestion
   * @endpoint POST /v1/projects/:id/ingest
   */
  async ingestProject(id: string, options?: IngestOptions): Promise<IngestResult> {
    return this.fetch<IngestResult>(`/v1/projects/${id}/ingest`, {
      method: 'POST',
      body: JSON.stringify(options ?? {}),
    });
  }

  /**
   * List ingestion jobs for a project
   * @endpoint GET /v1/projects/:id/jobs
   */
  async listIngestJobs(projectId: string): Promise<IngestJob[]> {
    return this.fetch<IngestJob[]>(`/v1/projects/${projectId}/jobs`);
  }

  /**
   * Get ingestion job status
   * @endpoint GET /v1/projects/:projectId/jobs/:jobId
   */
  async getIngestJob(projectId: string, jobId: string): Promise<IngestJob> {
    return this.fetch<IngestJob>(`/v1/projects/${projectId}/jobs/${jobId}`);
  }

  // ==========================================================================
  // SEARCH
  // ==========================================================================

  /**
   * Semantic search for code
   * @endpoint POST /v1/search
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResponse> {
    const response = await this.fetch<{
      results: SearchResult[];
      query: string;
      totalFound: number;
      searchTimeMs: number;
    }>('/v1/search', {
      method: 'POST',
      body: JSON.stringify({ query, ...options }),
    });
    
    // Map searchTimeMs to latencyMs for dashboard compatibility
    return {
      ...response,
      latencyMs: response.searchTimeMs,
    };
  }

  // ==========================================================================
  // FILE TREE
  // ==========================================================================

  /**
   * Get file tree for a project
   * @endpoint GET /v1/projects/:id/files
   */
  async getFileTree(projectId: string): Promise<FileTreeNode[]> {
    return this.fetch<FileTreeNode[]>(`/v1/projects/${projectId}/files`);
  }

  // ==========================================================================
  // CHUNKS
  // ==========================================================================

  /**
   * Get chunks for a file
   * @endpoint GET /v1/projects/:id/chunks?file=path
   */
  async getChunksForFile(projectId: string, filePath: string): Promise<import('@/types/code').CodeChunk[]> {
    const params = new URLSearchParams({ file: filePath });
    return this.fetch<import('@/types/code').CodeChunk[]>(`/v1/projects/${projectId}/chunks?${params}`);
  }

  /**
   * Get a single chunk by ID
   * @endpoint GET /v1/chunks/:id
   */
  async getChunk(id: string): Promise<import('@/types/code').CodeChunk> {
    return this.fetch<import('@/types/code').CodeChunk>(`/v1/chunks/${id}`);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Default client instance using environment configuration
 */
export const engramCode = new EngramCodeClient();

/**
 * Create a new client with custom configuration
 */
export function createEngramCodeClient(options?: { baseUrl?: string }): EngramCodeClient {
  return new EngramCodeClient(options);
}

// ============================================================================
// CONVENIENCE RE-EXPORTS
// ============================================================================

export * from '@/types/code';
