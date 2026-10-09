import { clampDisplayName } from "./names";
import { DEFAULT_GAME_SETTINGS, type GameSettings } from "./types";

/** The only fields the security rules accept on `users/{uid}`. */
const PROFILE_KEYS = ["displayName", "createdAt", "settings"];
const SETTING_KEYS = Object.keys(DEFAULT_GAME_SETTINGS) as (keyof GameSettings)[];

export interface ProfileDoc {
  displayName: string;
  createdAt?: unknown;
  settings: GameSettings;
}

function isMap(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Known boolean settings from a stored map; anything else is dropped. */
function pickSettings(raw: unknown): Partial<GameSettings> {
  if (!isMap(raw)) return {};
  const out: Partial<GameSettings> = {};
  for (const key of SETTING_KEYS) {
    if (typeof raw[key] === "boolean") out[key] = raw[key] as boolean;
  }
  return out;
}

/**
 * Profiles written before the rebuild carry `uid`, `email`, `photoURL` and
 * `lastSeen`, and keep settings under `gameSettings`. The rules validate the
 * whole document on every write, so a merge into such a profile (settings,
 * display name) is always rejected.
 *
 * Returns the profile in the current shape, or null when `data` already fits
 * it. `createdAt` is kept as stored because the rules forbid changing it;
 * `gameSettings` is carried over to `settings`.
 */
export function upgradeLegacyProfile(
  data: Record<string, unknown>,
  fallbackName: string | null | undefined,
): ProfileDoc | null {
  const name = data.displayName;
  const fits =
    Object.keys(data).every((k) => PROFILE_KEYS.includes(k)) &&
    (name === undefined ||
      (typeof name === "string" && clampDisplayName(name) === name)) &&
    (data.settings === undefined ||
      (isMap(data.settings) && Object.keys(data.settings).length <= 32));
  if (fits) return null;

  const profile: ProfileDoc = {
    displayName: clampDisplayName(
      typeof name === "string" ? name : fallbackName,
    ),
    settings: {
      ...DEFAULT_GAME_SETTINGS,
      ...pickSettings(data.gameSettings),
      ...pickSettings(data.settings),
    },
  };
  if ("createdAt" in data) profile.createdAt = data.createdAt;
  return profile;
}
