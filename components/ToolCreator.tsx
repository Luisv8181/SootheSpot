"use client";

import { useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import type { CheckInState, Tool } from "@/domain/tools/types";
import { createCustomTool } from "@/domain/tools/custom";

const labels = {
  en: {
    eyebrow: "Your toolbox",
    title: "Create a tool that is yours",
    intro: "Capture something you already know helps you. SootheSpot does not decide whether it is clinically appropriate.",
    name: "Tool name",
    what: "What is it?",
    category: "Category",
    minutes: "Minutes",
    steps: "Steps, one per line",
    when: "When might it help?",
    submit: "Add to My Toolbox",
    error: "Add a title, description, at least one instruction, and one feeling this tool can help with.",
    states: { off: "A bit off", overwhelmed: "Overwhelmed", anxious: "Anxious", sad: "Sad", angry: "Angry" }
  },
  es: {
    eyebrow: "Tu caja de herramientas",
    title: "Crea una herramienta que sea tuya",
    intro: "Guarda algo que ya sabes que te ayuda. SootheSpot no decide si es clínicamente apropiado.",
    name: "Nombre de la herramienta",
    what: "¿Qué es?",
    category: "Categoría",
    minutes: "Minutos",
    steps: "Pasos, uno por línea",
    when: "¿Cuándo podría ayudarte?",
    submit: "Añadir a mi caja de herramientas",
    error: "Añade un nombre, una descripción, al menos un paso y una emoción o situación en la que pueda ayudarte.",
    states: { off: "Algo no está bien", overwhelmed: "Abrumado/a", anxious: "Con ansiedad", sad: "Triste", angry: "Enojado/a" }
  }
} as const;

const states: CheckInState[] = ["off", "overwhelmed", "anxious", "sad", "angry"];

export function ToolCreator({
  onCreate,
  onClose,
  language
}: {
  onCreate: (tool: Tool) => void;
  onClose: () => void;
  language: Language;
}) {
  const t = labels[language];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("coping");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedStates, setSelectedStates] = useState<CheckInState[]>(["off"]);
  const [error, setError] = useState("");

  function toggleState(state: CheckInState) {
    setSelectedStates((current) =>
      current.includes(state) ? current.filter((item) => item !== state) : [...current, state]
    );
  }

  function submit() {
    try {
      const tool = createCustomTool({
        title,
        description,
        category,
        durationMinutes: duration ? Number(duration) : undefined,
        instructions: instructions.split("\n").map((line) => line.trim()).filter(Boolean),
        states: selectedStates,
        languages: [language]
      });
      onCreate(tool);
    } catch {
      setError(t.error);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="create-tool-title">
      <div className="modal creator-modal">
        <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 id="create-tool-title">{t.title}</h2>
        <p className="hero-copy">{t.intro}</p>

        <div className="form-grid">
          <label>{t.name}<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={language === "en" ? "Call a friend" : "Llamar a una amiga"} /></label>
          <label>{t.what}<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={language === "en" ? "A short description" : "Una descripción breve"} rows={3} /></label>
          <div className="form-row">
            <label>{t.category}<input value={category} onChange={(e) => setCategory(e.target.value)} /></label>
            <label>{t.minutes}<input type="number" min="1" max="180" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="5" /></label>
          </div>
          <label>{t.steps}<textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5} /></label>
          <fieldset>
            <legend>{t.when}</legend>
            <div className="state-picker">
              {states.map((item) => (
                <label key={item} className="state-chip">
                  <input type="checkbox" checked={selectedStates.includes(item)} onChange={() => toggleState(item)} />
                  {t.states[item as keyof typeof t.states]}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" onClick={submit}>{t.submit}</button>
      </div>
    </div>
  );
}
