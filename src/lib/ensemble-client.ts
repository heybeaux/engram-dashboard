/**
 * Ensemble API Client
 * 
 * Client methods for multi-model ensemble and re-embedding endpoints.
 */

import {
  EnsembleStatusResponse,
  ModelRegistryEntry,
  MemoryEmbeddingsResponse,
  ReembedJob,
  ReembedJobStatusResponse,
  EmbeddingCoverageResponse,
  ABTestResults,
  TriggerReembedRequest,
  EnrichedMemoryPreview,
  ModelId,
} from './ensemble-types';
import { EngramApiError } from './types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const getConfig = () => ({
  baseUrl: process.env.NEXT_PUBLIC_ENGRAM_API_URL ||
           process.env.ENGRAM_API_URL ||
           'http://localhost:3001',
  apiKey: process.env.NEXT_PUBLIC_ENGRAM_API_KEY ||
          process.env.ENGRAM_API_KEY || '',
});

// ============================================================================
// HELPER
// ============================================================================

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const config = getConfig();
  const url = `${config.baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (config.apiKey) {
    headers['X-AM-API-Key'] = config.apiKey;
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ============================================================================
// ENSEMBLE STATUS
// ============================================================================

/**
 * Get ensemble retrieval status and configuration
 * @endpoint GET /ensemble/status
 */
export async function getEnsembleStatus(): Promise<EnsembleStatusResponse> {
  return apiFetch<EnsembleStatusResponse>('/v1/ensemble/status');
}

// ============================================================================
// MODEL REGISTRY
// ============================================================================

/**
 * Get all registered models
 * @endpoint GET /ensemble/models
 * @status PROPOSED - Not yet implemented
 */
export async function getRegisteredModels(): Promise<ModelRegistryEntry[]> {
  try {
    return await apiFetch<ModelRegistryEntry[]>('/v1/ensemble/models');
  } catch (error) {
    if (error instanceof EngramApiError && error.statusCode === 404) {
      console.warn('GET /ensemble/models not implemented. Using status fallback.');
      // Fall back to extracting from status
      const status = await getEnsembleStatus();
      return status.models.map(modelId => ({
        modelId,
        status: 'active' as const,
        addedAt: new Date().toISOString(),
        weight: status.config.weights[modelId] ?? 1.0,
        qualityMetrics: {
          sampleQueries: 0,
          avgRankContribution: 0,
          uniqueHits: 0,
          correlationWithGoldStandard: 0,
        },
        promotionThresholds: {
          minSampleQueries: 1000,
          minRankContribution: 0.15,
          minCorrelation: 0.80,
        },
      }));
    }
    throw error;
  }
}

/**
 * Update model weight
 * @endpoint PATCH /ensemble/models/:modelId/weight
 * @status PROPOSED - Not yet implemented
 */
export async function updateModelWeight(
  modelId: ModelId,
  weight: number
): Promise<void> {
  await apiFetch(`/ensemble/models/${modelId}/weight`, {
    method: 'PATCH',
    body: JSON.stringify({ weight }),
  });
}

/**
 * Update model status
 * @endpoint PATCH /ensemble/models/:modelId/status
 * @status PROPOSED - Not yet implemented
 */
export async function updateModelStatus(
  modelId: ModelId,
  status: 'active' | 'shadow' | 'deprecated'
): Promise<void> {
  await apiFetch(`/ensemble/models/${modelId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// PER-MEMORY EMBEDDING STATUS
// ============================================================================

/**
 * Get embedding status for a specific memory
 * @endpoint GET /ensemble/memories/:memoryId/embeddings
 * @status PROPOSED - Not yet implemented
 */
export async function getMemoryEmbeddings(
  memoryId: string
): Promise<MemoryEmbeddingsResponse> {
  try {
    return await apiFetch<MemoryEmbeddingsResponse>(
      `/ensemble/memories/${memoryId}/embeddings`
    );
  } catch (error) {
    if (error instanceof EngramApiError && error.statusCode === 404) {
      console.warn('GET /ensemble/memories/:id/embeddings not implemented. Returning mock data.');
      // Return mock data showing endpoint not implemented
      const status = await getEnsembleStatus();
      return {
        memoryId,
        embeddings: status.models.map(model => ({
          model,
          status: 'pending' as const,
          dimensions: undefined,
          embeddedAt: undefined,
        })),
        totalModels: status.models.length,
        embeddedCount: 0,
        pendingCount: status.models.length,
        failedCount: 0,
      };
    }
    throw error;
  }
}

// ============================================================================
// EMBEDDING COVERAGE STATS
// ============================================================================

/**
 * Get embedding coverage statistics
 * @endpoint GET /ensemble/coverage
 * @status PROPOSED - Not yet implemented
 */
export async function getEmbeddingCoverage(): Promise<EmbeddingCoverageResponse> {
  try {
    return await apiFetch<EmbeddingCoverageResponse>('/v1/ensemble/coverage');
  } catch (error) {
    if (error instanceof EngramApiError && error.statusCode === 404) {
      console.warn('GET /ensemble/coverage not implemented. Returning mock data.');
      const status = await getEnsembleStatus();
      return {
        totalMemories: 0,
        modelsConfigured: status.models.length,
        fullCoverageCount: 0,
        fullCoveragePercentage: 0,
        perModel: status.models.map(model => ({
          model,
          status: 'active' as const,
          embeddedCount: 0,
          totalMemories: 0,
          coveragePercentage: 0,
        })),
      };
    }
    throw error;
  }
}

// ============================================================================
// A/B TEST RESULTS
// ============================================================================

/**
 * Get A/B test results for model comparison
 * @endpoint GET /ensemble/ab-results
 * @status PROPOSED - Not yet implemented
 */
export async function getABTestResults(params?: {
  start?: string;
  end?: string;
}): Promise<ABTestResults | null> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.start) searchParams.set('start', params.start);
    if (params?.end) searchParams.set('end', params.end);
    const query = searchParams.toString();
    const endpoint = query ? `/ensemble/ab-results?${query}` : '/v1/ensemble/ab-results';
    return await apiFetch<ABTestResults>(endpoint);
  } catch (error) {
    if (error instanceof EngramApiError && error.statusCode === 404) {
      console.warn('GET /ensemble/ab-results not implemented.');
      return null;
    }
    throw error;
  }
}

