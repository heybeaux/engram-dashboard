/**
 * @deprecated Use engram-client.ts instead
 *
 * This file is kept for backwards compatibility.
 * Import from './engram-client' for the full typed client.
 */

import { engram, EngramClient } from './engram-client';
import type {
  Memory,
  MemoryWithScore,
  MemoryLayer,
  User,
  UserWithStats,
  ApiKey,
  DashboardStats,
  QueryResult,
} from './types';

// Re-export types for backwards compatibility
export type { Memory, MemoryWithScore, MemoryLayer, User, ApiKey, DashboardStats };

// Legacy API wrapper for backwards compatibility with existing components
class LegacyEngramApi {
  private client: EngramClient;

  constructor() {
    this.client = engram;
  }

  // Dashboard
  async getStats(): Promise<DashboardStats> {
    return this.client.getStats();
  }

  // Memories
  async getMemories(params?: {
    userId?: string;
    layer?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ memories: Memory[]; total: number }> {
    const result = await this.client.getMemories({
      ...params,
      layer: params?.layer as MemoryLayer,
    });
    return {
      memories: result.memories,
      total: result.total,
    };
  }

  async getMemory(id: string): Promise<Memory> {
    const memory = await this.client.getMemory(id);
    if (!memory) {
      throw new Error(`Memory ${id} not found`);
    }
    return memory;
  }

  async deleteMemory(id: string): Promise<void> {
    await this.client.deleteMemory(id);
  }

  // Search
  async queryMemories(
    query: string,
    options?: { limit?: number; layers?: MemoryLayer[] }
  ): Promise<QueryResult> {
    return this.client.searchMemories(query, options);
  }

  // Users
  async getUsers(): Promise<{ users: UserWithStats[] }> {
    const result = await this.client.getUsers();
    return { users: result.users };
  }

  async getUser(id: string): Promise<UserWithStats & { memories: Memory[] }> {
    const user = await this.client.getUser(id);
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    return {
      id: user.id,
      externalId: user.externalId,
      agentId: user.agentId,
      memoryCount: user.memoryCount,
      lastActive: user.lastActive ?? '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      memories: user.memories,
    };
  }

  // API Keys
  async getApiKeys(): Promise<{ keys: ApiKey[] }> {
    return this.client.getApiKeys();
  }

  async createApiKey(name: string): Promise<{ key: string; id: string }> {
    return this.client.createApiKey(name);
  }

  async revokeApiKey(id: string): Promise<void> {
    await this.client.revokeApiKey(id);
  }
}

/**
 * @deprecated Use `engram` from './engram-client' instead
 */
export const api = new LegacyEngramApi();
