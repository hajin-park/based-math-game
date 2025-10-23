import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRoom, Room } from "@/hooks/useRoom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { isSpeedrunMode } from "@/types/gameMode";
import { Trophy, Crown, Medal, Home, RotateCcw, Loader2 } from "lucide-react";

export default function MultiplayerResults() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { joinRoom, leaveRoom, subscribeToRoom, resetRoom, incrementWins } =
    useRoom();
  const [room, setRoom] = useState<Room | null>(null);
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
      const currentPath = window.location.pathname;
      const isStillInRoom =
        roomId &&
        (currentPath.includes(`/multiplayer/lobby/${roomId}`) ||
          currentPath.includes(`/multiplayer/game/${roomId}`) ||
          currentPath.includes(`/multiplayer/results/${roomId}`));

      // Only leave if we're not in the same room and not explicitly leaving
      if (
        roomId &&
        user &&
        !isStillInRoom &&
        !isStillInRoom &&
        !isLeavingRefValue.current
      ) {
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

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // For speedrun modes, lowest score wins (fastest time)
  // For timed modes, highest score wins (most correct answers)
  const sortedPlayers = Object.values(room.players).sort((a, b) =>
    isSpeedrun ? a.score - b.score : b.score - a.score,
  );
  const winner = sortedPlayers[0];
  const isHost = user?.uid === room.hostUid;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-6 w-6 text-yellow-600" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-700" />;
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-3xl space-y-6 animate-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-8 w-8 text-success" />
            <h1 className="text-4xl font-bold gradient-text">Game Complete!</h1>
          </div>
          <p className="text-lg text-muted-foreground">{room.gameMode.name}</p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-12 w-12 text-yellow-600 animate-pulse" />
            </div>
            <CardTitle className="text-3xl gradient-text">
              {winner.displayName}
            </CardTitle>
            <CardDescription className="text-lg">Winner</CardDescription>
            <div className="mt-4">
              <p className="text-6xl font-bold gradient-text">
                {isSpeedrun ? `${winner.score}s` : winner.score}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {isSpeedrun ? "completion time" : "points"}
              </p>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-6">
            {/* All players */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Final Standings
              </h3>
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <Card
                    key={player.uid}
                    className={`border-2 ${
                      index === 0
                        ? "border-yellow-600/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"
                        : "border-muted"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                            {getRankIcon(index) || (
                              <span className="font-bold text-xl text-muted-foreground">
                                #{index + 1}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">
                              {player.displayName}
                            </p>
                            {index === 0 && (
                              <Badge className="bg-yellow-600">
                                <Crown className="h-3 w-3 mr-1" />
                                Champion
                              </Badge>
                            )}
                            {index === 1 && (
                              <Badge variant="secondary">2nd Place</Badge>
                            )}
                            {index === 2 && (
                              <Badge variant="outline">3rd Place</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-3xl">
                            {isSpeedrun ? `${player.score}s` : player.score}
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

          <Separator />

          <CardFooter className="flex flex-col gap-4 pt-6">
            {isHost ? (
              <Button
                onClick={handleReturnToLobby}
                className="w-full shadow-sm"
                size="lg"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Return to Lobby (Play Again)
              </Button>
            ) : (
              <div className="w-full text-center p-4 rounded-lg bg-muted/50 border">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Waiting for host to return to lobby...
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => navigate("/multiplayer")}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Leave Room
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
