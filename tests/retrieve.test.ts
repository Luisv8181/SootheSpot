import { describe, expect, it } from "vitest";
import { retrieveTools } from "@/domain/tools/retrieve";
import { seedTools } from "@/domain/tools/seed";
import type { ToolFeedback } from "@/domain/tools/types";

describe("retrieveTools", () => {
  it("returns state-relevant tools first", () => {
    const results = retrieveTools(seedTools, { state: "overwhelmed", language: "en" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tool.states).toContain("overwhelmed");
  });

  it("boosts a tool that helped in the same kind of moment", () => {
    const feedback: ToolFeedback[] = [
      {
        toolId: "music-reset",
        helpfulness: "a-lot",
        checkInState: "off",
        createdAt: "2026-09-25T00:00:00.000Z"
      }
    ];

    const results = retrieveTools(seedTools, {
      state: "off",
      language: "en",
      feedback
    });

    expect(results[0].tool.id).toBe("music-reset");
  });

  it("demotes a tool repeatedly marked not helpful in the same state", () => {
    const feedback: ToolFeedback[] = Array.from({ length: 3 }, (_, index) => ({
      toolId: "breathing-478",
      helpfulness: "not-really" as const,
      checkInState: "anxious" as const,
      createdAt: `2026-09-25T00:00:0${index}.000Z`
    }));

    const results = retrieveTools(seedTools, {
      state: "anxious",
      language: "en",
      feedback
    });

    expect(results.map((result) => result.tool.id)).not.toContain("breathing-478");
  });

  it("never returns ordinary coping recommendations for the support route", () => {
    expect(retrieveTools(seedTools, { state: "support", language: "en" })).toEqual([]);
  });

  it("prefers feedback from the same user-selected situation", () => {
    const feedback = [
      {
        toolId: "five-senses",
        helpfulness: "a-lot" as const,
        checkInState: "anxious" as const,
        momentContext: "work-school" as const,
        createdAt: "2026-09-25T00:00:00.000Z"
      },
      {
        toolId: "breathing-478",
        helpfulness: "a-lot" as const,
        checkInState: "anxious" as const,
        momentContext: "home" as const,
        createdAt: "2026-09-25T00:00:01.000Z"
      }
    ];

    const results = retrieveTools(seedTools, {
      state: "anxious",
      language: "en",
      momentContext: "work-school",
      feedback
    });

    expect(results[0].tool.id).toBe("five-senses");
    expect(results[0].reason).toContain("this kind of situation");
  });

  it("does not infer a situation when none is selected", () => {
    const feedback = [
      {
        toolId: "five-senses",
        helpfulness: "a-lot" as const,
        checkInState: "anxious" as const,
        momentContext: "work-school" as const,
        createdAt: "2026-09-25T00:00:00.000Z"
      }
    ];

    const results = retrieveTools(seedTools, {
      state: "anxious",
      language: "en",
      feedback
    });

    expect(results[0].reason).not.toContain("this kind of situation");
  });

  it("filters tools that do not fit the available time", () => {
    const results = retrieveTools(seedTools, {
      state: "overwhelmed",
      language: "en",
      availableMinutes: 2
    });

    expect(results.every((result) => !result.tool.durationMinutes || result.tool.durationMinutes <= 2)).toBe(true);
  });

  it("filters tools that do not support the selected language", () => {
    const englishOnly = {
      ...seedTools[0],
      id: "english-only",
      languages: ["en"]
    };

    const results = retrieveTools([englishOnly], {
      state: "anxious",
      language: "es"
    });

    expect(results).toEqual([]);
  });
});
