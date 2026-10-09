import { describe, expect, it } from "vitest";
import {
  bitLength,
  createRng,
  deriveSeed,
  digitsForBits,
  displayDigits,
  groupDigits,
  hashSeed,
  parseInBase,
  randomSeed,
  toBase,
} from "..";

describe("rng", () => {
  it("is deterministic and pinned (changing these values breaks multiplayer and daily parity)", () => {
    const r = createRng(12345);
    expect(r.next()).toBe(0.9797282677609473);
    expect(r.next()).toBe(0.3067522644996643);
    expect(r.int(0, 1000)).toBe(484);
    expect(hashSeed("")).toBe(451236155);
    expect(hashSeed("daily:2026-10-09")).toBe(924103099);
    expect(hashSeed("room-ABCD")).toBe(445819236);
    expect(deriveSeed(1, 0)).toBe(920564995);
    expect(deriveSeed(1, 1)).toBe(314344336);
    expect(deriveSeed(0xffffffff, 7)).toBe(719642249);
  });

  it("next() stays in [0, 1) and int() is inclusive and roughly uniform", () => {
    const r = createRng(99);
    const counts = new Array(6).fill(0);
    for (let i = 0; i < 60_000; i++) {
      const x = r.next();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      counts[r.int(1, 6) - 1]++;
    }
    for (const c of counts) expect(Math.abs(c - 10_000)).toBeLessThan(500);
  });

  it("pick, chance and weighted", () => {
    const r = createRng(7);
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(r.pick(["a", "b", "c"]));
    expect(seen.size).toBe(3);
    let heavy = 0;
    for (let i = 0; i < 10_000; i++)
      if (r.weighted(["x", "y"], (v) => (v === "x" ? 9 : 1)) === "x") heavy++;
    expect(heavy / 10_000).toBeGreaterThan(0.87);
    expect(heavy / 10_000).toBeLessThan(0.93);
    expect(() => r.pick([])).toThrow();
  });

  it("hashSeed and deriveSeed return distinct uint32 values", () => {
    const seeds = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const s = deriveSeed(42, i);
      expect(Number.isInteger(s) && s >= 0 && s <= 0xffffffff).toBe(true);
      seeds.add(s);
      seeds.add(hashSeed(`daily:${i}`));
    }
    expect(seeds.size).toBe(2000);
    const rs = randomSeed();
    expect(Number.isInteger(rs) && rs >= 0 && rs <= 0xffffffff).toBe(true);
  });
});

describe("bases", () => {
  it("round-trips values in every base", () => {
    for (const base of [2, 8, 10, 16] as const) {
      for (let v = 0; v < 70_000; v += 7) {
        expect(parseInBase(toBase(v, base), base)).toBe(v);
      }
      expect(parseInBase(toBase(0xffffffff, base), base)).toBe(0xffffffff);
    }
  });
  it("pads and rejects bad input", () => {
    expect(toBase(5, 2, 8)).toBe("00000101");
    expect(toBase(255, 16)).toBe("ff");
    expect(parseInBase("12", 2)).toBeNull();
    expect(parseInBase("", 10)).toBeNull();
    expect(parseInBase("1g", 16)).toBeNull();
    expect(parseInBase("FF", 16)).toBe(255);
    expect(() => toBase(-1, 2)).toThrow();
  });
  it("groups digits from the right", () => {
    expect(groupDigits("10110110", 4)).toBe("1011 0110");
    expect(groupDigits("110110", 4)).toBe("11 0110");
    expect(groupDigits("111101101", 3)).toBe("111 101 101");
    expect(groupDigits("101", 4)).toBe("101");
    expect(displayDigits("2d", 16, { prefix: true })).toBe("0x2D");
    expect(displayDigits("10110110", 2, { group: true })).toBe("1011 0110");
  });
  it("digitsForBits and bitLength", () => {
    expect(digitsForBits(8, 2)).toBe(8);
    expect(digitsForBits(8, 16)).toBe(2);
    expect(digitsForBits(9, 8)).toBe(3);
    expect(digitsForBits(8, 10)).toBe(3);
    expect(bitLength(0)).toBe(1);
    expect(bitLength(255)).toBe(8);
    expect(bitLength(256)).toBe(9);
  });
});
