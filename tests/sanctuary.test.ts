import { describe, expect, it } from "vitest";
import { sanctuaryPoint, sanctuaryAreaAt, sanctuaryNoteAt, addSanctuaryMark } from "../domain/worlds/sanctuary";
describe("sanctuary interaction bounds", () => {
  it("keeps malformed gestures finite and within the scene", () => {
    expect(sanctuaryPoint({x:NaN,y:Infinity})).toEqual({x:.5,y:.5});
    expect(sanctuaryPoint({x:-3,y:4})).toEqual({x:0,y:1});
  });
  it("maps direct gestures to the three reachable areas", () => {
    expect(sanctuaryAreaAt({x:.55,y:.32})).toBe("arch");
    expect(sanctuaryAreaAt({x:.17,y:.72})).toBe("flowers");
    expect(sanctuaryAreaAt({x:.7,y:.76})).toBe("pool");
  });
  it("maps the arch to five bounded notes including malformed input", () => {
    expect(sanctuaryNoteAt(-1,false)).toBe(0);
    expect(sanctuaryNoteAt(2,false)).toBe(4);
    expect(sanctuaryNoteAt(NaN,true)).toBe(2);
  });
  it("bounds visual responses and gives still mode one deliberate mark", () => {
    let marks: ReturnType<typeof addSanctuaryMark> = [];
    for(let i=0;i<100;i++)marks=addSanctuaryMark(marks,{id:i,x:.5,y:.75},false);
    expect(marks).toHaveLength(10);
    expect(marks[0].id).toBe(90);
    expect(addSanctuaryMark(marks,{id:100,x:NaN,y:2},true)).toEqual([{id:100,x:.5,y:1}]);
  });
});
