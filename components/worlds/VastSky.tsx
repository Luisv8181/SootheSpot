"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Language } from "@/domain/i18n/copy";
import {
  MAX_MESSAGE_CHARS,
  unsupportedSkyCharacters,
  normalizeSkyMessage,
} from "@/domain/worlds/vastSkyText";
import { Dialog } from "../Dialog";
import { skyArtwork } from "./skyArtwork";
import { createSkyEngine, type SkyEngine, type SkyState } from "./skyEngine";
import "./vastSky.css";
const labels = {
  en: {
    writeTitle: "write it in stars",
    placeholder: "BREATHE",
    trace: "trace it ✦",
    cancel: "Cancel",
    privacy: "Your words stay here for this visit. Nothing is saved or sent.",
    maps: "✦ star maps",
    songs: "♪ songs",
    auto: "▶ autoplay",
    stop: "■ stop",
    write: "✎ write",
    settings: "Sound & touch",
    writeAria: "write your own words",
    bandAria: "switch dial band",
    autoAria: "autoplay the current sky",
    dial: "Sky selector",
    next: "Trace next star",
    follow: "Trace the warm ring at your pace.",
    rest: "Let your hand rest, if comfortable. Stay here as long as you like.",
    complete: "Your pause is complete. Stay here as long as you like.",
    again: "Trace again",
    settingsTitle: "Sound and touch settings",
    sound: "Sky sound",
    volume: "Sky sound volume",
    haptics: "Gentle vibration",
    unsupported:
      "These characters are not supported by the star lettering yet:",
    supported:
      "English and accented Latin letters are supported. Up to 48 characters.",
    audioError: "Sound is unavailable. You can keep tracing silently.",
    fallback: "Stars unavailable. Use the next-star button to trace.",
    autoNote: "Watching one trace. Touch the sky to take over.",
    close: "Done",
  },
  es: {
    writeTitle: "escríbelo en estrellas",
    placeholder: "RESPIRA",
    trace: "trázalo ✦",
    cancel: "Cancelar",
    privacy:
      "Tus palabras quedan aquí durante esta visita. No se guardan ni se envían.",
    maps: "✦ constelaciones",
    songs: "♪ canciones",
    auto: "▶ auto",
    stop: "■ parar",
    write: "✎ escribir",
    settings: "Sonido y tacto",
    writeAria: "escribe tus propias palabras",
    bandAria: "cambiar de banda",
    autoAria: "reproducir el cielo automáticamente",
    dial: "Selector del cielo",
    next: "Trazar la siguiente estrella",
    follow: "Sigue el aro cálido a tu ritmo.",
    rest: "Deja descansar la mano, si te resulta cómodo. Puedes quedarte aquí.",
    complete: "Tu pausa ha terminado. Puedes quedarte aquí.",
    again: "Trazar de nuevo",
    settingsTitle: "Ajustes de sonido y tacto",
    sound: "Sonido del cielo",
    volume: "Volumen del cielo",
    haptics: "Vibración suave",
    unsupported: "La escritura en estrellas aún no admite estos caracteres:",
    supported: "Admite letras latinas y acentos. Hasta 48 caracteres.",
    audioError:
      "El sonido no está disponible. Puedes seguir trazando en silencio.",
    fallback:
      "El cielo no está disponible. Traza con el botón de la siguiente estrella.",
    autoNote: "Una sola pasada. Toca el cielo para tomar el control.",
    close: "Listo",
  },
};
export function VastSky({
  language,
  paused,
  complete,
  still,
  running,
  onInteract,
}: {
  language: Language;
  paused: boolean;
  complete: boolean;
  still: boolean;
  running: boolean;
  onInteract: () => void;
}) {
  const t = labels[language];
  const root = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    engine = useRef<SkyEngine | null>(null);
  const live = useRef({
    language,
    paused,
    complete,
    still,
    running,
    onInteract,
  });
  live.current = { language, paused, complete, still, running, onInteract };
  const [state, setState] = useState<SkyState | null>(null);
  const [writing, setWriting] = useState(false),
    [settings, setSettings] = useState(false),
    [draft, setDraft] = useState(t.placeholder);
  const [sound, setSound] = useState(true),
    [volume, setVolume] = useState(0.35),
    [haptics, setHaptics] = useState(true);
  const [audioError, setAudioError] = useState(false),
    [graphicsError, setGraphicsError] = useState(false),
    [photoError, setPhotoError] = useState(false),
    [fallbackTrace, setFallbackTrace] = useState(0);
  const unavailable = unsupportedSkyCharacters(draft),
    blocked = paused || complete;
  useEffect(() => {
    if (!root.current || !canvas.current) return;
    try {
      engine.current = createSkyEngine(
        canvas.current,
        root.current,
        live,
        setState,
        (enabled, error) => {
          setSound(enabled);
          if (error) setAudioError(true);
        },
      );
    } catch {
      setGraphicsError(true);
      setSound(false);
      setHaptics(false);
    }
    return () => {
      engine.current?.destroy();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    engine.current?.sync();
  }, [paused, complete, still, running]);
  function trace() {
    if (blocked) return;
    if (engine.current) engine.current.traceNext();
    else {
      onInteract();
      setFallbackTrace((n) => n + 1);
    }
  }
  function commit() {
    if (unavailable.length) return;
    engine.current?.commitMessage(draft);
    setDraft(normalizeSkyMessage(draft, t.placeholder));
    setWriting(false);
  }
  const modal = writing ? (
    <Dialog
      className="vsky-writepanel"
      label={t.writeTitle}
      onClose={() => setWriting(false)}
    >
      <div className="vsky-wpcard">
        <h3>{t.writeTitle}</h3>
        <input
          value={draft}
          maxLength={MAX_MESSAGE_CHARS}
          placeholder={t.placeholder}
          autoComplete="off"
          autoCapitalize="characters"
          aria-label={t.writeTitle}
          aria-describedby="sky-letter-note"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
        />
        <p id="sky-letter-note">{t.supported}</p>
        {unavailable.length > 0 && (
          <p role="alert">
            {t.unsupported} {unavailable.join(" ")}
          </p>
        )}
        <div className="vsky-wprow">
          <button
            disabled={unavailable.length > 0}
            className="vsky-wpgo"
            onClick={commit}
          >
            {t.trace}
          </button>
          <button className="vsky-wpcancel" onClick={() => setWriting(false)}>
            {t.cancel}
          </button>
        </div>
        <p className="vsky-wpnote">{t.privacy}</p>
      </div>
    </Dialog>
  ) : settings ? (
    <Dialog
      className="vsky-writepanel"
      label={t.settingsTitle}
      onClose={() => setSettings(false)}
    >
      <div className="vsky-wpcard vsky-settings">
        <h3>{t.settingsTitle}</h3>
        <button
          className="vsky-btn"
          disabled={blocked || graphicsError}
          aria-pressed={sound}
          onClick={() => {
            setAudioError(false);
            engine.current?.setSound(!sound);
          }}
        >
          {t.sound}
        </button>
        <label>
          {t.volume}
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            aria-label={t.volume}
            onChange={(e) => {
              const v = Number(e.target.value) / 100;
              setVolume(v);
              engine.current?.setVolume(v);
            }}
          />
        </label>
        <label className="vsky-touch">
          <input
            type="checkbox"
            checked={haptics}
            disabled={still || graphicsError}
            onChange={(e) => {
              setHaptics(e.target.checked);
              engine.current?.setHaptics(e.target.checked);
            }}
          />
          {t.haptics}
        </label>
        {audioError && <p role="status">{t.audioError}</p>}
        <button className="vsky-btn" onClick={() => setSettings(false)}>
          {t.close}
        </button>
      </div>
    </Dialog>
  ) : null;
  return (
    <>
      <div
        ref={root}
        className={`vsky-root${still ? " vsky-still" : ""}${running && !blocked ? " vsky-active" : ""}`}
        data-traced={state?.traced ?? fallbackTrace}
        data-message={state?.message ?? draft}
        data-artwork={photoError ? "fallback" : "ready"}
      >
        <img
          src={skyArtwork.sky.src}
          className="vsky-photo"
          alt=""
          aria-hidden="true"
          draggable={false}
          hidden={photoError}
          onError={() => setPhotoError(true)}
        />
        <canvas ref={canvas} className="vsky-canvas" aria-hidden="true" />
        <div className="vsky-scrim" aria-hidden="true" />
        <div className="vsky-vignette" aria-hidden="true" />
        <div className="vsky-station" aria-live="polite">
          {state?.station[language] ??
            (language === "es" ? "TUS PALABRAS" : "YOUR WORDS")}
        </div>
        <div className="vsky-guide" id="sky-trace-instructions" role="status">
          {complete
            ? t.complete
            : graphicsError
              ? t.fallback
              : state?.finished
                ? t.rest
                : state?.auto
                  ? t.autoNote
                  : t.follow}
        </div>
        <div className="vsky-dock">
          <svg
            id="vsky-dial"
            className="vsky-dial"
            viewBox="0 0 100 100"
            tabIndex={blocked || graphicsError ? -1 : 0}
            role="slider"
            aria-label={t.dial}
            aria-valuemin={0}
            aria-valuemax={(state?.count ?? 5) - 1}
            aria-valuenow={state?.index ?? 0}
            aria-valuetext={state?.station[language]}
          >
            {Array.from({ length: state?.count ?? 5 }, (_, i) => {
              const a = (i * Math.PI * 2) / (state?.count ?? 5) - Math.PI / 2;
              return (
                <circle
                  key={i}
                  cx={50 + 39 * Math.cos(a)}
                  cy={50 + 39 * Math.sin(a)}
                  r="2"
                  fill={i === state?.index ? "#ffe2b0" : "#7187a8"}
                />
              );
            })}
            <g
              style={{
                transform: `rotate(${((state?.index ?? 0) * 360) / (state?.count ?? 5)}deg)`,
                transformOrigin: "50px 50px",
              }}
            >
              <circle cx="50" cy="50" r="28" fill="#101c30" stroke="#8b9dbc" />
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="29"
                stroke="#ffe2b0"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          </svg>
          <div className="vsky-buttons">
            <button
              className="vsky-btn"
              aria-label={t.bandAria}
              disabled={blocked || graphicsError}
              onClick={() => engine.current?.switchBand()}
            >
              {state?.band === "stars" ? t.songs : t.maps}
            </button>
            <button
              className="vsky-btn"
              aria-label={t.writeAria}
              disabled={blocked || graphicsError}
              onClick={() => {
                setDraft(state?.message ?? t.placeholder);
                setWriting(true);
              }}
            >
              {t.write}
            </button>
            {state?.finished ? (
              <button
                className="vsky-btn"
                disabled={blocked}
                onClick={() => engine.current?.restart()}
              >
                {t.again}
              </button>
            ) : (
              <button
                className="vsky-btn"
                aria-label={t.autoAria}
                aria-pressed={state?.auto ?? false}
                disabled={blocked || still || graphicsError}
                onClick={() => engine.current?.toggleAuto()}
              >
                {state?.auto ? t.stop : t.auto}
              </button>
            )}
            <button className="vsky-btn" onClick={() => setSettings(true)}>
              {t.settings}
            </button>
          </div>
        </div>
        {(state?.next || graphicsError) && (
          <button
            type="button"
            className={`vsky-next${graphicsError ? " vsky-next-fallback" : ""}`}
            aria-label={t.next}
            aria-describedby="sky-trace-instructions"
            disabled={blocked}
            style={
              state?.next
                ? { left: state.next.x, top: state.next.y }
                : undefined
            }
            onClick={(e) => {
              if (e.detail === 0 || graphicsError) trace();
            }}
            onPointerDown={(e) => {
              if (graphicsError) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              engine.current?.pointer("start", e.clientX, e.clientY);
            }}
            onPointerMove={(e) =>
              engine.current?.pointer("move", e.clientX, e.clientY)
            }
            onPointerUp={() => engine.current?.pointer("end", 0, 0)}
            onPointerCancel={() => engine.current?.pointer("end", 0, 0)}
          >
            {graphicsError ? t.next : <span aria-hidden="true">✦</span>}
          </button>
        )}
      </div>
      {modal && createPortal(modal, document.body)}
    </>
  );
}
