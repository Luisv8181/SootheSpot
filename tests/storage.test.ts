import { describe, expect, it } from "vitest";
import { emptyData, loadData, saveChanges, storageKeys, type StoragePort } from "@/domain/data/storage";

class MemoryStorage implements StoragePort {
  values = new Map<string, string>();
  failOn: string | undefined;
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) {
    if (key === this.failOn) throw new Error("Quota exceeded");
    this.values.set(key, value);
  }
  removeItem(key: string) {
    if (key === this.failOn) throw new Error("Storage blocked");
    this.values.delete(key);
  }
}

describe("personal storage boundary", () => {
  it("recovers valid collections independently without overwriting malformed data", () => {
    const storage = new MemoryStorage();
    storage.setItem(storageKeys.savedIds, '["five-senses"]');
    storage.setItem(storageKeys.customTools, '{"not":"an array"}');
    const result = loadData(storage);
    expect(result.data.savedIds).toEqual(["five-senses"]);
    expect(result.data.customTools).toEqual([]);
    expect(result.invalidKeys).toContain("customTools");
    expect(storage.getItem(storageKeys.customTools)).toBe('{"not":"an array"}');
  });

  it("rejects malformed feedback and unsafe saved-resource URLs", () => {
    const storage = new MemoryStorage();
    storage.setItem(storageKeys.feedback, '[{"toolId":"x","helpfulness":"invented"}]');
    storage.setItem(storageKeys.savedResources, JSON.stringify([{
      id: "x", name: "x", publisher: "x", resource_type: "site", description: "x",
      tags: [], review_status: "verified", official_url: "javascript:alert(1)"
    }]));
    const result = loadData(storage);
    expect(result.invalidKeys).toEqual(expect.arrayContaining(["feedback", "savedResources"]));
    expect(result.data.feedback).toEqual([]);
    expect(result.data.savedResources).toEqual([]);
  });

  it("does not claim success when a write fails", () => {
    const storage = new MemoryStorage();
    storage.setItem(storageKeys.savedIds, '["original"]');
    storage.failOn = storageKeys.savedIds;
    expect(saveChanges(storage, { savedIds: ["new"] }).ok).toBe(false);
    expect(loadData(storage).data.savedIds).toEqual(["original"]);
  });

  it("rolls back earlier writes when a later collection fails", () => {
    const storage = new MemoryStorage();
    storage.setItem(storageKeys.savedIds, '["original"]');
    storage.failOn = storageKeys.feedback;
    expect(saveChanges(storage, { savedIds: [], feedback: [] }).ok).toBe(false);
    expect(loadData(storage).data.savedIds).toEqual(["original"]);
  });

  it("clears all owned keys without deleting other applications' data", () => {
    const storage = new MemoryStorage();
    storage.setItem("another-app", "keep");
    storage.setItem(storageKeys.hiddenToolIds, '["five-senses"]');
    expect(saveChanges(storage, emptyData(), true).ok).toBe(true);
    for (const key of Object.values(storageKeys)) expect(storage.getItem(key)).toBeNull();
    expect(storage.getItem("another-app")).toBe("keep");
  });

  it("reports blocked reads without throwing", () => {
    const storage: StoragePort = {
      getItem() { throw new Error("Blocked"); }, setItem() {}, removeItem() {}
    };
    expect(loadData(storage).invalidKeys).toHaveLength(Object.keys(storageKeys).length);
  });
});
