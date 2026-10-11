/**
 * Pure helpers for the Vast Sky world: the single-stroke star font, message
 * word-wrap, message-derived melody, and star layout math.
 *
 * No DOM, no audio, no network — fully unit-testable. The canvas scene in
 * components/worlds/VastSky.tsx consumes these.
 *
 * Letterforms are single-stroke paths on a 2-wide by 4-tall grid, traced
 * star to star. Every letter of the alphabet is covered so users can write
 * their own words in stars.
 */

export type Stroke = Array<[number, number]>;

export const STAR_FONT: Record<string, Stroke[]> = {
  A: [
    [
      [0, 4],
      [1, 0],
      [2, 4],
    ],
    [
      [0.45, 2.7],
      [1.55, 2.7],
    ],
  ],
  B: [
    [
      [0, 0],
      [0, 4],
    ],
    [
      [0, 0],
      [1.7, 0],
      [1.7, 2],
      [0, 2],
    ],
    [
      [0, 2],
      [1.7, 2],
      [1.7, 4],
      [0, 4],
    ],
  ],
  C: [
    [
      [1.8, 0.7],
      [1, 0],
      [0, 1],
      [0, 3],
      [1, 4],
      [1.8, 3.3],
    ],
  ],
  D: [
    [
      [0, 0],
      [0, 4],
    ],
    [
      [0, 0],
      [1.6, 0.6],
      [2, 2],
      [1.6, 3.4],
      [0, 4],
    ],
  ],
  E: [
    [
      [2, 0],
      [0, 0],
      [0, 4],
      [2, 4],
    ],
    [
      [0, 2],
      [1.4, 2],
    ],
  ],
  F: [
    [
      [2, 0],
      [0, 0],
      [0, 4],
    ],
    [
      [0, 2],
      [1.4, 2],
    ],
  ],
  G: [
    [
      [1.8, 0.7],
      [1, 0],
      [0, 1],
      [0, 3],
      [1, 4],
      [1.8, 3.3],
      [1.8, 2.4],
      [1, 2.4],
    ],
  ],
  H: [
    [
      [0, 0],
      [0, 4],
    ],
    [
      [2, 0],
      [2, 4],
    ],
    [
      [0, 2],
      [2, 2],
    ],
  ],
  I: [
    [
      [0.3, 0],
      [1.7, 0],
    ],
    [
      [1, 0],
      [1, 4],
    ],
    [
      [0.3, 4],
      [1.7, 4],
    ],
  ],
  J: [
    [
      [1.8, 0],
      [1.8, 3],
      [1.2, 4],
      [0.4, 3.6],
    ],
  ],
  K: [
    [
      [0, 0],
      [0, 4],
    ],
    [
      [1.9, 0],
      [0, 2.1],
      [1.9, 4],
    ],
  ],
  L: [
    [
      [0, 0],
      [0, 4],
      [2, 4],
    ],
  ],
  M: [
    [
      [0, 4],
      [0, 0],
      [1, 2.2],
      [2, 0],
      [2, 4],
    ],
  ],
  N: [
    [
      [0, 4],
      [0, 0],
      [2, 4],
      [2, 0],
    ],
  ],
  O: [
    [
      [0, 0],
      [2, 0],
      [2, 4],
      [0, 4],
      [0, 0],
    ],
  ],
  P: [
    [
      [0, 0],
      [0, 4],
    ],
    [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ],
  ],
  Q: [
    [
      [0, 0],
      [2, 0],
      [2, 4],
      [0, 4],
      [0, 0],
    ],
    [
      [1.2, 2.8],
      [2.3, 4.3],
    ],
  ],
  R: [
    [
      [0, 4],
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ],
    [
      [0.9, 2],
      [2, 4],
    ],
  ],
  S: [
    [
      [1.8, 0.6],
      [1.1, 0],
      [0.2, 0.4],
      [0.1, 1.2],
      [0.6, 1.9],
      [1.5, 2.2],
      [1.9, 2.9],
      [1.2, 4],
      [0.2, 3.5],
    ],
  ],
  T: [
    [
      [0, 0],
      [2, 0],
    ],
    [
      [1, 0],
      [1, 4],
    ],
  ],
  U: [
    [
      [0, 0],
      [0, 3],
      [0.7, 4],
      [1.3, 4],
      [2, 3],
      [2, 0],
    ],
  ],
  V: [
    [
      [0, 0],
      [1, 4],
      [2, 0],
    ],
  ],
  W: [
    [
      [0, 0],
      [0.5, 4],
      [1, 2],
      [1.5, 4],
      [2, 0],
    ],
  ],
  X: [
    [
      [0, 0],
      [2, 4],
    ],
    [
      [2, 0],
      [0, 4],
    ],
  ],
  Y: [
    [
      [0, 0],
      [1, 2],
      [2, 0],
    ],
    [
      [1, 2],
      [1, 4],
    ],
  ],
  Z: [
    [
      [0, 0],
      [2, 0],
      [0, 4],
      [2, 4],
    ],
  ],
};

