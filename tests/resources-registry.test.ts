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

  it("adds WHO's multilingual illustrated stress guide to Read and Understand Yourself", () => {
    const guide = searchResources("Doing What Matters", "Spanish", "Read")[0];
    expect(guide?.id).toBe("who-doing-what-matters-stress-guide");
    expect(getResourceShelfLabels(guide)).toEqual(expect.arrayContaining(["Read", "Understand Yourself"]));
    expect(guide.source_notes?.every((url) => url.startsWith("https://"))).toBe(true);
  });

  it("keeps WHO audio language metadata separate from guide translations", () => {
    const audio = searchResources("Doing What Matters", "English", "Listen")[0];
    expect(audio?.id).toBe("who-doing-what-matters-stress-audio");
    expect(audio.duration_options_minutes).toBeUndefined();
    expect(searchResources("Doing What Matters", "Spanish", "Listen")).toEqual([]);
    expect(searchResources("Doing What Matters", "English", "Listen", undefined, 5)).not.toContain(audio);
    expect(getResourceShelfLabels(audio)).toEqual(expect.arrayContaining(["Listen", "Practice"]));
  });

  it("surfaces CDC sleep education without treating it as individualized care", () => {
    const sleep = searchResources("About Sleep", "English", "Sleep & Rest")[0];
    expect(sleep?.id).toBe("cdc-about-sleep");
    expect(getResourceShelfLabels(sleep)).toContain("Understand Yourself");
    expect(sleep.limitations).toContain("not diagnosis");
  });

  it("surfaces NAMI peer support as ordinary Reach Out support, not a crisis route", () => {
    const support = searchResources("NAMI Connection", "English", "Reach Out")[0];
    expect(support?.id).toBe("nami-connection-peer-support");
    expect(support.duration_options_minutes).toEqual([90]);
    expect(support.official_url).not.toContain("988");
    expect(support.limitations).toContain("not clinical treatment or emergency response");
  });

});
