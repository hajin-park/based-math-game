import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  User,
  AuthError,
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getAdditionalUserInfo,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { ref, remove } from "firebase/database";
import { auth, database } from "@/firebase/config";
import { validateDisplayName } from "@/utils/displayNameValidator";
import { generateGuestName } from "@/lib/guestName";
import {
  clampDisplayName,
  deleteUserData,
  ensureUserProfile,
  propagateDisplayName,
} from "@/data/profile";
import { importLocalRuns } from "@/data/runs";
import { clearLocalRuns, clearLocalSettings } from "@/data/localStore";

/**
 * Authentication model
 * --------------------
 * Every visitor gets a real Firebase uid. Guests are Firebase *anonymous*
 * users (`user.isAnonymous`), so security rules can rely on `auth.uid` for
 * everyone. Signing up / signing in with Google while a guest *links* the
 * credential to the anonymous user, keeping the uid (and any multiplayer
 * room membership) intact.
 *
 * Startup: the app renders immediately; nothing waits on auth except
 * components that explicitly check `loading`. When Firebase reports that no
 * user is persisted, an anonymous sign-in starts right away in the background
 * (eager), so by the time someone clicks "Create room" a uid already exists
 * and the action has no extra round trip. Crawlers are skipped (they would
 * only create junk accounts) and get a lazy sign-in via `ensureUser()`.
 */

interface AuthContextType {
  /** Current Firebase user (anonymous for guests). Null until signed in. */
  user: User | null;
  /** True until the initial auth state (incl. automatic guest sign-in) settles. */
  loading: boolean;
  /** True for anonymous users and when nobody is signed in yet. */
  isGuest: boolean;
  /** Resolves with a signed-in user, signing in anonymously if needed. */
  ensureUser: () => Promise<User>;
  /** Kept for existing call sites: ensures an anonymous session exists. */
  signInAsGuest: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  /**
   * Deletes all of the user's data and then the auth user. Email/password
   * accounts that signed in more than a few minutes ago must pass their
   * password (otherwise an error with code "auth/requires-recent-login" is
   * thrown); Google accounts are re-authenticated with a popup.
   */
  deleteAccount: (options?: { password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

const BOT_UA = /bot|crawler|spider|crawling|slurp|lighthouse|prerender/i;
const RECENT_LOGIN_MS = 4 * 60 * 1000;

function isBot(): boolean {
  return typeof navigator !== "undefined" && BOT_UA.test(navigator.userAgent);
}

function authCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as AuthError).code)
    : undefined;
}

function friendlyError(
  code: string,
  message: string,
): Error & { code: string } {
  return Object.assign(new Error(message), { code });
}

// One in-flight anonymous sign-in shared by everybody who needs a uid.
let pendingAnonymous: Promise<User> | null = null;

