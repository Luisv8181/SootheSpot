import { describe, expect, it } from "vitest";
import { appendRipple, breathEnvelope, sessionMilliseconds, waveHeightAt } from "../domain/worlds/water";

describe("continuous water timing", () => {
  const rhythm = { inhaleSeconds: 4, holdSeconds: 0, exhaleSeconds: 6 };
  it("uses fractional time for a smooth bounded breathing envelope", () => {
    expect(breathEnvelope(0, rhythm)).toBe(0);
    expect(breathEnvelope(2, rhythm)).toBeCloseTo(.5);
    expect(breathEnvelope(2.5, rhythm)).toBeGreaterThan(breathEnvelope(2, rhythm));
    expect(breathEnvelope(4, rhythm)).toBe(1);
    expect(breathEnvelope(7, rhythm)).toBeCloseTo(.5);
    expect(breathEnvelope(10, rhythm)).toBe(0);
    expect(breathEnvelope(Number.NaN, rhythm)).toBe(0);
  });
  it("retains fractional time when paused and resumes without a jump", () => {
    const paused = sessionMilliseconds(0, 1000, 1675, 300000);
    expect(paused).toBe(675);
    expect(sessionMilliseconds(paused, null, 9000, 300000)).toBe(675);
    expect(sessionMilliseconds(paused, 9000, 9200, 300000)).toBe(875);
    expect(sessionMilliseconds(paused, 9000, 8800, 300000)).toBe(675);
    expect(sessionMilliseconds(299900, 9000, 9500, 300000)).toBe(300000);
  });
});

describe("bounded local water waves", () => {
  it("caps waves and clamps coordinates without mutating earlier input", () => {
    const initial = [{ x: .5, y: .5, born: 0 }];
    let waves = initial;
    for (let i = 0; i < 15; i++) waves = appendRipple(waves, -1, 2, i);
    expect(waves).toHaveLength(8);
    expect(waves.every((wave) => wave.x === 0 && wave.y === 1)).toBe(true);
    expect(waves[0].born).toBe(7);
    expect(initial).toHaveLength(1);
    expect(appendRipple(waves, Number.NaN, 0, 1)).toEqual(waves);
  });
  it("superposes waves and lets their energy settle", () => {
    const wave = { x: .5, y: .5, born: 0 };
    const single = waveHeightAt(.61, .5, 1, [wave]);
    expect(Math.abs(single)).toBeGreaterThan(.000001);
    expect(waveHeightAt(.61, .5, 1, [wave, wave])).toBeCloseTo(single * 2);
    expect(waveHeightAt(.61, .5, 40, [wave])).toBe(0);
    expect(waveHeightAt(.5, .5, -1, [wave])).toBe(0);
    expect(Number.isFinite(waveHeightAt(.5, .5, 0, [wave]))).toBe(true);
  });
});
