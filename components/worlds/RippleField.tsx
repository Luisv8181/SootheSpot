"use client";

import { useRef, useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import { appendRipple, type Ripple } from "@/domain/worlds/water";
import { WaterCanvas } from "./WaterCanvas";

export function RippleField({ language, paused, complete, running, still, sampleTime, onInteract }: {
  language: Language; paused: boolean; complete: boolean; running: boolean; still: boolean; sampleTime: () => number; onInteract: () => void;
}) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [point, setPoint] = useState({ x: .5, y: .5 });
  const [keyboard, setKeyboard] = useState(false);
  const lastDrag = useRef({ at: 0, x: 0, y: 0 });
  const disabled = paused || complete;
  const visibleRipples = ripples.filter((ripple) => sampleTime() - ripple.born < 12);
  function place(x: number, y: number) {
    if (disabled) return;
    setRipples((current) => appendRipple(current, x, y, sampleTime()));
    onInteract();
  }
  return <div className="ripple-experiment">
    <button className="ripple-surface" aria-label={language === "en" ? "Place a ripple" : "Crear una onda"} aria-describedby="ripple-instructions" disabled={disabled}
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        setKeyboard(true);
        setPoint((current) => ({ x: Math.round(Math.max(0, Math.min(1, current.x + (event.key === "ArrowRight" ? .05 : event.key === "ArrowLeft" ? -.05 : 0))) * 100) / 100, y: Math.round(Math.max(0, Math.min(1, current.y + (event.key === "ArrowDown" ? .05 : event.key === "ArrowUp" ? -.05 : 0))) * 100) / 100 }));
      }}
      onPointerDown={(event) => {
        setKeyboard(false);
        const bounds = event.currentTarget.getBoundingClientRect();
        lastDrag.current = { at: Date.now(), x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (event.buttons !== 1 || disabled) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        if (Date.now() - lastDrag.current.at < 90 || Math.hypot(x - lastDrag.current.x, y - lastDrag.current.y) < .03) return;
        lastDrag.current = { at: Date.now(), x, y };
        place(x, y);
      }}
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.detail === 0) { setKeyboard(true); place(point.x, point.y); }
        else place((event.clientX - bounds.left) / bounds.width, (event.clientY - bounds.top) / bounds.height);
      }}>
      <WaterCanvas kind="pool" running={running} still={still} sampleTime={sampleTime} ripples={visibleRipples} />
      {visibleRipples.map((ripple, index) => <span key={`${ripple.born}-${index}`} className="ripple-mark" style={{ left: `${ripple.x * 100}%`, top: `${ripple.y * 100}%` }} aria-hidden="true" />)}
      {keyboard && <span className="ripple-cursor" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }} aria-hidden="true" />}
    </button>
    <button className="world-text-button" onClick={() => setRipples([])}>{language === "en" ? "Clear ripples" : "Borrar ondas"}</button>
    <span className="sr-only" role="status">{ripples.length > 0 ? (language === "en" ? "Ripple placed." : "Onda creada.") : ""}</span>
  </div>;
}
