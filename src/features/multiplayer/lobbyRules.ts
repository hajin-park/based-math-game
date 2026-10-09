import type { Room, RoomPlayer } from "@/hooks/useRoom";

/** Seat order for the lobby list: host first, then by join time. */
export function seatOrder(room: Room): RoomPlayer[] {
  return Object.values(room.players)
    .filter((p) => !p.kicked)
    .sort(
      (a, b) =>
        Number(b.uid === room.hostUid) - Number(a.uid === room.hostUid) ||
        (a.joinedAt ?? 0) - (b.joinedAt ?? 0) ||
        a.uid.localeCompare(b.uid),
    );
}

/** "Ada", "Ada and Linus", "Ada, Linus and Grace", "Ada, Linus and 3 others". */
export function listNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  if (names.length > 3)
    return `${names.slice(0, 2).join(", ")} and ${names.length - 2} others`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * Why the host can't start yet, or null when they can: at least two
 * connected players, everyone (but the host) ready, and a playable mode.
 * Disconnected players don't block the start.
 */
export function startBlocker(
  room: Pick<Room, "engineMode" | "players" | "hostUid">,
  names: Map<string, string>,
): string | null {
  if (!room.engineMode) return "Pick a mode in room settings first.";
  const present = Object.values(room.players).filter(
    (p) => !p.disconnected && !p.kicked,
  );
  if (present.length < 2)
    return "You need at least one more player. Share the code or the link.";
  const waiting = present.filter((p) => p.uid !== room.hostUid && !p.ready);
  if (waiting.length)
    return `Waiting for ${listNames(waiting.map((p) => names.get(p.uid) ?? p.displayName))} to get ready.`;
  return null;
}
