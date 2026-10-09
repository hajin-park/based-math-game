import { describe, expect, it } from "vitest";
import { friendlyAuthError, safeNextPath } from "./authErrors";
import {
  activityByDay,
  bestsList,
  dailySummary,
  dayStreak,
  paceTrend,
  topicBreakdown,
} from "./statsDerive";
import type { RunRecord } from "@/data/types";
import { validateDisplayName } from "@/utils/displayNameValidator";

describe("validateDisplayName", () => {
  it("accepts 1..24 characters and ordinary names", () => {
    for (const ok of [
      "A",
      "Cassandra",
      "Michelle",
      "Ashita",
      "Nazir",
      "Grape Drape",
      "Dickens",
      "José Ñúñez",
      "x".repeat(24),
    ]) {
      expect(validateDisplayName(ok).isValid, ok).toBe(true);
    }
  });
  it("rejects empty, long, markup and obvious slurs", () => {
    for (const bad of ["", "   ", "x".repeat(25), "<script>", "sh1t head", "f.u.c.k"]) {
      expect(validateDisplayName(bad).isValid, bad).toBe(false);
    }
  });
});

describe("safeNextPath", () => {
  it("accepts app-relative paths with query and hash", () => {
    expect(safeNextPath("/leaderboard?mode=survival#me")).toBe(
      "/leaderboard?mode=survival#me",
    );
    expect(safeNextPath(encodeURIComponent("/play?mode=nibbles:sprint"))).toBe(
      "/play?mode=nibbles:sprint",
    );
  });
  it("rejects absolute, protocol-relative and tricky targets", () => {
    for (const bad of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "evil",
      "/%5C%5Cevil",
      "",
      null,
      "/login",
      "/signup?next=/x",
    ]) {
      expect(safeNextPath(bad as string | null, "/home")).toBe("/home");
    }
  });
});

describe("friendlyAuthError", () => {
  it("never shows raw Firebase strings", () => {
    const err = Object.assign(
      new Error("Firebase: Error (auth/wrong-password)."),
      { code: "auth/wrong-password" },
    );
    const f = friendlyAuthError(err);
    expect(f.message).toBe("Email or password is incorrect.");
    expect(f.field).toBe("password");
  });
  it("parses codes out of messages and falls back politely", () => {
    expect(
      friendlyAuthError(new Error("Firebase: Error (auth/email-already-in-use)."))
        .field,
    ).toBe("email");
    expect(friendlyAuthError(new Error("Firebase: boom")).message).toMatch(
      /Something went wrong/,
    );
    expect(friendlyAuthError("weird").message).toMatch(/Something went wrong/);
  });
  it("is silent when the user closes the popup", () => {
    expect(friendlyAuthError({ code: "auth/popup-closed-by-user" }).silent).toBe(
      true,
    );
  });
  it("keeps the app's own messages", () => {
    expect(
      friendlyAuthError(new Error("Display name cannot be empty")).field,
    ).toBe("displayName");
  });
});

const NOW = new Date(2026, 9, 9, 15, 0, 0).getTime();
const DAY = 24 * 3600_000;

function run(p: Partial<RunRecord>): RunRecord {
  return {
    id: Math.random().toString(36),
    modeId: "nibbles:sprint",
    topicId: "nibbles",
    format: "sprint",
    score: 20,
    correct: 20,
    skipped: 0,
    durationMs: 60_000,
    accuracy: 1,
    typingAccuracy: 1,
    endedAt: NOW,
    completed: true,
    ...p,
  };
}

describe("dayStreak", () => {
  it("counts consecutive days ending today", () => {
    const runs = [0, 1, 2, 4].map((d) => run({ endedAt: NOW - d * DAY }));
    expect(dayStreak(runs, NOW)).toEqual({ current: 3, playedToday: true });
  });
  it("keeps yesterday's streak alive before today's first run", () => {
    const runs = [1, 2].map((d) => run({ endedAt: NOW - d * DAY }));
    expect(dayStreak(runs, NOW)).toEqual({ current: 2, playedToday: false });
  });
  it("is zero without recent runs", () => {
    expect(dayStreak([run({ endedAt: NOW - 5 * DAY })], NOW).current).toBe(0);
  });
});

describe("activityByDay", () => {
  it("buckets the last N days oldest first", () => {
    const b = activityByDay(
      [run({ endedAt: NOW }), run({ endedAt: NOW - DAY, correct: 3 })],
      7,
      NOW,
    );
    expect(b).toHaveLength(7);
    expect(b[6].runs).toBe(1);
    expect(b[5].correct).toBe(3);
  });
});

describe("topicBreakdown", () => {
  it("sorts slowest topic first and links practice", () => {
    const rows = topicBreakdown([
      run({ topicId: "nibbles", correct: 30, durationMs: 60_000 }),
      run({
        topicId: "twos",
        modeId: "twos:sprint",
        correct: 10,
        durationMs: 60_000,
        accuracy: 0.5,
      }),
    ]);
    expect(rows[0].topicId).toBe("twos");
    expect(rows[0].secondsPerAnswer).toBeCloseTo(6);
    expect(rows[0].accuracy).toBeCloseTo(0.5);
    expect(rows[0].practiceModeId).toBe("twos:practice");
  });
});

describe("paceTrend / bests", () => {
  it("skips practice and quit runs", () => {
    const pts = paceTrend([
      run({ correct: 30 }),
      run({ format: "practice", modeId: "nibbles:practice" }),
      run({ completed: false }),
    ]);
    expect(pts).toHaveLength(1);
    expect(pts[0].value).toBe(30);
  });
  it("lists catalog bests and summarizes dailies", () => {
    const best = { score: 1, correct: 1, durationMs: 1, accuracy: 1, endedAt: 1 };
    const bests = {
      survival: best,
      "nibbles__speedrun": best,
      "nibbles__sprint": best,
      "daily__2026-10-08": { ...best, score: 40_000 },
      "daily__2026-10-09": { ...best, score: 30_000 },
      custom: best,
    };
    expect(bestsList(bests).map((r) => r.modeId)).toEqual([
      "nibbles:sprint",
      "nibbles:speedrun",
      "survival",
    ]);
    expect(dailySummary(bests)).toEqual({
      played: 2,
      bestMs: 30_000,
      bestModeId: "daily:2026-10-09",
    });
  });
});
