import { Page, expect } from "@playwright/test";

/** Collect console errors during a page visit and assert none occurred. */
export async function expectNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return {
    assert() {
      // Filter out known noisy errors (e.g. Next.js hot-reload, favicon)
      const real = errors.filter(
        (e) =>
          !e.includes("favicon") &&
          !e.includes("hot-update") &&
          !e.includes("NEXT_NOT_FOUND"),
      );
      expect(real, `Unexpected console errors: ${real.join("\n")}`).toHaveLength(0);
    },
  };
}

/** Intercept all fetch requests and collect 404s. */
export async function expectNo404s(page: Page) {
  const notFound: string[] = [];
  page.on("response", (res) => {
    if (res.status() === 404 && !res.url().includes("favicon")) {
      notFound.push(`${res.status()} ${res.url()}`);
    }
  });
  return {
    assert() {
      expect(notFound, `Got 404s:\n${notFound.join("\n")}`).toHaveLength(0);
    },
  };
}
