import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { AUDIT_ROUTES, type AuditRoute } from "./page-manifest";

const VISUAL_AUDIT_ENABLED = process.env.PLAYWRIGHT_VISUAL_AUDIT === "1";

test.skip(!VISUAL_AUDIT_ENABLED, "Set PLAYWRIGHT_VISUAL_AUDIT=1 to run the opt-in visual audit suite.");

function makeTestToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ sub: "visual_audit_user", exp: Math.floor(Date.now() / 1000) + 86400 }),
  ).toString("base64url");
  return `${header}.${payload}.`;
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
  await page.context().addCookies([
    {
      name: "engram_token",
      value: makeTestToken(),
      domain: "localhost",
      path: "/",
    },
  ]);
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
      expect(bodyText, `${route.path} rendered a generic 404`).not.toMatch(/404|This page could not be found/i);
      expect(bodyText, `${route.path} leaked placeholder copy`).not.toMatch(
        /TODO|Coming soon|Not implemented|Under construction|Lorem ipsum/i,
      );

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
      await authenticateIfNeeded(page, route);
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
      await page.waitForTimeout(500);

      await expect(page.locator("body")).toBeVisible();
      await attachScreenshot(page, testInfo, route, "mobile");
    });
  }
});
