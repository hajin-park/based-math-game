/**
 * Mode catalog. Mode ids:
 *   `${topicId}:${format}`  sprint / speedrun (ranked) and practice (unranked)
 *                           for every topic except custom
 *   `survival`              the single global survival mode (ranked)
 *   `daily:YYYY-MM-DD`      the daily challenge for a UTC date (ranked)
 *   `custom`                a custom config (unranked; config travels separately)
 */
import { FORMATS, isFormat } from "./formats";
import { getTopic, isTopicId, normalizeCustomConfig, TOPICS } from "./topics";
import type { CustomConfig, Format, GameMode, TopicId } from "./types";

export const SURVIVAL_MODE_ID = "survival";
export const CUSTOM_MODE_ID = "custom";

/** Formats each non-custom topic offers in the catalog. */
export const TOPIC_FORMATS: readonly Format[] = [
  "sprint",
  "speedrun",
  "practice",
];
const RANKED_TOPIC_FORMATS: readonly Format[] = ["sprint", "speedrun"];

export function modeId(topicId: TopicId, format: Format): string {
  return `${topicId}:${format}`;
}

function topicMode(topicId: TopicId, format: Format): GameMode {
  const spec = FORMATS[format];
  return {
    id: modeId(topicId, format),
    topicId,
    format,
    name: `${getTopic(topicId).name} · ${spec.name}`,
    ranked: spec.ranked,
    spec,
  };
}

const SURVIVAL_MODE: GameMode = {
  id: SURVIVAL_MODE_ID,
  topicId: "mixed",
  format: "survival",
  name: "Survival",
  ranked: true,
  spec: FORMATS.survival,
};

const STATIC_MODES: readonly GameMode[] = [
  ...TOPICS.filter((t) => t.id !== "custom").flatMap((t) =>
    TOPIC_FORMATS.map((f) => topicMode(t.id, f)),
  ),
  SURVIVAL_MODE,
];
const STATIC_BY_ID = new Map(STATIC_MODES.map((m) => [m.id, m]));

/** All static modes: every topic × {sprint, speedrun, practice} plus survival. Daily is per date; see dailyModeFor. */
export function listModes(): GameMode[] {
  return [...STATIC_MODES];
}

/** Ranked static modes: topic × {sprint, speedrun} plus survival (daily excluded). */
export function listRankedModes(): GameMode[] {
  return STATIC_MODES.filter((m) => m.ranked);
}

/** `YYYY-MM-DD` of a date in UTC. */
export function utcDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidDateKey(key: string): boolean {
  const m = DATE_RE.exec(key);
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return utcDateKey(d) === key;
}

/** The daily mode for a UTC date (Date or "YYYY-MM-DD"). */
export function dailyModeFor(date: Date | string = new Date()): GameMode {
  const key = typeof date === "string" ? date : utcDateKey(date);
  if (!isValidDateKey(key)) throw new Error(`Invalid daily date: ${key}`);
  return {
    id: `daily:${key}`,
    topicId: "mixed",
    format: "daily",
    name: `Daily · ${key}`,
    ranked: true,
    spec: FORMATS.daily,
  };
}

/** The date key of a daily mode id, or null. */
export function dailyDateOf(id: string): string | null {
  const m = /^daily:(.+)$/.exec(id);
  return m && isValidDateKey(m[1]) ? m[1] : null;
}

/**
 * A custom mode. Sprint when `durationMs` is set, speedrun when `targetCount`
 * is set, otherwise untimed practice. Never ranked.
 */
export function customMode(config: CustomConfig): GameMode {
  const custom = normalizeCustomConfig(config);
  const format: Format = custom.durationMs
    ? "sprint"
    : custom.targetCount
      ? "speedrun"
      : "practice";
  const base = FORMATS[format];
  const spec = {
    ...base,
    ranked: false,
    ...(format === "sprint" ? { durationMs: custom.durationMs } : {}),
    ...(format === "speedrun" ? { targetCount: custom.targetCount } : {}),
  };
  return {
    id: CUSTOM_MODE_ID,
    topicId: "custom",
    format,
    name: `Custom · ${base.name}`,
    ranked: false,
    spec,
    custom,
  };
}

export interface ParsedModeId {
  topicId: TopicId;
  format: Format;
  /** Daily only. */
  date?: string;
}

/** Parse a catalog mode id. Returns null for unknown ids and for `custom` (its config is not in the id). */
export function parseModeId(id: string): ParsedModeId | null {
  if (id === SURVIVAL_MODE_ID) return { topicId: "mixed", format: "survival" };
  const date = dailyDateOf(id);
  if (date) return { topicId: "mixed", format: "daily", date };
  const m = /^([a-z-]+):([a-z]+)$/.exec(id);
  if (!m || !isTopicId(m[1]) || !isFormat(m[2]) || m[1] === "custom")
    return null;
  if (!TOPIC_FORMATS.includes(m[2])) return null;
  return { topicId: m[1], format: m[2] };
}

/** Look up a mode by id (catalog modes and `daily:YYYY-MM-DD`). */
export function getMode(id: string): GameMode | undefined {
  const known = STATIC_BY_ID.get(id);
  if (known) return known;
  const date = dailyDateOf(id);
  return date ? dailyModeFor(date) : undefined;
}

/** Whether results of this mode id go to a leaderboard. */
export function isRankedModeId(id: string): boolean {
  const parsed = parseModeId(id);
  if (!parsed) return false;
  if (parsed.format === "survival" || parsed.format === "daily") return true;
  return RANKED_TOPIC_FORMATS.includes(parsed.format);
}
