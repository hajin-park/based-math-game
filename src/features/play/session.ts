/**
 * Per-device conveniences for the play flow: the last mode played (Enter to
 * replay on the hub), the results hand-off between the run screen and
 * /results, and a save-once guard so a finished run is persisted exactly once
 * (StrictMode double effects, reloads of /results).
 */
import { saveRun, type BestEntry, type SaveRunResult } from "@/data";
import type { CustomConfig, RunSummary } from "@/game";

const LAST_KEY = "bmg.lastMode.v1";
const SAVED_KEY = "bmg.savedRuns.v1";

export interface LastMode {
  modeId: string;
  custom?: CustomConfig;
  at: number;
}

export function getLastMode(): LastMode | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastMode;
    return typeof parsed?.modeId === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function setLastMode(modeId: string, custom?: CustomConfig) {
  // Daily is one attempt a day; replaying "last mode" should not point there.
  if (modeId.startsWith("daily:")) return;
  try {
    localStorage.setItem(
      LAST_KEY,
      JSON.stringify({ modeId, custom, at: Date.now() } satisfies LastMode),
    );
  } catch {
    // Storage disabled: Enter-to-replay just falls back to the recommendation.
  }
}

/** What the run screen hands to /results through router state. */
export interface ResultsState {
  summary: RunSummary;
  /** Custom config for "Play again" on custom drills. */
  custom?: CustomConfig;
  /** Personal best for this mode before the run (null: first run). */
  previousBest: BestEntry | null;
}

export function isResultsState(value: unknown): value is ResultsState {
  const v = value as ResultsState | null;
  return (
    !!v &&
    typeof v === "object" &&
    !!v.summary &&
    typeof v.summary.modeId === "string" &&
    Array.isArray(v.summary.outcomes)
  );
}

/** Stable key of a finished run. */
export function runKey(summary: RunSummary): string {
  return `${summary.modeId}|${summary.seed}|${summary.endedAt}`;
}

const inflight = new Map<string, Promise<SaveRunResult>>();
const completed = new Map<string, SaveRunResult>();

function readSaved(): Record<string, SaveRunResult> {
  try {
    return JSON.parse(sessionStorage.getItem(SAVED_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeSaved(key: string, result: SaveRunResult) {
  try {
    const all = readSaved();
    all[key] = result;
    // Keep the last 20 entries.
    const keys = Object.keys(all);
    for (const k of keys.slice(0, Math.max(0, keys.length - 20))) delete all[k];
    sessionStorage.setItem(SAVED_KEY, JSON.stringify(all));
  } catch {
    // Best effort.
  }
}

/**
 * Persist a run exactly once. Concurrent and repeated calls for the same run
 * share one promise; after success the result is remembered for this tab
 * session, so reloading /results never saves twice. A failed save can be
 * retried by calling again.
 */
export function saveRunOnce(summary: RunSummary): Promise<SaveRunResult> {
  const key = runKey(summary);
  const done = completed.get(key) ?? readSaved()[key];
  if (done) return Promise.resolve(done);
  const pending = inflight.get(key);
  if (pending) return pending;
  const promise = saveRun(summary)
    .then((result) => {
      completed.set(key, result);
      writeSaved(key, result);
      return result;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}
