import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PaperCard,
  PaperCardContent,
  PaperCardDescription,
  PaperCardHeader,
  PaperCardTitle,
  SectionHeader,
  StickyNote,
  StickyNoteTitle,
  StickyNoteDescription,
} from "@/components/ui/academic";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameHistory, TimeRange } from "@/hooks/useGameHistory";
import { useAuth } from "@/contexts/AuthContext";
import { OFFICIAL_GAME_MODES, isSpeedrunMode } from "@/types/gameMode";
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Percent,
  Trophy,
  Calendar,
  Gamepad2,
  Info,
} from "lucide-react";

export default function Stats() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const {
    history,
    loading,
    fetchHistory,
    getStatsForTimeRange,
    getScoresByGameMode,
    getDurationsByGameMode,
    getLeaderboardPlacements,
  } = useGameHistory();
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [leaderboardPlacements, setLeaderboardPlacements] = useState<number>(0);

  useEffect(() => {
    fetchHistory(timeRange);
  }, [timeRange, fetchHistory]);

  useEffect(() => {
    // Fetch leaderboard placements when component mounts
    const fetchPlacements = async () => {
      const count = await getLeaderboardPlacements();
      setLeaderboardPlacements(count);
    };
    fetchPlacements();
  }, [getLeaderboardPlacements]);

  const rangeStats = getStatsForTimeRange(timeRange);
  const scoresByMode = getScoresByGameMode();
  const durationsByMode = getDurationsByGameMode();

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "all", label: "All Time" },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with paper texture background */}
      <section className="relative overflow-hidden py-6 paper-texture">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-background -z-10" />

        <SectionHeader
          title="Your Statistics"
          description="Track your progress and performance over time"
          icon={BarChart3}
          align="center"
          titleSize="xl"
        />
      </section>

      {/* Guest user notice */}
      {isGuest && (
        <StickyNote variant="warning" size="default">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="space-y-3">
              <StickyNoteTitle>Guest Account Notice</StickyNoteTitle>
              <StickyNoteDescription>
                <p className="text-sm">
                  Your stats are being tracked, but they won't be saved
                  permanently or count towards the global leaderboard.
                </p>
              </StickyNoteDescription>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => navigate("/signup")}
                  size="sm"
                  className="bg-warning hover:bg-warning/90 text-warning-foreground"
                >
                  Sign Up to Save Stats
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  size="sm"
                >
                  Log In
                </Button>
              </div>
            </div>
          </div>
        </StickyNote>
      )}

      <PaperCard variant="folded" padding="none" className="shadow-lg">
        <PaperCardHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <PaperCardTitle className="text-2xl">
                Performance Overview
              </PaperCardTitle>
              <PaperCardDescription className="text-base mt-1">
                View your stats across different time periods
              </PaperCardDescription>
            </div>
          </div>
        </PaperCardHeader>
        <PaperCardContent className="p-6 pt-0 space-y-4">
          {/* Time range selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <label className="text-sm font-semibold">Time Period</label>
            </div>
            <Tabs
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as TimeRange)}
            >
              <TabsList className="grid w-full max-w-md grid-cols-4 h-auto p-1">
                {timeRanges.map((range) => (
                  <TabsTrigger
                    key={range.value}
                    value={range.value}
                    className="text-sm py-2.5"
                  >
                    {range.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Content area with minimum height to prevent layout shifts */}
          <div className="min-h-[500px]">
            {loading ? (
              <div className="space-y-4">
                {/* Skeleton for stats cards */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <PaperCard key={i} padding="sm">
                      <div className="pb-2">
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </PaperCard>
                  ))}
                </div>

                {/* Skeleton for performance by game mode */}
                <PaperCard padding="default">
                  <div className="pb-4">
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                </PaperCard>

                {/* Skeleton for recent games */}
                <PaperCard padding="default">
                  <div className="pb-4">
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </PaperCard>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Stats cards */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                  <PaperCard
                    variant="folded-sm"
                    padding="sm"
                    className="border-2"
                  >
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Games Played
                        </span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold gradient-text">
                      {rangeStats.gamesPlayed}
                    </div>
                  </PaperCard>

                  <PaperCard
                    variant="folded-sm"
                    padding="sm"
                    className="border-2"
                  >
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Average Accuracy
                        </span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold gradient-text">
                      {rangeStats.averageAccuracy !== undefined
                        ? `${rangeStats.averageAccuracy.toFixed(1)}%`
                        : "N/A"}
                    </div>
                  </PaperCard>

                  <PaperCard
                    variant="folded-sm"
                    padding="sm"
                    className="border-2"
                  >
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Questions Answered
                        </span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold gradient-text">
                      {rangeStats.questionsAnswered}
                    </div>
                  </PaperCard>

                  <PaperCard
                    variant="folded-sm"
                    padding="sm"
                    className="border-2"
                  >
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-success" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Leaderboard Placements
                        </span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-success">
                      {leaderboardPlacements}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Top 10 finishes
                    </p>
                  </PaperCard>

                  <PaperCard
                    variant="folded-sm"
                    padding="sm"
                    className="border-2"
                  >
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Time in Game
                        </span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold gradient-text">
                      {Math.floor(rangeStats.timeSpentInGame / 60)}m
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rangeStats.timeSpentInGame % 60}s
                    </p>
                  </PaperCard>
                </div>

                {/* Scores by game mode - separated by type */}
                {Object.keys(scoresByMode).length > 0 &&
                  (() => {
                    // Separate speed run and timed modes
                    const speedRunModes: [string, number[]][] = [];
                    const timedModes: [string, number[]][] = [];

                    Object.entries(scoresByMode).forEach(([modeId, scores]) => {
                      const mode = OFFICIAL_GAME_MODES.find(
                        (m) => m.id === modeId,
                      );
                      if (mode?.targetQuestions) {
                        speedRunModes.push([modeId, scores]);
                      } else {
                        timedModes.push([modeId, scores]);
                      }
                    });

                    return (
                      <>
                        {/* Speed Run Modes */}
                        {speedRunModes.length > 0 && (
                          <PaperCard
                            variant="folded"
                            padding="none"
                            className="border-2"
                          >
                            <PaperCardHeader className="p-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Target className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <PaperCardTitle className="text-xl">
                                    Speed Run Performance
                                  </PaperCardTitle>
                                  <PaperCardDescription>
                                    Your fastest completion times for speed run
                                    challenges
                                  </PaperCardDescription>
                                </div>
                              </div>
                            </PaperCardHeader>
                            <PaperCardContent className="p-6 pt-0">
                              <div className="space-y-4">
                                {speedRunModes.map(([modeId]) => {
                                  const mode = OFFICIAL_GAME_MODES.find(
                                    (m) => m.id === modeId,
                                  );
                                  // For speed runs, use durations instead of scores
                                  const durations =
                                    durationsByMode[modeId] || [];
                                  if (durations.length === 0) return null;

                                  const bestTime = Math.min(...durations);
                                  const avgTime =
                                    durations.reduce((a, b) => a + b, 0) /
                                    durations.length;

                                  return (
                                    <PaperCard
                                      key={modeId}
                                      variant="folded-sm"
                                      padding="sm"
                                      className="border"
                                    >
                                      <div className="flex justify-between items-start mb-3">
                                        <div>
                                          <span className="font-serif font-semibold text-base">
                                            {mode?.name || modeId}
                                          </span>
                                          <Badge
                                            variant="secondary"
                                            className="ml-2 text-xs"
                                          >
                                            {durations.length}{" "}
                                            {durations.length === 1
                                              ? "attempt"
                                              : "attempts"}
                                          </Badge>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          Target: {mode?.targetQuestions}{" "}
                                          questions
                                        </Badge>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground">
                                            Best Time
                                          </p>
                                          <p className="text-2xl font-bold text-success">
                                            {bestTime.toFixed(1)}s
                                          </p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground">
                                            Average Time
                                          </p>
                                          <p className="text-2xl font-bold text-primary">
                                            {avgTime.toFixed(1)}s
                                          </p>
                                        </div>
                                      </div>
                                    </PaperCard>
                                  );
                                })}
                              </div>
                            </PaperCardContent>
                          </PaperCard>
                        )}

                        {/* Timed Modes */}
                        {timedModes.length > 0 && (
                          <PaperCard
                            variant="folded"
                            padding="none"
                            className="border-2"
                          >
                            <PaperCardHeader className="p-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Trophy className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <PaperCardTitle className="text-xl">
                                    Timed Mode Performance
                                  </PaperCardTitle>
                                  <PaperCardDescription>
                                    Your average and best scores for timed
                                    challenges
                                  </PaperCardDescription>
                                </div>
                              </div>
                            </PaperCardHeader>
                            <PaperCardContent className="p-6 pt-0">
                              <div className="space-y-4">
                                {timedModes.map(([modeId, scores]) => {
                                  const mode = OFFICIAL_GAME_MODES.find(
                                    (m) => m.id === modeId,
                                  );
                                  const avgScore =
                                    scores.reduce((a, b) => a + b, 0) /
                                    scores.length;
                                  const maxScore = Math.max(...scores);

                                  return (
                                    <PaperCard
                                      key={modeId}
                                      variant="folded-sm"
                                      padding="sm"
                                      className="border"
                                    >
                                      <div className="flex justify-between items-start mb-3">
                                        <div>
                                          <span className="font-serif font-semibold text-base">
                                            {mode?.name || modeId}
                                          </span>
                                          <Badge
                                            variant="secondary"
                                            className="ml-2 text-xs"
                                          >
                                            {scores.length}{" "}
                                            {scores.length === 1
                                              ? "game"
                                              : "games"}
                                          </Badge>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {mode?.duration}s time limit
                                        </Badge>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground">
                                            Average Score
                                          </p>
                                          <p className="text-2xl font-bold text-primary">
                                            {avgScore.toFixed(1)}
                                          </p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground">
                                            Best Score
                                          </p>
                                          <p className="text-2xl font-bold text-success">
                                            {maxScore}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                          <span>Progress to Best</span>
                                          <span>
                                            {(
                                              (avgScore / maxScore) *
                                              100
                                            ).toFixed(0)}
                                            %
                                          </span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                                          <div
                                            className="bg-gradient-to-r from-primary to-success h-3 rounded-full transition-all duration-500"
                                            style={{
                                              width: `${(avgScore / maxScore) * 100}%`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </PaperCard>
                                  );
                                })}
                              </div>
                            </PaperCardContent>
                          </PaperCard>
                        )}
                      </>
                    );
                  })()}

                {/* Recent games */}
                {history.length > 0 && (
                  <PaperCard
                    variant="folded"
                    padding="none"
                    className="border-2"
                  >
                    <PaperCardHeader className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <PaperCardTitle className="text-xl">
                            Recent Games
                          </PaperCardTitle>
                          <PaperCardDescription>
                            Your last 10 completed games
                          </PaperCardDescription>
                        </div>
                      </div>
                    </PaperCardHeader>
                    <PaperCardContent className="p-6 pt-0">
                      <div className="space-y-2">
                        {history.slice(0, 10).map((game) => {
                          const mode = OFFICIAL_GAME_MODES.find(
                            (m) => m.id === game.gameModeId,
                          );
                          const isSpeedrun = isSpeedrunMode(mode);
                          return (
                            <PaperCard
                              key={game.id}
                              variant="folded-sm"
                              padding="sm"
                              className="border hover:border-primary/50 transition-colors"
                            >
                              <div className="p-0">
                                <div className="flex justify-between items-center">
                                  <div className="space-y-0.5">
                                    <div className="font-semibold text-base">
                                      {mode?.name || "Custom"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(
                                        game.timestamp,
                                      ).toLocaleString()}
                                    </div>
                                    {game.accuracy !== undefined && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Percent className="h-3 w-3" />
                                        {game.accuracy.toFixed(1)}% accuracy
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right space-y-0.5">
                                    <div className="font-bold text-2xl gradient-text">
                                      {isSpeedrun
                                        ? `${game.score}s`
                                        : game.score}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {isSpeedrun ? "Time" : "Points"}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                                      <Clock className="h-3 w-3" />
                                      {game.duration}s duration
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </PaperCard>
                          );
                        })}
                      </div>
                    </PaperCardContent>
                  </PaperCard>
                )}

                {history.length === 0 && (
                  <StickyNote variant="info" size="default">
                    <div className="text-center space-y-3">
                      <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <div>
                        <StickyNoteTitle>No Games Yet</StickyNoteTitle>
                        <StickyNoteDescription>
                          Start playing to see your stats!
                        </StickyNoteDescription>
                      </div>
                      <Button
                        onClick={() => navigate("/singleplayer")}
                        className="mt-2"
                      >
                        <Gamepad2 className="mr-2 h-4 w-4" />
                        Play Now
                      </Button>
                    </div>
                  </StickyNote>
                )}
              </div>
            )}
          </div>
        </PaperCardContent>
      </PaperCard>
    </div>
  );
}
