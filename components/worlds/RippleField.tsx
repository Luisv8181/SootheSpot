"use client";

import { useRef, useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import { WorldScene } from "./WorldScene";

export function RippleField({ language, paused, complete, onInteract }: { language: Language; paused: boolean; complete: boolean; onInteract: () => void }) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const nextId = useRef(0);
  return <div className="ripple-experiment">
    <button className="ripple-surface" aria-label={language === "en" ? "Place a ripple" : "Crear una onda"} disabled={paused || complete} onClick={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const keyboard = event.detail === 0;
      const x = keyboard ? 50 : Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100));
      const y = keyboard ? 50 : Math.max(0, Math.min(100, (event.clientY - bounds.top) / bounds.height * 100));
      setRipples((current) => [...current.slice(-7), { id: nextId.current++, x, y }]);
      onInteract();
    }}>
      <WorldScene id="ripple-field" />
      {ripples.map((ripple) => <span key={ripple.id} className="ripple-mark" style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }} aria-hidden="true"><span /><span /><span /></span>)}
    </button>
    <button className="world-text-button" onClick={() => setRipples([])}>{language === "en" ? "Clear ripples" : "Borrar ondas"}</button>
  </div>;
}
