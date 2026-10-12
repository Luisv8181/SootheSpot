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
  },
  {
    version: 1,
    id: "quiet-rain",
    theme: "rain",
    category: "sensory",
    title: { en: "Quiet Rain", es: "Lluvia tranquila" },
    description: { en: "A sheltered window, a misty valley. Slowly clear the glass, or simply watch the rain.", es: "Una ventana protegida y un valle entre la niebla. Despeja el cristal despacio o solo observa la lluvia." },
    purpose: { en: "Let your hands slow down. There is nothing to finish.", es: "Deja que tus manos vayan despacio. No hay nada que terminar." },
    durationMinutes: 4,
    provenance: "soothespot",
    activity: [{ type: "ambientScene" }, { type: "glassInteraction" }, { type: "timer" }, { type: "completion" }]
  },
  {
    version: 1, id: "living-light", theme: "light", category: "sensory",
    title: { en: "Living Light", es: "Luz viva" },
    description: { en: "Strum flowing threads of light. Hold a bloom, then let it unfurl. Sound is optional.", es: "Toca hilos de luz. Reúne una flor y deja que se abra. El sonido es opcional." },
    purpose: { en: "A living material to explore at your own pace.", es: "Un material vivo para explorar a tu propio ritmo." },
    durationMinutes: 4, provenance: "soothespot",
    activity: [{ type: "ambientScene" }, { type: "lightInteraction" }, { type: "timer" }, { type: "completion" }]
  },
  {
    version: 1, id: "quiet-sanctuary", theme: "sanctuary", category: "sensory",
    title: { en: "Quiet Sanctuary", es: "Refugio tranquilo" },
    description: { en: "Explore a quiet pool, a musical arch, and soft flowers. Sound is optional.", es: "Explora un estanque tranquilo, un arco musical y flores suaves. El sonido es opcional." },
    purpose: { en: "Explore a sheltered sensory space at your own pace.", es: "Explora un espacio sensorial protegido a tu propio ritmo." },
    durationMinutes: 4, provenance: "soothespot",
    activity: [{ type: "ambientScene" }, { type: "sanctuaryInteraction" }, { type: "timer" }, { type: "completion" }]
  }
].map(validateExperienceSpec);
