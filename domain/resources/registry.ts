import rawResources from "../../resources/resources.json";
import type { Resource } from "./types";

export const resourceRegistry = rawResources as Resource[];

export function searchResources(query: string, language?: string) {
  const q = query.trim().toLowerCase();

  return resourceRegistry.filter((resource) => {
    const haystack = [
      resource.name,
      resource.publisher,
      resource.description,
      ...resource.tags
    ].join(" ").toLowerCase();

    const queryMatch = !q || haystack.includes(q);
    const languageMatch =
      !language ||
      resource.languages?.some((item) => item.toLowerCase() === language.toLowerCase());

    return queryMatch && languageMatch && resource.review_status !== "deprecated";
  });
}
