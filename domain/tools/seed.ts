import type { Tool } from "./types";

export const seedTools: Tool[] = [
  {
    id: "breathing-478",
    title: "4-7-8 Breathing",
    description: "A short paced-breathing exercise for a moment when you want to slow down.",
    category: "breathing",
    provenance: "soothespot",
    states: ["overwhelmed", "anxious", "off"],
    durationMinutes: 2,
    instructions: ["Inhale gently for 4 seconds.", "Hold for 7 seconds.", "Exhale slowly for 8 seconds.", "Repeat up to four cycles, then check in with yourself."],
    languages: ["en", "es"]
  },
  {
    id: "five-senses",
    title: "5 Senses Grounding",
    description: "A simple present-moment exercise using what you can notice around you.",
    category: "grounding",
    provenance: "soothespot",
    states: ["overwhelmed", "anxious", "off", "sad"],
    durationMinutes: 3,
    instructions: ["Notice 5 things you can see.", "Notice 4 things you can touch.", "Notice 3 things you can hear.", "Notice 2 things you can smell.", "Notice 1 thing you can taste or imagine tasting."],
    languages: ["en", "es"],
    accessibility: ["can be done seated"]
  },
  {
    id: "walk-outside",
    title: "Walk Outside",
    description: "A brief movement reset when your body wants a change of setting.",
    category: "movement",
    provenance: "client-created",
    states: ["overwhelmed", "angry", "off", "sad"],
    durationMinutes: 5,
    instructions: ["Step outside if it is safe and practical.", "Walk at an easy pace for five minutes.", "Notice one thing that feels different from where you started."],
    languages: ["en", "es"]
  },
  {
    id: "journal-three-lines",
    title: "Three-Line Journal",
    description: "Put the moment into words without needing to write a full journal entry.",
    category: "journaling",
    provenance: "soothespot",
    states: ["sad", "anxious", "off", "angry"],
    durationMinutes: 3,
    instructions: ["Right now I feel…", "What I need most is…", "One small thing I can do next is…"],
    languages: ["en", "es"]
  },
  {
    id: "music-reset",
    title: "My Reset Playlist",
    description: "Open a playlist or song you already associate with feeling grounded.",
    category: "sensory",
    provenance: "client-created",
    states: ["sad", "off", "overwhelmed"],
    durationMinutes: 5,
    instructions: ["Choose a familiar song or playlist.", "Listen without multitasking for one song.", "Notice whether the experience changed anything for you."],
    languages: ["en", "es"]
  }
];
