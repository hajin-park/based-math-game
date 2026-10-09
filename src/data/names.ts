import { RULES_LIMITS } from "./limits";

/** Trims a display name to what the security rules accept (Firebase-free). */
export function clampDisplayName(name: string | null | undefined): string {
  const trimmed = (name || "").trim();
  return (trimmed || "Player").slice(0, RULES_LIMITS.displayNameMax);
}
