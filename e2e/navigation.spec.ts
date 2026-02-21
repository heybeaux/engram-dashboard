import { test, expect } from "@playwright/test";

const sidebarRoutes = [
  "/dashboard",
  "/memories",
  "/graph",
  "/identity",
  "/agents",
  "/sessions",
  "/insights",
  "/settings",
  "/analytics",
];

test.describe("Navigation", () => {
  test("all sidebar links resolve without 404", async ({ page }) => {
    for (const route of sidebarRoutes) {
      const response = await page.goto(route);
      const url = page.url();
      // Should not be a 404 page (may redirect to login)
      if (response) {
        expect(response.status(), `${route} returned ${response.status()}`).not.toBe(404);
      }
    }
  });

  test("mobile nav is accessible", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dashboard");
    if (page.url().includes("login")) {
      test.skip(true, "Auth required");
    }
    // Look for mobile menu trigger (hamburger button or sheet trigger)
    const menuButton = page.locator(
      "button[aria-label*='menu'], button[aria-label*='Menu'], [data-testid='mobile-nav'], button:has(svg)"
    ).first();
    await expect(menuButton).toBeVisible({ timeout: 10000 });
  });
});
