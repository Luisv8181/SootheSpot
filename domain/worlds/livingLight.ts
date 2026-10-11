export type LightPoint = { x: number; y: number };
export type LightGesture = { x: number; y: number; held: boolean; spread: number; rotation: number };

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const TAU = Math.PI * 2;
const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value));

export function clampLightGesture(gesture: LightGesture): LightGesture {
  return {
    x: Number.isFinite(gesture.x) ? clamp(gesture.x, 0, 1) : 0.5,
    y: Number.isFinite(gesture.y) ? clamp(gesture.y, 0, 1) : 0.5,
    held: typeof gesture.held === "boolean" ? gesture.held : false,
    spread: Number.isFinite(gesture.spread) ? clamp(gesture.spread, 0.5, 1.8) : 1,
    rotation: Number.isFinite(gesture.rotation) ? clamp(gesture.rotation, -Math.PI, Math.PI) : 0
  };
}

export function lightThreadPoint(
  thread: number,
  step: number,
  time: number,
  gather: number,
  gesture: LightGesture
): LightPoint {
  const threadIndex = Number.isFinite(thread) ? clamp(thread, 0, 95) : 0;
  const segment = Number.isFinite(step) ? clamp(step, 0, 63) : 0;
  const phase = segment / 63;
  const safeTime = Number.isFinite(time) ? time % 10_000 : 0;
  const amount = Number.isFinite(gather) ? clamp(gather, 0, 1) : 0;
  const control = clampLightGesture(gesture);
  const depth = threadIndex / 95;

  const flowAngle = safeTime * 0.45 + threadIndex * 0.17 + phase * 4.2;
  const envelope = Math.sin(phase * Math.PI);
  const ribbonX = (phase - .5) * .94;
  const ribbonY = Math.sin(phase * TAU + safeTime * .18) * .15 + (depth - .5) * .28 * envelope + Math.sin(flowAngle) * .025;
  const turn = control.rotation * .35;
  const flowing = {
    x: .5 + (control.x - .5) * .6 * envelope + (ribbonX * Math.cos(turn) - ribbonY * Math.sin(turn)) * control.spread,
    y: .5 + (control.y - .5) * .6 * envelope + (ribbonX * Math.sin(turn) + ribbonY * Math.cos(turn)) * control.spread
  };

  const theta = phase * TAU + threadIndex * GOLDEN_ANGLE;
  const radius = 0.15 + 0.08 * Math.cos(theta * 5 + threadIndex * 0.05);
  const depthVariation = Math.sin(threadIndex * 0.31 + theta * 2) * 0.018;
  const localX = (radius + depthVariation) * Math.cos(theta) * control.spread;
  const localY = (radius + depthVariation) * Math.sin(theta) * control.spread;
  const cosine = Math.cos(control.rotation);
  const sine = Math.sin(control.rotation);
  const bloom = {
    x: control.x + localX * cosine - localY * sine,
    y: control.y + localX * sine + localY * cosine
  };

  const point = {
    x: flowing.x + (bloom.x - flowing.x) * amount,
    y: flowing.y + (bloom.y - flowing.y) * amount
  };

  return {
    x: Number.isFinite(point.x) ? point.x : control.x,
    y: Number.isFinite(point.y) ? point.y : control.y
  };
}
