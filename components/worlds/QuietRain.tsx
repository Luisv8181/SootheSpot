"use client";

import { useEffect, useRef, useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import { rainArtwork } from "./rainArtwork";
import { createRainEngine } from "./rainEngine";
import { RainSound } from "./RainSound";
import "./quietRain.css";

export function QuietRain({ language, running, paused, complete, still, sampleTime, onInteract }: { language: Language; running: boolean; paused: boolean; complete: boolean; still: boolean; sampleTime: () => number; onInteract: () => void }) {
  const en = language === "en";
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const engine = useRef<ReturnType<typeof createRainEngine> | null>(null);
  const clock = useRef(sampleTime); clock.current = sampleTime;
  const motion = useRef({ running, still }); motion.current = { running, still };
  const [artwork, setArtwork] = useState("loading");
  const [fallback, setFallback] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [point, setPoint] = useState({ x: .5, y: .5 });
  const [touched, setTouched] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const disabled = paused || complete || fallback;
  useEffect(() => {
    const img = image.current;
    if (!img) return;
    let disposed = false;
    function initialize() {
      if (disposed || !canvas.current || !img || !img.naturalWidth) return;
      setArtwork("ready");
      try { engine.current?.destroy(); engine.current = createRainEngine(canvas.current, img, () => clock.current()); engine.current.setMotion(motion.current.running, motion.current.still); }
      catch { setFallback(true); }
    }
    function failed() { setArtwork("unavailable"); setFallback(true); }
    img.addEventListener("load", initialize); img.addEventListener("error", failed);
    if (img.complete) { if (img.naturalWidth) initialize(); else failed(); }
    return () => { disposed = true; img.removeEventListener("load", initialize); img.removeEventListener("error", failed); engine.current?.destroy(); engine.current = null; };
  }, []);
  useEffect(() => { engine.current?.setMotion(running && !complete, still); if (paused || complete) drag.current = null; }, [running, complete, still, paused]);
  function clear(x: number, y: number) {
    if (disabled || artwork !== "ready") return;
    engine.current?.mark(x, y); setTouched(true); onInteract();
  }
  function location(event: React.PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  }
  return <section className="quiet-rain" data-artwork={artwork} data-renderer={fallback ? "fallback" : "canvas"}>
    <button className="rain-window" disabled={disabled || artwork !== "ready"} aria-label={en ? "Clear the glass" : "Despejar el cristal"} aria-describedby="rain-instructions"
      onPointerDown={event => { const p = location(event); drag.current = { id: event.pointerId, ...p }; event.currentTarget.setPointerCapture(event.pointerId); setKeyboard(false); clear(p.x, p.y); }}
      onPointerMove={event => { if (drag.current?.id !== event.pointerId) return; const p = location(event); const rect = event.currentTarget.getBoundingClientRect(); if (Math.hypot((p.x - drag.current.x) * rect.width, (p.y - drag.current.y) * rect.height) < 8) return; drag.current = { id: event.pointerId, ...p }; clear(p.x, p.y); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
      onKeyDown={event => { if (!event.key.startsWith("Arrow")) return; event.preventDefault(); setKeyboard(true); setPoint(current => ({ x: Math.max(.03, Math.min(.97, current.x + (event.key === "ArrowRight" ? .06 : event.key === "ArrowLeft" ? -.06 : 0))), y: Math.max(.03, Math.min(.97, current.y + (event.key === "ArrowDown" ? .06 : event.key === "ArrowUp" ? -.06 : 0))) })); }}
      onClick={event => { if (event.detail === 0) { setKeyboard(true); clear(point.x, point.y); } }}>
      <picture><source media="(max-width: 640px)" srcSet={rainArtwork.portrait.src} /><img ref={image} className="rain-artwork" src={rainArtwork.rain.src} alt="" width={rainArtwork.rain.width} height={rainArtwork.rain.height} decoding="async" /></picture>
      <canvas ref={canvas} className="rain-glass" aria-hidden="true" />
      {keyboard && !disabled && <span className="rain-cursor" style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }} aria-hidden="true" />}
    </button>
    <div className="rain-caption">
      <p className="rain-invitation">{complete ? en ? "You can leave the window as it is." : "Puedes dejar la ventana tal como está." : paused ? en ? "The rain can wait." : "La lluvia puede esperar." : en ? "A little space to see through." : "Un pequeño espacio para mirar."}</p>
      <p id="rain-instructions">{fallback ? en ? "The window is still. Glass interaction is unavailable here; you can stay and rest." : "La ventana está quieta. No se puede despejar el cristal aquí; puedes quedarte y descansar." : artwork === "loading" ? en ? "Opening the window…" : "Abriendo la ventana…" : en ? "Slowly sweep the glass, or just watch. Arrow keys move; Enter or Space clears. Nothing is saved." : "Desliza despacio o solo observa. Las flechas mueven; Intro o Espacio despejan. No se guarda nada."}</p>
      <button className="rain-refog" disabled={complete || !touched} onClick={() => { engine.current?.reset(); setTouched(false); }}>{en ? "Let the glass mist over" : "Dejar que vuelva la niebla"}</button>
      <span className="sr-only" role="status">{touched ? en ? "A small part of the glass is clear." : "Una pequeña parte del cristal está despejada." : ""}</span>
      <RainSound language={language} running={running} complete={complete} onStart={onInteract} />
    </div>
  </section>;
}
