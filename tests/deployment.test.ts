// The Pages path must be explicit: CI browser tests run at /, while Pages assets run at /SootheSpot.
import { afterEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

it("does not apply the Pages prefix just because it is running in CI", async () => {
  vi.stubEnv("GITHUB_ACTIONS", "true");
  vi.stubEnv("DEPLOY_TARGET", "");
  const { default: config } = await import("../next.config");
  expect(config.basePath).toBe("");
});

it("builds static assets at the Pages prefix selected by the deployment workflow", async () => {
  const workflow = parse(readFileSync(".github/workflows/deploy-pages.yml", "utf8"));
  const steps = workflow.jobs.build.steps as { run?: string; env?: Record<string, string>; uses?: string; with?: Record<string, string> }[];
  const build = steps.find((step) => step.run === "npm run build");
  expect(build?.env?.DEPLOY_TARGET).toBe("github-pages");
  vi.stubEnv("DEPLOY_TARGET", build!.env!.DEPLOY_TARGET);
  vi.stubEnv("GITHUB_ACTIONS", "");
  const { default: config } = await import("../next.config");
  expect(config.basePath).toBe("/SootheSpot");
  expect(config.output).toBe("export");
  expect(steps.find((step) => step.uses?.startsWith("actions/upload-pages-artifact"))?.with?.path).toBe("./out");
  expect(steps.some((step) => step.run === "npm ci")).toBe(true);
});
