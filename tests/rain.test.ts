import { describe, expect, it } from "vitest";
import { appendClearMark, rainCanvasSize } from "../domain/worlds/rain";

describe("bounded rain glass marks", () => {
  it("clamps coordinates, prunes marks older than 24 session seconds, and caps at 120", () => {
    const old = { x: 0.5, y: 0.5, born: 0 };
    let marks = [old];
    marks = appendClearMark(marks, -1, 2, 24);
    expect(marks).toEqual([old, { x: 0, y: 1, born: 24 }]);
    marks = appendClearMark(marks, 0.4, 0.6, 24.01);
    expect(marks).not.toContain(old);

    for (let index = 0; index < 125; index++) {
      marks = appendClearMark(marks, 0.5, 0.5, 25 + index / 100);
    }
    expect(marks).toHaveLength(120);
    expect(marks[0].born).toBe(25.05);
    expect(marks.at(-1)?.born).toBe(26.24);
  });

  it("ignores invalid coordinates or timestamps without mutating existing marks", () => {
    const marks = [{ x: 0.3, y: 0.7, born: 3 }];
    expect(appendClearMark(marks, Number.NaN, 0, 4)).toEqual(marks);
    expect(appendClearMark(marks, 0, Number.POSITIVE_INFINITY, 4)).toEqual(marks);
    expect(appendClearMark(marks, 0, 1, Number.NaN)).toEqual(marks);
    expect(marks).toEqual([{ x: 0.3, y: 0.7, born: 3 }]);
  });
});

describe("bounded rain canvas size", () => {
  it("preserves small dimensions and caps device pixel ratio at two", () => {
    expect(rainCanvasSize(320, 240, 3)).toEqual({ width: 640, height: 480, scale: 2 });
  });

  it("caps total pixels at 1.5 million while keeping dimensions positive", () => {
    const size = rainCanvasSize(2000, 1000, 2);
    expect(size.width * size.height).toBeLessThanOrEqual(1_500_000);
    expect(size.scale).toBeLessThan(2);
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });

  it("handles invalid and zero layout dimensions with a positive bounded canvas", () => {
    const size = rainCanvasSize(0, Number.NaN, Number.POSITIVE_INFINITY);
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
    expect(size.scale).toBe(1);
    expect(size.width * size.height).toBeLessThanOrEqual(1_500_000);
  });
});
