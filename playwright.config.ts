import { defineConfig, devices } from "@playwright/test";
const prefix = process.env.DEPLOY_TARGET === "github-pages" ? "/SootheSpot" : "";
const previewUrl = `http://127.0.0.1:3107${prefix}/`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  workers: 2,
  use: { baseURL: previewUrl, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } }
  ],
  webServer: {
    command: "node scripts/serve-preview.mjs",
    url: previewUrl,
    reuseExistingServer: false,
    timeout: 120000
  }
});
