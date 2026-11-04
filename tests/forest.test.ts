import { describe, expect, it } from "vitest";
import { forestPosition, forestStation, forestViewport, forestRipple } from "../domain/worlds/forest";
describe("forest boundaries", () => {
  it("bounds navigation and handles invalid coordinates", () => {
    expect(forestPosition(NaN)).toBe(.12);
    expect(forestPosition(-2)).toBe(.06);
    expect(forestPosition(10)).toBe(.94);
    expect([.12,.35,.63,.86].map(forestStation)).toEqual([0,1,2,3]);
  });
  it("bounds raster dimensions across wide and tall devices", () => {
    const wide=forestViewport(1440,650);
    expect(wide.width/wide.height).toBeCloseTo(1440/650,2);
    for (const [w,h] of [[390,650],[8000,4000],[1,900],[NaN,Infinity]]) {
      const size=forestViewport(w,h);
      expect(size.width*size.height).toBeLessThanOrEqual(614400);
      expect(size.width).toBeGreaterThan(0);expect(size.height).toBeGreaterThan(0);
    }
  });
  it("keeps at most 24 transient interactions and one deliberate still mark", () => {
    let marks:ReturnType<typeof forestRipple>=[];
    for(let i=0;i<100;i++) marks=forestRipple(marks,{x:.8,y:.72,time:i},false);
    expect(marks).toHaveLength(24);
    expect(forestRipple(marks,{x:.8,y:.7,time:101},true)).toHaveLength(1);
  });
});
