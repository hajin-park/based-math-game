import { browserPopupRedirectResolver, getRedirectResult } from "firebase/auth";
import { auth } from "@/firebase/app";

let warmed: Promise<unknown> | null = null;

/**
 * Loads Firebase's popup helper (Google's api.js + the auth iframe) ahead of
 * a click. Auth is initialized without the resolver so ordinary page views
 * skip those downloads; pages that offer Google sign-in call this on mount so
 * the popup can open straight from the click, which strict popup blockers
 * (Safari) require. getRedirectResult initializes the resolver and resolves
 * to null when no redirect is pending.
 */
export function warmUpGoogleSignIn(): void {
  if (warmed || typeof window === "undefined") return;
  warmed = getRedirectResult(auth, browserPopupRedirectResolver).catch(
    () => null,
  );
}
