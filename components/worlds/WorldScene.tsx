"use client";

import { useId } from "react";
import type { WorldId } from "@/domain/worlds/types";

export function WorldScene({ id, breath = 0, drift = false, step = 0 }: { id: WorldId; breath?: number; drift?: boolean; step?: number }) {
  const uid = useId().replace(/:/g, "");
  const sky = `${uid}-sky`;
  const glow = `${uid}-glow`;
  const water = `${uid}-water`;
  return (
    <svg className={`world-illustration scene-${id}${drift ? " light-drifts" : ""}`} viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={sky} x2="0" y2="1">
          <stop stopColor={id === "grounding-garden" ? "#dae5c8" : id === "soft-focus" ? "#24283f" : "#12344d"} />
          <stop offset="1" stopColor={id === "grounding-garden" ? "#91b49c" : id === "soft-focus" ? "#776779" : "#7cbbbd"} />
        </linearGradient>
        <radialGradient id={glow}>
          <stop stopColor="#fff2ca" stopOpacity=".9" />
          <stop offset=".3" stopColor="#f0d5a8" stopOpacity=".3" />
          <stop offset="1" stopColor="#f0d5a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={water} x2="0" y2="1">
          <stop stopColor="#487f91" />
          <stop offset="1" stopColor="#092e47" />
        </linearGradient>
      </defs>
      <rect width="1000" height="650" fill={`url(#${sky})`} />
      {id === "ocean-calm" && <>
        <circle cx="665" cy="180" r="180" fill={`url(#${glow})`} />
        <circle cx="665" cy="180" r="28" fill="#f8e7c2" />
        <path d="M0 306 Q250 299 500 306 T1000 306 V650 H0Z" fill={`url(#${water})`} />
        <path d="M620 313 L710 313 L795 610 L510 610Z" fill="#e8dcc0" opacity=".08" />
        {[0, 1, 2, 3, 4, 5].map((n) => <path key={n} className="sea-line" d={`M-80 ${335 + n * 45} Q160 ${315 + n * 45} 420 ${335 + n * 45} T1080 ${335 + n * 45}`} fill="none" stroke="#bcdfdd" strokeWidth={1 + n * .5} opacity={.15 + n * .015} style={{ transform: `translateY(${breath * (4 + n * 3)}px)` }} />)}
        <path d="M0 610 Q260 550 490 613 T1000 595 V650 H0Z" fill="#102c37" />
        <path d="M0 594 Q260 534 490 597 T1000 579" fill="none" stroke="#9ac6bc" strokeWidth="3" opacity=".5" style={{ transform: `translateY(${breath * 16}px)` }} />
        <g className="breath-halo" style={{ transform: `translate(420px, 280px) scale(${.75 + breath * .3})` }}>
          <circle r="90" fill="none" stroke="#dcf6ed" strokeWidth="1" opacity=".65" />
          <circle r="72" fill="#d8f5e7" opacity=".06" />
          <circle r="51" fill="none" stroke="#dcf6ed" opacity=".25" />
        </g>
      </>}
      {id === "soft-focus" && <>
        {[0, 1, 2, 3, 4, 5, 6].map((n) => <circle key={n} cx={105 + n * 133} cy={65 + (n % 3) * 47} r="1.5" fill="#f5e1c7" opacity=".6" />)}
        <path d="M0 436 Q210 365 420 421 T1000 384 V650 H0Z" fill="#383b51" />
        <path d="M0 505 Q290 427 550 495 T1000 463 V650 H0Z" fill="#292f44" />
        <path d="M0 585 Q320 501 650 574 T1000 544 V650 H0Z" fill="#1a2437" />
        <g className="focus-lantern">
          <circle cx="500" cy="270" r="170" fill={`url(#${glow})`} />
          <circle cx="500" cy="270" r="13" fill="#fff2ce" />
          <circle cx="500" cy="270" r="24" fill="none" stroke="#f5d69c" opacity=".2" />
        </g>
        <ellipse cx="500" cy="550" rx="65" ry="10" fill="#dfc6a9" opacity=".08" />
      </>}
      {id === "grounding-garden" && <>
        <circle cx="740" cy="135" r="190" fill={`url(#${glow})`} />
        <circle cx="740" cy="135" r="36" fill="#f2e6ad" />
        <path d="M0 310 Q210 230 410 300 T1000 280 V650 H0Z" fill="#6f9b86" />
        <path d="M0 405 Q300 270 570 387 T1000 351 V650 H0Z" fill="#477b6c" />
        <path d="M440 650 Q660 500 580 388 Q560 365 595 345 Q690 412 670 478 Q645 555 720 650Z" fill="#aec5a0" opacity=".7" />
        <path d="M0 530 Q220 466 410 529 T1000 498 V650 H0Z" fill="#254f49" />
        {[0, 1, 2, 3, 4].map((n) => <g key={n} className={`garden-sprig${n <= step ? " sprig-awake" : ""}`} transform={`translate(${85 + n * 192} ${615 - (n % 2) * 50}) rotate(${(n - 2) * 8})`}>
          <path d="M0 0 Q-10 -85 7 -175" fill="none" stroke="#abc4a0" strokeWidth="3" />
          <path d="M0 -45 Q-70 -58 -55 -111 Q-7 -109 0 -45 M0 -84 Q60 -93 57 -138 Q6 -133 0 -84 M3 -137 Q-41 -151 -29 -181 Q1 -181 3 -137" fill={n <= step ? "#a2bd91" : "#608c75"} />
          <circle cx="7" cy="-180" r="8" fill="#e8d9a6" opacity={n <= step ? 1 : .3} />
        </g>)}
        <ellipse cx="735" cy="592" rx="38" ry="13" fill="#66897a" />
        <ellipse cx="775" cy="610" rx="23" ry="9" fill="#7b9985" />
      </>}
      {id === "ripple-field" && <>
        <rect width="1000" height="650" fill="#132c3d" />
        <ellipse cx="500" cy="340" rx="400" ry="270" fill={`url(#${glow})`} opacity=".23" />
        {[0, 1, 2, 3, 4, 5, 6].map((n) => <ellipse key={n} cx="500" cy="340" rx={60 + n * 65} ry={35 + n * 38} fill="none" stroke="#8dc2bb" opacity={.22 - n * .025} />)}
        <circle cx="500" cy="340" r="4" fill="#d2e5cf" />
      </>}
    </svg>
  );
}
