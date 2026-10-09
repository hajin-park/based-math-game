import { onDisconnect, ref, serverTimestamp, set } from "firebase/database";
import { database } from "@/firebase/config";

/**
 * Self-only presence at `presence/{uid}` (rules: only the user can read or
 * write it). Written while the user is in a multiplayer room so the
 * Realtime Database connection is only used when actually needed.
 */
export async function setPresence(
  uid: string,
  roomId: string | null,
): Promise<void> {
  const presenceRef = ref(database, `presence/${uid}`);
  try {
    if (roomId) {
      await set(presenceRef, {
        online: true,
        roomId,
        lastSeen: serverTimestamp(),
      });
      await onDisconnect(presenceRef).set({
        online: false,
        lastSeen: serverTimestamp(),
      });
    } else {
      await onDisconnect(presenceRef).cancel();
      await set(presenceRef, { online: false, lastSeen: serverTimestamp() });
    }
  } catch (error) {
    // Presence is informational only; never block room flows on it.
    console.warn("Presence update failed:", error);
  }
}
