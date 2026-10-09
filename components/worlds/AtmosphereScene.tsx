"use client";

import { useState } from "react";
import { atmosphereArtwork } from "./atmosphereArtwork";

export function AtmosphereScene({ kind, drift, running, still }: { kind: "focus" | "garden"; drift: boolean; running: boolean; still: boolean }) {
  const [artwork, setArtwork] = useState("loading");
  const art = atmosphereArtwork[kind];
  const motion = still ? "still" : kind === "focus" && drift ? running ? "drift" : "paused" : "steady";
  return <div className={`atmosphere-scene atmosphere-${kind}`} data-motion={motion} data-artwork={artwork} aria-hidden="true">
    <img className="atmosphere-artwork" src={art.src} alt="" draggable={false} decoding="async" hidden={artwork === "fallback"} onLoad={() => setArtwork("ready")} onError={() => setArtwork("fallback")} />
    {kind === "focus" && <div className="focus-anchor-position"><span className={`focus-anchor${drift && !still ? " light-drifts" : ""}`} /></div>}
  </div>;
}
