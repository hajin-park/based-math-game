import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DAILY_QUESTION_COUNT,
  DAILY_SKIP_PENALTY_MS,
  SPEEDRUN_SKIP_PENALTY_MS,
  SPEEDRUN_TARGET,
  SPRINT_DURATION_MS,
  dailyModeFor,
  getFormat,
  isRankedModeId,
  listModes,
} from "@/game";
import {
  RANKED_MODE_RE,
  RULES_LIMITS,
  SCORE_LIMITS,
  bestsKey,
  dailyLockExpiresMs,
  dailyStartMs,
  isDailyClosed,
  isDailyOpen,
  leaderboardRejection,
  modeIdFromBestsKey,
  scoreOrderFor,
} from "./limits";

const root = process.cwd();
const firestoreRules = readFileSync(path.join(root, "firestore.rules"), "utf8");
const dbRules = readFileSync(path.join(root, "database.rules.json"), "utf8");

/** Reads `function name() { return N; }` from firestore.rules. */
function ruleConst(name: string): number {
  const m = new RegExp(`function ${name}\\(\\)\\s*\\{\\s*return (\\d+);`).exec(
    firestoreRules,
  );
  if (!m) throw new Error(`firestore.rules has no ${name}()`);
  return Number(m[1]);
}

describe("ranked mode ids", () => {
  const ids = [
    ...listModes().map((m) => m.id),
    dailyModeFor("2026-10-09").id,
    "custom",
    "nibbles:practice",
    "made-up:sprint",
    "daily:today",
  ];

  it("RANKED_MODE_RE (mirrored in firestore.rules) agrees with the engine", () => {
    for (const id of ids) {
      expect(RANKED_MODE_RE.test(id), id).toBe(isRankedModeId(id));
    }
  });

  it("firestore.rules uses the same pattern", () => {
    const source = RANKED_MODE_RE.source.replace(/\\\//g, "/");
    expect(firestoreRules).toContain(`modeId.matches('${source}')`);
  });

  it("score order follows the format spec", () => {
    for (const mode of listModes()) {
      expect(scoreOrderFor(mode.id), mode.id).toBe(
        getFormat(mode.format).scoreOrder,
      );
    }
    expect(scoreOrderFor("daily:2026-10-09")).toBe("lower-better");
  });

  it("bests keys round-trip", () => {
    for (const id of ids) expect(modeIdFromBestsKey(bestsKey(id))).toBe(id);
  });
});

describe("rules stay in sync with the engine limits", () => {
  it("firestore.rules constants", () => {
    expect(ruleConst("maxCorrectPerSecond")).toBe(
      SCORE_LIMITS.maxCorrectPerSecond,
    );
    expect(ruleConst("minMsPerCorrect")).toBe(SCORE_LIMITS.minMsPerCorrect);
    expect(ruleConst("maxDurationMs")).toBe(SCORE_LIMITS.maxDurationMs);
    expect(ruleConst("sprintMaxCorrect")).toBe(SCORE_LIMITS.sprintMaxCorrect);
    expect(ruleConst("speedrunMinMs")).toBe(SCORE_LIMITS.speedrunMinMs);
    expect(ruleConst("dailyMinMs")).toBe(SCORE_LIMITS.dailyMinMs);
    expect(ruleConst("survivalMaxCleared")).toBe(
      SCORE_LIMITS.survivalMaxCleared,
    );
    expect(ruleConst("sprintMs")).toBe(SPRINT_DURATION_MS);
    expect(ruleConst("sprintToleranceMs")).toBe(RULES_LIMITS.sprintToleranceMs);
    expect(ruleConst("speedrunTarget")).toBe(SPEEDRUN_TARGET);
    expect(ruleConst("speedrunSkipMs")).toBe(SPEEDRUN_SKIP_PENALTY_MS);
    expect(ruleConst("dailyQuestions")).toBe(DAILY_QUESTION_COUNT);
    expect(ruleConst("dailySkipMs")).toBe(DAILY_SKIP_PENALTY_MS);
    expect(ruleConst("maxCount")).toBe(RULES_LIMITS.maxCorrect);
  });

  it("database.rules.json multiplayer bounds", () => {
    const perSecond = SCORE_LIMITS.maxCorrectPerSecond;
    // Counters are bounded by play time (the 3 s countdown excluded).
    expect(dbRules).toContain(
      `- 3000) * ${perSecond} / 1000 + ${perSecond}`,
    );
    // One point per correct answer in every room format.
    expect(dbRules).toContain(
      "newData.val() === newData.parent().child('correct').val()",
    );
    expect(dbRules).toContain(`* ${SCORE_LIMITS.minMsPerCorrect}`);
    expect(dbRules).toContain(`: ${SPEEDRUN_TARGET})`);
  });

  it("daily grace period matches firestore.rules", () => {
    const minutes = RULES_LIMITS.dailyGraceMs / 60_000;
    expect(firestoreRules).toContain(`duration.value(${minutes}, 'm')`);
  });
});

describe("daily window (UTC day + grace)", () => {
  const id = "daily:2026-10-09";
  const start = Date.UTC(2026, 9, 9);
  const DAY = 24 * 60 * 60 * 1000;

  it("parses only real dates", () => {
    expect(dailyStartMs(id)).toBe(start);
    expect(dailyStartMs("daily:2026-02-31")).toBeNull();
    expect(dailyStartMs("daily:0000-99-99")).toBeNull();
    expect(dailyStartMs("daily:today")).toBeNull();
    expect(dailyStartMs("survival")).toBeNull();
    expect(dailyLockExpiresMs(id)).toBe(start + 2 * DAY);
  });

  it("is open from UTC midnight until the grace period after the next", () => {
    expect(isDailyOpen(id, start - 1)).toBe(false);
    expect(isDailyOpen(id, start)).toBe(true);
    expect(isDailyOpen(id, start + DAY + RULES_LIMITS.dailyGraceMs - 1)).toBe(
      true,
    );
    expect(isDailyOpen(id, start + DAY + RULES_LIMITS.dailyGraceMs)).toBe(
      false,
    );
    expect(isDailyClosed(id, start + DAY)).toBe(false);
    expect(isDailyClosed(id, start + DAY + RULES_LIMITS.dailyGraceMs)).toBe(
      true,
    );
  });
});

describe("leaderboardRejection mirrors the rules", () => {
  const base = { accuracy: 1, completed: true, skipped: 0 };

  it("accepts plausible results", () => {
    expect(
      leaderboardRejection({
        ...base,
        modeId: "bytes-hex:sprint",
        score: 40,
        correct: 40,
        durationMs: 60_000,
      }),
    ).toBeNull();
    expect(
      leaderboardRejection({
        ...base,
        modeId: "nibbles:speedrun",
        score: 35_000,
        correct: 15,
        skipped: 1,
        durationMs: 30_000,
      }),
    ).toBeNull();
    expect(
      leaderboardRejection({
        ...base,
        modeId: "survival",
        score: 30,
        correct: 30,
        durationMs: 90_000,
      }),
    ).toBeNull();
    expect(
      leaderboardRejection(
        {
          ...base,
          modeId: "daily:2026-10-09",
          score: 40_000,
          correct: 8,
          skipped: 2,
          durationMs: 20_000,
        },
        Date.UTC(2026, 9, 9, 12),
      ),
    ).toBeNull();
  });

  it("daily: all ten questions, today's challenge only", () => {
    const daily = {
      ...base,
      modeId: "daily:2026-10-09",
      score: 20_000,
      correct: 10,
      durationMs: 20_000,
    };
    const noon = Date.UTC(2026, 9, 9, 12);
    expect(leaderboardRejection(daily, noon)).toBeNull();
    // Just after midnight: still counts (grace).
    expect(leaderboardRejection(daily, Date.UTC(2026, 9, 10, 0, 5))).toBeNull();
    expect(
      leaderboardRejection(daily, Date.UTC(2026, 9, 10, 0, 11)),
    ).not.toBeNull();
    expect(leaderboardRejection(daily, Date.UTC(2026, 9, 8, 23))).not.toBeNull();
    expect(
      leaderboardRejection(
        { ...daily, correct: 0, durationMs: 2_500, score: 2_500 },
        noon,
      ),
    ).not.toBeNull();
    expect(
      leaderboardRejection({ ...daily, correct: 9 }, noon),
    ).not.toBeNull();
  });

  it("rejects incomplete, unranked and implausible results", () => {
    const sprint = {
      ...base,
      modeId: "bytes-hex:sprint",
      score: 40,
      correct: 40,
      durationMs: 60_000,
    };
    expect(
      leaderboardRejection({ ...sprint, completed: false }),
    ).not.toBeNull();
    expect(
      leaderboardRejection({ ...sprint, modeId: "custom" }),
    ).not.toBeNull();
    expect(
      leaderboardRejection({ ...sprint, score: 200, correct: 200 }),
    ).not.toBeNull();
    expect(
      leaderboardRejection({
        ...base,
        modeId: "nibbles:speedrun",
        score: 30_000,
        correct: 14,
        durationMs: 30_000,
      }),
    ).not.toBeNull();
  });
});
