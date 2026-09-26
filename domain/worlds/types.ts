export type WorldId = "ocean-calm" | "soft-focus" | "grounding-garden";

export type World = {
  id: WorldId;
  title: string;
  description: string;
  durationMinutes: number;
  category: "breathing" | "focus" | "grounding";
};

export type BreathPhase = "inhale" | "hold" | "exhale";
