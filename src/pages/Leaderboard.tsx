import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OFFICIAL_GAME_MODES } from '@/types/gameMode';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  score: number;
  timestamp: number;
}

interface UserRank {
  rank: number;
  score: number;
  totalPlayers: number;
}

export default function Leaderboard() {
  const { user, isGuest } = useAuth();
  const [selectedMode, setSelectedMode] = useState(OFFICIAL_GAME_MODES[0].id);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserRank = useCallback(async (gameModeId: string) => {
    if (!user || isGuest) return;

    try {
      // Get user's score
      const userDocRef = doc(firestore, `leaderboard-${gameModeId}`, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setUserRank(null);
        return;
      }

      const userScore = userDoc.data().score as number;

      // Count how many users have a higher score
      const leaderboardRef = collection(firestore, `leaderboard-${gameModeId}`);
      const higherScoresQuery = query(
        leaderboardRef,
        orderBy('score', 'desc')
      );

      const snapshot = await getDocs(higherScoresQuery);

      // Filter out guest users and count rank
      const validEntries = snapshot.docs.filter((doc) => {
        const data = doc.data();
        const isGuestUid = doc.id.startsWith('guest_');
        const isGuestMarked = data.isGuest === true;
        return !isGuestUid && !isGuestMarked;
      });

      const rank = validEntries.findIndex((doc) => doc.id === user.uid) + 1;

      if (rank > 0) {
        setUserRank({
          rank,
          score: userScore,
          totalPlayers: validEntries.length,
        });
      } else {
        setUserRank(null);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
      setUserRank(null);
    }
  }, [user, isGuest]);

  const fetchLeaderboard = useCallback(async (gameModeId: string) => {
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

      // Fetch user's rank if authenticated and not a guest
      if (user && !isGuest) {
        await fetchUserRank(gameModeId);
      } else {
        setUserRank(null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
      setUserRank(null);
    } finally {
      setLoading(false);
    }
  }, [user, isGuest, fetchUserRank]);

  useEffect(() => {
    fetchLeaderboard(selectedMode);
  }, [selectedMode, fetchLeaderboard]);

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
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Game Mode</label>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a game mode" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  {/* Group by mode type */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Timed - 15 Seconds
                  </div>
                  {OFFICIAL_GAME_MODES.filter(m => m.id.includes('-15s')).map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                    Timed - 60 Seconds
                  </div>
                  {OFFICIAL_GAME_MODES.filter(m => m.id.includes('-60s')).map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                    Speed Run - 10 Questions
                  </div>
                  {OFFICIAL_GAME_MODES.filter(m => m.id.includes('-10q')).map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.name}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                    Speed Run - 30 Questions
                  </div>
                  {OFFICIAL_GAME_MODES.filter(m => m.id.includes('-30q')).map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User's Rank Card (if not in top 50) */}
            {!isGuest && userRank && userRank.rank > 50 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Your Rank</p>
                      <p className="text-2xl font-bold">#{userRank.rank}</p>
                      <p className="text-xs text-muted-foreground">
                        out of {userRank.totalPlayers} players
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Your Score</p>
                      <p className="text-2xl font-bold">{userRank.score}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    {leaderboard.map((entry, index) => {
                      const isCurrentUser = user && entry.uid === user.uid;
                      return (
                        <tr
                          key={entry.uid}
                          className={`border-b last:border-0 ${
                            isCurrentUser
                              ? 'bg-primary/10 hover:bg-primary/15 border-primary/20'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${index < 3 ? 'text-yellow-600' : ''}`}>
                                #{index + 1}
                              </span>
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-medium">{entry.displayName}</td>
                          <td className="p-4 text-right font-semibold">{entry.score}</td>
                          <td className="p-4 text-right text-sm text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
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

