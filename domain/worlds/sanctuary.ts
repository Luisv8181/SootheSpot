export type SanctuaryArea = "pool" | "arch" | "flowers";
export type SanctuaryPoint = { x: number; y: number };
export type SanctuaryMark = SanctuaryPoint & { id: number };
export const SANCTUARY_AREAS: SanctuaryArea[] = ["pool", "arch", "flowers"];
export const sanctuaryStrings = (portrait: boolean) => portrait
  ? [{ x:.469, top:.14, end:.383 },{ x:.513, top:.128, end:.408 },{ x:.557, top:.125, end:.422 },{ x:.609, top:.13, end:.398 },{ x:.66, top:.14, end:.374 }]
  : [{ x:.516, top:.074, end:.435 },{ x:.55, top:.066, end:.473 },{ x:.579, top:.062, end:.492 },{ x:.611, top:.067, end:.479 },{ x:.642, top:.078, end:.448 }];
export function sanctuaryPoint(point: SanctuaryPoint): SanctuaryPoint {
  return {x:Number.isFinite(point.x)?Math.min(1,Math.max(0,point.x)):.5,y:Number.isFinite(point.y)?Math.min(1,Math.max(0,point.y)):.5};
}
export function sanctuaryAreaAt(point: SanctuaryPoint): SanctuaryArea {
  const p=sanctuaryPoint(point);return p.y<.53?"arch":p.x<.36?"flowers":"pool";
}
export function sanctuaryNoteAt(x: number, portrait: boolean): number {
  if(!Number.isFinite(x))return 2;
  const strings=sanctuaryStrings(portrait);let note=0,distance=Infinity;
  strings.forEach((string,index)=>{const d=Math.abs(x-string.x);if(d<distance){note=index;distance=d;}});return note;
}
export function addSanctuaryMark(marks: SanctuaryMark[], mark: SanctuaryMark, still: boolean): SanctuaryMark[] {
  return [...(still?[]:marks.slice(-9)),{id:mark.id,...sanctuaryPoint(mark)}];
}
export function sanctuaryPoolPoint(point: SanctuaryPoint, portrait: boolean): SanctuaryPoint {
  const p=sanctuaryPoint(point),center={x:.65,y:portrait?.7:.74},rx=.26,ry=portrait?.17:.16;
  const x=(p.x-center.x)/rx,y=(p.y-center.y)/ry,scale=Math.max(1,Math.hypot(x,y));
  return {x:center.x+x/scale*rx,y:center.y+y/scale*ry};
}
