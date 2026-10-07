import rawResources from "../../resources/resources.json";
import rawBooks from "../../resources/books.json";
import type { Resource } from "./types";

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

const shelfMatchers: Record<ResourceShelf, string[]> = {
  Read: ["read", "book", "article", "article-library", "educational-resource"],
  Listen: ["audio", "guided-meditation", "podcast"],
  Practice: ["practice", "exercise", "meditation", "mindfulness", "coping", "cbt", "act"],
  Watch: ["watch", "video"],
  "Sleep & Rest": ["sleep", "insomnia", "rest", "relaxation"],
  "Understand Yourself": ["psychoeducation", "education", "understand", "self-help", "mood", "anxiety", "stress", "trauma"],
  "Reach Out": ["support", "social-support", "when-to-seek-help", "help", "treatment"]
};

export function getResourceShelves(resource: Resource): ResourceShelf[] {
  const haystack = [
    resource.resource_type,
    resource.name,
    resource.description,
    ...resource.tags,
    ...(resource.use_context ?? [])
  ].join(" ").toLowerCase();

  return resourceShelves.filter((shelf) =>
    shelfMatchers[shelf].some((term) => haystack.includes(term.toLowerCase()))
  );
}

export function searchResources(query: string, language?: string, shelf?: ResourceShelf, need?: string, maxMinutes?: number) {
  const q = query.trim().toLowerCase();
  const n = need?.trim().toLowerCase();

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
    const needMatch = !n || haystack.includes(n);
    const languageMatch = !language || resource.languages?.some((item) => item.toLowerCase() === language.toLowerCase());
    const shelfMatch = !shelf || getResourceShelves(resource).includes(shelf);
    const durationMatch =
      maxMinutes === undefined ||
      !resource.duration_options_minutes?.length ||
      resource.duration_options_minutes.some((minutes) => minutes <= maxMinutes);

    return queryMatch && needMatch && languageMatch && shelfMatch && durationMatch && resource.review_status !== "deprecated";
  });
}
