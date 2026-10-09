import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";

// Firebase app + Auth. Realtime Database and Firestore live in their own
// modules (./database, ./firestore) so the entry bundle only carries Auth;
// pages that need data pull those SDKs in with their own lazy chunks.

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const useEmulators =
  import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";

/**
 * Optional App Check (reCAPTCHA Enterprise).
 *
 * Enabled only when VITE_APPCHECK_SITE_KEY is set, so local development and
 * forks without a key keep working. It is initialized before any other
 * Firebase service is created so the very first Auth/RTDB/Firestore request
 * already carries a token.
 * Set VITE_APPCHECK_DEBUG_TOKEN (or "true" to have one generated and printed to
 * the console) to register a debug token for local testing against a project
 * that enforces App Check.
 */
const appCheckSiteKey = import.meta.env.VITE_APPCHECK_SITE_KEY as
  | string
  | undefined;
if (appCheckSiteKey && !useEmulators && typeof window !== "undefined") {
  const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN as
    | string
    | undefined;
  if (debugToken) {
    (
      self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken === "true" ? true : debugToken;
  }
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    console.error("App Check failed to initialize:", error);
  }
}

export const auth = getAuth(app);

/** Host and ports of the local emulators (dev only). */
export const emulatorHost = import.meta.env.VITE_EMULATOR_HOST || "127.0.0.1";

if (useEmulators) {
  connectAuthEmulator(
    auth,
    `http://${emulatorHost}:${import.meta.env.VITE_EMULATOR_AUTH_PORT || 9099}`,
    { disableWarnings: true },
  );
}
