import { Page, Route } from "@playwright/test";

export type ApiCall = {
  method: string;
  path: string;
  status: number;
};

const now = "2026-07-01T14:30:00.000Z";

const user = {
  id: "test-user",
  externalId: "test-user",
  agentId: "test-agent",
  memoryCount: 1,
  lastActive: now,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
};

const memory = {
  id: "test-memory",
  userId: "test-user",
  projectId: null,
  sessionId: null,
  raw: "Test memory used by Playwright endpoint coverage.",
  layer: "SESSION",
  source: "AGENT_OBSERVATION",
  importanceHint: null,
  importanceScore: 0.7,
  confidence: 0.9,
  sessionPosition: null,
  embeddingId: null,
  embeddingModel: null,
  retrievalCount: 0,
  lastRetrievedAt: null,
  usedCount: 0,
  lastUsedAt: null,
  consolidated: false,
  consolidatedAt: null,
  supersededById: null,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
  extraction: null,
};

const agent = {
  id: "test-agent",
  agentId: "test-agent",
  name: "Test Agent",
  type: "assistant",
  description: "Playwright fixture agent",
  capabilities: ["memory", "analysis"],
  memoryCount: 1,
  taskCount: 1,
  successRate: 1,
  trustScore: 80,
  lastActive: now,
  lastActiveAt: now,
  status: "active",
  createdAt: now,
  updatedAt: now,
  metadata: {},
};

const account = {
  id: "test-account",
  email: "qa@example.com",
  name: "QA Account",
  plan: "free",
  usage: { memoriesUsed: 1, apiCallsToday: 2 },
  limits: { memories: 1000, apiCallsPerDay: 100, agents: 3, usersPerAgent: 10 },
  agents: [{ id: "test-agent", name: "Test Agent" }],
};

const trustProfile = {
  agentId: "test-agent",
  agentName: "Test Agent",
  overallTrust: 80,
  domains: [
    { domain: "analysis", score: 80, trend: "stable", sampleCount: 1 },
  ],
  history: [
    { date: now, overall: 80, domains: { analysis: 80 } },
  ],
};

const contract = {
  id: "test-contract",
  title: "Playwright delegation",
  description: "Fixture contract",
  delegatorId: "test-agent",
  delegatorName: "Test Agent",
  delegateeId: "test-agent",
  delegateeName: "Test Agent",
  status: "active",
  domain: "qa",
  constraints: [],
  createdAt: now,
  updatedAt: now,
  isTemplate: false,
};

const challenge = {
  id: "test-challenge",
  type: "unsafe",
  title: "Fixture challenge",
  description: "Playwright fixture challenge",
  status: "open",
  raisedBy: "test-agent",
  targetAgentId: "test-agent",
  createdAt: now,
  updatedAt: now,
};

const entityProfile = {
  id: "test-profile",
  name: "Test Profile",
  type: "PERSON",
  normalizedName: "test profile",
  aliases: [],
  description: "Playwright fixture profile",
  attributes: [],
  embedding: null,
  createdAt: now,
  updatedAt: now,
};

const sessionCamel = {
  id: "session-id",
  sessionKey: "test-session",
  label: "Playwright session",
  status: "COMPLETED",
  parentSessionKey: null,
  taskDescription: "Endpoint coverage",
  startedAt: now,
  endedAt: null,
  createdAt: now,
  updatedAt: now,
};

const sessionSnake = {
  id: "session-id",
  session_key: "test-session",
  label: "Playwright session",
  status: "COMPLETED",
  parent_session_key: null,
  task_description: "Endpoint coverage",
  started_at: now,
  ended_at: null,
  created_at: now,
  updated_at: now,
};

function json(status: number, body: unknown) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  };
}

function normalizePath(url: string): string {
  const parsed = new URL(url);
  if (parsed.pathname.startsWith("/api/engram/")) {
    return `/${parsed.pathname.slice("/api/engram/".length)}${parsed.search}`;
  }
  return `${parsed.pathname}${parsed.search}`;
}

