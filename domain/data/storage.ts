import type { Tool, ToolFeedback } from "../tools/types";
import type { Resource } from "../resources/types";
import { z } from "zod";
import { customToolInputSchema } from "../tools/custom";

export type PersonalData = {
  savedIds: string[];
  feedback: ToolFeedback[];
  savedResources: Resource[];
  customTools: Tool[];
  hiddenToolIds: string[];
};
export type DataKey = keyof PersonalData;
export type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export const storageKeys: Record<DataKey, string> = {
  savedIds: "soothespot.savedToolIds", feedback: "soothespot.feedback",
  savedResources: "soothespot.savedResources", customTools: "soothespot.customTools",
  hiddenToolIds: "soothespot.hiddenToolIds"
};
export function emptyData(): PersonalData {
  return { savedIds: [], feedback: [], savedResources: [], customTools: [], hiddenToolIds: [] };
}
const feedbackSchema = z.object({
  toolId: z.string().min(1),
  helpfulness: z.enum(["a-lot", "a-little", "not-really"]),
  createdAt: z.iso.datetime(),
  checkInState: z.enum(["okay", "off", "overwhelmed", "anxious", "sad", "angry", "support"]).optional(),
  momentContext: z.enum(["home", "work-school", "sleep", "around-people", "alone"]).optional()
});
const resourceSchema = z.looseObject({
  id: z.string().min(1), name: z.string(), publisher: z.string(), resource_type: z.string(),
  official_url: z.url().refine((url) => ["https:", "http:"].includes(new URL(url).protocol)),
  description: z.string(), tags: z.array(z.string()), languages: z.array(z.string()).optional(),
  access: z.array(z.string()).optional(), regions: z.array(z.string()).optional(),
  review_status: z.enum(["unreviewed", "screened", "clinically_reviewed", "verified", "deprecated"]),
  cultural_context: z.object({
    adaptation_status: z.enum(["unknown", "translated", "localized", "culturally_adapted", "community_informed"]).optional(),
    notes: z.string().optional()
  }).optional()
});
const schemas = {
  savedIds: z.array(z.string()), hiddenToolIds: z.array(z.string()),
  feedback: z.array(feedbackSchema), savedResources: z.array(resourceSchema),
  customTools: z.array(customToolInputSchema.extend({
    id: z.string().startsWith("custom-"), provenance: z.literal("client-created"),
    accessibility: z.array(z.string()).optional()
  }))
};
export function loadData(storage: StoragePort): { data: PersonalData; invalidKeys: DataKey[] } {
  const data = emptyData();
  const invalidKeys: DataKey[] = [];
  for (const key of Object.keys(storageKeys) as DataKey[]) {
    try {
      const parsed = schemas[key].parse(JSON.parse(storage.getItem(storageKeys[key]) ?? "[]"));
      Object.assign(data, { [key]: parsed });
    } catch { invalidKeys.push(key); }
  }
  return { data, invalidKeys };
}
export function saveChanges(storage: StoragePort, changes: Partial<PersonalData>, clear = false) {
  const backup = new Map<string, string | null>();
  const written: string[] = [];
  try {
    // Read and validate everything before changing any collection.
    for (const key of Object.keys(changes) as DataKey[]) {
      if (!clear) schemas[key].parse(changes[key]);
      backup.set(storageKeys[key], storage.getItem(storageKeys[key]));
    }
    for (const key of Object.keys(changes) as DataKey[]) {
      const storageKey = storageKeys[key];
      if (clear) storage.removeItem(storageKey);
      else storage.setItem(storageKey, JSON.stringify(changes[key]));
      written.push(storageKey);
    }
    return { ok: true, rollbackFailed: false };
  } catch {
    let rollbackFailed = false;
    for (const key of written.reverse()) {
      try {
        const previous = backup.get(key);
        if (previous == null) storage.removeItem(key);
        else storage.setItem(key, previous);
      } catch { rollbackFailed = true; }
    }
    return { ok: false, rollbackFailed };
  }
}
