import type { Tool } from "@/domain/tools/types";
import type { Language } from "./copy";

type Translation = {
  title: string;
  description: string;
  instructions: string[];
};

const translations: Record<string, Partial<Record<Language, Translation>>> = {
  "breathing-478": {
    es: {
      title: "Respiración 4-7-8",
      description: "Un ejercicio breve de respiración guiada para un momento en que quieras bajar el ritmo.",
      instructions: ["Inhala suavemente durante 4 segundos.", "Mantén el aire durante 7 segundos.", "Exhala lentamente durante 8 segundos.", "Repite hasta cuatro ciclos y luego nota cómo te sientes."]
    }
  },
  "five-senses": {
    es: {
      title: "Anclaje de los 5 sentidos",
      description: "Un ejercicio sencillo para volver al presente usando lo que puedes notar a tu alrededor.",
      instructions: ["Observa 5 cosas que puedas ver.", "Observa 4 cosas que puedas tocar.", "Escucha 3 sonidos.", "Nota 2 olores.", "Nota 1 sabor o imagina un sabor."]
    }
  },
  "walk-outside": {
    es: {
      title: "Caminar afuera",
      description: "Un breve cambio de movimiento y entorno cuando tu cuerpo necesita un reinicio.",
      instructions: ["Sal afuera si es seguro y práctico.", "Camina a un ritmo cómodo durante cinco minutos.", "Nota una cosa que se sienta diferente de cuando empezaste."]
    }
  },
  "journal-three-lines": {
    es: {
      title: "Diario de tres líneas",
      description: "Pon el momento en palabras sin tener que escribir una entrada completa.",
      instructions: ["Ahora mismo siento…", "Lo que más necesito es…", "Una cosa pequeña que puedo hacer después es…"]
    }
  },
  "music-reset": {
    es: {
      title: "Mi lista para reiniciarme",
      description: "Abre una canción o lista que ya asocies con sentirte más estable.",
      instructions: ["Elige una canción o lista conocida.", "Escucha una canción sin hacer otras cosas.", "Nota si la experiencia cambió algo para ti."]
    }
  }
};

export function localizeTool(tool: Tool, language: Language): Tool {
  const translated = translations[tool.id]?.[language];
  if (!translated) return tool;
  return { ...tool, ...translated };
}
