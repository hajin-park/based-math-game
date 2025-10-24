import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Timer,
  UserCog,
  Users,
  Crown,
  Shield,
  WifiOff,
  Trophy,
  Play,
  Medal,
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

export default function RoomLobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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
  const { toast } = useToast();

  // Game state
  const [showCountdown, setShowCountdown] = useState(false);
  const [timerShouldStart, setTimerShouldStart] = useState(false);
  const [score, setScore] = useState(0);
  const [randomSetting, setRandomSetting] = useState<
    [string, string, number, number] | null
  >(null);

  const hasNavigatedRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false);
  const scoreRef = useRef(0);
  const questionsRef = useRef<[string, string, number, number][]>([]);
  const countdownShownRef = useRef(false);
  const hasIncrementedWinsRef = useRef(false);

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
      if (roomId && user && !isStillInRoom && !isLeavingRef.current) {
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

      // Handle game state transitions
      if (updatedRoom.status === "playing" && !countdownShownRef.current) {
        // Show countdown when game starts
        countdownShownRef.current = true;
        setShowCountdown(true);
        setTimerShouldStart(false);
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
        questionsRef.current = [];
      }
    });

    return () => unsubscribe();
  }, [roomId, subscribeToRoom, navigate, toast, user, incrementWins]);

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

  // Calculate expiry timestamp based on room startedAt and duration
  const expiryTimestamp = useMemo(() => {
    if (room?.startedAt && room?.gameMode.duration) {
      const elapsed = Math.floor((Date.now() - room.startedAt) / 1000);
      const duration = isSpeedrun ? 86400 : room.gameMode.duration;
      const remaining = Math.max(0, duration - elapsed);
      const expiry = new Date();
      expiry.setSeconds(expiry.getSeconds() + remaining);
      return expiry;
    }
    const time = new Date();
    time.setSeconds(time.getSeconds() + (isSpeedrun ? 86400 : 60));
    return time;
  }, [room?.startedAt, room?.gameMode.duration, isSpeedrun]);

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
      {showCountdown && room?.enableCountdown && (
        <Countdown onComplete={handleCountdownComplete} duration={3} />
      )}
      <div className="flex flex-col h-screen">
        {/* Top Header - Full Width */}
        <div className="flex-none border-b-2 border-border bg-card paper-texture">
          <div className="container mx-auto px-3 py-2">
            <div className="flex items-center justify-between gap-4">
              {/* Exit Button */}
              <Button
                onClick={handleLeave}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Exit
              </Button>

              {/* Game Title - Center */}
              <div className="flex-1 text-center">
                <h1 className="text-lg md:text-xl font-serif font-bold">
                  {room.gameMode.name}
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {room.gameMode.description}
                </p>
              </div>

              {/* Room Code Display - Right */}
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Room Code</p>
                  <p className="font-mono font-bold text-sm tracking-wider uppercase text-primary">
                    {roomId}
                  </p>
                </div>
                <Button
                  onClick={handleCopyRoomId}
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Three-Column Layout */}
        <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-0">
            {/* Left Sidebar - Player List (Desktop Only) */}
            <div className="hidden lg:flex flex-col border-r-2 border-border bg-card paper-texture overflow-y-auto min-h-0">
              <div className="flex-none p-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-serif font-semibold">
                      Players ({playerCount}/{room.maxPlayers || 4})
                    </h2>
                  </div>
                  {nonHostPlayers.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {readyCount}/{nonHostPlayers.length} ready
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                      className={`flex items-center justify-between p-2 rounded-md border ${
                        isDisconnected
                          ? "bg-muted/30 border-muted"
                          : "bg-muted/50 border-muted"
                      }`}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-medium text-sm truncate ${isDisconnected ? "text-muted-foreground" : ""}`}
                          >
                            {player.displayName}
                          </span>
                          {isPlayerHost && (
                            <Crown className="h-3.5 w-3.5 text-yellow-600 shrink-0" />
                          )}
                        </div>
                        {wins > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {wins} {wins === 1 ? "win" : "wins"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isDisconnected ? (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 text-xs"
                          >
                            <WifiOff className="h-3 w-3" />
                          </Badge>
                        ) : isPlayerHost ? (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 text-xs"
                          >
                            <Crown className="h-3 w-3" />
                          </Badge>
                        ) : player.ready ? (
                          <Badge className="bg-success flex items-center gap-1 text-xs">
                            <Check className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Not Ready
                          </Badge>
                        )}
                        {/* Transfer host button */}
                        {isHost && !isPlayerHost && !isDisconnected && (
                          <Button
                            onClick={() => setTransferHostUid(player.uid)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-primary hover:text-primary-foreground"
                            title="Transfer host"
                          >
                            <UserCog className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {/* Kick button */}
                        {isHost && !isPlayerHost && (
                          <Button
                            onClick={() => handleKickPlayer(player.uid)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            title="Kick player"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center Main Area */}
            <div className="flex flex-col h-full bg-background min-h-0">
              <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
                {/* WAITING STATUS - Lobby View */}
                {room.status === "waiting" && (
                  <>
                    {/* Mobile Player List */}
                    <div className="lg:hidden">
                      <PaperCard variant="folded-sm" padding="none">
                        <PaperCardHeader className="p-3 border-b border-border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              <PaperCardTitle className="text-sm">
                                Players ({playerCount}/{room.maxPlayers || 4})
                              </PaperCardTitle>
                            </div>
                            {nonHostPlayers.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {readyCount}/{nonHostPlayers.length} ready
                              </Badge>
                            )}
                          </div>
                        </PaperCardHeader>
                        <PaperCardContent className="p-3 space-y-2 max-h-48 overflow-y-auto">
                          {Object.values(room.players).map((player) => {
                            const isPlayerHost = player.uid === room.hostUid;
                            const wins = player.wins || 0;
                            const isDisconnected = player.disconnected === true;
                            const isKicked = player.kicked === true;

                            if (isKicked) return null;

                            return (
                              <div
                                key={player.uid}
                                className={`flex items-center justify-between p-2 rounded-md border ${
                                  isDisconnected
                                    ? "bg-muted/30 border-muted"
                                    : "bg-muted/50 border-muted"
                                }`}
                              >
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`font-medium text-sm truncate ${isDisconnected ? "text-muted-foreground" : ""}`}
                                    >
                                      {player.displayName}
                                    </span>
                                    {isPlayerHost && (
                                      <Crown className="h-3.5 w-3.5 text-yellow-600 shrink-0" />
                                    )}
                                  </div>
                                  {wins > 0 && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Trophy className="h-3 w-3" />
                                      {wins} {wins === 1 ? "win" : "wins"}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {isDisconnected ? (
                                    <Badge
                                      variant="destructive"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      <WifiOff className="h-3 w-3" />
                                    </Badge>
                                  ) : isPlayerHost ? (
                                    <Badge
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      <Crown className="h-3 w-3" />
                                    </Badge>
                                  ) : player.ready ? (
                                    <Badge className="bg-success flex items-center gap-1 text-xs">
                                      <Check className="h-3 w-3" />
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Not Ready
                                    </Badge>
                                  )}
                                  {isHost &&
                                    !isPlayerHost &&
                                    !isDisconnected && (
                                      <Button
                                        onClick={() =>
                                          setTransferHostUid(player.uid)
                                        }
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 hover:bg-primary hover:text-primary-foreground"
                                        title="Transfer host"
                                      >
                                        <UserCog className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  {isHost && !isPlayerHost && (
                                    <Button
                                      onClick={() =>
                                        handleKickPlayer(player.uid)
                                      }
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                      title="Kick player"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </PaperCardContent>
                      </PaperCard>
                    </div>

                    {/* Host View: Game Selection */}
                    {isHost && !showPlaygroundSettings && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                          <Settings className="h-4 w-4 text-primary" />
                          <h3 className="text-sm font-serif font-semibold">
                            Select Game Mode
                          </h3>
                        </div>
                        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                          {OFFICIAL_GAME_MODES.map((mode) => (
                            <div
                              key={mode.id}
                              className={`p-2 rounded-md border-2 cursor-pointer transition-all duration-200 ${
                                room.gameMode.id === mode.id
                                  ? "border-primary bg-primary/10 shadow-sm"
                                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                              }`}
                              onClick={() =>
                                room.gameMode.id !== mode.id &&
                                handleChangeGameMode(mode)
                              }
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium truncate">
                                  {mode.name}
                                </span>
                                <Badge
                                  className={`${getDifficultyColor(mode.difficulty)} text-xs shrink-0`}
                                  variant="secondary"
                                >
                                  {mode.difficulty}
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {/* Custom Playground Option */}
                          <div
                            className={`p-2 rounded-md border-2 cursor-pointer transition-all duration-200 ${
                              room.gameMode.id === "custom-playground"
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                            }`}
                            onClick={() => setShowPlaygroundSettings(true)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium">
                                Custom Playground
                              </span>
                              <Badge
                                className="bg-purple-500 text-white text-xs shrink-0"
                                variant="secondary"
                              >
                                Custom
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Playground Settings */}
                    {isHost && showPlaygroundSettings && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-serif font-semibold">
                              Custom Playground
                            </h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPlaygroundSettings(false)}
                            className="h-7 text-xs"
                          >
                            Back
                          </Button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto pr-1">
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
                      <PaperCard variant="folded-sm" padding="default">
                        <div className="text-center space-y-2">
                          <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {allReady
                              ? "Waiting for host to start the game..."
                              : "Waiting for players to get ready..."}
                          </p>
                        </div>
                      </PaperCard>
                    )}

                    {/* Mobile Room Summary */}
                    <div className="lg:hidden">
                      <PaperCard variant="folded-sm" padding="none">
                        <PaperCardHeader className="p-3 border-b border-border">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-primary" />
                            <PaperCardTitle className="text-sm">
                              Room Summary
                            </PaperCardTitle>
                          </div>
                        </PaperCardHeader>
                        <PaperCardContent className="p-3 space-y-1.5">
                          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
                            <span className="text-xs text-muted-foreground">
                              Mode
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {room.gameMode.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
                            <span className="text-xs text-muted-foreground">
                              {room.gameMode.targetQuestions
                                ? "Target"
                                : "Duration"}
                            </span>
                            <span className="text-xs font-semibold">
                              {room.gameMode.targetQuestions
                                ? `${room.gameMode.targetQuestions}q`
                                : `${room.gameMode.duration}s`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
                            <span className="text-xs text-muted-foreground">
                              Visual Aids
                            </span>
                            <Badge
                              variant={
                                room.allowVisualAids ? "default" : "outline"
                              }
                              className="text-xs"
                            >
                              {room.allowVisualAids ? "On" : "Off"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
                            <span className="text-xs text-muted-foreground">
                              Countdown
                            </span>
                            <Badge
                              variant={
                                room.enableCountdown ? "default" : "outline"
                              }
                              className="text-xs"
                            >
                              {room.enableCountdown ? "On" : "Off"}
                            </Badge>
                          </div>
                        </PaperCardContent>
                      </PaperCard>
                    </div>

                    {/* Mobile Chat */}
                    <div className="lg:hidden">
                      {roomId && (
                        <div className="h-80">
                          <ChatBox roomId={roomId} className="h-full" />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* PLAYING STATUS - Game View */}
                {room.status === "playing" &&
                  randomSetting &&
                  room.startedAt && (
                    <div className="h-full flex items-center justify-center p-2">
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
                      <div className="h-full overflow-y-auto p-2">
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
                    );
                  })()}
              </div>

              {/* Bottom Section - Host Controls + Action Buttons */}
              <div className="flex-none border-t-2 border-border bg-card">
                {/* Host Controls - Only for Host and only in waiting status */}
                {isHost && room.status === "waiting" && (
                  <div className="p-2 border-b border-border space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-primary" />
                      <span className="text-xs font-semibold">
                        Host Controls
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {/* Visual Aids Toggle */}
                      <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/30 border">
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">Visual Aids</span>
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
                      {/* Countdown Toggle */}
                      <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/30 border">
                        <div className="flex items-center gap-1.5">
                          <Timer className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">Countdown</span>
                        </div>
                        <Switch
                          checked={room.enableCountdown ?? true}
                          onCheckedChange={async (checked) => {
                            if (roomId) {
                              try {
                                await updateRoomSettings(roomId, {
                                  enableCountdown: checked,
                                });
                              } catch {
                                toast({
                                  title: "Error",
                                  description:
                                    "Failed to update countdown setting",
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
                <div className="p-2 space-y-1.5">
                  {/* WAITING STATUS - Normal lobby buttons */}
                  {room.status === "waiting" && (
                    <>
                      <div className="flex gap-2">
                        {/* Copy Invite Link Button */}
                        <Button
                          onClick={handleCopyInviteLink}
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                        >
                          {linkCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Link2 className="h-3.5 w-3.5 mr-1.5" />
                              Invite
                            </>
                          )}
                        </Button>

                        {/* Ready/Start Game Button */}
                        {isHost ? (
                          <Button
                            onClick={handleStart}
                            disabled={!allReady || playerCount < 2}
                            size="sm"
                            className="flex-1"
                          >
                            <Play className="mr-1.5 h-3.5 w-3.5" />
                            Start Game
                          </Button>
                        ) : (
                          <Button
                            onClick={handleToggleReady}
                            variant={isReady ? "outline" : "default"}
                            size="sm"
                            className="flex-1"
                          >
                            {isReady ? (
                              <>
                                <X className="mr-1.5 h-3.5 w-3.5" />
                                Not Ready
                              </>
                            ) : (
                              <>
                                <Check className="mr-1.5 h-3.5 w-3.5" />
                                Ready
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Status Messages */}
                      {isHost && !allReady && nonHostPlayers.length > 0 && (
                        <div className="text-center p-2 rounded-md bg-muted/50 border">
                          <p className="text-xs text-muted-foreground">
                            Waiting for {nonHostPlayers.length - readyCount}{" "}
                            player
                            {nonHostPlayers.length - readyCount !== 1
                              ? "s"
                              : ""}{" "}
                            to be ready...
                          </p>
                        </div>
                      )}
                      {isHost && playerCount < 2 && (
                        <div className="text-center p-2 rounded-md bg-warning/10 border border-warning/20">
                          <p className="text-xs text-warning-foreground">
                            Need at least 2 players to start
                          </p>
                        </div>
                      )}
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

            {/* Right Sidebar - Room Summary/Live Scores + Chat */}
            <div className="hidden lg:flex flex-col border-l-2 border-border bg-card paper-texture overflow-hidden min-h-0">
              {/* Top Section - Room Summary or Live Scores */}
              <div className="flex-none p-3 border-b border-border">
                {/* WAITING/FINISHED STATUS - Room Summary */}
                {(room.status === "waiting" || room.status === "finished") && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-serif font-semibold">
                        Room Summary
                      </h2>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
                        <span className="text-xs text-muted-foreground">
                          Mode
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {room.gameMode.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
                        <span className="text-xs text-muted-foreground">
                          {room.gameMode.targetQuestions
                            ? "Target"
                            : "Duration"}
                        </span>
                        <span className="text-xs font-semibold">
                          {room.gameMode.targetQuestions
                            ? `${room.gameMode.targetQuestions}q`
                            : `${room.gameMode.duration}s`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
                        <span className="text-xs text-muted-foreground">
                          Players
                        </span>
                        <span className="text-xs font-semibold">
                          {playerCount}/{room.maxPlayers || 4}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
                        <span className="text-xs text-muted-foreground">
                          Visual Aids
                        </span>
                        <Badge
                          variant={room.allowVisualAids ? "default" : "outline"}
                          className="text-xs"
                        >
                          {room.allowVisualAids ? "On" : "Off"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/50">
                        <span className="text-xs text-muted-foreground">
                          Countdown
                        </span>
                        <Badge
                          variant={room.enableCountdown ? "default" : "outline"}
                          className="text-xs"
                        >
                          {room.enableCountdown ? "On" : "Off"}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}

                {/* PLAYING STATUS - Live Scores */}
                {room.status === "playing" && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-serif font-semibold">
                        Live Scores
                      </h2>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
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
                              className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                                isCurrentUser
                                  ? "bg-primary/10 border-2 border-primary ring-2 ring-primary/20"
                                  : "bg-muted/50 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-bold text-sm ${
                                    isLeader
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {index === 0 && player.score > 0
                                    ? "👑"
                                    : `#${index + 1}`}
                                </span>
                                <span
                                  className={`${isCurrentUser ? "font-bold" : ""} truncate max-w-[100px] text-xs`}
                                >
                                  {player.displayName}
                                  {isCurrentUser && " (You)"}
                                </span>
                              </div>
                              <span className="font-bold text-lg tabular-nums">
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
              <div className="flex-1 overflow-hidden flex flex-col">
                {roomId && (
                  <div className="flex-1 overflow-hidden">
                    <ChatBox roomId={roomId} className="h-full" />
                  </div>
                )}
              </div>
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
