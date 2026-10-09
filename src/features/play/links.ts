/**
 * URLs for modes: run screen paths, shareable hub deep links and the
 * base64url-encoded custom drill config (`?c=`).
 */
import {
  CUSTOM_MAX_VALUE,
  normalizeCustomConfig,
  type Base,
  type CustomConfig,
  type QuestionKind,
} from "@/game";

const BASES: readonly Base[] = [2, 8, 10, 16];
const EXTRA_KINDS: readonly Exclude<QuestionKind, "convert">[] = [
  "power",
  "twos",
  "bitwise",
  "add",
  "color",
  "ascii",
];
/** Caps that keep shared links sane (the engine accepts more). */
export const CUSTOM_LIMITS = {
  conversions: 8,
  minDurationMs: 10_000,
  maxDurationMs: 600_000,
  minTarget: 5,
  maxTarget: 100,
} as const;

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(param: string): string {
  const b64 = param.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Compact, URL-safe encoding of a custom config. */
export function encodeCustomConfig(config: CustomConfig): string {
  const c = normalizeCustomConfig(config);
  const compact: Record<string, unknown> = {
    v: c.conversions.map((x) => [x.from, x.to, x.min, x.max]),
  };
  if (c.kinds?.length) compact.k = c.kinds;
  if (c.durationMs) compact.d = c.durationMs;
  else if (c.targetCount) compact.t = c.targetCount;
  return toBase64Url(JSON.stringify(compact));
}

const isInt = (n: unknown): n is number =>
  typeof n === "number" && Number.isInteger(n);

/**
 * Parse and validate a `?c=` value. Returns null for anything malformed:
 * unknown bases or kinds, out-of-range numbers, nothing playable.
 */
export function decodeCustomConfig(
  param: string | null | undefined,
): CustomConfig | null {
  if (!param || param.length > 2000) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(fromBase64Url(param));
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const conversions: CustomConfig["conversions"] = [];
  if (obj.v !== undefined) {
    if (!Array.isArray(obj.v) || obj.v.length > CUSTOM_LIMITS.conversions)
      return null;
    for (const item of obj.v) {
      if (!Array.isArray(item) || item.length !== 4) return null;
      const [from, to, min, max] = item;
      if (!BASES.includes(from as Base) || !BASES.includes(to as Base))
        return null;
      if (!isInt(min) || !isInt(max)) return null;
      if (min < 0 || max > CUSTOM_MAX_VALUE || min > max) return null;
      if (from === to) return null;
      conversions.push({ from: from as Base, to: to as Base, min, max });
    }
  }
  let kinds: CustomConfig["kinds"];
  if (obj.k !== undefined) {
    if (!Array.isArray(obj.k)) return null;
    if (!obj.k.every((k) => EXTRA_KINDS.includes(k as never))) return null;
    kinds = obj.k as CustomConfig["kinds"];
  }
  const config: CustomConfig = { conversions };
  if (kinds?.length) config.kinds = kinds;
  if (obj.d !== undefined) {
    if (
      !isInt(obj.d) ||
      obj.d < CUSTOM_LIMITS.minDurationMs ||
      obj.d > CUSTOM_LIMITS.maxDurationMs
    )
      return null;
    config.durationMs = obj.d;
  } else if (obj.t !== undefined) {
    if (
      !isInt(obj.t) ||
      obj.t < CUSTOM_LIMITS.minTarget ||
      obj.t > CUSTOM_LIMITS.maxTarget
    )
      return null;
    config.targetCount = obj.t;
  }
  try {
    return normalizeCustomConfig(config);
  } catch {
    return null;
  }
}

/** Path of the run screen for a mode (custom configs travel in `?c=`). */
export function runPath(modeId: string, custom?: CustomConfig): string {
  if (modeId === "custom" && custom)
    return `/play/custom?c=${encodeCustomConfig(custom)}`;
  return `/play/${modeId}`;
}

/** Shareable hub link that opens a mode's detail panel. */
export function hubLink(modeId: string, custom?: CustomConfig): string {
  const params = new URLSearchParams({ mode: modeId });
  if (modeId === "custom" && custom)
    params.set("c", encodeCustomConfig(custom));
  return `/play?${params.toString()}`;
}

export function absoluteUrl(path: string): string {
  return typeof window === "undefined"
    ? path
    : new URL(path, window.location.origin).toString();
}

export { EXTRA_KINDS };

export const DEFAULT_CUSTOM_CONFIG: CustomConfig = {
  conversions: [{ from: 2, to: 10, min: 0, max: 255 }],
  durationMs: 60_000,
};

/** Why a config can't be played yet, or null. */
export function customConfigProblem(c: CustomConfig): string | null {
  const usable = c.conversions.filter((x) => x.from !== x.to);
  if (usable.length === 0 && !(c.kinds && c.kinds.length))
    return "Add at least one conversion or question type.";
  if (c.conversions.some((x) => x.min > x.max))
    return "Each range needs its lowest value at or below its highest.";
  return null;
}
