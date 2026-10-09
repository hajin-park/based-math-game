/** Picker state for a room mode: a format plus (except survival) a topic. */
import {
  getTopic,
  modeId,
  parseModeId,
  SURVIVAL_MODE_ID,
  type CustomConfig,
  type TopicId,
} from "@/game";
import type { RoomModeRef } from "@/lib/roomMode";

export type RoomFormat = "sprint" | "speedrun" | "survival" | "custom";

export interface ModePickerValue {
  format: RoomFormat;
  topicId: TopicId;
  /** Only for the custom format; always timed (sprint or speedrun) in rooms. */
  custom?: CustomConfig;
}

/** Starting point for a custom room drill: 8-bit binary ↔ decimal sprint. */
export const DEFAULT_ROOM_CUSTOM: CustomConfig = {
  conversions: [
    { from: 2, to: 10, min: 0, max: 255 },
    { from: 10, to: 2, min: 0, max: 255 },
  ],
  durationMs: 60_000,
};

/** Splits a stored room mode into picker state (defaults for custom/unknown). */
export function pickerValueOf(mode: RoomModeRef | undefined): ModePickerValue {
  if (mode?.id === SURVIVAL_MODE_ID)
    return { format: "survival", topicId: "bytes-bin" };
  if (mode?.id === "custom" && mode.custom)
    return {
      format: "custom",
      topicId: "bytes-bin",
      custom: mode.custom as CustomConfig,
    };
  const parsed = mode ? parseModeId(mode.id) : null;
  if (parsed && (parsed.format === "sprint" || parsed.format === "speedrun"))
    return { format: parsed.format, topicId: parsed.topicId };
  return { format: "sprint", topicId: "bytes-bin" };
}

export function roomModeOf(value: ModePickerValue): RoomModeRef {
  if (value.format === "survival") return { id: SURVIVAL_MODE_ID };
  if (value.format === "custom")
    return { id: "custom", custom: value.custom ?? DEFAULT_ROOM_CUSTOM };
  return { id: modeId(value.topicId, value.format) };
}

export function modeTitle(value: ModePickerValue): string {
  if (value.format === "survival") return "Survival";
  if (value.format === "custom") return "Custom drill";
  const f = value.format === "sprint" ? "Sprint" : "Speedrun";
  return `${getTopic(value.topicId).name} · ${f}`;
}
