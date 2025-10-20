import { useCallback } from 'react';
import { ref, set, get, runTransaction } from 'firebase/database';
import { database } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

export interface GameResult {
  score: number;
  duration: number;
  gameModeId?: string;
  timestamp?: number;
}

export interface UserStats {
  gamesPlayed: number;
  totalScore: number;
  highScore: number;
  averageScore: number;
  lastPlayed: number;
}

export function useStats() {
  const { user } = useAuth();

  const saveGameResult = useCallback(
    async (result: GameResult) => {
      if (!user) {
        console.warn('Cannot save stats: user not authenticated');
        return;
      }

      const timestamp = result.timestamp || Date.now();
      const gameId = `game_${timestamp}`;

      try {
        // Save game to history
        const gameHistoryRef = ref(database, `users/${user.uid}/gameHistory/${gameId}`);
        await set(gameHistoryRef, {
          score: result.score,
          duration: result.duration,
          gameModeId: result.gameModeId || 'custom',
          timestamp,
        });

        // Update user stats
        const statsRef = ref(database, `users/${user.uid}/stats`);
        await runTransaction(statsRef, (currentStats) => {
          const stats = currentStats || {
            gamesPlayed: 0,
            totalScore: 0,
            highScore: 0,
            averageScore: 0,
            lastPlayed: 0,
          };

          const newGamesPlayed = stats.gamesPlayed + 1;
          const newTotalScore = stats.totalScore + result.score;
          const newHighScore = Math.max(stats.highScore, result.score);
          const newAverageScore = newTotalScore / newGamesPlayed;

          return {
            gamesPlayed: newGamesPlayed,
            totalScore: newTotalScore,
            highScore: newHighScore,
            averageScore: Math.round(newAverageScore * 100) / 100,
            lastPlayed: timestamp,
          };
        });

        // Update leaderboard if game mode is specified
        if (result.gameModeId) {
          const leaderboardRef = ref(
            database,
            `leaderboards/${result.gameModeId}/${user.uid}`
          );
          const currentLeaderboardEntry = await get(leaderboardRef);
          const currentBestScore = currentLeaderboardEntry.val()?.score || 0;

          if (result.score > currentBestScore) {
            await set(leaderboardRef, {
              displayName: user.displayName || ('isGuest' in user && user.isGuest ? 'Guest' : 'User'),
              score: result.score,
              timestamp,
            });
          }
        }
      } catch (error) {
        console.error('Error saving game result:', error);
        throw error;
      }
    },
    [user]
  );

  const getUserStats = useCallback(async (): Promise<UserStats | null> => {
    if (!user) return null;

    try {
      const statsRef = ref(database, `users/${user.uid}/stats`);
      const snapshot = await get(statsRef);
      return snapshot.val();
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }, [user]);

  return {
    saveGameResult,
    getUserStats,
  };
}

