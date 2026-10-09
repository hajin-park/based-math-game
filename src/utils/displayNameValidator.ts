/**
 * Display-name validation (sign-up, profile, multiplayer).
 *
 * Names are public (leaderboards, rooms), so a small blocklist keeps the most
 * common slurs and obscenities out. It is deliberately basic: short words are
 * matched as whole words only, so "Cassandra", "Michelle" or "Dickens" pass.
 * Length limits mirror the security rules (1..24 characters).
 */

export const DISPLAY_NAME_MAX = 24;

/** Blocked anywhere in the name (no common innocent words contain these). */
const BLOCKED_SUBSTRINGS = [
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "whore",
  "fuck",
  "pussy",
  "porn",
  "molest",
  "hitler",
];

/** Blocked only as whole words (they appear inside ordinary names). */
const BLOCKED_WORDS = [
  "fag",
  "cunt",
  "shit",
  "rape",
  "nazi",
  "slut",
  "bitch",
  "bastard",
  "ass",
  "asshole",
  "cock",
  "dick",
  "penis",
  "vagina",
  "sex",
  "kkk",
  "terrorist",
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/** Folds common character swaps ("sh1t", "f.u.c.k") before matching. */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t");
}

export function validateDisplayName(displayName: string): ValidationResult {
  const trimmed = (displayName ?? "").trim();
  if (!trimmed) {
    return { isValid: false, error: "Enter a display name." };
  }
  if (trimmed.length > DISPLAY_NAME_MAX) {
    return {
      isValid: false,
      error: `Display name must be ${DISPLAY_NAME_MAX} characters or fewer.`,
    };
  }
  // Control characters and zero-width/bidi tricks.
  const hasControl = [...trimmed].some((c) => {
    const n = c.charCodeAt(0);
    return n < 32 || n === 127;
  });
  if (hasControl || /[\u200b-\u200f\u202a-\u202e\u2066-\u2069]/.test(trimmed)) {
    return {
      isValid: false,
      error: "Display name contains characters we can’t show.",
    };
  }
  if (/[<>]/.test(trimmed)) {
    return { isValid: false, error: "Display name can’t contain < or >." };
  }

  const folded = normalize(trimmed);
  const squashed = folded.replace(/[^a-z]/g, "");
  const words = folded.split(/[^a-z]+/).filter(Boolean);
  if (
    BLOCKED_SUBSTRINGS.some((w) => squashed.includes(w)) ||
    words.some((w) => BLOCKED_WORDS.includes(w))
  ) {
    return {
      isValid: false,
      error: "Pick a different display name. It’s shown publicly.",
    };
  }

  const specialCount = (trimmed.match(/[^\p{L}\p{N}\s]/gu) || []).length;
  if (specialCount > 5) {
    return {
      isValid: false,
      error: "Use fewer symbols in your display name.",
    };
  }

  return { isValid: true };
}
