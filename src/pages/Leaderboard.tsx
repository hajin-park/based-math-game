import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
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
      // Use flat collection structure: leaderboard-{gameModeId}
      const leaderboardRef = collection(firestore, `leaderboard-${gameModeId}`);

      // Query Firestore for top 50 scores, ordered by score descending
      const leaderboardQuery = query(
        leaderboardRef,
        orderBy('score', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(leaderboardQuery);

      if (!snapshot.empty) {
        const entries: LeaderboardEntry[] = snapshot.docs
          .filter((doc) => {
            // Filter out guest users (UIDs starting with 'guest_')
            // and entries marked as guest
            const data = doc.data();
            const isGuestUid = doc.id.startsWith('guest_');
            const isGuestMarked = data.isGuest === true;
            return !isGuestUid && !isGuestMarked;
          })
          .map((doc) => {
            const data = doc.data();
            return {
              uid: doc.id,
              displayName: data.displayName as string,
              score: data.score as number,
              timestamp: data.timestamp as number,
            };
          });

        setLeaderboard(entries);
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

