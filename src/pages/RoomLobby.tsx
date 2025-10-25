import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PaperCard,
  PaperCardContent,
  PaperCardHeader,
  PaperCardTitle,
} from "@/components/ui/academic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import {
  Copy,
  Check,
  Link2,
  Settings,
  X,
  Eye,
  UserCog,
  Users,
  Crown,
  Shield,
  WifiOff,
  Trophy,
  Play,
  Medal,
  MessageSquare,
  Loader2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  OFFICIAL_GAME_MODES,
  GameMode,
  getDifficultyColor,
  isSpeedrunMode,
} from "@/types/gameMode";
import KickedModal from "@/components/KickedModal";
import Countdown from "@/components/Countdown";
import QuizPrompt from "@/features/quiz/quiz-questions/Quiz-Prompt.component";
import QuizStats from "@/features/quiz/quiz-questions/Quiz-Stats.component";
import { PlaygroundSettings } from "@features/quiz";
import { QuestionSetting } from "@/contexts/GameContexts";
import ChatBox from "@/components/ChatBox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function RoomLobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    joinRoom,
    leaveRoom,
    setPlayerReady,
    startGame,
    subscribeToRoom,
    updateGameMode,
    kickPlayer,
    updateRoomSettings,
    transferHost,
    updatePlayerScore,
    finishGame,
    resetRoom,
    incrementWins,
  } = useRoom();
  const { settings: gameSettings } = useGameSettings();
  const [room, setRoom] = useState<Room | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [transferHostUid, setTransferHostUid] = useState<string | null>(null);
  const [showKickedModal, setShowKickedModal] = useState(false);
  const [showPlaygroundSettings, setShowPlaygroundSettings] = useState(false);
  const [expandedModeId, setExpandedModeId] = useState<string | null>(null);
  const { toast } = useToast();

  // Game state
  const [showCountdown, setShowCountdown] = useState(false);
  const [timerShouldStart, setTimerShouldStart] = useState(false);
  const [score, setScore] = useState(0);
  const [randomSetting, setRandomSetting] = useState<
    [string, string, number, number] | null
  >(null);
  // Create expiry timestamp state (like MultiplayerGame) instead of useMemo
  const [expiryTimestamp, setExpiryTimestamp] = useState<Date>(() => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + 60); // Placeholder
    return time;
  });

  const hasNavigatedRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false);
  const scoreRef = useRef(0);
  const questionsRef = useRef<[string, string, number, number][]>([]);
  const countdownShownRef = useRef(false);
  const hasIncrementedWinsRef = useRef(false);
  const hasRestoredScoreRef = useRef(false); // Track if we've restored score on reconnection

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
      if (roomId && user && !isStillInRoom && !isLeavingRef.current) {
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
            description: "The host has left the room.",
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

      // Sync local ready state with database state
      if (user && updatedRoom.players[user.uid]) {
        setIsReady(updatedRoom.players[user.uid].ready);
      }

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
          console.log(
            "RoomLobby: Restoring player score on reconnection:",
            playerScore,
          );
          setScore(playerScore);
          hasRestoredScoreRef.current = true;
        }
      }

      // Handle game state transitions
      // Countdown is always enabled in multiplayer
      if (updatedRoom.status === "playing") {
        const now = Date.now();
        // startedAt is set to future time (now + 3000ms) to account for countdown
        // Check if game already started by seeing if startedAt has passed
        const gameAlreadyStarted =
          updatedRoom.startedAt && updatedRoom.startedAt <= now;

        // First time seeing the game start
        if (!countdownShownRef.current) {
          countdownShownRef.current = true;

          console.log("RoomLobby: Game starting", {
            gameAlreadyStarted,
            startedAt: updatedRoom.startedAt,
            now,
          });

          // Show countdown if game hasn't started yet (startedAt is in future)
          // Otherwise start timer immediately (reconnecting after game started)
          if (!gameAlreadyStarted) {
            console.log("RoomLobby: Showing countdown");
            setShowCountdown(true);
            setTimerShouldStart(false);
          } else {
            console.log("RoomLobby: Starting timer immediately (reconnecting)");
            setShowCountdown(false);
            setTimerShouldStart(true);
          }
        } else if (gameAlreadyStarted && !timerShouldStart) {
          // Reconnection case: game is playing, countdown was shown before, but timer isn't running
          // This happens when user disconnects and reconnects during active game
          console.log("RoomLobby: Reconnection detected, restarting timer");
          setShowCountdown(false);
          setTimerShouldStart(true);
        }
      }

      // Handle game finish - increment wins for winner
      if (updatedRoom.status === "finished" && !hasIncrementedWinsRef.current) {
        hasIncrementedWinsRef.current = true;

        // Determine winner and increment their wins
        const players = Object.values(updatedRoom.players);
        const isSpeedrun = isSpeedrunMode(updatedRoom.gameMode);
        const sortedPlayers = players.sort((a, b) =>
          isSpeedrun ? a.score - b.score : b.score - a.score,
        );
        const winner = sortedPlayers[0];

        if (user && winner.uid === user.uid) {
          incrementWins(roomId, winner.uid).catch((error) => {
            console.error("Failed to increment wins:", error);
          });
        }
      }

      // Reset game state when returning to waiting
      if (updatedRoom.status === "waiting") {
        setShowCountdown(false);
        setTimerShouldStart(false);
        setScore(0);
        setRandomSetting(null);
        countdownShownRef.current = false;
        hasIncrementedWinsRef.current = false;
        hasRestoredScoreRef.current = false; // Reset for next game
        questionsRef.current = [];
      }
    });

    return () => unsubscribe();
  }, [
    roomId,
    subscribeToRoom,
    navigate,
    toast,
    user,
    incrementWins,
    score,
    timerShouldStart,
  ]);

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

  // Update expiry timestamp when timer should start
  // This handles reconnection cases where countdownShownRef prevents the initial setup
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
          "RoomLobby: Setting expiry timestamp (reconnecting after countdown):",
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

  // Initialize question based on current score - deterministic for all players
  useEffect(() => {
    if (questionsRef.current.length > 0) {
      // Use score as index to ensure all players get same questions in same order
      const questionIndex = score % questionsRef.current.length;
      const setting = questionsRef.current[questionIndex];
      setRandomSetting(setting);
    }
  }, [score]);

  // Update score in Firebase
  useEffect(() => {
    scoreRef.current = score;
    if (roomId && room?.status === "playing") {
      updatePlayerScore(roomId, score);
    }
  }, [score, roomId, room?.status, updatePlayerScore]);

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

  // Generate deterministic seed for multiplayer questions
  const questionSeed = useMemo(() => {
    if (!roomId) return undefined;
    let hash = 0;
    for (let i = 0; i < roomId.length; i++) {
      hash = (hash << 5) - hash + roomId.charCodeAt(i);
      hash = hash & hash;
    }
    return hash + score * 1000;
  }, [roomId, score]);

  // Generate questions when game starts
  useEffect(() => {
    if (
      room?.status === "playing" &&
      room?.gameMode &&
      questionsRef.current.length === 0
    ) {
      // Use the game mode's questions directly
      const mode = room.gameMode;

      // If the game mode has questions defined, use them
      if (mode.questions && mode.questions.length > 0) {
        questionsRef.current = mode.questions;
        setRandomSetting(mode.questions[0]);
      } else {
        // Fallback: generate simple binary/decimal questions
        const numQuestions = mode.targetQuestions || 50;
        const questions: [string, string, number, number][] = [];

        for (let i = 0; i < numQuestions; i++) {
          // Alternate between Binary->Decimal and Decimal->Binary
          if (i % 2 === 0) {
            questions.push(["Binary", "Decimal", 0, 255]);
          } else {
            questions.push(["Decimal", "Binary", 0, 255]);
          }
        }

        questionsRef.current = questions;
        setRandomSetting(questions[0]);
      }
    }
  }, [room?.status, room?.gameMode, roomId]);

  const handleLeave = async () => {
    if (!roomId) return;
    isLeavingRef.current = true;
    await leaveRoom(roomId);
    navigate("/multiplayer");
  };

  const handleToggleReady = async () => {
    if (!roomId) return;
    const newReady = !isReady;
    // Optimistically update UI
    setIsReady(newReady);
    try {
      await setPlayerReady(roomId, newReady);
    } catch (error) {
      // Revert on error - the database state will sync back via subscription
      console.error("Error toggling ready state:", error);
      toast({
        title: "Error",
        description: "Failed to update ready status",
        variant: "destructive",
      });
    }
  };

  const handleStart = async () => {
    if (!roomId) return;
    try {
      await startGame(roomId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start game";
      alert(errorMessage);
    }
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Room code copied!",
        description: "Share this code with your friends to join.",
      });
    }
  };

  const handleKickPlayer = async (playerUid: string) => {
    if (!roomId) return;
    try {
      await kickPlayer(roomId, playerUid);
      toast({
        title: "Player removed",
        description: "The player has been removed from the room.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to kick player";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
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

      console.log("RoomLobby: Setting expiry timestamp (countdown complete):", {
        startedAt: room.startedAt,
        duration,
        isSpeedrun,
        expiry: expiry.toISOString(),
      });

      setExpiryTimestamp(expiry);
    }
  };

  const handleReturnToLobby = async () => {
    if (!roomId) return;
    try {
      await resetRoom(roomId);
    } catch (error) {
      console.error("Failed to reset room:", error);
      toast({
        title: "Error",
        description: "Failed to return to lobby. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyInviteLink = () => {
    if (roomId) {
      const inviteLink = `${window.location.origin}/multiplayer/join?code=${roomId}`;
      navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast({
        title: "Invite link copied!",
        description: "Share this link with your friends to join directly.",
      });
    }
  };

  const handleChangeGameMode = async (mode: GameMode) => {
    if (!roomId) return;
    try {
      await updateGameMode(roomId, mode);
      toast({
        title: "Game mode updated!",
        description: `Changed to ${mode.name}`,
      });
      setShowPlaygroundSettings(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update game mode";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCustomPlayground = async (settings: {
    questions: QuestionSetting[];
    duration: number;
  }) => {
    if (!roomId) return;

    // Validate: multiplayer games cannot have unlimited time
    if (settings.duration === 0) {
      toast({
        title: "Invalid Duration",
        description:
          "Multiplayer games require a time limit. Please select a duration.",
        variant: "destructive",
      });
      return;
    }

    // Create a custom game mode from the playground settings
    const customMode: GameMode = {
      id: "custom-playground",
      name: "Custom Playground",
      description: "Your custom quiz settings",
      isOfficial: false,
      questions: settings.questions,
      duration: settings.duration,
      difficulty: "Custom",
    };

    try {
      await updateGameMode(roomId, customMode);
      toast({
        title: "Game mode updated!",
        description: "Changed to Custom Playground",
      });
      setShowPlaygroundSettings(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update game mode";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleTransferHost = async () => {
    if (!roomId || !transferHostUid) return;

    try {
      await transferHost(roomId, transferHostUid);
      toast({
        title: "Host transferred!",
        description: "You are no longer the host.",
      });
      setTransferHostUid(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to transfer host";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isHost = user?.uid === room.hostUid;
  // Filter out host, disconnected, and kicked players from ready check
  const nonHostPlayers = Object.values(room.players).filter(
    (p) => p.uid !== room.hostUid && !p.disconnected && !p.kicked,
  );
  const allReady =
    nonHostPlayers.length > 0 && nonHostPlayers.every((p) => p.ready);
  const readyCount = nonHostPlayers.filter((p) => p.ready).length;
  // Count only active (non-kicked) players
  const playerCount = Object.values(room.players).filter(
    (p) => !p.kicked,
  ).length;

  const handleKickedModalClose = () => {
    setShowKickedModal(false);
    navigate("/multiplayer", { replace: true });
  };

  return (
    <>
      <KickedModal open={showKickedModal} onClose={handleKickedModalClose} />
      {showCountdown && (
        <Countdown onComplete={handleCountdownComplete} duration={3} />
      )}
      <div className="flex flex-col safe-vh-screen overflow-hidden">
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
                    <AlertDialogTitle>Leave Room?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to leave the room? You'll need to
                      rejoin to continue playing.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLeave}>
                      Leave Room
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
                {nonHostPlayers.length > 0 && (
                  <Badge variant="secondary" className="text-sm h-6 px-2">
                    {readyCount}/{nonHostPlayers.length}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2">
              {Object.values(room.players).map((player) => {
                const isPlayerHost = player.uid === room.hostUid;
                const wins = player.wins || 0;
                const isDisconnected = player.disconnected === true;
                const isKicked = player.kicked === true;

                // Don't show kicked players
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
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={`font-medium truncate ${isDisconnected ? "text-muted-foreground" : ""}`}
                      >
                        {player.displayName}
                      </span>
                      {isPlayerHost && (
                        <Crown className="h-4 w-4 text-yellow-600 shrink-0" />
                      )}
                      {wins > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5 shrink-0">
                          <Trophy className="h-3 w-3" />
                          {wins}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isDisconnected ? (
                        <Badge
                          variant="destructive"
                          className="h-6 px-2 text-sm"
                        >
                          <WifiOff className="h-3.5 w-3.5" />
                        </Badge>
                      ) : isPlayerHost ? (
                        <Badge
                          variant="secondary"
                          className="h-6 px-2 text-xs w-20 justify-center"
                        >
                          Host
                        </Badge>
                      ) : player.ready ? (
                        <Badge className="bg-success h-6 px-2 text-xs w-20 justify-center">
                          Ready
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="h-6 px-2 text-xs w-20 justify-center"
                        >
                          Not Ready
                        </Badge>
                      )}
                      {/* Transfer host button */}
                      {isHost && !isPlayerHost && !isDisconnected && (
                        <Button
                          onClick={() => setTransferHostUid(player.uid)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                          title="Transfer host"
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Kick button */}
                      {isHost && !isPlayerHost && (
                        <Button
                          onClick={() => handleKickPlayer(player.uid)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          title="Kick player"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Middle Column - Main Game Window + User Controls */}
          <div className="flex flex-col min-h-0 bg-background">
            {/* Main Game Window - Row 1 */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 lg:p-6">
              {/* WAITING STATUS - Lobby View */}
              {room.status === "waiting" && (
                <div className="space-y-3 sm:space-y-4">
                  {/* Mobile Room Info Card */}
                  <div className="lg:hidden">
                    <PaperCard
                      variant="folded-sm"
                      padding="sm"
                      className="border"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-serif font-semibold">
                          Room Info
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between min-h-6">
                          <p className="text-xs text-muted-foreground leading-none">
                            Mode:
                          </p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold leading-none">
                              {room.gameMode.name}
                            </p>
                            <Badge
                              className={cn(
                                "text-xs h-5 px-2",
                                getDifficultyColor(room.gameMode.difficulty),
                              )}
                              variant="secondary"
                            >
                              {room.gameMode.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between min-h-6">
                          <p className="text-xs text-muted-foreground leading-none">
                            {room.gameMode.targetQuestions
                              ? "Questions:"
                              : "Time Limit:"}
                          </p>
                          <p className="text-sm font-semibold leading-none">
                            {room.gameMode.targetQuestions
                              ? `${room.gameMode.targetQuestions} questions`
                              : `${room.gameMode.duration} seconds`}
                          </p>
                        </div>
                        <div className="flex items-center justify-between min-h-6">
                          <p className="text-xs text-muted-foreground leading-none">
                            Players:
                          </p>
                          <p className="text-sm font-semibold leading-none">
                            {playerCount} / {room.maxPlayers || 4}
                          </p>
                        </div>
                        <div className="flex items-center justify-between min-h-6">
                          <p className="text-xs text-muted-foreground leading-none">
                            Visual Aids:
                          </p>
                          <Badge
                            variant={
                              room.allowVisualAids ? "default" : "outline"
                            }
                            className="text-xs h-5 px-2"
                          >
                            {room.allowVisualAids ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between min-h-6">
                          <p className="text-xs text-muted-foreground leading-none">
                            Countdown:
                          </p>
                          <Badge
                            variant={
                              room.enableCountdown ? "default" : "outline"
                            }
                            className="text-xs h-5 px-2"
                          >
                            {room.enableCountdown ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </PaperCard>
                  </div>

                  {/* Mobile Game Selection - Host Only */}
                  {isHost && (
                    <div className="lg:hidden">
                      <PaperCard
                        variant="folded-sm"
                        padding="none"
                        className="flex flex-col"
                      >
                        <PaperCardHeader className="p-2.5 sm:p-3 border-b border-border flex-none">
                          <div className="flex items-center gap-1.5">
                            <Settings className="h-4 w-4 text-primary" />
                            <PaperCardTitle className="text-sm">
                              Game Mode
                            </PaperCardTitle>
                          </div>
                        </PaperCardHeader>
                        <PaperCardContent className="p-2.5 sm:p-3 overflow-hidden">
                          <ScrollArea className="h-[40vh] max-h-[400px]">
                            <div className="grid grid-cols-1 gap-2 pr-2">
                              {OFFICIAL_GAME_MODES.slice(0, 12).map((mode) => (
                                <PaperCard
                                  key={mode.id}
                                  variant="interactive"
                                  padding="sm"
                                  className={cn(
                                    "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 border-2 folded-corner-sm",
                                    room.gameMode.id === mode.id &&
                                      "border-primary bg-primary/10",
                                  )}
                                  onClick={() =>
                                    room.gameMode.id !== mode.id &&
                                    handleChangeGameMode(mode)
                                  }
                                >
                                  <PaperCardHeader className="p-2 pb-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <PaperCardTitle className="text-xs leading-tight font-serif">
                                        {mode.name}
                                      </PaperCardTitle>
                                      <Badge
                                        className={cn(
                                          "shrink-0 text-xs h-5 px-1.5",
                                          getDifficultyColor(mode.difficulty),
                                        )}
                                        variant="secondary"
                                      >
                                        {mode.difficulty.charAt(0)}
                                      </Badge>
                                    </div>
                                  </PaperCardHeader>
                                  <PaperCardContent className="p-2 pt-0">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-0.5">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          {mode.targetQuestions
                                            ? `${mode.targetQuestions}q`
                                            : `${mode.duration}s`}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-0.5">
                                        <Layers className="h-3 w-3" />
                                        <span>
                                          {mode.questions.length} types
                                        </span>
                                      </div>
                                    </div>
                                  </PaperCardContent>
                                </PaperCard>
                              ))}
                            </div>
                          </ScrollArea>
                        </PaperCardContent>
                      </PaperCard>
                    </div>
                  )}

                  {/* Mobile Host Controls */}
                  {isHost && (
                    <div className="lg:hidden">
                      <PaperCard
                        variant="folded-sm"
                        padding="sm"
                        className="border"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <UserCog className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-serif font-semibold">
                            Host Controls
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Visual Aids
                              </span>
                            </div>
                            <Switch
                              checked={room.allowVisualAids ?? true}
                              onCheckedChange={async (checked) => {
                                if (roomId) {
                                  try {
                                    await updateRoomSettings(roomId, {
                                      allowVisualAids: checked,
                                    });
                                  } catch {
                                    toast({
                                      title: "Error",
                                      description:
                                        "Failed to update visual aids setting",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </PaperCard>
                    </div>
                  )}

                  {/* Mobile Row 3 - User List and Chat Side by Side */}
                  <div className="lg:hidden grid grid-cols-2 gap-3">
                    {/* Mobile User List */}
                    <PaperCard
                      variant="folded-sm"
                      padding="none"
                      className="flex flex-col"
                    >
                      <PaperCardHeader className="p-2.5 sm:p-3 border-b border-border flex-none">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-primary" />
                            <PaperCardTitle className="text-sm">
                              Players ({playerCount}/{room.maxPlayers || 4})
                            </PaperCardTitle>
                          </div>
                          {nonHostPlayers.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-sm h-5 px-2"
                            >
                              {readyCount}/{nonHostPlayers.length}
                            </Badge>
                          )}
                        </div>
                      </PaperCardHeader>
                      <PaperCardContent className="p-2.5 sm:p-3 space-y-2 flex-1 overflow-y-auto">
                        {Object.values(room.players).map((player) => {
                          const isPlayerHost = player.uid === room.hostUid;
                          const isDisconnected = player.disconnected === true;
                          const isKicked = player.kicked === true;

                          if (isKicked) return null;

                          return (
                            <div
                              key={player.uid}
                              className={`flex items-center justify-between p-2 rounded-md border text-sm ${
                                isDisconnected
                                  ? "bg-muted/30 border-muted"
                                  : "bg-muted/50 border-muted"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span
                                  className={`font-medium truncate ${isDisconnected ? "text-muted-foreground" : ""}`}
                                >
                                  {player.displayName}
                                </span>
                                {isPlayerHost && (
                                  <Crown className="h-3.5 w-3.5 text-yellow-600 shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {isDisconnected ? (
                                  <WifiOff className="h-3.5 w-3.5 text-destructive" />
                                ) : player.ready ? (
                                  <Check className="h-3.5 w-3.5 text-success" />
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </PaperCardContent>
                    </PaperCard>

                    {/* Mobile Chat */}
                    <PaperCard
                      variant="folded-sm"
                      padding="none"
                      className="flex flex-col"
                    >
                      <PaperCardHeader className="p-2.5 sm:p-3 border-b border-border flex-none">
                        <PaperCardTitle className="text-sm flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          Chat
                        </PaperCardTitle>
                      </PaperCardHeader>
                      <PaperCardContent className="p-0 flex-1 overflow-hidden">
                        {roomId && (
                          <div className="h-full">
                            <ChatBox roomId={roomId} compact />
                          </div>
                        )}
                      </PaperCardContent>
                    </PaperCard>
                  </div>

                  {/* Host View: Game Selection */}
                  {isHost && !showPlaygroundSettings && (
                    <div className="hidden lg:flex flex-col flex-1 min-h-0 max-h-full">
                      <div className="flex items-center gap-2 mb-2 flex-none">
                        <Settings className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-serif font-semibold">
                          Select Game Mode
                        </h3>
                      </div>
                      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <ScrollArea className="flex-1">
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 pr-2 auto-rows-max">
                            {OFFICIAL_GAME_MODES.map((mode) => (
                              <PaperCard
                                key={mode.id}
                                variant="interactive"
                                padding="sm"
                                className={cn(
                                  "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 border-2 folded-corner-sm",
                                  room.gameMode.id === mode.id &&
                                    "border-primary bg-primary/10",
                                )}
                                onClick={() =>
                                  room.gameMode.id !== mode.id &&
                                  handleChangeGameMode(mode)
                                }
                              >
                                <PaperCardHeader className="p-2 pb-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <PaperCardTitle className="text-sm leading-tight font-serif">
                                      {mode.name}
                                    </PaperCardTitle>
                                    <Badge
                                      className={cn(
                                        "shrink-0 text-xs h-5 px-2",
                                        getDifficultyColor(mode.difficulty),
                                      )}
                                      variant="secondary"
                                    >
                                      {mode.difficulty}
                                    </Badge>
                                  </div>
                                </PaperCardHeader>
                                <PaperCardContent className="space-y-2 p-2 pt-0">
                                  <Collapsible
                                    open={expandedModeId === mode.id}
                                    onOpenChange={(open) =>
                                      setExpandedModeId(open ? mode.id : null)
                                    }
                                  >
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5">
                                          <Clock className="h-3 w-3" />
                                          <span>
                                            {mode.targetQuestions
                                              ? `${mode.targetQuestions}q`
                                              : `${mode.duration}s`}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                          <Layers className="h-3 w-3" />
                                          <span>
                                            {mode.questions.length} types
                                          </span>
                                        </div>
                                      </div>
                                      <CollapsibleTrigger asChild>
                                        <button
                                          className="flex items-center gap-0.5 hover:text-foreground transition-colors text-xs"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {expandedModeId === mode.id ? (
                                            <ChevronUp className="h-3 w-3" />
                                          ) : (
                                            <ChevronDown className="h-3 w-3" />
                                          )}
                                          <span>(View details)</span>
                                        </button>
                                      </CollapsibleTrigger>
                                    </div>
                                    <CollapsibleContent className="pt-1.5">
                                      <div className="space-y-1.5 text-xs">
                                        <div className="p-1.5 rounded-md bg-muted/50">
                                          <p className="font-semibold mb-0.5">
                                            Question Types:
                                          </p>
                                          <ul className="space-y-0.5 text-muted-foreground">
                                            {mode.questions.map((q, idx) => (
                                              <li key={idx}>
                                                • {q[0]} → {q[1]} ({q[2]}-{q[3]}
                                                )
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                        {mode.targetQuestions && (
                                          <div className="p-1.5 rounded-md bg-muted/50">
                                            <p className="font-semibold">
                                              Speed Run Mode
                                            </p>
                                            <p className="text-muted-foreground">
                                              Complete {mode.targetQuestions}{" "}
                                              questions as fast as possible
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </PaperCardContent>
                              </PaperCard>
                            ))}
                            {/* Custom Playground Option */}
                            <PaperCard
                              variant="interactive"
                              padding="sm"
                              className={cn(
                                "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 border-2 folded-corner-sm",
                                room.gameMode.id === "custom-playground" &&
                                  "border-primary bg-primary/10",
                              )}
                              onClick={() => setShowPlaygroundSettings(true)}
                            >
                              <PaperCardHeader className="p-2 pb-1">
                                <div className="flex items-start justify-between gap-2">
                                  <PaperCardTitle className="text-sm leading-tight font-serif">
                                    Custom
                                  </PaperCardTitle>
                                  <Badge
                                    className="bg-purple-500 text-white shrink-0 text-xs h-5 px-2"
                                    variant="secondary"
                                  >
                                    C
                                  </Badge>
                                </div>
                              </PaperCardHeader>
                              <PaperCardContent className="p-2 pt-0">
                                <p className="text-xs text-muted-foreground">
                                  Create your own custom game mode
                                </p>
                              </PaperCardContent>
                            </PaperCard>
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  )}

                  {/* Custom Playground Settings */}
                  {isHost && showPlaygroundSettings && (
                    <div className="hidden lg:block">
                      <div className="flex items-center justify-between px-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <Settings className="h-3.5 w-3.5 text-primary" />
                          <h3 className="text-xs font-serif font-semibold">
                            Custom Playground
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPlaygroundSettings(false)}
                          className="h-6 text-xs px-2"
                        >
                          Back
                        </Button>
                      </div>
                      <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-1">
                        <PlaygroundSettings
                          onStartQuiz={handleCustomPlayground}
                          buttonText="Update Settings"
                          showHeader={false}
                          isMultiplayer={true}
                        />
                      </div>
                    </div>
                  )}

                  {/* Non-Host View: Waiting Status */}
                  {!isHost && (
                    <PaperCard
                      variant="folded-sm"
                      padding="default"
                      className="hidden lg:block"
                    >
                      <div className="text-center space-y-1.5">
                        <Users className="h-6 w-6 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {allReady
                            ? "Waiting for host to start..."
                            : "Waiting for players..."}
                        </p>
                      </div>
                    </PaperCard>
                  )}
                </div>
              )}

              {/* PLAYING STATUS - Game View */}
              {room.status === "playing" && randomSetting && room.startedAt && (
                <div className="space-y-3 sm:space-y-4">
                  {/* Game View */}
                  <div className="flex items-center justify-center p-2">
                    <Card className="w-full max-w-4xl shadow-lg">
                      <QuizStats
                        expiryTimestamp={expiryTimestamp}
                        setRunning={handleTimerExpire}
                        score={score}
                        shouldStartTimer={timerShouldStart}
                        isSpeedrun={isSpeedrun}
                        targetQuestions={room?.gameMode.targetQuestions}
                        gameStartTime={room?.startedAt}
                      />
                      <CardContent className="p-0">
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

                  {/* Mobile Row 3 - User List and Live Scores Side by Side */}
                  <div className="lg:hidden grid grid-cols-2 gap-3">
                    {/* Mobile User List */}
                    <PaperCard
                      variant="folded-sm"
                      padding="none"
                      className="h-fit"
                    >
                      <PaperCardHeader className="p-2.5 sm:p-3 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-primary" />
                          <PaperCardTitle className="text-sm">
                            Players
                          </PaperCardTitle>
                        </div>
                      </PaperCardHeader>
                      <PaperCardContent className="p-2.5 sm:p-3 space-y-2 max-h-48 overflow-y-auto">
                        {Object.values(room.players).map((player) => {
                          const isPlayerHost = player.uid === room.hostUid;
                          const isDisconnected = player.disconnected === true;
                          const isKicked = player.kicked === true;

                          if (isKicked) return null;

                          return (
                            <div
                              key={player.uid}
                              className={`flex items-center justify-between p-2 rounded-md border text-sm ${
                                isDisconnected
                                  ? "bg-muted/30 border-muted"
                                  : "bg-muted/50 border-muted"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span
                                  className={`font-medium truncate ${isDisconnected ? "text-muted-foreground" : ""}`}
                                >
                                  {player.displayName}
                                </span>
                                {isPlayerHost && (
                                  <Crown className="h-3.5 w-3.5 text-yellow-600 shrink-0" />
                                )}
                              </div>
                              {isDisconnected && (
                                <WifiOff className="h-3.5 w-3.5 text-destructive" />
                              )}
                            </div>
                          );
                        })}
                      </PaperCardContent>
                    </PaperCard>

                    {/* Mobile Live Scores */}
                    <PaperCard
                      variant="folded-sm"
                      padding="none"
                      className="h-fit"
                    >
                      <PaperCardHeader className="p-2.5 sm:p-3 border-b border-border">
                        <div className="flex items-center gap-1.5">
                          <Trophy className="h-4 w-4 text-primary" />
                          <PaperCardTitle className="text-sm">
                            Live Scores
                          </PaperCardTitle>
                        </div>
                      </PaperCardHeader>
                      <PaperCardContent className="p-2.5 sm:p-3 space-y-2 max-h-48 overflow-y-auto">
                        {Object.values(room.players)
                          .sort((a, b) => {
                            if (isSpeedrun) {
                              if (a.finished && !b.finished) return -1;
                              if (!a.finished && b.finished) return 1;
                              if (a.finished && b.finished)
                                return a.score - b.score;
                              return b.score - a.score;
                            }
                            return b.score - a.score;
                          })
                          .map((player, index) => {
                            const isCurrentUser = player.uid === user?.uid;
                            const isLeader = index === 0 && player.score > 0;
                            const isKicked = player.kicked === true;

                            if (isKicked) return null;

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
                                className={`flex items-center justify-between p-2 rounded-md border text-sm ${
                                  isCurrentUser
                                    ? "bg-primary/10 border-primary/30"
                                    : "bg-muted/50 border-muted"
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  {isLeader && (
                                    <Crown className="h-3.5 w-3.5 text-yellow-600" />
                                  )}
                                  <span className="font-medium truncate">
                                    {player.displayName}
                                  </span>
                                </div>
                                <span className="font-bold">
                                  {displayScore}
                                </span>
                              </div>
                            );
                          })}
                      </PaperCardContent>
                    </PaperCard>
                  </div>
                </div>
              )}

              {/* FINISHED STATUS - Results View */}
              {room.status === "finished" &&
                (() => {
                  const players = Object.values(room.players);
                  const sortedPlayers = players.sort((a, b) =>
                    isSpeedrun ? a.score - b.score : b.score - a.score,
                  );
                  const winner = sortedPlayers[0];

                  const getRankIcon = (index: number) => {
                    if (index === 0)
                      return <Crown className="h-6 w-6 text-yellow-600" />;
                    if (index === 1)
                      return <Medal className="h-6 w-6 text-gray-400" />;
                    if (index === 2)
                      return <Medal className="h-6 w-6 text-amber-700" />;
                    return null;
                  };

                  return (
                    <div className="space-y-3 sm:space-y-4">
                      {/* Results View */}
                      <div className="overflow-y-auto p-2">
                        <div className="max-w-2xl mx-auto space-y-4">
                          {/* Header */}
                          <div className="text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Trophy className="h-8 w-8 text-success" />
                              <h1 className="text-3xl font-bold gradient-text">
                                Game Complete!
                              </h1>
                            </div>
                            <p className="text-base text-muted-foreground">
                              {room.gameMode.name}
                            </p>
                          </div>

                          <Card className="border-2 shadow-lg">
                            <CardHeader className="text-center pb-4">
                              <div className="flex items-center justify-center gap-2 mb-3">
                                <Trophy className="h-10 w-10 text-yellow-600 animate-pulse" />
                              </div>
                              <CardTitle className="text-2xl gradient-text">
                                {winner.displayName}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Winner
                              </p>
                              <div className="mt-3">
                                <p className="text-5xl font-bold gradient-text">
                                  {isSpeedrun
                                    ? `${winner.score}s`
                                    : winner.score}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {isSpeedrun ? "completion time" : "points"}
                                </p>
                              </div>
                            </CardHeader>

                            <Separator />

                            <CardContent className="pt-4 space-y-4">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-base flex items-center gap-2">
                                  <Trophy className="h-4 w-4 text-primary" />
                                  Final Standings
                                </h3>
                                <div className="space-y-2">
                                  {sortedPlayers.map((player, index) => (
                                    <Card
                                      key={player.uid}
                                      className={`border-2 ${
                                        index === 0
                                          ? "border-yellow-600/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"
                                          : "border-muted"
                                      }`}
                                    >
                                      <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                                              {getRankIcon(index) || (
                                                <span className="font-bold text-lg text-muted-foreground">
                                                  #{index + 1}
                                                </span>
                                              )}
                                            </div>
                                            <div>
                                              <p className="font-semibold text-sm">
                                                {player.displayName}
                                              </p>
                                              <p className="text-xs text-muted-foreground">
                                                {player.wins || 0} total{" "}
                                                {(player.wins || 0) === 1
                                                  ? "win"
                                                  : "wins"}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-2xl font-bold">
                                              {isSpeedrun
                                                ? `${player.score}s`
                                                : player.score}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {isSpeedrun ? "time" : "points"}
                                            </p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Mobile Row 3 - Final Standings and Chat Side by Side */}
                      <div className="lg:hidden grid grid-cols-2 gap-3">
                        {/* Mobile Final Standings */}
                        <PaperCard
                          variant="folded-sm"
                          padding="none"
                          className="h-fit"
                        >
                          <PaperCardHeader className="p-2.5 sm:p-3 border-b border-border">
                            <div className="flex items-center gap-1.5">
                              <Trophy className="h-4 w-4 text-primary" />
                              <PaperCardTitle className="text-sm">
                                Final Standings
                              </PaperCardTitle>
                            </div>
                          </PaperCardHeader>
                          <PaperCardContent className="p-2.5 sm:p-3 space-y-2 max-h-48 overflow-y-auto">
                            {sortedPlayers.map((player, index) => {
                              const isKicked = player.kicked === true;
                              if (isKicked) return null;

                              return (
                                <div
                                  key={player.uid}
                                  className={`flex items-center justify-between p-2 rounded-md border text-sm ${
                                    index === 0
                                      ? "bg-yellow-500/10 border-yellow-600/30"
                                      : "bg-muted/50 border-muted"
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5">
                                    {index === 0 && (
                                      <Crown className="h-3.5 w-3.5 text-yellow-600" />
                                    )}
                                    <span className="font-medium truncate">
                                      {player.displayName}
                                    </span>
                                  </div>
                                  <span className="font-bold">
                                    {isSpeedrun
                                      ? `${player.score}s`
                                      : player.score}
                                  </span>
                                </div>
                              );
                            })}
                          </PaperCardContent>
                        </PaperCard>

                        {/* Mobile Chat */}
                        <PaperCard
                          variant="folded-sm"
                          padding="none"
                          className="h-fit"
                        >
                          <PaperCardHeader className="p-2.5 sm:p-3 border-b border-border">
                            <PaperCardTitle className="text-sm flex items-center gap-1.5">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              Chat
                            </PaperCardTitle>
                          </PaperCardHeader>
                          <PaperCardContent className="p-0 h-48">
                            {roomId && (
                              <div className="h-full">
                                <ChatBox roomId={roomId} compact />
                              </div>
                            )}
                          </PaperCardContent>
                        </PaperCard>
                      </div>
                    </div>
                  );
                })()}
            </div>

            {/* Bottom Section - Host Controls + Action Buttons */}
            <div className="flex-none border-t-2 border-border bg-card shadow-sm">
              {/* Host Controls - Only for Host and only in waiting status - Hidden on mobile to avoid duplication */}
              {isHost && room.status === "waiting" && (
                <div className="hidden lg:block p-3 sm:p-4 border-b border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <span className="text-sm sm:text-base font-semibold">
                      Host Controls
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {/* Visual Aids Toggle */}
                    <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-md bg-muted/30 border">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Visual Aids</span>
                      </div>
                      <Switch
                        checked={room.allowVisualAids ?? true}
                        onCheckedChange={async (checked) => {
                          if (roomId) {
                            try {
                              await updateRoomSettings(roomId, {
                                allowVisualAids: checked,
                              });
                            } catch {
                              toast({
                                title: "Error",
                                description:
                                  "Failed to update visual aids setting",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-3 sm:p-4 space-y-2">
                {/* WAITING STATUS - Normal lobby buttons */}
                {room.status === "waiting" && (
                  <>
                    <div className="flex gap-2 sm:gap-3">
                      {/* Copy Invite Link Button */}
                      <Button
                        onClick={handleCopyInviteLink}
                        variant="secondary"
                        size="default"
                        className="flex-1 text-sm sm:text-base"
                      >
                        {linkCopied ? (
                          <>
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Invite
                          </>
                        )}
                      </Button>

                      {/* Ready/Start Game Button */}
                      {isHost ? (
                        <Button
                          onClick={handleStart}
                          disabled={!allReady || playerCount < 2}
                          size="default"
                          className="flex-1 text-sm sm:text-base"
                        >
                          {playerCount < 2 ? (
                            <>
                              <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                              Need at least 2 players
                            </>
                          ) : !allReady && nonHostPlayers.length > 0 ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                              Waiting for {nonHostPlayers.length - readyCount}{" "}
                              player
                              {nonHostPlayers.length - readyCount !== 1
                                ? "s"
                                : ""}
                              ...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                              Start Game
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleToggleReady}
                          variant={isReady ? "outline" : "default"}
                          size="default"
                          className="flex-1 text-sm sm:text-base"
                        >
                          {isReady ? (
                            <>
                              <X className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                              Not Ready
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                              Ready
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {/* PLAYING STATUS - Disabled buttons */}
                {room.status === "playing" && (
                  <div className="text-center p-2 rounded-md bg-muted/50 border">
                    <p className="text-xs text-muted-foreground">
                      Game in progress...
                    </p>
                  </div>
                )}

                {/* FINISHED STATUS - Return to lobby button */}
                {room.status === "finished" && (
                  <div className="flex gap-2">
                    {isHost ? (
                      <Button
                        onClick={handleReturnToLobby}
                        size="sm"
                        className="flex-1"
                      >
                        <Play className="mr-1.5 h-3.5 w-3.5" />
                        Play Again
                      </Button>
                    ) : (
                      <div className="text-center p-2 rounded-md bg-muted/50 border flex-1">
                        <p className="text-xs text-muted-foreground">
                          Waiting for host to start next game...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Right Column - Room Stats + Chat */}
          <div className="hidden lg:flex flex-col border-l-2 border-border bg-card paper-texture min-h-0 overflow-hidden">
            {/* Top Section - Room Summary or Live Scores */}
            <div className="flex-none p-3 sm:p-4 border-b border-border max-h-[40vh] overflow-y-auto">
              {/* WAITING/FINISHED STATUS - Room Summary */}
              {(room.status === "waiting" || room.status === "finished") && (
                <PaperCard variant="folded-sm" padding="sm" className="border">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-serif font-semibold">
                      Room Info
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between min-h-6">
                      <p className="text-xs text-muted-foreground leading-none">
                        Mode:
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold leading-none">
                          {room.gameMode.name}
                        </p>
                        <Badge
                          className={cn(
                            "text-xs h-5 px-2",
                            getDifficultyColor(room.gameMode.difficulty),
                          )}
                          variant="secondary"
                        >
                          {room.gameMode.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between min-h-6">
                      <p className="text-xs text-muted-foreground leading-none">
                        {room.gameMode.targetQuestions
                          ? "Questions:"
                          : "Time Limit:"}
                      </p>
                      <p className="text-sm font-semibold leading-none">
                        {room.gameMode.targetQuestions
                          ? `${room.gameMode.targetQuestions} questions`
                          : `${room.gameMode.duration} seconds`}
                      </p>
                    </div>
                    <div className="flex items-center justify-between min-h-6">
                      <p className="text-xs text-muted-foreground leading-none">
                        Players:
                      </p>
                      <p className="text-sm font-semibold leading-none">
                        {playerCount} / {room.maxPlayers || 4}
                      </p>
                    </div>
                    <div className="flex items-center justify-between min-h-6">
                      <p className="text-xs text-muted-foreground leading-none">
                        Visual Aids:
                      </p>
                      <Badge
                        variant={room.allowVisualAids ? "default" : "outline"}
                        className="text-xs h-5 px-2"
                      >
                        {room.allowVisualAids ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between min-h-6">
                      <p className="text-xs text-muted-foreground leading-none">
                        Countdown:
                      </p>
                      <Badge
                        variant={room.enableCountdown ? "default" : "outline"}
                        className="text-xs h-5 px-2"
                      >
                        {room.enableCountdown ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </PaperCard>
              )}

              {/* PLAYING STATUS - Live Scores */}
              {room.status === "playing" && (
                <>
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
                          if (a.finished && b.finished)
                            return a.score - b.score;
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
                </>
              )}
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
        </div>

        {/* Transfer Host Confirmation Dialog */}
        <AlertDialog
          open={transferHostUid !== null}
          onOpenChange={(open) => !open && setTransferHostUid(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Transfer Host Privileges?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to transfer host privileges to{" "}
                <span className="font-semibold">
                  {transferHostUid &&
                    room?.players[transferHostUid]?.displayName}
                </span>
                ? You will no longer be the host and will need to ready up to
                start the game.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleTransferHost}>
                Transfer Host
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
