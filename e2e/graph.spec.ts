import { test, expect } from "@playwright/test";

test.describe("Graph Page", () => {
  test("graph page loads and renders canvas or svg", async ({ page }) => {
    await page.goto("/graph");
    if (page.url().includes("login")) {
      test.skip(true, "Auth required");
    }
    // Graph should render a canvas or SVG element
    const graphElement = page.locator("canvas, svg, [data-testid='graph']").first();
    await expect(graphElement).toBeVisible({ timeout: 15000 });
  });

  test("graph page has no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/graph");
    if (page.url().includes("login")) {
      test.skip(true, "Auth required");
    }
    await page.waitForTimeout(3000);
    // Filter out known benign errors (e.g. analytics, hydration warnings)
    const criticalErrors = errors.filter(
      (e) => !e.includes("posthog") && !e.includes("hydrat") && !e.includes("analytics")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
