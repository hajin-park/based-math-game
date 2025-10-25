import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PaperCard,
  PaperCardHeader,
  PaperCardTitle,
  PaperCardContent,
} from "@/components/ui/academic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRoom, Room } from "@/hooks/useRoom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { isSpeedrunMode } from "@/types/gameMode";
import ChatBox from "@/components/ChatBox";
import {
  Trophy,
  Crown,
  RotateCcw,
  Loader2,
  TrendingUp,
  X,
  Copy,
  Check,
  Users,
  WifiOff,
  MessageSquare,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function MultiplayerResults() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { joinRoom, leaveRoom, subscribeToRoom, resetRoom, incrementWins } =
    useRoom();
  const [room, setRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const hasNavigatedRef = useRef(false);
  const hasIncrementedWinsRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false);

  // Determine if this is a speedrun mode
  const isSpeedrun = useMemo(
    () => (room ? isSpeedrunMode(room.gameMode) : false),
    [room],
  );

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
        leaveRoom(roomId).catch((error) =>
          console.error("Error leaving room on unmount:", error),
        );
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

      setRoom(updatedRoom);

      // Increment winner's wins (only once, and only by the winner themselves)
      // This prevents duplicate increments when multiple clients are viewing the results
      if (
        updatedRoom.status === "finished" &&
        !hasIncrementedWinsRef.current &&
        user
      ) {
        // For speedrun modes, lowest score wins (fastest time)
        // For timed modes, highest score wins (most correct answers)
        const isSpeedrunMode =
          updatedRoom.gameMode.targetQuestions !== undefined;
        const sortedPlayers = Object.values(updatedRoom.players).sort((a, b) =>
          isSpeedrunMode ? a.score - b.score : b.score - a.score,
        );
        const winner = sortedPlayers[0];

        // Only the winner increments their own wins
        if (winner && winner.uid === user.uid) {
          hasIncrementedWinsRef.current = true;
          incrementWins(roomId, winner.uid).catch((error) => {
            console.error("Failed to increment wins:", error);
          });
        }
      }

      // If room status changed back to waiting, navigate to lobby
      if (updatedRoom.status === "waiting") {
        // Reset the wins increment flag for the next game
        hasIncrementedWinsRef.current = false;
        navigate(`/multiplayer/lobby/${roomId}`);
      }
    });

    return () => unsubscribe();
  }, [roomId, subscribeToRoom, navigate, toast, incrementWins, user]);

  const handleReturnToLobby = async () => {
    if (!roomId) return;
    try {
      await resetRoom(roomId);
      // Navigation will happen automatically via the useEffect when status changes to 'waiting'
    } catch (error) {
      console.error("Failed to reset room:", error);
      alert("Failed to return to lobby. Please try again.");
    }
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // For speedrun modes, lowest score wins (fastest time)
  // For timed modes, highest score wins (most correct answers)
  const sortedPlayers = useMemo(() => {
    if (!room) return [];
    return Object.values(room.players).sort((a, b) =>
      isSpeedrun ? a.score - b.score : b.score - a.score,
    );
  }, [room, isSpeedrun]);

  const winner = sortedPlayers[0];
  const isHost = user?.uid === room?.hostUid;
  const playerCount = room
    ? Object.values(room.players).filter((p) => !p.kicked).length
    : 0;

  // Prepare data for score progression graph
  const graphData = useMemo(() => {
    if (!sortedPlayers || sortedPlayers.length === 0) return [];

    // Find the maximum history length among all players
    const maxLength = Math.max(
      ...sortedPlayers.map((p) => p.scoreHistory?.length || 0),
    );

    console.log("Score history debug:", {
      maxLength,
      players: sortedPlayers.map((p) => ({
        name: p.displayName,
        historyLength: p.scoreHistory?.length || 0,
        history: p.scoreHistory,
      })),
    });

    if (maxLength === 0 || maxLength === 1) return []; // Need at least 2 points for a line

    // Create data points for each question/action
    const data: Array<Record<string, number>> = [];
    for (let i = 0; i < maxLength; i++) {
      const point: Record<string, number> = { question: i };
      sortedPlayers.forEach((player) => {
        const score = player.scoreHistory?.[i];
        if (score !== undefined) {
          point[player.displayName] = score;
        }
      });
      data.push(point);
    }
    return data;
  }, [sortedPlayers]);

  // Generate colors for each player line
  const playerColors = [
    "#2563eb", // blue
    "#dc2626", // red
    "#16a34a", // green
    "#ea580c", // orange
    "#9333ea", // purple
    "#0891b2", // cyan
    "#ca8a04", // yellow
    "#db2777", // pink
    "#65a30d", // lime
    "#0d9488", // teal
  ];

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Row 1 - Header */}
      <div className="flex-none border-b-2 border-border bg-card paper-texture shadow-sm">
        <div className="px-fluid py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Exit Button - Left */}
            <Button
              onClick={async () => {
                isLeavingRef.current = true;
                if (roomId) {
                  await leaveRoom(roomId);
                }
                navigate("/multiplayer");
              }}
              variant="outline"
              size="default"
              className="gap-2 shrink-0 text-sm sm:text-base"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Exit</span>
            </Button>

            {/* Game Title - Center */}
            <div className="flex-1 text-center min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-bold truncate">
                {room.gameMode.name} - Results
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
            {sortedPlayers.map((player, index) => {
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
                      : index === 0
                        ? "bg-yellow-500/10 border-yellow-600/50"
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
                    {index === 0 && (
                      <Badge
                        variant="default"
                        className="h-5 px-1.5 text-xs bg-yellow-600"
                      >
                        Winner
                      </Badge>
                    )}
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

        {/* Desktop Middle Column - Score Progression Graph */}
        <div className="flex flex-col min-h-0 bg-background">
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 lg:p-6">
            <PaperCard
              variant="folded-sm"
              padding="sm"
              className="h-full flex flex-col"
            >
              <PaperCardHeader className="pb-2 flex-none">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <PaperCardTitle className="text-sm">
                    Score Progression
                  </PaperCardTitle>
                </div>
              </PaperCardHeader>
              <PaperCardContent className="pt-0 flex-1 flex flex-col min-h-0">
                {graphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={graphData}
                      margin={{ top: 10, right: 10, bottom: 20, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="question"
                        label={{
                          value: "Question Number",
                          position: "insideBottom",
                          offset: -10,
                        }}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        label={{
                          value: isSpeedrun ? "Time (s)" : "Score",
                          angle: -90,
                          position: "insideLeft",
                        }}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.375rem",
                          fontSize: "0.75rem",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                      {sortedPlayers.map((player, index) => (
                        <Line
                          key={player.uid}
                          type="monotone"
                          dataKey={player.displayName}
                          stroke={playerColors[index % playerColors.length]}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                    No score history available
                  </div>
                )}
              </PaperCardContent>
            </PaperCard>
          </div>
        </div>

        {/* Desktop Right Column - Results + Chat */}
        <div className="hidden lg:flex flex-col border-l-2 border-border bg-card paper-texture min-h-0 overflow-hidden">
          {/* Results - Top */}
          <div className="flex-none p-1.5 border-b border-border max-h-[50vh] overflow-y-auto">
            <div className="text-center mb-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <h2 className="text-xs font-serif font-semibold">Winner</h2>
              </div>
              <p className="text-sm font-bold gradient-text">
                {winner.displayName}
              </p>
              <p className="text-lg font-bold gradient-text">
                {isSpeedrun ? `${winner.score}s` : winner.score}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSpeedrun ? "completion time" : "points"}
              </p>
            </div>

            <Separator className="my-1.5" />

            {/* Final Standings */}
            <div className="space-y-1">
              <h3 className="text-xs font-serif font-semibold flex items-center gap-1 mb-1">
                <Trophy className="h-3 w-3 text-primary" />
                Final Standings
              </h3>
              <div className="space-y-0.5">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.uid}
                    className={`flex items-center justify-between p-1 rounded-md border text-xs ${
                      index === 0
                        ? "border-yellow-600/50 bg-yellow-500/10"
                        : "border-muted bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <span className="text-xs">
                        {index === 0 ? "👑" : `#${index + 1}`}
                      </span>
                      <span className="font-medium truncate">
                        {player.displayName}
                      </span>
                    </div>
                    <span className="font-bold tabular-nums shrink-0">
                      {isSpeedrun ? `${player.score}s` : player.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-1.5" />

            {/* Host Controls */}
            <div className="space-y-1">
              {isHost ? (
                <Button
                  onClick={handleReturnToLobby}
                  className="w-full shadow-sm"
                  size="sm"
                >
                  <RotateCcw className="mr-1.5 h-3 w-3" />
                  Return to Lobby
                </Button>
              ) : (
                <div className="w-full text-center p-1.5 rounded-lg bg-muted/50 border">
                  <Loader2 className="h-3 w-3 animate-spin mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Waiting for host...
                  </p>
                </div>
              )}
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

        {/* Mobile Layout - Full width content */}
        <div className="lg:hidden flex flex-col min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Winner Banner */}
          <Card className="shadow-sm">
            <CardHeader className="p-1.5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <CardTitle className="text-sm">Winner</CardTitle>
              </div>
              <p className="text-base font-bold gradient-text">
                {winner.displayName}
              </p>
              <p className="text-xl font-bold gradient-text">
                {isSpeedrun ? `${winner.score}s` : winner.score}
              </p>
              <CardDescription className="text-xs">
                {isSpeedrun ? "completion time" : "points"}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Score Progression Graph */}
          <PaperCard variant="folded-sm" padding="sm">
            <PaperCardHeader className="pb-1">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <PaperCardTitle className="text-xs">
                  Score Progression
                </PaperCardTitle>
              </div>
            </PaperCardHeader>
            <PaperCardContent className="pt-0">
              {graphData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={graphData}
                    margin={{ top: 5, right: 5, bottom: 15, left: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="question"
                      label={{
                        value: "Question",
                        position: "insideBottom",
                        offset: -10,
                      }}
                      tick={{ fontSize: 9 }}
                    />
                    <YAxis
                      label={{
                        value: isSpeedrun ? "Time (s)" : "Score",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      tick={{ fontSize: 9 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.375rem",
                        fontSize: "0.625rem",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "0.625rem" }} />
                    {sortedPlayers.map((player, index) => (
                      <Line
                        key={player.uid}
                        type="monotone"
                        dataKey={player.displayName}
                        stroke={playerColors[index % playerColors.length]}
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-in-out"
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                  No score history available
                </div>
              )}
            </PaperCardContent>
          </PaperCard>

          {/* Mobile Row 3 - Final Standings and Chat Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Final Standings */}
            <PaperCard variant="folded-sm" padding="none" className="h-fit">
              <PaperCardHeader className="p-2.5 sm:p-3 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-primary" />
                  <PaperCardTitle className="text-sm">
                    Final Standings
                  </PaperCardTitle>
                </div>
              </PaperCardHeader>
              <PaperCardContent className="p-2.5 sm:p-3 space-y-2 max-h-48 overflow-y-auto">
                {sortedPlayers.map((player, index) => (
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
                      {isSpeedrun ? `${player.score}s` : player.score}
                    </span>
                  </div>
                ))}
              </PaperCardContent>
            </PaperCard>

            {/* Chat */}
            <PaperCard variant="folded-sm" padding="none" className="h-fit">
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

          {/* Host Controls */}
          <Card className="shadow-sm">
            <CardContent className="p-1.5 space-y-1">
              {isHost ? (
                <Button
                  onClick={handleReturnToLobby}
                  className="w-full shadow-sm"
                  size="sm"
                >
                  <RotateCcw className="mr-1.5 h-3 w-3" />
                  Return to Lobby
                </Button>
              ) : (
                <div className="w-full text-center p-1.5 rounded-lg bg-muted/50 border">
                  <Loader2 className="h-3 w-3 animate-spin mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Waiting for host...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
