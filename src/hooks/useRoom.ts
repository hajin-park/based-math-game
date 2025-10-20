import { useState, useCallback } from 'react';
import { ref, set, get, onValue, off, remove, push } from 'firebase/database';
import { database } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { GameMode } from '@/types/gameMode';

export interface RoomPlayer {
  uid: string;
  displayName: string;
  ready: boolean;
  score: number;
  finished: boolean;
}

export interface Room {
  id: string;
  hostUid: string;
  gameMode: GameMode;
  players: Record<string, RoomPlayer>;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  startedAt?: number;
}

export function useRoom() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createRoom = useCallback(
    async (gameMode: GameMode): Promise<string> => {
      if (!user) throw new Error('Must be authenticated to create room');

      setLoading(true);
      try {
        const roomsRef = ref(database, 'rooms');
        const newRoomRef = push(roomsRef);
        const roomId = newRoomRef.key!;

        const room: Omit<Room, 'id'> = {
          hostUid: user.uid,
          gameMode,
          players: {
            [user.uid]: {
              uid: user.uid,
              displayName: user.displayName || 'Guest',
              ready: false,
              score: 0,
              finished: false,
            },
          },
          status: 'waiting',
          createdAt: Date.now(),
        };

        await set(newRoomRef, room);
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

        if (Object.keys(room.players).length >= 4) {
          throw new Error('Room is full');
        }

        const playerRef = ref(database, `rooms/${roomId}/players/${user.uid}`);
        await set(playerRef, {
          uid: user.uid,
          displayName: user.displayName || 'Guest',
          ready: false,
          score: 0,
          finished: false,
        });
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
        const playerRef = ref(database, `rooms/${roomId}/players/${user.uid}`);
        await remove(playerRef);

        // If host leaves, delete the room
        const roomRef = ref(database, `rooms/${roomId}`);
        const snapshot = await get(roomRef);
        const room = snapshot.val();

        if (room && room.hostUid === user.uid) {
          await remove(roomRef);
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

        const allReady = Object.values(room.players).every((p) => (p as RoomPlayer).ready);
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

  const subscribeToRoom = useCallback((roomId: string, callback: (room: Room) => void) => {
    const roomRef = ref(database, `rooms/${roomId}`);
    
    const listener = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: roomId, ...snapshot.val() });
      }
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
    subscribeToRoom,
  };
}

