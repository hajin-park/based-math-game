/**
 * Device-local storage for guests (anonymous users).
 *
 * Guests never write runs/stats/settings to Firestore; instead the last
 * GUEST_RUN_LIMIT runs and their settings live in localStorage so they still
 * see history and personal bests. When a guest upgrades their account (same
 * uid via linkWithCredential/linkWithPopup) the runs are imported into
 * Firestore and cleared here.
 */
import type { GameSettings, RunRecord, UserStatsDoc } from "./types";
import { DEFAULT_GAME_SETTINGS } from "./types";
import { applyRunToStats, emptyStats } from "./stats";

export const GUEST_RUN_LIMIT = 50;
const RUNS_KEY = "bmg.guestRuns.v1";
const SETTINGS_KEY = "bmg.gameSettings.v1";
export const LOCAL_CHANGE_EVENT = "bmg:local-data";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or disabled (private mode); guest data is best-effort.
  }
  try {
    window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
  } catch {
    // Non-browser environment.
  }
}

/** Guest runs, newest first. */
export function getLocalRuns(): RunRecord[] {
  const runs = read<RunRecord[]>(RUNS_KEY, []);
  return Array.isArray(runs) ? runs : [];
}

export function addLocalRun(run: RunRecord) {
  const runs = [run, ...getLocalRuns().filter((r) => r.id !== run.id)];
  runs.sort((a, b) => b.endedAt - a.endedAt);
  write(RUNS_KEY, runs.slice(0, GUEST_RUN_LIMIT));
}

export function clearLocalRuns() {
  write(RUNS_KEY, null);
}

export function getLocalSettings(): GameSettings {
  return {
    ...DEFAULT_GAME_SETTINGS,
    ...read<Partial<GameSettings>>(SETTINGS_KEY, {}),
  };
}

export function setLocalSettings(settings: GameSettings) {
  write(SETTINGS_KEY, settings);
}

export function clearLocalSettings() {
  write(SETTINGS_KEY, null);
}

/** Aggregate stats for guests, computed from the local run list. */
export function computeLocalStats(runs: RunRecord[]): UserStatsDoc {
  let stats = emptyStats();
  // Oldest first so ties keep the earliest best.
  for (const run of [...runs].reverse()) {
    stats = applyRunToStats(stats, run).stats;
  }
  return stats;
}
