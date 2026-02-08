/**
 * Engram Code Types
 * Types for the engram-code service (localhost:3002)
 */

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface CodeProject {
  id: string;
  name: string;
  rootPath: string;
  languages: string[];
  createdAt: string;
  updatedAt: string;
  lastIngestedAt: string | null;
}

export interface CreateProjectDto {
  name: string;
  rootPath: string;
  languages?: string[];
}

export interface ProjectStats {
  totalFiles: number;
  totalChunks: number;
  chunksByType: Record<string, number>;
  chunksByLanguage: Record<string, number>;
}

// ============================================================================
// CHUNK TYPES
// ============================================================================

export type ChunkType = 
  | 'file'
  | 'class'
  | 'method'
  | 'function'
  | 'interface'
  | 'type'
  | 'enum'
  | 'constant'
  | 'import'
  | 'export'
  | 'unknown';

export interface CodeChunk {
  id: string;
  projectId: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  content: string;
  language: string;
  chunkType: ChunkType;
  name: string;
  parentName?: string;
  dependencies: string[];
  checksum: string;
  createdAt: string;
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

export interface SearchOptions {
  projectId?: string;
  language?: string;
  chunkType?: ChunkType;
  limit?: number;
  minScore?: number;
}

export interface SearchResult {
  chunk: CodeChunk;
  score: number;
  highlights?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  totalFound: number;
  /** API returns searchTimeMs, we alias it as latencyMs */
  latencyMs: number;
}

// ============================================================================
// INGESTION TYPES
// ============================================================================

export interface IngestOptions {
  force?: boolean;
  dryRun?: boolean;
}

export interface IngestResult {
  projectId: string;
  filesProcessed: number;
  chunksCreated: number;
  chunksUpdated: number;
  chunksDeleted: number;
  errors: string[];
  durationMs: number;
}

export interface IngestJob {
  jobId: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  filesProcessed: number;
  totalFiles: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

// ============================================================================
// FILE TREE TYPES
// ============================================================================

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  language?: string;
  chunkCount?: number;
  children?: FileTreeNode[];
}

// ============================================================================
// API ERROR
// ============================================================================

export class EngramCodeError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'EngramCodeError';
  }
}
