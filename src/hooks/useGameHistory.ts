import { useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  where,
  getDocs,
  Query,
  DocumentData,
} from "firebase/firestore";
import { firestore } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { OFFICIAL_GAME_MODES, isSpeedrunMode } from "@/types/gameMode";

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

export type TimeRange = "today" | "week" | "month" | "all";

export function useGameHistory() {
  const { user, isGuest } = useAuth();
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const getTimeRangeStart = (range: TimeRange): number => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    switch (range) {
      case "today":
        return now - day;
      case "week":
        return now - 7 * day;
      case "month":
        return now - 30 * day;
      case "all":
      default:
        return 0;
    }
  };

  const fetchHistory = useCallback(
    async (timeRange: TimeRange = "all", limitCount: number = 50) => {
      if (!user) {
        setHistory([]);
        return;
      }

      // Guest users don't have persistent game history in Firestore
      // Check both isGuest flag and UID prefix for reliability
      const userIsGuest = isGuest || user.uid.startsWith("guest_");
      if (userIsGuest) {
        setHistory([]);
        return;
      }

      setLoading(true);
      try {
        const historyRef = collection(
          firestore,
          `userStats/${user.uid}/gameHistory`,
        );
        const startTime = getTimeRangeStart(timeRange);

        let historyQuery: Query<DocumentData>;
        if (timeRange === "all") {
          historyQuery = query(
            historyRef,
            orderBy("timestamp", "desc"),
            firestoreLimit(limitCount),
          );
        } else {
          historyQuery = query(
            historyRef,
            where("timestamp", ">=", startTime),
            orderBy("timestamp", "desc"),
            firestoreLimit(limitCount),
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
        console.error("Error fetching game history:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.uid, isGuest], // Only depend on uid and isGuest to prevent unnecessary re-creation
  );

  const getStatsForTimeRange = useCallback(
    (timeRange: TimeRange) => {
      const startTime = getTimeRangeStart(timeRange);
      const filteredHistory = history.filter(
        (entry) => entry.timestamp >= startTime,
      );

      if (filteredHistory.length === 0) {
        return {
          gamesPlayed: 0,
          totalScore: 0,
          averageScore: 0,
          highScore: 0,
          averageAccuracy: undefined,
          questionsAnswered: 0,
          timeSpentInGame: 0,
        };
      }

      const totalScore = filteredHistory.reduce(
        (sum, entry) => sum + entry.score,
        0,
      );
      const highScore = Math.max(
        ...filteredHistory.map((entry) => entry.score),
      );

      // Calculate average accuracy from games that have accuracy data
      const gamesWithAccuracy = filteredHistory.filter(
        (entry) => entry.accuracy !== undefined,
      );
      const averageAccuracy =
        gamesWithAccuracy.length > 0
          ? gamesWithAccuracy.reduce(
              (sum, entry) => sum + (entry.accuracy || 0),
              0,
            ) / gamesWithAccuracy.length
          : undefined;

      // Calculate questions answered (for timed modes, score = questions answered)
      // For speedrun modes, we need to count the targetQuestions
      const questionsAnswered = filteredHistory.reduce((sum, entry) => {
        const mode = OFFICIAL_GAME_MODES.find((m) => m.id === entry.gameModeId);
        if (mode && isSpeedrunMode(mode)) {
          // For speedrun modes, count targetQuestions if completed
          return sum + (mode.targetQuestions || 0);
        } else {
          // For timed modes, score = number of correct answers
          return sum + entry.score;
        }
      }, 0);

      // Calculate total time spent in games (in seconds)
      const timeSpentInGame = filteredHistory.reduce(
        (sum, entry) => sum + entry.duration,
        0,
      );

      return {
        gamesPlayed: filteredHistory.length,
        totalScore,
        averageScore:
          Math.round((totalScore / filteredHistory.length) * 100) / 100,
        highScore,
        averageAccuracy:
          averageAccuracy !== undefined
            ? Math.round(averageAccuracy * 100) / 100
            : undefined,
        questionsAnswered,
        timeSpentInGame,
      };
    },
    [history],
  );

  const getScoresByGameMode = useCallback(() => {
    const scoresByMode: Record<string, number[]> = {};

    history.forEach((entry) => {
      if (!scoresByMode[entry.gameModeId]) {
        scoresByMode[entry.gameModeId] = [];
      }
      // For speed run modes (those with targetQuestions), use duration instead of score
      // We'll determine this in the Stats component based on the game mode
      scoresByMode[entry.gameModeId].push(entry.score);
    });

    return scoresByMode;
  }, [history]);

  const getDurationsByGameMode = useCallback(() => {
    const durationsByMode: Record<string, number[]> = {};

    history.forEach((entry) => {
      if (!durationsByMode[entry.gameModeId]) {
        durationsByMode[entry.gameModeId] = [];
      }
      durationsByMode[entry.gameModeId].push(entry.duration);
    });

    return durationsByMode;
  }, [history]);

  const getLeaderboardPlacements = useCallback(async (): Promise<number> => {
    if (!user || isGuest || user.uid.startsWith("guest_")) {
      return 0;
    }

    try {
      let placementsCount = 0;

      // Check each official game mode
      for (const mode of OFFICIAL_GAME_MODES) {
        const leaderboardRef = collection(firestore, `leaderboard-${mode.id}`);
        const isSpeedrun = isSpeedrunMode(mode);

        // Query for top 10 entries
        const leaderboardQuery = query(
          leaderboardRef,
          orderBy("score", isSpeedrun ? "asc" : "desc"),
          firestoreLimit(10),
        );

        const snapshot = await getDocs(leaderboardQuery);

        // Check if user is in top 10 (excluding guests)
        const validEntries = snapshot.docs.filter((doc) => {
          const isGuestUid = doc.id.startsWith("guest_");
          const isGuestMarked = doc.data().isGuest === true;
          return !isGuestUid && !isGuestMarked;
        });

        const userInTop10 = validEntries.some((doc) => doc.id === user.uid);
        if (userInTop10) {
          placementsCount++;
        }
      }

      return placementsCount;
    } catch (error) {
      console.error("Error fetching leaderboard placements:", error);
      return 0;
    }
  }, [user, isGuest]);

  return {
    history,
    loading,
    fetchHistory,
    getStatsForTimeRange,
    getScoresByGameMode,
    getDurationsByGameMode,
    getLeaderboardPlacements,
  };
}
