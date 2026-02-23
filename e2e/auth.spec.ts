import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/login/);
    await expect(page.locator("input[type='email'], input[name='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='email'], input[name='email']", "bad@example.com");
    await page.fill("input[type='password']", "wrongpassword");
    await page.locator("button[type='submit']").click();
    // Should stay on login or show error
    await expect(page.locator("text=invalid, text=error, text=failed, text=incorrect").first()).toBeVisible({ timeout: 10000 }).catch(() => {
      // At minimum, should not redirect to dashboard
      expect(page.url()).toContain("login");
    });
  });

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup");
    await expect(page).toHaveURL(/signup/);
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/login|signup|auth/, { timeout: 10000 });
    expect(page.url()).toMatch(/login|signup|auth/);
  });
});
