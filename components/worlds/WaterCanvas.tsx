"use client";

import { useEffect, useRef, useState } from "react";
import { breathEnvelope, type Ripple } from "@/domain/worlds/water";
import type { BreathActivity } from "@/domain/worlds/types";
import { waterArtwork } from "./waterArtwork";
import { createWaterRenderer } from "./waterShader";

export function WaterCanvas({ kind, running, still, sampleTime, ripples = [], rhythm }: {
  kind: "ocean" | "pool"; running: boolean; still: boolean; sampleTime: () => number; ripples?: readonly Ripple[]; rhythm?: BreathActivity;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef({ running, still, sampleTime, ripples, rhythm });
  latest.current = { running, still, sampleTime, ripples, rhythm };
  const redraw = useRef(() => {});
  const [renderer, setRenderer] = useState("loading");
  const art = waterArtwork[kind];

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    let disposed = false;
    let lost = false;
    let frame = 0;
    let lastFrame = 0;
    let graphics: ReturnType<typeof createWaterRenderer> = null;
    function resize() {
      const bounds = surface!.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(900000 / Math.max(1, bounds.width * bounds.height)));
      const width = Math.max(1, Math.floor(bounds.width * scale));
      const height = Math.max(1, Math.floor(bounds.height * scale));
      if (surface!.width !== width || surface!.height !== height) { surface!.width = width; surface!.height = height; }
      redraw.current();
    }
    function draw() {
      const settings = latest.current;
      const time = settings.sampleTime();
      graphics?.draw(time, settings.rhythm ? breathEnvelope(time, settings.rhythm) : 0, settings.ripples, settings.still);
    }
    function tick(timestamp: number) {
      if (disposed || lost) return;
      if (timestamp - lastFrame >= 1000 / 30) { draw(); lastFrame = timestamp; }
      frame = window.requestAnimationFrame(tick);
    }
    redraw.current = () => {
      window.cancelAnimationFrame(frame);
      if (!graphics || lost || disposed) return;
      draw();
      if (latest.current.running && !latest.current.still) frame = window.requestAnimationFrame(tick);
    };
    function contextLost(event: Event) {
      event.preventDefault();
      lost = true;
      window.cancelAnimationFrame(frame);
      setRenderer("fallback");
    }
    surface.addEventListener("webglcontextlost", contextLost);
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    resize();
    const image = new Image();
    image.onload = () => {
      if (disposed || lost) return;
      graphics = createWaterRenderer(surface, image, kind === "ocean");
      setRenderer(graphics ? "webgl" : "fallback");
      redraw.current();
    };
    image.onerror = () => { if (!disposed) setRenderer("fallback"); };
    image.src = art.src;
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      surface.removeEventListener("webglcontextlost", contextLost);
      image.onload = null;
      image.onerror = null;
      graphics?.dispose();
      redraw.current = () => {};
    };
  }, [art.src, kind]);

  useEffect(() => { redraw.current(); }, [running, still, ripples, sampleTime]);

  return <div className={`water-surface water-${kind}`} data-renderer={renderer} data-motion={still || renderer === "fallback" ? "still" : running ? "running" : "paused"} aria-hidden="true">
    <img className="water-artwork" src={art.src} alt="" draggable={false} decoding="async" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
    <canvas className="water-canvas" ref={canvas} />
  </div>;
}
