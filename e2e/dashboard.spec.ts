import { test, expect } from "@playwright/test";

test.describe("Dashboard Overview", () => {
  test("dashboard page loads", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("login")) {
      test.skip(true, "Auth required");
    }
    await expect(page.locator("h1, h2, [data-testid='dashboard']").first()).toBeVisible({ timeout: 15000 });
  });

  test("dashboard shows stats cards", async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("login")) {
      test.skip(true, "Auth required");
    }
    // Look for stat/metric cards
    const statsCards = page.locator("[data-testid='stats-card'], .stats-card, [class*='card']");
    await expect(statsCards.first()).toBeVisible({ timeout: 15000 });
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
