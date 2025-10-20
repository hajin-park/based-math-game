import { useState, useEffect } from 'react';
import { ref, query, orderByChild, limitToFirst, get } from 'firebase/database';
import { database } from '@/firebase/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OFFICIAL_GAME_MODES } from '@/types/gameMode';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  score: number;
  timestamp: number;
}

export default function Leaderboard() {
  const [selectedMode, setSelectedMode] = useState(OFFICIAL_GAME_MODES[0].id);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard(selectedMode);
  }, [selectedMode]);

  const fetchLeaderboard = async (gameModeId: string) => {
    setLoading(true);
    try {
      const leaderboardRef = ref(database, `leaderboards/${gameModeId}`);
      const leaderboardQuery = query(leaderboardRef, orderByChild('score'), limitToFirst(100));
      
      const snapshot = await get(leaderboardQuery);
      const data = snapshot.val();

      if (data) {
        const entries: LeaderboardEntry[] = Object.entries(data).map(([uid, value]: [string, any]) => ({
          uid,
          displayName: value.displayName,
          score: value.score,
          timestamp: value.timestamp,
        }));

        // Sort by score descending
        entries.sort((a, b) => b.score - a.score);
        setLeaderboard(entries.slice(0, 50));
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedModeData = OFFICIAL_GAME_MODES.find((mode) => mode.id === selectedMode);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Top scores for each game mode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mode selector */}
            <div className="flex flex-wrap gap-2">
              {OFFICIAL_GAME_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedMode === mode.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {mode.name}
                </button>
              ))}
            </div>

            {/* Leaderboard table */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left font-medium">Rank</th>
                      <th className="p-4 text-left font-medium">Player</th>
                      <th className="p-4 text-right font-medium">Score</th>
                      <th className="p-4 text-right font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr key={entry.uid} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-4">
                          <span className={`font-bold ${index < 3 ? 'text-yellow-600' : ''}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className="p-4">{entry.displayName}</td>
                        <td className="p-4 text-right font-semibold">{entry.score}</td>
                        <td className="p-4 text-right text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No scores yet for {selectedModeData?.name}. Be the first!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

