import type { World } from "./types";
import { validateExperienceSpec } from "./spec";

export const worlds: World[] = [
  {
    version: 1,
    id: "ocean-calm",
    theme: "ocean",
    title: {
      en: "Ocean Calm",
      es: "Calma del océano"
    },
    description: {
      en: "A quiet breathing space with slow waves and a gentle rhythm.",
      es: "Un espacio tranquilo para respirar con olas lentas y un ritmo suave."
    },
    purpose: {
      en: "Settle your breathing without needing to count.",
      es: "Calmar la respiración sin tener que contar."
    },
    durationMinutes: 5,
    category: "breathing",
    provenance: "soothespot",
    activity: [
      { type: "ambientScene" },
      { type: "breathRhythm", inhaleSeconds: 4, holdSeconds: 0, exhaleSeconds: 6 },
      { type: "timer" },
      { type: "completion" }
    ]
  },
  {
    version: 1,
    id: "soft-focus",
    theme: "focus",
    title: {
      en: "Soft Focus",
      es: "Enfoque suave"
    },
    description: {
      en: "A low-pressure visual anchor for a few minutes of steady attention.",
      es: "Un ancla visual de baja presión para unos minutos de atención estable."
    },
    purpose: {
      en: "Give your attention one steady place to land.",
      es: "Darle a tu atención un lugar estable donde descansar."
    },
    durationMinutes: 3,
    category: "focus",
    provenance: "soothespot",
    activity: [
      { type: "ambientScene" },
      { type: "focusVisual", anchor: "light" },
      { type: "timer" },
      { type: "completion" }
    ]
  },
  {
    version: 1,
    id: "grounding-garden",
    theme: "garden",
    title: {
      en: "Grounding Garden",
      es: "Jardín para aterrizar"
    },
    description: {
      en: "Notice what is around you, one sense at a time.",
      es: "Observa lo que te rodea, un sentido a la vez."
    },
    purpose: {
      en: "Come back to the room through the five senses.",
      es: "Volver a la habitación a través de los cinco sentidos."
    },
    durationMinutes: 4,
    category: "grounding",
    provenance: "soothespot",
    activity: [
      { type: "ambientScene" },
      {
        type: "groundingPrompt",
        senses: [
          {
            sense: { en: "See", es: "Ver" },
            prompt: { en: "Find one soft edge or color.", es: "Encuentra un borde suave o un color." }
          },
          {
            sense: { en: "Hear", es: "Oír" },
            prompt: { en: "Notice one sound nearby.", es: "Nota un sonido cercano." }
          },
          {
            sense: { en: "Feel", es: "Sentir" },
            prompt: { en: "Notice one point of contact.", es: "Nota un punto de contacto." }
          },
          {
            sense: { en: "Smell", es: "Oler" },
            prompt: { en: "Notice the air as it is.", es: "Nota el aire tal como está." }
          },
          {
            sense: { en: "Taste", es: "Saborear" },
            prompt: { en: "Notice one taste or sensation.", es: "Nota un sabor o una sensación." }
          }
        ]
      },
      { type: "timer" },
      { type: "completion" }
    ]
  },
  {
    version: 1,
    id: "ripple-field",
    theme: "ripple",
    category: "sensory",
    title: { en: "Ripple Field", es: "Campo de ondas" },
    description: { en: "Touch a quiet pool of light. Let each ripple find its own edge.", es: "Toca un estanque de luz. Deja que cada onda encuentre su borde." },
    purpose: { en: "An experimental space to explore, with nothing to get right.", es: "Un espacio experimental para explorar, sin tener que hacerlo bien." },
    durationMinutes: 3,
    provenance: "soothespot",
    activity: [{ type: "ambientScene" }, { type: "rippleInteraction" }, { type: "timer" }, { type: "completion" }]
  },
  {
    version: 1,
    id: "vast-sky",
    theme: "sky",
    category: "focus",
    title: { en: "Vast Sky", es: "Cielo inmenso" },
    description: {
      en: "Trace constellations star by star, or write your own words in light. Nothing is saved.",
      es: "Traza constelaciones estrella por estrella, o escribe tus palabras en luz. Nada se guarda."
    },
    purpose: {
      en: "Give restless attention a slow, deliberate path to follow.",
      es: "Dale a la atención inquieta un camino lento y deliberado que seguir."
    },
    durationMinutes: 5,
    provenance: "soothespot",
    activity: [
      { type: "ambientScene" },
      { type: "focusVisual", anchor: "light" },
      { type: "timer" },
      { type: "completion" }
    ]
  }
].map(validateExperienceSpec);
