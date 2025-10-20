import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoom, Room } from '@/hooks/useRoom';
import { useAuth } from '@/contexts/AuthContext';
import { Copy, Check } from 'lucide-react';

export default function RoomLobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaveRoom, setPlayerReady, startGame, subscribeToRoom } = useRoom();
  const [room, setRoom] = useState<Room | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
      
      // Navigate to game when it starts
      if (updatedRoom.status === 'playing') {
        navigate(`/multiplayer/game/${roomId}`);
      }
    });

    return () => unsubscribe();
  }, [roomId, subscribeToRoom, navigate]);

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
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
  const allReady = Object.values(room.players).every((p) => p.ready);
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
          {/* Room ID */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Room ID</p>
              <p className="font-mono font-bold">{roomId}</p>
            </div>
            <Button
              onClick={handleCopyRoomId}
              variant="outline"
              size="sm"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Players */}
          <div>
            <h3 className="font-semibold mb-3">
              Players ({playerCount}/4)
            </h3>
            <div className="space-y-2">
              {Object.values(room.players).map((player) => (
                <div
                  key={player.uid}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span>{player.displayName}</span>
                    {player.uid === room.hostUid && (
                      <Badge variant="outline">Host</Badge>
                    )}
                  </div>
                  {player.ready ? (
                    <Badge className="bg-green-600">Ready</Badge>
                  ) : (
                    <Badge variant="outline">Not Ready</Badge>
                  )}
                </div>
              ))}
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

          {isHost && !allReady && (
            <p className="text-sm text-center text-muted-foreground">
              Waiting for all players to be ready...
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

