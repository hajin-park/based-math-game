import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoom, Room } from '@/hooks/useRoom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Check, Link2 } from 'lucide-react';

export default function RoomLobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaveRoom, setPlayerReady, startGame, subscribeToRoom } = useRoom();
  const [room, setRoom] = useState<Room | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      // Handle room deletion (host disconnected)
      if (!updatedRoom) {
        // Prevent multiple navigations
        if (hasNavigatedRef.current) return;
        hasNavigatedRef.current = true;

        // Navigate first, then show toast
        navigate('/multiplayer', { replace: true });

        // Show toast after navigation
        setTimeout(() => {
          toast({
            title: 'Host Disconnected',
            description: 'The host has left the room.',
            variant: 'destructive',
          });
        }, 100);
        return;
      }

      setRoom(updatedRoom);

      // Navigate to game when it starts
      if (updatedRoom.status === 'playing') {
        navigate(`/multiplayer/game/${roomId}`);
      }
    });

    return () => unsubscribe();
  }, [roomId, subscribeToRoom, navigate, toast]);

  const handleLeave = async () => {
    if (!roomId) return;
    await leaveRoom(roomId);
    navigate('/multiplayer');
  };

  const handleToggleReady = async () => {
    if (!roomId) return;
    const newReady = !isReady;
    setIsReady(newReady);
    await setPlayerReady(roomId, newReady);
  };

  const handleStart = async () => {
    if (!roomId) return;
    try {
      await startGame(roomId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start game';
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

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isHost = user?.uid === room.hostUid;
  // Filter out host from ready check - host doesn't need to be ready
  const nonHostPlayers = Object.values(room.players).filter((p) => p.uid !== room.hostUid);
  const allReady = nonHostPlayers.length > 0 && nonHostPlayers.every((p) => p.ready);
  const readyCount = nonHostPlayers.filter((p) => p.ready).length;
  const playerCount = Object.keys(room.players).length;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{room.gameMode.name}</CardTitle>
              <CardDescription>{room.gameMode.description}</CardDescription>
            </div>
            <Badge>{room.gameMode.difficulty}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room ID & Invite */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Room Code</p>
                <p className="font-mono font-bold text-lg">{roomId}</p>
              </div>
              <Button
                onClick={handleCopyRoomId}
                variant="outline"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={handleCopyInviteLink}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              {linkCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Invite Link Copied!
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Copy Invite Link
                </>
              )}
            </Button>
          </div>

          {/* Players */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                Players ({playerCount}/4)
              </h3>
              {nonHostPlayers.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {readyCount}/{nonHostPlayers.length} ready
                </span>
              )}
            </div>
            <div className="space-y-2">
              {Object.values(room.players).map((player) => {
                const isPlayerHost = player.uid === room.hostUid;
                return (
                  <div
                    key={player.uid}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span>{player.displayName}</span>
                      {isPlayerHost && (
                        <Badge variant="outline">Host</Badge>
                      )}
                    </div>
                    {isPlayerHost ? (
                      <Badge variant="secondary">Hosting</Badge>
                    ) : player.ready ? (
                      <Badge className="bg-green-600">Ready</Badge>
                    ) : (
                      <Badge variant="outline">Not Ready</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Game Info */}
          <div className="p-4 rounded-md bg-muted/50">
            <p className="text-sm">
              <span className="font-semibold">Duration:</span> {room.gameMode.duration}s
            </p>
            <p className="text-sm">
              <span className="font-semibold">Question Types:</span> {room.gameMode.questions.length}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleLeave} variant="outline" className="flex-1">
              Leave Room
            </Button>
            {isHost ? (
              <Button
                onClick={handleStart}
                disabled={!allReady || playerCount < 2}
                className="flex-1"
              >
                Start Game
              </Button>
            ) : (
              <Button
                onClick={handleToggleReady}
                variant={isReady ? 'outline' : 'default'}
                className="flex-1"
              >
                {isReady ? 'Not Ready' : 'Ready'}
              </Button>
            )}
          </div>

          {isHost && !allReady && nonHostPlayers.length > 0 && (
            <p className="text-sm text-center text-muted-foreground">
              Waiting for {nonHostPlayers.length - readyCount} player{nonHostPlayers.length - readyCount !== 1 ? 's' : ''} to be ready...
            </p>
          )}
          {isHost && playerCount < 2 && (
            <p className="text-sm text-center text-muted-foreground">
              Need at least 2 players to start
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

