import type { PersonalData } from "./storage";
export function deleteTool(data: PersonalData, id: string): PersonalData {
  return {
    ...data,
    customTools: data.customTools.filter((tool) => tool.id !== id),
    savedIds: data.savedIds.filter((saved) => saved !== id),
    feedback: data.feedback.filter((item) => item.toolId !== id),
    hiddenToolIds: data.hiddenToolIds.filter((hidden) => hidden !== id)
  };
}
export function resetFeedback(data: PersonalData): PersonalData { return { ...data, feedback: [] }; }
export function exportData(data: PersonalData, unreadableCollections?: Record<string, string | null>) {
  return JSON.stringify({ formatVersion: 1, exportedAt: new Date().toISOString(), data, unreadableCollections }, null, 2);
}
