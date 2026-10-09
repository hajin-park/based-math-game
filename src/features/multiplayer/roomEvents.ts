/**
 * System lines for the room feed ("Ada joined", "You are now the host"),
 * derived on each client by diffing consecutive room snapshots. They are not
 * stored: the server only lets hosts write system chat, and a burst of joins
 * would trip the chat rate limit.
 */
import { roomNames } from "./names";

export interface EventPlayer {
  uid: string;
  displayName: string;
  joinedAt?: number;
  disconnected?: boolean;
}

export interface EventRoom {
  hostUid: string;
  status: string;
  players: Record<string, EventPlayer>;
  kicked?: Record<string, boolean>;
  /** Display name of the room's mode, to announce changes. */
  modeName?: string;
}

export type RoomEventKind =
  | "joined"
  | "left"
  | "removed"
  | "host"
  | "disconnected"
  | "reconnected"
  | "renamed"
  | "mode";

export interface RoomEvent {
  kind: RoomEventKind;
  uid: string;
  text: string;
  /** Lines worth reading out (host changes, people leaving). */
  important: boolean;
}

export function diffRoomEvents(
  prev: EventRoom | null,
  next: EventRoom | null,
  myUid: string | undefined,
): RoomEvent[] {
  if (!prev || !next) return [];
  const events: RoomEvent[] = [];
  const prevNames = roomNames(Object.values(prev.players));
  const nextNames = roomNames(Object.values(next.players));
  const name = (uid: string) =>
    uid === myUid ? "You" : (nextNames.get(uid) ?? prevNames.get(uid) ?? "A player");

  for (const [uid, p] of Object.entries(next.players)) {
    const before = prev.players[uid];
    if (!before) {
      if (uid !== myUid)
        events.push({ kind: "joined", uid, text: `${name(uid)} joined`, important: false });
      continue;
    }
    if (uid === myUid) continue;
    if (!before.disconnected && p.disconnected) {
      events.push({
        kind: "disconnected",
        uid,
        text: `${name(uid)} lost connection`,
        important: true,
      });
    } else if (before.disconnected && !p.disconnected) {
      events.push({ kind: "reconnected", uid, text: `${name(uid)} is back`, important: false });
    }
    if (before.displayName !== p.displayName) {
      events.push({
        kind: "renamed",
        uid,
        text: `${prevNames.get(uid) ?? before.displayName} is now ${nextNames.get(uid) ?? p.displayName}`,
        important: false,
      });
    }
  }

  for (const uid of Object.keys(prev.players)) {
    if (next.players[uid] || uid === myUid) continue;
    const removed = !!next.kicked?.[uid];
    events.push({
      kind: removed ? "removed" : "left",
      uid,
      text: removed
        ? `${prevNames.get(uid) ?? "A player"} was removed by the host`
        : `${prevNames.get(uid) ?? "A player"} left`,
      important: true,
    });
  }

  if (prev.hostUid !== next.hostUid && next.players[next.hostUid]) {
    events.push({
      kind: "host",
      uid: next.hostUid,
      text:
        next.hostUid === myUid
          ? "You are now the host"
          : `${name(next.hostUid)} is now the host`,
      important: true,
    });
  }

  if (prev.modeName && next.modeName && prev.modeName !== next.modeName) {
    events.push({
      kind: "mode",
      uid: next.hostUid,
      text: `Mode changed to ${next.modeName}`,
      important: true,
    });
  }
  return events;
}
