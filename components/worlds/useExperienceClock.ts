"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sessionMilliseconds } from "@/domain/worlds/water";

export function useExperienceClock(maxSeconds: number) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const stored = useRef(0);
  const started = useRef<number | null>(null);
  const sampleTime = useCallback(() => sessionMilliseconds(stored.current, started.current, Date.now(), maxSeconds * 1000) / 1000, [maxSeconds]);

  const pause = useCallback(() => {
    stored.current = sampleTime() * 1000;
    started.current = null;
    setElapsed(Math.floor(stored.current / 1000));
    setRunning(false);
  }, [sampleTime]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const seconds = sampleTime();
      setElapsed(Math.floor(seconds));
      if (seconds >= maxSeconds) pause();
    }, 100);
    return () => window.clearInterval(id);
  }, [running, maxSeconds, sampleTime, pause]);

  useEffect(() => {
    function pauseWhenHidden() { if (document.hidden) pause(); }
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, [pause]);

  function start() {
    if (started.current !== null) return;
    if (stored.current >= maxSeconds * 1000) { stored.current = 0; setElapsed(0); }
    started.current = Date.now();
    setRunning(true);
  }

  function reset() {
    stored.current = 0;
    started.current = null;
    setElapsed(0);
    setRunning(false);
  }

  return { elapsed, running, complete: elapsed >= maxSeconds, sampleTime, start, pause, reset };
}
