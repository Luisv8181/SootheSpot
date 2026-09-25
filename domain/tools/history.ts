import type { CheckInState, ToolFeedback } from "./types";

export type ToolHistorySummary = {
  total: number;
  aLot: number;
  aLittle: number;
  notReally: number;
  score: number;
};

export function summarizeToolFeedback(
  feedback: ToolFeedback[],
  toolId: string,
  state?: CheckInState
): ToolHistorySummary {
  const relevant = feedback.filter((item) => {
    if (item.toolId !== toolId) return false;
    if (!state) return true;
    return item.checkInState === state;
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
