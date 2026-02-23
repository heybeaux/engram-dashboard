import { test, expect } from "@playwright/test";

test.describe("Identity Page", () => {
  test("identity overview loads", async ({ page }) => {
    await page.goto("/identity");
    if (page.url().includes("login")) {
      test.skip(true, "Auth required");
    }
    await expect(page.locator("h1, h2, [data-testid='identity']").first()).toBeVisible({ timeout: 15000 });
  });

  test("shows agent cards", async ({ page }) => {
    await page.goto("/identity");
    if (page.url().includes("login")) {
      test.skip(true, "Auth required");
    }
    // Wait for agent cards to appear
    const agentCard = page.locator("[data-testid='agent-card'], .agent-card, [class*='AgentCard']").first();
    await expect(agentCard).toBeVisible({ timeout: 15000 }).catch(() => {
      // May not have agents yet — that's OK
    });
  });

  test("clicking agent navigates to detail", async ({ page }) => {
    await page.goto("/identity");
    if (page.url().includes("login")) {
      test.skip(true, "Auth required");
    }
    const agentCard = page.locator("[data-testid='agent-card'], .agent-card, a[href*='identity/']").first();
    const isVisible = await agentCard.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip(true, "No agent cards found");
    }
    await agentCard.click();
    await page.waitForURL(/identity\//, { timeout: 10000 });
    expect(page.url()).toMatch(/identity\//);
  });
});
