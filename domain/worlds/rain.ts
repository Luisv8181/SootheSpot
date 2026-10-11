export type ClearMark = { x: number; y: number; born: number };

const MAX_MARKS = 120;
const MARK_LIFETIME_SECONDS = 24;
const MAX_CANVAS_PIXELS = 1_500_000;

export function appendClearMark(marks: readonly ClearMark[], x: number, y: number, born: number): ClearMark[] {
  if (![x, y, born].every(Number.isFinite)) return [...marks];

  const recent = marks.filter((mark) => born - mark.born <= MARK_LIFETIME_SECONDS);
  return [
    ...recent,
    {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      born: Math.max(0, born)
    }
  ].slice(-MAX_MARKS);
}

export function rainCanvasSize(width: number, height: number, dpr: number): { width: number; height: number; scale: number } {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 1;
  const safeDpr = Number.isFinite(dpr) && dpr > 0 ? Math.min(dpr, 2) : 1;
  const pixelScale = Math.sqrt(MAX_CANVAS_PIXELS / (safeWidth * safeHeight));
  const scale = Math.min(safeDpr, pixelScale);

  return {
    width: Math.max(1, Math.floor(safeWidth * scale)),
    height: Math.max(1, Math.floor(safeHeight * scale)),
    scale
  };
}
