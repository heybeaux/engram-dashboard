import crypto from "node:crypto";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { AUDIT_ROUTES, type AuditRoute } from "./page-manifest";

const VISUAL_AUDIT_ENABLED = process.env.PLAYWRIGHT_VISUAL_AUDIT === "1";

test.skip(!VISUAL_AUDIT_ENABLED, "Set PLAYWRIGHT_VISUAL_AUDIT=1 to run the opt-in visual audit suite.");

const VISUAL_AUDIT_USER = {
  id: "test_user",
  email: "visual-audit@example.com",
  name: "Visual Audit User",
};

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function makeTestToken(): string {
  const secret = process.env.JWT_SECRET || "visual-audit-secret";
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      sub: VISUAL_AUDIT_USER.id,
      email: VISUAL_AUDIT_USER.email,
      name: VISUAL_AUDIT_USER.name,
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  );
  const signature = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function slugify(input: string): string {
  return input.replace(/^\//, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "root";
}

function isKnownNoise(message: string): boolean {
  return [
    "Download the React DevTools",
    "hydrat",
    "CORS",
    "Access-Control-Allow-Origin",
    "net::ERR_FAILED",
    "Content Security Policy",
    "Refused to connect",
    "Failed to load resource",
    "Warning:",
    "The above error occurred in",
    "[ErrorBoundary]",
    "Dashboard stats error",
    "posthog",
    "analytics",
  ].some((fragment) => message.toLowerCase().includes(fragment.toLowerCase()));
}

async function authenticateIfNeeded(page: Page, route: AuditRoute) {
  if (route.kind !== "dashboard") return;
  const token = makeTestToken();
  await page.context().addCookies([
    {
      name: "engram_token",
      value: token,
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.addInitScript(
    ({ storedToken, storedUser }) => {
      window.localStorage.setItem("engram_token", storedToken);
      window.localStorage.setItem("engram_user", JSON.stringify(storedUser));
    },
    { storedToken: token, storedUser: VISUAL_AUDIT_USER },
  );
}

async function installVisualAuditApiMocks(page: Page) {
  const now = new Date().toISOString();
  const ok = (body: unknown) => ({
    status: 200,
    contentType: "application/json",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    },
    body: JSON.stringify(body),
  });

  const noContent = () => ({
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    },
  });

  const dashboardStats = {
    totalMemories: 42,
    memoryTrend: 7,
    totalUsers: 3,
    userTrend: 1,
    healthScore: 96,
    memoryByLayer: [
      { layer: "IDENTITY", count: 8, percentage: 19.0 },
      { layer: "PROJECT", count: 12, percentage: 28.6 },
      { layer: "SESSION", count: 22, percentage: 52.4 },
    ],
    recentActivity: [
      { id: "activity_visual_1", action: "Memory created", memoryId: "mem_visual_1", userId: VISUAL_AUDIT_USER.id, time: now },
    ],
    apiRequests: [{ day: now.slice(0, 10), requests: 12 }],
  };

  const ensembleStatus = {
    enabled: true,
    models: ["minilm", "bge-base"],
    config: {
      enabled: true,
      models: ["minilm", "bge-base"],
      weights: { minilm: 1, "bge-base": 1 },
      rrfK: 60,
      localEmbedUrl: "http://localhost:11434",
      consensusBoostEnabled: true,
      consensusBoostFactor: 1.2,
    },
  };

  const codeProjectsPayload = [
    {
      id: "code_visual_1",
      name: "Visual Audit Project",
      rootPath: "/workspace/visual-audit",
      languages: ["TypeScript"],
      stats: { totalFiles: 12, totalChunks: 48, chunksByType: { function: 20 }, chunksByLanguage: { TypeScript: 48 } },
      createdAt: now,
      updatedAt: now,
      lastIngestedAt: now,
    },
  ];

  await page.route(/.*\/v1\/projects.*/, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill(noContent());
    if (route.request().method() === "GET") return route.fulfill(ok(codeProjectsPayload));
    return route.continue();
  });

  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/api\/engram/, "");
    const method = request.method();

    if (method === "OPTIONS") return route.fulfill(noContent());

    if (pathname === "/v1/stats") return route.fulfill(ok(dashboardStats));

    if (pathname === "/v1/account") {
      return route.fulfill(ok({
        id: "acct_visual",
        email: VISUAL_AUDIT_USER.email,
        name: VISUAL_AUDIT_USER.name,
        plan: "pro",
        usage: { memoriesUsed: 42, apiCallsToday: 12 },
        limits: { memories: 100000, apiCallsPerDay: 10000, agents: 10, usersPerAgent: 100 },
        agents: [{ id: "agent_visual", name: "Visual Agent" }],
      }));
    }

    if (pathname === "/v1/admin/accounts") {
      return route.fulfill(ok({
        accounts: [
          {
            id: "acct_visual",
            email: VISUAL_AUDIT_USER.email,
            plan: "pro",
            memories_used: 42,
            api_calls_today: 12,
            created_at: now,
          },
        ],
      }));
    }

    if (pathname === "/v1/memories") {
      return route.fulfill(ok({
        memories: [
          {
            id: "mem_visual_1",
            raw: "Visual audit sample memory for dashboard rendering.",
            content: "Visual audit sample memory for dashboard rendering.",
            layer: "SESSION",
            type: "FACT",
            memoryType: "FACT",
            source: "AGENT_OBSERVATION",
            importanceScore: 0.72,
            confidence: 0.91,
            createdAt: now,
            userId: VISUAL_AUDIT_USER.id,
          },
        ],
        total: 1,
        limit: 25,
        offset: 0,
        userMap: { [VISUAL_AUDIT_USER.id]: VISUAL_AUDIT_USER.name },
      }));
    }

    if (pathname === "/v1/dedup/candidates") return route.fulfill(ok({ candidates: [], total: 0, pendingCount: 0 }));

    if (pathname === "/v1/agent-sessions") {
      return route.fulfill(ok({
        sessions: [
          {
            id: "session_visual_1",
            sessionKey: "visual-audit-session",
            label: "Visual audit session",
            status: "ACTIVE",
            parentSessionKey: null,
            taskDescription: "Exercise dashboard rendering",
            startedAt: now,
            endedAt: null,
            createdAt: now,
            updatedAt: now,
          },
        ],
        total: 1,
      }));
    }

    if (pathname === "/v1/consolidation/dream-cycle/reports") return route.fulfill(ok({ reports: [] }));

    if (pathname === "/v1/pools") {
      return route.fulfill(ok({
        pools: [
          {
            id: "pool_visual_1",
            name: "Visual Audit Pool",
            description: "Sample memory pool used by Playwright visual audit.",
            visibility: "PRIVATE",
            createdBySession: null,
            memberCount: 1,
            grantCount: 0,
            createdAt: now,
            updatedAt: now,
          },
        ],
        total: 1,
      }));
    }

    if (pathname === "/v1/notifications/config" && method === "GET") {
      return route.fulfill(ok({ enabled: false, confidenceThreshold: 0.7, webhookUrl: "", hmacSecret: "", history: [] }));
    }
    if (pathname === "/v1/notifications/configure" && method === "POST") return route.fulfill(ok({ enabled: true }));

    if (pathname === "/v1/users") {
      return route.fulfill(ok({
        users: [
          {
            id: VISUAL_AUDIT_USER.id,
            externalId: VISUAL_AUDIT_USER.id,
            displayName: VISUAL_AUDIT_USER.name,
            accountId: "acct_visual",
            createdAt: now,
            memoryCount: 1,
          },
        ],
        total: 1,
      }));
    }

    if (pathname === "/v1/ensemble/status") return route.fulfill(ok(ensembleStatus));
    if (pathname === "/v1/ensemble/models") {
      return route.fulfill(ok(ensembleStatus.models.map((modelId) => ({
        modelId,
        status: "active",
        addedAt: now,
        weight: 1,
        qualityMetrics: { sampleQueries: 120, avgRankContribution: 0.5, uniqueHits: 10, correlationWithGoldStandard: 0.88 },
        promotionThresholds: { minSampleQueries: 1000, minRankContribution: 0.15, minCorrelation: 0.8 },
      }))));
    }
    if (pathname === "/v1/ensemble/coverage") {
      return route.fulfill(ok({
        totalMemories: 42,
        modelsConfigured: 2,
        fullCoverageCount: 36,
        fullCoveragePercentage: 85.7,
        perModel: ensembleStatus.models.map((model) => ({ model, status: "active", embeddedCount: 40, totalMemories: 42, coveragePercentage: 95.2 })),
      }));
    }
    if (pathname === "/v1/eval/history") {
      return route.fulfill(ok({
        period: { start: now, end: now },
        totalQueries: 24,
        modelHitRates: [],
        queryTypeBreakdown: [],
        consensusRate: 0.83,
        fusionImprovement: 0.12,
      }));
    }
    if (pathname === "/v1/reembedding/jobs") return route.fulfill(ok([]));
    if (pathname === "/v1/reembedding/status") return route.fulfill(ok(null));
    if (pathname === "/v1/reembedding/enabled") return route.fulfill(ok({ enabled: true, version: "visual-audit" }));

    if (pathname === "/v1/projects") return route.fulfill(ok(codeProjectsPayload));

    return route.continue();
  });
}

