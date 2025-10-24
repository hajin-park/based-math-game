import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    <div className="container mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1 animate-in">
        <div className="flex items-center justify-center gap-2 mb-1">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold gradient-text">Your Statistics</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Track your progress and performance over time
        </p>
      </div>

      {/* Guest user notice */}
      {isGuest && (
        <Alert className="border-warning/50 bg-warning/10">
          <Info className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            <span className="font-semibold">Guest Account:</span> Your stats are
            being tracked, but they won't be saved permanently or count towards
            the global leaderboard.
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
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
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Performance Overview
              </CardTitle>
              <CardDescription className="text-base mt-1">
                View your stats across different time periods
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Time range selector */}
          <div className="space-y-2">
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
                    className="text-sm py-3"
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
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-24" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Skeleton for performance by game mode */}
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Skeleton for recent games */}
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Stats cards */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4 text-primary" />
                        <CardDescription className="text-xs font-medium">
                          Games Played
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold gradient-text">
                        {rangeStats.gamesPlayed}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-primary" />
                        <CardDescription className="text-xs font-medium">
                          Average Accuracy
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold gradient-text">
                        {rangeStats.averageAccuracy !== undefined
                          ? `${rangeStats.averageAccuracy.toFixed(1)}%`
                          : "N/A"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <CardDescription className="text-xs font-medium">
                          Questions Answered
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold gradient-text">
                        {rangeStats.questionsAnswered}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-success" />
                        <CardDescription className="text-xs font-medium">
                          Leaderboard Placements
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-success">
                        {leaderboardPlacements}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Top 10 finishes
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <CardDescription className="text-xs font-medium">
                          Time in Game
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold gradient-text">
                        {Math.floor(rangeStats.timeSpentInGame / 60)}m
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rangeStats.timeSpentInGame % 60}s
                      </p>
                    </CardContent>
                  </Card>
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
                          <Card className="border-2">
                            <CardHeader>
                              <CardTitle className="text-xl flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Speed Run Performance
                              </CardTitle>
                              <CardDescription>
                                Your fastest completion times for speed run
                                challenges
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
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
                                    <div
                                      key={modeId}
                                      className="space-y-2 p-3 rounded-lg bg-muted/30 border"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <span className="font-semibold text-base">
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
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Timed Modes */}
                        {timedModes.length > 0 && (
                          <Card className="border-2">
                            <CardHeader>
                              <CardTitle className="text-xl flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-primary" />
                                Timed Mode Performance
                              </CardTitle>
                              <CardDescription>
                                Your average and best scores for timed
                                challenges
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
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
                                    <div
                                      key={modeId}
                                      className="space-y-2 p-3 rounded-lg bg-muted/30 border"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <span className="font-semibold text-base">
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
                                      <div className="grid grid-cols-2 gap-3">
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
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    );
                  })()}

                {/* Recent games */}
                {history.length > 0 && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Recent Games
                      </CardTitle>
                      <CardDescription>
                        Your last 10 completed games
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {history.slice(0, 10).map((game) => {
                          const mode = OFFICIAL_GAME_MODES.find(
                            (m) => m.id === game.gameModeId,
                          );
                          const isSpeedrun = isSpeedrunMode(mode);
                          return (
                            <Card key={game.id} className="border-2">
                              <CardContent className="p-3">
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
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {history.length === 0 && (
                  <Card className="border-2 border-dashed">
                    <CardContent className="py-8">
                      <div className="text-center space-y-2">
                        <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          No games played yet. Start playing to see your stats!
                        </p>
                        <Button
                          onClick={() => navigate("/singleplayer")}
                          className="mt-4"
                        >
                          <Gamepad2 className="mr-2 h-4 w-4" />
                          Play Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
