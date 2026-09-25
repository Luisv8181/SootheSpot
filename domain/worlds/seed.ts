import type { World } from "./types";

export const worlds: World[] = [
  {
    id: "ocean-calm",
    title: "Ocean Calm",
    description: "A quiet breathing space with slow waves and a gentle rhythm.",
    durationMinutes: 5,
    category: "breathing"
  },
  {
    id: "soft-focus",
    title: "Soft Focus",
    description: "A low-pressure visual anchor for a few minutes of steady attention.",
    durationMinutes: 3,
    category: "focus"
  },
  {
    id: "grounding-garden",
    title: "Grounding Garden",
    description: "Notice what is around you, one sense at a time.",
    durationMinutes: 4,
    category: "grounding"
  }
];
