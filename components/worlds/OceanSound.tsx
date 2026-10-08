"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/domain/i18n/copy";

const copy = {
  en: { sound: "Ocean sound", volume: "Sound volume", loading: "Loading sound…", playing: "Sound is playing", paused: "Sound is paused", off: "Sound is off", error: "Sound couldn't load. You can try again.", credits: "Sound credits", recording: "Shore recording by Luftrum", changes: "Edited, filtered and looped for SootheSpot." },
  es: { sound: "Sonido del océano", volume: "Volumen del sonido", loading: "Cargando sonido…", playing: "Sonido en reproducción", paused: "Sonido pausado", off: "Sonido desactivado", error: "No se pudo cargar el sonido. Puedes intentarlo de nuevo.", credits: "Créditos del sonido", recording: "Grabación de la costa por Luftrum", changes: "Editada, filtrada y repetida para SootheSpot." }
};

type Engine = { context: AudioContext; gain: GainNode; source?: AudioBufferSourceNode };

export function OceanSound({ running, complete, language, onStart }: { running: boolean; complete: boolean; language: Language; onStart: () => void }) {
  const t = copy[language];
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [volume, setVolume] = useState(25);
  const engine = useRef<Engine | null>(null);
  const request = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const active = useRef(running && !complete);
  active.current = running && !complete;
  const level = useRef(volume);
  level.current = volume;

  const dispose = useCallback(() => {
    request.current++;
    controller.current?.abort();
    controller.current = null;
    const current = engine.current;
    engine.current = null;
    if (current) {
      current.source?.stop();
      current.source?.disconnect();
      current.gain.disconnect();
      void current.context.close().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (complete) { dispose(); setEnabled(false); setLoading(false); setError(false); return; }
    const context = engine.current?.context;
    if (!context) return;
    const change = active.current && !document.hidden ? context.resume() : context.suspend();
    void change.catch(() => {
      if (engine.current?.context !== context) return;
      dispose(); setEnabled(false); setLoading(false); setError(true);
    });
  }, [running, complete, dispose]);

  useEffect(() => {
    function hide() { if (document.hidden) void engine.current?.context.suspend().catch(() => {}); }
    document.addEventListener("visibilitychange", hide);
    return () => { document.removeEventListener("visibilitychange", hide); dispose(); };
  }, [dispose]);

  async function toggle() {
    if (enabled) { dispose(); setEnabled(false); setLoading(false); setError(false); return; }
    dispose();
    const id = request.current;
    const abort = new AbortController();
    controller.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), 15000);
    setError(false);
    setEnabled(true);
    setLoading(true);
    onStart();
    try {
      const context = new AudioContext({ latencyHint: "playback" });
      const gain = context.createGain();
      gain.gain.value = level.current / 100 * .6;
      gain.connect(context.destination);
      engine.current = { context, gain };
      await context.resume();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/worlds/ocean-shore.mp3`, { signal: abort.signal, credentials: "omit" });
      if (!response.ok) throw new Error("Sound unavailable");
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      if (id !== request.current) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      engine.current!.source = source;
      source.start();
      if (!active.current || document.hidden) await context.suspend();
      setLoading(false);
    } catch {
      if (id !== request.current) return;
      dispose();
      setEnabled(false);
      setLoading(false);
      setError(true);
    } finally { window.clearTimeout(timeout); }
  }

  return <div className="world-audio">
    <div className="world-audio-controls">
      <button className="world-secondary" aria-label={t.sound} aria-pressed={enabled} disabled={complete} onClick={() => { void toggle(); }}>{t.sound} · {enabled ? language === "en" ? "On" : "Sí" : language === "en" ? "Off" : "No"}</button>
      <label className="world-volume"><span>{language === "en" ? "Volume" : "Volumen"}</span><input type="range" min="0" max="100" value={volume} disabled={!enabled || complete} aria-label={t.volume} aria-valuetext={`${volume}%`} onChange={(event) => {
        const value = Number(event.target.value);
        setVolume(value);
        engine.current?.gain.gain.setTargetAtTime(value / 100 * .6, engine.current.context.currentTime, .04);
      }} /></label>
    </div>
    <p className="world-audio-status" role="status">{error ? t.error : loading ? t.loading : enabled ? running ? t.playing : t.paused : t.off}</p>
    <details className="world-audio-credits"><summary>{t.credits}</summary><p><a href="https://commons.wikimedia.org/wiki/File:Oceanwavescrushing.ogg" target="_blank" rel="noopener noreferrer">{t.recording}</a> · <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a>. {t.changes}</p></details>
  </div>;
}
