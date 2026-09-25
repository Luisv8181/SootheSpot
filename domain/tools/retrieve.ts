import type { CheckInState, Tool } from "./types";

type RetrieveInput = {
  state: CheckInState;
  language?: string;
  maxResults?: number;
  helpfulToolIds?: string[];
};

export function retrieveTools(tools: Tool[], input: RetrieveInput) {
  const helpful = new Set(input.helpfulToolIds ?? []);
  return tools
    .map((tool) => {
      let score = 0;
      if (tool.states.includes(input.state)) score += 5;
      if (input.language && tool.languages.includes(input.language)) score += 2;
      if (helpful.has(tool.id)) score += 3;
      if (tool.provenance === "client-created") score += 1;
      return { tool, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.tool.title.localeCompare(b.tool.title))
    .slice(0, input.maxResults ?? 3)
    .map(({ tool }) => ({
      tool,
      reason: helpful.has(tool.id)
        ? "Something you've found helpful before."
        : tool.states.includes(input.state)
          ? "Matches how you said you're feeling."
          : "Fits your preferences."
    }));
}
