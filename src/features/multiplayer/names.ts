/**
 * Display names inside a room. Two players may pick the same name; the later
 * joiner is shown with a number ("Ada", "Ada 2") so nobody is ambiguous.
 */
import { validateDisplayName } from "@/utils/displayNameValidator";

/** Display names are 1-24 characters (database rules enforce the same). */
export const NAME_MAX = 24;

/** Returns an error message, or null when the name can be used. */
export function nameError(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Enter a name so others know who you are.";
  if (trimmed.length > NAME_MAX) return `Keep it to ${NAME_MAX} characters.`;
  const result = validateDisplayName(trimmed);
  return result.isValid ? null : (result.error ?? "Choose a different name.");
}

export interface NamedPlayer {
  uid: string;
  displayName: string;
  joinedAt?: number;
}

export function roomNames(players: readonly NamedPlayer[]): Map<string, string> {
  const sorted = [...players].sort(
    (a, b) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0) || a.uid.localeCompare(b.uid),
  );
  const seen = new Map<string, number>();
  const out = new Map<string, string>();
  for (const p of sorted) {
    const base = p.displayName.trim() || "Player";
    const key = base.toLocaleLowerCase();
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);
    out.set(p.uid, n === 1 ? base : `${base} ${n}`);
  }
  return out;
}

/** Initials for the avatar chip ("Ada Lovelace" → "AL", "SwiftFalcon417" → "SF"). */
export function initials(name: string): string {
  const words = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s_\-.]+/)
    .filter((w) => /[A-Za-z0-9]/.test(w));
  if (words.length === 0) return "?";
  const letters = words.slice(0, 2).map((w) => w.match(/[A-Za-z0-9]/)?.[0] ?? "");
  return letters.join("").toUpperCase();
}