function signInGuest(): Promise<User> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  if (!pendingAnonymous) {
    pendingAnonymous = signInAnonymously(auth)
      .then(async ({ user }) => {
        if (!user.displayName) {
          // Best effort: a friendly name for rooms/chat. Not fatal if it fails.
          await updateProfile(user, { displayName: generateGuestName() }).catch(
            () => undefined,
          );
        }
        return user;
      })
      .finally(() => {
        pendingAnonymous = null;
      });
  }
  return pendingAnonymous;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  // Bumped after in-place profile changes (displayName) so consumers re-render.
  const [, setProfileVersion] = useState(0);

  const refreshUser = useCallback(() => {
    setUser(auth.currentUser);
    setProfileVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setLoading(false);
        if (!firebaseUser.isAnonymous) {
          ensureUserProfile(firebaseUser).catch((error) =>
            console.error("Error creating user profile:", error),
          );
        }
        return;
      }
      // Nobody signed in: create a guest session in the background.
      if (isBot()) {
        setLoading(false);
        return;
      }
      signInGuest()
        .then(() => refreshUser())
        .catch((error) => {
          // Offline or Anonymous provider disabled; ensureUser() retries later.
          console.error("Anonymous sign-in failed:", error);
          setLoading(false);
        });
    });
    return () => unsubscribe();
  }, [refreshUser]);

  const ensureUser = useCallback(async () => {
    const u = auth.currentUser ?? (await signInGuest());
    refreshUser();
    return u;
  }, [refreshUser]);

  const signInAsGuest = useCallback(async () => {
    await ensureUser();
  }, [ensureUser]);

  /** Runs after a guest successfully became a registered user (same uid). */
  const finishUpgrade = useCallback(
    async (upgraded: User) => {
      await ensureUserProfile(upgraded).catch((error) =>
        console.error("Error creating user profile:", error),
      );
      await importLocalRuns(upgraded);
      refreshUser();
    },
    [refreshUser],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      // Signing into an existing account abandons the guest session; the
      // guest's local progress belongs to whoever used this device as a guest,
      // so it is dropped rather than merged into someone else's account.
      const wasGuest = auth.currentUser?.isAnonymous ?? false;
      await signInWithEmailAndPassword(auth, email, password);
      if (wasGuest) clearLocalRuns();
      refreshUser();
    },
    [refreshUser],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      const validation = validateDisplayName(displayName);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      const name = clampDisplayName(displayName);
      const current = auth.currentUser;

      try {
        let registered: User;
        if (current?.isAnonymous) {
          // Upgrade in place: same uid, guest progress carries over.
          const credential = EmailAuthProvider.credential(email, password);
          registered = (await linkWithCredential(current, credential)).user;
        } else {
          registered = (
            await createUserWithEmailAndPassword(auth, email, password)
          ).user;
        }
        await updateProfile(registered, { displayName: name });
        await finishUpgrade(registered);
      } catch (error) {
        const code = authCode(error);
        if (
          code === "auth/email-already-in-use" ||
          code === "auth/credential-already-in-use"
        ) {
          // The account exists already: sign into it if the password matches.
          try {
            await signInWithEmail(email, password);
            return;
          } catch {
            throw friendlyError(
              "auth/email-already-in-use",
              "An account with this email already exists. Please sign in instead.",
            );
          }
        }
        throw error;
      }
    },
    [finishUpgrade, signInWithEmail],
  );

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const current = auth.currentUser;

    if (current?.isAnonymous) {
      try {
        const result = await linkWithPopup(current, provider);
        // Keep the guest's friendly name; never use the Google photo.
        await updateProfile(result.user, {
          displayName: clampDisplayName(
            current.displayName || generateGuestName(),
          ),
          photoURL: null,
        });
        await finishUpgrade(result.user);
        return;
      } catch (error) {
        const code = authCode(error);
        if (
          code !== "auth/credential-already-in-use" &&
          code !== "auth/email-already-in-use"
        ) {
          throw error;
        }
        // This Google account already has a user: sign into it instead.
        const credential = GoogleAuthProvider.credentialFromError(
          error as AuthError,
        );
        if (credential) {
          await signInWithCredential(auth, credential);
        } else {
          await signInWithPopup(auth, provider);
        }
        clearLocalRuns();
        refreshUser();
        return;
      }
    }

    const result = await signInWithPopup(auth, provider);
    if (getAdditionalUserInfo(result)?.isNewUser) {
      await updateProfile(result.user, {
        displayName: generateGuestName(),
        photoURL: null,
      });
    }
    await ensureUserProfile(result.user).catch(() => undefined);
    refreshUser();
  }, [finishUpgrade, refreshUser]);

  const signOut = useCallback(async () => {
    const current = auth.currentUser;
    if (current?.isAnonymous) {
      // Signing out a guest would orphan the anonymous account; just keep it.
      return;
    }
    await firebaseSignOut(auth);
    // onAuthStateChanged(null) starts a fresh guest session.
  }, []);

  const updateDisplayName = useCallback(
    async (displayName: string) => {
      const current = auth.currentUser ?? (await signInGuest());
      const validation = validateDisplayName(displayName);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      const name = clampDisplayName(displayName);
      await updateProfile(current, { displayName: name });
      if (!current.isAnonymous) {
        await propagateDisplayName(current.uid, name);
      }
      refreshUser();
    },
    [refreshUser],
  );

  const deleteAccount = useCallback(async (options?: { password?: string }) => {
    const current = auth.currentUser;
    if (!current) throw new Error("Not signed in");

    if (!current.isAnonymous) {
      const lastSignIn = Date.parse(current.metadata.lastSignInTime || "");
      const recent =
        Number.isFinite(lastSignIn) &&
        Date.now() - lastSignIn < RECENT_LOGIN_MS;
      if (!recent) {
        const providers = current.providerData.map((p) => p.providerId);
        if (providers.includes("google.com")) {
          await reauthenticateWithPopup(current, new GoogleAuthProvider());
        } else if (options?.password && current.email) {
          await reauthenticateWithCredential(
            current,
            EmailAuthProvider.credential(current.email, options.password),
          );
        } else {
          throw friendlyError(
            "auth/requires-recent-login",
            "For your security, please confirm your password to delete your account.",
          );
        }
      }
      await deleteUserData(current.uid);
    }

    await remove(ref(database, `presence/${current.uid}`)).catch(
      () => undefined,
    );
    clearLocalRuns();
    clearLocalSettings();

    try {
      await deleteUser(current);
    } catch (error) {
      if (authCode(error) === "auth/requires-recent-login") {
        throw friendlyError(
          "auth/requires-recent-login",
          "Your data was deleted, but please sign in again to finish deleting your account.",
        );
      }
      throw error;
    }
    // onAuthStateChanged(null) starts a fresh guest session.
  }, []);

  const isGuest = !user || user.isAnonymous;

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isGuest,
      ensureUser,
      signInAsGuest,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      updateDisplayName,
      deleteAccount,
    }),
    // displayName is read from the mutable User object, so include it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      user,
      user?.displayName,
      user?.isAnonymous,
      loading,
      isGuest,
      ensureUser,
      signInAsGuest,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      updateDisplayName,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
