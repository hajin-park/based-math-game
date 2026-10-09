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
    const points = perSecond * RULES_LIMITS.maxPointsPerCorrect;
    expect(dbRules).toContain(`* ${perSecond} / 1000 + ${perSecond}`);
    expect(dbRules).toContain(`* ${points} / 1000 + ${points}`);
    expect(dbRules).toContain(`* ${SCORE_LIMITS.minMsPerCorrect}`);
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
