import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { OFFICIAL_GAME_MODES } from '@/types/gameMode';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Medal, Loader2, Target, Users } from 'lucide-react';

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

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-600" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 animate-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold gradient-text">Leaderboard</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Top scores for each game mode
        </p>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Global Rankings
          </CardTitle>
          <CardDescription className="text-base">
            Compete with players worldwide
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode selector */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Select Game Mode</Label>
                </div>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger className="w-full h-11">
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
            </CardContent>
          </Card>

          {/* User's Rank Card (if not in top 50) */}
          {!isGuest && userRank && userRank.rank > 50 && (
            <Card className="bg-primary/10 border-primary/50 border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-muted-foreground">Your Rank</p>
                    </div>
                    <p className="text-4xl font-bold gradient-text">#{userRank.rank}</p>
                    <p className="text-xs text-muted-foreground">
                      out of {userRank.totalPlayers} players
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-2 justify-end">
                      <Trophy className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium text-muted-foreground">Your Score</p>
                    </div>
                    <p className="text-4xl font-bold gradient-text">{userRank.score}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = user && entry.uid === user.uid;
                const rankIcon = getRankIcon(index);

                return (
                  <Card
                    key={entry.uid}
                    className={`border-2 transition-all ${
                      isCurrentUser
                        ? 'border-primary bg-primary/10 shadow-md'
                        : index < 3
                        ? 'border-yellow-600/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5'
                        : 'border-muted hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                            {rankIcon || (
                              <span className="font-bold text-lg text-muted-foreground">
                                #{index + 1}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{entry.displayName}</p>
                              {isCurrentUser && (
                                <Badge variant="default" className="text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-3xl gradient-text">{entry.score}</p>
                          <p className="text-xs text-muted-foreground">points</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12">
                <div className="text-center space-y-3">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No scores yet for {selectedModeData?.name}. Be the first!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

