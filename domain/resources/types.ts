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
};