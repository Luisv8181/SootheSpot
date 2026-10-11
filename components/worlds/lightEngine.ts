import { clampLightGesture, lightThreadPoint, type LightGesture, type LightPoint } from "@/domain/worlds/livingLight";
import { crossedLightStrings } from "@/domain/worlds/lightStrum";

export function createLightEngine(canvas: HTMLCanvasElement, sampleTime: () => number) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  let width = 1, height = 1, scale = 1, frame = 0, last = 0;
  let running = false, still = false, destroyed = false, gather = 0, moved = performance.now();
  let visualTime = 0, previousTime = 0;
  let target: LightGesture = { x: .5, y: .5, held: false, spread: 1, rotation: 0 };
  let gesture = { ...target };
  const strikes = Array<number>(8).fill(-Infinity);
  function lines() { return Array.from({ length: 8 }, (_, note) => Array.from({ length: 64 }, (_, step) => lightThreadPoint(note * 12 + 6, step, visualTime, gather, gesture))); }
  const colors = ["153,222,205", "190,167,226", "227,201,146"];
  function draw() {
    if (destroyed) return;
    const ctx = context!;
    const now = sampleTime();
    const dt = Math.min(.05, Math.max(0, now - previousTime)); previousTime = now;
    const hold = target.held && (still || performance.now() - moved > 300);
    if (running && !still && !document.hidden) {
      visualTime += dt;
      gather += ((hold ? 1 : 0) - gather) * dt * 1.8;
      for (const key of ["x", "y", "spread", "rotation"] as const) gesture[key] += (target[key] - gesture[key]) * Math.min(1, dt * 4);
    } else if (still) { gesture = { ...target }; gather = target.held ? 1 : 0; }
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#081421"; ctx.fillRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(gesture.x * width, gesture.y * height, 0, gesture.x * width, gesture.y * height, Math.max(width, height) * .65);
    glow.addColorStop(0, "#163c454d"); glow.addColorStop(.5, "#22213926"); glow.addColorStop(1, "#08142100");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";
    for (let thread = 0; thread < 96; thread++) {
      const note = Math.floor(thread / 12);
      const resonance = Math.exp(-Math.max(0, visualTime - strikes[note]) * 3);
      const point = (step: number) => { const p = lightThreadPoint(thread, step, visualTime, gather, gesture); return { x: p.x, y: p.y + (still || resonance === 0 ? 0 : Math.sin(step * .6 - (visualTime - strikes[note]) * 20) * Math.sin(step / 63 * Math.PI) * .006 * resonance) }; };
      ctx.beginPath();
      let previous = point(0);
      ctx.moveTo(previous.x * width, previous.y * height);
      for (let step = 0; step < 64; step++) {
        const p = point(step);
        if (step > 0) ctx.quadraticCurveTo(previous.x * width, previous.y * height, (previous.x + p.x) * width / 2, (previous.y + p.y) * height / 2);
        previous = p;
      }
      ctx.lineTo(previous.x * width, previous.y * height);
      const depth = .25 + .75 * (thread % 12) / 11;
      const musical = thread % 12 === 6;
      ctx.strokeStyle = `rgba(${colors[note % 3]},${Math.min(.9, (musical ? .55 : .06 + depth * .12) + resonance * .25)})`; ctx.lineWidth = musical ? 2.2 + resonance : .4 + depth; ctx.stroke();
      if (thread % 8 === 0) {
        const p = lightThreadPoint(thread, ((visualTime * .025 + thread / 96) % 1) * 63, visualTime, gather, gesture);
        ctx.fillStyle = `rgba(${colors[thread % 3]},.55)`; ctx.beginPath(); ctx.arc(p.x * width, p.y * height, 1.3, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = "source-over";
    canvas.dataset.gather = gather.toFixed(2);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    scale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(1_200_000 / (width * height)));
    canvas.width = Math.floor(width * scale); canvas.height = Math.floor(height * scale); draw();
  }
  function tick(time: number) { frame = 0; if (!running || still || document.hidden || destroyed) return; if (time - last >= 1000 / 30) { last = time; draw(); } frame = requestAnimationFrame(tick); }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previousTime = sampleTime();
    canvas.dataset.animating = String(running && !still && !document.hidden && !destroyed);
    draw(); if (running && !still && !document.hidden && !destroyed) frame = requestAnimationFrame(tick);
  }
  function visibility() { if (document.hidden) target.held = false; sync(); }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  document.addEventListener("visibilitychange", visibility); resize();
  return {
    strum(from: LightPoint, to: LightPoint) { const notes = crossedLightStrings(from, to, lines(), width, height); for (const note of notes) strikes[note] = visualTime; if (still) draw(); return notes; },
    pluck(note: number) { if (Number.isInteger(note) && note >= 0 && note < 8) { strikes[note] = visualTime; if (still) draw(); } },
    gesture(next: LightGesture) { const value = clampLightGesture(next); if (value.x !== target.x || value.y !== target.y || value.held !== target.held) moved = performance.now(); target = value; if (still) draw(); },
    motion(active: boolean, quiet: boolean) { if (!active) target.held = false; running = active; still = quiet; sync(); },
    destroy() { destroyed = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); }
  };
}
