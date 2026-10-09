/**
 * Data-layer types (Firestore documents and hook results).
 *
 * `RunSummaryInput` is the subset of the engine's `RunSummary` that gets
 * persisted; any `RunSummary` can be passed where it is expected.
 */
import type { Format } from "@/game";

export type RunFormat = Format;

/** Structural form of the engine's `CustomConfig` (stored in rooms). */
export interface CustomConfigLike {
  conversions: Array<{ from: number; to: number; min: number; max: number }>;
  kinds?: string[];
  durationMs?: number;
  targetCount?: number;
}

/** Fields of the engine's `RunSummary` that get persisted. */
export interface RunSummaryInput {
  modeId: string;
  topicId: string;
  format: RunFormat;
  score: number;
  correct: number;
  skipped: number;
  durationMs: number;
  accuracy: number;
  typingAccuracy: number;
  endedAt: number;
  /** False when the run was quit early (never leaderboard-eligible). */
  completed?: boolean;
}

/** `users/{uid}/runs/{runId}` (and guest localStorage entries). */
export interface RunRecord extends RunSummaryInput {
  id: string;
}

/** Value stored per mode in `userStats/{uid}.bests`. */
export interface BestEntry {
  score: number;
  correct: number;
  durationMs: number;
  accuracy: number;
  endedAt: number;
}

/** `userStats/{uid}`. `bests` is keyed by `bestsKey(modeId)` (':' -> '__'). */
export interface UserStatsDoc {
  gamesPlayed: number;
  totalCorrect: number;
  totalDurationMs: number;
  lastPlayedAt: number;
  bests: Record<string, BestEntry>;
}

/** `leaderboards/{modeId}/entries/{uid}` as returned to the UI. */
export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  score: number;
  correct: number;
  skipped: number;
  durationMs: number;
  accuracy: number;
  /** ms since epoch (server time of the last improvement). */
  updatedAt: number;
}

/** User-tunable gameplay settings stored in `users/{uid}.settings`. */
export interface GameSettings {
  groupedDigits: boolean;
  indexValueHints: boolean;
  countdownStart: boolean;
}

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  groupedDigits: false,
  indexValueHints: false,
  countdownStart: true,
};

export type LeaderboardWriteResult =
  | "updated"
  | "not-improved"
  | "skipped"
  | "rejected"
  | "error";

export interface SaveRunResult {
  /** Where the run was stored. */
  storedIn: "cloud" | "local";
  runId: string;
  /** True if this run beat the previous personal best for the mode. */
  personalBest: boolean;
  leaderboard: LeaderboardWriteResult;
}
