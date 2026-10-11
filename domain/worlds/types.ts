export type WorldId = "ocean-calm" | "soft-focus" | "grounding-garden" | "ripple-field" | "vast-sky" | "quiet-rain";

export type BreathPhase = "inhale" | "hold" | "exhale";
export type ExperienceTheme = "ocean" | "focus" | "garden" | "ripple" | "sky" | "rain";
export type ExperienceCategory = "breathing" | "focus" | "grounding" | "sensory";
export type SupportedLocale = "en" | "es";

export type LocalizedText = Record<SupportedLocale, string>;

export type BreathActivity = {
  type: "breathRhythm";
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
};

export type FocusActivity = {
  type: "focusVisual";
  anchor: "stone" | "light";
};

export type GroundingActivity = {
  type: "groundingPrompt";
  senses: Array<{
    sense: LocalizedText;
    prompt: LocalizedText;
  }>;
};

export type ExperienceActivity =
  | { type: "ambientScene" }
  | BreathActivity
  | FocusActivity
  | GroundingActivity
  | { type: "rippleInteraction" }
  | { type: "glassInteraction" }
  | { type: "timer" }
  | { type: "completion" };

export type ExperienceSpec = {
  version: 1;
  id: WorldId;
  theme: ExperienceTheme;
  category: ExperienceCategory;
  title: LocalizedText;
  description: LocalizedText;
  purpose: LocalizedText;
  durationMinutes: number;
  provenance: "soothespot";
  activity: ExperienceActivity[];
};

export type World = ExperienceSpec;
