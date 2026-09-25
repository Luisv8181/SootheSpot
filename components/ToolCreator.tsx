"use client";

import { useState } from "react";
import type { CheckInState, Tool } from "@/domain/tools/types";
import { createCustomTool } from "@/domain/tools/custom";

const states: Array<{ id: CheckInState; label: string }> = [
  { id: "off", label: "A bit off" },
  { id: "overwhelmed", label: "Overwhelmed" },
  { id: "anxious", label: "Anxious" },
  { id: "sad", label: "Sad" },
  { id: "angry", label: "Angry" }
];

export function ToolCreator({ onCreate, onClose }: { onCreate: (tool: Tool) => void; onClose: () => void }) {
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
        languages: ["en"]
      });
      onCreate(tool);
    } catch {
      setError("Add a title, description, at least one instruction, and one feeling this tool can help with.");
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="create-tool-title">
      <div className="modal creator-modal">
        <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow">Your toolbox</p>
        <h2 id="create-tool-title">Create a tool that is yours</h2>
        <p className="hero-copy">Capture something you already know helps you. SootheSpot does not decide whether it is clinically appropriate.</p>

        <div className="form-grid">
          <label>Tool name<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Call a friend" /></label>
          <label>What is it?<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description" rows={3} /></label>
          <div className="form-row">
            <label>Category<input value={category} onChange={(e) => setCategory(e.target.value)} /></label>
            <label>Minutes<input type="number" min="1" max="180" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="5" /></label>
          </div>
          <label>Steps, one per line<textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5} placeholder={"Put headphones on\nCall someone I trust\nStay connected for five minutes"} /></label>
          <fieldset>
            <legend>When might it help?</legend>
            <div className="state-picker">
              {states.map((item) => (
                <label key={item.id} className="state-chip">
                  <input type="checkbox" checked={selectedStates.includes(item.id)} onChange={() => toggleState(item.id)} />
                  {item.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" onClick={submit}>Add to My Toolbox</button>
      </div>
    </div>
  );
}
