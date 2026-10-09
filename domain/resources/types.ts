export const resourceNeeds = [
  "calm",
  "sleep",
  "understand",
  "practice",
  "listen",
  "watch",
  "read",
  "support",
  "stress",
  "anxiety",
  "mood",
  "trauma",
  "self-compassion",
  "grief",
  "substance-use"
] as const;

export type ResourceNeed = (typeof resourceNeeds)[number];

export const resourceShelfIds = [
  "read",
  "listen",
  "practice",
  "watch",
  "sleep-rest",
  "understand-yourself",
  "reach-out"
] as const;

export type ResourceShelfId = (typeof resourceShelfIds)[number];

export type Resource = {
  id: string;
  name: string;
  publisher: string;
  resource_type: string;
  official_url: string;
  description: string;
  tags: string[];
  platforms?: string[];
  languages?: string[];
  access?: string[];
  duration_options_minutes?: number[];
  intended_population?: string[];
  use_context?: string[];
  shelf?: ResourceShelfId;
  /** Explicit secondary navigation shelves; not keyword-inferred. */
  shelves?: ResourceShelfId[];
  needs?: ResourceNeed[];
  review_status: "unreviewed" | "screened" | "clinically_reviewed" | "verified" | "deprecated";
  regions?: string[];
  accessibility?: string[];
  cultural_context?: {
    adaptation_status?: "unknown" | "translated" | "localized" | "culturally_adapted" | "community_informed";
    notes?: string;
  };
  evidence_notes?: string;
  limitations?: string;
  source_notes?: string[];
  license_notes?: string;
  privacy_notes?: string;
  data_practices_url?: string;
  authors?: string[];
  publication_year?: number;
  page_count?: number;
  isbn?: string;
};