// ============================================================================
// RE-EMBEDDING
// ============================================================================

/**
 * Check if re-embedding is enabled
 * @endpoint GET /v1/reembedding/enabled
 */
export async function isReembeddingEnabled(): Promise<{ enabled: boolean; version: string }> {
  return apiFetch<{ enabled: boolean; version: string }>('/v1/reembedding/enabled');
}

/**
 * Get current re-embedding job status
 * @endpoint GET /v1/reembedding/status
 */
export async function getCurrentReembedStatus(): Promise<ReembedJobStatusResponse | null> {
  try {
    return await apiFetch<ReembedJobStatusResponse>('/v1/reembedding/status');
  } catch (error) {
    if (error instanceof EngramApiError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Get status of a specific re-embedding job
 * @endpoint GET /v1/reembedding/status/:jobId
 */
export async function getReembedJobStatus(
  jobId: string
): Promise<ReembedJobStatusResponse | null> {
  try {
    return await apiFetch<ReembedJobStatusResponse>(`/v1/reembedding/status/${jobId}`);
  } catch (error) {
    if (error instanceof EngramApiError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * List all re-embedding jobs
 * @endpoint GET /v1/reembedding/jobs
 */
export async function listReembedJobs(limit?: number): Promise<ReembedJob[]> {
  const endpoint = limit ? `/v1/reembedding/jobs?limit=${limit}` : '/v1/reembedding/jobs';
  return apiFetch<ReembedJob[]>(endpoint);
}

/**
 * Trigger a batch re-embedding job
 * @endpoint POST /v1/reembedding/run
 */
export async function triggerReembed(
  request: TriggerReembedRequest
): Promise<ReembedJob> {
  return apiFetch<ReembedJob>('/v1/reembedding/run', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Preview enrichment for a single memory
 * @endpoint GET /v1/reembedding/preview/:memoryId
 */
export async function previewEnrichment(
  memoryId: string
): Promise<EnrichedMemoryPreview | null> {
  try {
    return await apiFetch<EnrichedMemoryPreview>(
      `/v1/reembedding/preview/${memoryId}`
    );
  } catch (error) {
    if (error instanceof EngramApiError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Re-embed a single memory
 * @endpoint POST /v1/reembedding/memory/:memoryId
 */
export async function reembedMemory(
  memoryId: string,
  dryRun?: boolean
): Promise<EnrichedMemoryPreview> {
  const endpoint = dryRun
    ? `/v1/reembedding/memory/${memoryId}?dryRun=true`
    : `/v1/reembedding/memory/${memoryId}`;
  return apiFetch<EnrichedMemoryPreview>(endpoint, {
    method: 'POST',
  });
}

// ============================================================================
// EXPORT ALL
// ============================================================================

// ============================================================================
// DRIFT DETECTION
// ============================================================================

export interface DriftSnapshotResponse {
  id: string;
  modelId: string;
  avgDrift: number;
  maxDrift: number;
  sampleCount: number;
  alertLevel: string;
  createdAt: string;
}

export interface DriftLatestResponse {
  perModel: Array<{
    modelId: string;
    avgDrift: number;
    maxDrift: number;
    sampleCount: number;
    alertLevel: string;
    createdAt: string;
  }>;
  thresholds: { drift: number; alert: number };
}

export interface DriftHistoryResponse {
  snapshots: DriftSnapshotResponse[];
  count: number;
}

export interface DriftAnalyzeResponse {
  snapshots: Array<{
    modelId: string;
    avgDrift: number;
    maxDrift: number;
    sampleCount: number;
    alertLevel: string;
  }>;
  summary: string;
}

/**
 * Get latest drift per model
 */
export async function getLatestDrift(): Promise<DriftLatestResponse> {
  return apiFetch<DriftLatestResponse>('/v1/ensemble/drift');
}

/**
 * Get drift history for charting
 */
export async function getDriftHistory(params?: {
  modelId?: string;
  limit?: number;
  since?: string;
}): Promise<DriftHistoryResponse> {
  const searchParams = new URLSearchParams();
  if (params?.modelId) searchParams.set('modelId', params.modelId);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.since) searchParams.set('since', params.since);
  const query = searchParams.toString();
  return apiFetch<DriftHistoryResponse>(query ? `/ensemble/drift/history?${query}` : '/v1/ensemble/drift/history');
}

/**
 * Trigger drift analysis
 */
export async function analyzeDrift(): Promise<DriftAnalyzeResponse> {
  return apiFetch<DriftAnalyzeResponse>('/v1/ensemble/drift/analyze', {
    method: 'POST',
  });
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const ensembleApi = {
  getStatus: getEnsembleStatus,
  getModels: getRegisteredModels,
  updateModelWeight,
  updateModelStatus,
  getMemoryEmbeddings,
  getCoverage: getEmbeddingCoverage,
  getABResults: getABTestResults,
  reembedding: {
    isEnabled: isReembeddingEnabled,
    getCurrentStatus: getCurrentReembedStatus,
    getJobStatus: getReembedJobStatus,
    listJobs: listReembedJobs,
    trigger: triggerReembed,
    previewEnrichment,
    reembedMemory,
  },
  drift: {
    getLatest: getLatestDrift,
    getHistory: getDriftHistory,
    analyze: analyzeDrift,
  },
};