async function attachScreenshot(page: Page, testInfo: TestInfo, route: AuditRoute, suffix = "desktop") {
  const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
  await testInfo.attach(`${slugify(route.path)}-${suffix}.png`, {
    body: screenshot,
    contentType: "image/png",
  });
}

test.describe("visual audit coverage", () => {
  for (const route of AUDIT_ROUTES) {
    test(`${route.name} renders cleanly at ${route.path}`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const badResponses: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("response", (response) => {
        const status = response.status();
        const url = response.url();
        if (status >= 500 || (status === 404 && !url.includes("favicon") && !url.includes("/_next/static/"))) {
          badResponses.push(`${status} ${url}`);
        }
      });

      await installVisualAuditApiMocks(page);
      await authenticateIfNeeded(page, route);
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${route.path} returned ${response?.status()}`).toBeLessThan(500);

      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
      await page.waitForTimeout(500);

      if (route.kind === "dashboard") {
        expect(page.url(), `${route.path} unexpectedly redirected to auth`).not.toMatch(/\/login|\/signup/);
      }

      const bodyText = await page.locator("body").innerText({ timeout: 10_000 });
      expect(bodyText.trim().length, `${route.path} rendered an empty body`).toBeGreaterThan(20);
      if (!route.path.startsWith("/docs")) {
        expect(bodyText, `${route.path} rendered a generic 404`).not.toMatch(/404|This page could not be found/i);
        expect(bodyText, `${route.path} leaked placeholder copy`).not.toMatch(
          /TODO|Coming soon|Not implemented|Under construction|Lorem ipsum/i,
        );
      }

      const visibleContent = page.locator("main, form, article, nav, h1, h2").first();
      await expect(visibleContent, `${route.path} has no obvious visible page structure`).toBeVisible({ timeout: 10_000 });

      await attachScreenshot(page, testInfo, route, "desktop");

      const realConsoleErrors = consoleErrors.filter((message) => !isKnownNoise(message));
      const realPageErrors = pageErrors.filter((message) => !isKnownNoise(message));
      expect(realPageErrors, `${route.path} page errors:\n${realPageErrors.join("\n")}`).toHaveLength(0);
      expect(realConsoleErrors, `${route.path} console errors:\n${realConsoleErrors.join("\n")}`).toHaveLength(0);
      expect(badResponses, `${route.path} bad responses:\n${badResponses.join("\n")}`).toHaveLength(0);
    });
  }

  for (const route of AUDIT_ROUTES.filter((candidate) => candidate.viewport === "both")) {
    test(`${route.name} has a mobile visual baseline at ${route.path}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await installVisualAuditApiMocks(page);
      await authenticateIfNeeded(page, route);
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
      await page.waitForTimeout(500);

      await expect(page.locator("body")).toBeVisible();
      await attachScreenshot(page, testInfo, route, "mobile");
    });
  }
});
