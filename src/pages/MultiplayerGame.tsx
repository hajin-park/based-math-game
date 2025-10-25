import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRoom, Room } from "@/hooks/useRoom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useGameSettings } from "@/hooks/useGameSettings";
import { isSpeedrunMode } from "@/types/gameMode";
import Countdown from "@/components/Countdown";
import QuizPrompt from "@/features/quiz/quiz-questions/Quiz-Prompt.component";
import QuizStats from "@/features/quiz/quiz-questions/Quiz-Stats.component";
import KickedModal from "@/components/KickedModal";
import ChatBox from "@/components/ChatBox";
import { X, Copy, Check, Trophy, Users, Crown, WifiOff } from "lucide-react";

export default function MultiplayerGame() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    joinRoom,
    subscribeToRoom,
    updatePlayerScore,
    finishGame,
    leaveRoom,
  } = useRoom();
  const { settings: gameSettings } = useGameSettings();
  const [room, setRoom] = useState<Room | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [timerShouldStart, setTimerShouldStart] = useState(false);
  const [score, setScore] = useState(0);
  const [randomSetting, setRandomSetting] = useState<
    [string, string, number, number] | null
  >(null);
  const [showKickedModal, setShowKickedModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const scoreRef = useRef(0);
  const questionsRef = useRef<[string, string, number, number][]>([]);
  const hasNavigatedRef = useRef(false);
  const countdownShownRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false);

  // Determine if this is a speedrun mode
  const isSpeedrun = useMemo(
    () => (room ? isSpeedrunMode(room.gameMode) : false),
    [room],
  );

  // Handle timer expiration
  const handleTimerExpire = async () => {
    // For speedrun modes, timer expiry doesn't end the game
    if (roomId && !isSpeedrun) {
      await finishGame(roomId);
    }
  };

  // Ensure user is properly joined/reconnected to the room on mount
  useEffect(() => {
    if (!roomId || !user || hasJoinedRef.current) return;

    const ensureJoined = async () => {
      try {
        await joinRoom(roomId);
        hasJoinedRef.current = true;
      } catch (error) {
        console.error("Error joining room on mount:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to join room";

        // If room not found or user was kicked, navigate away
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("removed from this room")
        ) {
          navigate("/multiplayer", { replace: true });
          toast({
            title: "Unable to join room",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    };

    ensureJoined();
  }, [roomId, user, joinRoom, navigate, toast]);

  // Handle cleanup when component unmounts (user navigates away)
  useEffect(() => {
    const isLeavingRefValue = isLeavingRef;
    const currentPath = location.pathname;

    return () => {
      // Check if we're navigating away from the room entirely
      // Use the path captured when the effect ran, not window.location during cleanup
      const isStillInRoom =
        roomId &&
        (currentPath.includes(`/multiplayer/lobby/${roomId}`) ||
          currentPath.includes(`/multiplayer/game/${roomId}`) ||
          currentPath.includes(`/multiplayer/results/${roomId}`));

      // Only leave if we're not in the same room and not explicitly leaving
      if (roomId && user && !isStillInRoom && !isLeavingRefValue.current) {
        leaveRoom(roomId).catch((error) => {
          console.error("Error leaving room on unmount:", error);
        });
      }
    };
  }, [roomId, user, leaveRoom, location.pathname]);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      // Handle room deletion (host disconnected)
      if (!updatedRoom) {
        // Prevent multiple navigations
        if (hasNavigatedRef.current) return;
        hasNavigatedRef.current = true;

        // Navigate first, then show toast
        navigate("/multiplayer", { replace: true });

        // Show toast after navigation
        setTimeout(() => {
          toast({
            title: "Host Disconnected",
            description: "The host has left the game.",
            variant: "destructive",
          });
        }, 100);
        return;
      }

      // Check if current user was kicked
      if (user && updatedRoom.players[user.uid]?.kicked) {
        // Prevent multiple navigations
        if (hasNavigatedRef.current) return;
        hasNavigatedRef.current = true;

        // Show modal first
        setShowKickedModal(true);
        return;
      }

      setRoom(updatedRoom);

      // Shuffle questions based on startedAt to get different questions each game
      // Use startedAt as seed so all players get same shuffled order
      if (updatedRoom.startedAt) {
        const seed = updatedRoom.startedAt;
        const questions = [...updatedRoom.gameMode.questions];

        // Seeded shuffle using Fisher-Yates with LCG random
        const seededRandom = (s: number) => {
          const a = 1664525;
          const c = 1013904223;
          const m = Math.pow(2, 32);
          return ((a * s + c) % m) / m;
        };

        let currentSeed = seed;
        for (let i = questions.length - 1; i > 0; i--) {
          currentSeed = Math.floor(seededRandom(currentSeed) * Math.pow(2, 32));
          const j = Math.floor(seededRandom(currentSeed) * (i + 1));
          [questions[i], questions[j]] = [questions[j], questions[i]];
        }

        questionsRef.current = questions;
      } else {
        // Game hasn't started yet, use original order
        questionsRef.current = updatedRoom.gameMode.questions;
      }

      // Show countdown when game starts (only once)
      if (
        updatedRoom.status === "playing" &&
        updatedRoom.enableCountdown &&
        !countdownShownRef.current
      ) {
        setShowCountdown(true);
        countdownShownRef.current = true;
      }

      // Start timer immediately if countdown is disabled
      if (
        updatedRoom.status === "playing" &&
        !updatedRoom.enableCountdown &&
        !countdownShownRef.current
      ) {
        setTimerShouldStart(true);
        countdownShownRef.current = true;
      }

      // Navigate to lobby if game was reset (host left mid-game)
      if (updatedRoom.status === "waiting") {
        navigate(`/multiplayer/lobby/${roomId}`, { replace: true });
        toast({
          title: "Host Left",
          description: "The host left the game. A new host has been assigned.",
        });
        return;
      }

      // Navigate to results when game finishes
      if (updatedRoom.status === "finished") {
        navigate(`/multiplayer/results/${roomId}`);
      }
    });

    return () => unsubscribe();
  }, [roomId, subscribeToRoom, navigate, toast, user]);

  // Initialize question based on current score - deterministic for all players
  useEffect(() => {
    if (questionsRef.current.length > 0) {
      // Use score as index to ensure all players get same questions in same order
      // Score 0 = question 0, score 1 = question 1, etc.
      const questionIndex = score % questionsRef.current.length;
      const setting = questionsRef.current[questionIndex];
      setRandomSetting(setting);
    }
  }, [score]); // Runs on mount (score=0) and whenever score changes

  // Update score in Firebase
  useEffect(() => {
    scoreRef.current = score;
    if (roomId) {
      updatePlayerScore(roomId, score);
    }
  }, [score, roomId, updatePlayerScore]);

  // Check if target questions reached (for speed run modes)
  useEffect(() => {
    if (
      isSpeedrun &&
      room?.gameMode.targetQuestions &&
      score >= room.gameMode.targetQuestions
    ) {
      // Target reached, calculate elapsed time and update score
      if (roomId && room.startedAt) {
        const elapsedTime = Math.floor((Date.now() - room.startedAt) / 1000);
        // Update score to elapsed time for speedrun modes
        updatePlayerScore(roomId, elapsedTime).then(() => {
          finishGame(roomId);
        });
      }
    }
  }, [
    score,
    room?.gameMode.targetQuestions,
    room?.startedAt,
    roomId,
    finishGame,
    updatePlayerScore,
    isSpeedrun,
  ]);

  // Calculate expiry timestamp based on room startedAt and duration
  // For speedrun modes, set a very long duration (24 hours) since we count up
  const expiryTimestamp = useMemo(() => {
    if (room?.startedAt && room?.gameMode.duration) {
      const elapsed = Math.floor((Date.now() - room.startedAt) / 1000);
      // For speedrun modes, use 24 hours minus elapsed time to create count-up effect
      const duration = isSpeedrun ? 86400 : room.gameMode.duration;
      const remaining = Math.max(0, duration - elapsed);
      const expiry = new Date();
      expiry.setSeconds(expiry.getSeconds() + remaining);

      console.log("Calculating expiry timestamp:", {
        startedAt: room.startedAt,
        elapsed,
        remaining,
        isSpeedrun,
        expiry: expiry.toISOString(),
      });

      return expiry;
    }

    // Default expiry (60 seconds or 24 hours for speedrun)
    const time = new Date();
    time.setSeconds(time.getSeconds() + (isSpeedrun ? 86400 : 60));
    return time;
  }, [room?.startedAt, room?.gameMode.duration, isSpeedrun]);

  // Generate deterministic seed for multiplayer questions
  // Combine room ID hash with score to ensure all players get same questions
  const questionSeed = useMemo(() => {
    if (!roomId) return undefined;
    // Simple hash function for room ID
    let hash = 0;
    for (let i = 0; i < roomId.length; i++) {
      hash = (hash << 5) - hash + roomId.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Combine with score to get unique seed for each question
    return hash + score * 1000;
  }, [roomId, score]);

  if (!room || !randomSetting || !room.startedAt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleExit = async () => {
    if (roomId) {
      await leaveRoom(roomId);
    }
    navigate("/multiplayer");
  };

  const handleKickedModalClose = () => {
    setShowKickedModal(false);
    navigate("/multiplayer", { replace: true });
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setTimerShouldStart(true);
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Count active players
  const playerCount = room
    ? Object.values(room.players).filter((p) => !p.kicked).length
    : 0;

  return (
    <>
      <KickedModal open={showKickedModal} onClose={handleKickedModalClose} />
      {showCountdown && (
        <Countdown onComplete={handleCountdownComplete} duration={3} />
      )}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Row 1 - Header */}
        <div className="flex-none border-b-2 border-border bg-card paper-texture">
          <div className="px-2 py-1.5">
            <div className="flex items-center justify-between gap-2">
              {/* Exit Button - Left */}
              <Button
                onClick={handleExit}
                variant="outline"
                size="sm"
                className="gap-1 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </Button>

              {/* Game Title - Center */}
              <div className="flex-1 text-center min-w-0">
                <h1 className="text-sm md:text-base font-serif font-bold truncate">
                  {room.gameMode.name}
                </h1>
              </div>

              {/* Room Code Display - Right */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground leading-tight">
                    Room Code
                  </p>
                  <p className="font-mono font-bold text-xs tracking-wider uppercase text-primary">
                    {roomId}
                  </p>
                </div>
                <Button
                  onClick={handleCopyRoomId}
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Copy room code"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 - Main Content (Desktop: 3 columns, Mobile: 3 rows) */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full flex flex-col lg:grid lg:grid-cols-[minmax(200px,280px)_1fr_minmax(200px,280px)] gap-0">
            {/* Desktop Left Column - User List */}
            <div className="hidden lg:flex flex-col border-r-2 border-border bg-card paper-texture overflow-hidden">
              <div className="flex-none p-1.5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <h2 className="text-xs font-serif font-semibold">
                      Players ({playerCount}/{room.maxPlayers || 4})
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                {Object.values(room.players).map((player) => {
                  const isPlayerHost = player.uid === room.hostUid;
                  const wins = player.wins || 0;
                  const isDisconnected = player.disconnected === true;
                  const isKicked = player.kicked === true;

                  if (isKicked) return null;

                  return (
                    <div
                      key={player.uid}
                      className={`flex items-center justify-between p-1.5 rounded-md border text-xs ${
                        isDisconnected
                          ? "bg-muted/30 border-muted"
                          : "bg-muted/50 border-muted"
                      }`}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-medium truncate ${isDisconnected ? "text-muted-foreground" : ""}`}
                          >
                            {player.displayName}
                          </span>
                          {isPlayerHost && (
                            <Crown className="h-3 w-3 text-yellow-600 shrink-0" />
                          )}
                        </div>
                        {wins > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Trophy className="h-2.5 w-2.5" />
                            {wins}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {isDisconnected && (
                          <Badge
                            variant="destructive"
                            className="h-5 px-1.5 text-xs"
                          >
                            <WifiOff className="h-2.5 w-2.5" />
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Middle Column - Main Game Window */}
            <div className="flex flex-col h-full bg-background overflow-hidden">
              <div className="flex-1 overflow-y-auto p-1.5 min-h-0">
                <Card className="shadow-lg h-full flex flex-col">
                  <QuizStats
                    expiryTimestamp={expiryTimestamp}
                    setRunning={handleTimerExpire}
                    score={score}
                    shouldStartTimer={timerShouldStart}
                    isSpeedrun={isSpeedrun}
                    targetQuestions={room?.gameMode.targetQuestions}
                    gameStartTime={room?.startedAt}
                  />
                  <CardContent className="p-0 flex-1">
                    <QuizPrompt
                      score={score}
                      setScore={setScore}
                      setting={randomSetting}
                      seed={questionSeed}
                      gameSettings={gameSettings}
                      allowVisualAids={room?.allowVisualAids ?? true}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Desktop Right Column - Live Scores + Chat */}
            <div className="hidden lg:flex flex-col border-l-2 border-border bg-card paper-texture overflow-hidden">
              {/* Live Scores - Top */}
              <div className="flex-none p-1.5 border-b border-border max-h-[40vh] overflow-y-auto">
                <div className="flex items-center gap-1 mb-1">
                  <Trophy className="h-3 w-3 text-primary" />
                  <h2 className="text-xs font-serif font-semibold">
                    Live Scores
                  </h2>
                </div>
                <div className="space-y-0.5">
                  {Object.values(room.players)
                    .sort((a, b) => {
                      if (isSpeedrun) {
                        if (a.finished && !b.finished) return -1;
                        if (!a.finished && b.finished) return 1;
                        if (a.finished && b.finished) return a.score - b.score;
                        return b.score - a.score;
                      }
                      return b.score - a.score;
                    })
                    .map((player, index) => {
                      const isCurrentUser = player.uid === user?.uid;
                      const isLeader = index === 0 && player.score > 0;

                      let displayScore: string;
                      if (isSpeedrun) {
                        if (player.finished) {
                          displayScore = `${player.score}s`;
                        } else {
                          const targetQuestions =
                            room.gameMode.targetQuestions || 0;
                          displayScore = `${player.score}/${targetQuestions}`;
                        }
                      } else {
                        displayScore = `${player.score}`;
                      }

                      return (
                        <div
                          key={player.uid}
                          className={`flex items-center justify-between p-1 rounded-md text-xs ${
                            isCurrentUser
                              ? "bg-primary/10 border border-primary"
                              : "bg-muted/50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <span
                              className={`font-bold ${
                                isLeader
                                  ? "text-trophy"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {index === 0 && player.score > 0
                                ? "👑"
                                : `#${index + 1}`}
                            </span>
                            <span
                              className={`${isCurrentUser ? "font-bold" : ""} truncate`}
                            >
                              {player.displayName}
                              {isCurrentUser && " (You)"}
                            </span>
                          </div>
                          <span className="font-bold tabular-nums shrink-0">
                            {displayScore}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Chat - Bottom */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {roomId && (
                  <div className="flex-1 overflow-hidden">
                    <ChatBox roomId={roomId} compact />
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Row 3 - User List and Live Scores Side by Side */}
            <div className="lg:hidden grid grid-cols-2 gap-1.5 p-1.5">
              {/* Mobile User List */}
              <Card className="shadow-sm">
                <CardHeader className="p-1.5 border-b">
                  <CardTitle className="text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Players
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-1.5 space-y-0.5 max-h-32 overflow-y-auto">
                  {Object.values(room.players).map((player) => {
                    const isPlayerHost = player.uid === room.hostUid;
                    const isDisconnected = player.disconnected === true;
                    const isKicked = player.kicked === true;

                    if (isKicked) return null;

                    return (
                      <div
                        key={player.uid}
                        className="flex items-center justify-between p-1 rounded-md border text-xs bg-muted/50"
                      >
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <span
                            className={`font-medium truncate ${isDisconnected ? "text-muted-foreground" : ""}`}
                          >
                            {player.displayName}
                          </span>
                          {isPlayerHost && (
                            <Crown className="h-2.5 w-2.5 text-yellow-600 shrink-0" />
                          )}
                        </div>
                        {isDisconnected && (
                          <WifiOff className="h-2.5 w-2.5 text-destructive" />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Mobile Live Scores */}
              <Card className="shadow-sm">
                <CardHeader className="p-1.5 border-b">
                  <CardTitle className="text-xs flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    Scores
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-1.5 space-y-0.5 max-h-32 overflow-y-auto">
                  {Object.values(room.players)
                    .sort((a, b) => {
                      if (isSpeedrun) {
                        if (a.finished && !b.finished) return -1;
                        if (!a.finished && b.finished) return 1;
                        if (a.finished && b.finished) return a.score - b.score;
                        return b.score - a.score;
                      }
                      return b.score - a.score;
                    })
                    .map((player, index) => {
                      const isCurrentUser = player.uid === user?.uid;
                      const isLeader = index === 0 && player.score > 0;

                      let displayScore: string;
                      if (isSpeedrun) {
                        if (player.finished) {
                          displayScore = `${player.score}s`;
                        } else {
                          const targetQuestions =
                            room.gameMode.targetQuestions || 0;
                          displayScore = `${player.score}/${targetQuestions}`;
                        }
                      } else {
                        displayScore = `${player.score}`;
                      }

                      return (
                        <div
                          key={player.uid}
                          className={`flex items-center justify-between p-1 rounded-md text-xs ${
                            isCurrentUser
                              ? "bg-primary/10 border border-primary"
                              : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-0.5 min-w-0 flex-1">
                            <span
                              className={`text-xs ${isLeader ? "text-yellow-600" : "text-muted-foreground"}`}
                            >
                              {index === 0 && player.score > 0
                                ? "👑"
                                : `#${index + 1}`}
                            </span>
                            <span
                              className={`${isCurrentUser ? "font-bold" : ""} truncate text-xs`}
                            >
                              {player.displayName}
                            </span>
                          </div>
                          <span className="font-bold tabular-nums text-xs shrink-0">
                            {displayScore}
                          </span>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
