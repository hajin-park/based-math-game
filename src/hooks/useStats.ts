import { useCallback } from 'react';
import { doc, setDoc, getDoc, runTransaction, collection, addDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
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
  const { user, isGuest } = useAuth();

  const saveGameResult = useCallback(
    async (result: GameResult) => {
      if (!user) {
        console.warn('Cannot save stats: user not authenticated');
        return;
      }

      // Guest users cannot save to Firestore (persistent storage)
      // Check both isGuest flag and UID prefix for reliability
      const userIsGuest = isGuest || user.uid.startsWith('guest_');
      if (userIsGuest) {
        console.warn('Guest users cannot save stats to persistent storage');
        return;
      }

      const timestamp = result.timestamp || Date.now();

      try {
        // Save game to history (Firestore subcollection)
        const gameHistoryRef = collection(firestore, `userStats/${user.uid}/gameHistory`);
        await addDoc(gameHistoryRef, {
          score: result.score,
          duration: result.duration,
          gameModeId: result.gameModeId || 'custom',
          timestamp,
        });

        // Update user stats (Firestore transaction)
        const statsRef = doc(firestore, `userStats/${user.uid}`);
        await runTransaction(firestore, async (transaction) => {
          const statsDoc = await transaction.get(statsRef);
          const currentStats = statsDoc.exists() ? statsDoc.data() as UserStats : {
            gamesPlayed: 0,
            totalScore: 0,
            highScore: 0,
            averageScore: 0,
            lastPlayed: 0,
          };

          const newGamesPlayed = currentStats.gamesPlayed + 1;
          const newTotalScore = currentStats.totalScore + result.score;
          const newHighScore = Math.max(currentStats.highScore, result.score);
          const newAverageScore = newTotalScore / newGamesPlayed;

          const updatedStats: UserStats = {
            gamesPlayed: newGamesPlayed,
            totalScore: newTotalScore,
            highScore: newHighScore,
            averageScore: Math.round(newAverageScore * 100) / 100,
            lastPlayed: timestamp,
          };

          transaction.set(statsRef, updatedStats);
        });

        // Update leaderboard ONLY if game mode is specified
        // Guest check already done above
        if (result.gameModeId) {
          // Use flat collection structure: leaderboard-{gameModeId} to avoid odd segment count
          const leaderboardRef = doc(
            firestore,
            `leaderboard-${result.gameModeId}`,
            user.uid
          );
          const currentLeaderboardEntry = await getDoc(leaderboardRef);
          const currentBestScore = currentLeaderboardEntry.exists()
            ? currentLeaderboardEntry.data()?.score || 0
            : 0;

          if (result.score > currentBestScore) {
            await setDoc(leaderboardRef, {
              displayName: user.displayName || 'User',
              score: result.score,
              timestamp,
              gameModeId: result.gameModeId, // Store game mode for reference
              isGuest: false, // Explicitly mark as not a guest for validation
            });
          }
        }
      } catch (error) {
        console.error('Error saving game result:', error);
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.uid, user?.displayName, isGuest] // Only depend on specific properties to prevent unnecessary re-creation
  );

  const getUserStats = useCallback(async (): Promise<UserStats | null> => {
    if (!user) return null;

    // Guest users don't have persistent stats in Firestore
    // Check both isGuest flag and UID prefix for reliability
    const userIsGuest = isGuest || user.uid.startsWith('guest_');
    if (userIsGuest) {
      return null;
    }

    try {
      const statsRef = doc(firestore, `userStats/${user.uid}`);
      const snapshot = await getDoc(statsRef);

      if (snapshot.exists()) {
        return snapshot.data() as UserStats;
      }
      return null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, isGuest]); // Only depend on uid and isGuest to prevent unnecessary re-creation

  return {
    saveGameResult,
    getUserStats,
  };
}

