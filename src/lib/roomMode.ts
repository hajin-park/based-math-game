/**
 * The mode a multiplayer room plays, stored compactly at
 * `rooms/{id}/mode = { id, custom? }` and resolved against the engine catalog.
 *
 * Multiplayer formats: topic × sprint / speedrun, the global survival ramp,
 * and custom configs (sprint or speedrun). Practice (untimed) and the daily
 * challenge are not room formats.
 */
import {
  customMode,
  getMode,
  parseModeId,
  SURVIVAL_MODE_ID,
  type CustomConfig,
  type Format,
  type GameMode,
} from "@/game";
import type { CustomConfigLike } from "@/data/types";

export interface RoomModeRef {
  /** Catalog mode id (e.g. "bytes-hex:sprint", "survival") or "custom". */
  id: string;
  custom?: CustomConfigLike;
}

export const CUSTOM_ROOM_MODE_ID = "custom";
export const DEFAULT_ROOM_MODE: RoomModeRef = { id: "bytes-bin:sprint" };

/** Formats a room can be played in. */
export const ROOM_FORMATS: readonly Format[] = [
  "sprint",
  "speedrun",
  "survival",
];

export function isRoomFormat(format: Format): boolean {
  return ROOM_FORMATS.includes(format);
}

/** Whether a catalog id is playable in a room. */
export function isRoomModeId(id: string): boolean {
  if (id === SURVIVAL_MODE_ID) return true;
  const parsed = parseModeId(id);
  return !!parsed && (parsed.format === "sprint" || parsed.format === "speedrun");
}

/** Builds the stored ref for an engine mode (custom configs travel along). */
export function toRoomMode(mode: GameMode | RoomModeRef): RoomModeRef {
  if ("spec" in mode) {
    if (mode.custom) {
      const c = mode.custom;
      const custom: CustomConfigLike = {
        conversions: c.conversions.map((x) => ({ ...x })),
      };
      if (c.kinds?.length) custom.kinds = [...c.kinds];
      if (c.durationMs) custom.durationMs = c.durationMs;
      else if (c.targetCount) custom.targetCount = c.targetCount;
      return { id: CUSTOM_ROOM_MODE_ID, custom };
    }
    return { id: mode.id };
  }
  return mode.custom ? { id: mode.id, custom: mode.custom } : { id: mode.id };
}

/**
 * Resolves a stored ref to an engine mode. Returns null for refs that are
 * not playable in a room (unknown ids, practice, daily, untimed custom).
 */
export function resolveRoomMode(ref: RoomModeRef | undefined): GameMode | null {
  if (!ref) return null;
  if (ref.id === CUSTOM_ROOM_MODE_ID) {
    if (!ref.custom) return null;
    try {
      const mode = customMode(ref.custom as CustomConfig);
      return isRoomFormat(mode.format) ? mode : null;
    } catch {
      return null;
    }
  }
  if (!isRoomModeId(ref.id)) return null;
  return getMode(ref.id) ?? null;
}

/** One-line rules of a resolved room mode, e.g. "Most correct in 60 s". */
export function describeRoomMode(mode: GameMode): string {
  const spec = mode.spec;
  switch (mode.format) {
    case "sprint":
      return `Most correct answers in ${Math.round((spec.durationMs ?? 60_000) / 1000)} s`;
    case "speedrun":
      return `First to ${spec.targetCount ?? 15} correct wins · skips add ${Math.round((spec.skipPenaltyMs ?? 0) / 1000)} s`;
    case "survival":
      return `${spec.lives ?? 3} lives, shrinking clock · most cleared wins`;
    default:
      return spec.summary;
  }
}
