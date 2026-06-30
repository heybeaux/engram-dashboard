import baseConfig from "./playwright.config";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  ...baseConfig,
  testDir: "./e2e",
  testMatch: /visual-audit\.ts/,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "html",
});
