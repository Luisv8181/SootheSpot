export type LightPoint = { x: number; y: number };

export const LIGHT_NOTES = [130.81, 146.83, 164.81, 196, 220, 261.63, 293.66, 329.63] as const;

const HIT_RADIUS_PX = 8;

function isFinitePoint(point: LightPoint | undefined): point is LightPoint {
  return !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
}

function pointSegmentDistanceSquared(point: LightPoint, start: LightPoint, end: LightPoint): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return (point.x - start.x) ** 2 + (point.y - start.y) ** 2;
  const projection = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  const nearestX = start.x + projection * dx;
  const nearestY = start.y + projection * dy;
  return (point.x - nearestX) ** 2 + (point.y - nearestY) ** 2;
}

function segmentsIntersect(a: LightPoint, b: LightPoint, c: LightPoint, d: LightPoint): boolean {
  const cross = (p: LightPoint, q: LightPoint, r: LightPoint) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const onSegment = (p: LightPoint, q: LightPoint, r: LightPoint) =>
    Math.min(p.x, r.x) <= q.x && q.x <= Math.max(p.x, r.x) && Math.min(p.y, r.y) <= q.y && q.y <= Math.max(p.y, r.y);
  const abC = cross(a, b, c);
  const abD = cross(a, b, d);
  const cdA = cross(c, d, a);
  const cdB = cross(c, d, b);
  if (((abC > 0 && abD < 0) || (abC < 0 && abD > 0)) && ((cdA > 0 && cdB < 0) || (cdA < 0 && cdB > 0))) return true;
  return (abC === 0 && onSegment(a, c, b)) || (abD === 0 && onSegment(a, d, b)) ||
    (cdA === 0 && onSegment(c, a, d)) || (cdB === 0 && onSegment(c, b, d));
}

function segmentsWithinRadius(a: LightPoint, b: LightPoint, c: LightPoint, d: LightPoint): boolean {
  if (segmentsIntersect(a, b, c, d)) return true;
  const radiusSquared = HIT_RADIUS_PX * HIT_RADIUS_PX;
  return Math.min(
    pointSegmentDistanceSquared(a, c, d), pointSegmentDistanceSquared(b, c, d),
    pointSegmentDistanceSquared(c, a, b), pointSegmentDistanceSquared(d, a, b)
  ) <= radiusSquared;
}

/** Returns the indices of up to eight sampled strings touched by a pointer sweep. */
export function crossedLightStrings(
  from: LightPoint,
  to: LightPoint,
  lines: LightPoint[][],
  width: number,
  height: number
): number[] {
  if (!isFinitePoint(from) || !isFinitePoint(to) || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || !Array.isArray(lines)) return [];

  const sweepStart = { x: from.x * width, y: from.y * height };
  const sweepEnd = { x: to.x * width, y: to.y * height };
  const hits: number[] = [];

  for (let index = 0; index < Math.min(lines.length, 8); index++) {
    const points = lines[index];
    if (!Array.isArray(points) || points.some(point => !isFinitePoint(point))) continue;
    const physical = points.map(point => ({ x: point.x * width, y: point.y * height }));
    if (physical.length === 1) {
      if (pointSegmentDistanceSquared(physical[0], sweepStart, sweepEnd) <= HIT_RADIUS_PX ** 2) hits.push(index);
      continue;
    }
    for (let pointIndex = 1; pointIndex < physical.length; pointIndex++) {
      if (segmentsWithinRadius(sweepStart, sweepEnd, physical[pointIndex - 1], physical[pointIndex])) {
        hits.push(index);
        break;
      }
    }
  }

  return hits;
}
