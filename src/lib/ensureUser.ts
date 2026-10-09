import { signInAnonymously, updateProfile, type User } from "firebase/auth";
import { auth } from "@/firebase/config";
import { generateGuestName } from "@/lib/guestName";

// One in-flight anonymous sign-in shared by everybody who needs a uid.
let pendingAnonymous: Promise<User> | null = null;

/**
 * Resolves with the signed-in user, signing in anonymously (as a guest with a
 * friendly generated display name) when nobody is signed in yet.
 */
export function ensureSignedIn(): Promise<User> {
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
