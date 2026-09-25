import { summarizeToolFeedback } from "./history";
import type { CheckInState, MomentContext, Tool, ToolFeedback } from "./types";

type RetrieveInput = {
  state: CheckInState;
  language?: string;
  maxResults?: number;
  feedback?: ToolFeedback[];
  availableMinutes?: number;
  momentContext?: MomentContext;
};

export function retrieveTools(tools: Tool[], input: RetrieveInput) {
  if (input.state === "support") return [];

  const feedback = input.feedback ?? [];

  return tools
    .filter((tool) => !input.language || tool.languages.includes(input.language))
    .filter((tool) => !input.availableMinutes || !tool.durationMinutes || tool.durationMinutes <= input.availableMinutes)
    .map((tool) => {
      let score = 0;
      const stateMatch = tool.states.includes(input.state);
      const stateHistory = summarizeToolFeedback(feedback, tool.id, { state: input.state });
      const exactContextHistory = input.momentContext
        ? summarizeToolFeedback(feedback, tool.id, {
            state: input.state,
            momentContext: input.momentContext
          })
        : null;
      const legacyHistory = feedback.filter(
        (item) => item.toolId === tool.id && item.checkInState === undefined
      );

      if (stateMatch) score += 5;

      // Prefer the person's own history in the same situation when it exists.
      if (exactContextHistory && exactContextHistory.total > 0) {
        score += exactContextHistory.score * 1.5;
        const otherStateHistoryScore = stateHistory.score - exactContextHistory.score;
        score += otherStateHistoryScore * 0.35;
      } else {
        score += stateHistory.score;
      }

      for (const item of legacyHistory) {
        if (item.helpfulness === "a-lot") score += 1;
        if (item.helpfulness === "not-really") score -= 1;
      }

      if (tool.provenance === "client-created") score += 1;
      if (input.availableMinutes && tool.durationMinutes && tool.durationMinutes <= input.availableMinutes) score += 1;

      return { tool, score, stateMatch, stateHistory, exactContextHistory };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.tool.title.localeCompare(b.tool.title))
    .slice(0, input.maxResults ?? 3)
    .map(({ tool, stateMatch, stateHistory, exactContextHistory }) => ({
      tool,
      reason:
        exactContextHistory && (exactContextHistory.aLot > 0 || exactContextHistory.aLittle > 0)
          ? "You've marked this helpful before in this kind of situation."
          : stateHistory.aLot > 0 || stateHistory.aLittle > 0
            ? "You've marked this helpful before in a similar moment."
            : tool.provenance === "client-created" && stateMatch
              ? "One of your own tools that matches how you're feeling."
              : stateMatch
                ? "Matches how you said you're feeling."
                : "Fits your past experience."
    }));
}
