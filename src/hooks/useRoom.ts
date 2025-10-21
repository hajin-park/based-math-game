import { useState, useCallback } from 'react';
import { ref, set, get, onValue, off, remove, push, onDisconnect, update } from 'firebase/database';
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
}

export function useRoom() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createRoom = useCallback(
    async (gameMode: GameMode, maxPlayers: number = 4): Promise<string> => {
      if (!user) throw new Error('Must be authenticated to create room');

      // Validate maxPlayers
      if (maxPlayers < 2 || maxPlayers > 10) {
        throw new Error('Max players must be between 2 and 10');
      }

      setLoading(true);
      try {
        const roomsRef = ref(database, 'rooms');
        const newRoomRef = push(roomsRef);
        const roomId = newRoomRef.key!;

        const room: Omit<Room, 'id'> = {
          hostUid: user.uid,
          gameMode,
          maxPlayers,
          players: {
            [user.uid]: {
              uid: user.uid,
              displayName: user.displayName || 'Guest',
              ready: true, // Host is always ready (doesn't need to mark themselves ready)
              score: 0,
              finished: false,
              wins: 0,
            },
          },
          status: 'waiting',
          createdAt: Date.now(),
        };

        await set(newRoomRef, room);

        // Set up host disconnect handler - remove host player on disconnect
        // Client-side listeners will handle host transfer or room deletion
        const hostPlayerRef = ref(database, `rooms/${roomId}/players/${user.uid}`);
        onDisconnect(hostPlayerRef).remove();

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

        const maxPlayers = room.maxPlayers || 4; // Default to 4 for backwards compatibility
        if (Object.keys(room.players).length >= maxPlayers) {
          throw new Error('Room is full');
        }

        const playerRef = ref(database, `rooms/${roomId}/players/${user.uid}`);
        await set(playerRef, {
          uid: user.uid,
          displayName: user.displayName || 'Guest',
          ready: false,
          score: 0,
          finished: false,
          wins: 0,
        });

        // Set up disconnect handler - remove player on disconnect
        onDisconnect(playerRef).remove();
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
        await set(ref(database, `rooms/${roomId}/startedAt`), Date.now());
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
      const players = Object.values(room.players);
      const hostExists = players.some((p: RoomPlayer) => p.uid === room.hostUid);

      if (!hostExists && players.length > 0) {
        // Host disconnected but players remain - transfer host to first player
        const newHost = players[0] as RoomPlayer;
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
      } else if (players.length === 0) {
        // No players left - delete the room
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
    subscribeToRoom,
  };
}

