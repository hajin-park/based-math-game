import { useCallback } from 'react';
import { doc, setDoc, getDoc, runTransaction, collection, addDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { getGameModeById, isSpeedrunMode } from '@/types/gameMode';

export interface GameResult {
  score: number;
  duration: number;
  gameModeId?: string;
  timestamp?: number;
  totalKeystrokes?: number;
  backspaceCount?: number;
  accuracy?: number;
}

export interface UserStats {
  gamesPlayed: number;
  totalScore: number;
  highScore: number;
  averageScore: number;
  lastPlayed: number;
  totalKeystrokes?: number;
  totalBackspaces?: number;
  averageAccuracy?: number;
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
          totalKeystrokes: result.totalKeystrokes,
          backspaceCount: result.backspaceCount,
          accuracy: result.accuracy,
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
            totalKeystrokes: 0,
            totalBackspaces: 0,
            averageAccuracy: 0,
          };

          const newGamesPlayed = currentStats.gamesPlayed + 1;
          const newTotalScore = currentStats.totalScore + result.score;
          const newHighScore = Math.max(currentStats.highScore, result.score);
          const newAverageScore = newTotalScore / newGamesPlayed;

          // Calculate accuracy stats
          const newTotalKeystrokes = (currentStats.totalKeystrokes || 0) + (result.totalKeystrokes || 0);
          const newTotalBackspaces = (currentStats.totalBackspaces || 0) + (result.backspaceCount || 0);
          const newAverageAccuracy = newTotalKeystrokes > 0
            ? ((newTotalKeystrokes - newTotalBackspaces) / newTotalKeystrokes) * 100
            : 0;

          const updatedStats: UserStats = {
            gamesPlayed: newGamesPlayed,
            totalScore: newTotalScore,
            highScore: newHighScore,
            averageScore: Math.round(newAverageScore * 100) / 100,
            lastPlayed: timestamp,
            totalKeystrokes: newTotalKeystrokes,
            totalBackspaces: newTotalBackspaces,
            averageAccuracy: Math.round(newAverageAccuracy * 100) / 100,
          };

          transaction.set(statsRef, updatedStats);
        });

        // Update leaderboard ONLY if game mode is specified
        // Guest check already done above
        if (result.gameModeId) {
          const gameMode = getGameModeById(result.gameModeId);
          const isSpeedrun = isSpeedrunMode(gameMode);

          // Use flat collection structure: leaderboard-{gameModeId} to avoid odd segment count
          const leaderboardRef = doc(
            firestore,
            `leaderboard-${result.gameModeId}`,
            user.uid
          );
          const currentLeaderboardEntry = await getDoc(leaderboardRef);
          const currentBestScore = currentLeaderboardEntry.exists()
            ? currentLeaderboardEntry.data()?.score || (isSpeedrun ? Infinity : 0)
            : (isSpeedrun ? Infinity : 0);

          // For speedrun modes: lower score is better (faster time)
          // For timed modes: higher score is better (more points)
          const isBetterScore = isSpeedrun
            ? result.score < currentBestScore
            : result.score > currentBestScore;

          // Always update displayName to keep it current, even if score didn't improve
          if (currentLeaderboardEntry.exists()) {
            await setDoc(leaderboardRef, {
              displayName: user.displayName || 'User',
            }, { merge: true });
          }

          // Update score if it's better
          if (isBetterScore) {
            await setDoc(leaderboardRef, {
              displayName: user.displayName || 'User',
              score: result.score,
              timestamp,
              gameModeId: result.gameModeId, // Store game mode for reference
              accuracy: result.accuracy || 0, // Store accuracy
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

