/**
 * Picking a multiplayer round back up after a reload (or a dropped
 * connection that reloaded the tab).
 *
 * While playing, the page keeps a snapshot of the run (src/game/run.ts) in
 * localStorage under one key per room, tagged with the round it belongs to
 * (the server start of the round), so a snapshot from an earlier round is
 * never applied to a new one. localStorage rather than sessionStorage: a
 * player who closes the tab and opens the room link again, or opens it in a
 * second tab, continues too. Without a snapshot (another browser, cleared
 * storage) the run continues from the progress recorded in the room.
 */
import { parseRunSnapshot, progressSnapshot, type RunSnapshot } from "@/game";

const PREFIX = "bmg:mp:run:";
/** Snapshots older than this are cleared (rooms go stale after 6 h idle). */
export const ROUND_RUN_TTL_MS = 6 * 60 * 60 * 1000;

interface StoredRun {
  round: number;
  savedAt: number;
  run: unknown;
}

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key"> & {
  readonly length: number;
};

/** localStorage, or null where it is unavailable (private modes, previews). */
export function roundStore(): Store | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

const keyFor = (roomId: string) => `${PREFIX}${roomId}`;

export function saveRoundRun(
  store: Store | null,
  roomId: string,
  round: number,
  run: RunSnapshot,
  now = Date.now(),
): void {
  if (!store) return;
  try {
    const value: StoredRun = { round, savedAt: now, run };
    store.setItem(keyFor(roomId), JSON.stringify(value));
  } catch {
    /* quota or storage disabled: resuming falls back to recorded progress */
  }
}

/** The stored run of this room's round `round`, if there is a valid one. */
export function loadRoundRun(
  store: Store | null,
  roomId: string,
  round: number | undefined,
): RunSnapshot | null {
  if (!store || typeof round !== "number") return null;
  try {
    const raw = store.getItem(keyFor(roomId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredRun>;
    if (value?.round !== round) return null; // an earlier round's run
    return parseRunSnapshot(value.run);
  } catch {
    return null;
  }
}

/** Drops snapshots of rooms not played in the last `ROUND_RUN_TTL_MS`. */
export function pruneRoundRuns(store: Store | null, now = Date.now()): void {
  if (!store) return;
  try {
    const stale: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      let savedAt = 0;
      try {
        savedAt =
          Number((JSON.parse(store.getItem(key) ?? "") as StoredRun).savedAt) ||
          0;
      } catch {
        /* unreadable: drop it */
      }
      if (savedAt < now - ROUND_RUN_TTL_MS) stale.push(key);
    }
    for (const key of stale) store.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

/** Correct answers in a snapshot. */
export function snapshotCorrect(snap: RunSnapshot): number {
  return snap.outcomes.filter((o) => o[0] === "c").length;
}

/** What the room has recorded for the player this round. */
export interface RecordedProgress {
  correct: number;
  finished: boolean;
  /** progress[k] = ms after play began at which point k + 1 was reached. */
  progress: readonly number[];
}

export type ResumePlan =
  /** Play: from `snapshot` (null = from question 1). */
  | {
      kind: "play";
      snapshot: RunSnapshot | null;
      /** Where the snapshot came from: this device, or the room's record. */
      source: "none" | "device" | "room";
    }
  /** Finished, but this device has no record of the run: show the result. */
  | { kind: "finished" };

/**
 * How to pick the round back up. The device's snapshot is used when it is at
 * least as far along as the room's record (it is written before each score
 * write, so it normally is); otherwise the room's record wins, so progress is
 * never rewound. A finish recorded in the room always stands.
 */
export function planResume(
  stored: RunSnapshot | null,
  recorded: RecordedProgress | undefined,
): ResumePlan {
  const correct = recorded?.correct ?? 0;
  const finished = !!recorded?.finished;
  if (stored && snapshotCorrect(stored) >= correct && (!finished || stored.end))
    return { kind: "play", snapshot: stored, source: "device" };
  if (finished) return { kind: "finished" };
  if (correct > 0)
    return {
      kind: "play",
      snapshot: progressSnapshot(correct, recorded?.progress ?? []),
      source: "room",
    };
  return { kind: "play", snapshot: null, source: "none" };
}

/** Progress marks implied by a snapshot: ms at which each point was reached. */
export function snapshotMarks(snap: RunSnapshot | null): number[] {
  const marks: number[] = [];
  let t = 0;
  for (const [code, ms] of snap?.outcomes ?? []) {
    t += ms;
    if (code === "c") marks.push(t);
  }
  return marks;
}
