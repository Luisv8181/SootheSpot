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

  it("uses explicit secondary shelves and does not keyword-infer shelf labels", () => {
    const ucla = searchResources("UCLA mindful", "English")[0];
    expect(getResourceShelves(ucla)).toEqual(expect.arrayContaining(["Listen", "Practice", "Sleep & Rest"]));
  });
});
