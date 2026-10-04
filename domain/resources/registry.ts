import rawResources from "../../resources/resources.json";
import rawBooks from "../../resources/books.json";
import type { Resource } from "./types";

export type ResourceShelf =
  | "Read"
  | "Listen"
  | "Practice"
  | "Watch"
  | "Sleep & Rest"
  | "Understand Yourself"
  | "Reach Out";

export const resourceRegistry = [...(rawResources as Resource[]), ...(rawBooks as Resource[])];

const shelfTags: Record<ResourceShelf, string[]> = {
  "Read": ["read", "book", "article", "psychoeducation"],
  "Listen": ["audio", "guided-meditation", "listen"],
  "Practice": ["practice", "breathing", "grounding", "mindfulness", "relaxation"],
  "Watch": ["watch", "video", "video-series"],
  "Sleep & Rest": ["sleep", "insomnia", "wind-down", "rest"],
  "Understand Yourself": ["psychoeducation", "anxiety", "mood", "stress", "trauma", "grief", "relationships"],
  "Reach Out": ["support", "social-support", "when-to-seek-help", "find-help"]
};

export function getResourceShelves(resource: Resource): ResourceShelf[] {
  const tags = new Set(resource.tags.map((tag) => tag.toLowerCase()));
  return (Object.entries(shelfTags) as [ResourceShelf, string[]][])
    .filter(([, required]) => required.some((tag) => tags.has(tag)))
    .map(([shelf]) => shelf);
}

export function getResourcesByShelf(shelf: ResourceShelf, language?: string) {
  return resourceRegistry.filter((resource) => {
    const languageMatch =
      !language ||
      resource.languages?.some((item) => item.toLowerCase() === language.toLowerCase());
    return (
      languageMatch &&
      resource.review_status !== "deprecated" &&
      getResourceShelves(resource).includes(shelf)
    );
  });
}

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

export function retrieveResources(options: {
  need?: string;
  shelf?: ResourceShelf;
  language?: string;
  availableMinutes?: number;
}) {
  const query = options.need?.trim().toLowerCase() ?? "";
  const candidates = options.shelf
    ? getResourcesByShelf(options.shelf, options.language)
    : searchResources("", options.language);

  return candidates.filter((resource) => {
    const haystack = [
      resource.name,
      resource.description,
      ...resource.tags,
      ...(resource.use_context ?? [])
    ].join(" ").toLowerCase();

    const needMatch = !query || haystack.includes(query);
    const durationMatch =
      options.availableMinutes === undefined ||
      resource.duration_options_minutes === undefined ||
      resource.duration_options_minutes.some((minutes) => minutes <= options.availableMinutes!);

    return needMatch && durationMatch;
  });
}
