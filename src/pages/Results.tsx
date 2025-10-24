import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  PaperCard,
  PaperCardHeader,
  PaperCardTitle,
  PaperCardContent,
} from "@/components/ui/academic";
import { QuizContext, ResultContext } from "@/contexts/GameContexts";
import { useStats } from "@/hooks/useStats";
import { useGameHistory, TimeRange } from "@/hooks/useGameHistory";
import { getGameModeById, isSpeedrunMode } from "@/types/gameMode";
import {
  Trophy,
  Clock,
  Target,
  Home,
  BarChart3,
  Info,
  TrendingUp,
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

export default function Quiz() {
  const navigate = useNavigate();
  const { saveGameResult } = useStats();
  const { history, fetchHistory } = useGameHistory();
  const [saving, setSaving] = useState(false);
  const [scoresTimeRange, setScoresTimeRange] = useState<TimeRange>("all");
  const [accuracyTimeRange, setAccuracyTimeRange] = useState<TimeRange>("all");
  const hasSavedRef = useRef(false);

  const quizContext = useContext(QuizContext);
  const resultContext = useContext(ResultContext);

  if (!quizContext || !resultContext) {
    throw new Error(
      "Results must be used within QuizContext and ResultContext providers",
    );
  }

  const { results } = resultContext;
  const { settings } = quizContext;

  // Save game results to Firebase (only once on mount)
  useEffect(() => {
    const saveResults = async () => {
      // Prevent duplicate saves (important for React Strict Mode in development)
      if (hasSavedRef.current) {
        return;
      }

      // Only save if trackStats is true (default to true for backward compatibility)
      const shouldTrack = settings.trackStats !== false;

      if (results.score !== undefined && results.duration && shouldTrack) {
        hasSavedRef.current = true;
        setSaving(true);
        try {
          await saveGameResult({
            score: results.score,
            duration: results.duration,
            gameModeId: results.gameModeId,
            totalKeystrokes: results.totalKeystrokes,
            backspaceCount: results.backspaceCount,
            accuracy: results.accuracy,
          });
        } catch (error) {
          console.error("Failed to save game results:", error);
          hasSavedRef.current = false; // Reset on error to allow retry
        } finally {
          setSaving(false);
        }
      }
    };

    saveResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Fetch game history for graphs
  useEffect(() => {
    if (results.gameModeId) {
      fetchHistory("all");
    }
  }, [results.gameModeId, fetchHistory]);

  const gameMode = results.gameModeId
    ? getGameModeById(results.gameModeId)
    : null;
  const shouldTrack = settings.trackStats !== false;
  const isSpeedrun = useMemo(() => isSpeedrunMode(gameMode), [gameMode]);

  // Calculate best score from history for this game mode
  const bestScore = useMemo(() => {
    if (!results.gameModeId || history.length === 0) return null;

    const gameModeHistory = history.filter(
      (entry) => entry.gameModeId === results.gameModeId,
    );

    if (gameModeHistory.length === 0) return null;

    if (isSpeedrun) {
      // For speedrun, lower is better
      return Math.min(...gameModeHistory.map((entry) => entry.score));
    } else {
      // For timed, higher is better
      return Math.max(...gameModeHistory.map((entry) => entry.score));
    }
  }, [history, results.gameModeId, isSpeedrun]);

  // Prepare data for graphs
  const scoresData = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    let startTime = 0;
    switch (scoresTimeRange) {
      case "today":
        startTime = now - day;
        break;
      case "week":
        startTime = now - 7 * day;
        break;
      case "month":
        startTime = now - 30 * day;
        break;
      case "all":
      default:
        startTime = 0;
    }

    const filtered = history
      .filter(
        (entry) =>
          entry.gameModeId === results.gameModeId &&
          entry.timestamp >= startTime,
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    return filtered.map((entry, index) => ({
      game: index + 1,
      score: entry.score,
      date: new Date(entry.timestamp).toLocaleDateString(),
    }));
  }, [history, scoresTimeRange, results.gameModeId]);

  const accuracyData = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    let startTime = 0;
    switch (accuracyTimeRange) {
      case "today":
        startTime = now - day;
        break;
      case "week":
        startTime = now - 7 * day;
        break;
      case "month":
        startTime = now - 30 * day;
        break;
      case "all":
      default:
        startTime = 0;
    }

    const filtered = history
      .filter(
        (entry) =>
          entry.gameModeId === results.gameModeId &&
          entry.timestamp >= startTime,
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    return filtered
      .filter((entry) => entry.accuracy !== undefined)
      .map((entry, index) => ({
        game: index + 1,
        accuracy: entry.accuracy,
        date: new Date(entry.timestamp).toLocaleDateString(),
      }));
  }, [history, accuracyTimeRange, results.gameModeId]);

  return (
    <div className="container mx-auto px-4 py-6 min-h-[calc(100vh-8rem)]">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[1fr,400px] gap-4">
          {/* Left Side - Performance Graphs */}
          <div className="space-y-4">
            {/* Scores Over Time Graph */}
            <PaperCard variant="folded-sm" padding="sm">
              <PaperCardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <PaperCardTitle className="text-lg">
                      {isSpeedrun ? "Times Over Games" : "Scores Over Games"}
                    </PaperCardTitle>
                  </div>
                  <Tabs
                    value={scoresTimeRange}
                    onValueChange={(value) =>
                      setScoresTimeRange(value as TimeRange)
                    }
                  >
                    <TabsList className="h-8">
                      <TabsTrigger value="today" className="text-xs px-2">
                        Today
                      </TabsTrigger>
                      <TabsTrigger value="week" className="text-xs px-2">
                        Week
                      </TabsTrigger>
                      <TabsTrigger value="month" className="text-xs px-2">
                        Month
                      </TabsTrigger>
                      <TabsTrigger value="all" className="text-xs px-2">
                        All
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </PaperCardHeader>
              <PaperCardContent className="pt-0">
                {scoresData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={scoresData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                          value: isSpeedrun ? "Time (s)" : "Score",
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
                  <div className="h-[150px] flex items-center justify-center text-sm text-muted-foreground">
                    No data available for this time period
                  </div>
                )}
              </PaperCardContent>
            </PaperCard>

            {/* Accuracy Over Time Graph */}
            <PaperCard variant="folded-sm" padding="sm">
              <PaperCardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <PaperCardTitle className="text-lg">
                      Accuracy Over Games
                    </PaperCardTitle>
                  </div>
                  <Tabs
                    value={accuracyTimeRange}
                    onValueChange={(value) =>
                      setAccuracyTimeRange(value as TimeRange)
                    }
                  >
                    <TabsList className="h-8">
                      <TabsTrigger value="today" className="text-xs px-2">
                        Today
                      </TabsTrigger>
                      <TabsTrigger value="week" className="text-xs px-2">
                        Week
                      </TabsTrigger>
                      <TabsTrigger value="month" className="text-xs px-2">
                        Month
                      </TabsTrigger>
                      <TabsTrigger value="all" className="text-xs px-2">
                        All
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </PaperCardHeader>
              <PaperCardContent className="pt-0">
                {accuracyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={accuracyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                                Accuracy:{" "}
                                {(payload[0].value as number).toFixed(1)}%
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-in-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[150px] flex items-center justify-center text-sm text-muted-foreground">
                    No accuracy data available for this time period
                  </div>
                )}
              </PaperCardContent>
            </PaperCard>
          </div>

          {/* Right Side - Current Results */}
          <div className="space-y-4">
            <Card className="border-2 shadow-lg h-full flex flex-col">
              <CardHeader className="text-center space-y-4 pb-4">
                {/* Header - Quiz Complete + Game Mode */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-7 w-7 text-success" />
                    <h1 className="text-2xl font-bold gradient-text">
                      Quiz Complete!
                    </h1>
                  </div>
                  {gameMode && (
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {gameMode.name}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Score - Primary Metric */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    {isSpeedrun ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <Trophy className="h-5 w-5" />
                    )}
                    <p className="text-sm font-medium uppercase tracking-wide">
                      {isSpeedrun ? "Completion Time" : "Your Score"}
                    </p>
                  </div>
                  <p className="text-5xl font-bold gradient-text">
                    {isSpeedrun ? `${results.score}s` : results.score}
                  </p>
                  {isSpeedrun && gameMode?.targetQuestions && (
                    <p className="text-sm text-muted-foreground">
                      {gameMode.targetQuestions} questions completed
                    </p>
                  )}
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="pt-4 space-y-4">
                {/* Secondary Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {results.accuracy !== undefined && (
                    <div className="text-center space-y-1 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <p className="text-xs font-medium uppercase">
                          Accuracy
                        </p>
                      </div>
                      <p className="text-xl font-bold">
                        {results.accuracy.toFixed(1)}%
                      </p>
                    </div>
                  )}
                  {bestScore !== null && (
                    <div className="text-center space-y-1 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        <p className="text-xs font-medium uppercase">
                          Best {isSpeedrun ? "Time" : "Score"}
                        </p>
                      </div>
                      <p className="text-xl font-bold">
                        {isSpeedrun ? `${bestScore}s` : bestScore}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Messages */}
                {saving && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    <span>Saving results...</span>
                  </div>
                )}
                {!shouldTrack && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span className="italic">This game was not tracked</span>
                  </div>
                )}
              </CardContent>

              <Separator />

              <CardFooter className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => navigate("/stats")}
                  variant="outline"
                  className="w-full"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Stats
                </Button>
                <Button
                  onClick={() => navigate("/singleplayer")}
                  className="w-full shadow-sm"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
