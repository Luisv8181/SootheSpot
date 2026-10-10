import { describe, expect, it } from "vitest";
import {
  STAR_FONT,
  PENTA,
  MESSAGE_BASE_FREQ,
  wrapMessage,
  messageMelody,
  countStars,
  layoutTextLines
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
  it("keeps short messages on one line", () => {
    expect(wrapMessage("BREATHE")).toEqual(["BREATHE"]);
  });

  it("wraps at word boundaries into short lines", () => {
    expect(wrapMessage("you are enough")).toEqual(["YOU ARE", "ENOUGH"]);
  });

  it("caps at four lines", () => {
    const lines = wrapMessage("let it be soft and slow and gentle tonight my friend");
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
    expect(notes[1]).toBeCloseTo(MESSAGE_BASE_FREQ * Math.pow(2, PENTA[1] / 12), 1);
  });

  it("turns spaces into rests", () => {
    expect(messageMelody("A B")).toEqual([MESSAGE_BASE_FREQ, 0, expect.any(Number)]);
  });

  it("ignores non-letters", () => {
    expect(messageMelody("A!")).toHaveLength(1);
  });
});

describe("layoutTextLines", () => {
  it("places stars inside the box and centers lines", () => {
    const W = 390, H = 844;
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

  it("keeps historical geometry when no bounds are given", () => {
    const a = layoutTextLines(["BREATHE", "SOFT SKY"], 390, 844);
    const b = layoutTextLines(["BREATHE", "SOFT SKY"], 390, 844, undefined);
    expect(b.stars).toEqual(a.stars);
    expect(b.unit).toBe(a.unit);
  });

  it("fits text inside explicit bounds below the control dock", () => {
    const bounds = { top: 280, bottom: 675 };
    const { stars, unit } = layoutTextLines(["BREATHE", "STAY SOFT", "TONIGHT"], 390, 844, bounds);
    expect(stars.length).toBeGreaterThan(0);
    expect(unit).toBeGreaterThan(0);
    for (const s of stars) {
      expect(s.y).toBeGreaterThanOrEqual(bounds.top);
      expect(s.y).toBeLessThanOrEqual(bounds.bottom);
    }
  });
});
