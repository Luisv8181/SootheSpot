import { defineConfig, devices } from "@playwright/test";
const prefix = process.env.DEPLOY_TARGET === "github-pages" ? "/SootheSpot" : "";
const previewUrl = `http://127.0.0.1:3107${prefix}/`;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  workers: 2,
  use: { baseURL: previewUrl, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions: executablePath ? { executablePath, args: ["--no-sandbox", "--disable-dev-shm-usage"] } : undefined } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium", launchOptions: executablePath ? { executablePath, args: ["--no-sandbox", "--disable-dev-shm-usage"] } : undefined } }
  ],
  webServer: {
    command: "node scripts/serve-preview.mjs",
    url: previewUrl,
    reuseExistingServer: false,
    timeout: 120000
  }
});
