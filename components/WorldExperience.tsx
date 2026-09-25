"use client";

import { useEffect, useMemo, useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import type { BreathPhase, World } from "@/domain/worlds/types";

const BREATH_SECONDS = 4;

const labels = {
  en: {
    kicker: "SootheSpot World",
    ready: "When you're ready",
    follow: "Follow the circle. There is nothing else to solve.",
    press: "Press start and let the rhythm do the counting.",
    begin: "Begin",
    pause: "Pause",
    reset: "Reset",
    breatheIn: "Breathe in",
    hold: "Pause",
    breatheOut: "Breathe out",
    focus: "Choose one point to notice.",
    focusSub: "Let your attention rest there for one slow breath.",
    startMinutes: (minutes: number) => `Start ${minutes} minutes`,
    garden: "Come back to the room.",
    gardenSub: "Tap each sense after you notice something.",
    noticed: "Noticed",
    senses: ["See", "Hear", "Feel", "Smell", "Taste"],
    prompts: ["Look for one shape or color.", "Notice one sound near you.", "Notice one point of contact.", "Notice one scent.", "Notice one taste or sensation."],
    count: (n: number, total: number) => `${n} of ${total} senses noticed`,
    boundary: "SootheSpot Worlds are brief self-guided experiences, not emergency care or a substitute for professional support."
  },
  es: {
    kicker: "Mundo SootheSpot",
    ready: "Cuando estés listo/a",
    follow: "Sigue el círculo. No hay nada más que resolver ahora.",
    press: "Pulsa empezar y deja que el ritmo lleve la cuenta.",
    begin: "Empezar",
    pause: "Pausar",
    reset: "Reiniciar",
    breatheIn: "Inhala",
    hold: "Pausa",
    breatheOut: "Exhala",
    focus: "Elige un punto para observar.",
    focusSub: "Deja que tu atención descanse allí durante una respiración lenta.",
    startMinutes: (minutes: number) => `Empezar ${minutes} minutos`,
    garden: "Vuelve a la habitación.",
    gardenSub: "Toca cada sentido después de notar algo.",
    noticed: "Notado",
    senses: ["Ver", "Oír", "Sentir", "Oler", "Saborear"],
    prompts: ["Busca una forma o un color.", "Nota un sonido cercano.", "Nota un punto de contacto.", "Nota un olor.", "Nota un sabor o una sensación."],
    count: (n: number, total: number) => `${n} de ${total} sentidos notados`,
    boundary: "Los Mundos SootheSpot son experiencias breves y autoguiadas; no son atención de emergencia ni sustituyen el apoyo profesional."
  }
} as const;

function phaseFor(second: number): BreathPhase {
  if (second < BREATH_SECONDS) return "inhale";
  if (second < BREATH_SECONDS * 2) return "hold";
  return "exhale";
}

export function WorldExperience({
  world,
  onClose,
  language
}: {
  world: World;
  onClose: () => void;
  language: Language;
}) {
  const t = labels[language];
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [noticed, setNoticed] = useState<string[]>([]);
  const maxSeconds = world.durationMinutes * 60;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsed((current) => {
        const next = current + 1;
        if (next >= maxSeconds) {
          setRunning(false);
          return maxSeconds;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, maxSeconds]);

  const cycleSecond = elapsed % (BREATH_SECONDS * 3);
  const phase = phaseFor(cycleSecond);
  const phaseLabel = phase === "inhale" ? t.breatheIn : phase === "hold" ? t.hold : t.breatheOut;
  const cycleProgress = ((cycleSecond + 1) / (BREATH_SECONDS * 3)) * 100;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const senses = useMemo(
    () => t.senses.map((label, index) => [label, t.prompts[index]] as const),
    [t]
  );

  function toggleNoticed(label: string) {
    setNoticed((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  }

  function toggleTimer() {
    if (!running && elapsed >= maxSeconds) setElapsed(0);
    setRunning((value) => !value);
  }

  return (
    <div className={`world-screen world-${world.id}`} role="dialog" aria-modal="true" aria-label={world.title}>
      <div className="world-topbar">
        <div>
          <span className="world-kicker">{t.kicker}</span>
          <h2>{world.title}</h2>
        </div>
        <button className="world-close" onClick={onClose} aria-label={language === "en" ? "Close experience" : "Cerrar experiencia"}>×</button>
      </div>

      {world.id === "ocean-calm" && (
        <section className="world-stage ocean-stage">
          <div className={`breath-orb ${running ? "breathing" : ""}`} aria-hidden="true">
            <div className="breath-orb-inner" />
          </div>
          <p className="world-phase">{running ? phaseLabel : t.ready}</p>
          <p className="world-subtle">
            {running ? t.follow : t.press}
          </p>
          <div className="world-controls">
            <button className="world-primary" onClick={toggleTimer}>
              {running ? t.pause : t.begin}
            </button>
            <button className="world-secondary" onClick={() => { setElapsed(0); setRunning(false); }}>
              {t.reset}
            </button>
          </div>
          <div className="world-progress" aria-label={`${Math.round(cycleProgress)} percent through breathing cycle`}>
            <span style={{ width: `${cycleProgress}%` }} />
          </div>
          <p className="world-timer">{minutes}:{String(seconds).padStart(2, "0")} / {world.durationMinutes}:00</p>
        </section>
      )}

      {world.id === "soft-focus" && (
        <section className="world-stage focus-stage">
          <div className="focus-field" aria-hidden="true">
            <span className="focus-glow focus-glow-a" />
            <span className="focus-glow focus-glow-b" />
            <span className="focus-dot" />
          </div>
          <p className="world-phase">{t.focus}</p>
          <p className="world-subtle">{t.focusSub}</p>
          <div className="world-controls">
            <button className="world-primary" onClick={toggleTimer}>
              {running ? t.pause : t.startMinutes(world.durationMinutes)}
            </button>
            <button className="world-secondary" onClick={() => { setElapsed(0); setRunning(false); }}>{t.reset}</button>
          </div>
          <p className="world-timer">{minutes}:{String(seconds).padStart(2, "0")} / {world.durationMinutes}:00</p>
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
          <p className="world-phase">{t.garden}</p>
          <p className="world-subtle">{t.gardenSub}</p>
          <div className="sense-grid">
            {senses.map(([label, prompt]) => (
              <button
                key={label}
                className={`sense-card ${noticed.includes(label) ? "noticed" : ""}`}
                onClick={() => toggleNoticed(label)}
              >
                <strong>{label}</strong>
                <small>{noticed.includes(label) ? t.noticed : prompt}</small>
              </button>
            ))}
          </div>
          <p className="world-count">{t.count(noticed.length, senses.length)}</p>
        </section>
      )}

      <p className="world-boundary">{t.boundary}</p>
    </div>
  );
}
