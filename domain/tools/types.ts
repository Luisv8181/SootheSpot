export type ToolProvenance =
  | "client-created"
  | "therapist-curated"
  | "trusted-resource"
  | "soothespot";

export type Tool = {
  id: string;
  title: string;
  description: string;
  category: string;
  provenance: ToolProvenance;
  states: string[];
  durationMinutes?: number;
  instructions: string[];
  languages: string[];
  accessibility?: string[];
};

export type CheckInState =
  | "okay"
  | "off"
  | "overwhelmed"
  | "anxious"
  | "sad"
  | "angry"
  | "support";

export type ToolFeedback = {
  toolId: string;
  helpfulness: "a-lot" | "a-little" | "not-really";
  createdAt: string;
};
