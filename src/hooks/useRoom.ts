/**
 * Multiplayer rooms on the Realtime Database.
 *
 * Schema (`rooms/{ROOMCODE}`; enforced by database.rules.json):
 *   hostUid          uid of the host (must be a player)
 *   status           "waiting" | "playing" | "finished"
 *   mode             { id, custom? }  catalog mode id or custom config
 *   maxPlayers       2..10
 *   allowVisualAids  boolean
 *   createdAt        server timestamp
 *   lastActivityAt   server timestamp, bumped by joins/scores/chat; rooms idle
 *                    for 6h may be deleted by anyone signed in
 *   startedAt, seed  written by the host when a round starts; startedAt is the
 *                    server time of the click, play begins COUNTDOWN later
 *   slots/{0..9}     uid holding each seat (bounds the room to maxPlayers)
 *   kicked/{uid}     true for players the host removed (cannot rejoin)
 *   players/{uid}    { uid, displayName, slot, joinedAt, ready, score, correct,
 *                      finished, finishMs?, round?, wins, lastWinRound?,
 *                      scoreHistory?, disconnected?, disconnectedAt? }
 *                    `round` = startedAt of the round the scores belong to.
 *   chat/{id}, lastChatAt/{uid}   see useChat
 *
 * The hook keeps the previous page-facing API: `Room.gameMode` is the legacy
 * GameMode resolved from `mode`, `Room.startedAt` is the local-clock time play
 * begins (server start + countdown), and speedrun finishers' `score` is their
 * time in seconds.
 */
import { useState, useCallback } from "react";
import {
  ref,
  get,
  onValue,
  remove,
  onDisconnect,
  update,
  set,
  serverTimestamp,
} from "firebase/database";
import { auth, database } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { GameMode, isSpeedrunMode } from "@/types/gameMode";
import { RoomModeRef, toLegacyGameMode, toRoomMode } from "@/lib/roomMode";
import { serverNow, serverToLocal } from "@/lib/serverTime";
import { setPresence } from "@/lib/presence";
import { clampDisplayName } from "@/data/profile";

export type { RoomModeRef } from "@/lib/roomMode";

/** Countdown between the host pressing start and play beginning. */
export const ROOM_COUNTDOWN_MS = 3000;
/** Rooms without activity for this long may be deleted by anyone signed in. */
export const ROOM_STALE_MS = 6 * 60 * 60 * 1000;
export const ROOM_MAX_PLAYERS = 10;

export interface RoomPlayer {
  uid: string;
  displayName: string;
  ready: boolean;
  /** Points this round (speedrun finishers: finish time in whole seconds). */
  score: number;
  correct: number;
  finished: boolean;
  /** Speedrun finish time in ms since play began. */
  finishMs?: number;
  wins: number;
  scoreHistory?: number[];
  disconnected?: boolean;
  disconnectedAt?: number;
  /** Only ever true for the current user (kicked players are removed). */
  kicked?: boolean;
  joinedAt?: number;
  slot?: string;
}

export interface Room {
  id: string;
  hostUid: string;
  mode: RoomModeRef;
  /** Legacy GameMode resolved from `mode` (for the current pages). */
  gameMode: GameMode;
  players: Record<string, RoomPlayer>;
  status: "waiting" | "playing" | "finished";
  createdAt: number;
  lastActivityAt: number;
  /** Local-clock ms when play begins (server start + countdown). */
  startedAt?: number;
  /** Raw server timestamp of the start click. */
  serverStartedAt?: number;
  /** Shared PRNG seed for the round (same for every player). */
  seed?: number;
  maxPlayers: number;
  allowVisualAids: boolean;
  /** Always true: the countdown synchronises the start for everyone. */
  enableCountdown: boolean;
  kicked: Record<string, boolean>;
}

interface RawPlayer {
  uid: string;
  displayName: string;
  slot: string;
  joinedAt?: number;
  ready?: boolean;
  score?: number;
  correct?: number;
  finished?: boolean;
  finishMs?: number;
  round?: number;
  wins?: number;
  lastWinRound?: number;
  scoreHistory?: Record<string, number> | number[];
  disconnected?: boolean;
  disconnectedAt?: number;
}

