import {
  layoutTextLines,
  messageMelody,
  normalizeSkyMessage,
  wrapMessage,
} from "@/domain/worlds/vastSkyText";
import {
  SKY_CONSTELLATIONS,
  SKY_SONGS,
  FREE_NOTES,
} from "@/domain/worlds/vastSkyData";
import type { Language } from "@/domain/i18n/copy";
type Point = {
  x: number;
  y: number;
  name?: string;
};
type Station = {
  id: string;
  en: string;
  es: string;
  short: string;
};
const stations: Record<"songs" | "stars", Station[]> = {
  songs: [
    { id: "custom", en: "YOUR WORDS", es: "TUS PALABRAS", short: "WORDS" },
    { id: "free", en: "FREE", es: "LIBRE", short: "FREE" },
    { id: "still", en: "STILL WATER", es: "AGUA QUIETA", short: "STILL" },
    { id: "night", en: "NIGHT WALK", es: "PASEO NOCTURNO", short: "NIGHT" },
    { id: "dawn", en: "FIRST LIGHT", es: "PRIMERA LUZ", short: "DAWN" },
  ],
  stars: Object.entries(SKY_CONSTELLATIONS).map(([id, value]) => ({
    id,
    en: value.name,
    es: (
      {
        orion: "ORIÓN",
        dipper: "OSA MAYOR",
        cassiopeia: "CASIOPEA",
        cygnus: "CISNE",
        lyra: "LIRA",
        scorpius: "ESCORPIO",
        leo: "LEÓN",
        littledipper: "OSA MENOR",
      } as Record<string, string>
    )[id],
    short: value.short,
  })),
};
export type SkyState = {
  station: Station;
  band: "songs" | "stars";
  index: number;
  count: number;
  next: Point | null;
  traced: number;
  finished: boolean;
  auto: boolean;
  message: string;
};
export type SkyLive = {
  language: Language;
  paused: boolean;
  complete: boolean;
  still: boolean;
  running: boolean;
  onInteract: () => void;
};
export type SkyEngine = {
  sync: () => void;
  traceNext: () => void;
  restart: () => void;
  switchBand: () => void;
  toggleAuto: () => void;
  setSound: (enabled: boolean) => boolean;
  setVolume: (volume: number) => void;
  setHaptics: (enabled: boolean) => void;
  commitMessage: (text: string) => void;
  pointer: (kind: "start" | "move" | "end", x: number, y: number) => void;
  destroy: () => void;
};
export function createSkyEngine(
  canvas: HTMLCanvasElement,
  root: HTMLDivElement,
  live: {
    current: SkyLive;
  },
  report: (state: SkyState) => void,
  soundChanged: (enabled: boolean, error?: boolean) => void,
): SkyEngine {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const abort = new AbortController();
  let width = 1,
    height = 1,
    band: "songs" | "stars" = "songs",
    index = 0;
  let message = live.current.language === "es" ? "RESPIRA" : "BREATHE";
  let points: Point[] = [],
    ghosts: Array<[number, number, number, number]> = [],
    order: number[] = [];
  let traced = 0,
    auto = false,
    autoTime = 0,
    pointerDown = false,
    destroyed = false;
  let raf = 0,
    last = 0,
    elapsed = 0,
    haptics = false,
    sound = false,
    volume = 0.35;
  let audio: AudioContext | null = null,
    master: GainNode | null = null;
  const voices = new Set<OscillatorNode>();
  const dust = Array.from({ length: 80 }, () => ({
    x: Math.random(),
    y: Math.random(),
    phase: Math.random() * Math.PI * 2,
    size: 0.6 + Math.random() * 1.2,
  }));
  const station = () => stations[band][index];
  const blocked = () =>
    destroyed ||
    document.hidden ||
    live.current.paused ||
    live.current.complete;
  const freeLinks: Array<[Point, Point]> = [];
  let freeLast: Point | null = null;
  const free = () => station().id === "free";
  const finished = () => !free() && traced >= order.length;
  const next = () =>
    finished() ? null : points[order[traced % Math.max(1, order.length)]];
  function emit() {
    report({
      station: station(),
      band,
      index,
      count: stations[band].length,
      next: next(),
      traced,
      finished: finished(),
      auto,
      message,
    });
  }
  function stopAudio() {
    sound = false;
    voices.forEach((voice) => {
      try {
        voice.stop();
      } catch {
        /* already stopped */
      }
    });
    voices.clear();
    if (master) {
      master.gain.value = 0;
      master.disconnect();
      master = null;
    }
    if (audio) {
      void audio.close().catch(() => undefined);
      audio = null;
    }
    soundChanged(false);
  }
  function tone(frequency: number) {
    if (!sound || !audio || !master || blocked() || !frequency) return;
    if (voices.size >= 8) return;
    const voice = audio.createOscillator(),
      envelope = audio.createGain();
    voice.type = "sine";
    voice.frequency.value = frequency;
    const now = audio.currentTime;
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    voice.connect(envelope);
    envelope.connect(master);
    voices.add(voice);
    voice.onended = () => {
      voices.delete(voice);
      voice.disconnect();
      envelope.disconnect();
    };
    voice.start();
    voice.stop(now + 1.15);
  }
  function vibrate() {
    if (!haptics || live.current.still || blocked()) return;
    try {
      navigator.vibrate?.(8);
    } catch {
      /* unsupported device */
    }
  }
  function region() {
    const bounds = root.getBoundingClientRect();
    const dock = root
      .querySelector<HTMLElement>(".vsky-dock")
      ?.getBoundingClientRect();
    const stage = root
      .closest(".world-screen")
      ?.querySelector<HTMLElement>(".world-stage")
      ?.getBoundingClientRect();
    const top = (dock ? dock.bottom - bounds.top : 250) + 34;
    const bottom = Math.max(
      top + 40,
      (stage ? stage.top - bounds.top : height - 200) - 40,
    );
    return { top, bottom };
  }
  function layout() {
    const previousPoints = points;
    const bounds = region(),
      meta = station();
    ghosts = [];
    const y = (value: number) =>
      bounds.top + value * (bounds.bottom - bounds.top);
    if (meta.id === "custom") {
      const text = layoutTextLines(
        wrapMessage(message),
        Math.max(48, width - 72),
        height,
        bounds,
      );
      points = text.stars.map((point) => ({ x: point.x + 36, y: point.y }));
      ghosts = text.ghosts.map(([x1, y1, x2, y2]) => [
        x1 + 36,
        y1,
        x2 + 36,
        y2,
      ]);
      order = points.map((_, i) => i);
    } else if (meta.id === "free") {
      points = Array.from({ length: 8 }, (_, i) => ({
        x: width * (0.14 + (i % 4) * 0.24),
        y: y(i < 4 ? 0.25 : 0.75),
      }));
      order = points.map((_, i) => i);
    } else if (SKY_CONSTELLATIONS[meta.id]) {
      const shape = SKY_CONSTELLATIONS[meta.id];
      points = shape.stars.map(([x, ny, name]) => ({
        x: width * (0.12 + x * 0.76),
        y: y(ny),
        name,
      }));
      order = shape.order;
    } else {
      points = SKY_SONGS[meta.id].shape.map(([x, ny]) => ({
        x: width * (0.12 + x * 0.76),
        y: y(ny),
      }));
      order = points.map((_, i) => i);
    }
    if (free()) {
      const relocate = (point: Point) =>
        points[previousPoints.indexOf(point)] ?? point;
      for (let i = 0; i < freeLinks.length; i++) {
        freeLinks[i] = freeLinks[i].map(relocate) as [Point, Point];
      }
      if (freeLast) freeLast = relocate(freeLast);
    }
    emit();
  }
  function draw() {
    if (destroyed) return;
    root.dataset.frames = String(Number(root.dataset.frames ?? 0) + 1);
    ctx!.clearRect(0, 0, width, height);
    for (const dot of dust) {
      const opacity = live.current.still
        ? 0.35
        : 0.25 + Math.sin(elapsed * 0.25 + dot.phase) * 0.12;
      ctx!.fillStyle = `rgba(216,231,255,${opacity})`;
      ctx!.fillRect(dot.x * width, dot.y * height, dot.size, dot.size);
    }
    ctx!.lineCap = "round";
    ctx!.strokeStyle = "rgba(202,217,250,.24)";
    ctx!.lineWidth = 1;
    ctx!.beginPath();
    for (const [x1, y1, x2, y2] of ghosts) {
      ctx!.moveTo(x1, y1);
      ctx!.lineTo(x2, y2);
    }
    ctx!.stroke();
    const paths: Array<[Point, Point]> = free()
      ? freeLinks
      : order.slice(1, traced).flatMap((value, i) => {
          const a = points[order[i]],
            b = points[value];
          if (
            station().id === "custom" &&
            !ghosts.some(
              ([x1, y1, x2, y2]) =>
                x1 === a.x && y1 === a.y && x2 === b.x && y2 === b.y,
            )
          )
            return [];
          return [[a, b] as [Point, Point]];
        });
    for (const [a, b] of paths) {
      ctx!.strokeStyle = "rgba(255,219,163,.13)";
      ctx!.lineWidth = 7;
      ctx!.beginPath();
      ctx!.moveTo(a.x, a.y);
      ctx!.lineTo(b.x, b.y);
      ctx!.stroke();
      ctx!.strokeStyle = "rgba(255,237,205,.85)";
      ctx!.lineWidth = 1.5;
      ctx!.stroke();
    }
    const current = next();
    for (const point of points) {
      const selected =
        point === current ||
        (free()
          ? point === freeLast
          : order.slice(0, traced).some((value) => points[value] === point));
      const radius = selected ? 19 : 11;
      const glow = ctx!.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        radius,
      );
      glow.addColorStop(
        0,
        selected ? "rgba(255,222,167,.6)" : "rgba(198,218,255,.28)",
      );
      glow.addColorStop(1, "transparent");
      ctx!.fillStyle = glow;
      ctx!.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
      ctx!.fillStyle = selected ? "#fff2d8" : "#cedcf0";
      ctx!.beginPath();
      ctx!.arc(point.x, point.y, selected ? 3 : 2, 0, Math.PI * 2);
      ctx!.fill();
      if (point === current) {
        ctx!.strokeStyle = "rgba(255,226,180,.8)";
        ctx!.lineWidth = 1.2;
        ctx!.beginPath();
        ctx!.arc(point.x, point.y, 15, 0, Math.PI * 2);
        ctx!.stroke();
      }
    }
  }
  function notes() {
    return station().id === "custom"
      ? messageMelody(message)
      : (SKY_CONSTELLATIONS[station().id]?.notes ??
          SKY_SONGS[station().id]?.notes ??
          FREE_NOTES);
  }
  function tracePoint(point: Point | null) {
    if (blocked() || finished()) return;
    if (!point) return;
    live.current.onInteract();
    if (free()) {
      if (point === freeLast) return;
      if (freeLast) freeLinks.push([freeLast, point]);
      if (freeLinks.length > 40) freeLinks.shift();
      freeLast = point;
    }
    const frequencies = notes();
    tone(frequencies[traced % frequencies.length]);
    vibrate();
    traced++;
    if (finished()) auto = false;
    emit();
    draw();
    sync();
  }
  function traceNext() {
    tracePoint(next());
  }
  function restart() {
    traced = 0;
    auto = false;
    pointerDown = false;
    freeLinks.length = 0;
    freeLast = null;
    emit();
    draw();
  }
  function changeStation(value: number) {
    index = (value + stations[band].length) % stations[band].length;
    traced = 0;
    auto = false;
    freeLinks.length = 0;
    freeLast = null;
    layout();
    draw();
    sync();
  }
  function resize() {
    width = root.clientWidth || window.innerWidth;
    height = root.clientHeight || window.innerHeight;
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      2,
      Math.sqrt(2000000 / (width * height)),
    );
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    layout();
    draw();
  }
  function frame(now: number) {
    raf = 0;
    if (blocked() || !live.current.running || live.current.still) {
      sync();
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    if (auto) {
      autoTime += dt;
      if (autoTime >= 0.55) {
        autoTime = 0;
        traceNext();
      }
    }
    draw();
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function sync() {
    if (destroyed) return;
    const active = !blocked() && live.current.running && !live.current.still;
    root.dataset.rendering = blocked()
      ? "paused"
      : live.current.still
        ? "still"
        : active
          ? "running"
          : "ready";
    if (blocked()) {
      if (sound) stopAudio();
      if (auto) {
        auto = false;
        emit();
      }
      pointerDown = false;
    }
    if (!active) {
      cancelAnimationFrame(raf);
      raf = 0;
      draw();
    } else if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  function pointer(
    kind: "start" | "move" | "end",
    clientX: number,
    clientY: number,
  ) {
    if (kind === "end") {
      pointerDown = false;
      return;
    }
    if (blocked()) return;
    if (kind === "start") {
      pointerDown = true;
      if (auto) {
        auto = false;
        emit();
      }
      live.current.onInteract();
    }
    if (!pointerDown) return;
    const bounds = canvas.getBoundingClientRect(),
      x = clientX - bounds.left,
      y = clientY - bounds.top;
    const target = free()
      ? points.reduce<Point | null>(
          (best, point) =>
            point !== freeLast &&
            (!best ||
              Math.hypot(x - point.x, y - point.y) <
                Math.hypot(x - best.x, y - best.y))
              ? point
              : best,
          null,
        )
      : next();
    if (target && Math.hypot(x - target.x, y - target.y) <= 36)
      tracePoint(target);
  }
  const listen = (
    element: Element | Document | Window,
    type: string,
    action: (event: Event) => void,
  ) => element.addEventListener(type, action, { signal: abort.signal });
  listen(canvas, "pointerdown", (event) => {
    const e = event as PointerEvent;
    canvas.setPointerCapture(e.pointerId);
    pointer("start", e.clientX, e.clientY);
  });
  listen(canvas, "pointermove", (event) => {
    const e = event as PointerEvent;
    pointer("move", e.clientX, e.clientY);
  });
  listen(canvas, "pointerup", () => pointer("end", 0, 0));
  listen(canvas, "pointercancel", () => pointer("end", 0, 0));
  listen(document, "visibilitychange", sync);
  const dial = root.querySelector<SVGSVGElement>("#vsky-dial");
  if (dial) {
    listen(dial, "keydown", (event) => {
      const e = event as KeyboardEvent;
      if (!e.key.startsWith("Arrow") || blocked()) return;
      e.preventDefault();
      changeStation(
        index + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1),
      );
    });
    let dialDown = false,
      startX = 0,
      moved = false;
    listen(dial, "pointerdown", (event) => {
      if (blocked()) return;
      const e = event as PointerEvent;
      dialDown = true;
      startX = e.clientX;
      moved = false;
      dial.setPointerCapture(e.pointerId);
    });
    listen(dial, "pointermove", (event) => {
      const e = event as PointerEvent;
      if (dialDown && Math.abs(e.clientX - startX) > 25) {
        changeStation(index + (e.clientX > startX ? 1 : -1));
        startX = e.clientX;
        moved = true;
      }
    });
    listen(dial, "pointerup", () => {
      if (dialDown && !moved) changeStation(index + 1);
      dialDown = false;
    });
    listen(dial, "pointercancel", () => {
      dialDown = false;
    });
  }
  const observer = new ResizeObserver(resize);
  observer.observe(root);
  const stage = root.closest(".world-screen")?.querySelector(".world-stage");
  if (stage) observer.observe(stage);
  resize();
  sync();
  return {
    sync,
    traceNext,
    restart,
    pointer,
    switchBand: () => {
      if (blocked()) return;
      band = band === "songs" ? "stars" : "songs";
      changeStation(0);
    },
    toggleAuto: () => {
      if (blocked() || live.current.still) return;
      auto = !auto;
      if (auto) {
        if (free()) {
          changeStation(0);
          auto = true;
        }
        if (finished()) traced = 0;
        autoTime = 0;
        live.current.onInteract();
      }
      emit();
      sync();
    },
    setSound: (enabled) => {
      if (!enabled) {
        stopAudio();
        return false;
      }
      if (blocked()) return false;
      try {
        audio = new window.AudioContext();
        master = audio.createGain();
        master.gain.value = volume;
        master.connect(audio.destination);
        sound = true;
        const requestedAudio = audio;
        void requestedAudio.resume().catch(() => {
          if (audio !== requestedAudio || destroyed) return;
          stopAudio();
          soundChanged(false, true);
        });
        live.current.onInteract();
        soundChanged(true);
        return true;
      } catch {
        stopAudio();
        soundChanged(false, true);
        return false;
      }
    },
    setVolume: (value) => {
      volume = Math.min(1, Math.max(0, value));
      if (master && audio)
        master.gain.setTargetAtTime(volume, audio.currentTime, 0.03);
    },
    setHaptics: (enabled) => {
      haptics = enabled;
    },
    commitMessage: (text) => {
      message = normalizeSkyMessage(
        text,
        live.current.language === "es" ? "RESPIRA" : "BREATHE",
      );
      band = "songs";
      changeStation(0);
    },
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      abort.abort();
      stopAudio();
    },
  };
}
