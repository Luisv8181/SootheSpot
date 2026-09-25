import { describe, expect, it } from "vitest";
import { customToolInputSchema } from "@/domain/tools/custom";

describe("custom tool validation", () => {
  it("accepts a complete client-created tool", () => {
    const result = customToolInputSchema.safeParse({
      title: "Call a friend",
      description: "Talk to someone I trust for five minutes.",
      category: "connection",
      durationMinutes: 5,
      instructions: ["Text a friend", "Ask if they have five minutes"],
      states: ["sad", "off"],
      languages: ["en"]
    });

    expect(result.success).toBe(true);
  });

  it("rejects a tool without instructions", () => {
    const result = customToolInputSchema.safeParse({
      title: "Call a friend",
      description: "Talk to someone I trust.",
      category: "connection",
      states: ["sad"],
      languages: ["en"],
      instructions: []
    });

    expect(result.success).toBe(false);
  });
});