// Accent marks are drawn as additional strokes so each supported character
// remains a distinct, drawable glyph in the sky.
const acute: Stroke = [
  [0.65, 0.45],
  [1.35, 0],
];
const grave: Stroke = [
  [1.35, 0.45],
  [0.65, 0],
];
const diaeresis: Stroke[] = [
  [
    [0.55, 0.15],
    [0.55, 0.15],
  ],
  [
    [1.45, 0.15],
    [1.45, 0.15],
  ],
];
const tilde: Stroke = [
  [0.25, 0.2],
  [0.9, 0],
  [1.5, 0.2],
  [1.9, 0.05],
];
const cedilla: Stroke = [
  [1.2, 3.4],
  [1.35, 4],
  [1, 4.35],
];
for (const [glyph, base, mark] of [
  ["Á", "A", acute],
  ["É", "E", acute],
  ["Í", "I", acute],
  ["Ó", "O", acute],
  ["Ú", "U", acute],
  ["À", "A", grave],
  ["È", "E", grave],
  ["Ì", "I", grave],
  ["Ò", "O", grave],
  ["Ù", "U", grave],
  ["Ä", "A", diaeresis],
  ["Ë", "E", diaeresis],
  ["Ï", "I", diaeresis],
  ["Ö", "O", diaeresis],
  ["Ü", "U", diaeresis],
  ["Ñ", "N", tilde],
  ["Ç", "C", cedilla],
] as Array<[string, string, Stroke | Stroke[]]>) {
  STAR_FONT[glyph] = [
    ...STAR_FONT[base],
    ...(Array.isArray(mark[0]) && typeof mark[0][0] === "number"
      ? [mark as Stroke]
      : (mark as Stroke[])),
  ];
}

/** Warm pentatonic ladder (semitones) each letter maps onto. */
export const PENTA = [0, 2, 4, 7, 9];

/** Base pitch for message-derived melodies (D4). */
export const MESSAGE_BASE_FREQ = 293.66;

export const MAX_MESSAGE_CHARS = 48;
const MAX_LINE_CHARS = 12;
const MAX_LINES = 4;
const LETTER_ADV = 4.2;
const SPACE_ADV = 2.4;
const LINE_DY = 8.2;
const SUPPORTED = new Set(Object.keys(STAR_FONT));

/** Return unsupported letters and symbols once each, in first-seen order. */
export function unsupportedSkyCharacters(input: string): string[] {
  const found = new Set<string>();
  for (const ch of input.normalize("NFC")) {
    if (/\s/u.test(ch) || /\p{P}/u.test(ch) || SUPPORTED.has(ch.toUpperCase()))
      continue;
    found.add(ch);
  }
  return [...found];
}

/** Uppercase and bound text to glyphs supported by the star renderer. */
export function normalizeSkyMessage(
  input: string,
  fallback = "BREATHE",
): string {
  const clean = (value: string) =>
    value
      .normalize("NFC")
      .toUpperCase()
      .replace(/[^\p{L}\p{M}\s]/gu, " ")
      .replace(/[\p{L}\p{M}]+/gu, (word) =>
        [...word].every((ch) => SUPPORTED.has(ch)) ? word : " ",
      )
      .replace(/\s+/gu, " ")
      .trim()
      .slice(0, MAX_MESSAGE_CHARS)
      .trim();
  return clean(input) || clean(fallback) || "BREATHE";
}

/**
 * Normalize free text into up-to-four short uppercase lines for star layout.
 * Non A-Z characters become spaces; overlong input is trimmed. Never empty.
 */
