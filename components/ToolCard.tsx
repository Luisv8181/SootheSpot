import type { Tool } from "@/domain/tools/types";

const provenanceLabels = {
  "client-created": "Your tool",
  "therapist-curated": "Therapist",
  "trusted-resource": "Trusted resource",
  soothespot: "SootheSpot"
} as const;

export function ToolCard({
  tool,
  reason,
  onOpen
}: {
  tool: Tool;
  reason?: string;
  onOpen: (tool: Tool) => void;
}) {
  const icon =
    tool.category === "breathing" ? "◌" :
    tool.category === "grounding" ? "⌂" :
    tool.category === "movement" ? "↗" :
    tool.category === "journaling" ? "✎" : "♪";

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
          {(tool.durationMinutes ? tool.durationMinutes + " min" : "Any time") + " · " + provenanceLabels[tool.provenance]}
        </span>
        {reason && <span className="tool-reason">{reason}</span>}
      </div>
    </button>
  );
}
