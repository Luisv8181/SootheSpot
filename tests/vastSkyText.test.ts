import { describe, expect, it } from "vitest";
import {
  STAR_FONT,
  PENTA,
  MESSAGE_BASE_FREQ,
  wrapMessage,
  messageMelody,
  countStars,
  layoutTextLines,
  normalizeSkyMessage,
  unsupportedSkyCharacters,
} from "../domain/worlds/vastSkyText";

describe("vast sky star font", () => {
  it("covers the full alphabet with non-empty single-stroke paths", () => {
    for (let code = 65; code <= 90; code++) {
      const letter = String.fromCharCode(code);
      const strokes = STAR_FONT[letter];
      expect(strokes, letter).toBeDefined();
      expect(strokes.length).toBeGreaterThan(0);
      for (const stroke of strokes) {
        expect(stroke.length).toBeGreaterThanOrEqual(2);
        for (const [x, y] of stroke) {
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(2.5);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(4.5);
        }
      }
    }
  });
});

describe("wrapMessage", () => {
  it("preserves Spanish accents as drawable glyphs and normalizes decomposed input", () => {
    expect(normalizeSkyMessage("áéíóúüñ ÁÉÍÓÚÜÑ")).toBe("ÁÉÍÓÚÜÑ ÁÉÍÓÚÜÑ");
    expect(wrapMessage("ÁÉÍÓÚÜÑ")).toEqual(["ÁÉÍÓÚÜÑ"]);
    for (const ch of "ÁÉÍÓÚÜÑ") expect(STAR_FONT[ch]).toBeDefined();
  });

  it("reports unsupported text and symbols while treating punctuation as separators", () => {
    expect(unsupportedSkyCharacters("hola, мир 🙂 !")).toEqual([
      "м",
      "и",
      "р",
      "🙂",
    ]);
    expect(normalizeSkyMessage("hola, mundo!")).toBe("HOLA MUNDO");
  });

  it("splits long words and bounds normalized messages to four lines and 48 characters", () => {
    const lines = wrapMessage("Supercalifragilistic " + "calm ".repeat(20));
    expect(lines.length).toBeLessThanOrEqual(4);
    expect(lines.every((line) => line.length <= 12)).toBe(true);
    expect(lines.join("").length).toBeLessThanOrEqual(48);
  });

  it("preserves all 48 normalized letters across four lines", () => {
    const input = "A".repeat(48);
    const lines = wrapMessage(input);
    expect(lines).toHaveLength(4);
    expect(lines.join("")).toBe(normalizeSkyMessage(input));
  });

  it("preserves words and letters when wrapping at boundaries", () => {
    const input = "CALM AND SOFT WORDS FOR TODAY";
    const lines = wrapMessage(input);
    expect(lines.join("").replace(/ /g, "")).toBe(
      normalizeSkyMessage(input).replace(/ /g, ""),
    );
  });

  it("preserves non-space letters when short words would need more than four greedy lines", () => {
    const input = "AAAAAAA BBBBBBB CCCCCCC DDDDDDD EEEEEEE FFFFFFF";
    const lines = wrapMessage(input);
    expect(lines.length).toBeLessThanOrEqual(4);
    expect(lines.join("").replace(/ /g, "")).toBe(
      normalizeSkyMessage(input).replace(/ /g, ""),
    );
  });

  it("keeps short messages on one line", () => {
    expect(wrapMessage("BREATHE")).toEqual(["BREATHE"]);
  });

  it("wraps at word boundaries into short lines", () => {
    expect(wrapMessage("you are enough")).toEqual(["YOU ARE", "ENOUGH"]);
  });

  it("caps at four lines", () => {
    const lines = wrapMessage(
      "let it be soft and slow and gentle tonight my friend",
    );
    expect(lines.length).toBeLessThanOrEqual(4);
  });

  it("strips non-letters and never returns empty", () => {
    expect(wrapMessage("   ")).toEqual(["BREATHE"]);
    expect(wrapMessage("breathe...")).toEqual(["BREATHE"]);
    expect(wrapMessage("")).toEqual(["BREATHE"]);
  });
});

describe("messageMelody", () => {
  it("maps each letter to a warm pentatonic note", () => {
    const notes = messageMelody("AB");
    expect(notes).toHaveLength(2);
    expect(notes[0]).toBe(MESSAGE_BASE_FREQ);
    expect(notes[1]).toBeCloseTo(
      MESSAGE_BASE_FREQ * Math.pow(2, PENTA[1] / 12),
      1,
    );
  });

  it("turns spaces into rests", () => {
    expect(messageMelody("A B")).toEqual([
      MESSAGE_BASE_FREQ,
      0,
      expect.any(Number),
    ]);
  });

  it("ignores non-letters", () => {
    expect(messageMelody("A!")).toHaveLength(1);
  });

  it("uses the same accent normalization and message bounds", () => {
    expect(messageMelody("á")).toEqual(messageMelody("A"));
    expect(messageMelody("á").length).toBe(1);
  });
});

describe("layoutTextLines", () => {
  it("places stars inside the box and centers lines", () => {
    const W = 390,
      H = 844;
    const { stars, ghosts, unit } = layoutTextLines(["BREATHE"], W, H);
    expect(stars.length).toBe(countStars(["BREATHE"]));
    expect(stars.length).toBeGreaterThan(0);
    for (const s of stars) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThanOrEqual(W);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThanOrEqual(H);
    }
    expect(unit).toBeGreaterThan(0);
    expect(ghosts.length).toBeGreaterThan(0);
    // centered: first and last star roughly symmetric around center
    const xs = stars.map((s) => s.x);
    const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
    expect(Math.abs(mid - W / 2)).toBeLessThan(W * 0.05);
  });

  it("shrinks the unit for long lines instead of overflowing", () => {
    const small = layoutTextLines(["BREATHE"], 390, 844);
    const big = layoutTextLines(["SUPERCALIFRAGILISTIC"], 390, 844);
    expect(big.unit).toBeLessThan(small.unit);
    for (const s of big.stars) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThanOrEqual(390);
    }
  });

  it("counts and lays out every glyph in a wrapped 48-letter message", () => {
    const lines = wrapMessage("A".repeat(48));
    expect(countStars(lines)).toBe(48 * countStars(["A"]));
    expect(layoutTextLines(lines, 390, 844).stars).toHaveLength(
      48 * countStars(["A"]),
    );
  });

  it("fits text inside explicit bounds below the control dock", () => {
    const bounds = { top: 280, bottom: 675 };
    const { stars, unit } = layoutTextLines(
      ["BREATHE", "STAY SOFT", "TONIGHT"],
      390,
      844,
      bounds,
    );
    expect(stars.length).toBeGreaterThan(0);
    expect(unit).toBeGreaterThan(0);
    for (const s of stars) {
      expect(s.y).toBeGreaterThanOrEqual(bounds.top);
      expect(s.y).toBeLessThanOrEqual(bounds.bottom);
    }
  });
});
