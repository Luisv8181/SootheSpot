import type { StaticImageData } from "next/image";
import type { WorldId } from "@/domain/worlds/types";
import { waterArtwork } from "./waterArtwork";
import { atmosphereArtwork } from "./atmosphereArtwork";
import { skyArtwork } from "./skyArtwork";

const artwork: Record<WorldId, StaticImageData> = {
  "ocean-calm": waterArtwork.ocean,
  "ripple-field": waterArtwork.pool,
  "soft-focus": atmosphereArtwork.focus,
  "grounding-garden": atmosphereArtwork.garden,
  "vast-sky": skyArtwork.sky
};

export function WorldScene({ id }: { id: WorldId }) {
  const art = artwork[id];
  return <div className={`world-illustration world-preview-${id}`} aria-hidden="true">
    <img className="world-artwork" src={art.src} width={art.width} height={art.height} alt="" loading="lazy" decoding="async" />
    {id === "soft-focus" && <span className="focus-preview-light" />}
  </div>;
}
