"use client";

import { useEffect, useState } from "react";

export function useExperienceClock(maxSeconds: number) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    let previous = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.max(0, Math.floor((now - previous) / 1000));
      if (delta === 0) return;
      previous += delta * 1000;
      setElapsed((current) => {
        const next = Math.min(maxSeconds, current + delta);
        if (next >= maxSeconds) setRunning(false);
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [running, maxSeconds]);

  useEffect(() => {
    function pauseWhenHidden() {
      if (document.hidden) setRunning(false);
    }
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  function start() {
    if (elapsed >= maxSeconds) setElapsed(0);
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function reset() {
    setElapsed(0);
    setRunning(false);
  }

  return { elapsed, running, complete: elapsed >= maxSeconds, start, pause, reset };
}
