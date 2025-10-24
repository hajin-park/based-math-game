import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { firestore } from "@/firebase/config";
import {
  PaperCard,
  PaperCardContent,
  PaperCardDescription,
  PaperCardHeader,
  PaperCardTitle,
  SectionHeader,
} from "@/components/ui/academic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  OFFICIAL_GAME_MODES,
  getGameModeById,
  isSpeedrunMode,
} from "@/types/gameMode";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Crown,
  Medal,
  Loader2,
  Target,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  score: number;
  timestamp: number;
  accuracy?: number;
}

interface UserRank {
  rank: number;
  score: number;
  totalPlayers: number;
  accuracy?: number;
}

const ENTRIES_PER_PAGE = 20;

export default function Leaderboard() {
  const { user, isGuest } = useAuth();
  const [selectedMode, setSelectedMode] = useState(OFFICIAL_GAME_MODES[0].id);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const fetchUserRank = useCallback(
    async (gameModeId: string) => {
      if (!user || isGuest) return;

      try {
        const gameMode = getGameModeById(gameModeId);
        const isSpeedrun = isSpeedrunMode(gameMode);

        // Get user's score
        const userDocRef = doc(
          firestore,
          `leaderboard-${gameModeId}`,
          user.uid,
        );
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setUserRank(null);
          return;
        }

        const userData = userDoc.data();
        const userScore = userData.score as number;
        const userAccuracy = userData.accuracy as number | undefined;

        // Get all leaderboard entries
        const leaderboardRef = collection(
          firestore,
          `leaderboard-${gameModeId}`,
        );
        const leaderboardQuery = query(
          leaderboardRef,
          orderBy("score", isSpeedrun ? "asc" : "desc"),
        );

        const snapshot = await getDocs(leaderboardQuery);

        // Filter out guest users and count rank
        const validEntries = snapshot.docs.filter((doc) => {
          const data = doc.data();
          const isGuestUid = doc.id.startsWith("guest_");
          const isGuestMarked = data.isGuest === true;
          return !isGuestUid && !isGuestMarked;
        });

        const rank = validEntries.findIndex((doc) => doc.id === user.uid) + 1;

        if (rank > 0) {
          setUserRank({
            rank,
            score: userScore,
            totalPlayers: validEntries.length,
            accuracy: userAccuracy,
          });
        } else {
          setUserRank(null);
        }
      } catch (error) {
        console.error("Error fetching user rank:", error);
        setUserRank(null);
      }
    },
    [user, isGuest],
  );

  const fetchLeaderboard = useCallback(
    async (gameModeId: string, page: number = 1) => {
      setLoading(true);
      try {
        const gameMode = getGameModeById(gameModeId);
        const isSpeedrun = isSpeedrunMode(gameMode);

        // Use flat collection structure: leaderboard-{gameModeId}
        const leaderboardRef = collection(
          firestore,
          `leaderboard-${gameModeId}`,
        );

        // First, get all entries to calculate total count and support pagination
        // For speedrun: order by score ascending (lower is better)
        // For timed: order by score descending (higher is better)
        const allEntriesQuery = query(
          leaderboardRef,
          orderBy("score", isSpeedrun ? "asc" : "desc"),
        );

        const snapshot = await getDocs(allEntriesQuery);

        // Filter out guest users
        const allEntries: LeaderboardEntry[] = snapshot.docs
          .filter((doc) => {
            const data = doc.data();
            const isGuestUid = doc.id.startsWith("guest_");
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
              accuracy: data.accuracy as number | undefined,
            };
          });

        // Set total entries count
        setTotalEntries(allEntries.length);

        // Paginate the results
        const startIndex = (page - 1) * ENTRIES_PER_PAGE;
        const endIndex = startIndex + ENTRIES_PER_PAGE;
        const paginatedEntries = allEntries.slice(startIndex, endIndex);

        setLeaderboard(paginatedEntries);

        // Fetch user's rank if authenticated and not a guest
        if (user && !isGuest) {
          await fetchUserRank(gameModeId);
        } else {
          setUserRank(null);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLeaderboard([]);
        setUserRank(null);
        setTotalEntries(0);
      } finally {
        setLoading(false);
      }
    },
    [user, isGuest, fetchUserRank],
  );

  // Reset to page 1 when mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMode]);

  // Fetch leaderboard when mode or page changes
  useEffect(() => {
    fetchLeaderboard(selectedMode, currentPage);
  }, [selectedMode, currentPage, fetchLeaderboard]);

  const selectedModeData = OFFICIAL_GAME_MODES.find(
    (mode) => mode.id === selectedMode,
  );
  const totalPages = Math.ceil(totalEntries / ENTRIES_PER_PAGE);

  const getRankIcon = (index: number) => {
    // Adjust index based on current page
    const globalIndex = (currentPage - 1) * ENTRIES_PER_PAGE + index;
    if (globalIndex === 0) return <Crown className="h-5 w-5 text-yellow-600" />;
    if (globalIndex === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (globalIndex === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return null;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleJumpToUserRank = () => {
    if (userRank && userRank.rank > 0) {
      const userPage = Math.ceil(userRank.rank / ENTRIES_PER_PAGE);
      if (userPage !== currentPage) {
        setCurrentPage(userPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with paper texture background */}
      <section className="relative overflow-hidden py-6 paper-texture">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-background -z-10" />

        <SectionHeader
          title="Leaderboard"
          description="Top scores for each game mode"
          icon={Trophy}
          align="center"
          titleSize="xl"
        />
      </section>

      <PaperCard variant="folded" padding="none" className="shadow-lg">
        <PaperCardHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <PaperCardTitle className="text-2xl">
                Global Rankings
              </PaperCardTitle>
              <PaperCardDescription className="text-base">
                Compete with players worldwide
              </PaperCardDescription>
            </div>
          </div>
        </PaperCardHeader>
        <PaperCardContent className="p-6 pt-0 space-y-6">
          {/* Mode selector */}
          <PaperCard variant="folded-sm" padding="sm" className="border-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">
                  Select Game Mode
                </Label>
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
                  {OFFICIAL_GAME_MODES.filter((m) => m.id.includes("-15s")).map(
                    (mode) => (
                      <SelectItem key={mode.id} value={mode.id}>
                        {mode.name}
                      </SelectItem>
                    ),
                  )}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                    Timed - 60 Seconds
                  </div>
                  {OFFICIAL_GAME_MODES.filter((m) => m.id.includes("-60s")).map(
                    (mode) => (
                      <SelectItem key={mode.id} value={mode.id}>
                        {mode.name}
                      </SelectItem>
                    ),
                  )}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                    Speed Run - 10 Questions
                  </div>
                  {OFFICIAL_GAME_MODES.filter((m) => m.id.includes("-10q")).map(
                    (mode) => (
                      <SelectItem key={mode.id} value={mode.id}>
                        {mode.name}
                      </SelectItem>
                    ),
                  )}
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                    Speed Run - 30 Questions
                  </div>
                  {OFFICIAL_GAME_MODES.filter((m) => m.id.includes("-30q")).map(
                    (mode) => (
                      <SelectItem key={mode.id} value={mode.id}>
                        {mode.name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </PaperCard>

          {/* User's Rank Card */}
          {!isGuest &&
            userRank &&
            (() => {
              const gameMode = getGameModeById(selectedMode);
              const isSpeedrun = isSpeedrunMode(gameMode);
              const userPage = Math.ceil(userRank.rank / ENTRIES_PER_PAGE);
              const isOnUserPage = userPage === currentPage;

              return (
                <PaperCard
                  variant="folded-sm"
                  padding="sm"
                  className="bg-primary/10 border-primary/50 border-2 highlight-scribble"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Your Rank
                        </p>
                      </div>
                      <p className="text-4xl font-bold gradient-text">
                        #{userRank.rank}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        out of {userRank.totalPlayers} players
                      </p>
                      {!isOnUserPage && (
                        <Button
                          onClick={handleJumpToUserRank}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          Jump to My Rank
                        </Button>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2 justify-end">
                        <Trophy className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Your Score
                        </p>
                      </div>
                      <p className="text-4xl font-bold gradient-text">
                        {isSpeedrun ? `${userRank.score}s` : userRank.score}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSpeedrun ? "time" : "points"}
                      </p>
                      {userRank.accuracy !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          {userRank.accuracy.toFixed(1)}% accuracy
                        </p>
                      )}
                    </div>
                  </div>
                </PaperCard>
              );
            })()}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <PaperCard variant="folded-sm" padding="sm" className="border-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Showing {(currentPage - 1) * ENTRIES_PER_PAGE + 1}-
                    {Math.min(currentPage * ENTRIES_PER_PAGE, totalEntries)} of{" "}
                    {totalEntries} players
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </PaperCard>
          )}

          {/* Leaderboard table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Loading leaderboard...
              </p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = user && entry.uid === user.uid;
                const globalRank =
                  (currentPage - 1) * ENTRIES_PER_PAGE + index + 1;
                const rankIcon = getRankIcon(index);
                const gameMode = getGameModeById(selectedMode);
                const isSpeedrun = isSpeedrunMode(gameMode);

                return (
                  <PaperCard
                    key={entry.uid}
                    variant="folded-sm"
                    padding="sm"
                    className={`border-2 transition-all duration-200 ${
                      isCurrentUser
                        ? "border-primary bg-primary/10 shadow-md highlight-scribble"
                        : globalRank <= 3
                          ? "border-yellow-600/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 bookmark-ribbon"
                          : "border-muted hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                          {rankIcon || (
                            <span className="font-bold text-lg text-muted-foreground">
                              #{globalRank}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-serif font-semibold text-lg">
                              {entry.displayName}
                            </p>
                            {isCurrentUser && (
                              <Badge variant="default" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                            {entry.accuracy !== undefined && (
                              <>
                                <span className="text-xs text-muted-foreground">
                                  •
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {entry.accuracy.toFixed(1)}% accuracy
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-3xl gradient-text">
                          {isSpeedrun ? `${entry.score}s` : entry.score}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isSpeedrun ? "time" : "points"}
                        </p>
                      </div>
                    </div>
                  </PaperCard>
                );
              })}
            </div>
          ) : (
            <PaperCard
              variant="folded-sm"
              padding="default"
              className="border-2 border-dashed"
            >
              <div className="py-8 text-center space-y-3">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No scores yet for {selectedModeData?.name}. Be the first!
                </p>
              </div>
            </PaperCard>
          )}
        </PaperCardContent>
      </PaperCard>
    </div>
  );
}
