/**
 * Client-side cleanup service for expired guest accounts and empty rooms
 *
 * This service runs every 5 minutes on active clients to clean up:
 * 1. Guest accounts that have been disconnected for more than 5 minutes
 * 2. Rooms that have no active players
 * 3. Players in rooms who belong to deleted guest accounts
 *
 * Uses a distributed lock mechanism to ensure only one client runs cleanup at a time
 */

import { ref, get, update, remove, set, onDisconnect } from "firebase/database";
import { database } from "@/firebase/config";

// Configuration
const GUEST_TTL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run cleanup every 5 minutes
const LOCK_TIMEOUT_MS = 30 * 1000; // Lock expires after 30 seconds

let cleanupIntervalId: NodeJS.Timeout | null = null;
let isCleanupRunning = false;

/**
 * Acquire a distributed lock for cleanup operations
 * Returns true if lock was acquired, false otherwise
 */
async function acquireCleanupLock(): Promise<boolean> {
  const lockRef = ref(database, "cleanup/lock");
  const now = Date.now();

  try {
    const snapshot = await get(lockRef);
    const lockData = snapshot.val();

    // Check if lock exists and is still valid
    if (
      lockData &&
      lockData.timestamp &&
      now - lockData.timestamp < LOCK_TIMEOUT_MS
    ) {
      // Lock is held by another client
      return false;
    }

    // Try to acquire lock
    await set(lockRef, {
      timestamp: now,
      acquiredBy: `client_${Math.random().toString(36).substr(2, 9)}`,
    });

    // Set up automatic lock release on disconnect
    await onDisconnect(lockRef).remove();

    return true;
  } catch (error) {
    // Permission denied is expected when user is not authenticated or lock is held by another client
    // This is not an error, just normal operation
    if (error instanceof Error && error.message.includes("Permission denied")) {
      console.log(
        "[Cleanup] Cannot acquire lock (not authenticated or lock held by another client)",
      );
    } else {
      console.error("[Cleanup] Error acquiring cleanup lock:", error);
    }
    return false;
  }
}

/**
 * Release the cleanup lock
 */
async function releaseCleanupLock(): Promise<void> {
  const lockRef = ref(database, "cleanup/lock");
  try {
    await remove(lockRef);
  } catch (error) {
    console.error("Error releasing cleanup lock:", error);
  }
}

/**
 * Clean up expired guest accounts
 * Returns array of deleted guest UIDs
 */
