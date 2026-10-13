/**
 * Pure decisions about a multiplayer round, on the stored room shape
 * (`rooms/{code}`). Kept free of Firebase so they can be unit tested;
 * src/hooks/useRoom.ts applies them.
 */

/**
 * A dropped connection (a reload, a network blip, a phone switching
 * networks) only counts as gone after this long: until then the player still
 * holds the round open and keeps the host role.
 */
export const DISCONNECT_GRACE_MS = 10_000;

export interface RoundPlayer {
  uid: string;
  finished?: boolean;
  round?: number | null;
  disconnected?: boolean;
  disconnectedAt?: number;
}

export interface RoundRoom {
  hostUid: string;
  status: "waiting" | "playing" | "finished";
  startedAt?: number;
  players?: Record<string, RoundPlayer | null | undefined>;
  kicked?: Record<string, boolean>;
}

/** Ms until a disconnected player's grace period ends (0 once it has). */
function graceLeftMs(p: RoundPlayer, now: number): number {
  if (!p.disconnected || typeof p.disconnectedAt !== "number") return 0;
  return Math.max(0, p.disconnectedAt + DISCONNECT_GRACE_MS - now);
}

function seatedPlayers(raw: RoundRoom): RoundPlayer[] {
  return Object.values(raw.players ?? {}).filter(
    (p): p is RoundPlayer => !!p && !!p.uid && !raw.kicked?.[p.uid],
  );
}

/**
 * Whether the round in `raw` is over: every connected player finished it, and
 * nobody who dropped within the grace period is still playing. `retryInMs`
 * says when to look again when only such recently dropped players hold it.
 * `now` is server time.
 */
export function roundComplete(
  raw: RoundRoom,
  now: number,
): { complete: boolean; retryInMs?: number } {
  if (raw.status !== "playing" || typeof raw.startedAt !== "number")
    return { complete: false };
  const done = (p: RoundPlayer) => !!p.finished && p.round === raw.startedAt;
  const seated = seatedPlayers(raw);
  const connected = seated.filter((p) => !p.disconnected);
  if (connected.length === 0 || !connected.every(done))
    return { complete: false };
  const wait = seated
    .filter((p) => p.disconnected && !done(p))
    .map((p) => graceLeftMs(p, now))
    .filter((ms) => ms > 0);
  if (wait.length === 0) return { complete: true };
  return { complete: false, retryInMs: Math.max(...wait) + 250 };
}

/**
 * Whether the host role is free to claim: the host left, or has been
 * disconnected for longer than the grace period (`retryInMs` until then).
 */
export function hostVacant(
  raw: RoundRoom,
  now: number,
): { vacant: boolean; retryInMs?: number } {
  const host = raw.players?.[raw.hostUid];
  if (!host) return { vacant: true };
  if (!host.disconnected) return { vacant: false };
  const left = graceLeftMs(host, now);
  return left > 0 ? { vacant: false, retryInMs: left + 250 } : { vacant: true };
}

/**
 * Back in the lobby, but the player's client has not cleared the last
 * round's data yet (each player resets their own node). Their old "ready"
 * must not count until it has: a round started before then would carry
 * their previous finish into the new one.
 */
export function needsReset(raw: Pick<RoundRoom, "status">, p: RoundPlayer) {
  return raw.status === "waiting" && p.round !== undefined && p.round !== null;
}
