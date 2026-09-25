"use client";

import { useEffect, useMemo, useState } from "react";
import type { BreathPhase, World } from "@/domain/worlds/types";

const BREATH_SECONDS = 4;

function phaseFor(second: number): BreathPhase {
  if (second < BREATH_SECONDS) return "inhale";
  if (second < BREATH_SECONDS * 2) return "hold";
  return "exhale";
}

export function WorldExperience({
  world,
  onClose
}: {
  world: World;
  onClose: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [noticed, setNoticed] = useState<string[]>([]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const cycleSecond = elapsed % (BREATH_SECONDS * 3);
  const phase = phaseFor(cycleSecond);
  const phaseLabel = phase === "inhale" ? "Breathe in" : phase === "hold" ? "Pause" : "Breathe out";
  const cycleProgress = ((cycleSecond + 1) / (BREATH_SECONDS * 3)) * 100;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const senses = useMemo(
    () => [
      ["See", "Look for one shape or color."],
      ["Hear", "Notice one sound near you."],
      ["Feel", "Notice one point of contact."],
      ["Smell", "Notice one scent."],
      ["Taste", "Notice one taste or sensation."]
    ],
    []
  );

  function toggleNoticed(label: string) {
    setNoticed((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  }

  return (
    <div className={`world-screen world-${world.id}`} role="dialog" aria-modal="true" aria-label={world.title}>
      <div className="world-topbar">
        <div>
          <span className="world-kicker">SootheSpot World</span>
          <h2>{world.title}</h2>
        </div>
        <button className="world-close" onClick={onClose} aria-label="Close experience">×</button>
      </div>

      {world.id === "ocean-calm" && (
        <section className="world-stage ocean-stage">
          <div className={`breath-orb ${running ? "breathing" : ""}`} aria-hidden="true">
            <div className="breath-orb-inner" />
          </div>
          <p className="world-phase">{running ? phaseLabel : "When you're ready"}</p>
          <p className="world-subtle">
            {running ? "Follow the circle. There is nothing else to solve." : "Press start and let the rhythm do the counting."}
          </p>
          <div className="world-controls">
            <button className="world-primary" onClick={() => setRunning((value) => !value)}>
              {running ? "Pause" : "Begin"}
            </button>
            <button className="world-secondary" onClick={() => setElapsed(0)}>
              Reset
            </button>
          </div>
          <div className="world-progress" aria-label={`${Math.round(cycleProgress)} percent through breathing cycle`}>
            <span style={{ width: `${cycleProgress}%` }} />
          </div>
          <p className="world-timer">{minutes}:{String(seconds).padStart(2, "0")}</p>
        </section>
      )}

      {world.id === "soft-focus" && (
        <section className="world-stage focus-stage">
          <div className="focus-field" aria-hidden="true">
            <span className="focus-glow focus-glow-a" />
            <span className="focus-glow focus-glow-b" />
            <span className="focus-dot" />
          </div>
          <p className="world-phase">Choose one point to notice.</p>
          <p className="world-subtle">Let your attention rest there for one slow breath.</p>
          <div className="world-controls">
            <button className="world-primary" onClick={() => setRunning((value) => !value)}>
              {running ? "Pause" : "Start 3 minutes"}
            </button>
            <button className="world-secondary" onClick={() => setElapsed(0)}>Reset</button>
          </div>
          <p className="world-timer">{minutes}:{String(seconds).padStart(2, "0")}</p>
        </section>
      )}

      {world.id === "grounding-garden" && (
        <section className="world-stage garden-stage">
          <div className="garden-visual" aria-hidden="true">
            <div className="garden-sun" />
            <div className="garden-hill garden-hill-one" />
            <div className="garden-hill garden-hill-two" />
            <div className="garden-stem" />
          </div>
          <p className="world-phase">Come back to the room.</p>
          <p className="world-subtle">Tap each sense after you notice something.</p>
          <div className="sense-grid">
            {senses.map(([label, prompt]) => (
              <button
                key={label}
                className={`sense-card ${noticed.includes(label) ? "noticed" : ""}`}
                onClick={() => toggleNoticed(label)}
              >
                <strong>{label}</strong>
                <small>{noticed.includes(label) ? "Noticed" : prompt}</small>
              </button>
            ))}
          </div>
          <p className="world-count">{noticed.length} of {senses.length} senses noticed</p>
        </section>
      )}

      <p className="world-boundary">
        SootheSpot Worlds are brief self-guided experiences, not emergency care or a substitute for professional support.
      </p>
    </div>
  );
}
