import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { dayStreak } from "./statsDerive";

// A zone with daylight saving time: 2026-03-08 has only 23 hours there.
const previousTz = process.env.TZ;
beforeAll(() => {
  process.env.TZ = "America/New_York";
});
afterAll(() => {
  process.env.TZ = previousTz;
});

const at = (ms: number) => ({ endedAt: ms });
const local = (y: number, m: number, d: number, h = 12, min = 0) =>
  new Date(y, m - 1, d, h, min).getTime();

describe("dayStreak", () => {
  it("counts consecutive local days ending today or yesterday", () => {
    const runs = [local(2026, 5, 3), local(2026, 5, 4), local(2026, 5, 5)].map(
      at,
    );
    expect(dayStreak(runs, local(2026, 5, 5, 20))).toEqual({
      current: 3,
      playedToday: true,
    });
    expect(dayStreak(runs, local(2026, 5, 6, 9))).toEqual({
      current: 3,
      playedToday: false,
    });
    expect(dayStreak(runs, local(2026, 5, 7, 9)).current).toBe(0);
  });

  it("does not skip the short day after clocks spring forward", () => {
    const runs = [local(2026, 3, 7), local(2026, 3, 8)].map(at);
    // 00:30 on the day after the 23-hour day, nothing played yet today.
    expect(dayStreak(runs, local(2026, 3, 9, 0, 30))).toEqual({
      current: 2,
      playedToday: false,
    });
  });
});