function routeBody(method: string, pathWithQuery: string): unknown {
  const path = pathWithQuery.split("?")[0];

  if (path === "/v1/health") return { status: "ok", uptime: 1 };
  if (path === "/v1/instance/info") return { edition: "cloud", version: "test", apiUrl: "mocked" };
  if (path === "/v1/auth/setup-status") return { configured: true, setupRequired: false };
  if (path.startsWith("/v1/auth/")) return { ok: true, token: "mock-token", user };
  if (path === "/v1/stats") {
    return {
      totalMemories: 1,
      memoryTrend: 0,
      totalUsers: 1,
      userTrend: 0,
      avgImportance: 0.7,
      healthScore: 99.5,
      memoryByLayer: [{ layer: "SESSION", count: 1, percentage: 100 }],
      recentActivity: [{ id: "activity-1", action: "Created test memory", time: now }],
      topLayers: [{ layer: "SESSION", count: 1, percentage: 100 }],
      apiRequests: [],
    };
  }
  if (path === "/v1/account") return account;
  if (path === "/v1/account/api-keys") return { keys: [] };
  if (path === "/v1/account/instance-keys") return [];
  if (path === "/v1/billing/checkout") return { url: "http://localhost:3000/billing/success" };
  if (path === "/v1/billing/portal") return { url: "http://localhost:3000/billing" };
  if (path === "/v1/admin/accounts") return { accounts: [], total: 0 };

  if (path === "/v1/memories/graph") return { nodes: [], edges: [], entities: [], stats: { human: 0, agent: 0 } };
  if (path === "/v1/memories/query") return { memories: [memory], queryTokens: 1, latencyMs: 1 };
  if (path === "/v1/memories/test-memory") return memory;
  if (path === "/v1/memories/test-memory/attribution") return { memoryId: "test-memory", createdBySession: sessionCamel, accessLog: [], pools: [] };
  if (path === "/v1/memories") return { memories: [memory], total: 1 };
  if (path === "/v1/users") return { users: [user], total: 1 };

  if (path === "/v1/agent-sessions") return { sessions: [sessionSnake], total: 1 };
  if (path === "/v1/agent-sessions/test-session/summary") {
    return {
      sessionKey: "test-session",
      label: "Playwright session",
      status: "COMPLETED",
      memoriesCreated: 1,
      memoriesAccessed: 0,
      uniqueMemories: 1,
      duration: 60000,
      topTopics: ["qa"],
    };
  }

  if (path === "/v1/pools") return { pools: [{ id: "test-pool", name: "Test Pool", description: null, visibility: "GLOBAL", createdBySession: null, createdAt: now, updatedAt: now }], total: 1 };
  if (path === "/v1/pools/test-pool") return { id: "test-pool", name: "Test Pool", description: null, visibility: "GLOBAL", createdBySession: null, createdAt: now, updatedAt: now };
  if (path === "/v1/pools/test-pool/members") return { members: [], total: 0 };
  if (path === "/v1/pools/test-pool/grants") return { grants: [], total: 0 };

  if (path === "/v1/analytics/summary") return { totalMemories: 1, memoriesToday: 0, memoriesThisWeek: 1, avgImportance: 0.7, timeline: [], typeDistribution: {}, layerDistribution: [], lastUpdated: now };
  if (path === "/v1/analytics/timeline") return { granularity: "day", data: [], total: 0, range: { start: now, end: now } };
  if (path === "/v1/analytics/breakdown/type") return { granularity: "week", data: [], summary: { dominant: null, distribution: {} } };
  if (path === "/v1/analytics/breakdown/layer") return { current: [], total: 0, trend: { granularity: "week", data: [] } };

  if (path === "/v1/ensemble/status") {
    return {
      enabled: true,
      models: ["bge-base"],
      config: {
        enabled: true,
        models: ["bge-base"],
        weights: { "bge-base": 1 },
        rrfK: 60,
        localEmbedUrl: "http://localhost:3001",
        consensusBoostEnabled: false,
        consensusBoostFactor: 1,
      },
    };
  }
  if (path === "/v1/ensemble/models") return [{ modelId: "bge-base", status: "active", addedAt: now, weight: 1, qualityMetrics: { sampleQueries: 0, avgRankContribution: 0, uniqueHits: 0, correlationWithGoldStandard: 0 }, promotionThresholds: { minSampleQueries: 1, minRankContribution: 0, minCorrelation: 0 } }];
  if (path === "/v1/ensemble/coverage") return { totalMemories: 1, modelsConfigured: 1, fullCoverageCount: 1, fullCoveragePercentage: 100, perModel: [{ model: "bge-base", status: "active", embeddedCount: 1, totalMemories: 1, coveragePercentage: 100 }] };
  if (path === "/v1/eval/history") {
    return {
      period: { start: now, end: now },
      totalQueries: 0,
      consensusRate: 0,
      fusionImprovement: 0,
      modelHitRates: [],
      queryTypeBreakdown: [],
    };
  }
  if (path === "/v1/reembedding/enabled") return { enabled: true, version: "test" };
  if (path === "/v1/reembedding/status") return null;
  if (path === "/v1/reembedding/jobs") return [];
  if (path === "/v1/reembedding/run") return { id: "job-1", status: "queued", modelId: "bge-base", createdAt: now, updatedAt: now };
  if (path === "/v1/ensemble/drift") return { perModel: [], thresholds: { drift: 0.15, alert: 0.3 } };
  if (path === "/v1/ensemble/drift/history") return { snapshots: [], count: 0 };
  if (path === "/v1/ensemble/drift/analyze") return { snapshots: [], summary: "No drift data yet." };

  if (path === "/v1/agents") return { agents: [agent] };
  if (path === "/v1/agents/test-agent/memories") return { memories: [memory], total: 1 };
  if (path === "/v1/agents/test-agent/context") return { context: "Test context", memoriesIncluded: 1, tokenCount: 2, layers: { identity: 0, project: 0, session: 1 } };
  if (path === "/v1/agents/test-agent/trust/history") return { history: [] };
  if (path === "/v1/agents/test-agent/trust/narrative") return { narrative: "Stable test trust profile." };
  if (path === "/v1/identity/agents") return { agents: [agent] };
  if (path === "/v1/identity/agents/test-agent") return agent;
  if (path === "/v1/identity/agents/test-agent/export") return { agent, memories: [memory] };
  if (path === "/v1/identity/agents/test-agent/trust-profile") return { agentId: "test-agent", overallTrust: 0.8, domains: [], history: [] };
  if (path === "/v1/identity/trust/test-agent") return trustProfile;
  if (path === "/v1/identity/trust/bulk") return [];
  if (path === "/v1/identity/delegation/tasks") return { tasks: [], total: 0 };
  if (path === "/v1/identity/delegation-templates") return { templates: [] };
  if (path === "/v1/identity/delegation-recall") return { matches: [], recommendations: [] };
  if (path === "/v1/identity/contracts") return { contracts: [contract] };
  if (path === "/v1/identity/challenges") return { challenges: [challenge] };
  if (path === "/v1/identity/teams") return { teams: [] };
  if (path === "/v1/identity/recall") return { results: [], recommendedAgentId: null, recommendedAgentName: null, failurePatterns: [] };
  if (path === "/v1/identity/export") return { schemaVersion: "1", exportedAt: now, integrityHash: "test", data: {} };
  if (path === "/v1/delegation-contracts") return { contracts: [] };
  if (path === "/v1/challenges") return { challenges: [challenge] };
  if (path === "/v1/entity-profiles") return { profiles: [entityProfile], total: 1, page: 1, limit: 24 };
  if (path === "/v1/entity-profiles/test-profile") return entityProfile;
  if (path === "/v1/entity-profiles/test-profile/memories") return { memories: [], total: 0 };

  if (path === "/v1/fog-index") return { score: 0, status: "healthy", components: [] };
  if (path === "/v1/fog-index/history") return { history: [] };
  if (path === "/v1/health/metrics") {
    return {
      metrics: [
        { key: "layer_distribution", value: { SESSION: 1 }, status: "ok" },
        { key: "embedding_coverage_pct", value: 1, status: "ok" },
        { key: "dedup_pending_clusters", value: 0, status: "ok" },
        { key: "avg_recall_latency_ms", value: 42, status: "ok" },
        { key: "dream_cycle_status", value: "completed", status: "ok" },
        { key: "dream_cycle_last_run", value: now, status: "ok" },
        { key: "stale_memories_pct", value: 0.05, status: "ok" },
      ],
    };
  }

  if (path === "/v1/cloud/status") return { linked: false };
  if (path === "/v1/cloud/sync/status") {
    return {
      lastSyncedAt: null,
      totalMemories: 1,
      syncedCount: 0,
      pendingCount: 1,
      autoSync: false,
    };
  }
  if (path === "/v1/cloud/sync/history") return [];
  if (path.startsWith("/v1/cloud/")) return { status: "idle", linked: false, history: [], conflicts: [], instances: [] };
  if (path === "/v1/sync/instances") return { instances: [] };
  if (path === "/v1/awareness/sources") return { sources: [] };
  if (path === "/v1/awareness/insights") return { insights: [] };
  if (path === "/v1/awareness/cycle/status") return { phase: "idle", lastRun: null, nextRun: null, insightsGenerated: 0 };
  if (path === "/v1/notifications/config") return { config: { enabled: false, confidenceThreshold: 0.7, webhookUrl: "", hmacSecret: "" }, history: [] };
  if (path === "/v1/emails") return { emails: [], total: 0 };
  if (path === "/v1/code/projects") return { projects: [] };
  if (path === "/v1/code/chunks/test-chunk") return { id: "test-chunk", content: "test", filePath: "test.ts", language: "ts", createdAt: now };

  if (method !== "GET") return { ok: true };
  return {};
}

export async function mockEngramApi(page: Page): Promise<ApiCall[]> {
  const calls: ApiCall[] = [];

  async function fulfill(route: Route) {
    const request = route.request();
    const path = normalizePath(request.url());
    const body = routeBody(request.method(), path);
    calls.push({ method: request.method(), path, status: 200 });
    await route.fulfill(json(200, body));
  }

  await page.route("**/api/engram/**", fulfill);
  await page.route("https://api.openengram.ai/**", fulfill);
  await page.route("http://localhost:3001/**", fulfill);

  return calls;
}
