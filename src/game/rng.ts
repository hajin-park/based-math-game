/**
 * Seeded pseudo-random numbers.
 *
 * Everything that must be reproducible (multiplayer rooms, the daily
 * challenge, replaying a run from its seed) draws from these generators, never
 * from Math.random. Only 32-bit integer arithmetic is used so every JS engine
 * produces bit-identical sequences.
 */
import type { Rng } from "./types";

/** Extended generator: the contract's `Rng` plus a few conveniences. */
export interface SeededRng extends Rng {
  /** True with probability `p`. */
  chance(p: number): boolean;
  /** Pick from items using non-negative weights (falls back to uniform if all zero). */
  weighted<T>(items: readonly T[], weight: (item: T) => number): T;
}

/** mulberry32: tiny, fast, good-quality 32-bit PRNG. */
export function mulberry32(seed: number): SeededRng {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (minInclusive: number, maxInclusive: number): number => {
    const lo = Math.ceil(Math.min(minInclusive, maxInclusive));
    const hi = Math.floor(Math.max(minInclusive, maxInclusive));
    return lo + Math.floor(next() * (hi - lo + 1));
  };
  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) throw new Error("rng.pick: empty list");
    return items[Math.floor(next() * items.length)];
  };
  const weighted = <T>(items: readonly T[], weight: (item: T) => number): T => {
    if (items.length === 0) throw new Error("rng.weighted: empty list");
    const weights = items.map((item) => Math.max(0, weight(item)));
    const total = weights.reduce((a, b) => a + b, 0);
    if (total <= 0) return pick(items);
    let r = next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r < 0) return items[i];
    }
    return items[items.length - 1];
  };
  return { next, int, pick, chance: (p) => next() < p, weighted };
}

/** Alias kept for readability at call sites. */
export const createRng = mulberry32;

/**
 * Hash a string to an unsigned 32-bit seed (cyrb53, folded to 32 bits).
 * Used for daily seeds (`hashSeed("daily:2026-10-09")`) and room codes.
 */
export function hashSeed(input: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  // Fold the 53-bit result into 32 bits.
  return ((h2 & 0x1fffff) ^ h1) >>> 0;
}

/**
 * Derive an independent child seed from (seed, index) with a splitmix-style
 * integer mix, so question `i` of a stream never depends on how many random
 * numbers question `i - 1` consumed.
 */
export function deriveSeed(seed: number, index: number): number {
  let z = (seed >>> 0) ^ Math.imul((index + 1) >>> 0, 0x9e3779b9);
  z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
  z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
  return (z ^ (z >>> 16)) >>> 0;
}

/** A fresh non-deterministic seed for solo runs (crypto when available). */
export function randomSeed(): number {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.getRandomValues === "function") {
    return c.getRandomValues(new Uint32Array(1))[0] >>> 0;
  }
  return Math.floor(Math.random() * 4294967296) >>> 0;
}
