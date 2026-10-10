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
  A: [[[0, 4], [1, 0], [2, 4]], [[0.45, 2.7], [1.55, 2.7]]],
  B: [[[0, 0], [0, 4]], [[0, 0], [1.7, 0], [1.7, 2], [0, 2]], [[0, 2], [1.7, 2], [1.7, 4], [0, 4]]],
  C: [[[1.8, 0.7], [1, 0], [0, 1], [0, 3], [1, 4], [1.8, 3.3]]],
  D: [[[0, 0], [0, 4]], [[0, 0], [1.6, 0.6], [2, 2], [1.6, 3.4], [0, 4]]],
  E: [[[2, 0], [0, 0], [0, 4], [2, 4]], [[0, 2], [1.4, 2]]],
  F: [[[2, 0], [0, 0], [0, 4]], [[0, 2], [1.4, 2]]],
  G: [[[1.8, 0.7], [1, 0], [0, 1], [0, 3], [1, 4], [1.8, 3.3], [1.8, 2.4], [1, 2.4]]],
  H: [[[0, 0], [0, 4]], [[2, 0], [2, 4]], [[0, 2], [2, 2]]],
  I: [[[0.3, 0], [1.7, 0]], [[1, 0], [1, 4]], [[0.3, 4], [1.7, 4]]],
  J: [[[1.8, 0], [1.8, 3], [1.2, 4], [0.4, 3.6]]],
  K: [[[0, 0], [0, 4]], [[1.9, 0], [0, 2.1], [1.9, 4]]],
  L: [[[0, 0], [0, 4], [2, 4]]],
  M: [[[0, 4], [0, 0], [1, 2.2], [2, 0], [2, 4]]],
  N: [[[0, 4], [0, 0], [2, 4], [2, 0]]],
  O: [[[0, 0], [2, 0], [2, 4], [0, 4], [0, 0]]],
  P: [[[0, 0], [0, 4]], [[0, 0], [2, 0], [2, 2], [0, 2]]],
  Q: [[[0, 0], [2, 0], [2, 4], [0, 4], [0, 0]], [[1.2, 2.8], [2.3, 4.3]]],
  R: [[[0, 4], [0, 0], [2, 0], [2, 2], [0, 2]], [[0.9, 2], [2, 4]]],
  S: [[[1.8, 0.6], [1.1, 0], [0.2, 0.4], [0.1, 1.2], [0.6, 1.9], [1.5, 2.2], [1.9, 2.9], [1.2, 4], [0.2, 3.5]]],
  T: [[[0, 0], [2, 0]], [[1, 0], [1, 4]]],
  U: [[[0, 0], [0, 3], [0.7, 4], [1.3, 4], [2, 3], [2, 0]]],
  V: [[[0, 0], [1, 4], [2, 0]]],
  W: [[[0, 0], [0.5, 4], [1, 2], [1.5, 4], [2, 0]]],
  X: [[[0, 0], [2, 4]], [[2, 0], [0, 4]]],
  Y: [[[0, 0], [1, 2], [2, 0]], [[1, 2], [1, 4]]],
  Z: [[[0, 0], [2, 0], [0, 4], [2, 4]]]
};

/** Warm pentatonic ladder (semitones) each letter maps onto. */
export const PENTA = [0, 2, 4, 7, 9];

/** Base pitch for message-derived melodies (D4). */
export const MESSAGE_BASE_FREQ = 293.66;

export const MAX_MESSAGE_CHARS = 48;
const MAX_LINE_CHARS = 10;
const MAX_LINES = 4;
const LETTER_ADV = 4.2;
const SPACE_ADV = 2.4;
const LINE_DY = 8.2;

/**
 * Normalize free text into up-to-four short uppercase lines for star layout.
 * Non A-Z characters become spaces; overlong input is trimmed. Never empty.
 */
export function wrapMessage(text: string): string[] {
  const words = text
    .toUpperCase()
    .replace(/[^A-Z ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 14);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (t.length <= MAX_LINE_CHARS || !cur) cur = t;
    else {
      lines.push(cur);
      cur = w;
    }
    if (lines.length === MAX_LINES) break;
  }
  if (cur && lines.length < MAX_LINES) lines.push(cur);
  return lines.length ? lines : ["BREATHE"];
}

/**
 * Derive a gentle melody from a message: each letter becomes a note on the
 * warm pentatonic ladder, so every message plays its own tune. Spaces are
 * rests (0). Returns frequencies in Hz.
 */
export function messageMelody(text: string): number[] {
  const out: number[] = [];
  for (const ch of text.toUpperCase()) {
    if (ch === " ") {
      out.push(0);
      continue;
    }
    if (ch >= "A" && ch <= "Z") {
      const semis = PENTA[(ch.charCodeAt(0) - 65) % PENTA.length];
      out.push(+(MESSAGE_BASE_FREQ * Math.pow(2, semis / 12)).toFixed(2));
    }
  }
  return out;
}

/** Count the stars a set of lines will produce (one per stroke point). */
export function countStars(lines: string[]): number {
  let n = 0;
  for (const line of lines) {
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
  const units = (line: string) => {
    let u = 0;
    for (const ch of line) u += ch === " " ? SPACE_ADV : LETTER_ADV;
    return u - (LETTER_ADV - 3);
  };
  const widest = Math.max(...lines.map(units));
  const vBudget = (lines.length - 1) * LINE_DY + 5;
  // Without bounds the layout keeps its historical geometry exactly
  // (existing tests pin this); with bounds the text fits the given band.
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
