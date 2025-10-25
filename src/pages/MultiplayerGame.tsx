import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

  // Create expiry timestamp state (like singleplayer) instead of useMemo
  const [expiryTimestamp, setExpiryTimestamp] = useState<Date>(() => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + 60); // Placeholder
    return time;
  });

  const scoreRef = useRef(0);
  const questionsRef = useRef<[string, string, number, number][]>([]);
  const hasNavigatedRef = useRef(false);
  const countdownShownRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false);
  const hasRestoredScoreRef = useRef(false); // Track if we've restored score on reconnection

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

    return () => {
      // Check if we're navigating away from the room entirely
      // Use window.location.pathname to get the NEW path during cleanup
      const newPath = window.location.pathname;
      const isStillInRoom =
        roomId &&
        (newPath.includes(`/multiplayer/lobby/${roomId}`) ||
          newPath.includes(`/multiplayer/game/${roomId}`) ||
          newPath.includes(`/multiplayer/results/${roomId}`));

      // Only leave if we're not in the same room and not explicitly leaving
      if (roomId && user && !isStillInRoom && !isLeavingRefValue.current) {
        leaveRoom(roomId).catch((error) => {
          console.error("Error leaving room on unmount:", error);
        });
      }
    };
  }, [roomId, user, leaveRoom]);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      // Handle room deletion (host disconnected)
      if (!updatedRoom) {
        // Prevent multiple navigations
        if (hasNavigatedRef.current) return;
        hasNavigatedRef.current = true;

        // Only navigate if user is still on a room-related page
        const currentPath = window.location.pathname;
        const isOnRoomPage =
          currentPath.includes(`/multiplayer/lobby/${roomId}`) ||
          currentPath.includes(`/multiplayer/game/${roomId}`) ||
          currentPath.includes(`/multiplayer/results/${roomId}`);

        if (!isOnRoomPage) {
          // User has already left the room, don't navigate
          return;
        }

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

      // Restore player's score when reconnecting to a live game
      // This ensures the player continues from where they left off
      // Only restore once per session to avoid interfering with normal score updates
      if (
        user &&
        updatedRoom.status === "playing" &&
        updatedRoom.players[user.uid] &&
        !hasRestoredScoreRef.current
      ) {
        const playerScore = updatedRoom.players[user.uid].score;
        // Only restore if local score is 0 and Firebase has a higher score (reconnection scenario)
        if (scoreRef.current === 0 && playerScore > 0) {
          console.log("Restoring player score on reconnection:", playerScore);
          setScore(playerScore);
          hasRestoredScoreRef.current = true;
        }
      }

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
      // Countdown is always enabled in multiplayer
      // But skip countdown if reconnecting after game already started
      if (updatedRoom.status === "playing" && !countdownShownRef.current) {
        const now = Date.now();
        const gameAlreadyStarted =
          updatedRoom.startedAt && updatedRoom.startedAt <= now;

        if (gameAlreadyStarted) {
          // Game already started, skip countdown and start timer immediately
          setTimerShouldStart(true);
          countdownShownRef.current = true;
        } else {
          // Game just started, show countdown
          setShowCountdown(true);
          countdownShownRef.current = true;
        }
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
  }, [roomId, subscribeToRoom, navigate, toast, user, score]);

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

  // Update expiry timestamp when timer should start
  // Countdown is always enabled in multiplayer
  useEffect(() => {
    // Only set expiry when we have all required data and timer should start
    if (timerShouldStart && room?.startedAt && room?.gameMode.duration) {
      const duration = isSpeedrun ? 86400 : room.gameMode.duration;
      const now = Date.now();

      // Check if game already started (reconnecting after countdown finished)
      if (room.startedAt <= now) {
        // Calculate expiry from startedAt + duration for synchronization
        const expiry = new Date(room.startedAt + duration * 1000);

        console.log(
          "Setting expiry timestamp (reconnecting after countdown):",
          {
            startedAt: room.startedAt,
            now,
            duration,
            isSpeedrun,
            expiry: expiry.toISOString(),
          },
        );

        setExpiryTimestamp(expiry);
      }
      // If game hasn't started yet (startedAt is in future), expiry is set in handleCountdownComplete
    }
  }, [timerShouldStart, room?.startedAt, room?.gameMode.duration, isSpeedrun]);

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

    // Calculate expiry timestamp synchronized to room.startedAt
    // This ensures all players have the same timer regardless of network latency
    if (room?.gameMode.duration && room?.startedAt) {
      const duration = isSpeedrun ? 86400 : room.gameMode.duration;
      // Use room.startedAt as the base time for synchronization
      const expiry = new Date(room.startedAt + duration * 1000);

      console.log("Setting expiry timestamp (countdown complete):", {
        startedAt: room.startedAt,
        duration,
        isSpeedrun,
        expiry: expiry.toISOString(),
      });

      setExpiryTimestamp(expiry);
    }
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
      <div className="flex flex-col h-full overflow-hidden">
        {/* Row 1 - Header */}
        <div className="flex-none border-b-2 border-border bg-card paper-texture shadow-sm">
          <div className="px-fluid py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              {/* Exit Button - Left */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="gap-2 shrink-0 text-sm sm:text-base"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Exit</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Exit Game?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to leave the game? Your progress
                      will be saved but you'll leave the room.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleExit}>
                      Exit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Game Title - Center */}
              <div className="flex-1 text-center min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-bold truncate">
                  {room.gameMode.name}
                </h1>
              </div>

              {/* Room Code Display - Right */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-tight">
                    Room Code
                  </p>
                  <p className="font-mono font-bold text-sm sm:text-base tracking-wider uppercase text-primary">
                    {roomId}
                  </p>
                </div>
                <Button
                  onClick={handleCopyRoomId}
                  variant="outline"
                  size="default"
                  className="h-9 w-9 sm:h-10 sm:w-10 p-0"
                  title="Copy room code"
                >
                  {copied ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 - Main Content (Desktop: 3 columns, Mobile: stacked) */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[minmax(200px,280px)_1fr_minmax(200px,280px)] gap-0">
          {/* Desktop Left Column - User List */}
          <div className="hidden lg:flex flex-col border-r-2 border-border bg-card paper-texture min-h-0">
            <div className="flex-none p-3 sm:p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-sm sm:text-base font-serif font-semibold">
                    Players ({playerCount}/{room.maxPlayers || 4})
                  </h2>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2">
              {Object.values(room.players).map((player) => {
                const isPlayerHost = player.uid === room.hostUid;
                const wins = player.wins || 0;
                const isDisconnected = player.disconnected === true;
                const isKicked = player.kicked === true;

                if (isKicked) return null;

                return (
                  <div
                    key={player.uid}
                    className={`flex items-center justify-between p-3 rounded-md border text-sm ${
                      isDisconnected
                        ? "bg-muted/30 border-muted"
                        : "bg-muted/50 border-muted"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-medium truncate ${isDisconnected ? "text-muted-foreground" : ""}`}
                        >
                          {player.displayName}
                        </span>
                        {isPlayerHost && (
                          <Crown className="h-4 w-4 text-yellow-600 shrink-0" />
                        )}
                      </div>
                      {wins > 0 && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Trophy className="h-3.5 w-3.5" />
                          {wins}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isDisconnected && (
                        <Badge
                          variant="destructive"
                          className="h-6 px-2 text-sm"
                        >
                          <WifiOff className="h-3.5 w-3.5" />
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Middle Column - Main Game Window */}
          <div className="flex flex-col min-h-0 bg-background">
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 lg:p-6">
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
          <div className="hidden lg:flex flex-col border-l-2 border-border bg-card paper-texture min-h-0 overflow-hidden">
            {/* Live Scores - Top */}
            <div className="flex-none p-3 sm:p-4 border-b border-border max-h-[40vh] overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="text-sm sm:text-base font-serif font-semibold">
                  Live Scores
                </h2>
              </div>
              <div className="space-y-2">
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
                        className={`flex items-center justify-between p-2.5 rounded-md text-sm ${
                          isCurrentUser
                            ? "bg-primary/10 border border-primary"
                            : "bg-muted/50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className={`font-bold ${
                              isLeader ? "text-trophy" : "text-muted-foreground"
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
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
    </>
  );
}
