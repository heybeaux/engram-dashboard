import { test, expect, Page, BrowserContext } from "@playwright/test";
import { AUDIT_ROUTES, DASHBOARD_ROUTES } from "./route-inventory";
import { mockEngramApi, type ApiCall } from "./api-mocks";

function makeTestToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ sub: "test_user", exp: Math.floor(Date.now() / 1000) + 86400 }),
  ).toString("base64url");
  return `${header}.${payload}.`;
}

async function authenticate(context: BrowserContext, page: Page) {
  const token = makeTestToken();
  await context.addCookies([{ name: "engram_token", value: token, domain: "localhost", path: "/" }]);
  await page.addInitScript((value) => {
    window.localStorage.setItem("engram_token", value);
  }, token);
}

async function installFailureWatch(page: Page) {
  const failedResponses: string[] = [];

  page.on("response", (res) => {
    const url = res.url();
    const isAppOrApi =
      url.startsWith("http://localhost:3000") ||
      url.startsWith("https://api.openengram.ai") ||
      url.startsWith("http://localhost:3001");
    if (isAppOrApi && res.status() >= 400 && !url.includes("/_next/static/")) {
      failedResponses.push(`${res.status()} ${url}`);
    }
  });

  return {
    assert() {
      expect(failedResponses, `failed responses:\n${failedResponses.join("\n")}`).toHaveLength(0);
    },
  };
}

async function expectNoGenericFailures(page: Page) {
  await expect(page.locator("body")).not.toContainText(/Invalid Date|API Error|Unhandled Runtime Error|Application error|Something went wrong|TypeError:|ReferenceError:/i);
}

test.describe("route inventory", () => {
  test("covers every app page with no duplicate paths", async () => {
    const paths = AUDIT_ROUTES.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain("/sessions");
    expect(paths).toContain("/ensemble/drift");
    expect(paths).toContain("/emails");
    expect(paths).toContain("/identity/profiles/test-profile");
  });
});

for (const route of AUDIT_ROUTES) {
  test.describe(`${route.name} (${route.path})`, () => {
    let calls: ApiCall[];

    test.beforeEach(async ({ page, context }) => {
      await authenticate(context, page);
      calls = await mockEngramApi(page);
    });

    test("loads without generic failures or failed browser responses", async ({ page }) => {
      const failures = await installFailureWatch(page);
      const res = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(res?.status()).toBeLessThan(400);
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
      await expect(page.locator("main, body").first()).toBeVisible();
      await expectNoGenericFailures(page);
      failures.assert();
    });
  });
}

test.describe("browser endpoint coverage", () => {
  test.beforeEach(async ({ page, context }) => {
    await authenticate(context, page);
    await mockEngramApi(page);
  });

  for (const route of DASHBOARD_ROUTES.filter((item) => !item.dynamic)) {
    test(`${route.path} browser API calls return successful mocked shapes`, async ({ page }) => {
      const calls = await mockEngramApi(page);
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
      for (const call of calls) {
        expect(call.status, `${call.method} ${call.path}`).toBeLessThan(400);
      }
    });
  }
});

test.describe("reported regressions", () => {
  test.beforeEach(async ({ page, context }) => {
    await authenticate(context, page);
    await mockEngramApi(page);
  });

  test("/sessions renders snake_case API dates without Invalid Date", async ({ page }) => {
    await page.goto("/sessions", { waitUntil: "networkidle" });
    await expect(page.getByText("test-session")).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Invalid Date");
  });

  test("/ensemble/drift analyze uses dashboard proxy and does not show API Error", async ({ page }) => {
    const calls = await mockEngramApi(page);
    await page.goto("/ensemble/drift", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Analyze Now/i }).click();
    await expect(page.locator("body")).not.toContainText("API Error");
    expect(calls.some((call) => call.method === "POST" && call.path === "/v1/ensemble/drift/analyze")).toBe(true);
  });

  test("/code/projects shows coming soon in cloud instead of calling an unavailable code service", async ({ page }) => {
    const calls = await mockEngramApi(page);
    await page.goto("/code/projects", { waitUntil: "networkidle" });
    await expect(page.getByText("Cloud code search is coming soon")).toBeVisible();
    expect(calls.some((call) => call.path.startsWith("/v1/code"))).toBe(false);
  });

  test("/status presents account usage and API health with readable hierarchy", async ({ page }) => {
    await page.goto("/status", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /Account limits and API health/i })).toBeVisible();
    await expect(page.getByText("API status")).toBeVisible();
    await expect(page.getByText("Memories stored")).toBeVisible();
    await expect(page.getByText("API calls today")).toBeVisible();
    await expect(page.getByText("Configured endpoint")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/Something went wrong|API Error|Invalid Date/i);
  });
});
