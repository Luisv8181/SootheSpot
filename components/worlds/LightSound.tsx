"use client";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { Language } from "@/domain/i18n/copy";
import { LIGHT_NOTES } from "@/domain/worlds/lightStrum";

type Voice = { oscillator: OscillatorNode; envelope: GainNode };
type Engine = { context: AudioContext; gain: GainNode; voices: Set<Voice> };
export type LightInstrument = { pluck: (note: number, strength: number) => void };

function stopVoice(current: Engine, voice: Voice) {
  voice.oscillator.onended = null;
  try { voice.oscillator.stop(); } catch { /* A partially initialized voice may not have started. */ }
  voice.oscillator.disconnect(); voice.envelope.disconnect(); current.voices.delete(voice);
}
function stopVoices(current: Engine) { for (const voice of current.voices) stopVoice(current, voice); }

export function LightSound({ language, running, complete, instrument, onStart }: { language: Language; running: boolean; complete: boolean; instrument: RefObject<LightInstrument | null>; onStart: () => void }) {
  const en = language === "en";
  const [enabled, setEnabled] = useState(false), [volume, setVolume] = useState(25), [error, setError] = useState(false);
  const engine = useRef<Engine | null>(null);
  const sequence = useRef(0);
  const active = useRef(running && !complete); active.current = running && !complete;
  const tokens = useRef({ count: 8, time: 0 });
  const played = useRef(Array<number>(8).fill(-Infinity));
  const dispose = useCallback(() => { sequence.current++; const current = engine.current; engine.current = null; if (!current) return; stopVoices(current); current.gain.disconnect(); void current.context.close().catch(() => {}); }, []);
  const pluck = useCallback((note: number, strength: number) => {
    const current = engine.current;
    if (!current || !active.current || document.hidden || current.context.state !== "running" || !Number.isInteger(note) || note < 0 || note >= LIGHT_NOTES.length || !Number.isFinite(strength)) return;
    const now = current.context.currentTime;
    tokens.current.count = Math.min(8, tokens.current.count + Math.max(0, now - tokens.current.time) * 12); tokens.current.time = now;
    if (now - played.current[note] < .12 || tokens.current.count < 1) return;
    played.current[note] = now; tokens.current.count--;
    try {
      if (current.voices.size >= 8) stopVoice(current, current.voices.values().next().value as Voice);
      const oscillator = current.context.createOscillator(), envelope = current.context.createGain();
      const voice = { oscillator, envelope }; current.voices.add(voice);
      oscillator.type = "sine"; oscillator.frequency.value = LIGHT_NOTES[note];
      envelope.gain.setValueAtTime(.0001, now);
      envelope.gain.linearRampToValueAtTime(.12 * Math.max(.2, Math.min(1, strength)), now + .008);
      envelope.gain.exponentialRampToValueAtTime(.0001, now + 2.4);
      oscillator.connect(envelope); envelope.connect(current.gain);
      oscillator.onended = () => { current.voices.delete(voice); oscillator.disconnect(); envelope.disconnect(); };
      oscillator.start(now); oscillator.stop(now + 2.5);
    } catch { dispose(); setEnabled(false); setError(true); }
  }, [dispose]);
  useEffect(() => { instrument.current = { pluck }; return () => { instrument.current = null; }; }, [instrument, pluck]);
  useEffect(() => {
    if (complete) { dispose(); setEnabled(false); return; }
    const current = engine.current; if (!current) return;
    if (!running || document.hidden) { stopVoices(current); played.current.fill(-Infinity); tokens.current = { count: 8, time: current.context.currentTime }; }
    void (running && !document.hidden ? current.context.resume() : current.context.suspend()).catch(() => { if (engine.current !== current) return; dispose(); setEnabled(false); setError(true); });
  }, [running, complete, dispose]);
  useEffect(() => { const current = engine.current; if (current) current.gain.gain.setTargetAtTime(volume / 100 * .5, current.context.currentTime, .04); }, [volume, enabled]);
  useEffect(() => { function hide() { const current = engine.current; if (document.hidden && current) { stopVoices(current); void current.context.suspend().catch(() => {}); } } document.addEventListener("visibilitychange", hide); return () => { document.removeEventListener("visibilitychange", hide); dispose(); }; }, [dispose]);
  async function toggle() {
    if (enabled) { dispose(); setEnabled(false); setError(false); return; }
    dispose(); const id = sequence.current; let context: AudioContext | null = null;
    try {
      context = new AudioContext({ latencyHint: "interactive" }); const gain = context.createGain(); gain.gain.value = volume / 100 * .5; gain.connect(context.destination);
      engine.current = { context, gain, voices: new Set() };
      played.current.fill(-Infinity); tokens.current = { count: 8, time: context.currentTime };
      setEnabled(true); setError(false); onStart(); await context.resume();
      if (id !== sequence.current) return;
      if (!active.current || document.hidden) await context.suspend();
    } catch { if (id !== sequence.current) return; dispose(); if (context && context.state !== "closed") void context.close().catch(() => {}); setEnabled(false); setError(true); }
  }
  return <div className="light-audio">
    <button className="world-secondary" aria-label={en ? "Light sound" : "Sonido de luz"} aria-pressed={enabled} disabled={complete} onClick={() => { void toggle(); }}>{en ? "Sound" : "Sonido"} · {enabled ? en ? "On" : "Sí" : en ? "Off" : "No"}</button>
    {enabled && <label className="world-volume"><span>{en ? "Volume" : "Volumen"}</span><input type="range" min="0" max="100" value={volume} aria-label={en ? "Light volume" : "Volumen de luz"} onChange={event => setVolume(Number(event.target.value))} /></label>}
    <span role="status">{error ? en ? "Sound unavailable. The light is still yours to shape." : "Sonido no disponible. Puedes seguir moldeando la luz." : enabled ? running ? en ? "Strum the light to play" : "Toca los hilos de luz" : en ? "Sound is paused" : "Sonido pausado" : en ? "Turn sound on to make music" : "Activa el sonido para crear música"}</span>
  </div>;
}
