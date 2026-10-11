import { z } from "zod";
import type { BreathPhase, ExperienceActivity, ExperienceSpec, WorldId } from "./types";

const localizedText = z.strictObject({
  en: z.string().trim().min(1).max(180),
  es: z.string().trim().min(1).max(180)
});

const sensePrompt = z.strictObject({
  sense: localizedText,
  prompt: localizedText
});

const activitySchema = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("ambientScene") }),
  z.strictObject({ type: z.literal("rippleInteraction") }),
  z.strictObject({ type: z.literal("glassInteraction") }),
  z.strictObject({
    type: z.literal("breathRhythm"),
    inhaleSeconds: z.number().int().min(2).max(8),
    holdSeconds: z.number().int().min(0).max(6),
    exhaleSeconds: z.number().int().min(2).max(10)
  }),
  z.strictObject({
    type: z.literal("focusVisual"),
    anchor: z.enum(["stone", "light"])
  }),
  z.strictObject({
    type: z.literal("groundingPrompt"),
    senses: z.array(sensePrompt).length(5)
  }),
  z.strictObject({ type: z.literal("timer") }),
  z.strictObject({ type: z.literal("completion") })
]);

type ActivityType = ExperienceActivity["type"];

const idRules: Record<WorldId, { theme: string; category: string; mainActivity: ActivityType }> = {
  "ocean-calm": { theme: "ocean", category: "breathing", mainActivity: "breathRhythm" },
  "soft-focus": { theme: "focus", category: "focus", mainActivity: "focusVisual" },
  "grounding-garden": { theme: "garden", category: "grounding", mainActivity: "groundingPrompt" },
  "ripple-field": { theme: "ripple", category: "sensory", mainActivity: "rippleInteraction" },
  "vast-sky": { theme: "sky", category: "focus", mainActivity: "focusVisual" },
  "quiet-rain": { theme: "rain", category: "sensory", mainActivity: "glassInteraction" }
};

export const experienceSpecSchema = z.strictObject({
  version: z.literal(1),
  id: z.enum(["ocean-calm", "soft-focus", "grounding-garden", "ripple-field", "vast-sky", "quiet-rain"]),
  theme: z.enum(["ocean", "focus", "garden", "ripple", "sky", "rain"]),
  category: z.enum(["breathing", "focus", "grounding", "sensory"]),
  title: localizedText,
  description: localizedText,
  purpose: localizedText,
  durationMinutes: z.number().int().min(1).max(10),
  provenance: z.literal("soothespot"),
  activity: z.array(activitySchema).min(4).max(5)
}).superRefine((spec, context) => {
  const rule = idRules[spec.id];
  if (spec.theme !== rule.theme) {
    context.addIssue({ code: "custom", path: ["theme"], message: "World theme must match its allowlisted id." });
  }
  if (spec.category !== rule.category) {
    context.addIssue({ code: "custom", path: ["category"], message: "World category must match its allowlisted id." });
  }
  const activityTypes = spec.activity.map((item) => item.type);
  if (activityTypes[0] !== "ambientScene" || !activityTypes.includes("timer") || activityTypes.at(-1) !== "completion") {
    context.addIssue({ code: "custom", path: ["activity"], message: "Worlds must start with an ambient scene, include a timer, and end with completion." });
  }
  if (!activityTypes.includes(rule.mainActivity)) {
    context.addIssue({ code: "custom", path: ["activity"], message: "World activity must match its allowlisted category." });
  }
  const grounding = spec.activity.find((item) => item.type === "groundingPrompt");
  if (grounding) {
    const englishSenses = grounding.senses.map((item) => item.sense.en.toLowerCase());
    if (new Set(englishSenses).size !== englishSenses.length) {
      context.addIssue({ code: "custom", path: ["activity"], message: "Grounding senses must be unique." });
    }
  }
});

export function validateExperienceSpec(spec: unknown): ExperienceSpec {
  return experienceSpecSchema.parse(spec);
}

export function breathPhaseAt(second: number, rhythm: { inhaleSeconds: number; holdSeconds: number; exhaleSeconds: number }): BreathPhase {
  const cycle = rhythm.inhaleSeconds + rhythm.holdSeconds + rhythm.exhaleSeconds;
  const position = ((Math.max(0, Math.floor(second)) % cycle) + cycle) % cycle;
  if (position < rhythm.inhaleSeconds) return "inhale";
  if (position < rhythm.inhaleSeconds + rhythm.holdSeconds) return "hold";
  return "exhale";
}