interface RawRoom {
  hostUid: string;
  status: Room["status"];
  mode: RoomModeRef;
  maxPlayers: number;
  allowVisualAids?: boolean;
  createdAt: number;
  lastActivityAt: number;
  startedAt?: number;
  seed?: number;
  players?: Record<string, RawPlayer | null>;
  slots?: Record<string, string | null> | Array<string | null>;
  kicked?: Record<string, boolean>;
}

// ---------------------------------------------------------------------------
// Module state shared by every useRoom() instance.

/** Last raw snapshot seen per room (avoids extra reads on score updates). */
const latestRaw = new Map<string, RawRoom>();
/** Per-room score bookkeeping for the current round. */
const scoreState = new Map<
  string,
  { round: number; nextIndex: number; lastScore: number }
>();

const roomRef = (roomId: string) => ref(database, `rooms/${roomId}`);
const playerRef = (roomId: string, uid: string) =>
  ref(database, `rooms/${roomId}/players/${uid}`);

function entries<T>(
  obj:
    | Record<string, T | null | undefined>
    | Array<T | null | undefined>
    | undefined,
): Array<[string, T]> {
  if (!obj) return [];
  return Object.entries(obj).filter(
    (e): e is [string, T] => e[1] !== null && e[1] !== undefined,
  );
}

function isStale(raw: RawRoom): boolean {
  return (
    typeof raw.lastActivityAt === "number" &&
    raw.lastActivityAt < serverNow() - ROOM_STALE_MS
  );
}

function randomRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function randomSeed(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0];
}

function errorCode(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const e = error as { code?: string; message?: string };
    return `${e.code ?? ""} ${e.message ?? ""}`.toLowerCase();
  }
  return String(error).toLowerCase();
}

function isPermissionDenied(error: unknown): boolean {
  return errorCode(error).includes("permission");
}

function playerName(): string {
  return clampDisplayName(auth.currentUser?.displayName);
}

function currentUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in");
  return uid;
}

function slotHolders(raw: RawRoom): Array<[string, string]> {
  return entries<string>(raw.slots);
}

/** Players who are connected and not kicked, in seat order. */
function activePlayers(raw: RawRoom): RawPlayer[] {
  return entries<RawPlayer>(raw.players)
    .map(([, p]) => p)
    .filter((p) => p && p.uid && !p.disconnected && !raw.kicked?.[p.uid])
    .sort(
      (a, b) =>
        (a.joinedAt ?? 0) - (b.joinedAt ?? 0) || a.uid.localeCompare(b.uid),
    );
}

function historyArray(h: RawPlayer["scoreHistory"]): number[] {
  if (!h) return [0];
  const list = Array.isArray(h)
    ? h.map((v, i) => [i, v] as const)
    : Object.entries(h).map(([k, v]) => [Number(k), v] as const);
  return list
    .filter(([, v]) => typeof v === "number")
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v as number);
}

