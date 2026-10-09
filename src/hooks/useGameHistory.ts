/**
 * Legacy history API, now a thin wrapper over the data layer (src/data).
 * New code should use `useRunHistory` / `useUserStats` / `useLeaderboard`.
 */
import { useState, useCallback } from "react";
import {
  getDocs,
  limit as firestoreLimit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { OFFICIAL_GAME_MODES, isSpeedrunMode } from "@/types/gameMode";
import { runsCollection } from "@/data/runs";
import { getLocalRuns } from "@/data/localStore";
import type { RunRecord, RunSummaryInput } from "@/data/types";

export interface GameHistoryEntry {
  id: string;
  score: number;
  duration: number; // seconds
  gameModeId: string;
  timestamp: number;
  totalKeystrokes?: number;
  backspaceCount?: number;
  accuracy?: number; // typing accuracy, percent
}

export type TimeRange = "today" | "week" | "month" | "all";

const DAY = 24 * 60 * 60 * 1000;

function getTimeRangeStart(range: TimeRange): number {
  const now = Date.now();
  switch (range) {
    case "today":
      return now - DAY;
    case "week":
      return now - 7 * DAY;
    case "month":
      return now - 30 * DAY;
    default:
      return 0;
  }
}

function toHistoryEntry(run: RunRecord): GameHistoryEntry {
  return {
    id: run.id,
    score: run.score,
    duration: Math.round(run.durationMs / 1000),
    gameModeId: run.modeId,
    timestamp: run.endedAt,
    accuracy: Math.round(run.typingAccuracy * 10000) / 100,
  };
}

export function useGameHistory() {
  const { user, isGuest } = useAuth();
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const uid = user?.uid;

  const fetchHistory = useCallback(
    async (timeRange: TimeRange = "all", limitCount: number = 50) => {
      const start = getTimeRangeStart(timeRange);
      if (!uid || isGuest) {
        setHistory(
          getLocalRuns()
            .filter((r) => r.endedAt >= start)
            .slice(0, limitCount)
            .map(toHistoryEntry),
        );
        return;
      }
      setLoading(true);
      try {
        const constraints = [
          ...(timeRange === "all" ? [] : [where("endedAt", ">=", start)]),
          orderBy("endedAt", "desc"),
          firestoreLimit(Math.min(limitCount, 1000)),
        ];
        const snapshot = await getDocs(
          query(runsCollection(uid), ...constraints),
        );
        setHistory(
          snapshot.docs.map((d) =>
            toHistoryEntry({ id: d.id, ...(d.data() as RunSummaryInput) }),
          ),
        );
      } catch (error) {
        console.error("Error fetching game history:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    },
    [uid, isGuest],
  );

  const getStatsForTimeRange = useCallback(
    (timeRange: TimeRange) => {
      const startTime = getTimeRangeStart(timeRange);
      const filtered = history.filter((entry) => entry.timestamp >= startTime);

      if (filtered.length === 0) {
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

      const totalScore = filtered.reduce((sum, e) => sum + e.score, 0);
      const highScore = Math.max(...filtered.map((e) => e.score));
      const withAccuracy = filtered.filter((e) => e.accuracy !== undefined);
      const averageAccuracy =
        withAccuracy.length > 0
          ? withAccuracy.reduce((sum, e) => sum + (e.accuracy || 0), 0) /
            withAccuracy.length
          : undefined;
      const questionsAnswered = filtered.reduce((sum, entry) => {
        const mode = OFFICIAL_GAME_MODES.find((m) => m.id === entry.gameModeId);
        return (
          sum +
          (mode && isSpeedrunMode(mode)
            ? mode.targetQuestions || 0
            : entry.score)
        );
      }, 0);
      const timeSpentInGame = filtered.reduce((sum, e) => sum + e.duration, 0);

      return {
        gamesPlayed: filtered.length,
        totalScore,
        averageScore: Math.round((totalScore / filtered.length) * 100) / 100,
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
      (scoresByMode[entry.gameModeId] ||= []).push(entry.score);
    });
    return scoresByMode;
  }, [history]);

  const getDurationsByGameMode = useCallback(() => {
    const durationsByMode: Record<string, number[]> = {};
    history.forEach((entry) => {
      (durationsByMode[entry.gameModeId] ||= []).push(entry.duration);
    });
    return durationsByMode;
  }, [history]);

  /**
   * Legacy per-mode leaderboards were retired; legacy mode ids are not ranked
   * in the new schema, so there are no placements to report.
   */
  const getLeaderboardPlacements = useCallback(
    async (): Promise<number> => 0,
    [],
  );

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
