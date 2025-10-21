import { useState, useCallback } from 'react';
import { ref, query, orderByChild, limitToLast, get, startAt } from 'firebase/database';
import { database } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

export interface GameHistoryEntry {
  id: string;
  score: number;
  duration: number;
  gameModeId: string;
  timestamp: number;
}

export type TimeRange = 'today' | 'week' | 'month' | 'all';

export function useGameHistory() {
  const { user } = useAuth();
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
    async (timeRange: TimeRange = 'all', limit: number = 50) => {
      if (!user) {
        setHistory([]);
        return;
      }

      setLoading(true);
      try {
        const historyRef = ref(database, `users/${user.uid}/gameHistory`);
        const startTime = getTimeRangeStart(timeRange);

        let historyQuery;
        if (timeRange === 'all') {
          historyQuery = query(historyRef, orderByChild('timestamp'), limitToLast(limit));
        } else {
          historyQuery = query(
            historyRef,
            orderByChild('timestamp'),
            startAt(startTime),
            limitToLast(limit)
          );
        }

        const snapshot = await get(historyQuery);
        const data = snapshot.val();

        if (data) {
          const entries: GameHistoryEntry[] = Object.entries(data).map(([id, value]: [string, unknown]) => {
            const gameData = value as Record<string, unknown>;
            return {
              id,
              score: gameData.score as number,
              duration: gameData.duration as number,
              gameModeId: gameData.gameModeId as string,
              timestamp: gameData.timestamp as number,
            };
          });

          // Sort by timestamp descending (most recent first)
          entries.sort((a, b) => b.timestamp - a.timestamp);
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
    [user?.uid] // Only depend on uid to prevent unnecessary re-creation
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
        };
      }

      const totalScore = filteredHistory.reduce((sum, entry) => sum + entry.score, 0);
      const highScore = Math.max(...filteredHistory.map((entry) => entry.score));

      return {
        gamesPlayed: filteredHistory.length,
        totalScore,
        averageScore: Math.round((totalScore / filteredHistory.length) * 100) / 100,
        highScore,
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

