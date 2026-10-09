import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as limitTo,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { firestore } from "@/firebase/firestore";
import {
  dailyLockExpiresMs,
  isDailyModeId,
  isImprovement,
  isRankedModeId,
  leaderboardRejection,
  scoreOrderFor,
} from "./limits";
import { clampDisplayName } from "./names";
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

/**
 * `users/{uid}/dailyLocks/{modeId}`: claims the one ranked attempt at a
 * daily. Rules only accept a daily entry created in the same batch as this
 * lock, and only while it does not exist yet.
 */
export function dailyLockRef(uid: string, modeId: string) {
  return doc(firestore, "users", uid, "dailyLocks", modeId);
}

export function dailyLocksCollection(uid: string) {
  return collection(firestore, "users", uid, "dailyLocks");
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
    skipped: Number(data.skipped ?? 0),
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
  // Offline, Firestore answers from the (empty) local cache instead of
  // failing; don't let that read as "nobody has played this mode".
  if (snap.empty && snap.metadata.fromCache) {
    throw Object.assign(new Error("Leaderboard unavailable offline"), {
      code: "unavailable",
    });
  }
  return snap.docs.map((d) => toLeaderboardEntry(d.id, d.data()));
}

/**
 * The user's own entry and 1-based rank (players with a strictly better score
 * + 1). Rules cap list queries at 100 documents, so `rank` is null when more
 * than 100 players are ahead (show it as "100+").
 */
export async function fetchRank(
  modeId: string,
  uid: string,
): Promise<{ entry: LeaderboardEntry; rank: number | null } | null> {
  if (!isRankedModeId(modeId)) return null;
  const snap = await getDoc(entryRef(modeId, uid));
  if (!snap.exists()) return null;
  const entry = toLeaderboardEntry(snap.id, snap.data());
  const lower = scoreOrderFor(modeId) === "lower-better";
  const ahead = await getDocs(
    query(
      entriesCollection(modeId),
      where("score", lower ? "<" : ">", entry.score),
      orderBy("score", lower ? "asc" : "desc"),
      limitTo(LEADERBOARD_MAX_LIMIT),
    ),
  );
  return {
    entry,
    rank: ahead.size < LEADERBOARD_MAX_LIMIT ? ahead.size + 1 : null,
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
 * Daily entries are create-only: one ranked attempt per day, claimed by
 * writing the day's lock in the same batch (see dailyLockRef).
 */
export async function submitLeaderboardEntry(
  user: User,
  run: RunSummaryInput,
): Promise<LeaderboardWriteResult> {
  if (user.isAnonymous || !isRankedModeId(run.modeId)) return "skipped";
  if (run.format === "practice") return "skipped";
  if (leaderboardRejection(run)) return "rejected";

  const ref = entryRef(run.modeId, user.uid);
  const entry = {
    uid: user.uid,
    displayName: clampDisplayName(user.displayName),
    score: run.score,
    correct: run.correct,
    skipped: run.skipped,
    durationMs: run.durationMs,
    accuracy: run.accuracy,
    completed: true,
    updatedAt: serverTimestamp(),
  };
  try {
    if (isDailyModeId(run.modeId)) {
      const lock = dailyLockRef(user.uid, run.modeId);
      const [lockSnap, existing] = await Promise.all([
        getDoc(lock),
        getDoc(ref),
      ]);
      // Today's ranked attempt was already used (even if its entry is gone).
      if (lockSnap.exists() || existing.exists()) return "not-improved";
      const batch = writeBatch(firestore);
      batch.set(lock, {
        expireAt: Timestamp.fromMillis(dailyLockExpiresMs(run.modeId) ?? 0),
      });
      batch.set(ref, entry);
      await batch.commit();
      return "updated";
    }
    const existing = await getDoc(ref);
    if (existing.exists()) {
      const prevScore = Number(existing.data().score);
      if (!isImprovement(scoreOrderFor(run.modeId), run.score, prevScore)) {
        return "not-improved";
      }
    }
    await setDoc(ref, entry);
    return "updated";
  } catch (error) {
    if (isPermissionDenied(error)) return "rejected";
    console.error("Leaderboard update failed:", error);
    return "error";
  }
}
