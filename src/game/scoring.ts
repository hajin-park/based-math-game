/**
 * Run summaries, score comparison/formatting, and the plausibility bounds the
 * backend mirrors in its security rules.
 */
import {
  DAILY_QUESTION_COUNT,
  SPEEDRUN_TARGET,
  SPRINT_DURATION_MS,
} from "./formats";
import type {
  FormatSpec,
  GameMode,
  QuestionOutcome,
  RunSummary,
} from "./types";

/**
 * Human-performance ceilings used to reject impossible scores.
 *
 * - maxCorrectPerSecond (3): no one sustains more than 3 correct answers per
 *   second over a run (each answer means reading a prompt and typing 1 to 16
 *   characters). Bounds sprint and survival scores against run duration.
 * - minMsPerCorrect (250): no single correct answer takes under 250 ms from
 *   the question appearing. Bounds speedrun/daily times from below.
 *
 * Derived per-format bounds (mirror these in Firestore rules):
 * - sprint:   score (correct) <= 180               (60 s × 3/s)
 * - speedrun: score (ms)      >= 3 750             (15 × 250 ms)
 * - daily:    score (ms)      >= 2 500             (10 × 250 ms)
 * - survival: score (cleared) <= durationMs × 3 / 1000, and <= 1 000
 * - any run:  durationMs      <= 3 600 000 (1 h)
 */
export const SCORE_LIMITS = {
  maxCorrectPerSecond: 3,
  minMsPerCorrect: 250,
  sprintMaxCorrect: (SPRINT_DURATION_MS / 1000) * 3,
  speedrunMinMs: SPEEDRUN_TARGET * 250,
  dailyMinMs: DAILY_QUESTION_COUNT * 250,
  survivalMaxCleared: 1000,
  maxDurationMs: 3_600_000,
} as const;

export interface SummarizeInput {
  mode: GameMode;
  seed: number;
  outcomes: QuestionOutcome[];
  /** Active run time in ms (pauses excluded). */
  durationMs: number;
  completed: boolean;
  /** Wall-clock end time (ms since epoch); defaults to Date.now(). */
  endedAt?: number;
}

/**
 * Leaderboard score by format:
 *  - sprint, practice: correct answers
 *  - survival:         questions cleared (correct answers)
 *  - speedrun, daily:  durationMs + skipped × spec.skipPenaltyMs (lower is better)
 */
export function computeScore(
  spec: FormatSpec,
  durationMs: number,
  correct: number,
  skipped: number,
): number {
  switch (spec.scoreUnit) {
    case "ms":
      return Math.round(durationMs + skipped * (spec.skipPenaltyMs ?? 0));
    default:
      return correct;
  }
}

export function summarizeRun(input: SummarizeInput): RunSummary {
  const { mode, outcomes } = input;
  let correct = 0;
  let skipped = 0;
  let timeouts = 0;
  let keystrokes = 0;
  let deletions = 0;
  for (const o of outcomes) {
    if (o.result === "correct") correct++;
    else if (o.result === "skipped") skipped++;
    else timeouts++;
    keystrokes += o.keystrokes;
    deletions += o.deletions;
  }
  const attempted = correct + skipped + timeouts;
  const durationMs = Math.max(0, Math.round(input.durationMs));
  return {
    modeId: mode.id,
    topicId: mode.topicId,
    format: mode.format,
    score: computeScore(mode.spec, durationMs, correct, skipped),
    correct,
    skipped,
    durationMs,
    accuracy: attempted ? correct / attempted : 0,
    typingAccuracy: keystrokes
      ? Math.max(0, keystrokes - deletions) / keystrokes
      : 1,
    outcomes,
    seed: input.seed >>> 0,
    endedAt: input.endedAt ?? Date.now(),
    completed: input.completed,
  };
}

/** Negative when `a` is the better score, positive when `b` is, 0 when tied. Sorts best first. */
export function compareScores(
  spec: Pick<FormatSpec, "scoreOrder">,
  a: number,
  b: number,
): number {
  return spec.scoreOrder === "higher-better" ? b - a : a - b;
}

/** True when `a` beats `b`. */
export function isBetterScore(
  spec: Pick<FormatSpec, "scoreOrder">,
  a: number,
  b: number,
): boolean {
  return compareScores(spec, a, b) < 0;
}

/** "42 correct", "38.42 s", "17 cleared". */
export function formatScore(
  spec: Pick<FormatSpec, "scoreUnit">,
  score: number,
): string {
  switch (spec.scoreUnit) {
    case "ms":
      return `${(score / 1000).toFixed(2)} s`;
    case "cleared":
      return `${score} cleared`;
    default:
      return `${score} correct`;
  }
}

/** Format a duration as seconds with two decimals ("38.42 s"). */
export function formatMs(ms: number): string {
  return `${(Math.max(0, ms) / 1000).toFixed(2)} s`;
}

/**
 * Client-side mirror of the backend plausibility checks. Returns a list of
 * problems (empty when the summary is plausible and leaderboard-eligible).
 */
export function validateSummary(
  summary: RunSummary,
  spec: FormatSpec,
): string[] {
  const problems: string[] = [];
  const L = SCORE_LIMITS;
  if (!summary.completed) problems.push("run not completed");
  if (!spec.ranked) problems.push("format not ranked");
  if (summary.durationMs <= 0 || summary.durationMs > L.maxDurationMs)
    problems.push("duration out of range");
  if (
    summary.correct > 0 &&
    summary.durationMs < summary.correct * L.minMsPerCorrect
  ) {
    problems.push("answers faster than minMsPerCorrect");
  }
  if (
    summary.correct >
    Math.floor((summary.durationMs / 1000) * L.maxCorrectPerSecond) + 1
  ) {
    problems.push("more than maxCorrectPerSecond");
  }
  switch (spec.format) {
    case "sprint":
      if (summary.score > L.sprintMaxCorrect)
        problems.push("sprint score too high");
      if (spec.durationMs && summary.durationMs > spec.durationMs + 1000)
        problems.push("sprint ran too long");
      break;
    case "speedrun":
      if (summary.score < L.speedrunMinMs)
        problems.push("speedrun time too low");
      if (summary.correct < (spec.targetCount ?? SPEEDRUN_TARGET))
        problems.push("speedrun target not reached");
      break;
    case "daily":
      if (summary.score < L.dailyMinMs) problems.push("daily time too low");
      if (
        summary.outcomes.length !== (spec.targetCount ?? DAILY_QUESTION_COUNT)
      )
        problems.push("daily question count");
      break;
    case "survival":
      if (summary.score > L.survivalMaxCleared)
        problems.push("survival score too high");
      break;
  }
  return problems;
}
