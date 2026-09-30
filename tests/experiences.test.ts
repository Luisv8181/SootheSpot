import { describe, expect, it } from "vitest";
import { worlds } from "../domain/worlds/seed";
import { breathPhaseAt, experienceSpecSchema } from "../domain/worlds/spec";

describe("SootheSpot Worlds", () => {
  it("ships only valid allowlisted experience specs", () => {
    expect(worlds.map((world) => world.id)).toEqual(["ocean-calm", "soft-focus", "grounding-garden"]);
    for (const world of worlds) {
      expect(experienceSpecSchema.parse(world)).toEqual(world);
      expect(world.provenance).toBe("soothespot");
      expect(world.title.en).toBeTruthy();
      expect(world.title.es).toBeTruthy();
    }
  });

  it("rejects unknown fields and mismatched world categories", () => {
    const valid = worlds[0];
    expect(() => experienceSpecSchema.parse({ ...valid, script: "alert(1)" })).toThrow();
    expect(() => experienceSpecSchema.parse({ ...valid, category: "grounding" })).toThrow();
  });

  it("keeps durations bounded for brief regulation experiences", () => {
    const valid = worlds[1];
    expect(() => experienceSpecSchema.parse({ ...valid, durationMinutes: 0 })).toThrow();
    expect(() => experienceSpecSchema.parse({ ...valid, durationMinutes: 11 })).toThrow();
  });

  it("keeps grounding prompts bilingual and tied to five unique senses", () => {
    const garden = worlds.find((world) => world.id === "grounding-garden")!;
    const grounding = garden.activity.find((activity) => activity.type === "groundingPrompt");
    expect(grounding?.senses.map((item) => item.sense.en)).toEqual(["See", "Hear", "Feel", "Smell", "Taste"]);
    expect(grounding?.senses.every((item) => item.prompt.en && item.prompt.es)).toBe(true);
  });

  it("computes breathing phases without storing timer state in the spec", () => {
    const rhythm = { inhaleSeconds: 4, holdSeconds: 2, exhaleSeconds: 6 };
    expect(breathPhaseAt(0, rhythm)).toBe("inhale");
    expect(breathPhaseAt(4, rhythm)).toBe("hold");
    expect(breathPhaseAt(6, rhythm)).toBe("exhale");
    expect(breathPhaseAt(12, rhythm)).toBe("inhale");
  });
});
