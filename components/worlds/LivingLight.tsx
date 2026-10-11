"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import { clampLightGesture, type LightGesture } from "@/domain/worlds/livingLight";
import { createLightEngine } from "./lightEngine";
import { LightArtwork } from "./LightArtwork";
import { LightSound } from "./LightSound";
import "./livingLight.css";

const initial: LightGesture = { x: .5, y: .5, held: false, spread: 1, rotation: 0 };
export function LivingLight({ language, running, paused, complete, still, sampleTime, onInteract }: { language: Language; running: boolean; paused: boolean; complete: boolean; still: boolean; sampleTime: () => number; onInteract: () => void }) {
  const en = language === "en";
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ReturnType<typeof createLightEngine> | null>(null);
  const clock = useRef(sampleTime); clock.current = sampleTime;
  const [gesture, setGesture] = useState(initial);
  const gestureRef = useRef(gesture);
  const [fallback, setFallback] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; angle: number; spread: number; rotation: number } | null>(null);
  const disabled = paused || complete;
  const change = useCallback((next: LightGesture) => { const value = clampLightGesture(next); gestureRef.current = value; setGesture(value); engine.current?.gesture(value); }, []);
  useEffect(() => { if (!canvas.current) return; try { engine.current = createLightEngine(canvas.current, () => clock.current()); } catch { setFallback(true); } return () => { engine.current?.destroy(); engine.current = null; }; }, []);
  useEffect(() => { engine.current?.motion(running && !complete, still); if (!running || complete) { pointers.current.clear(); pinch.current = null; change({ ...gestureRef.current, held: false }); } }, [running, complete, still, change]);
  function pointer(event: React.PointerEvent<HTMLButtonElement>) {
    if (disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointers.current.set(event.pointerId, { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
    const values = Array.from(pointers.current.values()).slice(0, 2);
    let next = { ...gestureRef.current, ...values[0], held: true };
    if (values.length === 2) {
      const dx = (values[1].x - values[0].x) * rect.width, dy = (values[1].y - values[0].y) * rect.height;
      const distance = Math.max(1, Math.hypot(dx, dy)), angle = Math.atan2(dy, dx);
      pinch.current ??= { distance, angle, spread: next.spread, rotation: next.rotation };
      next = { ...next, x: (values[0].x + values[1].x) / 2, y: (values[0].y + values[1].y) / 2, spread: pinch.current.spread * distance / pinch.current.distance, rotation: pinch.current.rotation + Math.atan2(Math.sin(angle - pinch.current.angle), Math.cos(angle - pinch.current.angle)) };
    }
    change(next); onInteract();
  }
  function release(id: number) { pointers.current.delete(id); pinch.current = null; change({ ...gestureRef.current, held: pointers.current.size > 0 }); }
  return <section className="living-light" data-renderer={fallback ? "fallback" : "canvas"} data-held={String(gesture.held)} data-spread={gesture.spread.toFixed(2)}>
    <button className="light-field" aria-label={en ? "Shape the light" : "Moldear la luz"} aria-describedby="light-instructions" disabled={disabled}
      onPointerDown={event => { if (pointers.current.size >= 2) return; event.currentTarget.setPointerCapture(event.pointerId); setKeyboard(false); pointer(event); }}
      onPointerMove={event => { if (pointers.current.has(event.pointerId)) pointer(event); }}
      onPointerUp={event => release(event.pointerId)} onPointerCancel={event => release(event.pointerId)} onLostPointerCapture={event => { if (pointers.current.has(event.pointerId)) release(event.pointerId); }}
      onKeyDown={event => { if (!event.key.startsWith("Arrow")) return; event.preventDefault(); setKeyboard(true); change({ ...gestureRef.current, x: gestureRef.current.x + (event.key === "ArrowRight" ? .05 : event.key === "ArrowLeft" ? -.05 : 0), y: gestureRef.current.y + (event.key === "ArrowDown" ? .05 : event.key === "ArrowUp" ? -.05 : 0) }); onInteract(); }}
      onClick={event => { if (event.detail === 0) { setKeyboard(true); change({ ...gestureRef.current, held: !gestureRef.current.held }); onInteract(); } }}>
      {fallback && <LightArtwork gesture={gesture} />}
      <canvas ref={canvas} aria-hidden="true" className="light-canvas" hidden={fallback} />
      {keyboard && <span className="light-cursor" style={{ left: `${gesture.x * 100}%`, top: `${gesture.y * 100}%` }} aria-hidden="true" />}
    </button>
    <div className="light-caption"><p className="light-invitation">{complete ? en ? "Let the light rest." : "Deja que la luz descanse." : paused ? en ? "Everything can wait." : "Todo puede esperar." : gesture.held ? en ? "Let it gather. Let it go." : "Deja que se reúna. Déjala ir." : en ? "Move gently. See what takes shape." : "Muévete con suavidad. Mira qué forma aparece."}</p>
      <p id="light-instructions">{en ? "Sweep to guide a current. Hold to gather a bloom; release to unfurl. Two fingers open or turn it." : "Guía una corriente. Mantén para reunir una flor; suelta para abrirla. Dos dedos la abren o giran."} {fallback ? en ? "Still light is available here." : "Aquí puedes moldear luz quieta." : ""}</p>
      <p className="light-key-hint">{en ? "Arrows move. Enter or Space gathers/releases. Nothing is saved." : "Las flechas mueven. Intro o Espacio reúnen o sueltan. No se guarda nada."}</p>
      <div className="light-tools">
        <button className="world-secondary" aria-pressed={gesture.held} disabled={disabled} onClick={() => { change({ ...gestureRef.current, held: !gestureRef.current.held }); onInteract(); }}>{gesture.held ? en ? "Release bloom" : "Soltar la flor" : en ? "Gather a bloom" : "Reunir una flor"}</button>
        <label>{en ? "Openness" : "Apertura"}<input aria-label={en ? "Light openness" : "Apertura de luz"} type="range" min="50" max="180" value={Math.round(gesture.spread * 100)} disabled={disabled} onChange={event => { change({ ...gestureRef.current, spread: Number(event.target.value) / 100 }); onInteract(); }} /></label>
        <button className="light-turn" disabled={disabled} onClick={() => { const rotation = gestureRef.current.rotation + Math.PI / 6; change({ ...gestureRef.current, rotation: rotation > Math.PI ? rotation - Math.PI * 2 : rotation }); onInteract(); }}>{en ? "Turn gently" : "Girar suavemente"}</button>
      </div>
      <LightSound language={language} running={running} complete={complete} held={gesture.held} spread={gesture.spread} onStart={onInteract} />
    </div>
  </section>;
}
