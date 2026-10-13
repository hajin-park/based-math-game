/**
 * Server-aligned timestamps for saved runs.
 *
 * Run documents carry `endedAt` (ms since epoch), and the Firestore rules
 * only accept it up to five minutes past the server's `request.time`. A
 * device clock that runs fast would fail every save, so before writing we
 * measure how far this device is from Google's clock and stamp runs in
 * server time. The rules stay the referee: they still compare against
 * `request.time`.
 *
 * The reference is the issue time of a freshly minted Firebase ID token
 * (`iat`, set by the token service when it signs the token). Forcing one
 * refresh per half hour is cheap and needs no extra backend.
 */
import type { User } from "firebase/auth";

/** Offsets smaller than this are measurement noise; treat them as zero. */
const NOISE_MS = 2_000;
/** Re-measure at most this often. */
const TTL_MS = 30 * 60_000;

/**
 * (server − local) in ms, from a token issued at `issuedAtMs` (whole
 * seconds, as `iat` is) and the local clock just before and after the
 * refresh request. The token was signed somewhere inside that window; its
 * midpoint is the best local estimate, and `iat` is truncated, so the true
 * issue moment is on average half a second later.
 */
export function clockOffsetFrom(
  issuedAtMs: number,
  localBeforeMs: number,
  localAfterMs: number,
): number {
  if (
    !Number.isFinite(issuedAtMs) ||
    !Number.isFinite(localBeforeMs) ||
    !Number.isFinite(localAfterMs) ||
    localAfterMs < localBeforeMs
  )
    return 0;
  const offset = issuedAtMs + 500 - (localBeforeMs + localAfterMs) / 2;
  return Math.abs(offset) < NOISE_MS ? 0 : Math.round(offset);
}

/** A local timestamp moved onto the server clock. */
export function toServerTime(localMs: number, offsetMs: number): number {
  return Math.round(localMs + offsetMs);
}

let cached: { uid: string; offset: number; at: number } | null = null;

/**
 * Estimated (server − local) ms for this device. Never throws: when the
 * token cannot be refreshed (offline), it falls back to the last measurement
 * or zero, and the save proceeds as it always did.
 */
export async function serverClockOffset(user: User): Promise<number> {
  const now = Date.now();
  if (cached && cached.uid === user.uid && now - cached.at < TTL_MS)
    return cached.offset;
  try {
    const before = Date.now();
    const token = await user.getIdTokenResult(true);
    const after = Date.now();
    const offset = clockOffsetFrom(
      Date.parse(token.issuedAtTime),
      before,
      after,
    );
    cached = { uid: user.uid, offset, at: after };
    return offset;
  } catch {
    return cached?.uid === user.uid ? cached.offset : 0;
  }
}

/** Test hook: forget the cached measurement. */
export function resetServerClock() {
  cached = null;
}
