import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameHistory, TimeRange } from '@/hooks/useGameHistory';
import { OFFICIAL_GAME_MODES } from '@/types/gameMode';

export default function Stats() {
  const { history, loading, fetchHistory, getStatsForTimeRange, getScoresByGameMode } = useGameHistory();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  useEffect(() => {
    fetchHistory(timeRange);
  }, [timeRange, fetchHistory]);

  const rangeStats = getStatsForTimeRange(timeRange);
  const scoresByMode = getScoresByGameMode();

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Statistics</CardTitle>
          <CardDescription>Track your progress and performance</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Time range selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  timeRange === range.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Games Played</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{rangeStats.gamesPlayed}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{rangeStats.totalScore}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Average Score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{rangeStats.averageScore}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>High Score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{rangeStats.highScore}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Scores by game mode */}
              {Object.keys(scoresByMode).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance by Game Mode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(scoresByMode).map(([modeId, scores]) => {
                        const mode = OFFICIAL_GAME_MODES.find((m) => m.id === modeId);
                        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                        const maxScore = Math.max(...scores);

                        return (
                          <div key={modeId} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{mode?.name || modeId}</span>
                              <span className="text-sm text-muted-foreground">
                                {scores.length} games
                              </span>
                            </div>
                            <div className="flex gap-4 text-sm">
                              <span>Avg: {avgScore.toFixed(1)}</span>
                              <span>Best: {maxScore}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${(avgScore / maxScore) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent games */}
              {history.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {history.slice(0, 10).map((game) => {
                        const mode = OFFICIAL_GAME_MODES.find((m) => m.id === game.gameModeId);
                        return (
                          <div
                            key={game.id}
                            className="flex justify-between items-center p-3 rounded-md bg-muted/50"
                          >
                            <div>
                              <div className="font-medium">{mode?.name || 'Custom'}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(game.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{game.score}</div>
                              <div className="text-sm text-muted-foreground">{game.duration}s</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {history.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No games played yet. Start playing to see your stats!
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

