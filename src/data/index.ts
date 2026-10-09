/**
 * Persistent data layer (Firestore + guest localStorage).
 *
 * Firestore schema (see firestore.rules):
 *   users/{uid}                      profile + settings (owner, registered only)
 *   users/{uid}/runs/{runId}         run history (owner create/read, no updates)
 *   userStats/{uid}                  aggregates + bests per mode (owner)
 *   leaderboards/{modeId}/entries/{uid}  public read, owner write when improved
 */
export * from "./types";
export * from "./limits";
export { saveRun, importLocalRuns } from "./runs";
export {
  fetchLeaderboard,
  fetchRank,
  submitLeaderboardEntry,
} from "./leaderboard";
export {
  useRunHistory,
  useUserStats,
  usePersonalBest,
  useLeaderboard,
  useGameSettings,
} from "./hooks";
export type { RunHistoryOptions, LeaderboardOptions } from "./hooks";
export { getLocalRuns, GUEST_RUN_LIMIT } from "./localStore";
