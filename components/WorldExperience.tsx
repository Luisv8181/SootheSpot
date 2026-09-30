"use client";

import { useMemo, useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import type { BreathActivity, GroundingActivity, World } from "@/domain/worlds/types";
import { breathPhaseAt } from "@/domain/worlds/spec";
import { Dialog } from "./Dialog";
import { useExperienceClock } from "./worlds/useExperienceClock";

const labels = {
  en: {
    kicker: "SootheSpot World",
    ready: "Ready when you are",
    begin: "Start",
    pause: "Pause",
    resume: "Resume",
    reset: "Reset",
    done: "Done",
    exit: "Close experience",
    breatheIn: "Breathe in",
    hold: "Pause softly",
    breatheOut: "Breathe out",
    steady: "Let your attention rest on one steady point.",
    complete: "That is enough for this round.",
    completionSub: "Notice whether you want to continue, stop, or return to your toolbox.",
    noticed: "Noticed",
    undo: "Undo",
    progress: (elapsed: string, total: string) => `${elapsed} of ${total}`,
    senses: (count: number, total: number) => `${count} of ${total} senses noticed`,
    boundary: "Brief self-guided regulation. Not emergency care or a substitute for professional support."
  },
  es: {
    kicker: "Mundo SootheSpot",
    ready: "Listo cuando tú lo estés",
    begin: "Empezar",
    pause: "Pausar",
    resume: "Continuar",
    reset: "Reiniciar",
    done: "Listo",
    exit: "Cerrar experiencia",
    breatheIn: "Inhala",
    hold: "Pausa suave",
    breatheOut: "Exhala",
    steady: "Deja que tu atención descanse en un punto estable.",
    complete: "Eso es suficiente por ahora.",
    completionSub: "Nota si quieres continuar, parar o volver a tu caja de herramientas.",
    noticed: "Notado",
    undo: "Deshacer",
    progress: (elapsed: string, total: string) => `${elapsed} de ${total}`,
    senses: (count: number, total: number) => `${count} de ${total} sentidos notados`,
    boundary: "Regulación breve y autoguiada. No es atención de emergencia ni sustituye el apoyo profesional."
  }
} as const;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function findBreath(world: World): BreathActivity | undefined {
  return world.activity.find((activity): activity is BreathActivity => activity.type === "breathRhythm");
}

function findGrounding(world: World): GroundingActivity | undefined {
  return world.activity.find((activity): activity is GroundingActivity => activity.type === "groundingPrompt");
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
  const totalSeconds = world.durationMinutes * 60;
  const clock = useExperienceClock(totalSeconds);
  const [noticed, setNoticed] = useState<string[]>([]);
  const breath = findBreath(world);
  const grounding = findGrounding(world);
  const phase = breath ? breathPhaseAt(clock.elapsed, breath) : null;
  const phaseLabel = phase === "inhale" ? t.breatheIn : phase === "hold" ? t.hold : phase === "exhale" ? t.breatheOut : t.ready;
  const progress = Math.min(100, (clock.elapsed / totalSeconds) * 100);
  const title = world.title[language];
  const purpose = world.purpose[language];
  const sceneClass = `world-screen world-${world.id} world-theme-${world.theme}`;
  const completed = clock.complete || (grounding ? noticed.length === grounding.senses.length : false);

  const visualState = useMemo(() => {
    if (!clock.running) return "paused";
    if (phase) return phase;
    return "running";
  }, [clock.running, phase]);

  function toggleNoticed(key: string) {
    setNoticed((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  }

  return (
    <Dialog className={sceneClass} label={title} onClose={onClose}>
      <div className="world-atmosphere" aria-hidden="true">
        <span className="world-layer world-layer-one" />
        <span className="world-layer world-layer-two" />
        <span className="world-layer world-layer-three" />
      </div>

      <div className="world-topbar">
        <div>
          <span className="world-kicker">{t.kicker}</span>
          <h2>{title}</h2>
          <p>{purpose}</p>
        </div>
        <button className="world-close" onClick={onClose} aria-label={t.exit}>×</button>
      </div>

      <section className={`world-stage is-${visualState}`} aria-live="polite">
        {world.id === "ocean-calm" && (
          <div className="ocean-scene" aria-hidden="true">
            <span className="ocean-sun" />
            <span className="ocean-horizon" />
            <span className="ocean-wave ocean-wave-one" />
            <span className="ocean-wave ocean-wave-two" />
            <span className="breath-orb">
              <span className="breath-orb-inner" />
            </span>
          </div>
        )}

        {world.id === "soft-focus" && (
          <div className="focus-scene" aria-hidden="true">
            <span className="focus-plane focus-plane-one" />
            <span className="focus-plane focus-plane-two" />
            <span className="focus-anchor" />
          </div>
        )}

        {world.id === "grounding-garden" && (
          <div className="garden-scene" aria-hidden="true">
            <span className="garden-sky-sun" />
            <span className="garden-hill garden-hill-one" />
            <span className="garden-hill garden-hill-two" />
            <span className="garden-path" />
            <span className="garden-leaf garden-leaf-one" />
            <span className="garden-leaf garden-leaf-two" />
          </div>
        )}

        <div className="world-guidance">
          <p className="world-phase">{completed ? t.complete : breath ? phaseLabel : clock.running ? t.steady : t.ready}</p>
          <p className="world-subtle">{completed ? t.completionSub : world.description[language]}</p>
        </div>

        {grounding && (
          <div className="sense-grid">
            {grounding.senses.map((item) => {
              const key = item.sense.en;
              const isNoticed = noticed.includes(key);
              return (
                <button
                  key={key}
                  className={`sense-card ${isNoticed ? "noticed" : ""}`}
                  onClick={() => toggleNoticed(key)}
                  aria-pressed={isNoticed}
                >
                  <strong>{item.sense[language]}</strong>
                  <small>{isNoticed ? `${t.noticed} · ${t.undo}` : item.prompt[language]}</small>
                </button>
              );
            })}
          </div>
        )}

        <div className="world-controls" aria-label={language === "en" ? "Experience controls" : "Controles de la experiencia"}>
          {clock.running ? (
            <button className="world-primary" onClick={clock.pause}>{t.pause}</button>
          ) : (
            <button className="world-primary" onClick={clock.start}>{clock.elapsed > 0 && !clock.complete ? t.resume : t.begin}</button>
          )}
          <button className="world-secondary" onClick={() => { clock.reset(); setNoticed([]); }}>{t.reset}</button>
          {completed && <button className="world-secondary" onClick={onClose}>{t.done}</button>}
        </div>

        <div className="world-progress" aria-label={t.progress(formatTime(clock.elapsed), formatTime(totalSeconds))}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="world-timer">
          {grounding ? t.senses(noticed.length, grounding.senses.length) + " · " : ""}
          {t.progress(formatTime(clock.elapsed), formatTime(totalSeconds))}
        </p>
      </section>

      <p className="world-boundary">{t.boundary}</p>
    </Dialog>
  );
}
