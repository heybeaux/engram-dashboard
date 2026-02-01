const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Memory {
  id: string;
  content: string;
  userId: string;
  layer: "IDENTITY" | "PROJECT" | "SESSION" | "TASK";
  importance: number;
  confidence: number;
  createdAt: string;
  retrievalCount: number;
  extraction?: {
    who?: string;
    what?: string;
    when?: string;
    where?: string;
    why?: string;
    how?: string;
    topics?: string[];
    entities?: string[];
  };
}

export interface User {
  id: string;
  memoryCount: number;
  lastActive: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyHint: string;
  createdAt: string;
}

export interface DashboardStats {
  totalMemories: number;
  memoryTrend: number;
  totalUsers: number;
  userTrend: number;
  healthScore: number;
  memoryByLayer: {
    layer: string;
    count: number;
    percentage: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    timestamp: string;
  }[];
  apiRequests: {
    date: string;
    requests: number;
  }[];
}

class EngramApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Dashboard
  async getStats(): Promise<DashboardStats> {
    return this.fetch<DashboardStats>("/api/v1/stats");
  }

  // Memories
  async getMemories(params?: {
    userId?: string;
    layer?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ memories: Memory[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set("userId", params.userId);
    if (params?.layer) searchParams.set("layer", params.layer);
    if (params?.search) searchParams.set("q", params.search);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));

    return this.fetch(`/api/v1/memories?${searchParams}`);
  }

  async getMemory(id: string): Promise<Memory> {
    return this.fetch<Memory>(`/api/v1/memories/${id}`);
  }

  async deleteMemory(id: string): Promise<void> {
    await this.fetch(`/api/v1/memories/${id}`, { method: "DELETE" });
  }

  // Users
  async getUsers(): Promise<{ users: User[] }> {
    return this.fetch("/api/v1/users");
  }

  async getUser(id: string): Promise<User & { memories: Memory[] }> {
    return this.fetch(`/api/v1/users/${id}`);
  }

  // API Keys
  async getApiKeys(): Promise<{ keys: ApiKey[] }> {
    return this.fetch("/api/v1/api-keys");
  }

  async createApiKey(name: string): Promise<{ key: string; id: string }> {
    return this.fetch("/api/v1/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async revokeApiKey(id: string): Promise<void> {
    await this.fetch(`/api/v1/api-keys/${id}`, { method: "DELETE" });
  }
}

export const api = new EngramApi();
