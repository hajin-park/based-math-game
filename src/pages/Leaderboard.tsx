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
    <div className="container mx-auto px-4 py-4 space-y-4">
      <PaperCard variant="folded" padding="none" className="shadow-lg">
        <PaperCardHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <PaperCardTitle className="text-2xl">
                <span className="highlight-scribble">Global Rankings</span>
              </PaperCardTitle>
              <PaperCardDescription className="text-xs annotation">
                Compete with players worldwide
              </PaperCardDescription>
            </div>
          </div>
        </PaperCardHeader>
        <PaperCardContent className="p-4 pt-0 space-y-4">
          {/* Mode selector */}
          <PaperCard variant="folded-sm" padding="default" className="border">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">
                  Select Game Mode
                </Label>
              </div>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className="w-full h-9">
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <PaperCard variant="folded-sm" padding="default" className="border">
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
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground annotation">
                Loading leaderboard...
              </p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-1">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = user && entry.uid === user.uid;
                const globalRank =
                  (currentPage - 1) * ENTRIES_PER_PAGE + index + 1;
                const gameMode = getGameModeById(selectedMode);
                const isSpeedrun = isSpeedrunMode(gameMode);

                return (
                  <PaperCard
                    key={entry.uid}
                    variant="default"
                    padding="none"
                    className={`border transition-all duration-150 ${
                      isCurrentUser
                        ? "border-primary bg-primary/5 shadow-sm"
                        : globalRank <= 3
                          ? "border-yellow-600/20 bg-yellow-500/5"
                          : "border-border hover:border-primary/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 w-full">
                      {/* Rank Column - Fixed Width */}
                      <div
                        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 ${
                          globalRank <= 3
                            ? "bg-trophy/20 border-2 border-trophy/40"
                            : "bg-muted"
                        }`}
                      >
                        <span
                          className={`font-bold text-sm sm:text-base ${
                            globalRank <= 3
                              ? "text-trophy"
                              : "text-muted-foreground"
                          }`}
                        >
                          {globalRank}
                        </span>
                      </div>

                      {/* Name & Info Column - Flexible Width */}
                      <div className="min-w-0 flex items-center gap-1.5 sm:gap-2">
                        <p className="font-serif font-semibold text-sm sm:text-base truncate m-0">
                          {entry.displayName}
                        </p>
                        {isCurrentUser && (
                          <Badge
                            variant="default"
                            className="text-xs h-5 px-2 flex-shrink-0"
                          >
                            You
                          </Badge>
                        )}
                        {globalRank <= 3 && (
                          <Trophy
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${
                              globalRank === 1
                                ? "text-yellow-500"
                                : globalRank === 2
                                  ? "text-gray-400"
                                  : "text-orange-600"
                            }`}
                          />
                        )}
                        <span className="text-muted-foreground flex-shrink-0 hidden sm:inline">
                          •
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:inline">
                          {new Date(entry.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0 hidden md:inline">
                          {new Date(entry.timestamp).getFullYear()}
                        </span>
                        {entry.accuracy !== undefined && (
                          <>
                            <span className="text-muted-foreground flex-shrink-0 hidden sm:inline">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:inline">
                              {entry.accuracy.toFixed(1)}%
                              <span className="hidden md:inline">
                                {" "}
                                accuracy
                              </span>
                            </span>
                          </>
                        )}
                      </div>

                      {/* Score Column - Fixed Width */}
                      <div className="flex items-center gap-1 sm:gap-1.5 justify-end flex-shrink-0 min-w-[70px] sm:min-w-[90px]">
                        <p className="font-mono font-bold text-lg sm:text-xl m-0">
                          {isSpeedrun ? `${entry.score}s` : entry.score}
                        </p>
                        <p className="text-xs text-muted-foreground hidden sm:inline m-0">
                          {isSpeedrun ? "time" : "points"}
                        </p>
                      </div>
                    </div>
                  </PaperCard>
                );
              })}

              {/* Compact Your Rank Tag */}
              {!isGuest &&
                userRank &&
                (() => {
                  const gameMode = getGameModeById(selectedMode);
                  const isSpeedrun = isSpeedrunMode(gameMode);
                  const userPage = Math.ceil(userRank.rank / ENTRIES_PER_PAGE);
                  const isOnUserPage = userPage === currentPage;

                  return (
                    <div className="mt-3 pt-3 ruled-line">
                      <PaperCard
                        variant="folded-sm"
                        padding="sm"
                        className="bg-primary/5 border-primary/20"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Users className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-muted-foreground text-xs">
                                Your rank:
                              </span>
                              <span className="font-bold text-primary">
                                #{userRank.rank}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                / {userRank.totalPlayers}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground text-xs">
                                Score:
                              </span>
                              <span className="font-mono font-bold text-primary text-sm">
                                {isSpeedrun
                                  ? `${userRank.score}s`
                                  : userRank.score}
                              </span>
                              {userRank.accuracy !== undefined && (
                                <>
                                  <span className="text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {userRank.accuracy.toFixed(1)}% accuracy
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {!isOnUserPage && (
                            <Button
                              onClick={handleJumpToUserRank}
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs flex-shrink-0"
                            >
                              Jump to page {userPage}
                            </Button>
                          )}
                        </div>
                      </PaperCard>
                    </div>
                  );
                })()}
            </div>
          ) : (
            <PaperCard
              variant="folded-sm"
              padding="default"
              className="border border-dashed"
            >
              <div className="py-6 text-center space-y-2">
                <Trophy className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
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