export function wrapMessage(text: string): string[] {
  const normalized = normalizeSkyMessage(text);
  const words = normalized.split(" ").flatMap((word) => {
    const chunks: string[] = [];
    for (let i = 0; i < word.length; i += MAX_LINE_CHARS)
      chunks.push(word.slice(i, i + MAX_LINE_CHARS));
    return chunks;
  });
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (t.length <= MAX_LINE_CHARS) cur = t;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length <= MAX_LINES) return lines.length ? lines : ["BREATHE"];
  const hardLines: string[] = [];
  for (let i = 0; i < normalized.length; i += MAX_LINE_CHARS) {
    hardLines.push(normalized.slice(i, i + MAX_LINE_CHARS).trim());
  }
  return hardLines.filter(Boolean).slice(0, MAX_LINES);
}

function boundedTextLines(input: string[]): string[] {
  const cleaned = input
    .filter(Boolean)
    .map((line) => normalizeSkyMessage(line));
  if (
    cleaned.length <= MAX_LINES &&
    cleaned.every((line) => line.length <= MAX_LINE_CHARS) &&
    cleaned.join("").length <= MAX_MESSAGE_CHARS
  ) {
    return cleaned;
  }
  return wrapMessage(cleaned.join(" "));
}

/**
 * Derive a gentle melody from a message: each letter becomes a note on the
 * warm pentatonic ladder, so every message plays its own tune. Spaces are
 * rests (0). Returns frequencies in Hz.
 */
export function messageMelody(text: string): number[] {
  const out: number[] = [];
  for (const ch of normalizeSkyMessage(text)) {
    if (ch === " ") {
      out.push(0);
      continue;
    }
    if (SUPPORTED.has(ch) && ch !== " ") {
      const base =
        (
          {
            Á: "A",
            À: "A",
            Ä: "A",
            É: "E",
            È: "E",
            Ë: "E",
            Í: "I",
            Ì: "I",
            Ï: "I",
            Ñ: "N",
            Ó: "O",
            Ò: "O",
            Ö: "O",
            Ú: "U",
            Ù: "U",
            Ü: "U",
            Ç: "C",
          } as Record<string, string>
        )[ch] ?? ch;
      const semis = PENTA[(base.charCodeAt(0) - 65) % PENTA.length];
      out.push(+(MESSAGE_BASE_FREQ * Math.pow(2, semis / 12)).toFixed(2));
    }
  }
  return out;
}

/** Count the stars a set of lines will produce (one per stroke point). */
export function countStars(lines: string[]): number {
  let n = 0;
  for (const line of boundedTextLines(lines)) {
    for (const ch of line) {
      if (ch === " ") continue;
      for (const stroke of STAR_FONT[ch] ?? []) n += stroke.length;
    }
  }
  return n;
}

export type TextLayout = {
  stars: Array<{ x: number; y: number }>;
  ghosts: Array<[number, number, number, number]>;
  unit: number;
};

/**
 * Lay out message lines as star positions in a width×height box. Lines are
 * centered horizontally, stacked from 14% of height, and scaled to fit.
 */
export function layoutTextLines(
  lines: string[],
  width: number,
  height: number,
  bounds?: { top: number; bottom: number },
): TextLayout {
  lines = boundedTextLines(lines);
  const units = (line: string) => {
    let u = 0;
    for (const ch of line) u += ch === " " ? SPACE_ADV : LETTER_ADV;
    return u - (LETTER_ADV - 3);
  };
  const widest = Math.max(...lines.map(units));
  const vBudget = (lines.length - 1) * LINE_DY + 5;
  const regionH = bounds ? bounds.bottom - bounds.top : height * 0.36;
  const regionTop = bounds ? bounds.top : height * 0.14;
  const u = Math.min((width * 0.96) / widest, 13, regionH / vBudget);
  const stars: Array<{ x: number; y: number }> = [];
  const ghosts: Array<[number, number, number, number]> = [];
  lines.forEach((lineText, li) => {
    let cx = (width - units(lineText) * u) / 2;
    const top = regionTop + li * LINE_DY * u;
    for (const ch of lineText) {
      if (ch === " ") {
        cx += SPACE_ADV * u;
        continue;
      }
      for (const stroke of STAR_FONT[ch] ?? []) {
        let prev: [number, number] | null = null;
        for (const [gx, gy] of stroke) {
          const px = cx + gx * u;
          const py = top + gy * u;
          stars.push({ x: px, y: py });
          if (prev) ghosts.push([prev[0], prev[1], px, py]);
          prev = [px, py];
        }
      }
      cx += LETTER_ADV * u;
    }
  });
  return { stars, ghosts, unit: u };
}
