import type { BreathActivity } from "./types";

export type Ripple = { x: number; y: number; born: number };

export function breathEnvelope(second: number, rhythm: Omit<BreathActivity, "type">): number {
  if (!Number.isFinite(second)) return 0;
  const cycle = rhythm.inhaleSeconds + rhythm.holdSeconds + rhythm.exhaleSeconds;
  const position = Math.max(0, second) % cycle;
  const linear = position < rhythm.inhaleSeconds ? position / rhythm.inhaleSeconds : position < rhythm.inhaleSeconds + rhythm.holdSeconds ? 1 : 1 - (position - rhythm.inhaleSeconds - rhythm.holdSeconds) / rhythm.exhaleSeconds;
  return (1 - Math.cos(Math.PI * linear)) / 2;
}

export function sessionMilliseconds(stored: number, started: number | null, now: number, max: number): number {
  return Math.min(max, Math.max(0, stored + (started === null ? 0 : Math.max(0, now - started))));
}

export function appendRipple(waves: readonly Ripple[], x: number, y: number, born: number): Ripple[] {
  if (![x, y, born].every(Number.isFinite)) return [...waves];
  return [...waves.slice(-7), { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)), born: Math.max(0, born) }];
}

export const WAVE_SPEED = .16;
export const WAVE_FREQUENCY = 85;
export const WAVE_WIDTH = .075;
export const WAVE_DECAY = .65;
export const WAVE_AMPLITUDE = .006;

export function waveHeightAt(x: number, y: number, time: number, waves: readonly Ripple[]): number {
  return waves.reduce((height, wave) => {
    const age = time - wave.born;
    if (age < 0 || age > 12) return height;
    const radius = Math.hypot(x - wave.x, y - wave.y);
    const distance = radius - WAVE_SPEED * age;
    return height + Math.sin(distance * WAVE_FREQUENCY) * Math.exp(-distance * distance / (WAVE_WIDTH * WAVE_WIDTH)) * Math.exp(-age * WAVE_DECAY) * WAVE_AMPLITUDE;
  }, 0);
}
