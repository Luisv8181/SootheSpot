export type Resource = {
  id: string;
  name: string;
  publisher: string;
  resource_type: string;
  official_url: string;
  description: string;
  tags: string[];
  languages?: string[];
  access?: string[];
  review_status: "unreviewed" | "screened" | "clinically_reviewed" | "verified" | "deprecated";
  regions?: string[];
  cultural_context?: {
    adaptation_status?: "unknown" | "translated" | "localized" | "culturally_adapted" | "community_informed";
    notes?: string;
  };
};
