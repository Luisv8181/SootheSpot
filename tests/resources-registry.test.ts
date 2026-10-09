import { describe, expect, it } from "vitest";
import { getResourceShelfLabels, getResourceShelves, searchResources } from "@/domain/resources/registry";

describe("digital bookshelf retrieval", () => {
  it("includes the bibliographic book reference in Read", () => {
    const books = searchResources("upward spiral", "English");
    expect(books.some((resource) => resource.id === "book-the-upward-spiral-2e")).toBe(true);
  });

  it("classifies UCLA guided meditations for listening and practice", () => {
    const resource = searchResources("UCLA mindful", "English")[0];
    expect(resource).toBeDefined();
    expect(getResourceShelfLabels(resource)).toEqual(expect.arrayContaining(["Listen", "Practice", "Sleep & Rest"]));
  });

  it("supports need and duration filters without treating unknown duration as a match", () => {
    const short = searchResources("", "English", "Practice", "sleep", 10);
    expect(short.length).toBeGreaterThan(0);
    expect(short.every((resource) =>
      resource.duration_options_minutes?.some((minutes) => minutes <= 10)
    )).toBe(true);
  });

  it("surfaces NIMH's official child mental-health videos on Watch", () => {
    const watch = searchResources("", "English", "Watch");
    const nimhVideos = watch.filter((resource) => resource.id.startsWith("nimh-jane-brain-"));
    expect(nimhVideos).toHaveLength(3);
    expect(nimhVideos.every((resource) => resource.official_url.startsWith("https://www.nimh.nih.gov/"))).toBe(true);
    expect(nimhVideos.every((resource) => resource.source_notes?.length)).toBe(true);
  });

  it("does not invent duration metadata for videos where source duration was not verified", () => {
    const great = searchResources("GREAT: Helpful Practices", "English", "Watch")[0];
    expect(great).toBeDefined();
    expect(great.duration_options_minutes).toBeUndefined();
    expect(searchResources("GREAT: Helpful Practices", "English", "Watch", undefined, 5)).not.toContain(great);
  });

  it("uses explicit secondary shelves and does not keyword-infer shelf labels", () => {
    const ucla = searchResources("UCLA mindful", "English")[0];
    expect(getResourceShelves(ucla)).toEqual(expect.arrayContaining(["Listen", "Practice", "Sleep & Rest"]));
  });
});
