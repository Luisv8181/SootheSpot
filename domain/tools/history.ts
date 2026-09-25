import type { CheckInState, MomentContext, ToolFeedback } from "./types";

export type ToolHistorySummary = {
  total: number;
  aLot: number;
  aLittle: number;
  notReally: number;
  score: number;
};

type HistoryFilter = {
  state?: CheckInState;
  momentContext?: MomentContext;
};

export function summarizeToolFeedback(
  feedback: ToolFeedback[],
  toolId: string,
  filter: CheckInState | HistoryFilter = {}
): ToolHistorySummary {
  const normalized: HistoryFilter =
    typeof filter === "string" ? { state: filter } : filter;

  const relevant = feedback.filter((item) => {
    if (item.toolId !== toolId) return false;
    if (normalized.state && item.checkInState !== normalized.state) return false;
    if (normalized.momentContext && item.momentContext !== normalized.momentContext) return false;
    return true;
  });

  const aLot = relevant.filter((item) => item.helpfulness === "a-lot").length;
  const aLittle = relevant.filter((item) => item.helpfulness === "a-little").length;
  const notReally = relevant.filter((item) => item.helpfulness === "not-really").length;
  const rawScore = aLot * 3 + aLittle - notReally * 2;

  return {
    total: relevant.length,
    aLot,
    aLittle,
    notReally,
    score: Math.max(-6, Math.min(6, rawScore))
  };
}

export function historyLabel(summary: ToolHistorySummary) {
  if (summary.total === 0) return null;
  const helpful = summary.aLot + summary.aLittle;
  return `Used ${summary.total} ${summary.total === 1 ? "time" : "times"} · ${helpful} marked helpful`;
}

export function strongestHelpfulContext(feedback: ToolFeedback[], toolId: string) {
  const contexts: MomentContext[] = ["home", "work-school", "sleep", "around-people", "alone"];
  return contexts
    .map((momentContext) => ({
      momentContext,
      summary: summarizeToolFeedback(feedback, toolId, { momentContext })
    }))
    .filter(({ summary }) => summary.total > 0 && summary.score > 0)
    .sort((a, b) => b.summary.score - a.summary.score || b.summary.total - a.summary.total)[0] ?? null;
}
