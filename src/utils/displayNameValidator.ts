/**
 * Display name validation utility
 * Provides basic content moderation for display names
 */

// List of common inappropriate words and slurs to block
// This is a basic list - not overly strict, just the most common offensive terms
const BLOCKED_WORDS = [
  // Common slurs and highly offensive terms
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "retarded",
  "cunt",
  "whore",
  "slut",
  "bitch",
  "bastard",
  // Common profanity (basic level)
  "fuck",
  "shit",
  "ass",
  "damn",
  "hell",
  "cock",
  "dick",
  "pussy",
  "penis",
  "vagina",
  // Hate speech indicators
  "nazi",
  "hitler",
  "kkk",
  "terrorist",
  // Sexual content
  "porn",
  "sex",
  "rape",
  "molest",
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a display name for inappropriate content
 * @param displayName - The display name to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateDisplayName(displayName: string): ValidationResult {
  // Check if empty or only whitespace
  if (!displayName || !displayName.trim()) {
    return {
      isValid: false,
      error: "Display name cannot be empty",
    };
  }

  // Check length (min 2, max 30 characters)
  const trimmed = displayName.trim();
  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: "Display name must be at least 2 characters long",
    };
  }

  if (trimmed.length > 30) {
    return {
      isValid: false,
      error: "Display name must be 30 characters or less",
    };
  }

  // Check for blocked words (case-insensitive)
  const lowerName = trimmed.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lowerName.includes(word)) {
      return {
        isValid: false,
        error:
          "Display name contains inappropriate content. Please choose a different name.",
      };
    }
  }

  // Check for excessive special characters (allow some, but not too many)
  const specialCharCount = (trimmed.match(/[^a-zA-Z0-9\s]/g) || []).length;
  if (specialCharCount > 5) {
    return {
      isValid: false,
      error: "Display name contains too many special characters",
    };
  }

  // All checks passed
  return {
    isValid: true,
  };
}
