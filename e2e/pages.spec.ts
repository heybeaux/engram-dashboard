import { test, expect, Page } from "@playwright/test";

// Create a minimal unsigned JWT so the middleware doesn't redirect to /login.
// The middleware falls back to decodeJwt (no secret) and only checks expiry.
function makeTestToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ sub: "test_user", exp: Math.floor(Date.now() / 1000) + 86400 }),
  ).toString("base64url");
  return `${header}.${payload}.`;
}

const PAGES = [
  { path: "/dashboard", name: "Dashboard" },
  { path: "/memories", name: "Memories" },
  { path: "/memories/merge-review", name: "Merge Review" },
  { path: "/sessions", name: "Sessions" },
  { path: "/graph", name: "Graph" },
  { path: "/consolidation", name: "Consolidation" },
  { path: "/sources", name: "Sources" },
  { path: "/pools", name: "Pools" },
  { path: "/analytics", name: "Analytics" },
  { path: "/api-keys", name: "API Keys" },
  { path: "/settings", name: "Settings" },
  { path: "/settings/cloud", name: "Settings Cloud" },
  { path: "/settings/sync", name: "Settings Sync" },
  { path: "/settings/sync/reconcile", name: "Settings Sync Reconcile" },
  { path: "/identity", name: "Identity" },
  { path: "/identity/contracts", name: "Identity Contracts" },
  { path: "/identity/teams", name: "Identity Teams" },
  { path: "/identity/trust", name: "Identity Trust" },
  { path: "/identity/recall", name: "Identity Recall" },
  { path: "/identity/export", name: "Identity Export" },
  { path: "/agents", name: "Agents" },
  { path: "/delegation", name: "Delegation" },
  { path: "/delegation/recall", name: "Delegation Recall" },
  { path: "/teams", name: "Teams" },
  { path: "/challenges", name: "Challenges" },
  { path: "/insights", name: "Insights" },
  { path: "/insights/notifications", name: "Insights Notifications" },
  { path: "/code", name: "Code" },
];

for (const { path, name } of PAGES) {
  test.describe(`${name} (${path})`, () => {
    let consoleErrors: string[] = [];
    let failedRequests: { url: string; status: number }[] = [];

    test.beforeEach(async ({ page, context }) => {
      // Set auth cookie so the middleware doesn't redirect to /login
      await context.addCookies([
        {
          name: "engram_token",
          value: makeTestToken(),
          domain: "localhost",
          path: "/",
        },
      ]);

      consoleErrors = [];
      failedRequests = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      page.on("response", (res) => {
        if (
          res.status() === 404 &&
          res.url().includes("/api/") &&
          !res.url().includes("/api/engram/")
        ) {
          failedRequests.push({ url: res.url(), status: res.status() });
        }
      });
    });

    test("loads without crashing", async ({ page }) => {
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(res?.status()).toBeLessThan(500);
    });

    test("no console errors", async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      const real = consoleErrors.filter(
        (e) =>
          !e.includes("Download the React DevTools") &&
          !e.includes("hydration") &&
          !e.includes("CORS") &&
          !e.includes("Access-Control-Allow-Origin") &&
          !e.includes("net::ERR_FAILED") &&
          !e.includes("Content Security Policy") &&
          !e.includes("Refused to connect") &&
          !e.includes("Failed to load resource") &&
          !e.includes("Warning:") &&
          !e.includes("The above error occurred in") &&
          !e.includes("[ErrorBoundary]"),
      );
      expect(real).toHaveLength(0);
    });

    test("key elements render", async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      // At minimum, the page should have a heading or a main landmark
      const heading = page.locator("h1, h2, [role='heading']").first();
      const main = page.locator("main").first();
      const hasContent = (await heading.count()) > 0 || (await main.count()) > 0;
      expect(hasContent).toBe(true);
    });

    test("no API 404s", async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      expect(failedRequests).toHaveLength(0);
    });
  });
}
