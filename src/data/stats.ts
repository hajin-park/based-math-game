import type { BestEntry, RunSummaryInput, UserStatsDoc } from "./types";
import {
  bestsKey,
  isImprovement,
  scoreOrderFor,
  type ScoreOrder,
} from "./limits";

/** Speedrun and daily runs are timed (lower is better); everything else counts up. */
export function orderForRun(
  run: Pick<RunSummaryInput, "modeId" | "format">,
): ScoreOrder {
  if (run.format === "speedrun" || run.format === "daily")
    return "lower-better";
  return scoreOrderFor(run.modeId);
}

export function emptyStats(): UserStatsDoc {
  return {
    gamesPlayed: 0,
    totalCorrect: 0,
    totalDurationMs: 0,
    lastPlayedAt: 0,
    bests: {},
  };
}

export function bestFromRun(run: RunSummaryInput): BestEntry {
  return {
    score: run.score,
    correct: run.correct,
    durationMs: run.durationMs,
    accuracy: run.accuracy,
    endedAt: run.endedAt,
  };
}

/** Folds one run into the aggregate. Pure; used by saveRun and guest import. */
export function applyRunToStats(
  prev: UserStatsDoc,
  run: RunSummaryInput,
): { stats: UserStatsDoc; personalBest: boolean } {
  const key = bestsKey(run.modeId);
  const prevBest = prev.bests?.[key];
  const personalBest = isImprovement(
    orderForRun(run),
    run.score,
    prevBest?.score,
  );
  const stats: UserStatsDoc = {
    gamesPlayed: (prev.gamesPlayed || 0) + 1,
    totalCorrect: (prev.totalCorrect || 0) + run.correct,
    totalDurationMs: (prev.totalDurationMs || 0) + run.durationMs,
    lastPlayedAt: Math.max(prev.lastPlayedAt || 0, run.endedAt),
    bests: { ...(prev.bests || {}) },
  };
  if (personalBest) stats.bests[key] = bestFromRun(run);
  return { stats, personalBest };
}

/** Rounds/clamps engine output into the shape the security rules accept. */
export function sanitizeRun(summary: RunSummaryInput): RunSummaryInput {
  const int = (n: number) =>
    Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
  const unit = (n: number) =>
    Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
  return {
    modeId: String(summary.modeId).slice(0, 64),
    topicId: String(summary.topicId).slice(0, 32),
    format: summary.format,
    score: int(summary.score),
    correct: int(summary.correct),
    skipped: int(summary.skipped),
    durationMs: int(summary.durationMs),
    accuracy: unit(summary.accuracy),
    typingAccuracy: unit(summary.typingAccuracy),
    endedAt: int(summary.endedAt) || Date.now(),
  };
}
