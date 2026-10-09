import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit as limitTo,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  type DocumentData,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { firestore } from "@/firebase/config";
import {
  isDailyModeId,
  isImprovement,
  isRankedModeId,
  leaderboardRejection,
  SCORE_LIMITS,
  scoreOrderFor,
} from "./limits";
import type {
  LeaderboardEntry,
  LeaderboardWriteResult,
  RunSummaryInput,
} from "./types";

/** Max page size; firestore.rules rejects list queries above this. */
export const LEADERBOARD_MAX_LIMIT = 100;

export function entryRef(modeId: string, uid: string) {
  return doc(firestore, "leaderboards", modeId, "entries", uid);
}

export function entriesCollection(modeId: string) {
  return collection(firestore, "leaderboards", modeId, "entries");
}

function toMillis(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return 0;
}

export function toLeaderboardEntry(
  id: string,
  data: DocumentData,
): LeaderboardEntry {
  return {
    uid: id,
    displayName: String(data.displayName ?? ""),
    score: Number(data.score ?? 0),
    correct: Number(data.correct ?? 0),
    durationMs: Number(data.durationMs ?? 0),
    accuracy: Number(data.accuracy ?? 0),
    updatedAt: toMillis(data.updatedAt),
  };
}

/** Top entries for a mode, best first (ties: earliest achiever first). */
export async function fetchLeaderboard(
  modeId: string,
  max = 50,
): Promise<LeaderboardEntry[]> {
  if (!isRankedModeId(modeId)) return [];
  const dir = scoreOrderFor(modeId) === "lower-better" ? "asc" : "desc";
  const snap = await getDocs(
    query(
      entriesCollection(modeId),
      orderBy("score", dir),
      orderBy("updatedAt", "asc"),
      limitTo(Math.min(Math.max(1, max), LEADERBOARD_MAX_LIMIT)),
    ),
  );
  return snap.docs.map((d) => toLeaderboardEntry(d.id, d.data()));
}

/**
 * The user's own entry and 1-based rank (players with a strictly better
 * score + 1), plus the number of ranked players.
 */
export async function fetchRank(
  modeId: string,
  uid: string,
): Promise<{ entry: LeaderboardEntry; rank: number; total: number } | null> {
  if (!isRankedModeId(modeId)) return null;
  const snap = await getDoc(entryRef(modeId, uid));
  if (!snap.exists()) return null;
  const entry = toLeaderboardEntry(snap.id, snap.data());
  const better =
    scoreOrderFor(modeId) === "lower-better"
      ? where("score", "<", entry.score)
      : where("score", ">", entry.score);
  const [betterCount, total] = await Promise.all([
    getCountFromServer(query(entriesCollection(modeId), better)),
    getCountFromServer(entriesCollection(modeId)),
  ]);
  return {
    entry,
    rank: betterCount.data().count + 1,
    total: total.data().count,
  };
}

function isPermissionDenied(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "permission-denied"
  );
}

/**
 * Upserts the user's leaderboard entry if the run is ranked, the user is a
 * registered (non-anonymous) account and the score improves on their entry.
 * Daily entries are create-only (one ranked attempt per day).
 */
export async function submitLeaderboardEntry(
  user: User,
  run: RunSummaryInput,
): Promise<LeaderboardWriteResult> {
  if (user.isAnonymous || !isRankedModeId(run.modeId)) return "skipped";
  if (run.format === "practice") return "skipped";
  if (leaderboardRejection(run)) return "rejected";

  const ref = entryRef(run.modeId, user.uid);
  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      if (isDailyModeId(run.modeId)) return "not-improved";
      const prevScore = Number(existing.data().score);
      if (!isImprovement(scoreOrderFor(run.modeId), run.score, prevScore)) {
        return "not-improved";
      }
    }
    await setDoc(ref, {
      uid: user.uid,
      displayName: (user.displayName || "Player").slice(
        0,
        SCORE_LIMITS.DISPLAY_NAME_MAX,
      ),
      score: run.score,
      correct: run.correct,
      durationMs: run.durationMs,
      accuracy: run.accuracy,
      updatedAt: serverTimestamp(),
    });
    return "updated";
  } catch (error) {
    if (isPermissionDenied(error)) return "rejected";
    console.error("Leaderboard update failed:", error);
    return "error";
  }
}
