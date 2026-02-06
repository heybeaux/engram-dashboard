/**
 * Multi-Model Ensemble Types
 * 
 * Types for multi-model embedding visibility and management.
 */

// ============================================================================
// Model Configuration Types
// ============================================================================

export type ModelId = 'bge-base' | 'nomic' | 'minilm' | 'gte-base';
export type ModelStatus = 'active' | 'shadow' | 'deprecated' | 'disabled';
export type ReembedJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ReembedMode = 'incremental' | 'full';

export interface ModelConfig {
  id: ModelId;
  dimensions: number;
  namespace: string;
  weight: number;
  maxTokens: number;
  queryPrefix?: string;
  documentPrefix?: string;
}

export const MODEL_CONFIGS: Record<ModelId, ModelConfig> = {
  'bge-base': {
    id: 'bge-base',
    dimensions: 768,
    namespace: 'bge-base',
    weight: 1.0,
    maxTokens: 512,
  },
  'nomic': {
    id: 'nomic',
    dimensions: 768,
    namespace: 'nomic',
    weight: 1.0,
    maxTokens: 8192,
    queryPrefix: 'search_query: ',
    documentPrefix: 'search_document: ',
  },
  'minilm': {
    id: 'minilm',
    dimensions: 384,
    namespace: 'minilm',
    weight: 1.0,
    maxTokens: 256,
  },
  'gte-base': {
    id: 'gte-base',
    dimensions: 768,
    namespace: 'gte-base',
    weight: 1.0,
    maxTokens: 512,
  },
};

// ============================================================================
// Ensemble Status Types
// ============================================================================

export interface EnsembleConfig {
  enabled: boolean;
  models: ModelId[];
  weights: Record<ModelId, number>;
  rrfK: number;
  localEmbedUrl: string;
  consensusBoostEnabled: boolean;
  consensusBoostFactor: number;
}

export interface EnsembleStatusResponse {
  enabled: boolean;
  models: ModelId[];
  config: EnsembleConfig;
}

// ============================================================================
// Model Registry Types
// ============================================================================

export interface ModelQualityMetrics {
  sampleQueries: number;
  avgRankContribution: number;
  uniqueHits: number;
  correlationWithGoldStandard: number;
}

export interface PromotionThresholds {
  minSampleQueries: number;
  minRankContribution: number;
  minCorrelation: number;
}

export interface ModelRegistryEntry {
  modelId: ModelId;
  status: ModelStatus;
  addedAt: string;
  promotedAt?: string;
  deprecatedAt?: string;
  weight: number;
  queryTypeWeights?: Record<string, number>;
  qualityMetrics: ModelQualityMetrics;
  promotionThresholds: PromotionThresholds;
}

// ============================================================================
// Per-Memory Embedding Status Types
// ============================================================================

export type EmbeddingStatus = 'embedded' | 'pending' | 'failed' | 'missing';

export interface MemoryEmbeddingInfo {
  model: ModelId;
  status: EmbeddingStatus;
  dimensions?: number;
  embeddedAt?: string;
  vectorId?: string;
  error?: string;
  driftScore?: number;
  previousVersion?: string;
}

export interface MemoryEmbeddingsResponse {
  memoryId: string;
  embeddings: MemoryEmbeddingInfo[];
  totalModels: number;
  embeddedCount: number;
  pendingCount: number;
  failedCount: number;
}

// ============================================================================
// Re-embedding Job Types
// ============================================================================

export interface ReembedProgress {
  totalMemories: number;
  processedMemories: number;
  currentBatch: number;
  totalBatches: number;
  currentModel: ModelId | null;
}

export interface ModelMetrics {
  memoriesProcessed: number;
  totalDurationMs: number;
  avgLatencyMs: number;
  errors: number;
}

export interface DriftSummary {
  measured: boolean;
  avgCosineDrift: number;
  maxCosineDrift: number;
  memoriesWithHighDrift: number;
  driftThreshold: number;
  byModel: Record<ModelId, { avg: number; max: number; flagged: number }>;
}

export interface ReembedMetrics {
  totalDurationMs: number;
  avgBatchDurationMs: number;
  memoriesProcessed: number;
  memoriesSkipped: number;
  memoriesFailed: number;
  perModel: Record<ModelId, ModelMetrics>;
  drift: DriftSummary;
}

export interface ReembedJob {
  jobId: string;
  status: ReembedJobStatus;
  mode: ReembedMode;
  models: ModelId[];
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  processedMemories: number;
  totalMemories: number;
  failedMemories: number;
  avgDrift?: number;
  maxDrift?: number;
  driftFlags?: number;
  error?: string;
  metrics?: ReembedMetrics;
}

export interface ReembedJobStatusResponse {
  jobId: string;
  status: ReembedJobStatus;
  progress: ReembedProgress;
  estimatedCompletion: string | null;
  metrics: ReembedMetrics;
}

// ============================================================================
// Embedding Coverage Stats Types
// ============================================================================

export interface ModelCoverageStats {
  model: ModelId;
  status: ModelStatus;
  embeddedCount: number;
  totalMemories: number;
  coveragePercentage: number;
}

export interface EmbeddingCoverageResponse {
  totalMemories: number;
  modelsConfigured: number;
  fullCoverageCount: number;
  fullCoveragePercentage: number;
  perModel: ModelCoverageStats[];
}

// ============================================================================
// A/B Test Results Types
// ============================================================================

export interface ModelHitRate {
  model: ModelId;
  totalQueries: number;
  contributedHits: number;
  uniqueHits: number;
  hitRate: number;
  avgRankContribution: number;
}

export interface QueryTypePerformance {
  queryType: string;
  topModel: ModelId;
  modelPerformance: Record<ModelId, {
    hitRate: number;
    avgRank: number;
    contribution: number;
  }>;
}

export interface ABTestResults {
  period: {
    start: string;
    end: string;
  };
  totalQueries: number;
  modelHitRates: ModelHitRate[];
  queryTypeBreakdown: QueryTypePerformance[];
  consensusRate: number;
  fusionImprovement: number;
}

// ============================================================================
// Trigger Re-embed Request
// ============================================================================

export interface TriggerReembedRequest {
  mode: ReembedMode;
  models?: ModelId[];
  memoryIds?: string[];
  dryRun?: boolean;
}

// ============================================================================
// Preview Enrichment Response
// ============================================================================

export interface EnrichedMemoryPreview {
  memoryId: string;
  originalContent: string;
  enrichedContent: string;
  contextAdded: string[];
  tokensOriginal: number;
  tokensEnriched: number;
  models: ModelId[];
}
