import { describe, expect, it } from "vitest";
import { getResourceShelves, resourceRegistry, resourceShelves, searchResources, shelfIds } from "./registry";

describe("resource discovery contract", () => {
  it("assigns every explicitly mapped resource to exactly one shelf", () => {
    const mapped = resourceRegistry.filter((resource) => resource.shelf);
    expect(mapped.length).toBeGreaterThan(0);
    for (const resource of mapped) {
      expect(getResourceShelves(resource)).toHaveLength(1);
      expect(resourceShelves.includes(getResourceShelves(resource)[0])).toBe(true);
    }
  });

  it("keeps shelf ids bijective with the public shelf labels", () => {
    expect(new Set(Object.values(shelfIds)).size).toBe(resourceShelves.length);
  });

  it("retrieves by explicit need without ranking", () => {
    const results = searchResources("", undefined, undefined, "sleep");
    expect(results.length).toBeGreaterThan(0);
    for (const resource of results) {
      expect(resource.review_status).not.toBe("deprecated");
      expect(resource.needs?.some((need) => need === "sleep")).toBe(true);
    }
  });

  it("retrieves a shelf deterministically", () => {
    const results = searchResources("", undefined, "Read");
    expect(results.length).toBeGreaterThan(0);
    expect(results).toEqual(searchResources("", undefined, "Read"));
  });
});