async function cleanupExpiredGuestAccounts(): Promise<string[]> {
  const usersRef = ref(database, "users");

  try {
    const snapshot = await get(usersRef);
    const users = snapshot.val();

    if (!users) {
      return [];
    }

    const now = Date.now();
    const expiredGuestUids: string[] = [];
    const updates: Record<string, null> = {};

    for (const [uid, userData] of Object.entries(users)) {
      // Only process guest users
      const userRecord = userData as Record<string, unknown>;
      if (!uid.startsWith("guest_") || !userRecord.isGuest) {
        continue;
      }

      const user = userRecord as {
        isGuest: boolean;
        lastDisconnected?: number | string;
      };

      // Check if guest has been disconnected for more than TTL
      if (user.lastDisconnected) {
        const disconnectedTime =
          typeof user.lastDisconnected === "number"
            ? user.lastDisconnected
            : new Date(user.lastDisconnected).getTime();

        const timeSinceDisconnect = now - disconnectedTime;

        if (timeSinceDisconnect > GUEST_TTL_MS) {
          console.log(
            `[Cleanup] Deleting expired guest ${uid} (disconnected ${Math.round(timeSinceDisconnect / 1000)}s ago)`,
          );
          expiredGuestUids.push(uid);
          updates[`users/${uid}`] = null;
          updates[`presence/${uid}`] = null;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
      console.log(
        `[Cleanup] Deleted ${expiredGuestUids.length} expired guest accounts`,
      );
    }

    return expiredGuestUids;
  } catch (error) {
    console.error("[Cleanup] Error cleaning up guest accounts:", error);
    return [];
  }
}

/**
 * Clean up players in rooms who belong to deleted guest accounts
 */
async function cleanupDeletedGuestPlayers(
  deletedGuestUids: string[],
): Promise<void> {
  if (deletedGuestUids.length === 0) {
    return;
  }

  const roomsRef = ref(database, "rooms");

  try {
    const snapshot = await get(roomsRef);
    const rooms = snapshot.val();

    if (!rooms) {
      return;
    }

    const updates: Record<string, null> = {};
    let removedPlayersCount = 0;

    for (const [roomId, roomData] of Object.entries(rooms)) {
      const room = roomData as {
        players?: Record<string, unknown>;
      };
      if (!room.players) {
        continue;
      }

      for (const playerId of Object.keys(room.players)) {
        if (deletedGuestUids.includes(playerId)) {
          console.log(
            `[Cleanup] Removing deleted guest ${playerId} from room ${roomId}`,
          );
          updates[`rooms/${roomId}/players/${playerId}`] = null;
          removedPlayersCount++;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
      console.log(
        `[Cleanup] Removed ${removedPlayersCount} deleted guest players from rooms`,
      );
    }
  } catch (error) {
    console.error("[Cleanup] Error cleaning up deleted guest players:", error);
  }
}

/**
 * Clean up empty rooms
 */
async function cleanupEmptyRooms(): Promise<void> {
  const roomsRef = ref(database, "rooms");

  try {
    const snapshot = await get(roomsRef);
    const rooms = snapshot.val();

    if (!rooms) {
      return;
    }

    const updates: Record<string, null> = {};
    let emptyRoomCount = 0;

    for (const [roomId, roomData] of Object.entries(rooms)) {
      const room = roomData as {
        players?: Record<string, { disconnected?: boolean; kicked?: boolean }>;
        status?: string;
      };

      // Check if room has no players
      if (!room.players || Object.keys(room.players).length === 0) {
        console.log(`[Cleanup] Deleting empty room ${roomId} (no players)`);
        updates[`rooms/${roomId}`] = null;
        emptyRoomCount++;
        continue;
      }

      // Check if all players are disconnected or kicked
      const activePlayers = Object.values(room.players).filter(
        (player) => !player.disconnected && !player.kicked,
      );

      if (activePlayers.length === 0) {
        // Only delete waiting rooms with no active players
        // Keep playing/finished rooms for potential reconnection
        if (room.status === "waiting") {
          console.log(
            `[Cleanup] Deleting empty room ${roomId} (all players disconnected/kicked)`,
          );
          updates[`rooms/${roomId}`] = null;
          emptyRoomCount++;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
      console.log(`[Cleanup] Deleted ${emptyRoomCount} empty rooms`);
    }
  } catch (error) {
    console.error("[Cleanup] Error cleaning up empty rooms:", error);
  }
}

/**
 * Run the cleanup process
 */
async function runCleanup(): Promise<void> {
  // Prevent concurrent cleanup runs
  if (isCleanupRunning) {
    console.log("[Cleanup] Cleanup already running, skipping...");
    return;
  }

  // Try to acquire lock
  const lockAcquired = await acquireCleanupLock();
  if (!lockAcquired) {
    console.log("[Cleanup] Another client is running cleanup, skipping...");
    return;
  }

  isCleanupRunning = true;
  console.log("[Cleanup] Starting cleanup process...");

  try {
    // Step 1: Clean up expired guest accounts
    const deletedGuestUids = await cleanupExpiredGuestAccounts();

    // Step 2: Remove deleted guest players from rooms
    await cleanupDeletedGuestPlayers(deletedGuestUids);

    // Step 3: Clean up empty rooms
    await cleanupEmptyRooms();

    console.log("[Cleanup] Cleanup process completed successfully");
  } catch (error) {
    console.error("[Cleanup] Cleanup process failed:", error);
  } finally {
    // Release lock
    await releaseCleanupLock();
    isCleanupRunning = false;
  }
}

/**
 * Start the cleanup service
 * Should be called once when the app initializes
 */
export function startCleanupService(): void {
  if (cleanupIntervalId) {
    console.log("[Cleanup] Service already running");
    return;
  }

  console.log(
    `[Cleanup] Starting cleanup service (runs every ${CLEANUP_INTERVAL_MS / 1000}s)`,
  );

  // Run cleanup immediately on start
  runCleanup();

  // Schedule periodic cleanup
  cleanupIntervalId = setInterval(() => {
    runCleanup();
  }, CLEANUP_INTERVAL_MS);
}

/**
 * Stop the cleanup service
 * Should be called when the app is unmounting (cleanup)
 */
export function stopCleanupService(): void {
  if (cleanupIntervalId) {
    console.log("[Cleanup] Stopping cleanup service");
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}
