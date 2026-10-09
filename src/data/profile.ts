import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { firestore } from "@/firebase/config";
import { isRankedModeId, modeIdFromBestsKey, SCORE_LIMITS } from "./limits";
import { entryRef } from "./leaderboard";
import { runsCollection, statsRef } from "./runs";
import type { GameSettings, UserStatsDoc } from "./types";
import { DEFAULT_GAME_SETTINGS } from "./types";

export function profileRef(uid: string) {
  return doc(firestore, "users", uid);
}

export function clampDisplayName(name: string | null | undefined): string {
  const trimmed = (name || "").trim();
  return (trimmed || "Player").slice(0, SCORE_LIMITS.DISPLAY_NAME_MAX);
}

/** Creates `users/{uid}` for registered users if it does not exist yet. */
export async function ensureUserProfile(user: User): Promise<void> {
  if (user.isAnonymous) return;
  const ref = profileRef(user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    displayName: clampDisplayName(user.displayName),
    createdAt: serverTimestamp(),
    settings: { ...DEFAULT_GAME_SETTINGS },
  });
}

export async function saveUserSettings(
  uid: string,
  settings: GameSettings,
): Promise<void> {
  await setDoc(profileRef(uid), { settings }, { merge: true });
}

/** Ranked mode ids the user has a personal best in (from userStats.bests). */
async function rankedModeIdsFor(uid: string): Promise<string[]> {
  const snap = await getDoc(statsRef(uid));
  if (!snap.exists()) return [];
  const bests = (snap.data() as UserStatsDoc).bests || {};
  return Object.keys(bests).map(modeIdFromBestsKey).filter(isRankedModeId);
}

/**
 * Writes the new display name to the profile and to every leaderboard entry
 * the user owns (found via the ranked ids in their bests map). Only the
 * `displayName` field changes on entries, so ranks/tie-breaks are unaffected.
 */
export async function propagateDisplayName(
  uid: string,
  displayName: string,
): Promise<void> {
  const name = clampDisplayName(displayName);
  await setDoc(profileRef(uid), { displayName: name }, { merge: true });
  const modeIds = await rankedModeIdsFor(uid);
  const existing = await Promise.all(
    modeIds.map(async (id) => {
      const ref = entryRef(id, uid);
      const snap = await getDoc(ref);
      return snap.exists() ? ref : null;
    }),
  );
  const refs = existing.filter((r): r is NonNullable<typeof r> => r !== null);
  for (let i = 0; i < refs.length; i += 400) {
    const batch = writeBatch(firestore);
    refs
      .slice(i, i + 400)
      .forEach((ref) => batch.update(ref, { displayName: name }));
    await batch.commit();
  }
}

/**
 * Deletes everything the user owns in Firestore: run history, leaderboard
 * entries, stats and profile. Call before deleting the auth user.
 */
export async function deleteUserData(uid: string): Promise<void> {
  // Run history, in pages.
  for (;;) {
    const page = await getDocs(query(runsCollection(uid), limit(400)));
    if (page.empty) break;
    const batch = writeBatch(firestore);
    page.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    if (page.size < 400) break;
  }
  // Leaderboard entries (deleting a missing doc is a no-op).
  const modeIds = await rankedModeIdsFor(uid);
  for (let i = 0; i < modeIds.length; i += 400) {
    const batch = writeBatch(firestore);
    modeIds.slice(i, i + 400).forEach((id) => batch.delete(entryRef(id, uid)));
    await batch.commit();
  }
  await deleteDoc(statsRef(uid));
  await deleteDoc(profileRef(uid));
}
