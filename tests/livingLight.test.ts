import { describe, expect, it } from "vitest";
import { clampLightGesture, lightThreadPoint, type LightGesture } from "../domain/worlds/livingLight";

const neutralGesture: LightGesture = { x: 0.5, y: 0.5, held: false, spread: 1, rotation: 0 };

describe("living light gesture bounds", () => {
  it("clamps coordinates, spread, and rotation while retaining held state", () => {
    expect(clampLightGesture({ x: -2, y: 3, held: true, spread: 4, rotation: 9 })).toEqual({
      x: 0,
      y: 1,
      held: true,
      spread: 1.8,
      rotation: Math.PI
    });
  });

  it("uses a centered neutral gesture when numeric inputs are invalid", () => {
    expect(clampLightGesture({
      x: Number.NaN,
      y: Number.POSITIVE_INFINITY,
      held: false,
      spread: Number.NaN,
      rotation: Number.NEGATIVE_INFINITY
    })).toEqual(neutralGesture);
  });
});

describe("living light thread geometry", () => {
  it("lets sweeping, opening, and turning shape the flowing material before gathering", () => {
    const point = lightThreadPoint(17, 22, 1.2, 0, neutralGesture);
    for (const gesture of [{ ...neutralGesture, x: .8, y: .2 }, { ...neutralGesture, spread: 1.6 }, { ...neutralGesture, rotation: 1 }]) {
      expect(lightThreadPoint(17, 22, 1.2, 0, gesture)).not.toEqual(point);
    }
  });
  it("returns finite points across all threads, segments, times, and gather values", () => {
    for (let thread = 0; thread < 96; thread++) {
      for (let step = 0; step < 64; step++) {
        const point = lightThreadPoint(thread, step, 2.4, (thread % 10) / 9, neutralGesture);
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.y)).toBe(true);
      }
    }
  });

  it("changes geometry smoothly as gathering moves ribbons into a bloom", () => {
    const flowing = lightThreadPoint(17, 22, 1.2, 0, neutralGesture);
    const gathered = lightThreadPoint(17, 22, 1.2, 1, neutralGesture);
    const midway = lightThreadPoint(17, 22, 1.2, 0.5, neutralGesture);

    expect(gathered).not.toEqual(flowing);
    expect(midway.x).toBeCloseTo((flowing.x + gathered.x) / 2, 10);
    expect(midway.y).toBeCloseTo((flowing.y + gathered.y) / 2, 10);
  });

  it("centers the gathered bloom on the clamped gesture and applies spread and rotation", () => {
    const gesture = { x: 0.72, y: 0.28, held: true, spread: 1, rotation: 0 };
    const point = lightThreadPoint(0, 0, 0, 1, gesture);
    expect(point.x).toBeCloseTo(gesture.x + 0.23, 10);
    expect(point.y).toBeCloseTo(gesture.y, 10);

    const moved = lightThreadPoint(0, 0, 0, 1, { ...gesture, spread: 1.8, rotation: Math.PI / 2 });
    expect(moved.x).toBeCloseTo(gesture.x, 10);
    expect(moved.y).toBeGreaterThan(gesture.y + 0.4);
  });

  it("stays finite for invalid inputs and permits bloom points beyond the viewport", () => {
    const invalid = lightThreadPoint(Number.NaN, Number.POSITIVE_INFINITY, Number.NaN, Number.NaN, neutralGesture);
    expect(Number.isFinite(invalid.x)).toBe(true);
    expect(Number.isFinite(invalid.y)).toBe(true);

    const outside = lightThreadPoint(0, 0, 0, 1, { ...neutralGesture, x: 1 });
    expect(outside.x).toBeGreaterThan(1);
  });
});
