"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/domain/i18n/copy";

type Engine = { context: AudioContext; gain: GainNode; voices: OscillatorNode[] };
export function LightSound({ language, running, complete, held, spread, onStart }: { language: Language; running: boolean; complete: boolean; held: boolean; spread: number; onStart: () => void }) {
  const en = language === "en";
  const [enabled, setEnabled] = useState(false), [volume, setVolume] = useState(25), [error, setError] = useState(false);
  const engine = useRef<Engine | null>(null);
  const sequence = useRef(0);
  const active = useRef(running && !complete); active.current = running && !complete;
  const dispose = useCallback(() => { sequence.current++; const current = engine.current; engine.current = null; if (!current) return; current.voices.forEach(voice => { voice.stop(); voice.disconnect(); }); current.gain.disconnect(); void current.context.close().catch(() => {}); }, []);
  useEffect(() => {
    if (complete) { dispose(); setEnabled(false); return; }
    const current = engine.current; if (!current) return;
    void (running && !document.hidden ? current.context.resume() : current.context.suspend()).catch(() => { if (engine.current !== current) return; dispose(); setEnabled(false); setError(true); });
  }, [running, complete, dispose]);
  useEffect(() => { const current = engine.current; if (!current) return; current.gain.gain.setTargetAtTime(volume / 100 * (held ? .038 : .022), current.context.currentTime, .5); current.voices.forEach((voice, index) => voice.detune.setTargetAtTime((spread - 1) * 14 * (index - 1), current.context.currentTime, .5)); }, [held, spread, volume, enabled]);
  useEffect(() => { function hide() { if (document.hidden) void engine.current?.context.suspend().catch(() => {}); } document.addEventListener("visibilitychange", hide); return () => { document.removeEventListener("visibilitychange", hide); dispose(); }; }, [dispose]);
  async function toggle() {
    if (enabled) { dispose(); setEnabled(false); setError(false); return; }
    dispose(); const id = sequence.current; let context: AudioContext | null = null;
    try {
      context = new AudioContext({ latencyHint: "playback" }); const gain = context.createGain(); gain.gain.value = 0; gain.connect(context.destination);
      engine.current = { context, gain, voices: [] };
      for (const frequency of [174.61, 261.63, 349.23]) { const voice = context.createOscillator(); voice.type = "sine"; voice.frequency.value = frequency; voice.connect(gain); voice.start(); engine.current.voices.push(voice); }
      setEnabled(true); setError(false); onStart(); await context.resume();
      if (id !== sequence.current) return;
      if (!active.current || document.hidden) await context.suspend();
    } catch { if (id !== sequence.current) return; dispose(); if (context && context.state !== "closed") void context.close().catch(() => {}); setEnabled(false); setError(true); }
  }
  return <div className="light-audio">
    <button className="world-secondary" aria-label={en ? "Light sound" : "Sonido de luz"} aria-pressed={enabled} disabled={complete} onClick={() => { void toggle(); }}>{en ? "Sound" : "Sonido"} · {enabled ? en ? "On" : "Sí" : en ? "Off" : "No"}</button>
    {enabled && <label className="world-volume"><span>{en ? "Volume" : "Volumen"}</span><input type="range" min="0" max="100" value={volume} aria-label={en ? "Light volume" : "Volumen de luz"} onChange={event => setVolume(Number(event.target.value))} /></label>}
    <span role="status">{error ? en ? "Sound unavailable. The light is still yours to shape." : "Sonido no disponible. Puedes seguir moldeando la luz." : enabled ? running ? en ? "Soft tones follow the formation" : "Tonos suaves siguen la forma" : en ? "Sound is paused" : "Sonido pausado" : en ? "Quiet by default" : "Silencio por defecto"}</span>
  </div>;
}
