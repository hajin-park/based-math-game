/**
 * Legacy stats API, now a thin wrapper over the data layer (src/data).
 * New code should call `saveRun` / `useUserStats` directly.
 */
import { useCallback } from "react";
import { getDoc } from "firebase/firestore";
import { auth } from "@/firebase/config";
import { getGameModeById, isSpeedrunMode } from "@/types/gameMode";
import { saveRun } from "@/data/runs";
import { statsRef } from "@/data/runs";
import { computeLocalStats, getLocalRuns } from "@/data/localStore";
import type { RunSummaryInput, UserStatsDoc } from "@/data/types";

export interface GameResult {
  score: number;
  duration: number; // seconds
  gameModeId?: string;
  timestamp?: number;
  totalKeystrokes?: number;
  backspaceCount?: number;
  accuracy?: number; // percent 0..100
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

/** Maps a legacy quiz result onto the run schema. */
export function legacyResultToRun(result: GameResult): RunSummaryInput {
  const modeId = result.gameModeId || "custom";
  const mode = getGameModeById(modeId);
  const speedrun = isSpeedrunMode(mode);
  const keystrokes = result.totalKeystrokes || 0;
  // Legacy "accuracy" is typing accuracy in percent; the old quiz has no skips,
  // so answer accuracy is always 100%.
  const typingAccuracy =
    result.accuracy !== undefined
      ? result.accuracy / 100
      : keystrokes > 0
        ? (keystrokes - (result.backspaceCount || 0)) / keystrokes
        : 1;
  const accuracy = 1;
  return {
    modeId,
    topicId: "custom",
    format: speedrun ? "speedrun" : "sprint",
    score: result.score,
    correct: speedrun ? mode?.targetQuestions || 0 : result.score,
    skipped: 0,
    durationMs: Math.round(result.duration * 1000),
    accuracy,
    typingAccuracy,
    endedAt: result.timestamp || Date.now(),
  };
}

function toLegacyStats(stats: UserStatsDoc): UserStats {
  const bestScores = Object.values(stats.bests || {}).map((b) => b.score);
  return {
    gamesPlayed: stats.gamesPlayed,
    totalScore: stats.totalCorrect,
    highScore: bestScores.length ? Math.max(...bestScores) : 0,
    averageScore:
      stats.gamesPlayed > 0
        ? Math.round((stats.totalCorrect / stats.gamesPlayed) * 100) / 100
        : 0,
    lastPlayed: stats.lastPlayedAt,
  };
}

export function useStats() {
  const saveGameResult = useCallback(async (result: GameResult) => {
    await saveRun(legacyResultToRun(result));
  }, []);

  const getUserStats = useCallback(async (): Promise<UserStats | null> => {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) {
      const local = getLocalRuns();
      return local.length ? toLegacyStats(computeLocalStats(local)) : null;
    }
    try {
      const snapshot = await getDoc(statsRef(user.uid));
      return snapshot.exists()
        ? toLegacyStats(snapshot.data() as UserStatsDoc)
        : null;
    } catch (error) {
      console.error("Error getting user stats:", error);
      return null;
    }
  }, []);

  return { saveGameResult, getUserStats };
}
