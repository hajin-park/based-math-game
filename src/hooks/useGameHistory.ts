import { useState, useCallback } from 'react';
import { collection, query, orderBy, limit as firestoreLimit, where, getDocs, Query, DocumentData } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

export interface GameHistoryEntry {
  id: string;
  score: number;
  duration: number;
  gameModeId: string;
  timestamp: number;
  totalKeystrokes?: number;
  backspaceCount?: number;
  accuracy?: number;
}

export type TimeRange = 'today' | 'week' | 'month' | 'all';

export function useGameHistory() {
  const { user, isGuest } = useAuth();
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const getTimeRangeStart = (range: TimeRange): number => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    switch (range) {
      case 'today':
        return now - day;
      case 'week':
        return now - 7 * day;
      case 'month':
        return now - 30 * day;
      case 'all':
      default:
        return 0;
    }
  };

  const fetchHistory = useCallback(
    async (timeRange: TimeRange = 'all', limitCount: number = 50) => {
      if (!user) {
        setHistory([]);
        return;
      }

      // Guest users don't have persistent game history in Firestore
      // Check both isGuest flag and UID prefix for reliability
      const userIsGuest = isGuest || user.uid.startsWith('guest_');
      if (userIsGuest) {
        setHistory([]);
        return;
      }

      setLoading(true);
      try {
        const historyRef = collection(firestore, `userStats/${user.uid}/gameHistory`);
        const startTime = getTimeRangeStart(timeRange);

        let historyQuery: Query<DocumentData>;
        if (timeRange === 'all') {
          historyQuery = query(
            historyRef,
            orderBy('timestamp', 'desc'),
            firestoreLimit(limitCount)
          );
        } else {
          historyQuery = query(
            historyRef,
            where('timestamp', '>=', startTime),
            orderBy('timestamp', 'desc'),
            firestoreLimit(limitCount)
          );
        }

        const snapshot = await getDocs(historyQuery);

        if (!snapshot.empty) {
          const entries: GameHistoryEntry[] = snapshot.docs.map((doc) => {
            const data = doc.data() as {
              score: number;
              duration: number;
              gameModeId: string;
              timestamp: number;
              totalKeystrokes?: number;
              backspaceCount?: number;
              accuracy?: number;
            };
            return {
              id: doc.id,
              score: data.score,
              duration: data.duration,
              gameModeId: data.gameModeId,
              timestamp: data.timestamp,
              totalKeystrokes: data.totalKeystrokes,
              backspaceCount: data.backspaceCount,
              accuracy: data.accuracy,
            };
          });

          setHistory(entries);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error('Error fetching game history:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.uid, isGuest] // Only depend on uid and isGuest to prevent unnecessary re-creation
  );

  const getStatsForTimeRange = useCallback(
    (timeRange: TimeRange) => {
      const startTime = getTimeRangeStart(timeRange);
      const filteredHistory = history.filter((entry) => entry.timestamp >= startTime);

      if (filteredHistory.length === 0) {
        return {
          gamesPlayed: 0,
          totalScore: 0,
          averageScore: 0,
          highScore: 0,
          averageAccuracy: undefined,
        };
      }

      const totalScore = filteredHistory.reduce((sum, entry) => sum + entry.score, 0);
      const highScore = Math.max(...filteredHistory.map((entry) => entry.score));

      // Calculate average accuracy from games that have accuracy data
      const gamesWithAccuracy = filteredHistory.filter((entry) => entry.accuracy !== undefined);
      const averageAccuracy = gamesWithAccuracy.length > 0
        ? gamesWithAccuracy.reduce((sum, entry) => sum + (entry.accuracy || 0), 0) / gamesWithAccuracy.length
        : undefined;

      return {
        gamesPlayed: filteredHistory.length,
        totalScore,
        averageScore: Math.round((totalScore / filteredHistory.length) * 100) / 100,
        highScore,
        averageAccuracy: averageAccuracy !== undefined ? Math.round(averageAccuracy * 100) / 100 : undefined,
      };
    },
    [history]
  );

  const getScoresByGameMode = useCallback(() => {
    const scoresByMode: Record<string, number[]> = {};

    history.forEach((entry) => {
      if (!scoresByMode[entry.gameModeId]) {
        scoresByMode[entry.gameModeId] = [];
      }
      scoresByMode[entry.gameModeId].push(entry.score);
    });

    return scoresByMode;
  }, [history]);

  return {
    history,
    loading,
    fetchHistory,
    getStatsForTimeRange,
    getScoresByGameMode,
  };
}

