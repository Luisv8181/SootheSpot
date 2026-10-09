import rawResources from "../../resources/resources.json";
import rawBooks from "../../resources/books.json";
import type { Resource, ResourceNeed, ResourceShelfId } from "./types";

export const resourceRegistry = [...(rawResources as Resource[]), ...(rawBooks as Resource[])];

export const resourceShelves = [
  "Read",
  "Listen",
  "Practice",
  "Watch",
  "Sleep & Rest",
  "Understand Yourself",
  "Reach Out"
] as const;

export type ResourceShelf = (typeof resourceShelves)[number];

export const shelfIds: Record<ResourceShelf, ResourceShelfId> = {
  Read: "read",
  Listen: "listen",
  Practice: "practice",
  Watch: "watch",
  "Sleep & Rest": "sleep-rest",
  "Understand Yourself": "understand-yourself",
  "Reach Out": "reach-out"
};

export const shelfIcons: Record<ResourceShelf, string> = {
  Read: "▤",
  Listen: "◉",
  Practice: "✦",
  Watch: "▷",
  "Sleep & Rest": "☾",
  "Understand Yourself": "◌",
  "Reach Out": "↗"
};

export const shelfDescriptions: Record<ResourceShelf, string> = {
  Read: "Books, articles, and clear explanations.",
  Listen: "Guided audio and quiet practices.",
  Practice: "Things you can actually try right now.",
  Watch: "Short videos and visual guidance.",
  "Sleep & Rest": "Wind down, rest, and learn about sleep.",
  "Understand Yourself": "Make sense of stress, mood, and patterns.",
  "Reach Out": "Find people, programs, and professional support."
};

const legacyShelfMatchers: Record<ResourceShelf, string[]> = {
  Read: ["read", "book", "article", "article-library", "educational-resource"],
  Listen: ["audio", "guided-meditation", "podcast"],
  Practice: ["practice", "exercise", "meditation", "mindfulness", "coping", "cbt", "act"],
  Watch: ["watch", "video"],
  "Sleep & Rest": ["sleep", "insomnia", "rest", "relaxation"],
  "Understand Yourself": ["psychoeducation", "education", "understand", "self-help", "mood", "anxiety", "stress", "trauma"],
  "Reach Out": ["support", "social-support", "when-to-seek-help", "help", "treatment"]
};

function hasTerm(haystack: string, term: string) {
  return haystack.includes(term.toLowerCase());
}

function legacyShelves(resource: Resource): ResourceShelf[] {
  const haystack = [
    resource.resource_type,
    resource.name,
    resource.description,
    ...resource.tags,
    ...(resource.use_context ?? [])
  ].join(" ").toLowerCase();

  return resourceShelves.filter((shelf) =>
    legacyShelfMatchers[shelf].some((term) => hasTerm(haystack, term))
  );
}

export function getResourceShelves(resource: Resource): ResourceShelf[] {
  if (resource.shelf) {
    const explicitIds = new Set([resource.shelf, ...(resource.shelves ?? [])]);
    return resourceShelves.filter((candidate) => explicitIds.has(shelfIds[candidate]));
  }
  return legacyShelves(resource);
}

export function getResourceShelfLabels(resource: Resource): ResourceShelf[] {
  // Explicit primary and secondary shelf metadata is authoritative. Do not
  // silently add keyword-derived shelf labels to a mapped resource.
  return getResourceShelves(resource);
}

function resourceMatchesNeed(resource: Resource, need: string): boolean {
  const normalized = need.trim().toLowerCase();
  if (!normalized) return true;
  if (resource.needs) return resource.needs.some((item) => item.toLowerCase() === normalized);

  // Preserve useful compatibility while the catalog migrates to explicit needs.
  const haystack = [
    resource.name,
    resource.description,
    ...resource.tags,
    ...(resource.use_context ?? [])
  ].join(" ").toLowerCase();
  return hasTerm(haystack, normalized);
}

export function searchResources(
  query: string,
  language?: string,
  shelf?: ResourceShelf,
  need?: string,
  maxMinutes?: number,
  population?: string
) {
  const q = query.trim().toLowerCase();
  const p = population?.trim().toLowerCase();

  return resourceRegistry.filter((resource) => {
    const haystack = [
      resource.name,
      resource.publisher,
      resource.description,
      ...resource.tags,
      ...(resource.intended_population ?? []),
      ...(resource.use_context ?? [])
    ].join(" ").toLowerCase();

    const queryMatch = !q || haystack.includes(q);
    const needMatch = !need || resourceMatchesNeed(resource, need);
    const languageMatch = !language || resource.languages?.some((item) => item.toLowerCase() === language.toLowerCase());
    const shelfMatch = !shelf || getResourceShelves(resource).includes(shelf);
    const populationMatch = !p || resource.intended_population?.some((item) => item.toLowerCase() === p);
    // A duration cap is a real constraint. Unknown duration is not a match.
    const durationMatch =
      maxMinutes === undefined ||
      (resource.duration_options_minutes?.some((minutes) => minutes <= maxMinutes) ?? false);

    return queryMatch && needMatch && languageMatch && shelfMatch && populationMatch && durationMatch && resource.review_status !== "deprecated";
  });
}
