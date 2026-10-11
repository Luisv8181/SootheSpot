import { describe, expect, it } from "vitest";
import { crossedLightStrings, LIGHT_NOTES, type LightPoint } from "../domain/worlds/lightStrum";

const line = (...points: LightPoint[]): LightPoint[] => points;

describe("crossed light strings", () => {
  it("finds a sweep that crosses a string and reports misses", () => {
    const lines = [line({ x: 0.5, y: 0 }, { x: 0.5, y: 1 }), line({ x: 0.8, y: 0 }, { x: 0.8, y: 1 })];
    expect(crossedLightStrings({ x: 0.2, y: 0.5 }, { x: 0.7, y: 0.5 }, lines, 100, 100)).toEqual([0]);
    expect(crossedLightStrings({ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 }, lines, 100, 100)).toEqual([]);
  });

  it("includes near touches within eight physical pixels and works in reverse", () => {
    const lines = [line({ x: 0.5, y: 0 }, { x: 0.5, y: 1 })];
    expect(crossedLightStrings({ x: 0.42, y: 0.2 }, { x: 0.42, y: 0.8 }, lines, 100, 100)).toEqual([0]);
    expect(crossedLightStrings({ x: 0.4, y: 0.2 }, { x: 0.4, y: 0.8 }, lines, 100, 100)).toEqual([]);
    expect(crossedLightStrings({ x: 0.8, y: 0.5 }, { x: 0.2, y: 0.5 }, lines, 100, 100)).toEqual([0]);
  });

  it("hits multiple strings and treats a zero movement as a tap", () => {
    const lines = [line({ x: 0, y: 0.5 }, { x: 1, y: 0.5 }), line({ x: 0, y: 0.52 }, { x: 1, y: 0.52 })];
    expect(crossedLightStrings({ x: 0.1, y: 0.4 }, { x: 0.9, y: 0.6 }, lines, 100, 100)).toEqual([0, 1]);
    expect(crossedLightStrings({ x: 0.4, y: 0.5 }, { x: 0.4, y: 0.5 }, lines, 100, 100)).toEqual([0, 1]);
  });

  it("ignores invalid inputs, limits results to eight strings, and exports eight notes", () => {
    const strings = Array.from({ length: 10 }, () => line({ x: 0.5, y: 0 }, { x: 0.5, y: 1 }));
    expect(crossedLightStrings({ x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 }, strings, 100, 100)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(crossedLightStrings({ x: Number.NaN, y: 0 }, { x: 1, y: 1 }, strings, 100, 100)).toEqual([]);
    expect(crossedLightStrings({ x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 }, [line({ x: 0.5, y: 0 }, { x: Number.NaN, y: 0.5 }, { x: 0.5, y: 1 })], 100, 100)).toEqual([]);
    expect(crossedLightStrings({ x: 0, y: 0 }, { x: 1, y: 1 }, strings, 0, 100)).toEqual([]);
    expect(LIGHT_NOTES).toHaveLength(8);
    expect(LIGHT_NOTES).toEqual([130.81, 146.83, 164.81, 196, 220, 261.63, 293.66, 329.63]);
  });
});
