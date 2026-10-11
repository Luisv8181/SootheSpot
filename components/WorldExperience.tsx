"use client";

import { useEffect, useRef, useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import type { World } from "@/domain/worlds/types";
import { breathPhaseAt } from "@/domain/worlds/spec";
import { Dialog } from "./Dialog";
import { useExperienceClock } from "./worlds/useExperienceClock";
import { AtmosphereScene } from "./worlds/AtmosphereScene";
import { RippleField } from "./worlds/RippleField";
import { WaterCanvas } from "./worlds/WaterCanvas";
import { OceanSound } from "./worlds/OceanSound";
import { VastSky } from "./worlds/VastSky";
import "./worlds/worlds.css";

const labels = {
  en: {
    kicker: "SootheSpot World", ready: "Ready when you are", begin: "Start", pause: "Pause", resume: "Resume", reset: "Reset", done: "Return to Worlds", exit: "Close experience",
    inhale: "Breathe in", hold: "Pause softly", exhale: "Breathe out", steady: "Let your attention rest here.", complete: "That is enough for this round.",
    completionSub: "Take a moment. You can stay, start again, or leave.", still: "Still visuals", fixed: "Steady light", drift: "Slow drift", notice: "I noticed something", skip: "Skip this sense", back: "Back", experimental: "Experimental",
    breathNote: "No need to hold your breath. Follow only if comfortable.", rippleNote: "Tap or slowly trace the water. Use arrow keys to move, then Enter or Space to place a ripple. Nothing is saved.",
    senseNote: "Use your surroundings. Skip any sense that does not fit.",
    boundary: "Self-guided wellbeing experience · not emergency care.",
    senses: (n: number) => `${n} ${n === 1 ? "sense" : "senses"} noticed`, step: (n: number) => `Sense ${n} of 5`, progress: (a: string, b: string) => `${a} of ${b}`
  },
  es: {
    kicker: "Mundo SootheSpot", ready: "Listo cuando tú lo estés", begin: "Empezar", pause: "Pausar", resume: "Continuar", reset: "Reiniciar", done: "Volver a Mundos", exit: "Cerrar experiencia",
    inhale: "Inhala", hold: "Pausa suave", exhale: "Exhala", steady: "Deja que tu atención descanse aquí.", complete: "Eso es suficiente por ahora.",
    completionSub: "Tómate un momento. Puedes quedarte, empezar de nuevo o salir.", still: "Imágenes quietas", fixed: "Luz estable", drift: "Movimiento lento", notice: "Noté algo", skip: "Omitir este sentido", back: "Atrás", experimental: "Experimental",
    breathNote: "No hace falta contener la respiración. Sigue el ritmo solo si te resulta cómodo.", rippleNote: "Toca el agua o desliza el dedo lentamente. Usa las flechas para moverte e Intro o Espacio para crear una onda. No se guarda nada.",
    senseNote: "Observa tu entorno. Puedes omitir cualquier sentido.", boundary: "Experiencia de bienestar autoguiada · no es atención de emergencia.",
    senses: (n: number) => `${n} ${n === 1 ? "sentido notado" : "sentidos notados"}`, step: (n: number) => `Sentido ${n} de 5`, progress: (a: string, b: string) => `${a} de ${b}`
  }
};

function time(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function WorldExperience({ world, onClose, language }: { world: World; onClose: () => void; language: Language }) {
  const t = labels[language];
  const clock = useExperienceClock(world.durationMinutes * 60);
  const [systemStill, setSystemStill] = useState(false);
  const [requestedStill, setRequestedStill] = useState(false);
  const [drift, setDrift] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const completionButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function update() { setSystemStill(media.matches); }
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const still = systemStill || requestedStill;
  const breath = world.activity.find((activity) => activity.type === "breathRhythm");
  const grounding = world.activity.find((activity) => activity.type === "groundingPrompt");
  const isRipple = world.id === "ripple-field";
  const isVastSky = world.id === "vast-sky";
  const waterWorld = isRipple || world.id === "ocean-calm";
  const complete = clock.complete || !!(grounding && step >= grounding.senses.length);
  useEffect(() => {
    if (complete) completionButton.current?.focus();
  }, [complete]);
  const phase = breath ? breathPhaseAt(clock.elapsed, breath) : null;
  const phaseText = phase === "inhale" ? t.inhale : phase === "exhale" ? t.exhale : t.hold;
  const noticed = answers.filter(Boolean).length;
  const prompt = grounding?.senses[step];
  function start() { setSessionStarted(true); clock.start(); }
  function reset() { clock.reset(); setSessionStarted(false); setDrift(false); setStep(0); setAnswers([]); setResetKey((current) => current + 1); }
  function advance(noticedSense: boolean) {
    setAnswers((current) => [...current.slice(0, step), noticedSense]);
    setStep((current) => current + 1);
    if (grounding && step + 1 >= grounding.senses.length) clock.pause();
    else clock.start();
  }

  return <Dialog className={`world-screen immersive-world authored-world world-theme-${world.theme}${still ? " visuals-still" : ""}${clock.running && !complete ? " scene-running" : " scene-paused"}`} label={world.title[language]} onClose={onClose}>
    <header className="world-topbar">
      <div><span className="world-kicker">{isRipple ? t.experimental : t.kicker}</span><h2>{world.title[language]}</h2><p>{world.purpose[language]}</p></div>
      <button className="world-close" onClick={onClose} aria-label={t.exit}>×</button>
    </header>
    <div className="world-environment">
      {isVastSky ? <VastSky key={resetKey} language={language} paused={!clock.running && sessionStarted} complete={complete} still={still} running={clock.running && !complete} onInteract={start} /> : waterWorld ? isRipple ? <RippleField key={resetKey} language={language} paused={!clock.running && sessionStarted} complete={complete} running={clock.running && !complete} still={still} sampleTime={clock.sampleTime} onInteract={start} /> : <WaterCanvas kind="ocean" running={clock.running && !complete} still={still} sampleTime={clock.sampleTime} rhythm={breath} /> : <AtmosphereScene key={resetKey} kind={world.id === "soft-focus" ? "focus" : "garden"} drift={drift} running={clock.running && !complete} still={still} />}
    </div>
    {isVastSky && <div className="sky-room" aria-hidden="true" />}
    <section className="world-stage">
      {grounding && <div className="garden-trail" aria-hidden="true">{grounding.senses.map((_, index) => <span key={index} className={index === step ? "current" : index < step ? "visited" : ""} />)}</div>}
      <div className="world-guidance" hidden={isVastSky && !complete} aria-live="polite" aria-atomic="true">
        {prompt && !complete ? <><p className="world-step">{t.step(step + 1)}</p><h3 className="world-phase">{prompt.sense[language]}</h3><p className="world-subtle">{prompt.prompt[language]}</p></> : <><p className="world-phase">{complete ? t.complete : breath ? clock.running ? phaseText : t.ready : clock.running ? isRipple ? world.description[language] : t.steady : t.ready}</p><p id={isRipple ? "ripple-instructions" : undefined} className="world-subtle">{complete ? t.completionSub : breath ? t.breathNote : isRipple ? t.rippleNote : world.description[language]}</p></>}
      </div>
      {grounding && !complete && <><div className="world-controls"><button className="world-primary" onClick={() => advance(true)}>{t.notice}</button><button className="world-secondary" onClick={() => advance(false)}>{t.skip}</button></div><p className="world-hint">{t.senseNote}</p></>}
      {world.id === "soft-focus" && !complete && <div className="world-mode" aria-label={language === "en" ? "Light movement" : "Movimiento de luz"}><button aria-pressed={!drift || still} onClick={() => setDrift(false)}>{t.fixed}</button><button disabled={still} aria-pressed={drift && !still} onClick={() => setDrift(true)}>{t.drift}</button></div>}
      <div className="world-controls session-controls">
        {!grounding && !complete && <button className="world-primary" onClick={clock.running ? clock.pause : start}>{clock.running ? t.pause : sessionStarted ? t.resume : t.begin}</button>}
        {grounding && !complete && step > 0 && <button className="world-secondary" onClick={() => { setStep((current) => current - 1); setAnswers((current) => current.slice(0, step - 1)); }}>{t.back}</button>}
        <button className="world-secondary" onClick={reset}>{t.reset}</button>
        {complete && <button ref={completionButton} className="world-primary" onClick={onClose}>{t.done}</button>}
      </div>
      <div className="world-progress" role="progressbar" aria-label={language === "en" ? "Session progress" : "Progreso de la sesión"} aria-valuemin={0} aria-valuemax={world.durationMinutes * 60} aria-valuenow={clock.elapsed}><span style={{ width: `${clock.elapsed / (world.durationMinutes * 60) * 100}%` }} /></div>
      <p className="world-timer">{t.progress(time(clock.elapsed), time(world.durationMinutes * 60))}</p>
      {grounding && <p className="world-count">{t.senses(noticed)}</p>}
      <label className="world-motion"><input type="checkbox" checked={still} disabled={systemStill} onChange={(event) => setRequestedStill(event.target.checked)} />{t.still}</label>
      {world.id === "ocean-calm" && <OceanSound key={resetKey} running={clock.running} complete={complete} language={language} onStart={start} />}
    </section>
    <p className="world-boundary">{t.boundary}</p>
  </Dialog>;
}
