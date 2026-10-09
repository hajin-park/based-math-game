/**
 * Turns Firebase Auth errors into short, human sentences. Never show a raw
 * "Firebase: Error (auth/...)" string to a student.
 */

export type AuthField = "email" | "password" | "displayName";

export interface FriendlyAuthError {
  message: string;
  /** The form field the error belongs to, when there is one. */
  field?: AuthField;
  /** The user cancelled (closed a popup): show nothing. */
  silent?: boolean;
  code?: string;
}

const MESSAGES: Record<string, Omit<FriendlyAuthError, "code">> = {
  "auth/invalid-email": {
    message: "That doesn’t look like an email address.",
    field: "email",
  },
  "auth/missing-email": { message: "Enter your email address.", field: "email" },
  "auth/missing-password": { message: "Enter your password.", field: "password" },
  "auth/user-not-found": {
    message: "Email or password is incorrect.",
    field: "password",
  },
  "auth/wrong-password": {
    message: "Email or password is incorrect.",
    field: "password",
  },
  "auth/invalid-credential": {
    message: "Email or password is incorrect.",
    field: "password",
  },
  "auth/invalid-login-credentials": {
    message: "Email or password is incorrect.",
    field: "password",
  },
  "auth/user-disabled": {
    message: "This account has been disabled. Open an issue on GitHub if you think that’s a mistake.",
  },
  "auth/too-many-requests": {
    message: "Too many attempts. Wait a minute, then try again.",
  },
  "auth/network-request-failed": {
    message: "Can’t reach the server. Check your connection and try again.",
  },
  "auth/email-already-in-use": {
    message: "An account with this email already exists. Sign in instead.",
    field: "email",
  },
  "auth/credential-already-in-use": {
    message: "That account is already linked to another player. Sign in instead.",
  },
  "auth/account-exists-with-different-credential": {
    message: "This email is registered with a password. Sign in with email and password.",
  },
  "auth/weak-password": {
    message: "Use at least 8 characters for your password.",
    field: "password",
  },
  "auth/requires-recent-login": {
    message: "For your security, confirm your password to continue.",
    field: "password",
  },
  "auth/popup-blocked": {
    message: "Your browser blocked the Google window. Allow pop-ups for this site and try again.",
  },
  "auth/operation-not-allowed": {
    message: "This sign-in method isn’t available right now.",
  },
  "auth/unauthorized-domain": {
    message: "Google sign-in isn’t available on this address.",
  },
  "auth/user-mismatch": {
    message: "That’s a different account from the one you’re signed in with.",
  },
  "auth/user-token-expired": {
    message: "Your session expired. Sign in again.",
  },
  "auth/expired-action-code": {
    message: "That link has expired. Request a new one.",
  },
  "auth/invalid-action-code": {
    message: "That link is invalid or was already used. Request a new one.",
  },
  "auth/internal-error": {
    message: "Something went wrong on our side. Try again in a moment.",
  },
};

const SILENT = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
]);

const FALLBACK = "Something went wrong. Please try again.";

function codeOf(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  // Some wrapped errors only carry the code inside the message.
  const msg = error instanceof Error ? error.message : String(error ?? "");
  const m = /\((auth\/[a-z-]+)\)/.exec(msg);
  return m?.[1];
}

/** Maps any thrown value to a friendly message (and the field it concerns). */
export function friendlyAuthError(error: unknown): FriendlyAuthError {
  const code = codeOf(error);
  if (code && SILENT.has(code)) return { message: "", silent: true, code };

  // Errors the app creates itself (AuthContext, display-name validation)
  // already carry a human message; only trust messages that aren't Firebase's.
  const ownMessage =
    error instanceof Error &&
    error.message &&
    !/firebase|auth\//i.test(error.message)
      ? error.message
      : undefined;

  if (code && MESSAGES[code]) {
    // A custom message from AuthContext beats the generic mapping.
    if (ownMessage && code !== "auth/requires-recent-login") {
      return { ...MESSAGES[code], message: ownMessage, code };
    }
    return { ...MESSAGES[code], code };
  }
  if (ownMessage) {
    const field: AuthField | undefined = /display name/i.test(ownMessage)
      ? "displayName"
      : undefined;
    return { message: ownMessage, field, code };
  }
  return { message: FALLBACK, code };
}

/**
 * A same-origin, app-relative redirect target from `?next=`, or the fallback.
 * Rejects absolute URLs, protocol-relative ("//evil"), backslash tricks and
 * auth pages (to avoid loops).
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/",
): string {
  if (!raw) return fallback;
  let value: string;
  try {
    value = decodeURIComponent(raw).trim();
  } catch {
    return fallback;
  }
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || [...value].some((c) => c.charCodeAt(0) < 32))
    return fallback;
  try {
    const url = new URL(value, "https://app.invalid");
    if (url.origin !== "https://app.invalid") return fallback;
    if (/^\/(login|signup)\/?$/.test(url.pathname)) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
