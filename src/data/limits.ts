/**
 * Score plausibility limits and ranked-mode helpers.
 *
 * IMPORTANT: these values are mirrored in `firestore.rules` (leaderboards,
 * runs) and `database.rules.json` (multiplayer player nodes). The security
 * rules are the source of truth; if you change a number here you MUST change
 * the rules too (and the rules tests in tests/rules), otherwise legitimate
 * writes will be rejected or the client will submit scores the server refuses.
 */

export const SCORE_LIMITS = {
  /** Max correct answers per second of play (rules: correct <= durationMs * 3 / 1000). */
  MAX_CORRECT_PER_SECOND: 3,
  /** Minimum milliseconds per correct answer in lower-is-better formats. */
  MIN_MS_PER_CORRECT: 250,
  /** Sprint runs must last SPRINT_DURATION_MS +/- SPRINT_TOLERANCE_MS to be ranked. */
  SPRINT_DURATION_MS: 60_000,
  SPRINT_TOLERANCE_MS: 2_000,
  /**
   * Speedrun / daily entries must have at least this many correct answers.
   * Catalog target counts must be >= this value. (Rules cannot know each mode's
   * exact target; if every mode shares one target, tighten the rule to equality.)
   */
  MIN_RANKED_TARGET: 10,
  /** Upper bound on any run duration (6 hours). */
  MAX_RUN_DURATION_MS: 6 * 60 * 60 * 1000,
  /** Upper bound on correct answers in a single run. */
  MAX_CORRECT: 10_000,
  /** Upper bound on score values (ms for speedruns, counts otherwise). */
  MAX_SCORE: 6 * 60 * 60 * 1000,
  /** Leaderboard display names: 1..24 characters (rules enforce the same). */
  DISPLAY_NAME_MAX: 24,
  /** Multiplayer: max points per correct answer (score <= correct * 5). */
  MAX_POINTS_PER_CORRECT: 5,
} as const;

/** Topics that have ranked catalog modes (`custom` is never ranked). */
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

/** Formats that can be ranked via `${topic}:${format}` ids. */
export const RANKED_FORMATS = ["sprint", "speedrun", "survival"] as const;

/**
 * Ranked mode ids. Must match `isRankedMode()` in firestore.rules:
 *   `${topic}:(sprint|speedrun|survival)` or `daily:YYYY-MM-DD`.
 */
export const RANKED_MODE_RE = new RegExp(
  `^((${RANKED_TOPICS.join("|")}):(${RANKED_FORMATS.join("|")})|daily:[0-9]{4}-[0-9]{2}-[0-9]{2})$`,
);

export type ScoreOrder = "higher-better" | "lower-better";

export function isRankedModeId(modeId: string): boolean {
  return RANKED_MODE_RE.test(modeId);
}

export function isDailyModeId(modeId: string): boolean {
  return modeId.startsWith("daily:");
}

/**
 * Leaderboard ordering for a mode id: `:speedrun` and `daily:` are
 * lower-is-better (time in ms), everything else higher-is-better.
 */
export function scoreOrderFor(modeId: string): ScoreOrder {
  return modeId.endsWith(":speedrun") || isDailyModeId(modeId)
    ? "lower-better"
    : "higher-better";
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
 * Client-side mirror of the leaderboard plausibility checks in firestore.rules.
 * Returns null when the entry would be accepted, or a reason string.
 */
export function leaderboardRejection(entry: {
  modeId: string;
  score: number;
  correct: number;
  durationMs: number;
  accuracy: number;
}): string | null {
  const { modeId, score, correct, durationMs, accuracy } = entry;
  if (!isRankedModeId(modeId)) return "mode is not ranked";
  if (![score, correct, durationMs, accuracy].every(Number.isFinite))
    return "non-numeric value";
  if (correct < 0 || correct > SCORE_LIMITS.MAX_CORRECT) return "bad correct";
  if (durationMs <= 0 || durationMs > SCORE_LIMITS.MAX_RUN_DURATION_MS)
    return "bad duration";
  if (score < 0 || score > SCORE_LIMITS.MAX_SCORE) return "bad score";
  if (accuracy < 0 || accuracy > 1) return "bad accuracy";
  if (correct * 1000 > durationMs * SCORE_LIMITS.MAX_CORRECT_PER_SECOND)
    return "too many correct answers per second";
  if (scoreOrderFor(modeId) === "lower-better") {
    if (correct < SCORE_LIMITS.MIN_RANKED_TARGET) return "target not reached";
    if (durationMs < SCORE_LIMITS.MIN_MS_PER_CORRECT * correct)
      return "too fast";
    if (score !== durationMs) return "score must equal duration";
  } else {
    if (score > correct) return "score exceeds correct answers";
    if (modeId.endsWith(":sprint")) {
      const d = Math.abs(durationMs - SCORE_LIMITS.SPRINT_DURATION_MS);
      if (d > SCORE_LIMITS.SPRINT_TOLERANCE_MS) return "bad sprint duration";
    }
  }
  return null;
}
