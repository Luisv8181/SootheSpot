import { describe, expect, it } from "vitest";
import { retrieveTools } from "@/domain/tools/retrieve";
import { seedTools } from "@/domain/tools/seed";

describe("retrieveTools", () => {
  it("returns state-relevant tools first", () => {
    const results = retrieveTools(seedTools, { state: "overwhelmed", language: "en" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tool.states).toContain("overwhelmed");
  });

  it("boosts tools that helped before", () => {
    const results = retrieveTools(seedTools, {
      state: "off",
      language: "en",
      helpfulToolIds: ["music-reset"]
    });
    expect(results[0].tool.id).toBe("music-reset");
  });
});
