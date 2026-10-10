"use client";

import { useEffect, useRef, useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import {
  layoutTextLines,
  wrapMessage,
  messageMelody,
  MAX_MESSAGE_CHARS
} from "@/domain/worlds/vastSkyText";
import { SKY_SONGS, SKY_CONSTELLATIONS, FREE_NOTES } from "@/domain/worlds/vastSkyData";
import { skyArtwork } from "./skyArtwork";
import "./vastSky.css";

const labels = {
  en: {
    writeTitle: "write it in stars",
    writePlaceholder: "BREATHE",
    traceIt: "trace it ✦",
    cancel: "Cancel",
    notSaved: "nothing is saved",
    bandSongs: "✦ star maps",
    bandStars: "♪ songs",
    auto: "▶ autoplay",
    stop: "■ stop",
    soundOn: "♪ sound on",
    soundOff: "♪ muted",
    writeLabel: "✎ write",
    autoNote: "autoplay · tap any star to take over",
    writeAria: "write your own words",
    bandAria: "switch dial band",
    autoAria: "autoplay the current sky",
    muteAria: "toggle sound",
    dialAria: "Sky selector"
  },
  es: {
    writeTitle: "escríbelo en estrellas",
    writePlaceholder: "RESPIRA",
    traceIt: "trázalo ✦",
    cancel: "Cancelar",
    notSaved: "nada se guarda",
    bandSongs: "✦ constelaciones",
    bandStars: "♪ canciones",
    auto: "▶ auto",
    stop: "■ parar",
    soundOn: "♪ sonido",
    soundOff: "♪ silenciado",
    writeLabel: "✎ escribir",
    autoNote: "auto · toca una estrella para tomar el control",
    writeAria: "escribe tus propias palabras",
    bandAria: "cambiar de banda",
    autoAria: "reproducir el cielo automáticamente",
    muteAria: "activar o silenciar el sonido",
    dialAria: "Selector del cielo"
  }
};

type EngineApi = {
  setMode: (id: string) => void;
  switchBand: () => void;
  toggleAuto: () => boolean;
  setMuted: (m: boolean) => void;
  commitMessage: (text: string) => void;
  currentMessage: () => string;
  destroy: () => void;
};

export function VastSky({ language, paused, complete, still, onInteract }: {
  language: Language;
  paused: boolean;
  complete: boolean;
  still: boolean;
  onInteract: () => void;
}) {
  const t = labels[language];
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<EngineApi | null>(null);
  const liveRef = useRef({ language, paused, complete, still, onInteract });
  liveRef.current = { language, paused, complete, still, onInteract };

  const [station, setStation] = useState({ en: "YOUR WORDS", es: "tus palabras" });
  const [guide, setGuide] = useState({ en: "trace your words, star by star", es: "traza tus palabras, estrella por estrella" });
  const [caption, setCaption] = useState<{ en: string; es: string } | null>(null);
  const [band, setBand] = useState<"songs" | "stars">("songs");
  const [muted, setMuted] = useState(false);
  const [auto, setAuto] = useState(false);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState("BREATHE");

  useEffect(() => {
    const root = rootRef.current, canvas = canvasRef.current;
    if (!root || !canvas) return;
    engineRef.current = createSkyEngine(canvas, root, liveRef, {
      onCaption: (en, es) => setCaption(en ? { en, es: es ?? "" } : null),
      onStation: (en, es) => setStation({ en, es }),
      onGuide: (en, es) => setGuide({ en, es }),
      onBand: (b) => setBand(b),
      onAuto: (a) => setAuto(a),
      onRequestWrite: () => {
        setDraft(engineRef.current?.currentMessage() ?? "BREATHE");
        setWriting(true);
      }
    });
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  function commitWrite() {
    engineRef.current?.commitMessage(draft);
    setWriting(false);
  }

  return (
    <div ref={rootRef} className={`vsky-root${still ? " vsky-still" : ""}`}>
      <img src={skyArtwork.sky.src} className="vsky-photo" alt="" aria-hidden="true" draggable={false} />
      <canvas ref={canvasRef} className="vsky-canvas" aria-hidden="true" />
      <div className="vsky-scrim" aria-hidden="true" />
      <div className="vsky-vignette" aria-hidden="true" />
      <div className="vsky-station" aria-live="polite">
        <span>{station[language]}</span>
      </div>
      <div className="vsky-guide" aria-hidden="true">
        <span>{guide[language]}</span>
      </div>
      {caption && (
        <div className="vsky-caption" aria-live="polite">
          <span className="vsky-caption-main">“{caption.en}”</span>
          {caption.es && <span className="vsky-caption-sub">{caption.es}</span>}
        </div>
      )}
      <div className="vsky-dock">
        <svg id="vsky-dial" className="vsky-dial" viewBox="0 0 200 200" width="120" height="120"
          tabIndex={0} role="slider" aria-label={t.dialAria}
          aria-valuemin={0} aria-valuemax={4} aria-valuenow={0} aria-valuetext={station.en.toLowerCase()}>
          <defs>
            <radialGradient id="vsky-knobg" cx="38%" cy="32%" r="80%">
              <stop offset="0%" stopColor="#1b2740" /><stop offset="70%" stopColor="#0d1526" /><stop offset="100%" stopColor="#080d18" />
            </radialGradient>
          </defs>
          <g id="vsky-ticks" />
          <g id="vsky-diallabels" />
          <g id="vsky-knob">
            <circle cx="100" cy="100" r="34" fill="url(#vsky-knobg)" stroke="rgba(170,200,255,.4)" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="27" fill="none" stroke="rgba(255,214,150,.22)" strokeWidth="1" />
            <line x1="100" y1="100" x2="100" y2="72" stroke="#ffd696" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="100" cy="100" r="4" fill="#ffe9c4" />
          </g>
        </svg>
        <div className="vsky-buttons">
          <button type="button" className="vsky-btn" aria-label={t.bandAria}
            onClick={() => engineRef.current?.switchBand()}>
            {band === "songs" ? t.bandSongs : t.bandStars}
          </button>
          <button type="button" className="vsky-btn" aria-label={t.writeAria}
            onClick={() => {
              setDraft(engineRef.current?.currentMessage() ?? "BREATHE");
              setWriting(true);
            }}>{t.writeLabel}</button>
          <button type="button" className={`vsky-btn${auto ? " on" : ""}`} aria-label={t.autoAria} aria-pressed={auto}
            onClick={() => engineRef.current?.toggleAuto()}>
            {auto ? t.stop : t.auto}
          </button>
          <button type="button" className="vsky-btn" aria-label={t.muteAria} aria-pressed={muted}
            onClick={() => {
              const next = !muted;
              setMuted(next);
              engineRef.current?.setMuted(next);
            }}>
            {muted ? t.soundOff : t.soundOn}
          </button>
        </div>
      </div>
      {auto && (
        <div className="vsky-autonote" aria-live="polite">
          <span>{t.autoNote}</span>
        </div>
      )}
      {writing && (
        <div className="vsky-writepanel" onPointerDown={(e) => { if (e.target === e.currentTarget) setWriting(false); }}>
          <div className="vsky-wpcard" role="dialog" aria-label={t.writeTitle}>
            <div className="vsky-wplabel">{t.writeTitle}</div>
            <input
              value={draft}
              maxLength={MAX_MESSAGE_CHARS}
              placeholder={t.writePlaceholder}
              autoComplete="off"
              autoCapitalize="characters"
              aria-label={t.writeTitle}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commitWrite(); if (e.key === "Escape") setWriting(false); }}
              // autoFocus would yank mobile keyboards; focus on user tap instead
              ref={(el) => { if (el && writing) el.focus({ preventScroll: true }); }}
            />
            <div className="vsky-wprow">
              <button type="button" className="vsky-wpgo" onClick={commitWrite}>{t.traceIt}</button>
              <button type="button" className="vsky-wpcancel" onClick={() => setWriting(false)}>{t.cancel}</button>
            </div>
            <div className="vsky-wpnote">{t.notSaved}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== canvas engine ==================== */
/* A faithful port of the Vast Sky prototype: photo sky, three dust layers,
   trace-to-play constellations, radio dial, autoplay, and write-your-own
   words rendered in the single-stroke star font. The typed message lives in
   component state only — nothing is saved or sent anywhere. */

const TAU = Math.PI * 2;
const LOOP = 12;
const OMEGA = TAU / LOOP;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rgba = (c: [number, number, number], a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const STAR_C: [number, number, number] = [228, 238, 255];
const GOLD: [number, number, number] = [255, 214, 150];
const WARM: [number, number, number] = [255, 240, 210];
const buzz = (ms: number | number[]) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* haptics unsupported */
  }
};

type Star = {
  x: number; y: number; r: number; born: number;
  name: string; nameBorn: number;
  ph: number; k: number; base: number; ampT: number; tw: boolean; spike: boolean;
};
type SkyLine = { a: Star; b: Star; born: number };
type Live = { language: Language; paused: boolean; complete: boolean; still: boolean; onInteract: () => void };
type SkyCallbacks = {
  onCaption: (en: string | null, es?: string) => void;
  onStation: (en: string, es: string) => void;
  onGuide: (en: string, es: string) => void;
  onBand: (b: "songs" | "stars") => void;
  onAuto: (a: boolean) => void;
  onRequestWrite: () => void;
};

const STATIONS = {
  songs: [
    { id: "custom", en: "YOUR WORDS", es: "tus palabras", short: "WORDS" },
    { id: "free", en: "FREE", es: "libre", short: "FREE" },
    { id: "still", en: "STILL WATER", es: "agua quieta", short: "STILL" },
    { id: "night", en: "NIGHT WALK", es: "paseo nocturno", short: "NIGHT" },
    { id: "dawn", en: "FIRST LIGHT", es: "primera luz", short: "DAWN" }
  ],
  stars: Object.keys(SKY_CONSTELLATIONS).map((id) => ({
    id,
    en: SKY_CONSTELLATIONS[id].name,
    es: SKY_CONSTELLATIONS[id].mean,
    short: SKY_CONSTELLATIONS[id].short
  }))
};

function createSkyEngine(
  canvas: HTMLCanvasElement,
  root: HTMLDivElement,
  liveRef: { current: Live },
  cb: SkyCallbacks
): EngineApi {
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) throw new Error("2d canvas unavailable");
  const ctx: CanvasRenderingContext2D = rawCtx;
  const ac = new AbortController();
  const listen = (el: Element | Window, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions) =>
    el.addEventListener(type, fn as EventListener, { ...opts, signal: ac.signal });

  let W = 0, H = 0;
  function sizeCanvas() {
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = root.clientWidth || window.innerWidth;
    H = root.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.round(W * DPR));
    canvas.height = Math.max(1, Math.round(H * DPR));
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeGlow(rgb: [number, number, number]) {
    const s = document.createElement("canvas");
    s.width = s.height = 64;
    const c = s.getContext("2d");
    if (c) {
      const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, rgba(rgb, 1));
      g.addColorStop(0.28, rgba(rgb, 0.5));
      g.addColorStop(0.62, rgba(rgb, 0.12));
      g.addColorStop(1, rgba(rgb, 0));
      c.fillStyle = g;
      c.fillRect(0, 0, 64, 64);
    }
    return s;
  }
  const glowWhite = makeGlow([225, 235, 255]);
  const glowGold = makeGlow(GOLD);
  const glowWarm = makeGlow(WARM);

  /* ---------- audio ---------- */
  let actx: AudioContext | null = null;
  let muted = false;
  let noiseBuf: AudioBuffer | null = null;
  function ensureAudio() {
    try {
      actx =
        actx ||
        new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (actx.state === "suspended") void actx.resume();
    } catch {
      /* audio unavailable */
    }
  }
  function pluck(freq: number, gain = 0.11, dur = 2.2) {
    if (muted || !freq) return;
    try {
      ensureAudio();
      if (!actx) return;
      const t0 = actx.currentTime;
      const o = actx.createOscillator(), g = actx.createGain(), f = actx.createBiquadFilter();
      o.type = "sine";
      o.frequency.value = freq;
      f.type = "lowpass";
      f.frequency.value = 1100;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(f);
      f.connect(g);
      g.connect(actx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.2);
    } catch {
      /* ignore */
    }
  }
  function tickSnd() {
    if (muted) return;
    try {
      ensureAudio();
      if (!actx) return;
      const t0 = actx.currentTime;
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = "triangle";
      o.frequency.value = 1500;
      g.gain.setValueAtTime(0.05, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
      o.connect(g);
      g.connect(actx.destination);
      o.start(t0);
      o.stop(t0 + 0.07);
    } catch {
      /* ignore */
    }
  }

  /* ---------- state ---------- */
  let band: "songs" | "stars" = "songs";
  let mode = "custom";
  let stationIdx = 0;
  const dust: Array<{ x: number; y: number; z: number; amp: number; r: number; ph: number; k: number; base: number; ampT: number; tw: boolean }> = [];
  for (const L of [{ n: 60, amp: 3, z: 0.3 }, { n: 48, amp: 6.5, z: 0.6 }, { n: 34, amp: 11, z: 1.0 }])
    for (let i = 0; i < L.n; i++)
      dust.push({ x: Math.random(), y: Math.random(), z: L.z, amp: L.amp, r: rand(0.5, 1.7), ph: rand(0, TAU), k: 1 + Math.floor(rand(0, 3)), base: rand(0.25, 0.55), ampT: rand(0.15, 0.4), tw: Math.random() < 0.3 });

  const anchors: Star[] = [], songStars: Star[] = [], textStars: Star[] = [], constStars: Star[] = [], constSeq: Star[] = [];
  const textGhost: Array<[number, number, number, number]> = [];
  const lines: SkyLine[] = [], motes: Array<{ x: number; y: number; vx: number; vy: number; age: number; life: number; col: [number, number, number]; r: number }> = [];
  const meteors: Array<{ x: number; y: number; vx: number; vy: number; age: number; life: number }> = [];
  const pops: Array<{ x: number; y: number; age: number; life: number; faint?: boolean }> = [];
  const waves: Array<{ x: number; y: number; age: number; life: number; maxR: number }> = [];
  let seq: Star[] = [];
  let selected: Star | null = null, played = 0, lastStar: Star | null = null;
  let songDone = false, constellationGlow = 0, freeIdx = 0;
  let releaseAt = 0;
  let tracing = false;
  const pointer = { x: 0, y: 0, down: false };
  const orient = { x: 0, y: 0, tx: 0, ty: 0 };
  const auto = { on: false, t: 0, cx: 0, cy: 0, phase: "trace", phaseT: 0, trail: [] as Array<{ x: number; y: number }> };

  let customText = "BREATHE";
  let customLines = wrapMessage(customText);
  let customMelody = messageMelody(customText);

  const stillNow = () => liveRef.current.still;
  const blocked = () => liveRef.current.paused || liveRef.current.complete;

  function mkStar(x: number, y: number, r: number, staggerMs: number, name = ""): Star {
    return {
      x, y, r, born: performance.now() + staggerMs, name, nameBorn: 0,
      ph: rand(0, TAU), k: 1 + Math.floor(rand(0, 3)),
      base: rand(0.55, 0.8), ampT: rand(0.2, 0.35), tw: Math.random() < 0.35,
      spike: Math.random() < 0.1
    };
  }

  /* The control dock sits over the upper sky: keep every tappable star below
     it (measured from the live dock element) and above the session chrome.
     Without this, stars spawn under the dock where taps can't reach them. */
  function skyBand(): { top: number; bottom: number } {
    const dock = root.querySelector(".vsky-dock") as HTMLElement | null;
    const cr = canvas.getBoundingClientRect();
    const top = dock ? Math.max(0, dock.getBoundingClientRect().bottom - cr.top + 14) : H * 0.4;
    const bottom = Math.max(top + 80, H * 0.8);
    return { top, bottom };
  }
  const skyY = (ny: number): number => {
    const { top, bottom } = skyBand();
    return top + ny * (bottom - top);
  };

  function placeSongStars() {
    songStars.length = 0;
    if (mode === "free" || mode === "custom" || SKY_CONSTELLATIONS[mode]) return;
    const shape = SKY_SONGS[mode]?.shape ?? [];
    const now = performance.now();
    shape.forEach(([nx, ny], i) => {
      const s = mkStar((0.1 + 0.8 * nx) * W, skyY(ny), rand(3.2, 4.6), stillNow() ? 0 : i * 130);
      if (stillNow()) s.born = now;
      songStars.push(s);
    });
  }

  function placeTextStars() {
    textStars.length = 0;
    textGhost.length = 0;
    if (mode !== "custom") return;
    const { stars, ghosts } = layoutTextLines(customLines, W, H, skyBand());
    const now = performance.now();
    stars.forEach((p, i) => {
      const s = mkStar(p.x, p.y, rand(2.2, 3.0), stillNow() ? 0 : i * 32);
      if (stillNow()) s.born = now;
      else s.born = now + i * 32;
      textStars.push(s);
    });
    for (const g of ghosts) textGhost.push(g);
  }

  function placeConstStars() {
    constStars.length = 0;
    constSeq.length = 0;
    const C = SKY_CONSTELLATIONS[mode];
    if (!C) return;
    const now = performance.now();
    C.stars.forEach(([nx, ny, nm], i) => {
      const s = mkStar((0.12 + 0.76 * nx) * W, skyY(ny), rand(3.2, 4.6), stillNow() ? 0 : i * 140, nm);
      if (stillNow()) s.born = now;
      constStars.push(s);
    });
    C.order.forEach((i) => constSeq.push(constStars[i]));
  }

  function placeAll() {
    placeSongStars();
    placeTextStars();
    placeConstStars();
    rebuildSeq();
  }
  function rebuildSeq() {
    seq = mode === "free" ? [] : mode === "custom" ? textStars : SKY_CONSTELLATIONS[mode] ? constSeq : songStars;
  }

  const isConst = (id: string) => !!SKY_CONSTELLATIONS[id];
  const seqNotes = (): number[] =>
    mode === "custom" ? customMelody : isConst(mode) ? SKY_CONSTELLATIONS[mode].notes : SKY_SONGS[mode]?.notes ?? [];

  function guideFor(id: string): [string, string] {
    if (id === "free") return ["touch the water of stars — drag to wander", "toca y arrastra para explorar"];
    if (id === "custom") return ["trace your words, star by star · ✎ to write", "traza tus palabras · ✎ para escribir"];
    if (isConst(id)) {
      const c = SKY_CONSTELLATIONS[id];
      return [`trace ${c.name.toLowerCase()}, star by star`, "traza la constelación, estrella por estrella"];
    }
    return ["follow the glowing star — or wander", "sigue la estrella · o explora a tu manera"];
  }

  function setMode(id: string) {
    const st = STATIONS[band].findIndex((s) => s.id === id);
    if (st < 0) return;
    stationIdx = st;
    mode = id;
    lines.length = 0;
    motes.length = 0;
    pops.length = 0;
    waves.length = 0;
    releaseAt = 0;
    cb.onCaption(null);
    selected = null;
    lastStar = null;
    played = 0;
    songDone = false;
    freeIdx = 0;
    constellationGlow = 0;
    tracing = false;
    anchors.length = 0;
    const meta = STATIONS[band][st];
    cb.onStation(meta.en, meta.es);
    const [gen, ges] = guideFor(id);
    cb.onGuide(gen, ges);
    const dial = root.querySelector("#vsky-dial");
    dial?.setAttribute("aria-valuenow", String(st));
    dial?.setAttribute("aria-valuetext", meta.en.toLowerCase());
    root.querySelectorAll(".vsky-stlabel").forEach((el) => el.setAttribute("opacity", (el as Element).getAttribute("data-st") === String(st) ? "1" : "0.42"));
    placeAll();
  }

  function switchBandInner() {
    band = band === "songs" ? "stars" : "songs";
    cb.onBand(band);
    buildDial();
    dialAngle = dialTarget = 0;
    dialVel = 0;
    setMode(STATIONS[band][0].id);
  }

  function releaseLines() {
    releaseSound();
    for (const Ln of lines)
      for (let i = 0; i < 26; i++) {
        const t = Math.random();
        motes.push({
          x: lerp(Ln.a.x, Ln.b.x, t), y: lerp(Ln.a.y, Ln.b.y, t),
          vx: rand(-10, 10), vy: rand(-18, -5), age: 0, life: rand(2.5, 4.5),
          col: Math.random() < 0.6 ? GOLD : STAR_C, r: rand(1.1, 2.6)
        });
      }
    lines.length = 0;
    selected = null;
  }

  function releaseSound() {
    if (muted) return;
    try {
      ensureAudio();
      if (!actx) return;
      const t0 = actx.currentTime;
      if (!noiseBuf) {
        noiseBuf = actx.createBuffer(1, actx.sampleRate * 2, actx.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      const src = actx.createBufferSource();
      src.buffer = noiseBuf;
      const f = actx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 480;
      const g = actx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.045, t0 + 0.9);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.8);
      src.connect(f);
      f.connect(g);
      g.connect(actx.destination);
      src.start(t0);
      src.stop(t0 + 3);
      const sq = mode === "free" ? [...FREE_NOTES].reverse().slice(0, 6) : seqNotes().filter(Boolean).reverse();
      sq.forEach((fr, i) => setTimeout(() => pluck(fr, 0.042, 3.2), i * 150));
    } catch {
      /* ignore */
    }
  }

  function completeSong() {
    if (mode === "custom") cb.onCaption(customText.toLowerCase(), "déjalo ir");
    else if (isConst(mode)) {
      const c = SKY_CONSTELLATIONS[mode];
      cb.onCaption(c.name.toLowerCase(), c.mean);
    } else cb.onCaption("a song, remembered", "una canción, recordada");
    let cx = 0, cy = 0;
    for (const s of seq) {
      cx += s.x;
      cy += s.y;
    }
    cx /= Math.max(1, seq.length);
    cy /= Math.max(1, seq.length);
    if (!stillNow()) waves.push({ x: cx, y: cy, age: 0, life: 2.4, maxR: Math.max(W, H) * 0.7 });
    constellationGlow = 1;
    buzz([12, 40, 12]);
    if (!auto.on) seqNotes().forEach((f, i) => setTimeout(() => pluck(f, 0.05, 3), 700 + i * 430));
    // the exhale: release on its own after a held moment
    releaseAt = performance.now() + 4000;
  }

  /* ---------- radio dial ---------- */
  const dialEl = root.querySelector("#vsky-dial") as unknown as SVGSVGElement;
  const knobEl = root.querySelector("#vsky-knob") as unknown as SVGGElement;
  let dialAngle = 0, dialVel = 0, dialTarget = 0;
  let dragging = false, startA = 0, startR = 0, downX = 0, downY = 0;
  let lastDetent = 0, dragVel = 0, lastMoveT = 0, lastMoveA = 0;
  const nStations = () => STATIONS[band].length;
  const STEP = () => 360 / nStations();

  function buildDial() {
    const ns = "http://www.w3.org/2000/svg";
    const n = nStations();
    const ticks = root.querySelector("#vsky-ticks");
    if (ticks) {
      ticks.innerHTML = "";
      const per = 12, total = n * per;
      for (let i = 0; i < total; i++) {
        const a = (i / total) * TAU, st = i % per === 0, r1 = st ? 80 : 87, r2 = 92;
        const l = document.createElementNS(ns, "line");
        l.setAttribute("x1", String(100 + r1 * Math.cos(a)));
        l.setAttribute("y1", String(100 + r1 * Math.sin(a)));
        l.setAttribute("x2", String(100 + r2 * Math.cos(a)));
        l.setAttribute("y2", String(100 + r2 * Math.sin(a)));
        l.setAttribute("stroke", st ? "rgba(255,214,150,.55)" : "rgba(160,190,255,.22)");
        l.setAttribute("stroke-width", st ? "2" : "1");
        ticks.appendChild(l);
      }
    }
    const labelsG = root.querySelector("#vsky-diallabels");
    if (labelsG) {
      labelsG.innerHTML = "";
      STATIONS[band].forEach((stn, i) => {
        const a = (i / n) * TAU - Math.PI / 2;
        const t = document.createElementNS(ns, "text");
        t.setAttribute("x", String(100 + 70 * Math.cos(a)));
        t.setAttribute("y", String(100 + 70 * Math.sin(a) + 3));
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("font-size", n > 5 ? "7.5" : "9");
        t.setAttribute("letter-spacing", "1.5");
        t.setAttribute("fill", stn.id === "custom" ? "#ffd696" : "#dfe9ff");
        t.setAttribute("class", "vsky-stlabel");
        t.setAttribute("data-st", String(i));
        t.setAttribute("opacity", i === stationIdx ? "1" : "0.42");
        t.textContent = stn.short;
        labelsG.appendChild(t);
      });
    }
    dialEl?.setAttribute("aria-valuemax", String(n - 1));
  }

  const stationOf = (R: number) => {
    const n = nStations();
    return (((Math.round(R / STEP()) % n) + n) % n);
  };
  function angOf(e: { clientX: number; clientY: number }) {
    const r = (dialEl as unknown as Element).getBoundingClientRect();
    return (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
  }
  function dialGotoStation(st: number) {
    const n = nStations(), step = STEP();
    const base = Math.round(dialTarget / step);
    const fwd = (((st - base) % n) + n) % n;
    dialTarget = (base + (fwd <= n / 2 ? fwd : fwd - n)) * step;
    tickSnd();
    buzz(6);
    const id = STATIONS[band][st].id;
    if (id !== mode) setMode(id);
  }
  function dialRelease(moved: boolean) {
    dragging = false;
    const cur = stationOf(dialAngle), n = nStations();
    dialTarget = (moved ? Math.round(dialAngle / STEP()) : cur + 1) * STEP();
    dialVel = moved ? clamp(dragVel, -540, 540) : 0;
    tickSnd();
    buzz(6);
    const id = STATIONS[band][stationOf(dialTarget)].id;
    if (id !== mode) setMode(id);
  }

  if (dialEl) {
    listen(dialEl, "pointerdown", (e) => {
      const ev = e as PointerEvent;
      dragging = true;
      (dialEl as unknown as Element).setPointerCapture?.(ev.pointerId);
      startA = angOf(ev);
      startR = dialAngle;
      downX = ev.clientX;
      downY = ev.clientY;
      lastDetent = stationOf(dialAngle);
      dialVel = 0;
      dragVel = 0;
      lastMoveT = performance.now();
      lastMoveA = startA;
      ev.preventDefault();
    });
    listen(dialEl, "pointermove", (e) => {
      if (!dragging) return;
      const ev = e as PointerEvent;
      const a = angOf(ev);
      let d = a - startA;
      d = ((d + 540) % 360) - 180;
      const now = performance.now(), dtm = Math.max(1, now - lastMoveT) / 1000;
      let da = a - lastMoveA;
      da = ((da + 540) % 360) - 180;
      dragVel = lerp(dragVel, da / dtm, 0.4);
      lastMoveT = now;
      lastMoveA = a;
      dialAngle = startR + d;
      const st = stationOf(dialAngle);
      if (st !== lastDetent) {
        lastDetent = st;
        dialGotoStation(st);
      }
    });
    const up = (e: Event) => {
      if (!dragging) return;
      const ev = e as PointerEvent;
      dialRelease(Math.hypot(ev.clientX - downX, ev.clientY - downY) > 8);
    };
    listen(dialEl, "pointerup", up);
    listen(dialEl, "pointercancel", () => {
      if (dragging) dialRelease(true);
    });
    listen(dialEl, "keydown", (e) => {
      const ev = e as KeyboardEvent;
      if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(ev.key)) return;
      ev.preventDefault();
      const dir = ev.key === "ArrowRight" || ev.key === "ArrowDown" ? 1 : -1;
      dialGotoStation((stationOf(dialTarget) + dir + nStations()) % nStations());
    });
  }

  function stepDialSpring(dt: number) {
    if (!dragging) {
      const k = 170, c = 2 * Math.sqrt(k);
      dialVel += ((dialTarget - dialAngle) * k - dialVel * c) * dt;
      dialAngle += dialVel * dt;
      if (Math.abs(dialTarget - dialAngle) < 0.02 && Math.abs(dialVel) < 0.6) {
        dialAngle = dialTarget;
        dialVel = 0;
      }
    }
    if (knobEl) knobEl.style.transform = `rotate(${dialAngle}deg)`;
  }

  /* ---------- autoplay ---------- */
  const expectedStar = (): Star | null => {
    if (mode === "free" || songDone || !seq.length) return null;
    return seq[Math.min(played, seq.length - 1)] || null;
  };

  function setAutoInner(on: boolean) {
    auto.on = on;
    cb.onAuto(on);
    if (on) {
      ensureAudio();
      buzz(10);
      if (mode === "free") setMode("custom");
      else setMode(mode);
      auto.phase = "trace";
      auto.phaseT = 0;
      auto.t = 0;
      auto.trail.length = 0;
      const s0 = seq[0];
      auto.cx = s0 ? s0.x : W / 2;
      auto.cy = s0 ? s0.y : H / 2;
    }
  }

  function stepAuto(dt: number) {
    const exp = expectedStar();
    if (exp) {
      const k = 1 - Math.pow(0.0005, dt);
      auto.cx += (exp.x - auto.cx) * k;
      auto.cy += (exp.y - auto.cy) * k;
    }
    auto.trail.push({ x: auto.cx, y: auto.cy });
    if (auto.trail.length > 14) auto.trail.shift();
    auto.phaseT += dt;
    if (auto.phase === "trace") {
      auto.t += dt;
      const iv = mode === "custom" ? 0.24 : 0.55;
      let guard = 0;
      while (auto.t >= iv && guard++ < 4) {
        auto.t -= iv;
        const e = expectedStar();
        if (e) advanceStar(e);
        else break;
      }
      if (songDone) {
        auto.phase = "done";
        auto.phaseT = 0;
      }
    } else if (auto.phase === "done") {
      if (auto.phaseT > 7.2) {
        // caption (4s) + release (2.6s) handled by releaseAt; restart fresh
        played = 0;
        lastStar = null;
        selected = null;
        songDone = false;
        constellationGlow = 0;
        freeIdx = 0;
        releaseAt = 0;
        cb.onCaption(null);
        placeAll();
        auto.phase = "trace";
        auto.phaseT = 0;
        auto.t = 0;
      }
    }
  }

  /* ---------- interaction ---------- */
  function starsNow(): Star[] {
    return mode === "free" ? anchors : mode === "custom" ? textStars : isConst(mode) ? constStars : songStars;
  }
  function nearestStar(x: number, y: number, maxD: number, exclude: Star | null): Star | null {
    let best: Star | null = null, bd = maxD;
    const now = performance.now();
    for (const s of starsNow()) {
      if (s === exclude || now - s.born < 700) continue;
      const d = Math.hypot(s.x - x, s.y - y);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    return best;
  }
  function connectLine(a: Star, b: Star) {
    lines.push({ a, b, born: performance.now() });
    if (b.name) b.nameBorn = performance.now();
    if (!stillNow()) pops.push({ x: b.x, y: b.y, age: 0, life: 0.55 });
    buzz(8);
  }
  function advanceStar(s: Star) {
    const notes = seqNotes();
    if (lastStar && lastStar !== s && !lines.some((Ln) => (Ln.a === lastStar && Ln.b === s) || (Ln.a === s && Ln.b === lastStar)))
      connectLine(lastStar, s);
    else buzz(8);
    const n = notes[played % Math.max(1, notes.length)];
    if (n) pluck(n);
    played++;
    lastStar = s;
    selected = s;
    if (played >= seq.length && !songDone) {
      songDone = true;
      completeSong();
    }
  }
  function spawnAnchor() {
    if (mode !== "free" || anchors.length >= 10) return;
    const { top, bottom } = skyBand();
    for (let tries = 0; tries < 50; tries++) {
      const x = rand(50, W - 50), y = rand(top, bottom);
      if (anchors.every((a) => Math.hypot(a.x - x, a.y - y) > 95)) {
        const s = mkStar(x, y, rand(3.2, 4.6), 0);
        s.born = performance.now();
        anchors.push(s);
        return;
      }
    }
  }

  function onPress(x: number, y: number) {
    ensureAudio();
    liveRef.current.onInteract();
    pointer.x = x;
    pointer.y = y;
    pointer.down = true;
    // Grabbing the sky during autoplay hands control to the user.
    if (auto.on) setAutoInner(false);
    if (!stillNow()) pops.push({ x, y, age: 0, life: 0.35, faint: true });
    const s = nearestStar(x, y, 44, null);
    if (!s) {
      selected = null;
      return;
    }
    if (mode === "free") {
      selected = s;
      return;
    }
    advanceStar(s);
  }
  function onDrag(x: number, y: number) {
    pointer.x = x;
    pointer.y = y;
    if (mode === "free") {
      if (!selected) {
        const s = nearestStar(x, y, 60, null);
        if (s) selected = s;
        return;
      }
      const s = nearestStar(x, y, 60, selected);
      if (s && !lines.some((Ln) => (Ln.a === selected && Ln.b === s) || (Ln.a === s && Ln.b === selected))) {
        connectLine(selected, s);
        pluck(FREE_NOTES[freeIdx++ % FREE_NOTES.length]);
        selected = s;
      }
    } else {
      const exp = expectedStar();
      if (exp && Math.hypot(exp.x - x, exp.y - y) < 62) advanceStar(exp);
    }
  }
  function endTrace() {
    tracing = false;
    pointer.down = false;
    if (mode === "free") selected = null;
  }

  listen(canvas, "pointerdown", (e) => {
    if (blocked()) return;
    const ev = e as PointerEvent;
    tracing = true;
    try {
      canvas.setPointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
    const r = canvas.getBoundingClientRect();
    onPress(ev.clientX - r.left, ev.clientY - r.top);
    ev.preventDefault();
  });
  listen(canvas, "pointermove", (e) => {
    if (!tracing || blocked()) return;
    const ev = e as PointerEvent;
    const r = canvas.getBoundingClientRect();
    onDrag(ev.clientX - r.left, ev.clientY - r.top);
  });
  listen(canvas, "pointerup", endTrace);
  listen(canvas, "pointercancel", endTrace);
  listen(window, "resize", () => {
    sizeCanvas();
    placeAll();
  });
  try {
    window.addEventListener(
      "deviceorientation",
      (e) => {
        if (e.gamma == null && e.beta == null) return;
        orient.tx = clamp((e.gamma || 0) / 45, -1, 1) * 10;
        orient.ty = clamp(((e.beta || 0) - 45) / 45, -1, 1) * 8;
      },
      { signal: ac.signal }
    );
  } catch {
    /* ignore */
  }

  /* ---------- drawing ---------- */
  function drawStar(x: number, y: number, r: number, sprite: HTMLCanvasElement, haloR: number, haloAlpha: number, sparkle: boolean, tw: number) {
    ctx.globalAlpha = haloAlpha;
    ctx.drawImage(sprite, x - haloR, y - haloR, haloR * 2, haloR * 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(240,246,255,0.95)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    if (sparkle) {
      const sa = 0.3 + 0.25 * tw;
      ctx.strokeStyle = `rgba(240,246,255,${sa.toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - haloR * 0.95, y);
      ctx.lineTo(x + haloR * 0.95, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - haloR * 0.6);
      ctx.lineTo(x, y + haloR * 0.6);
      ctx.stroke();
    }
  }

  let raf = 0;
  let last = performance.now();
  let anchorTimer = 0, meteorTimer = rand(14, 26);

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const t = now * 0.001;
    const still = stillNow();

    if (!blocked() && !auto.on) {
      anchorTimer += dt;
      if (anchorTimer > 6.5) {
        anchorTimer = 0;
        spawnAnchor();
      }
      if (!still) {
        meteorTimer -= dt;
        if (meteorTimer <= 0) {
          meteorTimer = rand(18, 38);
          meteors.push({ x: rand(W * 0.2, W * 0.9), y: rand(0, H * 0.3), vx: rand(-260, -140), vy: rand(90, 160), age: 0, life: rand(0.9, 1.4) });
        }
      }
    }
    if (!still) {
      orient.x += (orient.tx - orient.x) * (1 - Math.pow(0.02, dt));
      orient.y += (orient.ty - orient.y) * (1 - Math.pow(0.02, dt));
    }
    stepDialSpring(dt);
    if (auto.on) stepAuto(dt);
    constellationGlow = Math.max(0, constellationGlow - dt * 0.12);

    if (releaseAt && now >= releaseAt) {
      releaseAt = 0;
      releaseLines();
      cb.onCaption(null);
    }

    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      m.age += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.vy += 3 * dt;
      if (m.age >= m.life) motes.splice(i, 1);
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.age += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.age >= m.life) meteors.splice(i, 1);
    }
    for (let i = pops.length - 1; i >= 0; i--) {
      pops[i].age += dt;
      if (pops[i].age >= pops[i].life) pops.splice(i, 1);
    }
    for (let i = waves.length - 1; i >= 0; i--) {
      waves[i].age += dt;
      if (waves[i].age >= waves[i].life) waves.splice(i, 1);
    }

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    for (const s of dust) {
      const px = still
        ? s.x * W
        : (((s.x * W + Math.sin(t * OMEGA + s.ph) * s.amp + orient.x * s.z) % W) + W) % W;
      const py = still
        ? s.y * H
        : (((s.y * H + Math.cos(t * OMEGA * 2 + s.ph) * s.amp * 0.5 + orient.y * s.z) % H) + H) % H;
      const tw = s.tw && !still ? Math.abs(Math.sin(t * OMEGA * s.k + s.ph)) : 0.5;
      ctx.globalAlpha = (s.base + s.ampT * tw) * 0.75;
      ctx.fillStyle = "#dfe8ff";
      ctx.fillRect(px, py, s.r, s.r);
    }
    ctx.globalAlpha = 1;

    for (const m of meteors) {
      const k = 1 - m.age / m.life;
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 0.22, m.y - m.vy * 0.22);
      grad.addColorStop(0, rgba(WARM, 0.9 * k));
      grad.addColorStop(1, rgba(WARM, 0));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 0.22, m.y - m.vy * 0.22);
      ctx.stroke();
    }

    if (mode === "custom" && textGhost.length) {
      ctx.strokeStyle = "rgba(185,205,255,0.13)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (const gs of textGhost) {
        ctx.moveTo(gs[0], gs[1]);
        ctx.lineTo(gs[2], gs[3]);
      }
      ctx.stroke();
    }

    const songish = mode !== "free";
    const breathe = songDone && songish && !still ? 0.14 + 0.1 * Math.sin(t * OMEGA) : 0;
    for (const Ln of lines) {
      const pulse = still ? 0.6 : 0.5 + 0.14 * Math.sin(t * OMEGA * 2 + Ln.born * 0.001);
      const la = Math.min(1, pulse + breathe + constellationGlow * 0.5);
      const thin = mode === "custom";
      ctx.strokeStyle = rgba(GOLD, (thin ? 0.1 : 0.2) * la + 0.06);
      ctx.lineWidth = thin ? 3 : 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(Ln.a.x, Ln.a.y);
      ctx.lineTo(Ln.b.x, Ln.b.y);
      ctx.stroke();
      ctx.strokeStyle = rgba(WARM, la * (thin ? 0.8 : 1));
      ctx.lineWidth = thin ? 1.3 : 1.6;
      ctx.beginPath();
      ctx.moveTo(Ln.a.x, Ln.a.y);
      ctx.lineTo(Ln.b.x, Ln.b.y);
      ctx.stroke();
      if (!still) {
        const pt = ((t * 0.25 + (Ln.born * 0.00013) % 1) % 1);
        const px = lerp(Ln.a.x, Ln.b.x, pt), py = lerp(Ln.a.y, Ln.b.y, pt);
        ctx.globalAlpha = 0.95;
        ctx.drawImage(glowWarm, px - 12, py - 12, 24, 24);
        ctx.globalAlpha = 1;
      }
    }

    const exp = expectedStar();
    ctx.textAlign = "left";
    for (const a of starsNow()) {
      const fade = clamp((now - a.born) / (still ? 1 : 2200), 0, 1);
      if (fade <= 0) continue;
      const tw = a.tw && !still ? Math.abs(Math.sin(t * OMEGA * a.k + a.ph)) : 0.5;
      const isNext = exp !== null && a === exp;
      const halo = isNext ? glowGold : songish ? glowGold : glowWhite;
      const haloR = (isNext ? 34 : mode === "custom" ? 15 : 22) * (0.7 + 0.3 * tw);
      drawStar(a.x, a.y, a.r, halo, haloR, fade * (0.55 + 0.35 * tw) * (isNext ? 1.4 : 1), !still && (isNext || a.spike), tw);
      if (a.name && a.nameBorn && now - a.nameBorn < 4500) {
        const na = clamp(1 - (now - a.nameBorn) / 4500, 0, 1);
        ctx.globalAlpha = na * 0.75;
        ctx.font = "9px ui-monospace, Menlo, monospace";
        ctx.fillStyle = "#cfe0ff";
        ctx.fillText(a.name.toUpperCase(), a.x + 13, a.y - 9);
        ctx.globalAlpha = 1;
      }
      if (isNext || selected === a) {
        let pr = (isNext ? 15 : 11) + (still ? 0 : 3 * Math.sin(t * OMEGA * 2));
        if (isNext && pointer.down && !still) {
          const d = Math.hypot(a.x - pointer.x, a.y - pointer.y);
          if (d < 90) pr = lerp(24, 12, 1 - d / 90);
        }
        ctx.strokeStyle = rgba(GOLD, isNext ? 0.9 : 0.55);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(a.x, a.y, pr, 0, TAU);
        ctx.stroke();
      }
    }

    if (auto.on) {
      for (let i = 0; i < auto.trail.length; i++) {
        const p = auto.trail[i];
        ctx.globalAlpha = (i / auto.trail.length) * 0.3;
        ctx.drawImage(glowWarm, p.x - 10, p.y - 10, 20, 20);
      }
      ctx.globalAlpha = 1;
      ctx.drawImage(glowWarm, auto.cx - 17, auto.cy - 17, 34, 34);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.arc(auto.cx, auto.cy, 2.6, 0, TAU);
      ctx.fill();
    }

    if (pointer.down && mode === "free" && !still) {
      const s = nearestStar(pointer.x, pointer.y, 70, selected);
      if (s) {
        const d = Math.hypot(s.x - pointer.x, s.y - pointer.y);
        const pr = lerp(24, 12, 1 - d / 70);
        ctx.strokeStyle = rgba(GOLD, lerp(0.2, 0.55, 1 - d / 70));
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, pr, 0, TAU);
        ctx.stroke();
      }
    }

    for (const m of motes) {
      ctx.globalAlpha = 0.65 * (1 - m.age / m.life);
      ctx.drawImage(m.col === GOLD ? glowGold : glowWhite, m.x - 8, m.y - 8, 16, 16);
    }
    ctx.globalAlpha = 1;

    for (const p of pops) {
      const k = p.age / p.life, R = p.faint ? 14 : 26;
      ctx.globalAlpha = (1 - k) * (p.faint ? 0.4 : 0.9);
      ctx.drawImage(glowWarm, p.x - R, p.y - R, R * 2, R * 2);
      if (!p.faint) {
        ctx.strokeStyle = rgba(WARM, (1 - k) * 0.7);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + k * 30, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    for (const wv of waves) {
      const k = wv.age / wv.life, e = 1 - Math.pow(1 - k, 3);
      ctx.strokeStyle = rgba(GOLD, 0.5 * (1 - k));
      ctx.lineWidth = 2.5 * (1 - k) + 0.5;
      ctx.beginPath();
      ctx.arc(wv.x, wv.y, wv.maxR * e, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = rgba(WARM, 0.25 * (1 - k));
      ctx.lineWidth = 8 * (1 - k);
      ctx.beginPath();
      ctx.arc(wv.x, wv.y, wv.maxR * e * 0.92, 0, TAU);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";
    if (!still) {
      ctx.fillStyle = `rgba(2,4,12,${(0.028 * (0.5 + 0.5 * Math.sin(t * OMEGA))).toFixed(4)})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* ---------- init / api ---------- */
  sizeCanvas();
  buildDial();
  setMode("custom");

  raf = requestAnimationFrame(frame);

  return {
    setMode: (id: string) => {
      if (auto.on) setAutoInner(false);
      setMode(id);
    },
    switchBand: () => {
      if (auto.on) setAutoInner(false);
      switchBandInner();
    },
    toggleAuto: () => {
      setAutoInner(!auto.on);
      return auto.on;
    },
    setMuted: (m: boolean) => {
      muted = m;
    },
    commitMessage: (text: string) => {
      const clean = text.toUpperCase().replace(/[^A-Z ]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE_CHARS) || "BREATHE";
      customText = clean;
      customLines = wrapMessage(clean);
      customMelody = messageMelody(clean);
      if (band !== "songs") switchBandInner();
      else setMode("custom");
      ensureAudio();
      tickSnd();
    },
    currentMessage: () => customText,
    destroy: () => {
      cancelAnimationFrame(raf);
      ac.abort();
      if (actx) {
        void actx.close().catch(() => undefined);
        actx = null;
      }
    }
  };
}
