import { stripInvisibleChars } from "@/utils/displayNameValidator";
import { RULES_LIMITS } from "./limits";

/**
 * Makes a display name acceptable to the security rules (Firebase-free):
 * drops control/zero-width/bidi characters, trims, falls back to "Player",
 * and cuts to 24 UTF-16 units without splitting a surrogate pair.
 */
export function clampDisplayName(name: string | null | undefined): string {
  const trimmed = stripInvisibleChars(name || "").trim();
  let out = (trimmed || "Player").slice(0, RULES_LIMITS.displayNameMax);
  const last = out.charCodeAt(out.length - 1);
  if (last >= 0xd800 && last <= 0xdbff) out = out.slice(0, -1);
  return out.trim() || "Player";
}
