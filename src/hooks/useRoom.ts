import { useState, useCallback } from 'react';
import { ref, set, get, onValue, off, remove, onDisconnect, update } from 'firebase/database';
import { database } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { GameMode } from '@/types/gameMode';

export interface RoomPlayer {
  uid: string;
  displayName: string;
  ready: boolean;
  score: number;
  finished: boolean;
  wins: number;
  disconnected?: boolean; // True if player is disconnected
  disconnectedAt?: number; // Timestamp when player disconnected
  kicked?: boolean; // True if player was kicked by host
  kickedAt?: number; // Timestamp when player was kicked
}

export interface Room {
  id: string;
  hostUid: string;
  gameMode: GameMode;
  players: Record<string, RoomPlayer>;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  startedAt?: number;
  maxPlayers: number; // Maximum number of players (2-10)
  allowVisualAids: boolean; // Host control: allow visual aids for all players
  enableCountdown: boolean; // Host control: enable countdown before game starts
}

export function useRoom() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Generate 8-character alphanumeric room code (A-Z, 0-9)
  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Helper to check if user is a guest
  const isGuestUser = (user: { uid: string } | null): boolean => {
    return user !== null && user.uid.startsWith('guest_');
  };

  const createRoom = useCallback(
    async (gameMode: GameMode, maxPlayers: number = 4): Promise<string> => {
      if (!user) throw new Error('Must be authenticated to create room');

      // Validate maxPlayers
      if (maxPlayers < 2 || maxPlayers > 10) {
        throw new Error('Max players must be between 2 and 10');
      }

      setLoading(true);
      try {
        // Generate unique room code with collision detection
        let roomId: string | null = null;
        let attempts = 0;
        const maxAttempts = 10;

        while (roomId === null && attempts < maxAttempts) {
          const candidateId = generateRoomCode();
          const roomRef = ref(database, `rooms/${candidateId}`);
          const snapshot = await get(roomRef);

          if (!snapshot.exists()) {
            roomId = candidateId;
          } else {
            attempts++;
          }
        }

        if (roomId === null) {
          throw new Error('Failed to generate unique room code. Please try again.');
        }

        const newRoomRef = ref(database, `rooms/${roomId}`);

        const room: Omit<Room, 'id'> = {
          hostUid: user.uid,
          gameMode,
          maxPlayers,
          allowVisualAids: true, // Default: allow visual aids
          enableCountdown: true, // Default: enable countdown
          players: {
            [user.uid]: {
              uid: user.uid,
              displayName: user.displayName || 'Guest',
              ready: true, // Host is always ready (doesn't need to mark themselves ready)
              score: 0,
              finished: false,
              wins: 0,
              disconnected: false,
            },
          },
          status: 'waiting',
          createdAt: Date.now(),
        };

        await set(newRoomRef, room);

        // Store room ID in localStorage for guest users to enable reconnection
        if (isGuestUser(user)) {
          localStorage.setItem(`guestRoom_${user.uid}`, roomId);
        }

        // Set up host disconnect handler
        const hostPlayerRef = ref(database, `rooms/${roomId}/players/${user.uid}`);

        if (isGuestUser(user)) {
          // Guest users: Remove completely on disconnect
          onDisconnect(hostPlayerRef).remove();
        } else {
          // Authenticated users: Mark as disconnected
          onDisconnect(hostPlayerRef).update({
            disconnected: true,
            disconnectedAt: Date.now(),
          });
        }

        return roomId;
      } catch (error) {
        console.error('Error creating room:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const joinRoom = useCallback(
    async (roomId: string) => {
      if (!user) throw new Error('Must be authenticated to join room');

      setLoading(true);
      try {
        const roomRef = ref(database, `rooms/${roomId}`);
        const snapshot = await get(roomRef);

        if (!snapshot.exists()) {
          throw new Error('Room not found');
        }

        const room = snapshot.val();

        if (room.status !== 'waiting') {
          throw new Error('Room is not accepting players');
        }

        const playerRef = ref(database, `rooms/${roomId}/players/${user.uid}`);
        const existingPlayer = room.players?.[user.uid];

        // Check if player is reconnecting (was disconnected or kicked)
        if (existingPlayer) {
          if (existingPlayer.kicked) {
            throw new Error('You have been removed from this room');
          }

          // Reconnecting - update disconnected status
          await update(playerRef, {
            disconnected: false,
            disconnectedAt: null,
          });
        } else {
          // New player joining
          const maxPlayers = room.maxPlayers || 4;
          const activePlayers = Object.values(room.players || {}).filter(
            (p: unknown) => !(p as RoomPlayer).disconnected && !(p as RoomPlayer).kicked
          );

          if (activePlayers.length >= maxPlayers) {
            throw new Error('Room is full');
          }

          await set(playerRef, {
            uid: user.uid,
            displayName: user.displayName || 'Guest',
            ready: false,
            score: 0,
            finished: false,
            wins: 0,
            disconnected: false,
          });
        }

        // Store room ID in localStorage for guest users to enable reconnection
        if (isGuestUser(user)) {
          localStorage.setItem(`guestRoom_${user.uid}`, roomId);
        }

        // Set up disconnect handler
        if (isGuestUser(user)) {
          // Guest users: Remove completely on disconnect
          onDisconnect(playerRef).remove();
        } else {
          // Authenticated users: Mark as disconnected
          onDisconnect(playerRef).update({
            disconnected: true,
            disconnectedAt: Date.now(),
          });
        }
      } catch (error) {
        console.error('Error joining room:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const leaveRoom = useCallback(
    async (roomId: string) => {
      if (!user) return;

      try {
        const roomRef = ref(database, `rooms/${roomId}`);
        const snapshot = await get(roomRef);
        const room = snapshot.val();

        if (!room) return;

        const playerRef = ref(database, `rooms/${roomId}/players/${user.uid}`);
        await remove(playerRef);

        // Clear stored room ID for guest users
        if (isGuestUser(user)) {
          localStorage.removeItem(`guestRoom_${user.uid}`);
        }

        // If host leaves, transfer host or delete room
        if (room.hostUid === user.uid) {
          const remainingPlayers = Object.keys(room.players).filter(uid => uid !== user.uid);

          if (remainingPlayers.length > 0) {
            // Transfer host to the first remaining player
            const newHostUid = remainingPlayers[0];
            const updates: Record<string, string | boolean | number | null> = {
              'hostUid': newHostUid,
              [`players/${newHostUid}/ready`]: true, // New host is automatically ready
            };

            // If game is in progress, reset to waiting
            if (room.status === 'playing') {
              updates['status'] = 'waiting';
              updates['startedAt'] = null;

              // Reset all players' scores and finished status
              remainingPlayers.forEach((uid) => {
                updates[`players/${uid}/score`] = 0;
                updates[`players/${uid}/finished`] = false;
              });
            }

            await update(roomRef, updates);
          } else {
            // No players left, delete the room
            await remove(roomRef);
          }
        }
      } catch (error) {
        console.error('Error leaving room:', error);
        throw error;
      }
    },
    [user]
  );

  const setPlayerReady = useCallback(
    async (roomId: string, ready: boolean) => {
      if (!user) return;

      try {
        const readyRef = ref(database, `rooms/${roomId}/players/${user.uid}/ready`);
        await set(readyRef, ready);
      } catch (error) {
        console.error('Error setting ready status:', error);
        throw error;
      }
    },
    [user]
  );

  const startGame = useCallback(
    async (roomId: string) => {
      if (!user) return;

      try {
        const roomRef = ref(database, `rooms/${roomId}`);
        const snapshot = await get(roomRef);
        const room = snapshot.val();

        if (room.hostUid !== user.uid) {
          throw new Error('Only host can start the game');
        }

        // Check if all non-host players are ready (host doesn't need to be ready)
        const nonHostPlayers = Object.values(room.players).filter(
          (p) => (p as RoomPlayer).uid !== room.hostUid
        );
        const allReady = nonHostPlayers.length > 0 && nonHostPlayers.every((p) => (p as RoomPlayer).ready);
        if (!allReady) {
          throw new Error('All players must be ready');
        }

        await set(ref(database, `rooms/${roomId}/status`), 'playing');

        // If countdown is enabled, set startedAt to future time (after countdown completes)
        // Countdown duration: 3 seconds (counts 3, 2, 1, then completes)
        const countdownDelay = room.enableCountdown ? 3000 : 0;
        await set(ref(database, `rooms/${roomId}/startedAt`), Date.now() + countdownDelay);
      } catch (error) {
        console.error('Error starting game:', error);
        throw error;
      }
    },
    [user]
  );

  const updatePlayerScore = useCallback(
    async (roomId: string, score: number) => {
      if (!user) return;

      try {
        const scoreRef = ref(database, `rooms/${roomId}/players/${user.uid}/score`);
        await set(scoreRef, score);
      } catch (error) {
        console.error('Error updating score:', error);
        throw error;
      }
    },
    [user]
  );

  const finishGame = useCallback(
    async (roomId: string) => {
      if (!user) return;

      try {
        const finishedRef = ref(database, `rooms/${roomId}/players/${user.uid}/finished`);
        await set(finishedRef, true);

        // Check if all players finished
        const roomRef = ref(database, `rooms/${roomId}`);
        const snapshot = await get(roomRef);
        const room = snapshot.val();

        const allFinished = Object.values(room.players).every((p) => (p as RoomPlayer).finished);
        if (allFinished) {
          await set(ref(database, `rooms/${roomId}/status`), 'finished');
        }
      } catch (error) {
        console.error('Error finishing game:', error);
        throw error;
      }
    },
    [user]
  );

  const resetRoom = useCallback(
    async (roomId: string) => {
      if (!user) return;

      try {
        const roomRef = ref(database, `rooms/${roomId}`);
        const snapshot = await get(roomRef);
        const room = snapshot.val();

        if (!room) {
          throw new Error('Room not found');
        }

        // Reset all players' scores and finished status
        const updates: Record<string, number | boolean | string | null> = {};
        Object.keys(room.players).forEach((uid) => {
          updates[`players/${uid}/score`] = 0;
          updates[`players/${uid}/finished`] = false;
          // Keep host ready, set others to not ready
          updates[`players/${uid}/ready`] = uid === room.hostUid;
        });

        // Reset room status and remove startedAt
        updates['status'] = 'waiting';
        updates['startedAt'] = null;

        await update(ref(database, `rooms/${roomId}`), updates);
      } catch (error) {
        console.error('Error resetting room:', error);
        throw error;
      }
    },
    [user]
  );

  const incrementWins = useCallback(
    async (roomId: string, winnerId: string) => {
      try {
        const winnerRef = ref(database, `rooms/${roomId}/players/${winnerId}/wins`);
        const snapshot = await get(winnerRef);
        const currentWins = snapshot.val() || 0;
        await set(winnerRef, currentWins + 1);
      } catch (error) {
        console.error('Error incrementing wins:', error);
        throw error;
      }
    },
    []
  );

  const updateGameMode = useCallback(
    async (roomId: string, gameMode: GameMode) => {
      if (!user) throw new Error('Must be authenticated to update game mode');

      try {
        const roomRef = ref(database, `rooms/${roomId}`);
        const snapshot = await get(roomRef);
        const room = snapshot.val();

        if (!room) {
          throw new Error('Room not found');
        }

        if (room.hostUid !== user.uid) {
          throw new Error('Only the host can update game mode');
        }

        if (room.status !== 'waiting') {
          throw new Error('Cannot update game mode while game is in progress');
        }

        // Update game mode
        await set(ref(database, `rooms/${roomId}/gameMode`), gameMode);
      } catch (error) {
        console.error('Error updating game mode:', error);
        throw error;
      }
    },
    [user]
  );

  const kickPlayer = useCallback(
    async (roomId: string, playerUid: string) => {
      if (!user) return;

      try {
        const roomRef = ref(database, `rooms/${roomId}`);
        const snapshot = await get(roomRef);
        const room = snapshot.val();

        if (!room) {
          throw new Error('Room not found');
        }

        if (room.hostUid !== user.uid) {
          throw new Error('Only the host can kick players');
        }

        if (playerUid === user.uid) {
          throw new Error('Cannot kick yourself');
        }

        // Mark player as kicked
        const playerRef = ref(database, `rooms/${roomId}/players/${playerUid}`);
        await update(playerRef, {
          kicked: true,
          kickedAt: Date.now(),
        });
      } catch (error) {
        console.error('Error kicking player:', error);
        throw error;
      }
    },
    [user]
  );

  const subscribeToRoom = useCallback((
    roomId: string,
    callback: (room: Room | null) => void
  ) => {
    const roomRef = ref(database, `rooms/${roomId}`);

    const listener = onValue(roomRef, async (snapshot) => {
      if (!snapshot.exists()) {
        // Room was deleted
        callback(null);
        return;
      }

      const roomData = snapshot.val();
      const room: Room = { id: roomId, ...roomData };

      // Check if host is missing but players remain
      if (!room.players) {
        // No players in room, delete it
        try {
          await remove(roomRef);
          callback(null);
          return;
        } catch (error) {
          console.error('Error deleting empty room:', error);
        }
      }

      // Filter out any null/undefined/malformed players
      const allPlayers = Object.entries(room.players);
      const validPlayers = allPlayers.filter(
        ([, p]) => p !== null && p !== undefined && typeof p === 'object' && 'uid' in p && p.uid !== undefined
      );

      // Clean up ghost/malformed players if any exist
      if (validPlayers.length < allPlayers.length) {
        const updates: Record<string, null> = {};
        allPlayers.forEach(([uid, p]) => {
          if (!p || typeof p !== 'object' || !('uid' in p) || !p.uid) {
            updates[`players/${uid}`] = null; // Remove malformed player
          }
        });

        try {
          await update(roomRef, updates);
          // Don't call callback yet - wait for cleanup to propagate
          return;
        } catch (error) {
          console.error('Error cleaning up ghost players:', error);
        }
      }

      const players = validPlayers.map(([, p]) => p as RoomPlayer);

      // Check if host is disconnected and transfer to first connected player
      const host = players.find((p: RoomPlayer) => p.uid === room.hostUid);
      const hostDisconnected = host?.disconnected === true;

      if (hostDisconnected && players.length > 1) {
        // Find first connected, non-kicked player to transfer host to
        const newHost = players.find((p: RoomPlayer) =>
          p.uid !== room.hostUid && !p.disconnected && !p.kicked
        );

        if (newHost) {
          // Transfer host to connected player
          try {
            await update(roomRef, {
              hostUid: newHost.uid,
              [`players/${newHost.uid}/ready`]: true, // New host is automatically ready
            });
            // Don't call callback yet - wait for the update to propagate
            return;
          } catch (error) {
            console.error('Error transferring host:', error);
          }
        }
        // If no connected players available, keep disconnected host
      }

      // Check if all players are disconnected or kicked - delete room
      const activePlayerCount = players.filter((p: RoomPlayer) => !p.disconnected && !p.kicked).length;
      if (activePlayerCount === 0) {
        // No active players left - delete the room
        try {
          await remove(roomRef);
          callback(null);
          return;
        } catch (error) {
          console.error('Error deleting empty room:', error);
        }
      }

      callback(room);
    });

    return () => off(roomRef, 'value', listener);
  }, []);

  const updateRoomSettings = useCallback(
    async (roomId: string, settings: { allowVisualAids?: boolean; enableCountdown?: boolean }) => {
      if (!user) return;

      const roomRef = ref(database, `rooms/${roomId}`);

      try {
        // Get current room to verify user is host
        const snapshot = await get(roomRef);
        if (!snapshot.exists()) {
          throw new Error('Room not found');
        }

        const room = snapshot.val();
        if (room.hostUid !== user.uid) {
          throw new Error('Only the host can update room settings');
        }

        // Update settings
        await update(roomRef, settings);
      } catch (error) {
        console.error('Error updating room settings:', error);
        throw error;
      }
    },
    [user]
  );

  const transferHost = useCallback(
    async (roomId: string, newHostUid: string) => {
      if (!user) return;

      const roomRef = ref(database, `rooms/${roomId}`);

      try {
        // Get current room to verify user is host
        const snapshot = await get(roomRef);
        if (!snapshot.exists()) {
          throw new Error('Room not found');
        }

        const room = snapshot.val();
        if (room.hostUid !== user.uid) {
          throw new Error('Only the host can transfer host privileges');
        }

        // Verify new host is in the room
        if (!room.players[newHostUid] || room.players[newHostUid].kicked || room.players[newHostUid].disconnected) {
          throw new Error('New host must be an active player in the room');
        }

        // Transfer host, set new host as ready, and set old host as not ready
        await update(roomRef, {
          hostUid: newHostUid,
          [`players/${newHostUid}/ready`]: true,
          [`players/${user.uid}/ready`]: false,
        });
      } catch (error) {
        console.error('Error transferring host:', error);
        throw error;
      }
    },
    [user]
  );

  return {
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    setPlayerReady,
    startGame,
    updatePlayerScore,
    finishGame,
    resetRoom,
    incrementWins,
    updateGameMode,
    kickPlayer,
    updateRoomSettings,
    transferHost,
    subscribeToRoom,
  };
}

