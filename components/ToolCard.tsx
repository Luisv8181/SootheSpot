import type { Language } from "@/domain/i18n/copy";
import type { Tool } from "@/domain/tools/types";

const provenanceLabels = {
  en: {
    "client-created": "Your tool",
    "therapist-curated": "Therapist",
    "trusted-resource": "Trusted resource",
    soothespot: "SootheSpot"
  },
  es: {
    "client-created": "Tu herramienta",
    "therapist-curated": "Terapeuta",
    "trusted-resource": "Recurso confiable",
    soothespot: "SootheSpot"
  }
} as const;

export function ToolCard({
  tool,
  reason,
  onOpen,
  language = "en"
}: {
  tool: Tool;
  reason?: string;
  onOpen: (tool: Tool) => void;
  language?: Language;
}) {
  const icon =
    tool.category === "breathing" ? "◌" :
    tool.category === "grounding" ? "⌂" :
    tool.category === "movement" ? "↗" :
    tool.category === "journaling" ? "✎" : "♪";

  const duration = tool.durationMinutes
    ? language === "en" ? `${tool.durationMinutes} min` : `${tool.durationMinutes} min`
    : language === "en" ? "Any time" : "En cualquier momento";

  return (
    <button className="tool-card" onClick={() => onOpen(tool)}>
      <div className="tool-icon" aria-hidden="true">{icon}</div>
      <div className="tool-card-copy">
        <div className="tool-card-title-row">
          <strong>{tool.title}</strong>
          <span className="chevron">›</span>
        </div>
        <span className="tool-description">{tool.description}</span>
        <span className="tool-meta">
          {duration + " · " + provenanceLabels[language][tool.provenance]}
        </span>
        {reason && <span className="tool-reason">{reason}</span>}
      </div>
    </button>
  );
}
