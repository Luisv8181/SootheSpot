"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/domain/i18n/copy";

type Engine = { context: AudioContext; source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode; started: boolean };

export function RainSound({ language, running, complete, onStart }: { language: Language; running: boolean; complete: boolean; onStart: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(25);
  const [error, setError] = useState(false);
  const engine = useRef<Engine | null>(null);
  const request = useRef(0);
  const active = useRef(running && !complete);
  active.current = running && !complete;
  const en = language === "en";
  const dispose = useCallback(() => {
    request.current++;
    const current = engine.current; engine.current = null;
    if (!current) return;
    if (current.started) current.source.stop();
    current.source.disconnect(); current.filter.disconnect(); current.gain.disconnect();
    void current.context.close().catch(() => {});
  }, []);
  useEffect(() => {
    if (complete) { dispose(); setEnabled(false); return; }
    const current = engine.current;
    if (!current) return;
    void (active.current && !document.hidden ? current.context.resume() : current.context.suspend()).catch(() => {
      if (engine.current !== current) return;
      dispose(); setEnabled(false); setError(true);
    });
  }, [running, complete, dispose]);
  useEffect(() => {
    function hide() { if (document.hidden) void engine.current?.context.suspend().catch(() => {}); }
    document.addEventListener("visibilitychange", hide);
    return () => { document.removeEventListener("visibilitychange", hide); dispose(); };
  }, [dispose]);
  async function toggle() {
    if (enabled) { dispose(); setEnabled(false); setError(false); return; }
    dispose(); const id = request.current;
    setError(false);
    try {
      const context = new AudioContext({ latencyHint: "playback" });
      const source = context.createBufferSource(); const filter = context.createBiquadFilter(); const gain = context.createGain();
      engine.current = { context, source, filter, gain, started: false };
      const buffer = context.createBuffer(2, context.sampleRate * 2, context.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel); let smooth = 0;
        for (let i = 0; i < data.length; i++) { const white = Math.random() * 2 - 1; smooth = smooth * .94 + white * .06; data[i] = smooth * .7 + white * .1; }
        const join = Math.floor(context.sampleRate * .04);
        for (let i = 0; i < join; i++) { const mix = i / join; data[data.length - join + i] = data[data.length - join + i] * (1 - mix) + data[i] * mix; }
      }
      source.buffer = buffer; source.loop = true; source.loopStart = .04; filter.type = "lowpass"; filter.frequency.value = 3800;
      gain.gain.value = volume / 100 * .6;
      source.connect(filter); filter.connect(gain); gain.connect(context.destination);
      source.start(); engine.current.started = true; onStart(); setEnabled(true);
      await context.resume();
      if (id !== request.current) return;
      if (document.hidden || !active.current) await context.suspend();
    } catch {
      if (id !== request.current) return;
      dispose(); setEnabled(false); setError(true);
    }
  }
  return <div className="rain-audio">
    <button className="world-secondary" aria-label={en ? "Rain sound" : "Sonido de lluvia"} aria-pressed={enabled} disabled={complete} onClick={() => { void toggle(); }}>{en ? "Rain sound" : "Sonido de lluvia"} · {enabled ? en ? "On" : "Sí" : en ? "Off" : "No"}</button>
    {enabled && <label className="world-volume"><span>{en ? "Volume" : "Volumen"}</span><input type="range" min="0" max="100" value={volume} aria-label={en ? "Rain volume" : "Volumen de lluvia"} aria-valuetext={`${volume}%`} onChange={event => { const value = Number(event.target.value); setVolume(value); const current = engine.current; current?.gain.gain.setTargetAtTime(value / 100 * .6, current.context.currentTime, .06); }} /></label>}
    <span className="rain-sound-status" role="status">{error ? en ? "Sound unavailable. Try again, or enjoy the quiet." : "Sonido no disponible. Intenta de nuevo o disfruta del silencio." : enabled ? running ? en ? "Soft rain is playing" : "Lluvia suave en reproducción" : en ? "Sound is paused" : "Sonido pausado" : en ? "Quiet by default" : "Silencio por defecto"}</span>
  </div>;
}
