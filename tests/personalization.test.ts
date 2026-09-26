import { expect, it } from "vitest";
import { emptyData } from "@/domain/data/storage";
import { deleteTool, resetFeedback, exportData } from "@/domain/data/actions";
import { retrieveTools } from "@/domain/tools/retrieve";
import { seedTools } from "@/domain/tools/seed";

it("honors exclusions even for a highly rated tool and restores it on request", () => {
  const input = { state: "anxious" as const, language: "en" };
  const before = retrieveTools(seedTools, input);
  expect(before.map(({ tool }) => tool.id)).toContain("breathing-478");
  const hidden = retrieveTools(seedTools, { ...input, hiddenToolIds: ["breathing-478"] });
  expect(hidden.map(({ tool }) => tool.id)).not.toContain("breathing-478");
  expect(retrieveTools(seedTools, { ...input, hiddenToolIds: [] })).toEqual(before);
});

it("deletes a custom tool's saved entry, feedback, and exclusion together", () => {
  const tool = { ...seedTools[0], id: "custom-test", provenance: "client-created" as const };
  const data = { ...emptyData(), customTools: [tool], savedIds: [tool.id, "five-senses"],
    hiddenToolIds: [tool.id], feedback: [{ toolId: tool.id, helpfulness: "a-lot" as const, createdAt: new Date().toISOString() }] };
  const result = deleteTool(data, tool.id);
  expect(result.customTools).toEqual([]);
  expect(result.feedback).toEqual([]);
  expect(result.hiddenToolIds).toEqual([]);
  expect(result.savedIds).toEqual(["five-senses"]);
});

it("resets learned feedback while keeping saved tools and explicit exclusions", () => {
  const data = { ...emptyData(), savedIds: ["five-senses"], hiddenToolIds: ["breathing-478"],
    feedback: [{ toolId: "five-senses", helpfulness: "a-lot" as const, createdAt: new Date().toISOString() }] };
  const result = resetFeedback(data);
  expect(result.feedback).toEqual([]);
  expect(result.savedIds).toEqual(data.savedIds);
  expect(result.hiddenToolIds).toEqual(data.hiddenToolIds);
  expect(JSON.parse(exportData(result)).data).toEqual(result);
});
