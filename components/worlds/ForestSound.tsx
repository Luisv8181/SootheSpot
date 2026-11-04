"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/domain/i18n/copy";

type Engine = {
  context: AudioContext;
  source: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  started: boolean;
};

const STATIONS = [
  { frequency: 2500, level: 0.55 },
  { frequency: 2100, level: 0.65 },
  { frequency: 1250, level: 0.8 },
  { frequency: 900, level: 0.55 },
] as const;

function makeSoundscape(context: AudioContext, station: number): AudioBuffer {
  const duration = 12;
  const rate = Math.min(context.sampleRate, 48_000);
  const buffer = context.createBuffer(2, rate * duration, rate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    const phase = channel * 0.7;
    let low = 0;
    let mid = 0;
    for (let i = 0; i < data.length; i++) {
      const t = i / rate;
      const white = Math.random() * 2 - 1;
      low = low * 0.997 + white * 0.003;
      mid = mid * 0.94 + white * 0.06;
      const water = station >= 2 ? 0.055 : 0.025;
      let sample = low * 0.27 + mid * (station >= 2 ? 0.25 : 0.13) + white * water;

      // Short, widely spaced, softly shaped birdlike notes; these are synthesized tones.
      for (let chirp = 0; chirp < 4; chirp++) {
        const start = 1.1 + chirp * 2.65 + (channel ? 0.09 : 0);
        const elapsed = t - start;
        if (elapsed >= 0 && elapsed < 0.22) {
          const envelope = Math.sin(Math.PI * elapsed / 0.22) ** 2;
          const sweep = 1850 + chirp * 115 + elapsed * 1250;
          sample += Math.sin(2 * Math.PI * sweep * elapsed + phase) * envelope * 0.035;
        }
      }

      // Blend the final 80 ms into the opening so looping does not click.
      const seam = Math.min(1, Math.max(0, (t - (duration - 0.08)) / 0.08));
      if (seam > 0) {
        const first = data[Math.min(data.length - 1, Math.floor(seam * 0.08 * rate))] ?? 0;
        sample = sample * (1 - seam) + first * seam;
      }
      data[i] = sample;
    }
  }
  return buffer;
}

export function ForestSound({ language, running, complete, onStart, station }: {
  language: Language;
  running: boolean;
  complete: boolean;
  onStart: () => void;
  station: number;
}) {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(22);
  const [error, setError] = useState(false);
  const engine = useRef<Engine | null>(null);
  const request = useRef(0);
  const active = useRef(running && !complete);
  active.current = running && !complete;
  const en = language === "en";

  const dispose = useCallback(() => {
    request.current++;
    const current = engine.current;
    engine.current = null;
    if (!current) return;
    if (current.started) {
      try { current.source.stop(); } catch { /* The source may already have stopped. */ }
    }
    current.source.disconnect();
    current.filter.disconnect();
    current.gain.disconnect();
    void current.context.close().catch(() => {});
  }, []);

  useEffect(() => {
    if (complete) {
      dispose();
      setEnabled(false);
      return;
    }
    const current = engine.current;
    if (!current) return;
    void (active.current && !document.hidden ? current.context.resume() : current.context.suspend()).catch(() => {
      if (engine.current !== current) return;
      dispose();
      setEnabled(false);
      setError(true);
    });
  }, [running, complete, dispose]);

  useEffect(() => {
    const current = engine.current;
    if (!current) return;
    const settings = STATIONS[Math.max(0, Math.min(STATIONS.length - 1, Math.trunc(station)))] ?? STATIONS[0];
    current.filter.frequency.setTargetAtTime(settings.frequency, current.context.currentTime, 0.18);
    current.gain.gain.setTargetAtTime(volume / 100 * settings.level, current.context.currentTime, 0.18);
  }, [station, volume]);

  useEffect(() => {
    function hide() {
      if (document.hidden) void engine.current?.context.suspend().catch(() => {});
    }
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      dispose();
    };
  }, [dispose]);

  async function toggle() {
    if (enabled) {
      dispose();
      setEnabled(false);
      setError(false);
      return;
    }
    dispose();
    const id = request.current;
    setError(false);
    let context: AudioContext | null = null;
    let source: AudioBufferSourceNode | null = null;
    let filter: BiquadFilterNode | null = null;
    let gain: GainNode | null = null;
    try {
      context = new AudioContext({ latencyHint: "playback", sampleRate: 48_000 });
      source = context.createBufferSource();
      filter = context.createBiquadFilter();
      gain = context.createGain();
      const settings = STATIONS[Math.max(0, Math.min(STATIONS.length - 1, Math.trunc(station)))] ?? STATIONS[0];
      source.buffer = makeSoundscape(context, Math.max(0, Math.min(3, Math.trunc(station))));
      source.loop = true;
      source.loopStart = 0.08;
      filter.type = "lowpass";
      filter.frequency.value = settings.frequency;
      gain.gain.value = volume / 100 * settings.level;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      const created: Engine = { context, source, filter, gain, started: false };
      engine.current = created;
      source.start();
      created.started = true;
      onStart();
      setEnabled(true);
      await context.resume();
      if (id !== request.current || engine.current !== created) return;
      if (document.hidden || !active.current) await context.suspend();
    } catch {
      if (id !== request.current) return;
      dispose();
      // Also clean up nodes/context if construction failed before an Engine was installed.
      source?.disconnect();
      filter?.disconnect();
      gain?.disconnect();
      if (context && context.state !== "closed") void context.close().catch(() => {});
      setEnabled(false);
      setError(true);
    }
  }

  return <div className="rain-audio">
    <button className="world-secondary" aria-label={en ? "Forest sound" : "Sonido del bosque"} aria-pressed={enabled} disabled={complete} onClick={() => { void toggle(); }}>
      {en ? "Forest sound" : "Sonido del bosque"} · {enabled ? en ? "On" : "Sí" : en ? "Off" : "No"}
    </button>
    {enabled && <label className="world-volume"><span>{en ? "Volume" : "Volumen"}</span><input type="range" min="0" max="100" value={volume} aria-label={en ? "Forest volume" : "Volumen del bosque"} aria-valuetext={`${volume}%`} onChange={event => {
      const value = Number(event.target.value);
      setVolume(value);
      const current = engine.current;
      if (current) {
        const settings = STATIONS[Math.max(0, Math.min(STATIONS.length - 1, Math.trunc(station)))] ?? STATIONS[0];
        current.gain.gain.setTargetAtTime(value / 100 * settings.level, current.context.currentTime, 0.06);
      }
    }} />
    </label>}
    <span className="rain-sound-status" role="status">{error
      ? en ? "Sound unavailable. Try again, or enjoy the quiet." : "Sonido no disponible. Intenta de nuevo o disfruta del silencio."
      : enabled ? running ? en ? "Imagined forest soundscape" : "Paisaje sonoro imaginado del bosque" : en ? "Sound is paused" : "Sonido pausado"
      : en ? "Quiet by default" : "Silencio por defecto"}</span>
  </div>;
}
