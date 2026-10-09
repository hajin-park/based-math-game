/**
 * Pure derivations for the Stats and Profile pages. Everything is computed
 * from the run list and the `bests` map the data layer already returns, so a
 * page view costs one runs query + one stats document (no per-mode fan-out).
 */
import {
  FORMATS,
  TOPICS,
  getMode,
  getTopic,
  isTopicId,
  type Format,
  type GameMode,
  type TopicId,
} from "@/game";
import type { BestEntry, RunRecord } from "@/data/types";
import { modeIdFromBestsKey } from "@/data/limits";
import { localDayKey } from "@/lib/timeFormat";

const DAY_MS = 24 * 3600_000;

/* -------------------------------------------------------------------------- */
/*  Streak & activity                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Consecutive local days with at least one run, ending today (or yesterday,
 * so a streak isn't "lost" before the student has played today).
 */
export function dayStreak(
  runs: Pick<RunRecord, "endedAt">[],
  now: number = Date.now(),
): { current: number; playedToday: boolean } {
  const days = new Set(runs.map((r) => localDayKey(r.endedAt)));
  const playedToday = days.has(localDayKey(now));
  let cursor = playedToday ? now : now - DAY_MS;
  let current = 0;
  // Walk back day by day; noon avoids DST edge cases.
  const noon = new Date(cursor);
  noon.setHours(12, 0, 0, 0);
  cursor = noon.getTime();
  while (days.has(localDayKey(cursor))) {
    current += 1;
    cursor -= DAY_MS;
  }
  return { current, playedToday };
}

export interface DayBucket {
  key: string;
  /** Noon of that local day (ms). */
  at: number;
  runs: number;
  correct: number;
}

/** The last `days` local days, oldest first, with run and answer counts. */
export function activityByDay(
  runs: Pick<RunRecord, "endedAt" | "correct">[],
  days = 14,
  now: number = Date.now(),
): DayBucket[] {
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  const buckets: DayBucket[] = [];
  const index = new Map<string, DayBucket>();
  for (let i = days - 1; i >= 0; i--) {
    const at = today.getTime() - i * DAY_MS;
    const b = { key: localDayKey(at), at, runs: 0, correct: 0 };
    buckets.push(b);
    index.set(b.key, b);
  }
  for (const r of runs) {
    const b = index.get(localDayKey(r.endedAt));
    if (b) {
      b.runs += 1;
      b.correct += r.correct;
    }
  }
  return buckets;
}

/* -------------------------------------------------------------------------- */
/*  Per-topic accuracy and pace                                                */
/* -------------------------------------------------------------------------- */

export interface TopicRow {
  topicId: TopicId;
  name: string;
  example: string;
  runs: number;
  correct: number;
  /** Weighted accuracy over the topic's runs (0..1), null if no attempts. */
  accuracy: number | null;
  /** Seconds per correct answer (timed runs; practice only as a fallback). */
  secondsPerAnswer: number | null;
  /** Whether a practice mode exists to deep-link to. */
  practiceModeId: string | null;
}

/** Answers attempted in a run, estimated from correct count and accuracy. */
function attempted(run: Pick<RunRecord, "correct" | "accuracy" | "skipped">) {
  if (run.accuracy > 0) return run.correct / run.accuracy;
  return run.correct + run.skipped;
}