/** Converts the stored room into the page-facing Room shape. */
export function normalizeRoom(
  roomId: string,
  raw: RawRoom,
  myUid: string | undefined,
): Room {
  const gameMode = toLegacyGameMode(raw.mode);
  const speedrun = isSpeedrunMode(gameMode);
  const inGame = raw.status !== "waiting" && typeof raw.startedAt === "number";
  const players: Record<string, RoomPlayer> = {};

  for (const [uid, p] of entries<RawPlayer>(raw.players)) {
    if (typeof p !== "object" || !p.uid) continue;
    const inRound = inGame && p.round === raw.startedAt;
    const finished = inRound && !!p.finished;
    const finishMs = inRound ? p.finishMs : undefined;
    let score = inRound ? (p.score ?? 0) : 0;
    if (speedrun && finished && typeof finishMs === "number") {
      score = Math.floor(finishMs / 1000);
    }
    players[uid] = {
      uid,
      displayName: p.displayName || "Player",
      slot: p.slot,
      joinedAt: p.joinedAt,
      ready: !!p.ready || uid === raw.hostUid,
      score,
      correct: inRound ? (p.correct ?? 0) : 0,
      finished,
      finishMs,
      wins: p.wins ?? 0,
      scoreHistory: inRound ? historyArray(p.scoreHistory) : [0],
      disconnected: !!p.disconnected,
      disconnectedAt: p.disconnectedAt,
    };
  }

  if (myUid && raw.kicked?.[myUid]) {
    players[myUid] = {
      ...(players[myUid] ?? {
        uid: myUid,
        displayName: "",
        ready: false,
        score: 0,
        correct: 0,
        finished: false,
        wins: 0,
      }),
      kicked: true,
    };
  }

  return {
    id: roomId,
    hostUid: raw.hostUid,
    mode: raw.mode,
    gameMode,
    players,
    status: raw.status,
    createdAt: raw.createdAt,
    lastActivityAt: raw.lastActivityAt,
    startedAt: inGame
      ? serverToLocal(raw.startedAt as number) + ROOM_COUNTDOWN_MS
      : undefined,
    serverStartedAt: inGame ? raw.startedAt : undefined,
    seed: inGame ? raw.seed : undefined,
    maxPlayers: raw.maxPlayers || 4,
    allowVisualAids: raw.allowVisualAids ?? true,
    enableCountdown: true,
    kicked: raw.kicked ?? {},
  };
}

async function readRoom(roomId: string): Promise<RawRoom | null> {
  const snap = await get(roomRef(roomId));
  if (!snap.exists()) {
    latestRaw.delete(roomId);
    return null;
  }
  const raw = snap.val() as RawRoom;
  latestRaw.set(roomId, raw);
  return raw;
}

/** Deletes a room idle for > 6h (allowed for anyone signed in). */
async function removeIfStale(roomId: string, raw: RawRoom): Promise<boolean> {
  if (!isStale(raw)) return false;
  try {
    await remove(roomRef(roomId));
    latestRaw.delete(roomId);
    return true;
  } catch {
    return false;
  }
}

async function armDisconnect(roomId: string, uid: string) {
  const pRef = playerRef(roomId, uid);
  await onDisconnect(pRef).cancel();
  await onDisconnect(pRef).update({
    disconnected: true,
    disconnectedAt: serverTimestamp(),
  });
}

function newPlayer(uid: string, slot: string) {
  return {
    uid,
    displayName: playerName(),
    slot,
    joinedAt: serverTimestamp(),
    ready: false,
    score: 0,
    correct: 0,
    finished: false,
    wins: 0,
    disconnected: false,
  };
}

/** Resets the caller's own round data (rules allow this only while waiting). */
function resetOwnNodeUpdates(uid: string, isHost: boolean) {
  return {
    [`players/${uid}/score`]: 0,
    [`players/${uid}/correct`]: 0,
    [`players/${uid}/finished`]: false,
    [`players/${uid}/finishMs`]: null,
    [`players/${uid}/round`]: null,
    [`players/${uid}/scoreHistory`]: null,
    [`players/${uid}/ready`]: isHost,
  };
}

