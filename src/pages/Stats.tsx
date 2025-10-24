import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PaperCard,
  PaperCardContent,
  PaperCardDescription,
  PaperCardHeader,
  PaperCardTitle,
  StickyNote,
  StickyNoteTitle,
  StickyNoteDescription,
} from "@/components/ui/academic";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const GAMES_PER_PAGE = 5;

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
  const [selectedGameMode, setSelectedGameMode] = useState<string>("overview");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Fetch all history without limit for pagination
    fetchHistory(timeRange, 1000);
  }, [timeRange, fetchHistory]);

  useEffect(() => {
    // Fetch leaderboard placements when component mounts
    const fetchPlacements = async () => {
      const count = await getLeaderboardPlacements();
      setLeaderboardPlacements(count);
    };
    fetchPlacements();
  }, [getLeaderboardPlacements]);

  // Reset to page 1 when time range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeRange]);

  const rangeStats = getStatsForTimeRange(timeRange);
  const scoresByMode = getScoresByGameMode();
  const durationsByMode = getDurationsByGameMode();

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "all", label: "All Time" },
  ];

  // Get unique game modes the user has played
  const playedGameModes = useMemo(() => {
    const modeIds = new Set(history.map((game) => game.gameModeId));
    return OFFICIAL_GAME_MODES.filter((mode) => modeIds.has(mode.id));
  }, [history]);

  // Get filtered history for selected game mode and time range
  const filteredHistory = useMemo(() => {
    const startTime =
      timeRange === "all"
        ? 0
        : Date.now() -
          (timeRange === "today"
            ? 24 * 60 * 60 * 1000
            : timeRange === "week"
              ? 7 * 24 * 60 * 60 * 1000
              : 30 * 24 * 60 * 60 * 1000);

    let filtered = history.filter((entry) => entry.timestamp >= startTime);

    if (selectedGameMode !== "overview") {
      filtered = filtered.filter(
        (entry) => entry.gameModeId === selectedGameMode,
      );
    }

    return filtered;
  }, [history, timeRange, selectedGameMode]);

  // Prepare data for graphs (when specific game mode is selected)
  const graphData = useMemo(() => {
    if (selectedGameMode === "overview") return { scores: [], accuracy: [] };

    const mode = OFFICIAL_GAME_MODES.find((m) => m.id === selectedGameMode);
    const isSpeedrun = isSpeedrunMode(mode);

    // Sort by timestamp ascending for chronological order
    const sortedHistory = [...filteredHistory].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    const scoresData = sortedHistory.map((entry, index) => ({
      game: index + 1,
      score: isSpeedrun ? entry.duration : entry.score,
    }));

    const accuracyData = sortedHistory
      .filter((entry) => entry.accuracy !== undefined)
      .map((entry, index) => ({
        game: index + 1,
        accuracy: entry.accuracy || 0,
      }));

    return { scores: scoresData, accuracy: accuracyData };
  }, [selectedGameMode, filteredHistory]);

  // Pagination for game history
  const totalPages = Math.ceil(filteredHistory.length / GAMES_PER_PAGE);
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    return filteredHistory.slice(startIndex, startIndex + GAMES_PER_PAGE);
  }, [filteredHistory, currentPage]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with Your Statistics title and time selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-semibold">
            Your Statistics
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary shrink-0" />
          <Tabs
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <TabsList className="grid grid-cols-4 h-auto p-1">
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
      </div>

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

      {/* Main Content - Two Column Layout */}
      <div className="grid lg:grid-cols-[1fr,350px] gap-4 lg:h-[600px]">
        {/* Left Column - Game Mode Selector and Content */}
        <div className="flex flex-col gap-4 h-[500px] lg:h-full min-h-0">

          {/* Game Mode Selector */}
          <PaperCard variant="folded-sm" padding="sm" className="border-2 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Game Mode</label>
            </div>
            <Select
              value={selectedGameMode}
              onValueChange={setSelectedGameMode}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select game mode" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="overview">Overview (All Modes)</SelectItem>
                {playedGameModes.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      Your Game Modes
                    </div>
                    {playedGameModes.map((mode) => (
                      <SelectItem key={mode.id} value={mode.id}>
                        {mode.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </PaperCard>

          {/* Content area - grows to fill available space */}
          <PaperCard variant="folded" padding="none" className="shadow-lg flex-1 min-h-0">
            <PaperCardContent className="p-0 h-full min-h-0">
              {loading ? (
                <div className="space-y-4 p-4">
                  {/* Skeleton for graphs or performance cards */}
                  <PaperCard padding="default">
                    <div className="pb-4">
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-[200px] w-full" />
                  </PaperCard>
                  <PaperCard padding="default">
                    <div className="pb-4">
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-[200px] w-full" />
                  </PaperCard>
                </div>
              ) : (
                <div className="h-full min-h-0">
                  {selectedGameMode === "overview" ? (
                    /* Overview Mode - Show Performance Cards */
                    <div className="relative h-full min-h-0">
                      <ScrollArea className="h-full border-2 border-dashed border-muted-foreground/20 rounded-lg">
                        <div className="space-y-4 p-4 pb-8">
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

                        {Object.keys(scoresByMode).length === 0 && (
                          <StickyNote variant="info" size="default">
                            <div className="text-center space-y-3">
                              <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                              <div>
                                <StickyNoteTitle>No Games Yet</StickyNoteTitle>
                                <StickyNoteDescription>
                                  Start playing to see your performance stats!
                                </StickyNoteDescription>
                              </div>
                            </div>
                          </StickyNote>
                        )}
                      </div>
                    </ScrollArea>
                    {/* Scroll indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none rounded-b-lg" />
                  </div>
                ) : (
                  /* Specific Game Mode - Show Graphs */
                  <div className="h-full min-h-0 overflow-y-auto">
                    <div className="flex flex-col space-y-6 p-4 pb-6">
                    {/* Score/Time Over Games Graph */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold">
                          {isSpeedrunMode(
                            OFFICIAL_GAME_MODES.find(
                              (m) => m.id === selectedGameMode,
                            ),
                          )
                            ? "Time Over Games"
                            : "Score Over Games"}
                        </h3>
                      </div>
                      {graphData.scores.length > 0 ? (
                        <ResponsiveContainer width="100%" height={190}>
                          <LineChart data={graphData.scores} margin={{ bottom: 10 }}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis
                              dataKey="game"
                              label={{
                                value: "Game Number",
                                position: "insideBottom",
                                offset: -5,
                              }}
                              tick={{ fontSize: 12 }}
                              stroke="#6b7280"
                            />
                            <YAxis
                              label={{
                                value: isSpeedrunMode(
                                  OFFICIAL_GAME_MODES.find(
                                    (m) => m.id === selectedGameMode,
                                  ),
                                )
                                  ? "Time (s)"
                                  : "Score",
                                angle: -90,
                                position: "insideLeft",
                                offset: 10,
                              }}
                              tick={{ fontSize: 12 }}
                              stroke="#6b7280"
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const isSpeedrun = isSpeedrunMode(
                                    OFFICIAL_GAME_MODES.find(
                                      (m) => m.id === selectedGameMode,
                                    ),
                                  );
                                  return (
                                    <div className="text-sm font-medium">
                                      {isSpeedrun ? "Time" : "Score"}:{" "}
                                      {payload[0].value}
                                      {isSpeedrun ? "s" : ""}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#2563eb"
                              strokeWidth={3}
                              dot={false}
                              isAnimationActive={true}
                              animationDuration={800}
                              animationEasing="ease-in-out"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[190px] flex items-center justify-center text-sm text-muted-foreground">
                          No data available for this time period
                        </div>
                      )}
                    </div>

                    {/* Accuracy Over Games Graph */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold">
                          Accuracy Over Games
                        </h3>
                      </div>
                      {graphData.accuracy.length > 0 ? (
                        <ResponsiveContainer width="100%" height={190}>
                          <LineChart data={graphData.accuracy} margin={{ bottom: 10 }}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis
                              dataKey="game"
                              label={{
                                value: "Game Number",
                                position: "insideBottom",
                                offset: -5,
                              }}
                              tick={{ fontSize: 12 }}
                              stroke="#6b7280"
                            />
                            <YAxis
                              domain={[0, 100]}
                              label={{
                                value: "Accuracy (%)",
                                angle: -90,
                                position: "insideLeft",
                                offset: 10,
                              }}
                              tick={{ fontSize: 12 }}
                              stroke="#6b7280"
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="text-sm font-medium">
                                      Accuracy: {payload[0].value}%
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="accuracy"
                              stroke="#2563eb"
                              strokeWidth={3}
                              dot={false}
                              isAnimationActive={true}
                              animationDuration={800}
                              animationEasing="ease-in-out"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[190px] flex items-center justify-center text-sm text-muted-foreground">
                          No accuracy data available for this time period
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </PaperCardContent>
          </PaperCard>
        </div>

        {/* Right Column - Profile Stats or Game-Specific Stats */}
        <div className="h-[500px] lg:h-full">
          <PaperCard variant="folded" padding="none" className="shadow-lg h-full overflow-y-auto">
            <PaperCardHeader className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <PaperCardTitle className="text-lg">
                  {selectedGameMode === "overview"
                    ? "Profile Stats"
                    : "Game Mode Stats"}
                </PaperCardTitle>
              </div>
            </PaperCardHeader>
            <PaperCardContent className="p-4 pt-0 space-y-3">
              {selectedGameMode === "overview" ? (
                /* Profile Stats */
                <>
                  <PaperCard variant="folded-sm" padding="sm" className="border">
                    <div className="flex items-center gap-2 mb-1">
                      <Gamepad2 className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Games Played
                      </span>
                    </div>
                    <div className="text-2xl font-bold gradient-text">
                      {rangeStats.gamesPlayed}
                    </div>
                  </PaperCard>

                  <PaperCard variant="folded-sm" padding="sm" className="border">
                    <div className="flex items-center gap-2 mb-1">
                      <Percent className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Average Accuracy
                      </span>
                    </div>
                    <div className="text-2xl font-bold gradient-text">
                      {rangeStats.averageAccuracy !== undefined
                        ? `${rangeStats.averageAccuracy.toFixed(1)}%`
                        : "N/A"}
                    </div>
                  </PaperCard>

                  <PaperCard variant="folded-sm" padding="sm" className="border">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Questions Answered
                      </span>
                    </div>
                    <div className="text-2xl font-bold gradient-text">
                      {rangeStats.questionsAnswered}
                    </div>
                  </PaperCard>

                  <PaperCard variant="folded-sm" padding="sm" className="border">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-3.5 w-3.5 text-success" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Leaderboard Placements
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {leaderboardPlacements}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Top 10 finishes
                    </p>
                  </PaperCard>

                  <PaperCard variant="folded-sm" padding="sm" className="border">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Time in Game
                      </span>
                    </div>
                    <div className="text-2xl font-bold gradient-text">
                      {Math.floor(rangeStats.timeSpentInGame / 60)}m
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rangeStats.timeSpentInGame % 60}s
                    </p>
                  </PaperCard>
                </>
              ) : (
                /* Game-Specific Stats */
                <>
                  {(() => {
                    const mode = OFFICIAL_GAME_MODES.find(
                      (m) => m.id === selectedGameMode,
                    );
                    const isSpeedrun = isSpeedrunMode(mode);
                    const modeScores = scoresByMode[selectedGameMode] || [];
                    const modeDurations = durationsByMode[selectedGameMode] || [];

                    const bestScore = isSpeedrun
                      ? modeDurations.length > 0
                        ? Math.min(...modeDurations)
                        : 0
                      : modeScores.length > 0
                        ? Math.max(...modeScores)
                        : 0;

                    const avgScore = isSpeedrun
                      ? modeDurations.length > 0
                        ? modeDurations.reduce((a, b) => a + b, 0) /
                          modeDurations.length
                        : 0
                      : modeScores.length > 0
                        ? modeScores.reduce((a, b) => a + b, 0) /
                          modeScores.length
                        : 0;

                    const avgAccuracy =
                      filteredHistory.length > 0
                        ? filteredHistory
                            .filter((g) => g.accuracy !== undefined)
                            .reduce((sum, g) => sum + (g.accuracy || 0), 0) /
                          filteredHistory.filter((g) => g.accuracy !== undefined)
                            .length
                        : 0;

                    return (
                      <>
                        <PaperCard
                          variant="folded-sm"
                          padding="sm"
                          className="border"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Gamepad2 className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Games Played
                            </span>
                          </div>
                          <div className="text-2xl font-bold gradient-text">
                            {filteredHistory.length}
                          </div>
                        </PaperCard>

                        <PaperCard
                          variant="folded-sm"
                          padding="sm"
                          className="border"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy className="h-3.5 w-3.5 text-success" />
                            <span className="text-xs font-medium text-muted-foreground">
                              {isSpeedrun ? "Best Time" : "Best Score"}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-success">
                            {bestScore > 0
                              ? isSpeedrun
                                ? `${bestScore.toFixed(1)}s`
                                : bestScore
                              : "N/A"}
                          </div>
                        </PaperCard>

                        <PaperCard
                          variant="folded-sm"
                          padding="sm"
                          className="border"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium text-muted-foreground">
                              {isSpeedrun ? "Average Time" : "Average Score"}
                            </span>
                          </div>
                          <div className="text-2xl font-bold gradient-text">
                            {avgScore > 0
                              ? isSpeedrun
                                ? `${avgScore.toFixed(1)}s`
                                : avgScore.toFixed(0)
                              : "N/A"}
                          </div>
                        </PaperCard>

                        <PaperCard
                          variant="folded-sm"
                          padding="sm"
                          className="border"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Percent className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Average Accuracy
                            </span>
                          </div>
                          <div className="text-2xl font-bold gradient-text">
                            {avgAccuracy > 0
                              ? `${avgAccuracy.toFixed(1)}%`
                              : "N/A"}
                          </div>
                        </PaperCard>

                        <PaperCard
                          variant="folded-sm"
                          padding="sm"
                          className="border"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Info className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Mode Type
                            </span>
                          </div>
                          <div className="text-sm font-semibold">
                            {isSpeedrun ? "Speed Run" : "Timed Challenge"}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {mode?.difficulty || "N/A"}
                          </p>
                        </PaperCard>
                      </>
                    );
                  })()}
                </>
              )}
            </PaperCardContent>
          </PaperCard>
        </div>
      </div>

      {/* Games Played History - Bottom Section with Pagination */}
      {filteredHistory.length > 0 && (
        <PaperCard variant="folded" padding="none" className="shadow-lg">
            <PaperCardHeader className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <PaperCardTitle className="text-lg">
                  Games Played History
                </PaperCardTitle>
                <PaperCardDescription className="text-sm">
                  {selectedGameMode === "overview"
                    ? `All ${filteredHistory.length} games`
                    : `${filteredHistory.length} games in ${OFFICIAL_GAME_MODES.find((m) => m.id === selectedGameMode)?.name}`}
                </PaperCardDescription>
              </div>
            </div>
          </PaperCardHeader>
          <PaperCardContent className="p-4 pt-0 space-y-3">
            <div className="space-y-2">
              {paginatedHistory.map((game) => {
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
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-sm">
                          {mode?.name || "Custom"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(game.timestamp).toLocaleString()}
                        </div>
                        {game.accuracy !== undefined && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Percent className="h-3 w-3" />
                            {game.accuracy.toFixed(1)}% accuracy
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="font-bold text-xl gradient-text">
                          {isSpeedrun ? `${game.score}s` : game.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isSpeedrun ? "Time" : "Points"}
                        </div>
                      </div>
                    </div>
                  </PaperCard>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </PaperCardContent>
        </PaperCard>
      )}

      {/* No games message */}
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
  );
}