export function topicBreakdown(runs: RunRecord[]): TopicRow[] {
  const groups = new Map<TopicId, RunRecord[]>();
  for (const r of runs) {
    if (!isTopicId(r.topicId)) continue;
    const list = groups.get(r.topicId) ?? [];
    list.push(r);
    groups.set(r.topicId, list);
  }
  const rows: TopicRow[] = [];
  for (const [topicId, list] of groups) {
    const topic = getTopic(topicId);
    const correct = list.reduce((s, r) => s + r.correct, 0);
    const tries = list.reduce((s, r) => s + attempted(r), 0);
    const timed = list.filter((r) => r.format !== "practice");
    const paceRuns = (timed.length ? timed : list).filter(
      (r) => r.correct > 0 && r.durationMs > 0,
    );
    const paceCorrect = paceRuns.reduce((s, r) => s + r.correct, 0);
    const paceMs = paceRuns.reduce((s, r) => s + r.durationMs, 0);
    const practiceModeId =
      topicId !== "custom" && getMode(`${topicId}:practice`)
        ? `${topicId}:practice`
        : null;
    rows.push({
      topicId,
      name: topic.name,
      example: topic.example,
      runs: list.length,
      correct,
      accuracy: tries > 0 ? Math.min(1, correct / tries) : null,
      secondsPerAnswer: paceCorrect > 0 ? paceMs / paceCorrect / 1000 : null,
      practiceModeId,
    });
  }
  // Slowest first; topics without a pace last, in catalog order.
  const order = new Map(TOPICS.map((t, i) => [t.id, i]));
  return rows.sort((a, b) => {
    if (a.secondsPerAnswer === null && b.secondsPerAnswer === null)
      return (order.get(a.topicId) ?? 0) - (order.get(b.topicId) ?? 0);
    if (a.secondsPerAnswer === null) return 1;
    if (b.secondsPerAnswer === null) return -1;
    return b.secondsPerAnswer - a.secondsPerAnswer;
  });
}

/* -------------------------------------------------------------------------- */
/*  Pace trend                                                                 */
/* -------------------------------------------------------------------------- */

export interface PacePoint {
  endedAt: number;
  modeId: string;
  /** Correct answers per minute. */
  value: number;
}

/** Correct answers per minute for the last `n` timed runs, oldest first. */
export function paceTrend(runs: RunRecord[], n = 30): PacePoint[] {
  return runs
    .filter(
      (r) =>
        r.format !== "practice" && r.durationMs >= 5_000 && r.completed !== false,
    )
    .slice(0, n)
    .map((r) => ({
      endedAt: r.endedAt,
      modeId: r.modeId,
      value: (r.correct / r.durationMs) * 60_000,
    }))
    .reverse();
}

/* -------------------------------------------------------------------------- */
/*  Personal bests                                                             */
/* -------------------------------------------------------------------------- */

export interface BestRow {
  modeId: string;
  mode: GameMode;
  best: BestEntry;
}

const FORMAT_ORDER: Format[] = ["sprint", "speedrun", "practice", "survival"];

/**
 * Catalog personal bests (daily excluded; see `dailySummary`), in topic
 * order then format order.
 */
export function bestsList(bests: Record<string, BestEntry>): BestRow[] {
  const topicOrder = new Map(TOPICS.map((t, i) => [t.id, i]));
  const rows: BestRow[] = [];
  for (const [key, best] of Object.entries(bests)) {
    const modeId = modeIdFromBestsKey(key);
    if (modeId.startsWith("daily:")) continue;
    const mode = getMode(modeId);
    if (!mode) continue;
    rows.push({ modeId, mode, best });
  }
  return rows.sort((a, b) => {
    if (a.mode.format === "survival") return 1;
    if (b.mode.format === "survival") return -1;
    const t =
      (topicOrder.get(a.mode.topicId) ?? 0) -
      (topicOrder.get(b.mode.topicId) ?? 0);
    if (t) return t;
    return (
      FORMAT_ORDER.indexOf(a.mode.format) - FORMAT_ORDER.indexOf(b.mode.format)
    );
  });
}

/** Number of daily challenges finished and the fastest daily time (ms). */
export function dailySummary(bests: Record<string, BestEntry>): {
  played: number;
  bestMs: number | null;
  bestModeId: string | null;
} {
  let played = 0;
  let bestMs: number | null = null;
  let bestModeId: string | null = null;
  for (const [key, best] of Object.entries(bests)) {
    const modeId = modeIdFromBestsKey(key);
    if (!modeId.startsWith("daily:")) continue;
    played += 1;
    if (bestMs === null || best.score < bestMs) {
      bestMs = best.score;
      bestModeId = modeId;
    }
  }
  return { played, bestMs, bestModeId };
}

/** Display name for any stored mode id, including custom runs. */
export function modeLabel(modeId: string, format?: Format): string {
  const mode = getMode(modeId);
  if (mode) return mode.name;
  if (modeId === "custom" && format) return `Custom · ${FORMATS[format].name}`;
  return modeId;
}
