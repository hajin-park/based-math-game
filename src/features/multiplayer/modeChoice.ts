/** Picker state for a room mode: a format plus (except survival) a topic. */
import {
  getTopic,
  modeId,
  parseModeId,
  SURVIVAL_MODE_ID,
  type TopicId,
} from "@/game";
import type { RoomModeRef } from "@/lib/roomMode";

export type RoomFormat = "sprint" | "speedrun" | "survival";

export interface ModePickerValue {
  format: RoomFormat;
  topicId: TopicId;
}

/** Splits a stored room mode into picker state (defaults for custom/unknown). */
export function pickerValueOf(mode: RoomModeRef | undefined): ModePickerValue {
  if (mode?.id === SURVIVAL_MODE_ID)
    return { format: "survival", topicId: "bytes-bin" };
  const parsed = mode ? parseModeId(mode.id) : null;
  if (parsed && (parsed.format === "sprint" || parsed.format === "speedrun"))
    return { format: parsed.format, topicId: parsed.topicId };
  return { format: "sprint", topicId: "bytes-bin" };
}

export function roomModeOf(value: ModePickerValue): RoomModeRef {
  return value.format === "survival"
    ? { id: SURVIVAL_MODE_ID }
    : { id: modeId(value.topicId, value.format) };
}

export function modeTitle(value: ModePickerValue): string {
  if (value.format === "survival") return "Survival";
  const f = value.format === "sprint" ? "Sprint" : "Speedrun";
  return `${getTopic(value.topicId).name} · ${f}`;
}
