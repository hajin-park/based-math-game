import {
  collection,
  doc,
  runTransaction,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { auth } from "@/firebase/app";
import { firestore } from "@/firebase/firestore";
import { isDailyModeId, isRankedModeId } from "./limits";
import { submitLeaderboardEntry } from "./leaderboard";
import {
  addLocalRun,
  clearLocalRuns,
  computeLocalStats,
  getLocalRuns,
} from "./localStore";
import { applyRunToStats, emptyStats, orderForRun, sanitizeRun } from "./stats";
import { isImprovement } from "./limits";
import type {
  RunRecord,
  RunSummaryInput,
  SaveRunResult,
  UserStatsDoc,
} from "./types";

export function runsCollection(uid: string) {
  return collection(firestore, "users", uid, "runs");
}

export function statsRef(uid: string) {
  return doc(firestore, "userStats", uid);
}

function newLocalId(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return (
    "local_" +
    Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  );
}

/**
 * Persists a finished run.
 *
 * - Registered users: the run document and the `userStats` aggregate are
 *   written in one transaction; then, if the mode is ranked and the score
 *   beats the user's entry, the leaderboard entry is upserted (separately, so
 *   a rejected leaderboard write never loses the run).
 * - Guests (anonymous or not signed in): stored in localStorage (last 50).
 *
 * Accepts the engine's `RunSummary` directly (extra fields are ignored).
 */
export async function saveRun(
  summary: RunSummaryInput,
): Promise<SaveRunResult> {
  const run = sanitizeRun(summary);
  const user = auth.currentUser;

  if (!user || user.isAnonymous) {
    const before = computeLocalStats(getLocalRuns());
    const { personalBest } = applyRunToStats(before, run);
    const id = newLocalId();
    addLocalRun({ ...run, id });
    return {
      storedIn: "local",
      runId: id,
      personalBest,
      leaderboard: "skipped",
    };
  }

  const runRef = doc(runsCollection(user.uid));
  const sRef = statsRef(user.uid);
  let personalBest = false;
  await runTransaction(firestore, async (tx) => {
    const snap = await tx.get(sRef);
    const prev = snap.exists() ? (snap.data() as UserStatsDoc) : emptyStats();
    const next = applyRunToStats(prev, run);
    personalBest = next.personalBest;
    tx.set(runRef, run);
    tx.set(sRef, next.stats);
  });

  const leaderboard = isRankedModeId(run.modeId)
    ? await submitLeaderboardEntry(user, run)
    : "skipped";

  return { storedIn: "cloud", runId: runRef.id, personalBest, leaderboard };
}

/**
 * After a guest upgrades (same uid, now non-anonymous), copy their local runs
 * into Firestore, fold them into the stats aggregate, submit their best
 * ranked results, and clear local storage. Best-effort: failures keep the
 * local copy so nothing is lost.
 */
export async function importLocalRuns(user: User): Promise<number> {
  if (user.isAnonymous) return 0;
  const local = getLocalRuns();
  if (local.length === 0) return 0;

  try {
    const sRef = statsRef(user.uid);
    const snap = await getDoc(sRef);
    let stats = snap.exists() ? (snap.data() as UserStatsDoc) : emptyStats();
    const batch = writeBatch(firestore);
    const oldestFirst = [...local].reverse();
    for (const record of oldestFirst) {
      const run = sanitizeRun(record);
      stats = applyRunToStats(stats, run).stats;
      batch.set(doc(runsCollection(user.uid)), run);
    }
    batch.set(sRef, stats);
    await batch.commit();
    clearLocalRuns();

    // Best ranked run per mode -> leaderboard (improvement checked inside).
    // A daily counts its first attempt only (one ranked try per day).
    const bestPerMode = new Map<string, RunRecord>();
    for (const r of oldestFirst) {
      if (!isRankedModeId(r.modeId)) continue;
      const cur = bestPerMode.get(r.modeId);
      if (cur && isDailyModeId(r.modeId)) continue;
      if (!cur || isImprovement(orderForRun(r), r.score, cur.score)) {
        bestPerMode.set(r.modeId, r);
      }
    }
    for (const r of bestPerMode.values()) {
      await submitLeaderboardEntry(user, sanitizeRun(r));
    }
    return local.length;
  } catch (error) {
    console.error("Importing guest runs failed:", error);
    return 0;
  }
}