export function useRoom() {
  const { ensureUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const createRoom = useCallback(
    async (
      gameMode: GameMode | RoomModeRef,
      maxPlayers: number = 4,
    ): Promise<string> => {
      if (maxPlayers < 2 || maxPlayers > ROOM_MAX_PLAYERS) {
        throw new Error("Max players must be between 2 and 10");
      }
      setLoading(true);
      try {
        const user = await ensureUser();
        const mode = toRoomMode(gameMode);
        for (let attempt = 0; attempt < 10; attempt++) {
          const roomId = randomRoomCode();
          const existing = await readRoom(roomId);
          if (existing && !(await removeIfStale(roomId, existing))) continue;
          try {
            await set(roomRef(roomId), {
              hostUid: user.uid,
              status: "waiting",
              mode,
              maxPlayers,
              allowVisualAids: true,
              createdAt: serverTimestamp(),
              lastActivityAt: serverTimestamp(),
              slots: { "0": user.uid },
              players: {
                [user.uid]: { ...newPlayer(user.uid, "0"), ready: true },
              },
            });
          } catch (error) {
            // Lost a race for this code; try another.
            if (isPermissionDenied(error)) continue;
            throw error;
          }
          await armDisconnect(roomId, user.uid);
          void setPresence(user.uid, roomId);
          return roomId;
        }
        throw new Error(
          "Failed to generate unique room code. Please try again.",
        );
      } catch (error) {
        console.error("Error creating room:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [ensureUser],
  );

  const joinRoom = useCallback(
    async (roomId: string) => {
      setLoading(true);
      try {
        const user = await ensureUser();
        for (let attempt = 0; attempt < 4; attempt++) {
          const raw = await readRoom(roomId);
          if (!raw || (await removeIfStale(roomId, raw))) {
            throw new Error("Room not found");
          }
          if (raw.kicked?.[user.uid]) {
            throw new Error("You have been removed from this room");
          }

          if (raw.players?.[user.uid]) {
            // Reconnecting (any room status).
            await update(roomRef(roomId), {
              [`players/${user.uid}/disconnected`]: false,
              [`players/${user.uid}/disconnectedAt`]: null,
              lastActivityAt: serverTimestamp(),
            });
          } else {
            if (raw.status !== "waiting") {
              throw new Error("Room is not accepting players");
            }
            const taken = new Set(slotHolders(raw).map(([slot]) => slot));
            let slot: string | null = null;
            for (
              let i = 0;
              i < Math.min(raw.maxPlayers, ROOM_MAX_PLAYERS);
              i++
            ) {
              if (!taken.has(String(i))) {
                slot = String(i);
                break;
              }
            }
            if (slot === null) throw new Error("Room is full");
            try {
              await update(roomRef(roomId), {
                [`slots/${slot}`]: user.uid,
                [`players/${user.uid}`]: newPlayer(user.uid, slot),
                lastActivityAt: serverTimestamp(),
              });
            } catch (error) {
              // Someone took the seat (or the game started) in the meantime.
              if (isPermissionDenied(error) && attempt < 3) continue;
              throw isPermissionDenied(error)
                ? new Error("Room is full or no longer accepting players")
                : error;
            }
          }
          await armDisconnect(roomId, user.uid);
          void setPresence(user.uid, roomId);
          return;
        }
      } catch (error) {
        console.error("Error joining room:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [ensureUser],
  );

  const leaveRoom = useCallback(async (roomId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await onDisconnect(playerRef(roomId, uid)).cancel();
      const raw = await readRoom(roomId);
      scoreState.delete(roomId);
      if (!raw || !raw.players?.[uid]) return;

      const others = entries<RawPlayer>(raw.players)
        .map(([, p]) => p)
        .filter((p) => p.uid !== uid);
      const othersConnected = others.filter((p) => !p.disconnected);

      if (
        others.length === 0 ||
        (raw.status === "waiting" && othersConnected.length === 0)
      ) {
        try {
          await remove(roomRef(roomId));
          latestRaw.delete(roomId);
          return;
        } catch {
          // Fall through to a normal leave.
        }
      }

      const mySlot = raw.players[uid]?.slot;
      const updates: Record<string, unknown> = {
        [`players/${uid}`]: null,
        lastActivityAt: serverTimestamp(),
      };
      if (mySlot !== undefined) updates[`slots/${mySlot}`] = null;

      if (raw.hostUid === uid) {
        const nextHost =
          activePlayers(raw).find((p) => p.uid !== uid) ?? others[0];
        if (nextHost) {
          updates.hostUid = nextHost.uid;
          if (raw.status === "playing") updates.status = "waiting";
        }
      }
      await update(roomRef(roomId), updates);
    } catch (error) {
      console.error("Error leaving room:", error);
      throw error;
    } finally {
      void setPresence(uid, null);
    }
  }, []);

  const setPlayerReady = useCallback(async (roomId: string, ready: boolean) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await set(ref(database, `rooms/${roomId}/players/${uid}/ready`), ready);
  }, []);

  const startGame = useCallback(async (roomId: string) => {
    const uid = currentUid();
    const raw = await readRoom(roomId);
    if (!raw) throw new Error("Room not found");
    if (raw.hostUid !== uid) throw new Error("Only host can start the game");
    const others = activePlayers(raw).filter((p) => p.uid !== raw.hostUid);
    if (others.length === 0 || !others.every((p) => p.ready)) {
      throw new Error("All players must be ready");
    }
    await update(roomRef(roomId), {
      status: "playing",
      startedAt: serverTimestamp(),
      seed: randomSeed(),
      lastActivityAt: serverTimestamp(),
    });
  }, []);

  /**
   * Records the caller's score for the current round. `correct` defaults to
   * `score` (legacy modes score one point per correct answer).
   */
  const updatePlayerScore = useCallback(
    async (roomId: string, score: number, correct?: number) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const raw = latestRaw.get(roomId) ?? (await readRoom(roomId));
      if (
        !raw ||
        raw.status === "waiting" ||
        typeof raw.startedAt !== "number"
      ) {
        return; // Nothing to record outside a round.
      }
      const round = raw.startedAt;
      const value = Math.max(0, Math.floor(score));
      let state = scoreState.get(roomId);
      if (!state || state.round !== round) {
        const mine = raw.players?.[uid];
        const sameRound = mine?.round === round;
        const history = sameRound ? historyArray(mine?.scoreHistory) : [];
        state = {
          round,
          nextIndex: history.length,
          lastScore: sameRound ? (mine?.score ?? 0) : -1,
        };
        scoreState.set(roomId, state);
      }
      // Scores are monotonic within a round (the rules reject decreases).
      if (value <= state.lastScore) return;

      const updates: Record<string, unknown> = {
        [`players/${uid}/round`]: round,
        [`players/${uid}/score`]: value,
        [`players/${uid}/correct`]: Math.max(0, Math.floor(correct ?? value)),
        lastActivityAt: serverTimestamp(),
      };
      if (state.nextIndex === 0) {
        updates[`players/${uid}/scoreHistory/0`] = 0;
        state.nextIndex = 1;
      }
      if (value > 0 && state.nextIndex < 1000) {
        updates[`players/${uid}/scoreHistory/${state.nextIndex}`] = value;
        state.nextIndex += 1;
      }
      const previous = state.lastScore;
      state.lastScore = value;
      try {
        await update(roomRef(roomId), updates);
      } catch (error) {
        state.lastScore = previous;
        console.error("Error updating score:", error);
      }
    },
    [],
  );

  const finishGame = useCallback(
    async (roomId: string, options?: { finishMs?: number }) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      try {
        const raw = await readRoom(roomId);
        if (
          !raw ||
          raw.status !== "playing" ||
          typeof raw.startedAt !== "number"
        ) {
          return;
        }
        const me = raw.players?.[uid];
        if (!me) return;
        const updates: Record<string, unknown> = {
          [`players/${uid}/finished`]: true,
          [`players/${uid}/round`]: raw.startedAt,
          lastActivityAt: serverTimestamp(),
        };
        if (me.round !== raw.startedAt) {
          // Finished without scoring this round.
          updates[`players/${uid}/score`] = 0;
          updates[`players/${uid}/correct`] = 0;
        }
        if (
          options?.finishMs !== undefined &&
          !(me.round === raw.startedAt && me.finished)
        ) {
          updates[`players/${uid}/finishMs`] = Math.max(
            0,
            Math.round(options.finishMs),
          );
        }
        await update(roomRef(roomId), updates);

        // End the round once every connected player has finished.
        const after = await readRoom(roomId);
        if (!after || after.status !== "playing") return;
        const active = activePlayers(after);
        const allFinished =
          active.length > 0 &&
          active.every((p) => p.finished && p.round === after.startedAt);
        if (allFinished) {
          await set(ref(database, `rooms/${roomId}/status`), "finished");
        }
      } catch (error) {
        console.error("Error finishing game:", error);
        throw error;
      }
    },
    [],
  );

  const resetRoom = useCallback(async (roomId: string) => {
    const uid = currentUid();
    const raw = await readRoom(roomId);
    if (!raw) throw new Error("Room not found");
    const isHost = raw.hostUid === uid;
    if (!isHost && raw.status === "playing") {
      throw new Error("Only the host can stop a game in progress");
    }
    // Back to the lobby. Every client resets its own round data when it sees
    // status "waiting" (see subscribeToRoom), so scores never leak across rounds.
    await update(roomRef(roomId), {
      status: "waiting",
      lastActivityAt: serverTimestamp(),
    });
    scoreState.delete(roomId);
    await update(roomRef(roomId), resetOwnNodeUpdates(uid, isHost)).catch(
      () => undefined,
    );
  }, []);

  const incrementWins = useCallback(
    async (roomId: string, winnerId: string) => {
      const uid = auth.currentUser?.uid;
      // Rules only let players write their own node, so only the winner counts it.
      if (!uid || uid !== winnerId) return;
      try {
        const raw = await readRoom(roomId);
        const me = raw?.players?.[uid];
        if (!raw || !me || raw.status !== "finished") return;
        if (me.lastWinRound === raw.startedAt) return; // already counted
        await update(roomRef(roomId), {
          [`players/${uid}/wins`]: (me.wins ?? 0) + 1,
          [`players/${uid}/lastWinRound`]: raw.startedAt,
        });
      } catch (error) {
        console.error("Error incrementing wins:", error);
        throw error;
      }
    },
    [],
  );

  const updateGameMode = useCallback(
    async (roomId: string, gameMode: GameMode | RoomModeRef) => {
      const uid = currentUid();
      const raw = await readRoom(roomId);
      if (!raw) throw new Error("Room not found");
      if (raw.hostUid !== uid)
        throw new Error("Only the host can update game mode");
      if (raw.status !== "waiting") {
        throw new Error("Cannot update game mode while game is in progress");
      }
      await update(roomRef(roomId), {
        mode: toRoomMode(gameMode),
        lastActivityAt: serverTimestamp(),
      });
    },
    [],
  );

  const kickPlayer = useCallback(async (roomId: string, playerUid: string) => {
    const uid = currentUid();
    const raw = await readRoom(roomId);
    if (!raw) throw new Error("Room not found");
    if (raw.hostUid !== uid) throw new Error("Only the host can kick players");
    if (playerUid === uid) throw new Error("Cannot kick yourself");
    const target = raw.players?.[playerUid];
    const updates: Record<string, unknown> = {
      [`kicked/${playerUid}`]: true,
      [`players/${playerUid}`]: null,
      lastActivityAt: serverTimestamp(),
    };
    if (target?.slot !== undefined) updates[`slots/${target.slot}`] = null;
    await update(roomRef(roomId), updates);
  }, []);

  const transferHost = useCallback(
    async (roomId: string, newHostUid: string) => {
      const uid = currentUid();
      const raw = await readRoom(roomId);
      if (!raw) throw new Error("Room not found");
      if (raw.hostUid !== uid) {
        throw new Error("Only the host can transfer host privileges");
      }
      const target = raw.players?.[newHostUid];
      if (!target || target.disconnected || raw.kicked?.[newHostUid]) {
        throw new Error("New host must be an active player in the room");
      }
      await update(roomRef(roomId), {
        hostUid: newHostUid,
        [`players/${uid}/ready`]: false,
        lastActivityAt: serverTimestamp(),
      });
    },
    [],
  );

  const updateRoomSettings = useCallback(
    async (roomId: string, settings: { allowVisualAids?: boolean }) => {
      const uid = currentUid();
      const raw = await readRoom(roomId);
      if (!raw) throw new Error("Room not found");
      if (raw.hostUid !== uid) {
        throw new Error("Only the host can update room settings");
      }
      const updates: Record<string, unknown> = {
        lastActivityAt: serverTimestamp(),
      };
      if (typeof settings.allowVisualAids === "boolean") {
        updates.allowVisualAids = settings.allowVisualAids;
      }
      await update(roomRef(roomId), updates);
    },
    [],
  );

  const subscribeToRoom = useCallback(
    (roomId: string, callback: (room: Room | null) => void) => {
      const rRef = roomRef(roomId);
      let claiming = false;
      let finishing = false;
      let resetting = false;
      let restoring = false;
      let connected = false;
      let lastRaw: RawRoom | null = null;

      const restoreConnection = (rearm: boolean) => {
        const uid = auth.currentUser?.uid;
        if (restoring || !uid || !lastRaw) return;
        const me = lastRaw.players?.[uid];
        if (!me || lastRaw.kicked?.[uid]) return;
        if (!me.disconnected && !rearm) return;
        restoring = true;
        update(rRef, {
          [`players/${uid}/disconnected`]: false,
          [`players/${uid}/disconnectedAt`]: null,
        })
          .then(() => armDisconnect(roomId, uid))
          .catch((e) => console.error("Error restoring connection:", e))
          .finally(() => {
            restoring = false;
          });
      };

      const unsubscribeRoom = onValue(
        rRef,
        (snapshot) => {
          const uid = auth.currentUser?.uid;
          if (!snapshot.exists()) {
            latestRaw.delete(roomId);
            lastRaw = null;
            callback(null);
            return;
          }
          const raw = snapshot.val() as RawRoom;
          latestRaw.set(roomId, raw);
          lastRaw = raw;

          const players = entries<RawPlayer>(raw.players);
          if (players.length === 0) {
            // Husk without players: clean up if allowed, report as gone.
            void removeIfStale(roomId, raw);
            callback(null);
            return;
          }

          const me = uid ? raw.players?.[uid] : undefined;
          if (uid && me && !raw.kicked?.[uid]) {
            // Marked disconnected while this tab is connected (e.g. a network
            // blip or another tab of ours closed): we are here, say so.
            if (connected && me.disconnected) restoreConnection(false);

            // Host left or disconnected: the earliest-joined connected player
            // claims host (rules allow this only when the host is gone).
            const host = raw.players?.[raw.hostUid];
            if (!claiming && (!host || host.disconnected)) {
              const successor = activePlayers(raw).find(
                (p) => p.uid !== raw.hostUid,
              );
              if (successor?.uid === uid) {
                claiming = true;
                update(rRef, {
                  hostUid: uid,
                  lastActivityAt: serverTimestamp(),
                })
                  .catch((e) => console.error("Error claiming host:", e))
                  .finally(() => {
                    claiming = false;
                  });
              }
            }

            // Host ends the round once every connected player finished.
            if (!finishing && raw.hostUid === uid && raw.status === "playing") {
              const active = activePlayers(raw);
              if (
                active.length > 0 &&
                active.every((p) => p.finished && p.round === raw.startedAt)
              ) {
                finishing = true;
                set(ref(database, `rooms/${roomId}/status`), "finished")
                  .catch((e) => console.error("Error finishing round:", e))
                  .finally(() => {
                    finishing = false;
                  });
              }
            }

            // Back in the lobby: clear my previous round's data.
            if (
              !resetting &&
              raw.status === "waiting" &&
              (me.round !== undefined || me.finished || (me.score ?? 0) > 0)
            ) {
              resetting = true;
              scoreState.delete(roomId);
              update(rRef, resetOwnNodeUpdates(uid, raw.hostUid === uid))
                .catch((e) => console.error("Error resetting player:", e))
                .finally(() => {
                  resetting = false;
                });
            }
          }

          callback(normalizeRoom(roomId, raw, uid));
        },
        (error) => {
          console.error("Room subscription error:", error);
          callback(null);
        },
      );

      // After a network drop the server ran our onDisconnect (marking us
      // disconnected and dropping the handler); once the connection is back,
      // mark ourselves connected again and re-arm the handler.
      const unsubscribeConnected = onValue(
        ref(database, ".info/connected"),
        (snap) => {
          connected = snap.val() === true;
          if (connected) restoreConnection(true);
        },
      );

      return () => {
        unsubscribeRoom();
        unsubscribeConnected();
      };
    },
    [],
  );

  return {
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    setPlayerReady,
    startGame,
    updatePlayerScore,
    finishGame,
    resetRoom,
    incrementWins,
    updateGameMode,
    kickPlayer,
    updateRoomSettings,
    transferHost,
    subscribeToRoom,
  };
}
