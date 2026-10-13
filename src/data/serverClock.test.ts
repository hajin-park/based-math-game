import { describe, expect, it } from "vitest";
import { clockOffsetFrom, toServerTime } from "./serverClock";

describe("server clock offset", () => {
  const issued = Date.UTC(2026, 9, 13, 12, 0, 0); // whole seconds, like iat

  it("is zero when the device agrees with the server", () => {
    expect(clockOffsetFrom(issued, issued + 200, issued + 600)).toBe(0);
  });

  it("measures a fast device clock as a negative offset", () => {
    // Device is 7 minutes ahead: the token was issued "7 minutes ago".
    const fast = 7 * 60_000;
    const offset = clockOffsetFrom(issued, issued + fast, issued + fast + 300);
    expect(offset).toBeLessThan(-6.9 * 60_000);
    expect(offset).toBeGreaterThan(-7.1 * 60_000);
    // A run that ended "now" on the device lands at server time.
    expect(toServerTime(issued + fast + 300, offset)).toBeLessThanOrEqual(
      issued + 2_000,
    );
  });

  it("measures a slow device clock as a positive offset", () => {
    const slow = 3 * 60_000;
    const offset = clockOffsetFrom(issued, issued - slow, issued - slow + 100);
    expect(offset).toBeGreaterThan(2.9 * 60_000);
  });

  it("ignores sub-two-second noise and bad input", () => {
    expect(clockOffsetFrom(issued, issued + 1_500, issued + 1_600)).toBe(0);
    expect(clockOffsetFrom(Number.NaN, 0, 1)).toBe(0);
    expect(clockOffsetFrom(issued, 10, 5)).toBe(0);
  });
});
