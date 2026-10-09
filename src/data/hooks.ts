import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDocs,
  limit as limitTo,
  onSnapshot,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { bestsKey, scoreOrderFor, type ScoreOrder } from "./limits";
import { fetchLeaderboard, fetchRank } from "./leaderboard";
import {
  computeLocalStats,
  getLocalRuns,
  getLocalSettings,
  LOCAL_CHANGE_EVENT,
  setLocalSettings,
} from "./localStore";
import { profileRef, saveUserSettings } from "./profile";
import { runsCollection, statsRef } from "./runs";
import { emptyStats } from "./stats";
import {
  DEFAULT_GAME_SETTINGS,
  type BestEntry,
  type GameSettings,
  type LeaderboardEntry,
  type RunRecord,
  type RunSummaryInput,
  type UserStatsDoc,
} from "./types";

/** Re-renders when guest data in localStorage changes (this tab or another). */
function useLocalDataVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(LOCAL_CHANGE_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(LOCAL_CHANGE_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);
  return version;
}

export interface RunHistoryOptions {
  /** Max runs to return (default 50, max 1000). */
  limit?: number;
  /** Only runs of this mode. */
  modeId?: string;
  /** Only runs that ended at or after this time (ms). */
  since?: number;
}

/**
 * The current user's run history, newest first. Registered users read
 * `users/{uid}/runs`; guests read the local copy (last 50 runs).
 */
export function useRunHistory(options: RunHistoryOptions = {}) {
  const { user, isGuest } = useAuth();
  const { modeId, since } = options;
  const max = Math.min(Math.max(1, options.limit ?? 50), 1000);
  const localVersion = useLocalDataVersion();
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  const uid = user?.uid;
  useEffect(() => {
    let cancelled = false;
    if (!uid || isGuest) {
      const local = getLocalRuns().filter(
        (r) =>
          (!modeId || r.modeId === modeId) &&
          (since === undefined || r.endedAt >= since),
      );
      setRuns(local.slice(0, max));
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const constraints: QueryConstraint[] = [];
    if (modeId) constraints.push(where("modeId", "==", modeId));
    if (since !== undefined) constraints.push(where("endedAt", ">=", since));
    constraints.push(orderBy("endedAt", "desc"), limitTo(max));
    getDocs(query(runsCollection(uid), ...constraints))
      .then((snap) => {
        if (cancelled) return;
        setRuns(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as RunSummaryInput),
          })),
        );
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("Error loading run history:", e);
        setError(e);
        setRuns([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid, isGuest, modeId, since, max, nonce, localVersion]);

  return { runs, loading, error, refresh };
}

/**
 * Aggregate stats (`userStats/{uid}`), live. Guests get stats computed from
 * their local runs. `stats` is never null; new users get zeros.
 */
export function useUserStats() {
  const { user, isGuest } = useAuth();
  const localVersion = useLocalDataVersion();
  const [stats, setStats] = useState<UserStatsDoc>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const uid = user?.uid;
  useEffect(() => {
    if (!uid || isGuest) {
      setStats(computeLocalStats(getLocalRuns()));
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    return onSnapshot(
      statsRef(uid),
      (snap) => {
        setStats(
          snap.exists()
            ? { ...emptyStats(), ...(snap.data() as UserStatsDoc) }
            : emptyStats(),
        );
        setError(null);
        setLoading(false);
      },
      (e) => {
        console.error("Error loading stats:", e);
        setError(e);
        setLoading(false);
      },
    );
  }, [uid, isGuest, localVersion]);

  return { stats, loading, error };
}

/** The user's best result for one mode, or null if never played. */
export function usePersonalBest(modeId: string) {
  const { stats, loading } = useUserStats();
  const best: BestEntry | null = stats.bests[bestsKey(modeId)] ?? null;
  return { best, loading };
}

export interface LeaderboardOptions {
  /** Number of top entries (default 50, max 100). */
  limit?: number;
}

/**
 * Top entries of a ranked mode, best first (lower-is-better for
 * `:speedrun` and `daily:` modes), plus the signed-in user's own rank.
 * Unranked mode ids return an empty list.
 */
export function useLeaderboard(
  modeId: string,
  options: LeaderboardOptions = {},
) {
  const { user, isGuest } = useAuth();
  const max = options.limit ?? 50;
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [me, setMe] = useState<{
    entry: LeaderboardEntry;
    rank: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  const order: ScoreOrder = useMemo(() => scoreOrderFor(modeId), [modeId]);

  const uid = user?.uid;
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchLeaderboard(modeId, max),
      uid && !isGuest
        ? fetchRank(modeId, uid).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([top, mine]) => {
        if (cancelled) return;
        setEntries(top);
        setMe(mine);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("Error loading leaderboard:", e);
        setEntries([]);
        setMe(null);
        setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modeId, max, uid, isGuest, nonce]);

  return { entries, me, order, loading, error, refresh };
}

/**
 * Gameplay settings. Registered users: `users/{uid}.settings` (live).
 * Guests: localStorage.
 */
export function useGameSettings() {
  const { user, isGuest } = useAuth();
  const localVersion = useLocalDataVersion();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);
  const [loading, setLoading] = useState(true);

  const uid = user?.uid;
  useEffect(() => {
    if (!uid || isGuest) {
      setSettings(getLocalSettings());
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(
      profileRef(uid),
      (snap) => {
        const stored = snap.exists()
          ? (snap.data().settings as Partial<GameSettings> | undefined)
          : undefined;
        setSettings({ ...DEFAULT_GAME_SETTINGS, ...(stored || {}) });
        setLoading(false);
      },
      (e) => {
        console.error("Error loading game settings:", e);
        setSettings(DEFAULT_GAME_SETTINGS);
        setLoading(false);
      },
    );
  }, [uid, isGuest, localVersion]);

  const saveSettings = useCallback(
    async (patch: Partial<GameSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      if (!uid || isGuest) {
        setLocalSettings(next);
        return;
      }
      await saveUserSettings(uid, next);
    },
    [settings, uid, isGuest],
  );

  return { settings, loading, saveSettings };
}
