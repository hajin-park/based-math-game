/**
 * Conversion between the compact mode reference stored in multiplayer rooms
 * (`rooms/{id}/mode = { id, custom? }`) and the legacy `GameMode` objects the
 * current multiplayer pages render. Once the pages move to the new engine
 * catalog they can use `room.mode` directly and this adapter can go.
 */
import type { QuestionSetting } from "@/contexts/GameContexts";
import { getGameModeById, type GameMode } from "@/types/gameMode";
import type { CustomConfigLike } from "@/data/types";

export interface RoomModeRef {
  /** Catalog mode id (e.g. "bytes-hex:sprint", or a legacy id), or "custom". */
  id: string;
  custom?: CustomConfigLike;
}

export const CUSTOM_ROOM_MODE_ID = "custom";
const LEGACY_CUSTOM_ID = "custom-playground";

const BASE_BY_NAME: Record<string, number> = {
  Binary: 2,
  Octal: 8,
  Decimal: 10,
  Hexadecimal: 16,
};
const NAME_BY_BASE: Record<number, string> = {
  2: "Binary",
  8: "Octal",
  10: "Decimal",
  16: "Hexadecimal",
};

/** Builds the stored room mode from a legacy GameMode (or passes a ref through). */
export function toRoomMode(mode: GameMode | RoomModeRef): RoomModeRef {
  if (!("questions" in mode)) {
    return mode.custom ? { id: mode.id, custom: mode.custom } : { id: mode.id };
  }
  if (mode.isOfficial !== false && getGameModeById(mode.id)) {
    return { id: mode.id };
  }
  const custom: CustomConfigLike = {
    conversions: mode.questions
      .filter(([from, to]) => BASE_BY_NAME[from] && BASE_BY_NAME[to])
      .slice(0, 16)
      .map(([from, to, min, max]) => ({
        from: BASE_BY_NAME[from],
        to: BASE_BY_NAME[to],
        min: Math.max(0, Math.floor(min)),
        max: Math.max(0, Math.floor(max)),
      })),
  };
  if (mode.targetQuestions) custom.targetCount = mode.targetQuestions;
  else if (mode.duration) custom.durationMs = mode.duration * 1000;
  return { id: CUSTOM_ROOM_MODE_ID, custom };
}

/** Resolves a stored room mode to the legacy GameMode shape for the pages. */
export function toLegacyGameMode(ref: RoomModeRef | undefined): GameMode {
  if (ref?.custom) {
    const questions: QuestionSetting[] = (ref.custom.conversions || []).map(
      (c) => [
        NAME_BY_BASE[c.from] ?? "Decimal",
        NAME_BY_BASE[c.to] ?? "Decimal",
        c.min,
        c.max,
      ],
    );
    return {
      id: LEGACY_CUSTOM_ID,
      name: "Custom Playground",
      description: "Custom room settings",
      difficulty: "Custom",
      isOfficial: false,
      questions,
      duration: ref.custom.targetCount
        ? 3600
        : Math.round((ref.custom.durationMs || 60_000) / 1000),
      targetQuestions: ref.custom.targetCount,
    };
  }
  const official = ref ? getGameModeById(ref.id) : undefined;
  if (official) return official;
  // Unknown (e.g. new engine catalog id): neutral placeholder so pages render.
  return {
    id: ref?.id ?? "unknown",
    name: ref?.id ?? "Unknown mode",
    description: "",
    difficulty: "Custom",
    duration: 60,
    questions: [],
  };
}
