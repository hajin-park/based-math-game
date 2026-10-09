/**
 * Score plausibility limits and ranked-mode helpers for the data layer.
 *
 * IMPORTANT: the numbers here are mirrored in `firestore.rules` (leaderboards,
 * runs) and `database.rules.json` / scripts/build-database-rules.mjs
 * (multiplayer player nodes). The security rules are what is enforced; if you
 * change a limit here or in the engine (src/game/scoring.ts, formats.ts) you
 * MUST update the rules too. src/data/limits.test.ts fails when they drift.
 */
import {
  DAILY_QUESTION_COUNT,
  DAILY_SKIP_PENALTY_MS,
  SCORE_LIMITS,
  SPEEDRUN_SKIP_PENALTY_MS,
  SPEEDRUN_TARGET,
  SPRINT_DURATION_MS,
  getFormat,
  isRankedModeId,
  parseModeId,
} from "@/game";

export { SCORE_LIMITS, isRankedModeId };

/** Extra limits that only exist in the backend rules. */
export const RULES_LIMITS = {
  /** Ranked sprints must last SPRINT_DURATION_MS +/- this. */
  sprintToleranceMs: 2_000,
  /** Leaderboard / room display names: 1..24 characters. */
  displayNameMax: 24,
  /** Upper bound on correct/skipped counts in a stored run. */
  maxCorrect: 10_000,
  /** Multiplayer: max points per correct answer (score <= 15/s). */
  maxPointsPerCorrect: 5,
} as const;

/** Topics with ranked `${topic}:sprint|speedrun` modes. */
export const RANKED_TOPICS = [
  "nibbles",
  "powers",
  "bytes-bin",
  "bytes-hex",
  "octal",
  "words",
  "twos",
  "bitwise",
  "binary-add",
  "applied",
  "mixed",
] as const;

/**
 * Mirror of `isRankedMode()` in firestore.rules. The engine's
 * `isRankedModeId` is the source of truth; a unit test checks they agree.
 */
export const RANKED_MODE_RE = new RegExp(
  `^((${RANKED_TOPICS.join("|")}):(sprint|speedrun)|survival|daily:[0-9]{4}-[0-9]{2}-[0-9]{2})$`,
);

export type ScoreOrder = "higher-better" | "lower-better";

export function isDailyModeId(modeId: string): boolean {
  return modeId.startsWith("daily:");
}

/** Leaderboard ordering for a mode id (speedrun/daily: lower is better). */
export function scoreOrderFor(modeId: string): ScoreOrder {
  const parsed = parseModeId(modeId);
  return parsed ? getFormat(parsed.format).scoreOrder : "higher-better";
}

/** True when `candidate` beats `previous` under the given ordering. */
export function isImprovement(
  order: ScoreOrder,
  candidate: number,
  previous: number | null | undefined,
): boolean {
  if (previous === null || previous === undefined) return true;
  return order === "lower-better" ? candidate < previous : candidate > previous;
}

/**
 * Firestore map keys cannot contain ':' without quoting in field paths, so the
 * `bests` map in userStats uses '__' instead.
 */
export function bestsKey(modeId: string): string {
  return modeId.replace(/:/g, "__");
}

export function modeIdFromBestsKey(key: string): string {
  return key.replace(/__/g, ":");
}

/**
 * Client-side mirror of `validEntry()` in firestore.rules. Returns null when
 * the leaderboard write would be accepted, otherwise the reason.
 */
export function leaderboardRejection(entry: {
  modeId: string;
  score: number;
  correct: number;
  skipped: number;
  durationMs: number;
  accuracy: number;
  completed?: boolean;
}): string | null {
  const { modeId, score, correct, skipped, durationMs, accuracy } = entry;
  const L = SCORE_LIMITS;
  const parsed = parseModeId(modeId);
  if (!parsed || !isRankedModeId(modeId)) return "mode is not ranked";
  if (entry.completed !== true) return "run not completed";
  const nums = [score, correct, skipped, durationMs, accuracy];
  if (!nums.every(Number.isFinite)) return "non-numeric value";
  if (correct < 0 || skipped < 0 || correct > RULES_LIMITS.maxCorrect)
    return "bad counts";
  if (durationMs <= 0 || durationMs > L.maxDurationMs) return "bad duration";
  if (accuracy < 0 || accuracy > 1) return "bad accuracy";
  if (correct * 1000 > durationMs * L.maxCorrectPerSecond + 1000)
    return "too many correct answers per second";
  if (durationMs < correct * L.minMsPerCorrect) return "answers too fast";
  switch (parsed.format) {
    case "sprint": {
      if (score !== correct || score > L.sprintMaxCorrect) return "bad score";
      const off = Math.abs(durationMs - SPRINT_DURATION_MS);
      if (off > RULES_LIMITS.sprintToleranceMs) return "bad sprint duration";
      return null;
    }
    case "speedrun":
      if (correct !== SPEEDRUN_TARGET) return "target not reached";
      if (score !== durationMs + skipped * SPEEDRUN_SKIP_PENALTY_MS)
        return "bad score";
      if (score < L.speedrunMinMs) return "too fast";
      return null;
    case "daily":
      if (correct + skipped > DAILY_QUESTION_COUNT) return "bad counts";
      if (score !== durationMs + skipped * DAILY_SKIP_PENALTY_MS)
        return "bad score";
      if (score < L.dailyMinMs) return "too fast";
      return null;
    case "survival":
      if (score !== correct || score > L.survivalMaxCleared) return "bad score";
      return null;
    default:
      return "mode is not ranked";
  }
}
